// Dev-only: verifies the reduced-motion path and the no-WebGL document fallback.
import { chromium } from 'playwright';
const OUT = '/tmp/claude-0/-home-user-maayanai30/46f51010-fa52-579d-9836-defab32db327/scratchpad/debug';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

// --- 1. reduced motion ------------------------------------------------------------
const reduced = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
reduced.setDefaultNavigationTimeout(120000);
await reduced.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
await reduced.waitForSelector('.preloader.is-ready', { timeout: 120000 });
await reduced.click('[data-preloader-enter]');
await reduced.waitForTimeout(2000);
console.log('reduced-motion:', JSON.stringify(await reduced.evaluate(() => ({
  directorReduced: window.__scene.director.reducedMotion,
  transition: +window.__scene.director.state.transition.toFixed(3),
  letterbox: +window.__scene.director.state.grade.letterbox.toFixed(3),
}))));
await reduced.close();

// --- 2. no WebGL2 -----------------------------------------------------------------
const blind = await browser.newPage({ viewport: { width: 1280, height: 900 } });
blind.setDefaultNavigationTimeout(120000);
await blind.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    if (type === 'webgl2') return null;
    return original.call(this, type, ...rest);
  };
});
await blind.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
await blind.waitForTimeout(2500);
console.log('no-webgl:', JSON.stringify(await blind.evaluate(() => {
  const sections = [...document.querySelectorAll('[data-chapter]')];
  return {
    htmlClass: document.documentElement.className,
    everySectionVisible: sections.every((s) => getComputedStyle(s).opacity === '1'),
    documentScrolls: document.documentElement.scrollHeight > window.innerHeight,
    contactLinkPresent: !!document.querySelector('.contact__value[href^="mailto"]'),
    preloaderMessage: document.querySelector('[data-preloader-label]')?.textContent,
  };
})));
await blind.evaluate(() => window.scrollTo(0, 900));
await blind.waitForTimeout(400);
await blind.screenshot({ path: `${OUT}/no-webgl.png` });
await blind.close();

await browser.close();
