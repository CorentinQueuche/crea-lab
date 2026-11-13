/* Prépare deux éléments du kit à partir de sources vérifiables, et les écrit dans _prep/kit.json :

   1. Le symbole au trait. Le symbole officiel (rapport d'activité 2025) est un tracé plein, fait de cinq traits
      d'épaisseur constante. On calcule la ligne médiane de chacun, pour pouvoir tracer le symbole trait par trait
      dans les vidéos. Contrôle : _prep/symbole_superpose.svg (la ligne médiane, épaissie, doit recouvrir l'officiel).

   2. La carte « ici et là-bas ». Fond Natural Earth (domaine public, paquet world-atlas), projection azimutale
      équivalente centrée entre la France et le Sahel. Pays d'intervention et bureaux : rapport d'activité 2025 du
      GRDR, pages 54 à 75 et 85. Les coordonnées des villes sont celles des villes, pas d'adresses.

   node _prep/preparer_kit.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoAzimuthalEqualArea, geoPath } from 'd3-geo';
import { feature, merge } from 'topojson-client';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const r1 = (v) => Math.round(v * 10) / 10;

/* ---------- 1. Le symbole au trait ---------- */
const off = JSON.parse(fs.readFileSync(path.join(ICI, 'logo_officiel.json'), 'utf8'));
const B = off.symbole.boite;   // [x, y, l, h]

/* Échantillonne un contour fermé (commandes absolues M L C Z, points « x,y ») */
function contour(d, pas = 0.5) {
  const pts = []; let x = 0, y = 0, x0 = 0, y0 = 0;
  const seg = (f, n) => { for (let i = 1; i <= n; i++) pts.push(f(i / n)); };
  for (const [, c, a] of d.matchAll(/([MLCZ])([^MLCZ]*)/g)) {
    const n = (a.match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).map(Number);
    if (c === 'M') { x = x0 = n[0]; y = y0 = n[1]; pts.push([x, y]); }
    else if (c === 'L') { for (let i = 0; i < n.length; i += 2) { const [ax, ay, bx, by] = [x, y, n[i], n[i + 1]]; seg((t) => [ax + (bx - ax) * t, ay + (by - ay) * t], Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / pas))); x = bx; y = by; } }
    else if (c === 'C') { for (let i = 0; i < n.length; i += 6) { const [a0, a1, b0, b1, c0, c1, d0, d1] = [x, y, n[i], n[i + 1], n[i + 2], n[i + 3], n[i + 4], n[i + 5]];
        const lg = Math.hypot(b0 - a0, b1 - a1) + Math.hypot(c0 - b0, c1 - b1) + Math.hypot(d0 - c0, d1 - c1);
        seg((t) => { const u = 1 - t; return [u * u * u * a0 + 3 * u * u * t * b0 + 3 * u * t * t * c0 + t * t * t * d0, u * u * u * a1 + 3 * u * u * t * b1 + 3 * u * t * t * c1 + t * t * t * d1]; }, Math.max(2, Math.ceil(lg / pas))); x = d0; y = d1; } }
    else if (c === 'Z') { if (Math.hypot(x - x0, y - y0) > 0.01) seg((t) => [x + (x0 - x) * t, y + (y0 - y) * t], Math.max(1, Math.ceil(Math.hypot(x0 - x, y0 - y) / pas))); }
  }
  return pts;
}
/* Ligne médiane d'un trait d'épaisseur constante donné par son contour : pour chaque point du contour, le point situé
   à une demi-épaisseur vers l'intérieur est sur la ligne médiane. On ne garde qu'un des deux flancs, entre les deux bouts. */
