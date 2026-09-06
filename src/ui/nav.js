// Chapter rail, progress meter, and the fade of the copy blocks.
// Everything here is driven by the director's chapter weights, so the text and
// the camera are never out of step.

export class Interface {
  constructor({ chapters, onSeek }) {
    this.chapters = chapters;
    this.onSeek = onSeek;

    this.rail = document.querySelector('[data-nav]');
    this.progress = document.querySelector('[data-progress-bar]');
    this.counter = document.querySelector('[data-progress-counter]');
    this.hint = document.querySelector('[data-scroll-hint]');
    this.sections = Array.from(document.querySelectorAll('[data-chapter]'));
    this.items = [];
    this.activeIndex = -1;
    // Style writes force a recalc, so only touch a section when its weight has
    // actually moved. Most frames only two of the nine change at all.
    this.lastWeights = new Float32Array(this.sections.length).fill(-1);

    this._buildRail();
  }

  _buildRail() {
    if (!this.rail) return;
    const list = document.createElement('ol');
    list.className = 'nav__list';

    this.chapters.forEach((chapter, index) => {
      const item = document.createElement('li');
      item.className = 'nav__item';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nav__link';
      button.innerHTML =
        `<span class="nav__index">${chapter.kicker ?? '00'}</span>` +
        `<span class="nav__label">${chapter.nav}</span>` +
        `<span class="nav__tick" aria-hidden="true"></span>`;
      button.addEventListener('click', () => this.onSeek(index));

      item.appendChild(button);
      list.appendChild(item);
      this.items.push(button);
    });

    this.rail.appendChild(list);
  }

  update(state, smoothT) {
    const weights = state.chapterWeights;

    for (let i = 0; i < this.sections.length; i++) {
      const weight = weights[i] ?? 0;
      if (Math.abs(weight - this.lastWeights[i]) < 0.002) continue;

      const wasVisible = this.lastWeights[i] > 0.25;
      this.lastWeights[i] = weight;
      const section = this.sections[i];

      // Copy rises as its chapter arrives and sinks as the camera leaves it.
      section.style.opacity = weight.toFixed(3);
      section.style.transform = `translate3d(0, ${((1 - weight) * 26).toFixed(2)}px, 0)`;
      section.style.pointerEvents = weight > 0.55 ? 'auto' : 'none';
      section.classList.toggle('is-active', weight > 0.5);
      if (wasVisible !== weight > 0.25) {
        section.setAttribute('aria-hidden', weight > 0.25 ? 'false' : 'true');
      }
    }

    const index = Math.round(smoothT);
    if (index !== this.activeIndex) {
      this.activeIndex = index;
      this.items.forEach((item, i) => {
        item.classList.toggle('is-active', i === index);
        item.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }

    const fraction = smoothT / Math.max(1, this.chapters.length - 1);
    if (this.progress) this.progress.style.transform = `scaleY(${fraction.toFixed(4)})`;
    if (this.counter) {
      this.counter.textContent =
        `${String(index + 1).padStart(2, '0')} / ${String(this.chapters.length).padStart(2, '0')}`;
    }
    if (this.hint) this.hint.style.opacity = (1 - Math.min(1, smoothT * 3)).toFixed(3);
  }
}
