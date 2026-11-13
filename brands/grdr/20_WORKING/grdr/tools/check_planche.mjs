// Cherche dans une planche ce que l'œil rate quand on vient de la composer.
//   node tools/check_planche.mjs plates/05-affiche.html [autres.html …] [--w 1400] [--zones out/_zones]
//
// Cinq recherches, toutes sur le texte réel de la page (le texte dessiné dans un canvas ou une image n'est pas vu) :
//   COUPÉ      un texte tranché par le bord de son cadre (overflow, clip-path, masque) ou par le bord de la planche
//   SUPERPOSÉ  deux textes l'un sur l'autre (seuil relevé pour un texte penché, dont les boîtes gonflent)
//   TOUCHÉ     un pictogramme ou une petite image posés sur un texte
//   PÂLE       un petit texte (18 px et moins) qui se confond avec ce qu'il y a derrière lui (mesuré sur le rendu)
//   ESPACE     une espace ordinaire devant ; : ! ? » ou après « : le signe peut se retrouver seul en début de ligne
//
// Ce contrôle se trompe dans les deux sens : il signale des effets voulus (un mot géant qui sort du cadre) et ne voit
// pas tout. Il sert à savoir où regarder. Ouvrir chaque zone (--zones les découpe à pleine définition), puis corriger,
// ou marquer l'effet voulu avec l'attribut data-voulu sur l'élément ou un parent : il ne sera plus signalé.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
// "plates/[0-9]*.html" entre guillemets : le motif est déplié ici (tous les shells ne le font pas)
const deplier = (a) => { if (!a.includes('*')) return [a]; const d = path.dirname(a), re = new RegExp('^' + path.basename(a).replace(/[.+^$(){}|]/g, '\\$&').replace(/\*/g, '.*') + '$', 'i');
  return fs.existsSync(d) ? fs.readdirSync(d).filter((f) => re.test(f)).sort().map((f) => path.join(d, f)) : []; };
