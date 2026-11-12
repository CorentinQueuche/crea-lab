/* CUSTOM — les écrans du site (reprise fidèle du site livré en 2025, poussée par le système).
   Chargé après marque.js. Ajoute à Marque :
   - Marque.site   : pages en 1440 px (accueil, univers(cle), atelier, devis), Marque.site.blocs (chaque section seule), Marque.site.H (hauteurs).
   - Marque.mobile : pages en 390 px (contenu de la zone .scr de Marque.phone), Marque.mobile.H.
   Chaque fonction renvoie une chaîne HTML : un seul élément racine, largeur et hauteur fixées en px.
   Les hauteurs sont la somme des hauteurs fixes des sections (chaque section a overflow:hidden) : la page mesure exactement H.
   Aucune animation, aucune horloge. Textes : ceux du site (Marque.PHRASES, Marque.DONNEES) ; chiffres : ceux de MARQUE.md. */
(function () {
  const M = window.Marque, C = M.COULEURS, D = M.DONNEES, NB = M.NB;
  const S = {}, B = {}, SM = {}, BM = {};

  /* ---------- Outils ---------- */
  const fl = (c = 'currentColor', sens = 0) => M.fleche(c, '', sens);
  const sec = (cls, h, html, st = '') => `<section class="s-sec ${cls}" style="height:${h}px;${st}">${html}</section>`;
  const page = (cls, secs) => { const h = secs.reduce((a, s) => a + s[0], 0); return { h, html: `<div class="s-page ${cls}" style="height:${h}px">${secs.map((s) => s[1]).join('')}</div>` }; };
  const titre = (a, mot, o = {}) => `<h2 class="t-titre s-h2" style="font-size:${o.t || 84}px;${o.st || ''}">${a}${M.surl(mot, o.s || '')}${o.b || ''}</h2>`;
  const kick = (t, cls = '') => `<div class="s-k ${cls}">${t}</div>`;
  const puce = (t, cls = '') => `<span class="s-puce ${cls}"><i></i>${t}</span>`;
  const cadre = (html, st = '', t = 18, cls = '') => `<div class="cadre-r s-cadre ${cls}" style="${st}">${M.reperes({ t })}${html}</div>`;
  const ph = (nom, o = {}) => M.photo(nom, Object.assign({}, o, { style: 'position:absolute;inset:0;' + (o.style || '') }));
  const masqueCoulure = (o) => `-webkit-mask-image:${M.coulureURL(o)};mask-image:${M.coulureURL(o)};-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat`;
  const masquePix = (txt) => { const u = M.dataSVG(M.pix(txt, { c: '#000' })); return `-webkit-mask-image:${u};mask-image:${u};-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center`; };
  const champ = (lb, ex, o = {}) => `<label class="s-champ"><span>${lb}</span><span class="s-in${o.cls ? ' ' + o.cls : ''}">${ex}${o.select ? '<i class="s-chev"></i>' : ''}</span></label>`;
  const U = (cle) => D.univers.find((u) => u.cle === cle) || D.univers[0];
  const T = (cle) => D.techniques.find((t) => t.cle === cle);

  /* Photos d'atelier pour chaque technique, photos de chaque univers */
  const PH_TECH = { serigraphie: ['serigraphie', '60% 50%'], dtf: ['traceur', '40% 60%'], broderie: ['broderie', '50% 60%'], flocage: ['presse', '45% 55%'], sublimation: ['peloton', '42% 55%'] };
  const PH_UNIV = { textile: ['hoodie', 'maille', 'broderie'], print: ['traceur', 'serigraphie', 'pliage'], goodies: ['pliage', 'fils', 'presse'], signaletique: ['mur', 'traceur', 'equipe'] };
  /* Techniques conseillées par univers (les autres restent proposées sur demande) */
  const CONSEIL = { textile: ['serigraphie', 'dtf', 'broderie', 'flocage', 'sublimation'], print: ['serigraphie'], goodies: ['serigraphie', 'dtf', 'broderie', 'sublimation'], signaletique: ['serigraphie', 'sublimation'] };
  /* Accroche d'univers : la seconde ligne porte le surligneur sur sa fin */
  const SURL = { textile: ['avec ', 'style'], print: ['', 'qui restent'], goodies: ['', 'chaque occasion'], signaletique: ['là où ', 'ça compte'] };
  const CODE_U = { textile: 'TEX', print: 'PRT', goodies: 'GDS', signaletique: 'SIG' };
  /* largeur approchée de l'Archivo étirée graisse 800, en em par caractère (mesurée sur « Transformez ») */
  const AR = 0.68;
  const tailleLarge = (txt, max, l) => Math.floor(Math.min(max, l / (txt.length * AR)));

  /* Picto « paiement » des cartes de promesse : deux cartes bancaires en blocs (comme sur le site) */
  const rowsPaiement = (() => { const W = 23, H = 14, g = []; for (let y = 0; y < H; y++) g.push(Array(W).fill('.'));
    const rect = (x0, y0, x1, y1, vide) => { if (vide) for (let y = y0 + 1; y < y1; y++) for (let x = x0 + 1; x < x1; x++) g[y][x] = '.';
      for (let x = x0; x <= x1; x++) { g[y0][x] = '#'; g[y1][x] = '#'; } for (let y = y0; y <= y1; y++) { g[y][x0] = '#'; g[y][x1] = '#'; } };
    rect(6, 0, 22, 9); rect(0, 4, 16, 13, true);
    [[8, 2], [9, 2], [10, 2], [19, 6], [20, 6], [2, 7], [3, 7], [4, 7], [2, 8], [3, 8], [4, 8], [11, 11], [13, 11]].forEach(([x, y]) => { g[y][x] = '#'; });
    return g.map((r) => r.join('')); })();

  /* ================================================================ SECTIONS ORDINATEUR */

  /* Navigation. o.actif : nom du menu en cours */
  B.nav = (o = {}) => `<div class="s-nav"><span class="s-logo">${M.logo('#fff', '', { sym: C.fluo })}</span>
    <nav class="s-menu">${D.menu.map((m) => `<span class="${m === o.actif ? 'on' : ''}">${m}</span>`).join('')}</nav>
    <span class="s-sp"></span><span class="s-lang">FR</span><span class="bouton">Devis gratuit</span></div>`;

  /* Héros d'accueil (900) */
  B.heros = () => sec('s-heros', 900, `
    <div class="s-fond tx-toile"></div>
    <div class="s-abs" style="left:-120px;top:150px;width:1180px;height:600px;z-index:1">${M.coulure({ w: 1180, h: 600, c: C.fonte, seed: 21, cx: 0.46, cy: 0.5, rx: 0.4, ry: 0.4, frange: 0.2, pas: 4, attrs: 'style="width:100%;height:100%"' })}</div>
    ${B.nav({ actif: '' })}
    <div class="s-abs t-mono" style="left:52px;top:116px;z-index:6;color:rgba(255,255,255,.5)">${M.DESCRIPTEUR}${NB}·${NB}textile, print, goodies, signalétique</div>
    <div class="s-mega t-large" style="left:40px;top:142px;font-size:182px">Transformez</div>
    <div class="s-abs" style="left:742px;top:290px;width:660px;z-index:2">${M.symbol(C.fluo, 'style="width:100%;height:auto"', { contour: 2 })}</div>
    <div class="s-heros-ph dans-cran" style="left:706px;top:262px;width:660px">${ph('dunk', { pos: '50% 26%' })}</div>
    <div class="s-sous t-large" style="left:52px;top:356px;font-size:58px">vos idées en</div>
    <div class="s-sous t-large" style="left:44px;top:430px;font-size:58px">${M.surl('produits personnalisés premium')}</div>
    <div class="s-abs" style="left:52px;top:566px;z-index:6;display:flex;gap:12px"><span class="bouton s-g">Demander mon devis gratuit ${fl()}</span><span class="bouton filet s-g">Découvrir l’atelier</span></div>
    <div class="s-abs" style="left:592px;top:548px;z-index:5;color:#fff">${M.dunk(5, { c: '#fff', attrs: 'style="height:200px;width:auto"' })}</div>
    ${cadre(['Production 100' + NB + '% intégrée', 'Livraison sous 7 à 10 jours', '+500 projets réalisés'].map((t, i) => `<div class="s-cel"><span class="t-mono">0${i + 1}${NB}/${NB}03</span>${puce(t)}</div>`).join(''), 'position:absolute;left:52px;right:52px;top:752px;height:96px;display:grid;grid-template-columns:repeat(3,1fr);z-index:5;background:rgba(16,16,18,.82)', 18, 's-bandeau')}
    <div class="s-abs" style="right:52px;top:124px;z-index:6;display:flex;align-items:center;gap:12px">${M.mire(20, 'color:rgba(255,255,255,.45)')}<span class="t-mono" style="color:rgba(255,255,255,.5)">CST${NB}·${NB}2025</span></div>`);

  /* Quatre univers en une rangée (640). o.actif : index de la carte survolée (0 par défaut, -1 pour aucune) */
  B.univers4 = (o = {}) => { const a = o.actif == null ? 0 : o.actif;
    return sec('s-univ', 640, `
    <div class="s-tete" style="top:96px;display:flex;justify-content:space-between;align-items:flex-end">
      <div>${kick('Nos univers')}${titre('Quatre univers sous ', 'un même toit')}</div>
      <p class="s-txt" style="width:300px;padding-bottom:10px">Un seul interlocuteur, un seul atelier. Choisissez votre univers, nous choisissons la technique.</p></div>
    ${cadre(D.univers.map((u, i) => `<div class="s-u4${i === a ? ' on' : ''}">
        <div class="s-u4-h"><span class="t-mono">0${i + 1}${NB}·${NB}${CODE_U[u.cle]}</span>${M.picto(u.cle, { c: i === a ? C.encre : C.fluo, attrs: 'style="height:84px;width:auto"' })}</div>
        <div class="t-titre s-u4-n">${u.nom}</div><p class="s-u4-p">${u.produits.slice(0, 4).join(' · ')}</p>
        <span class="s-u4-l">Découvrir ${fl()}</span></div>`).join(''), 'position:absolute;left:52px;right:52px;top:262px;height:330px;display:grid;grid-template-columns:repeat(4,1fr)')}`); };

  /* Chaque objet, sa technique : cinq cartes qui montent d'un pas (800) */
  B.techniques = (o = {}) => { const on = o.actif == null ? 2 : o.actif;
    return sec('s-tech', 800, `
    <div class="s-tete" style="top:96px">${kick('Cinq techniques, un atelier')}${titre('Chaque objet, sa ', 'technique')}</div>
    <p class="s-chapo s-abs" style="left:880px;top:132px;width:400px;font-size:16px">Pas d’intermédiaire, pas de compromis. Notre atelier gère chaque étape : création, impression, personnalisation et finition.</p>
    <div class="s-abs" style="right:52px;top:706px;display:flex;gap:10px"><span class="s-rond">${fl('#fff', 180)}</span><span class="s-rond on">${fl()}</span></div>
    ${D.techniques.map((t, i) => { const p = PH_TECH[t.cle];
      return `<div class="s-tc" style="left:${52 + i * 268}px;top:${370 - i * 26}px">
        <div class="s-tc-ph"${i === on ? ' style="box-shadow:0 0 0 3px var(--fluo)"' : ''}>${ph(p[0], { pos: p[1], mode: i === on ? 'brut' : 'brut' })}${M.pastille(`CST${NB}·${NB}${t.code}`, i === on)}</div>
        <div class="t-titre s-tc-n">${t.nom}</div><p class="s-tc-p">${t.pour}</p></div>`; }).join('')}`); };

  /* En quelques chiffres (880) */
  B.chiffres = () => sec('s-chif', 880, `
    <div class="s-tete centre" style="top:92px">${kick('Custom en bref')}${titre('En quelques ', 'chiffres')}</div>
    ${cadre(D.chiffres.map(([n, l, s]) => `<div class="s-cel s-ch" style="height:280px"><div class="s-ch-n">${n}</div><div class="s-ch-l">${l}</div><div class="s-ch-s">${s}</div></div>`).join('') +
      `<div class="s-tuile" style="background:var(--noir);border-top:1px solid var(--filet)">
          <div class="s-abs" style="left:22px;right:22px;top:40px;bottom:64px;${masquePix('500')}">${ph('peloton', { pos: '45% 50%', mode: 'points', tp: 6, ct: 1.3 })}</div>
          <span class="t-mono s-abs" style="left:26px;bottom:24px;color:rgba(255,255,255,.5)">+500 projets réalisés</span></div>
        <div class="s-tuile" style="background:#000">${ph('maille', { mode: 'nb', style: 'opacity:.75' })}<div class="s-abs" style="inset:0;display:grid;place-items:center">${M.sprite('course', 1, { c: C.fluo, attrs: 'style="height:210px;width:auto"' })}</div></div>
        <div class="s-tuile" style="background:var(--fluo);color:var(--encre);display:grid;place-items:center">${M.chemin({ w: 330, h: 230, c: C.encre, ep: 3.4, taille: 12.5 })}</div>
        <div class="s-tuile tx-motif" style="--tm:96px;color:var(--fonte)"></div>`,
      'position:absolute;left:52px;right:52px;top:262px;height:572px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:280px 1fr')}`);

  /* Travaillons ensemble en toute sérénité (740) */
  B.serenite = () => { const P = D.promesses, w = 426, x = (i) => 52 + i * (w + 25);
    return sec('s-sere', 740, `
    <div class="s-tete centre" style="top:92px">${kick('Nos engagements')}${titre('Travaillons ensemble en ', 'toute sérénité')}</div>
    <div class="s-pr" style="left:${x(0)}px;top:262px;width:${w}px;height:430px;background:var(--graphite)">
      <div class="s-pr-v">${M.grille(rowsPaiement, { c: C.acier, attrs: 'style="width:300px;height:auto"' })}</div><b>${P[0][0]}</b><p>${P[0][1]}</p></div>
    <div class="s-pr" style="left:${x(1)}px;top:262px;width:${w}px;height:430px;background:var(--fluo);color:var(--encre)">
      <div class="s-pr-v">${M.pix('24h', { c: C.acier, attrs: 'style="height:150px;width:auto"' })}</div><b>${P[1][0]}</b><p>${P[1][1]}</p></div>
    <div class="s-pr" style="left:${x(2)}px;top:262px;width:${w}px;height:430px;background:#fff;color:var(--encre)">
      <div class="s-pr-v"><div class="t-titre" style="font-size:84px;color:var(--acier);line-height:.84">Sans<br>engagement</div></div><b>${P[2][0]}</b><p>${P[2][1]}</p></div>`); };

  /* Prêt à donner vie à votre projet ? avec le formulaire (800). o.univers : univers pré-rempli */
  B.appel = (o = {}) => { const d = D.devis;
    return sec('s-appel', 800, `
    <div class="s-abs" style="left:-120px;top:-40px;width:900px;height:430px;z-index:0">${M.coulure({ w: 900, h: 430, c: C.orange, seed: 33, cx: 0.42, cy: 0.46, rx: 0.42, ry: 0.4, frange: 0.18, attrs: 'style="width:100%;height:100%"' })}</div>
    <div class="s-abs" style="left:52px;top:90px;width:600px;height:640px;border-radius:20px;overflow:hidden;z-index:1">${ph('trail', { pos: '72% 50%' })}
      <div class="s-abs" style="left:0;right:0;bottom:46px;display:flex;justify-content:center;align-items:flex-end;gap:26px">${[1, 2, 3, 4].map((i) => M.sprite('course', i, { c: C.fluo, attrs: 'style="height:104px;width:auto"' })).join('')}</div></div>
    <div class="s-abs" style="left:716px;top:90px;width:672px;z-index:2">
      ${kick('Devis gratuit')}
      <h2 class="t-titre s-h2" style="font-size:96px">${d.titre[0]}<br>${d.titre[1]} ${M.surl(d.titre[2])}</h2>
      <p class="s-txt" style="margin-top:22px;max-width:560px">Obtenez un devis gratuit en moins de 24${NB}h. Aucun engagement, juste des réponses claires et un accompagnement personnalisé.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px 16px;margin-top:34px">
        ${champ(d.champs[0] + '*', 'Prénom Nom')}${champ(d.champs[1] + '*', 'nom@entreprise.fr')}
        ${champ(d.champs[2], '01 99 00 12 34')}${champ(d.champs[3], o.univers ? U(o.univers).nom : 'Textile, print, goodies…', { select: true, cls: o.univers ? 'plein' : '' })}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:30px"><span class="bouton s-g">${d.cta}</span><span class="bouton filet s-g">${d.second}</span></div></div>`); };

  /* Pied de page (520) */
  B.pied = () => sec('s-pied s-filet-h', 520, `
    <div class="s-abs" style="left:52px;right:52px;top:64px;display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:30px">
      <div>${M.lockup('#fff', 'style="height:40px;width:auto"')}<p class="s-txt" style="margin-top:22px;max-width:330px">${M.TRIPTYQUE.join(' ')}</p>
        <span class="bouton" style="margin-top:26px">Devis gratuit ${fl()}</span></div>
      <div class="s-pied-col"><span class="t-mono">Univers</span>${D.univers.map((u) => `<span>${u.nom}</span>`).join('')}</div>
      <div class="s-pied-col"><span class="t-mono">Custom</span><span>L’atelier</span><span>Nos techniques</span><span>Demander un devis</span><span>Être rappelé</span></div>
      <div class="s-pied-col"><span class="t-mono">Nous écrire</span><span style="color:#fff">custom.fr</span><span>Mentions légales</span><span>Confidentialité</span></div></div>
    <div class="s-abs" style="left:40px;right:40px;top:316px;z-index:1">${M.wordmark(C.fluo, 'style="width:100%;height:auto"')}</div>
    <div class="s-abs" style="left:52px;right:52px;top:282px;display:flex;justify-content:space-between;align-items:center;z-index:2">
      <span class="t-mono" style="color:rgba(255,255,255,.45)">©${NB}Custom.fr${NB}·${NB}${M.IDEE}</span>${M.barre({ style: 'width:260px;height:8px' })}</div>`);

  /* ---------- Univers ---------- */
  B.herosUnivers = (cle) => { const u = U(cle), sl = SURL[cle], p = PH_UNIV[cle], t1 = tailleLarge(u.accroche[0], 132, 1250);
    const photo = cle === 'signaletique'
      ? `${ph('mur', { mode: 'sombre' })}<div class="s-abs" style="inset:0;display:grid;place-items:center">${M.logo('#fff', 'style="width:56%;height:auto"', { sym: C.fluo })}</div>`
      : ph(p[0], { pos: cle === 'textile' ? '50% 30%' : null });
    return sec('s-heros-u', 860, `
    <div class="s-fond tx-toile"></div>
    <div class="s-abs" style="right:-90px;top:118px;z-index:1">${M.picto(cle, { c: C.graphite, attrs: 'style="height:640px;width:auto"' })}</div>
    <div class="s-abs" style="left:560px;top:330px;width:960px;height:520px;z-index:1">${M.coulure({ w: 960, h: 520, c: C.violet, seed: 7 + cle.length, cx: 0.52, cy: 0.5, rx: 0.42, ry: 0.4, attrs: 'style="width:100%;height:100%"' })}</div>
    ${B.nav({ actif: u.nom })}
    <div class="s-abs t-mono" style="left:52px;top:118px;z-index:6;color:rgba(255,255,255,.5)">Custom.fr${NB}/${NB}<span style="color:#fff">${u.nom}</span></div>
    <div class="s-sous t-large" style="left:46px;top:164px;font-size:${t1}px">${u.accroche[0]}</div>
    <div class="s-sous t-large" style="left:52px;top:${178 + t1}px;font-size:60px">${sl[0]}${M.surl(sl[1])}</div>
    <p class="s-chapo s-abs" style="left:52px;top:${290 + t1}px;width:480px;z-index:6">${u.texte}</p>
    <div class="s-abs" style="left:52px;top:${410 + t1}px;z-index:6;display:flex;gap:12px"><span class="bouton s-g">Demander un devis ${u.nom.toLowerCase()}</span><span class="bouton filet s-g">Nos techniques ${fl('currentColor', 90)}</span></div>
    <div class="s-heros-ph dans-bloc" style="left:640px;top:${300 + t1 * 0.35}px;width:740px;height:349px">${photo}</div>
    ${cadre(['Production 100' + NB + '% intégrée', 'Devis sous 24' + NB + 'h', 'Sans engagement'].map((t, i) => `<div class="s-cel"><span class="t-mono">0${i + 1}${NB}/${NB}03</span>${puce(t)}</div>`).join(''), 'position:absolute;left:52px;right:52px;top:740px;height:84px;display:grid;grid-template-columns:repeat(3,1fr);z-index:5;background:rgba(16,16,18,.86)', 18, 's-bandeau')}`); };

  B.familles = (cle) => { const u = U(cle), p = PH_UNIV[cle], pc = (c) => M.picto(cle, { c, attrs: 'style="height:74px;width:auto"' });
    const vis = [
      () => ph(p[0], { mode: 'duo', pos: '50% 40%' }),
      () => `<div class="s-abs tx-motif" style="inset:0;--tm:84px;color:var(--fluo)"></div>`,
      () => `${ph(p[1], { mode: 'nb' })}<div class="s-abs" style="right:18px;bottom:16px">${pc(C.fluo)}</div>`,
      () => `<div class="s-abs" style="inset:0;background:var(--noir)">${M.piquage({ w: 421, h: 164, px: 9, py: 18, seed: 5, attrs: 'style="width:100%;height:100%"' })}</div>`,
      () => `<div class="s-abs tx-trame" style="inset:0;color:var(--fonte);--tp:9px"></div><div class="s-abs" style="inset:0;display:grid;place-items:center">${pc('#fff')}</div>`,
      () => ph(p[2], { mode: 'points', tp: 7, c: 'fluo', pos: '50% 50%' })];
    return sec('s-fams', 800, `
    <div class="s-tete" style="top:96px;display:flex;justify-content:space-between;align-items:flex-end">
      <div>${kick(u.nom + NB + '·' + NB + 'nos familles')}${titre('Une réponse à ', 'chaque besoin')}</div>
      <p class="s-txt" style="width:380px;padding-bottom:10px">Chaque famille est fabriquée dans notre atelier, de la première pièce à la série.</p></div>
    ${u.produits.map((n, i) => `<div class="s-fam" style="left:${52 + (i % 3) * 451}px;top:${262 + Math.floor(i / 3) * 274}px">
      <div class="s-fam-v">${vis[i]()}</div>
      <div class="s-fam-t"><div><span class="t-mono">${CODE_U[cle]}${NB}·${NB}0${i + 1}</span><div class="t-titre">${n}</div></div><span style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--fluo);padding-bottom:6px">Devis ${fl()}</span></div></div>`).join('')}`); };

  B.usages = (cle) => { const u = U(cle), cs = CONSEIL[cle], t0 = T(cs[cle === 'textile' ? 2 : 0]), p = PH_TECH[t0.cle];
    return sec('s-usages s-filet-h', 720, `
    <div class="s-tete" style="top:96px">${kick('Techniques proposées pour le ' + u.nom.toLowerCase())}${titre('Chaque objet, sa ', 'technique')}</div>
    <div class="s-abs dans-cran" style="left:52px;top:300px;width:540px">${ph(p[0], { pos: p[1] })}</div>
    <div class="s-abs t-mono" style="left:52px;top:630px;color:rgba(255,255,255,.5)">CST${NB}·${NB}${t0.code}${NB}·${NB}${M.PHOTOS[p[0]].sujet}</div>
    <div class="s-abs" style="left:660px;right:52px;top:262px">${D.techniques.map((t) => { const ok = cs.includes(t.cle);
      return `<div class="s-usage${ok ? '' : ' off'}">${M.pastille(t.code, ok)}<div class="t-titre">${t.nom}</div><p class="s-txt">${t.pour}</p>${ok ? `<span class="t-mono" style="color:var(--fluo)">Conseillée</span>` : '<span class="t-mono">Sur demande</span>'}</div>`; }).join('')}</div>`); };

  B.appelUnivers = (cle) => { const u = U(cle);
    return sec('s-appel-u', 540, `
    <div class="s-fond" style="background:var(--fluo)"></div>
    <div class="s-abs" style="right:-40px;top:0;width:640px;height:540px;opacity:.14;-webkit-mask-image:linear-gradient(90deg,transparent,#000 70%);mask-image:linear-gradient(90deg,transparent,#000 70%)"><div class="tx-motif" style="width:100%;height:100%;--tm:120px;color:var(--encre)"></div></div>
    <div class="s-abs" style="left:52px;top:96px;width:640px;color:var(--encre);z-index:2">
      ${kick('Devis ' + u.nom.toLowerCase(), 'encre')}
      <h2 class="t-titre s-h2" style="font-size:104px">Votre projet<br>${M.surl(u.nom.toLowerCase(), 'noir')}</h2>
      <p style="margin:26px 0 0;font-size:17px;line-height:1.45;max-width:480px">Un devis détaillé en moins de 24${NB}h, sans engagement. Nous vous conseillons la technique adaptée à chaque pièce.</p>
      <div style="margin-top:30px;color:var(--encre)">${M.pix('24h', { c: C.encre, attrs: 'style="height:58px;width:auto"' })}</div></div>
    <div class="s-abs" style="left:784px;top:80px;width:604px;height:380px;padding:30px;border-radius:20px;background:var(--noir);z-index:2;display:flex;flex-direction:column;gap:18px">
      <div style="display:flex;gap:8px">${D.univers.map((x) => M.pastille(x.nom, x.cle === cle)).join('')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${champ('Technique', 'Nous conseiller', { select: true })}${champ('Volume', 'Série', { select: true, cls: 'plein' })}</div>
      ${champ('E-mail*', 'nom@entreprise.fr')}
      <span class="bouton s-g" style="margin-top:auto">Demander mon devis ${u.nom.toLowerCase()} ${fl()}</span></div>`); };

  /* ---------- Atelier ---------- */
  B.herosAtelier = () => sec('s-heros-a', 780, `
    <div class="s-fond tx-toile"></div>
    <div class="s-abs" style="left:300px;top:150px;width:1300px;height:560px;z-index:1">${M.coulure({ w: 1300, h: 560, c: C.fonte, seed: 44, cx: 0.55, cy: 0.5, rx: 0.42, ry: 0.42, pas: 5, attrs: 'style="width:100%;height:100%"' })}</div>
    ${B.nav({ actif: 'L’atelier' })}
    <div class="s-abs t-mono" style="left:52px;top:118px;z-index:6;color:rgba(255,255,255,.5)">Custom.fr${NB}/${NB}<span style="color:#fff">L’atelier</span></div>
    <div class="s-sous t-large" style="left:42px;top:170px;font-size:146px">Tout est fait</div>
    <div class="s-sous t-large" style="left:36px;top:322px;font-size:146px">${M.surl('ici.')}</div>
    <div class="s-abs t-titre" style="left:560px;top:340px;font-size:46px;line-height:.96;z-index:6">${M.TRIPTYQUE.map((t, i) => `<div style="${i === 1 ? 'color:var(--fluo)' : ''}">${t}</div>`).join('')}</div>
    <p class="s-chapo s-abs" style="left:52px;top:540px;width:560px;z-index:6">Textile, print, goodies, signalétique : quatre univers sous un même toit. Sérigraphie, DTF, broderie, flocage, sublimation : tout est opéré dans notre atelier.</p>
    <div class="s-abs dans-cran" style="left:900px;top:236px;width:470px;z-index:4">${ph('equipe', { pos: '50% 50%' })}</div>
    <div class="s-abs" style="left:52px;top:672px;z-index:6;display:flex;gap:12px"><span class="bouton s-g">Demander mon devis gratuit ${fl()}</span></div>
    <div class="s-abs" style="right:52px;top:560px;z-index:6;text-align:right">${M.pix('100%', { c: C.fluo, attrs: 'style="height:96px;width:auto;margin-left:auto"' })}<div class="t-mono" style="margin-top:14px;color:rgba(255,255,255,.6)">Dans nos ateliers${NB}·${NB}production intégrée</div></div>`);

  B.galerie = () => { const g = (nom, x, y, w, h, o = {}) => `<div class="s-gal ${o.cls || ''}" style="left:${x}px;top:${y}px;width:${w}px;${h ? `height:${h}px;` : ''}${o.st || 'border-radius:16px'}">${ph(nom, { pos: o.pos, mode: o.mode, c: o.c })}${o.leg === false ? '' : `<span class="s-leg">${o.code ? o.code + NB + '·' + NB : ''}${M.PHOTOS[nom].sujet}</span>`}</div>`;
    return sec('s-galerie', 920, `
    <div class="s-tete" style="top:96px;display:flex;justify-content:space-between;align-items:flex-end">
      <div>${kick('L’atelier en images')}${titre('Le geste et ', 'la matière')}</div>
      <p class="s-txt" style="width:380px;padding-bottom:10px">Nos machines, nos mains, nos fils. Chaque pièce passe par cet atelier avant d’arriver chez vous.</p></div>
    ${g('serigraphie', 52, 262, 640, 0, { cls: 'dans-cran', st: '', pos: '60% 50%', leg: false })}
    <span class="s-abs t-mono" style="left:52px;top:640px;color:rgba(255,255,255,.55)">SER${NB}·${NB}${M.PHOTOS.serigraphie.sujet}</span>
    ${g('broderie', 712, 262, 330, 380, { code: 'BRO', pos: '50% 60%' })}
    ${g('presse', 1062, 262, 326, 440, { code: 'FLO' })}
    ${g('fils', 52, 690, 460, 0, { cls: 'dans-bloc', st: 'height:217px', leg: false })}
    <div class="s-gal" style="left:520px;top:660px;width:520px;height:250px;${masqueCoulure({ w: 520, h: 250, seed: 12, rx: 0.46, ry: 0.44 })}">${ph('traceur', { pos: '40% 60%' })}</div>
    ${g('pliage', 1062, 722, 326, 168, { pos: '50% 60%' })}`); };

  B.parcours = () => { const E = [['Votre idée', 'Vous décrivez le projet : univers, quantité, échéance.'], ['Le devis', `Un devis détaillé en moins de 24${NB}h, sans engagement.`], ['La technique', 'Nous choisissons la technique adaptée à chaque objet.'], ['La fabrication', 'Tout est produit dans notre atelier, sans sous-traitance.'], ['La livraison', 'Délai moyen de livraison : 7 à 10 jours.']];
    return sec('s-parcours s-filet-h', 740, `
    <div class="s-tete" style="top:96px">${kick('Le parcours d’une commande')}${titre('Tout avance ', 'd’un pas')}</div>
    <svg class="s-abs" style="left:52px;top:300px" width="1336" height="380" viewBox="0 0 1336 380" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1">${E.map((_, i) => `<path d="M${i * 268},${330 - i * 64} H${i * 268 + 250}"/>`).join('')}</svg>
    ${E.map(([t, p], i) => `<div class="s-pas" style="left:${52 + i * 268}px;top:${420 - i * 64}px">
      <div class="s-pas-b">${M.bloc(i === 4 ? '#fff' : C.fluo, 'preserveAspectRatio="none"', { l: 200, h: 74, r: 8 })}<span>0${i + 1}</span></div><b>${t}</b><p>${p}</p></div>`).join('')}
    <p class="s-txt s-abs" style="right:52px;top:520px;width:330px">De votre idée à la livraison, un seul atelier et un seul interlocuteur. Chaque étape vous rapproche de la pièce finie.</p>`); };

  B.citation = () => { const q = D.citation;
    return sec('s-citation', 500, `
    <div class="s-fond" style="background:var(--graphite)"></div>
    <div class="s-abs" style="right:-80px;top:-40px;width:640px;height:580px">${M.coulure({ w: 640, h: 580, c: C.orange, seed: 51, cx: 0.58, cy: 0.5, rx: 0.4, ry: 0.42, attrs: 'style="width:100%;height:100%"' })}</div>
    <div class="s-abs dans-cran" style="right:110px;top:150px;width:360px;z-index:2">${ph('hoodie', { mode: 'nb', pos: '50% 35%' })}</div>
    <div class="s-abs t-titre" style="left:52px;top:58px;font-size:200px;line-height:1;color:var(--fluo)">«</div>
    <p class="s-abs" style="left:52px;top:200px;width:820px;margin:0;font-size:34px;line-height:1.24;font-weight:500;letter-spacing:-.02em;z-index:2">${q.texte}</p>
    <div class="s-abs" style="left:52px;top:400px;display:flex;gap:16px;align-items:center;z-index:2"><b style="font-size:16px">${q.auteur}</b><span class="t-mono" style="color:rgba(255,255,255,.55)">${q.role}</span></div>`); };

  B.ici = () => sec('s-ici', 520, `
    <div class="s-fond" style="background:var(--fluo)"></div>
    <div class="s-abs" style="left:52px;right:52px;top:72px;color:var(--encre)">${kick('L’atelier Custom', 'encre')}</div>
    <div class="s-abs t-large" style="left:44px;top:136px;font-size:128px;color:var(--encre);white-space:nowrap">Tout est fait ${M.surl('ici.', 'noir')}</div>
    <div class="s-abs" style="left:52px;top:350px;display:flex;gap:12px"><span class="bouton noir s-g">Demander mon devis gratuit ${fl()}</span><span class="bouton s-g" style="background:transparent;color:var(--encre);box-shadow:inset 0 0 0 1px rgba(3,1,14,.35)">${D.devis.second}</span></div>
    <div class="s-abs" style="right:52px;top:318px">${((m) => `<svg viewBox="${m.box.join(' ')}" style="height:150px;width:auto"><path d="${m.d}" fill="${C.encre}"/></svg>`)(M.marches(3))}</div>`);

  /* ---------- Devis ---------- */
  B.teteDevis = () => sec('s-tete-d', 460, `
    <div class="s-fond tx-toile"></div>
    ${B.nav({ actif: '' })}
    <div class="s-abs t-mono" style="left:52px;top:118px;color:rgba(255,255,255,.5)">Custom.fr${NB}/${NB}<span style="color:#fff">Devis gratuit</span></div>
    <h1 class="s-abs t-titre" style="left:52px;top:150px;margin:0;font-size:112px">Prêt à donner vie à<br>${M.surl('votre projet ?')}</h1>
    <p class="s-chapo s-abs" style="left:52px;top:372px;width:760px;font-size:17px">Cinq questions, une minute. Un devis gratuit en moins de 24${NB}h, sans engagement.</p>
    <div class="s-abs" style="left:900px;top:330px;display:flex;align-items:flex-end;gap:6px">${['Univers', 'Technique', 'Volume', 'Échéance', 'Coordonnées'].map((t, i) => `<div style="width:92px"><div class="t-mono" style="margin-bottom:8px;color:${i < 4 ? 'var(--fluo)' : '#fff'}">0${i + 1}</div><div style="height:${10 + i * 6}px;border-radius:3px;background:${i < 4 ? 'var(--fluo)' : 'rgba(255,255,255,.18)'};${i === 4 ? 'box-shadow:inset 0 0 0 2px #fff' : ''}"></div><div style="margin-top:8px;font-size:12px;color:rgba(255,255,255,.6)">${t}</div></div>`).join('')}</div>`);

  B.formDevis = () => { const tit = (n, t, etat) => `<div class="s-etape-t"><span class="t-mono">0${n}</span><span class="t-titre">${t}</span><span class="s-etat">${etat}</span></div>`;
    const sug = T('broderie');
    return sec('s-form-d', 1560, `
    <div class="s-etape" style="top:40px;height:300px">${tit(1, 'Votre univers', 'Fait')}
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:22px">${D.univers.map((u, i) => `<div class="s-opt${i ? '' : ' on'}" style="height:132px">${M.picto(u.cle, { c: i ? C.fluo : C.encre, attrs: 'style="height:44px;width:auto"' })}<span>${u.nom}</span></div>`).join('')}</div>
      <div class="s-puce-l" style="margin-top:18px">${U('textile').produits.map((p) => `<span class="s-chip${p === 'Polos' ? ' on' : ''}">${p}</span>`).join('')}</div></div>
    <div class="s-etape" style="top:364px;height:376px">${tit(2, 'La technique', 'Fait')}
      <div class="s-sugg" style="margin-top:22px">${M.symbol(C.fluo, 'style="height:30px;width:auto;flex:none"')}<div style="font-size:15px;line-height:1.45"><b>Notre suggestion pour vos polos : ${sug.nom.toLowerCase()}.</b><br><span style="color:rgba(255,255,255,.65)">${sug.pour}</span></div></div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:16px">${D.techniques.map((t) => `<div class="s-opt${t.cle === 'broderie' ? ' on' : ''}" style="height:150px"><span class="t-mono" style="opacity:.6">${t.code}</span><span>${t.nom}<small>${t.pour}</small></span></div>`).join('')}</div></div>
    <div class="s-etape" style="top:764px;height:196px">${tit(3, 'Le volume', 'Fait')}
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:22px">${['Pièce unique', 'Petite série', 'Série', 'Grande série'].map((v) => `<div class="s-opt${v === 'Série' ? ' on' : ''}" style="height:64px;justify-content:center">${v}</div>`).join('')}</div></div>
    <div class="s-etape" style="top:984px;height:196px">${tit(4, 'L’échéance', 'Fait')}
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:22px">${['Sans urgence', 'Sous 7 à 10 jours', 'À une date précise'].map((v, i) => `<div class="s-opt${i === 1 ? ' on' : ''}" style="height:64px;justify-content:center">${v}</div>`).join('')}</div></div>
    <div class="s-etape on" style="top:1204px;height:300px">${tit(5, 'Vos coordonnées', 'En cours')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:22px">${champ('Prénom / Nom*', 'Prénom Nom', { cls: 'focus' })}${champ('Entreprise', 'Nom de votre structure')}${champ('E-mail*', 'nom@entreprise.fr')}${champ('Téléphone', '01 99 00 12 34')}</div></div>
    <div class="s-abs" style="left:948px;top:812px;width:440px;height:368px;border-radius:20px;overflow:hidden;background:var(--noir);box-shadow:inset 0 0 0 1px var(--filet)">
      <div class="s-abs tx-toile" style="inset:0"></div>
      <div class="s-abs" style="left:28px;top:30px">${M.sprite('moto', 3, { c: C.fluo, attrs: 'style="height:110px;width:auto"' })}</div>
      <div class="s-abs" style="left:28px;right:28px;bottom:28px">${kick('Tout est fait ici')}<p class="s-txt" style="margin-top:12px">Production 100${NB}% intégrée dans nos ateliers. Livraison sous 7 à 10 jours.</p></div></div>
    <div class="s-abs" style="left:948px;top:40px;width:440px;border-radius:20px;background:var(--graphite);overflow:hidden">
      <div class="dans-bloc" style="position:relative;margin:24px 24px 0;height:180px">${ph('broderie', { pos: '50% 60%' })}</div>
      <div style="padding:22px 28px 28px">${kick('Votre demande')}
        <div style="margin-top:16px">${[['Univers', 'Textile'], ['Produit', 'Polos'], ['Technique', 'Broderie'], ['Volume', 'Série'], ['Échéance', 'Sous 7 à 10 jours']].map(([a, b]) => `<div class="s-recap"><span>${a}</span><b>${b}</b></div>`).join('')}</div>
        <div style="display:flex;align-items:center;gap:18px;margin-top:22px;padding:18px;border-radius:14px;background:var(--fluo);color:var(--encre)">${M.pix('24h', { c: C.encre, attrs: 'style="height:40px;width:auto"' })}<div style="font-size:14px;line-height:1.4"><b>Devis sous 24${NB}h</b><br>Gratuit et sans engagement.</div></div>
        <span class="bouton s-g" style="width:100%;margin-top:18px">${D.devis.cta} ${fl()}</span>
        <span class="bouton filet s-g" style="width:100%;margin-top:10px">${D.devis.second}</span></div></div>`); };

  /* ---------- Pages ordinateur ---------- */
  const P_ACC = () => [[900, B.heros()], [640, B.univers4()], [800, B.techniques()], [880, B.chiffres()], [740, B.serenite()], [800, B.appel()], [520, B.pied()]];
  const P_UNI = (c) => [[860, B.herosUnivers(c)], [800, B.familles(c)], [720, B.usages(c)], [540, B.appelUnivers(c)], [520, B.pied()]];
  const P_ATE = () => [[780, B.herosAtelier()], [920, B.galerie()], [740, B.parcours()], [800, B.techniques({ actif: 0 })], [880, B.chiffres()], [520, B.ici()], [520, B.pied()]];
  const P_DEV = () => [[460, B.teteDevis()], [1560, B.formDevis()], [520, B.pied()]];
  S.accueil = () => page('s-p-accueil', P_ACC()).html;
  S.univers = (cle = 'textile') => page('s-p-univers s-p-' + cle, P_UNI(cle)).html;
  S.atelier = () => page('s-p-atelier', P_ATE()).html;
  S.devis = () => page('s-p-devis', P_DEV()).html;
  S.blocs = B;
  const som = (l) => l.reduce((a, s) => a + s[0], 0);
  S.H = { accueil: som(P_ACC()), textile: som(P_UNI('textile')), print: som(P_UNI('print')), goodies: som(P_UNI('goodies')), signaletique: som(P_UNI('signaletique')), atelier: som(P_ATE()), devis: som(P_DEV()) };
  /* Position (px depuis le haut de la page) de chaque section : pour cadrer une planche ou caler un défilement */
  S.Y = (() => { const y = (l, noms) => { let a = 0; const r = {}; l.forEach((s, i) => { r[noms[i]] = a; a += s[0]; }); return r; };
    return { accueil: y(P_ACC(), ['heros', 'univers4', 'techniques', 'chiffres', 'serenite', 'appel', 'pied']), univers: y(P_UNI('textile'), ['heros', 'familles', 'usages', 'appel', 'pied']),
      atelier: y(P_ATE(), ['heros', 'galerie', 'parcours', 'techniques', 'chiffres', 'ici', 'pied']), devis: y(P_DEV(), ['tete', 'formulaire', 'pied']) }; })();

  /* ================================================================ MOBILE (390 px) */
  const msec = (cls, h, html, st = '') => `<section class="sm-sec ${cls}" style="height:${h}px;${st}">${html}</section>`;
  const mpage = (cls, secs, colle) => { const h = secs.reduce((a, s) => a + s[0], 0); return { h, html: `<div class="sm-page ${cls}" style="height:${h}px">${secs.map((s) => s[1]).join('')}${colle === false ? '' : BM.colle(colle)}</div>` }; };
  const mtitre = (a, mot, o = {}) => `<h2 class="t-titre sm-h2" style="font-size:${o.t || 46}px">${a}${M.surl(mot, o.s || '')}</h2>`;
  const mk = (t, cls = '') => `<div class="sm-k ${cls}">${t}</div>`;
  const mpuce = (t) => `<span class="sm-puce"><i></i>${t}</span>`;
  const mchamp = (lb, ex, sel) => `<label class="sm-champ"><span>${lb}</span><span class="sm-in">${ex}${sel ? '<i class="s-chev"></i>' : ''}</span></label>`;

  BM.nav = () => `<div class="sm-nav"><span class="sm-logo">${M.logo('#fff', '', { sym: C.fluo })}</span><span class="sm-burger"><b></b><b></b></span></div>`;
  BM.colle = (t) => `<div class="sm-colle"><span class="sm-btn">${t || 'Devis gratuit'} ${fl()}</span></div>`;

  BM.heros = () => msec('sm-heros', 740, `
    <div class="sm-fond tx-toile"></div>
    <div class="sm-abs" style="left:-90px;top:250px;width:560px;height:330px">${M.coulure({ w: 560, h: 330, c: C.fonte, seed: 21, pas: 4, attrs: 'style="width:100%;height:100%"' })}</div>
    ${BM.nav()}
    <div class="sm-abs t-mono" style="left:20px;top:126px;font-size:9.5px;color:rgba(255,255,255,.5)">${M.DESCRIPTEUR}</div>
    <div class="sm-abs t-large" style="left:17px;top:152px;font-size:48px;color:var(--fluo);white-space:nowrap">Transformez</div>
    <div class="sm-abs t-large" style="left:20px;top:206px;font-size:25px;white-space:nowrap;z-index:3">vos idées en produits</div>
    <div class="sm-abs t-large" style="left:15px;top:238px;font-size:25px;white-space:nowrap;z-index:3">${M.surl('personnalisés premium')}</div>
    <div class="sm-abs dans-cran" style="left:20px;top:300px;width:350px;z-index:2">${ph('dunk', { pos: '50% 26%' })}</div>
    <div class="sm-abs" style="left:296px;top:448px;z-index:3">${M.dunk(5, { c: '#fff', attrs: 'style="height:96px;width:auto"' })}</div>
    <div class="sm-abs" style="left:20px;right:20px;top:536px;display:flex;flex-direction:column;gap:12px">${mpuce('Production 100' + NB + '% intégrée')}${mpuce('Livraison sous 7 à 10 jours')}${mpuce('+500 projets réalisés')}</div>
    <div class="sm-abs" style="left:20px;right:20px;top:660px"><span class="sm-btn filet">Découvrir l’atelier</span></div>`);

  BM.univers4 = () => msec('sm-univ', 600, `
    <div class="sm-tete" style="top:52px">${mk('Nos univers')}<h2 class="t-titre sm-h2">Quatre univers<br>sous ${M.surl('un même toit')}</h2></div>
    <div class="sm-abs" style="left:12px;right:12px;top:186px">${D.univers.map((u, i) => `<div class="sm-u${i ? '' : ' on'}">${M.picto(u.cle, { c: i ? C.fluo : C.encre, attrs: 'style="height:50px;width:auto"' })}<div><div class="t-titre">${u.nom}</div><p>${u.produits.slice(0, 3).join(' · ')}</p></div>${fl()}</div>`).join('')}</div>`);

  BM.techniques = () => msec('sm-tech', 600, `
    <div class="sm-tete" style="top:52px">${mk('Cinq techniques, un atelier')}<h2 class="t-titre sm-h2">Chaque objet,<br>sa ${M.surl('technique')}</h2></div>
    <p class="sm-txt sm-abs" style="left:20px;right:20px;top:190px">Pas d’intermédiaire, pas de compromis : notre atelier gère chaque étape.</p>
    ${D.techniques.slice(0, 3).map((t, i) => { const p = PH_TECH[t.cle];
      return `<div class="sm-abs" style="left:${20 + i * 244}px;top:${270 - i * 14}px;width:230px"><div class="sm-carte" style="position:relative;height:250px">${ph(p[0], { pos: p[1] })}<span class="pastille${i ? '' : ' on'}" style="position:absolute;left:10px;top:10px;height:24px;padding:0 9px;background:${i ? 'rgba(16,16,18,.72)' : 'var(--fluo)'};box-shadow:none">${t.code}</span></div>
        <div class="t-titre" style="font-size:32px;margin-top:12px">${t.nom}</div><p class="sm-txt" style="font-size:13px;margin-top:4px">${t.pour}</p></div>`; }).join('')}`);

  BM.chiffres = () => msec('sm-chif', 720, `
    <div class="sm-tete" style="top:52px">${mk('Custom en bref')}${mtitre('En quelques ', 'chiffres')}</div>
    <div class="sm-abs cadre-r" style="left:20px;right:20px;top:160px;display:grid;grid-template-columns:1fr 1fr">${M.reperes({ t: 14 })}${D.chiffres.map(([n, l, s], i) => `<div class="sm-ch" style="${i % 2 ? 'border-left:1px solid var(--filet)' : ''}${i < 2 ? ';border-top:0' : ''}"><div class="sm-ch-n">${n}</div><b>${l}</b><small>${s}</small></div>`).join('')}</div>
    <div class="sm-abs" style="left:20px;top:520px;width:350px;height:160px;border-radius:14px;background:var(--fluo);display:grid;place-items:center">${M.chemin({ w: 340, h: 150, c: C.encre, ep: 2.8, taille: 12.5 })}
      <div class="sm-abs" style="left:18px;top:16px">${M.sprite('course', 1, { c: C.encre, attrs: 'style="height:48px;width:auto"' })}</div></div>`);

  BM.serenite = () => { const P = D.promesses, carte = (y, fond, coul, vis, i) => `<div class="sm-carte" style="left:20px;top:${y}px;width:350px;height:150px;background:${fond};color:${coul};display:grid;grid-template-columns:132px 1fr;gap:16px;padding:18px">
      <div style="display:grid;place-items:center">${vis}</div><div style="align-self:end"><b style="font-size:16px">${P[i][0]}</b><p style="margin:6px 0 0;font-size:12.5px;line-height:1.4;opacity:.72">${P[i][1]}</p></div></div>`;
    return msec('sm-sere', 680, `
    <div class="sm-tete" style="top:52px">${mk('Nos engagements')}<h2 class="t-titre sm-h2">Travaillons ensemble<br>en ${M.surl('toute sérénité')}</h2></div>
    ${carte(196, 'var(--graphite)', '#fff', M.grille(rowsPaiement, { c: C.acier, attrs: 'style="width:120px;height:auto"' }), 0)}
    ${carte(360, 'var(--fluo)', 'var(--encre)', M.pix('24h', { c: C.acier, attrs: 'style="width:124px;height:auto"' }), 1)}
    ${carte(524, '#fff', 'var(--encre)', `<div class="t-titre" style="font-size:44px;line-height:.84;color:var(--acier)">Sans<br>engage-<br>ment</div>`, 2)}`); };

  BM.appel = () => { const d = D.devis;
    return msec('sm-appel', 960, `
    <div class="sm-abs" style="left:-60px;top:20px;width:420px;height:300px">${M.coulure({ w: 420, h: 300, c: C.orange, seed: 33, attrs: 'style="width:100%;height:100%"' })}</div>
    <div class="sm-carte" style="left:20px;top:56px;width:350px;height:230px">${ph('trail', { pos: '72% 50%' })}<div class="sm-abs" style="left:0;right:0;bottom:22px;display:flex;justify-content:center;gap:14px;align-items:flex-end">${[1, 2, 3, 4].map((i) => M.sprite('course', i, { c: C.fluo, attrs: 'style="height:52px;width:auto"' })).join('')}</div></div>
    <div class="sm-tete" style="top:318px">${mk('Devis gratuit')}<h2 class="t-titre sm-h2">${d.titre[0]}<br>${d.titre[1]} ${M.surl(d.titre[2])}</h2>
      <p class="sm-txt" style="margin-top:14px">Un devis gratuit en moins de 24${NB}h. Aucun engagement.</p>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:20px">${mchamp(d.champs[0] + '*', 'Prénom Nom')}${mchamp(d.champs[1] + '*', 'nom@entreprise.fr')}${mchamp(d.champs[2], '01 99 00 12 34')}${mchamp(d.champs[3], 'Textile, print, goodies…', true)}</div></div>`); };

  BM.pied = () => msec('sm-pied', 440, `
    <div class="sm-abs" style="left:20px;right:20px;top:40px;border-top:1px solid var(--filet);padding-top:30px">${M.lockup('#fff', 'style="height:30px;width:auto"')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 20px;margin-top:26px;font-size:14px;color:rgba(255,255,255,.7)">${D.menu.map((m) => `<span>${m}</span>`).join('')}<span style="color:#fff">custom.fr</span></div>
      <div style="margin-top:24px">${M.barre({ style: 'width:180px;height:7px' })}</div></div>
    <div class="sm-abs" style="left:14px;right:14px;top:300px">${M.wordmark(C.fluo, 'style="width:100%;height:auto"')}</div>`);

  BM.herosUnivers = (cle) => { const u = U(cle), sl = SURL[cle], p = PH_UNIV[cle];
    const photo = cle === 'signaletique' ? `${ph('mur', { mode: 'sombre' })}<div class="sm-abs" style="inset:0;display:grid;place-items:center">${M.logo('#fff', 'style="width:56%;height:auto"', { sym: C.fluo })}</div>` : ph(p[0], { pos: cle === 'textile' ? '50% 30%' : null });
    return msec('sm-heros-u', 760, `
    <div class="sm-fond tx-toile"></div>
    <div class="sm-abs" style="left:-40px;top:400px;width:480px;height:200px">${M.coulure({ w: 480, h: 200, c: C.violet, seed: 7 + cle.length, ry: 0.46, attrs: 'style="width:100%;height:100%"' })}</div>
    <div class="sm-abs" style="right:20px;top:120px;z-index:3">${M.picto(cle, { c: C.fluo, attrs: 'style="height:26px;width:auto"' })}</div>
    ${BM.nav()}
    <div class="sm-abs t-mono" style="left:20px;top:126px;font-size:9.5px;color:rgba(255,255,255,.5)">Custom.fr${NB}/${NB}<span style="color:#fff">${u.nom}</span></div>
    <div class="sm-abs t-large" style="left:18px;right:16px;top:154px;font-size:44px;line-height:.95">${u.accroche[0]}</div>
    <div class="sm-abs t-large" style="left:18px;top:260px;font-size:28px;white-space:nowrap">${sl[0]}${M.surl(sl[1])}</div>
    <p class="sm-txt sm-abs" style="left:20px;right:20px;top:316px">${u.texte}</p>
    <div class="sm-abs dans-bloc" style="left:20px;top:420px;width:350px;height:165px">${photo}</div>
    <div class="sm-abs" style="left:20px;right:20px;top:610px;display:flex;flex-direction:column;gap:12px">${mpuce('Production 100' + NB + '% intégrée')}${mpuce('Devis sous 24' + NB + 'h')}${mpuce('Sans engagement')}</div>`); };

  BM.familles = (cle) => { const u = U(cle), p = PH_UNIV[cle];
    const vis = [() => ph(p[0], { mode: 'duo' }), () => `<div class="sm-abs tx-motif" style="inset:0;--tm:60px;color:var(--fluo)"></div>`, () => ph(p[1], { mode: 'nb' }),
      () => `<div class="sm-abs" style="inset:0;background:var(--noir)">${M.piquage({ w: 167, h: 100, px: 7, py: 14, seed: 5, attrs: 'style="width:100%;height:100%"' })}</div>`,
      () => `<div class="sm-abs tx-trame" style="inset:0;color:var(--fonte);--tp:7px"></div><div class="sm-abs" style="inset:0;display:grid;place-items:center">${M.picto(cle, { c: '#fff', attrs: 'style="height:46px;width:auto"' })}</div>`,
      () => ph(p[2], { mode: 'points', tp: 6 })];
    return msec('sm-fams', 640, `
    <div class="sm-tete" style="top:40px">${mk(u.nom + NB + '·' + NB + 'nos familles')}<h2 class="t-titre sm-h2">Une réponse à<br>${M.surl('chaque besoin')}</h2></div>
    ${u.produits.map((n, i) => `<div class="sm-carte" style="left:${20 + (i % 2) * 180}px;top:${180 + Math.floor(i / 2) * 150}px;width:170px;height:140px;background:var(--graphite)">
      <div style="position:relative;height:92px;overflow:hidden">${vis[i]()}</div><div class="t-titre" style="font-size:24px;padding:10px 12px 0">${n}</div></div>`).join('')}`); };

  BM.usages = (cle) => { const cs = CONSEIL[cle];
    return msec('sm-usages', 560, `
    <div class="sm-tete" style="top:40px">${mk('Techniques proposées')}<h2 class="t-titre sm-h2">Chaque objet,<br>sa ${M.surl('technique')}</h2></div>
    <div class="sm-abs" style="left:20px;right:20px;top:184px">${D.techniques.map((t) => { const ok = cs.includes(t.cle);
      return `<div style="display:grid;grid-template-columns:58px 1fr;gap:12px;align-items:center;padding:13px 0;border-top:1px solid var(--filet);${ok ? '' : 'opacity:.38'}">${M.pastille(t.code, ok)}<div><div class="t-titre" style="font-size:26px">${t.nom}</div><p class="sm-txt" style="font-size:12.5px">${t.pour}</p></div></div>`; }).join('')}</div>`); };

  BM.appelUnivers = (cle) => { const u = U(cle);
    return msec('sm-appel-u', 340, `
    <div class="sm-fond" style="background:var(--fluo)"></div>
    <div class="sm-tete" style="top:44px;color:var(--encre)">${mk('Devis ' + u.nom.toLowerCase(), 'encre')}<h2 class="t-titre sm-h2" style="font-size:58px">Votre projet<br>${M.surl(u.nom.toLowerCase(), 'noir')}</h2>
      <p style="margin:16px 0 0;font-size:14.5px;line-height:1.45">Un devis détaillé en moins de 24${NB}h, sans engagement.</p>
      <div style="margin-top:22px">${M.pix('24h', { c: C.encre, attrs: 'style="height:44px;width:auto"' })}</div></div>`); };

  BM.herosAtelier = () => msec('sm-heros-a', 760, `
    <div class="sm-fond tx-toile"></div>
    <div class="sm-abs" style="left:-60px;top:330px;width:520px;height:300px">${M.coulure({ w: 520, h: 300, c: C.fonte, seed: 44, pas: 4, attrs: 'style="width:100%;height:100%"' })}</div>
    ${BM.nav()}
    <div class="sm-abs t-mono" style="left:20px;top:126px;font-size:9.5px;color:rgba(255,255,255,.5)">Custom.fr${NB}/${NB}<span style="color:#fff">L’atelier</span></div>
    <div class="sm-abs t-large" style="left:16px;top:156px;font-size:58px;line-height:.92;white-space:nowrap">Tout est<br>fait ${M.surl('ici.')}</div>
    <div class="sm-abs t-titre" style="left:20px;top:300px;font-size:34px;line-height:.98">${M.TRIPTYQUE.map((t, i) => `<div style="${i === 1 ? 'color:var(--fluo)' : ''}">${t}</div>`).join('')}</div>
    <div class="sm-abs dans-cran" style="left:20px;top:430px;width:350px">${ph('serigraphie', { pos: '60% 50%' })}</div>
    <div class="sm-abs" style="left:20px;top:660px;display:flex;align-items:center;gap:14px">${M.pix('100%', { c: C.fluo, attrs: 'style="height:40px;width:auto"' })}<span class="t-mono" style="font-size:9.5px;color:rgba(255,255,255,.6)">Dans nos ateliers</span></div>`);

  BM.galerie = () => { const g = (nom, x, y, w, h, leg, st = 'border-radius:14px') => `<div class="sm-abs s-gal" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${st}">${ph(nom)}${leg ? `<span class="s-leg" style="left:10px;bottom:10px;height:24px;font-size:9.5px">${leg}</span>` : ''}</div>`;
    return msec('sm-galerie', 700, `
    <div class="sm-tete" style="top:40px">${mk('L’atelier en images')}${mtitre('Le geste et ', 'la matière', { t: 42 })}</div>
    ${g('broderie', 20, 140, 170, 230, 'BRO')}${g('presse', 200, 140, 170, 230, 'FLO')}
    <div class="sm-abs dans-bloc" style="left:20px;top:384px;width:350px;height:165px">${ph('fils')}</div>
    <div class="sm-abs" style="left:10px;top:556px;width:370px;height:130px;${masqueCoulure({ w: 370, h: 130, seed: 12, rx: 0.47, ry: 0.44 })}">${ph('traceur', { pos: '40% 60%' })}</div>`); };

  BM.parcours = () => { const E = ['Votre idée', 'Le devis sous 24' + NB + 'h', 'La technique', 'La fabrication', 'La livraison sous 7 à 10 jours'];
    return msec('sm-parcours', 560, `
    <div class="sm-tete" style="top:40px">${mk('Le parcours d’une commande')}${mtitre('Tout avance ', 'd’un pas', { t: 42 })}</div>
    ${E.map((t, i) => `<div class="sm-abs" style="left:${20 + i * 22}px;top:${160 + i * 74}px;display:flex;align-items:center;gap:14px"><span style="position:relative;display:grid;place-items:center;width:96px;height:58px">${M.bloc(i === 4 ? '#fff' : C.fluo, 'preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%"', { l: 84, h: 58, r: 7 })}<b class="t-titre" style="position:relative;font-size:34px;color:var(--encre);font-weight:400">0${i + 1}</b></span><b style="font-size:15px;font-weight:600;max-width:${210 - i * 22}px;line-height:1.3">${t}</b></div>`).join('')}`); };

  BM.citation = () => msec('sm-citation', 500, `
    <div class="sm-fond" style="background:var(--graphite)"></div>
    <div class="sm-abs t-titre" style="left:20px;top:30px;font-size:120px;line-height:1;color:var(--fluo)">«</div>
    <p class="sm-abs" style="left:20px;right:20px;top:120px;margin:0;font-size:21px;line-height:1.3;font-weight:500;letter-spacing:-.015em">${D.citation.texte}</p>
    <div class="sm-abs" style="left:20px;top:410px"><b style="font-size:15px">${D.citation.auteur}</b><div class="t-mono" style="margin-top:4px;color:rgba(255,255,255,.55)">${D.citation.role}</div></div>`);

  BM.devis = () => { const sug = T('broderie');
    return msec('sm-devis', 1180, `
    <div class="sm-fond tx-toile" style="height:300px"></div>
    ${BM.nav()}
    <div class="sm-abs t-mono" style="left:20px;top:126px;font-size:9.5px;color:rgba(255,255,255,.5)">Custom.fr${NB}/${NB}<span style="color:#fff">Devis gratuit</span></div>
    <h1 class="sm-abs t-titre" style="left:20px;right:20px;top:150px;margin:0;font-size:56px">Prêt à donner vie<br>à ${M.surl('votre projet ?')}</h1>
    <div class="sm-abs" style="left:20px;right:20px;top:282px;display:flex;align-items:flex-end;gap:5px">${[0, 1, 2, 3, 4].map((i) => `<div style="flex:1;height:${8 + i * 4}px;border-radius:2px;background:${i < 2 ? 'var(--fluo)' : 'rgba(255,255,255,.18)'}"></div>`).join('')}</div>
    <div class="sm-abs t-mono" style="left:20px;top:310px;color:var(--fluo)">02${NB}/${NB}05${NB}·${NB}<span style="color:#fff">La technique</span></div>
    <div class="sm-abs" style="left:20px;right:20px;top:350px"><div class="sm-etape"><span class="t-mono">01</span>Univers<em>Textile${NB}·${NB}Polos</em></div></div>
    <div class="sm-abs" style="left:20px;right:20px;top:428px;padding:20px 16px;border-radius:14px;background:#18181A;box-shadow:inset 0 0 0 2px var(--fluo)">
      <div style="display:flex;align-items:baseline;gap:12px"><span class="t-mono" style="color:var(--fluo)">02</span><span class="t-titre" style="font-size:36px">La technique</span></div>
      <div class="s-sugg" style="margin-top:14px;padding:14px;gap:12px">${M.symbol(C.fluo, 'style="height:22px;width:auto;flex:none"')}<div style="font-size:13.5px;line-height:1.4"><b>Suggestion pour vos polos : ${sug.nom.toLowerCase()}.</b><br><span style="color:rgba(255,255,255,.65)">${sug.pour}</span></div></div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">${D.techniques.map((t) => `<div class="sm-opt${t.cle === 'broderie' ? ' on' : ''}"><span>${t.nom}</span><small>${t.code}</small></div>`).join('')}</div></div>
    <div class="sm-abs" style="left:20px;right:20px;top:950px;display:flex;flex-direction:column;gap:10px">${['Volume', 'Échéance', 'Coordonnées'].map((t, i) => `<div class="sm-etape" style="opacity:.55"><span class="t-mono" style="color:#fff">0${i + 3}</span>${t}</div>`).join('')}</div>`); };

  /* ---------- Pages mobiles ---------- */
  const M_ACC = () => [[740, BM.heros()], [600, BM.univers4()], [600, BM.techniques()], [720, BM.chiffres()], [680, BM.serenite()], [960, BM.appel()], [440, BM.pied()]];
  const M_UNI = (c) => [[760, BM.herosUnivers(c)], [640, BM.familles(c)], [560, BM.usages(c)], [340, BM.appelUnivers(c)], [440, BM.pied()]];
  const M_ATE = () => [[760, BM.herosAtelier()], [700, BM.galerie()], [560, BM.parcours()], [720, BM.chiffres()], [440, BM.pied()]];
  const M_DEV = () => [[1180, BM.devis()]];
  SM.accueil = () => mpage('sm-p-accueil', M_ACC(), 'Demander mon devis gratuit').html;
  SM.univers = (cle = 'textile') => mpage('sm-p-univers', M_UNI(cle), 'Devis ' + U(cle).nom.toLowerCase()).html;
  SM.atelier = () => mpage('sm-p-atelier', M_ATE(), 'Demander mon devis gratuit').html;
  SM.devis = () => mpage('sm-p-devis', M_DEV(), 'Continuer').html;
  SM.blocs = BM;
  SM.H = { accueil: som(M_ACC()), textile: som(M_UNI('textile')), print: som(M_UNI('print')), goodies: som(M_UNI('goodies')), signaletique: som(M_UNI('signaletique')), atelier: som(M_ATE()), devis: som(M_DEV()) };
  SM.VUE = { l: 390, h: 844, colle: 764 };

  M.site = S;
  M.mobile = SM;
})();
