// Farming System
class FarmingSystem {
  constructor() {
    this.plots = [];
    this.sparkleTimer = 0;
  }

  initPlots(plotsData) {
    if (plotsData && plotsData.length) {
      this.plots = plotsData.map(p => ({
        id: p.id,
        x: p.tile_x,
        y: p.tile_y,
        isTilled: p.is_tilled,
        isWatered: p.is_watered,
        seedType: p.seed_type,
        stage: p.stage,
        maxStage: p.max_stage || 3,
        timer: 0
      }));
    }
  }

  update(dt) {
    this.sparkleTimer += dt * 5;

    // Real-time crop growth for watered crops (each stage takes ~12 seconds)
    for (let plot of this.plots) {
      if (plot.seedType && plot.isWatered && plot.stage < plot.maxStage) {
        plot.timer += dt;
        if (plot.timer >= 12.0) {
          plot.timer = 0;
          plot.stage++;
          if (plot.stage === plot.maxStage) {
            Toast.show(`Nông sản tại ô ${plot.id} đã chín! Hãy thu hoạch ngay.`, 'success');
          }
        }
      }
    }
  }

  getPlotAt(x, y, radius = 12) {
    for (let plot of this.plots) {
      const dist = Math.hypot(plot.x - x, plot.y - y);
      if (dist <= radius) return plot;
    }
    return null;
  }

  render(ctx) {
    for (let plot of this.plots) {
      const px = plot.x;
      const py = plot.y;

      // Draw Tilled / Untilled Ground Tile
      ctx.save();
      if (plot.isTilled) {
        // Tilled Soil
        ctx.fillStyle = plot.isWatered ? '#3b2316' : '#5c3826';
        ctx.fillRect(px - 9, py - 9, 18, 18);
        ctx.strokeStyle = plot.isWatered ? '#22130b' : '#3d2417';
        ctx.lineWidth = 1;
        ctx.strokeRect(px - 9, py - 9, 18, 18);

        // Water sheen reflection
        if (plot.isWatered) {
          ctx.fillStyle = 'rgba(74, 158, 222, 0.25)';
          ctx.fillRect(px - 7, py - 7, 14, 14);
        }
      } else {
        // Untilled plot outline guide
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(px - 8, py - 8, 16, 16);
      }

      // Draw Plant / Crop
      if (plot.seedType) {
        this._renderCrop(ctx, plot, px, py);
      }

      ctx.restore();
    }
  }

  _renderCrop(ctx, plot, x, y) {
    const stage = plot.stage;
    const isReady = stage >= plot.maxStage;

    ctx.save();
    if (stage === 0) {
      // Just planted seed
      ctx.fillStyle = '#f5cd79';
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (stage === 1) {
      // Sprout
      ctx.fillStyle = '#78e08f';
      ctx.fillRect(x - 2, y - 5, 4, 6);
      ctx.fillStyle = '#38ada9';
      ctx.fillRect(x - 4, y - 7, 8, 3);
    } else if (stage === 2) {
      // Growing plant
      ctx.fillStyle = '#38ada9';
      ctx.fillRect(x - 3, y - 8, 6, 9);
      ctx.fillStyle = '#b8e994';
      ctx.beginPath();
      ctx.arc(x, y - 9, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (stage >= 3) {
      // Mature Crop
      let cropColor = '#e55039'; // Tomato red
      let leafColor = '#78e08f';
      let icon = '🍅';

      if (plot.seedType === 'seed_corn') {
        cropColor = '#f6b93b';
        icon = '🌽';
      } else if (plot.seedType === 'seed_carrot') {
        cropColor = '#e67e22';
        icon = '🥕';
      }

      // Bush
      ctx.fillStyle = leafColor;
      ctx.beginPath();
      ctx.arc(x, y - 6, 7, 0, Math.PI * 2);
      ctx.fill();

      // Fruit
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, x, y - 7);

      // Sparkle particles when ripe
      const sparkleY = y - 12 + Math.sin(this.sparkleTimer) * 2;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(x + 5, sparkleY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

const Farming = new FarmingSystem();
