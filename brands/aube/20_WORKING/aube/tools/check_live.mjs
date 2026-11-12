import { chromium } from 'playwright-core';
const url = process.argv[2];
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('response', (r) => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
for (const id of ['accueil', 'marque', 'logo', 'couleurs', 'typographie', 'elements', 'interface', 'mouvement', 'situation', 'ressources']) {
  await p.goto(url + '#' + id, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const pg = document.querySelector('.page.on'); return pg.id + ' images ' + pg.querySelectorAll('img').length + ' cassées ' + [...pg.querySelectorAll('img')].filter((i) => i.complete && !i.naturalWidth).length + ' vidéos ' + [...pg.querySelectorAll('video')].map((v) => v.readyState).join(''); });
  console.log(r);
}
await p.goto(url + '#accueil', { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
await p.screenshot({ path: 'out/guide/_live.png' });
console.log('police', await p.evaluate(() => document.fonts.check('300 20px Outfit')), '| erreurs', errs.length ? errs : 'aucune');
await b.close();
