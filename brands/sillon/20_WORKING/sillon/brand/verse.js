/* LE REMPLISSEUR — moteur de la pièce maîtresse de Sillon (objet global Verse). Chargé après brand/marque.js.

   Ce qu'il fait. Il reçoit des parois (un titre composé dans la voix de la marque, le logotype, des verres), cherche
   PHYSIQUEMENT ce qui peut tenir du vin (toute zone d'où un liquide ne peut pas s'échapper sans remonter), puis il
   REND la matière. Le vin n'est pas un aplat : il a une robe (claire au bord, dense au cœur), un ménisque qui monte le
   long des parois, un éclat et un liseré de surface, un trouble, un dépôt d'aplomb au fond, des bulles s'il perle, et la
   vraie matière d'une photo (photos/depot.jpg) fondue dans sa masse. La pierre des lettres a son grain, ses pores, sa
   lumière (elle vient d'en haut à gauche) et son ombre portée ; elle prend la couleur du vin qu'elle tient.

   Deux registres (option mode) :
     'objet'   : des lettres de tuffeau devant un fond (le bleu, le fond de cave), éclairées, avec leur ombre.
     'imprime' : de l'encre sur du papier ; le canvas se fond en « multiply » sur le fond de la page.

   Écriture d'un titre : les lettres entre crochets sont les verres. « JE[U]DI, ON GO[Û]TE. »
   Mesure : un U large, droit, plein à ras bord = un verre de dégustation = 12,5 cl (six font une bouteille de 75 cl).

   Verse.pret()              → promesse : la police et la photo de matière sont chargées
   Verse.charger([noms])     → promesse : d'autres photos, pour l'option image
   Verse.rendre(canvas, o)   → un titre.   o : texte, taille (hauteur de capitale, px), angle, jus (clé ou liste), p (0 à 1),
                               c (couleur des lettres), tout, serre, large, graisse, inter, mode, fond ('bleu' | 'cave' | 'tuffeau'),
                               image (une photo à la place du vin), texture (false pour s'en passer), ombre (false)
   Verse.logo(canvas, o)     → le logotype en matière.   o : taille, angle, jus, niveau, mode, fond, image
   Verse.verres(canvas, o)   → un champ de verres en matière (les options de Marque.service, plus mode et fond)
   Verse.formes(canvas, o)   → des parois quelconques : o.l, o.h, o.tracer(ctx), o.garder(poche), o.jusDe(poche, i), o.pDe(poche, i)
   Verse.mesurer(o)          → le calcul d'un titre sans le dessiner
   Verse.tout(racine)        → rend tous les <canvas data-verse="…"> et <canvas data-logo> ; promesse des résultats
   Chaque rendu renvoie { l, h, cl, lettres, poches: [{ lettre, cl, capacite, aire, x, y, jus }] } (x, y : la surface du vin).
   Tout est déterministe : mêmes options, même image. Aucune horloge. */
