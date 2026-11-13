// Enregistre une page animée en MP4, image par image (déterministe).
// node tools/record.mjs <page.html> <sortie.mp4> [--w 1920] [--h 1080] [--fps 30] [--dur 6] [--scale 1] [--crf 18]
//                       [--planche] [--apercu] [--from 2] [--to 4] [--fixe 5.4] [--contact out/motion/_contact-25.jpg]
// La page expose window.seek(t) (t en secondes), qui place TOUT l'état de l'animation pour l'instant t, sans horloge.
//   Si la page a besoin de temps avant la première image (police, photo, moteur Verse), elle pose window.pret = une promesse :
//   l'enregistreur l'attend. Si seek(t) renvoie une promesse (un canvas qui se redessine, une image à décoder), il l'attend
//   aussi, puis il attend que toutes les images de la page soient décodées, avant chaque capture.
//   --planche : écrit aussi <sortie>-planche.jpg (6 images réparties) et <sortie>.png (image fixe à 70 % de la durée).
//   --fixe t  : instant de l'image fixe écrite par --planche (par défaut 70 % de la durée).
//   --apercu  : n'enregistre pas ; écrit seulement la planche de 6 images, en quelques secondes. Pour régler avant d'enregistrer.
//   --from / --to : limite l'enregistrement (ou l'aperçu) à une plage, pour vérifier un passage sans tout refaire.
//   --contact f : après l'encodage, extrait du MP4 lui-même (pas de la page) six images : la première, quatre réparties,
//                 la dernière ; les assemble en planche-contact f (3 × 2). Pour vérifier le début, la fin et le raccord d'une boucle.
//   --crf     : qualité H.264 (18 par défaut ; monter à 20-23 si le fichier dépasse le poids visé).
import { chromium } from 'playwright-core';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const [page_, out] = args;
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const flag = (k) => args.includes('--' + k);
const w = +opt('w', 1920), h = +opt('h', 1080), fps = +opt('fps', 30), dur = +opt('dur', 6), scale = +opt('scale', 1), crf = opt('crf', '18');
const from = +opt('from', 0), to = +opt('to', dur);
const stem = out.replace(/\.mp4$/i, '');

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars', '--disable-gpu-vsync'] });
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
let erreurs = 0;
page.on('pageerror', (e) => { erreurs++; console.error('ERREUR PAGE', e.message); });
page.on('requestfailed', (r) => console.error('FICHIER INTROUVABLE', r.url()));
page.on('response', (r) => { if (r.status() >= 400) console.error('FICHIER INTROUVABLE', r.status(), r.url()); });
const pm = page_.match(/^(.*?\.html?)([?#].*)?$/i);
await page.goto(pathToFileURL(path.resolve(pm ? pm[1] : page_)).href + ((pm && pm[2]) || ''));
await page.waitForLoadState('load');
await page.evaluate(() => document.fonts.ready);
/* le moteur : la page dit quand elle est prête (window.pret), sinon on ne suppose rien */
await page.evaluate(() => Promise.resolve(window.pret).then(() => true));
await page.evaluate(() => document.fonts.ready);

/* une image : seek(t), sa promesse s'il y en a une, puis les images de la page décodées */
const placer = (t) => page.evaluate(async (t) => {
  await window.seek(t);
  const imgs = [...document.images].filter((im) => !im.complete || !im.naturalWidth);
  await Promise.all(imgs.map((im) => (im.decode ? im.decode().catch(() => {}) : null)));
  return true;
}, t);

const clip = { x: 0, y: 0, width: w, height: h };
const tile = (files, dest) => spawnSync('ffmpeg', ['-v', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex',
  files.map((_, i) => `[${i}]scale=640:-2[s${i}]`).join(';') + ';' + files.map((_, i) => `[s${i}]`).join('') + 'xstack=inputs=6:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0', '-frames:v', '1', '-q:v', '3', dest], { stdio: 'inherit' });

if (flag('apercu')) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'apercu-')); const files = [];
  for (let k = 0; k < 6; k++) {
    const t = from + ((to - from) * (k + 0.37)) / 6;
    await placer(t);
    const f = path.join(tmp, k + '.png'); await page.screenshot({ path: f, clip }); files.push(f);
  }
  await browser.close();
  tile(files, stem + '-planche.jpg');
  console.log(stem + '-planche.jpg', `aperçu de ${from} à ${to} s`);
  process.exit(0);
}

const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', crf, '-preset', 'slow', '-profile:v', 'high', '-movflags', '+faststart',
  '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const i0 = Math.round(from * fps), i1 = Math.round(to * fps);
const debut = Date.now(); let tSeek = 0;
for (let i = i0; i < i1; i++) {
  const a = Date.now();
  await placer(i / fps);
  tSeek += Date.now() - a;
  const buf = await page.screenshot({ type: 'png', clip });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if ((i - i0) % 30 === 0) console.log(`image ${i - i0}/${i1 - i0}`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
const n = Math.max(1, i1 - i0);
console.log(`temps moyen par image : ${Math.round((Date.now() - debut) / n)} ms, dont seek ${Math.round(tSeek / n)} ms`);
if (flag('planche')) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'planche-')); const files = [];
  for (let k = 0; k < 6; k++) {
    const t = from + ((to - from) * (k + 0.37)) / 6;
    await placer(t);
    const f = path.join(tmp, k + '.png'); await page.screenshot({ path: f, clip }); files.push(f);
  }
  tile(files, stem + '-planche.jpg');
  await placer(+opt('fixe', from + (to - from) * 0.7));
  await page.screenshot({ path: stem + '.png', clip });
  console.log(stem + '-planche.jpg', stem + '.png');
}
await browser.close();

/* la planche-contact, tirée du MP4 encodé : première image, quatre réparties, dernière image */
const contact = opt('contact', '');
if (contact) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'contact-')), files = [], D = (i1 - i0) / fps;
  const instants = [0, 0.2, 0.4, 0.6, 0.8].map((u) => u * D);
  instants.forEach((t, k) => { const f = path.join(tmp, k + '.png'); spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', t.toFixed(3), '-i', out, '-frames:v', '1', f]); files.push(f); });
  const f = path.join(tmp, '5.png'); spawnSync('ffmpeg', ['-v', 'error', '-y', '-sseof', (-1.5 / fps).toFixed(3), '-i', out, '-update', '1', '-frames:v', '1', f]); files.push(f);
  tile(files, contact);
  console.log(contact, 'planche-contact tirée du MP4 (première, 20, 40, 60, 80 %, dernière)');
}
const poids = fs.statSync(out).size;
console.log(out, `${w * scale}x${h * scale}`, `${i1 - i0} images`, `${(poids / 1048576).toFixed(2)} Mo`, erreurs ? `${erreurs} ERREURS DE PAGE` : 'sans erreur de page');
