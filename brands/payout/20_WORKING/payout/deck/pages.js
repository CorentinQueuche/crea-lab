/* Pages du guide de marque Payout (1280 × 720 chacune). Proposition KLYRA, pas l'identité officielle de Payout.
   SOURCE UNIQUE : la mosaïque (plates/36-guide.html), la visionneuse en ligne (site/presentation.html) et le PDF
   (node tools/deck.mjs puis python tools/deck_pdf.py) lisent ce fichier.
   GuideOrder = ordre des pages ; GuideTitles = leurs titres. Les numéros (bandeau, sommaire) sont CALCULÉS depuis GuideOrder :
   on réordonne CH, tout suit. Styles : bloc « Mini-pages du guide » de plates/plates.css (classes mp-).
   Règles chiffrées : celles de MARQUE.md, mot pour mot. Contrastes : calculés par Marque.contraste.
   Images : planches de out/plates/ et rendus de out/final/ par img(dossier, fichier). window.GuideMedia (défini avant ce script
   par la visionneuse du site) remplace le dossier. Un rendu absent se masque et laisse voir un fond de repli dessiné en HTML. */
(function () {
const A = Marque, C = A.COULEURS, N = A.ECHELLE, D = A.DONNEES;
const _ = ' ';                     // espace insécable
const SUR = '#F3F6F4', NOIR = '#04140A';  // texte sur Coffre, texte sur Net
const img = (sub, f) => (window.GuideMedia || '../out/' + sub + '/') + f;
const AVANT = '../../../10_INPUTS/klyra-realisation-payout/logo-payout.svg';   // logo de 2025, archive

/* ---------- Chapitres : [intercalaire, numéro, titre, motif du panneau, pages [clé, titre]] ---------- */
const CH = [
  ['d1', '01', 'La marque', 'halo', [['idee', 'L’idée'], ['ton', 'Registre et ton de voix'], ['avant', 'Avant / après']]],
  ['d2', '02', 'Le logo', 'symbole', [['logo', 'Versions'], ['construction', 'Construction'], ['zone', 'Zone de protection et tailles'], ['usages', 'Couleurs et interdits']]],
  ['d3', '03', 'Couleurs et typographie', 'damier', [['net', 'Le Net et son échelle'], ['palette', 'Palette, proportions, contrastes'], ['degrades', 'Recette de dégradé'], ['typo', 'Deux familles, une échelle']]],
  ['d4', '04', 'La jauge et les motifs', 'blocs', [['jauge', 'La jauge'], ['motifs', 'Bandes, damier, halo']]],
  ['d5', '05', 'L’interface et le mouvement', 'bandes', [['ecrans', 'Le cockpit'], ['composants', 'Composants, deux thèmes'], ['mouvement', 'Le mouvement']]],
  ['d6', '06', 'En situation', 'stries', [['planches', 'Le site, l’app, les réseaux'], ['ville', 'Dans la ville, la nuit'], ['bureau', 'Sur le bureau']]],
];
const ORDER = ['cover', 'sommaire', ...CH.flatMap((c) => [c[0], ...c[4].map((s) => s[0])]), 'dos'];
const TITLES = ['Couverture', 'Sommaire', ...CH.flatMap((c) => [`${c[1]} ${c[2]}`, ...c[4].map((s) => s[1])]), 'Dos'];
const num = (k) => String(ORDER.indexOf(k) + 1).padStart(2, '0');
const chap = (k) => CH.find((c) => c[0] === k || c[4].some((s) => s[0] === k));

/* ---------- Typographie française : espaces insécables (milliers, unités, : ; ! ? « »). Pour le texte seul, jamais pour du SVG. ---------- */
const fr = (s) => String(s)
  .replace(/(\d) (?=\d{3}(?!\d))/g, '$1' + _)
  .replace(/(\d) (?=(%|€|px|mm|ms|s|em)(?![\wÀ-ÿ]))/g, '$1' + _)
  .replace(/ ([:;!?»])/g, _ + '$1')
  .replace(/« /g, '«' + _);
/* La police n'a pas de « → » : on l'écrit dans le texte, il devient la flèche du socle */
const frx = (s) => fr(s).replace(/→/g, A.fleche('currentColor', 'vertical-align:.02em;margin:0 .12em'));
const cr = (a, b) => A.contraste(a, b).toFixed(1).replace('.', ',');
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ');

/* ---------- Éléments communs ---------- */
/* Bandeau en chasse fixe : marque, chapitre, page, numéro sur le total */
const bandeau = (k, o = {}) => { const c = chap(k), i = ORDER.indexOf(k);
  return `<div class="mp-bd${o.bas ? ' mp-bas' : ''}" style="${o.c ? 'color:' + o.c : ''}"><span>Payout · Guide de marque</span><span>${c ? fr(`${c[1]} · ${c[2]}`) : 'Proposition KLYRA'}</span><span>${fr(TITLES[i])}</span><span>${num(k)}${_}/${_}${ORDER.length}</span></div>`; };
/* Une page : fond, contenu, bandeau. o.clair : panneau Relevé ; o.cls : classe de fond (.g6 grain…) */
const page = (k, inner, o = {}) => `<div class="mp-pg${o.clair ? ' mp-clair' : ''}">${o.cls ? `<div class="${o.cls}" style="position:absolute;inset:0"></div>` : ''}${inner}${bandeau(k, o)}</div>`;
/* Colonne de gauche : étiquette, titre, phrase bicolore, règles courtes en pied */
const col = (k, titre, phrase, regles = [], extra = '') => { const c = chap(k);
  return `<div class="mp-col"><div class="mp-k">${c ? fr(`${c[1]} · ${c[2]}`) : ''}</div><div class="mp-t">${fr(titre)}</div>${phrase ? A.bicolore(frx(phrase)) : ''}${extra}` +
    (regles.length ? `<div class="mp-regles">${regles.map((r) => `<div class="mp-r">${frx(r)}</div>`).join('')}</div>` : '') + `</div>`; };
const box = (x, y, w, h, inner = '', st = '', cls = '') => `<div class="${cls}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${st}">${inner}</div>`;
const cad = (x, y, w, h, inner = '', st = '', cls = '') => `<div class="mp-cad ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${st}">${inner}</div>`;
const lbl = (t, st = '') => `<div class="mp-k" style="${st}">${fr(t)}</div>`;
const leg = (x, y, w, t, st = '') => `<div class="mp-cote" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;opacity:.7;${st}">${fr(t)}</div>`;
/* Image de out/ dans un cadre, posée sur un fond de repli (HTML) : si le fichier manque, l'image se masque et la page reste propre.
   L'image passe AU-DESSUS du repli (z-index 61 contre 60), sinon le dessin de repli se lit par-dessus le rendu. */
const media = (sub, f, x, y, w, h, legende, o = {}) => cad(x, y, w, h,
  (o.repli || '') + `<img src="${img(sub, f)}" alt="" style="z-index:61;object-position:${o.pos || '50% 0%'}" onerror="this.style.display='none'">`, o.st || '') +
  (legende ? leg(x, y + h + 10, w, legende) : '');
const centre = (html, st = '') => `<div style="position:absolute;inset:0;display:grid;place-items:center;z-index:60;${st}">${html}</div>`;
const croix = (c) => `<svg viewBox="0 0 20 20" style="position:absolute;right:14px;top:14px;width:18px;height:18px;z-index:61"><path d="M4 4 16 16M16 4 4 16" stroke="${c}" stroke-width="1.8"/></svg>`;

/* ---------- Pages ---------- */
const P = {};

/* Couverture : halo en arc, logo complet blanc, bandeau en bas */
/* (le bandeau de couverture reprend celui des planches, en bas comme sur la planche 01) */
P.cover = `<div class="mp-pg"><div class="g1 grain" style="position:absolute;inset:0"></div>
  <div style="position:absolute;left:40px;top:262px;z-index:60">${A.lockup(SUR, 'style="width:560px;display:block"')}</div>
  <div class="mp-d" style="position:absolute;left:40px;top:430px;z-index:60">Guide de marque</div>
  <div class="mp-cote" style="position:absolute;left:40px;right:40px;top:590px;display:grid;grid-template-columns:40% 16.5% 1fr auto;z-index:60;opacity:.7">
    <span>Version 1.0 · novembre 2026</span><span>${ORDER.length}${_}pages</span><span>${CH.map((c) => fr(c[2])).join(' · ')}</span><span></span></div>
  <div class="mp-bd mp-bas"><span>KLYRA.FR</span><span>Client${_}: Payout</span><span>Guide de marque<br>Proposition KLYRA, pas l’identité officielle de Payout</span><span>©2026</span></div></div>`;

/* Sommaire : chapitres en deux colonnes, numéros calculés */
const tocCol = (chs) => chs.map(([k, n, t, , subs]) =>
  `<div style="display:grid;grid-template-columns:44px 1fr auto;align-items:baseline;padding:12px 0 10px;border-top:1px solid var(--filet)"><span class="mono" style="font-size:13.5px;color:${C.net}">${n}</span><span style="font-size:21px;font-weight:500;letter-spacing:-.02em;line-height:1.15">${fr(t)}</span><span class="mono" style="font-size:13.5px;color:${C.net}">${num(k)}</span></div>` +
  subs.map(([s, st]) => `<div style="display:grid;grid-template-columns:44px 1fr auto;align-items:baseline;height:30px;font-size:14.5px;border-top:1px solid rgba(255,255,255,.05)"><span></span><span style="opacity:.75">${fr(st)}</span><span class="mono" style="font-size:12px;opacity:.6">${num(s)}</span></div>`).join('')
).join('<div style="height:22px"></div>');
P.sommaire = page('sommaire', col('sommaire', 'Une page,<br>une règle.',
  'Ce guide fixe les règles d’usage de Payout. <b>Les chiffres qu’il donne sont ceux qu’on applique</b>, sur chaque support.',
  ['Proposition d’évolution de l’identité faite par KLYRA en 2026. Les règles chiffrées restent à valider avec Payout.']) +
  box(420, 92, 390, 590, tocCol(CH.slice(0, 3))) + box(850, 92, 390, 590, tocCol(CH.slice(3))));

/* Intercalaires : titre en Display, pages du chapitre, panneau à grand rayon où vit un seul motif, grand numéro en Chivo Mono */
const panneau = (m, n) => {
  let fond = 'g7', motif = '';
  if (m === 'halo') fond = 'g2';
  if (m === 'symbole') { fond = 'g6'; motif = `<div style="position:absolute;left:250px;top:170px">${A.symbol(C.net, 'style="width:500px;height:700px;display:block"')}</div>`; }
  if (m === 'damier') motif = `<div style="position:absolute;left:0;right:0;top:250px;bottom:0">${A.damier({ cols: 8, rows: 5, seed: 6, densite: .6 })}</div>`;
  if (m === 'blocs') motif = `<div style="position:absolute;right:44px;top:212px">${A.jauge({ forme: 'blocs', p: 85, avant: 54, l: 360, g: 5.4 })}</div>`;
  if (m === 'bandes') motif = `<div style="position:absolute;left:0;right:0;top:170px;bottom:0">${A.bandes({ n: 26, seed: 21 })}</div>`;
  if (m === 'stries') motif = `<div style="position:absolute;left:0;right:0;top:300px;bottom:0">${A.bandes({ forme: 'stries', n: 22, seed: 9 })}</div>`;
  return `<div class="${fond} grain" style="position:absolute;left:600px;top:92px;width:640px;height:660px;border-radius:36px 36px 0 0;overflow:hidden;box-shadow:inset 0 0 0 1px var(--filet)">${motif}
    <div class="chiffre" data-coupe style="position:absolute;left:30px;top:34px;font-size:220px;color:${C.net};z-index:60">${n}</div></div>`; };
const COUPE = { d3: 'Couleurs et<br>typographie', d4: 'La jauge et<br>les motifs', d5: 'L’interface<br>et le<br>mouvement' };  // coupes de ligne du titre en Display
CH.forEach(([k, n, t, m, subs]) => {
  P[k] = page(k, `<div class="mp-k" style="position:absolute;left:40px;top:92px">Chapitre ${n}</div>
    <div class="mp-d" style="position:absolute;left:40px;top:126px;width:540px">${fr(COUPE[k] || t)}</div>
    <div style="position:absolute;left:40px;width:500px;bottom:38px">${subs.map(([s, st]) =>
      `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:11px 0 12px;border-top:1px solid var(--filet)"><span class="mp-tx2">${fr(st)}</span><span class="mono" style="font-size:13.5px;color:${C.net}">${num(s)}</span></div>`).join('')}</div>
    ${panneau(m, n)}`);
});

/* ---------- 01 · La marque ---------- */
P.idee = page('idee', col('idee', 'La part qui vous revient.',
  'Sur 100 € facturés, un freelance en SASU en garde <b>54 aujourd’hui</b>, et <b class="vif">jusqu’à 85 avec Payout</b>. La marque ne montre que cela : une jauge qui passe de 54 à 85.',
  ['<b>Signature :</b> Gardez jusqu’à 85 % de votre TJM.', '<b>Triptyque :</b> Facturer. Déclarer. Garder.', '<b>Descripteur :</b> Le copilote des freelances.', '<b>Mots-clés :</b> Net, Précis, Direct, Automatique.']) + `
  <div style="position:absolute;left:420px;top:100px">${A.passage({ taille: 156 })}</div>
  ${box(420, 300, 820, 96, A.jauge({ forme: 'segments', p: 85, avant: 54, h: 96, g: 3 }))}
  <div class="mp-cote" style="position:absolute;left:420px;width:820px;top:408px;height:16px;white-space:nowrap">
    <span style="position:absolute;left:0;opacity:.55">0</span><span style="position:absolute;left:54%;transform:translateX(-50%);opacity:.7">54 · aujourd’hui</span>
    <span style="position:absolute;left:85%;transform:translateX(-100%);padding-right:8px;color:${C.net}">jusqu’à 85 · avec Payout</span><span style="position:absolute;right:0;opacity:.55">100</span></div>
  <div style="position:absolute;left:420px;right:40px;top:478px;display:grid;grid-template-columns:repeat(3,1fr);gap:24px">${[
    ['Le symbole', 'Un anneau gardé à 85 %, ouvert de 15 %.'], ['Le motif', 'La jauge, de 54 à 85, sur 100.'], ['Les titres', 'Des chiffres, en Chivo Mono, très grands.']].map(([a, b]) =>
    `<div><div class="mp-fl"></div>${lbl(a, 'margin-top:14px')}<div class="mp-t1" style="margin-top:10px">${fr(b)}</div></div>`).join('')}</div>`);

const VAL = [['Net', 'On parle en chiffres, au centime. Un pourcentage vaut mieux qu’un adjectif.'], ['Précis', 'Sur des données financières, l’erreur n’est pas permise. Chaque montant a sa source.'],
  ['Direct', 'Des phrases courtes, un bouton par écran, aucune notion fiscale sans son chiffre.'], ['Automatique', 'Le CRA devient la facture, la TVA se calcule seule. Zéro ressaisie.']];
const DIRE = [['Gardez jusqu’à 85 % de votre TJM.', 'Stop à l’hémorragie financière !'], ['Votre CRA devient une facture.', 'Une solution innovante pour optimiser votre activité.'],
  ['TVA d’octobre : 2 213,60 € à reverser avant le 24.', 'Pensez à vos obligations déclaratives.']];
const PRETES = ['Zéro ressaisie.', 'L’impôt prend sa part. Pas la vôtre.', 'Un cockpit à la place de trois outils.', 'Sur 100 € facturés, jusqu’à 85 € pour vous.', '54 % aujourd’hui. Jusqu’à 85 % avec Payout.'];
P.ton = page('ton', col('ton', 'Net, précis, direct.',
  'Le niveau des néobanques et des outils financiers d’aujourd’hui : <b>produit d’abord, sûr de lui, précis.</b> En français, au vouvoiement, court et chiffré.',
  ['Un peu frondeur avec l’impôt, jamais racoleur, jamais « astuce fiscale ».', 'Rien d’artisanal, de papier ni de vintage.', '85 % s’écrit toujours avec « jusqu’à ».']) + `
  <div style="position:absolute;left:420px;right:40px;top:92px;display:grid;grid-template-columns:repeat(4,1fr);gap:22px">${VAL.map(([v, t], i) =>
    `<div><div class="mp-fl"></div><div class="mono" style="font-size:13.5px;color:${N[800]};margin-top:14px">0${i + 1}</div><div class="mp-t1" style="margin-top:6px">${v}</div><p class="mp-tx" style="margin-top:8px;opacity:.72">${fr(t)}</p></div>`).join('')}</div>
  <div style="position:absolute;left:420px;right:40px;top:316px;display:grid;grid-template-columns:1fr 1fr;column-gap:32px">
    ${lbl('On dit', `opacity:1;color:${N[800]};margin-bottom:10px`)}${lbl('On évite', 'margin-bottom:10px;opacity:.5')}
    ${DIRE.map(([a, b]) => `<p style="font-size:21px;line-height:1.25;font-weight:500;letter-spacing:-.02em;padding:14px 0 15px;border-top:1px solid var(--filet)">«${_}${fr(a)}${_}»</p><p style="font-size:21px;line-height:1.25;font-weight:500;letter-spacing:-.02em;padding:14px 0 15px;border-top:1px solid var(--filet);opacity:.36">«${_}${fr(b)}${_}»</p>`).join('')}</div>
  <div class="sur-clair" style="position:absolute;left:420px;right:40px;top:574px">${lbl('Phrases prêtes', 'margin-bottom:12px')}
    <div style="display:flex;flex-wrap:wrap;gap:8px">${PRETES.map((t) => A.pilule(fr(t))).join('')}</div></div>`, { clair: true });

const AV = [['Idée', 'Aucune image centrale', 'La part qui vous revient : une proportion'],
  ['Symbole', 'P en verre brillant, queue qui s’échappe, dégradé', 'P-jauge à plat : un anneau gardé à 85 %, ouvert de 15 %, et son fût'],
  ['Logotype', '« Payout » dans une grotesque du commerce, précédé du pictogramme', '« Payout » dessiné avec le même anneau ; son P est le symbole'],
  ['Couleur', 'Gamme de verts Tailwind sur blanc, sarcelle, rouge', 'Noir Coffre, un seul vert électrique (Net) et son échelle, gris froid'],
  ['Chiffres', 'Dans la police de texte', 'Chivo Mono, tabulaires, en très grand'],
  ['Motif', 'Illustrations isométriques, deux photos', 'La jauge (segments, blocs, escalier), les bandes, le halo'],
  ['Interface', 'Blanche, cartes arrondies, vert en accent', 'Cockpit sombre (phare) et variante claire, mêmes intitulés']];
P.avant = page('avant', col('avant', 'Évolution, pas rupture.',
  '<b>Le nom, le vert, le P et la promesse restent.</b> Le reste se range derrière une seule idée : <b class="vif">la part qui vous revient.</b>',
  ['<b>On garde :</b> le nom, le vert, le P, la promesse <span style="white-space:nowrap">54 → 85</span>.', 'La marque reste reconnaissable : c’est une évolution, pas une nouvelle marque.']) +
  cad(420, 92, 330, 200, `${lbl('Avant · 2025 · archive')}
    <div style="position:absolute;left:20px;right:20px;top:46px;bottom:18px;border-radius:12px;background:${C.releve};display:grid;place-items:center;filter:grayscale(1);opacity:.7;overflow:hidden">
      <span class="mp-cote" style="color:${C.acier}">Logo 2025</span>
      <img src="${AVANT}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:22px 40px;background:${C.releve}" onerror="this.style.display='none'"></div>`) +
  cad(766, 92, 474, 200, `${lbl('Après · proposition 2026', 'opacity:.7')}
    <div style="position:absolute;left:28px;top:70px;z-index:60">${A.lockup(C.net, 'style="width:380px;display:block"')}</div>
    <div style="position:absolute;right:18px;bottom:18px;display:flex;gap:8px;z-index:60">${A.icone(40, 'net')}${A.icone(40, 'coffre')}${A.icone(40, 'releve')}</div>`, '', 'g6 grain') + `
  <div style="position:absolute;left:420px;right:40px;top:308px">
    <div style="display:grid;grid-template-columns:96px 300px 1fr;gap:20px;padding-bottom:8px">${lbl('Ce qui change')}${lbl('Avant · 2025')}${lbl('Après · 2026', `opacity:1;color:${C.net}`)}</div>
    ${AV.map(([k, a, b]) => `<div style="display:grid;grid-template-columns:96px 300px 1fr;gap:20px;align-items:baseline;padding:8px 0 8px;border-top:1px solid var(--filet)">${lbl(k)}<span class="mp-tx" style="opacity:.45">${fr(a)}</span><span class="mp-tx" style="font-weight:500">${fr(b)}</span></div>`).join('')}</div>`);

/* ---------- 02 · Le logo ---------- */
P.logo = page('logo', col('logo', 'Trois versions, un seul P.',
  'Le P du logotype est le symbole : <b>il n’y a pas de pictogramme posé devant le mot.</b> On prend la version complète quand la place le permet.',
  ['<b>Version complète :</b> le logotype et « Le copilote / des freelances » en Instrument Sans Medium, deux lignes à droite, la seconde sur la ligne de base.',
    '<b>Icône d’app :</b> carré à coins de 22,5 %, symbole à 62 % de la hauteur. Coffre sur Net par défaut.'],
  `<div style="display:flex;gap:10px;margin-top:22px">${A.icone(56, 'net')}${A.icone(56, 'coffre')}${A.icone(56, 'releve')}</div>`) +
  cad(420, 92, 820, 244, lbl('Version complète · logotype et descripteur') + centre(A.lockup(SUR, 'style="width:600px;display:block;margin-top:14px"')), '', 'g6 grain') +
  cad(420, 352, 300, 330, lbl('Logotype') + centre(A.wordmark(C.net, 'style="width:220px;display:block"')) +
    `<p class="mp-tx" style="position:absolute;left:20px;right:20px;bottom:18px;opacity:.7">${fr('Quand la largeur manque : en-tête, pied d’écran.')}</p>`, `background:${C.coffre}`) +
  cad(736, 352, 200, 330, `<div class="mp-k" style="position:absolute;left:20px;top:16px;color:${NOIR}">Symbole</div>` + centre(A.symbol(C.coffre, 'style="height:150px;display:block"')) +
    `<p class="mp-tx" style="position:absolute;left:20px;right:20px;bottom:18px;color:${NOIR}">${fr('Icône, avatar, petit format.')}</p>`, `background:${C.net};box-shadow:none`) +
  cad(952, 352, 288, 330, lbl('Version empilée') + centre(A.lockupV(SUR, 'style="width:220px;display:block"')) +
    `<p class="mp-tx" style="position:absolute;left:20px;right:20px;bottom:18px;opacity:.7">${fr('Supports étroits : le descripteur passe dessous, en capitales Chivo Mono.')}</p>`));

/* Construction : cotes lues dans le socle (Marque.CONSTRUCTION, Marque.LETTRES) */
const K = A.CONSTRUCTION, LT = A.LETTRES;
const ptH = (r, a) => [50 + r * Math.sin(a * Math.PI / 180), 50 - r * Math.cos(a * Math.PI / 180)].map((v) => Math.round(v * 100) / 100);
const symC = (() => { const W = 300, fs = 10.5 * 160 / W, sp = A.symbolParts(85); let g = '';
  for (let v = -20; v <= 120; v += 10) g += `<path d="M${v} -24 V164"/>`;
  for (let v = -20; v <= 160; v += 10) g += `<path d="M-24 ${v} H124"/>`;
  const [ax, ay] = ptH(64, 306), [bx, by] = ptH(66, 336), [cx2, cy2] = ptH(62, 40), [jx, jy] = [K.jonction.x, 50 + K.jonction.y];
  const t = (x, y, s, c = SUR, an = 'middle', op = .8) => `<text x="${x}" y="${y}" fill="${c}" fill-opacity="${op}" text-anchor="${an}" font-family="Chivo Mono" font-size="${fs}" letter-spacing=".3">${s}</text>`;
  return `<svg viewBox="-28 -30 160 196" width="${W}" style="display:block;overflow:visible"><defs><pattern id="mp-hp" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width=".5" height="3" fill="${C.preleve}"/></pattern></defs>
    <g stroke="${SUR}" stroke-opacity=".07" stroke-width=".3">${g}</g>
    <circle cx="50" cy="50" r="50" fill="none" stroke="${SUR}" stroke-opacity=".35" stroke-width=".35" stroke-dasharray="1.4 1.4"/>
    <circle cx="50" cy="50" r="24" fill="none" stroke="${SUR}" stroke-opacity=".35" stroke-width=".35" stroke-dasharray="1.4 1.4"/>
    <path d="${sp.part}" fill="url(#mp-hp)"/><path d="${A.symbolPath(85)}" fill="${SUR}" fill-rule="evenodd"/>
    <path d="M50 50 V-8 M50 50 L${ax} ${ay}" stroke="${C.preleve}" stroke-width=".45"/>
    ${t(bx, by, '54°', C.preleve, 'end', 1)}${t(cx2, cy2, '306°', SUR, 'start')}
    <path d="M0 -16 H100 M0 -19 V-13 M100 -19 V-13" stroke="${SUR}" stroke-opacity=".6" stroke-width=".35"/>${t(50, -19.5, 'Ø 100')}
    <path d="M-10 50 V140 M-13 50 H-7 M-13 140 H-7" stroke="${SUR}" stroke-opacity=".6" stroke-width=".35"/>${t(-14, 98, '90', SUR, 'end')}
    <path d="M0 150 H26 M0 147 V153 M26 147 V153" stroke="${SUR}" stroke-opacity=".6" stroke-width=".35"/>${t(13, 160, '26')}
    <circle cx="${jx}" cy="${jy}" r="1.3" fill="${C.net}"/>${t(jx + 4, jy + 9, K.jonction.angle.toFixed(1).replace('.', ',') + '°', C.net, 'start', 1)}</svg>`; })();
const wordC = (() => { const W = 700, fs = 10.5 * 780 / W; const XS = LT.x;
  const t = (x, y, s, c = SUR, an = 'start', op = .6) => `<text x="${x}" y="${y}" fill="${c}" fill-opacity="${op}" text-anchor="${an}" font-family="Chivo Mono" font-size="${fs}" letter-spacing=".4">${s}</text>`;
  const lignes = [[-40, 'capitale 140'], [0, 'hauteur d’x 100'], [100, 'ligne de base'], [140, 'descendante 40']];
  const gaps = [[100, XS[1], 6], [206, XS[2], 22], [328, XS[3], 16], [444, XS[4], 16], [560, XS[5] - 14, 12]];
  return `<svg viewBox="-10 -50 780 200" width="${W}" style="display:block;overflow:visible">
    ${lignes.map(([y, s]) => `<path d="M-10 ${y} H662" stroke="${SUR}" stroke-opacity=".18" stroke-width=".8" stroke-dasharray="3 3"/>${t(672, y + 3.5, fr(s).replace(/'/g, '’'))}`).join('')}
    <path fill="${SUR}" fill-rule="evenodd" d="${A.wordPath()}"/>
    ${gaps.map(([a, b, v]) => `<rect x="${a}" y="104" width="${b - a}" height="5" fill="${C.net}"/>${t((a + b) / 2, 122, v, C.net, 'middle', 1)}`).join('')}</svg>`; })();
P.construction = page('construction', col('construction', 'Un anneau,<br>un fût.',
  'Chaque lettre est faite de l’anneau, entier ou coupé, et du fût. <b>Le P garde 85 % de l’anneau</b> : 306° depuis midi, ouvert de 54°.',
  ['<b>Anneau :</b> diamètre 100, graisse 26, rayon intérieur 24.', '<b>Fût :</b> 26 de large, il descend de 90 sous le centre et rejoint l’anneau à 208,7°.',
    '<b>Logotype :</b> hauteur d’x 100, capitale 140, descendante du y 40, ascendante du t 30.', '<b>Approches :</b> 6 (P a), 22 (a y), 16 (y o, o u), 12 (u t).']) + `
  <div style="position:absolute;left:446px;top:118px">${symC}</div>
  <div style="position:absolute;left:800px;right:40px;top:110px;display:flex;justify-content:space-between;align-items:flex-end">${[54, 65, 75, 85].map((p) =>
    `<div style="display:grid;justify-items:center;gap:12px">${A.symbol(p === 85 ? C.net : SUR, 'style="height:136px;display:block"', p)}<span class="mp-cote" style="opacity:.7">${p}${_}%</span></div>`).join('')}</div>
  <p class="mp-tx" style="position:absolute;left:800px;right:40px;top:316px;opacity:.75">${fr('À 54 %, l’anneau ne touche pas encore le fût ; à 85 %, la boucle est faite et le versement part.')}</p>
  <div style="position:absolute;left:446px;top:500px">${wordC}</div>`);

/* Zone de protection : deux graisses (52 dans le repère) autour du logotype, une graisse (26) autour du symbole */
const zoneSvg = (() => { const W = A.wordPath(), S = A.symbolPath(), ink = C.coffre;
  const hz = `<pattern id="mp-hz" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1.4" height="9" fill="${ink}" opacity=".28"/></pattern>`;
  return `<svg viewBox="-70 -122 1000 330" width="820" style="display:block;overflow:visible"><defs>${hz}</defs>
    <rect x="-52" y="-92" width="752" height="284" fill="url(#mp-hz)"/><rect x="0" y="-40" width="648" height="180" fill="${C.releve}"/>
    <rect x="-52" y="-92" width="752" height="284" fill="none" stroke="${ink}" stroke-width="1.6" stroke-dasharray="6 5"/>
    <path d="${W}" fill="${ink}" fill-rule="evenodd"/>
    <path d="M-52,-104V-112M0,-104V-112M-52,-108H0" fill="none" stroke="${ink}" stroke-width="1.2"/>
    <text x="-26" y="-117" text-anchor="middle" font-family="Chivo Mono" font-size="14" fill="${ink}">52</text>
    <g transform="translate(790,-40)"><rect x="-26" y="-26" width="152" height="192" fill="url(#mp-hz)"/><rect x="0" y="0" width="100" height="140" fill="${C.releve}"/>
      <rect x="-26" y="-26" width="152" height="192" fill="none" stroke="${ink}" stroke-width="1.6" stroke-dasharray="6 5"/><path d="${S}" fill="${ink}" fill-rule="evenodd"/>
      <path d="M-26,-38V-46M0,-38V-46M-26,-42H0" fill="none" stroke="${ink}" stroke-width="1.2"/>
      <text x="-13" y="-52" text-anchor="middle" font-family="Chivo Mono" font-size="14" fill="${ink}">26</text></g></svg>`; })();
P.zone = page('zone', col('zone', 'Zone de protection et tailles.',
  'Autour du logotype, <b>deux graisses</b> : 52 dans son repère, soit 52 % de la hauteur d’x. Autour du symbole seul, <b>une graisse</b> : 26, un quart du diamètre de l’anneau.',
  ['Rien n’entre dans la zone : ni texte, ni image, ni bord de page.', 'En dessous des tailles minimales, l’anneau se bouche et l’ouverture de 15 % ne se lit plus.']) + `
  <div style="position:absolute;left:420px;top:126px">${zoneSvg}</div>
  <div style="position:absolute;left:420px;right:40px;top:440px"><div class="mp-fl"></div>${lbl('Tailles minimales · à l’échelle 1', 'margin-top:14px')}</div>
  <div style="position:absolute;left:420px;right:40px;top:500px;height:110px;display:flex;align-items:flex-end;gap:60px">${[
    [A.lockup(C.coffre, 'style="width:180px;display:block"'), 'Version complète', '180 px · 48 mm'], [A.wordmark(C.coffre, 'style="width:64px;display:block"'), 'Logotype', '64 px · 18 mm'],
    [A.symbol(C.coffre, 'style="height:16px;display:block"'), 'Symbole', '16 px · 5 mm de haut'], [A.icone(16, 'coffre'), 'Icône d’app', '16 px']].map(([s, t, c]) =>
    `<div style="display:grid;gap:16px"><div style="height:40px;display:flex;align-items:flex-end">${s}</div><div><div class="mp-tx" style="font-weight:500">${fr(t)}</div><div class="mono" style="font-size:13.5px;color:${N[800]};margin-top:2px">${fr(c)}</div></div></div>`).join('')}</div>`, { clair: true });

/* Couleurs du logo : contrastes calculés */
const NOMS = { coffre: 'Coffre', ardoise: 'Ardoise', acier: 'Acier', releve: 'Relevé', blanc: 'Blanc', net: 'Net', preleve: 'Prélevé' };
const OUI = [['net', 'coffre'], ['coffre', 'net'], ['coffre', 'releve'], ['blanc', 'coffre']];
const W0 = A.wordPath();
const NON = [
  [A.wordmark(SUR, 'style="width:96px;display:block;transform:scaleX(1.4)"'), 'Déformer', 'Aucun étirement', C.ardoise, SUR],
  [A.wordmark(SUR, 'style="width:104px;display:block;transform:rotate(-14deg)"'), 'Pivoter', 'Toujours à l’horizontale', C.ardoise, SUR],
  [`<div style="display:flex;align-items:center;gap:6px">${A.symbol(C.net, 'style="height:26px;display:block"')}${A.wordmark(SUR, 'style="width:86px;display:block"')}</div>`, 'Doubler le P', 'Un seul P, celui du mot', C.ardoise, SUR],
  [`<svg viewBox="0 -40 648 180" style="width:104px;display:block"><defs><linearGradient id="mp-gd" x1="0" x2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="${C.net}"/><stop offset="1" stop-color="${N[700]}"/></linearGradient></defs><path fill="url(#mp-gd)" fill-rule="evenodd" d="${W0}"/></svg>`, 'Dégrader', 'Le logo est un aplat', C.ardoise, SUR],
  [A.wordmark(C.net, 'style="width:104px;display:block"'), 'Net sur clair', `Contraste de ${cr(C.net, C.releve)}`, C.releve, C.coffre],
  [`<div class="grain" style="position:absolute;inset:0">${A.bandes({ n: 14, seed: 4, profil: 'plat', sens: 'bas', k: .8 })}</div><div style="position:relative;z-index:60">${A.wordmark(SUR, 'style="width:104px;display:block"')}</div>`, 'Sans marge', 'Jamais sur le motif plein', C.coffre, SUR]];
P.usages = page('usages', col('usages', 'Un aplat, une couleur.',
  'Le logo est toujours un aplat d’une seule couleur : <b>Net, Blanc, Coffre ou Relevé.</b> Le Net ne se pose jamais sur un fond clair.',
  ['Sur un motif, le logo garde sa zone de protection sur fond sombre.', 'Le contraste est calculé selon la formule WCAG 2 ; il est écrit en haut de chaque fond.']) + `
  <div style="position:absolute;left:420px;right:40px;top:92px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${OUI.map(([c, b]) =>
    `<div class="mp-cad" style="position:relative;height:200px;background:${C[b]};color:${C[c]};${b === 'coffre' ? '' : 'box-shadow:none'}">
      <span class="mp-cote" style="position:absolute;left:16px;top:14px">${NOMS[c]} sur ${NOMS[b]}</span><span class="mono" style="position:absolute;right:16px;top:14px;font-size:10.5px">${cr(C[c], C[b])}:1</span>
      ${centre(A.wordmark(C[c], 'style="width:150px;display:block;margin-top:14px"'))}</div>`).join('')}</div>
  <div style="position:absolute;left:420px;right:40px;top:326px"><div class="mp-fl"></div>${lbl('À ne pas faire', 'margin-top:14px')}</div>
  <div style="position:absolute;left:420px;right:40px;top:380px;display:grid;grid-template-columns:repeat(6,1fr);gap:12px">${NON.map(([s, t, x, b, c]) =>
    `<div><div class="mp-cad" style="position:relative;height:200px;background:${b};${b === C.releve ? 'box-shadow:none' : ''}">${s.startsWith('<div class="grain"') ? s.replace('<div style="position:relative;z-index:60">', '<div style="position:absolute;inset:0;display:grid;place-items:center;z-index:60">') : centre(s)}${croix(c)}</div>
      <div class="mp-tx" style="font-weight:500;margin-top:12px">${fr(t)}</div><div class="mp-cote" style="opacity:.6;margin-top:2px">${fr(x)}</div></div>`).join('')}</div>`);

/* ---------- 03 · Couleurs et typographie ---------- */
const USAGE_NET = { 100: 'Pastille du thème clair', 200: 'Lumière, rampe des dégradés', 500: 'Aplat, jauge, bouton, chiffre sur Coffre', 700: 'Rampe des dégradés', 800: 'Texte vert sur fond clair', 900: 'Fond de la rampe' };
P.net = page('net', `
  <div class="g-vif grain" style="position:absolute;left:40px;top:92px;width:340px;height:590px;border-radius:20px;color:${NOIR}">
    <div class="mp-k" style="position:absolute;left:24px;top:20px;z-index:60;opacity:.7">03 · Couleurs</div>
    <div class="mp-d" style="position:absolute;left:22px;top:52px;z-index:60">Net</div>
    <p class="mp-tx2" style="position:absolute;left:24px;right:24px;top:164px;z-index:60">${fr('Le vert électrique, seule couleur vive de la marque. Il dit ce qui vous revient : la jauge, l’action, le chiffre.')}</p>
    <div style="position:absolute;left:24px;right:24px;bottom:22px;z-index:60"><div class="mono" style="font-size:44px;font-weight:500;letter-spacing:-.05em;line-height:1">#36FF72</div>
      <div class="mp-cote" style="margin-top:12px;line-height:1.7">RGB ${rgb(C.net)}<br>Coffre sur Net ${cr(C.coffre, C.net)}:1<br>Net sur Coffre ${cr(C.net, C.coffre)}:1</div></div></div>
  <div style="position:absolute;left:420px;right:40px;top:92px;height:590px;display:grid;grid-template-rows:repeat(10,1fr);border-radius:20px;overflow:hidden">${Object.keys(N).map((s) => {
    const h = N[s], t = A.contraste(NOIR, h) >= A.contraste(SUR, h) ? NOIR : SUR;
    return `<div style="background:${h};color:${t};display:grid;grid-template-columns:110px 96px 130px 190px 1fr;align-items:center;padding:0 20px;${+s === 500 ? `box-shadow:inset 4px 0 0 ${NOIR}` : ''}">
      <span style="font-size:19px;font-weight:500;letter-spacing:-.01em">Net ${s}</span><span class="mono" style="font-size:12px">${h}</span><span class="mono" style="font-size:12px;opacity:.8">${rgb(h)}</span>
      <span class="mono" style="font-size:12px;opacity:.8">Coffre ${cr(C.coffre, h)} · Blanc ${cr(C.blanc, h)}</span><span class="mp-tx" style="${+s === 500 ? 'font-weight:500' : ''}">${fr(USAGE_NET[s] || '')}</span></div>`; }).join('')}</div>`);

const PAL = [['coffre', 'Fond de marque'], ['ardoise', 'Panneaux et cartes sombres'], ['acier', 'Texte secondaire'], ['releve', 'Panneaux clairs'],
  ['blanc', 'Cœur des halos, cartes claires'], ['net', 'Le vert électrique, seule couleur vive'], ['preleve', 'Ce qui part : le 54 %, un retard']];
const PROP = [['coffre', 62], ['ardoise', 14], ['net', 10], [SUR, 6, 'Texte clair'], ['releve', 6, 'Relevé et Blanc'], ['acier', 1.5], ['preleve', .5]];
const verdict = (r) => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'grand texte' : r >= 1.2 ? 'aplat seul' : '—');
const cell = (a, b) => { const r = A.contraste(a, b); return `<span><span class="mono" style="font-size:13.5px;font-weight:500">${r.toFixed(1).replace('.', ',')}</span> <span class="mp-cote" style="opacity:.55">${verdict(r)}</span></span>`; };
P.palette = page('palette', col('palette', 'Un noir, un vert, du gris froid.',
  'Le Coffre fait le fond, <b>le Net fait la lumière.</b> Le Prélevé ne sert qu’à ce qui part : une fois par écran, jamais en aplat de fond, jamais dans un dégradé.',
  [`<b>Texte :</b> ${SUR} sur Coffre (${cr(SUR, C.coffre)}:1), ${NOIR} sur Net (${cr(NOIR, C.net)}:1).`,
    `<b>Interdits :</b> Net 500 en texte sur Relevé ou Blanc (${cr(C.net, C.releve)}) ; Prélevé en petit texte sur Relevé (${cr(C.preleve, C.releve)}) : le thème clair prend #D9431F.`,
    'Une page claire sur quatre ; le Net en aplat plein cadre, une fois sur huit au plus.']) + `
  <div style="position:absolute;left:420px;right:40px;top:92px;height:52px;display:flex;border-radius:12px;overflow:hidden;box-shadow:inset 0 0 0 1px var(--filet)">${PROP.map(([k, w]) => `<div style="flex:${w};background:${C[k] || k}"></div>`).join('')}</div>
  <div class="mp-cote" style="position:absolute;left:420px;right:40px;top:154px;opacity:.65">${PROP.map(([k, w, n]) => `${n || NOMS[k]} ${String(w).replace('.', ',')}`).join(' · ')}${_}(en${_}%)</div>
  <div style="position:absolute;left:420px;right:40px;top:206px">
    <div style="display:grid;grid-template-columns:76px 1fr 96px 120px 120px 120px;gap:14px;padding-bottom:8px">${['', 'Couleur', 'HEX', 'RGB', 'sur Coffre', 'sur Blanc'].map((t) => lbl(t)).join('')}</div>
    ${PAL.map(([k, r]) => `<div style="display:grid;grid-template-columns:76px 1fr 96px 120px 120px 120px;gap:14px;align-items:center;height:63px;border-top:1px solid var(--filet)">
      <div style="height:44px;border-radius:10px;background:${C[k]};${k === 'releve' || k === 'blanc' ? 'box-shadow:inset 0 0 0 1px rgba(6,10,8,.14)' : ''}"></div>
      <div><div style="font-size:19px;font-weight:500;letter-spacing:-.01em;line-height:1.1">${NOMS[k]}</div><div class="mp-tx" style="opacity:.6">${fr(r)}</div></div>
      <span class="mono" style="font-size:13.5px">${C[k]}</span><span class="mono" style="font-size:13.5px;opacity:.7">${rgb(C[k])}</span>${cell(C[k], C.coffre)}${cell(C[k], C.blanc)}</div>`).join('')}</div>`, { clair: true });

P.degrades = page('degrades', col('degrades', 'Une recette, trois calques.',
  'Base, grain, teinte. <b>La rampe va toujours du Blanc au Coffre</b>, en passant par Net 200, 500, 700 et 900, toujours dans cet ordre.',
  ['Le grain : incrustation, 50 %, sur toute surface éclairée de plus de 300 px.', 'Le Prélevé n’entre jamais dans un dégradé.']) + `
  <div style="position:absolute;left:420px;right:40px;top:92px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px">${[
    ['base', '01 · Base', 'Rampe du blanc au noir · opacité 100 %'], ['grain', '02 · Grain', 'Bruit fractal · incrustation · 50 %'], ['teinte', '03 · Teinte', 'Net 500 · mode couleur · 100 %']].map(([e, a, b]) =>
    `<div class="mp-cad" style="position:relative;height:236px"><div style="position:absolute;left:18px;top:14px;right:18px;z-index:60"><div class="mp-cote">${a}</div><div class="mp-cote" style="opacity:.6">${fr(b)}</div></div>
      <div style="position:absolute;left:14px;right:14px;top:62px;bottom:14px;border-radius:10px;overflow:hidden">${A.recette(e, 'bandes', { n: 16, seed: 5 })}</div></div>`).join('')}</div>
  <div style="position:absolute;left:420px;right:40px;top:350px;height:26px;border-radius:6px;background:linear-gradient(90deg,var(--rampe))"></div>
  <div class="mp-cote" style="position:absolute;left:420px;right:40px;top:384px;height:16px;opacity:.7">${[['Blanc', 0], ['Net 200', 12], ['Net 500', 32], ['Net 700', 58], ['Net 900', 80], ['Coffre', 100]].map(([n, p]) =>
    `<span style="position:absolute;left:${p}%;transform:translateX(${p === 100 ? '-100%' : p ? '-50%' : '0'})">${n}</span>`).join('')}</div>
  <div style="position:absolute;left:420px;right:40px;top:430px;height:252px;display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:1fr 1fr;gap:8px">${[
    ['g1', 'Halo haut'], ['g2', 'Halo bas'], ['g3', 'Stries'], ['g4', 'Bandes'], ['g5', 'Damier'], ['g6', 'Lueur de coin'], ['g7', 'Ardoise'], ['g8', 'Halo sur Relevé'], ['g9', 'Blanc vers Relevé'], ['g-vif', 'Aplat Net']].map(([g, n], i) =>
    `<div class="${g} grain" style="position:relative;border-radius:12px;overflow:hidden"><span class="mp-cote" style="position:absolute;left:8px;bottom:8px;z-index:60;padding:3px 7px;border-radius:5px;background:${i < 7 ? C.coffre : C.blanc};color:${i < 7 ? SUR : C.coffre}">${n}</span></div>`).join('')}</div>`);

/* Typographie : l'échelle de MARQUE.md, rendue à la taille réelle (le chiffre de scène est en colonne de gauche, à 136 px) */
const ECH = [
  ['Display', 'Instrument Sans Medium', '96 px · 0,92 · −0,055 em', 'font-size:96px;line-height:.92;font-weight:500;letter-spacing:-.055em', 'La part.'],
  ['Titre 300', 'Instrument Sans Medium', '88 px · 0,93 · −0,055 em', 'font-size:88px;line-height:.93;font-weight:500;letter-spacing:-.055em', 'Facturer.'],
  ['Titre 200', 'Instrument Sans Medium', '52 px · 0,98 · −0,045 em', 'font-size:52px;line-height:.98;font-weight:500;letter-spacing:-.045em', 'Zéro ressaisie.'],
  ['Titre 100', 'Instrument Sans Medium', '28 px · 1,05 · −0,035 em', 'font-size:28px;line-height:1.05;font-weight:500;letter-spacing:-.035em', 'Votre CRA devient une facture.'],
  ['Phrase bicolore', 'Instrument Sans Medium', '21 à 27 px · 1,3 · −0,02 em', '', ''],
  ['Texte 200', 'Instrument Sans Regular', '19 px · 1,4 · −0,01 em', 'font-size:19px;line-height:1.4;letter-spacing:-.01em', 'Sur 100 € facturés, jusqu’à 85 € pour vous.'],
  ['Texte 100', 'Instrument Sans Regular', '14,5 px · 1,4 · 0', 'font-size:14.5px;line-height:1.4', 'TVA d’octobre : 2 213,60 € à reverser avant le 24 novembre.'],
  ['Montant 200', 'Chivo Mono Medium', '26 à 44 px · 1,1 · −0,035 à −0,06 em', 'font-family:var(--mono);font-size:36px;line-height:1.1;font-weight:500;letter-spacing:-.05em;word-spacing:-.3em', ''],
  ['Montant 100', 'Chivo Mono Medium', '13,5 px · 1,3 · −0,01 em', 'font-family:var(--mono);font-size:13.5px;line-height:1.3;font-weight:500;letter-spacing:-.01em;word-spacing:-.3em', 'F-2026-010 · 12 000,00 € HT · TVA 2 400,00 €'],
  ['Étiquette', 'Chivo Mono Regular', 'capitales · 10,5 px · 1,5 · +0,06 em', 'font-family:var(--mono);font-size:10.5px;line-height:1.5;letter-spacing:.06em;text-transform:uppercase', 'Solde disponible · Qonto connecté · 12.11.2026']];
P.typo = page('typo', `
  <div class="mp-col"><div class="mp-k">03 · Couleurs et typographie</div>
    <div class="mp-t" style="margin-top:16px">Instrument Sans<br><span style="color:${C.acier}">Chivo Mono</span></div>
    ${A.bicolore(fr('Deux familles, deux rôles. <b>Instrument Sans porte les mots</b>, titres en Medium, très grands, serrés. <b>Chivo Mono porte tous les chiffres</b>, tabulaires, et les étiquettes en capitales.'))}
    <div style="margin-top:auto"><div class="mp-fl"></div>${lbl('Chiffre de scène · Chivo Mono Medium', 'margin-top:12px')}<div class="mp-cote" style="opacity:.6">${fr('136 à 320 px · 0,86 · −0,06 em')}</div>
      <div class="chiffre" style="font-size:136px;color:${C.net};margin-top:16px">${A.pcH(85)}</div></div></div>
  <div style="position:absolute;left:420px;right:40px;top:92px">${ECH.map(([n, f, r, st, ex]) => {
    const rendu = n === 'Phrase bicolore' ? A.bicolore(fr('<b>54 % aujourd’hui.</b> Jusqu’à 85 % avec Payout.'), 'font-size:24px;line-height:1.3;white-space:nowrap')
      : n === 'Montant 200' ? `<span style="${st}">${A.eurH(10200)}</span>` : `<div style="${st};white-space:nowrap">${fr(ex)}</div>`;
    return `<div style="display:grid;grid-template-columns:300px 1fr;gap:12px;align-items:center;padding:5px 0;border-top:1px solid var(--filet);min-height:42px">
      <div class="mp-cote" style="white-space:nowrap">${n} <span style="opacity:.55">· ${f}</span><br><span style="opacity:.55">${fr(r)}</span></div><div style="overflow:hidden">${rendu}</div></div>`; }).join('')}</div>`);

/* ---------- 04 · La jauge et les motifs ---------- */
P.jauge = page('jauge', col('jauge', 'La jauge, de 54 à 85.',
  'La proportion gardée, sur 100. <b>Le plein est ce qui vous revient</b> ; ce qui part est hachuré ou éteint. Bouts droits, jamais arrondis.',
  ['<b>Segments :</b> 100 traits, écart de 3 px entre 38 et 96 px de haut (2 px en dessous).', '<b>Blocs :</b> 10 × 10, écart de 1,5 % du côté.',
    '<b>Hachures :</b> 45°, trait de 16 % du pas. <b>Repère 54 :</b> un trait Prélevé de 2 px.', 'Jamais en petit graphique décoratif, jamais pour une autre proportion que gardé / parti.']) + `
  <div class="chiffre" style="position:absolute;left:414px;top:96px;font-size:180px;color:${C.net}">${A.pcH(85)}</div>
  <div class="mp-cote" style="position:absolute;right:40px;top:100px;text-align:right;opacity:.6">Sur 100${_}€ facturés,<br>jusqu’à 85${_}€ pour vous</div>
  ${box(420, 290, 820, 96, A.jauge({ forme: 'segments', p: 85, repere: 54, h: 96, g: 3 }))}
  <div class="mp-cote" style="position:absolute;left:420px;width:820px;top:398px;height:16px;opacity:.6"><span style="position:absolute;left:0">0</span><span style="position:absolute;left:54%;transform:translateX(-50%)">54</span><span style="position:absolute;left:85%;transform:translateX(-50%)">85</span><span style="position:absolute;right:0">100</span></div>
  <div style="position:absolute;left:420px;right:40px;top:446px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px">${[
    [A.jauge({ forme: 'blocs', p: 85, avant: 54, l: 168, g: 2.5 }), 'Blocs · 10 × 10, depuis le bas'], [A.jauge({ forme: 'escalier', p: 85, h: 168, degrade: true, g: 3 }), 'Escalier · les marches de 54 à 85'],
    [`<div style="height:168px;display:flex;align-items:center">${A.jauge({ forme: 'barre', p: 85, h: 40 })}</div>`, 'Barre · ce qui part, hachuré'], [`<div style="height:168px;display:grid;place-items:center">${A.jauge({ forme: 'anneau', p: 85, taille: 168 })}</div>`, 'Anneau · celui du symbole']].map(([j, t]) =>
    `<div style="display:grid;gap:14px">${j}<div class="mp-cote" style="opacity:.7">${fr(t)}</div></div>`).join('')}</div>`);

P.motifs = page('motifs', col('motifs', 'Les données deviennent le motif.',
  'Un histogramme en dégradé, des blocs sur une grille, un arc de lumière. <b>Toujours grainés, toujours sur Coffre, un seul par composition.</b>',
  ['Toujours dans la rampe, du Blanc au Coffre.', 'Jamais derrière un texte courant sans marge sombre.']) + `
  <div style="position:absolute;left:420px;right:40px;top:92px;height:590px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px">${[
    ['Les bandes', 'Un histogramme, profil qui monte', A.bandes({ n: 14, seed: 3 })], ['Le damier', 'Des blocs en dégradé sur une grille', `<div style="position:absolute;left:0;right:0;top:120px;bottom:0">${A.damier({ cols: 4, rows: 8, sens: 'v', seed: 11, densite: .62 })}</div>`],
    ['Le halo', 'Un arc de lumière qui entre par un bord', A.halo('bas')]].map(([t, s, m]) =>
    `<div class="grain" style="position:relative;border-radius:20px;overflow:hidden;box-shadow:inset 0 0 0 1px var(--filet)">${m}<div style="position:absolute;left:20px;top:18px;right:20px;z-index:60"><div class="mp-t1">${t}</div><div class="mp-cote" style="opacity:.6;margin-top:8px">${s}</div></div></div>`).join('')}</div>`);

/* ---------- 05 · L'interface et le mouvement ---------- */
P.ecrans = page('ecrans', col('ecrans', 'Un cockpit à la place de trois outils.',
  'Thème sombre, la version phare : <b>fond Coffre, cartes Ardoise à filet fin, le Net pour l’action et les chiffres</b>, une carte dense en aplat Net pour le solde.',
  ['Les intitulés du vrai produit : Tableau de bord, Comparatif, Planning, Trésorerie, Factures, Cash-Out, Obligations déclaratives.', 'États en pastilles Chivo Mono : payé, à venir, en cours, en retard.']) + `
  <div style="position:absolute;left:420px;top:100px">${A.browser(A.desk.bord(), .54, { url: 'app.payout.fr/tableau-de-bord' })}</div>
  <div style="position:absolute;left:1058px;top:300px">${A.phone(A.screens.solde(), .44)}</div>`, { cls: 'g6 grain' });

const theme = (clair) => { const pill = (t, c) => `<span class="d-pill ${c}">${t}</span>`, T = clair ? 'theme clair' : 'theme';
  return `<div class="${T}" style="position:absolute;inset:0;background:var(--t-fond);color:var(--t-tx);padding:24px 24px 0;display:flex;flex-direction:column;gap:18px;font-size:13.5px">
    <div class="mp-k" style="opacity:.7">${clair ? 'Thème clair · pour le rythme' : 'Thème sombre · version phare'}</div>
    <div style="display:flex;gap:8px"><span class="d-btn">${A.icon('plus', 'currentColor', 15, 2)}Nouveau Cash-Out</span><span class="d-btn ghost">${A.icon('telecharger', 'currentColor', 15)}Exporter</span></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${pill('Payée', 'ok')}${pill('À venir', 'att')}${pill('En cours', 'cours')}${pill('En retard', 'due')}</div>
    <div class="u-field" style="height:40px">${A.icon('recherche', 'currentColor', 16)}Rechercher une transaction…</div>
    <div class="d-card" style="padding:4px 16px">${D.factures.slice(0, 2).map((x) => `<div class="d-row"><div><b class="mono" style="font-weight:500;font-size:12.5px;white-space:nowrap">${x.ref}</b><small>${x.client} · ${fr(x.objet)}</small></div><div style="display:grid;justify-items:end;gap:5px"><span class="mt" style="font-weight:500">${A.eurH(x.ht)}</span>${pill(x.statut, x.ton)}</div></div>`).join('')}</div>
    <div class="d-card dense" style="padding:16px 18px"><div class="d-k" style="opacity:.8">Solde disponible · Qonto connecté</div><div class="d-v" style="font-size:32px;letter-spacing:-.06em;margin-top:8px">${A.eurH(D.solde)}</div>
      ${A.jauge({ h: 10, p: Math.round(D.comptes[0].solde / D.solde * 1000) / 10, pas: 5, style: 'margin-top:14px' })}</div>
    ${A.jauge({ forme: 'segments', p: 85, h: 38, g: 3 })}</div>`; };
P.composants = page('composants', col('composants', 'Mêmes pièces, deux thèmes.',
  'Mêmes écrans, mêmes intitulés. <b>Le thème clair passe sur Relevé</b> : cartes blanches, texte vert en Net 800, carte dense noire.',
  ['<b>Rayons :</b> carte d’interface 20 à 22, bouton et pilule en demi-hauteur, jauge 0.', '<b>Filets :</b> 1 px, blanc à 10 % sur sombre, Coffre à 12 % sur clair.']) +
  cad(420, 92, 402, 590, theme(false)) + cad(838, 92, 402, 590, theme(true), 'box-shadow:none'));

/* Le mouvement : la courbe, les durées, la jauge image par image (valeurs de Marque.pJauge) */
const courbe = (() => { let d = ''; for (let i = 0; i <= 60; i++) { const x = i / 60; d += (i ? 'L' : 'M') + (x * 300).toFixed(1) + ' ' + (220 - A.ease(x) * 220).toFixed(1); }
  return `<svg viewBox="-10 -10 320 240" width="340" style="display:block;overflow:visible"><g stroke="${SUR}" stroke-opacity=".12" stroke-width="1">${[0, 55, 110, 165, 220].map((y) => `<path d="M0 ${y} H300"/>`).join('')}${[0, 75, 150, 225, 300].map((x) => `<path d="M${x} 0 V220"/>`).join('')}</g>
    <path d="M0 220 L300 0" stroke="${SUR}" stroke-opacity=".25" stroke-width="1" stroke-dasharray="4 4"/><path d="${d}" fill="none" stroke="${C.net}" stroke-width="3"/></svg>`; })();
const DUREES = [['160 ms', 'État'], ['420 ms', 'Entrer, montée de 12 px'], ['1 350 ms', 'La jauge, de 54 à 85, départ à 0,4 s'], ['1 800 ms', 'Le logo'], ['80 ms', 'Décalage dans un groupe'], ['8 s', 'Boucle : la jauge redescend sur la dernière seconde']];
P.mouvement = page('mouvement', col('mouvement', 'Tout entre par le bas ou s’allume.',
  'La jauge monte de 54 à 85 et <b>les chiffres comptent avec elle.</b> Rien ne rebondit, rien ne clignote : plans fixes ou dérive lente, c’est l’écran qui vit.') +
  cad(420, 92, 400, 330, `${lbl('Sortie douce')}<div style="position:absolute;left:30px;top:56px">${courbe}</div>
    <div class="mp-cote" style="position:absolute;left:20px;right:20px;bottom:14px;opacity:.7;text-transform:none">1 − (1 − x)<sup style="font-size:.8em">4</sup> · CSS${_}: cubic-bezier(.16,${_}1,${_}.3,${_}1)</div>`) + `
  <div style="position:absolute;left:846px;right:40px;top:92px">${DUREES.map(([v, t]) =>
    `<div style="display:grid;grid-template-columns:130px 1fr;align-items:baseline;gap:10px;padding:10px 0 11px;border-top:1px solid var(--filet)"><span class="mono" style="font-size:26px;font-weight:500;letter-spacing:-.04em;word-spacing:-.3em;color:${C.net}">${fr(v)}</span><span class="mp-tx">${fr(t)}</span></div>`).join('')}</div>
  <div style="position:absolute;left:420px;right:40px;top:446px"><div class="mp-fl"></div>${lbl('La jauge image par image · 1 350 ms, sortie douce', 'margin-top:12px')}</div>
  <div style="position:absolute;left:420px;right:40px;top:494px;display:grid;grid-template-columns:repeat(5,1fr);gap:20px">${[0, .6, .9, 1.2, 1.8].map((t) => { const p = Math.round(A.pJauge(t));
    return `<div><div class="mp-cote" style="opacity:.6">t = ${String(t).replace('.', ',')} s</div><div class="chiffre" style="font-size:44px;margin:10px 0 12px;color:${p === 85 ? C.net : SUR}">${A.pcH(p)}</div>${A.jauge({ forme: 'blocs', p, avant: 54, l: 116, g: 1.74 })}</div>`; }).join('')}</div>`);

/* ---------- 06 · En situation ---------- */
P.planches = page('planches', col('planches', 'Le site, l’app, les réseaux.',
  'Les écrans du vrai produit, avec ses intitulés, et les mêmes données partout : <b>Lucie Morel, LM Conseil, 600 € de TJM.</b>',
  ['Personnes, sociétés et montants fictifs.', 'Planches de l’étude de cas, rendues depuis le socle.']) +
  media('plates', '25-cockpit.png', 420, 92, 820, 300, 'Le cockpit · thème sombre, la version phare', { pos: '50% 40%' }) +
  media('plates', '27-cra-facture.png', 420, 426, 264, 220, 'Du CRA à la facture · quatre écrans', { pos: '50% 58%' }) +
  media('plates', '34-reseaux.png', 698, 426, 264, 220, 'Réseaux sociaux · trois publications', { pos: '50% 62%' }) +
  media('plates', '22-pages-site.png', 976, 426, 264, 220, 'Le site · payout.fr, de haut en bas', { pos: '50% 8%' }), { clair: true });

/* Rendus 3D de out/final/ : chaque cadre a un fond de repli qui dessine le support en HTML */
const R = {
  monument: `<div class="g6 grain" style="position:absolute;inset:0"></div>${centre(A.jauge({ forme: 'blocs', p: 85, l: 300, g: 4.5 }))}`,
  abribus: `<div class="grain" style="position:absolute;inset:0"></div>${centre(`<div style="display:grid;justify-items:start;gap:16px;width:250px">${A.passage({ taille: 44 })}${A.jauge({ forme: 'segments', p: 85, n: 50, h: 30, g: 2 })}${A.wordmark(SUR, 'style="width:110px;display:block"')}</div>`)}`,
  enseigne: `<div class="g6 grain" style="position:absolute;inset:0"></div>${centre(A.wordmark(C.net, 'style="width:220px;display:block;filter:drop-shadow(0 0 18px rgba(54,255,114,.55))"'))}`,
  portable: `<div class="g6 grain" style="position:absolute;inset:0"></div>${centre(A.laptop(A.desk.site(), .27))}`,
  papeterie: `<div class="grain" style="position:absolute;inset:0;background:${C.ardoise}"></div>${centre(A.decompte({ titre: 'Votre mois d’octobre', lignes: [['20 jours à 600 €', 12000]], total: ['<span style="white-space:nowrap">F-2026-010 · HT</span>', 12000], p: null, k: .64 }))}`,
  stand: `<div class="g6 grain" style="position:absolute;inset:0"></div>${centre(A.browser(A.desk.bord(), .17))}`,
};
P.ville = page('ville', col('ville', 'Dans la ville, la nuit.',
  'De nuit, sans exception. <b>Les écrans et les lettres font la lumière</b> ; sol sombre et brillant, socles noirs, reflets verts.',
  ['Pas de jour, pas de bois, pas de papier kraft.', 'L’émission du Net reste à 1,2 au plus, pour garder la teinte.']) +
  media('final', '02-monument.png', 420, 92, 500, 548, 'Le monument · un mur de 100 blocs, 85 allumés', { repli: R.monument, pos: '62% 50%' }) +
  media('final', '18-abribus.png', 936, 92, 304, 236, 'Abribus · caisson rétroéclairé, de 54 à 85 %', { repli: R.abribus, pos: '50% 50%' }) +
  media('final', '35-enseigne.png', 936, 376, 304, 264, 'Enseigne · le logotype lumineux, 1,6 m', { repli: R.enseigne, pos: '50% 50%' }));
P.bureau = page('bureau', col('bureau', 'Sur le bureau.',
  'Le produit reste le héros : <b>le site sur un portable, le cockpit sur un mur d’écran</b>, la facture F-2026-010 imprimée. Sobre, sans kraft ni tampon.',
  ['Payout n’émet pas de carte de paiement : on n’en dessine pas.', 'Les mêmes données fictives que sur les écrans.']) +
  media('final', '21-portable.png', 420, 92, 500, 548, 'Portable sur socle · le site à l’écran', { repli: R.portable, pos: '50% 50%' }) +
  media('final', '19-papeterie.png', 936, 92, 304, 236, 'Papeterie · cartes, facture et CRA', { repli: R.papeterie, pos: '50% 50%' }) +
  media('final', '32-stand.png', 936, 376, 304, 264, 'Stand de salon · mur d’écran et comptoir', { repli: R.stand, pos: '50% 50%' }));

/* Dos : halo en arc bas, signature longue, crédits, mention */
P.dos = page('dos', `
  <div style="position:absolute;left:0;right:0;top:80px;display:grid;justify-items:center;gap:26px;z-index:60">${A.lockup(SUR, 'style="width:380px;display:block"')}
    <div class="mp-t" style="text-align:center">Gardez la part qui vous revient.</div><div class="mono" style="font-size:13.5px;color:${C.net};letter-spacing:.04em">payout.fr</div></div>
  <div style="position:absolute;left:40px;right:40px;top:300px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;z-index:60">${[
    ['Client', 'Payout, FinTech, France. Le copilote des freelances en SASU.'], ['2025 · réalisé', 'Identité, site vitrine et front de la web app : KLYRA, en six semaines.'],
    ['2026 · proposé', 'Évolution de l’identité, direction artistique et motion design : KLYRA.'], ['Crédits', 'Polices Instrument Sans et Chivo Mono (OFL). Écrans : personnes et montants fictifs.']].map(([a, b]) =>
    `<div><div class="mp-fl"></div>${lbl(a, 'margin-top:12px')}<p class="mp-tx" style="margin-top:6px;opacity:.85">${fr(b)}</p></div>`).join('')}</div>
  <div class="mp-cote" style="position:absolute;left:40px;right:40px;top:418px;text-align:center;opacity:.7;z-index:60">${fr('Proposition d’évolution faite par KLYRA : ce n’est pas l’identité officielle de Payout.')}<br>${fr('Le nom et le logo n’ont fait l’objet d’aucune vérification d’antériorité. Guide de marque, version 1.0, novembre 2026.')}</div>`,
  { cls: 'g2 grain' });

window.GuidePages = P;
window.GuideOrder = ORDER;
window.GuideTitles = TITLES;
})();