const pages = args.filter((a, i) => /\.html?([?#].*)?$/i.test(a) && !(i > 0 && args[i - 1].startsWith('--'))).flatMap(deplier);
const w = +opt('w', 1400), zones = opt('zones', null);
if (!pages.length) { console.error('usage : node tools/check_planche.mjs <planche.html> […] [--w 1400] [--zones dossier]'); process.exit(2); }
if (zones) fs.mkdirSync(zones, { recursive: true });

// --- dans la page : relevé des textes et des quatre premières recherches -------------------------------------------
function releve() {
  const plate = document.querySelector('.plate') || document.body;
  const P = plate.getBoundingClientRect();
  const nom = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '');
  const visible = (el) => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.05) return false; } return true; };
  const boite = (q) => ({ x: q.left, y: q.top, w: q.width, h: q.height });
  const tourne = (el) => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const t = getComputedStyle(e).transform; if (!t || t === 'none') continue;
    if (t.startsWith('matrix3d')) return true; const m = t.match(/-?[\d.e-]+/g); if (m && (Math.abs(+m[1]) > 0.02 || Math.abs(+m[2]) > 0.02)) return true; } return false; };
  const inter = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const union = (rs) => { const x = Math.min(...rs.map(r => r.x)), y = Math.min(...rs.map(r => r.y)); return { x, y, w: Math.max(...rs.map(r => r.x + r.w)) - x, h: Math.max(...rs.map(r => r.y + r.h)) - y }; };
  const extrait = (s) => s.replace(/\s+/g, ' ').trim().slice(0, 48);
  const trouve = [], espaces = [];

  // les textes : un relevé par élément, une boîte par ligne
  const parEl = new Map();
  const tw = document.createTreeWalker(plate, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const v = n.nodeValue; if (!v.trim()) continue;
    const el = n.parentElement; if (!el || el.closest('script,style,noscript,[data-voulu]') || !visible(el)) continue;
    const m = v.match(/[^\s]* [;:!?»]|« [^\s]*/); if (m) espaces.push(extrait(v.slice(Math.max(0, m.index - 14), m.index + m[0].length + 6)));
    const rg = document.createRange(); rg.selectNodeContents(n);
    const rs = [...rg.getClientRects()].filter(q => q.width > 1 && q.height > 1).map(boite);
    if (!rs.length) continue;
    if (!parEl.has(el)) parEl.set(el, { el, texte: '', lignes: [] });
    const T = parEl.get(el); T.texte += v + ' '; T.lignes.push(...rs);
  }
  const textes = [...parEl.values()].map(T => {
    const c = getComputedStyle(T.el);
    const svg = T.el instanceof SVGElement, encre = svg && c.fill && c.fill !== 'none' ? c.fill : c.color;   // un texte SVG se colore par fill
    return { ...T, texte: extrait(T.texte), tout: union(T.lignes), corps: parseFloat(c.fontSize), couleur: encre, remplissage: svg ? encre : c.webkitTextFillColor, tourne: tourne(T.el) };
  }).filter(T => inter(T.tout, boite(P)) > 0);   // ce qui est entièrement hors de la planche n'est pas rendu

  // COUPÉ
  for (const T of textes) {
    const cadres = [{ r: boite(P), qui: 'le bord de la planche' }];
    for (let e = T.el.parentElement; e && e !== plate.parentElement; e = e.parentElement) {
      const c = getComputedStyle(e);
      const masque = c.maskImage && c.maskImage !== 'none' || c.webkitMaskImage && c.webkitMaskImage !== 'none';
      if (c.overflowX !== 'visible' || c.overflowY !== 'visible' || c.clipPath !== 'none' || masque) cadres.push({ r: boite(e.getBoundingClientRect()), qui: nom(e) });
    }
    for (const { r, qui } of cadres) {
      if (inter(T.tout, r) <= 0) continue;   // entièrement masqué : ce n'est pas une coupe visible
      const coupee = T.lignes.find(l => r.x - l.x > 3 || (l.x + l.w) - (r.x + r.w) > 3 || r.y - l.y > l.h * 0.3 || (l.y + l.h) - (r.y + r.h) > l.h * 0.3);
      if (coupee) { trouve.push({ type: 'COUPÉ', texte: T.texte, detail: 'par ' + qui, zone: coupee }); break; }
    }
  }

  // SUPERPOSÉ : deux textes différents dont une ligne recouvre l'autre d'un quart au moins
  for (let i = 0; i < textes.length; i++) for (let j = i + 1; j < textes.length; j++) {
    const A = textes[i], B = textes[j];
    if (A.el.contains(B.el) || B.el.contains(A.el) || inter(A.tout, B.tout) <= 0) continue;
    if (A.texte === B.texte && Math.abs(A.tout.x - B.tout.x) < 6 && Math.abs(A.tout.y - B.tout.y) < 6) continue;   // un doublé d'effet (contour, ombre)
    let pire = null; const seuil = A.tourne || B.tourne ? 0.6 : 0.25;   // un texte penché a des boîtes plus grandes que lui
    for (const a of A.lignes) for (const b of B.lignes) { const s = inter(a, b) / Math.min(a.w * a.h, b.w * b.h); if (s > seuil && (!pire || s > pire.s)) pire = { s, zone: union([a, b]) }; }
    if (pire) trouve.push({ type: 'SUPERPOSÉ', texte: A.texte, detail: 'avec « ' + B.texte + ' »', zone: pire.zone });
  }

  // TOUCHÉ : un pictogramme (svg, image, canvas de petite taille) sur une ligne de texte
  const pictos = [...plate.querySelectorAll('svg,img,canvas')].filter(g => !g.closest('[data-voulu]') && visible(g)).map(g => ({ g, r: boite(g.getBoundingClientRect()) })).filter(o => o.r.w > 4 && o.r.h > 4 && o.r.w < 320 && o.r.h < 320);
  for (const T of textes) {
    let vu = false;
    for (const { g, r } of pictos) {
      if (vu || g.contains(T.el) || T.el.contains(g)) continue;
      for (const l of T.lignes) {
        if (r.w > l.h * 7 || r.h > l.h * 7) continue;   // trop grand pour être un pictogramme à l'échelle de ce texte
        const s = inter(l, r);
        if (s > (T.tourne ? 0.45 : 0.12) * Math.min(l.w * l.h, r.w * r.h) && s > 12) { trouve.push({ type: 'TOUCHÉ', texte: T.texte, detail: 'par ' + nom(g), zone: union([l, r]) }); vu = true; break; }
      }
    }
  }

  // les petits textes, pour la mesure du contraste sur le rendu
  const petits = textes.filter(T => T.corps <= 18).map(T => ({ texte: T.texte, couleur: T.couleur, remplissage: T.remplissage, ligne: T.lignes[0] }));
  return { planche: boite(P), trouve, espaces: [...new Set(espaces)].slice(0, 12), petits, nTextes: textes.length };
}

