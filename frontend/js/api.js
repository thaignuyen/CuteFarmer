// API Connector to FastAPI Backend
const API = {
  baseUrl: window.location.origin.includes('5500') || window.location.origin.includes('3000') 
    ? 'http://127.0.0.1:8000' 
    : '',

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Lỗi HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[API Error] ${endpoint}:`, err.message);
      throw err;
    }
  },

  // Player
  getPlayer() {
    return this.request('/api/player');
  },
  updatePlayer(data) {
    return this.request('/api/player/update', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  restPlayer() {
    return this.request('/api/player/rest', { method: 'POST' });
  },

  // Farm
  getFarmPlots() {
    return this.request('/api/farm/plots');
  },
  tillPlot(plotId) {
    return this.request('/api/farm/till', {
      method: 'POST',
      body: JSON.stringify({ plot_id: plotId })
    });
  },
  plantSeed(plotId, seedId) {
    return this.request('/api/farm/plant', {
      method: 'POST',
      body: JSON.stringify({ plot_id: plotId, seed_id: seedId })
    });
  },
  waterPlot(plotId) {
    return this.request('/api/farm/water', {
      method: 'POST',
      body: JSON.stringify({ plot_id: plotId })
    });
  },
  harvestPlot(plotId) {
    return this.request('/api/farm/harvest', {
      method: 'POST',
      body: JSON.stringify({ plot_id: plotId })
    });
  },

  // Inventory
  getInventory() {
    return this.request('/api/inventory');
  },
  useItem(itemId) {
    return this.request('/api/inventory/use', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId })
    });
  },

  // Shop
  getShopItems() {
    return this.request('/api/shop/items');
  },
  buyItem(itemId, quantity = 1) {
    return this.request('/api/shop/buy', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, quantity })
    });
  },
  sellItem(itemId, quantity = 1) {
    return this.request('/api/shop/sell', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, quantity })
    });
  },

  // Quests
  getQuests() {
    return this.request('/api/quests');
  },
  claimQuest(questId) {
    return this.request(`/api/quests/${questId}/claim`, { method: 'POST' });
  },

  // Game State
  getGameState() {
    return this.request('/api/game/state');
  },
  saveGame() {
    return this.request('/api/game/save', { method: 'POST' });
  },
  resetGame() {
    return this.request('/api/game/reset', { method: 'POST' });
  },
  defeatEnemy(enemyType = 'slime') {
    return this.request('/api/game/combat/defeat', {
      method: 'POST',
      body: JSON.stringify({ enemy_type: enemyType })
    });
  },
  fish() {
    return this.request('/api/game/fish', { method: 'POST' });
  }
};
