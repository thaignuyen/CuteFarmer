// Animal Entities (Chicken, Cow, Pig, Sheep)
class Animal {
  constructor(type, x, y, bounds) {
    this.type = type; // 'chicken', 'cow', 'pig', 'sheep'
    this.x = x;
    this.y = y;
    this.bounds = bounds; // { minX, maxX, minY, maxY }

    this.vx = 0;
    this.vy = 0;
    this.speed = type === 'chicken' ? 18 : 12;
    this.direction = 'right';

    this.state = 'idle';
    this.stateTimer = 1 + Math.random() * 3;
    this.animTimer = 0;
    this.frame = 0;
  }

  update(dt) {
    this.stateTimer -= dt;

    if (this.stateTimer <= 0) {
      if (this.state === 'idle') {
        // Switch to walk
        this.state = 'walk';
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.direction = this.vx >= 0 ? 'right' : 'left';
        this.stateTimer = 1.5 + Math.random() * 2.5;
      } else {
        // Switch to idle
        this.state = 'idle';
        this.vx = 0;
        this.vy = 0;
        this.stateTimer = 2 + Math.random() * 4;
      }
    }

    if (this.state === 'walk') {
      let nextX = this.x + this.vx * dt;
      let nextY = this.y + this.vy * dt;

      // Constrain within bounds
      if (nextX < this.bounds.minX || nextX > this.bounds.maxX) {
        this.vx *= -1;
        this.direction = this.vx >= 0 ? 'right' : 'left';
        nextX = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, nextX));
      }
      if (nextY < this.bounds.minY || nextY > this.bounds.maxY) {
        this.vy *= -1;
        nextY = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, nextY));
      }

      this.x = nextX;
      this.y = nextY;
    }

    // Animation frame ticker (2 frames: col 0 and 1)
    this.animTimer += dt;
    if (this.animTimer > 0.25) {
      this.animTimer = 0;
      this.frame = (this.frame + 1) % 2;
    }
  }

  render(ctx) {
    // Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    const shadowR = this.type === 'chicken' ? 5 : 8;
    ctx.ellipse(this.x, this.y + 4, shadowR, shadowR * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Sprite row & col
    // Sprites are 64x64 containing 32x32 frames:
    // Row 0 = idle (cols 0, 1)
    // Row 1 = walk (cols 0, 1)
    const row = this.state === 'walk' ? 1 : 0;
    const col = this.frame;
    const isFlipped = this.direction === 'left';

    Sprites.drawFrame(
      ctx, this.type,
      col * 32, row * 32, 32, 32,
      Math.floor(this.x - 16), Math.floor(this.y - 20),
      32, 32,
      isFlipped
    );
  }
}

class AnimalManager {
  constructor() {
    this.animals = [];
    this._initVillageAnimals();
  }

  _initVillageAnimals() {
    // 3 Chickens in the top chicken pen (x: ~380..500, y: ~85..145)
    this.animals.push(new Animal('chicken', 410, 100, { minX: 380, maxX: 490, minY: 85, maxY: 140 }));
    this.animals.push(new Animal('chicken', 440, 120, { minX: 380, maxX: 490, minY: 85, maxY: 140 }));
    this.animals.push(new Animal('chicken', 465, 105, { minX: 380, maxX: 490, minY: 85, maxY: 140 }));

    // Pasture animals near bottom-left barn
    this.animals.push(new Animal('cow', 105, 335, { minX: 85, maxX: 125, minY: 320, maxY: 360 }));
    this.animals.push(new Animal('pig', 45, 345, { minX: 25, maxX: 65, minY: 330, maxY: 365 }));
    this.animals.push(new Animal('sheep', 80, 360, { minX: 60, maxX: 100, minY: 340, maxY: 375 }));
  }

  update(dt) {
    for (let animal of this.animals) {
      animal.update(dt);
    }
  }

  render(ctx) {
    for (let animal of this.animals) {
      animal.render(ctx);
    }
  }

  getNearest(x, y, maxDist = 24) {
    for (let animal of this.animals) {
      const dist = Math.hypot(animal.x - x, animal.y - y);
      if (dist <= maxDist) return animal;
    }
    return null;
  }
}

const Animals = new AnimalManager();