(function () {
  const M = window.Marque, V = {};
  const POLICE = 'Anybody', CAP = 0.675;            /* hauteur de capitale d'Anybody : 1350 / 2000 */
  const VERRE_CL = 12.5;                             /* un U large plein = un verre de dégustation */
  V.VERRE_CL = VERRE_CL;
  const LUM = [-0.55, -0.835];                       /* d'où vient la lumière : d'en haut, à gauche */
  const TEXTURE = 'depot';                           /* la photo dont la matière est fondue dans le vin */

  /* ---------- les images ---------- */
  V.images = {};
  V.charger = (noms) => Promise.all([].concat(noms).filter((n) => n && !V.images[n]).map((n) => new Promise((ok) => { const im = new Image(); im.onload = () => { V.images[n] = im; ok(); }; im.onerror = () => ok(); im.src = M.photoURL(n); })));
  V.pret = () => Promise.all([document.fonts.load(`900 80px ${POLICE}`), document.fonts.load(`600 20px ${POLICE}`), V.charger([TEXTURE])]);

  /* ---------- outils : couleur, hasard, bruit ---------- */
  const hex = (c) => { const h = M.col(c).replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const h2 = (x, y, s) => { let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1274126177); n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const vn = (x, y, s) => { const xi = Math.floor(x), yi = Math.floor(y); let fx = x - xi, fy = y - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const a = h2(xi, yi, s), b = h2(xi + 1, yi, s), c = h2(xi, yi + 1, s), d = h2(xi + 1, yi + 1, s); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; };
  const fbm = (x, y, s, oct) => { let v = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < oct; i++) { v += a * vn(x * f, y * f, s + i * 17); n += a; a *= 0.5; f *= 2.03; } return v / n; };
  const borne = (v, a, b) => (v < a ? a : v > b ? b : v);
  V.bruit = { h2, vn, fbm };

  /* Distance à la source la plus proche (chanfrein 3-4 : la valeur est en tiers de pixel). et : une étiquette qui suit. */
  function dist(src, w, h, et) { const N = w * h, d = new Int16Array(N), INF = 32000; for (let i = 0; i < N; i++) d[i] = src[i] ? 0 : INF;
    for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) { let v = d[i]; if (!v) continue; let j = -1;
      if (x > 0 && d[i - 1] + 3 < v) { v = d[i - 1] + 3; j = i - 1; }
      if (y > 0) { if (d[i - w] + 3 < v) { v = d[i - w] + 3; j = i - w; } if (x > 0 && d[i - w - 1] + 4 < v) { v = d[i - w - 1] + 4; j = i - w - 1; } if (x < w - 1 && d[i - w + 1] + 4 < v) { v = d[i - w + 1] + 4; j = i - w + 1; } }
      if (j >= 0) { d[i] = v; if (et) et[i] = et[j]; } }
    for (let y = h - 1, i = N - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--, i--) { let v = d[i]; if (!v) continue; let j = -1;
      if (x < w - 1 && d[i + 1] + 3 < v) { v = d[i + 1] + 3; j = i + 1; }
      if (y < h - 1) { if (d[i + w] + 3 < v) { v = d[i + w] + 3; j = i + w; } if (x < w - 1 && d[i + w + 1] + 4 < v) { v = d[i + w + 1] + 4; j = i + w + 1; } if (x > 0 && d[i + w - 1] + 4 < v) { v = d[i + w - 1] + 4; j = i + w - 1; } }
      if (j >= 0) { d[i] = v; if (et) et[i] = et[j]; } }
    return d; }

  /* ---------- la mise en ligne d'un titre : chaque lettre a sa largeur (verre large, reste serré) ---------- */
  const lire = (t) => { const out = []; let v = false; for (const ch of String(t)) { if (ch === '[') { v = true; continue; } if (ch === ']') { v = false; continue; } out.push({ ch, verre: v }); } return out; };
  function composer(o, ctx) { const { texte = '', taille = 200, graisse = 900, serre = 'extra-condensed', large = 'extra-expanded', inter = 0.012 } = o;
    const px = taille / CAP, L = lire(texte), f = (v) => `${graisse} ${v ? large : serre} ${px}px ${POLICE}`; let x = 0, asc = taille, desc = 0;
    L.forEach((g, i) => { ctx.font = g.font = f(g.verre); const m = ctx.measureText(g.ch); g.x = x = Math.round(x * 2) / 2; g.w = m.width; x += m.width + (i < L.length - 1 ? inter * px : 0);
      asc = Math.max(asc, m.actualBoundingBoxAscent || 0); desc = Math.max(desc, m.actualBoundingBoxDescent || 0); });
    return { L, W: x, asc: Math.ceil(asc) + 1, desc: Math.ceil(desc) + 1 }; }

  /* ---------- le calcul : où le vin tient ----------
     Grille vue de côté, la pesanteur vers le bas. Pour chaque case vide, on cherche la hauteur la plus basse par laquelle
     elle peut rejoindre l'extérieur (inondation par ordre de hauteur). Si cette hauteur est au-dessus d'elle, elle est
     mouillée. Les contre-formes fermées (O, D, A) ne sont jamais atteintes : une bouteille bouchée ne se remplit pas. */
  function inonder(mur, w, h) { const N = w * h, niv = new Int32Array(N).fill(-1), suiv = new Int32Array(N), tete = new Int32Array(h + 1).fill(-1);
    const pousse = (i, l) => { niv[i] = l; suiv[i] = tete[l]; tete[l] = i; };
    for (let x = 0; x < w; x++) { if (!mur[x]) pousse(x, h - 1); const b = (h - 1) * w + x; if (!mur[b] && niv[b] < 0) pousse(b, 0); }
    for (let y = 1; y < h - 1; y++) { const a = y * w, b = a + w - 1; if (!mur[a] && niv[a] < 0) pousse(a, h - 1 - y); if (!mur[b] && niv[b] < 0) pousse(b, h - 1 - y); }
    for (let l = 0; l < h; l++) while (tete[l] !== -1) { const i = tete[l]; tete[l] = suiv[i]; const x = i % w, y = (i - x) / w;
      if (x > 0 && !mur[i - 1] && niv[i - 1] < 0) pousse(i - 1, l);
      if (x < w - 1 && !mur[i + 1] && niv[i + 1] < 0) pousse(i + 1, l);
      if (y < h - 1 && !mur[i + w] && niv[i + w] < 0) pousse(i + w, l);
      if (y > 0 && !mur[i - w] && niv[i - w] < 0) { const e = h - y; pousse(i - w, e > l ? e : l); } }
    return niv; }

  /* Les parois sont tracées en noir par o.tracer(ctx), dans un cadre de o.l × o.h px. On y ajoute une marge pour l'ombre. */
  function analyser(o) { const k = o.k || Math.max(2, Math.min(3, window.devicePixelRatio || 1)), ech = o.ech || 100, objet = (o.mode || 'objet') !== 'imprime' && o.ombre !== false;
    const pG = 4, pH = 4, pD = objet ? Math.ceil(ech * 0.36) + 4 : 4, pB = objet ? Math.ceil(ech * 0.46) + 4 : 4;
    const W = Math.round((o.l + pG + pD) * k), H = Math.round((o.h + pH + pB) * k), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.save(); ctx.scale(k, k); ctx.translate(pG, pH); ctx.fillStyle = '#000'; o.tracer(ctx); ctx.restore();
    const A = ctx.getImageData(0, 0, W, H).data, N = W * H, mur = new Uint8Array(N), aM = new Uint8Array(N); for (let i = 0; i < N; i++) { const a = A[i * 4 + 3]; aM[i] = a; mur[i] = a >= 110 ? 1 : 0; }
    const niv = inonder(mur, W, H), eti = new Int32Array(N), poches = [], pile = new Int32Array(N);
    for (let s = 0; s < N; s++) { if (eti[s] || mur[s] || niv[s] < 0) continue; const ys = (s - (s % W)) / W; if (niv[s] <= H - 1 - ys) continue;
      /* une poche : toutes les cases mouillées qui se touchent */
      const id = poches.length + 1, rangs = new Map(); let n = 0, sx = 0, sy = 0, bas = 0, haut = H, x0 = W, x1 = 0, top = 0; pile[top++] = s; eti[s] = id;
      while (top) { const i = pile[--top], x = i % W, y = (i - x) / W; n++; sx += x; sy += y; if (y > bas) bas = y; if (y < haut) haut = y; if (x < x0) x0 = x; if (x > x1) x1 = x; rangs.set(y, (rangs.get(y) || 0) + 1);
        for (const j of [i - 1, i + 1, i - W, i + W]) { if (j < 0 || j >= N || eti[j] || mur[j] || niv[j] < 0) continue; const xj = j % W; if (Math.abs(xj - x) > 1) continue; const yj = (j - xj) / W; if (niv[j] <= H - 1 - yj) continue; eti[j] = id; pile[top++] = j; } }
      /* le centre de la poche, dans le cadre demandé (px d'écran) */
      poches.push({ id, n, cx: sx / n, cy: sy / n, X: sx / n / k - pG, Y: sy / n / k - pH, bas, haut, x0, x1, rangs }); }
    return { k, ech, l: o.l, h: o.h, pG, pH, pD, pB, W, H, mur, aM, eti, poches, parois: cv }; }

  /* Le niveau de chaque poche gardée : on remplit depuis le fond jusqu'à la part p de sa contenance. Le dépôt occupe la
     part la plus basse du vin : il est d'aplomb, lui aussi. */
  function niveler(R, o) { const { k } = R, jus = [].concat(o.jus || 'maceration'), mini = (o.mini == null ? 0.006 : o.mini) * R.ech * R.ech * k * k;
    const G = R.poches.filter((q) => q.n >= mini && (!o.garder || o.garder(q))).sort((a, b) => a.cx - b.cx);
    G.forEach((q, i) => { q.jus = o.jusDe ? o.jusDe(q, i) : jus[i % jus.length]; const p = borne(o.pDe ? o.pDe(q, i) : o.p == null ? 1 : o.p, 0, 1), P = (M.MATIERES && M.MATIERES[q.jus]) || {};
      let cible = q.n * p, cum = 0, y = q.bas; q.surface = q.bas + 1; for (; y >= q.haut; y--) { cum += q.rangs.get(y) || 0; q.surface = y; if (cum >= cible) break; } if (p <= 0) { q.surface = q.bas + 1; cum = 0; } q.plein = Math.min(cum, q.n);
      q.sed = null; if (q.plein && P.depot) { let c2 = 0; for (let yy = q.bas; yy >= q.surface; yy--) { c2 += q.rangs.get(yy) || 0; if (c2 >= q.plein * P.depot) { q.sed = yy; break; } } }
      q.props = { trouble: P.trouble || 0, limpide: P.limpide || 0, bulles: P.bulles || 0, depot: P.depot || 0 };
      const E = (M.ECHELLES && M.ECHELLES[q.jus]) || [q.jus, q.jus, q.jus, q.jus, q.jus]; q.rampe = E.map(hex);
      q.aire = q.plein / (k * k); q.capaciteAire = q.n / (k * k); });
    return G; }

  /* ---------- le rendu de la matière ---------- */
  function peindre(cv, R, G, o) { const { k, W, H, mur, aM, eti } = R, N = W * H, ech = R.ech * k, mode = o.mode || 'objet', fond = o.fond || 'bleu', graine = o.graine || 1;
    const Q = []; G.forEach((q) => { Q[q.id] = q; });
    cv.width = W; cv.height = H; cv.style.width = W / k + 'px'; cv.style.height = H / k + 'px'; cv.style.margin = `${-R.pH}px ${-R.pD}px ${-R.pB}px ${-R.pG}px`; cv.style.flex = 'none';
    cv.style.mixBlendMode = mode === 'imprime' ? 'multiply' : '';
    const ctx = cv.getContext('2d'); ctx.clearRect(0, 0, W, H);
    const toile = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
    const dW = dist(mur, W, H), vide = new Uint8Array(N); for (let i = 0; i < N; i++) vide[i] = mur[i] ? 0 : 1; const dI = dist(vide, W, H);

    /* --- le vin --- */
    const liq = new Uint8Array(N), Rm = 0.05 * ech, Dm = 0.13 * ech; let aDuVin = false;
    for (let i = 0; i < N; i++) { const id = eti[i]; if (!id) continue; const q = Q[id]; if (!q || !q.plein) continue; const y = (i / W) | 0;
      if (y >= q.surface) { liq[i] = 1; aDuVin = true; } else { const d = dW[i] / 3; if (d < Dm) { const r = Rm * (1 - d / Dm) * (1 - d / Dm); if (q.surface - y <= r) liq[i] = 1; } } }
    const cVin = toile(), cSurf = toile(), cBul = toile(), cMousse = toile(), photo = o.image ? V.images[o.image] : null, tex = !photo && o.texture !== false ? V.images[o.texture || TEXTURE] : null;
    if (aDuVin) { const img = new ImageData(W, H), D = img.data, sur = new ImageData(W, H), S = sur.data, cel = Math.max(1, Math.round(k));
      for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) { if (!liq[i]) continue; const q = Q[eti[i]], P = q.props, prof = q.bas - q.surface + 1, ds = y - q.surface, dw = dW[i] / 3, j = i * 4;
        const monte = dw < Dm ? Rm * (1 - dw / Dm) * (1 - dw / Dm) : 0, dsT = ds + monte, u = (ds > 0 ? ds : 0) / prof, w = dw / (0.17 * ech) > 1 ? 1 : dw / (0.17 * ech);
        /* la robe : claire au bord (le vin y est mince), dense au cœur et vers le fond */
        let t = 0.15 + 0.40 * w + 0.25 * u * (0.35 + 0.65 * w);
        t += P.trouble * 0.34 * (fbm(x / (0.33 * ech) + q.id * 7.1, y / (0.33 * ech), 11 + graine, 3) - 0.5) * (0.45 + u);
        t *= 1 - 0.24 * P.limpide;
        /* la surface : un éclat, un liseré dense, puis le disque, plus clair */
        if (dsT < 1.2 * k) { S[j] = S[j + 1] = S[j + 2] = 255; S[j + 3] = 150; } else if (dsT < 3.4 * k) { t += 0.17; S[j + 3] = 46; } else { const b = 0.1 * ech; if (dsT < b) t -= 0.17 * (1 - dsT / b); }
        /* le dépôt : la lie repose au fond, d'aplomb, et trouble ce qui est juste au-dessus */
        if (q.sed != null) { const st = q.sed - 2.4 * k * vn(x / (5 * k), 3.3, q.id) - 0.016 * ech * vn(x / (0.13 * ech), 9.1, q.id);
          if (y >= st) t = 0.8 + 0.2 * h2(x >> 1, y >> 1, 5); else { const hz = 0.17 * ech * (0.5 + P.trouble), g = (st - y) / hz; if (g < 1) t += 0.36 * (1 - g) * (1 - g) * (0.5 + P.trouble); } }
        /* les particules en suspension */
        const hp = h2((x / cel) | 0, (y / cel) | 0, 3); if (hp < P.trouble * (0.006 + 0.034 * u * u)) t += 0.15; else if (hp > 0.9975) t -= 0.13;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const E = q.rampe, f4 = t * 4, i0 = f4 >= 4 ? 3 : f4 | 0, f = f4 - i0, a = E[i0], b = E[i0 + 1];
        /* la lumière traverse : plus claire en haut, et du côté opposé à sa source */
        const lum = 1 + 0.07 * (1 - u) - 0.05 * u + 0.06 * ((x - q.x0) / (q.x1 - q.x0 + 1) - 0.5);
        const r = (a[0] + (b[0] - a[0]) * f) * lum, g = (a[1] + (b[1] - a[1]) * f) * lum, bb = (a[2] + (b[2] - a[2]) * f) * lum;
        D[j] = r > 255 ? 255 : r; D[j + 1] = g > 255 ? 255 : g; D[j + 2] = bb > 255 ? 255 : bb;
        D[j + 3] = mode === 'imprime' ? 240 : dsT < 0.05 * ech ? 218 + 37 * (dsT / (0.05 * ech)) : 255; }
      const cv2 = cVin.getContext('2d'); cv2.putImageData(img, 0, 0); cSurf.getContext('2d').putImageData(sur, 0, 0);
      /* la matière d'une photo. image : la photo remplace le vin (elle garde ses couleurs). Sinon la photo de dépôt est
         fondue dans la robe calculée : elle lui donne ses nuages et ses grains sans changer sa couleur. */
      if (photo || tex) { const im = photo || tex, ct = toile(), c = ct.getContext('2d');
        G.forEach((q) => { if (!q.plein) return; const bw = q.x1 - q.x0 + 1 + 0.2 * ech, bh = q.bas - q.surface + 1 + 0.16 * ech, rr = M.rnd(q.id * 31 + graine), z = photo ? Math.max(bw / im.width, bh / im.height) : Math.max((1.5 * ech) / im.width, bw / im.width, bh / im.height);
          const sw = bw / z, sh = bh / z, sx = (im.width - sw) * (photo ? 0.5 : rr()), sy = (im.height - sh) * (photo ? 0.62 : 0.25 + 0.6 * rr());
          c.save(); c.beginPath(); c.rect(q.x0 - 0.1 * ech, q.surface - 0.08 * ech, bw, bh); c.clip(); if (!photo) c.filter = 'grayscale(1) contrast(1.5) brightness(1.08)'; c.drawImage(im, sx, sy, sw, sh, q.x0 - 0.1 * ech, q.surface - 0.08 * ech, bw, bh); c.restore(); });
        c.globalCompositeOperation = 'destination-in'; c.drawImage(cVin, 0, 0);
        if (photo) { cv2.globalCompositeOperation = 'source-over'; cv2.clearRect(0, 0, W, H); cv2.drawImage(ct, 0, 0); } else { cv2.globalCompositeOperation = 'overlay'; cv2.globalAlpha = 0.62; cv2.drawImage(ct, 0, 0); cv2.globalAlpha = 1; cv2.globalCompositeOperation = 'source-over'; }
        cv2.drawImage(cSurf, 0, 0); }
      else cv2.drawImage(cSurf, 0, 0);
      /* les bulles : un vin qui perle en a le long des parois, et en cordon à la surface */
      const b2 = cBul.getContext('2d'), m2 = cMousse.getContext('2d');
      const bulle = (c, x, y, r, E, fort) => { const g = c.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r); g.addColorStop(0, `rgba(${E[0]},${fort ? 0.5 : 0.26})`); g.addColorStop(0.72, `rgba(${E[1]},${fort ? 0.55 : 0.32})`); g.addColorStop(1, `rgba(${E[3]},0.5)`);
        c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.strokeStyle = `rgba(${E[4]},0.4)`; c.lineWidth = Math.max(0.6, 0.5 * k); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(x - r * 0.36, y - r * 0.38, Math.max(0.5, r * 0.22), 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.arc(x + r * 0.34, y + r * 0.36, Math.max(0.4, r * 0.13), 0, 7); c.fill(); };
      G.forEach((q) => { const P = q.props; if (!P.bulles || !q.plein || photo) return; const E = q.rampe.map((c) => c.join(',')), rr = M.rnd(q.id * 97 + graine), surf = q.plein / (ech * ech), nb = Math.round(P.bulles * surf * 150); let pose = 0, essais = 0;
        while (pose < nb && essais++ < nb * 60) { const x = q.x0 + rr() * (q.x1 - q.x0), y = q.surface + Math.pow(rr(), 1.5) * (q.bas - q.surface), i = (y | 0) * W + (x | 0); if (!liq[i] || (q.sed != null && y > q.sed - 4 * k)) continue;
          const dw = dW[i] / 3; if (rr() > 0.22 + 0.78 * (1 - Math.min(1, dw / (0.12 * ech)))) continue; const r = (0.011 + 0.03 * rr() * rr()) * ech; if (dw < r * 0.9 || y - q.surface < r) continue; bulle(b2, x, y, r, E, false); pose++; }
        /* le cordon : de petites bulles posées sur la surface, serrées contre les parois */
        const nm = Math.round((P.bulles * (q.x1 - q.x0)) / (0.05 * ech)); for (let j = 0; j < nm; j++) { const bord = rr() < 0.72, t = bord ? Math.pow(rr(), 2.2) * 0.3 : rr(), x = rr() < 0.5 ? q.x0 + t * (q.x1 - q.x0) : q.x1 - t * (q.x1 - q.x0), r = (0.008 + 0.017 * rr()) * ech;
          let y = q.surface | 0; const xi = x | 0; if (!liq[y * W + xi]) continue; while (y > 0 && liq[(y - 1) * W + xi]) y--; bulle(m2, x, y - r * 0.2, r, E, true); } });
      b2.globalCompositeOperation = 'destination-in'; b2.drawImage(cVin, 0, 0); }

    /* --- les parois : la pierre ou l'encre --- */
    const et = new Int32Array(N); for (let i = 0; i < N; i++) et[i] = liq[i] ? eti[i] : 0; const dL = aDuVin && mode !== 'imprime' ? dist(liq, W, H, et) : null;
    const img2 = new ImageData(W, H), L = img2.data, base = hex(o.c || (mode === 'imprime' ? 'bleu' : 'tuffeau')), B = Math.max(2 * k, 0.02 * ech), pore = Math.max(6, 0.05 * ech), T = 0.085 * ech;
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) { const a = aM[i]; if (!a) continue; const d = dI[i] / 3; let lum = 1, al = a, r = base[0], g = base[1], b = base[2];
      if (mode === 'imprime') { /* l'encre : un aplat qui ne l'est pas tout à fait, plus dense au bord, avec ses manques */
        lum += 0.07 * (fbm(x / (0.5 * ech), y / (0.5 * ech), 41 + graine, 3) - 0.5) + 0.05 * (h2(x, y, 7) - 0.5); if (d < 1.6 * k) lum -= 0.08; if (h2(x >> 1, y >> 1, 9) < 0.011) al = a * 0.55;
      } else { /* la pierre de tuffeau : un grain fin, des pores, un lit, et la lumière sur ses arêtes */
        lum += 0.05 * (fbm(x / (1.7 * ech), y / (1.7 * ech), 21 + graine, 3) - 0.5) + 0.045 * (fbm(x / (5 * k), y / (5 * k), 23, 2) - 0.5) + 0.04 * (h2(x, y, 25) - 0.5);
        lum += 0.014 * Math.sin(y / (0.15 * ech) + 5 * fbm(x / (1.3 * ech), y / (0.6 * ech), 31, 2));
        const cx = Math.floor(x / pore), cy = Math.floor(y / pore), hp = h2(cx, cy, 27 + graine); if (hp < 0.24) { const px = (cx + 0.15 + 0.7 * h2(cx, cy, 28)) * pore, py = (cy + 0.15 + 0.7 * h2(cx, cy, 29)) * pore, pr = pore * (0.05 + 0.13 * h2(cx, cy, 30)), dp = Math.hypot(x - px, y - py);
          if (dp < pr) lum -= 0.2 * (1 - dp / pr); else if (dp < pr * 1.7 && y > py) lum += 0.035; }
        if (d < B) { const gx = dI[i + 2 < N ? i + 2 : i] - dI[i - 2 >= 0 ? i - 2 : i], gy = dI[i + 2 * W < N ? i + 2 * W : i] - dI[i - 2 * W >= 0 ? i - 2 * W : i], n = Math.hypot(gx, gy);
          if (n) { const e = -(gx * LUM[0] + gy * LUM[1]) / n, wb = (1 - d / B) * (1 - d / B); lum += (e > 0 ? 0.06 : 0.24) * e * wb; } }
        /* le vin éclaire la pierre qui le tient */
        if (dL && et[i] && dL[i] / 3 < T) { const q = Q[et[i]]; if (q) { const c = q.rampe[1], m = 0.36 * (1 - dL[i] / 3 / T) * (1 - dL[i] / 3 / T); r += (c[0] - r) * m; g += (c[1] - g) * m; b += (c[2] - b) * m; } }
        if (fond === 'cave') { lum *= 0.95; b *= 0.985; } }
      const j = i * 4; r *= lum; g *= lum; b *= lum; L[j] = r > 255 ? 255 : r; L[j + 1] = g > 255 ? 255 : g; L[j + 2] = b > 255 ? 255 : b; L[j + 3] = al; }
    const cPar = toile(); cPar.getContext('2d').putImageData(img2, 0, 0);

    /* --- l'assemblage : l'ombre, la lueur du vin, le vin (qui passe sous le bord des parois), les bulles, les parois --- */
    if (mode !== 'imprime' && o.ombre !== false) { const om = toile(), c3 = om.getContext('2d'); c3.drawImage(R.parois, 0, 0); c3.globalCompositeOperation = 'source-in'; c3.fillStyle = fond === 'cave' ? '#000004' : fond === 'tuffeau' ? '#4A3F2A' : '#060D3A'; c3.fillRect(0, 0, W, H);
      ctx.save(); ctx.filter = `blur(${(0.085 * ech).toFixed(1)}px)`; ctx.globalAlpha = 0.3; ctx.drawImage(om, 0.1 * ech, 0.17 * ech); ctx.filter = `blur(${(0.02 * ech).toFixed(1)}px)`; ctx.globalAlpha = 0.5; ctx.drawImage(om, 0.028 * ech, 0.048 * ech); ctx.restore(); }
    if (aDuVin) { if (mode !== 'imprime') { ctx.save(); ctx.filter = `blur(${(0.1 * ech).toFixed(1)}px)`; ctx.globalAlpha = 0.34; ctx.drawImage(cVin, 0, 0); ctx.restore(); }
      const d = Math.ceil(1.4 * k); for (const [ox, oy] of [[-d, d], [d, d], [0, d], [-d, 0], [d, 0], [0, 0]]) ctx.drawImage(cVin, ox, oy); ctx.drawImage(cBul, 0, 0); ctx.drawImage(cMousse, 0, 0); }
    ctx.drawImage(cPar, 0, 0); }

  /* ---------- la mesure ---------- */
  const _ref = new Map();
  const reference = (o) => { const taille = o.taille || 200, k = o.k || 2, cle = [taille, k, o.graisse || 900, o.large || ''].join('|');
    if (!_ref.has(cle)) { const t = titre({ texte: '[U]', taille, angle: 0, k, graisse: o.graisse, large: o.large, tout: true, mode: 'imprime', _etalon: true }), p = t.R.poches.slice().sort((a, b) => b.n - a.n)[0]; _ref.set(cle, p ? p.n / (t.R.k * t.R.k) : 1); } return _ref.get(cle); };
  /* L'aire de l'étalon (le U large, droit, plein) pour une hauteur de capitale donnée, en px² : mesurée une fois, en grand */
  V.etalon = (taille = 100, o = {}) => reference({ ...o, taille: 400, k: 2 }) * (taille / 400) * (taille / 400);
  V.enCl = (aire, taille = 100, o = {}) => (aire / V.etalon(taille, o)) * VERRE_CL;
  V.cl = (v, dec = 1) => (Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec)).toFixed(dec).replace('.', ',') + M.NB + 'cl';

  /* ---------- un titre ---------- */
  function titre(o) { const tmp = document.createElement('canvas').getContext('2d'), C = composer(o, tmp), Hh = C.asc + C.desc, ang = ((o.angle || 0) * Math.PI) / 180, co = Math.abs(Math.cos(ang)), si = Math.abs(Math.sin(ang)), marge = o.marge == null ? 3 : o.marge;
    const l = Math.ceil(C.W * co + Hh * si) + 2 * marge, h = Math.ceil(C.W * si + Hh * co) + 2 * marge, k = o.k || Math.max(2, Math.min(3, window.devicePixelRatio || 1)), cale = (v) => Math.round(v * k) / k;
    const tracer = (c) => { if (ang) { c.translate(l / 2, h / 2); c.rotate(ang); c.translate(-C.W / 2, -Hh / 2 + C.asc); } else c.translate(cale(l / 2 - C.W / 2), cale(h / 2 - Hh / 2 + C.asc)); c.textBaseline = 'alphabetic'; C.L.forEach((g) => { c.font = g.font; c.fillText(g.ch, g.x, 0); }); };
    const cA = Math.cos(-ang), sA = Math.sin(-ang), lettreDe = (q) => { const dx = q.X - l / 2, dy = q.Y - h / 2, lx = dx * cA - dy * sA + C.W / 2; let li = C.L.findIndex((g) => lx >= g.x && lx < g.x + g.w); if (li < 0) li = lx < 0 ? 0 : C.L.length - 1; return li; };
    const R = analyser({ ...o, l, h, k, ech: o.taille || 200, tracer }); R.poches.forEach((q) => { q.li = lettreDe(q); q.lettre = C.L[q.li].ch; });
    const G = niveler(R, { ...o, garder: (q) => o.tout || C.L[q.li].verre });
    if (!o._etalon) { const ref = reference({ ...o, k }); G.forEach((q) => { q.cl = (q.aire / ref) * VERRE_CL; q.capacite = (q.capaciteAire / ref) * VERRE_CL; }); }
    const x0 = Math.round((l / 2 - C.W / 2) * k) / k;
    return { R, G, infos: { l, h, cl: G.reduce((a, q) => a + (q.cl || 0), 0), lettres: C.L.map((g) => ({ ch: g.ch, x: x0 + g.x, l: g.w, verre: !!g.verre })), poches: G.map((q) => ({ lettre: q.lettre, i: q.li, cl: q.cl, capacite: q.capacite, aire: q.aire, x: q.X, y: q.surface / k - R.pH, jus: q.jus })) } }; }
  V.mesurer = (o) => titre({ ...o, mode: 'imprime' }).infos;
  V.rendre = (cv, o = {}) => { const t = titre(o); peindre(cv, t.R, t.G, o); return t.infos; };

  /* ---------- des parois quelconques ---------- */
  V.formes = (cv, o) => { const R = analyser(o), G = niveler(R, o); peindre(cv, R, G, o); const k = R.k;
    return { l: o.l, h: o.h, poches: G.map((q) => ({ aire: q.aire, capacite: q.capaciteAire, x: q.X, y: q.surface / k - R.pH, jus: q.jus })) }; };

  /* ---------- le logotype en matière ---------- */
  V.logo = (cv, o = {}) => { const K = M.CONSTRUCTION, s = (o.taille || 200) / 100, ang = ((o.angle || 0) * Math.PI) / 180, co = Math.abs(Math.cos(ang)), si = Math.abs(Math.sin(ang)), W0 = K.largeur * s, H0 = 106 * s, marge = 3;
    const l = Math.ceil(W0 * co + H0 * si) + 2 * marge, h = Math.ceil(W0 * si + H0 * co) + 2 * marge, chemin = new Path2D(M.lettersPath()), cr = M.CREUX;
    const tracer = (c) => { c.translate(l / 2, h / 2); c.rotate(ang); c.scale(s, s); c.translate(-K.largeur / 2, -50); c.fill(chemin, 'evenodd'); };
    const cA = Math.cos(-ang), sA = Math.sin(-ang), dansLeCreux = (q) => { const dx = q.X - l / 2, dy = q.Y - h / 2, lx = (dx * cA - dy * sA) / s + K.largeur / 2, ly = (dx * sA + dy * cA) / s + 50; return lx > cr.x && lx < cr.x + cr.l && ly > cr.y - 2 && ly < cr.y + cr.h; };
    const R = analyser({ ...o, l, h, ech: o.taille || 200, tracer }), G = niveler(R, { ...o, p: o.niveau == null ? M.NIVEAU : o.niveau, garder: (q) => o.tout || dansLeCreux(q) }); peindre(cv, R, G, o);
    return { l, h, poches: G.map((q) => ({ aire: q.aire, x: q.X, y: q.surface / R.k - R.pH, jus: q.jus })) }; };

  /* ---------- un champ de verres en matière (les mêmes options que Marque.service) ---------- */
  V.verres = (cv, o = {}) => { const { w = 700, h = 400, cols = 6, rangs = 3, taille = 0, quinconce = false, marge = 0, angle = (i, j) => ((i + j) % 2 ? -M.DEGRE : M.DEGRE), niveau = () => M.NIVEAU, jus = (i, j) => M.JUS[(i + j * 2) % 3] } = o;
    const pw = (w - 2 * marge) / cols, ph = (h - 2 * marge) / rangs, ech = taille || Math.min(ph * 0.62, (pw * 0.62 * 100) / M.VERRE.l), V0 = [];
    for (let j = 0; j < rangs; j++) for (let i = -1; i <= cols; i++) { if ((i < 0 || i >= cols) && !(quinconce && j % 2)) continue; const cx = marge + (i + 0.5 + (quinconce && j % 2 ? 0.5 : 0)) * pw, cy = marge + (j + 0.5) * ph, u = cx / w, v = cy / h;
      V0.push({ i, j, u, v, cx, cy, d: new Path2D(M.verreTraces(cx, cy, ech, angle(i, j, u, v), 0).mur), jus: jus(i, j, u, v), p: niveau(i, j, u, v) }); }
    const plusProche = (q) => V0.reduce((a, b) => (Math.hypot(b.cx - q.X, b.cy - q.Y) < Math.hypot(a.cx - q.X, a.cy - q.Y) ? b : a));
    return V.formes(cv, { ...o, l: w, h, ech, tracer: (c) => V0.forEach((v) => c.fill(v.d)), garder: (q) => { q.v = plusProche(q); return !!q.v.jus; }, jusDe: (q) => q.v.jus, pDe: (q) => q.v.p }); };

  /* ---------- tout rendre ---------- */
  V.tout = (racine = document) => { const cvs = [...racine.querySelectorAll('canvas[data-verse],canvas[data-logo]')];
    return V.pret().then(() => V.charger(cvs.map((c) => c.dataset.image))).then(() => cvs.map((cv) => { const d = cv.dataset, n = (x) => (x == null || x === '' ? undefined : +x);
      const commun = { taille: n(d.taille), angle: n(d.angle), jus: d.jus ? d.jus.split(',') : undefined, p: n(d.p), c: d.c, mode: d.mode, fond: d.fond, graine: n(d.graine), image: d.image, ombre: d.ombre === 'non' ? false : undefined, texture: d.texture === 'non' ? false : undefined };
      if (d.logo != null) return V.logo(cv, { ...commun, niveau: n(d.niveau), tout: d.tout != null });
      const r = V.rendre(cv, { ...commun, texte: d.verse, tout: d.tout != null, serre: d.serre, large: d.large, graisse: n(d.graisse), inter: n(d.inter) });
      cv.dataset.cl = r.cl.toFixed(2); if (cv.id) racine.querySelectorAll(`[data-cl-de="${cv.id}"]`).forEach((e) => { e.textContent = V.cl(r.cl); }); return r; })); };

  window.Verse = V;
})();
