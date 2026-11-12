// Maillon — la marque, définie une fois : logotype et symbole, lus par l'app, la planche d'identité et le film.
//
// Idée : un maillon relie deux pièces d'une chaîne, comme l'outil relie deux étapes d'un dossier.
// Règle de construction : tout le mot est tracé d'un seul trait rond de graisse 11, sur une hauteur
// d'x de 60 et une hampe de 100 ; les lettres sont faites de fûts et d'arcs de cercle ; les deux « l »
// sont deux maillons (capsules creuses de 30 de large à l'axe) emboîtés, le second en ambre : il passe
// devant le premier en haut, derrière lui en bas.
// Parce qu'il est fait de traits, le logotype se trace comme les liens de l'app.
(function () {
  const G = 11;                      // graisse
  const R = 24.5;                    // rayon des arcs à l'axe du trait (hauteur d'x 60)
  const HAUT = 45.5, BAS = 94.5, MI = 70;   // axes : haut de l'x, ligne de base, mi-hauteur
  const ESP = 15;                    // blanc entre deux lettres, de bord à bord
  const LM = 30, RM = LM / 2;        // maillon : largeur à l'axe et rayon de ses bouts
  const DX = 20;                     // décalage du second maillon
  const ENCRE = '#f3f1ec', AMBRE = '#ff9a2e';

  function lettres() {
    const Rm = 19.5;                 // arches du m, un peu plus serrées
    return [
      { nom: 'm', l: 4 * Rm, d: [`M0 ${BAS} V${HAUT}`, `M0 ${HAUT + Rm} A${Rm} ${Rm} 0 0 1 ${2 * Rm} ${HAUT + Rm} V${BAS}`, `M${2 * Rm} ${HAUT + Rm} A${Rm} ${Rm} 0 0 1 ${4 * Rm} ${HAUT + Rm} V${BAS}`] },
      { nom: 'a', l: 2 * R, d: [`M${2 * R} ${MI} A${R} ${R} 0 1 0 ${2 * R} ${MI + .01}`, `M${2 * R} ${HAUT} V${BAS}`] },
      { nom: 'i', l: 0, d: [`M0 ${HAUT} V${BAS}`], point: [0, 24] },
      { nom: 'll', l: LM + DX, maillons: true },
      { nom: 'o', l: 2 * R, d: [`M${2 * R} ${MI} A${R} ${R} 0 1 0 ${2 * R} ${MI + .01}`] },
      { nom: 'n', l: 2 * R, d: [`M0 ${BAS} V${HAUT}`, `M0 ${MI} A${R} ${R} 0 0 1 ${2 * R} ${MI} V${BAS}`] },
    ];
  }

  // Un maillon : capsule creuse verticale. Points de son axe, tous les 0,5, depuis le bas du côté gauche.
  function capsule(x, y0, y1) {
    const pts = [], pas = .5;
    for (let y = y1 - RM; y > y0 + RM; y -= pas) pts.push([x, y]);
    for (let a = Math.PI; a > 0; a -= pas / RM) pts.push([x + RM + RM * Math.cos(a), y0 + RM - RM * Math.sin(a)]);
    for (let y = y0 + RM; y < y1 - RM; y += pas) pts.push([x + LM, y]);
    for (let a = 0; a < Math.PI; a += pas / RM) pts.push([x + RM + RM * Math.cos(a), y1 - RM + RM * Math.sin(a)]);
    return pts;
  }
  const chemin = (pts, ferme) => 'M' + pts.map((p) => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + (ferme ? 'Z' : '');
  // Morceau d'une capsule autour de son point le plus proche de (cx, cy) : sert au passage dessus-dessous.
  function morceau(pts, c, demi) {
    let k = 0, best = 1e9;
    pts.forEach((p, i) => { const d = Math.hypot(p[0] - c[0], p[1] - c[1]); if (d < best) { best = d; k = i; } });
    const out = [];
    for (let i = k - demi; i <= k + demi; i++) out.push(pts[(i + pts.length) % pts.length]);
    return out;
  }
  function croisements(A, B) {
    const out = [];
    A.forEach((p) => B.forEach((q) => { if (Math.hypot(p[0] - q[0], p[1] - q[1]) < .4 && !out.some((o) => Math.hypot(o[0] - p[0], o[1] - p[1]) < 6)) out.push(p); }));
    return out.sort((a, b) => a[1] - b[1]);              // du haut vers le bas
  }

  function maillons(x, fond, c1, c2) {
    const A = capsule(x, 5.5, 84), B = capsule(x + DX, 16, BAS);
    const X = croisements(A, B);
    const t = [{ d: chemin(A, true), c: c1, cls: 'ml m1' }, { d: chemin(B, true), c: c2, cls: 'ml m2' }];
    if (X.length >= 2) {
      const haut = X[0], bas = X[X.length - 1];
      t.push({ d: chemin(morceau(B, haut, 26)), c: c2, cls: 'ml m2 rep', coupe: fond });    // le second passe devant, en haut
      t.push({ d: chemin(morceau(A, bas, 26)), c: c1, cls: 'ml m1 rep', coupe: fond });     // le premier repasse devant, en bas
    }
    return t;
  }

  // options : hauteur (px), fond (couleur derrière le logo, pour les passages dessus-dessous),
  //           encre (couleur des lettres et du premier maillon), accent (second maillon), symbole (les maillons seuls)
  function svg(o) {
    o = Object.assign({ hauteur: 100, fond: '#050506', encre: ENCRE, accent: AMBRE, symbole: false }, o || {});
    const traits = [];
    let x = G / 2, largeur;
    if (o.symbole) {
      maillons(x + 2, o.fond, o.encre, o.accent).forEach((t) => traits.push(Object.assign(t, { lettre: 'll' })));
      largeur = LM + DX + G + 4;
    } else {
      lettres().forEach((L) => {
        if (L.maillons) maillons(x, o.fond, o.encre, o.accent).forEach((t) => traits.push(Object.assign(t, { lettre: 'll' })));
        else {
          L.d.forEach((d) => traits.push({ d, c: o.encre, dx: x, lettre: L.nom, cls: 'lt' }));
          if (L.point) traits.push({ point: [x + L.point[0], L.point[1]], c: o.encre, lettre: L.nom, cls: 'pt' });
        }
        x += L.l + G + ESP;
      });
      largeur = x - ESP - G / 2;
    }
    const corps = traits.map((t) => {
      if (t.point) return `<circle class="${t.cls}" data-lettre="${t.lettre}" cx="${t.point[0]}" cy="${t.point[1]}" r="${G / 2 + 1.2}" fill="${t.c}"/>`;
      const tr = t.dx ? ` transform="translate(${t.dx} 0)"` : '';
      const dessous = t.coupe ? `<path class="coupe ${t.cls}" data-lettre="${t.lettre}" d="${t.d}" stroke="${t.coupe}" stroke-width="${G + 8}" stroke-linecap="butt"${tr}/>` : '';
      return dessous + `<path class="${t.cls}" data-lettre="${t.lettre}" d="${t.d}" stroke="${t.c}" stroke-width="${G}" pathLength="1"${tr}/>`;
    }).join('');
    const h = 100, w = Math.ceil(largeur);
    return `<svg class="logotype" viewBox="0 0 ${w} ${h}" height="${o.hauteur}" width="${o.hauteur * w / h}" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Maillon">${corps}</svg>`;
  }

  window.Marque = { nom: 'Maillon', accroche: 'De la demande à la facture, sans ressaisie.', encre: ENCRE, ambre: AMBRE, graisse: G,
    logotype: (o) => svg(o), symbole: (o) => svg(Object.assign({}, o, { symbole: true })) };
})();
