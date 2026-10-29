// Fishing Minigame System
class FishingSystem {
  constructor() {
    this.isActive = false;
    this.fishPos = 50; // 0..100
    this.fishVelocity = 0;
    this.targetPos = 50; // 0..100
    this.targetVelocity = 0;
    this.progress = 40; // 0..100
    this.timer = 0;

    this.overlay = document.getElementById('fishing-overlay');
    this.fishMarker = document.getElementById('fishing-fish-marker');
    this.targetZone = document.getElementById('fishing-target-zone');
    this.progressFill = document.getElementById('fishing-progress-fill');

    window.addEventListener('keydown', (e) => {
      if (this.isActive && e.code === 'Space') {
        this.boostTarget();
      }
    });

    if (this.overlay) {
      this.overlay.addEventListener('mousedown', () => {
        if (this.isActive) this.boostTarget();
      });
    }
  }

  start(player) {
    if (this.isActive) return;
    if (player.energy < 8) {
      Toast.show('Không đủ thể lực để câu cá! Cần ít nhất 8 Thể lực.', 'warning');
      return;
    }

    this.isActive = true;
    this.progress = 45;
    this.fishPos = 40;
    this.targetPos = 40;
    this.targetVelocity = 0;
    this.timer = 0;

    Sound.fishBite();
    if (this.overlay) this.overlay.classList.remove('hidden');
    Toast.show('Đã thả câu! Giữ con cá trong vùng xanh lá.', 'success');
  }

  boostTarget() {
    this.targetVelocity = 120; // Impulse upwards
  }

  update(dt) {
    if (!this.isActive) return;

    this.timer += dt;

    // Fish AI: wanders smoothly up and down
    this.fishPos += Math.sin(this.timer * 3) * 45 * dt + (Math.random() - 0.5) * 60 * dt;
    this.fishPos = Math.max(10, Math.min(90, this.fishPos));

    // Target zone physics (Gravity + Player boost)
    this.targetVelocity -= 220 * dt; // Gravity
    this.targetPos += this.targetVelocity * dt;

    if (this.targetPos < 0) {
      this.targetPos = 0;
      this.targetVelocity = 0;
    } else if (this.targetPos > 80) {
      this.targetPos = 80;
      this.targetVelocity = 0;
    }

    // Check if fish is inside target zone (target is 25 units tall)
    const isInZone = (this.fishPos >= this.targetPos && this.fishPos <= this.targetPos + 25);

    if (isInZone) {
      this.progress += 28 * dt;
    } else {
      this.progress -= 18 * dt;
    }

    this.progress = Math.max(0, Math.min(100, this.progress));

    // Update UI elements
    if (this.fishMarker) this.fishMarker.style.bottom = `${this.fishPos * 1.8}px`;
    if (this.targetZone) this.targetZone.style.bottom = `${this.targetPos * 1.8}px`;
    if (this.progressFill) this.progressFill.style.width = `${this.progress}%`;

    // Win condition
    if (this.progress >= 100) {
      this.finish(true);
    }
    // Lose condition
    else if (this.progress <= 0) {
      this.finish(false);
    }
  }

  finish(success) {
    this.isActive = false;
    if (this.overlay) this.overlay.classList.add('hidden');

    if (success) {
      Sound.harvest();
      API.fish().then((res) => {
        Toast.show(res.message, 'success');
        if (res.player) GameEngine.syncPlayerStats(res.player);
        if (res.inventory) Inventory.loadItems(res.inventory);
      }).catch(err => Toast.show(err.message, 'warning'));
    } else {
      Toast.show('Cá đã tuột mất khỏi lưỡi câu rồi!', 'warning');
    }
  }
}

const Fishing = new FishingSystem();
