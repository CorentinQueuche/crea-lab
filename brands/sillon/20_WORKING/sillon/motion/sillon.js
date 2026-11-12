/* Sillon · le mouvement (objet global S). Chargé après brand/marque.js, brand/matiere.js, brand/verse.js et motion/lib.js.
   Ce qui revient dans les huit vidéos du lot Mouvement (25 à 32) : la règle de la marque écrite en fonctions du temps.

   La règle. Ça penche, le vin reste d'aplomb. On verse par le haut : le niveau monte en 0,9 s. Un mot bascule de 12° en
   0,6 s ; au-delà, il se vide par son bord le plus bas. Jamais de fondu sur le vin, jamais de vin qui tourne avec sa
   lettre, jamais de rebond.

   Ce que fait ce fichier :
     S.pret(photos)               → promesse : polices, matière du vin, photos chargées. À poser dans window.pret.
     S.vin(cv, type, o)           → rend un canvas par le moteur (type 'titre' | 'logo' | 'formes'), seulement si ses
                                    options ont changé depuis l'image précédente (le moteur coûte 100 à 400 ms).
     S.centrer(boite, res, cx, cy) → place le cadre d'un rendu pour que son centre reste en (cx, cy) quand il penche.
     S.garde(o, a, p0)            → p de chaque verre d'un titre penché de a degrés, à volume constant (le vin ne
                                    disparaît pas quand le mot penche ; il ne déborde que si le creux ne peut plus le tenir).
     S.gardeRect(a, n0)           → la même chose pour un creux rectangulaire (le logo, le verre du symbole).
     S.versement(t, o)            → l'état d'un versement à l'instant t : p (0 à 1), son début et sa fin.
     S.jet(v, ysurf)              → la tête et la queue du filet à cet instant, posé sur la surface réelle du vin.
     S.filet(parent)              → un filet de vin qui tombe d'en haut, vertical, qui s'amincit en accélérant ;
                                    .set(x, S.jet(…), jus, largeur, t).
     S.nombre(el, v, dec)         → un nombre à chasse fixe (les chiffres ne dansent pas quand ils changent).
   Tout est fonction pure du temps : aucune horloge, aucun hasard sans graine. */