// --- dans la page : contraste des petits textes, mesuré sur la capture ---------------------------------------------
async function contraste({ png, petits }) {
  const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
  const cv = new OffscreenCanvas(img.width, img.height), cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0);
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const mediane = (a) => { a.sort((x, y) => x - y); return a[a.length >> 1]; };
  const out = [];
  for (const T of petits) {
    const m = (T.remplissage && T.remplissage !== T.couleur ? T.remplissage : T.couleur).match(/[\d.]+/g); if (!m) continue;
    const [r, g, b, a = 1] = m.map(Number); if (a < 0.3) continue;   // texte transparent : rempli d'une image, hors sujet
    const l = T.ligne, x0 = Math.max(0, Math.floor(l.x - 5)), y0 = Math.max(0, Math.floor(l.y - 4)), x1 = Math.min(img.width, Math.ceil(l.x + l.w + 5)), y1 = Math.min(img.height, Math.ceil(l.y + l.h + 4));
    if (x1 - x0 < 4 || y1 - y0 < 4) continue;
    const d = cx.getImageData(x0, y0, x1 - x0, y1 - y0).data, R = [], G = [], B = [];
    for (let y = 0; y < y1 - y0; y++) for (let x = 0; x < x1 - x0; x++) {   // seulement la couronne autour de la ligne : le fond, sans les lettres
      const dedans = x0 + x >= l.x - 1 && x0 + x <= l.x + l.w + 1 && y0 + y >= l.y - 1 && y0 + y <= l.y + l.h + 1; if (dedans) continue;
      const k = (y * (x1 - x0) + x) * 4; R.push(d[k]); G.push(d[k + 1]); B.push(d[k + 2]);
    }
    if (R.length < 20) continue;
    const fond = [mediane(R), mediane(G), mediane(B)], enc = [r, g, b].map((v, i) => v * a + fond[i] * (1 - a));
    const L1 = lum(enc), L2 = lum(fond), c = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    if (c < 2.5) out.push({ type: 'PÂLE', texte: T.texte, detail: 'contraste ' + c.toFixed(1) + ' pour 1 avec le fond', zone: T.ligne });
  }
  return out;
}

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
let total = 0;
for (const p of pages) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  const pm = p.match(/^(.*?\.html?)([?#].*)?$/i);
  await page.goto(pathToFileURL(path.resolve(pm[1])).href + (pm[2] || ''));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => (window.pret && window.pret.then ? window.pret.then(() => 1) : 0));   // une page qui dessine après coup le dit par window.pret
  const h = await page.evaluate(() => Math.ceil((document.querySelector('.plate') || document.body).getBoundingClientRect().height));
  await page.setViewportSize({ width: w, height: Math.max(200, h) });
  await page.waitForTimeout(200);
  const R = await page.evaluate(releve);
  const png = (await page.screenshot({ scale: 'css', clip: { x: 0, y: 0, width: w, height: Math.max(200, h) } })).toString('base64');
  const pales = await page.evaluate(contraste, { png, petits: R.petits });
  const tout = [...R.trouve, ...pales];
  const base = path.basename(pm[1]).replace(/\.html?$/i, '');
  console.log('\n' + base + ' : ' + R.nTextes + ' textes lus, ' + tout.length + ' zone(s) à regarder' + (R.espaces.length ? ', ' + R.espaces.length + ' espace(s) à rendre insécable(s)' : ''));
  let n = 0;
  for (const f of tout) {
    n++;
    let fichier = '';
    if (zones && n <= 30) {
      const z = f.zone, m = 46, x = Math.max(0, z.x - m), y = Math.max(0, z.y - m);
      const clip = { x, y, width: Math.min(w - x, z.w + 2 * m), height: Math.min(Math.max(200, h) - y, z.h + 2 * m) };
      if (clip.width > 2 && clip.height > 2) { fichier = path.join(zones, base + '-' + String(n).padStart(2, '0') + '.png'); await page.screenshot({ path: fichier, clip }); }
    }
    console.log('  ' + f.type.padEnd(10) + '« ' + f.texte + ' » ' + f.detail + '  [x ' + Math.round(f.zone.x) + ', y ' + Math.round(f.zone.y) + ']' + (fichier ? '  → ' + fichier : ''));
  }
  for (const e of R.espaces) console.log('  ESPACE    « ' + e + ' »');
  total += tout.length + R.espaces.length;
  await page.close();
}
await browser.close();
console.log('\n' + (total ? total + ' point(s) à regarder. Ouvrir chaque zone à pleine définition ; corriger, ou marquer data-voulu ce qui est un effet décidé.' : 'Rien de signalé. Cela ne dispense pas de regarder la planche en entier.'));
