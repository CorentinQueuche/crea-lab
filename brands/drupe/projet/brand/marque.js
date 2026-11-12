/* SOCLE DE MARQUE — Drupe, torréfacteur de quartier. Gabarits partagés : logo, motifs, appareils, écrans.
   C'est le seul fichier, avec marque.css, qui définit la marque. Planches, vidéos, scènes 3D, présentation et site le lisent.
   Usage dans une page : <script src="../brand/marque.js"></script> puis Marque.wordmark('#CF2145'), Marque.pastille('guji', 220), Marque.phone(Marque.screens.accueil()) …
   Tout renvoie une chaîne HTML. Marque.seekSemis(t) anime tous les semis de la page (t en secondes, déterministe).

   CONTRAT (ce que les outils du skill attendent, quelle que soit la marque) :
     Marque.NOM, Marque.SLUG                    nom affiché, nom de fichier
     Marque.LOGO      { box:[x,y,l,h], xHeight, baseline, symbolBox:[x,y,l,h], symbolBaseline }
     Marque.LOCKUP    { lines:[…], x, size, baselines:[…], tracking, box:[x,y,l,h] }   descripteur à droite du logotype
     Marque.FONTS     { nom, variable | statiques:{Graisse:fichier}, graisses:{Nom:valeur}, logo:'Medium' }
     Marque.COULEURS_LOGO { nom: '#hex', … }    une série de fichiers logo par couleur
     Marque.wordPath(), Marque.symbolPath()     tracés SVG (attribut d), remplis en evenodd
     Marque.wordmark(c, attrs), Marque.symbol(c, attrs), Marque.lockup(c, attrs)     SVG complets

   PROPRE À DRUPE :
     Marque.COULEURS, Marque.CAFES              palette nommée ; les cinq cafés de la carte (mêmes données partout)
     Marque.semis(opts), Marque.seekSemis(t)    le semis (motif en quinconce) et son balancement
     Marque.pastille(cafe, taille, opts)        la pastille (étiquette ronde d'un café)
     Marque.etiquette(cafe, k)                  l'étiquette de sachet
     Marque.phone, Marque.watch, Marque.screens.{accueil,carte,abonnement,fiche}, Marque.watchScreen, Marque.ncard, Marque.foot */
