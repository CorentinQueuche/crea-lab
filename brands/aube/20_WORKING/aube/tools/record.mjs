// Enregistre une page animée en MP4, image par image (déterministe).
// node tools/record.mjs <page.html> <sortie.mp4> [--w 1920] [--h 1080] [--fps 30] [--dur 6] [--scale 1] [--gif]
// La page doit exposer window.seek(t) (t en secondes) qui place TOUT l'état de l'animation pour l'instant t, sans dépendre de l'horloge.
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const [page_, out] = args;
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const w = +opt('w', 1920), h = +opt('h', 1080), fps = +opt('fps', 30), dur = +opt('dur', 6), scale = +opt('scale', 1);

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
page.on('pageerror', (e) => console.error('ERREUR PAGE', e.message));
await page.goto(pathToFileURL(path.resolve(page_)).href);
await page.evaluate(() => document.fonts.ready);

const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '14', '-preset', 'slow', '-movflags', '+faststart',
  '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const n = Math.round(fps * dur);
for (let i = 0; i < n; i++) {
  await page.evaluate((t) => window.seek(t), i / fps);
  const buf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: w, height: h } });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % 30 === 0) console.log(`image ${i}/${n}`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();
console.log(out, `${w * scale}x${h * scale}`, `${n} images`);
