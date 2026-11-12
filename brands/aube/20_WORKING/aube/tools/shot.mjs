// Rend une page HTML en PNG.  node tools/shot.mjs <page.html> <sortie.png> [--w 1400] [--h 800] [--scale 2] [--t 0] [--full] [--transparent]
// --h omis ou --full : hauteur = celle de l'élément .plate (ou du body). --t : appelle window.seek(t) avant la capture.
import { chromium } from 'playwright-core';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const [page_, out] = args;
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const flag = (k) => args.includes('--' + k);
const w = +opt('w', 1400), scale = +opt('scale', 2), t = opt('t', null);
let h = opt('h', null);

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
const page = await browser.newPage({ viewport: { width: w, height: h ? +h : 900 }, deviceScaleFactor: scale });
page.on('pageerror', (e) => console.error('ERREUR PAGE', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
await page.goto(pathToFileURL(path.resolve(page_)).href);
await page.evaluate(() => document.fonts.ready);
if (t !== null) await page.evaluate((t) => window.seek && window.seek(t), +t);
if (!h) {
  h = await page.evaluate(() => Math.ceil((document.querySelector('.plate') || document.body).getBoundingClientRect().height));
  await page.setViewportSize({ width: w, height: +h });
}
await page.waitForTimeout(150);
await page.screenshot({ path: out, omitBackground: flag('transparent'), clip: { x: 0, y: 0, width: w, height: +h } });
await browser.close();
console.log(out, w * scale + 'x' + h * scale);