function mediane(d) {
  const pts = contour(d), n = pts.length;
  let aire = 0, peri = 0; for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; aire += a[0] * b[1] - b[0] * a[1]; peri += Math.hypot(b[0] - a[0], b[1] - a[1]); }
  const sens = Math.sign(aire); aire = Math.abs(aire) / 2;
  const ep = (peri / 2 - Math.sqrt(peri * peri / 4 - Math.PI * aire)) / (Math.PI / 2);
  const c = pts.map((p, i) => { const a = pts[(i - 3 + n) % n], b = pts[(i + 3) % n], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
    return [p[0] - sens * (ty / l) * (ep / 2), p[1] + sens * (tx / l) * (ep / 2)]; });
  /* vitesse du centre rapportée à celle du contour : proche de 1 sur un flanc, proche de 0 dans un bout rond */
  const v = c.map((q, i) => { const r = c[(i + 6) % n], a = pts[i], b = pts[(i + 6) % n]; return Math.hypot(r[0] - q[0], r[1] - q[1]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1); });
  /* les deux plus longues plages « flanc » */
  const plages = []; let deb = -1;
  for (let i = 0; i < 2 * n; i++) { const ok = v[i % n] > 0.45; if (ok && deb < 0) deb = i; if (!ok && deb >= 0) { plages.push([deb, i]); deb = -1; } }
  const uniq = []; for (const p of plages.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]))) { if (uniq.length < 2 && !uniq.some((u) => (p[0] % n) >= (u[0] % n) && (p[0] % n) < (u[0] % n) + (u[1] - u[0]))) uniq.push(p); }
  const flanc = (pl) => { const out = []; for (let i = pl[0] + 8; i < pl[1] - 2; i++) out.push(c[i % n]); return out; };
  const A = flanc(uniq[0]), Bf = flanc(uniq[1]).reverse();
  /* moyenne des deux flancs, pris au même avancement */
  const m = []; const N = 120; for (let i = 0; i <= N; i++) { const a = A[Math.round((i / N) * (A.length - 1))], b = Bf[Math.round((i / N) * (Bf.length - 1))]; m.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]); }
  /* prolonge chaque bout jusqu'au centre du bout rond */
  const allonge = (p, q) => { const l = Math.hypot(p[0] - q[0], p[1] - q[1]) || 1; return [p[0] + ((p[0] - q[0]) / l) * 1.6, p[1] + ((p[1] - q[1]) / l) * 1.6]; };
  m.unshift(allonge(m[0], m[3])); m.push(allonge(m[m.length - 1], m[m.length - 4]));
  let lg = 0; for (let i = 1; i < m.length; i++) lg += Math.hypot(m[i][0] - m[i - 1][0], m[i][1] - m[i - 1][1]);
  return { pts: m, ep, lg };
}
const med = off.symbole.pieces.map(mediane);
/* Ordre et sens de tracé : du pied (le lieu) vers la boucle. Le pied est le bout le plus bas. */
for (const t of med) if (t.pts[0][1] < t.pts[t.pts.length - 1][1]) t.pts.reverse();
/* du plus petit au plus grand : c'est l'ordre dans lequel le symbole se trace */
med.sort((a, b) => a.lg - b.lg);
const traits = med.map((t) => ({ d: 'M' + t.pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join(' L'), l: r1(t.lg) }));
const epaisseur = r1(med.reduce((s, t) => s + t.ep, 0) / med.length);
console.log('symbole au trait :', traits.length, 'traits | épaisseurs', med.map((t) => t.ep.toFixed(2)).join(' '), '| longueurs', med.map((t) => Math.round(t.lg)).join(' '));
fs.writeFileSync(path.join(ICI, 'symbole_superpose.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${B[0] - 20} ${B[1] - 20} ${B[2] + 40} ${B[3] + 40}"><rect x="${B[0] - 20}" y="${B[1] - 20}" width="${B[2] + 40}" height="${B[3] + 40}" fill="#fff"/>` +
  `<path fill="#B25F25" d="${off.symbole.pieces.join(' ')}"/>` +
  traits.map((t) => `<path d="${t.d}" fill="none" stroke="#00E0FF" stroke-opacity=".75" stroke-width="${epaisseur}" stroke-linecap="round" stroke-linejoin="round"/>`).join('') + `</svg>`);

/* ---------- 2. La carte ---------- */
const topo = JSON.parse(fs.readFileSync(path.join(ICI, '..', 'node_modules', 'world-atlas', 'countries-50m.json'), 'utf8'));
const pays = feature(topo, topo.objects.countries).features;
const W = 1000, H = 1180;
const cadre = { type: 'Feature', geometry: { type: 'MultiPoint', coordinates: [[-19.5, 51.5], [17, 51.5], [-19.5, 4.5], [17, 4.5], [-1, 28]] } };
const proj = geoAzimuthalEqualArea().rotate([2, -29]).fitExtent([[30, 30], [W - 30, H - 30]], cadre);
const gp = geoPath(proj).digits(1);
/* On garde ce qui touche le cadre, découpé par un rectangle un peu plus large */
proj.clipExtent([[-140, -140], [W + 140, H + 140]]);
const INTERVENTION = { France: 'FR', Mali: 'ML', Mauritania: 'MR', Senegal: 'SN', Guinea: 'GN', 'Guinea-Bissau': 'GW', Tunisia: 'TN', Algeria: 'DZ' };
const NOMS = { FR: 'France', ML: 'Mali', MR: 'Mauritanie', SN: 'Sénégal', GN: 'Guinée', GW: 'Guinée-Bissau', TN: 'Tunisie', DZ: 'Algérie' };
const terres = gp(merge(topo, topo.objects.countries.geometries)) || '';
const frontieres = {};
const voisins = [];
for (const f of pays) { const d = gp(f); if (!d) continue; const code = INTERVENTION[f.properties.name];
  if (code) { const c = gp.centroid(f); frontieres[code] = { nom: NOMS[code], d, centre: [r1(c[0]), r1(c[1])] }; } else voisins.push(d); }
const VILLES = [
  ['Montreuil', 'FR', 2.44, 48.86, 'siège'], ['Lille', 'FR', 3.06, 50.63, 'antenne Hauts-de-France'], ['Rouen', 'FR', 1.10, 49.44, 'antenne Haute-Normandie'],
  ['Kayes', 'ML', -11.43, 14.45], ['Bamako', 'ML', -8.00, 12.64],
  ['Nouakchott', 'MR', -15.98, 18.08], ['Sélibaby', 'MR', -12.18, 15.16], ['Kaédi', 'MR', -13.50, 16.15],
  ['Dakar', 'SN', -17.44, 14.69], ['Bakel', 'SN', -12.46, 14.90], ['Matam', 'SN', -13.26, 15.66], ['Ziguinchor', 'SN', -16.27, 12.58],
  ['Canchungo', 'GW', -16.03, 12.07], ['Conakry', 'GN', -13.68, 9.54], ['Boké', 'GN', -14.29, 10.94],
  ['Tunis', 'TN', 10.18, 36.80, 'capitale, pas de bureau listé'], ['Alger', 'DZ', 3.06, 36.75, 'capitale, pas de bureau listé'],
].map(([nom, code, lon, lat, note]) => { const p = proj([lon, lat]); return { nom, pays: code, x: r1(p[0]), y: r1(p[1]), note: note || 'bureau' }; });
console.log('carte :', Object.keys(frontieres).length, 'pays |', VILLES.length, 'villes | terres', terres.length, 'caractères');

fs.writeFileSync(path.join(ICI, 'kit.json'), JSON.stringify({
  symboleTrait: { traits, epaisseur, source: 'ligne médiane calculée sur le tracé officiel (rapport d’activité 2025, page 88)' },
  carte: { w: W, h: H, terres, pays: frontieres, voisins: voisins.join(' '), villes: VILLES, source: 'Natural Earth 1:50m (world-atlas), projection azimutale équivalente, rotation [2, -29]' },
}));
fs.writeFileSync(path.join(ICI, 'carte_controle.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#F6EADE"/><path d="${terres}" fill="#EBD1B8"/>` +
  Object.values(frontieres).map((p) => `<path d="${p.d}" fill="#E85330" fill-opacity=".55" stroke="#F6EADE" stroke-width="1.5"/>`).join('') +
  VILLES.map((v) => `<circle cx="${v.x}" cy="${v.y}" r="5" fill="#296C6E"/><text x="${v.x + 8}" y="${v.y + 4}" font-size="15" font-family="sans-serif" fill="#1d2b2b">${v.nom}</text>`).join('') + `</svg>`);
