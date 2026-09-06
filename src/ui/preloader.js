export class Preloader {
  constructor(root) {
    this.root = root;
    this.bar = root.querySelector('[data-preloader-bar]');
    this.value = root.querySelector('[data-preloader-value]');
    this.label = root.querySelector('[data-preloader-label]');
    this.enter = root.querySelector('[data-preloader-enter]');
    this.shown = 0;
    this.target = 0;
    this._raf = null;
    this._tick = this._tick.bind(this);
    this._raf = requestAnimationFrame(this._tick);
  }

  setLabel(text) {
    if (this.label) this.label.textContent = text;
  }

  /** @param {number} value 0..1 */
  setProgress(value) {
    this.target = Math.max(this.target, Math.min(1, value));
  }

  _tick() {
    // Ease toward the real figure so the counter never jumps or stalls visibly.
    this.shown += (this.target - this.shown) * 0.12;
    const percent = Math.round(this.shown * 100);
    if (this.bar) this.bar.style.transform = `scaleX(${this.shown.toFixed(4)})`;
    if (this.value) this.value.textContent = String(percent).padStart(3, '0');
    this._raf = requestAnimationFrame(this._tick);
  }

  /** Resolves once the visitor has chosen to enter. */
  waitForEnter() {
    return new Promise((resolve) => {
      this.setProgress(1);
      this.root.classList.add('is-ready');
      const go = () => {
        this.root.classList.add('is-leaving');
        setTimeout(() => {
          this.root.setAttribute('hidden', '');
          cancelAnimationFrame(this._raf);
          resolve();
        }, 900);
      };
      if (this.enter) {
        this.enter.addEventListener('click', go, { once: true });
        this.enter.focus({ preventScroll: true });
      } else {
        setTimeout(go, 400);
      }
    });
  }

  /**
   * Something went wrong (no WebGL2, or a load failure). Show why, and give the
   * visitor a way past this overlay - otherwise the fallback document sits
   * underneath a full-screen panel nobody can dismiss.
   */
  fail(message) {
    cancelAnimationFrame(this._raf);
    this.root.classList.add('is-failed', 'is-ready');
    this.setLabel(message);

    if (!this.enter) {
      this.root.setAttribute('hidden', '');
      return;
    }
    const label = this.enter.querySelector('span') || this.enter;
    label.textContent = 'המשך לתוכן';
    this.enter.addEventListener('click', () => {
      this.root.classList.add('is-leaving');
      setTimeout(() => this.root.setAttribute('hidden', ''), 900);
    }, { once: true });
  }
}
