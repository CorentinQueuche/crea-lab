// Enregistre une page animée en MP4, image par image (déterministe).
// node tools/record.mjs <page.html> <sortie.mp4> [--w 1920] [--h 1080] [--fps 30] [--dur 6] [--scale 1]
//                       [--planche] [--apercu] [--from 2] [--to 4] [--fixe 5.4]
// La page expose window.seek(t) (t en secondes), qui place TOUT l'état de l'animation pour l'instant t, sans horloge.
//   --planche : écrit aussi <sortie>-planche.jpg (6 images réparties) et <sortie>.png (image fixe à 70 % de la durée).
//   --fixe t  : instant de l'image fixe écrite par --planche (par défaut 70 % de la durée).
//   --apercu  : n'enregistre pas ; écrit seulement la planche de 6 images, en quelques secondes. Pour régler avant d'enregistrer.
//   --from / --to : limite l'enregistrement (ou l'aperçu) à une plage, pour vérifier un passage sans tout refaire.
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
const w = +opt('w', 1920), h = +opt('h', 1080), fps = +opt('fps', 30), dur = +opt('dur', 6), scale = +opt('scale', 1);
const from = +opt('from', 0), to = +opt('to', dur);
const stem = out.replace(/\.mp4$/i, '');

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
page.on('pageerror', (e) => console.error('ERREUR PAGE', e.message));
page.on('requestfailed', (r) => console.error('FICHIER INTROUVABLE', r.url()));
page.on('response', (r) => { if (r.status() >= 400) console.error('FICHIER INTROUVABLE', r.status(), r.url()); });
const pm = page_.match(/^(.*?\.html?)([?#].*)?$/i);
await page.goto(pathToFileURL(path.resolve(pm ? pm[1] : page_)).href + ((pm && pm[2]) || ''));
await page.evaluate(() => document.fonts.ready);
const clip = { x: 0, y: 0, width: w, height: h };
const tile = (files, dest) => spawnSync('ffmpeg', ['-v', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex',
  files.map((_, i) => `[${i}]scale=640:-2[s${i}]`).join(';') + ';' + files.map((_, i) => `[s${i}]`).join('') + 'xstack=inputs=6:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0', '-frames:v', '1', '-q:v', '3', dest], { stdio: 'inherit' });

if (flag('apercu')) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'apercu-')); const files = [];
  for (let k = 0; k < 6; k++) {
    const t = from + ((to - from) * (k + 0.37)) / 6;
    await page.evaluate((t) => window.seek(t), t);
    const f = path.join(tmp, k + '.png'); await page.screenshot({ path: f, clip }); files.push(f);
  }
  await browser.close();
  tile(files, stem + '-planche.jpg');
  console.log(stem + '-planche.jpg', `aperçu de ${from} à ${to} s`);
  process.exit(0);
}

const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '14', '-preset', 'slow', '-movflags', '+faststart',
  '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const i0 = Math.round(from * fps), i1 = Math.round(to * fps);
for (let i = i0; i < i1; i++) {
  await page.evaluate((t) => window.seek(t), i / fps);
  const buf = await page.screenshot({ type: 'png', clip });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if ((i - i0) % 30 === 0) console.log(`image ${i - i0}/${i1 - i0}`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
if (flag('planche')) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'planche-')); const files = [];
  for (let k = 0; k < 6; k++) {
    const t = from + ((to - from) * (k + 0.37)) / 6;
    await page.evaluate((t) => window.seek(t), t);
    const f = path.join(tmp, k + '.png'); await page.screenshot({ path: f, clip }); files.push(f);
  }
  tile(files, stem + '-planche.jpg');
  await page.evaluate((t) => window.seek(t), +opt('fixe', from + (to - from) * 0.7));
  await page.screenshot({ path: stem + '.png', clip });
  console.log(stem + '-planche.jpg', stem + '.png');
}
await browser.close();
console.log(out, `${w * scale}x${h * scale}`, `${i1 - i0} images`);
