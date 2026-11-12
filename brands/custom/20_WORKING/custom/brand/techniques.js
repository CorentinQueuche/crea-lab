/* =============================================================================
   brand/techniques.js : Custom, le même logo rendu dans les cinq techniques de
   marquage (broderie, sérigraphie, DTF, flocage, sublimation), comme des macros
   photo de vrais marquages sur tissu. Canvas 2D seul, aucune dépendance.

   À charger après brand/traces.js. Expose window.MarqueTech :
     MarqueTech.FORMES                 { cran, logotype, logo } → { d, box, parts }
     MarqueTech.rendre(canvas, o)      un marquage sur tissu (ou sur fond transparent)
     MarqueTech.tissu(canvas, o)       la matière seule, plein cadre, raccordable
     MarqueTech.tous(root = document)  rend les canvas[data-tech] et canvas[data-tissu]

   Principe : tout est calculé pixel par pixel dans des tableaux Float32.
     1. Le tissu donne un relief (hauteur des fils), un albédo et ses creux.
     2. La technique pose par-dessus sa hauteur, sa couleur et sa matière.
     3. Un seul éclairage (lumière rasante venant du haut à gauche) calcule les
        normales, les ombres portées (marche vers la lumière), l'occlusion et les
        brillances. Toutes les matières partagent donc la même lumière.
   Unité physique : le petit côté du canvas couvre MM_COTE millimètres de tissu à
   zoom 1, si bien que l'image a le même aspect à toute définition.
   Déterministe : générateur pseudo-aléatoire à graine, ni Math.random ni horloge
   (performance.now ne sert qu'à mesurer le temps de rendu renvoyé).
   ============================================================================= */
