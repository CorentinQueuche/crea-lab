// Rend une page HTML en PNG.  node tools/shot.mjs <page.html> <sortie.png> [--w 1400] [--h 800] [--scale 2] [--t 0] [--transparent] [--crop x,y,l,h] [--sel <sélecteur>]
// --crop : ne rend qu'une zone (en pixels de page), pour vérifier un détail à pleine définition.
// --sel : cadre exactement sur un élément (sa taille fixe celle de l'image : sûr pour un visuel de support à proportion imposée).
// --transparent : fond transparent (la page doit mettre html et body en background: transparent, par-dessus le socle).
// L'adresse peut porter des paramètres : page.html?x=1 ou page.html#ancre.
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
// page.html?x=1 ou page.html#ancre : la suite de l'adresse est transmise à la page (une seule page peut rendre plusieurs visuels)
const pm = page_.match(/^(.*?\.html?)([?#].*)?$/i);
await page.goto(pathToFileURL(path.resolve(pm ? pm[1] : page_)).href + ((pm && pm[2]) || ''));
await page.evaluate(() => document.fonts.ready);
// Une page qui dessine après le chargement (police, image, moteur sur canvas) expose window.pret, une promesse qu'on attend
await page.evaluate(() => (window.pret && window.pret.then ? window.pret.then(() => 1) : 0));
if (t !== null) await page.evaluate((t) => window.seek && window.seek(t), +t);
if (!h) {
  h = await page.evaluate(() => Math.ceil((document.querySelector('.plate') || document.body).getBoundingClientRect().height));
  await page.setViewportSize({ width: w, height: +h });
}
await page.waitForTimeout(150);
const crop = opt('crop', null), sel = opt('sel', null);
let box = null;
if (sel) { box = await page.locator(sel).first().boundingBox(); if (!box) { console.error('élément introuvable :', sel); process.exit(1); }
  await page.setViewportSize({ width: Math.max(w, Math.ceil(box.x + box.width)), height: Math.max(+h, Math.ceil(box.y + box.height)) }); }
const clip = box ? box : crop ? (([x, y, cw, ch]) => ({ x, y, width: cw, height: ch }))(crop.split(',').map(Number)) : { x: 0, y: 0, width: w, height: +h };
await page.screenshot({ path: out, omitBackground: flag('transparent'), clip });
await browser.close();
console.log(out, Math.round(clip.width * scale) + 'x' + Math.round(clip.height * scale));
