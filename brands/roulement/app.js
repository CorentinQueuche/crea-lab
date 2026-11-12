// Roulement — grille de la semaine, courbe d'affluence, histogramme. Données fictives.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const FINE = String.fromCharCode(160);
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const sv = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const heure = v => { const t = Math.round(v * 60), hh = Math.floor(t / 60) % 24, mm = t % 60; return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };
  const nb = (v, d) => v.toFixed(d).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, FINE);
  const heures = v => nb(v, v % 1 ? 1 : 0) + FINE + 'h';
  const euros = v => nb(v, 2) + FINE + '€';

  const R = window.ROULEMENT = { blocs: [], lignes: [], jours: [], groupes: {}, nb, euros, heures };
  const logoApp = document.getElementById('logo-app');
  if (logoApp && window.Marque) logoApp.innerHTML = Marque.logotype({ hauteur: 27 });

  const JOURS = [['lun.', 16], ['mar.', 17], ['mer.', 18], ['jeu.', 19], ['ven.', 20], ['sam.', 21], ['dim.', 22]];
  const COUVERTS = [[84, 96], [88, 104], [96, 118], [102, 146], [118, 208], [164, 236], [198, 92]];
  // services en sous-effectif : [jour, service (0 midi, 1 soir), postes manquants]
  const MANQUES = [[3, 0, 1], [4, 1, 1], [5, 1, 1], [6, 0, 1]];
  const H_JOUR = [123, 129.5, 139.5, 165, 215, 255.5, 189];
  const C_JOUR = [2204.10, 2318.44, 2496.02, 2951.30, 3842.76, 4571.18, 3378.36];
  const PART = [[.40, .17, .43], [.39, .18, .43], [.39, .18, .43], [.40, .18, .42], [.39, .20, .41], [.38, .20, .42], [.37, .19, .44]];

  const m = z => [11.5, 15, z], s = z => [18.5, 23.5, z];
  const GROUPES = [
    { id: 'salle', nom: 'Salle', n: 13, h: '472,0', autres: 9,
      besoins: ['4/4 4/4', '4/4 5/5', '4/4 5/5', '4/5 6/6', '5/5 7/8', '6/6 8/8', '7/7 4/4'],
      reste: [5, 6, 6, 7, 9, 10, 8],
      gens: [
        { id: 'camille', nom: 'Camille Roussel', role: 'Maître d’hôtel', c: 39, sem: [null, null, [m(), s()], [m(), [18, 23.5]], [m(), [18.5, 24]], [[17.5, 24.5, 'Accueil']], [[11, 16.5, 'Accueil']]] },
        { id: 'youssef', nom: 'Youssef Benali', role: 'Chef de rang', c: 35, sem: [[m(), s()], [m('Rang 1')], null, [m(), s()], [[18.5, 24, 'Rang 1']], [m(), [18.5, 24]], null] },
        { id: 'lea', nom: 'Léa Fontanel', role: 'Serveuse', c: 30, sem: [null, [m(), s()], [s('Terrasse')], null, [m(), s()], [s('Rang 2')], [[12, 15, 'Terrasse']]] },
        { id: 'baptiste', nom: 'Baptiste Morvan', role: 'Runner · étudiant', c: 25, sem: [null, null, [m('Passe')], [s('Passe')], [s('Passe')], [m(), [19, 23.5]], [m('Passe')]] },
      ],
      trous: { 3: [11.5, 15, 'Serveur'], 4: [19, 23.5, 'Runner'] } },
    { id: 'bar', nom: 'Bar', n: 6, h: '226,5', autres: 3,
      besoins: ['1/1 2/2', '1/1 2/2', '1/1 2/2', '2/2 2/2', '2/2 3/3', '2/2 3/4', '2/2 1/1'],
      reste: [1, 1, 2, 2, 3, 3, 2],
      gens: [
        { id: 'theo', nom: 'Théo Marchetti', role: 'Chef barman', c: 39, sem: [null, null, [[16, 24, 'Comptoir']], [[17, 24.5, 'Comptoir']], [[17, 25, 'Comptoir']], [[17, 25, 'Comptoir']], [[10.5, 16, 'Comptoir']]] },
        { id: 'anais', nom: 'Anaïs Delcourt', role: 'Barmaid', c: 35, sem: [[m(), s()], [[11, 16, 'Bar']], [[11, 16, 'Bar']], 'Arrêt', 'Arrêt', 'Arrêt', 'Arrêt'] },
        { id: 'malik', nom: 'Malik Sané', role: 'Commis de bar', c: 35, sem: [[[17, 23.5, 'Bar']], [[17, 23.5, 'Bar']], null, [m(), s()], [m(), s()], [[10, 17.5, 'Bar']], null] },
      ],
      trous: { 5: [18.5, 24.5, 'Barman'] } },
    { id: 'cuisine', nom: 'Cuisine', n: 12, h: '518,0', autres: 9,
      besoins: ['4/4 4/4', '4/4 4/4', '4/4 5/5', '4/4 5/5', '5/5 6/6', '6/6 7/7', '6/7 3/3'],
      reste: [5, 5, 6, 6, 8, 9, 7],
      gens: [
        { id: 'helene', nom: 'Hélène Vasseur', role: 'Cheffe de cuisine', c: 39, sem: [[[9, 15, 'Passe']], [[9.5, 14.5], [18, 22.5]], [[9.5, 14.5], [18, 22.5]], null, [[16.5, 23, 'Passe']], [[16, 23.5, 'Passe']], null] },
        { id: 'karim', nom: 'Karim Haddad', role: 'Second de cuisine', c: 39, sem: [[[9.5, 14.5], [18, 22.5]], null, null, [[9.5, 14.5], [18, 22.5]], [[17, 23, 'Chaud']], [[16.5, 23.5, 'Chaud']], [[9, 15, 'Chaud']]] },
        { id: 'loic', nom: 'Loïc Pennec', role: 'Chef de partie', c: 35, sem: [null, [[9.5, 14.5], [18, 22.5]], [[17.5, 22.5, 'Froid']], [[9.5, 14.5, 'Froid']], [[9.5, 14.5], [18, 22.5]], [[9.5, 15.5, 'Froid']], null] },
      ],
      trous: { 6: [10.5, 15.5, 'Plongeur'] } },
  ];

  const G = document.getElementById('grille');
  const add = e => (G.appendChild(e), e);
  const ini = nom => nom.split(' ').map(x => x[0]).join('').slice(0, 2);

  // ---- en-têtes des jours
  add(h('div', 'j-lab', '<b>Équipe</b>31 personnes'));
  JOURS.forEach(([n, d], i) => {
    const tot = COUVERTS[i][0] + COUVERTS[i][1];
    const man = MANQUES.some(x => x[0] === i);
    const e = add(h('div', 'j' + (i > 3 ? ' fort' : ''), `<span class="jn">${n}</span><span class="jd">${d}</span>${man ? '<i class="alerte-j"></i>' : ''}<span class="jc"><b class="mono">${tot}</b>couverts</span>`));
    R.jours.push(e);
  });

  // ---- bande d'affluence
  add(h('div', 'aff-lab', '<b>Affluence prévue</b><div class="leg"><span><i></i>Couverts attendus</span><span><i class="cap"></i>Ce que l’équipe peut servir</span><span><i class="man"></i>Sous-effectif</span></div>'));
  const aff = add(h('div', 'aff', '<span class="repere">couverts par service</span>'));
  const AW = 1036, AH = 126, BASE = 112, COL = 148, ECH = 78 / 262;
  const svg = sv('svg', { viewBox: `0 0 ${AW} ${AH}`, preserveAspectRatio: 'none' }, aff);
  const defs = sv('defs', {}, svg);
  const gr = sv('linearGradient', { id: 'aire', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  sv('stop', { offset: 0, 'stop-color': '#1f1a15', 'stop-opacity': .16 }, gr);
  sv('stop', { offset: 1, 'stop-color': '#1f1a15', 'stop-opacity': .01 }, gr);
  const clip = sv('clipPath', { id: 'rideau' }, defs);
  R.rideau = sv('rect', { x: 0, y: 0, width: AW, height: AH }, clip);
  for (let i = 1; i < 7; i++) sv('path', { d: `M${i * COL - .5} 0V${AH}`, stroke: 'rgba(60,42,20,.10)', 'stroke-width': 1 }, svg);
  sv('path', { d: `M0 ${BASE + .5}H${AW}`, stroke: 'rgba(60,42,20,.16)', 'stroke-width': 1 }, svg);
  const MU = [13, 20.5], SIG = 1.28;
  const xDe = (j, hh) => j * COL + (hh - 9.5) / 15 * COL;
  const demande = x => {
    let y = 0;
    for (let j = 0; j < 7; j++) for (let k = 0; k < 2; k++) { const dx = (x - xDe(j, MU[k])) / (SIG / 15 * COL); y += COUVERTS[j][k] * Math.exp(-dx * dx / 2); }
    return y;
  };
  const yDe = v => BASE - v * ECH;
  let d = `M0 ${yDe(demande(0)).toFixed(1)}`;
  for (let x = 2; x <= AW; x += 2) d += `L${x} ${yDe(demande(x)).toFixed(1)}`;
  const gCourbe = sv('g', { 'clip-path': 'url(#rideau)' }, svg);
  sv('path', { d: d + `L${AW} ${BASE}L0 ${BASE}Z`, fill: 'url(#aire)' }, gCourbe);
  const gCap = sv('g', {}, gCourbe), gMan = sv('g', {}, gCourbe);
  R.courbe = sv('path', { d, fill: 'none', stroke: '#1f1a15', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, gCourbe);
  // capacité de l'équipe par service, et zones de sous-effectif (k : part du trou du samedi soir comblée, 0 à 1)
  R.affluence = function (k) {
    gCap.innerHTML = ''; gMan.innerHTML = '';
    for (let j = 0; j < 7; j++) for (let sv_ = 0; sv_ < 2; sv_++) {
      const dem = COUVERTS[j][sv_];
      const man = MANQUES.find(x => x[0] === j && x[1] === sv_);
      let f = man ? .80 : 1.09 + ((j * 3 + sv_ * 5) % 4) * .02;
      if (man && j === 5 && sv_ === 1) f = .80 + .31 * k;
      const cap = dem * f, x0 = xDe(j, MU[sv_] - 2.5), x1 = xDe(j, MU[sv_] + 2.5), yc = yDe(cap);
      sv('path', { d: `M${x0.toFixed(1)} ${yc.toFixed(1)}H${x1.toFixed(1)}`, stroke: '#1e5c49', 'stroke-width': 1.6, 'stroke-dasharray': '5 4', 'stroke-linecap': 'round', opacity: .9 }, gCap);
      if (f < 1) {
        let pts = [], haut = '';
        for (let x = x0; x <= x1; x += 1) { const y = yDe(demande(x)); if (y < yc) { pts.push([x, y]); } }
        if (pts.length > 2) {
          haut = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
          sv('path', { d: haut + `L${pts[pts.length - 1][0].toFixed(1)} ${yc.toFixed(1)}L${pts[0][0].toFixed(1)} ${yc.toFixed(1)}Z`, fill: 'url(#hach)' }, gMan);
          sv('path', { d: haut, fill: 'none', stroke: '#de4526', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, gMan);
        }
      }
    }
  };
  R.affluence(0);
  R.svc = {};
  for (let j = 0; j < 7; j++) for (let k = 0; k < 2; k++) {
    const man = MANQUES.find(x => x[0] === j && x[1] === k);
    const e = h('span', 'svc' + (man ? ' man' : ''), `<b>${COUVERTS[j][k]}</b>` + (man ? `<u>−${man[2]}</u>` : ''));
    e.style.left = (xDe(j, MU[k]) / AW * 100).toFixed(2) + '%';
    e.style.top = (yDe(man ? COUVERTS[j][k] : COUVERTS[j][k] * 1.15) - 5).toFixed(1) + 'px';
    aff.appendChild(e);
    R.svc[j + '-' + k] = e;
  }

  // ---- groupes de poste
  function bloc(sh, cls) {
    const duo = sh.length === 2;
    return sh.map(([a, b, z]) => {
      const e = h('div', 's' + (duo ? ' duo' : ''));
      e.innerHTML = duo ? `<span class="t">${heure(a)}</span><span class="t">${heure(b)}</span>` : `<div class="t">${heure(a)} – ${heure(b)}</div><div class="z">${z || ''}</div>`;
      if (!duo && b - a < 7) { e.style.flex = '0 0 82%'; if (a >= 16) e.style.marginLeft = 'auto'; }
      return e;
    });
  }
  GROUPES.forEach(g => {
    const grp = R.groupes[g.id] = { tete: [], lignes: [] };
    grp.tete.push(add(h('div', 'g-lab', `<i class="pt ${g.id}"></i>${g.nom}<small>${g.n} personnes · <span class="mono">${g.h}${FINE}h</span></small>`)));
    g.besoins.forEach((b, i) => {
      const [mi, so] = b.split(' ');
      const ko = x => { const [a, c] = x.split('/'); return a !== c; };
      const e = add(h('div', 'g', `<span class="mono${ko(mi) ? ' man' : ''}">midi ${mi}</span><span class="mono${ko(so) ? ' man' : ''}" style="margin-left:auto">soir ${so}</span>`));
      grp.tete.push(e);
      if (g.id === 'bar' && i === 5) R.besoinBar = e.lastChild;
    });
    g.gens.forEach(p => {
      let tot = 0;
      p.sem.forEach(j => { if (Array.isArray(j)) j.forEach(x => tot += x[1] - x[0]); });
      const sup = tot > p.c;
      const lab = add(h('div', 'p-lab', `<span class="av ${g.id}">${ini(p.nom)}</span><div><b>${p.nom}</b><small>${p.role}</small></div><div class="h mono${sup ? ' sup' : ''}">${heures(tot)}<small>sur ${p.c} h</small></div>`));
      const ligne = { id: p.id, groupe: g.id, lab, cases: [], blocs: [] };
      p.sem.forEach((j, i) => {
        const c = add(h('div', 'c ' + g.id + (i > 4 ? ' we' : '')));
        if (j === null) c.appendChild(h('div', 'repos', 'Repos'));
        else if (typeof j === 'string') c.appendChild(h('div', 'absent', j));
        else bloc(j).forEach(e => { c.appendChild(e); ligne.blocs.push({ el: e, jour: i }); R.blocs.push({ el: e, jour: i, ligne: R.lignes.length, groupe: g.id }); });
        ligne.cases.push(c);
      });
      R.lignes.push(ligne); grp.lignes.push(ligne);
    });
    // ligne des créneaux à pourvoir
    const nT = Object.keys(g.trous).length;
    const lab = add(h('div', 'p-lab pourvoir', `<span class="av vide"><svg class="ico"><use href="#i-plus"/></svg></span><div><b>À pourvoir</b><small>${nT} créneau${nT > 1 ? 'x' : ''} sans personne</small></div>`));
    const lt = { id: 'pourvoir-' + g.id, groupe: g.id, lab, cases: [], blocs: [], trous: {} };
    for (let i = 0; i < 7; i++) {
      const c = add(h('div', 'c ' + g.id + (i > 4 ? ' we' : '')));
      const t = g.trous[i];
      if (t) {
        const e = h('div', 'vide', `<div class="t">${heure(t[0])} – ${heure(t[1])}</div><div class="z">${t[2]} à trouver</div>`);
        c.appendChild(e); lt.trous[i] = e;
        if (g.id === 'bar') {
          e.classList.add('sel'); R.trou = e; R.caseTrou = c;
          R.comble = h('div', 'comble', `<div class="t">${heure(t[0])} – ${heure(t[1])}</div><div class="z">Inès Carvalho</div>`);
          c.appendChild(R.comble);
        }
      }
      lt.cases.push(c);
    }
    R.lignes.push(lt); grp.lignes.push(lt); grp.pourvoir = lt;
    // rappel des autres personnes du poste
    grp.autres = [add(h('div', 'm-lab', `+ ${g.autres} autres ${g.id === 'bar' ? 'au bar' : 'en ' + g.id}`))];
    g.reste.forEach((n, i) => {
      const e = add(h('div', 'm'));
      const w = 10 + n * 7;
      e.innerHTML = `<i style="width:${w}px;background:var(--${g.id})"></i><span>${n} pers.</span>`;
      grp.autres.push(e);
    });
  });

  // ---- totaux par jour
  R.totaux = [add(h('div', 't-lab', 'Total du jour<small>heures et coût chargé</small>'))];
  H_JOUR.forEach((v, i) => R.totaux.push(add(h('div', 'tt', `<b>${heures(v)}</b><small>${euros(C_JOUR[i])}</small>`))));
  R.totalSam = R.totaux[6];

  // ---- histogramme de l'ardoise
  const histo = document.getElementById('histo');
  const max = Math.max(...C_JOUR);
  R.histo = [];
  C_JOUR.forEach((v, i) => {
    const col = h('div', 'col' + (v === max ? ' max' : ''));
    const [ps, pb, pc] = PART[i];
    col.innerHTML = `<span class="v">${nb(v, 0)}</span><div class="barre" style="height:${(v / max * 178).toFixed(1)}px"><u class="uc" style="height:${pc * 100}%"></u><u class="ub" style="bottom:${pc * 100}%;height:${pb * 100}%"></u><u class="us" style="bottom:${(pc + pb) * 100}%;height:${ps * 100}%"></u></div><span class="n">${JOURS[i][0].replace('.', '')}</span>`;
    histo.appendChild(col);
    R.histo.push({ col, barre: col.children[1], v: col.children[0], h: v / max * 178 });
  });

  // ---- jauge : 28 % à gauche, 34 % à droite
  R.jauge = p => { document.getElementById('jauge-fill').style.width = ((p - 28) / 6 * 100).toFixed(2) + '%'; };
  R.jauge(31.81);
  document.getElementById('objectif').style.left = ((32.5 - 28) / 6 * 100) + '%';

  document.fonts.ready.then(() => document.body.setAttribute('data-pret', '1'));
})();
