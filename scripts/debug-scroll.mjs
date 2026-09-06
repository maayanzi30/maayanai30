import { chromium } from 'playwright';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/', { waitUntil: 'load' });
await page.waitForSelector('.preloader.is-ready', { timeout: 120000 });
await page.click('[data-preloader-enter]');
await page.waitForTimeout(1500);

for (const i of [0, 1, 4, 5, 8]) {
  const requested = await page.evaluate((idx) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const top = (idx / 8) * max;
    window.scrollTo(0, top);
    return { max, top: Math.round(top) };
  }, i);
  await page.waitForTimeout(1800);
  const r = await page.evaluate(() => ({
    scrollY: Math.round(window.scrollY),
    scrollHeight: document.documentElement.scrollHeight,
    bodyScrollTop: Math.round(document.body.scrollTop),
    innerH: window.innerHeight,
    smoothT: +window.__scene.director.smoothT.toFixed(3),
    targetT: +window.__scene.director.targetT.toFixed(3),
  }));
  console.log(`i=${i} requested=${JSON.stringify(requested)} actual=${JSON.stringify(r)}`);
}
await browser.close();
