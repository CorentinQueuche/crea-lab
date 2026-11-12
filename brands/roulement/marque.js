// Roulement — la marque, définie une fois : logotype et symbole, lus par l'app, la planche d'identité et le film.
//
// Idée : le roulement, c'est l'équipe qui tourne. Trois postes (salle, bar, cuisine) se relaient autour
// de la semaine : un anneau en trois segments, qui tourne.
// Règle de construction : lettres en traits droits et arcs de cercle, graisse 17, bouts francs, sur une
// hauteur d'x de 60 et une hampe de 100 ; le « o » est l'anneau, trois arcs de 96° aux couleurs des postes.
// La seule particularité est cet anneau : il est le symbole, et c'est lui qui bouge.
(function () {
  const G = 17;
  const R = 21.5;                       // rayon des arcs à l'axe du trait
  const HAUT = 48.5, MI = 70;           // axes : haut de l'x et mi-hauteur ; la ligne de base est à 100
  const ESP = 11;
  const POSTES = { salle: '#9b3d4e', bar: '#d9a441', cuisine: '#2f6385' };
  const POSTES_SOMBRE = { salle: '#e08a9b', bar: '#e2b659', cuisine: '#7fb6d6' };
  const rad = (d) => d * Math.PI / 180;
  const pt = (cx, cy, r, a) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
  const arc = (cx, cy, r, a0, a1) => { const p0 = pt(cx, cy, r, a0), p1 = pt(cx, cy, r, a1); return `M${p0[0].toFixed(2)} ${p0[1].toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`; };

  function lettres() {
    const Rm = 17.5;
    const e = () => { const f = pt(R, MI, R, 38); return `M0 ${MI} H${2 * R} A${R} ${R} 0 1 0 ${f[0].toFixed(2)} ${f[1].toFixed(2)}`; };
    return [
      { nom: 'r', l: R * 1.62, d: [`M0 100 V40`, arc(R, MI, R, 180, 318)] },
      { nom: 'o', l: 2 * R, anneau: true },
      { nom: 'u', l: 2 * R, d: [`M0 40 V${MI} A${R} ${R} 0 0 0 ${2 * R} ${MI} V40`, `M${2 * R} 40 V100`] },
      { nom: 'l', l: 0, d: [`M0 0 V100`] },
      { nom: 'e', l: 2 * R, d: [e()] },
      { nom: 'm', l: 4 * Rm, d: [`M0 100 V40`, `M0 ${HAUT + Rm} A${Rm} ${Rm} 0 0 1 ${2 * Rm} ${HAUT + Rm} V100`, `M${2 * Rm} ${HAUT + Rm} A${Rm} ${Rm} 0 0 1 ${4 * Rm} ${HAUT + Rm} V100`] },
      { nom: 'e', l: 2 * R, d: [e()] },
      { nom: 'n', l: 2 * R, d: [`M0 100 V40`, `M0 ${MI} A${R} ${R} 0 0 1 ${2 * R} ${MI} V100`] },
      { nom: 't', l: 20, d: [`M10 12 V100`, `M-4 ${HAUT} H26`] },
    ];
  }
  // L'anneau : trois arcs de 96°, séparés de 24°, le premier en haut à droite.
  const anneau = (cx, cy, r, c) => [[-78, 18, c.salle], [42, 138, c.bar], [162, 258, c.cuisine]].map(([a0, a1, coul], i) => ({ d: arc(cx, cy, r, a0, a1), c: coul, cls: 'an an' + i }));

  // options : hauteur (px), encre (couleur des lettres), sombre (couleurs des postes pour un fond sombre), symbole
  function svg(o) {
    o = Object.assign({ hauteur: 100, encre: '#1f1a15', sombre: false, symbole: false }, o || {});
    const coul = o.sombre ? POSTES_SOMBRE : POSTES;
    let corps = '', w, h = 100;
    if (o.symbole) {
      const r = 34, g = 26;
      corps = `<g class="roue" data-cx="50" data-cy="50">` + anneau(50, 50, r, coul).map((t) => `<path class="${t.cls}" d="${t.d}" stroke="${t.c}" stroke-width="${g}" pathLength="1"/>`).join('') + `</g>`;
      w = 100;
    } else {
      let x = G / 2, n = 0;
      lettres().forEach((L) => {
        if (L.anneau) corps += `<g class="roue" data-cx="${x + R}" data-cy="${MI}">` + anneau(x + R, MI, R, coul).map((t) => `<path class="${t.cls}" d="${t.d}" stroke="${t.c}" stroke-width="${G}" pathLength="1"/>`).join('') + `</g>`;
        else corps += `<g class="lt" data-rang="${n++}" data-x="${x.toFixed(2)}" transform="translate(${x.toFixed(2)} 0)">` + L.d.map((d) => `<path d="${d}" stroke="${o.encre}" stroke-width="${G}"/>`).join('') + `</g>`;
        x += L.l + G + ESP;
      });
      w = Math.ceil(x - ESP - G / 2 + 4);
    }
    return `<svg class="logotype" viewBox="0 0 ${w} ${h}" height="${o.hauteur}" width="${o.hauteur * w / h}" fill="none" stroke-linecap="butt" stroke-linejoin="round" role="img" aria-label="Roulement">${corps}</svg>`;
  }

  window.Marque = { nom: 'Roulement', accroche: 'Le planning des trois brasseries, et ce qu’il coûte.', postes: POSTES,
    logotype: (o) => svg(o), symbole: (o) => svg(Object.assign({}, o, { symbole: true })) };
})();
