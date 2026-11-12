import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const [page_, outDir, wArg] = process.argv.slice(2);
const W = +(wArg || 1440);
fs.mkdirSync(outDir, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: W < 600 ? 1 : 0.5 });
const errs = [];
p.on('pageerror', (e) => errs.push('PAGE ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
p.on('requestfailed', (r) => errs.push('REQ ' + r.url().split('/').slice(-2).join('/')));
const url = pathToFileURL(path.resolve(page_)).href;
await p.goto(url); await p.evaluate(() => document.fonts.ready);
const ids = await p.evaluate(() => [...document.querySelectorAll('.page')].map((x) => x.id));
for (const id of ids) {
  await p.goto(url + '#' + id); await p.waitForTimeout(250);
  await p.evaluate(async () => { document.querySelectorAll('img').forEach((i) => (i.loading = 'eager')); await Promise.all([...document.images].filter((i) => i.offsetParent).map((i) => i.decode().catch(() => {}))); });
  await p.waitForTimeout(700);
  const info = await p.evaluate(() => { const pg = document.querySelector('.page.on'); return { h: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, broken: [...pg.querySelectorAll('img')].filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src')) }; });
  console.log(id, JSON.stringify(info));
  await p.screenshot({ path: path.join(outDir, `${W}-${id}.jpg`), fullPage: true, type: 'jpeg', quality: 78 });
}
console.log('ERREURS', errs.length ? errs : 'aucune');
await b.close();
