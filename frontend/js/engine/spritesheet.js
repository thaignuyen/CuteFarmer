// SpriteSheet & Asset Loader
class SpriteManager {
  constructor() {
    this.images = {};
    this.loadedCount = 0;
    this.totalCount = 0;
    this.isReady = false;
  }

  loadAll() {
    const assetList = {
      map: 'assets/map/village_map.png',
      player: 'assets/player/Player.png',
      actions: 'assets/player/Player_Actions.png',
      chicken: 'assets/animals/Chicken.png',
      cow: 'assets/animals/Cow.png',
      pig: 'assets/animals/Pig.png',
      sheep: 'assets/animals/Sheep.png',
      slime: 'assets/enemies/Slime_Green.png',
      skeleton: 'assets/enemies/Skeleton.png',
      decor: 'assets/decor/Outdoor_Decor_Free.png',
      house: 'assets/decor/House_1_Wood_Base_Blue.png',
      bridge: 'assets/decor/Bridge_Wood.png',
      tree: 'assets/decor/Oak_Tree.png',
      treeSmall: 'assets/decor/Oak_Tree_Small.png',
      fences: 'assets/decor/Fences.png',
      chest: 'assets/decor/Chest.png',
      tilesFarm: 'assets/tiles/FarmLand_Tile.png',
      tilesWater: 'assets/tiles/Water_Tile.png',
      tilesPath: 'assets/tiles/Path_Tile.png'
    };

    const keys = Object.keys(assetList);
    this.totalCount = keys.length;

    return new Promise((resolve) => {
      keys.forEach((key) => {
        const img = new Image();
        img.src = assetList[key];
        img.onload = () => {
          this.images[key] = img;
          this.loadedCount++;
          if (this.loadedCount === this.totalCount) {
            this.isReady = true;
            resolve();
          }
        };
        img.onerror = () => {
          console.error(`Failed to load asset: ${assetList[key]}`);
          this.loadedCount++;
          if (this.loadedCount === this.totalCount) {
            this.isReady = true;
            resolve();
          }
        };
      });
    });
  }

  get(key) {
    return this.images[key];
  }

  // Draw sprite slice with optional horizontal flip
  drawFrame(ctx, key, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, flipX = false) {
    const img = this.images[key];
    if (!img) return;

    if (flipX) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, sy, sWidth, sHeight, -dx - dWidth, dy, dWidth, dHeight);
      ctx.restore();
    } else {
      ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }
  }
}

const Sprites = new SpriteManager();
