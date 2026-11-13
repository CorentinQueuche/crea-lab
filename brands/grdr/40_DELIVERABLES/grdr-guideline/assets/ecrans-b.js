/* ÉCRANS DE L'OUTIL, lot B — Djongoma (complément de brand/ecrans.js ; styles : brand/ecrans-b.css, classes préfixées djb-).
   Ajoute à Marque.app : projets, projetsGrille, rh, affectation, sage, nouveauProjet. Chaque écran renvoie le HTML complet
   (1440 px de large) et accepte p (0 à 1 : fait monter chiffres et tracés). Les contenus viennent de Marque.DONNEES ;
   ce qui est ajouté ici (affectations, écritures, historique, projet TERA) est de la démonstration, signalée « démo ». */
(function () {
  const M = window.Marque, S = M.app, C = M.COULEURS, D = M.DONNEES, NB = M.NB;
  const E = (x) => M.ease(x == null ? 1 : x);
  const { ico, av, chip, statut, btn, num, lbl, carte } = S;
  const somme = (t, f = (x) => x) => t.reduce((a, x) => a + f(x), 0);
  const projet = (code) => D.projets.find((p) => p.code === code);
  const personne = (nom) => D.personnes.find((p) => p.nom === nom);
  const codeDe = (c) => M.code(c, projet(c) && projet(c).alerte ? 'vermillon' : 'lagune');
  const dec2 = (n) => n.toFixed(2).replace('.', ',');
  const INI = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  /* ---------- Briques du lot ---------- */
  /* Bande de compteurs : cellules [libellé, valeur, { c : couleur du point, cls, note }], puis un bloc libre à droite */
  const compteurs = (cells, droite = '', o = {}) => `<section class="dj-c djb-cpt ${o.cls || ''}" style="grid-column:span ${o.span || 12};grid-template-columns:repeat(${cells.length},${o.l || '152px'})${droite ? ' 1fr' : ''}">` +
    cells.map(([t, v, c = {}]) => `<div class="djb-cpt-c ${v ? '' : 'zero'} ${c.cls || ''}">${lbl(`<u style="background:${c.c || C.sable}"></u>${t}`)}<div class="dj-num">${v}</div>${c.note ? `<small>${c.note}</small>` : ''}</div>`).join('') + droite + `</section>`;
  /* Filtre : libellé, valeur, actif ou non */
  const filtre = (t, v, on) => `<span class="djb-f ${on ? 'on' : ''}"><em>${t}</em>${v}${ico(on ? 'croix' : 'bas')}</span>`;
  const cherche = (t, l = 220) => `<span class="djb-ch" style="width:${l}px">${ico('loupe')}${t}</span>`;
  /* Frise de douze mois : classes de teinte par case ('' = vide) */
  const frise = (cls) => `<div class="djb-fr">${cls.map((c) => `<i class="${c}"></i>`).join('')}</div>`;
  const friseTete = (actif = -1) => `<div class="djb-fr-t">${INI.map((x, i) => `<span class="${i === actif ? 'on' : ''}">${x}</span>`).join('')}</div>`;
  /* Barre empilée : parts [[part 0 à 1, couleur], …] */
  const empile = (parts, k = 1) => `<div class="djb-emp">${parts.map(([v, c]) => `<i style="flex:${Math.max(0.0001, v * k)};background:${M.col(c)}"></i>`).join('')}${k < 0.999 ? `<i style="flex:${somme(parts, (x) => x[0]) * (1 - k)};background:transparent"></i>` : ''}</div>`;
  Object.assign(S, { compteurs, filtre, frise, empile });

  /* ====================== Projets : la liste, et le mur des empreintes ====================== */
  /* Les neuf projets au libellé lisible ; le filtre actif (démo) explique « 9 sur 12 » */
  const P9 = { n: D.projets.length, budget: somme(D.projets, (p) => p.total), execute: somme(D.projets, (p) => p.execute) };
  const FILTRE = ['Bailleur', 'Fonds européens'];
  const empIco = M.empreinte({ cernes: [1, 1], c: 'currentColor', piste: null, ep: 14 });
  const vues = (actif) => `<span class="djb-seg"><span class="${actif === 'liste' ? 'on' : ''}">${ico('menu')}Liste</span><span class="${actif === 'mur' ? 'on' : ''}">${empIco}Empreintes</span></span>`;
  const teteProjets = (vue) => S.tete('Projets', `<span>${D.synthese.projets} projets signés dans 8 pays</span>${M.tampon(`Sage à jour · ${D.extraction.court}`)}`, vues(vue) + btn('Exporter', '', 'export') + btn('Nouveau projet', 'p', 'plus'));
  const cptProjets = (o = {}) => { const k = E(o.p), T = S.TOTAUX, s = D.synthese;
    return compteurs([['Signés', Math.round(s.projets * k), { c: C.emeraude }], ['En attente', 0, { c: C.peche }], ['Terminés', 0, { c: C.sable }]],
      `<div class="djb-cpt-b">
        <div>${lbl(`Budget total · ${s.projets} projets signés`)}<div class="dj-num">${M.nombre(T.budget * k)}<i>€</i></div></div>
        <div class="djb-cpt-x"><div>${lbl('Exécuté')}<b>${M.euro(T.execute * k)}</b></div>${M.jauge({ v: T.taux * k, repere: T.prorata, w: 268, ep: 6, c: 'lagune', piste: 'rgba(42,30,23,.12)' })}<small>${M.pct(T.taux * k, 1)} du total · attendu au prorata ${M.pct(T.prorata)}</small></div></div>`); };
  const barreProjets = () => `<div class="djb-fb">${cherche('Titre ou code')}${filtre('Statut', 'Tous')}${filtre('Pays', 'Tous')}${filtre(FILTRE[0], FILTRE[1], 1)}${filtre('Période', 'Toutes')}
    <span class="djb-fb-d"><span><b>${P9.n}</b> projets sur ${D.synthese.projets}</span><span class="dj-lien">Tout afficher</span></span></div>`;

  S.projets = (o = {}) => { const k = E(o.p);
    const lignes = D.projets.map((p) => { const e = S.ecoule(p);
      return `<tr><td><div class="djb-pj">${S.emp(p, { p: o.p })}<div><b>${p.titre}</b><span>${codeDe(p.code)}${D.pays[p.pays]}</span></div></div></td>
        <td>${S.periode(p).replace('</b><b', `</b><i>${M.pct(e)}</i><b`)}</td>
        <td><div class="djb-chef">${av(p.chef, 's')}<span>${p.chef}</span></div></td>
        <td class="d">${num(p.total)}</td>
        <td class="d"><div class="djb-exe">${num(p.execute * k)}<div class="dj-ex">${M.jauge({ v: p.taux * k, repere: e, w: 96, ep: 6, c: p.alerte ? 'vermillon' : 'emeraude' })}<b>${M.pct(p.taux * k)}</b></div></div></td>
        <td class="d">${num(p.total - p.execute * k, '', `color:${C.lagune}`)}</td>
        <td><div class="djb-st">${statut('Signé')}${p.acquis < 1 ? `<small>${M.pct(p.acquis)} acquis</small>` : ''}</div></td></tr>`; }).join('');
    const table = `<table class="dj-t djb-tp"><colgroup><col><col style="width:174px"><col style="width:130px"><col style="width:106px"><col style="width:200px"><col style="width:104px"><col style="width:84px"></colgroup>
      <thead><tr><th>Projet</th><th>Période · durée écoulée</th><th>Chef de projet</th><th class="d">Budget total</th><th class="d"><span class="djb-tri">Exécuté · repère prorata${ico('bas')}</span></th><th class="d">Reste</th><th>Statut</th></tr></thead>
      <tbody>${lignes}</tbody>
      <tfoot><tr><td colspan="3"><div class="djb-pied"><b>${P9.n} projets affichés sur ${D.synthese.projets}</b><span>${FILTRE[0]} : ${FILTRE[1]}</span></div></td>
        <td class="d">${num(P9.budget)}</td>
        <td class="d"><div class="djb-exe">${num(P9.execute * k)}<div class="dj-ex">${M.jauge({ v: (P9.execute / P9.budget) * k, w: 96, ep: 6, c: 'lagune' })}<b>${M.pct((P9.execute / P9.budget) * k)}</b></div></div></td>
        <td class="d">${num(P9.budget - P9.execute * k, '', `color:${C.lagune}`)}</td><td></td></tr></tfoot></table>`;
    return S.shell('projets', teteProjets('liste') + `<div class="dj-g">${cptProjets(o)}<section class="dj-c" style="grid-column:span 12">${barreProjets()}${table}</section></div>`, o); };

  /* Le mur des empreintes : les mêmes projets, en cartes. Pour ECOS, les boucles reprennent les années de la fiche. */
  const cernesP = (p) => { const c = M.cernesDe(p); return p.code === 'ECOS' ? { ...c, cernes: S.FICHE.annees.map((a) => a.execute / a.prevu) } : c; };
  const tuile = (p, o = {}) => { const k = E(o.p), c = cernesP(p);
    return `<section class="dj-c djb-tu" style="grid-column:span 4">
      <div class="djb-tu-h">${codeDe(p.code)}<span>${D.pays[p.pays]}</span>${statut('Signé')}</div>
      <div class="djb-tu-e">${M.empreinte({ cernes: c.cernes.map((v) => v * k), actif: c.actif, cadre: 5, taille: 172 })}
        <div class="djb-an">${c.annees.map((a, i) => `<div class="${i === c.actif ? 'on' : ''}"><span>${a}</span>${M.jauge({ v: c.cernes[i] * k, w: 56, ep: 5, c: i === c.actif ? 'vermillon' : 'lagune' })}</div>`).join('')}</div></div>
      <h3>${p.titre}</h3>
      <div class="djb-tu-m">${av(p.chef, 's')}<span>${p.chef}</span><em>${S.mmaa(p.debut)} → ${S.mmaa(p.fin)}</em></div>
      <div class="djb-tu-c"><div>${lbl('Budget')}${num(p.total)}</div><div>${lbl(`Exécuté · ${M.pct(p.taux * k)}`)}${num(p.execute * k, '', `color:${C.lagune}`)}</div><div>${lbl('Reste')}${num(p.total - p.execute * k)}</div></div></section>`; };
  S.tuileProjet = tuile;
  S.projetsGrille = (o = {}) => { const k = E(o.p);
    const lire = `<div class="djb-lire">${M.empreinte({ cernes: [1, 1, 0.45, 0], actif: 2, ep: 12 })}<p><b>Lire une empreinte.</b> Une boucle par année, du centre vers l’extérieur, tracée jusqu’à son exécuté.</p>
      <span><i style="background:${C.lagune}"></i>Exécuté</span><span><i style="background:${C.vermillon}"></i>Année en cours</span><span><i style="background:${C.sable}"></i>Reste à exécuter</span></div>`;
    const pied = `<div class="djb-mur-p" style="grid-column:span 12"><b>${P9.n} projets affichés sur ${D.synthese.projets}</b><span>${FILTRE[0]} : ${FILTRE[1]}</span>
      <div>${lbl('Budget')}${num(P9.budget)}</div><div>${lbl(`Exécuté · ${M.pct((P9.execute / P9.budget) * k)}`)}${num(P9.execute * k, '', `color:${C.lagune}`)}</div><div>${lbl('Reste')}${num(P9.budget - P9.execute * k)}</div></div>`;
    return S.shell('projets', teteProjets('mur') + `<div class="dj-g">${cptProjets(o)}<section class="dj-c djb-outils" style="grid-column:span 12">${barreProjets()}${lire}</section>${D.projets.map((p) => tuile(p, o)).join('')}${pied}</div>`, o); };

  /* ====================== Ressources humaines ====================== */
  /* démo : affectations de l'exercice 2025, [code, jours, premier mois, dernier mois]. La somme par personne est celle de
     DONNEES.personnes[].jours ; les jours sur ECOS sont ceux de la carte « Équipe du projet » de la fiche (677 jours). */
  S.AFFECTATIONS = {
    'Awa D.': [['ECOS', 40, 1, 12], ['ECOD', 76, 1, 12], ['HWCL', 80, 3, 12]],
    'Mamadou S.': [['ECOS', 162, 1, 12], ['HWCL', 52, 4, 9]],
    'Claire M.': [['DEAR', 117, 1, 12], ['ECOS', 71, 1, 10]],
    'Ibrahima B.': [['OICC', 162, 1, 12], ['HWCL', 40, 1, 12]],
    'Fatou N.': [['ECOD', 131, 1, 12], ['AMIS', 40, 5, 12]],
    'Sami K.': [['JPAT', 121, 1, 12], ['PDLD', 100, 1, 8]],
    'Léa R.': [['ECSI', 73, 1, 12], ['AMIS', 40, 1, 12], ['JPAT', 51, 6, 12]],
    'Aminata C.': [['HWCL', 169, 1, 12], ['DEAR', 40, 9, 12]],
    'Ousmane T.': [['ECOS', 121, 1, 12], ['DEAR', 29, 3, 6]],
    'Mariam K.': [['ECOS', 202, 1, 12]],
    'Julien P.': [['ECOD', 62, 1, 12], ['ECSI', 60, 1, 12], ['AMIS', 60, 1, 12]],
    'Kadiatou S.': [['ECOS', 81, 1, 12], ['HWCL', 77, 1, 12], ['DEAR', 40, 1, 12]],
  };
  const CAP = 202, CAPM = CAP / 12, ECH = 230;
  const parMois = (aff) => INI.map((_, m) => somme(aff, ([, j, m0, m1]) => (m + 1 >= m0 && m + 1 <= m1 ? j / (m1 - m0 + 1) : 0)));
  const teinte = (r) => (r > 1.1 ? 'x' : r >= 0.97 ? 'c4' : r >= 0.8 ? 'c3' : r >= 0.5 ? 'c2' : r > 0 ? 'c1' : '');
  S.rh = (o = {}) => { const k = E(o.p), s = D.synthese;
    const cpt = `<section class="dj-c djb-eff" style="grid-column:span 7">
      <div class="djb-eff-c">${[['Employés', s.salaries, C.encre, ''], ['Actifs', s.actifs, C.lagune, ''], ['Inactifs', s.inactifs, C.sable, ''], ['Surchargés', s.surcharges, C.vermillon, 'al']].map(([t, v, c, cl]) => `<div class="${cl}">${lbl(`<u style="background:${c}"></u>${t}`)}<div class="dj-num">${Math.round(v * k)}</div></div>`).join('')}</div>
      <div class="djb-eff-b">${empile([[s.surcharges, 'vermillon'], [s.actifs - s.surcharges, 'lagune'], [s.inactifs, 'sable']], k)}
        <div><span><i style="background:${C.vermillon}"></i>${s.surcharges} au-dessus de ${CAP} jours</span><span><i style="background:${C.lagune}"></i>${s.actifs - s.surcharges} actifs dans la limite</span><span><i style="background:${C.sable}"></i>${s.inactifs} inactifs, non affectables</span></div></div></section>`;
    const regle = `<section class="dj-c nuit grain nuit djb-regle" style="grid-column:span 5">${M.empreinte({ cernes: [1, 1, 1, 1], c: '#1D4A47', piste: null })}
      <div class="djb-regle-n">${lbl('La base de calcul')}<div class="dj-num">${Math.round(CAP * k)}</div><p>jours travaillés par an, pour chaque personne.</p></div>
      <div class="djb-regle-l">
        <div><em>Coût journalier</em><b>coût annuel chargé ÷ ${CAP}</b></div>
        <div><em>Jours affectés</em><b>montant affecté ÷ coût journalier</b></div>
        <div><em>Charge de l’exercice</em><b>somme des affectations</b></div>
        <div class="x"><em>Surchargé</em><b>au-delà de ${CAP} jours</b></div></div></section>`;
    const gens = [...D.personnes].sort((a, b) => b.jours - a.jours);
    const lignes = gens.map((g) => { const a = S.AFFECTATIONS[g.nom] || [], j = Math.round(g.jours * k), sur = j > CAP, dispo = CAP - j, pm = parMois(a);
      return `<tr><td><div class="djb-qui">${av(g.nom)}<div><b>${g.nom}${sur ? chip('Surchargé', 'al', false) : ''}</b><span>${g.poste}</span></div></div></td>
        <td class="djb-site">${g.site}</td>
        <td class="d">${num(g.cout)}<small class="djb-cj">${dec2(g.cout / CAP)}${NB}€ par jour</small></td>
        <td><div class="djb-jo">${M.jauge({ v: (g.jours / ECH) * k, repere: CAP / ECH, w: 96, ep: 6, c: sur ? 'vermillon' : 'lagune' })}<b>${j}${NB}j</b></div></td>
        <td class="d"><b class="djb-dispo ${dispo < 0 ? 'neg' : dispo === 0 ? 'nul' : ''}">${dispo < 0 ? '−' : ''}${Math.abs(dispo)}${NB}j</b></td>
        <td>${frise(pm.map((v, i) => (i < Math.round(12 * k) ? teinte(v / CAPM) : '')))}</td>
        <td><div class="djb-codes">${a.map(([c]) => codeDe(c)).join('')}</div></td></tr>`; }).join('');
    const legende = `<div class="djb-leg">${lbl('Charge du mois')}${[['c1', 'moins de 50 %'], ['c2', '50 à 80 %'], ['c3', '80 à 97 %'], ['c4', 'plein'], ['x', 'au-dessus']].map(([c, t]) => `<span><i class="${c}"></i>${t}</span>`).join('')}</div>`;
    const table = `<table class="dj-t djb-trh"><colgroup><col><col style="width:88px"><col style="width:146px"><col style="width:184px"><col style="width:92px"><col style="width:204px"><col style="width:148px"></colgroup>
      <thead><tr><th>Personne</th><th>Site</th><th class="d">Coût annuel chargé</th><th><span class="djb-tri">Jours affectés sur ${CAP}${ico('bas')}</span></th><th class="d">Disponible</th><th>${friseTete(5)}</th><th>Projets</th></tr></thead>
      <tbody>${lignes}</tbody>
      </table><div class="djb-bas"><div class="djb-pied"><b>${gens.length} personnes affichées sur ${s.salaries}</b><span>triées par jours affectés</span></div>${legende}<div class="djb-pages"><span class="on">1</span><span>2</span><span>3</span><em>…</em><span>${Math.ceil(s.salaries / gens.length)}</span>${ico('droite')}</div></div>`;
    const outils = `<div class="djb-fb"><span class="dj-seg"><span class="on">Tous · ${s.salaries}</span><span>Actifs · ${s.actifs}</span><span>Surchargés · ${s.surcharges}</span><span>Inactifs · ${s.inactifs}</span></span>${cherche('Nom, poste ou site', 210)}${filtre('Site', 'Tous')}${filtre('Projet', 'Tous')}<span class="djb-fb-d"><span><b>${gens.length}</b> personnes sur ${s.salaries}</span></span></div>`;
    return S.shell('rh', S.tete('Ressources humaines', `<span>Qui travaille sur quoi, et combien de jours, pour l’exercice ${D.exercice}</span>`, btn('Exporter', '', 'export') + btn('Ajouter une personne', 'p', 'plus')) +
      `<div class="dj-g">${cpt}${regle}<section class="dj-c" style="grid-column:span 12">${outils}${table}</section></div>`, o); };

  /* ====================== Affectation : la fiche ECOS, et le panneau ouvert par-dessus ====================== */
  /* Règle du cahier des charges : montant affecté = montant × part ; jours = montant affecté ÷ (coût annuel chargé ÷ 202).
     démo : les parts (50, 30, 20 %). o.montant : le montant à répartir. Par défaut la tranche 2025 de la ligne (42 000 €, démo) :
     avec les 528 000 € de la ligne entière et les coûts de DONNEES.personnes, la règle donnerait 2 693, 1 481 et 878 jours. */
  S.AFFECTER = { ligne: 'Animation territoriale', cat: 'RH', total: 528000, tranche: 42000, parts: [['Mariam K.', 0.5, 'lagune'], ['Ousmane T.', 0.3, 'ocre'], ['Kadiatou S.', 0.2, 'peche']] };
  S.panneauAffectation = (o = {}) => { const k = E(o.p), A = S.AFFECTER, base = o.montant || A.tranche, entier = base === A.total;
    const P = A.parts.map(([nom, part, c]) => { const g = personne(nom), cj = g.cout / CAP, ecos = (S.AFFECTATIONS[nom].find((a) => a[0] === 'ECOS') || [0, 0])[1], autres = g.jours - ecos, montant = base * part, jours = montant / cj;
      return { nom, part, c, g, cj, autres, montant, jours, charge: Math.round(autres + jours * k) }; });
    const trop = P.filter((x) => x.charge > CAP);
    const gens = P.map((x) => { const sur = x.charge > CAP;
      return `<div class="djb-pa ${sur ? 'sur' : ''}"><div class="djb-pa-h">${av(x.nom)}<div><b>${x.nom}</b><span>${x.g.poste} · ${x.g.site}</span></div>
          <span class="djb-pc"><b>${Math.round(x.part * 100 * k)}</b><i>%</i></span><span class="djb-x">${ico('croix')}</span></div>
        <div class="djb-sl" style="--v:${(x.part * 100 * k).toFixed(1)}%;--sc:${M.col(x.c)}"><i></i><b></b></div>
        <div class="djb-pa-c">${num(x.montant * k)}<em>÷ ${dec2(x.cj)}${NB}€ par jour</em><span class="djb-pa-j"><b>${M.nombre(x.jours * k)}${NB}j</b><small>charge ${D.exercice} : ${M.nombre(x.autres + x.jours * k)} sur ${CAP}</small></span></div></div>`; }).join('');
    const noms = trop.map((x) => x.nom), liste = noms.length > 1 ? noms.slice(0, -1).join(', ') + ' et ' + noms[noms.length - 1] : noms[0];
    const conseil = trop.length === 1 ? (() => { const x = trop[0], pm = Math.floor(((CAP - x.autres) * x.cj / base) * 100); return ` À ${pm}${NB}%, la charge revient à ${Math.round(x.autres + (base * pm / 100) / x.cj)} jours.`; })() : '';
    const alerte = trop.length ? `<div class="djb-pan-a"><span>${ico('alerte')}</span><p><b>${trop.length === 1 ? `${liste} passerait à ${M.nombre(trop[0].charge)} jours` : `${liste} dépasseraient ${CAP} jours`}</b>${trop.length === 1 ? `Soit ${M.nombre(trop[0].charge - CAP)} de plus que les ${CAP} jours travaillés par an.${conseil}` : `La ligne demande plus de jours que ces personnes n’en ont sur l’exercice.`}</p></div>` : '';
    return `<div class="djb-voile"></div><aside class="djb-pan">
      <header><div>${lbl('ECOS · ligne budgétaire')}<h2>Affecter des personnes</h2></div><span class="dj-rond">${ico('croix')}</span></header>
      <div class="djb-pan-l"><div>${M.code(A.cat, 'ocre')}<b>${A.ligne}</b>${chip(`${P.length} sur 3 personnes`, 'lag', false)}</div>
        <dl><div><dt>${lbl('Prévisionnel de la ligne')}</dt><dd>${num(A.total)}</dd></div><div><dt>${lbl(entier ? 'À répartir' : `À répartir · exercice ${D.exercice}`)}</dt><dd>${num(base)}</dd></div></dl>
        <p>montant = ${M.euro(base)} × part · jours = montant ÷ (coût annuel ÷ ${CAP})</p></div>
      <div class="djb-pan-p">${gens}</div>
      <div class="djb-pan-t"><div>${lbl('Total affecté')}<span class="djb-ok">${k > 0.999 ? ico('coche') : ''}${Math.round(100 * k)}${NB}%</span>${num(base * k)}</div>${empile(P.map((x) => [x.part, x.c]), k)}</div>
      ${alerte}
      <footer>${M.tampon('Inscrit au journal', 'ocre')}${btn('Annuler')}${btn('Enregistrer', 'p', 'coche')}</footer></aside>`; };
  S.affectation = (o = {}) => { const h = S.ficheProjet(o), i = h.lastIndexOf('</div>'); return h.slice(0, i) + S.panneauAffectation(o) + h.slice(i); };

  /* ====================== Extraction Sage ====================== */
  /* Publié ou déjà dans le socle : section ECOS-MR-22, du 01/01 au 15/06/2025, 214 écritures, 260 600 €, reste 731 128 €.
     démo : l'extraction précédente (2 juin : 186 écritures, 229 480 €), les dix écritures, l'historique. */
  S.SAGE = { section: 'ECOS-MR-22', du: '01/01/2025', au: '15/06/2025', ecritures: 214, total: 260600, avant: { date: '2 juin', ecritures: 186, total: 229480 },
    lignes: [
      ['13/06/2025', 'ACH', 'AC-0613-041', 'Carburant, véhicules du projet', '606100', 486, 1],
      ['12/06/2025', 'BQ', 'BQ-0612-018', 'Location de salle, atelier de Kaédi', '613200', 320, 1],
      ['11/06/2025', 'ACH', 'AC-0611-037', 'Semences maraîchères, Sélibaby', '606800', 2940, 1],
      ['10/06/2025', 'OD', 'OD-0610-006', 'Indemnités de mission, suivi de terrain', '625600', 1215, 1],
      ['06/06/2025', 'ACH', 'AC-0606-029', 'Entretien de la pompe solaire, Kaédi', '615500', 1780, 1],
      ['05/06/2025', 'BQ', 'BQ-0605-011', 'Honoraires, étude hydraulique', '622600', 4500, 1],
      ['04/06/2025', 'CAI', 'CA-0604-014', 'Repas, formation des comités', '625700', 264, 1],
      ['03/06/2025', 'ACH', 'AC-0603-022', 'Fournitures de bureau, Sélibaby', '606400', 158, 1],
      ['02/06/2025', 'BQ', 'BQ-0602-004', 'Loyer de l’antenne de Sélibaby, juin', '613200', 650, 1],
      ['31/05/2025', 'PAI', 'PA-0531-001', 'Salaires de mai, équipe d’animation', '641100', 3540, 0],
    ],
    historique: [
      ['16/06/2025', '11:42', 'OICC', 'OICC-GN-24', '01/01 → 15/06/2025', 'Julien P.', 96, 1],
      ['13/06/2025', '16:05', 'JPAT', 'JPAT-TN-23', '01/01 → 31/05/2025', 'Awa D.', 131, 1],
      ['12/06/2025', '10:04', 'ECSI', 'ECSI-FR-24', '01/01 → 31/05/2025', 'Julien P.', 88, 1],
      ['12/06/2025', '09:30', 'ECSI', 'ECSI-FR-24', '01/01 → 31/05/2025', 'Julien P.', 0, 0, 'Section analytique ECSI-FR-24 introuvable dans Sage : elle n’était pas encore ouverte sur l’exercice 2025. Aucun exécuté n’a été modifié. Relancée à 10 h 04, une fois la section ouverte en comptabilité.'],
      ['02/06/2025', '09:12', 'ECOS', 'ECOS-MR-22', '01/01 → 31/05/2025', 'Awa D.', 186, 1],
      ['13/05/2025', '10:18', 'PDLD', 'PDLD-DZ-24', '01/01 → 30/04/2025', 'Awa D.', 57, 1],
    ] };
  S.sage = (o = {}) => { const k = E(o.p), G = S.SAGE, p = D.projets[0], delta = G.total - G.avant.total, mix = (a, b) => a + (b - a) * k;
    const etape = (n, t, s, etat) => `<div class="${etat}"><span class="djb-et-n">${etat === 'fait' ? ico('coche') : n}</span><div><b>${t}</b><span>${s}</span></div></div>`;
    const etapes = `<section class="dj-c djb-et" style="grid-column:span 12">
      ${etape(1, 'Section analytique et période', `<i>${G.section}</i> · du ${G.du.slice(0, 5)} au ${G.au}`, 'fait')}
      ${etape(2, 'Aperçu des écritures', `${G.ecritures} écritures lues · rien n’est encore modifié`, 'on')}
      ${etape(3, 'Mise à jour des exécutés', 'Après votre validation', '')}</section>`;
    const lignes = G.lignes.map(([d, j, pc, l, c, m, neuf]) => `<tr><td class="djb-mo"><u class="${neuf ? 'n' : ''}"></u>${d}</td><td>${M.code(j, 'ocre')}</td><td class="djb-mo">${pc}</td><td><b>${l}</b></td><td class="djb-mo">${c}</td><td class="d">${num(m)}</td></tr>`).join('');
    const apercu = carte('Aperçu des écritures', `Section ${G.section} · du ${G.du} au ${G.au}`, `<table class="dj-t djb-tec"><colgroup><col style="width:100px"><col style="width:66px"><col style="width:112px"><col><col style="width:76px"><col style="width:84px"></colgroup>
      <thead><tr><th>Date</th><th>Journal</th><th>Pièce</th><th>Libellé</th><th>Compte</th><th class="d">Montant</th></tr></thead><tbody>${lignes}</tbody></table>
      <div class="djb-bas"><div class="djb-pied"><b>${G.lignes.length} écritures affichées sur ${G.ecritures}</b><span><u class="n"></u>${G.ecritures - G.avant.ecritures} nouvelles depuis le ${G.avant.date}</span></div><div class="djb-tot">${lbl('Total de la période')}${num(G.total * k)}</div></div>`,
      { span: 8, cls: 'djb-ap8', droite: `<span class="dj-seg"><span class="on">Toutes · ${G.ecritures}</span><span>Nouvelles · ${G.ecritures - G.avant.ecritures}</span></span>` });
    const change = `<section class="dj-c nuit grain nuit djb-chg" style="grid-column:span 4">${M.empreinte({ cernes: [1, 1, 1, 1], c: '#1D4A47', piste: null })}
      <div class="dj-ct"><div><h2>Ce qui va changer</h2><p>${p.code} · ${p.titre}</p></div></div>
      <div class="djb-chg-b">${lbl(`Exécuté ${D.exercice}`)}<div class="dj-num">${M.nombre(mix(G.avant.total, G.total))}<i>€</i></div>
        <p><s>${M.euro(G.avant.total)}</s><span class="dj-delta nuit">+${NB}${M.euro(delta * k)}</span></p></div>
      <div class="djb-chg-b">${lbl('Exécuté du projet')}<div class="djb-chg-j">${M.jauge({ v: mix(p.execute - delta, p.execute) / p.total, repere: S.ecoule(p), cRepere: 'blanc', w: 220, ep: 7, c: 'miel', piste: '#24514D' })}<b>${M.pct(mix(p.execute - delta, p.execute) / p.total, 1)}</b></div>
        <p><span>${M.euro(mix(p.execute - delta, p.execute))} sur ${M.euro(p.total)}</span></p></div>
      <div class="djb-chg-b">${lbl('Reste à exécuter · recalculé')}<div class="dj-num b">${M.nombre(mix(p.total - p.execute + delta, p.total - p.execute))}<i>€</i></div>
        <p><s>${M.euro(p.total - p.execute + delta)}</s><span>d’ici févr. 2026</span></p></div>
      <div class="djb-chg-f">${M.tampon('Aucune ressaisie', 'miel')}<p>Les ${G.ecritures} écritures viennent de Sage. Vous validez, les exécutés se recalculent.</p>
        <span class="dj-btn djb-cta">Mettre à jour les exécutés${ico('fleche')}</span><span class="djb-ret">${ico('gauche')}Modifier la période</span></div></section>`;
    const histo = G.historique.map(([d, h, c, sec, per, qui, n, ok, pourquoi]) => `<tr class="${ok ? '' : 'ko'}"><td class="djb-mo">${d}<i>${h}</i></td><td><div class="djb-hp">${codeDe(c)}<b>${projet(c).titre}</b></div></td><td class="djb-mo">${sec}</td><td class="djb-mo">${per}</td>
        <td><div class="djb-chef">${av(qui, 's')}<span>${qui}</span></div></td><td class="d">${n ? `<b class="djb-n">${n}</b>` : `<span class="djb-vide">0</span>`}</td><td>${chip(ok ? 'Succès' : 'Échec', ok ? 'ok' : 'al')}</td></tr>` +
      (pourquoi ? `<tr class="djb-pq"><td></td><td colspan="6"><div>${ico('alerte')}<p>${pourquoi}</p></div></td></tr>` : '')).join('');
    const historique = carte('Dernières extractions', 'Chaque extraction est inscrite au journal', `<table class="dj-t djb-thi"><colgroup><col style="width:150px"><col><col style="width:136px"><col style="width:176px"><col style="width:142px"><col style="width:92px"><col style="width:98px"></colgroup>
      <thead><tr><th>Date</th><th>Projet</th><th>Section analytique</th><th>Période extraite</th><th>Par</th><th class="d">Écritures</th><th>Statut</th></tr></thead><tbody>${histo}</tbody></table>`,
      { span: 12, droite: `<span class="dj-lien">Tout l’historique ${ico('fleche', 'style="width:14px;height:14px"')}</span>` });
    return S.shell('sage', S.tete('Extraction Sage', `<span>Les dépenses viennent de la comptabilité. Personne ne ressaisit.</span>${M.tampon('Connecteur BI Reporting · connecté')}`, btn('Annuler l’extraction')) +
      `<div class="dj-g">${etapes}${apercu}${change}${historique}</div>`, o); };

  /* ====================== Nouveau projet ====================== */
  /* démo : le projet TERA, « Territoires et alimentation ». Bailleurs par type seulement. */
  S.NOUVEAU = { code: 'TERA', titre: 'Territoires et alimentation', debut: '2025-09', fin: '2028-08', du: '01/09/2025', au: '31/08/2028', total: 1250000, acquis: 0.8, pays: 'SN', site: 'Dakar', taux: 0,
    bailleurs: [['Coopération bilatérale', 0.5, 'lagune', 1], ['Fonds européens', 0.3, 'ocre', 1], ['Collectivités', 0.2, 'peche', 0]] };
  S.nouveauProjet = (o = {}) => { const k = E(o.p), N = S.NOUVEAU, c = M.cernesDe(N), [, m0] = N.debut.split('-').map(Number), [, m1] = N.fin.split('-').map(Number);
    /* prorata au mois près, à l'euro : l'écart d'arrondi est porté sur la dernière année */
    const parts = c.mois.map((m) => Math.round((N.total * m) / c.total)); parts[parts.length - 1] = N.total - somme(parts.slice(0, -1));
    const champ = (t, v, f = {}) => `<div class="dj-champ djb-chp" style="grid-column:span ${f.span || 2}">${t}<div class="${f.foc ? 'foc' : ''} ${f.cls || ''}">${f.ico ? ico(f.ico) : ''}<span>${v}</span>${f.foc ? '<u class="djb-car"></u>' : ''}${f.suf ? `<i>${f.suf}</i>` : ''}</div>${f.aide || ''}</div>`;
    const ok = (t) => `<small class="djb-oki">${ico('coche')}${t}</small>`;
    const identite = carte('Le projet', 'Ce que vous saisissez ici se retrouve partout : fiche, tableau de bord, exports', `<div class="djb-form">
        ${champ('Code projet', N.code, { span: 2, cls: 'mono', aide: ok('Code disponible') })}${champ('Titre', N.titre, { span: 4 })}
        ${champ('Date de début', N.du, { span: 2, ico: 'calendrier' })}${champ('Date de fin', N.au, { span: 2, ico: 'calendrier' })}
        <div class="djb-lu" style="grid-column:span 2">${lbl('Durée calculée')}<b>${c.total} mois</b><span>${c.annees.length} exercices, de ${c.annees[0]} à ${c.annees[c.annees.length - 1]}</span></div>
        ${champ('Budget total', M.nombre(N.total), { span: 3, suf: '€', cls: 'gros' })}${champ('Pourcentage acquis', Math.round(N.acquis * 100), { span: 3, suf: '%', cls: 'gros', aide: `<small>Acquis ${M.euro(N.total * N.acquis * k)} · à confirmer ${M.euro(N.total * (1 - N.acquis) * k)}</small>` })}
        ${champ('Pays', D.pays[N.pays], { span: 3, ico: 'lieu', suf: ico('bas') })}${champ('Site', N.site, { span: 3, suf: ico('bas') })}</div>`, { span: 12 });
    const lignesB = N.bailleurs.map(([n, part, col, acq], i) => `<div class="djb-bl"><div class="djb-bl-t"><u style="background:${M.col(col)}"></u><span>${n}</span>${ico('bas')}</div>
        <div class="djb-bl-p ${i === N.bailleurs.length - 1 ? 'foc' : ''}"><b>${Math.round(part * 100)}</b>${i === N.bailleurs.length - 1 ? '<u class="djb-car"></u>' : ''}<i>%</i></div>
        <div class="djb-bl-m">${num(N.total * part * k)}</div>${chip(acq ? 'Acquis' : 'À confirmer', acq ? 'ok' : 'att')}<span class="djb-x">${ico('croix')}</span></div>`).join('');
    const bailleurs = carte('Bailleurs', 'Jusqu’à cinq cofinancements, par type de bailleur', `<div class="djb-bl-h"><span>Type de bailleur</span><span>Part</span><span>Montant calculé</span><span>État</span></div>${lignesB}
      <div class="djb-bl-a">${ico('plus')}Ajouter un bailleur<span>${N.bailleurs.length} sur 5</span></div>
      <div class="djb-val">${ico('coche')}<b>Total ${Math.round(somme(N.bailleurs, (b) => b[1]) * 100 * k)}${NB}%</b>${empile(N.bailleurs.map((b) => [b[1], b[2]]), k)}${num(N.total * k)}</div>`, { span: 12 });
    const controle = `<div class="djb-ctl" style="grid-column:span 12">${['Code disponible', `Dates cohérentes : ${c.total} mois`, 'Bailleurs : 100 %', `Acquis : ${M.pct(N.acquis)}`].map((t) => `<span>${ico('coche')}${t}</span>`).join('')}</div>`;
    const apercu = `<section class="dj-c aq djb-ap" style="grid-column:span 12"><img class="aq-i" src="${M.aqURL('aube')}" alt="">
      <div class="djb-ap-h">${lbl('Aperçu en direct')}${chip('En attente', 'att')}</div>
      <div class="djb-ap-c">${M.empreinte({ cernes: c.annees.map(() => 0), piste: 'rgba(255,253,249,.9)', ep: 11, taille: 176 })}
        <div><div>${M.code(N.code, 'encre')}<span>${D.pays[N.pays]} · ${N.site}</span></div><h3>${N.titre}</h3>
          <div class="dj-num">${M.nombre(N.total * k)}<i>€</i></div>
          <p>${S.moisLong(N.debut)} → ${S.moisLong(N.fin)} · ${c.total} mois</p></div></div>
      <div class="djb-ap-p">${c.annees.length} boucles vides, une par année. Elles se traceront à chaque extraction Sage.</div></section>`;
    const annees = c.annees.map((a, i) => { const deb = i === 0 ? m0 : 1, fin = i === c.annees.length - 1 ? m1 : 12;
      return `<div><b>${a}</b>${frise(INI.map((_, m) => (m + 1 >= deb && m + 1 <= fin && m < Math.round(12 * k) ? 'c4' : '')))}<small>${c.mois[i]} mois</small>${num(parts[i] * k)}</div>`; }).join('');
    const prorata = carte('Prorata par année', 'Calculé au mois près, à l’euro près', `<div class="djb-pr"><div class="t"><b></b>${friseTete()}<small></small><small></small></div>${annees}
        <div class="s"><b>Total</b><em>L’écart d’arrondi est porté sur la dernière année.</em><small>${c.total} mois</small>${num(somme(parts) * k)}</div></div>`, { span: 12 });
    const NBm = Math.max(...N.bailleurs.map((b) => b[1]));
    const repart = carte('Répartition par bailleur', 'Une boucle par bailleur', `<div class="djb-rp">${M.empreinte({ cernes: N.bailleurs.map((b) => (b[1] / NBm) * k).reverse(), c: N.bailleurs.map((b) => M.col(b[2])).reverse(), piste: 'rgba(42,30,23,.06)', taille: 124 })}
        <div class="dj-bl">${N.bailleurs.map((b) => `<div><u style="--bc:${M.col(b[2])}"></u>${b[0]}<b>${M.pct(b[1])}</b><span>${M.nombre(N.total * b[1] * k)}${NB}€</span></div>`).join('')}</div></div>`, { span: 12 });
    return S.shell('projets', S.tete('Nouveau projet', `<span>Les calculs se font pendant la saisie.</span>${M.tampon('Brouillon · pas encore enregistré', 'ocre')}`, btn('Annuler') + btn('Créer le projet', 'p', 'coche'), ['Projets', 'Nouveau projet']) +
      `<div class="dj-g djb-np"><div class="dj-g djb-np-g" style="grid-column:span 7">${identite}${bailleurs}${controle}</div><div class="dj-g djb-np-d" style="grid-column:span 5">${apercu}${prorata}${repart}</div></div>`, o); };
})();