(function () {
  const A = {};
  A.NOM = 'Drupe';
  A.SLUG = 'drupe';
  A.COULEURS = { fleur: '#FFFDF8', parche: '#F4ECDD', pulpe: '#F6C3C0', cerise: '#CF2145', vert: '#C7D5A9', feuille: '#1E4A36', grain: '#2A1A14', marc: '#150F0C' };
  const C = A.COULEURS;
  const r2 = (n) => Math.round(n * 100) / 100;

  /* ---------- Logo : capitales de 100 de haut, graisse 20. Chaque lettre est fendue d'un sillon vertical de 8, juste après son fût :
     le sillon du grain de café, et le pont d'un pochoir de sac de jute. Aucune contre-forme fermée : le logo tient en un seul aplat. ---------- */
  const S = 20, G = 8, X = S + G, GAP = 18;
  const fut = (ox) => `M${ox},0 H${ox + S} V100 H${ox} Z`;
  /* Panse haute commune à R et P : rayon 30, contre-forme de rayon 10 ouverte sur le sillon */
  const yU = (x, r) => r2(52 + Math.sqrt(r * r - (x - 48) * (x - 48))); // U : point bas des cercles de centre (48, 52)
  const L = {
    D: (ox) => fut(ox) + ` M${ox + X},0 H${ox + 46} A50,50 0 0 1 ${ox + 46},100 H${ox + X} V80 H${ox + 46} A30,30 0 0 0 ${ox + 46},20 H${ox + X} Z`,
    R: (ox) => fut(ox) + ` M${ox + X},0 H${ox + 56} A30,30 0 0 1 ${ox + 56},60 L${ox + 90},100 H${ox + 62} L${ox + X},60 V40 H${ox + 56} A10,10 0 0 0 ${ox + 56},20 H${ox + X} Z`,
    U: (ox) => `M${ox},0 H${ox + S} V${yU(S, 48)} A48,48 0 0 1 ${ox},52 Z` +
      ` M${ox + X},${yU(X, 28)} A28,28 0 0 0 ${ox + 76},52 V0 H${ox + 96} V52 A48,48 0 0 1 ${ox + X},${yU(X, 48)} Z`,
    P: (ox) => fut(ox) + ` M${ox + X},0 H${ox + 56} A30,30 0 0 1 ${ox + 56},60 H${ox + X} V40 H${ox + 56} A10,10 0 0 0 ${ox + 56},20 H${ox + X} Z`,
    E: (ox) => fut(ox) + ` M${ox + X},0 H${ox + 76} V20 H${ox + X} Z M${ox + X},40 H${ox + 68} V60 H${ox + X} Z M${ox + X},80 H${ox + 76} V100 H${ox + X} Z`,
  };
  const W = { D: 96, R: 90, U: 96, P: 86, E: 76 };
  const WORD = ['D', 'R', 'U', 'P', 'E'];
  A.LETTRES = { ordre: WORD, largeurs: W, graisse: S, sillon: G, espace: GAP };
  A.letterX = (i) => WORD.slice(0, i).reduce((s, c) => s + W[c] + GAP, 0);
  A.letterPath = (ch, ox = 0) => L[ch](ox);
  A.wordPath = () => WORD.map((c, i) => L[c](A.letterX(i))).join(' ');
  A.WORD_W = A.letterX(WORD.length) - GAP; // 516

  /* Symbole : la drupe coupée. Un disque fendu par le même sillon de 8, incliné de 24°, et sa queue. Deux grains face à face dans le fruit. */
  const SYM = { cx: 50, cy: 59, r: 39, tilt: 24, queue: { ecart: 7, rayon: 22, angle: 50, graisse: 9 } };
  A.SYM = SYM;
  A.symbolPath = () => {
    const f = (SYM.tilt * Math.PI) / 180, U = [Math.sin(f), -Math.cos(f)], V = [Math.cos(f), Math.sin(f)];
    const d = G / 2, h = Math.sqrt(SYM.r * SYM.r - d * d), r = SYM.r;
    const P = (u, v) => `${r2(SYM.cx + u * U[0] + v * V[0])},${r2(SYM.cy + u * U[1] + v * V[1])}`;
    const q = SYM.queue, s0 = [SYM.cx + (r + q.ecart) * U[0], SYM.cy + (r + q.ecart) * U[1]];
    const K = [s0[0] + q.rayon * V[0], s0[1] + q.rayon * V[1]];
    const a0 = Math.atan2(-V[1], -V[0]), a1 = a0 + (q.angle * Math.PI) / 180, ro = q.rayon + q.graisse / 2, ri = q.rayon - q.graisse / 2;
    const Q = (a, rr) => `${r2(K[0] + rr * Math.cos(a))},${r2(K[1] + rr * Math.sin(a))}`;
    return `M${P(h, d)} A${r},${r} 0 0 1 ${P(-h, d)} Z M${P(-h, -d)} A${r},${r} 0 0 1 ${P(h, -d)} Z ` +
      `M${Q(a0, ro)} A${ro},${ro} 0 0 1 ${Q(a1, ro)} L${Q(a1, ri)} A${ri},${ri} 0 0 0 ${Q(a0, ri)} Z`;
  };

  A.LOGO = { box: [0, 0, A.WORD_W, 100], xHeight: 100, baseline: 100, symbolBox: [0, 0, 100, 100], symbolBaseline: 98 };
  A.LOCKUP = { lines: ['Torréfacteur', 'de quartier'], x: 556, size: 46, baselines: [46, 98], tracking: -0.6, box: [0, -14, 828, 128] };
  A.FONTS = { nom: 'Bricolage Grotesque', variable: '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2', graisses: { Light: 300, Regular: 400, Medium: 500, SemiBold: 600 }, logo: 'Medium' };
  A.COULEURS_LOGO = { cerise: C.cerise, grain: C.grain, fleur: C.fleur, feuille: C.feuille };
  const vb = (b) => b.join(' ');
  /* Logotype */
  A.wordmark = (fill = 'currentColor', attrs = '') =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb(A.LOGO.box)}" ${attrs}><path fill="${fill}" fill-rule="evenodd" d="${A.wordPath()}"/></svg>`;
  /* Symbole */
  A.symbol = (fill = 'currentColor', attrs = '') =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb(A.LOGO.symbolBox)}" ${attrs}><path fill="${fill}" fill-rule="evenodd" d="${A.symbolPath()}"/></svg>`;
  /* Logotype + descripteur (la police de marque doit être chargée dans la page) */
  A.lockup = (fill = 'currentColor', attrs = '') => { const K = A.LOCKUP;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb(K.box)}" ${attrs}><path fill="${fill}" fill-rule="evenodd" d="${A.wordPath()}"/>` +
      K.lines.map((t, i) => `<text x="${K.x}" y="${K.baselines[i]}" fill="${fill}" font-family="${A.FONTS.nom}" font-weight="${A.FONTS.graisses[A.FONTS.logo]}" font-size="${K.size}" letter-spacing="${K.tracking}">${t}</text>`).join('') + `</svg>`; };

  /* ---------- Les cafés de la carte : mêmes données dans l'app, sur les sachets, sur les pastilles ---------- */
  A.CAFES = [
    { id: 'guji', nom: 'Guji', pays: 'Éthiopie', alt: '2 050 m', procede: 'Nature', notes: ['Fraise', 'Jasmin', 'Cacao'], usage: 'Filtre', prix: '11,50 €', ton: 'cerise', recolte: 'Janv. 2026' },
    { id: 'huila', nom: 'Huila', pays: 'Colombie', alt: '1 750 m', procede: 'Lavé', notes: ['Mandarine', 'Caramel', 'Amande'], usage: 'Filtre', prix: '10,50 €', ton: 'vert', recolte: 'Juin 2026' },
    { id: 'nyeri', nom: 'Nyeri', pays: 'Kenya', alt: '1 800 m', procede: 'Lavé', notes: ['Cassis', 'Pamplemousse', 'Thé noir'], usage: 'Filtre', prix: '12,50 €', ton: 'pulpe', recolte: 'Févr. 2026' },
    { id: 'cerrado', nom: 'Cerrado', pays: 'Brésil', alt: '1 100 m', procede: 'Nature', notes: ['Noisette', 'Chocolat', 'Pain grillé'], usage: 'Espresso', prix: '9,50 €', ton: 'grain', recolte: 'Août 2026' },
    { id: 'cauca', nom: 'Cauca', pays: 'Colombie', alt: '1 900 m', procede: 'Décaféiné', notes: ['Pomme cuite', 'Pain d\'épices', 'Sucre roux'], usage: 'Déca', prix: '11,00 €', ton: 'feuille', recolte: 'Mai 2026' },
  ];
  A.cafe = (id) => (typeof id === 'string' ? A.CAFES.find((c) => c.id === id) : id) || A.CAFES[0];
  A.DATES = { torrefaction: 'mar. 17 nov.', livraison: 'jeu. 19 nov.', tampon: 'Torréfié le 17.11.26' };

  /* ---------- La pastille : l'étiquette ronde d'un café, comme celle qu'on colle sur un fruit ----------
     cafe : identifiant ('guji'…) ou objet { nom, pays, alt, notes:[…], ton }. taille en px. opts : { ton, angle, pose } */
  const TONS = {
    cerise: { bg: C.cerise, fg: C.fleur, acc: C.pulpe },
    pulpe: { bg: C.pulpe, fg: C.grain, acc: C.cerise },
    vert: { bg: C.vert, fg: C.feuille, acc: C.feuille },
    feuille: { bg: C.feuille, fg: C.parche, acc: C.vert },
    grain: { bg: C.grain, fg: C.parche, acc: C.pulpe },
    fleur: { bg: C.fleur, fg: C.grain, acc: C.cerise },
  };
  A.TONS = TONS;
  let pid = 0;
  A.pastille = (cafe = 'guji', size = 200, opts = {}) => {
    const c = A.cafe(cafe), T = TONS[opts.ton || c.ton] || TONS.cerise, id = 'pst' + (pid++);
    const { angle = 0, pose = false, haut = 'Torréfacteur de quartier' } = opts;
    const up = (s) => s.toUpperCase();
    const big = c.nom.length > 6 ? 30 : 38;
    return `<svg class="pastille${pose ? ' pose' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}" style="transform:rotate(${angle}deg)">` +
      `<defs><path id="${id}a" d="M27,100 A73,73 0 0 1 173,100"/><path id="${id}b" d="M19,100 A81,81 0 0 0 181,100"/></defs>` +
      `<circle cx="100" cy="100" r="99" fill="${T.bg}"/><circle cx="100" cy="100" r="91.5" fill="none" stroke="${T.fg}" stroke-opacity=".5" stroke-width="1"/>` +
      `<g fill="${T.fg}" font-family="IBM Plex Mono" font-weight="500" font-size="8.6" letter-spacing="1.5" text-anchor="middle">` +
      `<text><textPath href="#${id}a" startOffset="50%">${up(haut)}</textPath></text>` +
      `<text><textPath href="#${id}b" startOffset="50%">${up(c.notes.slice(0, 2).join(' · '))}</textPath></text>` +
      `<text x="100" y="138" letter-spacing="1.2">${up(c.pays)} · ${up(c.alt)}</text></g>` +
      `<g transform="translate(83 44) scale(.34)"><path fill="${T.acc}" fill-rule="evenodd" d="${A.symbolPath()}"/></g>` +
      `<text x="100" y="116" text-anchor="middle" fill="${T.fg}" font-family="Bricolage Grotesque" font-weight="600" font-size="${big}" letter-spacing="-1">${c.nom}</text></svg>`;
  };

  /* ---------- Le semis : drupes en quinconce, chacune tournée d'un angle fixe ----------
     opts : { cols, rows, pas, taille, tons:[couleurs], seed, opacite }. Le SVG remplit son parent (position relative). */
  A.semis = (opts = {}) => {
    const { cols = 8, rows = 5, pas = 120, taille = 56, tons = [C.pulpe], seed = 0, opacite = 1, cls = '' } = opts;
    const d = A.symbolPath(), k = r2(taille / 100); let out = '';
    for (let r = 0; r < rows; r++) for (let c = -1; c <= cols; c++) {
      const x = r2((c + 0.5) * pas + (r % 2 ? pas / 2 : 0)), y = r2((r + 0.5) * pas);
      const a = ((c * 5 + r * 7 + seed * 3 + 60) % 12) * 30, ton = tons[(((c * 2 + r * 3 + seed) % tons.length) + tons.length) % tons.length];
      out += `<g class="sm" data-x="${x}" data-y="${y}" data-a="${a}" data-k="${k}" transform="translate(${x} ${y}) rotate(${a}) scale(${k}) translate(-50 -52)"><path fill="${ton}" fill-rule="evenodd" d="${d}"/></g>`;
    }
    return `<svg class="semis ${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols * pas} ${rows * pas}" preserveAspectRatio="xMidYMid slice" style="opacity:${opacite}">${out}</svg>`;
  };
  /* Balance les drupes du semis, comme des fruits sur la branche : t en secondes. Boucle parfaite toutes les `loop` secondes. */
  A.seekSemis = (t, loop = 8, root = document, amp = 14) => {
    const w = (2 * Math.PI * t) / loop;
    root.querySelectorAll('.semis .sm').forEach((g, i) => {
      const s = g.dataset, a = r2(+s.a + amp * Math.sin(w + i * 1.3));
      g.setAttribute('transform', `translate(${s.x} ${s.y}) rotate(${a}) scale(${s.k}) translate(-50 -52)`);
    });
  };

  /* ---------- Icônes ---------- */
  const statusIcons = (c) => `<span style="display:flex;gap:6px;align-items:center"><svg viewBox="0 0 18 12" fill="${c}"><rect x="0" y="8" width="3" height="4" rx=".7"/><rect x="5" y="5.5" width="3" height="6.5" rx=".7"/><rect x="10" y="3" width="3" height="9" rx=".7"/><rect x="15" y="0" width="3" height="12" rx=".7"/></svg>` +
    `<svg viewBox="0 0 17 12" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"><path d="M1.5 4.2a10 10 0 0 1 14 0M4.2 7a6.2 6.2 0 0 1 8.6 0"/><circle cx="8.5" cy="10.2" r="1" fill="${c}" stroke="none"/></svg>` +
    `<svg viewBox="0 0 27 12" fill="none"><rect x=".6" y=".6" width="22.8" height="10.8" rx="3.2" stroke="${c}" stroke-opacity=".5"/><rect x="2.2" y="2.2" width="19.6" height="7.6" rx="1.8" fill="${c}"/><rect x="25" y="4" width="1.6" height="4" rx=".8" fill="${c}" fill-opacity=".5"/></svg></span>`;
  const status = (time = '9:41', c = C.grain) => `<div class="status" style="color:${c}"><span>${time}</span>${statusIcons(c)}</div>`;
  const plus = (c = C.grain) => `<svg viewBox="0 0 14 14" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"><path d="M7 1.5v11M1.5 7h11"/></svg>`;
  const check = (c = C.fleur) => `<svg viewBox="0 0 14 14" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7.4l3.3 3.3L12 3.6"/></svg>`;
  const chevron = (c = C.grain, dir = 'right') => `<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(${dir === 'left' ? 180 : 0}deg)"><path d="M5 2.5l4.5 4.5L5 11.5"/></svg>`;
  const velo = (c = C.grain) => `<svg viewBox="0 0 24 16" width="24" height="16" fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="11" r="4"/><circle cx="19" cy="11" r="4"/><path d="M5 11l4-7h6l4 7M9 4l4 7h6M13 11l2-7M8 4H6.5M14 2.5h2.5"/></svg>`;
  A.icons = { status, plus, check, chevron, velo };

  /* ---------- Appareils ---------- */
  A.phone = (screenHTML, k = 1, extra = '') =>
    `<div class="phone" style="--k:${k};${extra}"><i class="btn l1"></i><i class="btn l2"></i><i class="btn l3"></i><i class="btn r1"></i><div class="screen"><div class="island"></div>${screenHTML}</div></div>`;
  A.watch = (inner, k = 1, extra = '') =>
    `<div class="watch" style="--k:${k};${extra}"><div class="band t"></div><div class="band b"></div><div class="crown"></div><div class="side"></div><div class="case"><div class="wscreen">${inner}</div></div></div>`;

  /* ---------- Écrans (390 × 844) : l'app d'abonnement ---------- */
  const SC = {};
  const tabs = (on) => `<div class="u-tabs">${['Accueil', 'La carte', 'Abonnement'].map((t, i) => `<span class="${i === on ? 'on' : ''}">${t}</span>`).join('')}</div>`;
  const ligne = (id, droite) => { const c = A.cafe(id);
    return `<div style="display:flex;align-items:center;gap:14px">${A.pastille(c, 58)}<div style="flex:1;min-width:0"><div style="font-size:19px;font-weight:500;letter-spacing:-.015em;line-height:1.1">${c.nom}</div>` +
      `<div class="cap" style="margin-top:4px">${c.pays} · ${c.procede}</div><div style="font-size:13px;line-height:1.25;margin-top:3px;opacity:.8">${c.notes.join(', ').toLowerCase()}</div></div>${droite}</div>`; };

  /* 1. Accueil : la prochaine boîte */
  SC.accueil = (o = {}) => `<div class="ui ui-bg-a">${status()}
    <div style="position:absolute;top:72px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:center">${A.symbol(C.cerise, 'style="height:34px;width:auto"')}
      <div style="width:38px;height:38px;border-radius:50%;background:${C.fleur};display:grid;place-items:center;font-weight:600;font-size:15px">${(o.prenom || 'Inès')[0]}</div></div>
    <div class="cap" style="position:absolute;top:132px;left:24px">Samedi 14 novembre</div>
    <p class="u-h" style="position:absolute;top:152px;left:24px;right:24px;font-size:35px">Bonjour ${o.prenom || 'Inès'}.<br>On torréfie <span style="color:${C.cerise}">mardi</span>.</p>
    <div class="u-card" style="position:absolute;top:248px;left:16px;right:16px;padding:18px 18px 16px">
      <div style="display:flex;justify-content:space-between"><span class="cap">Prochaine boîte</span><span class="cap">N° 17</span></div>
      <div style="display:grid;gap:14px;margin-top:14px">${ligne('guji', '<span style="font-size:14px;font-weight:500">250 g</span>')}${ligne('huila', '<span style="font-size:14px;font-weight:500">250 g</span>')}</div>
      <div class="u-line" style="margin:16px 0 13px"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><div class="cap">Torréfié</div><div style="font-size:16px;font-weight:500;margin-top:3px">${A.DATES.torrefaction}</div></div>
        <div><div class="cap">Livré à vélo</div><div style="font-size:16px;font-weight:500;margin-top:3px">${A.DATES.livraison}</div></div></div>
      <div class="u-btn" style="margin-top:16px">Modifier ma boîte</div>
      <div class="cap" style="text-align:center;margin-top:10px">Jusqu'à lundi, 20 h</div></div>
    <div style="position:absolute;top:622px;left:16px;right:16px;height:126px;border-radius:26px;background:${C.vert};color:${C.feuille};overflow:hidden;padding:18px 20px">
      <div class="cap">Nouveau cette semaine</div><div style="font-size:23px;font-weight:500;letter-spacing:-.02em;margin-top:8px">Nyeri, Kenya</div>
      <div style="font-size:13.5px;margin-top:3px;opacity:.85">Cassis, pamplemousse, thé noir.</div>
      <div style="position:absolute;right:-18px;top:-6px">${A.pastille('nyeri', 138, { angle: 12 })}</div></div>
    ${tabs(0)}<div class="home"></div></div>`;

  /* 2. La carte : choisir ses cafés */
  SC.carte = (o = {}) => { const pris = o.pris || ['guji', 'huila'];
    return `<div class="ui ui-bg-b">${status()}
    <div style="position:absolute;top:74px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:flex-end">
      <div class="u-h" style="font-size:44px">La carte</div><div class="cap" style="text-align:right;padding-bottom:6px">Semaine 47<br>${pris.length} sur 2 choisis</div></div>
    <div style="position:absolute;top:142px;left:24px;right:0;display:flex;gap:8px"><span class="u-chip on">Tous</span><span class="u-chip">Filtre</span><span class="u-chip">Espresso</span><span class="u-chip">Déca</span></div>
    <div style="position:absolute;top:194px;left:24px;right:24px">${A.CAFES.map((c) => `<div class="u-line"></div>
      <div style="display:flex;align-items:center;gap:14px;height:106px">${A.pastille(c, 74)}<div style="flex:1;min-width:0"><div style="font-size:22px;font-weight:500;letter-spacing:-.02em;line-height:1.1">${c.nom}</div>
        <div class="cap" style="margin-top:5px">${c.pays} · ${c.alt} · ${c.procede}</div><div style="font-size:13.5px;line-height:1.25;margin-top:4px;opacity:.8">${c.notes.join(', ').toLowerCase()}</div></div>
        <div style="display:grid;justify-items:end;gap:8px"><div class="u-add ${pris.includes(c.id) ? 'on' : ''}">${pris.includes(c.id) ? check() : plus()}</div><div style="font-size:13.5px;font-weight:500">${c.prix}</div></div></div>`).join('')}</div>
    ${tabs(1)}<div class="home"></div></div>`; };

  /* 3. L'abonnement : rythme, quantité, goût */
  SC.abonnement = () => { const gouts = [['Fruité', 82, C.cerise], ['Floral', 58, C.pulpe], ['Chocolaté', 34, C.grain], ['Épicé', 18, C.feuille]];
    return `<div class="ui ui-bg-c">${status()}
    <div class="cap" style="position:absolute;top:78px;left:24px">Abonnée depuis mars 2026</div>
    <div class="u-h" style="position:absolute;top:98px;left:24px;font-size:36px">Mon abonnement</div>
    <div style="position:absolute;top:160px;left:16px;right:16px;display:grid;gap:10px">
      <div class="u-card" style="padding:16px 16px 15px"><div style="display:flex;justify-content:space-between"><span class="cap">Un envoi tous les</span><span class="cap">Prochain : ${A.DATES.torrefaction}</span></div>
        <div class="u-seg" style="margin-top:11px"><span>7 jours</span><span class="on">15 jours</span><span>1 mois</span></div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="u-card" style="padding:16px"><div class="cap">Quantité</div><div style="font-size:24px;font-weight:500;letter-spacing:-.02em;margin-top:8px">2 × 250 g</div>
          <div style="display:flex;gap:8px;margin-top:10px"><div class="u-add"><svg viewBox="0 0 14 14" fill="none" stroke="${C.grain}" stroke-width="1.8" stroke-linecap="round"><path d="M1.5 7h11"/></svg></div><div class="u-add">${plus()}</div></div></div>
        <div class="u-card" style="padding:16px"><div class="cap">Mouture</div><div style="font-size:24px;font-weight:500;letter-spacing:-.02em;margin-top:8px">En grains</div>
          <div style="font-size:13px;line-height:1.3;margin-top:10px;opacity:.75">Moulu à la demande, pour filtre ou espresso.</div></div></div>
      <div class="u-card" style="padding:16px 16px 17px"><div style="display:flex;justify-content:space-between"><span class="cap">Votre goût</span><span class="cap">23 cafés goûtés</span></div>
        <div style="display:grid;gap:9px;margin-top:13px">${gouts.map(([n, v, col]) => `<div style="display:grid;grid-template-columns:82px 1fr 34px;align-items:center;gap:10px;font-size:13.5px"><span>${n}</span><div class="u-bar"><b style="width:${v}%;background:${col}"></b></div><span class="mono" style="font-size:10.5px;text-align:right;opacity:.7">${v} %</span></div>`).join('')}</div></div>
      <div class="u-card" style="padding:15px 16px 16px"><div style="display:flex;justify-content:space-between"><span class="cap">Prochains envois</span><span class="cap">Le mardi, on torréfie</span></div>
        <div style="display:flex;gap:8px;margin-top:11px"><span class="u-chip" style="background:${C.cerise};color:${C.fleur};box-shadow:none">17 nov.</span><span class="u-chip">1<sup style="font-size:.7em;margin-right:3px">er</sup> déc.</span><span class="u-chip">15 déc.</span><span class="u-chip">29 déc.</span></div></div>
      <div class="u-card" style="padding:13px 16px;display:flex;align-items:center;gap:14px">${velo()}<div style="flex:1"><div style="font-size:15px;font-weight:500">21 € par envoi</div><div style="font-size:13px;opacity:.75;margin-top:1px">Vélo compris.</div></div><span class="u-chip">Mettre en pause</span></div>
    </div>${tabs(2)}<div class="home"></div></div>`; };

  /* 4. La fiche d'un café */
  SC.fiche = (id = 'guji') => { const c = A.cafe(id);
    return `<div class="ui ui-bg-b">${status()}
    <div class="g5" style="position:absolute;left:0;right:0;top:0;height:392px;overflow:hidden">${A.semis({ cols: 5, rows: 5, pas: 92, taille: 40, tons: [C.fleur], opacite: .5 })}
      <div style="position:absolute;top:66px;left:20px;width:42px;height:42px;border-radius:50%;background:${C.fleur};display:grid;place-items:center">${chevron(C.grain, 'left')}</div>
      <div style="position:absolute;left:0;right:0;top:112px;display:grid;place-items:center">${A.pastille(c, 236, { angle: -8, pose: true })}</div></div>
    <div style="position:absolute;left:0;right:0;top:362px;bottom:0;background:${C.fleur};border-radius:34px 34px 0 0;padding:28px 24px 0">
      <div style="display:flex;justify-content:space-between;align-items:flex-end"><div class="u-h" style="font-size:50px">${c.nom}</div><span class="tampon" style="margin-bottom:8px">${A.DATES.tampon}</span></div>
      <div class="cap" style="margin-top:8px">${c.pays} · ${c.alt} · ${c.procede}</div>
      <div style="display:flex;gap:8px;margin-top:16px">${c.notes.map((n) => `<span class="u-chip">${n}</span>`).join('')}</div>
      <p style="font-size:15.5px;line-height:1.42;margin-top:16px">Des petits producteurs, un à deux hectares chacun. Les cerises sèchent entières au soleil, sur des lits surélevés. En tasse&nbsp;: fraise mûre, jasmin, une fin de cacao.</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px">${[['Récolte', c.recolte], ['Torréfaction', 'Claire'], ['Recette', '15 g · 250 ml']].map(([a, b]) => `<div><div class="u-line"></div><div class="cap" style="margin-top:9px">${a}</div><div style="font-size:15px;font-weight:500;margin-top:3px">${b}</div></div>`).join('')}</div></div>
    <div class="u-btn" style="position:absolute;left:16px;right:16px;bottom:30px;height:56px;border-radius:28px;justify-content:space-between;padding:0 24px;z-index:9"><span>Ajouter à ma boîte</span><span>${c.prix}</span></div>
    <div class="home"></div></div>`; };
  A.screens = SC;

  /* Écran de montre : le minuteur d'infusion */
  A.watchScreen = (o = {}) => { const { temps = '2:30', cafe = 'guji', part = 0.62, heure = '10:51' } = o, c = A.cafe(cafe), R = 78, P = 2 * Math.PI * R;
    return `<div class="cap" style="position:absolute;top:22px;left:30px;font-size:10px;opacity:.95">V60 · ${c.nom}</div><div class="cap" style="position:absolute;top:22px;right:30px;font-size:10px;opacity:.95">${heure}</div>
     <svg viewBox="0 0 222 242" style="position:absolute;inset:0"><circle cx="111" cy="132" r="${R}" fill="none" stroke="${C.fleur}" stroke-opacity=".25" stroke-width="7"/>
       <circle cx="111" cy="132" r="${R}" fill="none" stroke="${C.fleur}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${r2(P * part)} ${r2(P)}" transform="rotate(-90 111 132)"/></svg>
     <div style="position:absolute;left:0;right:0;top:96px;text-align:center;font-size:54px;line-height:1;font-weight:500;letter-spacing:-.03em">${temps}</div>
     <div class="cap" style="position:absolute;left:0;right:0;top:160px;text-align:center;font-size:9.5px;opacity:.95">15 g · 250 ml</div>`; };

  /* Carte de message : un mot du torréfacteur */
  A.ncard = (title, text, o = {}) => `<div class="ncard"><div class="hd"><i>${A.symbol(C.fleur)}</i><span>${title}</span><span class="cap">${o.heure || '8:12'}</span></div><div class="tx">${text}</div><div class="in"><span>${o.action || 'Suivre ma boîte'}</span>${chevron(C.cerise)}</div></div>`;

  /* Étiquette de sachet (320 × 430, mise à l'échelle par k) */
  A.etiquette = (cafe = 'guji', k = 1, extra = '') => { const c = A.cafe(cafe);
    return `<div class="etiquette" style="--k:${k};${extra}"><div class="et-top">${A.wordmark(C.cerise)}<span class="cap">250 g</span></div>
      <div class="et-nom">${c.nom}</div><div class="et-notes">${c.notes[0]}, ${c.notes.slice(1).join(', ').toLowerCase()}.</div>${A.pastille(c, 124, { angle: 9 })}<span class="tampon">${A.DATES.tampon}</span>
      <dl><dt>Origine</dt><dd>${c.pays}</dd><dt>Altitude</dt><dd>${c.alt}</dd><dt>Procédé</dt><dd>${c.procede}</dd><dt>Pour</dt><dd>${c.usage}</dd></dl></div>`; };

  /* Pied de planche : symbole + rubriques + année */
  A.foot = (a, b, color = C.grain) => `<div class="pfoot" style="color:${color}">${A.symbol(color)}<span>${a}</span><span>${b}</span><span>2026©</span></div>`;

  window.Marque = A;
})();
