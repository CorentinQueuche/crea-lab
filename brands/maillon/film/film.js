// Maillon — film de présentation. Tout l'état de la page est une fonction pure du temps :
// window.film(t) pose l'interface à l'instant t (secondes) et renvoie la caméra.
(function () {
  const M = window.MAILLON, cr = M.cr;
  const canvas = document.getElementById('canvas'), world = document.getElementById('world');
  const svg = document.getElementById('links');
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const cl = (x) => Math.max(0, Math.min(1, x));
  const p = (t, a, d) => cl((t - a) / d);
  const lerp = (a, b, k) => a + (b - a) * k;
  const E = {
    outCubic: (x) => 1 - (1 - x) ** 3,
    outQuint: (x) => 1 - (1 - x) ** 5,
    inOutCubic: (x) => (x < .5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
    inOutQuart: (x) => (x < .5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2),
    inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
    outExpo: (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x)),
    outBack: (x) => { const c = 1.55; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; },
    pose: (x) => 1 - (1 - x) ** 2.2,
  };
  const DUREE = 22.8, T_FIN = 20.2, T_LOGO = T_FIN + .8;
  const RANG = { i: 0, a: 1, m: 2, o: .5, n: 1.5 };     // les lettres se tracent en s'éloignant des maillons
  const fr = (v, d) => v.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/ | /g, ' ');
  const pos = (sel, fx, fy) => { const r = (typeof sel === 'string' ? $(sel) : sel).getBoundingClientRect(); return { x: r.left - cr.left + r.width * fx, y: r.top - cr.top + r.height * fy }; };
  const div = (cls, parent, html) => { const d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; (parent || canvas).appendChild(d); return d; };

  // ---------- éléments ajoutés pour le film ----------
  const titre = div('', world, `<div class="bloc"><div id="logo-fin">${Marque.logotype({ hauteur: 200, fond: '#040405' })}</div>
      <div class="tag">De la demande à la facture, <b>sans ressaisie.</b></div></div>`);
  titre.id = 'titre';
  const tag = $('#titre .tag');
  $$('#logo-fin path:not(.coupe)').forEach((e) => e.setAttribute('stroke-dasharray', '1 1'));
  const lg = { m1: $$('#logo-fin path.m1:not(.rep)'), m2: $$('#logo-fin path.m2:not(.rep)'), rep: $$('#logo-fin .rep'), lettres: $$('#logo-fin .lt'), points: $$('#logo-fin .pt') };
  const toast = div('toast', canvas, `<span class="pastille"><svg class="ico"><use href="#i-mail"/></svg></span><div><b>Nouvelle demande</b><span>Fromagerie Brévent · comptoir réfrigéré 3,20 m</span></div><em>09:12</em>`);

  const wave = div('wave'), ring = div('ring');
  canvas.insertBefore(wave, svg); canvas.insertBefore(ring, svg);   // sous les liens et les blocs
  const fx = div('', canvas); fx.id = 'fx';
  const palette = div('palette', canvas, `<svg class="ico"><use href="#i-bot"/></svg><span class="txt"></span><span class="touche">Entrée ↵</span>`);
  const paletteTxt = palette.querySelector('.txt'), toucheEntree = palette.querySelector('.touche');
  const touches = div('touches', canvas, `<span class="touche">Ctrl</span><span class="touche">K</span>`);
  const [tCtrl, tK] = touches.children;
  const curseur = div('curseur', fx, `<svg viewBox="0 0 34 34"><path d="M4 3 L4 26 L10.500 20.500 L15 30 L19 28 L14.600 19 L23 19 Z" fill="#fff" stroke="#111" stroke-width="1.600" stroke-linejoin="round"/></svg>`);

  // ---------- repères mesurés au repos ----------
  const noeuds = {
    demande: $('#n-demande'), devis: $('#n-devis'), plan: $('#n-plan'), valid: $('#n-valid'),
    cmd: $('#n-cmd'), pose: $('#n-pose'), facture: $('#n-facture'), plus1: $('#plus-1'), plus2: $('#plus-2'),
  };
  const L = M.liens;
  for (const k in L) { L[k].len = L[k].coeur.getTotalLength(); L[k].traits.forEach((tr) => tr.setAttribute('stroke-dasharray', L[k].len + 1)); }
  const pointe = {};
  for (const k in L) {
    const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', 5); c.setAttribute('fill', '#fff3dd'); c.setAttribute('filter', 'url(#glow2)'); svg.appendChild(c); pointe[k] = c;
  }
  const pulses = Object.keys(L).map((k, i) => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', 4.2); c.setAttribute('class', 'pulse'); c.setAttribute('filter', 'url(#glow2)'); svg.appendChild(c); return { c, k, ph: i * .37 }; });

  // carte plan : traits du dessin
  const traitsPlan = $$('#n-plan .thumb svg > path, #n-plan .thumb svg > circle, #n-plan .thumb svg > g[stroke="#ff9a2e"] > path');
  traitsPlan.forEach((e) => { e.setAttribute('pathLength', 1); e.setAttribute('stroke-dasharray', '1 1'); });
  const textesPlan = $$('#n-plan .thumb svg text');
  const kvPlan = $$('#n-plan .kv > *');

  // carte validation
  const [vMontant, vMarge] = $$('#n-valid .thumb .mono');
  const vInfo = $('#n-valid .info'), vChip = $('#n-valid .chip.warn');
  const vCentre = pos('#n-valid', .5, .45);
  // carte commandes
  const lignes = $$('#n-cmd .sup'), st3 = lignes[2].querySelector('.st'), chipCmd = $('#n-cmd .chip');
  // pose, panneau de droite
  const barres = $$('#n-pose .bar');
  const histo = $$('#chart > i'), tip = $('#chart .tip .mono');
  const c112 = $('.stat b'), c98 = $('.big');

  // ondes de clic
  const clics = [
    { t: 4.25, at: { x: L['demande-devis'].a.x, y: L['demande-devis'].a.y } },
    { t: 5.25, at: { x: L['demande-devis'].b.x, y: L['demande-devis'].b.y } },
    { t: 5.95, at: { x: L['devis-plan'].a.x, y: L['devis-plan'].a.y } },
    { t: 15.3, at: pos(st3, .5, .5) },
  ];
  clics.forEach((c) => { c.o1 = div('onde', fx); c.o2 = div('onde b', fx); });

  // trajet du curseur : [t0, t1, depuis, vers]
  const A = clics[0].at, B = clics[1].at, C = clics[2].at, S3 = clics[3].at;
  const chipPt = pos(vChip, .55, .6);
  const traj = [
    [3.25, 3.95, { x: A.x + 250, y: A.y + 190 }, { x: A.x + 4, y: A.y + 4 }],
    [5.4, 5.9, B, { x: C.x + 3, y: C.y + 3 }],
    [9.6, 10.15, { x: chipPt.x + 330, y: chipPt.y + 120 }, chipPt],
    [12.7, 13.4, chipPt, { x: chipPt.x + 250, y: chipPt.y - 150 }],
    [13.7, 15.2, { x: chipPt.x + 250, y: chipPt.y - 150 }, { x: S3.x + 2, y: S3.y + 3 }],
    [15.7, 16.4, { x: S3.x + 2, y: S3.y + 3 }, { x: S3.x + 170, y: S3.y + 160 }],
  ];
  const phrase = 'Accorder 2 % de remise';
  const frappes = []; { let tt = 10.95, s = 7; for (let i = 0; i < phrase.length; i++) { s = (s * 16807) % 2147483647; tt += .03 + (s % 1000) / 1000 * .04 + (phrase[i] === ' ' ? .04 : 0); frappes.push(tt); } }
  const T_ENTREE = 12.4, T_APPLI = 12.55;

  function apparait(n, t, t0, extra) {
    const k = p(t, t0, .62), o = p(t, t0, .22);
    n.style.opacity = o;
    n.style.transform = `translateY(${(1 - E.outCubic(k)) * 22}px) scale(${(.82 + .18 * E.outBack(k)) * (extra || 1)})`;
  }
  function trace(nom, t, t0, d, ease) {
    const l = L[nom], k = (ease || E.inOutCubic)(p(t, t0, d));
    l.g.style.opacity = t >= t0 ? 1 : 0;
    l.traits.forEach((tr) => tr.setAttribute('stroke-dashoffset', (l.len + 1) * (1 - k)));
    l.tetes[0].style.opacity = p(t, t0, .12);
    const ke = p(t, t0 + d - .04, .22);
    l.tetes[1].style.opacity = ke;
    const pt = l.coeur.getPointAtLength(l.len * k);
    pointe[nom].setAttribute('cx', pt.x); pointe[nom].setAttribute('cy', pt.y);
    pointe[nom].style.opacity = k > 0 && k < 1 ? 1 : 0;
    return pt;
  }

  // ---------- caméra ----------
  const CAM = {
    ouverture: { x: 640, y: 196, zoom: 2.55, tilt: 30, yaw: -18, roll: -5, flou: .9 },
    titre: { x: 1000, y: 650, zoom: 1.22, tilt: 0, yaw: 0, roll: 0, flou: 0 },
    titre2: { x: 1000, y: 650, zoom: 1.3, tilt: 0, yaw: 0, roll: 0, flou: 0 },
    demande: { x: 505, y: 300, zoom: 2.25, tilt: 34, yaw: -14, roll: -6, flou: 1 },
    devis: { x: 735, y: 455, zoom: 2.4, tilt: 32, yaw: -21, roll: -8, flou: 1 },
    planA: { x: 1020, y: 372, zoom: 2.0, tilt: 31, yaw: 23, roll: 7, flou: .8 },
    planB: { x: 1112, y: 338, zoom: 2.3, tilt: 27, yaw: 15, roll: 5, flou: .7 },
    validA: { x: 835, y: 922, zoom: 1.72, tilt: 31, yaw: -19, roll: -5, flou: .6 },
    validB: { x: 850, y: 936, zoom: 1.86, tilt: 26, yaw: -10, roll: -3, flou: .5 },
    cmd: { x: 1150, y: 770, zoom: 2.2, tilt: 28, yaw: 14, roll: 4, flou: .8 },
    cmdB: { x: 1172, y: 792, zoom: 2.32, tilt: 27, yaw: 9, roll: 3, flou: .8 },
    ensA: { x: 1000, y: 655, zoom: .80, tilt: 17, yaw: -13, roll: 2, flou: .3 },
    ensB: { x: 1012, y: 650, zoom: .87, tilt: 13, yaw: -7, roll: 1.2, flou: .27 },
  };
  const mix = (a, b, k) => { const o = {}; for (const key in a) o[key] = lerp(a[key], b[key], k); return o; };
  function camera(t) {
    let c;
    if (t < 3.3) c = mix(CAM.ouverture, CAM.demande, E.inOutCubic(p(t, 1.3, 1.9)));     // on entre directement dans le produit
    else if (t < 6.2) c = mix(CAM.demande, CAM.devis, E.inOutSine(p(t, 4.15, 1.7)));
    else if (t < 9.0) c = mix(CAM.planA, CAM.planB, E.pose(p(t, 6.2, 2.8)));
    else if (t < 13.5) c = mix(CAM.validA, CAM.validB, E.pose(p(t, 9.0, 4.5)));
    else if (t < 16.6) c = mix(mix(CAM.validB, CAM.cmd, E.inOutCubic(p(t, 13.5, 1.5))), CAM.cmdB, E.inOutSine(p(t, 15.0, 1.6)));
    else {
      c = mix(mix(CAM.cmdB, CAM.ensA, E.inOutCubic(p(t, 16.6, 2.1))), CAM.ensB, E.inOutSine(p(t, 18.2, 2.7)));
      // fin : pas de coupe, la caméra revient de face pendant que le fond monte, avant que le logotype se trace
      if (t > T_FIN) c = mix(c, mix(CAM.titre, CAM.titre2, p(t, T_FIN, DUREE - T_FIN)), E.inOutCubic(p(t, T_FIN, .78)));
    }
    // respiration légère de la caméra sur les plans inclinés
    const a = cl(c.tilt / 20);
    c.yaw += a * .7 * Math.sin(t * .9); c.tilt += a * .4 * Math.sin(t * .7 + 1); c.roll += a * .25 * Math.sin(t * .6 + 2);
    return { cible: [c.x, c.y], zoom: c.zoom, tilt: c.tilt, yaw: c.yaw, roll: c.roll, flou: c.flou, focale: 2.1 + .9 * (1 - cl((c.zoom - .8) / 1.2)) };
  }

  // ---------- état de l'interface ----------
  function film(t) {
    // ouverture : un simple fondu depuis le noir, sans logo. Fin : le fond monte, la caméra revient de face,
    // puis le logotype se trace comme un lien de l'app : les deux maillons d'abord, les lettres ensuite.
    const noir = 1 - E.inOutCubic(p(t, 0, .4)), fin = E.inOutCubic(p(t, T_FIN, .8));
    titre.style.opacity = Math.max(noir, fin);
    titre.style.display = Math.max(noir, fin) > 0 ? 'grid' : 'none';
    const trait = (e, t0, d, ease) => { e.setAttribute('stroke-dashoffset', 1 - ease(p(t, t0, d))); e.style.opacity = t >= t0 ? 1 : 0; };
    lg.m1.forEach((e) => trait(e, T_LOGO, .5, E.inOutCubic));
    lg.m2.forEach((e) => trait(e, T_LOGO + .18, .5, E.inOutCubic));
    lg.rep.forEach((e) => { e.style.opacity = p(t, T_LOGO + .64, .1); });
    lg.lettres.forEach((e) => trait(e, T_LOGO + .45 + RANG[e.dataset.lettre] * .09, .4, E.outCubic));
    lg.points.forEach((e) => { e.style.opacity = p(t, T_LOGO + .78, .15); });
    const kt = E.outCubic(p(t, T_LOGO + 1.2, .5));
    tag.style.opacity = p(t, T_LOGO + 1.2, .4); tag.style.transform = `translateY(${(1 - kt) * 14}px)`;

    // la demande arrive (notification), puis se range sur le canvas : elle devient la première pile
    const kn = p(t, .3, .5), kd = E.inOutCubic(p(t, 1.75, .55));
    toast.style.opacity = cl(kn * 2.5) * (1 - kd);
    toast.style.transform = `translate(${kd * -96}px, ${(1 - E.outBack(kn)) * -18 + kd * 128}px) scale(${(.9 + .1 * E.outBack(kn)) * (1 - .55 * kd)})`;

    // blocs
    const survolDemande = 1 + .045 * E.inOutSine(p(t, 3.8, .25)) * (1 - E.inOutSine(p(t, 5.3, .3)));
    apparait(noeuds.demande, t, 2.12, survolDemande);
    apparait(noeuds.devis, t, 5.12);
    apparait(noeuds.plan, t, 6.7);
    apparait(noeuds.plus1, t, 7.05);
    apparait(noeuds.valid, t, 9.1);
    apparait(noeuds.cmd, t, 14.15);
    apparait(noeuds.plus2, t, 14.45);
    apparait(noeuds.pose, t, 16.45);
    apparait(noeuds.facture, t, 17.3);

    // liens
    const tip1 = trace('demande-devis', t, 4.3, .92);
    trace('devis-plan', t, 6.0, .9);
    trace('devis-valid', t, 8.5, .85);
    trace('valid-cmd', t, 13.15, 1.1);
    trace('cmd-pose', t, 15.7, .9);
    M.froids.style.opacity = E.inOutSine(p(t, 17.0, 1.0));
    const kp = p(t, 17.5, .6) * (1 - p(t, T_FIN, .5));
    pulses.forEach(({ c, k, ph }) => {
      const f = ((t - 17.4) * .5 + ph) % 1, pt = L[k].coeur.getPointAtLength(L[k].len * (f < 0 ? 0 : f));
      c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.style.opacity = kp * Math.sin(Math.PI * cl(f)) ** .6;
    });

    // plan d'agencement
    traitsPlan.forEach((e, i) => e.setAttribute('stroke-dashoffset', 1 - E.outCubic(p(t, 7.0 + i * .045, .75))));
    textesPlan.forEach((e) => { e.style.opacity = p(t, 8.25, .3); });
    kvPlan.forEach((e, i) => { const k = p(t, 7.7 + Math.floor(i / 2) * .16, .45); e.style.opacity = k; e.style.transform = `translateY(${(1 - E.outCubic(k)) * 8}px)`; });

    // validation : survol, clavier, palette, application
    const survolChip = E.inOutSine(p(t, 10.0, .2)) * (1 - p(t, T_APPLI, .2));
    const valide = t >= T_APPLI + .25;
    vChip.className = 'chip ' + (valide ? 'okc' : 'warn');
    vChip.textContent = valide ? 'Marge validée' : 'Seuil de marge';
    vChip.style.boxShadow = valide ? '' : `0 0 0 ${1.5 * survolChip}px rgba(255,180,90,${.9 * survolChip}), 0 0 ${18 * survolChip}px rgba(255,154,46,${.5 * survolChip})`;
    vChip.style.transform = `scale(${1 + .05 * survolChip + (valide ? .12 * (1 - E.outCubic(p(t, T_APPLI + .25, .5))) : 0)})`;
    const ka = E.outCubic(p(t, T_APPLI + .05, .8));
    vMontant.textContent = fr(lerp(18426.80, 18058.26, ka), 2) + ' €';
    vMarge.textContent = fr(lerp(29.6, 28.4, ka), 1) + ' %';
    vMarge.style.color = valide ? '#8ff0b6' : '#ffb866';
    vInfo.innerHTML = '<i>Info :</i> ' + (valide ? 'Remise accordée : 2 %' : 'Remise à confirmer');
    const eclat = t >= T_APPLI ? (1 - E.outCubic(p(t, T_APPLI, 1.1))) : 0;
    noeuds.valid.style.boxShadow = eclat > 0 ? `0 1px 0 rgba(255,255,255,.14) inset, 0 40px 70px -24px rgba(0,0,0,.95), 0 0 0 ${1.5}px rgba(255,170,80,${eclat}), 0 0 ${70 * eclat}px rgba(255,154,46,${.6 * eclat})` : '';

    const kt1 = p(t, 10.3, .25), kt2 = p(t, 10.82, .2);
    touches.style.opacity = kt1 * (1 - kt2);
    touches.style.transform = `translateY(${(1 - E.outBack(kt1)) * 14}px)`;
    const presse = (el, a, b) => { const d = t >= a && t < b ? 1 : 0; el.style.transform = `translateY(${3 * d}px)`; el.style.boxShadow = d ? '0 0 0 #0b0b0b, 0 0 18px rgba(255,154,46,.5)' : ''; el.style.color = d ? '#fff' : ''; };
    presse(tCtrl, 10.5, 10.8); presse(tK, 10.6, 10.8);

    const ko = p(t, 10.75, .4), kf = p(t, T_ENTREE + .12, .3);
    palette.style.opacity = cl(ko * 3) * (1 - kf);
    palette.style.transform = `translateY(${(1 - E.outBack(ko)) * 24 - kf * 10}px) scale(${.9 + .1 * E.outBack(ko) - .05 * kf})`;
    const n = frappes.filter((x) => x <= t).length;
    const caret = n < phrase.length && n > 0 ? true : Math.floor(t * 2.2) % 2 === 0;
    paletteTxt.innerHTML = (n ? phrase.slice(0, n).replace(/ /g, '&nbsp;') : '<span style="color:#77736c">Demander à Maillon…</span>') + (caret ? '<i></i>' : '<i style="opacity:0"></i>');
    presse(toucheEntree, T_ENTREE, T_ENTREE + .16);

    // grande onde sur la grille au moment de l'application
    const kw2 = p(t, T_APPLI, 1.5);
    if (kw2 > 0 && kw2 < 1) {
      const r = 40 + E.outCubic(kw2) * 1250, o = (1 - kw2) ** 1.3;
      const m = `radial-gradient(circle at ${vCentre.x}px ${vCentre.y}px, transparent ${Math.max(0, r - 170)}px, #000 ${r - 30}px, #000 ${r}px, transparent ${r + 26}px)`;
      wave.style.opacity = o; wave.style.maskImage = m; wave.style.webkitMaskImage = m;
      ring.style.opacity = o * .8; ring.style.left = (vCentre.x - r) + 'px'; ring.style.top = (vCentre.y - r) + 'px'; ring.style.width = ring.style.height = (2 * r) + 'px';
    } else { wave.style.opacity = 0; ring.style.opacity = 0; }

    // commandes fournisseurs
    lignes.forEach((e, i) => { const k = p(t, 14.4 + i * .14, .45); e.style.opacity = k; e.style.transform = `translateX(${(1 - E.outCubic(k)) * -14}px)`; });
    const survol3 = E.inOutSine(p(t, 14.95, .25)) * (1 - E.inOutSine(p(t, 15.75, .3)));
    lignes[2].style.background = `rgba(255,255,255,${.065 * survol3})`;
    const commande = t >= 15.34;
    st3.className = 'st' + (commande ? ' cmd' : ''); st3.textContent = commande ? 'Commandé' : 'À commander';
    st3.style.transform = `scale(${commande ? 1 + .2 * (1 - E.outCubic(p(t, 15.34, .45))) : 1})`; st3.style.transformOrigin = '100% 50%';
    chipCmd.textContent = commande && t > 15.5 ? '3 sur 3 confirmées' : '2 sur 3 confirmées';
    chipCmd.className = 'chip' + (commande && t > 15.5 ? ' okc' : '');

    // pose, activité
    barres.forEach((e, i) => { e.style.transform = `scaleX(${E.outQuint(p(t, 16.95 + i * .16, .7))})`; });
    histo.forEach((e, i) => { e.style.height = (+e.dataset.h * E.outBack(p(t, 17.75 + i * .045, .7))) + '%'; });
    const kc = E.outCubic(p(t, 17.9, 1.2));
    tip.textContent = fr(12279.40 * kc, 2) + ' €';
    c112.textContent = Math.round(112 * kc);
    c98.firstChild.textContent = Math.round(lerp(60, 98, E.outCubic(p(t, 18.1, 1.2)))) + ' %';

    // curseur
    let cp = traj[0][2], vis = 0;
    for (const [a, b, de, vers] of traj) { if (t >= a) { const k = E.inOutCubic(p(t, a, b - a)); cp = { x: lerp(de.x, vers.x, k), y: lerp(de.y, vers.y, k) - Math.sin(Math.PI * k) * 14 }; } }
    if (t >= 4.3 && t < 5.4) cp = { x: tip1.x + 3, y: tip1.y + 3 };
    vis = Math.max(p(t, 3.25, .25) * (1 - p(t, 6.0, .18)), p(t, 9.6, .25) * (1 - p(t, 16.15, .25)));
    const appui = (t >= 4.22 && t < 5.25) || clics.some((c) => t >= c.t - .03 && t < c.t + .11) || (t >= T_ENTREE && t < T_ENTREE + .1);
    curseur.style.opacity = vis;
    curseur.style.transform = `translate(${cp.x - 4}px, ${cp.y - 3}px) scale(${appui ? 1.22 : 1.45})`;
    clics.forEach((c) => {
      const k = p(t, c.t, .7), r1 = 6 + 46 * E.outCubic(k), r2 = 6 + 76 * E.outCubic(p(t, c.t + .06, .85));
      [[c.o1, r1, k], [c.o2, r2, p(t, c.t + .06, .85)]].forEach(([o, r, kk]) => {
        o.style.left = (c.at.x - r) + 'px'; o.style.top = (c.at.y - r) + 'px'; o.style.width = o.style.height = (2 * r) + 'px';
        o.style.opacity = kk > 0 && kk < 1 ? (1 - kk) ** 1.4 * .9 : 0;
      });
    });
    return camera(t);
  }
  window.film = film; window.FILM_DUREE = DUREE;
  const q = new URLSearchParams(location.search).get('t');
  film(q ? +q : 0);
})();
