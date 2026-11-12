/* LES FONDS EN MATIÈRE — Sillon (objet global Matiere). Chargé après brand/marque.js.

   Un fond n'est pas un aplat. Le bleu de travail est un sergé de coton (ses côtes en diagonale, ses fils inégaux, ses
   zones lavées) ; le tuffeau est un papier de coton (son grain, ses fibres) ; le fond de cave est un mur peint, la nuit.
   Chaque matière est une tuile calculée une fois (640 px de côté, raccordée sur ses quatre bords), posée en variable
   CSS : --m-tissu, --m-papier, --m-blanc, --m-craie, --m-cave. Les classes de marque.css (.plate, .fond-*) s'en servent.
   Déterministe : pas de hasard hors graine, pas d'horloge. */
(function () {
  const M = window.Marque, T = {}, COTE = 640, K = 2;
  const h2 = (x, y, s) => { let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1274126177); n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  /* bruit de valeur qui se raccorde : la maille revient au bout de P cases */
  const vnP = (x, y, P, s) => { const xi = Math.floor(x), yi = Math.floor(y); let fx = x - xi, fy = y - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); const m = (v) => ((v % P) + P) % P;
    const a = h2(m(xi), m(yi), s), b = h2(m(xi + 1), m(yi), s), c = h2(m(xi), m(yi + 1), s), d = h2(m(xi + 1), m(yi + 1), s); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; };
  const fbmP = (u, v, P, s, oct) => { let t = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < oct; i++) { t += a * vnP(u * P * f, v * P * f, P * f, s + i * 13); n += a; a *= 0.5; f *= 2; } return t / n; };
  const rgb = (c) => { const h = M.col(c).replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };

  const tuile = (peindre, apres) => { const S = COTE * K, cv = document.createElement('canvas'); cv.width = cv.height = S; const ctx = cv.getContext('2d'), img = ctx.createImageData(S, S), D = img.data;
    for (let y = 0, j = 0; y < S; y++) for (let x = 0; x < S; x++, j += 4) { const c = peindre(x, y, x / S, y / S, S); D[j] = c[0]; D[j + 1] = c[1]; D[j + 2] = c[2]; D[j + 3] = 255; }
    ctx.putImageData(img, 0, 0); if (apres) apres(ctx, S); return cv; };

  /* Le sergé : des côtes à 63°, raccordées (un nombre entier de côtes sur la tuile), des fils qui battent, du lavé */
  T.tissu = () => { const B = rgb('bleu'), Lv = rgb('lave'), TAU = Math.PI * 2;
    return tuile((x, y, u, v, S) => { const n1 = fbmP(u, v, 6, 3, 3), n2 = fbmP(u, v, 40, 9, 2), cote = Math.sin(TAU * (168 * u + 84 * v) + 2.6 * n2), fil = Math.sin(TAU * (-52 * u + 104 * v) + 4 * n1);
      let lum = 1 + 0.07 * cote * (0.72 + 0.28 * fil) + 0.028 * (n1 - 0.5) + 0.055 * (h2(x, y, 5) - 0.5) + 0.02 * Math.sin(TAU * 230 * u + 3 * n2);
      const lave = Math.max(0, n1 - 0.6) * 0.16; return [(B[0] + (Lv[0] - B[0]) * lave) * lum, (B[1] + (Lv[1] - B[1]) * lave) * lum, (B[2] + (Lv[2] - B[2]) * lave) * lum]; }); };
  /* Le papier : un grain, de légers nuages, des fibres et quelques inclusions */
  T.papier = (ton = 'tuffeau', graine = 1) => { const B = rgb(ton), R = M.rnd(graine * 7 + 3);
    return tuile((x, y, u, v) => { const lum = 1 + 0.03 * (fbmP(u, v, 5, 21 + graine, 3) - 0.5) + 0.03 * (fbmP(u, v, 90, 23, 2) - 0.5) + 0.035 * (h2(x, y, 25) - 0.5); return [B[0] * lum, B[1] * lum, B[2] * lum]; },
      (ctx, S) => { ctx.lineCap = 'round'; for (let i = 0; i < 520; i++) { const x = R() * S, y = R() * S, a = R() * 6.28, l = (6 + R() * 26) * K, clair = R() < 0.5; ctx.strokeStyle = clair ? `rgba(255,255,255,${0.12 + R() * 0.2})` : `rgba(96,84,60,${0.04 + R() * 0.07})`; ctx.lineWidth = (0.4 + R() * 0.7) * K;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (R() - 0.5) * l * 0.5, y + Math.sin(a) * l * 0.5 + (R() - 0.5) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); }
        for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(90,70,40,${0.1 + R() * 0.22})`; ctx.beginPath(); ctx.arc(R() * S, R() * S, (0.4 + R() * 0.9) * K, 0, 7); ctx.fill(); } }); };
  /* Le mur de cave : une peinture sombre, passée au large pinceau */
  T.cave = () => { const B = rgb('cave'), TAU = Math.PI * 2;
    return tuile((x, y, u, v) => { const n = fbmP(u, v, 5, 31, 4), lum = 1 + 0.5 * (n - 0.5) + 0.12 * (fbmP(u, v, 70, 33, 2) - 0.5) + 0.1 * (h2(x, y, 35) - 0.5) + 0.05 * Math.sin(TAU * 31 * u + 5 * n); return [B[0] * lum + 2, B[1] * lum + 3, B[2] * lum + 6]; }); };

  const _url = {};
  T.url = (nom) => { if (!_url[nom]) { const cv = nom === 'tissu' ? T.tissu() : nom === 'cave' ? T.cave() : nom === 'blanc' ? T.papier('#FAF8F0', 2) : nom === 'craie' ? T.papier('craie', 3) : T.papier('tuffeau', 1); _url[nom] = cv.toDataURL('image/webp', 0.9); } return _url[nom]; };
  T.poser = (noms = ['tissu', 'papier', 'blanc', 'craie', 'cave']) => { const S = document.documentElement.style; noms.forEach((n) => S.setProperty('--m-' + n, `url('${T.url(n)}')`)); S.setProperty('--m-cote', COTE + 'px'); };
  window.Matiere = T;
  if (typeof document !== 'undefined' && document.documentElement && !window.MatiereSans) T.poser();
})();
