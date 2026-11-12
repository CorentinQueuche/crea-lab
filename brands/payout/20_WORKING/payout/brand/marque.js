/* SOCLE DE MARQUE — Payout, le copilote des freelances (proposition KLYRA, 2026). Marque sombre, un seul vert électrique.
   C'est le seul fichier, avec marque.css, qui définit la marque. Planches, vidéos, scènes 3D, présentation et site le lisent.
   Usage dans une page : <script src="../brand/marque.js"></script> puis Marque.wordmark('#36FF72'), Marque.jauge({ forme: 'blocs' }),
   Marque.phone(Marque.screens.solde()), Marque.laptop(Marque.desk.bord(), .6) … Tout renvoie une chaîne HTML.
   Marque.seekJauge(t) anime toutes les jauges marquées { anim: true } de la page (t en secondes, déterministe, sans horloge).

   CONTRAT (ce que les outils du skill attendent, quelle que soit la marque) :
     Marque.NOM, Marque.SLUG                    nom affiché, nom de fichier
     Marque.LOGO      { box:[x,y,l,h], xHeight, baseline, symbolBox:[x,y,l,h], symbolBaseline }
     Marque.LOCKUP    { lines:[…], x, size, baselines:[…], tracking, box:[x,y,l,h] }   descripteur à droite du logotype
     Marque.FONTS     { nom, variable, graisses:{Nom:valeur}, logo:'Medium', chiffres:{…} }
     Marque.COULEURS_LOGO { nom: '#hex', … }    une série de fichiers logo par couleur
     Marque.wordPath(), Marque.symbolPath()     tracés SVG (attribut d), remplis en evenodd
     Marque.wordmark(c, attrs), Marque.symbol(c, attrs), Marque.lockup(c, attrs)     SVG complets
     Marque.foot(a, b, couleur), Marque.contraste(a, b)

   PROPRE À PAYOUT :
     Marque.COULEURS, Marque.ECHELLE (Net 50 à 900), Marque.PART {avant:54, apres:85}, Marque.DONNEES (mêmes comptes, montants et dates partout)
     Marque.CONSTRUCTION, Marque.LETTRES, Marque.letterX(i), Marque.letterPath(ch, ox, pct), Marque.letterParts(ch), Marque.symbolParts(pct)
     Marque.symbolPath(pct), Marque.wordPath(pct)       le P-jauge à n'importe quel remplissage (54, 85…)
     LA JAUGE   Marque.jauge({ forme: 'segments' | 'blocs' | 'escalier' | 'barre' | 'anneau', p, … }), Marque.setJauge(el, p),
                Marque.pJauge(t, opts), Marque.seekJauge(t, opts), Marque.majJauge(p, racine), Marque.colonnes(données, opts), Marque.passage(opts)
     LES MOTIFS Marque.bandes(opts), Marque.damier(opts), Marque.halo(position), Marque.recette(étape, motif)
     GABARITS   Marque.entete(colonnes), Marque.section({titre, phrase, actif}), Marque.onglets(liste, actif), Marque.pilule(texte, actif),
                Marque.tuile(html, {ton, lbl}), Marque.bicolore(html)
     Marque.decompte(opts), Marque.cra(opts), Marque.icone(taille, ton), Marque.lockupV(c, attrs), Marque.ncard(titre, texte, opts)
     Marque.phone(écran, k), Marque.browser(écran, k, {url, h, clair}), Marque.laptop(écran, k, {url, clair})
     Marque.screens.{solde, cra, cashouts, simulateur}({clair})          téléphone, 390 × 844
     Marque.desk.{bord, cashouts, cra, site, sitePage}({clair})          ordinateur, 1440 × 900 (sitePage : 1440 × Marque.desk.SITE_H)
     Marque.icon(nom, couleur, taille), Marque.ICONES, Marque.fleche(c), Marque.eur(n, décimales, signe), Marque.eurH(…), Marque.pc(n), Marque.pcH(n) */
