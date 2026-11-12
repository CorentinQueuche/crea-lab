// Rend chaque page de la fiche de marque (deck/pages.js) en PNG 3840 × 2160 (1920 × 1080 en ×2) dans out/deck/.
// node tools/deck.mjs [--page <clé ou numéro>]
//   --page : ne rend qu'une page (sa clé dans GuideOrder ou son numéro), pour corriger vite.
// Attend window.pret après chaque page (les canvas du remplisseur, brand/verse.js).
// Signale les textes qui sortent de la page (un élément coupé exprès porte data-coupe, sur lui ou un parent) et les
// images qui ne se chargent pas.
// Sans --page, les anciennes pages de out/deck sont retirées d'abord : une page supprimée ou renommée ne reste pas
// dans le PDF (deck_pdf.py prend tout out/deck/NN-*.png).
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const W = 1920, H = 1080;
const args = process.argv.slice(2);
const only = args.includes('--page') ? args[args.indexOf('--page') + 1] : null;
fs.mkdirSync('out/deck', { recursive: true });
if (!only) for (const f of fs.readdirSync('out/deck')) if (/^\d+-.*\.png$/.test(f)) fs.rmSync(path.join('out/deck', f));
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
p.on('pageerror', (e) => console.error('ERREUR', e.message));
await p.goto(pathToFileURL(path.resolve('deck/render.html')).href); await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => window.pret);
const order = await p.evaluate(() => window.GuideOrder);
let n = 0;
for (let i = 0; i < order.length; i++) {
  if (only && only !== order[i] && +only !== i + 1) continue;
  await p.evaluate((k) => window.show(k), order[i]);
  await p.evaluate(() => window.pret);
  await p.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => {}))));
  await p.waitForTimeout(150);
  const pb = await p.evaluate(([w, h]) => {
    const r = document.getElementById('in');
    const hors = [...r.querySelectorAll('p,div,span,td,li,b')].filter((e) => e.children.length === 0 && e.textContent.trim() && !e.closest('[data-coupe]') && (e.getBoundingClientRect().right > w + 1 || e.getBoundingClientRect().bottom > h + 1)).map((e) => e.textContent.trim().slice(0, 30));
    const casse = [...r.querySelectorAll('img')].filter((im) => !im.naturalWidth).map((im) => im.getAttribute('src'));
    return { hors, casse };
  }, [W, H]);
  if (pb.hors.length) console.log('déborde', order[i], pb.hors);
  if (pb.casse.length) console.log('image introuvable', order[i], pb.casse);
  await p.screenshot({ path: `out/deck/${String(i + 1).padStart(2, '0')}-${order[i]}.png`, clip: { x: 0, y: 0, width: W, height: H } });
  n++;
}
console.log('pages rendues', n, 'sur', order.length);
await b.close();
