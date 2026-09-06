import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = '/tmp/claude-0/-home-user-maayanai30/46f51010-fa52-579d-9836-defab32db327/scratchpad/debug';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto('http://localhost:5173/', { waitUntil: 'load' });
await page.waitForSelector('.preloader.is-ready', { timeout: 120000 });
await page.click('[data-preloader-enter]');
await page.waitForTimeout(2000);

// does scroll actually drive the director?
for (const i of [0, 1, 4, 8]) {
  await page.evaluate((idx) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, (idx / 8) * max);
  }, i);
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => ({
    scrollY: Math.round(window.scrollY),
    smoothT: +window.__scene.director.smoothT.toFixed(3),
    targetT: +window.__scene.director.targetT.toFixed(3),
    eye: [...window.__scene.director.state.eye].map((v) => +v.toFixed(2)),
    fov: +window.__scene.director.state.fov.toFixed(1),
    dissolve: +window.__scene.director.state.dissolve.toFixed(3),
  }));
  console.log(`scroll ${i}:`, JSON.stringify(r));
}

// Neutral reference shot: park the camera far away with no dissolve/DOF/grade
// tricks so the object's actual silhouette is visible.
await page.evaluate(() => {
  const s = window.__scene;
  s.director.update = function () { return this.state; };   // freeze
  const st = s.director.state;
  st.eye.set([2.6, 1.9, 5.4]);
  st.target.set([0, 1.35, 0]);
  st.fov = 34;
  st.dissolve = 0;
  st.breathe = 0;
  st.dofStrength = 0.4;
  st.dofMax = 2;
  st.focusDist = 6.2;
  st.groups.fill(1);
  Object.assign(st.grade, {
    exposure: 1.15, contrast: 1.0, saturation: 1.0, vignette: 0.3, grain: 0.0,
    bloomStrength: 0.3, bloomThreshold: 0.9, aberration: 0.0, bleed: 0,
    letterbox: 0, flash: 0, fade: 0, sequenceOpacity: 0, sequenceScale: 1,
  });
  st.grade.lift.set([0, 0, 0]);
  st.grade.gain.set([1, 1, 1]);
  st.lightDir.set([0.55, 0.5, 0.67]);
});
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/neutral-3q.png` });

await page.evaluate(() => {
  const st = window.__scene.director.state;
  st.eye.set([0, 1.5, 5.0]);
  st.target.set([0, 1.35, 0]);
});
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/neutral-front.png` });

await page.evaluate(() => {
  const st = window.__scene.director.state;
  st.eye.set([0, 1.62, 2.2]);
  st.target.set([0, 1.5, 0]);
  st.focusDist = 2.2;
});
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/neutral-close.png` });

await browser.close();
