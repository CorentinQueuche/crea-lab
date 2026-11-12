/* SOCLE DE MARQUE — Sillon, cave à vins nature, Nantes (objet global Marque).
   L'idée : il y a un creux dans Sillon, entre ses deux L. On le remplit. Tout ce qui est creux et ouvert vers le haut
   peut tenir du vin ; les mots penchent de 12 degrés, le vin reste d'aplomb.

   Deux sortes de code ici :
   - LA MÉCANIQUE (outils, contrat lu par les outils, pose d'un visuel sur une photo, pied de planche) : sans style propre.
   - LA MARQUE (nom, logo, couleurs, matières, photos, phrases, kit) : tout ce qui n'appartient qu'à Sillon.
   Le moteur qui remplit et rend la matière (la pièce maîtresse) est dans brand/verse.js ; les fonds (tissu, papier,
   mur de cave) sont générés par brand/matiere.js.

   Tout le projet lit ce fichier. Aucune animation ni horloge : les fonctions sont pures (mêmes paramètres, même
   dessin), les vidéos les appellent image par image. */
(function () {
  const A = {};

  /* ===================== MÉCANIQUE : outils ===================== */
  const r1 = (v) => Math.round(v * 10) / 10, r2 = (v) => Math.round(v * 100) / 100;
  /* Hasard à graine : jamais Math.random dans le socle */
  const rnd = (seed) => { let a = (seed * 2654435761) >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  A.rnd = rnd;
  A.ease = (x) => { x = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - x, 4); };
  A.easeIO = (x) => { x = Math.max(0, Math.min(1, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  /* url('…') avec des apostrophes : la valeur peut se poser dans un attribut style="…" */
  const dataSVG = (svg) => `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}')`;
  A.dataSVG = dataSVG;
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const versHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
  /* Rapport de contraste (WCAG) entre deux couleurs : à consulter avant de donner à une couleur un rôle de texte */
  A.contraste = (a, b) => { const l = (h) => { const c = rgb(h).map((v) => v / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const x = l(col(a)), y = l(col(b)); return Math.round(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)) * 100) / 100; };
  /* Géométrie : rotation (degrés, sens horaire à l'écran), polygone en tracé, aire, coupe par une horizontale */
  const rot = (p, deg, c = [0, 0]) => { const a = (deg * Math.PI) / 180, co = Math.cos(a), si = Math.sin(a), x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * co - y * si, c[1] + x * si + y * co]; };
  const polyD = (pts) => (pts.length ? 'M' + pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join(' L') + ' Z' : '');
  const aire = (P) => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; };
  const coupe = (P, ys, dessous = true) => { const out = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], ia = dessous ? a[1] >= ys : a[1] <= ys, ib = dessous ? b[1] >= ys : b[1] <= ys;
    if (ia) out.push(a); if (ia !== ib) { const t = (ys - a[1]) / (b[1] - a[1]); out.push([a[0] + t * (b[0] - a[0]), ys]); } } return out; };
  const boite = (P) => { const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
  A.rot = rot; A.polyD = polyD;
  /* Déplace un tracé absolu (commandes M L Q H V Z) */
  const tr = (d, ox = 0, oy = 0) => d.replace(/([MLQHVZ])([^MLQHVZ]*)/g, (m, c, a) => { const n = a.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (c === 'Z') return 'Z '; if (c === 'H') return 'H' + r2(n[0] + ox); if (c === 'V') return 'V' + r2(n[0] + oy);
    return c + n.map((v, i) => r2(v + (i % 2 ? oy : ox))).join(' '); });

  /* ===================== MARQUE : identité ===================== */
  A.NOM = 'Sillon';
  A.SLUG = 'sillon';
  /* Huit couleurs, nommées avec les mots de la cave. Les mêmes codes que dans marque.css. */
  A.COULEURS = { bleu: '#2146D0', cave: '#0E1638', tuffeau: '#F2EFE4', craie: '#E2DDCC', lave: '#8EA5F0', maceration: '#FF9B21', glou: '#FF4F7B', paille: '#F7C52B' };
  A.NOMS = { bleu: 'Bleu de travail', cave: 'Fond de cave', tuffeau: 'Tuffeau', craie: 'Craie', lave: 'Bleu lavé', maceration: 'Macération', glou: 'Glou', paille: 'Paille' };
  A.ROLES = { bleu: 'le fond de marque, et l’encre sur le tuffeau', cave: 'le texte courant, le fond du jeudi soir', tuffeau: 'le papier, et les lettres sur le bleu', craie: 'le fond neutre, les cartons',
    lave: 'le ton sur ton du bleu', maceration: 'le jus de la maison : le vin orange', glou: 'le deuxième jus : rouge de soif, rosé', paille: 'le troisième jus : le blanc' };
  const C = A.COULEURS;
  const col = (c) => C[c] || c || 'currentColor';
  A.col = col;
  const NB = ' ', FINE = ' ';
  A.NB = NB; A.FINE = FINE;
  /* Les trois jus, dans l'ordre où on les sert. Le premier est celui du logo. */
  A.JUS = ['maceration', 'glou', 'paille'];
  /* Une couleur n'est pas un aplat : chaque jus se lit du disque (le bord, où le vin est mince) à la lie (le fond). Le
     bleu va de la veste neuve à la veste lavée ; le tuffeau, de la taille fraîche à la pierre à l'ombre. Cinq tons chacun. */
  A.ECHELLES = { maceration: ['#FFE1B0', '#FFBF60', '#FF9B21', '#D5670D', '#8A3A09'], glou: ['#FFD3DC', '#FF90AA', '#FF4F7B', '#CD2250', '#7A0F31'], paille: ['#FFF4C2', '#FBDF72', '#F7C52B', '#D09810', '#866308'],
    bleu: ['#0E1638', '#16298A', '#2146D0', '#5B7BE6', '#8EA5F0'], tuffeau: ['#FBF9F2', '#F2EFE4', '#E2DDCC', '#C4BCA4', '#8D866F'] };
  A.TONS = ['Disque', 'Bord', 'Robe', 'Cœur', 'Lie'];
  /* Trois jus, trois comportements : le moteur les rend. trouble : les nuages en suspension ; depot : la part de lie au
     fond ; bulles : le perlant ; limpide : la lumière qui passe. */
  A.MATIERES = { maceration: { trouble: 0.85, depot: 0.11, bulles: 0, limpide: 0, dit: 'Trouble, avec son dépôt' }, glou: { trouble: 0.3, depot: 0.035, bulles: 0.12, limpide: 0.7, dit: 'Limpide, la lumière le traverse' }, paille: { trouble: 0.45, depot: 0.05, bulles: 1, limpide: 0.25, dit: 'Il perle : un cordon de bulles' } };
  /* Ce que donnent deux jus qui se croisent (deux encres l'une sur l'autre, deux ombres de bouteille) : leur produit.
     Les trois croisements portent des noms de robe : tuilé, pelure d'oignon, ambre. */
  A.melange = (a, b) => { const x = rgb(col(a)), y = rgb(col(b)); return versHex(x.map((v, i) => (v * y[i]) / 255)); };
  A.CROISEMENTS = [['maceration', 2, 'glou', 1, 'Tuilé'], ['glou', 0, 'paille', 0, 'Pelure d’oignon'], ['maceration', 1, 'paille', 1, 'Ambre']].map(([a, i, b, j, nom]) => ({ a, b, nom, tons: [A.ECHELLES[a][i], A.ECHELLES[b][j]], hex: A.melange(A.ECHELLES[a][i], A.ECHELLES[b][j]) }));
  /* Le signe degré est dessiné (un anneau) : celui d'Anybody est trop petit pour se lire dans une mention */
  A.deg = (n) => `${String(n).replace('.', ',').replace('-', '−')}<i class="deg"></i>`;
  A.DEGRE = 12;        /* tout penche de 12 degrés, le degré d'un vin de soif ; une fiche de bouteille penche du degré du vin */
  A.NIVEAU = 2 / 3;    /* le creux du logo est plein aux deux tiers */
  A.IDEE = 'Il y a un creux dans Sillon, entre ses deux L. On le remplit.';
  A.SIGNATURE = 'On remplit les creux.';
  A.TRIPTYQUE = ['Nature.', 'Vivant.', 'À ras bord.'];
  A.DESCRIPTEUR = 'Cave à vins nature';
  A.LIEU = `Nantes${NB}· Olivettes`;
  /* La mention sanitaire, obligatoire en France sur toute publicité pour une boisson alcoolisée : elle a sa ligne dans la contre-étiquette */
  A.MENTION_SANITAIRE = 'L’abus d’alcool est dangereux pour la santé. À consommer avec modération.';
  /* Les phrases de la marque. Entre crochets : les lettres-verres (larges, et remplies par le moteur). */
  A.PHRASES = { jeudi: 'JE[U]DI, ON GO[Û]TE.', abonnement: 'TROIS BO[U]TEILLES PAR MOIS.', plein: 'LE PLEIN D[U] MOIS.', ouverture: 'ON O[U]VRE.', chantier: 'ICI, ON CRE[U]SE.',
    regle: 'ÇA PENCHE, ÇA TIENT.', jus: 'D[U] J[U]S.', glou: 'GLO[U].', nature: '[V]IN NAT[U]RE', rdv: 'À JE[U]DI.' };
  /* La voix : ce qui s'écrit sur les objets, dans le ton du comptoir. Chaque phrase a son support. */
  A.VOIX = { dos: 'Non filtré. Nous non plus.', vitrine: 'Venez comme vous êtes. Repartez à pied.', nappe: 'Taches autorisées.', colis: 'Un orange, un rouge de soif, un blanc. Le reste, vous nous le racontez jeudi.', sousVerre: 'Ça penche, ça tient.', carte: 'On remplit. Vous racontez.' };
  A.TON = [['Jeudi, on goûte.', 'Soirée dégustation œnologique'], ['Du jus.', 'Un nectar d’exception'], ['Non filtré. Nous non plus.', 'Une maison de tradition'], ['Trois bouteilles par mois.', 'Box premium sur abonnement']];

  /* Le kit de la marque, dit en mots : ce qui la fait reconnaître sans son logo. */
  A.KIT = [
    { nom: 'Le creux rempli', quoi: 'L’unité : le verre que forment les deux L soudés, penché, son vin d’aplomb. Un sillon vu en coupe est un verre.' },
    { nom: 'Les trois jus', quoi: 'La matière : macération (trouble, avec son dépôt), glou (limpide), paille (il perle), du disque à la lie, sur le bleu de travail et la pierre de tuffeau.' },
    { nom: 'La voix à verres', quoi: 'Les titres : capitales serrées, sauf les lettres qui tiennent du vin (U, V), larges comme des verres. Et des phrases de comptoir écrites sur les objets.' },
    { nom: 'Douze degrés', quoi: 'La règle et le mouvement : tout penche de 12°, le degré d’un vin de soif. Le vin, lui, reste horizontal.' },
    { nom: 'La contre-étiquette', quoi: 'La marge du métier : le petit papier au dos de la bouteille, avec sa contenance, son degré, son lot. Il mesure aussi les photos.' },
    { nom: 'L’image à niveau', quoi: 'Le traitement d’image : toute photo se remplit jusqu’à un niveau horizontal, vue à travers un jus en dessous, claire au-dessus. Ou elle devient le vin d’un creux.' },
    { nom: 'L’abécédaire à ras bord', quoi: 'La pièce maîtresse : le moteur remplit chaque lettre de ce qu’elle peut tenir, et le mesure. Un U plein fait un verre, 12,5 cl.' },
  ];

  /* ---------- Le logo en tracés ----------
     Repère : hauteur de capitale = 100, ligne de base en y = 100. Les lettres S, I, O, N sont celles d'Anybody (graisse 900,
     largeur 150), relevées par _prep/logo_depuis_police.py. Les deux L sont redessinés d'un seul tenant : le pied du
     premier rejoint le fût du second et ferme un creux de 65,77 × 73,19. Ses finesses : le fond du creux est arrondi
     (rayon 9) comme le fond d'un verre, ses deux lèvres sont adoucies (rayon 5), et le vin y fait un ménisque : il monte
     de 6 le long des parois. L'interlettre est corrigée à l'œil : 12 entre deux droites, 10 contre un rond, 8 après le
     pied du L, qui laisse du vide au-dessus de lui. */
  const FUT = 41.93, PIED = 26.81, LARG_L = 107.7, FOND = 100 - PIED, R_FOND = 9, R_LEVRE = 5, MEN = [8.5, 6];
  const ESPS = [10, 12, 8, 10];
  const dLL = () => { const a = FUT, b = LARG_L, f = FOND, rf = R_FOND, rl = R_LEVRE;
    return `M0 0H${r2(a - rl)}Q${a} 0 ${a} ${rl}V${r2(f - rf)}Q${a} ${f} ${r2(a + rf)} ${f}H${r2(b - rf)}Q${b} ${f} ${b} ${r2(f - rf)}V${rl}Q${b} 0 ${r2(b + rl)} 0H${r2(b + a)}V${f}H${r2(2 * b)}V100H0Z`; };
  const GLYPHES = {
    S: { l: 145.48, d: 'M74.07 100.44Q106.07 100.44 125.78 92.44Q145.48 84.44 145.48 65.19Q145.48 51.56 132.81 45.7Q120.15 39.85 86.22 37.63Q68.15 36.59 53.93 35.48Q39.7 34.37 39.7 31.7Q39.7 29.19 49.26 27.41Q58.81 25.63 72 25.63Q83.41 25.63 93.48 28.15Q103.56 30.67 103.56 35.11H145.48Q145.48 16.59 124.96 7.78Q104.44 -1.04 72.59 -1.04Q40.74 -1.04 20.44 7.04Q0.15 15.11 0.15 33.48Q0.15 47.85 13.48 54.15Q26.81 60.44 57.93 62.22Q77.33 63.41 91.19 64.3Q105.04 65.19 105.04 68.44Q105.04 71.11 95.48 72.44Q85.93 73.78 73.56 73.78Q61.19 73.78 51.48 71.19Q41.78 68.59 41.78 64.15H0Q0 83.11 20.07 91.78Q40.15 100.44 74.07 100.44Z' },
    I: { l: 41.48, d: 'M0 100H41.48V0H0Z' },
    LL: { l: 2 * LARG_L, d: dLL() },
    O: { l: 155.11, d: 'M77.48 101.19Q111.85 101.19 133.48 88.15Q155.11 75.11 155.11 50.07Q155.11 24.89 133.48 11.93Q111.85 -1.04 77.48 -1.04Q43.11 -1.04 21.56 11.85Q0 24.74 0 50.07Q0 75.11 21.63 88.15Q43.26 101.19 77.48 101.19ZM77.48 74.37Q61.63 74.37 51.78 68.22Q41.93 62.07 41.93 50.07Q41.93 37.93 51.78 31.85Q61.63 25.78 77.48 25.78Q93.48 25.78 103.33 31.85Q113.19 37.93 113.19 50.07Q113.19 62.07 103.33 68.22Q93.48 74.37 77.48 74.37Z' },
    N: { l: 161.48, d: 'M0 100H41.93V28.74H42.22L95.56 100H161.48V0H119.56V68.44H119.48L67.7 0H0Z' },
  };
  const ORDRE = ['S', 'I', 'LL', 'O', 'N'];
  const XS = ORDRE.map((_, i) => r2(ORDRE.slice(0, i).reduce((a, c, j) => a + GLYPHES[c].l + ESPS[j], 0))), WORD_W = r2(XS[4] + GLYPHES.N.l);
  A.LETTRES = { ordre: ORDRE, x: XS, largeur: ORDRE.map((c) => GLYPHES[c].l), interlettres: ESPS };
  A.letterPath = (ch, ox = 0) => tr(GLYPHES[ch].d, ox + XS[ORDRE.indexOf(ch)], 0);
  A.lettersPath = () => ORDRE.map((c) => A.letterPath(c)).join(' ');
  /* Le creux : rectangle ouvert en haut, entre les deux fûts */
  A.CREUX = { x: r2(XS[2] + FUT), y: 0, l: r2(LARG_L - FUT), h: FOND };
  const RETRAIT = 8;   /* en un seul aplat, le vin se détache des parois de 8 */

  /* Le vin dans un creux rectangulaire penché : surface horizontale, volume conservé tant que le bord le plus bas le
     permet (le reste est versé). cav = { x, y, l, h } ouvert en haut ; ang en degrés autour de pivot ; niveau de 0 à 1.
     o.retrait : le vin se détache des parois (version en un aplat) ; o.deborde : il passe sous les parois (deux couleurs).
     Renvoie le polygone, son tracé, le tracé du ménisque (le vin qui monte le long des deux parois), la surface. */
  A.liquide = (cav, ang = 0, pivot = [0, 0], niveau = A.NIVEAU, o = {}) => { const { retrait = 0, deborde = 0 } = o, { x, y, l, h } = cav;
    const coins = (dx, dy) => [[x + dx, y], [x + l - dx, y], [x + l - dx, y + h - dy], [x + dx, y + h - dy]].map((p) => rot(p, ang, pivot));
    const P = coins(0, 0), bord = Math.max(P[0][1], P[1][1]), fond = Math.max(...P.map((p) => p[1])), cible = Math.max(0, Math.min(1, niveau)) * l * h;
    let a = bord, b = fond; const verse = aire(coupe(P, bord)) <= cible + 1e-6;
    if (!verse) for (let i = 0; i < 48; i++) { const m = (a + b) / 2; if (aire(coupe(P, m)) > cible) a = m; else b = m; }
    const ys = verse ? bord : (a + b) / 2, exact = niveau <= 0 ? [] : coupe(retrait ? coins(retrait, retrait) : P, ys), pts = niveau <= 0 ? [] : coupe(coins(retrait ? retrait : -deborde, retrait ? retrait : -deborde), ys);
    /* le ménisque : à chaque bout de la surface, un congé qui remonte la paroi */
    let men = ''; const iS = exact.map((p, i) => (Math.abs(p[1] - ys) < 1e-6 ? i : -1)).filter((i) => i >= 0);
    if (iS.length === 2 && !verse) { const n = exact.length, [i0, i1] = iS, voisin = (i, j) => exact[(i + (exact[(i + 1) % n] === exact[j] ? n - 1 : 1)) % n];
      [[i0, i1], [i1, i0]].forEach(([i, j]) => { const E = exact[i], F = exact[j], V = voisin(i, j), sL = Math.hypot(F[0] - E[0], F[1] - E[1]) || 1, uL = Math.hypot(E[0] - V[0], E[1] - V[1]) || 1, mw = Math.min(MEN[0], sL / 3), mh = MEN[1];
        const s = [(F[0] - E[0]) / sL, (F[1] - E[1]) / sL], u = [(E[0] - V[0]) / uL, (E[1] - V[1]) / uL]; if (u[1] > -0.2) return;
        men += `M${r2(E[0] + s[0] * mw)},${r2(E[1] + s[1] * mw)} Q${r2(E[0])},${r2(E[1])} ${r2(E[0] + u[0] * mh)},${r2(E[1] + u[1] * mh)} L${r2(E[0] - s[0] * 0.8)},${r2(E[1])} Z `; }); }
    return { pts, exact, d: polyD(pts), men, ys, verse, plein: aire(coupe(P, ys)) / (l * h) }; };
  /* Le fond du vin à une abscisse donnée (pour y poser une bulle) */
  const fondA = (P, x) => { let m = -Infinity; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; if ((a[0] - x) * (b[0] - x) <= 0 && a[0] !== b[0]) { const t = (x - a[0]) / (b[0] - a[0]); m = Math.max(m, a[1] + t * (b[1] - a[1])); } } return m; };
  /* Les détails du grand format : le disque (une bande plus claire sous la surface), la lie (le fond, plus dense, d'aplomb
     lui aussi) et trois bulles. Trois, comme les bouteilles du mois. */
  const details = (cav, ang, pivot, niveau, T = (p) => p, kk = 1) => { const L = A.liquide(cav, ang, pivot, niveau), lie = A.liquide(cav, ang, pivot, niveau * 0.13);
    if (!L.exact.length) return { disque: '', lie: '', bulles: [] };
    const xs = L.exact.map((p) => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), bulles = [[0.3, 0.42, 3.1], [0.6, 0.2, 2.1], [0.74, 0.58, 3.8]].map(([u, v, r]) => { const x = x0 + u * (x1 - x0), f = fondA(L.exact, x); return [x, L.ys + v * (f - L.ys), r]; }).filter((b) => b[1] - L.ys > b[2] + 2);
    return { disque: polyD(coupe(L.pts, L.ys + 7, false).map(T)), lie: polyD(lie.pts.map(T)), bulles: bulles.map(([x, y, r]) => [...T([x, y]), r * kk]) }; };

  A.jusPath = (niveau = A.NIVEAU) => { const L = A.liquide(A.CREUX, 0, [0, 0], niveau, { deborde: 0.8 }); return L.d + ' ' + L.men; };
  /* En un seul aplat : les lettres, et le vin en bloc détaché dans le creux */
  A.wordPath = () => A.lettersPath() + ' ' + A.liquide(A.CREUX, 0, [0, 0], A.NIVEAU, { retrait: RETRAIT }).d;

  /* Le symbole : le verre (premier L, et fût du second), penché de 12°, le vin d'aplomb */
  const dVerre = (() => { const a = FUT, b = LARG_L, f = FOND, rf = R_FOND, rl = R_LEVRE; /* le même tracé que le double L, sans le pied du second : en points, pour le tourner */
    const q = (p0, c, p1, n = 6) => Array.from({ length: n }, (_, i) => { const t = (i + 1) / n; return [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]]; });
    return [[0, 0], [a - rl, 0], ...q([a - rl, 0], [a, 0], [a, rl]), [a, f - rf], ...q([a, f - rf], [a, f], [a + rf, f]), [b - rf, f], ...q([b - rf, f], [b, f], [b, f - rf]), [b, rl], ...q([b, rl], [b, 0], [b + rl, 0]), [b + a, 0], [b + a, 100], [0, 100]]; })();
  const VERRE = { l: r2(LARG_L + FUT), h: 100, pts: dVerre, creux: { x: FUT, y: 0, l: r2(LARG_L - FUT), h: FOND } };
  A.VERRE = VERRE;
  /* Les tracés d'un verre : centre (cx, cy), hauteur ech, angle, niveau. mode : 'jus' (deux couleurs) ou 'aplat'. */
  A.verreTraces = (cx = 0, cy = 0, ech = 100, ang = A.DEGRE, niveau = A.NIVEAU, mode = 'jus') => { const k = ech / 100, piv = [VERRE.l / 2, 50];
    const T = (p) => [cx + (p[0] - piv[0]) * k, cy + (p[1] - piv[1]) * k], L = A.liquide(VERRE.creux, ang, piv, niveau, mode === 'jus' ? { deborde: 0.8 } : { retrait: RETRAIT }), D = mode === 'jus' && niveau > 0 ? details(VERRE.creux, ang, piv, niveau, T, k) : null;
    const men = mode === 'jus' && L.men ? L.men.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (m, x, y) => { const p = T([+x, +y]); return `${r2(p[0])},${r2(p[1])}`; }) : '';
    return { mur: polyD(VERRE.pts.map((p) => T(rot(p, ang, piv)))), jus: polyD(L.pts.map(T)) + ' ' + men, details: D, verse: L.verse, plein: L.plein, surface: cy + (L.ys - 50) * k }; };
  const SYM = (() => { const piv = [VERRE.l / 2, 50], B = boite(VERRE.pts.map((p) => rot(p, A.DEGRE, piv))); return { ox: -B[0], oy: -B[1], l: r2(B[2] - B[0]), h: r2(B[3] - B[1]) }; })();
  const symTraces = (mode, niveau = A.NIVEAU, ang = A.DEGRE) => { const t = A.verreTraces(VERRE.l / 2 + SYM.ox, 50 + SYM.oy, 100, ang, niveau, mode); return t; };
  A.symbolPath = () => { const t = symTraces('aplat'); return t.mur + ' ' + t.jus; };
  /* Les pièces du logo, pour la construction et le mouvement */
  A.symbolParts = () => { const t = symTraces('jus'), u = symTraces('aplat'); return { verre: t.mur, jus: t.jus, bloc: u.jus, details: t.details, surface: t.surface }; };
  A.letterParts = (ch) => (ch === 'LL' ? { lettres: A.letterPath('LL'), jus: A.jusPath(), bloc: A.liquide(A.CREUX, 0, [0, 0], A.NIVEAU, { retrait: RETRAIT }).d, details: details(A.CREUX, 0, [0, 0], A.NIVEAU) } : { lettre: A.letterPath(ch) });
  A.CONSTRUCTION = { source: 'Anybody, graisse 900, largeur 150 ; double L redessiné', capitale: 100, fut: FUT, pied: PIED, largeurL: LARG_L, interlettres: ESPS, largeur: WORD_W, x: XS,
    creux: A.CREUX, rayonFond: R_FOND, rayonLevre: R_LEVRE, menisque: MEN, niveau: A.NIVEAU, surface: r2(FOND - FOND * A.NIVEAU), retrait: RETRAIT, degre: A.DEGRE, verre: { l: VERRE.l, h: 100 }, symbole: SYM };

  /* Le contrat lu par les outils (tools/export_logo.py, Blender, le site) : ne pas renommer ces membres */
  A.LOGO = { box: [0, -4, WORD_W, 108], xHeight: 100, baseline: 100, symbolBox: [0, 0, SYM.l, SYM.h], symbolBaseline: SYM.h };
  /* Le descripteur tient entre la tête et le pied des capitales : trois lignes, corps 37 (hauteur de capitale 25,8), interligne 37,1 */
  A.LOCKUP = { lines: ['Cave à vins', 'nature', 'Nantes'], x: WORD_W + 40, size: 37, baselines: [25.8, 62.9, 100], tracking: -0.6, box: [0, -4, 988, 108] };
  A.FONTS = { nom: 'Hanken Grotesk', variable: '@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2', graisses: { Regular: 400, Medium: 500, SemiBold: 600, Bold: 700 }, logo: 'SemiBold',
    /* la voix des titres, exportée dans sa largeur de verre pour la 3D (Anybody a deux axes : graisse et largeur) */
    large: { nom: 'Anybody', variable: '@fontsource-variable/anybody/files/anybody-latin-wdth-normal.woff2', axes: { wght: 900, wdth: 150 }, fichier: 'Anybody-Verre' } };
  A.COULEURS_LOGO = { tuffeau: C.tuffeau, bleu: C.bleu, cave: C.cave };
  const vb = (b) => b.join(' ');
  const svg = (box, corps, attrs = '') => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vb(box)}" ${attrs}>${corps}</svg>`;
  let _id = 0;
  /* Le vin d'un logo. jus : une clé de couleur (aplat, avec son ménisque) ; o.detail : le grand format (disque, lie,
     bulles, dans l'échelle du jus) ; o.photo : une photo de la marque prend la place du vin. */
  const vin = (jusD, D, jus, o = {}) => { const E = A.ECHELLES[jus] || [col(jus), col(jus), col(jus), col(jus), col(jus)];
    if (o.photo) { const id = 'cv' + ++_id, P = A.PHOTOS[o.photo] || {}; return `<defs><clipPath id="${id}"><path d="${jusD}"/></clipPath></defs><g clip-path="url(#${id})"><image href="${A.photoURL(o.photo)}" x="${o.cadre[0]}" y="${o.cadre[1]}" width="${o.cadre[2]}" height="${o.cadre[3]}" preserveAspectRatio="xMidYMid slice"/></g>` + (D ? `<path fill="${C.tuffeau}" opacity=".5" d="${D.disque}" style="mix-blend-mode:soft-light"/>` : ''); }
    if (!o.detail || !D) return `<path fill="${col(jus)}" d="${jusD}"/>`;
    return `<path fill="${E[2]}" d="${jusD}"/><path fill="${E[1]}" d="${D.disque}"/><path fill="${E[3]}" d="${D.lie}"/>` + D.bulles.map(([x, y, r]) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" fill="${E[0]}"/>`).join(''); };
  const lettres = (d, fill) => `<path fill="${fill}" fill-rule="evenodd" d="${d}"/>`;
  /* Les trois versions. Troisième argument : la couleur du jus. Sans lui, le logo est en un seul aplat.
     Quatrième : { detail: true } pour le grand format, { photo: 'depot' } pour une photo dans le creux. */
  A.wordmark = (fill = 'currentColor', attrs = '', jus = null, o = {}) => svg(A.LOGO.box, jus ? vin(A.jusPath(), o.detail || o.photo ? details(A.CREUX, 0, [0, 0], A.NIVEAU) : null, jus, { ...o, cadre: [A.CREUX.x - 2, 0, A.CREUX.l + 4, FOND + 2] }) + lettres(A.lettersPath(), fill) : lettres(A.wordPath(), fill), attrs);
  A.symbol = (fill = 'currentColor', attrs = '', jus = null, o = {}) => { const t = symTraces(jus ? 'jus' : 'aplat'); return svg(A.LOGO.symbolBox, jus ? vin(t.jus, t.details, jus, { ...o, cadre: [0, 0, SYM.l, SYM.h] }) + lettres(t.mur, fill) : lettres(t.mur + ' ' + t.jus, fill), attrs); };
  A.lockup = (fill = 'currentColor', attrs = '', jus = null, o = {}) => { const K = A.LOCKUP;
    return svg(K.box, (jus ? vin(A.jusPath(), o.detail || o.photo ? details(A.CREUX, 0, [0, 0], A.NIVEAU) : null, jus, { ...o, cadre: [A.CREUX.x - 2, 0, A.CREUX.l + 4, FOND + 2] }) + lettres(A.lettersPath(), fill) : lettres(A.wordPath(), fill)) +
      K.lines.map((t, i) => `<text x="${K.x}" y="${K.baselines[i]}" fill="${fill}" font-family="${A.FONTS.nom}" font-weight="${A.FONTS.graisses[A.FONTS.logo]}" font-size="${K.size}" letter-spacing="${K.tracking}">${t}</text>`).join(''), attrs); };
  /* Le logotype penché : les lettres tournent, le vin reste horizontal. o : angle (−12 par défaut : le mot monte), jus,
     niveau, attrs, detail. Sert aux ouvertures, aux affiches, à la révélation. */
  A.penche = (fill = 'currentColor', o = {}) => { const { angle = -A.DEGRE, jus = null, niveau = A.NIVEAU, attrs = '' } = o, piv = [WORD_W / 2, 50];
    const B = boite([[0, -2], [WORD_W, -2], [WORD_W, 102], [0, 102]].map((p) => rot(p, angle, piv))), L = A.liquide(A.CREUX, angle, piv, niveau, jus ? { deborde: 0.8 } : { retrait: RETRAIT });
    const corps = `<path transform="rotate(${angle} ${piv[0]} ${piv[1]})" fill="${fill}" fill-rule="evenodd" d="${A.lettersPath()}"/>`;
    return svg([r2(B[0]), r2(B[1]), r2(B[2] - B[0]), r2(B[3] - B[1])], (jus ? vin(L.d + ' ' + L.men, o.detail || o.photo ? details(A.CREUX, angle, piv, niveau) : null, jus, { ...o, cadre: (() => { const b = boite(L.pts); return [b[0] - 2, b[1] - 2, b[2] - b[0] + 4, b[3] - b[1] + 4]; })() }) : `<path fill="${fill}" d="${L.d}"/>`) + corps, attrs + ` data-surface="${r2(L.ys)}"`); };
  /* Où est la surface du vin dans le logotype penché (dans son propre repère) : pour tracer un niveau, une cote */
  A.pencheInfos = (angle = -A.DEGRE, niveau = A.NIVEAU) => { const piv = [WORD_W / 2, 50], B = boite([[0, -2], [WORD_W, -2], [WORD_W, 102], [0, 102]].map((p) => rot(p, angle, piv))), L = A.liquide(A.CREUX, angle, piv, niveau);
    return { box: [B[0], B[1], B[2] - B[0], B[3] - B[1]], surface: L.ys, creux: [[A.CREUX.x, 0], [A.CREUX.x + A.CREUX.l, 0], [A.CREUX.x + A.CREUX.l, FOND], [A.CREUX.x, FOND]].map((p) => rot(p, angle, piv)), verse: L.verse }; };
  A.icone = (taille = 120, fond = C.bleu, signe = C.tuffeau, jus = 'maceration') => `<div class="icone-app" style="width:${taille}px;height:${taille}px;background:${col(fond)}">${A.symbol(col(signe), '', jus, { detail: taille >= 60 })}</div>`;
  /* Fichiers logo en deux couleurs, exportés en plus des aplats ({c} : la couleur des lettres ; le jus est la macération) */
  A.fichiersLogo = () => ({ 'logotype-jus': A.wordmark('{c}', '', 'maceration'), 'logotype-grand': A.wordmark('{c}', '', 'maceration', { detail: true }), 'symbole-jus': A.symbol('{c}', '', 'maceration'), 'symbole-grand': A.symbol('{c}', '', 'maceration', { detail: true }), 'penche-jus': A.penche('{c}', { jus: 'maceration' }) });

  /* ===================== MARQUE : le kit =====================
     1. Le creux rempli (l'unité) : A.verre, A.service ; en matière : Verse.verres.   2. Les trois jus : A.JUS, A.ECHELLES, A.MATIERES.
     3. La voix à verres : A.titre (HTML), Verse.rendre (rempli), A.VOIX.   4. Douze degrés : A.DEGRE, l'option angle partout.
     5. La contre-étiquette : A.contre.   6. L'image à niveau : A.photo.   7. L'abécédaire à ras bord : brand/verse.js. */

  /* Un verre seul. o : taille (hauteur en px), angle, niveau, c (parois), jus (clé, ou null pour un aplat), detail, attrs */
  A.verre = (o = {}) => { const { taille = 100, angle = A.DEGRE, niveau = A.NIVEAU, c = 'currentColor', jus = 'maceration', attrs = '', detail = taille >= 60 } = o, piv = [VERRE.l / 2, 50];
    const B = boite(VERRE.pts.map((p) => rot(p, angle, piv))), t = A.verreTraces(0, 0, 100, angle, niveau, jus ? 'jus' : 'aplat'), w = B[2] - B[0], h = B[3] - B[1];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r2(-w / 2)} ${r2(-h / 2)} ${r2(w)} ${r2(h)}" style="height:${r1((taille * h) / 100)}px;width:auto" ${attrs}>` +
      (jus ? vin(t.jus, t.details, jus, { detail }) + lettres(t.mur, col(c)) : lettres(t.mur + ' ' + t.jus, col(c))) + `</svg>`; };

  /* Le service : un champ de verres. Chaque verre a son angle, son niveau, son jus ; toutes les surfaces sont
     horizontales, c'est ce qui fait le motif. o : w, h, cols, rangs, taille (hauteur d'un verre), c (parois),
     angle(i, j, u, v) → degrés, niveau(i, j, u, v) → 0 à 1, jus(i, j, u, v) → clé de couleur ou null (verre vide),
     quinconce, marge, attrs. Sans fonction : angle ±12 alterné, deux tiers, les trois jus à la suite. */
  A.service = (o = {}) => { const { w = 700, h = 400, cols = 6, rangs = 3, taille = 0, c = 'currentColor', quinconce = false, marge = 0, attrs = '',
      angle = (i, j) => ((i + j) % 2 ? -A.DEGRE : A.DEGRE), niveau = () => A.NIVEAU, jus = (i, j) => A.JUS[(i + j * 2) % 3] } = o;
    const pw = (w - 2 * marge) / cols, ph = (h - 2 * marge) / rangs, ech = taille || Math.min(ph * 0.62, (pw * 0.62 * 100) / VERRE.l), par = {}, clair = {}, lie = {}; let murs = '';
    for (let j = 0; j < rangs; j++) for (let i = -1; i <= cols; i++) { if ((i < 0 || i >= cols) && !(quinconce && j % 2)) continue;
      const cx = marge + (i + 0.5 + (quinconce && j % 2 ? 0.5 : 0)) * pw, cy = marge + (j + 0.5) * ph, u = cx / w, v = cy / h, cl = jus(i, j, u, v), t = A.verreTraces(cx, cy, ech, angle(i, j, u, v), cl ? niveau(i, j, u, v) : 0);
      murs += t.mur + ' '; if (cl && t.jus) { par[cl] = (par[cl] || '') + t.jus + ' '; if (t.details) { clair[cl] = (clair[cl] || '') + t.details.disque + ' '; lie[cl] = (lie[cl] || '') + t.details.lie + ' '; } } }
    const E = (k, i) => (A.ECHELLES[k] ? A.ECHELLES[k][i] : col(k));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" ${attrs}>` + Object.keys(par).map((k) => `<path fill="${E(k, 2)}" d="${par[k]}"/><path fill="${E(k, 1)}" d="${clair[k] || ''}"/><path fill="${E(k, 3)}" d="${lie[k] || ''}"/>`).join('') + `<path fill="${col(c)}" d="${murs}"/></svg>`; };

  /* Un titre dans la voix de la marque, en HTML (sans remplissage) : « JE[U]DI » → les lettres entre crochets sont larges.
     Pour le même titre avec son vin, passer par Verse (brand/verse.js). o : taille (px), style, cls */
  A.titre = (texte, o = {}) => { const { taille = 0, style = '', cls = '' } = o;
    return `<span class="t-titre ${cls}" style="${taille ? `font-size:${taille}px;` : ''}${style}">${String(texte).replace(/\[([^\]]+)\]/g, '<b>$1</b>')}</span>`; };
  /* Le même texte sans ses crochets (pour un attribut, une légende) */
  A.sansCrochets = (t) => String(t).replace(/[\[\]]/g, '');

  /* La contre-étiquette : le petit papier au dos d'une bouteille, devenu la marge de chaque pièce. Toujours droite.
     o : lot (numéro de la pièce), sujet, lignes [[mention, valeur], …], grands [valeur, valeur] (les deux gros chiffres
     d'une étiquette : la contenance et le degré), c (couleur de l'encre), style, verre (false pour l'ôter), nom (false :
     la première ligne dit le métier), l (largeur en px), sanitaire (true sur toute publicité), voix (une phrase en bas),
     papier (false : sans son papier, à même le fond). */
  A.contre = (o = {}) => { const { lot = '', sujet = '', lignes = [], grands = null, c = 'bleu', style = '', verre = true, jus = 'maceration', l = 252, nom = true, sanitaire = false, voix = '', papier = true } = o;
    return `<div class="ce${papier ? ' papier' : ''}" style="color:${col(c)};width:${l}px;${style}"><div class="ce-in">` +
      `<div class="ce-t">${nom ? `<b>${A.NOM}</b>` : `<span>${A.DESCRIPTEUR}</span>`}<span>${lot ? `Lot${NB}${lot}` : A.LIEU}</span></div>` +
      (sujet ? `<div class="ce-l"><span>${sujet}</span><span>${lot ? A.LIEU : ''}</span></div>` : '') +
      lignes.map(([a, b]) => `<div class="ce-l"><span>${a}</span><span>${b}</span></div>`).join('') +
      (grands ? `<div class="ce-g"><b>${grands[0]}</b><b>${grands[1]}</b>${verre ? A.verre({ taille: 22, c, jus, detail: false }) : ''}</div>` : '') +
      (voix ? `<div class="ce-v">${voix}</div>` : '') + (sanitaire ? `<div class="ce-m">${A.MENTION_SANITAIRE}</div>` : '') + `</div></div>`; };

  /* L'étiquette de face : le logotype, son creux au jus de la bouteille, le nom du jus qui penche de son degré, et le
     papier lui-même rempli jusqu'à un niveau (le tiers bas est teinté du ton le plus clair du jus).
     o : jus, degre (celui du vin), l (largeur en px), mention */
  A.etiquette = (o = {}) => { const { jus = 'maceration', degre = 12, l = 220, mention = 'Vin nature · non filtré', style = '' } = o, E = A.ECHELLES[jus], nom = A.NOMS[jus], corps = Math.min(44, r1(205 / nom.length));
    return `<div class="etq" style="width:${l}px;--j0:${E[0]};--j1:${E[2]};${style}"><div class="etq-logo">${A.wordmark(C.bleu, '', jus, { detail: true })}</div>` +
      `<div class="etq-nom" style="font-size:${corps}cqw;transform:rotate(${-degre}deg)">${nom}</div><div class="etq-bas"><span>${mention}</span><span>${String(degre).replace('.', ',')}${NB}%${NB}vol.</span></div></div>`; };

  /* Les imprimés de la cave, dessinés à 600 px de large et mis à l'échelle (o.l) : ils servent à plat et posés sur une photo.
     Les titres y sont des <canvas data-verse> : appeler Verse.tout() après les avoir insérés. */
  const cvs = (texte, o = {}) => `<canvas data-verse="${texte}" ${Object.keys(o).map((k) => `${k === 'id' ? 'id' : 'data-' + k}="${o[k]}"`).join(' ')}></canvas>`;
  A.cvs = cvs;
  /* L'affiche du jeudi (A2, 1 : 1,414). o : l, lignes, jus, voix */
  A.affiche = (o = {}) => { const { l = 300, lignes = ['JE[U]DI,', 'ON GO[Û]TE.'], jus = ['maceration', 'glou'], voix = A.VOIX.vitrine, fond = 'bleu', taille = 74, tete = 'Tous les jeudis soir', style = '' } = o, clair = fond === 'blanc', enc = clair ? C.bleu : C.tuffeau, opt = clair ? { mode: 'imprime', c: 'bleu' } : { fond };
    return `<div class="imp" style="width:${l}px;height:${r1(l * 1.414)}px;${style}"><div class="imp-in fond-${fond}" style="width:600px;height:848px;zoom:${r2(l / 600)};color:${enc}">
      <div class="t-etq" style="position:absolute;left:44px;top:40px;font-size:15px">${tete}</div><div class="t-etq" style="position:absolute;right:44px;top:40px;font-size:15px">${A.LIEU}</div>
      <div style="position:absolute;left:40px;top:${lignes[1] ? 150 : 210}px">${cvs(lignes[0], { taille, angle: -12, jus: jus[0], ...opt })}</div>${lignes[1] ? `<div style="position:absolute;left:52px;top:${r1(150 + taille * 1.22)}px">${cvs(lignes[1], { taille, angle: -12, jus: jus[1] || jus[0], ...opt })}</div>` : ''}
      <div class="t-sous" style="position:absolute;left:44px;bottom:150px;font-size:32px;width:520px">${String(voix).replace(/\. /g, '.<br>')}</div>
      <div style="position:absolute;left:44px;right:44px;bottom:40px;display:flex;justify-content:space-between;align-items:flex-end">${A.wordmark(enc, 'style="width:230px;height:auto"', 'maceration', { detail: true })}<div class="t-petit" style="width:220px;font-size:11px;line-height:1.3;text-align:right">${A.MENTION_SANITAIRE}</div></div></div></div>`; };
  /* La carte du jeudi (A5 paysage). Les prix ne sont pas connus : la colonne existe, vide. */
  A.carte = (o = {}) => { const { l = 400, style = '' } = o, B = A.DONNEES.bouteilles;
    return `<div class="imp" style="width:${l}px;height:${r1(l * 0.7)}px;${style}"><div class="imp-in fond-blanc" style="width:600px;height:420px;zoom:${r2(l / 600)};color:${C.bleu}">
      <div style="position:absolute;left:34px;top:30px">${cvs('JE[U]DI', { taille: 74, mode: 'imprime' })}</div><div class="t-etq" style="position:absolute;right:34px;top:34px;text-align:right;font-size:13px">On goûte<br>au verre</div>
      <div style="position:absolute;left:34px;right:34px;top:150px">${B.map((b) => `<div style="display:grid;grid-template-columns:78px 1fr 70px;align-items:center;border-top:1.5px solid currentColor;padding:11px 0 10px"><div style="width:60px">${A.verre({ taille: 30, c: C.bleu, jus: b.jus, detail: false })}</div><div><div class="t-sous" style="font-size:22px">${A.NOMS[b.jus]}</div><div class="t-etq" style="font-size:11.5px;opacity:.8">${b.dit} · ${String(b.degre).replace('.', ',')}${NB}%${NB}vol.</div></div><div style="height:26px;border-bottom:1.5px dotted currentColor"></div></div>`).join('')}
        <div style="border-top:1.5px solid currentColor;padding-top:12px;display:flex;justify-content:space-between;align-items:baseline"><span class="t-sous" style="font-size:17px">${A.VOIX.carte}</span><span class="t-etq" style="font-size:10px;opacity:.75;text-transform:none;letter-spacing:.01em">${A.MENTION_SANITAIRE}</span></div></div></div></div>`; };
  /* Le sous-verre (carré de 9 cm) : le verre, et la règle */
  A.sousVerre = (o = {}) => { const { l = 160, jus = 'maceration', style = '' } = o;
    return `<div class="imp" style="width:${l}px;height:${l}px;border-radius:${r1(l * 0.07)}px;${style}"><div class="imp-in fond-blanc" style="width:300px;height:300px;zoom:${r2(l / 300)};color:${C.bleu};border-radius:21px"><div style="position:absolute;left:0;right:0;top:44px;display:grid;place-items:center">${A.verre({ taille: 118, c: C.bleu, jus })}</div><div class="t-titre" style="position:absolute;left:0;right:0;bottom:30px;text-align:center;font-size:38px">Ça penche, ça tient.</div></div></div>`; };
  /* Le mot glissé dans le colis du mois */
  A.mot = (o = {}) => { const { l = 300, style = '' } = o;
    return `<div class="imp" style="width:${l}px;height:${r1(l * 0.68)}px;${style}"><div class="imp-in fond-blanc" style="width:600px;height:408px;zoom:${r2(l / 600)};color:${C.bleu}"><div class="t-etq" style="position:absolute;left:38px;top:34px;font-size:15px">Le Plein · lot du mois</div><div style="position:absolute;right:34px;top:26px">${A.verre({ taille: 54, c: C.bleu })}</div>
      <div class="t-sous" style="position:absolute;left:38px;right:38px;top:118px;font-size:39px;line-height:1.04">${A.VOIX.colis}</div><div style="position:absolute;left:38px;bottom:32px">${A.wordmark(C.bleu, 'style="width:170px;height:auto"', 'maceration')}</div></div></div>`; };

  /* ===================== MARQUE : les photos et ce que Sillon leur fait =====================
     Huit photos de marque (photos/*.jpg), générées pour le projet avec l'accord du commanditaire : aucun droit de tiers.
     pos : le cadrage par défaut ; ratio : largeur / hauteur ; quoi : le sujet ; lieux : où elle sert.
     Le traitement de la marque (Marque.photo, option mode) :
       'brut'   : la photo, avec son grain. Jamais lissée.
       'niveau' : l'image à niveau. Sous une ligne horizontale, on la voit à travers un jus (du disque à la lie) ;
                  au-dessus, elle est claire. La ligne ne penche jamais, même dans un cadre penché.
       'robe'   : deux tons, du bleu de travail (les ombres) au tuffeau (les lumières).
     Une photo peut aussi devenir le vin d'un creux : Marque.wordmark(c, attrs, jus, { photo: 'depot' }), Verse (option image). */
  A.BASE_PHOTOS = (typeof window !== 'undefined' && window.MarquePhotos) || '../photos/';
  A.PHOTOS = {
    'verre-penche': { px: [1856, 2304], ratio: 1856 / 2304, pos: '55% 40%', quoi: 'Une main penche un verre de vin orange ; la surface reste horizontale.', surface: 905 / 2304, penche: 31 },
    'trois-jus': { px: [2400, 1610], ratio: 2400 / 1610, pos: '50% 50%', quoi: 'Trois bouteilles nues à contre-jour, leurs ombres colorées.' },
    depot: { px: [2048, 2048], ratio: 1, pos: '45% 55%', quoi: 'Le fond d’un verre de vin non filtré : dépôt, nuages, bulles. Une matière.' },
    jeudi: { px: [2400, 1340], ratio: 2400 / 1340, pos: '62% 40%', quoi: 'La dégustation du jeudi soir sur le trottoir, devant la devanture bleue.' },
    caviste: { px: [1856, 2304], ratio: 1856 / 2304, pos: '40% 35%', quoi: 'Le caviste en bleu de travail, deux bouteilles contre lui, un mur de pierre claire.' },
    sillons: { px: [2400, 1340], ratio: 2400 / 1340, pos: '50% 50%', quoi: 'Des rangs de vigne vus du ciel, une silhouette en bleu.' },
    comptoir: { px: [2400, 1610], ratio: 2400 / 1610, pos: '78% 45%', quoi: 'Le comptoir vu de dessus : nappe bleue, verres des trois jus, mains, ronds de verre.', note: 'Un tire-bouchon traîne en bas à gauche : le cadrer hors champ ou le couvrir (la marque n’en montre pas).' },
    colis: { px: [2400, 1610], ratio: 2400 / 1610, pos: '50% 50%', quoi: 'Le carton de l’abonnement ouvert : trois bouteilles dans du papier de soie bleu.' },
    mur: { px: [2400, 1018], ratio: 2400 / 1018, pos: '50% 50%', quoi: 'Un mur de rue en pierre claire, la nuit, au flash, vu de face : rien dessus. Pour y coller des affiches.' },
    sac: { px: [1856, 2304], ratio: 1856 / 2304, pos: '50% 55%', quoi: 'Un sac en toile bleu porté à l’épaule, vu de dos, son grand côté à plat face à nous, vierge ; un goulot dépasse.' },
    vitrine: { px: [2400, 1610], ratio: 2400 / 1610, pos: '50% 50%', quoi: 'La devanture bleue de jour, de face : une grande vitre nue, une enseigne en bois vierge, personne.' },
    'dos-veste': { px: [1856, 2304], ratio: 1856 / 2304, pos: '50% 45%', quoi: 'Le dos de la veste de travail bleue, vierge, plein cadre, devant un mur de pierre claire.' },
  };
  A.photoURL = (nom) => A.BASE_PHOTOS + nom + '.jpg';
  /* o : mode ('brut' | 'niveau' | 'robe'), jus, niveau (0 à 1 : la hauteur remplie), pos, zoom, cls, style, cote (true : écrit le niveau) */
  A.photo = (nom, o = {}) => { const { mode = 'brut', jus = 'maceration', niveau = 0.5, pos, zoom = 1, cls = '', style = '', cote = false } = o, P = A.PHOTOS[nom] || {}, E = A.ECHELLES[jus];
    const img = `<img src="${A.photoURL(nom)}" alt="" style="object-position:${pos || P.pos || '50% 50%'};${zoom !== 1 ? `transform:scale(${zoom});` : ''}">`;
    if (mode === 'niveau') { const t = `top:${r1((1 - niveau) * 100)}%`; return `<div class="ph niv ${cls}" style="${style}">${img}<b class="nj a" style="${t};background:${E[2]}"></b><b class="nj b" style="${t};background:linear-gradient(180deg,${E[0]},${E[2]} 30%,${E[4]})"></b><b class="nj c" style="${t};background:linear-gradient(180deg,${E[3]}55,${E[3]}22)"></b><i class="nl" style="${t}"></i>${cote ? `<span class="ph-cote t-etq" style="${t}">Niveau · ${A.deg(0)}</span>` : ''}<s></s></div>`; }
    return `<div class="ph ${mode} ${cls}" style="${style}">${img}<s></s></div>`; };
  /* Un cadre penché de 12° dont l'image reste d'aplomb : la fenêtre tourne, pas la photo. o : l, h (px), angle, + les options de photo */
  A.cadre = (nom, o = {}) => { const { l = 400, h = 500, angle = A.DEGRE, style = '' } = o, a = (Math.abs(angle) * Math.PI) / 180, L = l * Math.cos(a) + h * Math.sin(a), H = l * Math.sin(a) + h * Math.cos(a);
    return `<div class="cadre" style="width:${l}px;height:${h}px;transform:rotate(${angle}deg);${style}"><div style="position:absolute;left:50%;top:50%;width:${r1(L)}px;height:${r1(H)}px;margin:${r1(-H / 2)}px 0 0 ${r1(-L / 2)}px;transform:rotate(${-angle}deg)">${A.photo(nom, { ...o, style: 'position:absolute;inset:0' })}</div></div>`; };

  /* ===================== MÉCANIQUE : poser un visuel sur une photo =====================
     quad : les quatre coins d'arrivée (haut gauche, haut droit, bas droit, bas gauche) dans le repère du parent.
     Renvoie la valeur CSS de transform qui amène un rectangle l × h sur ce quadrilatère (origine en haut à gauche). */
  A.matrice = (l, h, q) => { const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q, dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3, den = dx1 * dy2 - dx2 * dy1;
    const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den, a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3;
    return `matrix3d(${a / l},${d / l},0,${g / l},${b / h},${e / h},0,${hh / h},0,0,1,0,${x0},${y0},0,1)`; };
  /* o : l, h (la taille du visuel à plat), quad, fusion (mode de fusion CSS), opacite, cls, style */
  A.pose = (html, o = {}) => { const { l = 400, h = 300, quad, fusion = 'normal', opacite = 1, cls = '', style = '' } = o;
    return `<div class="pose ${cls}" style="width:${l}px;height:${h}px;transform:${A.matrice(l, h, quad)};mix-blend-mode:${fusion};opacity:${opacite};${style}">${html}</div>`; };

  /* Une scène : une photo de la marque et tout ce qu'on pose dessus, écrit DANS LES PIXELS DE LA PHOTO. o : l (largeur
     affichée, px), cadre [x, y, l, h] (la part de la photo qu'on montre ; toute la photo par défaut), cls, style.
     Le contenu se place en position absolue dans le repère de la photo ; la scène le met à l'échelle avec elle. */
  A.scene = (nom, contenu = '', o = {}) => { const P = A.PHOTOS[nom], [W, H] = P.px, { l = 1400, cadre = [0, 0, W, H], cls = '', style = '' } = o, k = l / cadre[2];
    return `<div class="scene ${cls}" style="width:${l}px;height:${r1(cadre[3] * k)}px;${style}"><div class="scene-in" style="width:${W}px;height:${H}px;transform:scale(${k}) translate(${-cadre[0]}px,${-cadre[1]}px)"><img src="${A.photoURL(nom)}" alt="" width="${W}" height="${H}">${contenu}</div><s></s></div>`; };
  /* Le reflet juste : par-dessus un visuel posé sur du verre, on remet les éclats de la photo (ses seules hautes
     lumières), pour que l'étiquette passe sous eux. x, y, l, h : la zone, dans les pixels de la photo. o : rot, forme (clip-path), force */
  A.reflet = (nom, x, y, l, h, o = {}) => { const { rot = 0, forme = '', force = 1 } = o, [W, H] = A.PHOTOS[nom].px;
    return `<div class="reflet" style="left:${x}px;top:${y}px;width:${l}px;height:${h}px;${forme ? `clip-path:${forme};` : ''}opacity:${force}"><div style="width:${W}px;height:${H}px;transform:translate(${-x}px,${-y}px);background:url('${A.photoURL(nom)}') 0 0/${W}px ${H}px"></div></div>`; };
  /* Un papier collé sur le verre d'une bouteille de la photo. Centre (x, y), largeur l, hauteur h, angle rot (l'axe de la
     bouteille), creux (la courbure des bords haut et bas : on regarde le cylindre d'un peu haut). Le papier suit le
     cylindre (bords courbés, côtés dans l'ombre) et reprend la lumière de la photo : une copie de la photo, recalée
     malgré la rotation, lui rend ses ombres (multiply) puis ses éclats (screen), découpés à sa forme.
     clarte : à monter sur un verre sombre ou très coloré, pour que le papier reste clair. */
  A.surVerre = (nom, html, o = {}) => { const { x, y, l, h, rot = 0, creux = 0.08, clarte = 1.45, ombre = 0.75, eclat = 1 } = o, [W, H] = A.PHOTOS[nom].px, c = r1(l * creux);
    const copie = (cls, st) => `<i class="${cls}" style="width:${W}px;height:${H}px;transform:translate(${l / 2}px,${h / 2}px) rotate(${-rot}deg) translate(${-x}px,${-y}px);background:url('${A.photoURL(nom)}') 0 0/${W}px ${H}px;${st}"></i>`;
    return `<div class="cyl" style="left:${r1(x - l / 2)}px;top:${r1(y - h / 2)}px;width:${l}px;height:${h}px;transform:rotate(${rot}deg);clip-path:path('M0,0 Q${l / 2},${c} ${l},0 L${l},${h - c} Q${l / 2},${h} 0,${h - c} Z')"><div class="cyl-in" style="padding-top:${r1(c / 2)}px">${html}</div>` +
      copie('cyl-ombre', `filter:grayscale(1) brightness(${clarte}) contrast(1.25);opacity:${ombre}`) + copie('cyl-eclat', `opacity:${eclat}`) + `<b></b></div>`; };

  /* Le logotype brodé : deux fils (celui des lettres, celui du jus), des points de bourdon en biais, un relief, une ombre.
     o : l (largeur en px), fil, jus, symbole (true : le verre seul) */
  A.brode = (o = {}) => { const { l = 260, fil = C.tuffeau, jus = 'maceration', id = 'br' + ++_id, symbole = false } = o, E = A.ECHELLES[jus], box = symbole ? A.LOGO.symbolBox : A.LOGO.box, t = symbole ? symTraces('jus') : null, dL = symbole ? t.mur : A.lettersPath(), dJ = symbole ? t.jus : A.jusPath(), pas = (box[2] / l) * 1.25;
    const motif = (n, a, c1, c2) => `<pattern id="${id}${n}" width="${r2(pas * 2)}" height="${r2(pas * 2)}" patternUnits="userSpaceOnUse" patternTransform="rotate(${a})"><rect width="${r2(pas * 2)}" height="${r2(pas * 2)}" fill="${c1}"/><rect width="${r2(pas * 0.8)}" height="${r2(pas * 2)}" fill="${c2}"/></pattern>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box[0] - 6} ${box[1] - 6} ${box[2] + 12} ${box[3] + 12}" style="width:${l}px;height:auto;overflow:visible" class="brode"><defs>${motif('a', 62, fil, '#CFC8B2')}${motif('b', -28, E[2], E[3])}
      <filter id="${id}f" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="${r2(0.9 / pas)}" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${r2(pas * 1.3)}" result="d"/>
        <feGaussianBlur in="d" stdDeviation="${r2(pas * 0.55)}" result="b"/><feSpecularLighting in="b" surfaceScale="${r2(pas * 2.2)}" specularConstant=".55" specularExponent="14" lighting-color="#fff" result="s"><feDistantLight azimuth="235" elevation="42"/></feSpecularLighting><feComposite in="s" in2="d" operator="in" result="s2"/>
        <feDropShadow in="d" dx="${r2(pas * 0.5)}" dy="${r2(pas * 0.9)}" stdDeviation="${r2(pas * 0.6)}" flood-color="#050B36" flood-opacity=".7" result="o"/><feBlend in="s2" in2="o" mode="screen"/></filter></defs>
      <g filter="url(#${id}f)"><path fill="url(#${id}b)" d="${dJ}"/><path fill="url(#${id}a)" fill-rule="evenodd" d="${dL}"/></g></svg>`; };

  /* ===================== MÉCANIQUE : pied de planche, flèche ===================== */
  A.foot = (a = '', b = '', color = C.tuffeau) => `<div class="pfoot" style="color:${color}">${A.symbol(color)}<span>${a}</span><span>${b}</span><span>2026</span></div>`;
  /* Flèche en tracé : les fichiers « latin » des polices n'ont pas toutes « → » */
  A.fleche = (c = 'currentColor', style = '', sens = 0) => `<svg viewBox="0 0 40 24" fill="none" stroke="${col(c)}" stroke-width="3.2" stroke-linecap="square" stroke-linejoin="miter" style="width:.9em;height:auto;display:inline-block;vertical-align:-.02em;transform:rotate(${sens}deg);${style}"><path d="M3,12 H35 M25,3 L35,12 L25,21"/></svg>`;

  /* ===================== MARQUE : données =====================
     Seulement ce que le commanditaire a dit. Ni adresse, ni téléphone, ni prix, ni horaire : ils ne sont pas connus. */
  A.DONNEES = { ville: 'Nantes', quartier: 'Olivettes', metier: 'Cave à vins nature',
    activites: [{ nom: 'La boutique', quoi: 'On vend en boutique.' }, { nom: 'Le jeudi', quoi: 'Dégustation le jeudi soir.' }, { nom: 'Le Plein', quoi: 'L’abonnement : trois bouteilles par mois.' }],
    abonnement: { nom: 'Le Plein', bouteilles: 3, rythme: 'par mois' }, degustation: { jour: 'jeudi', moment: 'soir' },
    mesure: { verre: 12.5, bouteille: 75, verresParBouteille: 6 },
    /* les trois bouteilles d'exemple : des jus, pas des cuvées. Leur degré est une vraisemblance, pas un fait. */
    bouteilles: [{ jus: 'maceration', dit: 'Orange, trouble', degre: 12 }, { jus: 'glou', dit: 'Rouge de soif', degre: 11 }, { jus: 'paille', dit: 'Blanc qui perle', degre: 10.5 }] };

  /* ===================== MÉCANIQUE : masques posés au chargement ===================== */
  if (typeof document !== 'undefined' && document.documentElement && document.documentElement.style) { const S = document.documentElement.style, b = A.LOGO.symbolBox;
    S.setProperty('--m-symbole', dataSVG(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb(b)}" preserveAspectRatio="none"><path d="${symTraces('aplat').mur}"/></svg>`));
    S.setProperty('--r-symbole', `${b[2]} / ${b[3]}`); }

  /* Espaces insécables : fine devant ; ! ?, pleine devant : et » et après «. Posées au chargement ; à rappeler
     (Marque.typo(el)) après avoir réécrit un texte, dans une vidéo par exemple. data-brut en dispense. */
  A.typo = (racine) => { if (typeof document === 'undefined') return; const r = racine || document.body; if (!r) return;
    const tw = document.createTreeWalker(r, NodeFilter.SHOW_TEXT); const ns = []; for (let n = tw.nextNode(); n; n = tw.nextNode()) ns.push(n);
    for (const n of ns) { const el = n.parentElement; if (!el || el.closest('script,style,pre,code,textarea,[data-brut]')) continue;
      const v = n.nodeValue, w = v.replace(/ ([;!?])/g, '\u202f$1').replace(/ ([:\u00bb])/g, '\u00a0$1').replace(/\u00ab /g, '\u00ab\u00a0');
      if (w !== v) n.nodeValue = w; } };
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('load', () => A.typo());

  window.Marque = A;
})();
