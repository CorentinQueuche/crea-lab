/* LE KIT RÉSEAUX — Sillon (objet global Reseaux). Chargé après brand/marque.js, brand/matiere.js et brand/verse.js.

   Le commun des quatre modèles de reseaux/ : le format lu dans l'adresse, les marges de sécurité, le titre penché
   ajusté à sa boîte (la phrase change chaque semaine : elle doit toujours tenir, sans coupe), le grand verre en matière,
   la contre-étiquette à l'échelle d'une publication. Le fondateur ne touche pas au code, il change l'adresse :

     reseaux/21-jeudi.html?texte=JE[U]DI, ON GO[Û]TE.&jus=maceration&format=4x5

   Conventions de l'adresse : les lettres-verres entre crochets ; « / » force un retour à la ligne dans un titre ;
   une liste se sépare par « | » (jus=maceration|glou|paille) ; guides=1 montre les marges de sécurité.
   Chaque gabarit écrit window.pret (tools/shot.mjs l'attend) et window.controle (ce que le titre occupe, pour vérifier
   qu'il tient dans sa boîte). Aucune horloge, aucun hasard hors graine. Préfixe de classe : rs-. */
(function () {
  const M = window.Marque, V = window.Verse, R = {};

  /* Les deux formats. sur : la marge de sécurité [haut, droite, bas, gauche]. En story, l'interface du réseau couvre
     le haut (barre de progression, nom) et le bas (champ de réponse) : rien d'important n'y va. */
  R.FORMATS = {
    '4x5': { l: 1080, h: 1350, sur: [64, 64, 64, 64] },
    '9x16': { l: 1080, h: 1920, sur: [250, 64, 340, 64] },
  };
  R.params = (def = {}) => { const o = { ...def }; new URLSearchParams(location.search).forEach((v, k) => { if (v !== '') o[k] = v; }); return o; };
  R.liste = (v, def = []) => (v == null || v === '' ? def : String(v).split('|').map((s) => s.trim()).filter(Boolean));
  R.nombre = (v, def) => { if (v == null || v === '') return def; const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : def; };
  R.controle = window.controle = [];

  /* Le cadre : la planche du socle (.plate) à la taille du format. Renvoie le format et sa zone sûre { x, y, l, h }. */
  R.cadre = (el, format, cls = '') => { const F = R.FORMATS[format] || R.FORMATS['4x5'], [h, d, b, g] = F.sur;
    el.className = `plate rs-cadre rs-${F === R.FORMATS['9x16'] ? '9x16' : '4x5'} ${cls}`; el.style.width = F.l + 'px'; el.style.height = F.h + 'px';
    return { ...F, nom: F === R.FORMATS['9x16'] ? '9x16' : '4x5', sure: { x: g, y: h, l: F.l - g - d, h: F.h - h - b } }; };
  /* Les guides (guides=1) : la zone sûre en pointillés, pour vérifier une nouvelle phrase avant de l'exporter */
  R.guides = (el, F) => `<div class="rs-guides" data-voulu><i style="left:${F.sure.x}px;top:${F.sure.y}px;width:${F.sure.l}px;height:${F.sure.h}px"></i></div>`;

  /* ---------- le titre penché, ajusté à sa boîte ----------
     La mesure refait celle du remplisseur (brand/verse.js) : mêmes polices, mêmes largeurs (verres à 150 %, le reste à
     62,5 %), même interlettre. On essaie toutes les coupes de la phrase en une à quatre lignes, on garde celle qui donne
     les plus grandes lettres, puis chaque ligne est rendue en matière et posée sur une même marge penchée. */
  const CAP = 0.675, POL = 'Anybody', cx = document.createElement('canvas').getContext('2d');
  const lire = (t) => { const out = []; let v = false; for (const ch of String(t)) { if (ch === '[') { v = true; continue; } if (ch === ']') { v = false; continue; } out.push({ ch, verre: v }); } return out; };
  R.mesure = (texte, taille, inter = 0.012) => { const px = taille / CAP, L = lire(texte), G = []; let x = 0, asc = taille, desc = 0;
    L.forEach((g, i) => { cx.font = `900 ${g.verre ? 'extra-expanded' : 'extra-condensed'} ${px}px ${POL}`; const m = cx.measureText(g.ch); x = Math.round(x * 2) / 2;
      G.push({ x0: x, x1: x + m.width, asc: m.actualBoundingBoxAscent || 0, desc: m.actualBoundingBoxDescent || 0 });
      x += m.width + (i < L.length - 1 ? inter * px : 0); asc = Math.max(asc, m.actualBoundingBoxAscent || 0); desc = Math.max(desc, m.actualBoundingBoxDescent || 0); });
    return { W: x, asc: Math.ceil(asc) + 1, desc: Math.ceil(desc) + 1, verres: L.filter((g) => g.verre).length, G, T: taille }; };
  const tourne = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  /* L'interligne se règle lettre à lettre : une virgule qui descend et un accent qui monte ne se gênent que s'ils sont
     l'un au-dessus de l'autre. Lignes de base cumulées, dans le repère penché. */
  const bases = (mes) => { const b = [0]; for (let i = 1; i < mes.length; i++) { const A = mes[i - 1], B = mes[i], T = A.T, m = 0.05 * T; let e = 0;
      A.G.forEach((g) => B.G.forEach((h) => { if (g.x0 - m < h.x1 && h.x0 - m < g.x1) e = Math.max(e, g.desc + h.asc); }));
      b.push(b[i - 1] + Math.max(1.08 * T, e + 0.08 * T)); } return b; };
  /* l'emprise à l'écran d'un bloc de lignes */
  const emprise = (mes, a) => { const B = bases(mes); let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    mes.forEach((m, i) => [[0, B[i] - m.asc], [m.W, B[i] - m.asc], [m.W, B[i] + m.desc], [0, B[i] + m.desc]].forEach((p) => { const [x, y] = tourne(p, a); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }));
    return { x0, y0, x1, y1, l: x1 - x0, h: y1 - y0, B }; };
  /* les coupes possibles : « / » impose une coupe, l'espace la permet */
  const coupes = (texte, maxL) => { const blocs = String(texte).split('/').map((s) => s.trim().split(/\s+/).filter(Boolean)).filter((b) => b.length), out = [];
    const rec = (bi, acc) => { if (bi === blocs.length) { if (acc.length <= maxL) out.push(acc); return; } const mots = blocs[bi], n = mots.length;
      for (let m = 0; m < 1 << (n - 1); m++) { const lignes = []; let cur = [mots[0]]; for (let i = 1; i < n; i++) { if (m & (1 << (i - 1))) { lignes.push(cur.join(' ')); cur = [mots[i]]; } else cur.push(mots[i]); } lignes.push(cur.join(' ')); if (acc.length + lignes.length <= maxL) rec(bi + 1, acc.concat(lignes)); } };
    rec(0, []); return out; };
  R.pas = (T) => T * 1.1;

  /* o : texte, boite { x, y, l, h }, angle (−12 : le mot monte), jus (liste : un jus par verre, dans l'ordre), maxL,
     tailleMax, aligne ('gauche' | 'centre'), vertical ('haut' | 'centre' | 'bas'), et les options du remplisseur
     (mode, fond, c, p, image). Renvoie { taille, lignes, emprise } ; l'emprise est notée dans window.controle. */
  R.titre = (parent, o) => { const { texte, boite, angle = -M.DEGRE, maxL = 3, tailleMax = 400, aligne = 'gauche', vertical = 'haut', jus = ['maceration'] } = o, a = (angle * Math.PI) / 180;
    let best = null;
    for (const lignes of coupes(texte, maxL)) { const mes = lignes.map((t) => R.mesure(t, 100)), E = emprise(mes, a);
      let T = Math.min(tailleMax, (100 * boite.l) / E.l, (100 * boite.h) / E.h); const Wm = Math.max(...mes.map((m) => m.W));
      if (mes.some((m) => m.W < 0.3 * Wm)) T *= 0.86;           /* un mot seul et court sur sa ligne : on l'évite */
      T *= 1 - 0.015 * (lignes.length - 1);                     /* à taille presque égale, moins de lignes */
      lignes.slice(0, -1).forEach((t) => { if (/[,.;:!?]$/.test(t)) T *= 1.08; });   /* on coupe où la phrase respire */
      if (!best || T > best.score) best = { lignes, score: T }; }
    /* la taille exacte : la mesure n'est pas tout à fait linéaire (arrondis) ; on réduit jusqu'à ce que ça tienne */
    let mes = best.lignes.map((t) => R.mesure(t, 100)), E = emprise(mes, a), T = Math.floor(Math.min(tailleMax, (100 * boite.l) / E.l, (100 * boite.h) / E.h));
    for (let k = 0; k < 60; k++) { mes = best.lignes.map((t) => R.mesure(t, T)); E = emprise(mes, a); if (E.l <= boite.l && E.h <= boite.h) break; T = Math.floor(T * 0.985); }
    const ox = boite.x - E.x0 + (aligne === 'centre' ? (boite.l - E.l) / 2 : 0), oy = boite.y - E.y0 + (vertical === 'centre' ? (boite.h - E.h) / 2 : vertical === 'bas' ? boite.h - E.h : 0);
    let n = 0; const k = Math.max(2, Math.min(5, window.devicePixelRatio || 1));
    best.lignes.forEach((t, i) => { const m = mes[i], J = jus.slice(n % jus.length).concat(jus.slice(0, n % jus.length)); n += m.verres;
      const [bx, by] = tourne([m.W / 2, E.B[i] + (m.desc - m.asc) / 2], a), cv = document.createElement('canvas'), w = document.createElement('div'); w.className = 'rs-ligne'; w.style.position = 'absolute'; w.style.zIndex = 40;
      w.appendChild(cv); parent.appendChild(w);
      const inf = V.rendre(cv, { ...o, texte: t, taille: T, angle, jus: J, k });
      w.style.left = (ox + bx - inf.l / 2).toFixed(1) + 'px'; w.style.top = (oy + by - inf.h / 2).toFixed(1) + 'px'; w.style.width = inf.l + 'px'; w.style.height = inf.h + 'px'; });
    const r = { quoi: 'titre', texte, taille: T, lignes: best.lignes, emprise: { x: Math.round(ox + E.x0), y: Math.round(oy + E.y0), l: Math.round(E.l), h: Math.round(E.h) }, boite };
    r.tient = r.emprise.x >= boite.x - 1 && r.emprise.y >= boite.y - 1 && r.emprise.x + r.emprise.l <= boite.x + boite.l + 1 && r.emprise.y + r.emprise.h <= boite.y + boite.h + 1;
    R.controle.push(r); return r; };

  /* ---------- le grand verre : le symbole en matière, son vin d'aplomb ----------
     o : cx, cy (son centre, dans le cadre), ech (sa hauteur droite, px), angle, jus, p (0 à 1 de ce qu'il peut tenir
     à cet angle), image (une photo de la marque à la place du vin), fond, mode, c. */
  R.verre = (parent, o) => { const { cx: X, cy: Y, ech = 400, angle = M.DEGRE, jus = 'maceration', p = 0.7 } = o, piv = [M.VERRE.l / 2, 50], s = ech / 100, mg = 4;
    const Q = M.VERRE.pts.map((q) => M.rot(q, angle, piv)).map(([x, y]) => [(x - piv[0]) * s, (y - piv[1]) * s]);
    const x0 = Math.min(...Q.map((q) => q[0])), y0 = Math.min(...Q.map((q) => q[1])), l = Math.ceil(Math.max(...Q.map((q) => q[0])) - x0) + 2 * mg, h = Math.ceil(Math.max(...Q.map((q) => q[1])) - y0) + 2 * mg;
    const lx = -x0 + mg, ly = -y0 + mg, mur = new Path2D(M.verreTraces(lx, ly, ech, angle, 0).mur), cv = document.createElement('canvas'), w = document.createElement('div');
    w.className = 'rs-verre'; w.style.position = 'absolute'; w.style.zIndex = o.z || 40; w.style.left = (X - lx).toFixed(1) + 'px'; w.style.top = (Y - ly).toFixed(1) + 'px'; w.appendChild(cv); parent.appendChild(w);
    const k = Math.max(2, Math.min(4, window.devicePixelRatio || 1));
    return V.charger([o.image]).then(() => V.formes(cv, { ...o, k, l, h, ech, tracer: (c) => c.fill(mur), jus: [jus], p, garder: () => true })); };

  /* ---------- la contre-étiquette à l'échelle d'une publication ----------
     Marque.contre est dessinée pour une planche (corps 10,5 px). Sur un téléphone, une publication de 1080 px s'affiche
     sur environ 390 points : on l'agrandit (zoom) pour que la mention sanitaire fasse au moins 22 px dans le fichier. */
  R.contre = (o, zoom = 2.2, style = '') => `<div class="rs-ce" style="${style}"><div style="zoom:${zoom}">${M.contre(o)}</div></div>`;

  /* La tête de la publication : deux mentions en haut, dans la zone sûre */
  R.tete = (F, gauche, droite) => `<div class="rs-tete t-etq" style="left:${F.sure.x}px;top:${F.sure.y}px">${gauche}</div><div class="rs-tete t-etq" style="right:${F.l - F.sure.x - F.sure.l}px;top:${F.sure.y}px;text-align:right">${droite}</div>`;

  window.Reseaux = R;
})();
