// Map Renderer & Environmental Atmosphere
class WorldMap {
  constructor() {
    this.width = 630;
    this.height = 500;
    this.particles = [];
    this.timeOfDay = 8.0; // Hours (0..24)
    this.day = 1;
    this.lampLights = [
      { x: 380, y: 190, radius: 45 }, // Street lamp near Greenhouse
      { x: 585, y: 140, radius: 50 }, // Lamp near Tavern
      { x: 120, y: 345, radius: 45 }, // Lamp near Barn
      { x: 380, y: 330, radius: 45 }, // Lamp near Dock
      { x: 505, y: 330, radius: 55 }, // Lamp near Church
      { x: 565, y: 310, radius: 65 }  // Church stained glass window glow
    ];
    this._initParticles();
  }

  _initParticles() {
    for (let i = 0; i < 25; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: 0.3 + Math.random() * 0.4,
        vy: 0.1 + Math.random() * 0.2,
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.5,
        type: Math.random() > 0.4 ? 'leaf' : 'pollen'
      });
    }
  }

  update(dt) {
    // Advance world time slowly (1 real sec = 1 in-game minute)
    this.timeOfDay += (dt / 60);
    if (this.timeOfDay >= 24) {
      this.timeOfDay = 0;
      this.day += 1;
    }

    // Update drifting particles
    for (let p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > this.width) p.x = 0;
      if (p.y > this.height) p.y = 0;
    }
  }

  // Render base village map
  renderBase(ctx) {
    const mapImg = Sprites.get('map');
    if (mapImg) {
      ctx.drawImage(mapImg, 0, 0, this.width, this.height);
    }
  }

  // Render atmospheric particles (leaves, flower petals)
  renderParticles(ctx) {
    for (let p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      if (p.type === 'leaf') {
        ctx.fillStyle = '#6ab04c';
        ctx.fillRect(p.x, p.y, p.size, p.size * 1.5);
      } else {
        ctx.fillStyle = '#f9ca24';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Render lighting overlay depending on time of day
  renderLighting(ctx, playerX, playerY) {
    let darkness = 0;
    let color = 'rgba(10, 15, 35, ';

    // Morning / Noon
    if (this.timeOfDay >= 6 && this.timeOfDay < 17) {
      darkness = 0;
    }
    // Sunset (17h - 19h)
    else if (this.timeOfDay >= 17 && this.timeOfDay < 19) {
      const prog = (this.timeOfDay - 17) / 2;
      ctx.fillStyle = `rgba(235, 94, 40, ${prog * 0.25})`;
      ctx.fillRect(0, 0, this.width, this.height);
      darkness = prog * 0.35;
    }
    // Night (19h - 5h)
    else if (this.timeOfDay >= 19 || this.timeOfDay < 5) {
      darkness = 0.65;
    }
    // Dawn (5h - 6h)
    else if (this.timeOfDay >= 5 && this.timeOfDay < 6) {
      const prog = (6 - this.timeOfDay);
      darkness = prog * 0.5;
    }

    if (darkness <= 0.05) return;

    // Dark lighting mask with light cutouts
    ctx.save();
    ctx.fillStyle = `${color}${darkness})`;

    // Create an offscreen lighting buffer or composite destination-out
    ctx.fillRect(0, 0, this.width, this.height);

    // Light sources (Player lantern + Street lamps)
    ctx.globalCompositeOperation = 'destination-out';

    // Player personal lantern
    const playerGlow = ctx.createRadialGradient(playerX, playerY, 5, playerX, playerY, 65);
    playerGlow.addColorStop(0, 'rgba(0,0,0,1)');
    playerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = playerGlow;
    ctx.beginPath();
    ctx.arc(playerX, playerY, 65, 0, Math.PI * 2);
    ctx.fill();

    // Village street lamps & church windows
    for (let lamp of this.lampLights) {
      const lampGlow = ctx.createRadialGradient(lamp.x, lamp.y, 4, lamp.x, lamp.y, lamp.radius);
      lampGlow.addColorStop(0, 'rgba(0,0,0,1)');
      lampGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lampGlow;
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, lamp.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  getFormattedTime() {
    const hours = Math.floor(this.timeOfDay);
    const minutes = Math.floor((this.timeOfDay - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const strH = String(displayHours).padStart(2, '0');
    const strM = String(minutes).padStart(2, '0');
    return `${strH}:${strM} ${period}`;
  }
}

const MapInstance = new WorldMap();