(function () {
  'use strict';

  // ------------------------------------------------------------------ réglages
  const MM_COTE = 32; // millimètres de tissu sur le petit côté du canvas (zoom 1)
  // Lumière : vecteur vers la source (x vers la droite, y vers le bas, z vers l'objectif).
  const L = unit3(-0.62, -0.58, 0.47);
  const LXY = Math.hypot(L[0], L[1]);
  const LDX = L[0] / LXY, LDY = L[1] / LXY; // direction de la source dans le plan
  const TAN_E = L[2] / LXY;                 // pente du rayon lumineux (lumière rasante)
  const HV = unit3(L[0], L[1], L[2] + 1);   // demi-vecteur, observateur au zénith

  const DEFAUTS = { tech: 'broderie', forme: 'cran', c: '#E2FF21', c2: null, fond: 'maille', cf: '#101012',
    p: 1, seed: 1, marge: 0.16, angle: 0, zoom: 1, vignette: 1 };
  const TISSUS = ['maille', 'serge', 'coton', 'molleton'];

  // ------------------------------------------------------------------ outils
  function unit3(x, y, z) { const n = Math.hypot(x, y, z); return [x / n, y / n, z / n]; }
  const c01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  function lisse(e0, e1, x) { const t = c01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); }
  function rgb(hex) {
    let h = String(hex || '#000').trim().replace('#', '');
    if (h.length === 3) h = h.split('').map((k) => k + k).join('');
    const n = parseInt(h.slice(0, 6), 16) || 0;
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  // Générateur pseudo-aléatoire à graine (mulberry32).
  function alea(seed) {
    let a = (Math.imul(seed | 0, 2654435761) ^ 0x9e3779b9) >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0; let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Hachage entier → [0, 1) : un nombre stable par cellule (fil, trou, boucle).
  function hash2(i, j, s) {
    let h = (Math.imul(i | 0, 0x27d4eb2d) ^ Math.imul((j | 0) + Math.imul(s | 0, 0x3c6ef372), 0x165667b1)) | 0;
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  // Période ajustée pour tomber juste sur la longueur L (motif raccordable).
  const per = (Lg, p) => Lg / Math.max(1, Math.round(Lg / p));
  function toile(w, h) {
    if (typeof document !== 'undefined') { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
    return new OffscreenCanvas(w, h);
  }
  const ctx2d = (c) => c.getContext('2d', { willReadFrequently: true });

  // Bruit de valeur fractal, périodique sur le canvas (raccordable), moyenne 0,5.
  // cell : taille de la maille du bruit en px ; sx, sy étirent le bruit (fibres).
  function champ(W, H, cell, seed, oct, sx, sy) {
    oct = oct || 1; sx = sx || 1; sy = sy || 1;
    const out = new Float32Array(W * H);
    const x0 = new Int32Array(W), x1 = new Int32Array(W), fx = new Float32Array(W);
    let amp = 1, tot = 0;
    for (let o = 0; o < oct; o++) {
      const gx = Math.max(1, Math.round(W / (cell * sx))), gy = Math.max(1, Math.round(H / (cell * sy)));
      const lat = new Float32Array(gx * gy);
      for (let k = 0; k < lat.length; k++) lat[k] = hash2(k % gx, (k / gx) | 0, seed * 131 + o * 17);
      for (let x = 0; x < W; x++) {
        const u = (x + 0.5) * gx / W, i = Math.floor(u); let f = u - i;
        x0[x] = i % gx; x1[x] = (i + 1) % gx; fx[x] = f * f * (3 - 2 * f);
      }
      for (let y = 0; y < H; y++) {
        const v = (y + 0.5) * gy / H, j = Math.floor(v); let g = v - j; g = g * g * (3 - 2 * g);
        const r0 = (j % gy) * gx, r1 = ((j + 1) % gy) * gx;
        let p = y * W;
        for (let x = 0; x < W; x++, p++) {
          const f = fx[x], a = lat[r0 + x0[x]], b = lat[r0 + x1[x]], c = lat[r1 + x0[x]], d = lat[r1 + x1[x]];
          const top = a + (b - a) * f, bot = c + (d - c) * f;
          out[p] += (top + (bot - top) * g) * amp;
        }
      }
      tot += amp; amp *= 0.5; cell *= 0.5;
    }
    const k = 1 / tot;
    for (let p = 0; p < out.length; p++) out[p] *= k;
    return out;
  }

  // Flou en boîte séparable (rayon r en px), bords repliés (wrap) ou bloqués.
  function flou(src, W, H, r, wrap) {
    r = Math.max(1, Math.round(r));
    const tmp = new Float32Array(W * H), out = new Float32Array(W * H), k = 1 / (2 * r + 1);
    const ix = (i, n) => (wrap ? ((i % n) + n) % n : i < 0 ? 0 : i >= n ? n - 1 : i);
    for (let y = 0; y < H; y++) {
      const o = y * W; let acc = 0;
      for (let i = -r; i <= r; i++) acc += src[o + ix(i, W)];
      for (let x = 0; x < W; x++) { tmp[o + x] = acc * k; acc += src[o + ix(x + r + 1, W)] - src[o + ix(x - r, W)]; }
    }
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) acc += tmp[ix(i, H) * W + x];
      for (let y = 0; y < H; y++) { out[y * W + x] = acc * k; acc += tmp[ix(y + r + 1, H) * W + x] - tmp[ix(y - r, H) * W + x]; }
    }
    return out;
  }

  // Transformée de distance euclidienne exacte (Felzenszwalb), en place sur des carrés.
  function edt1(f, n, d, v, z) {
    let k = 0; v[0] = 0; z[0] = -1e20; z[1] = 1e20;
    for (let q = 1; q < n; q++) {
      let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = 1e20;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; const dq = q - v[k]; d[q] = dq * dq + f[v[k]]; }
  }
  function edt2(g, W, H) {
    const n = Math.max(W, H), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) f[y] = g[y * W + x];
      edt1(f, H, d, v, z);
      for (let y = 0; y < H; y++) g[y * W + x] = d[y];
    }
    for (let y = 0; y < H; y++) {
      const o = y * W;
      for (let x = 0; x < W; x++) f[x] = g[o + x];
      edt1(f, W, d, v, z);
      for (let x = 0; x < W; x++) g[o + x] = d[x];
    }
  }
  // Distance signée au bord de la forme, en px : positive dedans, négative dehors.
  function distanceSignee(cov, W, H) {
    const N = W * H, a = new Float32Array(N), b = new Float32Array(N), D = new Float32Array(N);
    for (let p = 0; p < N; p++) { const dedans = cov[p] >= 0.5; a[p] = dedans ? 0 : 1e20; b[p] = dedans ? 1e20 : 0; }
    edt2(a, W, H); edt2(b, W, H);
    for (let p = 0; p < N; p++) {
      const c = cov[p];
      if (c > 0 && c < 1) D[p] = c - 0.5; // pixel de bord : position sous-pixel
      else D[p] = c >= 0.5 ? Math.sqrt(b[p]) - 0.5 : 0.5 - Math.sqrt(a[p]);
    }
    return D;
  }

  // ------------------------------------------------------------------ formes
  // Lecture d'un tracé SVG (M L H V C Q Z, absolus ou relatifs) en commandes absolues.
  function lirePath(d) {
    const tok = String(d).match(/[MLHVCQZmlhvcqz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
    const out = []; let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0;
    const num = () => +tok[i++];
    while (i < tok.length) {
      if (/[a-z]/i.test(tok[i])) cmd = tok[i++];
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0;
      if (C === 'Z') { out.push(['Z']); x = sx; y = sy; continue; }
      if (C === 'M') { x = ox + num(); y = oy + num(); sx = x; sy = y; out.push(['M', x, y]); cmd = rel ? 'l' : 'L'; }
      else if (C === 'L') { x = ox + num(); y = oy + num(); out.push(['L', x, y]); }
      else if (C === 'H') { x = ox + num(); out.push(['L', x, y]); }
      else if (C === 'V') { y = (rel ? y : 0) + num(); out.push(['L', x, y]); }
      else if (C === 'C') { const a = [ox + num(), oy + num(), ox + num(), oy + num(), ox + num(), oy + num()]; x = a[4]; y = a[5]; out.push(['C', ...a]); }
      else if (C === 'Q') { const a = [ox + num(), oy + num(), ox + num(), oy + num()]; x = a[2]; y = a[3]; out.push(['Q', ...a]); }
      else i++; // jeton inattendu : on l'ignore
    }
    return out;
  }
  const f2 = (v) => +v.toFixed(2);
  // Translate un tracé (sert à poser les lettres à droite du symbole).
  function deplacer(d, dx, dy) {
    return lirePath(d).map((c) => (c[0] === 'Z' ? 'Z' : c[0] + c.slice(1).map((v, k) => f2(v + (k % 2 ? dy : dx))).join(','))).join('');
  }
  // Aplatit un tracé en polygones (coordonnées px) après la transformation affine M.
  function aplatir(d, M) {
    const [a, b, c, dd, e, f] = M, T = (x, y) => [a * x + c * y + e, b * x + dd * y + f];
    const polys = []; let cur = null, px = 0, py = 0;
    for (const k of lirePath(d)) {
      if (k[0] === 'M') { cur = []; polys.push(cur); [px, py] = T(k[1], k[2]); cur.push(px, py); }
      else if (k[0] === 'L') { [px, py] = T(k[1], k[2]); cur.push(px, py); }
      else if (k[0] === 'C' || k[0] === 'Q') {
        const P = [];
        for (let m = 1; m < k.length; m += 2) P.push(...T(k[m], k[m + 1]));
        const cub = k[0] === 'C';
        const lg = Math.hypot(P[0] - px, P[1] - py) + Math.hypot(P[2] - P[0], P[3] - P[1]) + (cub ? Math.hypot(P[4] - P[2], P[5] - P[3]) : 0);
        const n = Math.max(3, Math.min(80, Math.ceil(lg / 2.5)));
        for (let s = 1; s <= n; s++) {
          const t = s / n, u = 1 - t;
          if (cub) cur.push(u * u * u * px + 3 * u * u * t * P[0] + 3 * u * t * t * P[2] + t * t * t * P[4], u * u * u * py + 3 * u * u * t * P[1] + 3 * u * t * t * P[3] + t * t * t * P[5]);
          else cur.push(u * u * px + 2 * u * t * P[0] + t * t * P[2], u * u * py + 2 * u * t * P[1] + t * t * P[3]);
        }
        px = cur[cur.length - 2]; py = cur[cur.length - 1];
      }
    }
    // retire le point de fermeture s'il double le premier
    for (const pl of polys) { const n = pl.length; if (n > 4 && Math.abs(pl[0] - pl[n - 2]) < 0.01 && Math.abs(pl[1] - pl[n - 1]) < 0.01) pl.length = n - 2; }
    return polys.filter((pl) => pl.length >= 6);
  }

  const T = window.MarqueTraces;
  const FORMES = (function () {
    if (!T) { console.error('MarqueTech : charger brand/traces.js avant brand/techniques.js'); return {}; }
    const lettres = T.ordre.map((k) => T.lettres[k]);
    const decalees = lettres.map((d) => deplacer(d, 227.05, 0));
    return {
      cran: { d: T.symbole, box: [0, 0, 191.05, 110], parts: [T.symbole] },
      logotype: { d: lettres.join(''), box: [0, 14, 487, 82], parts: lettres },
      logo: { d: T.symbole + decalees.join(''), box: [0, 0, 714, 110], parts: [T.symbole].concat(decalees) },
    };
  })();
  function resoudreForme(f) {
    if (typeof f === 'string') { if (!FORMES[f]) throw new Error('MarqueTech : forme inconnue ' + f); return FORMES[f]; }
    if (f && f.d && f.box) return { d: f.d, box: f.box, parts: f.parts || [f.d] };
    throw new Error('MarqueTech : forme attendue (cran, logotype, logo ou {d, box})');
  }

  // Place la forme (centrée, mise à l'échelle, tournée), la rastérise et mesure ses distances.
  function geometrie(forme, env, o) {
    const { W, H } = env, F = resoudreForme(forme), [bx, by, bw, bh] = F.box;
    const an = (o.angle || 0) * Math.PI / 180, co = Math.cos(an), si = Math.sin(an);
    const rw = Math.abs(bw * co) + Math.abs(bh * si), rh = Math.abs(bw * si) + Math.abs(bh * co);
    const s = Math.min(W * (1 - 2 * o.marge) / rw, H * (1 - 2 * o.marge) / rh) * o.zoom;
    const cx = bx + bw / 2, cy = by + bh / 2, a = s * co, b = s * si, c = -s * si, d = s * co;
    const M = [a, b, c, d, W / 2 - (a * cx + c * cy), H / 2 - (b * cx + d * cy)];
    const parts = F.parts.map((pd) => ({ polys: aplatir(pd, M) }));
    // masque antialiasé
    const cv = toile(W, H), g = ctx2d(cv);
    g.fillStyle = '#fff'; g.beginPath();
    for (const pt of parts) for (const pl of pt.polys) { g.moveTo(pl[0], pl[1]); for (let k = 2; k < pl.length; k += 2) g.lineTo(pl[k], pl[k + 1]); g.closePath(); }
    g.fill('nonzero');
    const im = g.getImageData(0, 0, W, H).data, cov = new Float32Array(W * H);
    for (let p = 0; p < cov.length; p++) cov[p] = im[p * 4 + 3] / 255;
    const D = distanceSignee(cov, W, H);
    // boîtes et épaisseur de chaque partie
    let X0 = 1e9, Y0 = 1e9, X1 = -1e9, Y1 = -1e9;
    for (const pt of parts) {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const pl of pt.polys) for (let k = 0; k < pl.length; k += 2) { x0 = Math.min(x0, pl[k]); x1 = Math.max(x1, pl[k]); y0 = Math.min(y0, pl[k + 1]); y1 = Math.max(y1, pl[k + 1]); }
      pt.box = [x0, y0, x1, y1];
      let dm = 0;
      for (let y = Math.max(0, y0 | 0); y < Math.min(H, Math.ceil(y1)); y++) for (let x = Math.max(0, x0 | 0); x < Math.min(W, Math.ceil(x1)); x++) dm = Math.max(dm, D[y * W + x]);
      pt.dmax = dm;
      X0 = Math.min(X0, x0); Y0 = Math.min(Y0, y0); X1 = Math.max(X1, x1); Y1 = Math.max(Y1, y1);
    }
    const dAt = (x, y) => { const xi = Math.round(x), yi = Math.round(y); return xi < 0 || yi < 0 || xi >= W || yi >= H ? -1e9 : D[yi * W + xi]; };
    return { parts, cov, D, dAt, box: [X0, Y0, X1 - X0, Y1 - Y0], echelle: s };
  }

  // Parcourt les contours tous les `pas` px : fn(x, y, nx, ny, tx, ty) avec n la normale sortante.
  function parcourir(geo, pas, lissage, fn) {
    for (const pt of geo.parts) for (const pl of pt.polys) {
      const n = pl.length / 2, cum = new Float64Array(n + 1);
      for (let k = 0; k < n; k++) { const k2 = (k + 1) % n; cum[k + 1] = cum[k] + Math.hypot(pl[2 * k2] - pl[2 * k], pl[2 * k2 + 1] - pl[2 * k + 1]); }
      const Lp = cum[n]; if (Lp < pas * 3) continue;
      const at = (s) => {
        s = ((s % Lp) + Lp) % Lp; let lo = 0, hi = n;
        while (hi - lo > 1) { const mi = (lo + hi) >> 1; if (cum[mi] <= s) lo = mi; else hi = mi; }
        const k2 = (lo + 1) % n, t = (s - cum[lo]) / Math.max(1e-9, cum[lo + 1] - cum[lo]);
        return [pl[2 * lo] + (pl[2 * k2] - pl[2 * lo]) * t, pl[2 * lo + 1] + (pl[2 * k2 + 1] - pl[2 * lo + 1]) * t];
      };
      const cnt = Math.round(Lp / pas);
      for (let q = 0; q < cnt; q++) {
        const s = q * Lp / cnt, P = at(s), A = at(s - lissage), B = at(s + lissage);
        let tx = B[0] - A[0], ty = B[1] - A[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        let nx = ty, ny = -tx; // normale candidate, orientée vers l'extérieur ci-dessous
        if (geo.dAt(P[0] + nx * 2, P[1] + ny * 2) > geo.dAt(P[0] - nx * 2, P[1] - ny * 2)) { nx = -nx; ny = -ny; }
        fn(P[0], P[1], nx, ny, tx, ty);
      }
    }
  }

  // ------------------------------------------------------------------ tissus
  // Maille jersey : colonnes de mailles en V. Hauteur 0..1 d'un point (x, y).
  function jersey(x, y, cw, rh) {
    const u = x / cw, v = y / rh, i = Math.floor(u), j = Math.floor(v), fx = u - i, fy = v - j;
    const lc = 0.46 - 0.30 * (1 - fy), hw = 0.26; // jambe gauche : écartée en haut, resserrée en bas
    const tl = (fx - lc) / hw, tr = (fx - 1 + lc) / hw;
    const hl = tl * tl < 1 ? (1 - tl * tl) * (1 - tl * tl) : 0, hr = tr * tr < 1 ? (1 - tr * tr) * (1 - tr * tr) : 0;
    return Math.max(hl, hr) * (0.62 + 0.38 * Math.sqrt(Math.sin(Math.PI * fy)));
  }

  // Matières du tissu (brillance des fibres).
  const MAT_TISSU = {
    maille: { ks: 0.36, shin: 11, kv: 0.10 }, serge: { ks: 0.32, shin: 9, kv: 0.08 },
    coton: { ks: 0.26, shin: 7, kv: 0.16 }, molleton: { ks: 0.14, shin: 5, kv: 0.36 },
  };

  // Relief et albédo du tissu. h en px, a multiplicateur d'albédo, creux 0..1 (trous).
  function genTissu(type, env, seed) {
    const { W, H, mm } = env, N = W * H;
    const h = new Float32Array(N), a = new Float32Array(N), creux = new Float32Array(N);
    if (type === 'serge') {
      // Sergé 2/1 : chaque cellule montre la chaîne (verticale) ou la trame (horizontale) ;
      // les flottés de chaîne décalés d'une cellule à chaque rang dessinent les diagonales.
      const nx = Math.max(3, Math.round(W / (0.36 * mm) / 3) * 3), ny = Math.max(3, Math.round(H / (0.36 * mm) / 3) * 3);
      const cx = W / nx, cy = H / ny, amp = 0.16 * mm;
      const st = champ(W, H, 0.05 * mm, seed + 2, 2, 0.5, 4), sh = champ(W, H, 0.05 * mm, seed + 3, 2, 4, 0.5);
      const low = champ(W, H, 4 * mm, seed + 4, 2);
      const up = (i, j) => (((i + j) % 3) + 3) % 3 !== 0;
      for (let y = 0, p = 0; y < H; y++) {
        const v = y / cy, j = Math.floor(v), fy = v - j, jm = (j - 1 + ny) % ny, jp = (j + 1) % ny;
        for (let x = 0; x < W; x++, p++) {
          const u = x / cx, i = Math.floor(u), fx = u - i;
          let hh, tone, tw, fib;
          if (up(i, j)) { // chaîne au-dessus
            const t = 2 * fx - 1, prof = 0.5 + 0.5 * Math.cos(Math.PI * t); // profil doux : pas de moiré
            let e = 1; if (!up(i, jm)) e *= lisse(0, 0.38, fy); if (!up(i, jp)) e *= lisse(1, 0.62, fy);
            hh = prof * (0.45 + 0.55 * e); tw = Math.sin(6.2832 * (fy * 1.7 + fx * 0.9)); fib = st[p];
            tone = 1 + 0.10 * (hash2(i % nx, 0, seed) - 0.5);
          } else { // trame au-dessus, flotté d'une seule cellule
            const t = 2 * fy - 1, prof = 0.5 + 0.5 * Math.cos(Math.PI * t);
            const e = lisse(0, 0.32, fx) * lisse(1, 0.68, fx);
            hh = prof * (0.40 + 0.5 * e); tw = Math.sin(6.2832 * (fx * 1.7 - fy * 0.9)); fib = sh[p];
            tone = 0.90 + 0.10 * (hash2(0, j % ny, seed + 9) - 0.5);
          }
          h[p] = (hh + 0.07 * tw + 0.25 * (fib - 0.5)) * amp + (low[p] - 0.5) * 0.12 * mm;
          a[p] = tone * (0.74 + 0.30 * hh + 0.25 * (fib - 0.5));
        }
      }
    } else if (type === 'coton') {
      // Jersey de coton : colonnes de mailles en V, fils duveteux.
      const cw = per(W, 0.80 * mm), rh = per(H, 0.58 * mm), amp = 0.17 * mm;
      const st = champ(W, H, 0.045 * mm, seed + 2, 2, 0.4, 3), fz = champ(W, H, 0.03 * mm, seed + 5, 1);
      const low = champ(W, H, 3.5 * mm, seed + 3, 2);
      const ncol = Math.round(W / cw);
      for (let y = 0, p = 0; y < H; y++) for (let x = 0; x < W; x++, p++) {
        const k = jersey(x, y, cw, rh), col = hash2(Math.floor(x / cw) % ncol, 1, seed);
        h[p] = (k * (0.8 + 0.4 * st[p]) + 0.12 * (fz[p] - 0.5)) * amp + (low[p] - 0.5) * 0.10 * mm;
        a[p] = (0.66 + 0.40 * k) * (0.96 + 0.08 * col) * (0.9 + 0.2 * st[p]);
        creux[p] = (1 - k) * 0.25;
      }
    } else if (type === 'molleton') {
      // Molleton bouclette : petites boucles de fil couchées, duvet par-dessus.
      const nxl = Math.max(2, Math.round(W / (0.62 * mm))), nyl = Math.max(2, Math.round(H / (0.62 * mm)));
      const gx = W / nxl, gy = H / nyl, amp = 0.16 * mm, ep = 0.06 * mm;
      const fz = champ(W, H, 0.035 * mm, seed + 5, 2), low = champ(W, H, 1.6 * mm, seed + 6, 3);
      for (let y = 0, p = 0; y < H; y++) {
        const j = Math.floor(y / gy);
        for (let x = 0; x < W; x++, p++) {
          const i = Math.floor(x / gx); let best = 0;
          for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
            const ii = i + di, jj = j + dj, wi = ((ii % nxl) + nxl) % nxl, wj = ((jj % nyl) + nyl) % nyl;
            const h1 = hash2(wi, wj, seed + 21), h2 = hash2(wi, wj, seed + 22), h3 = hash2(wi, wj, seed + 23);
            const ox = (ii + 0.2 + 0.6 * h1) * gx, oy = (jj + 0.2 + 0.6 * h2) * gy;
            const r = gx * (0.24 + 0.16 * h3), dx = x - ox, dy = (y - oy) * (1.15 - 0.3 * h1);
            const q = (Math.sqrt(dx * dx + dy * dy) - r) / ep, v = Math.exp(-q * q) * (0.55 + 0.45 * h2);
            if (v > best) best = v;
          }
          h[p] = (best * 0.75 + (fz[p] - 0.5) * 0.7 + (low[p] - 0.5) * 0.9) * amp;
          a[p] = (0.80 + 0.28 * best + 0.16 * (fz[p] - 0.5)) * (0.94 + 0.12 * low[p]);
        }
      }
    } else {
      // Maille sport perforée : jersey fin percé de trous en quinconce.
      const P = per(W, 1.55 * mm);
      let ny = Math.max(2, Math.round(H / (P * 0.866))); if (ny % 2) ny++;
      const Py = H / ny, nxh = Math.round(W / P), r0 = 0.25 * P, ar = 0.05 * mm;
      const cw = per(W, 0.30 * mm), rh = per(H, 0.23 * mm), amp = 0.10 * mm, prof = 0.30 * mm;
      const nf = champ(W, H, 0.12 * mm, seed + 1, 2), st = champ(W, H, 0.04 * mm, seed + 2, 1, 0.4, 3);
      const low = champ(W, H, 4 * mm, seed + 4, 2);
      for (let y = 0, p = 0; y < H; y++) {
        const j = Math.floor(y / Py), fy = y / Py - j, off = (j & 1) ? P / 2 : 0, dy = (fy - 0.5) * Py;
        for (let x = 0; x < W; x++, p++) {
          const xx = x + off, i = Math.floor(xx / P), dx = xx - (i + 0.5) * P;
          const d = Math.sqrt(dx * dx + dy * dy * 1.12);
          const rr = r0 * (0.86 + 0.24 * nf[p]) * (0.93 + 0.14 * hash2(i % nxh, j % ny, seed));
          const trou = lisse(rr + ar, rr - ar, d);
          const k = jersey(x, y, cw, rh), rim = Math.exp(-Math.pow((d - rr) / (0.2 * P), 2));
          h[p] = ((k * 0.6 + rim * 0.55 + (st[p] - 0.5) * 0.4) * amp + (low[p] - 0.5) * 0.10 * mm) * (1 - trou) - trou * prof;
          a[p] = (0.78 + 0.28 * k + 0.18 * (st[p] - 0.5)) * (1 - trou * 0.88);
          creux[p] = trou;
        }
      }
    }
    return { h, a, creux };
  }

  // ------------------------------------------------------------------ éclairage
  // Ombres portées : depuis chaque pixel on marche vers la lumière ; si le relief passe
  // au-dessus du rayon, le pixel est à l'ombre (pénombre qui s'élargit avec la distance).
  function ombres(h, env) {
    const { W, H, mm, wrap } = env, out = new Float32Array(W * H);
    const ds = []; for (let d = 1; d < 3.2 * mm; d = d * 1.25 + 0.7) ds.push(d);
    const n = ds.length, ox = new Int32Array(n), oy = new Int32Array(n), mo = new Float32Array(n), so = new Float32Array(n);
    for (let k = 0; k < n; k++) { ox[k] = Math.round(LDX * ds[k]); oy[k] = Math.round(LDY * ds[k]); mo[k] = ds[k] * TAN_E; so[k] = 1 / (0.6 + 0.16 * ds[k]); }
    let hmax = -1e9; for (let p = 0; p < h.length; p++) if (h[p] > hmax) hmax = h[p];
    for (let y = 0, p = 0; y < H; y++) for (let x = 0; x < W; x++, p++) {
      const h0 = h[p]; let occ = 0;
      for (let k = 0; k < n; k++) {
        if (h0 + mo[k] >= hmax) break; // plus rien ne peut dépasser le rayon
        let qx = x + ox[k], qy = y + oy[k];
        if (wrap) { qx = ((qx % W) + W) % W; qy = ((qy % H) + H) % H; } else if (qx < 0 || qy < 0) break;
        const v = (h[qy * W + qx] - h0 - mo[k]) * so[k];
        if (v > occ) occ = v;
      }
      out[p] = 1 - c01(occ);
    }
    return out;
  }
  // Épaule douce : garde du détail dans les hautes lumières (fil blanc, fluo).
  const epaule = (v) => (v <= 0 ? 0 : v < 0.82 ? v : 0.82 + 0.18 * (1 - Math.exp(-(v - 0.82) / 0.18)));

  // Calcule l'image finale à partir de la scène S = { h, ar, ag, ab, m, add }.
  function ombrer(canvas, env, S, mf, mk, opt) {
    const { W, H, mm, wrap } = env, h = S.h, N = W * H;
    if (opt.transparent) for (let p = 0; p < N; p++) if (S.m[p] <= 0) h[p] = 0; // sans tissu : sol plat
    const sh = ombres(h, env);
    const rb = Math.max(1, 0.3 * mm), hb = flou(flou(h, W, H, rb, wrap), W, H, rb, wrap);
    const kao = 0.55 / (0.2 * mm), mkk = mk || mf, add = S.add;
    const ctx = canvas.getContext('2d'), img = ctx.createImageData(W, H), px = img.data;
    const vig = opt.vignette || 0, gseed = (opt.seed | 0) + 77;
    for (let y = 0, p = 0; y < H; y++) {
      const ym = y > 0 ? y - 1 : wrap ? H - 1 : 0, yp = y < H - 1 ? y + 1 : wrap ? 0 : H - 1;
      for (let x = 0; x < W; x++, p++) {
        const xm = x > 0 ? x - 1 : wrap ? W - 1 : 0, xp = x < W - 1 ? x + 1 : wrap ? 0 : W - 1;
        let nx = -(h[y * W + xp] - h[y * W + xm]) * 0.5, ny = -(h[yp * W + x] - h[ym * W + x]) * 0.5, nz = 1;
        const il = 1 / Math.sqrt(nx * nx + ny * ny + 1); nx *= il; ny *= il; nz *= il;
        const s = sh[p], ndl = nx * L[0] + ny * L[1] + nz * L[2];
        const dif = ndl > 0 ? (ndl / L[2]) * s : 0;
        let ao = 1 - (hb[p] - h[p]) * kao; ao = ao < 0.25 ? 0.25 : ao > 1.12 ? 1.12 : ao;
        const m = S.m[p], ks = mf.ks + (mkk.ks - mf.ks) * m, shin = mf.shin + (mkk.shin - mf.shin) * m, kv = mf.kv + (mkk.kv - mf.kv) * m;
        const ndh = nx * HV[0] + ny * HV[1] + nz * HV[2];
        const spec = ndh > 0 ? ks * Math.pow(ndh, shin) * s : 0;
        const vel = kv * (1 - nz) * 5 * (0.4 + 0.6 * s);
        let lum = 0.34 * ao + 0.66 * dif * (0.55 + 0.45 * ao);
        if (vig) { const u = x / W - 0.5, v = y / H - 0.5; lum *= 1 + vig * (0.07 - 0.14 * (u + v + 1) * 0.5 - 0.22 * (u * u + v * v)); }
        const ex = spec + (add ? add[p] * s : 0) + (hash2(x, y, gseed) - 0.5) * 0.012;
        let r = S.ar[p] * (lum + vel) + ex, g = S.ag[p] * (lum + vel) + ex, b = S.ab[p] * (lum + vel) + ex;
        const q = p * 4;
        if (opt.transparent) {
          // marquage seul, et son ombre en noir semi-transparent autour
          const dark = c01(1 - (0.3 + 0.7 * s) * Math.min(1, ao)) * 0.9, al = m + (1 - m) * dark;
          px[q] = epaule(r) * 255 * m / (al || 1); px[q + 1] = epaule(g) * 255 * m / (al || 1); px[q + 2] = epaule(b) * 255 * m / (al || 1); px[q + 3] = al * 255;
        } else { px[q] = epaule(r) * 255; px[q + 1] = epaule(g) * 255; px[q + 2] = epaule(b) * 255; px[q + 3] = 255; }
      }
    }
    ctx.putImageData(img, 0, 0);
    return ctx;
  }

  // ------------------------------------------------------------------ broderie
  // Arêtes des polygones dans le repère du point : a le long du fil, b en travers.
  function aretes(polys, ux, uy) {
    const e = []; let bmin = 1e9, bmax = -1e9;
    for (const pl of polys) {
      const n = pl.length / 2;
      for (let k = 0; k < n; k++) {
        const k2 = (k + 1) % n, x0 = pl[2 * k], y0 = pl[2 * k + 1], x1 = pl[2 * k2], y1 = pl[2 * k2 + 1];
        const b0 = -x0 * uy + y0 * ux, b1 = -x1 * uy + y1 * ux;
        e.push(x0 * ux + y0 * uy, b0, x1 * ux + y1 * uy, b1);
        bmin = Math.min(bmin, b0); bmax = Math.max(bmax, b0);
      }
    }
    return { e: Float64Array.from(e), bmin, bmax };
  }
  // Intervalles [a0, a1, a0, a1…] de la ligne b à l'intérieur de la forme (règle non nulle).
  function intervalles(E, b) {
    const e = E.e, xs = [];
    for (let k = 0; k < e.length; k += 4) {
      const b0 = e[k + 1], b1 = e[k + 3];
      if ((b0 <= b) !== (b1 <= b)) { const t = (b - b0) / (b1 - b0); xs.push([e[k] + (e[k + 2] - e[k]) * t, b1 > b0 ? 1 : -1]); }
    }
    xs.sort((p, q) => p[0] - q[0]);
    const out = []; let w = 0;
    for (const [a, s] of xs) { const avant = w; w += s; if (avant === 0 && w !== 0) out.push(a); else if (avant !== 0 && w === 0) out.push(a); }
    if (out.length % 2) out.pop();
    return out;
  }
  // Angle des points qui rend les points les plus courts (donc en travers des traits).
  function angleAuto(polys, pas) {
    let best = Math.PI / 2, bv = Infinity;
    for (let deg = 5; deg < 180; deg += 10) {
      const an = deg * Math.PI / 180, E = aretes(polys, Math.cos(an), Math.sin(an));
      let tot = 0, cnt = 0;
      for (let b = E.bmin + pas; b < E.bmax; b += pas * 2.5) { const iv = intervalles(E, b); for (let m = 0; m < iv.length; m += 2) { tot += iv[m + 1] - iv[m]; cnt++; } }
      const v = cnt ? tot / cnt : Infinity;
      if (v < bv) { bv = v; best = an; }
    }
    return best;
  }
  // La liste des points, dans l'ordre de couture : remplissage puis bourdon de contour.
  function coudre(geo, env, pas, larg, rng) {
    const { mm } = env, out = [], ret = larg * 0.5;
    const code = (dx, dy) => Math.round((((Math.atan2(dy, dx) % Math.PI) + Math.PI) % Math.PI) / Math.PI * 255);
    for (const part of geo.parts) {
      const large = part.dmax > 2.2 * mm;
      const an = angleAuto(part.polys, pas), ux = Math.cos(an), uy = Math.sin(an), cd = code(ux, uy);
      const E = aretes(part.polys, ux, uy);
      const Lsat = Math.min(6.5 * mm, Math.max(1.8 * mm, 4.6 * part.dmax)), Lseg = large ? 3.0 * mm : Math.max(1.4 * mm, Lsat * 0.55);
      let k = 0;
      for (let b = E.bmin + pas * 0.5; b < E.bmax; b += pas, k++) {
        const iv = intervalles(E, b);
        for (let m = 0; m < iv.length; m += 2) {
          const len = iv[m + 1] - iv[m]; if (len < pas * 0.5) continue;
          // extrémités : le point dépasse ou manque le bord de quelques dixièmes (bord dentelé)
          const a0 = iv[m] + ret - 0.05 * mm + (rng() - 0.5) * 0.12 * mm, a1 = iv[m + 1] - ret + 0.05 * mm - (rng() - 0.5) * 0.12 * mm;
          const cuts = [a0];
          if (large || len > Lsat) { // trop long : on découpe en rangs décalés (tatami)
            const dec = (((k * 2) % 5) / 5) * Lseg;
            for (let a = a0 + dec; a < a1 - 0.35 * Lseg; a += Lseg) if (a > a0 + 0.35 * Lseg) cuts.push(a);
          }
          cuts.push(a1);
          const segs = [];
          for (let q = 0; q + 1 < cuts.length; q++) {
            // entre deux points d'un même rang, l'aiguille pique : petit creux entre les extrémités
            const s0 = cuts[q] + (q > 0 ? larg * 0.3 : 0), s1 = cuts[q + 1] - (q + 2 < cuts.length ? larg * 0.3 : 0);
            if (s1 > s0 - larg * 0.3) segs.push([s0, s1]);
          }
          if (k & 1) segs.reverse();
          for (const [s0, s1] of segs) {
            const A = (k & 1) ? s1 : s0, B = (k & 1) ? s0 : s1;
            out.push({ x0: A * ux - b * uy, y0: A * uy + b * ux, x1: B * ux - b * uy, y1: B * uy + b * ux, bord: false, teinte: Math.floor(rng() * 256), code: cd });
          }
        }
      }
      if (!large) continue;
      // bourdon de contour : colonne satinée perpendiculaire au bord, légèrement inclinée
      const bw = 1.15 * mm; let z = 0;
      const sub = { parts: [part], dAt: geo.dAt };
      parcourir(sub, 0.36 * mm, 0.3 * mm, (x, y, nx, ny, tx, ty) => {
        let dx = -nx + tx * 0.22, dy = -ny + ty * 0.22; const dl = Math.hypot(dx, dy); dx /= dl; dy /= dl; // vers l'intérieur
        const jo = 0.05 * mm + (rng() - 0.5) * 0.08 * mm, ji = bw * (0.93 + 0.14 * rng());
        const xo = x + dx * (ret - jo), yo = y + dy * (ret - jo), xi = x + dx * (ji - ret), yi = y + dy * (ji - ret);
        const st = (z++ & 1) ? { x0: xo, y0: yo, x1: xi, y1: yi } : { x0: xi, y0: yi, x1: xo, y1: yo };
        st.bord = true; st.teinte = Math.floor(rng() * 256); st.code = code(dx, dy);
        out.push(st);
      });
    }
    return out;
  }
  // Profil d'un fil (section ronde) obtenu en empilant des traits de plus en plus fins et clairs.
  const ANNEAUX = [[1, 0], [0.88, 0.47], [0.74, 0.67], [0.58, 0.81], [0.40, 0.92], [0.20, 0.98]];

  function broderie(env, geo, fab, S, o) {
    const { W, H, mm } = env, N = W * H, rng = alea(o.seed * 101 + 7);
    const pas = 0.40 * mm, larg = 1.42 * pas;
    const pts = coudre(geo, env, pas, larg, rng);
    // 1. relief (max des dômes) et attributs (teinte, sens du fil) dans l'ordre de couture
    const ch = toile(W, H), gh = ctx2d(ch), ca = toile(W, H), ga = ctx2d(ca);
    gh.fillStyle = '#000'; gh.fillRect(0, 0, W, H); gh.globalCompositeOperation = 'lighten';
    gh.lineCap = ga.lineCap = 'round';
    const fait = o.p * pts.length, n = Math.min(pts.length, Math.ceil(fait));
    for (let k = 0; k < n; k++) {
      const st = pts[k], f = Math.min(1, fait - k);
      const x1 = st.x0 + (st.x1 - st.x0) * f, y1 = st.y0 + (st.y1 - st.y0) * f;
      const base = st.bord ? 0.40 : 0.26, amp = st.bord ? 0.60 : 0.56;
      for (const [lw, v] of ANNEAUX) {
        const g = Math.round(255 * (base + amp * v));
        gh.lineWidth = larg * lw; gh.strokeStyle = 'rgb(' + g + ',' + g + ',' + g + ')';
        gh.beginPath(); gh.moveTo(st.x0, st.y0); gh.lineTo(x1, y1); gh.stroke();
      }
      ga.lineWidth = larg; ga.strokeStyle = 'rgb(' + st.teinte + ',' + st.code + ',255)';
      ga.beginPath(); ga.moveTo(st.x0, st.y0); ga.lineTo(x1, y1); ga.stroke();
    }
    const hd = gh.getImageData(0, 0, W, H).data, ad = ga.getImageData(0, 0, W, H).data;
    // 2. le tissu se fronce autour (lèvre tirée vers la broderie, plis parallèles au bord)
    const ond = champ(W, H, 2.6 * mm, o.seed + 51, 2), D = geo.D, pk = o.p;
    if (pk > 0) for (let p = 0; p < N; p++) {
      const d = -D[p]; if (d <= 0 || d > 4.5 * mm) continue;
      S.h[p] += pk * mm * (0.10 * Math.exp(-d / (0.45 * mm)) + 0.045 * Math.exp(-d / (1.8 * mm)) * Math.sin(6.2832 * d / (1.5 * mm) + ond[p] * 9));
    }
    // 3. les fils : relief, torsion du fil, teinte qui varie d'un point à l'autre
    // torsion : fines stries obliques le long du fil (brins du fil retors), très peu de relief
    const c = rgb(o.c), hMax = 0.50 * mm, tors = 0.006 * mm, kph = 1 / (0.07 * pas);
    for (let y = 0, p = 0; y < H; y++) for (let x = 0; x < W; x++, p++) {
      const q = p * 4, cov = ad[q + 3] / 255; if (cov === 0) continue;
      const th = ad[q + 1] / 255 * Math.PI, ux = Math.cos(th), uy = Math.sin(th);
      const ph = Math.sin(((x * ux + y * uy) * 0.6 + (-x * uy + y * ux) * 0.8) * kph);
      const hh = (hd[q] / 255) * hMax + tors * ph;
      S.h[p] += (hh - S.h[p]) * cov;
      const mod = (0.93 + 0.08 * ad[q] / 255) * (1 + 0.035 * ph);
      S.ar[p] += (c[0] * mod - S.ar[p]) * cov; S.ag[p] += (c[1] * mod - S.ag[p]) * cov; S.ab[p] += (c[2] * mod - S.ab[p]) * cov;
      S.m[p] = cov;
    }
    return null;
  }
  broderie.mat = { ks: 0.5, shin: 18, kv: 0.0 };

  // ------------------------------------------------------------------ sérigraphie
  function serigraphie(env, geo, fab, S, o) {
    const { W, H, mm } = env, N = W * H, D = geo.D;
    const bav = champ(W, H, 0.10 * mm, o.seed + 11, 2), tr = champ(W, H, 0.045 * mm, o.seed + 12, 1);
    let hmin = 1e9, hmax = -1e9; for (let p = 0; p < N; p++) { if (fab.creux[p] < 0.5) { hmin = Math.min(hmin, fab.h[p]); hmax = Math.max(hmax, fab.h[p]); } }
    const hr = 1 / Math.max(1e-6, hmax - hmin), c = rgb(o.c), c2 = o.c2 ? rgb(o.c2) : null;
    const ep = 0.075 * mm;
    // l'encre nappe le relief : elle garde les mailles et les creux, pas le duvet des fibres
    const hs = flou(flou(fab.h, W, H, 0.06 * mm, env.wrap), W, H, 0.06 * mm, env.wrap);
    // raclette : traverse de gauche à droite, légèrement inclinée ; l'encre suit son sillage
    const anim = o.p < 1, tilt = Math.tan(6 * Math.PI / 180), xr = -0.12 * W + o.p * 1.4 * W;
    if (anim) S.add = new Float32Array(N);
    // seconde passe : décalée (défaut de repérage), en trame de points à 45°
    const ox = 0.32 * mm, oy = 0.22 * mm, pitch = 0.58 * mm, [bx, by, bw, bh] = geo.box;
    for (let y = 0, p = 0; y < H; y++) for (let x = 0; x < W; x++, p++) {
      const hn = c01((fab.h[p] - hmin) * hr), bv = bav[p];
      let rac = 1;
      if (anim) { const xb = x + (y - H / 2) * tilt; rac = c01((xr - xb) / 2); if (rac === 0) continue; }
      // l'encre épaisse recouvre les creux de la maille, ne fait que s'y enfoncer (cuvette plus sombre)
      const trou = lisse(0.45, 0.95, fab.creux[p]);
      let cov = c01(D[p] + (bv - 0.5) * 0.22 * mm + (hn - 0.5) * 0.07 * mm + 0.5) * (1 - trou * 0.08);
      cov *= rac;
      // micro-manques : rares piqûres où l'encre n'a pas pris (surtout dans les creux) ; l'encre reste à plat
      const t = tr[p], manque = t > 0.84 ? lisse(0.84, 0.93, t) * (0.25 + 0.75 * (1 - hn)) : 0;
      let cov2 = 0;
      if (c2) {
        const xs = x - ox, ys = y - oy, Ds = geo.dAt(xs, ys);
        if (Ds > -2 * mm) {
          const tt = ((xs - bx) / bw * 0.55 + (ys - by) / bh * 0.45), tone = lisse(0.12, 0.95, tt);
          const gu = (xs + ys) * 0.7071 / pitch, gv = (ys - xs) * 0.7071 / pitch;
          const fu = gu - Math.round(gu), fv = gv - Math.round(gv), dist = Math.hypot(fu, fv) * pitch;
          const r = pitch * 0.64 * Math.sqrt(tone) + (bv - 0.5) * 0.05 * mm;
          cov2 = c01(r - dist + 0.5) * c01(Ds + (bv - 0.5) * 0.2 * mm + 0.5) * (1 - trou * 0.08) * rac;
        }
      }
      if (cov === 0 && cov2 === 0) continue;
      const shade = (0.9 + 0.1 * hn) * (1 - 0.12 * trou);
      S.h[p] = fab.h[p] * (1 - cov) + hs[p] * (0.45 - 0.3 * trou) * cov + cov * ep * (0.96 + 0.08 * bv) + cov2 * ep * 0.35;
      const cc = cov * (1 - 0.85 * manque), cc2 = cov2 * (1 - 0.85 * manque);
      S.ar[p] += (c[0] * shade - S.ar[p]) * cc; S.ag[p] += (c[1] * shade - S.ag[p]) * cc; S.ab[p] += (c[2] * shade - S.ab[p]) * cc;
      if (cc2 > 0) { S.ar[p] += (c2[0] * shade - S.ar[p]) * cc2; S.ag[p] += (c2[1] * shade - S.ag[p]) * cc2; S.ab[p] += (c2[2] * shade - S.ab[p]) * cc2; }
      S.m[p] = Math.max(cov, cov2);
      if (anim) { const xb = x + (y - H / 2) * tilt; S.add[p] = 0.22 * Math.exp(-(xr - xb) / (2.5 * mm)) * S.m[p]; } // encre encore humide
    }
    if (!anim) return null;
    return (ctx) => { // la raclette, vue de dessus
      const u = (v) => v * mm; ctx.save(); ctx.transform(1, 0, -tilt, 1, xr, H / 2);
      const Y = H * 0.7;
      ctx.filter = 'blur(' + u(1.1) + 'px)'; ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(u(-4.2) + u(2.2), -Y, u(6.6), 2 * Y); ctx.filter = 'none';
      const gb = ctx.createLinearGradient(u(0.5), 0, u(2.2), 0); // bourrelet d'encre poussé par la lame
      const col = 'rgb(' + c.map((v) => Math.round(v * 255)).join(',') + ')';
      gb.addColorStop(0, col); gb.addColorStop(0.3, '#FFFFFF'); gb.addColorStop(0.42, col); gb.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gb; ctx.fillRect(u(0.5), -Y, u(1.7), 2 * Y);
      const gm = ctx.createLinearGradient(u(-4.2), 0, u(0.6), 0); // manche en aluminium
      gm.addColorStop(0, '#FFFFFF'); gm.addColorStop(0.06, '#56565A'); gm.addColorStop(0.5, '#404042'); gm.addColorStop(0.9, '#272728'); gm.addColorStop(1, '#101012');
      ctx.fillStyle = gm; ctx.fillRect(u(-4.2), -Y, u(4.8), 2 * Y);
      ctx.fillStyle = '#03010E'; ctx.fillRect(u(0.35), -Y, u(0.25), 2 * Y); // arête de la lame
      ctx.restore();
    };
  }
  serigraphie.mat = { ks: 0.07, shin: 8, kv: 0.04 };

  // ------------------------------------------------------------------ DTF
  function dtf(env, geo, fab, S, o) {
    const { W, H, mm, wrap } = env, N = W * H, D = geo.D;
    const hb = flou(flou(fab.h, W, H, 0.5 * mm, wrap), W, H, 0.5 * mm, wrap); // le film ne garde que le grand relief
    const mic = champ(W, H, 0.45 * mm, o.seed + 21, 3), c = rgb(o.c);
    const ep = 0.05 * mm, lis = Math.max(1.2, 0.07 * mm), [bx, by, bw, bh] = geo.box;
    S.add = new Float32Array(N);
    for (let y = 0, p = 0; y < H; y++) for (let x = 0; x < W; x++, p++) {
      const d = D[p], cov = c01(d + 0.5); if (cov === 0) continue;
      const bev = lisse(-0.5, 0.1 * mm, d);
      const hh = hb[p] * 0.55 + ep * bev + (mic[p] - 0.5) * 0.02 * mm;
      S.h[p] += (hh - S.h[p]) * cov;
      const rim = d < lis ? (1 - c01(d / lis)) * 0.5 : 0; // liseré clair (sous-couche blanche)
      S.ar[p] += (c[0] + (1 - c[0]) * rim - S.ar[p]) * cov; S.ag[p] += (c[1] + (1 - c[1]) * rim - S.ag[p]) * cov; S.ab[p] += (c[2] + (1 - c[2]) * rim - S.ab[p]) * cov;
      const q = ((x - bx) / bw + (y - by) / bh) * 0.5; // reflet large en diagonale
      const band = 0.42 * Math.exp(-Math.pow((q - 0.38) / 0.12, 2)) + 0.16 * Math.exp(-Math.pow((q - 0.64) / 0.035, 2));
      S.add[p] = band * cov * (0.7 + 0.6 * mic[p]);
      S.m[p] = cov;
    }
    if (o.p >= 1) return null;
    return (ctx) => { // le film support se décolle en biais, du haut gauche vers le bas droit
      const f = -0.1 + o.p * 1.25, nl = Math.hypot(1 / W, 1 / H), an = Math.atan2(1 / H / nl, 1 / W / nl), big = W + H;
      ctx.save(); ctx.translate(f * W, f * H); ctx.rotate(an);
      const wc = 2.2 * mm;
      ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.fillRect(0, -big, big * 2, big * 2); // film laiteux encore posé
      const gs = ctx.createLinearGradient(0, 0, big * 0.5, 0); gs.addColorStop(0, 'rgba(255,255,255,0)'); gs.addColorStop(0.35, 'rgba(255,255,255,0.10)'); gs.addColorStop(0.5, 'rgba(255,255,255,0)');
      ctx.fillStyle = gs; ctx.fillRect(0, -big, big, big * 2);
      const go = ctx.createLinearGradient(0, 0, 3 * mm, 0); go.addColorStop(0, 'rgba(0,0,0,0.5)'); go.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = go; ctx.fillRect(0, -big, 3 * mm, big * 2); // ombre de la boucle sur le film
      const gc = ctx.createLinearGradient(-wc, 0, 0, 0); // la boucle du film, éclairée par la gauche
      gc.addColorStop(0, 'rgba(255,255,255,0.05)'); gc.addColorStop(0.3, 'rgba(255,255,255,0.75)'); gc.addColorStop(0.55, 'rgba(255,255,255,0.28)');
      gc.addColorStop(0.85, 'rgba(64,64,66,0.55)'); gc.addColorStop(1, 'rgba(255,255,255,0.35)');
      ctx.fillStyle = gc; ctx.fillRect(-wc, -big, wc, big * 2);
      ctx.restore();
    };
  }
  dtf.mat = { ks: 0.55, shin: 90, kv: 0 };

  // ------------------------------------------------------------------ flocage
  function flocage(env, geo, fab, S, o) {
    const { W, H, mm } = env, D = geo.D, rng = alea(o.seed * 31 + 5);
    const fr = champ(W, H, 0.04 * mm, o.seed + 31, 2), poil = champ(W, H, 1.3 * mm, o.seed + 32, 3, 2.2, 0.7);
    const c = rgb(o.c), ep = 0.30 * mm, fra = 0.09 * mm;
    const pose = o.p >= 0.3; // le velours n'existe qu'une fois la presse posée
    if (pose) for (let y = 0, p = 0; y < H; y++) for (let x = 0; x < W; x++, p++) {
      const e = D[p] + (fr[p] - 0.5) * 2 * fra, cov = c01(e + 0.5); if (cov === 0) continue;
      const bev = lisse(-0.4, 0.06 * mm + 1, e), pl = (poil[p] - 0.5) * 2;
      const hh = ep * bev + (fr[p] - 0.5) * 0.04 * mm + pl * 0.012 * mm;
      S.h[p] += (hh - S.h[p]) * cov;
      const tone = (0.9 + 0.09 * pl) * (0.9 + 0.2 * fr[p]); // le sens du poil accroche la lumière par plaques
      S.ar[p] += (c[0] * tone - S.ar[p]) * cov; S.ag[p] += (c[1] * tone - S.ag[p]) * cov; S.ab[p] += (c[2] * tone - S.ab[p]) * cov;
      S.m[p] = cov;
    }
    // fibres échappées au bord, tirées une fois pour toutes (même tirage quel que soit p)
    const fibres = [];
    parcourir(geo, 0.10 * mm, 0.2 * mm, (x, y, nx, ny) => {
      const r1 = rng(), r2 = rng(), r3 = rng(), r4 = rng();
      if (r1 > 0.45) return;
      const a = Math.atan2(ny, nx) + (r2 - 0.5) * 2.2, l = (0.06 + 0.14 * r3) * mm, s = (r4 - 0.3) * 0.06 * mm;
      fibres.push([x + nx * s, y + ny * s, x + nx * s + Math.cos(a) * l, y + ny * s + Math.sin(a) * l, r2]);
    });
    return (ctx) => {
      if (pose) {
        ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = Math.max(0.6, 0.022 * mm);
        for (const [x0, y0, x1, y1, t] of fibres) {
          const k = 0.55 + 0.5 * t;
          ctx.strokeStyle = 'rgba(' + Math.round(c[0] * 255 * k) + ',' + Math.round(c[1] * 255 * k) + ',' + Math.round(c[2] * 255 * k) + ',0.7)';
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
        ctx.restore();
      }
      if (o.p >= 1) return;
      presse(ctx, env, geo, o.p);
    };
  }
  flocage.mat = { ks: 0.02, shin: 4, kv: 0.6 };

  // La presse à chaud (plateau d'aluminium) : arrive, presse en chauffant, se relève.
  function presse(ctx, env, geo, p) {
    const { W, H, mm } = env, [bx, by, bw, bh] = geo.box, m = 3.5 * mm, r = 1.6 * mm;
    const X = bx - m, Yb = by - m, Wp = bw + 2 * m, Hp = bh + 2 * m;
    let dy = 0, al = 1, glow = 0, off = 0.6 * mm, sc = 1;
    if (p < 0.3) { const a = p / 0.3, e = 1 - Math.pow(1 - a, 3); dy = -(1 - e) * (Yb + Hp + 8 * mm); off = (2.4 - 1.8 * e) * mm; }
    else if (p < 0.62) glow = Math.sin(Math.PI * (p - 0.3) / 0.32);
    else { const a = c01((p - 0.62) / 0.33), e = a * a * (3 - 2 * a); al = 1 - e; off = (0.6 + 6 * e) * mm; sc = 1 + 0.05 * e; }
    if (al <= 0) return;
    const cx = X + Wp / 2, cy = Yb + Hp / 2 + dy;
    ctx.save(); ctx.globalAlpha = al;
    ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
    const rr = (x, y, w, h) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
    ctx.filter = 'blur(' + (1.2 * mm + off * 0.4) + 'px)'; ctx.fillStyle = 'rgba(0,0,0,0.6)'; rr(X + off, Yb + dy + off, Wp, Hp); ctx.fill(); ctx.filter = 'none';
    if (glow > 0) { ctx.shadowColor = 'rgba(254,54,0,' + (0.85 * glow) + ')'; ctx.shadowBlur = 5 * mm; }
    const g = ctx.createLinearGradient(X, Yb + dy, X + Wp, Yb + dy + Hp);
    g.addColorStop(0, '#56565A'); g.addColorStop(0.45, '#404042'); g.addColorStop(1, '#272728');
    ctx.fillStyle = g; rr(X, Yb + dy, Wp, Hp); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
    ctx.save(); ctx.clip(); // aluminium brossé
    const rng = alea(97); ctx.lineWidth = 1;
    for (let y = Yb + dy; y < Yb + dy + Hp; y += 1.5) { ctx.strokeStyle = 'rgba(255,255,255,' + (0.015 + 0.04 * rng()) + ')'; ctx.beginPath(); ctx.moveTo(X, y); ctx.lineTo(X + Wp, y); ctx.stroke(); }
    if (glow > 0) { ctx.fillStyle = 'rgba(254,54,0,' + (0.22 * glow) + ')'; ctx.fillRect(X, Yb + dy, Wp, Hp); }
    ctx.restore();
    ctx.lineWidth = Math.max(1, 0.12 * mm); ctx.strokeStyle = 'rgba(255,255,255,0.28)'; rr(X + 0.5, Yb + dy + 0.5, Wp - 1, Hp - 1); ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------ sublimation
  function sublimation(env, geo, fab, S, o) {
    const { W, H, mm } = env, D = geo.D;
    const fn = champ(W, H, 0.05 * mm, o.seed + 41, 2), mont = champ(W, H, 1.3 * mm, o.seed + 42, 3);
    const c = rgb(o.c), c2 = o.c2 ? rgb(o.c2) : c, cf = rgb(o.cf), pp = o.p, [bx, by, bw, bh] = geo.box;
    const r = 0.06 * mm * (1 + 3 * (1 - pp)) + 0.6; // bord fondu, plus étalé tant que la teinte monte
    for (let y = 0, p = 0; y < H; y++) for (let x = 0; x < W; x++, p++) {
      const e = D[p] + (fn[p] - 0.5) * 0.1 * mm * (2 - pp);
      let cov = lisse(-r, r, e);
      if (pp < 1) cov *= lisse(0, 1, (pp - 0.3 * mont[p]) / 0.7); // chaque zone de fibre se teinte à son rythme
      if (cov <= 0) continue;
      const t = lisse(0, 1, (x - bx) / bw * 0.6 + (y - by) / bh * 0.4);
      const a = fab.a[p];
      S.ar[p] = (cf[0] + (c[0] + (c2[0] - c[0]) * t - cf[0]) * cov) * a;
      S.ag[p] = (cf[1] + (c[1] + (c2[1] - c[1]) * t - cf[1]) * cov) * a;
      S.ab[p] = (cf[2] + (c[2] + (c2[2] - c[2]) * t - cf[2]) * cov) * a;
      S.m[p] = cov;
    }
    return null;
  }
  sublimation.mat = null; // aucune épaisseur : la matière reste celle du tissu

  const TECH = { broderie, serigraphie, dtf, flocage, sublimation };

  // ------------------------------------------------------------------ API
  function options(o) {
    const r = Object.assign({}, DEFAUTS, o || {});
    for (const k of ['p', 'seed', 'marge', 'angle', 'zoom', 'vignette']) r[k] = +r[k];
    r.p = c01(isFinite(r.p) ? r.p : 1);
    if (!isFinite(r.zoom) || r.zoom <= 0) r.zoom = 1;
    if (r.fond !== null && TISSUS.indexOf(r.fond) < 0) r.fond = 'maille';
    return r;
  }

  /** Rend un marquage. o : { tech, forme, c, c2, fond, cf, p, seed, marge, angle, zoom, vignette }. Renvoie la durée en ms. */
  function rendre(canvas, opt) {
    const t0 = performance.now(), o = options(opt);
    if (!TECH[o.tech]) throw new Error('MarqueTech : technique inconnue ' + o.tech);
    const W = canvas.width, H = canvas.height, N = W * H;
    const env = { W, H, N, mm: Math.min(W, H) / MM_COTE * o.zoom, wrap: false };
    const typeT = o.fond || 'maille'; // sans fond, la fibre sert encore à texturer encre et teinture
    const fab = genTissu(typeT, env, o.seed);
    const geo = geometrie(o.forme, env, o);
    const cf = rgb(o.cf);
    const S = { h: fab.h, ar: new Float32Array(N), ag: new Float32Array(N), ab: new Float32Array(N), m: new Float32Array(N), add: null };
    for (let p = 0; p < N; p++) { const a = fab.a[p]; S.ar[p] = cf[0] * a; S.ag[p] = cf[1] * a; S.ab[p] = cf[2] * a; }
    fab.h = Float32Array.from(fab.h); // copie : la technique modifie S.h et lit le relief d'origine
    const fin = TECH[o.tech](env, geo, fab, S, o);
    const ctx = ombrer(canvas, env, S, MAT_TISSU[typeT], TECH[o.tech].mat, { transparent: o.fond === null, vignette: o.fond === null ? 0 : o.vignette, seed: o.seed });
    if (fin) fin(ctx);
    return performance.now() - t0;
  }

  /** La matière seule, plein cadre et raccordable. o : { type, c, echelle, seed }. Renvoie la durée en ms. */
  function tissu(canvas, opt) {
    const t0 = performance.now(), o = Object.assign({ type: 'maille', c: '#101012', echelle: 1, seed: 1 }, opt || {});
    const type = TISSUS.indexOf(o.type) < 0 ? 'maille' : o.type;
    const W = canvas.width, H = canvas.height, N = W * H;
    const env = { W, H, N, mm: Math.min(W, H) / MM_COTE * (+o.echelle || 1), wrap: true };
    const fab = genTissu(type, env, +o.seed || 1), c = rgb(o.c);
    const S = { h: fab.h, ar: new Float32Array(N), ag: new Float32Array(N), ab: new Float32Array(N), m: new Float32Array(N), add: null };
    for (let p = 0; p < N; p++) { const a = fab.a[p]; S.ar[p] = c[0] * a; S.ag[p] = c[1] * a; S.ab[p] = c[2] * a; }
    ombrer(canvas, env, S, MAT_TISSU[type], null, { transparent: false, vignette: 0, seed: +o.seed || 1 });
    return performance.now() - t0;
  }

  /** Rend tous les canvas[data-tech] et canvas[data-tissu] de root. Renvoie [{ el, ms }]. */
  function tous(root) {
    root = root || document; const res = [];
    root.querySelectorAll('canvas[data-tech]').forEach((el) => {
      const d = el.dataset, o = { tech: d.tech };
      for (const k of ['forme', 'c', 'c2', 'cf']) if (d[k]) o[k] = d[k];
      for (const k of ['p', 'seed', 'marge', 'angle', 'zoom', 'vignette']) if (d[k] !== undefined && d[k] !== '') o[k] = +d[k];
      if ('fond' in d) o.fond = ['', 'null', 'aucun', 'transparent', 'none'].indexOf(d.fond) >= 0 ? null : d.fond;
      res.push({ el, ms: rendre(el, o) });
    });
    root.querySelectorAll('canvas[data-tissu]').forEach((el) => {
      const d = el.dataset, o = { type: d.tissu };
      if (d.c) o.c = d.c; if (d.echelle) o.echelle = +d.echelle; if (d.seed) o.seed = +d.seed;
      res.push({ el, ms: tissu(el, o) });
    });
    return res;
  }

  window.MarqueTech = { FORMES, rendre, tissu, tous, MM_COTE };
})();
