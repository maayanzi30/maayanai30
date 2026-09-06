// Dev-only: drives the site in a real browser, captures shots at every chapter,
// and reports console errors + WebGL state. Not part of the site.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = process.argv[2] || '/tmp/claude-0/-home-user-maayanai30/46f51010-fa52-579d-9836-defab32db327/scratchpad/shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: [
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist', '--enable-gpu-rasterization',
  ],
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

await page.goto('http://localhost:5173/', { waitUntil: 'load' });

// wait for the preloader to offer entry
await page.waitForSelector('.preloader.is-ready', { timeout: 120000 });
await page.screenshot({ path: `${OUT}/00-preloader.png` });
await page.click('[data-preloader-enter]');
await page.waitForTimeout(2500);

const info = await page.evaluate(() => {
  const canvas = document.querySelector('[data-canvas]');
  const gl = canvas.getContext('webgl2');
  return {
    hasScene: !!window.__scene,
    splats: window.__scene?.renderer?.count ?? null,
    quality: window.__scene?.quality ?? null,
    sequenceMode: window.__scene?.sequence?.mode ?? null,
    sequenceFrames: window.__scene?.sequence?.frameCount ?? null,
    renderer: gl ? gl.getParameter(gl.RENDERER) : null,
    canvasSize: [canvas.width, canvas.height],
    scrollHeight: document.documentElement.scrollHeight,
  };
});
console.log('scene:', JSON.stringify(info, null, 2));

const chapters = await page.evaluate(() => document.querySelectorAll('[data-chapter]').length);
for (let i = 0; i < chapters; i++) {
  await page.evaluate((idx) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const total = document.querySelectorAll('[data-chapter]').length - 1;
    window.scrollTo({ top: (idx / total) * max, behavior: 'instant' });
  }, i);
  // SwiftShader runs at a couple of fps, so the damped camera would still be
  // catching up. Snap it to the target for a deterministic shot.
  await page.waitForTimeout(700);
  await page.evaluate(() => { window.__scene.director.smoothT = window.__scene.director.targetT; });
  await page.waitForTimeout(1400);
  const id = await page.evaluate((idx) => document.querySelectorAll('[data-chapter]')[idx].id, i);
  await page.screenshot({ path: `${OUT}/${String(i + 1).padStart(2, '0')}-${id}.png` });
}

// mobile pass
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await mobile.goto('http://localhost:5173/', { waitUntil: 'load' });
await mobile.waitForSelector('.preloader.is-ready', { timeout: 120000 });
await mobile.click('[data-preloader-enter]');
await mobile.waitForTimeout(2500);
await mobile.screenshot({ path: `${OUT}/m1-overture.png` });
await mobile.evaluate(() => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: (5 / 8) * max, behavior: 'instant' });
});
await mobile.waitForTimeout(700);
await mobile.evaluate(() => { window.__scene.director.smoothT = window.__scene.director.targetT; });
await mobile.waitForTimeout(1400);
await mobile.screenshot({ path: `${OUT}/m2-palette.png` });

console.log('\nconsole issues:', errors.length ? '\n  ' + [...new Set(errors)].join('\n  ') : 'none');
await browser.close();
