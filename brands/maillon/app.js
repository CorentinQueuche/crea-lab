// Maillon — liens du canvas, graphique et relief. Données fictives.
(function () {
  const logoApp = document.getElementById('logo-app');
  if (logoApp && window.Marque) logoApp.innerHTML = Marque.logotype({ hauteur: 27, fond: '#0b0b0c' });
  const canvas = document.getElementById('canvas');
  const svg = document.getElementById('links');
  const NS = 'http://www.w3.org/2000/svg';
  const cr = canvas.getBoundingClientRect();
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; };
  const registre = { liens: {}, froids: null, cr };
  window.MAILLON = registre;

  svg.setAttribute('viewBox', `0 0 ${cr.width} ${cr.height}`);
  const defs = el('defs', {});
  const f1 = el('filter', { id: 'glow', x: '-50%', y: '-50%', width: '200%', height: '200%', filterUnits: 'userSpaceOnUse' }, defs);
  f1.setAttribute('x', -200); f1.setAttribute('y', -200); f1.setAttribute('width', cr.width + 400); f1.setAttribute('height', cr.height + 400);
  el('feGaussianBlur', { stdDeviation: '7' }, f1);
  const f2 = el('filter', { id: 'glow2', filterUnits: 'userSpaceOnUse', x: -200, y: -200, width: cr.width + 400, height: cr.height + 400 }, defs);
  el('feGaussianBlur', { stdDeviation: '2.2' }, f2);

  // point d'ancrage : côté d'un élément (l, r, t, b), à une fraction de ce côté
  const NORM = { l: [-1, 0], r: [1, 0], t: [0, -1], b: [0, 1] };
  function port(id, side, f, sel) {
    let n = document.getElementById(id);
    if (sel) n = n.querySelector(sel);
    const r = n.getBoundingClientRect();
    const x = side === 'l' ? r.left : side === 'r' ? r.right : r.left + r.width * f;
    const y = side === 't' ? r.top : side === 'b' ? r.bottom : r.top + r.height * f;
    return { x: x - cr.left, y: y - cr.top, n: NORM[side] };
  }
  const free = (x, y, side) => ({ x, y, n: NORM[side] });
  function curve(a, b, bend) {
    const d = Math.max(70, Math.hypot(b.x - a.x, b.y - a.y) * (bend || .5));
    return `M${a.x} ${a.y} C${a.x + a.n[0] * d} ${a.y + a.n[1] * d}, ${b.x + b.n[0] * d} ${b.y + b.n[1] * d}, ${b.x} ${b.y}`;
  }
  function head(q, dir, g) {
    const ang = Math.atan2(dir[1], dir[0]) * 180 / Math.PI;
    const h = el('g', { transform: `translate(${q.x} ${q.y}) rotate(${ang})` }, g);
    el('path', { d: 'M-7 -8 L8 0 L-7 8 Z', fill: '#ff9a2e', filter: 'url(#glow2)', opacity: .9 }, h);
    el('path', { d: 'M-6 -6.5 L6.5 0 L-6 6.5 Z', fill: '#ffb555' }, h);
    return h;
  }
  function hot(nom, a, b, bend) {
    const d = curve(a, b, bend);
    const g = el('g', {});
    const traits = [
      el('path', { d, stroke: '#ff8a1f', 'stroke-width': 11, fill: 'none', opacity: .38, filter: 'url(#glow)' }, g),
      el('path', { d, stroke: '#ff9a2e', 'stroke-width': 4.2, fill: 'none', opacity: .75, filter: 'url(#glow2)' }, g),
      el('path', { d, stroke: '#ffe0b5', 'stroke-width': 1.5, fill: 'none', 'stroke-linecap': 'round' }, g),
    ];
    const tetes = [head(a, a.n, g), head(b, [-b.n[0], -b.n[1]], g)];
    registre.liens[nom] = { g, traits, tetes, coeur: traits[2], a, b };
    return traits[2];
  }
  const gf = el('g', { id: 'froids' });
  registre.froids = gf;
  function cold(a, b, bend, o) {
    el('path', { d: curve(a, b, bend), stroke: '#e9e6de', 'stroke-width': 1.15, fill: 'none', opacity: o || .5 }, gf);
    [a, b].forEach(q => el('circle', { cx: q.x, cy: q.y, r: 3.2, fill: '#0a0a0a', stroke: '#e9e6de', 'stroke-width': 1.3 }, gf));
  }
  function mid(path, t) { const L = path.getTotalLength(); return path.getPointAtLength(L * t); }
  function place(id, pt) { const n = document.getElementById(id); n.style.left = (pt.x - 17) + 'px'; n.style.top = (pt.y - 17) + 'px'; }

  // liens froids : depuis l'explorateur et vers la suite du dossier
  cold(free(-2, 326, 'r'), port('n-demande', 'l', .5, '.sheets'), .5, .42);
  cold(free(-2, 362, 'r'), port('n-valid', 'l', .3), .6, .42);
  cold(port('n-plan', 'r', .82), port('n-facture', 'l', .55, '.sheets'), .45, .5);
  cold(port('n-pose', 'r', .22), free(cr.width + 4, 760, 'l'), .5, .4);
  cold(port('n-facture', 'r', .5, '.sheets'), free(cr.width + 4, 330, 'l'), .5, .4);

  // liens chauds : le chemin actif du dossier
  hot('demande-devis', port('n-demande', 'r', .5, '.sheets'), port('n-devis', 'l', .5, '.sheets'), .5);
  const p1 = hot('devis-plan', port('n-devis', 'r', .45, '.sheets'), port('n-plan', 'l', .72), .5);
  hot('devis-valid', port('n-devis', 'b', .5, '.pile-label'), port('n-valid', 't', .42), .5);
  const p2 = hot('valid-cmd', port('n-valid', 'r', .5), port('n-cmd', 'l', .4), .5);
  hot('cmd-pose', port('n-cmd', 'r', .6), port('n-pose', 't', .55), .55);

  place('plus-1', mid(p1, .52));
  place('plus-2', mid(p2, .5));

  // histogramme des acomptes
  const chart = document.getElementById('chart');
  [34, 52, 41, 66, 58, 22, 12, 47, 71, 63, 92, 55, 30, 18].forEach((h, i) => {
    const b = document.createElement('i'); b.style.height = h + '%'; b.dataset.h = h; if (i === 10) b.className = 'hi'; chart.appendChild(b);
  });

  // relief filaire de la charge d'atelier
  const rs = document.getElementById('relief');
  const N = 15, W = 280, H = 230;
  const h = (i, j) => {
    const u = i / (N - 1), v = j / (N - 1);
    return 62 * Math.exp(-((u - .62) ** 2 + (v - .36) ** 2) / .035) + 30 * Math.exp(-((u - .28) ** 2 + (v - .68) ** 2) / .05) + 6 * Math.sin(u * 9) * Math.cos(v * 7);
  };
  const proj = (i, j) => {
    const u = i / (N - 1) - .5, v = j / (N - 1) - .5;
    return [W / 2 + (u - v) * 150, H - 78 + (u + v) * 74 - h(i, j)];
  };
  const line = (pts, o) => { const e = document.createElementNS(NS, 'polyline'); e.setAttribute('points', pts.map(p => p.join(',')).join(' ')); e.setAttribute('fill', 'none'); e.setAttribute('stroke', '#c9ceff'); e.setAttribute('stroke-width', '.7'); e.setAttribute('opacity', o); rs.appendChild(e); };
  for (let i = 0; i < N; i++) { line([...Array(N)].map((_, j) => proj(i, j)), .2 + .5 * i / N); line([...Array(N)].map((_, j) => proj(j, i)), .2 + .5 * i / N); }
  const pk = proj(Math.round(.62 * (N - 1)), Math.round(.36 * (N - 1)));
  const g = (r, o) => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', pk[0]); c.setAttribute('cy', pk[1]); c.setAttribute('r', r); c.setAttribute('fill', '#ff9a2e'); c.setAttribute('opacity', o); rs.appendChild(c); };
  g(12, .18); g(6, .35); g(3, 1);
  const st = document.createElementNS(NS, 'path'); st.setAttribute('d', `M${pk[0]} ${pk[1]} V${H - 30}`); st.setAttribute('stroke', '#ff9a2e'); st.setAttribute('stroke-width', '.8'); st.setAttribute('stroke-dasharray', '2 3'); rs.appendChild(st);

  document.fonts.ready.then(() => document.body.setAttribute('data-pret', '1'));
})();
