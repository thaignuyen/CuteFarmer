// Market Shop Modal Controller
class ShopModalController {
  constructor() {
    this.modal = document.getElementById('shop-modal');
    this.tabBuy = document.getElementById('tab-shop-buy');
    this.tabSell = document.getElementById('tab-shop-sell');
    this.container = document.getElementById('shop-items-container');
    this.goldDisplay = document.getElementById('shop-gold-display');
    this.closeBtn = document.getElementById('btn-close-shop');

    this.currentTab = 'buy'; // 'buy' or 'sell'
    this.catalog = [];

    this._bindEvents();
  }

  _bindEvents() {
    if (this.tabBuy) {
      this.tabBuy.addEventListener('click', () => {
        this.currentTab = 'buy';
        this.tabBuy.classList.add('active');
        this.tabSell.classList.remove('active');
        this.render();
      });
    }

    if (this.tabSell) {
      this.tabSell.addEventListener('click', () => {
        this.currentTab = 'sell';
        this.tabSell.classList.add('active');
        this.tabBuy.classList.remove('active');
        this.render();
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
  }

  open() {
    if (!this.modal) return;
    API.getShopItems().then((items) => {
      this.catalog = items;
      this.modal.classList.remove('hidden');
      this.render();
    }).catch(console.error);
  }

  close() {
    if (this.modal) this.modal.classList.add('hidden');
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const player = GameEngine.player;
    if (this.goldDisplay && player) {
      this.goldDisplay.textContent = player.gold;
    }

    const iconEmojis = {
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

    if (this.currentTab === 'buy') {
      // List buyable items from catalog
      this.catalog.filter(i => i.price > 0).forEach((item) => {
        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `
          <div class="shop-card-left">
            <span class="shop-card-icon">${iconEmojis[item.id] || '📦'}</span>
            <div>
              <div class="shop-card-title">${item.name}</div>
              <div class="shop-card-desc">${item.description}</div>
            </div>
          </div>
          <div class="shop-card-price">${item.price} 💰</div>
        `;

        card.addEventListener('click', () => {
          this.buy(item.id);
        });

        this.container.appendChild(card);
      });
    } else {
      // List sellable items from Player's inventory
      const sellables = Inventory.items.filter(i => i.category !== 'tool' && i.count > 0);

      if (sellables.length === 0) {
        this.container.innerHTML = '<p style="grid-column: span 2; text-align: center; color:#aaa; padding: 20px;">Túi đồ của bạn không có nông sản hoặc vật phẩm nào để bán!</p>';
        return;
      }

      sellables.forEach((item) => {
        const catItem = this.catalog.find(c => c.id === item.id);
        const sellPrice = item.sell_price || (catItem ? catItem.sell_price : 10);

        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `
          <div class="shop-card-left">
            <span class="shop-card-icon">${iconEmojis[item.id] || '📦'}</span>
            <div>
              <div class="shop-card-title">${item.name} (Có: ${item.count})</div>
              <div class="shop-card-desc">Bán 1 cái thu về ${sellPrice} Vàng</div>
            </div>
          </div>
          <div class="shop-card-price">+${sellPrice} 💰</div>
        `;

        card.addEventListener('click', () => {
          this.sell(item.id);
        });

        this.container.appendChild(card);
      });
    }
  }

  buy(itemId) {
    API.buyItem(itemId, 1).then((res) => {
      Toast.show(res.message, 'success');
      Sound.coin();
      if (GameEngine.player) GameEngine.player.gold = res.gold;
      if (res.inventory) Inventory.loadItems(res.inventory);
      this.render();
    }).catch(err => Toast.show(err.message, 'warning'));
  }

  sell(itemId) {
    API.sellItem(itemId, 1).then((res) => {
      Toast.show(res.message, 'success');
      Sound.coin();
      if (GameEngine.player) GameEngine.player.gold = res.gold;
      if (res.inventory) Inventory.loadItems(res.inventory);
      this.render();
    }).catch(err => Toast.show(err.message, 'warning'));
  }
}

const ShopModal = new ShopModalController();
