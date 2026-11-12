// Roulement — film de présentation. Tout l'état de la page est une fonction pure du temps :
// window.film(t) pose l'interface à l'instant t (secondes) et renvoie la caméra.
(function () {
  const R = window.ROULEMENT;
  const world = document.getElementById('world'), centre = document.getElementById('centre');
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const cl = (x) => Math.max(0, Math.min(1, x));
  const p = (t, a, d) => cl((t - a) / d);
  const lerp = (a, b, k) => a + (b - a) * k;
  const E = {
    outCubic: (x) => 1 - (1 - x) ** 3,
    outExpo: (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x)),
    inOutCubic: (x) => (x < .5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
    inOutQuart: (x) => (x < .5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2),
    inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
    outBack: (x) => { const c = 1.55; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; },
    pose: (x) => 1 - (1 - x) ** 2.2,
  };
  const INS = String.fromCharCode(160);
  const div = (c, parent, html) => { const d = document.createElement('div'); d.className = c; if (html) d.innerHTML = html; parent.appendChild(d); return d; };
  const txt = (el, s) => { if (el.textContent !== s) el.textContent = s; };
  const classe = (el, c, on) => { if (el.classList.contains(c) !== on) el.classList.toggle(c, on); };

  // ---------- le déroulé ----------
  const DUREE = 23, T_FIN = 20.3, T_LOGO = T_FIN + .8;
  const T_C0 = .35, T_CD = 5.25;                // la courbe d'affluence se dévoile dès l'ouverture, du lundi au dimanche
  const COUPE1 = 6.2, T_CLIC1 = 7.4;            // colonne de gauche : on choisit le trou du samedi
  const COUPE2 = 9.0, T_PRISE = 9.9, T_DROP = 11.6;   // moment fort : on fait glisser Inès jusqu'au créneau vide
  const COUPE3 = 12.9, T_ARD = 13.3;            // l'ardoise : le coût et la part du CA se recalculent
  const T_PUB = 17.4, T_RECUL = 17.9;           // publication, puis vue d'ensemble
  const rideau = (t) => E.inOutSine(p(t, T_C0, T_CD));
  const passage = (f) => T_C0 + Math.acos(1 - 2 * cl(f)) / Math.PI * T_CD;   // instant où le rideau atteint la fraction f

  // ---------- éléments ajoutés pour le film ----------
  const titre = div('', world, `<div class="bloc"><div id="logo-fin">${Marque.logotype({ hauteur: 160 })}</div>
      <div class="tag">Le planning des trois brasseries, <b>et ce qu’il coûte.</b></div></div>`);
  titre.id = 'titre';
  const roueFin = $('#logo-fin .roue'), anFin = $$('#logo-fin .an'), ltFin = $$('#logo-fin .lt'), tag = $('#titre .tag');
  anFin.forEach((a) => a.setAttribute('stroke-dasharray', '1 1'));

  const fxg = div('', centre); fxg.id = 'fx-grille';
  const vague = div('vague', fxg);
  const fx = div('', world); fx.id = 'fx';
  const fantome = div('fantome', fx, `<span class="av">IC</span><div><b>Inès Carvalho</b><small>18:30 – 00:30</small></div>`);
  const delta = div('delta mono', $('#ardoise'), '+ 107,34 €');
  const svgAff = R.courbe.ownerSVGElement;
  const pointe = document.createElementNS(NS, 'circle'); pointe.setAttribute('r', 4.5); pointe.setAttribute('class', 'pointe'); svgAff.appendChild(pointe);
  const LC = R.courbe.getTotalLength();
  const surCourbe = (x) => { let a = 0, b = LC; for (let i = 0; i < 18; i++) { const m = (a + b) / 2; if (R.courbe.getPointAtLength(m).x < x) a = m; else b = m; } return R.courbe.getPointAtLength((a + b) / 2); };

  const clics = [{ t: T_CLIC1, c: '' }, { t: T_PRISE, c: '' }, { t: T_DROP, c: 'b' }, { t: T_PUB, c: 'c' }];
  clics.forEach((c) => { c.o1 = div('onde ' + c.c, fx); c.o2 = div('onde b', fx); });
  const curseur = div('curseur', fx, `<svg viewBox="0 0 34 34"><path d="M4 3 L4 26 L10.5 20.5 L15 30 L19 28 L14.6 19 L23 19 Z" fill="#1f1a15" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg>`);

  // ---------- ce qui s'anime, repéré une fois ----------
  R.blocs.forEach((b) => { b.t0 = passage((b.jour + .5) / 7) + .12 + b.ligne * .028; });
  const calmes = [], vides = [];
  R.lignes.forEach((l, n) => l.cases.forEach((c, j) => {
    const e = c.querySelector('.repos, .absent'); if (e) calmes.push({ el: e, t0: passage((j + .5) / 7) + .2 + n * .028 });
    const v = c.querySelector('.vide'); if (v) vides.push({ el: v, t0: passage((j + .5) / 7) + .62, jour: j, ligne: n });
  }));
  const etiquettes = Object.keys(R.svc).map((k) => { const el = R.svc[k]; return { el, k, t0: passage(parseFloat(el.style.left) / 100) + .05, top: parseFloat(el.style.top) }; });
  const svcSam = R.svc['5-1'];
  const trous = $$('#trous .trou'), cands = $$('#candidats .cand'), candH = $('#candidats-bloc h4');
  const ines = $('#cand-ines'), inesTag = ines.querySelector('.tag');
  const labBar = R.groupes.bar.pourvoir.lab;
  const el = { cout: $('#cout'), heures: $('#heures'), ratio: $('#ratio'), reste: $('#reste'), barH: $('#bar-h'), barC: $('#bar-cout'), barB: $('#bar-b'),
    grC: $('#gr-cout'), grR: $('#gr-ratio'), grJ: $('#gr-j'), gpC: $('#grp-cout'), gpR: $('#grp-ratio'), bloc: $('.a-ratio'),
    pub: $('#publier'), pubTxt: $('#publier-txt'), pubIco: $('#publier use'), etat: $('#etat'), etatTxt: $('#etat-txt'), toast: $('#toast'),
    cpt: $('#cpt-trous'), trousH: $('#trous-h'), lieu: $('#lieu-trous'), alerteSam: R.jours[5].querySelector('.alerte-j') };
  const lue = $('.lue'), lueH = lue.parentNode.querySelector('h4'), lueN = lue.querySelector('b'), lueB = lue.querySelector('.b i');
  const lueH0 = lueH.innerHTML;

  // positions mesurées au premier appel : les polices sont alors chargées et rien n'a encore été déplacé
  let G = null;
  function mesurer() {
    const c = (e, fx_, fy) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width * fx_, y: r.top + r.height * fy }; };
    G = { trou: c(trous[0], .62, .55), ines: c(ines, .42, .36), vide: c(R.caseTrou, .5, .5), pub: c(el.pub, .5, .55) };
    const o = fxg.getBoundingClientRect(); G.videG = { x: G.vide.x - o.left, y: G.vide.y - o.top };
    el.pub.style.width = el.pub.offsetWidth + 'px'; el.pub.style.justifyContent = 'center';
    el.etat.style.width = (el.etat.offsetWidth + 6) + 'px'; el.etat.style.justifyContent = 'flex-end'; el.etat.style.whiteSpace = 'nowrap';
    const depart = { x: G.trou.x + 240, y: G.trou.y + 180 }, repli = { x: G.vide.x + 160, y: G.vide.y + 120 };
    G.traj = [
      [6.55, 7.3, depart, G.trou],
      [8.35, 9.45, G.trou, G.ines],
      [T_PRISE + .1, T_DROP, G.ines, G.vide],
      [11.95, 12.7, G.vide, repli],
      [16.35, 17.25, { x: G.pub.x - 170, y: G.pub.y + 250 }, G.pub],
      [17.65, 18.3, G.pub, { x: G.pub.x - 130, y: G.pub.y + 160 }],
    ];
    clics[0].at = G.trou; clics[1].at = G.ines; clics[2].at = G.vide; clics[3].at = G.pub;
  }

  function apparait(n, t, t0, extra) {
    const k = p(t, t0, .62), o = p(t, t0, .22);
    n.style.opacity = o;
    n.style.transform = `translateY(${(1 - E.outCubic(k)) * 16}px) scale(${(.82 + .18 * E.outBack(k)) * (extra || 1)})`;
  }

  // ---------- caméra ----------
  const CAM = {
    ouverture: { x: 620, y: 330, largeur: 1040, tilt: 24, yaw: -10, roll: -3, flou: .6 },
    titre: { x: 1000, y: 650, largeur: 1330, tilt: 0, yaw: 0, roll: 0, flou: 0 },
    titre2: { x: 1000, y: 650, largeur: 1250, tilt: 0, yaw: 0, roll: 0, flou: 0 },
    courbeA: { x: 700, y: 300, largeur: 780, tilt: 30, yaw: -16, roll: -5, flou: .8 },
    courbeB: { x: 1330, y: 305, largeur: 700, tilt: 27, yaw: -21, roll: -6, flou: .8 },
    trousA: { x: 190, y: 235, largeur: 640, tilt: 29, yaw: 21, roll: 5, flou: .8 },
    trousB: { x: 200, y: 415, largeur: 610, tilt: 26, yaw: 15, roll: 4, flou: .7 },
    candA: { x: 340, y: 500, largeur: 900, tilt: 26, yaw: -14, roll: -3, flou: .5 },
    troA: { x: 1290, y: 850, largeur: 780, tilt: 30, yaw: -19, roll: -6, flou: .7 },
    troB: { x: 1335, y: 872, largeur: 690, tilt: 27, yaw: -13, roll: -4, flou: .7 },
    ardA: { x: 1725, y: 215, largeur: 790, tilt: 28, yaw: 18, roll: 5, flou: .6 },
    ardB: { x: 1745, y: 335, largeur: 740, tilt: 25, yaw: 12, roll: 3.5, flou: .55 },
    pub: { x: 1650, y: 215, largeur: 880, tilt: 26, yaw: 12, roll: 3, flou: .55 },
    ensA: { x: 950, y: 655, largeur: 2300, tilt: 17, yaw: -12, roll: 2, flou: .26 },
    ensB: { x: 965, y: 650, largeur: 2160, tilt: 13, yaw: -7, roll: 1.2, flou: .25 },
  };
  const mix = (a, b, k) => { const o = {}; for (const key in a) o[key] = lerp(a[key], b[key], k); return o; };
  function camera(t) {
    let c;
    const suivi = mix(CAM.courbeA, CAM.courbeB, cl((544 + 1036 * rideau(t) - 660) / 900));
    if (t < COUPE1) c = mix(CAM.ouverture, suivi, E.inOutCubic(p(t, 0, 2.3)));        // on est déjà dans le planning
    else if (t < COUPE2) c = mix(CAM.trousA, CAM.trousB, E.inOutSine(p(t, 7.45, 1.0)));
    else if (t < COUPE3) c = mix(mix(CAM.candA, CAM.troA, E.inOutCubic(p(t, T_PRISE, 1.75))), CAM.troB, E.pose(p(t, T_DROP, COUPE3 - T_DROP)));
    else if (t < T_RECUL) c = mix(mix(CAM.ardA, CAM.ardB, E.pose(p(t, COUPE3, 3))), CAM.pub, E.inOutCubic(p(t, 16.2, 1.15)));
    else {
      c = mix(mix(CAM.pub, CAM.ensA, E.inOutCubic(p(t, T_RECUL, 2.0))), CAM.ensB, E.inOutSine(p(t, 19.2, 1.8)));
      // fin : pas de coupe, la caméra revient de face pendant que le papier remonte
      if (t > T_FIN) c = mix(c, mix(CAM.titre, CAM.titre2, p(t, T_FIN, DUREE - T_FIN)), E.inOutCubic(p(t, T_FIN, .78)));
    }
    const a = cl(c.tilt / 20);   // respiration légère sur les plans inclinés
    c.yaw += a * .7 * Math.sin(t * .9); c.tilt += a * .4 * Math.sin(t * .7 + 1); c.roll += a * .25 * Math.sin(t * .6 + 2);
    return { cible: [c.x, c.y], largeur: c.largeur, tilt: c.tilt, yaw: c.yaw, roll: c.roll, flou: c.flou, focale: 2.1 + .9 * (1 - cl((1600 / c.largeur - .8) / 1.2)) };
  }

  let dernierK = -1;
  // ---------- état de l'interface ----------
  function film(t) {
    if (!G) mesurer();
    const final = t > T_FIN;

    // ouverture : un fondu depuis le papier, sans logo, directement sur la courbe qui se dessine.
    // fin : le papier remonte, la caméra revient de face, l'anneau arrive en tournant (le roulement),
    // puis les lettres sortent de derrière lui, de part et d'autre.
    const clair = 1 - E.inOutCubic(p(t, 0, .45)), fin = E.inOutCubic(p(t, T_FIN, .8));
    titre.style.opacity = Math.max(clair, fin);
    titre.style.display = Math.max(clair, fin) > 0 ? 'grid' : 'none';
    roueFin.setAttribute('transform', `rotate(${(1 - E.outExpo(p(t, T_LOGO, 1.15))) * -300} ${roueFin.dataset.cx} ${roueFin.dataset.cy})`);
    anFin.forEach((a, i) => { const t0 = T_LOGO + i * .13; a.setAttribute('stroke-dashoffset', 1 - E.outCubic(p(t, t0, .55))); a.style.opacity = t >= t0 ? 1 : 0; });
    ltFin.forEach((g) => {
      const n = +g.dataset.rang, t0 = T_LOGO + .4 + n * .045, k = E.outCubic(p(t, t0, .45));
      g.style.opacity = p(t, t0, .2);
      g.setAttribute('transform', `translate(${+g.dataset.x + (1 - k) * (n === 0 ? 30 : -30)} 0)`);
    });
    const kt = E.outCubic(p(t, T_LOGO + 1.05, .5));
    tag.style.opacity = p(t, T_LOGO + 1.05, .4); tag.style.transform = `translateY(${(1 - kt) * 14}px)`;

    // courbe d'affluence : le rideau avance, une pointe le précède, les nombres se posent à son passage
    const kr = rideau(t), front = 1036 * kr;
    R.rideau.setAttribute('width', front.toFixed(1));
    const pt = surCourbe(front);
    pointe.setAttribute('cx', pt.x); pointe.setAttribute('cy', pt.y);
    pointe.style.opacity = kr > 0 && kr < 1 ? 1 : 0;
    const kComble = E.outCubic(p(t, T_DROP + .1, .8));
    etiquettes.forEach((e) => {
      const k = p(t, e.t0, .4);
      e.el.style.opacity = p(t, e.t0, .18);
      e.el.style.transform = `translate(-50%, -100%) scale(${.6 + .4 * E.outBack(k)})`;
      if (e.el === svcSam) e.el.style.top = lerp(e.top, e.top - 10.5, kComble) + 'px';
    });
    classe(svcSam, 'man', kComble < .5);
    svcSam.querySelector('u').style.display = kComble < .5 ? '' : 'none';
    const kq = Math.round(kComble * 60) / 60;
    if (kq !== dernierK) { R.affluence(kq); dernierK = kq; }

    // grille : les créneaux se posent jour après jour, sous la courbe
    const envoi = (b) => Math.sin(Math.PI * p(t, 18.45 + b.jour * .13 + b.ligne * .012, .55));
    R.blocs.forEach((b) => { const e = envoi(b); apparait(b.el, t, b.t0, 1 + .05 * e); b.el.style.filter = e > 0 ? `brightness(${1 + .06 * e}) saturate(${1 + .7 * e})` : ''; });
    calmes.forEach((c) => { c.el.style.opacity = p(t, c.t0, .3); });
    const choisi = t >= T_CLIC1, comble = t >= T_DROP;
    vides.forEach((v) => {
      apparait(v.el, t, v.t0);
      if (v.el === R.trou) { v.el.style.opacity = p(t, v.t0, .22) * (1 - p(t, T_DROP, .12)); classe(v.el, 'sel', choisi); }
    });
    R.comble.style.display = comble ? 'block' : 'none';
    if (comble) {
      const e = 1 - E.outCubic(p(t, T_DROP, 1.1)), ev = envoi({ jour: 5, ligne: 7 });
      R.comble.style.opacity = p(t, T_DROP, .1);
      R.comble.style.transform = `scale(${(.84 + .16 * E.outBack(p(t, T_DROP, .45))) * (1 + .05 * ev)})`;
      R.comble.style.boxShadow = `inset 0 0 0 1.5px rgba(30,92,73,.7), 0 0 0 ${4 + 9 * e}px rgba(30,92,73,${.14 + .22 * e})`;
    }
    txt(R.besoinBar, comble ? 'soir 4/4' : 'soir 3/4'); classe(R.besoinBar, 'man', !comble);
    classe(labBar, 'pourvoir', !comble); classe(labBar, 'pourvu', comble);
    txt(labBar.querySelector('b'), comble ? 'Complet' : 'À pourvoir');
    txt(labBar.querySelector('small'), comble ? 'Inès Carvalho en renfort' : '1 créneau sans personne');
    el.alerteSam.style.opacity = 1 - p(t, T_DROP + .1, .3);
    const kTot = E.outCubic(p(t, T_DROP + .25, .8));
    txt(R.totalSam.children[0], R.nb(lerp(255.5, 261.5, kTot), 1) + INS + 'h');
    txt(R.totalSam.children[1], R.euros(lerp(4571.18, 4678.52, kTot)));
    const kv = p(t, T_DROP, 1.5);
    if (kv > 0 && kv < 1) {
      const r = 30 + E.outCubic(kv) * 860;
      vague.style.opacity = (1 - kv) ** 1.3 * .9; vague.style.left = (G.videG.x - r) + 'px'; vague.style.top = (G.videG.y - r) + 'px'; vague.style.width = vague.style.height = (2 * r) + 'px';
    } else vague.style.opacity = 0;

    // colonne de gauche : les trous, puis les personnes qui peuvent venir
    trous.forEach((e, i) => {
      const k = p(t, COUPE1 - .3 + i * .13, .45);
      e.style.opacity = k * (i === 0 ? lerp(1, .5, p(t, T_DROP + .1, .3)) : 1);
      e.style.transform = `translateX(${(1 - E.outCubic(k)) * -16}px)`;
    });
    classe(trous[0], 'sel', choisi && !comble); classe(trous[0], 'fait', comble);
    txt(el.cpt, comble ? '3' : '4'); txt(el.trousH, comble ? '13 h à pourvoir' : '19 h à pourvoir'); txt(el.lieu, comble ? '3 trous' : '4 trous');
    candH.style.opacity = p(t, T_CLIC1 + .1, .3);
    const survol = E.inOutSine(p(t, 9.3, .25)), pris = t >= T_PRISE && !comble;
    cands.forEach((e, i) => {
      const t0 = T_CLIC1 + .2 + i * .17;
      apparait(e, t, t0, e === ines ? 1 + .02 * survol - (pris ? .04 : 0) : 1);
      const estompe = e === ines ? (pris ? .55 : 1) : lerp(1, .45, p(t, T_DROP + .1, .3));
      e.style.opacity = p(t, t0, .22) * estompe;
      const [fond, ajout] = e.querySelectorAll('.charge i');
      if (fond) { fond.style.transform = `scaleX(${E.outCubic(p(t, t0 + .15, .6))})`; ajout.style.opacity = p(t, t0 + .6, .25); }
    });
    ines.style.boxShadow = survol > 0 && !comble ? `0 0 0 ${3 + 2 * survol}px rgba(30,92,73,${.10 + .16 * survol}), 0 1px 2px rgba(60,42,20,.07), 0 ${6 + 6 * survol}px ${18 + 10 * survol}px rgba(60,42,20,${.09 + .08 * survol})` : '';
    txt(inesTag, comble ? 'Affectée' : 'Conseillée'); classe(inesTag, 'ok', comble);

    // l'ardoise se recalcule
    const ka = E.outCubic(p(t, T_ARD, 1.1)), kpart = E.outCubic(p(t, T_ARD + .75, 1.0)), kposte = E.outCubic(p(t, T_ARD + 1.5, .8));
    const cout = lerp(21762.16, 21869.50, ka), part = lerp(21762.16, 21869.50, kpart) / 68420 * 100;
    txt(el.cout, R.nb(cout, 2)); txt(el.heures, R.nb(lerp(1216.5, 1222.5, ka), 1) + INS + 'h');
    txt(el.ratio, R.nb(part, 1) + INS + '%'); R.jauge(part);
    txt(el.reste, R.euros(22236.50 - lerp(21762.16, 21869.50, kpart)));
    txt(el.barH, R.nb(lerp(226.5, 232.5, kposte), 1) + INS + 'h'); txt(el.barC, R.euros(lerp(4105.06, 4212.40, kposte))); el.barB.style.width = lerp(18.9, 19.3, kposte) + '%';
    el.barC.style.color = kposte > 0 && kposte < 1 ? '#e2b659' : '';
    txt(el.grC, R.euros(cout)); txt(el.grR, R.nb(part, 1) + INS + '%'); el.grJ.style.width = ((part - 28) / 6 * 100) + '%';
    txt(el.gpC, R.euros(54067.51 + cout - 21762.16)); txt(el.gpR, R.nb((54067.51 + cout - 21762.16) / 170055 * 100, 1) + INS + '%');
    const sam = R.histo[5], bosse = Math.sin(Math.PI * p(t, T_ARD + .25, .7));
    txt(sam.v, R.nb(lerp(4571.18, 4678.52, ka), 0)); sam.barre.style.height = (sam.h * lerp(1, 1.0235, ka)) + 'px'; sam.barre.style.transform = `scaleY(${1 + .05 * bosse})`;
    const eclat = t >= T_ARD + .75 ? 1 - E.outCubic(p(t, T_ARD + .75, 1.3)) : 0;
    el.bloc.style.boxShadow = eclat > 0 ? `inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1.5px rgba(226,182,89,${eclat}), 0 0 ${44 * eclat}px rgba(226,182,89,${.4 * eclat})` : '';
    const kd = p(t, T_ARD - .05, .35);
    delta.style.opacity = p(t, T_ARD - .05, .18) * (1 - p(t, 15.9, .3));
    delta.style.transform = `translateY(${(1 - E.outCubic(kd)) * 10}px) scale(${.8 + .2 * E.outBack(kd)})`;

    // publication
    const publie = t >= T_PUB + .08, kb = E.inOutSine(p(t, 17.12, .2)) * (1 - p(t, T_PUB + .5, .3));
    classe(el.pub, 'publie', publie); txt(el.pubTxt, publie ? 'Planning publié' : 'Publier le planning');
    el.pubIco.setAttribute('href', publie ? '#i-check' : '#i-send');
    el.pub.style.transform = `scale(${1 + .04 * kb - (t >= T_PUB - .03 && t < T_PUB + .11 ? .05 : 0)})`;
    classe(el.etat, 'ok', publie); txt(el.etatTxt, publie ? 'Publié · mer. 11 nov. à 16:47' : 'Brouillon · enregistré à 16:42');
    const ko = p(t, T_PUB + .15, .55);
    el.toast.style.display = ko > 0 && t < T_FIN + .7 ? 'flex' : 'none';
    el.toast.style.opacity = p(t, T_PUB + .15, .2);
    el.toast.style.transform = `translateY(${(1 - E.outCubic(ko)) * -18}px) scale(${.9 + .1 * E.outBack(ko)})`;
    const lus = Math.round(17 * E.outCubic(p(t, 18.3, 1.9)));
    if (t >= T_PUB + .4) { if (lueH.firstChild.nodeValue !== 'Semaine 47') lueH.innerHTML = 'Semaine 47<small>publiée à l’instant</small>'; txt(lueN, lus + ' sur 31'); lueB.style.width = (lus / 31 * 100) + '%'; }
    else { if (lueH.innerHTML !== lueH0) lueH.innerHTML = lueH0; txt(lueN, '29 sur 31'); lueB.style.width = '93.5%'; }

    // curseur, étiquette glissée, ondes de clic
    let cp = G.traj[0][2];
    for (const [a, b, de, vers] of G.traj) { if (t >= a) { const k = E.inOutCubic(p(t, a, b - a)); cp = { x: lerp(de.x, vers.x, k), y: lerp(de.y, vers.y, k) - Math.sin(Math.PI * k) * (Math.abs(vers.x - de.x) > 600 ? 46 : 14) }; } }
    const vis = Math.max(p(t, 6.55, .25) * (1 - p(t, 12.45, .3)), p(t, 16.25, .25) * (1 - p(t, 18.05, .3)));
    const appui = (t >= T_PRISE - .03 && t < T_DROP) || clics.some((c) => t >= c.t - .03 && t < c.t + .11);
    curseur.style.opacity = vis;
    curseur.style.transform = `translate(${cp.x - 4}px, ${cp.y - 3}px) scale(${appui ? 1.22 : 1.45})`;
    const kf = p(t, T_PRISE, .3);
    fantome.style.opacity = p(t, T_PRISE, .14) * (1 - p(t, T_DROP - .04, .14));
    fantome.style.transform = `translate(${cp.x + 6}px, ${cp.y + 12}px) rotate(${-4 * E.outCubic(kf) * (1 - p(t, T_DROP - .3, .3))}deg) scale(${.7 + .3 * E.outBack(kf)})`;
    clics.forEach((c) => {
      const k = p(t, c.t, .7), k2 = p(t, c.t + .06, .85), r1 = 6 + 46 * E.outCubic(k), r2 = 6 + 76 * E.outCubic(k2);
      [[c.o1, r1, k], [c.o2, r2, k2]].forEach(([o, r, kk]) => {
        o.style.left = (c.at.x - r) + 'px'; o.style.top = (c.at.y - r) + 'px'; o.style.width = o.style.height = (2 * r) + 'px';
        o.style.opacity = kk > 0 && kk < 1 ? (1 - kk) ** 1.4 * .9 : 0;
      });
    });
    return camera(t);
  }
  window.film = film; window.FILM_DUREE = DUREE;
  // instants clés, écrits dans rendu/reperes.json à la capture : ils servent à caler la bande-son
  const blocsT = R.blocs.map((b) => b.t0);
  window.FILM_REPERES = {
    courbe: [T_C0, T_CD], creneaux: [Math.min(...blocsT), Math.max(...blocsT)],
    manques: etiquettes.filter((e) => e.el.classList.contains('man')).map((e) => +e.t0.toFixed(2)),
    coupes: [COUPE1, COUPE2, COUPE3], trous: [0, 1, 2, 3].map((i) => +(COUPE1 - .3 + i * .13).toFixed(2)),
    clics: [T_CLIC1, T_PUB], candidats: [0, 1, 2].map((i) => +(T_CLIC1 + .2 + i * .17).toFixed(2)),
    survol: 9.3, prise: T_PRISE, glisse: [T_PRISE + .1, T_DROP], depot: T_DROP, vague: [T_DROP, 1.5],
    compteurs: [T_ARD, 1.1], part: [T_ARD + .75, 1.0], poste: [T_ARD + 1.5, .8], survol_bouton: 17.12, publication: T_PUB, message: T_PUB + .15, recul: T_RECUL, envoi: [18.45, 1.5],
    fond_fin: T_FIN, logo: [T_LOGO, 1.15], lettres: [T_LOGO + .4, .8], accroche: T_LOGO + 1.05,
  };
  // essai dans un navigateur : film.html?t=12
  const q = new URLSearchParams(location.search).get('t');
  document.fonts.ready.then(() => film(q ? +q : 0));
})();
