/* Icônes Payout, jeu complet (une soixantaine) : celles du socle (Marque.ICONES) + celles-ci, au même trait.
   Grille de 18, trait de 1,6, bouts et angles arrondis, couleur du texte courant. Aucune icône d'une autre marque.
   À charger après brand/marque.js :  <script src="icones.js"></script>
   Icones.noms : tous les noms, dans l'ordre de la grille · Icones.svg(nom, couleur, taille, graisse) · Icones.ajout : les tracés ajoutés ici. */
(function () {
  const M = window.Marque;
  const AJOUT = {
    enveloppe: '<rect x="2" y="3.5" width="14" height="11" rx="2"/><path d="m2.5 5 6.5 5 6.5-5"/>',
    telephone: '<path d="M4 2.5h2.5l1.2 3.2-1.6 1.1a8.500 8.500 0 0 0 5.100 5.100l1.100-1.600 3.200 1.200V14a1.500 1.500 0 0 1-1.500 1.500A12.500 12.500 0 0 1 2.500 4 1.500 1.500 0 0 1 4 2.500Z"/>',
    alerte: '<path d="M9 2.5 16 15H2Z"/><path d="M9 7.500v3.500M9 13h.010"/>',
    info: '<circle cx="9" cy="9" r="6.500"/><path d="M9 8.500v4M9 5.800h.010"/>',
    aide: '<circle cx="9" cy="9" r="6.500"/><path d="M7 7a2 2 0 1 1 2.800 1.800c-.500.300-.800.700-.800 1.300v.400M9 12.800h.010"/>',
    oeil: '<path d="M1.500 9S4.200 3.500 9 3.500 16.500 9 16.500 9 13.800 14.500 9 14.500 1.500 9 1.500 9Z"/><circle cx="9" cy="9" r="2.300"/>',
    crayon: '<path d="M12 2.800 15.200 6 6.200 15H3v-3.200Z"/><path d="m10 4.800 3.200 3.200"/>',
    corbeille: '<path d="M2.500 4.500h13M7 4.500V2.800h4v1.700M4.200 4.500l.800 11h8l.800-11"/><path d="M7.500 8v4.500M10.500 8v4.500"/>',
    copier: '<rect x="6" y="6" width="9.500" height="9.500" rx="1.500"/><path d="M12 6V3.500A1 1 0 0 0 11 2.500H3.500a1 1 0 0 0-1 1V11a1 1 0 0 0 1 1H6"/>',
    envoyer: '<path d="M9 11.500v-9M5.500 6 9 2.500 12.500 6M3 15.500h12"/>',
    trombone: '<path d="m14.500 8.500-5.800 5.800a3.500 3.500 0 0 1-5-5l6.200-6.200a2.300 2.300 0 0 1 3.300 3.300L7 12.600a1.200 1.200 0 0 1-1.700-1.700l5.500-5.500"/>',
    signature: '<path d="M2.500 13.500c1.500-2 2.500-6 4-6s.500 5 2 5 1.500-2.500 3-2.500 1 1.500 2.500 1.500M2.500 16h13"/>',
    recu: '<path d="M4 2.500h10v13l-2-1.300-1.700 1.300L9 14.200l-1.300 1.300L6 14.200l-2 1.300Z"/><path d="M6.500 6h5M6.500 9h5"/>',
    sablier: '<path d="M4.500 2.500h9M4.500 15.500h9M5.500 2.500c0 4 7 4 7 6.500s-7 2.500-7 6.500M12.500 2.500c0 4-7 4-7 6.500s7 2.500 7 6.500"/>',
    synchro: '<path d="M15 9a6 6 0 0 1-10.600 3.900M3 9a6 6 0 0 1 10.600-3.900"/><path d="M13.800 2.200v3h-3M4.200 15.800v-3h3"/>',
    hausse: '<path d="m2.500 13 4.500-4.500 3 3 5.500-5.500"/><path d="M11.500 6h4v4"/>',
    baisse: '<path d="m2.500 5 4.500 4.500 3-3 5.500 5.500"/><path d="M11.500 12h4V8"/>',
    pieces: '<ellipse cx="7" cy="5" rx="4.500" ry="2"/><path d="M2.500 5v3c0 1.100 2 2 4.500 2s4.500-.900 4.500-2V5M2.500 8v3c0 1.100 2 2 4.500 2"/><path d="M11.500 9.500c2.200.100 4 1 4 2v2.500c0 1.100-2 2-4.500 2s-4.500-.900-4.500-2"/>',
    balance: '<path d="M9 2.500v13M5 15.500h8M3.500 5h11"/><path d="m3.500 5-2 5a2 2 0 0 0 4 0ZM14.500 5l-2 5a2 2 0 0 0 4 0Z"/>',
    cible: '<circle cx="9" cy="9" r="6.500"/><circle cx="9" cy="9" r="3.500"/><circle cx="9" cy="9" r=".600"/>',
    globe: '<circle cx="9" cy="9" r="6.500"/><path d="M2.500 9h13M9 2.500c2 2 2.800 4.200 2.800 6.500S11 13.500 9 15.500C7 13.500 6.200 11.300 6.200 9S7 4.500 9 2.500Z"/>',
    sortie: '<path d="M7 15.500H3.500a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1H7"/><path d="M7.500 9h8M12.500 5.500 16 9l-3.500 3.500"/>',
    'doc-valide': '<path d="M4 2.500h7l3 3v10H4Z"/><path d="m6.500 10.500 2 2 3.500-4"/>',
    paie: '<rect x="2.500" y="2.500" width="13" height="13" rx="2"/><path d="M5.500 6.500h4M5.500 9.500h7M5.500 12.500h7"/>',
    part: '<path d="M9 2.500A6.500 6.500 0 1 1 3.700 5.200"/><path d="M9 5.800A3.200 3.200 0 1 1 6.400 7.100"/>',
  };
  const ORDRE = [
    'maison', 'comparatif', 'planning', 'tresorerie', 'entreprise', 'compte', 'factures', 'cashout', 'drive', 'paie',
    'document', 'doc-valide', 'recu', 'calcul', 'euro', 'pourcent', 'pieces', 'balance', 'virement', 'graphique',
    'hausse', 'baisse', 'part', 'cible', 'horloge', 'sablier', 'cloche', 'alerte', 'info', 'aide',
    'utilisateur', 'enveloppe', 'telephone', 'globe', 'voiture', 'repas', 'cadenas', 'bouclier', 'eclair', 'lien',
    'recherche', 'filtres', 'colonnes', 'reglages', 'oeil', 'crayon', 'copier', 'corbeille', 'trombone', 'signature',
    'telecharger', 'envoyer', 'synchro', 'sortie', 'menu', 'check', 'plus', 'fleche', 'chevron', 'bas',
  ];
  // 'haut' (socle) reste disponible par Icones.svg('haut') mais n'entre pas dans la grille de 60.
  const svg = (nom, c = 'currentColor', s = 18, w = 1.6) => (AJOUT[nom] ? M.icons.ic(AJOUT[nom], c, s, w) : M.icon(nom, c, s, w));
  window.Icones = { noms: ORDRE.filter((n) => AJOUT[n] || M.ICONES.includes(n)), svg, ajout: AJOUT };
})();
