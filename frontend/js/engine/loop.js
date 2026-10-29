// Main Game Loop & Coordinator
class GameCoordinator {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.camera = new Camera(this.canvas.width, this.canvas.height, 630, 500);

    this.player = new Player(140, 240);
    this.lastTime = 0;
    this.activeInteractable = null;

    // Attach input to canvas and camera
    Input.attach(this.canvas, this.camera);
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  loop(currentTime) {
    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    Input.endFrame();
    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    // 1. Update Player
    this.player.update(dt, Input);

    // 2. Update Camera tracking player
    this.camera.setTarget(this.player.x, this.player.y);
    this.camera.update();

    // 3. Update Systems & Entities
    MapInstance.update(dt);
    Animals.update(dt);
    Enemies.update(dt, this.player.x, this.player.y);
    NPCs.update(dt);
    Farming.update(dt);
    Fishing.update(dt);
    Combat.update(dt);

    // 4. Update HUD
    HUD.updatePlayer(this.player);
    HUD.updateTime(MapInstance.day, MapInstance.getFormattedTime());

    // 5. Handle Interaction Detection & Triggers
    this.handleInteractions();

    // 6. Handle Tool Action (Space / Mouse Click)
    this.handleToolAction();
  }

  handleInteractions() {
    // If dialogue or modal is open, don't show prompt
    if (Dialogue.isOpen() || !document.getElementById('shop-modal').classList.contains('hidden')) {
      HUD.hidePrompt();
      return;
    }

    // Check nearest NPC
    const nearNPC = NPCs.getNearest(this.player.x, this.player.y, 28);
    if (nearNPC) {
      this.activeInteractable = { type: 'npc', data: nearNPC };
      HUD.showPrompt(`[E] Nói chuyện với ${nearNPC.name}`);
      if (Input.isJustPressed('KeyE')) {
        Dialogue.open(nearNPC);
      }
      return;
    }

    // Check Trigger Zones (House Door, Market, Dock)
    const zone = Collisions.getZoneAt(this.player.x, this.player.y, 16);
    if (zone) {
      if (zone.key === 'houseDoor') {
        this.activeInteractable = { type: 'house' };
        HUD.showPrompt('[E] Nghỉ ngơi qua đêm (Hồi phục)');
        if (Input.isJustPressed('KeyE')) {
          API.restPlayer().then((res) => {
            Toast.show(res.message, 'success');
            Sound.harvest();
            this.syncPlayerStats(res.player);
            MapInstance.day = res.day;
            MapInstance.timeOfDay = 8.0;
            API.getFarmPlots().then(plots => Farming.initPlots(plots));
          });
        }
        return;
      } else if (zone.key === 'market') {
        this.activeInteractable = { type: 'market' };
        HUD.showPrompt('[E] Mở Sạp Chợ Phiên');
        if (Input.isJustPressed('KeyE')) {
          ShopModal.open();
        }
        return;
      } else if (zone.key === 'dock') {
        this.activeInteractable = { type: 'dock' };
        HUD.showPrompt('[Space] Cầm cần câu để buông cần');
        return;
      }
    }

    this.activeInteractable = null;
    HUD.hidePrompt();
  }

