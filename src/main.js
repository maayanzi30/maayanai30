import { createContext } from './core/gl.js';
import { generateBridalSplats } from './splats/generate.js';
import { loadSplatFile } from './splats/loader.js';
import { SplatRenderer } from './splats/renderer.js';
import { Composer } from './post/composer.js';
import { Director } from './scene/director.js';
import { CHAPTERS, SITE } from './scene/chapters.js';
import { SequenceLayer } from './media/sequence.js';
import { Preloader } from './ui/preloader.js';
import { Cursor } from './ui/cursor.js';
import { Interface } from './ui/nav.js';
import { Palette } from './ui/palette.js';
import { clamp } from './core/math.js';

const html = document.documentElement;
const canvas = document.querySelector('[data-canvas]');
const preloader = new Preloader(document.querySelector('[data-preloader]'));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- quality tiers ---------------------------------------------------------------

function pickQuality() {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;

  if (coarse || small || cores <= 4 || memory <= 3) {
    return { splats: 60000, maxDpr: 1.25, label: 'mobile' };
  }
  if (cores <= 8 || memory <= 6) {
    return { splats: 120000, maxDpr: 1.5, label: 'balanced' };
  }
  return { splats: 175000, maxDpr: 1.75, label: 'high' };
}

// --- boot --------------------------------------------------------------------------

async function boot() {
  const context = createContext(canvas);
  if (!context) {
    html.classList.add('no-webgl');
    preloader.fail('הדפדפן הזה לא תומך ב־WebGL2 — התוכן זמין כטקסט למטה.');
    document.querySelector('[data-preloader-enter]')?.removeAttribute('hidden');
    setupFallbackScroll();
    return;
  }

  const { gl, caps } = context;
  const quality = pickQuality();

  // 1. the object -----------------------------------------------------------------
  preloader.setLabel('בונים את האובייקט');
  let data;
  if (SITE.splatUrl) {
    try {
      data = await loadSplatFile(SITE.splatUrl, (p) => preloader.setProgress(p * 0.55));
    } catch (error) {
      console.warn('[splats] capture failed to load, falling back to the generator:', error);
    }
  }
  if (!data) {
    data = await generateBridalSplats({
      count: quality.splats,
      onProgress: (p) => preloader.setProgress(p * 0.55),
    });
  }
  preloader.setProgress(0.58);

  // 2. the footage layer ----------------------------------------------------------
  preloader.setLabel('טוענים את הרצף');
  const sequence = new SequenceLayer(gl);
  if (SITE.videoUrl) {
    await sequence.loadVideo(SITE.videoUrl);
    preloader.setProgress(0.9);
  } else {
    await sequence.loadSequence('assets/sequence/manifest.json',
      (p) => preloader.setProgress(0.58 + p * 0.34));
  }
  preloader.setProgress(0.94);

  // 3. the pipeline ---------------------------------------------------------------
  preloader.setLabel('מכינים את המצלמה');
  const renderer = new SplatRenderer(gl, data);
  const composer = new Composer(gl, caps);
  const director = new Director(CHAPTERS, { reducedMotion });

  const ui = new Interface({
    chapters: CHAPTERS,
    onSeek: (index) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: (index / (CHAPTERS.length - 1)) * max,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    },
  });

  const palette = new Palette(document.querySelector('[data-palette]'), renderer);
  new Cursor(document.querySelector('[data-cursor]'));

  preloader.setProgress(1);
  preloader.setLabel('מוכן');

  // --- viewport ------------------------------------------------------------------
  let renderScale = 1;
  let viewWidth = 1;
  let viewHeight = 1;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, quality.maxDpr) * renderScale;
    viewWidth = Math.max(2, Math.round(window.innerWidth * dpr));
    viewHeight = Math.max(2, Math.round(window.innerHeight * dpr));
    canvas.width = viewWidth;
    canvas.height = viewHeight;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    composer.resize(viewWidth, viewHeight);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('orientationchange', resize, { passive: true });

  // --- input ---------------------------------------------------------------------
  let scrollProgress = 0;
  const readScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
  };
  readScroll();
  window.addEventListener('scroll', readScroll, { passive: true });

  window.addEventListener('pointermove', (event) => {
    director.setPointer(
      (event.clientX / window.innerWidth) * 2 - 1,
      (event.clientY / window.innerHeight) * 2 - 1
    );
  }, { passive: true });

  // Touch: dragging across the object steers the key light too.
  window.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    director.setPointer(
      (touch.clientX / window.innerWidth) * 2 - 1,
      (touch.clientY / window.innerHeight) * 2 - 1
    );
  }, { passive: true });

  await preloader.waitForEnter();
  html.classList.add('is-live');

  // --- loop ------------------------------------------------------------------------
  let last = performance.now();
  let elapsed = 0;
  let frameAccumulator = 0;
  let frameCount = 0;

  const paletteIndex = CHAPTERS.findIndex((c) => c.interactive === 'palette');

  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 1 / 10);
    last = now;
    elapsed += dt;

    director.setProgress(scrollProgress);
    const state = director.update(dt, elapsed);
    director.updateProjection(viewWidth, viewHeight);

    for (let g = 0; g < 6; g++) renderer.setGroupOpacity(g, state.groups[g]);
    if (paletteIndex >= 0) palette.setWeight(state.chapterWeights[paletteIndex]);
    palette.update();

    // The footage drifts on its own and is scrubbed by the scroll on top of that.
    sequence.setPhase(((director.smoothT * 0.55 + elapsed * 0.03) % 1 + 1) % 1);

    renderer.requestSort(state.view);

    composer.bindScene();
    renderer.drawBackdrop(composer.quad, {
      top: state.backdrop.top,
      bottom: state.backdrop.bottom,
      glowColor: state.backdrop.glowColor,
      glowPos: state.backdrop.glowPos,
      glowStrength: state.backdrop.glowStrength,
    }, elapsed, viewWidth / viewHeight);
    renderer.draw(state);

    composer.render(state.grade, sequence.texture, sequence.aspect, elapsed);

    ui.update(state, director.smoothT);

    // --- adaptive resolution -------------------------------------------------------
    frameAccumulator += dt;
    frameCount++;
    if (frameCount >= 60) {
      const average = frameAccumulator / frameCount;
      if (average > 0.024 && renderScale > 0.62) {
        renderScale = Math.max(0.62, renderScale - 0.12);
        resize();
      } else if (average < 0.0135 && renderScale < 1) {
        renderScale = Math.min(1, renderScale + 0.08);
        resize();
      }
      frameAccumulator = 0;
      frameCount = 0;
    }

    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);

  // Expose a small handle for tuning from the console.
  window.__scene = { director, renderer, composer, sequence, palette, quality };
}

// --- no-WebGL fallback ------------------------------------------------------------

function setupFallbackScroll() {
  document.querySelectorAll('[data-chapter]').forEach((section) => {
    section.style.opacity = '1';
    section.style.transform = 'none';
    section.style.pointerEvents = 'auto';
    section.setAttribute('aria-hidden', 'false');
  });
}

boot().catch((error) => {
  console.error(error);
  html.classList.add('no-webgl');
  preloader.fail('משהו נתקע בטעינה — התוכן זמין כטקסט למטה.');
  setupFallbackScroll();
});