(function () {
  const A = {};
  A.NOM = 'Payout';
  A.SLUG = 'payout';
  A.COULEURS = { coffre: '#060A08', ardoise: '#101713', acier: '#7B8782', releve: '#EEF1F2', blanc: '#FFFFFF', net: '#36FF72', preleve: '#FF5B35' };
  A.ECHELLE = { 50: '#EDFFF3', 100: '#D1FFDF', 200: '#A3FFBF', 300: '#75FF9F', 400: '#52FF86', 500: '#36FF72', 600: '#0DD34C', 700: '#0B983A', 800: '#0A662A', 900: '#08371A' };
  const C = A.COULEURS;
  A.PART = { avant: 54, apres: 85 };
  const r2 = (n) => Math.round(n * 100) / 100;
  const NB = ' ';
  /* Espace insécable (U+00A0), à mettre avant « : », « ; », « % », « € » et dans les nombres. Dans un innerHTML, '&nbsp;' fait la même chose. */
  A.NB = NB;
  /* Prélevé du thème clair : foncé pour tenir l'AA en petit texte (5,5 sur Relevé, 6,3 sur Blanc, 4,8 dans sa pastille). Variable CSS --t-due dans .clair. */
  A.PRELEVE_CLAIR = '#B03417';
  const SUR = '#F3F6F4';   // texte posé sur le Coffre
  const SUR_NET = '#04140A'; // texte posé sur le Net

  /* ---------- Logo. Règle : un seul anneau (diamètre 100, graisse 26) et un seul fût (26) ; chaque lettre est faite de l'anneau,
     entier ou coupé, et du fût. Le P garde 85 % de l'anneau : 306° dans le sens horaire à partir de midi, ouvert de 54° (les 15 % qui partent).
     Repère : hauteur d'x 100, ligne de base y = 100, capitale et descendante 40, ascendante du t 30. ---------- */
  const R = 50, S = 26, r = R - S, LEG = 90, T_TOP = -30;
  const XI = Math.sqrt(R * R - r * r);                       // 43,86 : où le bord du fût (tangent au cercle intérieur) coupe le cercle extérieur
  const A_CROSS = 180 + (Math.asin(r / R) * 180) / Math.PI;  // 208,69° : angle d'horloge de ce point
  const pt = (cx, cy, rho, a) => [cx + rho * Math.sin((a * Math.PI) / 180), cy - rho * Math.cos((a * Math.PI) / 180)]; // a : angle d'horloge, 0 = midi
  const f = (p) => `${r2(p[0])},${r2(p[1])}`;
  const ring = (cx, cy) => `M${cx},${cy - r} A${r},${r} 0 1 0 ${cx},${cy + r} A${r},${r} 0 1 0 ${cx},${cy - r} Z`;
  /* Secteur d'anneau fermé, de l'angle a0 à l'angle a1 (horloge) */
  const bande = (cx, cy, a0, a1) => {
    if (a1 - a0 >= 359.9) return `M${cx},${cy - R} A${R},${R} 0 1 1 ${cx},${cy + R} A${R},${R} 0 1 1 ${cx},${cy - R} Z ` + ring(cx, cy);
    const big = a1 - a0 > 180 ? 1 : 0;
    return `M${f(pt(cx, cy, R, a0))} A${R},${R} 0 ${big} 1 ${f(pt(cx, cy, R, a1))} L${f(pt(cx, cy, r, a1))} A${r},${r} 0 ${big} 0 ${f(pt(cx, cy, r, a0))} Z`;
  };
  /* Le P-jauge : anneau rempli à pct % depuis midi, fût tangent à gauche. ox : bord gauche, cy : centre de l'anneau. */
  const pPath = (pct = 85, ox = 0, cy = 50) => {
    const cx = ox + R, a = Math.max(0, Math.min(100, pct)) * 3.6, bas = cy + LEG, lx = ox + S;
    const top = `${cx},${r2(cy - R)}`, topIn = `${cx},${r2(cy - r)}`, jonction = `${lx},${r2(cy + XI)}`;
    if (a >= 359.9) return `M${top} A${R},${R} 0 1 1 ${jonction} V${bas} H${ox} V${cy} A${R},${R} 0 0 1 ${top} Z ` + ring(cx, cy);
    const po = pt(cx, cy, R, a), pi = pt(cx, cy, r, a), big = a > 180 ? 1 : 0;
    if (a >= 270) return `M${top} A${R},${R} 0 1 1 ${jonction} V${bas} H${ox} V${cy} A${R},${R} 0 0 1 ${f(po)} L${f(pi)} A${r},${r} 0 1 0 ${topIn} Z`;
    if (a > A_CROSS) { const t = (lx - po[0]) / (pi[0] - po[0]), yc = po[1] + t * (pi[1] - po[1]);
      return `M${top} A${R},${R} 0 1 1 ${jonction} V${bas} H${ox} V${cy} H${lx} V${r2(yc)} L${f(pi)} A${r},${r} 0 1 0 ${topIn} Z`; }
    return (a < 0.5 ? '' : `M${top} A${R},${R} 0 ${big} 1 ${f(po)} L${f(pi)} A${r},${r} 0 ${big} 0 ${topIn} Z `) + `M${ox},${cy} H${lx} V${bas} H${ox} Z`;
  };
  const Y0 = r2(R - XI), Y1 = r2(R + XI); // 6,14 et 93,86
  const L = {
    P: (ox, pct = 85) => pPath(pct, ox, 10),
    a: (ox) => `M${ox + 74},${Y0} V0 H${ox + 100} V100 H${ox + 74} V${Y1} A50,50 0 1 1 ${ox + 74},${Y0} Z ` + ring(ox + 50, 50),
    y: (ox) => `M${ox},0 H${ox + 26} V50 A24,24 0 0 0 ${ox + 74},50 V0 H${ox + 100} V140 H${ox + 74} V${Y1} A50,50 0 0 1 ${ox},50 Z`,
    o: (ox) => bande(ox + 50, 50, 0, 360),
    u: (ox) => `M${ox},0 H${ox + 26} V50 A24,24 0 0 0 ${ox + 74},50 V0 H${ox + 100} V100 H${ox + 74} V${Y1} A50,50 0 0 1 ${ox},50 Z`,
    t: (ox) => `M${ox},${T_TOP} H${ox + 26} V0 H${ox + 62} V26 H${ox + 26} V50 A24,24 0 0 0 ${ox + 50},74 H${ox + 62} V100 H${ox + 50} A50,50 0 0 1 ${ox},50 V26 H${ox - 14} V0 H${ox} Z`,
  };
  const WORD = ['P', 'a', 'y', 'o', 'u', 't'];
  const XS = [0, 106, 228, 344, 460, 586];
  A.LETTRES = { ordre: WORD, x: XS, largeurs: { P: 100, a: 100, y: 100, o: 100, u: 100, t: 76 }, graisse: S, diametre: 2 * R };
  A.letterX = (i) => XS[i];
  A.letterPath = (ch, ox = 0, pct = 85) => L[ch](ox, pct);
  A.wordPath = (pct = 85) => WORD.map((c, i) => L[c](XS[i], pct)).join(' ');
  A.WORD_W = 648;
  /* Symbole : le P-jauge seul, anneau centré en (50, 50), fût jusqu'à 140. pct : remplissage de l'anneau (85 par défaut). */
  A.symbolPath = (pct = 85) => pPath(pct, 0, 50);
  /* Pièces pour le mouvement : chaque morceau est un tracé fermé (ils se recouvrent à la jonction : les remplir séparément, pas en un seul d). */
  A.symbolParts = (pct = 85) => ({ anneau: bande(50, 50, 0, pct * 3.6), fut: `M0,50 H${S} V140 H0 Z`, part: bande(50, 50, pct * 3.6, 360), plein: bande(50, 50, 0, 360) });
  A.letterParts = (ch, ox = 0) => ({
    P: [bande(ox + 50, 10, 0, 306), `M${ox},10 H${ox + S} V100 H${ox} Z`],
    a: [bande(ox + 50, 50, 0, 360), `M${ox + 74},0 H${ox + 100} V100 H${ox + 74} Z`],
    y: [`M${ox},0 H${ox + 26} V50 A24,24 0 0 0 ${ox + 74},50 H${ox + 100} A50,50 0 0 1 ${ox},50 Z`, `M${ox + 74},0 H${ox + 100} V140 H${ox + 74} Z`],
    o: [bande(ox + 50, 50, 0, 360)],
    u: [`M${ox},0 H${ox + 26} V50 A24,24 0 0 0 ${ox + 74},50 H${ox + 100} A50,50 0 0 1 ${ox},50 Z`, `M${ox + 74},0 H${ox + 100} V100 H${ox + 74} Z`],
    t: [`M${ox},${T_TOP} H${ox + 26} V50 A24,24 0 0 0 ${ox + 50},74 H${ox + 62} V100 H${ox + 50} A50,50 0 0 1 ${ox},50 Z`, `M${ox - 14},0 H${ox + 62} V26 H${ox - 14} Z`],
  })[ch];
  /* Géométrie qui a servi à dessiner (pour la planche de construction) */
  A.CONSTRUCTION = {
    regle: 'Un seul anneau (diamètre 100, graisse 26) et un seul fût (26). Le P garde 85 % de l\'anneau : 306° depuis midi, ouvert de 54°.',
    anneau: { rayon: R, rayonInterieur: r, graisse: S, diametre: 2 * R }, fut: S,
    hauteurX: 100, ligneDeBase: 100, capitale: 140, ascendanteT: -T_TOP, descendante: 40,
    ouverture: { depart: 0, fin: 306, degres: 54, part: 15, garde: 85, sens: 'horaire depuis midi' },
    jonction: { x: S, y: r2(XI), angle: r2(A_CROSS) },
    lettres: {
      P: { x: 0, centre: [50, 10], fut: [0, 10, S, 90], coupes: [f(pt(50, 10, R, 0)), f(pt(50, 10, R, 306)), f(pt(50, 10, r, 306))] },
      a: { x: 106, centre: [156, 50], fut: [180, 0, S, 100] },
      y: { x: 228, centre: [278, 50], futs: [[228, 0, S, 50], [302, 0, S, 140]] },
      o: { x: 344, centre: [394, 50] },
      u: { x: 460, centre: [510, 50], futs: [[460, 0, S, 50], [534, 0, S, 100]] },
      t: { x: 586, centre: [636, 50], fut: [586, T_TOP, S, 50 - T_TOP], barre: [572, 0, 76, S], pied: 648 },
    },
    approches: { 'rond-rond (P a)': 6, 'droit-droit (a y)': 22, 'droit-rond (y o, o u)': 16, 'droit-barre (u t)': 12 },
    symbole: { centre: [50, 50], fut: [0, 50, S, 90], boite: [0, 0, 100, 140] },
  };

  A.LOGO = { box: [0, -40, 648, 180], xHeight: 100, baseline: 100, symbolBox: [0, 0, 100, 140], symbolBaseline: 140 };
  A.LOCKUP = { lines: ['Le copilote', 'des freelances'], x: 698, size: 52, baselines: [40, 100], tracking: -1.8, box: [0, -40, 1025, 180] };
  A.FONTS = { nom: 'Instrument Sans', variable: '@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2',
    graisses: { Regular: 400, Medium: 500, SemiBold: 600, Bold: 700 }, logo: 'Medium',
    chiffres: { nom: 'Chivo Mono', variable: '@fontsource-variable/chivo-mono/files/chivo-mono-latin-wght-normal.woff2', graisses: { Light: 300, Regular: 400, Medium: 500, Bold: 700 } } };
  A.COULEURS_LOGO = { net: C.net, blanc: C.blanc, coffre: C.coffre, releve: C.releve };
  const vb = (b) => b.join(' ');
  /* Logotype (son P est le symbole) */
  A.wordmark = (fill = 'currentColor', attrs = '', pct = 85) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb(A.LOGO.box)}" ${attrs}><path fill="${fill}" fill-rule="evenodd" d="${A.wordPath(pct)}"/></svg>`;
  /* Symbole */
  A.symbol = (fill = 'currentColor', attrs = '', pct = 85) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb(A.LOGO.symbolBox)}" ${attrs}><path fill="${fill}" fill-rule="evenodd" d="${A.symbolPath(pct)}"/></svg>`;
  /* Version complète : logotype + descripteur sur deux lignes (la police de marque doit être chargée dans la page) */
  A.lockup = (fill = 'currentColor', attrs = '') => { const K = A.LOCKUP;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb(K.box)}" ${attrs}><path fill="${fill}" fill-rule="evenodd" d="${A.wordPath()}"/>` +
      K.lines.map((t, i) => `<text x="${K.x}" y="${K.baselines[i]}" fill="${fill}" font-family="${A.FONTS.nom}" font-weight="${A.FONTS.graisses[A.FONTS.logo]}" font-size="${K.size}" letter-spacing="${K.tracking}">${t}</text>`).join('') + `</svg>`; };
  /* Version empilée : logotype, descripteur dessous sur une ligne en capitales Chivo Mono (supports étroits ; HTML seulement, pas de fichier exporté) */
  A.lockupV = (fill = 'currentColor', attrs = '') =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -40 648 236" ${attrs}><path fill="${fill}" fill-rule="evenodd" d="${A.wordPath()}"/>` +
    `<text x="0" y="190" fill="${fill}" font-family="Chivo Mono" font-weight="500" font-size="30" textLength="560" lengthAdjust="spacing">LE COPILOTE DES FREELANCES</text></svg>`;
  /* Icône d'application : carré arrondi, symbole centré. ton : net, coffre, ardoise, releve, blanc */
  A.icone = (taille = 120, ton = 'net') => { const T = { net: [C.net, SUR_NET], coffre: [C.coffre, C.net], ardoise: [C.ardoise, C.net], releve: [C.releve, C.coffre], blanc: [C.blanc, C.coffre] }[ton] || [C.net, SUR_NET];
    return `<div class="icone-app" style="width:${taille}px;height:${taille}px;background:${T[0]}${ton === 'coffre' || ton === 'ardoise' ? ';box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)' : ''}">${A.symbol(T[1])}</div>`; };

  /* ---------- Chiffres : montants et pourcentages à la française ---------- */
  A.eur = (n, dec = 2, signe = false) => { const s = Math.abs(n).toFixed(dec).split('.'); s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, NB);
    return (n < 0 ? '−' : signe ? '+' : '') + s.join(',') + NB + '€'; };
  /* Le même montant en HTML : la virgule est resserrée (en chasse fixe, elle laisse sinon un trou). À utiliser dans tout ce qui s'affiche. */
  A.eurH = (n, dec = 2, signe = false) => A.eur(n, dec, signe).replace(',', '<span class="vg">,</span>');
  const E = A.eurH;
  A.pc = (n) => n + NB + '%';
  /* Pourcentage en chiffre de scène : le signe % en petit exposant (dans un élément .chiffre) */
  A.pcH = (n) => n + '<span class="pct">%</span>';
  const mt = (n, dec = 2, style = '', signe = false) => `<span class="mt" style="${style}">${typeof n === 'number' ? E(n, dec, signe) : n}</span>`;

  /* ---------- Données communes : les mêmes comptes, montants et dates sur tous les écrans. Tout est fictif. ----------
     Nous sommes le jeudi 12 novembre 2026. Lucie Morel, consultante data en SASU, facture 600 € HT par jour. */
  A.DONNEES = {
    dates: { jour: 'jeudi 12 novembre 2026', court: '12.11.2026', mois: 'Novembre 2026', heure: '9:41' },
    freelance: { prenom: 'Lucie', nom: 'Morel', initiales: 'LM', metier: 'Consultante data', societe: 'LM Conseil', forme: 'SASU', mail: 'lucie.morel@example.com' },
    mission: { client: 'Hexa Mobilités', tjm: 600 },
    simulateur: { tjm: 600, jours: 20, mois: 12, facture: 12000, avant: 6480, apres: 10200, ecart: 3720 },
    exercice: { annee: 2026, jours: 188, facture: 112800, part: 95880, avant: 60912,
      mois: [['Janv.', 12000], ['Févr.', 12000], ['Mars', 13200], ['Avr.', 11400], ['Mai', 10200], ['Juin', 12600], ['Juil.', 10800], ['Août', 6000], ['Sept.', 12600], ['Oct.', 12000], ['Nov.', 4800], ['Déc.', 0]] },
    solde: 21582.60,
    comptes: [{ nom: 'Compte principal', solde: 14382.60 }, { nom: 'Compte taxes', solde: 7200.00 }],
    transactions: [
      { nom: 'Hexa Mobilités', cat: 'Facture F-2026-010', date: '10 nov.', montant: 14400.00 },
      { nom: 'Billet de train', cat: 'Déplacement', date: '9 nov.', montant: -96.00 },
      { nom: 'Déjeuner client', cat: 'Frais de repas', date: '6 nov.', montant: -42.80 },
      { nom: 'Abonnement logiciel', cat: 'Abonnements', date: '5 nov.', montant: -59.00 },
      { nom: 'Cash-Out de septembre', cat: 'Remboursement de frais', date: '3 nov.', montant: -804.60 },
      { nom: 'Assurance RC Pro', cat: 'Assurances', date: '2 nov.', montant: -38.50 },
    ],
    factures: [
      { ref: 'F-2026-011', client: 'Hexa Mobilités', objet: 'Novembre · en cours', ht: 4800.00, statut: 'À venir', ton: 'att' },
      { ref: 'F-2026-010', client: 'Hexa Mobilités', objet: 'Octobre · 20 jours', ht: 12000.00, statut: 'Payée', ton: 'ok' },
      { ref: 'F-2026-009', client: 'Atelier Norma', objet: 'Audit data · 3 jours', ht: 1800.00, statut: 'En retard', ton: 'due' },
      { ref: 'F-2026-008', client: 'Hexa Mobilités', objet: 'Septembre · 18 jours', ht: 10800.00, statut: 'Payée', ton: 'ok' },
    ],
    cra: { mois: 'Octobre 2026', an: 2026, m: 9, ouvres: 22, factures: 20, site: 14, tele: [2, 7, 9, 14, 21, 28], absents: [29, 30], facture: 'F-2026-010', tjm: 600, ht: 12000, tva: 2400, ttc: 14400 },
    cashouts: { rembourse: 1235.80, avenir: 1231.05, mois: 4,
      calcules: [{ periode: 'Novembre 2026', nombre: 2, montant: 512.75, statut: 'À venir' }, { periode: 'Octobre 2026', nombre: 3, montant: 718.30, statut: 'À venir' }],
      payes: [{ periode: 'Septembre 2026', nombre: 3, montant: 804.60, statut: 'Payé' }, { periode: 'Août 2026', nombre: 2, montant: 431.20, statut: 'Payé' }],
      detail: [['Indemnités kilométriques', 312.40], ['Frais de repas', 286.00], ['Abonnements', 119.90]] },
    tva: { collectee: 2400.00, deductible: 186.40, due: 2213.60, echeance: '24 nov.' },
    obligations: [
      { nom: 'TVA · CA3 d\'octobre', detail: 'À reverser avant le 24 nov.', montant: 2213.60, statut: 'À déclarer', ton: 'due' },
      { nom: 'DSN mensuelle', detail: 'Novembre · échéance du 5 déc.', statut: 'Programmée', ton: 'att' },
      { nom: 'Acompte d\'impôt sur les sociétés', detail: 'Échéance du 15 déc.', statut: 'À venir', ton: 'att' },
      { nom: 'Récapitulatif annuel 2025', detail: 'Déclaration fiscale · PDF et Excel', statut: 'Déposé', ton: 'ok' },
    ],
  };
  const D = A.DONNEES;

  /* ---------- Icônes : trait de 1,6 sur 18, couleur du texte courant ---------- */
  const ic = (d, c = 'currentColor', s = 18, w = 1.6) => `<svg viewBox="0 0 18 18" width="${s}" height="${s}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" style="flex:none">${d}</svg>`;
  const I = {
    maison: '<path d="M2.5 8 9 2.5 15.5 8V15.5H11V11H7v4.5H2.5Z"/>',
    comparatif: '<path d="M3.5 15.5V8M9 15.5V2.5M14.5 15.5V11"/>',
    planning: '<rect x="2.5" y="3.5" width="13" height="12" rx="2"/><path d="M2.5 7.5h13M6 2v3M12 2v3"/>',
    tresorerie: '<rect x="1.5" y="4.5" width="15" height="9" rx="1.5"/><circle cx="9" cy="9" r="2.2"/>',
    entreprise: '<path d="M2 15.5h14M4 15.5V8M7.3 15.5V8M10.7 15.5V8M14 15.5V8M2 6.5 9 2.5l7 4Z"/>',
    compte: '<rect x="1.5" y="4" width="15" height="10.5" rx="2"/><path d="M1.5 7.5h15M4.5 11.5h3"/>',
    factures: '<path d="M4 2.5h7l3 3v10H4Z"/><path d="M6.5 9h5M6.5 12h5"/>',
    cashout: '<circle cx="9" cy="9" r="6.5"/><path d="M9 5.5v6M6.5 9.2 9 11.7l2.5-2.5"/>',
    drive: '<path d="M2 5V14.5h14V6.5H9L7.5 4.5H2Z"/>',
    menu: '<path d="M2.5 6h13M2.5 12h13"/>',
    recherche: '<circle cx="8" cy="8" r="5"/><path d="m12 12 3.5 3.5"/>',
    filtres: '<path d="M3 5h12M5 9h8M7 13h4"/>',
    colonnes: '<path d="M2.5 5.5h4M10.5 5.5h5M2.5 12.5h7M13.5 12.5h2"/><circle cx="8.5" cy="5.5" r="1.8"/><circle cx="11.5" cy="12.5" r="1.8"/>',
    check: '<path d="m3.5 9.5 3.5 3.5 7.5-8"/>',
    fleche: '<path d="M3 9h12M10.5 4.5 15 9l-4.5 4.5"/>',
    plus: '<path d="M9 3.5v11M3.5 9h11"/>',
    chevron: '<path d="m6.5 3.5 5.5 5.5-5.5 5.5"/>',
    bas: '<path d="m4 6.5 5 5 5-5"/>',
    haut: '<path d="m4 11.5 5-5 5 5"/>',
    cadenas: '<rect x="4" y="8" width="10" height="7.5" rx="1.5"/><path d="M6 8V5.5a3 3 0 0 1 6 0V8"/>',
    telecharger: '<path d="M9 2.5v9M5.5 8 9 11.5 12.5 8M3 15.5h12"/>',
    horloge: '<circle cx="9" cy="9" r="6.5"/><path d="M9 5.5V9l2.5 1.5"/>',
    cloche: '<path d="M4.5 12.5V8a4.5 4.5 0 0 1 9 0v4.5l1.5 1.5H3ZM7.5 16h3"/>',
    eclair: '<path d="M10 2 4 10h4.5L8 16l6-8H9.5Z"/>',
    bouclier: '<path d="M9 2 3.5 4v4.5c0 3.5 2.3 6 5.5 7.5 3.2-1.500 5.5-4 5.500-7.5V4Z"/><path d="m6.500 9 2 2 3.500-4"/>',
    lien: '<path d="M7.500 10.500a3 3 0 0 0 4.200 0l2.500-2.500a3 3 0 0 0-4.200-4.200l-1 1M10.500 7.500a3 3 0 0 0-4.200 0l-2.500 2.500a3 3 0 0 0 4.200 4.200l1-1"/>',
    graphique: '<path d="M2.500 15.500h13M4.500 12.500v-3M8 12.500v-7M11.500 12.500V8M15 12.500V3.500"/>',
    document: '<rect x="3.500" y="2.500" width="11" height="13" rx="1.500"/><path d="M6.500 6.500h5M6.500 9.500h5M6.500 12.500h3"/>',
    utilisateur: '<circle cx="9" cy="6" r="3"/><path d="M3 15.500c.800-3 3-4.500 6-4.500s5.200 1.500 6 4.500"/>',
    reglages: '<circle cx="9" cy="9" r="2.500"/><path d="M9 1.500v2M9 14.500v2M1.500 9h2M14.500 9h2M3.700 3.700l1.400 1.400M12.900 12.900l1.400 1.400M3.700 14.300l1.400-1.400M12.900 5.100l1.400-1.400"/>',
    euro: '<path d="M13.500 4.500A5.500 5.500 0 1 0 13.500 13.500M3 7.500h7M3 10.500h7"/>',
    pourcent: '<path d="M4 14 14 4"/><circle cx="5" cy="5" r="2"/><circle cx="13" cy="13" r="2"/>',
    virement: '<path d="M2.500 6h12M11.500 3l3 3-3 3M15.500 12h-12M6.500 9l-3 3 3 3"/>',
    voiture: '<path d="M2.500 12.500v-3l1.500-4h10l1.500 4v3ZM2.500 9.500h13"/><circle cx="5.500" cy="12.500" r="1.300"/><circle cx="12.500" cy="12.500" r="1.300"/>',
    repas: '<path d="M5 2.500v13M3 2.500v4a2 2 0 0 0 4 0v-4M13 15.500v-13c-2 1-3 3-3 6h3"/>',
    calcul: '<rect x="3.500" y="2.500" width="11" height="13" rx="1.500"/><path d="M6 6h6M6.500 9.500h.010M9 9.500h.010M11.500 9.500h.010M6.500 12.500h.010M9 12.500h.010M11.500 12.500h.010"/>',
  };
  A.icon = (nom, c, s, w) => ic(I[nom], c, s, w);
  A.ICONES = Object.keys(I);
  /* Flèche de passage, à bouts droits : la police ne contient pas le caractère →, ne pas l'écrire dans un texte */
  A.fleche = (c = 'currentColor', style = '') => `<svg viewBox="0 0 40 24" fill="none" stroke="${c}" stroke-width="3.4" style="width:.86em;height:.52em;flex:none;${style}"><path d="M0 12h37M26.5 1.5 37 12 26.5 22.5"/></svg>`;
  /* « 54 % → 85 % » : le passage, en chiffres de scène */
  A.passage = (o = {}) => { const { taille = 96, c = C.net, avant = C.preleve, extra = '' } = o;
    return `<span class="chiffre" style="font-size:${taille}px;display:inline-flex;align-items:center;gap:.2em;color:${c};${extra}"><span style="color:${avant}">${A.pcH(A.PART.avant)}</span>${A.fleche(c, 'margin:0 .06em')}<span>${A.pcH(A.PART.apres)}</span></span>`; };

  /* ---------- LES MOTIFS : les données deviennent le motif. Tous déterministes (seed), tous à poser dans un parent en position relative. ---------- */
  const rnd = (seed) => { let a = (seed * 2654435761) >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  /* Les bandes : un histogramme en dégradé. opts : n (nombre de bandes), seed, valeurs [0 à 1] (sinon un profil est tiré), profil 'monte' | 'pic' | 'plat',
     forme 'histogramme' | 'stries' (bandes pleine hauteur, largeurs inégales), sens 'haut' | 'bas', gap (px), rampe 'net' | 'grise', k (hauteur globale, 0 à 1 ; animable par la variable CSS --k) */
  A.bandes = (o = {}) => { const { n = 24, seed = 7, forme = 'histogramme', profil = 'monte', valeurs = null, gap = 0, sens = 'haut', rampe = 'net', k = 1, cls = '', style = '' } = o, R_ = rnd(seed);
    let vals = valeurs;
    if (!vals) { vals = []; for (let i = 0; i < n; i++) { const x = i / Math.max(1, n - 1);
      const b = profil === 'plat' ? 0.7 : profil === 'pic' ? 0.14 + 0.86 * Math.pow(Math.sin(Math.PI * Math.min(1, x * 0.74 + 0.02)), 2.2) : 0.12 + 0.88 * Math.pow(x, 1.5);
      vals.push(Math.max(0.05, Math.min(1, b * (0.74 + 0.42 * R_())))); } }
    return `<div class="bandes ${forme === 'stries' ? 'stries' : ''} ${sens === 'bas' ? 'bas' : ''} ${rampe === 'grise' ? 'grise' : ''} ${cls}" style="--gap:${gap}px;--k:${k};${style}">` +
      vals.map((v) => (forme === 'stries' ? `<i style="flex-grow:${r2(0.3 + 2.4 * R_())};opacity:${r2(0.18 + 0.82 * R_())}"></i>`
        : `<i style="height:calc(var(--k,1)*${r2(v * 100)}%);opacity:${r2(0.62 + 0.38 * R_())}"></i>`)).join('') + `</div>`; };
  /* Le damier : des blocs en dégradé sur une grille. opts : cols, rows, seed, densite (0 à 1), sens 'h' | 'v', gap, rampe */
  A.damier = (o = {}) => { const { cols = 8, rows = 6, seed = 3, densite = 0.56, sens = 'h', gap = 0, rampe = 'net', cls = '', style = '' } = o, R_ = rnd(seed); let h = '';
    const L1 = sens === 'v' ? cols : rows, L2 = sens === 'v' ? rows : cols;
    for (let a = 0; a < L1; a++) { let b = 0; while (b < L2) { const span = Math.min(L2 - b, 1 + Math.floor(R_() * 3)), plein = R_() < densite, inv = R_() < 0.5, op = r2(0.4 + 0.6 * R_());
      if (plein) h += sens === 'v' ? `<i class="v" style="grid-column:${a + 1};grid-row:${b + 1}/span ${span};opacity:${op}${inv ? ';transform:scaleY(-1)' : ''}"></i>`
        : `<i class="${inv ? 'r' : ''}" style="grid-row:${a + 1};grid-column:${b + 1}/span ${span};opacity:${op}"></i>`;
      b += span; } }
    return `<div class="damier ${rampe === 'grise' ? 'grise' : ''} ${cls}" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr);--gap:${gap}px;${style}">${h}</div>`; };
  /* Le halo : un arc de lumière qui entre par le haut ou par le bas */
  A.halo = (pos = 'haut', style = '') => `<div class="halo ${pos}" style="${style}"></div>`;
  /* La recette en trois calques, pour la planche qui l'explique. etape : 'base' (rampe grise), 'grain' (base + grain), 'teinte' (base + grain + voile Net 500 en mode couleur).
     motif : 'bandes' | 'stries' | 'damier' | 'halo' (arc en niveaux de gris ; opts.halo : 'bas' par défaut, ou 'haut'). opts : ceux du motif (n, seed, cols, rows…) */
  A.recette = (etape = 'teinte', motif = 'bandes', o = {}) => { const m = motif === 'halo' ? `<div class="halo grise ${o.halo === 'haut' ? 'haut' : 'bas'}" style="${o.style || ''}"></div>`
      : motif === 'damier' ? A.damier({ rampe: 'grise', ...o }) : A.bandes({ rampe: 'grise', forme: motif === 'stries' ? 'stries' : 'histogramme', ...o });
    return `<div class="${etape !== 'base' ? 'grain' : ''} ${etape === 'teinte' ? 'teinte' : ''}" style="position:absolute;inset:0;background:${C.coffre};overflow:hidden">${m}</div>`; };

  /* ---------- LA JAUGE : la proportion gardée, de 54 à 85. Le plein est ce qui vous revient, le reste est ce qui part. ----------
     forme 'segments' : une barre de n traits (100 : un par euro) · 'blocs' : 100 blocs en 10 × 10, remplis depuis le bas · 'escalier' : n marches de 54 à p
           'barre' : barre continue, ce qui part hachuré · 'anneau' : anneau depuis midi, celui du symbole
     opts : p (0 à 100, défaut 85) · avant (ex. 54 : les unités gagnées entre avant et p passent en --c4, blanc) · repere (ex. 54 : un trait Prélevé)
            h (hauteur, px) · l (largeur des blocs, px) · n · g (écart, px) · taille, ep (anneau) · c, c2, c3, c4 (plein, ce qui part, repère, gain)
            part 'trame' | 'plein' | 'contour' | 'vide' · dans [html, html] (barre) · vertical (barre) · degrade (escalier) · anim, de, a, retard · cls, style */
  let jid = 0;
  A.jauge = (o = {}) => {
    const { forme = 'barre', p = A.PART.apres, h, taille = 200, ep = S, c, c2, c3, c4, part = 'trame', repere = null, avant = null, dans = null, vertical = false, degrade = false, anim = false, de, a, retard, pas, g, l, cls = '', style = '' } = o;
    const vars = (c ? `--c:${c};` : '') + (c2 ? `--c2:${c2};` : '') + (c3 ? `--c3:${c3};` : '') + (c4 ? `--c4:${c4};` : '') + (g != null ? `--g:${g}px;` : '');
    const da = ` data-p="${p}"` + (anim ? ' data-anim' : '') + (de != null ? ` data-de="${de}"` : '') + (a != null ? ` data-a="${a}"` : '') + (retard != null ? ` data-retard="${retard}"` : '') + (avant != null ? ` data-avant="${avant}"` : '');
    if (forme === 'segments' || forme === 'blocs') { const N = o.n || 100, cols = o.cols || 10, rows = Math.ceil(N / cols), on = Math.round((p / 100) * N), av = avant != null ? Math.round((avant / 100) * N) : null, rp = repere != null ? Math.round((repere / 100) * N) - 1 : -1; let s = '';
      for (let i = 0; i < N; i++) { const rang = forme === 'blocs' ? (rows - 1 - Math.floor(i / cols)) * cols + (i % cols) : i;
        s += `<i class="${rang < on ? 'on' : ''}${av != null && rang >= av && rang < on ? ' gain' : ''}${rang === rp ? ' rep' : ''}"></i>`; }
      return forme === 'blocs' ? `<div class="jauge blocs ${part === 'trame' ? 'trame' : ''} ${cls}"${da} data-n="${N}" data-cols="${cols}" style="--n:${cols};--l:${l || 300}px;${vars}${style}">${s}</div>`
        : `<div class="jauge segments ${cls}"${da} data-n="${N}" style="--h:${h || 56}px;${vars}${style}">${s}</div>`; }
    if (forme === 'escalier') { const N = o.n || 8, d0 = avant != null ? avant : A.PART.avant; let s = '';
      for (let i = 0; i < N; i++) s += `<i style="height:${r2(d0 + ((p - d0) * i) / (N - 1))}%"></i>`;
      return `<div class="jauge escalier ${degrade ? 'degrade' : ''} ${cls}"${da} data-n="${N}" data-avant="${d0}" style="--h:${h || 240}px;${vars}${style}">${s}</div>`; }
    if (forme === 'anneau') {
      const id = 'jg' + (jid++), rc = (100 - ep) / 2, hp = pas || 5;
      const trait = part === 'trame' ? `url(#${id})` : part === 'plein' ? 'var(--c2)' : 'none';
      let rep = '';
      if (repere != null) { const th = (repere / 100) * 2 * Math.PI, r0 = rc - ep / 2 - 3, r1 = rc + ep / 2 + 3;
        rep = `<line class="j-rep" x1="${r2(50 + r0 * Math.cos(th))}" y1="${r2(50 + r0 * Math.sin(th))}" x2="${r2(50 + r1 * Math.cos(th))}" y2="${r2(50 + r1 * Math.sin(th))}" stroke-width="1.6" style="stroke:var(--c3)"/>`; }
      return `<svg class="jauge anneau ${cls}"${da} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${taille}" height="${taille}" style="overflow:visible;${vars}${style}">` +
        `<defs><pattern id="${id}" width="${hp}" height="${hp}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${r2(hp * 0.18)}" height="${hp}" style="fill:var(--c2)"/></pattern></defs>` +
        `<g transform="rotate(-90 50 50)" fill="none" stroke-width="${ep}">` +
        `<circle class="j-part" cx="50" cy="50" r="${rc}" pathLength="100" style="stroke:${trait}" stroke-dasharray="${r2(100 - p)} 100" stroke-dashoffset="${r2(-p)}"/>` +
        `<circle class="j-net" cx="50" cy="50" r="${rc}" pathLength="100" style="stroke:var(--c)" stroke-dasharray="${r2(p)} 100"/>${rep}</g></svg>`;
    }
    const H = h || 28, P = pas || Math.max(5, Math.round(H * 0.26));
    return `<div class="jauge barre${vertical ? ' vert' : ''} ${cls}"${da} style="--h:${H}px;--pas:${P}px;${vars}${style}">` +
      `<b class="j-net" style="${vertical ? 'height' : 'width'}:${r2(p)}%">${dans && dans[0] ? `<span class="j-in">${dans[0]}</span>` : ''}</b>` +
      `<i class="j-part ${part}">${dans && dans[1] ? `<span class="j-in">${dans[1]}</span>` : ''}</i>` +
      (repere != null ? `<s class="j-rep" style="${vertical ? 'bottom' : 'left'}:${repere}%"></s>` : '') + `</div>`;
  };
  /* Pose une jauge à la valeur p (0 à 100), quelle que soit sa forme */
  A.setJauge = (el, p) => { p = Math.max(0, Math.min(100, p)); el.dataset.p = r2(p); const L_ = el.classList;
    if (L_.contains('segments') || L_.contains('blocs')) { const N = +el.dataset.n, cols = +(el.dataset.cols || 10), rows = Math.ceil(N / cols), on = Math.round((p / 100) * N), av = el.dataset.avant != null ? Math.round((+el.dataset.avant / 100) * N) : null, bl = L_.contains('blocs');
      Array.prototype.forEach.call(el.children, (x, i) => { const rang = bl ? (rows - 1 - Math.floor(i / cols)) * cols + (i % cols) : i; x.classList.toggle('on', rang < on); if (av != null) x.classList.toggle('gain', rang >= av && rang < on); }); return; }
    if (L_.contains('escalier')) { const N = +el.dataset.n, d0 = +el.dataset.avant; Array.prototype.forEach.call(el.children, (x, i) => { x.style.height = r2(d0 + ((p - d0) * i) / (N - 1)) + '%'; }); return; }
    const n = el.querySelector('.j-net'), q = el.querySelector('.j-part');
    if (L_.contains('anneau')) { n.setAttribute('stroke-dasharray', `${r2(p)} 100`); q.setAttribute('stroke-dasharray', `${r2(100 - p)} 100`); q.setAttribute('stroke-dashoffset', `${r2(-p)}`); }
    else n.style[L_.contains('vert') ? 'height' : 'width'] = r2(p) + '%'; };
  /* Courbes : sortie douce, aucun rebond */
  A.ease = (x) => { x = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - x, 4); };
  A.easeIO = (x) => { x = Math.max(0, Math.min(1, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  /* Valeur de la jauge au temps t (secondes), sans horloge. opts : de (54), a (85), debut (0,4 s), duree (1,35 s), boucle (0 = pas de boucle ;
     sinon durée de la boucle : la jauge redescend sur la dernière seconde pour un raccord parfait) */
  A.pJauge = (t, o = {}) => { const { de = A.PART.avant, a = A.PART.apres, debut = 0.4, duree = 1.35, boucle = 0 } = o;
    if (boucle) { t = ((t % boucle) + boucle) % boucle; if (t > boucle - 1) return a + (de - a) * A.easeIO(t - (boucle - 1)); }
    return de + (a - de) * A.ease((t - debut) / duree); };
  const ecrit = (el, p) => { const k = el.dataset.j;
    if (k === 'val') el.textContent = Math.round(p); else if (k === 'reste') el.textContent = 100 - Math.round(p);
    else if (k === 'eur') el.innerHTML = E((+el.dataset.base * p) / 100, +(el.dataset.dec || 0));
    else if (k === 'ecart') el.innerHTML = E((+el.dataset.base * (p - A.PART.avant)) / 100, +(el.dataset.dec || 0)); };
  /* Applique la valeur p à toutes les jauges { anim: true } et aux textes marqués data-j ("val" : pourcentage arrondi, "reste" : 100 − val,
     "eur" : data-base × p / 100 en euros, data-dec décimales ; "ecart" : data-base × (p − 54) / 100) */
  A.majJauge = (p, root = document) => { root.querySelectorAll('.jauge[data-anim]').forEach((el) => A.setJauge(el, p)); root.querySelectorAll('[data-j]').forEach((el) => ecrit(el, p)); return p; };
  /* Anime la page : chaque jauge { anim: true } et chaque texte data-j suit pJauge(t), avec ses propres data-de, data-a, data-retard s'il en porte */
  A.seekJauge = (t, o = {}) => { const root = o.root || document, base = A.pJauge(t, o);
    const pour = (el) => { const s = el.dataset; return s.de == null && s.a == null && s.retard == null ? base
      : A.pJauge(t - (+s.retard || 0), { ...o, de: s.de != null ? +s.de : o.de, a: s.a != null ? +s.a : o.a }); };
    root.querySelectorAll('.jauge[data-anim]').forEach((el) => A.setJauge(el, pour(el)));
    root.querySelectorAll('[data-j]').forEach((el) => ecrit(el, pour(el)));
    return base; };
  /* Graphique en colonnes : chaque colonne est une jauge debout. données : [[étiquette, valeur], …] */
  A.colonnes = (data, o = {}) => { const { h = 180, p = A.PART.apres, gap = 10, c, c2, part = 'trame', anim = false, etiquettes = true } = o, max = o.max || Math.max(...data.map((d) => d[1]));
    return `<div class="colonnes" style="--h:${h}px;--g:${gap}px">` + data.map(([lb, v]) => `<div class="col${v ? '' : ' vide'}">` +
      A.jauge({ vertical: true, p: v ? p : 0, part: v ? part : 'vide', c, c2, anim: anim && !!v, pas: 6, style: `width:100%;height:${v ? `calc((100% - ${etiquettes ? 22 : 0}px)*${r2(v / max)})` : '3px'}` }) +
      (etiquettes ? `<span>${lb}</span>` : '') + `</div>`).join('') + `</div>`; };

  /* ---------- LE DÉCOMPTE : une carte sombre, des lignes à points de conduite, un total, la jauge au pied. ----------
     opts : titre · lignes [[libellé, valeur, 'part' pour ce qui part]] · total [libellé, valeur] · p (jauge au pied, null pour l'omettre) · pied [gauche, droite]
            ref, date (en-tête) · dec (décimales) · clair · k (échelle) */
  A.decompte = (o = {}) => { const { titre = 'Sur 100 € facturés', lignes = [['Facturé', 100], ['Ce qui part', -15, 'part']], total = ['Pour vous, jusqu\'à', 85], p = A.PART.apres, pied = null,
      ref = 'Décompte', date = D.dates.court, dec = 2, clair = false, k = 1, anim = false, extra = '' } = o;
    const v = (x) => (typeof x === 'number' ? E(x, dec) : x), pd = pied || (p != null ? [`${A.pc(Math.round(p))} pour vous`, A.pc(100 - Math.round(p))] : null);
    return `<div class="decompte${clair ? ' clair' : ''}" style="--k:${k};${extra}">` +
      `<div class="r-hd">${A.symbol(clair ? C.coffre : C.net)}<div>${ref}<br>${date}</div></div><div class="r-t">${titre}</div>` +
      lignes.map(([lb, x, cl]) => `<div class="r-l ${cl || ''}"><span>${lb}</span><i></i><b class="mt">${v(x)}</b></div>`).join('') +
      (total ? `<div class="r-tot"><span>${total[0]}</span><b>${v(total[1])}</b></div>` : '') +
      (p != null ? A.jauge({ forme: 'segments', n: 50, p, h: 16, g: 2, anim }) : '') + (pd ? `<div class="r-pd"><span>${pd[0]}</span><span>${pd[1]}</span></div>` : '') + `</div>`; };

  /* ---------- LA GRILLE DU CRA : le mois d'octobre 2026 en cases (données : Marque.DONNEES.cra). ----------
     opts : cell (hauteur d'une case), cw (largeur, défaut = cell), gap, jusqu (dernier jour saisi : les suivants sont « en attente » ; pour animer, re-rendre avec jusqu croissant),
            entete, nums, cls. Prend les couleurs du thème où elle est posée (sombre par défaut ; dans un élément .theme.clair pour la variante claire). */
  A.cra = (o = {}) => { const K = D.cra, { cell = 44, cw = null, gap = 6, jusqu = 31, entete = true, nums = true, cls = '' } = o;
    const first = (new Date(K.an, K.m, 1).getDay() + 6) % 7, n = new Date(K.an, K.m + 1, 0).getDate();
    let h = entete ? ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((j) => `<div class="c-h">${j}</div>`).join('') : '';
    for (let i = 0; i < first; i++) h += '<div class="c-j vide"></div>';
    for (let d = 1; d <= n; d++) { const wd = (first + d - 1) % 7;
      const e = wd > 4 ? 'we' : d > jusqu ? 'attente' : K.absents.includes(d) ? 'absent' : K.tele.includes(d) ? 'tele' : 'site';
      h += `<div class="c-j ${e}">${nums ? d : ''}</div>`; }
    return `<div class="cra ${cls}" style="--cell:${cell}px;--gap:${gap}px;${cw ? `grid-template-columns:repeat(7,${cw}px)` : ''}">${h}</div>`; };
  const legendeCra = (fs = 12) => `<div style="display:flex;gap:16px;align-items:center;font-size:${fs}px;font-weight:500">` +
    [['Sur site', 'background:var(--t-plein)'], ['Télétravail', 'box-shadow:inset 0 0 0 1px var(--t-acc);background:var(--t-acc-doux)'], ['Absence', 'background:repeating-linear-gradient(-45deg,var(--t-tx2) 0 1.2px,transparent 1.2px 5px)']]
      .map(([lb, s]) => `<span style="display:flex;align-items:center;gap:6px"><i style="width:${fs}px;height:${fs}px;border-radius:3px;${s}"></i>${lb}</span>`).join('') + `</div>`;

  /* ---------- GABARITS DE PLANCHE ---------- */
  /* Bandeau d'en-tête en chasse fixe : quatre colonnes (studio, client, sujet, année), en haut de chaque planche */
  A.ENTETE = ['KLYRA.FR', `CLIENT${NB}: PAYOUT`, 'IDENTITÉ DE MARQUE, SITE ET WEB APP<br>PROPOSITION D\'ÉVOLUTION', '©2026'];
  A.entete = (cols = A.ENTETE, c = 'currentColor', style = '') => `<div class="entete" style="color:${c};${style}">${cols.map((x) => `<span>${x}</span>`).join('')}</div>`;
  A.pilule = (t, on = false, cls = '') => `<span class="pilule${on ? ' on' : ''} ${cls}">${t}</span>`;
  A.SECTIONS = ['La marque', 'Le site', 'La web app'];
  A.onglets = (liste = A.SECTIONS, actif = 0) => `<div class="onglets">${liste.map((t, i) => A.pilule(t, i === actif)).join('')}</div>`;
  /* Phrase bicolore : les mots forts dans <b>, le reste éteint ; <b class="vif"> pour un mot en Net */
  A.bicolore = (html, style = '') => `<p class="bicolore" style="${style}">${html}</p>`;
  /* Bandeau de section à onglets. opts : titre, num ('01'), phrase (bicolore), actif (indice de l'onglet), onglets, sombre */
  A.section = (o = {}) => { const { titre = '', num = '', phrase = '', actif = 0, onglets = A.SECTIONS, sombre = false, style = '' } = o;
    return `<div class="section${sombre ? ' sombre' : ''}" style="${style}"><div class="s-hd"><div class="s-t">${num ? `<small>${num}</small>` : ''}<span>${titre}</span></div>${A.onglets(onglets, actif)}</div>${phrase ? A.bicolore(phrase) : ''}</div>`; };
  /* Tuile de bento. opts : ton '' (Ardoise) | 'noire' | 'claire' | 'blanche' | 'vive', lbl (étiquette mono en haut à gauche), style, cls */
  A.tuile = (html, o = {}) => { const { ton = '', lbl = '', style = '', cls = '' } = o; return `<div class="tuile ${ton} ${cls}" style="${style}">${lbl ? `<span class="t-lbl">${lbl}</span>` : ''}${html}</div>`; };

  /* ---------- Appareils ---------- */
  const statusIcons = (c) => `<span style="display:flex;gap:6px;align-items:center"><svg viewBox="0 0 18 12" fill="${c}"><rect x="0" y="8" width="3" height="4" rx=".7"/><rect x="5" y="5.5" width="3" height="6.5" rx=".7"/><rect x="10" y="3" width="3" height="9" rx=".7"/><rect x="15" y="0" width="3" height="12" rx=".7"/></svg>` +
    `<svg viewBox="0 0 17 12" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"><path d="M1.5 4.2a10 10 0 0 1 14 0M4.2 7a6.2 6.2 0 0 1 8.6 0"/><circle cx="8.5" cy="10.2" r="1" fill="${c}" stroke="none"/></svg>` +
    `<svg viewBox="0 0 27 12" fill="none"><rect x=".6" y=".6" width="22.8" height="10.8" rx="3.2" stroke="${c}" stroke-opacity=".5"/><rect x="2.2" y="2.2" width="19.6" height="7.6" rx="1.8" fill="${c}"/><rect x="25" y="4" width="1.6" height="4" rx=".8" fill="${c}" fill-opacity=".5"/></svg></span>`;
  const status = (time = D.dates.heure) => `<div class="status"><span>${time}</span>${statusIcons('currentColor')}</div>`;
  A.icons = { status, ic };
  A.phone = (screenHTML, k = 1, extra = '') =>
    `<div class="phone" style="--k:${k};${extra}"><i class="cote l1"></i><i class="cote l2"></i><i class="cote l3"></i><i class="cote r1"></i><div class="screen"><div class="island"></div>${screenHTML}</div></div>`;
  /* Navigateur : contenu de 1440 × h (900 par défaut) sous une barre de 46. opts : url, h, clair, extra (style) */
  A.browser = (html, k = 1, o = {}) => { const { url = 'app.payout.fr', h = 900, clair = false, extra = '' } = o;
    return `<div class="browser${clair ? ' clair' : ''}" style="--k:${k};height:${h + 46}px;${extra}"><div class="b-bar"><span class="b-dots"><i></i><i></i><i></i></span>` +
      `<span class="b-url">${ic(I.cadenas, 'currentColor', 11)}${url}</span></div><div class="b-view" style="height:${h}px">${html}</div></div>`; };
  /* Ordinateur portable vu de face (1700 × 1026) : le navigateur dans l'écran */
  A.laptop = (html, k = 1, o = {}) =>
    `<div class="laptop" style="--k:${k};${o.extra || ''}"><div class="l-lid">${A.browser(html, 1, { url: o.url, clair: o.clair })}</div><div class="l-base"></div></div>`;

  /* ---------- Écrans de téléphone (390 × 844) : la web app sur mobile. Sombre par défaut, { clair: true } pour la variante. ---------- */
  const SC = {};
  const th = (o) => (o && o.clair ? ' clair' : '');
  /* Le Prélevé reste rare : sur un écran qui montre déjà un retard ou le repère 54, une obligation « À déclarer » passe en pastille neutre (.neutre) */
  const tonSobre = (ton) => (ton === 'due' ? 'neutre' : ton);
  const top = () => `<div class="u-top"><span style="color:var(--t-acc)">${A.wordmark('currentColor', 'style="height:30px;width:auto"')}</span><span style="display:flex;gap:16px;align-items:center">${ic(I.cloche, 'currentColor', 21, 1.5)}${ic(I.menu, 'currentColor', 24, 1.6)}</span></div>`;
  /* En-tête des écrans de téléphone (logotype, cloche, menu), pour composer un écran hors du socle : Marque.icons.top() juste après Marque.icons.status() */
  A.icons.top = top;
  /* Jours du CRA comptés jusqu'au jour jusqu (inclus) : sur site, télétravail, total facturé (absences et week-ends exclus) */
  const craCompte = (jusqu = 31) => { const K = D.cra, first = (new Date(K.an, K.m, 1).getDay() + 6) % 7, n = new Date(K.an, K.m + 1, 0).getDate(); let site = 0, tele = 0;
    for (let d = 1; d <= Math.min(n, jusqu); d++) { if ((first + d - 1) % 7 > 4 || K.absents.includes(d)) continue; if (K.tele.includes(d)) tele++; else site++; }
    return { site, tele, factures: site + tele }; };
  A.craCompte = craCompte;
  const txRow = (t) => `<div class="u-tx"><i>${t.nom[0]}</i><b>${t.nom}</b>${mt(t.montant, 2, t.montant > 0 ? 'color:var(--t-acc)' : '', true)}<small>${t.cat} · ${t.date}</small><em>Exécutée</em></div>`;

  /* 1. Compte pro : solde et transactions */
  SC.solde = (o = {}) => `<div class="ui${th(o)}">${status()}${top()}<div class="u-col">
    <div class="u-card dense" style="padding:18px 20px 18px;flex:none">
      <div style="display:flex;justify-content:space-between;align-items:center"><span class="cap" style="opacity:.75">Solde disponible</span><span class="cap" style="opacity:.75;display:flex;align-items:center;gap:6px">${ic(I.lien, 'currentColor', 12, 1.8)}Qonto connecté</span></div>
      <div class="mt" style="font-size:44px;font-weight:500;letter-spacing:-.06em;margin-top:12px;line-height:1">${E(D.solde)}</div>
      ${A.jauge({ h: 8, p: r2((D.comptes[0].solde / D.solde) * 100), pas: 4, style: 'margin-top:18px' })}
      <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:10px;margin-top:11px">${D.comptes.map((c) => `<div><div style="font-size:12.5px;opacity:.75">${c.nom}</div>${mt(c.solde, 2, 'display:block;font-size:15px;font-weight:500;margin-top:3px')}</div>`).join('')}</div>
    </div>
    <div style="display:flex;gap:8px;margin-right:-16px;overflow:hidden;flex:none"><span class="u-chip on">Tous les comptes</span><span class="u-chip">${ic(I.filtres, 'currentColor', 15)}Filtres</span><span class="u-chip">${ic(I.colonnes, 'currentColor', 15)}Gérer les colonnes</span></div>
    <div class="u-field">${ic(I.recherche, 'currentColor', 17)}Rechercher une transaction…</div>
    <div style="display:flex;justify-content:space-between;margin:6px 4px -2px;flex:none"><span class="cap">Transactions</span><span class="cap">Novembre 2026</span></div>
    <div class="u-card" style="padding:4px 2px;flex:none">${D.transactions.slice(0, o.n || 6).map(txRow).join('<div class="u-line" style="margin:0 14px"></div>')}</div>
  </div><div class="home"></div></div>`;

  /* 2. Planning : le compte rendu d'activité du mois. opts : jusqu (dernier jour saisi), valide, clair.
     Validé (défaut) : la facture F-2026-010 et son total. En saisie ({ valide: false }) : pas encore de facture ; le montant se calcule à mesure (jours cochés × TJM). */
  SC.cra = (o = {}) => { const K = D.cra, j = o.jusqu == null ? 31 : o.jusqu, ok = o.valide == null ? true : o.valide, nf = ok ? K.factures : craCompte(j).factures;
    const li = (a, b, fort) => `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:${fort ? '10px 0 2px' : '6px 0'};font-size:14px"><span style="${fort ? 'font-weight:600' : 'color:var(--t-tx2)'}">${a}</span>${mt(b, 2, fort ? 'font-size:24px;font-weight:500;letter-spacing:-.04em;color:var(--t-acc)' : 'font-weight:500')}</div>`;
    return `<div class="ui${th(o)}">${status()}${top()}<div class="u-col">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;flex:none"><div><div class="cap">Planning · Compte rendu d'activité</div><div class="u-h" style="font-size:34px;margin-top:7px">${K.mois}</div></div><span class="u-pill ${ok ? 'ok' : 'att'}" style="margin-bottom:7px">${ok ? 'Validé' : 'En cours'}</span></div>
    <div class="u-card" style="padding:12px 0 16px;display:grid;justify-items:center;gap:13px;flex:none">${A.cra({ cell: 44, gap: 5, jusqu: j })}${legendeCra(12)}</div>
    <div class="u-card" style="padding:11px 18px 14px;flex:none">${li('Jours ouvrés', K.ouvres + ' jours')}${li(ok ? 'Jours facturés' : 'Jours cochés', nf + ' jours')}${li('TJM', K.tjm)}<div class="u-line" style="margin:5px 0 0"></div>${ok ? li(`Facture ${K.facture} · HT`, K.ht, true) : li('Montant à ce jour · HT', nf * K.tjm, true)}</div>
    <div class="u-btn">${ok ? ic(I.check, 'currentColor', 17, 2.2) + 'Facture générée' : 'Valider le CRA'}</div>
    <div class="cap" style="text-align:center;line-height:1.6;flex:none">${ok ? 'Votre CRA devient une facture.<br>Zéro ressaisie.' : 'Le montant suit vos jours cochés.<br>La facture part à la validation.'}</div>
  </div><div class="home"></div></div>`; };

  /* 2 bis. Factures : la facture générée à la validation du CRA (F-2026-010). opts : clair */
  SC.facture = (o = {}) => { const K = D.cra;
    const li = (a, b, txt) => `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:7px 0;font-size:14px"><span style="color:var(--t-tx2)">${a}</span><span class="${txt ? '' : 'mt'}" style="font-weight:500">${b}</span></div>`;
    const lien = (icone, t, s, droite) => `<div class="u-card" style="padding:13px 16px;flex:none;display:flex;align-items:center;gap:12px"><span style="width:38px;height:38px;border-radius:12px;background:var(--t-carte2);display:grid;place-items:center;color:var(--t-acc);flex:none">${ic(I[icone], 'currentColor', 18)}</span>
      <div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14.5px;white-space:nowrap">${t}</div><div style="font-size:12px;color:var(--t-tx2);margin-top:2px">${s}</div></div>${droite}</div>`;
    return `<div class="ui${th(o)}">${status()}${top()}<div class="u-col">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;flex:none"><div><div class="cap">Factures · générée depuis le CRA</div>
      <div class="mt" style="font-size:30px;font-weight:500;letter-spacing:-.07em;margin-top:9px;white-space:nowrap">${K.facture}</div></div><span class="u-pill ok" style="margin-bottom:6px">PDF prêt</span></div>
    <div class="u-card" style="padding:9px 18px 11px;flex:none">${li('Client', D.mission.client, 1)}${li('Période', K.mois, 1)}${li('Jours facturés', K.factures + ' jours')}${li('TJM', E(K.tjm))}</div>
    <div class="u-card dense" style="padding:16px 18px 16px;flex:none"><div class="cap" style="opacity:.75">Montant HT</div>
      <div class="mt" style="display:block;font-size:40px;font-weight:500;letter-spacing:-.06em;margin-top:10px;line-height:1">${E(K.ht)}</div>
      <div class="mt" style="display:block;font-size:12px;margin-top:12px;opacity:.8">TVA 20${NB}% ${E(K.tva)} · TTC ${E(K.ttc)}</div></div>
    ${lien('document', `Facture ${K.facture}.pdf`, `${D.mission.client} · ${K.mois}`, ic(I.chevron, 'currentColor', 15))}
    ${lien('cashout', 'Frais pro · 3 cash-outs', 'Kilomètres, repas, abonnements', mt(D.cashouts.calcules[1].montant, 2, 'font-size:14px;font-weight:500'))}
    <div class="u-btn">${ic(I.telecharger, 'currentColor', 17, 2)}Télécharger le PDF</div>
    <div class="cap" style="text-align:center;line-height:1.6;flex:none">Générée à la validation du CRA.<br>Zéro ressaisie.</div>
  </div><div class="home"></div></div>`; };

  /* 2 ter. Tableau de bord sur téléphone : mêmes données que desk.bord. opts : p, anim, clair */
  SC.bord = (o = {}) => { const X = D.exercice, p = o.p == null ? A.PART.apres : o.p, tva = D.obligations[0];
    const kv = (k, v) => `<div style="display:flex;flex-direction:column;gap:6px;min-width:0"><span class="cap">${k}</span>${v}</div>`, sv = 'font-size:15px;font-weight:500;letter-spacing:-.03em';
    return `<div class="ui${th(o)}">${status()}${top()}<div class="u-col">
    <div style="flex:none"><div class="cap">Simulation · exercice ${X.annee}</div><div class="u-h" style="font-size:34px;margin-top:7px">Tableau de bord</div></div>
    <div class="u-card" style="padding:16px 18px 16px;flex:none">
      <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600;font-size:15px;letter-spacing:-.015em">La part qui vous revient</span><span class="u-pill ok">Jusqu'à 85${NB}%</span></div>
      <div class="chiffre" style="font-size:100px;color:var(--t-acc);margin-top:16px"><span data-j="val">${Math.round(p)}</span><span class="pct">%</span></div>
      ${A.jauge({ forme: 'segments', n: 50, p, repere: A.PART.avant, h: 30, g: 2, anim: o.anim, style: 'margin-top:16px' })}
      <div style="display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:8px;margin-top:16px">${kv('Vous revient', `<span class="mt" style="${sv};color:var(--t-acc)"><span data-j="eur" data-base="${X.facture}">${E((X.facture * p) / 100, 0)}</span></span>`)}${kv('Facturé HT', mt(X.facture, 0, sv))}${kv('Sans Payout', mt(X.avant, 0, sv + ';opacity:.45'))}</div></div>
    <div class="u-card dense" style="padding:16px 18px 16px;flex:none">
      <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600;font-size:15px">Trésorerie</span><span class="cap" style="opacity:.75;display:flex;align-items:center;gap:6px">${ic(I.lien, 'currentColor', 12, 1.8)}Qonto connecté</span></div>
      <div class="mt" style="display:block;font-size:34px;font-weight:500;letter-spacing:-.06em;margin-top:12px;line-height:1">${E(D.solde)}</div>
      ${A.jauge({ h: 8, p: r2((D.comptes[0].solde / D.solde) * 100), pas: 4, style: 'margin-top:14px' })}</div>
    <div class="u-card" style="padding:12px 18px;flex:none;display:flex;justify-content:space-between;align-items:center;gap:10px">
      <div style="min-width:0"><div style="font-weight:600;font-size:14.5px">${tva.nom}</div><div style="font-size:12px;color:var(--t-tx2);margin-top:2px">${tva.detail}</div></div>
      <div style="display:grid;justify-items:end;gap:5px;flex:none">${mt(tva.montant, 2, 'font-size:14px;font-weight:500')}<span class="u-pill ${tonSobre(tva.ton)}">${tva.statut}</span></div></div>
    <div class="u-card" style="padding:4px 18px;flex:none">${D.factures.slice(0, 2).map((x, i) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;${i ? 'border-top:1px solid var(--t-filet)' : ''}"><div style="min-width:0"><div class="mt" style="font-size:13px;font-weight:500;letter-spacing:-.04em">${x.ref}</div><div style="font-size:12px;color:var(--t-tx2);margin-top:3px">${x.client} · ${x.objet}</div></div><div style="display:grid;justify-items:end;gap:5px;flex:none">${mt(x.ht, 2, 'font-size:14px;font-weight:500')}<span class="u-pill ${x.ton}">${x.statut}</span></div></div>`).join('')}</div>
  </div><div class="home"></div></div>`; };

  /* 3. Cash-Out : les remboursements de frais par mois */
  SC.cashouts = (o = {}) => { const K = D.cashouts;
    const row = (x) => `<div style="display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:13px 0;border-top:1px solid var(--t-filet)"><div><div style="font-weight:600;font-size:15px">${x.periode}</div><div style="font-size:12px;color:var(--t-tx2);margin-top:2px">${x.nombre} cash-outs</div></div>${mt(x.montant, 2, 'font-size:14.5px;font-weight:500')}<span class="u-pill ${x.statut === 'Payé' ? 'ok' : 'att'}">${x.statut}</span></div>`;
    const bloc = (t, s, rows) => `<div class="u-card" style="padding:15px 18px 3px;flex:none"><div style="font-weight:600;font-size:16px;letter-spacing:-.015em">${t}</div><div style="font-size:12.5px;color:var(--t-tx2);margin:2px 0 11px">${s}</div>${rows.map(row).join('')}</div>`;
    return `<div class="ui${th(o)}">${status()}${top()}<div class="u-col">
    <div style="flex:none"><div class="cap">Activité · ${K.mois} mois</div><div class="u-h" style="font-size:34px;margin-top:7px">Cash-Outs</div><div style="font-size:14px;color:var(--t-tx2);margin-top:5px">Consultez vos remboursements par mois</div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:none">
      <div class="u-card" style="padding:14px 16px"><div class="cap">Total remboursé</div>${mt(K.rembourse, 2, 'display:block;font-size:21px;font-weight:500;letter-spacing:-.04em;margin-top:8px')}</div>
      <div class="u-card dense" style="padding:14px 16px"><div class="cap" style="opacity:.75">À venir</div>${mt(K.avenir, 2, 'display:block;font-size:21px;font-weight:500;letter-spacing:-.04em;margin-top:8px')}</div></div>
    ${bloc('Cash-Outs calculés', 'Montants théoriques', K.calcules)}${bloc('Cash-Outs payés', 'Historique des remboursements', K.payes)}
    <div class="u-btn">${ic(I.plus, 'currentColor', 17, 2)}Nouveau Cash-Out</div>
    <div class="cap" style="text-align:center;line-height:1.6;flex:none">Kilomètres, repas, abonnements${NB}:<br>calculés depuis le CRA.</div>
  </div><div class="home"></div></div>`; };

  /* 4. Simulateur : de 54 à 85. opts : p (valeur de la jauge, 85 par défaut), anim (jauge et montants pilotés par seekJauge), clair */
  SC.simulateur = (o = {}) => { const K = D.simulateur, p = o.p == null ? A.PART.apres : o.p;
    const sl = (lb, v, q) => `<div style="padding:10px 0 3px"><div style="display:flex;justify-content:space-between;align-items:baseline;font-size:14px;font-weight:500"><span style="color:var(--t-tx2)">${lb}</span>${mt(v, 0, 'font-size:16px;font-weight:500')}</div><div class="u-range"><b style="width:${q}%"></b><i style="left:${q}%"></i></div></div>`;
    return `<div class="ui${th(o)}">${status()}${top()}<div class="u-col">
    <div style="flex:none"><div class="cap">Simulateur · après impôts</div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:10px"><div class="chiffre" style="font-size:112px;color:var(--t-acc)"><span data-j="val">${Math.round(p)}</span><span class="pct">%</span></div>
        <div style="text-align:right;padding-bottom:6px"><div class="cap">Sans Payout</div><div class="mt" style="font-size:20px;font-weight:500;color:var(--t-due);margin-top:4px">54${NB}%</div></div></div></div>
    ${A.jauge({ forme: 'segments', n: 50, p, avant: A.PART.avant, h: 44, g: 2, anim: o.anim, c4: 'var(--t-tx)', style: 'flex:none' })}
    <div class="u-card" style="padding:16px 18px 16px;flex:none"><div class="cap">Votre revenu net optimisé · par mois</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:10px"><div class="mt" style="font-size:38px;font-weight:500;letter-spacing:-.06em;line-height:1;color:var(--t-acc)"><span data-j="eur" data-base="${K.facture}">${E((K.facture * p) / 100, 0)}</span></div>
        <div style="text-align:right;font-size:12.5px;color:var(--t-tx2);line-height:1.35">au lieu de ${mt(K.avant, 0, 'color:var(--t-tx)')}<br><span class="mt" style="color:var(--t-acc)">+<span data-j="ecart" data-base="${K.facture}">${E((K.facture * (p - A.PART.avant)) / 100, 0)}</span></span> par mois</div></div></div>
    <div class="u-card" style="padding:8px 18px 12px;flex:none">${sl('TJM', K.tjm, 50)}${sl('Jours travaillés par mois', K.jours + ' jours', 87)}${sl('Mois', K.mois + ' mois', 100)}</div>
    <div class="u-btn">Je me lance${ic(I.fleche, 'currentColor', 17, 2)}</div>
    <div class="cap" style="text-align:center;line-height:1.6;flex:none">Simulation indicative, jusqu'à 85${NB}% du TJM,<br>pour un freelance en SASU.</div>
  </div><div class="home"></div></div>`; };
  A.screens = SC;

  /* ---------- Écrans d'ordinateur (1440 × 900) : le cockpit (app.payout.fr) et le site vitrine (payout.fr). Sombre par défaut, { clair: true } pour la variante. ---------- */
  const DK = {};
  const MENU = [['Simulation', [['Tableau de bord', 'maison'], ['Comparatif', 'comparatif'], ['Planning', 'planning'], ['Trésorerie', 'tresorerie']]],
    ['Activité', [['Mon entreprise', 'entreprise'], ['Compte pro', 'compte'], ['Factures', 'factures'], ['Cash-Out', 'cashout'], ['Payout', 'payout'], ['Drive', 'drive']]]];
  A.MENU = MENU;
  const shell = (on, main, o) => `<div class="d-app${th(o)}"><div class="d-side"><div class="d-logo" style="color:var(--t-acc)">${A.wordmark('currentColor')}</div>` +
    MENU.map(([g, its]) => `<div class="d-grp"><span>${g}</span>${ic(I.haut, 'currentColor', 12)}</div>` + its.map(([n, i]) =>
      `<div class="d-it${n === on ? ' on' : ''}">${i === 'payout' ? A.symbol('currentColor', 'width="12" height="17" style="margin:0 3px;flex:none"') : ic(I[i])}${n}</div>`).join('')).join('') +
    ['Gestion de la paie', 'Obligations déclaratives', 'Ressources'].map((g) => `<div class="d-grp"><span>${g}</span>${ic(I.bas, 'currentColor', 12)}</div>`).join('') +
    `<div class="d-user"><i>${D.freelance.initiales}</i><div><b>${D.freelance.prenom} ${D.freelance.nom}</b><span>${D.freelance.mail}</span></div></div></div><div class="d-main">${main}</div></div>`;
  const hd = (t, s, act = '') => `<div class="d-hd"><div><h1>${t}</h1><p>${s}</p></div><div class="d-act">${act}</div></div>`;
  const pill = (x, ton) => `<span class="d-pill ${ton || (x === 'Payé' || x === 'Payée' ? 'ok' : 'att')}">${x}</span>`;

  /* 1. Tableau de bord (Simulation). opts : p, anim, clair */
  DK.bord = (o = {}) => { const X = D.exercice, T = D.tva, p = o.p == null ? A.PART.apres : o.p;
    return shell('Tableau de bord', hd('Tableau de bord', `Simulation · exercice ${X.annee} · ${D.freelance.societe}, ${D.freelance.forme}`,
      `<span class="d-btn ghost">${X.annee}${ic(I.bas, 'currentColor', 13)}</span><span class="d-btn ghost">${ic(I.telecharger, 'currentColor', 15)}Exporter</span><span class="d-btn">${ic(I.plus, 'currentColor', 15, 2)}Nouveau Cash-Out</span>`) +
    `<div style="display:grid;grid-template-columns:1fr 348px;gap:16px">
      <div class="d-card" style="padding:22px 26px 20px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2>La part qui vous revient</h2><p>${X.jours} jours facturés à ${mt(D.mission.tjm, 0)} HT, après impôts</p></div><span class="d-pill ok">Jusqu'à 85${NB}% du TJM</span></div>
        <div style="display:flex;align-items:flex-end;gap:44px;margin-top:22px">
          <div class="chiffre" style="font-size:136px;color:var(--t-acc)"><span data-j="val">${Math.round(p)}</span><span class="pct">%</span></div>
          <div style="display:flex;gap:36px;padding-bottom:4px">
            <div><div class="d-k">Ce qui vous revient</div><div class="d-v" style="color:var(--t-acc);margin-top:8px"><span data-j="eur" data-base="${X.facture}">${E((X.facture * p) / 100, 0)}</span></div></div>
            <div><div class="d-k">Facturé HT</div><div class="d-v" style="margin-top:8px">${E(X.facture, 0)}</div></div>
            <div><div class="d-k">Sans Payout · 54${NB}%</div><div class="d-v" style="margin-top:8px;opacity:.45">${E(X.avant, 0)}</div></div></div></div>
        ${A.jauge({ forme: 'segments', p, repere: A.PART.avant, h: 38, g: 3, anim: o.anim, style: 'margin-top:24px' })}
        <div style="position:relative;height:14px;margin-top:10px;white-space:nowrap" class="d-k"><span style="position:absolute;left:0">0</span><span style="position:absolute;left:54%;transform:translateX(-50%)">54${NB}% sans Payout</span><span style="position:absolute;right:15%;padding-right:8px;opacity:1;color:var(--t-acc)">85${NB}% avec Payout</span><span style="position:absolute;right:0">100</span></div>
      </div>
      <div class="d-card dense" style="padding:22px 24px;display:flex;flex-direction:column">
        <div style="display:flex;justify-content:space-between;align-items:center"><h2>Trésorerie</h2><span class="d-k" style="opacity:.8;display:flex;align-items:center;gap:6px">${ic(I.lien, 'currentColor', 12, 1.8)}Qonto connecté</span></div>
        <div class="d-k" style="margin-top:24px;opacity:.75">Solde disponible · tous les comptes</div>
        <div class="d-v" style="font-size:42px;letter-spacing:-.06em;margin-top:10px">${E(D.solde)}</div>
        ${A.jauge({ h: 10, p: r2((D.comptes[0].solde / D.solde) * 100), pas: 5, style: 'margin-top:20px' })}
        <div style="margin-top:auto">${D.comptes.map((c) => `<div class="d-row"><span>${c.nom}</span>${mt(c.solde, 2, 'font-weight:500')}</div>`).join('')}</div>
      </div></div>
    <div style="display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:16px;margin-top:16px">
      <div class="d-card"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2>Facturé par mois</h2><p>En euros HT · ${X.annee}</p></div>
          <div class="d-k" style="display:flex;gap:14px;padding-top:4px;opacity:.8"><span style="display:flex;gap:6px;align-items:center"><i style="width:9px;height:9px;background:var(--t-plein)"></i>Gardé</span><span style="display:flex;gap:6px;align-items:center"><i style="width:9px;height:9px;background:repeating-linear-gradient(-45deg,var(--t-part) 0 1.2px,transparent 1.2px 4px)"></i>Ce qui part</span></div></div>
        <div style="margin-top:20px">${A.colonnes(X.mois, { h: 336, p, gap: 8, anim: o.anim })}</div></div>
      <div class="d-card" style="display:flex;flex-direction:column"><h2>Obligations déclaratives</h2><p>TVA, déclarations, échéances</p><div style="margin-top:10px">${D.obligations.map((x) => `<div class="d-row"><div style="min-width:0"><b>${x.nom}</b><small>${x.detail}</small></div><div style="display:grid;justify-items:end;gap:5px;flex:none">${x.montant ? mt(x.montant, 2, 'font-size:13px;font-weight:500') : ''}${pill(x.statut, tonSobre(x.ton))}</div></div>`).join('')}</div>
        <div style="margin-top:auto;padding:14px 16px;border-radius:14px;background:var(--t-carte2)"><div class="d-k">TVA d'octobre · déductible sur collectée</div>${A.jauge({ h: 8, p: r2((T.deductible / T.collectee) * 100), pas: 4, style: 'margin-top:11px' })}
          <div style="display:flex;justify-content:space-between;margin-top:9px;font-size:12px"><span>${mt(T.deductible, 2, 'font-weight:500')}</span><span>${mt(T.collectee, 2, 'font-weight:500')}</span></div></div></div>
      <div class="d-card" style="display:flex;flex-direction:column"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2>Factures</h2><p>Générées depuis le CRA</p></div><span class="d-k" style="padding-top:4px">4 sur 11</span></div>
        <div style="margin-top:10px">${D.factures.map((x) => `<div class="d-row"><div style="min-width:0"><b class="mono" style="font-weight:500;font-size:12.5px">${x.ref}</b><small>${x.client} · ${x.objet}</small></div><div style="display:grid;justify-items:end;gap:5px;flex:none">${mt(x.ht, 2, 'font-size:13px;font-weight:500')}${pill(x.statut, x.ton)}</div></div>`).join('')}</div>
        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-radius:14px;background:var(--t-carte2)"><div><div class="d-k">Prochain Cash-Out · octobre</div><div class="d-v" style="font-size:20px;margin-top:6px">${E(D.cashouts.calcules[1].montant)}</div></div>${pill('À venir')}</div></div>
    </div>`, o); };

  /* 2. Cash-Outs */
  DK.cashouts = (o = {}) => { const K = D.cashouts;
    const tab = (rows) => `<table class="d-tab d-serre"><tr><th style="width:36%">Période</th><th style="width:22%">Nombre</th><th style="width:20%">Montant</th><th>Statut</th><th class="r">Actions</th></tr>` +
      rows.map((x) => `<tr><td><span style="display:flex;align-items:center;gap:10px"><span style="color:var(--t-acc);display:flex">${ic(I.planning, 'currentColor', 16)}</span>${x.periode}</span></td><td style="font-weight:400;color:var(--t-tx2)">${x.nombre} cash-outs</td><td class="mt">${E(x.montant)}</td><td>${pill(x.statut)}</td><td class="r">${ic(I.chevron, 'currentColor', 14)}</td></tr>`).join('') + `</table>`;
    const stat = (k, v, dense) => `<div class="d-card${dense ? ' dense' : ''}" style="padding:16px 22px 18px"><div class="d-k">${k}</div><div class="d-v" style="font-size:30px;letter-spacing:-.05em;margin-top:10px">${v}</div></div>`;
    return shell('Cash-Out', hd('Cash-Outs', 'Consultez vos remboursements par mois', `<span class="d-btn">${ic(I.plus, 'currentColor', 15, 2)}Nouveau Cash-Out</span>`) +
    `<div style="display:grid;grid-template-columns:1fr 340px;gap:22px;align-items:start"><div style="display:grid;gap:12px">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${stat('Total remboursé', E(K.rembourse))}${stat('À venir', E(K.avenir), true)}${stat('Nombre de mois', K.mois)}</div>
      <div class="d-card" style="padding-bottom:6px"><h2>Cash-Outs calculés</h2><p>Montants théoriques</p><div style="margin-top:4px">${tab(K.calcules)}</div></div>
      <div class="d-card" style="padding-bottom:6px"><h2>Cash-Outs payés</h2><p>Historique des remboursements</p><div style="margin-top:4px">${tab(K.payes)}</div></div>
      <div class="d-card" style="padding-bottom:6px"><h2>Détail d'octobre</h2><p>Calculé depuis le CRA validé</p><div style="margin-top:4px"><table class="d-tab d-serre"><tr><th style="width:36%">Type</th><th style="width:42%">Base</th><th>Montant</th></tr>${[['Indemnités kilométriques', '14 trajets sur site', 0], ['Frais de repas', '20 jours facturés', 1], ['Abonnements', '3 abonnements', 2]].map(([n, b, i]) => `<tr><td>${n}</td><td style="font-weight:400;color:var(--t-tx2)">${b}</td><td class="mt">${E(K.detail[i][1])}</td></tr>`).join('')}</table></div></div></div>
      ${A.decompte({ titre: 'Cash-Out d\'octobre', ref: 'Résumé financier', date: 'Octobre 2026', lignes: K.detail, total: ['Montant total', K.calcules[1].montant], p: null, pied: ['3 cash-outs', 'À venir'], clair: !!o.clair, extra: o.clair ? '' : 'background:var(--t-carte)' })}</div>`, o); };

  /* 3. Planning : le CRA au calendrier, qui génère la facture. opts : jusqu, clair, valide (false : CRA en saisie, montant à ce jour, pas encore de facture) */
  DK.cra = (o = {}) => { const K = D.cra, j = o.jusqu == null ? 31 : o.jusqu, saisie = o.valide === false, cc = craCompte(j);
    const li = (a, b) => `<div class="d-row"><span style="color:var(--t-tx2)">${a}</span>${mt(b, 2, 'font-weight:500')}</div>`;
    const etapes = saisie ? [['Activité mensuelle', 'cours', 'En cours'], ['Résumé financier', 'apres', ''], ['Bénéficiaire', 'apres', ''], ['Validation', 'apres', '']]
      : [['Activité mensuelle', 'fait', 'Validé'], ['Résumé financier', 'cours', 'En cours'], ['Bénéficiaire', 'apres', ''], ['Validation', 'apres', '']];
    if (saisie) return shell('Planning', hd('Compte rendu d\'activité', `Planning · ${K.mois} · ${D.mission.client}`, `<span class="d-btn ghost">${K.mois}${ic(I.bas, 'currentColor', 13)}</span><span class="d-btn">${ic(I.check, 'currentColor', 15, 2)}Valider le CRA</span>`) +
    `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">${etapes.map(([n, e, s], i) => `<div class="d-step ${e}"><span><span class="mono" style="opacity:.5;margin-right:10px">0${i + 1}</span>${n}</span>${s ? pill(s, 'cours') : ''}</div>`).join('')}</div>
    <div style="display:grid;grid-template-columns:1fr 370px;gap:16px;align-items:start">
      <div class="d-card" style="padding:20px 22px 22px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><h2>${K.mois}</h2>${legendeCra(12.5)}</div>
        <div style="display:grid;justify-content:center">${A.cra({ cell: 84, cw: 92, gap: 8, jusqu: j })}</div></div>
      <div style="display:grid;gap:16px"><div class="d-card"><h2>Résumé financier</h2><p>${K.mois} · en saisie</p>
          <div style="margin-top:8px">${li('Jours ouvrés', K.ouvres + ' jours')}${li('Jours cochés', cc.factures + ' jours')}${li('dont télétravail', cc.tele + ' jours')}${li('TJM', K.tjm)}</div>
          <div class="d-card dense" style="margin-top:14px;padding:16px 18px;border-radius:14px"><div class="d-k" style="opacity:.8">Montant à ce jour · HT</div><div class="d-v" style="font-size:36px;letter-spacing:-.06em;margin-top:8px">${E(cc.factures * K.tjm)}</div>
            <div class="mono" style="font-size:11px;margin-top:9px;opacity:.8">Jours cochés × TJM</div></div></div>
        <div class="d-card" style="padding:12px 22px"><div class="d-row"><div><b>Facture</b><small>Générée à la validation du CRA</small></div>${pill('À venir', 'att')}</div></div></div></div>`, o);
    /* CRA validé (défaut) */
    return shell('Planning', hd('Compte rendu d\'activité', `Planning · ${K.mois} · ${D.mission.client}`, `<span class="d-btn ghost">${K.mois}${ic(I.bas, 'currentColor', 13)}</span><span class="d-btn">${ic(I.check, 'currentColor', 15, 2)}Valider le CRA</span>`) +
    `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">${etapes.map(([n, e, s], i) => `<div class="d-step ${e}"><span><span class="mono" style="opacity:.5;margin-right:10px">0${i + 1}</span>${n}</span>${s ? pill(s, e === 'fait' ? 'ok' : 'cours') : ''}</div>`).join('')}</div>
    <div style="display:grid;grid-template-columns:1fr 370px;gap:16px;align-items:start">
      <div class="d-card" style="padding:20px 22px 22px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><h2>${K.mois}</h2>${legendeCra(12.5)}</div>
        <div style="display:grid;justify-content:center">${A.cra({ cell: 84, cw: 92, gap: 8, jusqu: j })}</div></div>
      <div style="display:grid;gap:16px"><div class="d-card"><h2>Résumé financier</h2><p>${K.mois}</p>
          <div style="margin-top:8px">${li('Jours ouvrés', K.ouvres + ' jours')}${li('Jours facturés', K.factures + ' jours')}${li('dont télétravail', K.tele.length + ' jours')}${li('TJM', K.tjm)}</div>
          <div class="d-card dense" style="margin-top:14px;padding:16px 18px;border-radius:14px"><div class="d-k" style="opacity:.8">Montant facturé HT</div><div class="d-v" style="font-size:36px;letter-spacing:-.06em;margin-top:8px">${E(K.ht)}</div>
            <div class="mono" style="font-size:11px;margin-top:9px;opacity:.8;word-spacing:-.25em">TVA 20${NB}% ${E(K.tva)} · TTC ${E(K.ttc)}</div></div></div>
        <div class="d-card" style="padding:12px 22px"><div class="d-row"><div><b>Facture ${K.facture}</b><small>Générée à la validation du CRA</small></div>${pill('PDF', 'ok')}</div>
          <div class="d-row"><div><b>Frais pro · 3 cash-outs</b><small>Kilomètres, repas, abonnements</small></div>${mt(D.cashouts.calcules[1].montant, 2, 'font-weight:500')}</div></div></div></div>`, o); };

  /* 4. Site vitrine : la page de lancement et son simulateur (payout.fr). opts : p, anim, clair */
  const simulateur = (o = {}) => { const K = D.simulateur, p = o.p == null ? A.PART.apres : o.p;
    const sl = (lb, v, q) => `<div style="padding:9px 0 3px"><div class="d-sl"><span style="color:var(--t-tx2)">${lb}</span>${mt(v, 0, 'font-size:16px;font-weight:500')}</div><div class="u-range"><b style="width:${q}%"></b><i style="left:${q}%"></i></div></div>`;
    return `<div class="d-sim"><div style="display:flex;justify-content:space-between;align-items:center"><span class="d-k">Simulateur · après impôts</span><span class="d-pill ok">SASU</span></div>
      <div style="margin-top:10px">${sl('TJM', K.tjm, 50)}${sl('Jours travaillés par mois', K.jours + ' jours', 87)}${sl('Mois', K.mois + ' mois', 100)}</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:20px"><div><div class="d-k">Votre revenu net optimisé · par mois</div>
          <div class="chiffre" style="font-size:66px;color:var(--t-acc);margin-top:12px"><span data-j="eur" data-base="${K.facture}">${E((K.facture * p) / 100, 0)}</span></div></div>
        <div style="text-align:right;font-size:13px;line-height:1.5;color:var(--t-tx2)">au lieu de<br><span class="mt" style="font-size:19px;font-weight:500;color:var(--t-due)">${E(K.avant, 0)}</span></div></div>
      ${A.jauge({ forme: 'segments', n: 50, p, avant: A.PART.avant, h: 34, g: 2, anim: o.anim, c4: 'var(--t-tx)', style: 'margin-top:20px' })}
      <div style="display:flex;justify-content:space-between;margin-top:10px" class="d-k"><span>54${NB}% sans Payout</span><span style="opacity:1;color:var(--t-acc)">jusqu'à <span data-j="val">${Math.round(p)}</span>${NB}%</span></div>
      <div class="d-btn grand" style="margin-top:20px;width:100%">Je me lance${ic(I.fleche, 'currentColor', 17, 2)}</div></div>`; };
  const nav = () => `<div class="d-nav"><span style="color:var(--t-acc);display:flex;margin-right:14px">${A.wordmark('currentColor', 'style="height:44px;width:auto"')}</span><span>Le modèle Payout</span><span>Simulateur</span><span>Tarifs</span><span class="d-sp"></span><span>Se connecter</span><span class="d-btn" style="height:42px;padding:0 20px;border-radius:21px">Tester mon éligibilité</span></div>`;
  const hero = (o = {}) => `<div class="grain" style="position:absolute;inset:0;overflow:hidden">${o.clair ? '' : A.bandes({ n: 30, seed: 11, style: 'left:46%;top:18%;opacity:.9' })}</div>${nav()}
    <div style="position:absolute;left:56px;top:150px;width:700px;z-index:3">
      <span class="pilule mono" style="background:var(--t-carte);box-shadow:inset 0 0 0 1px var(--t-filet2)">Pour les freelances en SASU</span>
      <h1 class="d-t1" style="margin-top:26px">Gardez jusqu'à</h1>
      <div class="chiffre" style="font-size:232px;color:var(--t-acc);margin:10px 0 6px -10px">85<span class="pct">%</span></div>
      <h1 class="d-t1">de votre TJM.</h1>
      <p class="d-lead" style="margin-top:28px;width:520px;color:var(--t-tx2)">Aujourd'hui, un freelance en SASU en garde 54${NB}%. Payout réunit vos comptes, votre CRA, votre TVA et vos déclarations dans un seul cockpit, et vous verse votre part.</p>
      <div style="display:flex;gap:10px;margin-top:30px"><span class="d-btn grand">Tester mon éligibilité</span><span class="d-btn grand ghost">Simuler mon revenu${ic(I.fleche, 'currentColor', 17, 2)}</span></div>
    </div>
    <div style="position:absolute;left:836px;top:128px;width:548px;z-index:3">${simulateur(o)}</div>`;
  DK.site = (o = {}) => `<div class="d-site${th(o)}">${hero(o)}
    <div style="position:absolute;left:56px;right:56px;bottom:22px;display:flex;justify-content:space-between;z-index:3" class="d-k"><span>Comptes Qonto connectés</span><span>Le CRA devient la facture</span><span>TVA et déclarations centralisées</span><span>Zéro ressaisie</span></div></div>`;

  /* 5. Le site en longueur (1440 × SITE_H) : lancement, la proportion, les trois gestes, le cockpit, l'appel final */
  DK.SITE_H = 3560;
  DK.sitePage = (o = {}) => { const tri = [
      ['Facturer', 'Vous cochez vos jours. À la validation, votre CRA devient une facture, alimente vos frais pro et produit le PDF.', `<div class="theme clair" style="display:grid;justify-content:center;padding:6px 0">${A.cra({ cell: 34, gap: 5 })}</div>`],
      ['Déclarer', 'TVA collectée et déductible, échéances, récapitulatif annuel : tout se met à jour seul, au même endroit.', `<div class="theme clair">${D.obligations.slice(0, 3).map((x) => `<div class="d-row"><div><b>${x.nom}</b><small>${x.detail}</small></div>${pill(x.statut, tonSobre(x.ton))}</div>`).join('')}</div>`],
      ['Garder', 'Comptes Qonto, cash-outs, justificatifs : un seul cockpit. Vous voyez ce qui vous revient, et quand.', `<div style="display:grid;justify-content:center">${A.decompte({ k: 0.86, clair: true, extra: 'box-shadow:none;background:none;padding:0' })}</div>`]];
    return `<div class="d-site" style="position:relative;inset:auto;width:1440px;height:${DK.SITE_H}px">
    <div style="position:relative;height:900px;overflow:hidden">${hero(o)}</div>
    <div style="position:relative;height:760px;padding:110px 56px 0;border-top:1px solid var(--t-filet)">
      <div class="d-k" style="color:var(--t-acc);opacity:1">01 · Le modèle Payout</div>
      <div style="display:grid;grid-template-columns:560px 1fr;gap:80px;margin-top:26px"><div><div class="d-t2">Sur 100${NB}€ facturés,<br>jusqu'à 85${NB}€ pour vous.</div>
          ${A.bicolore('Un freelance en SASU garde aujourd\'hui <b>54' + NB + '%</b> de ce qu\'il facture. Avec Payout, <b class="vif">jusqu\'à 85' + NB + '%</b>. Le reste, le cockpit le calcule et le déclare à votre place.', 'margin-top:28px;font-size:22px;line-height:1.3;width:500px')}
          <div style="margin-top:44px">${A.passage({ taille: 84 })}</div></div>
        <div style="display:flex;gap:44px;align-items:flex-end;justify-content:flex-end">
          <div><div class="d-k" style="margin-bottom:14px">Aujourd'hui · 54 sur 100</div>${A.jauge({ forme: 'blocs', p: A.PART.avant, l: 236, g: 4, c: C.acier, c2: 'rgba(255,255,255,.3)' })}</div>
          <div><div class="d-k" style="margin-bottom:14px;opacity:1;color:var(--t-acc)">Avec Payout · jusqu'à 85 sur 100</div>${A.jauge({ forme: 'blocs', p: A.PART.apres, avant: A.PART.avant, l: 400, g: 6 })}</div></div></div></div>
    <div class="theme clair" style="position:relative;height:760px;padding:100px 56px 0;background:${C.releve};color:${C.coffre};border-radius:44px 44px 0 0">
      <div style="display:flex;justify-content:space-between;align-items:flex-end"><div><div class="d-k">02 · Facturer. Déclarer. Garder.</div><div class="d-t2" style="margin-top:24px">Trois gestes. Un seul outil.<br>Zéro ressaisie.</div></div>
        <div class="onglets" style="padding-bottom:8px">${['Facturer', 'Déclarer', 'Garder'].map((t, i) => `<span class="pilule${i ? '' : ' on'}" style="${i ? 'background:rgba(6,10,8,.07)' : `background:${C.coffre};color:${C.net}`}">${t}</span>`).join('')}</div></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:44px">${tri.map(([t, tx, v], i) => `<div style="background:#fff;border-radius:32px;padding:28px 30px;height:404px;display:flex;flex-direction:column"><div class="mono" style="font-size:11px;opacity:.5;letter-spacing:.06em">0${i + 1}</div><div style="font-size:30px;font-weight:500;letter-spacing:-.04em;margin-top:8px">${t}</div><p style="font-size:14.5px;line-height:1.42;opacity:.72;margin-top:8px;min-height:64px">${tx}</p><div style="margin-top:auto;height:206px;overflow:hidden;display:grid;align-content:end">${v}</div></div>`).join('')}</div></div>
    <div style="position:relative;height:780px;padding:100px 56px 0;overflow:hidden;background:${C.releve}"><div class="grain" style="position:absolute;inset:0;background:${C.coffre};border-radius:44px 44px 0 0;overflow:hidden">${A.halo('haut', 'opacity:.9;top:250px')}</div>
      <div style="position:relative;display:flex;justify-content:space-between;align-items:flex-end"><div><div class="d-k" style="color:var(--t-acc);opacity:1">03 · La web app</div><div class="d-t2" style="margin-top:24px">Un cockpit à la place<br>de trois outils.</div></div><p class="d-lead" style="width:420px;padding-bottom:6px;color:var(--t-tx2)">Banque, comptable et tableurs réunis dans une seule interface. Elle calcule, et elle déclenche à votre place.</p></div>
      <div style="position:absolute;left:140px;top:330px">${A.browser(DK.bord(o), 0.806, { url: 'app.payout.fr/tableau-de-bord' })}</div></div>
    <div class="g-vif grain" style="position:relative;height:360px;color:${SUR_NET};padding:0 56px;display:flex;align-items:center;justify-content:space-between">
      <div class="d-t1" style="font-size:84px">Gardez la part<br>qui vous revient.</div>
      <div style="display:grid;justify-items:end;gap:22px">${A.passage({ taille: 84, c: SUR_NET, avant: SUR_NET })}<span class="d-btn grand" style="background:${C.coffre};color:${C.net}">Tester mon éligibilité${ic(I.fleche, 'currentColor', 17, 2)}</span></div></div>
    </div>`; };
  A.desk = DK;

  /* Carte de message : une notification du cockpit */
  A.ncard = (title, text, o = {}) => `<div class="ncard"><div class="hd"><i>${A.symbol(SUR_NET)}</i><span>${title}</span><span class="cap">${o.heure || '9:41'}</span></div><div class="tx">${text}</div><div class="in"><span>${o.action || 'Ouvrir le cockpit'}</span>${ic(I.chevron, 'currentColor', 14, 2)}</div></div>`;

  /* Pied de planche : symbole + rubriques + année */
  A.foot = (a, b, color = SUR) => `<div class="pfoot" style="color:${color}">${A.symbol(color)}<span>${a}</span><span>${b}</span><span>2026©</span></div>`;

  /* Rapport de contraste entre deux couleurs (#RRGGBB) : sert au guide et au site */
  A.contraste = (a, b) => { const l = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }; const x = l(a), y = l(b); return Math.round(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)) * 10) / 10; };

  window.Marque = A;
})();
