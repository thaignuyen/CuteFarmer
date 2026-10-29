// Heads-Up Display (HUD) Controller
class HUDController {
  constructor() {
    this.hpFill = document.getElementById('hud-hp-fill');
    this.hpText = document.getElementById('hud-hp-text');
    this.energyFill = document.getElementById('hud-energy-fill');
    this.energyText = document.getElementById('hud-energy-text');
    this.xpFill = document.getElementById('hud-xp-fill');
    this.xpText = document.getElementById('hud-xp-text');
    this.levelBadge = document.getElementById('hud-level');
    this.playerName = document.getElementById('hud-player-name');
    this.dayText = document.getElementById('hud-day');
    this.timeText = document.getElementById('hud-time');
    this.goldText = document.getElementById('hud-gold');

    this.promptEl = document.getElementById('interaction-prompt');
    this.promptLabel = document.getElementById('prompt-label');

    this._bindButtons();
  }

  _bindButtons() {
    // Quick Action Buttons
    const btnQuest = document.getElementById('btn-toggle-quest');
    if (btnQuest) btnQuest.addEventListener('click', () => Quests.toggleModal());

    const btnInv = document.getElementById('btn-toggle-inventory');
    if (btnInv) btnInv.addEventListener('click', () => Inventory.toggleModal());

    const btnSave = document.getElementById('btn-save-game');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        API.saveGame().then((res) => {
          Toast.show(res.message, 'success');
          Sound.coin();
        }).catch(err => Toast.show(err.message, 'warning'));
      });
    }

    // Help Modal
    const helpModal = document.getElementById('help-modal');
    const btnHelp = document.getElementById('btn-toggle-help');
    const btnCloseHelp = document.getElementById('btn-close-help');
    const btnGotIt = document.getElementById('btn-got-it');

    const toggleHelp = () => {
      if (helpModal) helpModal.classList.toggle('hidden');
    };

    if (btnHelp) btnHelp.addEventListener('click', toggleHelp);
    if (btnCloseHelp) btnCloseHelp.addEventListener('click', toggleHelp);
    if (btnGotIt) btnGotIt.addEventListener('click', toggleHelp);

    // Keyboard shortcuts for modals
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyQ') Quests.toggleModal();
      else if (e.code === 'KeyI') Inventory.toggleModal();
      else if (e.code === 'KeyH') toggleHelp();
      else if (e.code === 'Escape') {
        // Close all modals
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
      }
    });
  }

  updatePlayer(player) {
    if (!player) return;

    if (this.playerName) this.playerName.textContent = player.name;
    if (this.levelBadge) this.levelBadge.textContent = `Lv.${player.level}`;

    const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
    if (this.hpFill) this.hpFill.style.width = `${hpPercent}%`;
    if (this.hpText) this.hpText.textContent = `${player.hp} / ${player.maxHp} HP`;

    const energyPercent = Math.max(0, Math.min(100, (player.energy / player.maxEnergy) * 100));
    if (this.energyFill) this.energyFill.style.width = `${energyPercent}%`;
    if (this.energyText) this.energyText.textContent = `${player.energy} / ${player.maxEnergy} Thể Lực`;

    const neededXp = player.level * 100;
    const xpPercent = Math.max(0, Math.min(100, (player.xp / neededXp) * 100));
    if (this.xpFill) this.xpFill.style.width = `${xpPercent}%`;
    if (this.xpText) this.xpText.textContent = `${player.xp} / ${neededXp} XP`;

    if (this.goldText) this.goldText.textContent = `${player.gold} Vàng`;
  }

  updateTime(day, timeString) {
    if (this.dayText) this.dayText.textContent = `Ngày ${day}`;
    if (this.timeText) this.timeText.textContent = timeString;
  }

  showPrompt(label) {
    if (!this.promptEl) return;
    this.promptEl.classList.remove('hidden');
    if (this.promptLabel) this.promptLabel.textContent = label;
  }

  hidePrompt() {
    if (this.promptEl) this.promptEl.classList.add('hidden');
  }
}

const HUD = new HUDController();
