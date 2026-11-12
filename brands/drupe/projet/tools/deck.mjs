// Rend chaque page du guide (deck/pages.js) en PNG 2560 × 1440 dans out/deck/.
// node tools/deck.mjs [--page <clé ou numéro>]
//   --page : ne rend qu'une page (sa clé dans GuideOrder ou son numéro), pour corriger vite.
// Signale les textes qui sortent de la page. Un élément coupé exprès (grand chiffre d'intercalaire) porte l'attribut
// data-coupe, sur lui ou sur un parent, pour ne pas être signalé.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const only = args.includes('--page') ? args[args.indexOf('--page') + 1] : null;
fs.mkdirSync('out/deck', { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
p.on('pageerror', (e) => console.error('ERREUR', e.message));
await p.goto(pathToFileURL(path.resolve('deck/render.html')).href); await p.evaluate(() => document.fonts.ready);
const order = await p.evaluate(() => window.GuideOrder);
let n = 0;
for (let i = 0; i < order.length; i++) {
  if (only && only !== order[i] && +only !== i + 1) continue;
  await p.evaluate((k) => window.show(k), order[i]);
  await p.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => {}))));
  await p.waitForTimeout(120);
  const pb = await p.evaluate(() => {
    const r = document.getElementById('in');
    const hors = [...r.querySelectorAll('p,div,span,td,li')].filter((e) => e.children.length === 0 && e.textContent.trim() && !e.closest('[data-coupe]') && (e.getBoundingClientRect().right > 1281 || e.getBoundingClientRect().bottom > 721)).map((e) => e.textContent.trim().slice(0, 30));
    const casse = [...r.querySelectorAll('img')].filter((im) => !im.naturalWidth).map((im) => im.getAttribute('src'));
    return { hors, casse };
  });
  if (pb.hors.length) console.log('déborde', order[i], pb.hors);
  if (pb.casse.length) console.log('image introuvable', order[i], pb.casse);
  await p.screenshot({ path: `out/deck/${String(i + 1).padStart(2, '0')}-${order[i]}.png`, clip: { x: 0, y: 0, width: 1280, height: 720 } });
  n++;
}
console.log('pages rendues', n, 'sur', order.length);
await b.close();
