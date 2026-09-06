// A two-part cursor: a hard dot that tracks exactly, and a ring that lags behind
// it. The lag is the same idea as the camera lag - it makes the pointer feel
// like part of the scene rather than part of the OS.

export class Cursor {
  constructor(root) {
    this.root = root;
    this.dot = root.querySelector('[data-cursor-dot]');
    this.ring = root.querySelector('[data-cursor-ring]');
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2;
    this.rx = this.x;
    this.ry = this.y;
    this.scale = 1;
    this.targetScale = 1;
    this.enabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (!this.enabled) {
      root.setAttribute('hidden', '');
      return;
    }

    document.documentElement.classList.add('has-custom-cursor');

    window.addEventListener('pointermove', (event) => {
      this.x = event.clientX;
      this.y = event.clientY;
      root.classList.add('is-visible');
    }, { passive: true });

    window.addEventListener('pointerdown', () => { this.targetScale = 0.62; }, { passive: true });
    window.addEventListener('pointerup', () => { this.targetScale = 1; }, { passive: true });
    document.addEventListener('pointerleave', () => root.classList.remove('is-visible'));

    document.addEventListener('pointerover', (event) => {
      const interactive = event.target.closest('a, button, [data-cursor-hover]');
      root.classList.toggle('is-hovering', !!interactive);
      this.targetScale = interactive ? 1.8 : 1;
    });

    requestAnimationFrame(this._tick.bind(this));
  }

  _tick() {
    this.rx += (this.x - this.rx) * 0.16;
    this.ry += (this.y - this.ry) * 0.16;
    this.scale += (this.targetScale - this.scale) * 0.18;

    if (this.dot) this.dot.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    if (this.ring) {
      this.ring.style.transform =
        `translate3d(${this.rx}px, ${this.ry}px, 0) scale(${this.scale.toFixed(3)})`;
    }
    requestAnimationFrame(this._tick.bind(this));
  }
}
