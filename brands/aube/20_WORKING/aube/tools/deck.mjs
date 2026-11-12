// Rend chaque page du guide en PNG 2560 × 1440.  node tools/deck.mjs
import { chromium } from 'playwright-core';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
p.on('pageerror', (e) => console.error('ERREUR', e.message));
await p.goto(pathToFileURL(path.resolve('deck/render.html')).href); await p.evaluate(() => document.fonts.ready);
const order = await p.evaluate(() => window.GuideOrder);
for (let i = 0; i < order.length; i++) {
  await p.evaluate((k) => window.show(k), order[i]); await p.waitForTimeout(120);
  const over = await p.evaluate(() => { const r = document.getElementById('in'); return [...r.querySelectorAll('p,div,span')].filter((e) => e.children.length === 0 && e.textContent.trim() && (e.getBoundingClientRect().right > 1281 || e.getBoundingClientRect().bottom > 721)).map((e) => e.textContent.trim().slice(0, 30)); });
  if (over.length) console.log('déborde', order[i], over);
  await p.screenshot({ path: `out/deck/${String(i + 1).padStart(2, '0')}-${order[i]}.png`, clip: { x: 0, y: 0, width: 1280, height: 720 } });
}
console.log('pages', order.length); await b.close();