(function () {
  const A = window.Marque, S = {};
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  S.clamp = clamp;

  /* les courbes de la marque : le versement suit un débit (doux au départ, doux à l'arrêt) ; la bascule est franche et posée */
  S.verse = (p) => -(Math.cos(Math.PI * clamp(p)) - 1) / 2;
  S.penche = (p) => { p = clamp(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  S.pose = (p) => 1 - Math.pow(1 - clamp(p), 4);          /* une arrivée qui se pose, sans dépasser */
  S.part = (t, t0, d, f = S.pose) => f(clamp((t - t0) / d));
  S.VERSE = 0.9; S.BASCULE = 0.6; S.DEGRE = A.DEGRE;

  S.pret = (photos = []) => Verse.pret().then(() => Verse.charger(photos)).then(() => document.fonts.ready)
    .then(() => Promise.all([...document.images].map((im) => (im.complete ? null : new Promise((ok) => { im.onload = im.onerror = ok; })))));

  /* ---------- le moteur, sans le rappeler pour rien ---------- */
  const q = (v, n) => (typeof v === 'number' ? Math.round(v * n) / n : v);
  const cle = (o) => JSON.stringify(o, (k, v) => (typeof v === 'function' ? undefined : typeof v === 'number' ? q(v, 2000) : v));
  S.vin = (cv, type, o) => { const k = type + '|' + cle(o) + '|' + (o.cle || '');
    if (cv._cle === k) return cv._res;
    const r = type === 'logo' ? Verse.logo(cv, o) : type === 'formes' ? Verse.formes(cv, o) : Verse.rendre(cv, o);
    cv._cle = k; cv._res = r; return r; };
  S.centrer = (boite, res, cx, cy) => { boite.style.left = (cx - res.l / 2).toFixed(2) + 'px'; boite.style.top = (cy - res.h / 2).toFixed(2) + 'px'; };

  /* ---------- le vin garde son volume quand le mot penche ---------- */
  const _cap = new Map();
  /* contenance de chaque verre d'un titre, à l'angle a (cl, mesurée par le moteur, sans dessiner) */
  S.capacites = (o, a) => { const k = cle({ ...o, p: 1, angle: q(a, 20) }); if (!_cap.has(k)) { const m = Verse.mesurer({ ...o, p: 1, angle: q(a, 20) }); const c = {}; m.poches.forEach((pc) => { c[pc.i] = (c[pc.i] || 0) + pc.capacite; }); _cap.set(k, c); } return _cap.get(k); };
  /* p de chaque verre (par indice de lettre) à l'angle a, quand chacun tenait la part p0 de sa contenance à plat */
  S.garde = (o, a, p0) => { const c0 = S.capacites(o, 0), ca = S.capacites(o, a), P = {}; Object.keys(c0).forEach((i) => { P[i] = ca[i] ? clamp((p0 * c0[i]) / ca[i]) : 0; }); return P; };
  /* la même chose pour un creux rectangulaire (Marque.liquide) : le logotype, le verre du symbole */
  S.gardeRect = (a, n0, cav = A.CREUX) => { const plein = A.liquide(cav, a, [0, 0], 1).plein; return plein ? clamp(A.liquide(cav, a, [0, 0], n0).plein / plein) : 0; };
  /* et ce qui en sort : la part du creux versée au-delà du bord le plus bas */
  S.restant = (a, n0, cav = A.CREUX) => A.liquide(cav, a, [0, 0], n0).plein;

  /* ---------- un versement ----------
     o : t0 (le filet part du haut), ys (d'où il tombe, px), yt (la surface, px), d (durée du remplissage, 0,9 s), g
     (pesanteur, px/s²), v0 (vitesse au départ). Le niveau monte quand le filet touche la surface ; on relève la bouteille
     pour que la fin du filet arrive à la surface au moment où le niveau atteint sa cible. */
  S.chute = (h, g, v0) => (-v0 + Math.sqrt(v0 * v0 + 2 * g * Math.max(0, h))) / g;
  S.versement = (t, o) => { const { t0, ys, yt, d = S.VERSE, g = 5200, v0 = 520 } = o, tc = S.chute(yt - ys, g, v0), debut = t0 + tc, te = debut + d - tc;
    const p = S.verse((t - debut) / d), y = (dt) => ys + v0 * dt + 0.5 * g * dt * dt;
    return { p, debut, fin: debut + d, t, t0, te, ys, yt, g, v0, y }; };
  /* le filet à l'instant t, posé sur la surface réelle (ysurf, lue sur le rendu du moteur) */
  S.jet = (v, ysurf) => { const yt = ysurf == null ? v.yt : ysurf, tete = v.t < v.t0 ? null : Math.min(yt, v.y(v.t - v.t0)), queue = v.t < v.te ? v.ys : v.y(v.t - v.te);
    return { tete, queue: tete == null || queue >= yt ? null : queue, ys: v.ys, yt, g: v.g, v0: v.v0 }; };

  /* ---------- le filet ----------
     Un ruban vertical : il s'amincit en accélérant (débit constant), il a le ton du bord au cœur de son jus, un éclat
     d'un côté, et une lueur là où il touche la surface. Il ne penche jamais. */
  const NS = 'http://www.w3.org/2000/svg';
  let _nf = 0;
  S.filet = (parent, o = {}) => { const id = 'vsf' + ++_nf, svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'vs-filet'); svg.setAttribute('width', parent.clientWidth || 10); svg.setAttribute('height', parent.clientHeight || 10);
    svg.innerHTML = `<defs><linearGradient id="${id}g" x1="0" x2="1" y1="0" y2="0"><stop offset="0"/><stop offset=".28"/><stop offset=".55"/><stop offset="1"/></linearGradient>
      <radialGradient id="${id}r"><stop offset="0" stop-opacity=".85"/><stop offset=".45" stop-opacity=".35"/><stop offset="1" stop-opacity="0"/></radialGradient></defs>
      <ellipse fill="url(#${id}r)"/><path fill="url(#${id}g)"/><path class="e" fill="rgba(255,255,255,.55)"/>`;
    parent.appendChild(svg);
    const [, , gr, rr] = [null, null, svg.querySelector('linearGradient'), svg.querySelector('radialGradient')], [el, corps, eclat] = [svg.querySelector('ellipse'), svg.querySelectorAll('path')[0], svg.querySelectorAll('path')[1]];
    let jus0 = null;
    const set = (x, v, jus = 'maceration', w0 = 26, t = 0) => {
      if (!v || v.tete == null || v.queue == null || v.tete - v.queue < 1) { svg.style.display = 'none'; return; }
      svg.style.display = '';
      if (jus !== jus0) { const E = A.ECHELLES[jus]; [E[3], E[1], E[2], E[3]].forEach((c, i) => gr.children[i].setAttribute('stop-color', c)); [E[0], E[1], E[2]].forEach((c, i) => rr.children[i].setAttribute('stop-color', c)); jus0 = jus; }
      const N = 28, L = [], R = [], H = [], y0 = v.queue, y1 = v.tete;
      for (let i = 0; i <= N; i++) { const y = y0 + ((y1 - y0) * i) / N, vit = Math.sqrt(v.v0 * v.v0 + 2 * v.g * Math.max(0, y - v.ys)), w = w0 * Math.sqrt(v.v0 / vit),
          ond = 0.7 * Math.sin((y - vit * t * 0.35) / 19) * (w / w0), cx = x + ond;
        L.push([cx - w / 2, y]); R.push([cx + w / 2, y]); H.push([cx - w * 0.28, y, Math.max(0.6, w * 0.12)]); }
      const f = (p) => p[0].toFixed(2) + ',' + p[1].toFixed(2);
      /* la tête et la queue sont arrondies : une goutte qui s'allonge */
      const wq = R[0][0] - L[0][0], wt = R[N][0] - L[N][0];
      corps.setAttribute('d', `M${f(L[0])} Q${(x).toFixed(2)},${(y0 - wq * 0.6).toFixed(2)} ${f(R[0])} L${R.map(f).join(' L')} Q${x.toFixed(2)},${(y1 + wt * 0.5).toFixed(2)} ${f(L[N])} L${L.slice().reverse().map(f).join(' L')}Z`);
      eclat.setAttribute('d', 'M' + H.map((h) => `${(h[0] - h[2] / 2).toFixed(2)},${h[1].toFixed(2)}`).join(' L') + ' L' + H.slice().reverse().map((h) => `${(h[0] + h[2] / 2).toFixed(2)},${h[1].toFixed(2)}`).join(' L') + 'Z');
      /* la lueur à l'impact : seulement quand le filet touche la surface */
      if (v.tete >= v.yt - 0.5) { el.style.display = ''; el.setAttribute('cx', x); el.setAttribute('cy', v.yt + 2); el.setAttribute('rx', wt * 2.6); el.setAttribute('ry', wt * 0.55); } else el.style.display = 'none'; };
    return { svg, set }; };

  /* ---------- un nombre qui ne danse pas ---------- */
  S.nombre = (el, v, dec = 1, unite = '') => { const s = v.toFixed(dec).replace('.', ',');
    el.innerHTML = [...s].map((c) => (/\d/.test(c) ? `<span class="vs-ch">${c}</span>` : `<span class="vs-sep">${c}</span>`)).join('') + (unite ? `<span class="vs-u">${A.NB}${unite}</span>` : ''); };

  /* ---------- la ligne de niveau : un filet horizontal, toujours horizontal ---------- */
  S.niveau = (el, y, x0, x1, part = 1) => { el.style.top = y.toFixed(2) + 'px'; el.style.left = x0 + 'px'; el.style.width = Math.max(0, (x1 - x0) * part).toFixed(2) + 'px'; };

  /* ---------- une écriture qui ne bouge pas la mise en page : chaque mot garde sa place, ses lettres arrivent ---------- */
  S.ecrire = (el, o) => { A.typo(el); return M.typer(el, o); };   /* les espaces insécables d'abord : le découpage les garde dans le mot */

  window.S = S;
})();
