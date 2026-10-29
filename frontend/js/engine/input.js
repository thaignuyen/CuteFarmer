// Input Controller
class InputController {
  constructor() {
    this.keys = {};
    this.keysJustPressed = {};
    this.mouse = {
      x: 0,
      y: 0,
      worldX: 0,
      worldY: 0,
      isDown: false,
      clicked: false
    };
    this.canvas = null;
    this.camera = null;

    this._setupListeners();
  }

  attach(canvas, camera) {
    this.canvas = canvas;
    this.camera = camera;
  }

  _setupListeners() {
    window.addEventListener('keydown', (e) => {
      // Don't capture when typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (!this.keys[e.code]) {
        this.keysJustPressed[e.code] = true;
      }
      this.keys[e.code] = true;

      // Prevent page scrolling on Space / Arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.keysJustPressed[e.code] = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;

      if (this.camera) {
        this.mouse.worldX = this.camera.screenToWorldX(this.mouse.x);
        this.mouse.worldY = this.camera.screenToWorldY(this.mouse.y);
      }
    });

    window.addEventListener('mousedown', (e) => {
      // If clicking inside a modal or HUD, don't trigger game canvas click
      if (e.target.closest('.modal-overlay') || e.target.closest('#player-hud') || 
          e.target.closest('#top-right-hud') || e.target.closest('#hotbar-container')) {
        return;
      }
      this.mouse.isDown = true;
      this.mouse.clicked = true;
    });

    window.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    });
  }

  // Returns movement vector [-1, 0, 1]
  getMovement() {
    let dx = 0;
    let dy = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

    // Normalize diagonal
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    return { dx, dy };
  }

  isJustPressed(code) {
    const val = !!this.keysJustPressed[code];
    return val;
  }

  // Reset just-pressed flags after each frame update
  endFrame() {
    this.keysJustPressed = {};
    this.mouse.clicked = false;
  }
}

const Input = new InputController();