  handleToolAction() {
    const isActionTriggered = Input.isJustPressed('Space') || Input.mouse.clicked;
    if (!isActionTriggered) return;

    // If modal is open, ignore
    if (Dialogue.isOpen() || !document.getElementById('shop-modal').classList.contains('hidden') ||
        !document.getElementById('quest-modal').classList.contains('hidden') ||
        !document.getElementById('inventory-modal').classList.contains('hidden')) {
      return;
    }

    const activeItem = Inventory.getActiveItem();
    if (!activeItem) return;

    const targetPos = this.player.getTargetPosition(16);

    // 1. Tool: Hoe (Cuốc đất)
    if (activeItem.id === 'tool_hoe') {
      const plot = Farming.getPlotAt(targetPos.x, targetPos.y, 16);
      if (plot) {
        this.player.triggerAction('hoe');
        API.tillPlot(plot.id).then((res) => {
          Toast.show(res.message, 'success');
          plot.isTilled = true;
          this.syncPlayerStats(res.player);
        }).catch(err => Toast.show(err.message, 'warning'));
      } else {
        this.player.triggerAction('hoe');
      }
    }
    // 2. Tool: Watering Can (Bình tưới)
    else if (activeItem.id === 'tool_watering_can') {
      const plot = Farming.getPlotAt(targetPos.x, targetPos.y, 16);
      if (plot) {
        this.player.triggerAction('water');
        API.waterPlot(plot.id).then((res) => {
          Toast.show(res.message, 'success');
          plot.isWatered = true;
          this.syncPlayerStats(res.player);
        }).catch(err => Toast.show(err.message, 'warning'));
      } else {
        this.player.triggerAction('water');
      }
    }
    // 3. Tool: Sword (Kiếm chiến đấu)
    else if (activeItem.id === 'tool_sword') {
      Combat.executeAttack(this.player);
    }
    // 4. Tool: Fishing Rod (Cần câu)
    else if (activeItem.id === 'tool_fishing_rod') {
      const zone = Collisions.getZoneAt(this.player.x, this.player.y, 25);
      if (zone && zone.key === 'dock') {
        Fishing.start(this.player);
      } else {
        Toast.show('Hãy đi ra Bến Cầu Gỗ trên sông để câu cá!', 'warning');
      }
    }
    // 5. Tool: Axe (Rìu đốn củi)
    else if (activeItem.id === 'tool_axe') {
      this.player.triggerAction('axe');
      Toast.show('Vung rìu đốn củi!', 'normal');
    }
    // 6. Seeds: Planting
    else if (activeItem.category === 'seed') {
      const plot = Farming.getPlotAt(targetPos.x, targetPos.y, 16);
      if (plot) {
        API.plantSeed(plot.id, activeItem.id).then((res) => {
          Toast.show(res.message, 'success');
          Sound.till();
          plot.seedType = activeItem.id;
          plot.stage = 0;
          if (res.inventory) Inventory.loadItems(res.inventory);
        }).catch(err => Toast.show(err.message, 'warning'));
      }
    }
    // 7. Click on mature crop to harvest
    const plotToHarvest = Farming.getPlotAt(targetPos.x, targetPos.y, 16);
    if (plotToHarvest && plotToHarvest.stage >= plotToHarvest.maxStage) {
      API.harvestPlot(plotToHarvest.id).then((res) => {
        Toast.show(res.message, 'success');
        Sound.harvest();
        plotToHarvest.seedType = null;
        plotToHarvest.stage = 0;
        plotToHarvest.isWatered = false;
        if (res.player) this.syncPlayerStats(res.player);
        if (res.inventory) Inventory.loadItems(res.inventory);
      }).catch(err => Toast.show(err.message, 'warning'));
    }
  }

  syncPlayerStats(playerData) {
    if (!playerData) return;
    this.player.hp = playerData.hp;
    this.player.maxHp = playerData.max_hp;
    this.player.energy = playerData.energy;
    this.player.maxEnergy = playerData.max_energy;
    this.player.gold = playerData.gold;
    this.player.level = playerData.level;
    this.player.xp = playerData.xp;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply Camera translation and zoom
    this.camera.apply(this.ctx);

    // 1. Draw World Map Base
    MapInstance.renderBase(this.ctx);

    // 2. Draw Farming Soil & Crops
    Farming.render(this.ctx);

    // 3. Y-Sorting all dynamic entities (so entities in front properly occlude entities behind)
    const renderList = [
      ...Animals.animals.map(a => ({ y: a.y, render: (ctx) => a.render(ctx) })),
      ...Enemies.enemies.map(e => ({ y: e.y, render: (ctx) => e.render(ctx) })),
      ...NPCs.npcs.map(n => ({ y: n.y, render: (ctx) => n.render(ctx, Math.hypot(n.x - this.player.x, n.y - this.player.y) <= 28) })),
      { y: this.player.y, render: (ctx) => this.player.render(ctx) }
    ];

    renderList.sort((a, b) => a.y - b.y);

    for (let item of renderList) {
      item.render(this.ctx);
    }

    // 4. Combat Damage Numbers
    Combat.render(this.ctx);

    // 5. Ambient drifting particles
    MapInstance.renderParticles(this.ctx);

    // 6. Day-Night Lighting overlay
    MapInstance.renderLighting(this.ctx, this.player.x, this.player.y);

    // Restore Camera
    this.camera.restore(this.ctx);
  }
}

let GameEngine = null;
