// Inventory & Hotbar Management
class InventorySystem {
  constructor() {
    this.items = [];
    this.activeSlot = 0;
    this.hotbarSlots = [];
    this.fullModal = document.getElementById('inventory-modal');
    this.selectedInvItem = null;

    this._initDom();
  }

  _initDom() {
    this.hotbarSlots = document.querySelectorAll('.hotbar-slot');
    this.tooltip = document.getElementById('active-item-name');

    // Slot click listeners
    this.hotbarSlots.forEach((slot, index) => {
      slot.addEventListener('click', () => {
        this.selectSlot(index);
      });
    });

    // Keys 1..8 for fast switching
    window.addEventListener('keydown', (e) => {
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8'].includes(e.code)) {
        const slotIdx = parseInt(e.code.replace('Digit', '')) - 1;
        this.selectSlot(slotIdx);
      }
    });

    // Close inventory modal
    const closeBtn = document.getElementById('btn-close-inventory');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Use item button in modal
    const useBtn = document.getElementById('inv-btn-use');
    if (useBtn) {
      useBtn.addEventListener('click', () => this.useSelectedItem());
    }
  }

  loadItems(itemsData) {
    this.items = itemsData || [];
    this.updateHotbarUI();
    this.renderFullInventoryGrid();
  }

  selectSlot(index) {
    if (index < 0 || index >= 8) return;
    this.activeSlot = index;

    this.hotbarSlots.forEach((slot, idx) => {
      if (idx === index) slot.classList.add('active');
      else slot.classList.remove('active');
    });

    const activeItem = this.getActiveItem();
    if (this.tooltip) {
      if (activeItem) {
        this.tooltip.textContent = `${activeItem.name} - ${activeItem.description}`;
      } else {
        this.tooltip.textContent = 'Ô trống';
      }
    }
  }

  getActiveItem() {
    return this.items[this.activeSlot] || null;
  }

  updateHotbarUI() {
    this.hotbarSlots.forEach((slot, idx) => {
      const item = this.items[idx];
      const iconEl = slot.querySelector('.slot-icon');
      const countEl = slot.querySelector('.item-count');

      if (item) {
        slot.title = `${item.name}: ${item.description}`;
        // Count
        if (item.category !== 'tool' && item.count > 1) {
          countEl.textContent = item.count;
        } else {
          countEl.textContent = '';
        }
      } else {
        slot.title = 'Trống';
        countEl.textContent = '';
      }
    });

    this.selectSlot(this.activeSlot);
  }

  openModal() {
    if (!this.fullModal) return;
    this.renderFullInventoryGrid();
    this.fullModal.classList.remove('hidden');
  }

  closeModal() {
    if (this.fullModal) {
      this.fullModal.classList.add('hidden');
    }
  }

  toggleModal() {
    if (!this.fullModal) return;
    if (this.fullModal.classList.contains('hidden')) {
      this.openModal();
    } else {
      this.closeModal();
    }
  }

  renderFullInventoryGrid() {
    const grid = document.getElementById('full-inventory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const iconEmojis = {
      tool_hoe: '⛏️',
      tool_watering_can: '🚿',
      tool_axe: '🪓',
      tool_sword: '⚔️',
      tool_fishing_rod: '🎣',
      seed_tomato: '🍅',
      seed_corn: '🌽',
      seed_carrot: '🥕',
      crop_tomato: '🍅',
      crop_corn: '🌽',
      crop_carrot: '🥕',
      item_fish: '🐟',
      item_slime_jelly: '🟢',
      potion_health: '🧪',
      potion_energy: '⚡'
    };

    // Render 16 slots (4x4)
    for (let i = 0; i < 16; i++) {
      const item = this.items[i];
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      if (this.selectedInvItem && item && this.selectedInvItem.id === item.id) {
        slot.classList.add('selected');
      }

      if (item) {
        slot.textContent = iconEmojis[item.id] || '📦';
        if (item.count > 1) {
          const badge = document.createElement('span');
          badge.className = 'item-count';
          badge.textContent = item.count;
          slot.appendChild(badge);
        }

        slot.addEventListener('click', () => {
          this.selectItemDetail(item);
        });
      }

      grid.appendChild(slot);
    }
  }

  selectItemDetail(item) {
    this.selectedInvItem = item;
    const nameEl = document.getElementById('inv-detail-name');
    const typeEl = document.getElementById('inv-detail-type');
    const descEl = document.getElementById('inv-detail-desc');
    const useBtn = document.getElementById('inv-btn-use');

    if (nameEl) nameEl.textContent = `${item.name} (x${item.count})`;
    if (typeEl) typeEl.textContent = `Phân loại: ${item.category}`;
    if (descEl) descEl.textContent = item.description || 'Không có mô tả.';

    if (useBtn) {
      if (item.category === 'potion') {
        useBtn.classList.remove('hidden');
      } else {
        useBtn.classList.add('hidden');
      }
    }

    this.renderFullInventoryGrid();
  }

  useSelectedItem() {
    if (!this.selectedInvItem) return;
    API.useItem(this.selectedInvItem.id).then((res) => {
      Toast.show(res.message, 'success');
      Sound.harvest();
      if (res.player) GameEngine.syncPlayerStats(res.player);
      if (res.inventory) this.loadItems(res.inventory);
    }).catch(err => Toast.show(err.message, 'warning'));
  }
}

const Inventory = new InventorySystem();
