// Enemy Entities (Green Slime & Skeleton)
class SlimeEnemy {
  constructor(x, y) {
    this.spawnX = x;
    this.spawnY = y;
    this.x = x;
    this.y = y;
    this.hp = 50;
    this.maxHp = 50;
    this.speed = 35;
    this.radius = 8;

    this.state = 'idle'; // 'idle', 'jump', 'hurt', 'dead'
    this.stateTimer = 0;
    this.animTimer = 0;
    this.frame = 0;

    this.hurtTimer = 0;
    this.respawnTimer = 0;
    this.isDead = false;

    this.vx = 0;
    this.vy = 0;
  }

  takeDamage(amount, knockbackSourceX, knockbackSourceY) {
    if (this.isDead || this.hurtTimer > 0) return;

    this.hp -= amount;
    this.hurtTimer = 0.25;
    this.state = 'hurt';
    Sound.hit();

    // Knockback
    const angle = Math.atan2(this.y - knockbackSourceY, this.x - knockbackSourceX);
    this.vx = Math.cos(angle) * 80;
    this.vy = Math.sin(angle) * 80;

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    this.state = 'dead';
    this.respawnTimer = 25.0; // Respawns after 25s
    API.defeatEnemy('slime').then((res) => {
      Toast.show(res.message, 'success');
      if (res.player) {
        GameEngine.syncPlayerStats(res.player);
      }
    }).catch(console.error);
  }

  update(dt, playerX, playerY) {
    if (this.isDead) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.isDead = false;
        this.hp = this.maxHp;
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.state = 'idle';
      }
      return;
    }

    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= 0.88;
      this.vy *= 0.88;
      return;
    }

    // Aggro check: if player is within 65px, leap toward player
    const distToPlayer = Math.hypot(playerX - this.x, playerY - this.y);

    if (distToPlayer < 70) {
      // Chase player
      const angle = Math.atan2(playerY - this.y, playerX - this.x);
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
      this.state = 'jump';
    } else {
      // Idle hop
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        if (this.state === 'idle') {
          this.state = 'jump';
          const randomAngle = Math.random() * Math.PI * 2;
          this.vx = Math.cos(randomAngle) * (this.speed * 0.5);
          this.vy = Math.sin(randomAngle) * (this.speed * 0.5);
          this.stateTimer = 1.0;
        } else {
          this.state = 'idle';
          this.vx = 0;
          this.vy = 0;
          this.stateTimer = 1.5 + Math.random() * 2;
        }
      }
    }

    if (this.state === 'jump') {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }

    // Animation frames (Slime_Green.png: 32x32 cells)
    this.animTimer += dt;
    if (this.animTimer > 0.12) {
      this.animTimer = 0;
      this.frame = (this.frame + 1) % 6;
    }
  }

  render(ctx) {
    if (this.isDead) return;

    // Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 4, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Row selection:
    // Row 0 = Idle
    // Row 1 = Jump
    // Row 3 = Hurt
    let row = 0;
    if (this.state === 'jump') row = 1;
    else if (this.state === 'hurt') row = 3;

    // Flash white when hurt
    if (this.hurtTimer > 0) {
      ctx.save();
      ctx.filter = 'brightness(2.5)';
    }

    Sprites.drawFrame(
      ctx, 'slime',
      this.frame * 32, row * 32, 32, 32,
      Math.floor(this.x - 16), Math.floor(this.y - 20),
      32, 32
    );

    if (this.hurtTimer > 0) {
      ctx.restore();
    }

    // Health bar above slime
    if (this.hp < this.maxHp) {
      ctx.save();
      const barW = 20;
      const barH = 3;
      const bx = this.x - barW / 2;
      const by = this.y - 18;
      ctx.fillStyle = '#000';
      ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(bx, by, barW * (this.hp / this.maxHp), barH);
      ctx.restore();
    }
  }
}

class EnemyManager {
  constructor() {
    this.enemies = [];
    this._initEnemies();
  }

  _initEnemies() {
    // 2 Slimes near upper-right forest / outskirts
    this.enemies.push(new SlimeEnemy(580, 50));
    this.enemies.push(new SlimeEnemy(610, 80));
  }

  update(dt, playerX, playerY) {
    for (let e of this.enemies) {
      e.update(dt, playerX, playerY);
    }
  }

  render(ctx) {
    for (let e of this.enemies) {
      e.render(ctx);
    }
  }

  checkAttackHit(attackBox, damage = 25, playerX, playerY) {
    let hitCount = 0;
    for (let e of this.enemies) {
      if (e.isDead) continue;
      const dist = Math.hypot(e.x - attackBox.x, e.y - attackBox.y);
      if (dist <= attackBox.radius + e.radius) {
        e.takeDamage(damage, playerX, playerY);
        hitCount++;
      }
    }
    return hitCount;
  }
}

const Enemies = new EnemyManager();
