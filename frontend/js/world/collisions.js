// World Collisions and Trigger Zones
class CollisionSystem {
  constructor() {
    this.mapWidth = 630;
    this.mapHeight = 500;

    // Solid obstacle bounding boxes [x, y, w, h]
    this.obstacles = [
      // Map Outer Borders
      { x: -50, y: -50, w: 730, h: 50 }, // Top border
      { x: -50, y: 500, w: 730, h: 50 }, // Bottom border
      { x: -50, y: 0, w: 50, h: 500 },   // Left border
      { x: 630, y: 0, w: 50, h: 500 },   // Right border

      // Top-Left Pond
      { x: 0, y: 0, w: 130, h: 60 },

      // Farm House (Top-Left)
      { x: 170, y: 30, w: 90, h: 90 },

      // Animal Barnlet & Enclosure Top Fence (Top-Center)
      { x: 395, y: 0, w: 90, h: 80 },
      { x: 360, y: 65, w: 165, h: 8 },  // Pen Top Fence
      { x: 360, y: 65, w: 8, h: 95 },   // Pen Left Fence
      { x: 517, y: 65, w: 8, h: 95 },   // Pen Right Fence
      { x: 360, y: 155, w: 165, h: 8 }, // Pen Bottom Fence

      // Grand Manor / Tavern (Top-Right)
      { x: 350, y: 20, w: 280, h: 140 },
      { x: 570, y: 140, w: 60, h: 80 }, // Tavern terrace hedge

      // Greenhouse (Center)
      { x: 235, y: 165, w: 75, h: 105 },

      // Market Stalls (Center-Bottom Left)
      { x: 130, y: 320, w: 200, h: 45 },

      // Barn & Silo (Bottom-Left)
      { x: 0, y: 200, w: 100, h: 120 },

      // Village Houses (Bottom)
      { x: 0, y: 440, w: 100, h: 60 },
      { x: 155, y: 440, w: 180, h: 60 },
      { x: 550, y: 440, w: 80, h: 60 },

      // Stone Church (Bottom-Right)
      { x: 520, y: 230, w: 85, h: 120 },

      // River (North section above bridge)
      { x: 390, y: 270, w: 80, h: 95 },

      // River (South section below bridge)
      { x: 365, y: 405, w: 110, h: 95 }

      // NOTE: Bridge is located between y: 365 and 405, x: 385..475 -> PASSABLE!
    ];

    // Trigger Zones for player interactions
    this.zones = {
      farm: { x: 10, y: 75, w: 80, h: 90, name: 'Khu Vườn Nông Trại' },
      houseDoor: { x: 200, y: 125, w: 30, h: 25, name: 'Cửa Nhà (Nghỉ ngơi qua đêm)' },
      market: { x: 140, y: 365, w: 180, h: 30, name: 'Sạp Chợ Phiên (Bán buôn hạt giống, nông sản)' },
      dock: { x: 410, y: 275, w: 30, h: 45, name: 'Bến Cầu Gỗ (Câu cá)' },
      coopGate: { x: 420, y: 150, w: 30, h: 25, name: 'Cổng Chuồng Gia Cầm' },
      churchDoor: { x: 550, y: 345, w: 30, h: 25, name: 'Cửa Giáo Đường' },
      tavern: { x: 480, y: 165, w: 70, h: 35, name: 'Quán Trọ & Ẩm Thực' }
    };
  }

  // Check if circular entity at (x, y) with given radius collides with any solid obstacle
  isColliding(x, y, radius = 6) {
    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      // Circle vs AABB collision
      const closestX = Math.max(obs.x, Math.min(x, obs.x + obs.w));
      const closestY = Math.max(obs.y, Math.min(y, obs.y + obs.h));

      const distX = x - closestX;
      const distY = y - closestY;

      if ((distX * distX + distY * distY) < (radius * radius)) {
        return true;
      }
    }
    return false;
  }

  // Get active trigger zone near player
  getZoneAt(x, y, radius = 20) {
    for (const [key, zone] of Object.entries(this.zones)) {
      if (
        x >= zone.x - radius &&
        x <= zone.x + zone.w + radius &&
        y >= zone.y - radius &&
        y <= zone.y + zone.h + radius
      ) {
        return { key, ...zone };
      }
    }
    return null;
  }
}

const Collisions = new CollisionSystem();
