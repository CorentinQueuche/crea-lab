// Maillon — capture image par image de film.html avec Chrome (protocole DevTools, sans dépendance).
// Usage : node capturer.mjs [--pas 30] [--de 0] [--a 22.8] [--ips 60] [--sortie src]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const IPS = +arg('ips', 60), PAS = +arg('pas', 1), SORTIE = path.join(ICI, arg('sortie', 'src'));
const W = 1920, H = 1080, MONDE = [2000, 1300], PORT = 9377;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// film.html = index.html + les fichiers du film
const html = fs.readFileSync(path.join(ICI, '..', 'index.html'), 'utf8')
  .replace('href="styles.css"', 'href="../styles.css"><link rel="stylesheet" href="film.css"')
  .replace('src="marque.js"', 'src="../marque.js"')
  .replace('<script src="app.js"></script>', '<script src="../app.js"></script><script src="film.js"></script>');
fs.writeFileSync(path.join(ICI, 'film.html'), html);

// ----- caméra : même calcul que post.py, pour ne capturer que la zone visible -----
const rad = (d) => d * Math.PI / 180;
const mul = (A, B) => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
function rot(tilt, yaw, roll) {
  const a = rad(tilt), b = rad(yaw), c = rad(roll);
  const rx = [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
  const ry = [[Math.cos(b), 0, Math.sin(b)], [0, 1, 0], [-Math.sin(b), 0, Math.cos(b)]];
  const rz = [[Math.cos(c), -Math.sin(c), 0], [Math.sin(c), Math.cos(c), 0], [0, 0, 1]];
  return mul(mul(rz, rx), ry);
}
function inv3(m) {
  const [a, b, c] = m[0], [d, e, f] = m[1], [g, h, i] = m[2];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C;
  return [[A, -(b * i - c * h), b * f - c * e], [B, a * i - c * g, -(a * f - c * d)], [C, -(a * h - b * g), a * e - b * d]].map((r) => r.map((v) => v / det));
}
function zone(cam) {
  const k = W / 1600, zoom = cam.zoom * k, f = cam.focale * W, D = f / zoom, R = rot(cam.tilt, cam.yaw, cam.roll);
  const [tx, ty] = cam.cible, cx = W / 2, cy = H / 2;
  const r1 = [R[0][0], R[1][0], R[2][0]], r2 = [R[0][1], R[1][1], R[2][1]];
  const o = [0, 1, 2].map((i) => -(r1[i] * tx + r2[i] * ty));
  const M = [
    [f * r1[0] + cx * r1[2], f * r2[0] + cx * r2[2], f * o[0] + cx * (D + o[2])],
    [f * r1[1] + cy * r1[2], f * r2[1] + cy * r2[2], f * o[1] + cy * (D + o[2])],
    [r1[2], r2[2], D + o[2]],
  ];
  const iM = inv3(M);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, tout = false;
  for (let i = 0; i <= 6; i++) for (let j = 0; j <= 6; j++) {
    const u = W * i / 6, v = H * j / 6, den = iM[2][0] * u + iM[2][1] * v + iM[2][2];
    if (den <= 1e-9) { tout = true; continue; }
    const x = (iM[0][0] * u + iM[0][1] * v + iM[0][2]) / den, y = (iM[1][0] * u + iM[1][1] * v + iM[1][2]) / den;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  if (tout) { x0 = 0; y0 = 0; x1 = MONDE[0]; y1 = MONDE[1]; }
  x0 = Math.max(0, Math.floor(x0 - 70)); y0 = Math.max(0, Math.floor(y0 - 70));
  x1 = Math.min(MONDE[0], Math.ceil(x1 + 70)); y1 = Math.min(MONDE[1], Math.ceil(y1 + 70));
  if (x1 - x0 < 50 || y1 - y0 < 50) { x0 = 0; y0 = 0; x1 = MONDE[0]; y1 = MONDE[1]; }
  let s = Math.min(3.4, Math.max(.9, zoom * 1.15));
  const aire = (x1 - x0) * (y1 - y0);
  if (aire * s * s > 9e6) s = Math.sqrt(9e6 / aire);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, s: Math.round(s * 100) / 100 };
}

// ----- Chrome -----
const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'maillon-film-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`, '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
let cible;
for (let i = 0; i < 60 && !cible; i++) {
  await attendre(250);
  try { cible = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((x) => x.type === 'page'); } catch { /* pas encore prêt */ }
}
if (!cible) { chrome.kill(); throw new Error('Chrome ne répond pas'); }
const ws = new WebSocket(cible.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let seq = 0; const attente = new Map(), evenements = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && attente.has(d.id)) { const { ok, ko } = attente.get(d.id); attente.delete(d.id); d.error ? ko(new Error(d.error.message)) : ok(d.result); }
  else if (d.method && evenements.has(d.method)) { evenements.get(d.method)(d.params); evenements.delete(d.method); }
};
const cdp = (method, params = {}) => new Promise((ok, ko) => { const id = ++seq; attente.set(id, { ok, ko }); ws.send(JSON.stringify({ id, method, params })); });
const evenement = (nom) => new Promise((r) => evenements.set(nom, r));
const evalue = async (expression) => (await cdp('Runtime.evaluate', { expression, returnByValue: true })).result.value;

try {
  await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: MONDE[0], height: MONDE[1], deviceScaleFactor: 1, mobile: false });
  const charge = evenement('Page.loadEventFired');
  await cdp('Page.navigate', { url: pathToFileURL(path.join(ICI, 'film.html')).href });
  await charge;
  for (let i = 0; i < 80; i++) { if (await evalue(`document.body.dataset.pret === '1' && !!window.film`)) break; await attendre(100); }
  const polices = await evalue(`JSON.stringify([...document.fonts].map(f => f.family + ':' + f.status))`);
  const duree = +arg('a', await evalue('window.FILM_DUREE')), de = +arg('de', 0);
  fs.mkdirSync(SORTIE, { recursive: true });
  const meta = [], n0 = Math.round(de * IPS), n1 = Math.round(duree * IPS);
  const debut = Date.now();
  for (let i = n0; i < n1; i += PAS) {
    const t = i / IPS;
    const cam = JSON.parse(await evalue(`JSON.stringify(window.film(${t}))`));
    const z = zone(cam);
    const img = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: z.x, y: z.y, width: z.w, height: z.h, scale: z.s }, optimizeForSpeed: true });
    const fichier = `f${String(i).padStart(5, '0')}.png`;
    fs.writeFileSync(path.join(SORTIE, fichier), Buffer.from(img.data, 'base64'));
    meta.push({ i, t, cam, zone: z, fichier });
    if (meta.length % 60 === 0) console.log(`${meta.length} images, ${((Date.now() - debut) / 1000).toFixed(0)} s`);
  }
  fs.writeFileSync(path.join(SORTIE, 'meta.json'), JSON.stringify({ ips: IPS, pas: PAS, W, H, polices: JSON.parse(polices), images: meta }));
  console.log(`terminé : ${meta.length} images en ${((Date.now() - debut) / 1000).toFixed(0)} s ; polices ${polices}`);
} finally {
  ws.close(); chrome.kill();
  await attendre(400);
  try { fs.rmSync(profil, { recursive: true, force: true }); } catch { /* profil temporaire encore verrouillé */ }
}
