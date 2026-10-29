// Combat System
class CombatSystem {
  constructor() {
    this.damageNumbers = [];
  }

  executeAttack(player) {
    if (player.energy < 4) {
      Toast.show('Bạn quá mệt để vung kiếm! Nghỉ ngơi hoặc uống Nước tăng lực.', 'warning');
      return;
    }

    player.energy -= 4;
    player.triggerAction('sword');

    const attackTarget = player.getTargetPosition(22);
    const attackBox = {
      x: attackTarget.x,
      y: attackTarget.y,
      radius: 18
    };

    const hits = Enemies.checkAttackHit(attackBox, 25, player.x, player.y);
    if (hits > 0) {
      this.spawnDamageNumber(attackTarget.x, attackTarget.y, 25);
    }
  }

  spawnDamageNumber(x, y, damage) {
    this.damageNumbers.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y - 10,
      damage: damage,
      alpha: 1.0,
      timer: 0.6
    });
  }

  update(dt) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.timer -= dt;
      d.y -= 18 * dt; // Float upwards
      d.alpha = Math.max(0, d.timer / 0.6);
      if (d.timer <= 0) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  render(ctx) {
    for (let d of this.damageNumbers) {
      ctx.save();
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = '#ff4757';
      ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeText(`-${d.damage}`, d.x, d.y);
      ctx.fillText(`-${d.damage}`, d.x, d.y);
      ctx.restore();
    }
  }
}

const Combat = new CombatSystem();
