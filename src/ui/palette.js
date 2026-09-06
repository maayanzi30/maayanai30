// The shade picker. Choosing a colour repaints the lip and lid splats in the
// live render - the swatches are not a preview of the object, they are wired
// straight into the group tints the vertex shader reads.

import { SHADES, hexToRgb } from '../scene/chapters.js';
import { GROUP } from '../splats/generate.js';

const DEFAULTS = { lips: 1, eyes: 0 };

export class Palette {
  constructor(root, renderer) {
    this.root = root;
    this.renderer = renderer;
    this.selection = { lips: DEFAULTS.lips, eyes: DEFAULTS.eyes };
    this.amount = { lips: 0, eyes: 0 };
    this.targetAmount = { lips: 0, eyes: 0 };
    this.visible = false;
    this.groups = { lips: GROUP.LIPS, eyes: GROUP.EYES };

    if (!this.root) return;
    this._build('lips', 'שפתיים');
    this._build('eyes', 'עפעפיים');
    this._apply('lips');
    this._apply('eyes');
  }

  _build(kind, title) {
    const shades = SHADES[kind];
    const row = document.createElement('div');
    row.className = 'palette__row';

    const heading = document.createElement('span');
    heading.className = 'palette__title';
    heading.textContent = title;
    row.appendChild(heading);

    const swatches = document.createElement('div');
    swatches.className = 'palette__swatches';
    swatches.setAttribute('role', 'radiogroup');
    swatches.setAttribute('aria-label', `גוון ${title}`);

    shades.forEach((shade, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'palette__swatch';
      button.style.setProperty('--shade', shade.hex);
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', index === this.selection[kind] ? 'true' : 'false');
      button.setAttribute('aria-label', shade.name);
      button.innerHTML = `<span class="palette__chip"></span><span class="palette__name">${shade.name}</span>`;
      button.addEventListener('click', () => this.select(kind, index));
      swatches.appendChild(button);
    });

    row.appendChild(swatches);
    this.root.appendChild(row);
    this[`${kind}Buttons`] = Array.from(swatches.children);
  }

  select(kind, index) {
    this.selection[kind] = index;
    this[`${kind}Buttons`].forEach((button, i) => {
      button.classList.toggle('is-active', i === index);
      button.setAttribute('aria-checked', i === index ? 'true' : 'false');
    });
    this._apply(kind);
  }

  _apply(kind) {
    const shade = SHADES[kind][this.selection[kind]];
    const [r, g, b] = hexToRgb(shade.hex);
    this._rgb = this._rgb || {};
    this._rgb[kind] = [r, g, b];
    this.renderer.setGroupTint(this.groups[kind], r, g, b, this.amount[kind]);
    this[`${kind}Buttons`].forEach((button, i) => {
      button.classList.toggle('is-active', i === this.selection[kind]);
      void i;
    });
  }

  /** @param {number} weight how present the palette chapter is, 0..1 */
  setWeight(weight) {
    if (!this.root) return;
    const show = weight > 0.35;
    if (show !== this.visible) {
      this.visible = show;
      this.root.classList.toggle('is-visible', show);
      this.root.setAttribute('aria-hidden', show ? 'false' : 'true');
    }
    // The shade fades onto the face with the chapter rather than snapping on.
    this.targetAmount.lips = Math.min(1, weight * 1.25) * 0.92;
    this.targetAmount.eyes = Math.min(1, weight * 1.25) * 0.85;
  }

  update() {
    if (!this.root) return;
    let changed = false;
    for (const kind of ['lips', 'eyes']) {
      const next = this.amount[kind] + (this.targetAmount[kind] - this.amount[kind]) * 0.08;
      if (Math.abs(next - this.amount[kind]) > 1e-4) {
        this.amount[kind] = next;
        changed = true;
      }
    }
    if (!changed) return;
    for (const kind of ['lips', 'eyes']) {
      const rgb = this._rgb[kind];
      this.renderer.setGroupTint(this.groups[kind], rgb[0], rgb[1], rgb[2], this.amount[kind]);
    }
  }
}
