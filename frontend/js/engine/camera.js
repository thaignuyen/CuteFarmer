// Camera system with smooth lerp and boundary clamping
class Camera {
  constructor(canvasWidth, canvasHeight, worldWidth, worldHeight) {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.zoom = 1.75; // Default crisp pixel scale
    this.lerpSpeed = 0.1;
  }

  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  update() {
    // Center viewport on target
    const halfViewW = (this.canvasWidth / this.zoom) / 2;
    const halfViewH = (this.canvasHeight / this.zoom) / 2;

    let desiredX = this.targetX - halfViewW;
    let desiredY = this.targetY - halfViewH;

    // Clamp camera within map bounds
    const maxCamX = Math.max(0, this.worldWidth - (this.canvasWidth / this.zoom));
    const maxCamY = Math.max(0, this.worldHeight - (this.canvasHeight / this.zoom));

    desiredX = Math.max(0, Math.min(desiredX, maxCamX));
    desiredY = Math.max(0, Math.min(desiredY, maxCamY));

    // Smooth lerp
    this.x += (desiredX - this.x) * this.lerpSpeed;
    this.y += (desiredY - this.y) * this.lerpSpeed;
  }

  apply(ctx) {
    ctx.save();
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-Math.floor(this.x), -Math.floor(this.y));
  }

  restore(ctx) {
    ctx.restore();
  }

  screenToWorldX(screenX) {
    return (screenX / this.zoom) + this.x;
  }

  screenToWorldY(screenY) {
    return (screenY / this.zoom) + this.y;
  }
}
