// Game Bootstrap & Initialization
window.addEventListener('DOMContentLoaded', async () => {
  console.log('[Cute Fantasy RPG] Loading game assets...');

  try {
    // 1. Preload all spritesheets and images
    await Sprites.loadAll();
    console.log('[Cute Fantasy RPG] Assets loaded successfully.');

    // 2. Initialize Game Engine
    GameEngine = new GameCoordinator();

    // 3. Load initial state from FastAPI Backend
    const gameState = await API.getGameState();
    console.log('[Cute Fantasy RPG] Game State loaded from server:', gameState);

    if (gameState) {
      // Sync Player
      if (gameState.player) {
        GameEngine.player.x = gameState.player.x || 140;
        GameEngine.player.y = gameState.player.y || 240;
        GameEngine.syncPlayerStats(gameState.player);
      }
      // Sync Inventory
      if (gameState.inventory) {
        Inventory.loadItems(gameState.inventory);
      }
      // Sync Farm Plots
      if (gameState.farm_plots) {
        Farming.initPlots(gameState.farm_plots);
      }
      // Sync Quests
      if (gameState.quests) {
        Quests.loadQuests(gameState.quests);
      }
      // Sync Time & Day
      if (gameState.day) MapInstance.day = gameState.day;
      if (gameState.world_time) MapInstance.timeOfDay = gameState.world_time;
    }

    // 4. Start Game Loop
    GameEngine.start();

    // 5. Welcome Toast
    Toast.show('Chào mừng bạn đến với Ngôi Làng Cute Fantasy! Bấm [H] để xem hướng dẫn.', 'success', 5000);

    // 6. Background Auto-save every 15 seconds
    setInterval(() => {
      if (GameEngine && GameEngine.player) {
        API.updatePlayer({
          x: GameEngine.player.x,
          y: GameEngine.player.y,
          direction: GameEngine.player.direction,
          hp: GameEngine.player.hp,
          energy: GameEngine.player.energy,
          gold: GameEngine.player.gold,
          level: GameEngine.player.level,
          xp: GameEngine.player.xp
        }).catch(() => {});
      }
    }, 15000);

  } catch (err) {
    console.error('[Cute Fantasy RPG] Initialization Error:', err);
    Toast.show('Không thể kết nối với Backend Server. Vui lòng kiểm tra FastAPI!', 'danger');
  }
});
