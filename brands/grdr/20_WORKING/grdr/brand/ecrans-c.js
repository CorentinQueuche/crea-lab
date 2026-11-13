/* ÉCRANS DE L'OUTIL, lot C — Djongoma (complément de brand/ecrans.js ; styles brand/ecrans-c.css, classes préfixées djc-).
   Bureau (1440 px) : stats, journal, admin (dans la coque), connexion (sans la coque, 1440 × 900).
   Téléphone (390 × 844) : mAccueil, mProjet, mAlerte (dans Marque.app.mobile).
   Chaque écran : Marque.app.<nom>(o) → HTML ; o.p (0 à 1) fait monter chiffres et tracés ; o.h : hauteur fixe (bureau).
   Données : Marque.DONNEES, Marque.app.FICHE, Marque.app.TOTAUX. Ce qui est ajouté ici est de la démonstration, signalé « démo ». */
(function () {
  const M = window.Marque, S = M.app, C = M.COULEURS, D = M.DONNEES, NB = M.NB, T = S.TOTAUX, F = S.FICHE;
  const E = (x) => M.ease(x == null ? 1 : x);
  const { ico, av, avs, chip, statut, btn, num, lbl, carte } = S;
  const somme = (l, f = (x) => x) => l.reduce((a, x) => a + f(x), 0);

  /* Des parts qui font 100 (plus fort reste), à d décimales ; un total réparti à l'euro près */
  const parts100 = (vals, d = 0) => { const tot = somme(vals), f = Math.pow(10, d), brut = vals.map((v) => (v / tot) * 100 * f), bas = brut.map(Math.floor), r = Math.round(100 * f - somme(bas));
    brut.map((v, i) => [v - bas[i], i]).sort((a, b) => b[0] - a[0]).slice(0, r).forEach(([, i]) => bas[i]++); return bas.map((v) => v / f); };
  const repartir = (total, parts) => { const brut = parts.map((p) => total * p), bas = brut.map(Math.floor), r = Math.round(total - somme(bas));
    brut.map((v, i) => [v - bas[i], i]).sort((a, b) => b[0] - a[0]).slice(0, r).forEach(([, i]) => bas[i]++); return bas; };
  const pc = (x, d = 0) => `${x.toFixed(d).replace('.', ',')}${NB}%`;
  const vide = `<i class="djc-vide"></i>`;
  const projet = (code) => D.projets.find((p) => p.code === code);
  /* Contournement d'un défaut du socle : à hauteur fixe (o.h), la barre latérale s'étire à la hauteur du contenu et son pied (Sage, compte) sort du cadre.
     La classe djc-fixe ramène la barre latérale à la hauteur de l'écran (variable --djc-h), sans toucher à la colonne principale. */
  const coque = (o, plus = {}) => ({ ...plus, ...o, cls: `${o.cls || ''}${o.h ? ' djc-fixe' : ''}`, style: `${o.style || ''}${o.h ? `--djc-h:${o.h}px;` : ''}` });
  const codeP = (c) => { const p = projet(c); return M.code(c, p && p.alerte ? 'vermillon' : 'lagune'); };

  /* ====================== Statistiques ====================== */
  /* démo : le portefeuille par année. Les totaux tombent sur les chiffres publiés (15 628 761 € prévus, exécuté du tableau de bord) ;
     2022 est l'année d'ECOS seule (fiche projet) ; 2025 reprend le prévu et l'exécuté de l'exercice. */
  const AN = [{ a: 2022, prevu: 610000, execute: 588400 }, { a: 2023, prevu: 1180000, execute: 1096300 }, { a: 2024, prevu: 2240000 }, { a: 2025, prevu: T.prevuExercice, execute: T.executeExercice, encours: true }, { a: 2026, prevu: 3890000, execute: 0 }, { a: 2027, prevu: 2420000, execute: 0 }, { a: 2028 }];
  AN[2].execute = T.execute - T.executeExercice - AN[0].execute - AN[1].execute;
  AN[6].prevu = T.budget - somme(AN.slice(0, 6), (a) => a.prevu); AN[6].execute = 0;
  /* les types de bailleurs : mêmes teintes que sur la fiche projet */
  const TEINTE_B = { 'Coopération bilatérale': 'lagune', 'Fonds européens': 'ocre', 'Collectivités': 'peche', 'Fondations': 'corail', 'Fonds propres': 'sable' };
  const BAILLEURS = (() => { const m = repartir(T.budget, D.bailleurs.map((b) => b.part)), pp = parts100(D.bailleurs.map((b) => b.part)); return D.bailleurs.map((b, i) => ({ ...b, montant: m[i], pct: pp[i], c: TEINTE_B[b.nom] || 'sable' })); })();
  /* les territoires : le classement du tableau de bord, plus la ligne des trois projets sans libellé publié (les trois autres pays d'intervention) */
  const TERR = (() => { const l = S.TERRITOIRES.map(([nom, total]) => { const code = Object.keys(D.pays).find((c) => D.pays[c] === nom), ps = D.projets.filter((p) => p.pays === code); return { nom, code, total, projets: ps, n: ps.length, execute: somme(ps, (p) => p.execute) }; });
    l.push({ nom: 'Autres pays', sous: 'Mali, Sénégal, Guinée-Bissau', code: 'AUTRES', groupe: true, total: somme(D.autres, (p) => p.total), projets: [], n: D.autres.length, execute: somme(D.autres, (p) => Math.round(p.total * p.taux)) });
    const pp = parts100(l.map((t) => t.total), 1); l.forEach((t, i) => { t.pct = pp[i]; }); return l; })();
  /* une empreinte par territoire : une boucle par année, tracée jusqu'à l'exécuté de ses projets */
  const cernesTerr = (ps) => { const cs = ps.map((p) => ({ p, c: M.cernesDe(p) })), a0 = Math.min(...cs.map((x) => x.c.annees[0])), a1 = Math.max(...cs.map((x) => x.c.annees[x.c.annees.length - 1])), out = [];
    for (let a = a0; a <= a1; a++) { let prevu = 0, exe = 0; cs.forEach(({ p, c }) => { const i = c.annees.indexOf(a); if (i < 0) return; const b = p.total * c.mois[i] / c.total; prevu += b; exe += b * c.cernes[i]; }); out.push(prevu ? exe / prevu : 0); }
    return out; };
  S.STATS = { annees: AN, bailleurs: BAILLEURS, territoires: TERR };

  const filtre = (t, v) => `<div class="djc-f"><span>${t}</span><b>${v}</b>${ico('bas')}</div>`;
  S.blocFiltresStats = (o = {}) => { const k = E(o.p);
    return `<section class="dj-c nuit grain nuit djc-fb">${M.empreinte({ cernes: [1, 1, 1, 1].map((v) => v * k), c: '#1A4541', piste: null, ep: 10 })}
      <div class="djc-fb-t">${ico('filtre')}<span>Vous lisez</span></div>
      <div class="djc-fb-f">${filtre('Exercice', 'Tous · 2022 à 2028')}${filtre('Pays', 'Tous · 8 pays')}${filtre('Bailleur', 'Tous les types')}${filtre('Statut', 'Signés · 12')}</div>
      <div class="djc-fb-r"><div>${lbl(`${D.synthese.projets} projets signés · 8 pays`)}<div class="dj-num">${M.nombre(T.budget * k)}<i>€</i></div></div></div></section>`; };
  S.blocAnnees = (o = {}) => { const k = E(o.p), an = AN.find((a) => a.encours), sous = (D.cumulPrevu[5] - T.executeExercice) / D.cumulPrevu[5];
    const cel = (f, cls = '') => AN.map((a) => `<span class="${cls}${a.encours ? ' c' : ''}">${f(a)}</span>`).join('');
    return carte('Par année', 'Prévu et exécuté, de 2022 à 2028', `
      <div class="djc-an-h">
        <div>${lbl(`Prévu en ${an.a}`)}<div class="dj-num">${M.nombre(an.prevu)}<i>€</i></div></div>
        <div>${lbl('Exécuté au 16 juin')}<div class="dj-num" style="color:${C.lagune}">${M.nombre(an.execute * k)}<i>€</i></div></div>
        <div class="djc-an-d"><span class="dj-delta neg">${ico('bas', 'style="width:12px;height:12px;stroke-width:2.6"')}${M.pct(sous, 1)}</span><span>sous le prorata<br>de l’exercice</span></div>
      </div>
      <div class="djc-an-g">${M.annees({ w: 610, h: 238, annees: AN, ep: 26, p: k })}</div>
      <div class="djc-an-t">
        <em>Prévu</em>${cel((a) => M.euro(a.prevu))}
        <em>Exécuté</em>${cel((a) => (a.execute ? M.euro(a.execute * k) : vide), 'x')}
        <em>Taux</em>${cel((a) => (a.execute ? M.pct((a.execute / a.prevu) * k) : vide), 't')}
      </div>`, { span: 8, droite: `<div class="dj-leg"><span><i style="--lc:${C.sable}"></i>Prévu</span><span><i style="--lc:${C.lagune}"></i>Exécuté</span><span><i style="--lc:${C.vermillon}"></i>Année en cours</span></div>` }); };
  S.blocBailleurs = (o = {}) => { const k = E(o.p), B = BAILLEURS, mx = Math.max(...B.map((b) => b.part)), inv = [...B].reverse();
    return carte('Par type de bailleur', `Cinq familles · une boucle par bailleur`, `
      <div class="djc-bl-e">${M.empreinte({ cernes: inv.map((b) => (b.part / mx) * k), c: inv.map((b) => C[b.c]), piste: 'rgba(42,30,23,.06)', taille: 172 })}
        <div>${lbl('Portefeuille')}<b>${pc(somme(B, (b) => b.pct))}</b><span>${M.euroK(T.budget)}</span></div></div>
      <div class="djc-bl">${B.map((b) => `<div><u style="--bc:${C[b.c]}"></u><span>${b.nom}</span><b>${M.nombre(b.montant * k)}<i>€</i></b><em>${pc(b.pct)}</em></div>`).join('')}</div>`, { span: 4 }); };
  const etiq = (x, y, nom, val, anc = 'start') => `<g text-anchor="${anc}" paint-order="stroke" stroke="${C.papier}" stroke-width="7" stroke-linejoin="round"><text x="${x}" y="${y}" font-family="Nunito, sans-serif" font-weight="800" font-size="23" letter-spacing="-.5" fill="${C.encre}">${nom}</text><text x="${x}" y="${y + 24}" font-family="Geist Mono, monospace" font-weight="500" font-size="16.5" fill="#6B5A4E">${val}</text></g>`;
  S.blocTerritoiresStats = (o = {}) => { const k = E(o.p), parNom = (n) => TERR.find((t) => t.nom === n), mx = parNom('Mauritanie').total, ke = 1.72;
    const pin = (ville, nom, c) => { const t = parNom(nom); return { ville, v: t.total / mx, cernes: cernesTerr(t.projets).map((v) => v * k), c: c || 'lagune' }; };
    const E1 = [pin('Sélibaby', 'Mauritanie', 'vermillon'), pin('Montreuil', 'France'), pin('Tunis', 'Tunisie'), pin('Conakry', 'Guinée'), pin('Alger', 'Algérie')];
    const val = (n) => M.euroK(parNom(n).total).replace(NB, ' ');
    const etiquettes = etiq(645, 22, 'France', val('France')) + etiq(128, 792, 'Mauritanie', val('Mauritanie'), 'end') + etiq(158, 1046, 'Guinée', val('Guinée'), 'end') + etiq(770, 462, 'Tunisie', val('Tunisie')) + etiq(585, 492, 'Algérie', val('Algérie'), 'middle');
    const carteT = M.carte({ cadre: [-128, -105, 1020, 1260], par: 'xMaxYMid slice', ke, terres: 'sable', filet: 'papier', villes: true, rVille: 4.2, cVille: 'ocre',
      pays: { MR: 'corail', FR: 'peche', TN: '#F6C98E', GN: '#F6C98E', DZ: '#F8DDB8', ML: '#F1DCC4', SN: '#F1DCC4', GW: '#F1DCC4' }, attrs: 'class="djc-terr-c"', epingles: E1 }).replace(/<\/svg>$/, etiquettes + '</svg>');
    const ligne = (t, i) => `<tr><td class="djc-rg">${t.groupe ? '' : i + 1}</td><td><b>${t.nom}${t.groupe ? ` · ${t.n} projets` : ''}</b><span class="djc-codes">${t.projets.length ? t.projets.map((p) => codeP(p.code)).join('') : `<em>${t.sous}</em>`}</span></td>
      <td class="d">${num(t.total)}<small>${pc(t.pct, 1)}</small></td>
      <td class="d"><div class="dj-ex">${M.jauge({ v: (t.execute / t.total) * k, w: 92, ep: 6, c: t.code === 'MR' ? 'vermillon' : 'emeraude' })}<b>${M.pct((t.execute / t.total) * k)}</b></div><small>${M.euro(t.execute * k)}</small></td></tr>`;
    const ici = parNom('France').total, multi = parNom('Multi-pays').total, labas = T.budget - ici - multi, P3 = parts100([ici, labas, multi]);
    const part = (nom, sous, v, pct, c) => `<div style="flex:${pct} 1 0"><i style="background:${c}"></i><b>${nom} · ${pc(pct)}</b><span>${sous}</span><em>${M.euro(v)}</em></div>`;
    return `<section class="dj-c pap djc-terr">${carteT}
      <div class="djc-terr-g">
        <div class="dj-ct"><div><h2>Par territoire</h2><p>Ici et là-bas : 8 pays, ${D.synthese.projets} projets, une empreinte par territoire</p></div></div>
        <table class="dj-t djc-terr-t"><colgroup><col style="width:26px"><col><col style="width:124px"><col style="width:168px"></colgroup>
          <thead><tr><th></th><th>Territoire</th><th class="d">Budget · part</th><th class="d">Exécuté</th></tr></thead>
          <tbody>${TERR.map(ligne).join('')}</tbody>
          <tfoot><tr><td></td><td><b>Portefeuille</b><span class="djc-codes"><em>${D.synthese.projets} projets signés</em></span></td><td class="d">${num(T.budget)}<small>${pc(somme(TERR, (t) => t.pct), 1)}</small></td>
            <td class="d"><div class="dj-ex">${M.jauge({ v: T.taux * k, w: 92, ep: 6, c: 'lagune' })}<b>${M.pct(T.taux * k)}</b></div><small>${M.euro(T.execute * k)}</small></td></tr></tfoot></table>
        <div class="djc-ici">${part('Ici', 'France', ici, P3[0], C.peche)}${part('Là-bas', 'Sept pays', labas, P3[1], C.corail)}${part('Les deux', 'Multi-pays', multi, P3[2], C.lagune)}</div>
      </div>
      <div class="djc-leg-c">${lbl('Légende')}
        <div><span class="djc-leg-t"><i style="background:#F1DCC4"></i><i style="background:#F8DDB8"></i><i style="background:#F6C98E"></i><i style="background:${C.peche}"></i><i style="background:${C.corail}"></i></span>Budget du territoire</div>
        <div>${M.empreinte({ cernes: [1, 0.6, 0.3], taille: 24, ep: 13 })}Une boucle par année, tracée jusqu’à l’exécuté</div>
        <div><u></u>Bureau du GRDR</div></div></section>`; };
  S.stats = (o = {}) => S.shell('stats', S.tete('Statistiques', `<span>Trois lectures du même portefeuille</span>${M.tampon(`Sage à jour · ${D.extraction.court}`)}`, btn('Imprimer', '', 'document') + btn('Exporter', 'p', 'export')) +
    `<div class="dj-g">${S.blocFiltresStats(o)}${S.blocAnnees(o)}${S.blocBailleurs(o)}${S.blocTerritoiresStats(o)}</div>`, coque(o));

  /* ====================== Journal ====================== */
  /* Les six types d'action. c : teinte de la pastille ; ci : teinte du pictogramme quand la pastille est claire */
  const TYPES = { creation: { n: 'Création', c: 'lagune', i: 'plus' }, modification: { n: 'Modification', c: 'ocre', i: 'crayon' }, suppression: { n: 'Suppression', c: 'vermillon', i: 'croix' },
    consultation: { n: 'Consultation', c: 'sable', ci: '#7A614D', i: 'oeil' }, export: { n: 'Export', c: 'peche', ci: '#8F5510', i: 'export' }, extraction: { n: 'Extraction', c: 'emeraude', ci: '#0A6247', i: 'sync' } };
  /* démo : deux jours de journal. Les cinq entrées du socle (DONNEES.journal) sont reprises telles quelles ; sept sont ajoutées. */
  const J0 = D.journal;
  S.JOURNAL = [
    { jour: 'Lundi 16 juin 2025', quand: 'Aujourd’hui', e: [
      { ...J0[0], t: 'extraction' },
      { ...J0[1], t: 'modification', ouvert: true },
      { h: '14:20', qui: 'Ibrahima B.', quoi: 'Consultation', sur: 'OICC', detail: 'Fiche projet, lignes budgétaires', t: 'consultation' },
      { ...J0[2], t: 'modification' },
      { ...J0[3], t: 'export' },
      { ...J0[4], t: 'modification' },
      { h: '09:12', qui: 'Mamadou S.', quoi: 'Consultation', sur: 'ECOS', detail: 'Fiche projet, depuis un téléphone', t: 'consultation' }] },
    { jour: 'Vendredi 13 juin 2025', quand: 'Il y a trois jours', e: [
      { h: '17:42', qui: 'Julien P.', quoi: 'Export', sur: null, detail: `Suivi budgétaire des ${D.synthese.projets} projets, en tableur`, t: 'export' },
      { h: '16:05', qui: 'Awa D.', quoi: 'Extraction Sage', sur: 'ECSI', detail: '88 écritures · exécuté mis à jour', t: 'extraction' },
      { h: '15:30', qui: 'Julien P.', quoi: 'Ligne supprimée', sur: 'ECOD', detail: 'Doublon « Frais de mission » · aucun montant exécuté', t: 'suppression' },
      { h: '11:26', qui: 'Sami K.', quoi: 'Consultation', sur: 'JPAT', detail: 'Fiche projet, budget par année', t: 'consultation' },
      { h: '10:14', qui: 'Julien P.', quoi: 'Ligne créée', sur: 'AMIS', detail: `Ateliers de sensibilisation : ${M.euro(24000)}`, t: 'creation' }] }];
  const JTOUT = S.JOURNAL.flatMap((j) => j.e);
  const pastille = (t, cls = '') => { const y = TYPES[t]; return `<span class="djc-j-i ${cls}" style="--jc:${C[y.c]};--ji:${y.ci || C[y.c]}">${ico(y.i)}</span>`; };
  const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
  S.blocFiltresJournal = () => { const cpt = (t) => JTOUT.filter((e) => e.t === t).length, qui = [...new Set(JTOUT.map((e) => e.qui))];
    return `<div class="djc-jf"><span class="djc-jf-c on">Toutes<i>${JTOUT.length}</i></span>${Object.keys(TYPES).map((t) => `<span class="djc-jf-c"><u style="background:${C[TYPES[t].c]}"></u>${TYPES[t].n}<i>${cpt(t)}</i></span>`).join('')}
      <span class="djc-jf-q">${avs(qui.slice(0, 4), qui.length - 4)}<b>Toutes les personnes</b>${ico('bas')}</span></div>`; };
  const AVANT = 84000, APRES = 91500, TOTAL_OICC = projet('OICC').total;
  const diff = (e, k) => { const qui = D.personnes.find((p) => p.nom === e.qui);
    return `<div class="djc-j-d">
      <div class="djc-j-dt"><div>${lbl('Ligne budgétaire · OICC-GN-24 · RH')}<b>Animation territoriale</b></div>${chip('Avant · après', 'lag', false)}</div>
      <table class="dj-t djc-diff"><colgroup><col><col style="width:118px"><col style="width:34px"><col style="width:118px"><col style="width:92px"></colgroup>
        <thead><tr><th>Champ modifié</th><th class="d">Avant</th><th></th><th class="d">Après</th><th class="d">Écart</th></tr></thead>
        <tbody><tr><td>Prévisionnel de la ligne</td><td class="d"><s>${M.euro(AVANT)}</s></td><td class="f">${ico('fleche')}</td><td class="d">${num(AVANT + (APRES - AVANT) * k)}</td><td class="d"><em>+${NB}${M.euro(APRES - AVANT)}</em></td></tr>
          <tr><td>Total des lignes du projet</td><td class="d"><s>${M.euro(TOTAL_OICC - (APRES - AVANT))}</s></td><td class="f">${ico('fleche')}</td><td class="d">${num(TOTAL_OICC - (APRES - AVANT) * (1 - k))}</td><td class="d"><em>+${NB}${M.euro(APRES - AVANT)}</em></td></tr></tbody></table>
      <div class="djc-j-m">
        <div>${lbl('Qui')}<p>${av(e.qui, 's')}<span><b>${e.qui}</b>${qui ? qui.role : ''}</span></p></div>
        <div>${lbl('Quand')}<p><span><b>Lundi 16 juin 2025</b>à 14 h 52</span></p></div>
        <div>${lbl('Contrôle')}<p>${chip('Égal au budget signé', 'ok')}</p></div>
      </div>
      <div class="djc-j-a">${btn('Voir la ligne', 's', 'hd')}${btn('Rétablir l’ancienne valeur', 's', 'journal')}</div></div>`; };
  const entree = (e, k) => `<div class="djc-j${e.ouvert ? ' o' : ''}"><time>${e.h}</time>${pastille(e.t)}<div class="djc-j-c"><b>${e.quoi}</b><span>${e.detail}</span></div>
      <div class="djc-j-p">${e.sur ? codeP(e.sur) : `<span class="code" style="--cc:${C.encre}">TOUS</span>`}</div><div class="djc-j-q">${av(e.qui, 's')}<span>${e.qui}</span></div>${ico(e.ouvert ? 'haut' : 'bas')}${e.ouvert ? diff(e, k) : ''}</div>`;
  S.blocFrise = (o = {}) => { const k = E(o.p), qui = new Set(JTOUT.map((e) => e.qui)).size;
    return carte('Frise des actions', `${pluriel(JTOUT.length, 'action')} sur deux jours · ${qui} personnes · de la plus récente à la plus ancienne`,
      S.JOURNAL.map((j) => `<div class="djc-j-jour"><b>${j.jour}</b><span>${j.quand} · ${pluriel(j.e.length, 'action')}</span></div><div class="djc-jl">${j.e.map((e) => entree(e, k)).join('')}</div>`).join('') +
      `<div class="djc-j-fin">${ico('journal')}<span>Le journal remonte au premier jour de l’outil. Aucune entrée ne peut être modifiée ni effacée.</span><span class="dj-lien">Jours précédents ${ico('fleche', 'style="width:14px;height:14px"')}</span></div>`,
      { span: 8, droite: `<span class="dj-pil">${ico('calendrier')}13 → 16 juin 2025${ico('bas')}</span>` }); };
  const VERSIONS = [['16 juin', '02:00', 'Automatique', 1], ['15 juin', '02:00', 'Automatique'], ['14 juin', '02:00', 'Automatique'], ['13 juin', '18:04', 'Manuelle · Awa D.'], ['13 juin', '02:00', 'Automatique']];
  S.blocSauvegardes = (o = {}) => { const k = E(o.p), auj = S.JOURNAL[0].e.length;
    return `<section class="dj-c nuit grain nuit djc-sv">${M.empreinte({ cernes: [1, 1, 1, 1, k], c: '#1D4A47', piste: null })}
      <div class="dj-ct"><div><h2>Sauvegardes</h2><p>Une version complète chaque nuit</p></div><div class="dj-ct-d">${chip('À jour', 'ok')}</div></div>
      ${lbl('Dernière sauvegarde automatique')}
      <div class="djc-sv-h"><div class="dj-num">02:00</div><span>cette nuit,<br>lundi 16 juin 2025</span></div>
      <div class="djc-sv-c"><div><b>${Math.round(D.synthese.projets * k)}</b>projets</div><div><b>${Math.round(D.synthese.salaries * k)}</b>salariés</div><div><b>${Math.round(D.synthese.comptes * k)}</b>comptes</div></div>
      <p class="djc-sv-n">${pluriel(auj, 'action')} depuis cette version : toutes sont au journal.</p>
      <div class="djc-sv-t">${lbl('Historique des versions')}<span>${VERSIONS.length} dernières</span></div>
      <div class="djc-sv-l">${VERSIONS.map(([j, h, t, a]) => `<div class="${a ? 'a' : ''}"><u></u><time>${j} · ${h}</time><span>${t}</span>${a ? `<em>Actuelle</em>` : ico('droite')}</div>`).join('')}</div>
      <div class="djc-sv-b">${btn('Sauvegarder maintenant', 'clair', 'sync')}</div>
      <blockquote>${M.PHRASES.journal}</blockquote></section>`; };
  S.blocQui = (o = {}) => { const k = E(o.p), noms = [...new Set(JTOUT.map((e) => e.qui))].map((n) => [n, JTOUT.filter((e) => e.qui === n)]).sort((a, b) => b[1].length - a[1].length), mx = noms[0][1].length;
    return carte('Par personne', `${noms.length} personnes ont agi ou consulté`, `<div class="djc-qui">${noms.map(([n, es]) => { const p = D.personnes.find((x) => x.nom === n); return `<div>${av(n)}<div><b>${n}</b><span>${p ? p.role : ''}</span></div><span class="djc-qui-t">${[...new Set(es.map((e) => e.t))].map((t) => `<u style="background:${C[TYPES[t].c]}" title="${TYPES[t].n}"></u>`).join('')}</span><em>${Math.round(es.length * k)}${M.jauge({ v: (es.length / mx) * k, w: 54, ep: 5, c: 'lagune' })}</em></div>`; }).join('')}</div>`, { span: 12 }); };
  S.journal = (o = {}) => S.shell('journal', S.tete('Journal', `<span>Qui a fait quoi, et quand</span>${M.tampon(`Dernière action · ${D.extraction.court}`)}`, btn('Exporter le journal', '', 'export')) + S.blocFiltresJournal(o) +
    `<div class="dj-g">${S.blocFrise(o)}<div class="dj-col dj-g" style="grid-column:span 4">${S.blocSauvegardes(o)}${S.blocQui(o)}</div></div>`, coque(o));

  /* ====================== Administration ====================== */
  const SY = D.synthese;
  const ROLES = [{ id: 'admin', n: 'Administrateur', pl: 'Administrateurs', nb: SY.admins, c: C.nuit }, { id: 'gest', n: 'Gestionnaire', pl: 'Gestionnaires financiers', nb: SY.gestionnaires, c: C.lagune },
    { id: 'chef', n: 'Chef de projet', pl: 'Chefs de projet', nb: SY.chefs, c: C.ocre }, { id: 'n1', n: 'N+1', pl: 'N+1', nb: SY.n1, c: C.peche }];
  /* démo : la matrice. T : tous les projets · S : ses projets · N : non · C : tous les comptes */
  const PERMS = [['oeil', 'Voir les projets', 'TTSS'], ['crayon', 'Modifier un budget', 'TTNN'], ['gens', 'Affecter des personnes', 'TTNS'], ['sync', 'Extraire depuis Sage', 'TTNN'], ['export', 'Exporter', 'TTSS'], ['admin', 'Gérer les comptes', 'CNNN'], ['journal', 'Consulter le journal', 'TTSN']];
  const niveau = (x) => (x === 'T' ? `<span class="djc-niv t">${ico('coche')}Tous les projets</span>` : x === 'C' ? `<span class="djc-niv t">${ico('coche')}Tous les comptes</span>` : x === 'S' ? `<span class="djc-niv s"><u></u>Ses projets</span>` : `<span class="djc-niv n"><u></u>Non</span>`);
  /* démo : dix des dix-sept comptes, du plus récemment connecté au plus ancien (cohérent avec le journal) */
  const MOI_ADMIN = { nom: 'Nadia B.', role: 'Administratrice' };
  const COMPTES = [
    { nom: 'Nadia B.', sous: 'Direction administrative · Montreuil', r: 'admin', lib: 'Administratrice', per: 'tous', vu: 'En ligne', en: true, vous: true },
    { nom: 'Julien P.', r: 'gest', lib: 'Gestionnaire financier', per: 'tous', vu: 'Aujourd’hui, 14:47' },
    { nom: 'Ibrahima B.', r: 'chef', lib: 'Chef de projet', per: ['OICC'], vu: 'Aujourd’hui, 14:18' },
    { nom: 'Claire M.', r: 'chef', lib: 'Cheffe de projet', per: ['DEAR', 'ECOS'], vu: 'Aujourd’hui, 10:28' },
    { nom: 'Awa D.', r: 'gest', lib: 'Gestionnaire financière', per: 'tous', vu: 'Aujourd’hui, 09:44' },
    { nom: 'Mamadou S.', r: 'chef', lib: 'Chef de projet', per: ['ECOS', 'DEAR', 'HWCL'], vu: 'Aujourd’hui, 09:10', note: 'sur téléphone' },
    { nom: 'Sami K.', r: 'chef', lib: 'Chef de projet', per: ['JPAT', 'PDLD'], vu: 'Vendredi 13 juin, 11:24' },
    { nom: 'Léa R.', r: 'n1', lib: 'N+1', per: ['ECSI', 'AMIS', 'JPAT'], vu: 'Jeudi 12 juin, 16:02' },
    { nom: 'Fatou N.', r: 'n1', lib: 'N+1', per: ['ECOD'], vu: 'Mercredi 11 juin, 09:37' },
    { nom: 'Aminata C.', r: 'n1', lib: 'N+1', per: ['HWCL'], vu: 'Jamais connectée', note: 'invitation envoyée ce matin', off: true }];
  S.COMPTES = COMPTES;
  const role = (r, lib) => { const R = ROLES.find((x) => x.id === r); return `<span class="djc-role ${r}"><u style="background:${R.c}"></u>${lib || R.n}</span>`; };
  S.blocMatrice = () => carte('Permissions par rôle', 'Sept actions, quatre rôles, trois niveaux', `<table class="dj-t djc-mx"><colgroup><col><col style="width:146px"><col style="width:146px"><col style="width:146px"><col style="width:146px"></colgroup>
      <thead><tr><th>Action</th>${ROLES.map((r) => `<th><b><u style="background:${r.c}"></u>${r.n}</b><span>${r.nb} comptes</span></th>`).join('')}</tr></thead>
      <tbody>${PERMS.map(([i, t, n]) => `<tr><td><div class="djc-mx-a"><span>${ico(i)}</span><b>${t}</b></div></td>${[...n].map((x) => `<td>${niveau(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <div class="djc-mx-l"><span>${niveau('T')}les ${SY.projets} projets signés</span><span>${niveau('S')}ceux où la personne est affectée</span><span>${niveau('N')}l’action n’apparaît pas à l’écran</span></div>`,
    { span: 9, droite: btn('Modifier', 's', 'crayon') });
  S.blocRoles = (o = {}) => { const k = E(o.p);
    return `<section class="dj-c nuit grain nuit djc-rl">${M.empreinte({ cernes: [0.21, 0.21, 0.86, 1].map((v) => v * k), c: '#1F4F4B', piste: '#17403D', actif: 3, cActif: 'miel', ep: 10 })}
      ${lbl('Comptes')}<div class="dj-num">${Math.round(SY.comptes * k)}</div><p class="djc-rl-s">comptes, quatre rôles</p>
      <div class="djc-rl-l">${ROLES.map((r) => `<div><b>${Math.round(r.nb * k)}</b><span>${r.pl}</span>${M.jauge({ v: (r.nb / SY.comptes) * k, w: 170, ep: 5, c: 'miel', piste: 'rgba(255,251,246,.14)' })}</div>`).join('')}</div>
      <blockquote>${M.PHRASES.roles}</blockquote></section>`; };
  S.blocComptes = () => { const perso = (c) => { const p = D.personnes.find((x) => x.nom === c.nom); return c.sous || (p ? `${p.poste} · ${p.site}` : ''); };
    const per = (c) => (c.per === 'tous' ? `<span class="djc-tous">${ico('coche')}Tous les projets<i>${SY.projets}</i></span>` : `<span class="djc-codes">${c.per.map(codeP).join('')}</span>`);
    return carte('Comptes', `${COMPTES.length} comptes sur ${SY.comptes}, du plus récemment connecté au plus ancien`, `<table class="dj-t djc-cp"><colgroup><col><col style="width:196px"><col style="width:212px"><col style="width:184px"><col style="width:68px"><col style="width:36px"></colgroup>
      <thead><tr><th>Personne</th><th>Rôle</th><th>Périmètre</th><th>Dernière connexion</th><th class="d">Actif</th><th></th></tr></thead>
      <tbody>${COMPTES.map((c) => `<tr${c.off ? ' class="off"' : ''}><td><div class="djc-cp-p">${av(c.nom)}<div><b>${c.nom}${c.vous ? chip('Vous', 'lag', false) : ''}</b><span>${perso(c)}</span></div></div></td><td>${role(c.r, c.lib)}</td><td>${per(c)}</td>
        <td><div class="djc-cp-v${c.en ? ' en' : ''}"><u></u><b>${c.vu}</b>${c.note ? `<span>${c.note}</span>` : ''}</div></td><td class="d"><span class="djc-sw${c.off ? '' : ' on'}"><u></u></span></td><td class="d">${ico('points', `style="color:var(--dj-pale)"`)}</td></tr>`).join('')}</tbody></table>
      <div class="djc-cp-f"><span>${SY.comptes - COMPTES.length} autres comptes : 3 administrateurs, 3 gestionnaires financiers, 1 N+1</span><span class="dj-lien">Voir les ${SY.comptes} comptes ${ico('fleche', 'style="width:14px;height:14px"')}</span></div>`,
      { span: 12, droite: `<span class="dj-seg"><span class="on">Tous · ${SY.comptes}</span>${ROLES.map((r) => `<span>${r.pl} · ${r.nb}</span>`).join('')}</span>` }); };
  S.admin = (o = {}) => S.shell('admin', S.tete('Administration', `<span>Comptes et permissions</span>${M.tampon(`${SY.comptes} comptes · 4 rôles`, 'lagune')}`, btn('Exporter la liste', '', 'export') + btn('Nouveau compte', 'p', 'plus')) +
    `<div class="dj-g">${S.blocMatrice(o)}${S.blocRoles(o)}${S.blocComptes(o)}</div>`, coque(o, { moi: MOI_ADMIN }));

  /* ====================== Connexion (sans la coque) ====================== */
  /* démo : adresse sur le domaine grdr.org, prénom et nom banals */
  S.connexion = (o = {}) => { const k = E(o.p);
    const carteC = M.carte({ cadre: [-478, -150, 1300, 1640], par: 'xMaxYMid slice', ke: 2.05, terres: 'rgba(255,251,246,.34)', filet: 'rgba(241,136,115,.55)',
      pays: Object.fromEntries(['FR', 'ML', 'MR', 'SN', 'GN', 'GW', 'TN', 'DZ'].map((c) => [c, 'rgba(255,251,246,.9)'])), attrs: 'class="djc-cx-c"',
      epingles: [{ ville: 'Sélibaby', v: 1, cernes: [1, 1, 0.76].map((v) => v * k), c: 'vermillon', piste: 'sable' }, { ville: 'Montreuil', v: 0.8, cernes: [1, 0.6, 0.36].map((v) => v * k), piste: 'sable' }, { ville: 'Tunis', v: 0.4, cernes: [1, 0.33].map((v) => v * k), piste: 'sable' }, { ville: 'Conakry', v: 0.4, cernes: [1, 0.63].map((v) => v * k), piste: 'sable' }, { ville: 'Alger', v: 0.25, cernes: [0.6, 0.19].map((v) => v * k), piste: 'sable' }] });
    return `<div class="dj djc-cx" style="height:${o.h || 900}px">
      <div class="djc-cx-g">
        <div class="djc-cx-logo">${M.lockup()}</div>
        <div class="djc-cx-f">
          <div class="djc-cx-p">${M.icone(54)}<div><b>${M.PRODUIT}</b><span>${M.PRODUIT_DESC}</span></div></div>
          <h1>Bonjour.</h1>
          <p class="djc-cx-s">Connectez-vous avec votre adresse du GRDR pour retrouver vos projets.</p>
          <div class="dj-champ">Adresse e-mail<div>${ico('personne')}prenom.nom@grdr.org<i>${ico('coche', `style="color:${C.emeraude}"`)}</i></div></div>
          <div class="dj-champ">Mot de passe<div class="foc">${ico('cadenas')}<span class="djc-cx-mdp">${'<u></u>'.repeat(12)}<em></em></span><i>${ico('oeil')}</i></div></div>
          <div class="djc-cx-o"><span><u>${ico('coche')}</u>Garder ma session sur cet appareil</span><span class="dj-lien">Mot de passe oublié</span></div>
          ${btn(`Se connecter${ico('fleche')}`, 'p djc-cx-b')}
          <p class="djc-cx-n">${ico('journal')}<span>Chaque connexion est inscrite au journal.</span></p>
        </div>
        <div class="djc-cx-pied"><span>Pas encore de compte ? Demandez-le à votre administrateur.</span><span class="t-mono">${M.DOMAINE}</span></div>
      </div>
      <div class="djc-cx-d">${M.aquarelle('aube', { cls: 'djc-cx-aq grain', pos: '50% 40%', html: `${carteC}
        <div class="djc-cx-h net"><span>${M.TRIPTYQUE.join(' ')}</span><span class="t-mono">${D.synthese.projets} projets · 8 pays · 0 ressaisie</span></div>
        <div class="djc-cx-t net"><span class="t-cap">${M.SIGNATURE}</span><h2>Le budget de<br>chaque projet,<br>à l’euro près.</h2></div>` })}</div></div>`; };

  /* ====================== Téléphone ====================== */
  /* Le chef de projet d'ECOS, en lecture seule. démo : ses deux autres projets (affectations), cohérents avec son périmètre côté administration. */
  const ECOS = D.projets[0], CHEF = D.personnes.find((p) => p.nom === ECOS.chef), AUTRES_M = ['HWCL', 'DEAR'].map(projet);
  const CATS = F.lignes.map(([nom, cc, ls]) => ({ nom, cc, n: ls.length, prevu: somme(ls, (l) => l[1]), execute: somme(ls, (l) => l[2]) }));
  const empNuit = (k, attrs = '') => M.empreinte({ cernes: F.annees.map((a) => (a.execute / a.prevu) * k), c: '#9FD3C4', piste: '#1D4A47', actif: 3, cActif: 'miel', attrs });
  const mNav = (retour, titre, droite = '') => `<div class="djc-m-nav"><span>${ico('gauche')}${retour}</span><b>${titre}</b><span class="d">${droite}</span></div>`;

  S.mAccueil = (o = {}) => { const k = E(o.p), p = ECOS, prenom = CHEF.nom.split(' ')[0], al = S.ALERTES[0];
    return S.mobile(`
      <div class="djc-m-top"><div>${av(CHEF.nom)}<div><span>Lundi 16 juin ${D.exercice}</span><b>Bonjour ${prenom}</b></div></div><span class="dj-rond">${ico('cloche')}<u></u></span></div>
      <section class="dj-c nuit grain nuit djc-m-hero">${empNuit(k)}
        <div class="djc-m-ch"><span class="code" style="--cc:${C.miel}">${p.code}</span><span class="dj-chip nuit">${ico('oeil')}Lecture seule</span></div>
        <h2>${p.titre.replace(' ', '<br>')}</h2>
        <p>${D.pays[p.pays]} · ${S.moisLong(p.debut)} → ${S.moisLong(p.fin)}</p>
        <div class="djc-m-pc"><div class="dj-num">${Math.round(p.taux * 100 * k)}<i>%</i></div><span>exécuté<br>${M.pct(S.ecoule(p))} du temps écoulé</span></div>
        ${M.jauge({ v: p.taux * k, repere: S.ecoule(p), w: 314, ep: 7, c: 'miel', piste: 'rgba(255,251,246,.14)', cRepere: 'blanc' })}
        <div class="djc-m-3"><div>${lbl('Budget')}${num(p.total)}</div><div>${lbl('Exécuté')}${num(p.execute * k, '', `color:${C.miel}`)}</div><div>${lbl('Reste')}${num(p.total - p.execute * k)}</div></div>
      </section>
      <div class="dj-al djc-m-al"><div class="v"><span class="dj-al-i">${ico(al.i)}</span><div><b>${al.t}</b><span>${al.s}</span></div>${ico('droite', `style="color:var(--dj-pale)"`)}</div></div>
      <div class="djc-m-st"><b>Vos autres projets</b><span>${AUTRES_M.length} affectations</span></div>
      <div class="djc-m-l">${AUTRES_M.map((q) => `<div>${S.emp(q, { p: o.p })}<div><b>${q.titre}</b><span>${M.code(q.code)}${D.pays[q.pays]}</span></div><em>${M.pct(q.taux * k)}${M.jauge({ v: q.taux * k, repere: S.ecoule(q), w: 56, ep: 5, c: 'emeraude' })}</em></div>`).join('')}</div>`, { actif: 0, heure: '9:41', ...o }); };

  S.mProjet = (o = {}) => { const k = E(o.p), p = ECOS;
    return S.mobile(`${mNav('Projets', '', ico('points'))}
      <div class="djc-m-pt">${M.empreinte({ cernes: F.annees.map((a) => (a.execute / a.prevu) * k), actif: 3, taille: 96 })}
        <div><div class="djc-m-ch">${M.code(p.code, 'vermillon')}${statut('Signé')}<span class="dj-chip">${ico('oeil')}Lecture</span></div><h2>${p.titre}</h2><p>${D.pays[p.pays]} · ${S.mmaa(p.debut)} → ${S.mmaa(p.fin)} · 48 mois</p></div></div>
      <div class="djc-m-ex"><div>${lbl(`Exécuté · ${M.pct(p.taux * k, 1)}`)}${num(p.execute * k, '', `color:${C.lagune}`)}</div><div>${lbl('Reste à exécuter')}${num(p.total - p.execute * k)}</div>
        ${M.jauge({ v: p.taux * k, repere: S.ecoule(p), w: 354, ep: 7, c: 'vermillon' })}</div>
      <section class="dj-c djc-m-c"><div class="djc-m-ct"><b>Budget par année</b><span><i style="background:${C.sable}"></i>Prévu<i style="background:${C.lagune}"></i>Exécuté</span></div>
        ${M.annees({ w: 320, h: 118, annees: F.annees, ep: 16, p: k })}</section>
      <section class="dj-c djc-m-c"><div class="djc-m-ct"><b>Lignes budgétaires</b><span>${somme(CATS, (c) => c.n)} lignes · ${CATS.length} catégories</span></div>
        <div class="djc-m-cat">${CATS.map((c) => `<div>${ico('droite')}<b>${c.nom}</b>${M.jauge({ v: (c.execute / c.prevu) * k, w: 56, ep: 6, c: 'emeraude' })}<em>${M.pct((c.execute / c.prevu) * k)}</em><span>${pluriel(c.n, 'ligne')} · reste ${M.euro(c.prevu - c.execute * k)}</span></div>`).join('')}</div></section>
      <div class="djc-m-sage grain nuit">${M.tampon('Sage · à jour')}<div><b>${D.extraction.date}, ${D.extraction.heure}</b><span>${Math.round(214 * k)} écritures · par ${D.extraction.par}</span></div></div>`, { actif: 1, heure: '9:41', cls: 'djc-serre', ...o }); };

  /* démo : la courbe d'ECOS, par demi-mois sur 48 mois. Attendu : le prorata du temps (la même règle que le repère des jauges).
     Exécuté : passe par les totaux de fin d'année de la fiche (588 400, 1 359 700, 2 102 340) et par l'exécuté du 16 juin. */
  const COURBE_ECOS = (() => { const N = 96, auj = Math.round(S.ecoule(ECOS) * N), cum = F.annees.reduce((a, x) => [...a, (a[a.length - 1] || 0) + x.execute], []);
    const jal = [[0, 0], [20, cum[0]], [44, cum[1]], [68, cum[2]], [auj, cum[3]]];
    const exe = (i) => { for (let j = 1; j < jal.length; j++) if (i <= jal[j][0]) { const [a, va] = jal[j - 1], [b, vb] = jal[j]; return va + (vb - va) * (i - a) / (b - a); } return cum[3]; };
    const labels = Array(N + 1).fill(''); [[0, '03/22'], [20, '01/23'], [44, '01/24'], [68, '01/25'], [96, '02/26']].forEach(([i, t]) => { labels[i] = t; });
    return { attendu: Array.from({ length: N + 1 }, (_, i) => (ECOS.total * i) / N), execute: Array.from({ length: auj + 1 }, (_, i) => exe(i)), labels }; })();
  S.mAlerte = (o = {}) => { const k = E(o.p), p = ECOS, reste = p.total - p.execute, pk = o.p == null ? 1 : o.p;
    return S.mobile(`${mNav('Alertes', 'À surveiller', ico('points'))}
      ${M.aquarelle('aube', { cls: 'djc-m-aq', pos: '30% 30%', html: `${M.filigrane({ c: 'blanc', op: 0.5, style: 'right:-58px;top:-70px;width:200px;height:270px' })}
        <div class="djc-m-ch">${M.code(p.code, 'encre')}<span class="dj-chip">${ico('horloge')}Fin en ${S.moisLong(p.fin)}</span></div>
        <h2>${p.code} se termine dans 8 mois</h2>
        <div class="dj-num">${M.nombre(p.total - p.execute * k)}<i>€</i></div>
        <p>restent à exécuter, sur ${M.euro(p.total)}</p>` })}
      <section class="dj-c djc-m-c"><div class="djc-m-ct"><b>Exécuté et attendu</b><span><i style="background:${C.lagune}"></i>Exécuté<i class="t" style="color:${C.ocre}"></i>Prorata</span></div>
        ${M.courbe({ w: 322, h: 138, labels: COURBE_ECOS.labels, max: 3200000, marge: [8, 20, 22, 57], series: [{ v: COURBE_ECOS.attendu, c: 'ocre', ep: 2, tirets: '1.5 6' }, { v: COURBE_ECOS.execute, c: 'lagune', ep: 3.2, echos: 5, pasEcho: 8 }], point: 1, p: pk, id: 'djcal' })}
        <div class="djc-m-cn"><span><b>${M.pct(p.taux * k, 1)}</b> exécuté</span><span><b>${M.pct(S.ecoule(p))}</b> du temps écoulé</span></div></section>
      <section class="dj-c djc-m-c"><div class="djc-m-ct"><b>Ce qu’il reste, par catégorie</b><span>${M.euro(reste)}</span></div>
        <div class="djc-m-r">${CATS.map((c) => `<div><b>${c.nom}</b>${M.jauge({ v: (c.execute / c.prevu) * k, w: 64, ep: 6, c: 'emeraude' })}${num(c.prevu - c.execute * k)}</div>`).join('')}</div></section>
      ${btn('Partager le suivi', 'p djc-m-b', 'lien')}`, { actif: 2, heure: '9:41', ...o }); };
})();
