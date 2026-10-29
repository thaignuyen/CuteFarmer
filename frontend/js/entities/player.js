// Player Entity
class Player {
  constructor(x = 140, y = 240) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.speed = 80; // px/sec

    this.direction = 'down'; // 'down', 'up', 'left', 'right'
    this.state = 'idle';     // 'idle', 'walk', 'action'

    this.animTimer = 0;
    this.frameIndex = 0;
    this.animSpeed = 0.12; // sec per frame

    this.actionTimer = 0;
    this.actionDuration = 0.35; // sec
    this.actionType = null; // 'hoe', 'water', 'axe', 'sword', 'fish'

    this.stepTimer = 0;

    // Stats
    this.name = 'Hoàng Hiệp Sĩ';
    this.hp = 100;
    this.maxHp = 100;
    this.energy = 100;
    this.maxEnergy = 100;
    this.gold = 100;
    this.level = 1;
    this.xp = 0;
    this.equippedSlot = 0;
  }

  update(dt, input) {
    // If performing an action animation, freeze movement until complete
    if (this.state === 'action') {
      this.actionTimer += dt;
      if (this.actionTimer >= this.actionDuration) {
        this.state = 'idle';
        this.actionType = null;
        this.actionTimer = 0;
      }
      return;
    }

    const { dx, dy } = input.getMovement();

    if (dx !== 0 || dy !== 0) {
      this.state = 'walk';

      // Update facing direction
      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.direction = dy > 0 ? 'down' : 'up';
      }

      // Check collision separately for X and Y for smooth wall sliding
      const moveDistX = dx * this.speed * dt;
      const moveDistY = dy * this.speed * dt;

      if (!Collisions.isColliding(this.x + moveDistX, this.y, this.radius)) {
        this.x += moveDistX;
      }
      if (!Collisions.isColliding(this.x, this.y + moveDistY, this.radius)) {
        this.y += moveDistY;
      }

      // Step sound
      this.stepTimer += dt;
      if (this.stepTimer > 0.28) {
        Sound.step();
        this.stepTimer = 0;
      }
    } else {
      this.state = 'idle';
      this.stepTimer = 0;
    }

    // Animation frame ticker
    this.animTimer += dt;
    if (this.animTimer >= this.animSpeed) {
      this.animTimer = 0;
      this.frameIndex = (this.frameIndex + 1) % 6;
    }
  }

  // Trigger an action animation with sound
  triggerAction(actionType) {
    this.state = 'action';
    this.actionType = actionType;
    this.actionTimer = 0;

    if (actionType === 'hoe') Sound.till();
    else if (actionType === 'water') Sound.water();
    else if (actionType === 'sword') Sound.swing();
    else if (actionType === 'axe') Sound.swing();
    else Sound.swing();
  }

  // Calculate tool action target position in front of player
  getTargetPosition(distance = 18) {
    let tx = this.x;
    let ty = this.y;
    if (this.direction === 'down') ty += distance;
    else if (this.direction === 'up') ty -= distance;
    else if (this.direction === 'right') tx += distance;
    else if (this.direction === 'left') tx -= distance;
    return { x: tx, y: ty };
  }

  render(ctx) {
    // Drop shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 4, 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const isFlipped = this.direction === 'left';

    // RENDER ACTION ANIMATION (from Player_Actions.png: 48x48)
    if (this.state === 'action' && this.actionType) {
      const actionRowOffsets = {
        axe: 0,
        hoe: 3,
        water: 6,
        sword: 9
      };

      const baseRow = actionRowOffsets[this.actionType] ?? 9;
      let dirOffset = 0;
      if (this.direction === 'up') dirOffset = 1;
      else if (this.direction === 'right' || this.direction === 'left') dirOffset = 2;

      const row = baseRow + dirOffset;
      const col = (this.actionTimer > this.actionDuration / 2) ? 1 : 0;

      // Draw 48x48 action frame centered on player
      Sprites.drawFrame(
        ctx, 'actions',
        col * 48, row * 48, 48, 48,
        Math.floor(this.x - 24), Math.floor(this.y - 32),
        48, 48,
        isFlipped
      );
      return;
    }

    // RENDER STANDARD IDLE & WALK (from Player.png: 32x32)
    let rowIndex = 0;
    if (this.state === 'idle') {
      if (this.direction === 'down') rowIndex = 0;
      else if (this.direction === 'right' || this.direction === 'left') rowIndex = 1;
      else if (this.direction === 'up') rowIndex = 2;
    } else { // walk
      if (this.direction === 'down') rowIndex = 3;
      else if (this.direction === 'right' || this.direction === 'left') rowIndex = 4;
      else if (this.direction === 'up') rowIndex = 5;
    }

    const colIndex = this.frameIndex % 6;

    Sprites.drawFrame(
      ctx, 'player',
      colIndex * 32, rowIndex * 32, 32, 32,
      Math.floor(this.x - 16), Math.floor(this.y - 24),
      32, 32,
      isFlipped
    );
  }
}
