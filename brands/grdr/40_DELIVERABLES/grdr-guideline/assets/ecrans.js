/* ÉCRANS DE L'OUTIL — Djongoma (complément du socle : charge après brand/marque.js et brand/carte.js ; styles brand/ecrans.css).
   Marque.app : les briques (ico, av, chip, btn, carte, shell…) et les écrans. Chaque écran est une fonction qui renvoie du HTML,
   à 1440 px de large (bureau) ou 390 × 844 (téléphone). Les contenus viennent de Marque.DONNEES : publiés, du rapport, ou démo.
   Option commune des écrans : p (0 à 1) fait monter les chiffres et les tracés, pour les vidéos. */
(function () {
  const M = window.Marque, C = M.COULEURS, D = M.DONNEES, NB = M.NB, S = {};
  const E = (x) => M.ease(x == null ? 1 : x);

  /* ---------- Pictogrammes : au trait, bouts ronds, comme le symbole ---------- */
  const ICO = {
    grille: 'M4 4h6v7H4z M14 4h6v4h-6z M14 12h6v8h-6z M4 15h6v5H4z',
    dossier: 'M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    gens: 'M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7z M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6 M16 4.6a3.5 3.5 0 0 1 0 6.4 M18 14.4c2.1.8 3.5 2.9 3.5 5.6',
    sync: 'M20 11a8 8 0 0 0-14.3-4.9L4 8 M4 4v4h4 M4 13a8 8 0 0 0 14.3 4.9L20 16 M20 20v-4h-4',
    stats: 'M5 20v-8 M11 20V5 M17 20v-5 M3 20h18',
    journal: 'M12 7v5l3 2 M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.3 M3.5 4v4.3h4.3',
    admin: 'M12 3l7.5 3v5.5c0 4.6-3.1 8-7.5 9.5c-4.4-1.5-7.5-4.9-7.5-9.5V6z M9 12l2.2 2.2L15.2 10',
    loupe: 'M11 18a7 7 0 1 0 0-14a7 7 0 0 0 0 14z M20 20l-4-4',
    cloche: 'M6 10a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 15 6 10z M10 20a2.2 2.2 0 0 0 4 0',
    bas: 'M6 9l6 6l6-6', droite: 'M9 6l6 6l-6 6', haut: 'M6 15l6-6l6 6', gauche: 'M15 6l-6 6l6 6',
    plus: 'M12 5v14 M5 12h14',
    export: 'M12 4v11 M7.5 10.5L12 15l4.5-4.5 M4 19h16',
    filtre: 'M4 6h16 M7 12h10 M10 18h4',
    calendrier: 'M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z M4 10h16 M8 3.5v4 M16 3.5v4',
    alerte: 'M12 4l9 15.5H3z M12 10v4.5 M12 17.4v.1',
    coche: 'M5 12.5l4.5 4.5L19 7.5',
    croix: 'M6 6l12 12 M18 6L6 18',
    hd: 'M7 17L17 7 M8 7h9v9',
    fleche: 'M5 12h14 M13 6l6 6l-6 6',
    points: 'M5 12h.01 M12 12h.01 M19 12h.01',
    oeil: 'M2.5 12S6 5.5 12 5.5S21.5 12 21.5 12S18 18.5 12 18.5S2.5 12 2.5 12z M12 14.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z',
    crayon: 'M4 20l1-4.5L16.5 4a2.1 2.1 0 0 1 3 3L8 18.5z M14.5 6l3 3',
    cadenas: 'M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z M8 11V8a4 4 0 0 1 8 0v3',
    lieu: 'M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z M12 12a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z',
    horloge: 'M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18z M12 7.5V12l3 2',
    sortie: 'M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4 M15 8l4 4l-4 4 M19 12H9',
    aide: 'M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18z M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8 M12 16.9v.1',
    euro: 'M17.5 6.5A6.5 6.5 0 1 0 17.5 17.5 M4 10.5h9 M4 13.5h8',
    tableur: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z M4 9.5h16 M4 14.5h16 M9.5 4v16',
    menu: 'M4 7h16 M4 12h16 M4 17h16',
    personne: 'M12 11.5a3.8 3.8 0 1 0 0-7.6a3.8 3.8 0 0 0 0 7.6z M4.5 20.5c0-3.6 3.3-6.2 7.5-6.2s7.5 2.6 7.5 6.2',
    reglages: 'M4 7h9 M17 7h3 M4 17h3 M11 17h9 M15 9.2a2.2 2.2 0 1 0 0-4.4a2.2 2.2 0 0 0 0 4.4z M9 19.2a2.2 2.2 0 1 0 0-4.4a2.2 2.2 0 0 0 0 4.4z',
    lien: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    document: 'M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M14 3v5h5 M9 13h6 M9 17h4',
  };
  S.ICO = ICO;
  const ico = (n, attrs = '') => `<svg class="dj-ico" viewBox="0 0 24 24" ${attrs}><path d="${ICO[n] || ICO.points}"${n === 'points' ? ' stroke-width="2.6"' : ''}/></svg>`;
  S.ico = ico;

  /* ---------- Briques ---------- */
  const TEINTES = ['peche', 'menthe', 'rose', 'brume', 'miel', 'sable', 'corail'];
  const initiales = (nom) => nom.split(/[\s.]+/).filter(Boolean).map((x) => x[0]).slice(0, 2).join('').toUpperCase();
  const av = (nom, cls = '') => { const i = [...nom].reduce((a, c) => a + c.charCodeAt(0), 0) % TEINTES.length; return `<span class="dj-av ${cls}" style="--ac:${C[TEINTES[i]]}" title="${nom}">${initiales(nom)}</span>`; };
  const avs = (noms, plus = 0) => `<span class="dj-avs">${noms.map((n) => av(n, 's')).join('')}${plus ? `<span class="dj-av s" style="--ac:${C.blanc};box-shadow:0 0 0 2px var(--dj-carte),inset 0 0 0 1px var(--dj-filet2)">+${plus}</span>` : ''}</span>`;
  const chip = (txt, cls = '', point = true) => `<span class="dj-chip ${cls}">${point ? '<u></u>' : ''}${txt}</span>`;
  const statut = (s = 'Signé') => chip(s, s === 'Signé' ? 'ok' : s === 'En attente' ? 'att' : '');
  const btn = (txt, cls = '', icone = '') => `<span class="dj-btn ${cls}">${icone ? ico(icone) : ''}${txt}</span>`;
  const num = (n, cls = '', style = '') => `<span class="dj-num ${cls}" style="${style}">${M.nombre(n)}<i>€</i></span>`;
  const lbl = (t) => `<span class="dj-lbl">${t}</span>`;
  /* Carte : titre, sous-titre, corps. o : span (colonnes sur 12), cls, style, droite (HTML à droite du titre) */
  const carte = (titre, sous, corps, o = {}) => `<section class="dj-c ${o.cls || ''}" style="grid-column:span ${o.span || 4};${o.style || ''}">` +
    (titre ? `<div class="dj-ct"><div><h2>${titre}</h2>${sous ? `<p>${sous}</p>` : ''}</div>${o.droite ? `<div class="dj-ct-d">${o.droite}</div>` : ''}</div>` : '') + corps + `</section>`;
  Object.assign(S, { av, avs, chip, statut, btn, num, lbl, carte, initiales });

  /* Avancement d'un projet dans le temps, au 16 juin 2025 : part de la durée écoulée (le prorata) */
  const AUJ = [2025, 5.5];   /* le 16 juin : cinq mois et demi écoulés dans l'année */
  const moisDe = (s) => { const [a, m] = s.split('-').map(Number); return a * 12 + m; };
  const ecoule = (p) => M.clamp((AUJ[0] * 12 + AUJ[1] - moisDe(p.debut) + 1) / (moisDe(p.fin) - moisDe(p.debut) + 1));
  const mmaa = (s) => { const [a, m] = s.split('-'); return `${m}/${a.slice(2)}`; };
  const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const moisLong = (s) => { const [a, m] = s.split('-').map(Number); return `${MOIS[m - 1]} ${a}`; };
  Object.assign(S, { ecoule, mmaa, moisLong });
  const periode = (p) => `<div class="dj-per">${M.jauge({ v: ecoule(p), w: 150, ep: 5, c: 'ocre' })}<span><b style="font-weight:500">${mmaa(p.debut)}</b><b style="font-weight:500">${mmaa(p.fin)}</b></span></div>`;
  const emp = (p, o = {}) => { const c = M.cernesDe(p), k = E(o.p); return M.empreinte({ cernes: c.cernes.map((v) => v * k), actif: c.actif, cadre: o.cadre || 5, ...o }); };
  Object.assign(S, { periode, emp });

  /* ---------- La coque : barre latérale et barre du haut ---------- */
  const NAV = [['tableau', 'Tableau de bord', 'grille'], ['projets', 'Projets', 'dossier', '12'], ['rh', 'Ressources humaines', 'gens', '5', 'al'], ['sage', 'Extractions Sage', 'sync'], ['stats', 'Statistiques', 'stats']];
  const NAV2 = [['journal', 'Journal', 'journal'], ['admin', 'Administration', 'admin']];
  const lien = (actif) => ([id, t, i, n, c]) => `<a class="${id === actif ? 'on' : ''}">${ico(i)}${t}${n ? `<i class="${c || ''}">${n}</i>` : ''}</a>`;
  S.lateral = (actif = 'tableau', o = {}) => { const moi = o.moi || D.personnes[0];
    return `<aside class="dj-lat"><div class="dj-lat-logo">${M.lockup()}</div>
      <div class="dj-prod">${M.icone(38)}<div><b>${M.PRODUIT}</b><span>${M.PRODUIT_DESC}</span></div></div>
      <nav class="dj-nav">${NAV.filter((n) => !o.roles || o.roles.includes(n[0])).map(lien(actif)).join('')}<div class="dj-nav-t">Suivi</div>${NAV2.filter((n) => !o.roles || o.roles.includes(n[0])).map(lien(actif)).join('')}</nav>
      <div class="dj-sage">${M.empreinte({ cernes: [1, 1, 1], c: '#1D4A47', piste: null })}${M.tampon('Sage · à jour', 'emeraude')}<b>Extrait le ${D.extraction.date}</b><p>à ${D.extraction.heure}, par ${D.extraction.par} Aucune ressaisie.</p>${btn('Extraire', 's clair', 'sync')}</div>
      <div class="dj-moi">${av(moi.nom)}<div><b>${moi.nom}</b><span>${moi.role}</span></div>${ico('sortie')}</div></aside>`; };
  S.haut = (o = {}) => `<header class="dj-top"><div class="dj-cherche">${ico('loupe')}Chercher un projet, un code, une personne<kbd>⌘K</kbd></div>
    <div class="dj-top-d"><span class="dj-pil">${ico('calendrier')}Exercice ${D.exercice}${ico('bas')}</span><span class="dj-rond">${ico('aide')}</span><span class="dj-rond">${ico('cloche')}<u></u></span></div></header>`;
  /* shell(actif, contenu, o) : o.cls (classe sur la racine), o.h (hauteur fixe en px), o.moi, o.roles */
  S.shell = (actif, contenu, o = {}) => `<div class="dj ${o.h ? 'fixe ' : ''}${o.cls || ''}" style="${o.h ? `height:${o.h}px;min-height:0;overflow:hidden;` : ''}${o.style || ''}">${S.lateral(actif, o)}<div class="dj-main">${S.haut(o)}<main class="dj-page">${contenu}</main></div></div>`;
  /* tete(titre, sous, droite, fil) : l'en-tête d'une page */
  S.tete = (titre, sous = '', droite = '', fil = null) => `<div>${fil ? `<div class="dj-fil">${fil.map((f, i) => (i ? ico('droite') : '') + `<span${i === fil.length - 1 ? ` style="color:${C.encre}"` : ''}>${f}</span>`).join('')}</div>` : ''}<div class="dj-tete"><div><h1>${titre}</h1>${sous ? `<p>${sous}</p>` : ''}</div>${droite ? `<div class="dj-tete-d">${droite}</div>` : ''}</div></div>`;

  /* ====================== Tableau de bord ====================== */
  const EXE = D.projets.reduce((a, p) => a + p.execute, 0) + D.autres.reduce((a, p) => a + Math.round(p.total * p.taux), 0);
  S.TOTAUX = { budget: D.synthese.budget, execute: EXE, reste: D.synthese.budget - EXE, taux: EXE / D.synthese.budget, prevuExercice: D.cumulPrevu[11], executeExercice: D.cumulExecute[D.cumulExecute.length - 1], prorata: 0.38 };
  const T = S.TOTAUX;
  S.blocHero = (o = {}) => { const k = E(o.p);
    return `<section class="dj-c aq dj-hero"><img class="aq-i" src="${M.aqURL('aube')}" alt="">${M.filigrane({ c: 'blanc', op: 0.5, style: 'right:-70px;top:-150px;width:470px;height:634px' })}
      <div style="display:flex;gap:10px;align-items:center">${lbl(`Portefeuille · ${D.synthese.projets} projets signés · 8 pays`)}</div>
      <div class="dj-num">${M.nombre(T.budget * k)}<i>€</i></div>
      <div class="dj-hero-s">de budgets pluriannuels, suivis à l’euro près.</div>
      <div class="dj-hero-b">
        <div class="dj-verre">${lbl('Exécuté')}<div class="dj-num" style="color:${C.lagune}">${M.nombre(T.execute * k)}<i>€</i></div><div style="margin-top:9px">${M.jauge({ v: T.taux * k, repere: T.prorata, w: 236, ep: 6, c: 'lagune', piste: 'rgba(42,30,23,.12)' })}</div><small>${M.pct(T.taux * k, 1)} du total · attendu au prorata ${M.pct(T.prorata)}</small></div>
        <div class="dj-verre">${lbl('Reste à exécuter')}<div class="dj-num">${M.nombre(T.budget * k - T.execute * k)}<i>€</i></div><small>jusqu’à déc. 2028</small></div>
        <div class="dj-verre">${lbl(`À exécuter en ${D.exercice}`)}<div class="dj-num">${M.nombre((T.prevuExercice - T.executeExercice) * k)}<i>€</i></div><small>prorata temporis calculé</small></div>
      </div></section>`; };
  S.blocTaux = (o = {}) => { const k = E(o.p);
    return `<section class="dj-c nuit dj-taux grain nuit">${M.empreinte({ cernes: [1, 1, 1, 0.9, 0.34].map((v) => v * k), c: '#1F4F4B', piste: '#17403D', actif: 4, cActif: 'miel', ep: 10 })}
      ${lbl('Taux d’exécution moyen')}<div class="dj-num">${Math.round(D.synthese.tauxMoyen * 100 * k)}<i>%</i></div>
      <div class="dj-taux-b"><span class="dj-delta nuit">−4 pts sur le prorata</span><span>Moyenne des ${D.synthese.projets} projets signés, recalculée à chaque extraction.</span></div></section>`; };
  S.blocCourbe = (o = {}) => { const p = o.p == null ? 1 : o.p, ecart = (T.executeExercice - D.cumulPrevu[5] * 0.97) / (D.cumulPrevu[5] * 0.97);
    return carte(`Exécution de l’exercice ${D.exercice}`, 'Cumul des dépenses extraites de Sage, face au prorata attendu', `
      <div style="display:flex;gap:26px;align-items:flex-end;margin:-4px 0 6px">
        <div>${lbl('Exécuté au 16 juin')}<div class="dj-num" style="font-size:34px;margin-top:6px;color:${C.lagune}">${M.nombre(T.executeExercice * E(p))}<i>€</i></div></div>
        <div style="padding-bottom:3px"><span class="dj-delta neg">${ico('bas', 'style="width:12px;height:12px;stroke-width:2.6"')}3,1 %</span> <span style="font-size:12px;color:var(--dj-doux);font-weight:600;margin-left:4px">sous le prorata</span></div>
        <div class="dj-leg" style="margin-left:auto;padding-bottom:5px"><span><i style="--lc:${C.lagune}"></i>Exécuté</span><span><i class="t" style="--lc:${C.ocre}"></i>Attendu au prorata</span></div>
      </div>
      ${M.courbe({ w: o.w || 694, h: o.hc || 236, labels: D.mois, max: 4400000, marge: [10, 14, 26, 58], series: [{ v: D.cumulPrevu, c: 'ocre', ep: 2.2, tirets: '1.5 7' }, { v: D.cumulExecute, c: 'lagune', ep: 3.8, echos: 8, pasEcho: 10 }], point: 1, p, id: o.id || 'djc' })}`,
      { span: o.span || 8, droite: `<span class="dj-seg"><span class="on">Cumul</span><span>Mensuel</span></span>` }); };
  S.ALERTES = [
    { v: true, i: 'horloge', t: 'ECOS se termine dans 8 mois', s: `${M.euro(731128)} restent à exécuter`, c: 'ECOS' },
    { i: 'gens', t: '5 personnes au-dessus de 202 jours', s: 'Affectations à rééquilibrer', c: 'RH' },
    { i: 'sync', t: 'PDLD : extraction vieille de 34 jours', s: 'L’exécuté affiché date du 13 mai', c: 'PDLD' },
    { i: 'document', t: 'OICC : rapport au bailleur le 30 juin', s: 'Suivi budgétaire prêt à exporter', c: 'OICC' },
  ];
  S.blocAlertes = (o = {}) => carte('À surveiller', 'Quatre points demandent un regard', `<div class="dj-al">${S.ALERTES.map((a) => `<div class="${a.v ? 'v' : ''}"><span class="dj-al-i">${ico(a.i)}</span><div><b>${a.t}</b><span>${a.s}</span></div>${ico('droite', `style="color:var(--dj-pale)"`)}</div>`).join('')}</div>`, { span: o.span || 4, droite: chip('4', 'al', false) });
  S.ligneProjet = (p, o = {}) => { const k = E(o.p), e = ecoule(p);
    return `<tr><td><div class="dj-proj">${emp(p, { p: o.p })}<div><b>${p.titre}</b><span>${M.code(p.code, p.alerte ? 'vermillon' : 'lagune')}${D.pays[p.pays]}<em>${mmaa(p.debut)} → ${mmaa(p.fin)}</em></span></div></div></td>
      <td class="d">${num(p.total)}</td>
      <td class="d"><div class="dj-ex">${M.jauge({ v: p.taux * k, repere: e, w: 104, ep: 6, c: p.alerte ? 'vermillon' : 'emeraude' })}<b>${M.pct(p.taux * k)}</b></div></td>
      <td class="d">${num(p.total - p.execute, '', `color:${C.lagune}`)}</td></tr>`; };
  S.blocProjets = (o = {}) => carte('Projets', 'Une empreinte par projet : une boucle par année, tracée jusqu’à l’exécuté', `<table class="dj-t"><colgroup><col><col style="width:118px"><col style="width:186px"><col style="width:112px"></colgroup><thead><tr><th>Projet</th><th class="d">Budget total</th><th class="d">Exécuté · repère : prorata</th><th class="d">Reste</th></tr></thead><tbody>${D.projets.slice(0, o.n || 6).map((p) => S.ligneProjet(p, o)).join('')}</tbody></table>`,
    { span: o.span || 8, droite: `<span class="dj-lien">Voir les ${D.synthese.projets} projets ${ico('fleche', 'style="width:14px;height:14px"')}</span>` });
  S.TERRITOIRES = [['Multi-pays', 3554942], ['Mauritanie', 3094068], ['France', 2847394], ['Tunisie', 1166666], ['Guinée', 1086102], ['Algérie', 833333]];
  S.blocTerritoires = (o = {}) => `<section class="dj-c pap dj-terr" style="grid-column:span ${o.span || 4};min-height:${o.h || 430}px">
      ${M.carte({ cadre: [-260, -70, 1060, 1250], par: 'xMaxYMid slice', ke: o.ke || 2.4, terres: 'sable', filet: 'papier', pays: { MR: 'corail', FR: 'peche', TN: '#F6C98E', GN: '#F6C98E', DZ: '#F8DDB8', ML: '#F1DCC4', SN: '#F1DCC4', GW: '#F1DCC4' }, attrs: `class="dj-carte"`,
        epingles: [{ ville: 'Sélibaby', v: 1, cernes: [1, 1, 0.76], c: 'vermillon' }, { ville: 'Montreuil', v: 0.8, cernes: [1, 0.6, 0.36] }, { ville: 'Tunis', v: 0.4, cernes: [1, 0.33] }, { ville: 'Conakry', v: 0.4, cernes: [1, 0.63] }, { ville: 'Alger', v: 0.25, cernes: [0.6, 0.19] }] })}
      <div class="dj-ct" style="position:relative"><div><h2>Ici et là-bas</h2><p>Budgets par territoire</p></div></div>
      <div class="dj-terr-l">${S.TERRITOIRES.map(([n, v]) => `<div><span>${n}</span><b>${M.euroK(v)}</b></div>`).join('')}</div></section>`;
  /* les blocs ne reçoivent que l'avancement : la hauteur fixe (o.h) ne concerne que la coque */
  S.tableauDeBord = (o = {}) => { const b = { p: o.p }; return S.shell('tableau', S.tete(`Bonjour ${D.personnes[0].nom.split(' ')[0]}`, `<span>Lundi 16 juin ${D.exercice}</span>${M.tampon(`Sage à jour · ${D.extraction.court}`)}`, btn('Exporter', '', 'export') + btn('Nouveau projet', 'p', 'plus')) +
    `<div class="dj-g">${S.blocHero(b)}${S.blocTaux(b)}${S.blocCourbe(b)}${S.blocAlertes(b)}${S.blocProjets(b)}${S.blocTerritoires(b)}</div>`, o); };

  /* ====================== Fiche projet (ECOS) ====================== */
  S.FICHE = {
    annees: [{ a: 2022, prevu: 610000, execute: 588400 }, { a: 2023, prevu: 780000, execute: 771300 }, { a: 2024, prevu: 790000, execute: 742640 }, { a: 2025, prevu: 760000, execute: 260600, encours: true }, { a: 2026, prevu: 154068, execute: 0 }],
    bailleurs: [['Coopération bilatérale', 0.55, 1701738, 'lagune'], ['Fonds européens', 0.30, 928220, 'ocre'], ['Collectivités', 0.10, 309407, 'peche'], ['Fonds propres', 0.05, 154703, 'sable']],
    lignes: [
      ['Ressources humaines', 'RH', [['Coordination de projet', 412000, 338500, ['Mamadou S.', 'Awa D.']], ['Animation territoriale', 528000, 402300, ['Mariam K.', 'Ousmane T.', 'Kadiatou S.']], ['Appui technique du siège', 300000, 246100, ['Claire M.']]]],
      ['Activités', 'ACT', [['Appui aux filières agropastorales', 640000, 512800, []], ['Gouvernance locale et concertation', 480000, 371200, []], ['Accès à l’eau et aménagements', 300000, 226400, []]]],
      ['Rubriques', 'RUB', [['Fonctionnement et logistique', 286068, 187640, []], ['Suivi, évaluation, audit', 148000, 78000, []]]],
    ],
  };
  S.ficheProjet = (o = {}) => { const p = D.projets[0], F = S.FICHE, k = E(o.p);
    const tete = `<section class="dj-c dj-fp-tete">${M.empreinte({ cernes: F.annees.map((a) => (a.execute / a.prevu) * k), actif: 3, taille: 150 })}
      <div><div style="display:flex;gap:10px;align-items:center;font-size:15px">${M.code(p.code, 'vermillon')}${statut('Signé')}${chip('100 % acquis', 'lag', false)}</div><h1>${p.titre}</h1>
        <div class="dj-fp-meta"><span>${ico('lieu')}Mauritanie · Sélibaby, Kaédi</span><span>${ico('calendrier')}${moisLong(p.debut)} → ${moisLong(p.fin)} · 48 mois</span><span>${av(p.chef, 's')}${p.chef}, chef de projet</span></div></div>
      <div class="dj-fp-chiffres"><div>${lbl('Budget total')}<div>${num(p.total)}</div></div><div>${lbl(`Exécuté · ${M.pct(p.taux, 1)}`)}<div>${num(p.execute * k, '', `color:${C.lagune}`)}</div></div><div>${lbl('Reste à exécuter')}<div>${num(p.total - p.execute * k)}</div></div></div></section>`;
    const annees = carte('Budget par année', 'Prévu et exécuté · prorata 2025 : 5,5 mois sur 12', M.annees({ w: 408, h: 236, annees: F.annees, ep: 22, p: k }) +
      `<div class="dj-leg" style="margin-top:10px"><span><i style="--lc:${C.sable}"></i>Prévu</span><span><i style="--lc:${C.lagune}"></i>Exécuté</span><span><i style="--lc:${C.vermillon}"></i>Année en cours</span></div>`, { span: 5 });
    const bailleurs = carte('Bailleurs', 'Quatre cofinancements · 100 %', `<div style="display:grid;justify-items:center;margin:-6px 0 12px">${M.empreinte({ cernes: F.bailleurs.map((b) => b[1] / 0.55 * k).reverse(), c: F.bailleurs.map((b) => C[b[3]]).reverse(), piste: 'rgba(42,30,23,.06)', taille: 132 })}</div>
      <div class="dj-bl">${F.bailleurs.map((b) => `<div><u style="--bc:${C[b[3]]}"></u>${b[0]}<b>${M.pct(b[1])}</b><span>${M.nombre(b[2])}${NB}€</span></div>`).join('')}</div>`, { span: 3 });
    const sage = `<section class="dj-c nuit grain nuit" style="grid-column:span 4;display:flex;flex-direction:column">${M.empreinte({ cernes: [1, 1, 1, 1], c: '#1D4A47', piste: null, attrs: 'style="position:absolute;right:-70px;top:-60px;height:300px;width:auto;z-index:-1"' })}
      <div class="dj-ct"><div><h2>Extraction Sage</h2><p>Connecteur BI Reporting</p></div><div class="dj-ct-d">${chip('À jour', 'ok')}</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 18px;margin-bottom:18px">
        <div>${lbl('Section analytique')}<div style="font-family:var(--mono);font-size:15px;font-weight:500;margin-top:6px">ECOS-MR-22</div></div>
        <div>${lbl('Période extraite')}<div style="font-weight:700;margin-top:6px">01/01 → 15/06/2025</div></div>
        <div>${lbl('Écritures')}<div class="dj-num" style="font-size:26px;margin-top:6px">${Math.round(214 * k)}</div></div>
        <div>${lbl('Montant exécuté')}<div class="dj-num" style="font-size:26px;margin-top:6px;color:${C.miel}">${M.nombre(260600 * k)}<i>€</i></div></div></div>
      <div>${lbl('Écritures par mois · 2025')}<div class="dj-bar" style="margin-top:10px">${[28, 31, 36, 44, 47, 28].map((v, i) => `<i style="height:${Math.round((v / 47) * 100 * k)}%;--bc:${i === 5 ? C.miel : '#2E6E68'}"></i>`).join('')}</div><div class="dj-bar-l">${['J', 'F', 'M', 'A', 'M', 'J'].map((x) => `<span>${x}</span>`).join('')}</div></div>
      <div style="margin-top:18px;display:flex;gap:10px;align-items:center">${btn('Extraire à nouveau', 'clair', 'sync')}<span style="font-size:11.5px;color:rgba(255,251,246,.6);line-height:1.3">${D.extraction.date}, ${D.extraction.heure}<br>par ${D.extraction.par}</span></div></section>`;
    const lignes = carte('Lignes budgétaires', 'Huit lignes · jusqu’à trois personnes affectées par ligne', `<table class="dj-t dj-lignes"><colgroup><col><col style="width:98px"><col style="width:96px"><col style="width:96px"><col style="width:92px"><col style="width:136px"></colgroup><thead><tr><th>Libellé</th><th>Affectés</th><th class="d">Prévisionnel</th><th class="d">Exécuté</th><th class="d">Reste</th><th class="d" style="width:150px">Exécution</th></tr></thead><tbody>` +
      F.lignes.map(([cat, cc, ls]) => `<tr class="cat"><td colspan="6">${cat}<span>${cc} · ${M.euro(ls.reduce((a, l) => a + l[1], 0))}</span></td></tr>` + ls.map((l) => `<tr><td><b>${l[0]}</b></td><td>${l[3].length ? avs(l[3]) : `<span style="color:var(--dj-pale)">—</span>`}</td><td class="d">${num(l[1])}</td><td class="d">${num(l[2] * k)}</td><td class="d">${num(l[1] - l[2] * k, '', `color:${C.lagune}`)}</td><td class="d"><div class="dj-ex">${M.jauge({ v: (l[2] / l[1]) * k, w: 86, ep: 6, c: 'emeraude' })}<b>${M.pct((l[2] / l[1]) * k)}</b></div></td></tr>`).join('')).join('') + `</tbody></table>`,
      { span: 8, droite: btn('Filtrer', 's', 'filtre') + btn('Ajouter une ligne', 's', 'plus') });
    const JC = { sage: 'emeraude', modif: 'ocre', rh: 'lagune', lecture: 'sable', statut: 'vermillon' };
    const journal = carte('Journal', 'Rien ne change sans laisser de trace', `<div class="dj-jr">${D.journal.map((j) => `<div><time>${j.h}</time><p style="--jc:${C[JC[j.type]]}"><b>${j.quoi}</b> · ${j.qui}<span>${j.detail}</span></p></div>`).join('')}</div>`, { span: 12, droite: `<span class="dj-lien">Tout voir</span>` });
    const EQ = [['Mamadou S.', 'Coordination · 80 %', 162], ['Mariam K.', 'Animation · 100 %', 202], ['Ousmane T.', 'Animation · 60 %', 121], ['Kadiatou S.', 'Animation · 40 %', 81], ['Claire M.', 'Appui du siège · 35 %', 71], ['Awa D.', 'Coordination · 20 %', 40]];
    const equipe = carte('Équipe du projet', 'Six personnes · 677 jours sur l’exercice', `<div class="dj-eq">${EQ.map(([n, r, j]) => `<div>${av(n)}<div><b>${n}</b><span>${r}</span></div><em>${Math.round(j * k)} j${M.jauge({ v: (j / 202) * k, w: 64, ep: 5, c: j >= 202 ? 'vermillon' : 'lagune' })}</em></div>`).join('')}</div>`, { span: 12 });
    const colonne = `<div class="dj-col dj-g" style="grid-column:span 4">${journal}${equipe}</div>`;
    return S.shell('projets', S.tete('', '', '', ['Projets', 'Signés', 'ECOS']).replace('<div class="dj-tete"><div><h1></h1></div></div>', '') + `<div class="dj-g">${tete}${annees}${bailleurs}${sage}${lignes}${colonne}</div>`, o); };

  /* ---------- Téléphone : la coque (les écrans mobiles la reprennent) ---------- */
  S.mEtat = (h = '9:41') => `<div class="djm-etat"><span>${h}</span><span><svg width="18" height="12" viewBox="0 0 18 12"><path d="M1 11V8 M5.5 11V6 M10 11V3.5 M14.5 11V1" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x=".7" y=".7" width="21.6" height="10.6" rx="3.4" stroke="currentColor" stroke-opacity=".45" stroke-width="1.2"/><rect x="2.4" y="2.4" width="15" height="7.2" rx="2" fill="currentColor"/><path d="M24.4 4v4" stroke="currentColor" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round"/></svg></span></div>`;
  S.mTab = (actif = 0) => `<div class="djm-tab">${[['grille', 'Accueil'], ['dossier', 'Projets'], ['cloche', 'Alertes'], ['personne', 'Moi']].map(([i, t], k) => `<span class="${k === actif ? 'on' : ''}">${ico(i, 'style="width:22px;height:22px"')}${t}</span>`).join('')}</div><i class="djm-barre"></i>`;
  S.mobile = (contenu, o = {}) => `<div class="djm ${o.cls || ''}" style="${o.style || ''}">${S.mEtat(o.heure)}<div class="djm-corps">${contenu}</div>${o.tab === false ? '<i class="djm-barre"></i>' : S.mTab(o.actif || 0)}</div>`;

  M.app = S;
})();
