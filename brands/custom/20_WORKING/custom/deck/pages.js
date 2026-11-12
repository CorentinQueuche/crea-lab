/* Pages du guide de marque Custom (1280 × 720 chacune). Proposition de KLYRA, non validée par Custom.
   SOURCE UNIQUE : le PDF (node tools/deck.mjs puis python tools/deck_pdf.py), la mosaïque (plates/45-guide.html) et la
   visionneuse du site lisent ce fichier.
   À charger après : brand/marque.js, brand/techniques.js, brand/ecrans.js. Styles : brand/marque.css, brand/ecrans.css, deck/pages.css.
   Exporte : window.GuidePages (clé → HTML d'une page), window.GuideOrder (ordre), window.GuideTitles (titres),
   window.GuideApres(racine) : à appeler APRÈS avoir écrit une page dans le document (rend les canvas des techniques).
   Les numéros (bandeau, sommaire) sont calculés depuis GuideOrder : on réordonne CH, tout suit.
   Règles chiffrées : celles de MARQUE.md, mot pour mot. Contrastes : calculés par Marque.contraste.
   Images : planches de out/plates/, affiches de out/art/, rendus 3D de out/final/ par img(dossier, fichier) ;
   window.GuideMedia (défini avant ce script par la visionneuse) remplace le dossier. Photos : Marque.photo (Marque.BASE_PHOTOS).
   Un rendu absent se retire et laisse voir le repli dessiné en HTML ; l'image passe au-dessus du repli (z-index 61 contre 60). */
(function () {
const A = window.Marque, C = A.COULEURS, D = A.DONNEES;
const _ = A.NB;                                  // espace insécable
const F = C.fluo, N0 = C.noir, E = C.encre, W = '#FFFFFF', V = C.violet, O = C.orange, G = C.graphite;
const img = (sub, f) => (window.GuideMedia || '../out/' + sub + '/') + f;

/* ---------- Chapitres : [numéro, titre, pages [clé, titre]] ---------- */
const CH = [
  ['01', 'La marque', [['idee', 'Tout est fait ici'], ['existant', 'Ce qui existe, on le garde']]],
  ['02', 'Le logo', [['cran', 'Le Cran et sa construction'], ['versions', 'Six versions'], ['zone', 'Zone de protection et tailles'], ['logocouleurs', 'Couleurs du logo'], ['interdits', 'Ce qu’on ne fait jamais']]],
  ['03', 'Les couleurs', [['palette', 'La palette et ses rôles'], ['proportions', 'Proportions'], ['contrastes', 'Contrastes calculés']]],
  ['04', 'La typographie', [['polices', 'Quatre polices'], ['surligneur', 'Le surligneur'], ['hierarchie', 'Une hiérarchie montée']]],
  ['05', 'Le bloc', [['coin', 'La règle du coin libre'], ['sprites', 'Sprites, chiffres, pictos']]],
  ['06', 'Matières et repères', [['matieres', 'Les matières d’encre'], ['reperes', 'Les repères d’impression']]],
  ['07', 'La photo', [['sujets', 'Deux sujets'], ['traitements', 'Six traitements'], ['masques', 'Les masques']]],
  ['08', 'Les cinq techniques', [['techniques', 'Un Cran, cinq matières'], ['tissus', 'Les tissus']]],
  ['09', 'Le mouvement', [['mouvement', 'Un pas, la pente, les crans']]],
  ['10', 'En situation', [['site', 'Le site'], ['textile', 'Le textile'], ['affiches', 'Les affiches'], ['s-atelier', 'L’écusson et le cadre'],
    ['s-ecrans', 'Le portable et le téléphone'], ['s-papier', 'Étiquettes et papeterie'], ['s-objets', 'Goodies et signalétique']]],
];
const ORDER = ['couverture', 'sommaire', ...CH.flatMap((c) => c[2].map((s) => s[0])), 'dos'];
const TITLES = ['Couverture', 'Sommaire', ...CH.flatMap((c) => c[2].map((s) => s[1])), 'Dos'];
const pad = (n) => String(n).padStart(2, '0');
const num = (k) => pad(ORDER.indexOf(k) + 1);
const chap = (k) => CH.find((c) => c[2].some((s) => s[0] === k));
const etiq = (k) => { const c = chap(k); return c ? `${c[0]} · ${c[1]}` : ''; };

/* ---------- Typographie française : espaces insécables. Pour le texte seul, jamais pour du SVG. ---------- */
const fr = (s) => String(s)
  .replace(/(\d) (?=\d{3}(?!\d))/g, '$1' + _)
  .replace(/(\d) (?=(%|px|mm|ms|s|h|j|°)(?![\wÀ-ÿ]))/g, '$1' + _)
  .replace(/ ([:;!?»])/g, _ + '$1')
  .replace(/« /g, '«' + _);
const cr = (a, b) => A.contraste(a, b).toFixed(1).replace('.', ',');
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ');
const surTxt = (bg) => (A.contraste(E, bg) >= A.contraste(W, bg) ? E : W);

/* ---------- Éléments communs ---------- */
const box = (x, y, w, h, inner = '', st = '') => `<div class="mp-abs" style="left:${x}px;top:${y}px;${w != null ? 'width:' + w + 'px;' : ''}${h != null ? 'height:' + h + 'px;' : ''}${st}">${inner}</div>`;
const tuile = (x, y, w, h, inner = '', cls = '', st = '') => `<div class="mp-tuile ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${st}">${inner}</div>`;
const lbl = (t, st = '', cls = '') => `<div class="mp-lbl ${cls}" style="${st}">${fr(t)}</div>`;
const chapo = (t, st = '') => `<p class="mp-chapo" style="${st}">${fr(t)}</p>`;
const txt = (t, st = '') => `<p class="mp-txt" style="${st}">${fr(t)}</p>`;
/* Titre de page : Bebas Neue en capitales, un seul mot surligné (cls : variante du surligneur, « noir » sur une page fluo) */
const ti = (avant, mot, apres = '', t = 64, cls = '', st = '') => `<div class="t-titre" style="font-size:${t}px;${st}">${avant}${A.surl(mot, cls)}${apres}</div>`;
/* Tête de page : chapitre en chasse fixe, titre, chapeau */
const tete = (k, titre, ch, x = 56, y = 76, w = 440) => box(x, y, w, null, `<div class="mp-tete">${lbl(etiq(k), '', 'mp-doux')}${titre}${ch ? chapo(ch) : ''}</div>`, 'z-index:60');
const regles = (L, st = '') => `<div class="mp-rg" style="${st}">${L.map((r, i) => `<div><i>${pad(i + 1)}</i><span>${fr(r)}</span></div>`).join('')}</div>`;
const centre = (html, st = '') => `<div class="mp-centre" style="${st}">${html}</div>`;
/* Bandeau en chasse fixe : marque, chapitre, titre de page, numéro sur le total */
const bande = (k) => { const i = ORDER.indexOf(k);
  return `<div class="mp-bande"><span>Custom · Guide de marque</span><span class="mp-pt">${fr(etiq(k) || 'Proposition de KLYRA')}</span><span class="mp-pt">${fr(TITLES[i])}</span><span>${pad(i + 1)}${_}/${_}${pad(ORDER.length)}</span></div>`; };
/* Signature : croix de repérage aux quatre angles, barre de contrôle en pied */
const COINS = ['left:12px;top:12px', 'right:12px;top:12px', 'left:12px;bottom:12px', 'right:12px;bottom:12px'].map((p) => `<i class="croix mp-coin" style="${p}"></i>`).join('');
const pied = () => `<div class="mp-abs" style="right:56px;bottom:22px;width:112px;z-index:70">${A.barre({ style: 'height:5px' })}</div>`;
const page = (k, fond, inner, o = {}) => `<div class="mp-page mp-${fond}" data-page="${k}">${inner}${o.sansBande ? '' : bande(k)}${o.sansPied ? '' : pied()}${COINS}</div>`;
/* Image de out/ dans un cadre posé sur un repli dessiné en HTML (z 60) ; l'image (z 61) se retire si le fichier manque */
const media = (sub, f, x, y, w, h, o = {}) => `<div class="mp-cadre" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${o.st || ''}"><div class="mp-repli" data-coupe style="${o.fond ? 'background:' + o.fond : ''}">${o.repli || ''}</div>` +
  `<img class="mp-img" src="${img(sub, f)}" alt="" style="object-position:${o.pos || '50% 50%'}" onerror="this.remove()">` +
  (o.tag ? `<span class="mp-lbl" style="position:absolute;left:12px;top:11px;z-index:62;padding:3px 8px;border-radius:5px;background:rgba(16,16,18,.84);color:#fff">${fr(o.tag)}</span>` : '') + `</div>` +
  (o.leg ? box(x, y + h + 9, w, null, `<div class="mp-leg">${fr(o.leg)}</div>`) : '');
/* Canvas de brand/techniques.js (rendu par GuideApres après insertion) : défini à 2 fois sa taille d'affichage */
const canvas = (o, w, h, st = '') => `<canvas ${Object.keys(o).map((k) => `data-${k}="${o[k]}"`).join(' ')} width="${Math.round(w * 2)}" height="${Math.round(h * 2)}" style="display:block;width:${w}px;height:${h}px;${st}"></canvas>`;
const ph = (nom, o = {}) => A.photo(nom, Object.assign({}, o, { style: 'position:absolute;inset:0;' + (o.style || '') }));
const masque = (u, size = '100% 100%') => `-webkit-mask-image:${u};mask-image:${u};-webkit-mask-size:${size};mask-size:${size};-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center`;

const P = {};

/* =====================================================================================================
   Couverture : le Cran comme fenêtre (photo du dunk), titre en Bebas, coulure orange qui déborde
   ===================================================================================================== */
P.couverture = page('couverture', 'noir', `
  ${box(56, 70, null, null, A.logo(W, 'style="height:30px;width:auto"', { sym: F }))}
  <div class="mp-abs" style="left:494px;top:144px;width:740px;z-index:1">${A.symbol(F, 'style="width:740px;height:auto;display:block"', { contour: .55 })}</div>
  <div class="dans-cran mp-abs" style="left:470px;top:120px;width:740px;z-index:2">${ph('dunk', { mode: 'brut' })}</div>
  ${box(56, 236, 560, null, `<div class="t-titre" style="font-size:136px">Guide de<br>${A.surl('marque')}</div>`, 'z-index:5')}
  ${box(56, 500, 400, null, chapo('Tout est fait ici. L’identité de Custom, mise en système : le logo, les couleurs, le bloc, la matière, le mouvement.'), 'z-index:5')}
  <div class="mp-abs" style="left:-90px;top:592px;width:700px;height:170px;z-index:3">${A.coulure({ w: 700, h: 170, c: 'orange', seed: 5, cx: .46, rx: .5, ry: .5, attrs: 'style="width:100%;height:100%;display:block"' })}</div>
  ${box(70, 612, null, null, `<div style="display:flex;gap:22px;align-items:flex-end">${[1, 2, 3, 4].map((i) => A.sprite('course', i, { c: W, attrs: 'style="height:52px;width:auto"' })).join('')}</div>`, 'z-index:4')}
  ${box(700, 620, 524, null, `<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:20px"><div class="mp-lbl" style="opacity:.7">${fr(`Proposition de KLYRA · 2026 · ${ORDER.length} pages`)}<br>Atelier de personnalisation · custom.fr</div><div style="width:168px">${A.barre({ style: 'height:8px' })}</div></div>`, 'z-index:5')}`,
  { sansPied: true });

/* =====================================================================================================
   Sommaire : dix chapitres en deux colonnes, numéros calculés
   ===================================================================================================== */
const chItem = ([n, t, subs]) => { const a = num(subs[0][0]), b = num(subs[subs.length - 1][0]);
  return `<div style="border-top:1px solid var(--filet);padding-top:12px;position:relative">
    <div style="display:flex;align-items:baseline;gap:14px"><span class="mp-nom" style="font-size:40px;width:40px">${n}</span><span class="mp-nom" style="font-size:28px">${fr(t)}</span><span class="mp-cote" style="margin-left:auto;opacity:.6">${a === b ? a : a + '–' + b}</span></div>
    <p class="mp-txt" style="margin-top:7px;font-size:12px;opacity:.68;padding-left:54px">${subs.map((s) => fr(s[1])).join(' · ')}</p></div>`; };
P.sommaire = page('sommaire', 'craie', `
  ${tete('sommaire', ti('Une page,<br>', 'une règle.', '', 76), 'Ce guide met en système l’identité livrée par KLYRA en 2025. Chaque page fixe une règle ; les chiffres qu’elle donne sont ceux qu’on applique, sur chaque support.', 56, 76, 400)}
  ${box(56, 556, 380, null, `<div style="display:flex;gap:14px;align-items:flex-start">${A.symbol(E, 'style="width:44px;height:auto;flex:none;margin-top:2px"')}${txt('Proposition de KLYRA, non validée par Custom. Le nom, le logo, les couleurs et les polices de 2025 restent inchangés.', 'font-size:12.5px')}</div>`)}
  ${box(500, 84, 724, 588, `<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(5,1fr);grid-auto-flow:column;column-gap:36px;height:100%">${CH.map(chItem).join('')}</div>`)}`);

/* =====================================================================================================
   01 · La marque
   ===================================================================================================== */
const TRI = [['01 · Chez vous', 'Imaginé chez vous.'], ['02 · Chez nous', 'Fabriqué chez nous.'], ['03 · Partout', 'Porté partout.']];
P.idee = page('idee', 'fluo', `
  ${box(56, 76, null, null, lbl(etiq('idee'), 'opacity:.7'))}
  ${box(56, 104, 720, null, `<div class="t-large" style="font-size:112px">Tout est<br>fait ${A.surl('ici.', 'noir')}</div>`)}
  ${box(56, 352, 640, null, `${lbl('La règle du projet', 'opacity:.7')}${chapo('L’identité de Custom existe et ne change pas : on la met en système. On nomme ce qui existe, on le règle au chiffre près, puis on le pousse sur tous les supports.', 'margin-top:8px;max-width:600px')}`)}
  ${box(800, 92, 424, 212, A.chemin({ w: 424, h: 212, c: E, ep: 3 }))}
  ${box(800, 318, 424, null, `${txt('Le symbole dit déjà tout : <b>deux blocs identiques, décalés d’un pas.</b> L’atelier et vous, à une marche l’un de l’autre. Pas d’intermédiaire. Nous appelons ce symbole <b>le Cran</b>.', 'font-size:14.5px')}${lbl('Descripteur · Atelier de personnalisation', 'margin-top:12px;opacity:.7')}`)}
  ${TRI.map(([k, t], i) => box(56 + i * 390, 560 - i * 46, 360, null, `${A.bloc(E, 'style="width:64px;height:auto"', { l: 56, h: 30 })}${lbl(k, 'margin-top:12px;opacity:.7')}<div class="t-titre" style="font-size:42px;margin-top:6px">${t}</div>`)).join('')}`);

const ORIG = [['origine-site-pages', 'Le site'], ['origine-site-ecrans', 'Les écrans'], ['origine-affiche-cartes', 'Affiche et cartes'], ['origine-vignette', 'La vignette'], ['origine-sprites', 'Les sprites'], ['origine-totem', 'Le totem']];
const ROT = [-1.6, 1.2, -0.8, 0.9, -1.3, 1.5];
const puces = (L) => `<div style="display:flex;flex-wrap:wrap;gap:7px 16px;margin-top:14px">${L.map((t) => `<span class="mp-puce">${fr(t)}</span>`).join('')}</div>`;
P.existant = page('existant', 'noir', `
  ${tete('existant', ti('Ce qui existe,<br>on le ', 'garde.', '', 60), 'KLYRA a livré l’identité et le site de Custom en 2025, en quatre semaines. Rien n’est redessiné : on nomme ce qui existe, on le règle, puis on le pousse sur tous les supports.', 56, 76, 400)}
  ${ORIG.map(([f, n], i) => `<div class="mp-tirage" style="left:${500 + (i % 3) * 250}px;top:${84 + Math.floor(i / 3) * 170}px;width:224px;transform:rotate(${ROT[i]}deg)"><div style="height:116px">${`<img src="${A.photoURL(f)}" alt="">`}</div><span><b style="font-weight:500">${fr(n)}</b><b style="font-weight:500">2025</b></span></div>`).join('')}
  ${box(500, 420, 724, null, lbl('L’existant · médias publiés par KLYRA, montrés sans retouche', 'opacity:.55'))}
  ${[[ti('Tel ', 'quel', '', 36), ['Le symbole', 'Le logotype « Custom.fr »', 'Les couleurs', 'Bebas Neue et le mot surligné', 'La grotesque étirée', 'Les sprites', 'Les chiffres en blocs', 'Les taches d’encre', 'Les croix de repérage', 'Le motif de blocs', 'Les sangles orange', 'La photo de sport', 'La macro d’atelier']],
    [ti('Nommé et ', 'réglé', '', 36), ['Le Cran', 'Le bloc', 'La coulure', 'Le piquage', 'Les règles chiffrées']],
    [ti('Poussé ', 'plus loin', '', 36, 'violet'), ['Six traitements photo', 'Les masques', 'Cinq techniques en matière', 'La barre de contrôle', 'Les pictos d’univers', 'Le gris Craie', 'L’échelle de fluo', 'Les supports nouveaux']]].map(([t, L], i) =>
    box(56 + i * 390, 452, 360, null, `<div class="mp-filet" style="margin-bottom:14px"></div>${t}${puces(L)}`)).join('')}`);

/* =====================================================================================================
   02 · Le logo
   ===================================================================================================== */
const K = A.CONSTRUCTION, SP = A.symbolParts();
const cranSvg = (() => { let g = '';
  for (let v = -40; v <= 240; v += 10) g += `M${v} -40V173`;
  for (let v = -40; v <= 173; v += 10) g += `M-44 ${v}H240`;
  const t = (x, y, s, an = 'middle', c = W, op = .85) => `<text x="${x}" y="${y}" fill="${c}" fill-opacity="${op}" text-anchor="${an}" font-family="JetBrains Mono" font-weight="500" font-size="4" letter-spacing=".1">${s}</text>`;
  const ln = (d, op = .7, dash = '') => `<path d="${d}" fill="none" stroke="${W}" stroke-opacity="${op}" stroke-width=".35"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  return `<svg viewBox="-44 -40 284 213" width="784" height="588" style="display:block;overflow:visible">
    <defs><pattern id="mp-hc" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width=".8" height="2.4" fill="${E}"/></pattern><clipPath id="mp-cc"><path d="${SP.haut}"/></clipPath></defs>
    <path d="${g}" stroke="${W}" stroke-opacity=".06" stroke-width=".3"/>
    <rect x="0" y="0" width="191.05" height="110" fill="none" stroke="${W}" stroke-opacity=".3" stroke-width=".3" stroke-dasharray="1.4 1.4"/>
    <path d="${A.symbolPath()}" fill="${F}"/>
    <path d="${SP.bas}" fill="url(#mp-hc)" clip-path="url(#mp-cc)" opacity=".55"/>
    <path d="${SP.haut}" fill="none" stroke="${E}" stroke-opacity=".55" stroke-width=".4" stroke-dasharray="1.6 1.2"/>
    <path d="${SP.bas}" fill="none" stroke="${E}" stroke-opacity=".55" stroke-width=".4" stroke-dasharray="1.6 1.2"/>
    ${t(128, 32, 'bloc du haut', 'middle', E, .8)}${t(62, 92, 'bloc du bas', 'middle', E, .8)}
    ${ln('M75.25 -10H193.05M75.25 -13V-7M193.05 -13V-7')}${t(134.15, -13.5, 'bloc · 117,8')}
    ${ln('M204 0V62.4M201 0H207M201 62.4H207')}${t(207.5, 33, '62,4', 'start')}
    ${ln('M75.25 -24V-2M12.85 -24V45', .4, '1 1')}${ln('M12.85 -26H75.25M12.85 -29V-23M75.25 -29V-23')}${t(44.05, -29.5, 'pas x · 62,5')}
    ${ln('M-20 0H73M-20 47.6H10', .4, '1 1')}${ln('M-22 0V47.6M-25 0H-19M-25 47.6H-19')}${t(-25.5, 22.5, '47,6', 'end')}${t(-25.5, 27.5, 'pas y', 'end', W, .6)}
    ${ln('M-12 47.6V62.4M-15 47.6H-9M-15 62.4H-9')}${ln('M-9 62.4H8', .4, '1 1')}${t(-15.5, 56.5, '14,8', 'end')}${t(-15.5, 61.5, 'recouvr.', 'end', W, .6)}
    ${ln('M-1.9 110V78', .5, '1 1')}<path d="M-1.9 88A22 22 0 0 1 3.16 88.6" fill="none" stroke="${F}" stroke-width=".5"/>${t(-5, 86, '13,3°', 'end', F, 1)}
    <circle cx="183.95" cy="7.2" r="7.2" fill="none" stroke="${E}" stroke-width=".4" stroke-dasharray="1 .8"/>${t(198, -3, 'r 7,2', 'start')}
    ${ln('M0 124H191.05M0 121V127M191.05 121V127')}${t(95.5, 131.5, 'repère · 191,05 × 110')}
    ${ln('M222 0V110M219 0H225M219 110H225')}${t(225.5, 57, '110', 'start')}</svg>`; })();
P.cran = page('cran', 'noir', `
  ${tete('cran', ti('Deux blocs,<br>', 'un pas', '', 64), 'Le tracé officiel du Cran ne bouge pas. Nous l’avons mesuré : deux blocs identiques, inclinés de 13,3°, décalés d’un pas. Toutes les cotes sont dans le repère du symbole.', 56, 76, 350)}
  ${box(56, 470, 350, null, regles(['<b>Angle</b> : 13,3°, pour les deux blocs.', '<b>Bloc</b> : 117,8 × 62,4, rayon de coin 7,2.', '<b>Pas</b> : 62,5 en x, 47,6 en y.', '<b>Recouvrement</b> : 14,8 en hauteur.', '<b>Repère</b> : 191,05 × 110.']))}
  ${box(440, 92, 784, 588, cranSvg)}`);

const VERS = [
  ['01 · Référence', A.logo(W, 'style="width:240px;height:auto"', { sym: F }), 'Le Cran puis « Custom.fr », sur une ligne. Partout où la place le permet.', 'Marque.logo'],
  ['02 · Empilé', A.logoV(W, 'style="width:140px;height:auto"', { sym: F }), 'Le Cran au-dessus, centré. Formats carrés et hauts.', 'Marque.logoV'],
  ['03 · Logotype seul', A.wordmark(W, 'style="width:250px;height:auto"'), 'Pour les très grands usages.', 'Marque.wordmark'],
  ['04 · Cran seul', A.symbol(F, 'style="width:132px;height:auto"'), 'Icône, bouton, signalétique, fin de vidéo.', 'Marque.symbol'],
  ['05 · Filaire', A.logo(F, 'style="width:250px;height:auto"', { contour: 3 }), 'Le contour, sur le textile, au fil.', '{ contour : 2 }'],
  ['06 · Avec descripteur', A.lockup(W, 'style="width:300px;height:auto"'), '« Atelier de personnalisation » sur deux lignes.', 'Marque.lockup']];
P.versions = page('versions', 'noir', `
  ${tete('versions', ti('Un logo, ', 'six versions', '', 64), '', 56, 76, 640)}
  ${box(700, 100, 524, null, chapo('Le logo de référence est le Cran puis « Custom.fr », sur une ligne. Les cinq autres versions en dérivent ; aucune n’est redessinée.'))}
  ${VERS.map(([k, s, t, api], i) => tuile(56 + (i % 3) * 396, 196 + Math.floor(i / 3) * 244, 376, 228,
    `${lbl(k, '', 'mp-haut')}${centre(s, 'padding-bottom:26px')}<div style="position:absolute;left:16px;right:16px;bottom:14px;display:flex;justify-content:space-between;align-items:flex-end;gap:14px">${txt(t, 'font-size:12.5px;opacity:.78;max-width:230px')}<span class="mp-cote" style="opacity:.5;font-size:10px">${fr(api)}</span></div>`)).join('')}`);

/* Zone de protection : la moitié de la hauteur d'un bloc, 0,28 fois la hauteur du Cran (repère du logo : 714 × 110) */
const ZM = 0.28 * 110;
const zoneSvg = `<svg viewBox="-74 -62 862 238" width="754" height="208" style="display:block;overflow:visible"><defs><pattern id="mp-hz" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1.3" height="7" fill="${E}" opacity=".3"/></pattern></defs>
  <rect x="${-ZM}" y="${-ZM}" width="${714 + 2 * ZM}" height="${110 + 2 * ZM}" fill="url(#mp-hz)"/><rect x="0" y="0" width="714" height="110" fill="#fff"/>
  <rect x="${-ZM}" y="${-ZM}" width="${714 + 2 * ZM}" height="${110 + 2 * ZM}" fill="none" stroke="${E}" stroke-width="1.4" stroke-dasharray="6 5"/>
  <path d="${A.symbolPath()}" fill="${E}"/><g transform="translate(227.05 0)"><path d="${A.wordPath()}" fill="${E}" fill-rule="evenodd"/></g>
  <path d="${A.blocPath(0, -ZM, 58.9, ZM, 3.6)}" fill="${F}" stroke="${E}" stroke-width="1"/>
  <text x="76" y="-11" font-family="JetBrains Mono" font-weight="500" font-size="12.5" fill="${E}">½ bloc = 0,28 H</text>
  <path d="M-52 0V110M-57 0H-47M-57 110H-47" stroke="${E}" stroke-width="1.2"/><text x="-58" y="60" text-anchor="end" font-family="JetBrains Mono" font-weight="500" font-size="12.5" fill="${E}">H</text></svg>`;
const MINI = [[A.logo(E, 'style="width:90px;height:auto"'), 90, 'Logo de référence', '90 px · 24 mm de large'], [A.wordmark(E, 'style="width:64px;height:auto"'), 64, 'Logotype seul', '64 px · 18 mm de large'], [A.symbol(E, 'style="width:16px;height:auto"'), 16, 'Cran seul', '16 px · 4 mm de large']];
P.zone = page('zone', 'blanc', `
  ${tete('zone', ti('Un demi-bloc<br>', 'd’air', '', 64), 'La zone de protection vaut la moitié de la hauteur d’un bloc, soit 0,28 fois la hauteur du Cran, sur les quatre côtés. Rien n’y entre : ni texte, ni image, ni bord de page.', 56, 76, 360)}
  ${box(470, 112, 754, 208, zoneSvg)}
  ${box(470, 346, 754, null, lbl('H = hauteur du Cran · zone hachurée = 0,28 H sur les quatre côtés · même règle pour les six versions', 'opacity:.6'))}
  ${box(56, 432, 1168, null, `<div class="mp-filet"></div>${lbl('Tailles minimales · à l’échelle 1', 'margin-top:12px')}`)}
  ${MINI.map(([s, w, n, c], i) => box(56 + i * 390, 486, 360, 186, `<div style="height:60px;display:flex;align-items:flex-end">${s}</div>
    <svg width="${w}" height="10" style="margin-top:10px;overflow:visible"><path d="M0 0V10M${w} 0V10M0 5H${w}" stroke="${O}" stroke-width="1.2"/></svg>
    <div class="t-titre" style="font-size:30px;margin-top:16px">${n}</div><div class="mp-cote" style="margin-top:6px">${fr(c)}</div>`)).join('')}`);

/* Couleurs du logo : contrastes calculés */
const ACC = [
  [N0, A.logo(F, 'style="width:200px;height:auto"'), 'Fluo sur noir', 'La version de référence.', [F, N0]],
  [N0, A.logo(W, 'style="width:200px;height:auto"'), 'Blanc sur noir', 'Texte et interface.', [W, N0]],
  [F, A.logo(E, 'style="width:200px;height:auto"'), 'Encre sur fluo', 'Jamais de blanc sur le fluo.', [E, F]],
  [W, A.logo(E, 'style="width:200px;height:auto"'), 'Encre sur blanc', 'Papier, cartes claires.', [E, W]],
  [V, A.logo(W, 'style="width:200px;height:auto"'), 'Blanc sur violet', 'Couleur d’atelier.', [W, V]],
  [O, A.logo(E, 'style="width:200px;height:auto"'), 'Encre sur orange', 'Couleur d’atelier.', [E, O]],
  ['photo', A.logo(F, 'style="width:200px;height:auto"'), 'Fluo sur photo', 'Photo assombrie, fluo ou blanc.', null],
  [G, A.logo(W, 'style="width:200px;height:auto"', { sym: F }), 'Cran fluo, logotype blanc', 'La variante bicolore.', [W, G]]];
P.logocouleurs = page('logocouleurs', 'noir', `
  ${tete('logocouleurs', ti('Les couleurs ', 'du logo', '', 64), '', 56, 76, 640)}
  ${box(700, 100, 524, null, chapo('Le logo est toujours un aplat d’une couleur de la charte, sur un fond de la charte ou sur une photo assombrie. Le Cran peut être fluo et le logotype blanc.'))}
  ${ACC.map(([bg, s, n, t, pr], i) => { const fg = bg === 'photo' ? W : surTxt(bg);
    return tuile(56 + (i % 4) * 296, 196 + Math.floor(i / 4) * 244, 280, 228,
      (bg === 'photo' ? ph('equipe', { mode: 'sombre' }) : '') + `<div class="mp-lbl" style="position:absolute;left:16px;top:13px;z-index:62;color:${fg}">${fr(n)}</div>` +
      (pr ? `<span class="mp-cote" style="position:absolute;right:16px;top:14px;z-index:62;color:${fg};font-size:10px">${cr(pr[0], pr[1])}${_}:${_}1</span>` : '') +
      centre(s, 'z-index:61;padding-top:8px') + `<p class="mp-txt" style="position:absolute;left:16px;bottom:13px;z-index:62;color:${fg};font-size:12px;opacity:.8">${fr(t)}</p>`,
      bg === N0 ? 'mp-t-noir' : '', bg !== 'photo' && bg !== N0 ? `background:${bg};color:${fg}` : ''); }).join('')}`);

const lg = (fill, st = '', extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 714 110" style="width:240px;height:auto;overflow:visible;${st}">${extra}<path d="${A.symbolPath()}" fill="${fill}"/><g transform="translate(227.05 0)"><path d="${A.wordPath()}" fill="${fill}" fill-rule="evenodd"/></g></svg>`;
const NON = [
  [lg('url(#mp-dg)', '', `<defs><linearGradient id="mp-dg" x1="0" x2="1"><stop offset="0" stop-color="${F}"/><stop offset="1" stop-color="${V}"/></linearGradient></defs>`), 'Pas de dégradé', 'Le logo est un aplat.', N0],
  [lg(F, 'filter:drop-shadow(7px 7px 0 #56565A)'), 'Pas d’ombre', 'Ni portée, ni douce.', N0],
  [A.logo(F, 'style="width:240px;height:auto;overflow:visible"').replace(/fill-rule="evenodd"/g, 'fill-rule="evenodd" stroke="#FFFFFF" stroke-width="9" paint-order="stroke"'), 'Pas de contour', 'Le filaire est une version, pas un effet.', N0],
  [lg(F, 'transform:rotate(-11deg)'), 'Pas de rotation', 'Le Cran porte déjà sa pente.', N0],
  [lg(F, 'transform:scale(1.32,.72)'), 'Pas de déformation', 'Ni étiré, ni tassé.', N0],
  [lg(W), 'Pas de blanc sur fluo', `Contraste de ${cr(W, F)}${_}:${_}1 : illisible.`, F]];
P.interdits = page('interdits', 'craie', `
  ${tete('interdits', ti('Ce qu’on ne fait ', 'jamais', '', 64), '', 56, 76, 640)}
  ${box(700, 100, 524, null, chapo('Le logo ne se transforme pas. Ces six gestes suffisent à le rendre méconnaissable ; on ne les fait sur aucun support.'))}
  ${NON.map(([s, n, t, bg], i) => tuile(56 + (i % 3) * 396, 196 + Math.floor(i / 3) * 244, 376, 228,
    centre(s, 'padding-bottom:30px;z-index:61') + `<div style="position:absolute;inset:0" class="mp-non"></div>` +
    `<div style="position:absolute;left:16px;right:16px;bottom:13px;z-index:64;display:flex;justify-content:space-between;align-items:baseline;gap:12px;color:${surTxt(bg)}"><span class="mp-lbl">${fr(n)}</span><span class="mp-txt" style="font-size:12px;opacity:.75;text-align:right">${fr(t)}</span></div>`,
    bg === F ? 'mp-t-fluo' : 'mp-t-noir', 'box-shadow:none')).join('')}`);

/* =====================================================================================================
   03 · Les couleurs
   ===================================================================================================== */
const ROLE = { noir: 'Le fond.', fluo: 'La couleur de Custom.', blanc: 'Texte sur noir, cartes claires.', graphite: 'Cartes sur le noir.', fonte: 'Filets pleins, pictos éteints.',
  acier: 'Texte secondaire, pixels au repos.', violet: 'Couleur d’atelier.', orange: 'Couleur d’atelier : le ballon, une sangle.', encre: 'Texte sur fluo et sur blanc.', craie: 'Extension : le gris clair des fonds d’écrans.' };
const sw = (k, x, y, w, h, grand) => { const bg = C[k], fg = surTxt(bg);
  return tuile(x, y, w, h, `<div style="position:absolute;left:${grand ? 20 : 14}px;right:${grand ? 20 : 12}px;bottom:${grand ? 18 : 13}px;color:${fg}">
    <div class="mp-nom" style="font-size:${grand ? 44 : 25}px">${fr(A.NOMS[k])}</div>
    <div class="mp-cote" style="margin-top:${grand ? 10 : 7}px;font-size:${grand ? 12 : 10}px">${bg}</div><div class="mp-cote" style="opacity:.7;font-size:${grand ? 11 : 9.5}px">RGB ${rgb(bg)}</div>
    <p class="mp-txt" style="margin-top:${grand ? 10 : 7}px;font-size:${grand ? 13 : 11.5}px;line-height:1.35;opacity:.85">${fr(ROLE[k])}</p></div>`,
    k === 'noir' ? 'mp-t-noir' : '', `background:${bg};border-radius:14px`); };
P.palette = page('palette', 'noir', `
  ${tete('palette', ti('Noir, ', 'fluo', ', blanc', 64), '', 56, 76, 640)}
  ${box(700, 100, 524, null, chapo('Les codes de la charte de 2025, inchangés. Le noir porte, le fluo signe, le blanc parle. Le violet et l’orange sont des couleurs d’atelier ; le Craie est une extension.'))}
  ${sw('noir', 56, 196, 420, 260, 1)}${sw('fluo', 490, 196, 380, 260, 1)}${sw('blanc', 884, 196, 340, 260, 1)}
  ${['graphite', 'fonte', 'acier', 'violet', 'orange', 'encre', 'craie'].map((k, i) => sw(k, 56 + i * 168.67, 470, 156.67, 202)).join('')}`);

const SEG = [['Noir atelier', 60, N0, '60'], ['Fluo', 25, F, '25'], ['Blanc', 10, W, '10'], ['Atelier', 5, V, '5']];
const carteAt = (dom, det, titre) => `<div style="position:absolute;inset:0;background:${N0}"></div>
  <div style="position:absolute;left:-30px;top:-20px;width:240px;height:150px">${A.coulure({ w: 240, h: 150, c: dom, seed: dom === V ? 8 : 3, attrs: 'style="width:100%;height:100%;display:block"' })}</div>
  <div style="position:absolute;right:16px;top:16px;width:14px;height:14px;border-radius:3px;background:${det}"></div>
  <div style="position:absolute;left:16px;bottom:44px">${A.logo(W, 'style="height:16px;width:auto"', { sym: F })}</div>
  <div class="mp-lbl" style="position:absolute;left:16px;bottom:14px;color:#fff">${titre}</div>`;
P.proportions = page('proportions', 'fluo', `
  ${box(56, 76, null, null, lbl(etiq('proportions'), 'opacity:.7'))}
  ${box(56, 100, 1000, null, ti('Une couleur ', 'd’atelier', ' à la fois', 60, 'noir'))}
  ${box(56, 168, 760, null, chapo('Sur un support : noir 60, fluo 25, blanc 10, couleurs d’atelier 5. Une seule couleur d’atelier domine, violet ou orange ; l’autre n’apparaît qu’en détail.'))}
  <div class="mp-abs" style="left:56px;top:240px;width:1168px;height:200px;display:flex;border-radius:14px;overflow:hidden;box-shadow:0 0 0 2px ${E}">${SEG.map(([n, p, c, t]) =>
    `<div style="position:relative;flex:${p};background:${c};${c === F ? `box-shadow:inset 2px 0 0 ${E},inset -2px 0 0 ${E}` : ''}">
      <div style="position:absolute;left:${p > 9 ? 18 : 12}px;bottom:${p > 9 ? 18 : 12}px">${A.pix(t, { c: c === N0 ? F : c === V ? W : E, attrs: `style="height:${p > 20 ? 96 : 46}px;width:auto"` })}</div>
      ${c === V ? `<div style="position:absolute;left:0;right:0;bottom:0;height:9px;background:${O}"></div>` : ''}</div>`).join('')}</div>
  <div class="mp-abs" style="left:56px;top:452px;width:1168px;display:flex">${SEG.map(([n, p]) => `<div style="flex:${p};position:relative"><div class="mp-lbl" style="${p < 9 ? 'position:absolute;right:0;white-space:nowrap' : ''}">${fr(n)} · ${p}</div></div>`).join('')}</div>
  ${tuile(56, 500, 268, 172, carteAt(V, O, 'Violet domine · orange en détail'))}
  ${tuile(340, 500, 268, 172, carteAt(O, V, 'Orange domine · violet en détail'))}
  ${box(656, 500, 568, null, regles(['Sur le fluo, le texte est toujours en Encre (contraste de ' + cr(E, F) + ') ; jamais de blanc sur fluo.', 'Sur le violet, texte blanc (' + cr(W, V) + '), donc en grand corps seulement.', 'Sur l’orange, texte en Encre.', 'Pas de couleur hors palette, gris compris.']))}`);

const PAIRES = [[E, F, 'Encre sur fluo', 'Le texte sur le fluo, toujours.'], [F, N0, 'Fluo sur noir', 'Titres, chiffres, surligneur.'], [W, N0, 'Blanc sur noir', 'Le texte courant sur le fond.'],
  [E, W, 'Encre sur blanc', 'Papier, cartes claires.'], [E, C.craie, 'Encre sur Craie', 'Fonds d’écrans clairs.'], [W, G, 'Blanc sur graphite', 'Cartes sur le noir.'],
  [W, V, 'Blanc sur violet', 'Règle Custom : grand corps seulement.'], [E, O, 'Encre sur orange', 'Le texte sur l’orange.'], [W, F, 'Blanc sur fluo', 'Interdit, sur tout support.']];
const verdict = (r) => (r >= 7 ? 'WCAG · AAA' : r >= 4.5 ? 'WCAG · AA' : r >= 3 ? 'WCAG · grand corps' : 'Illisible');
P.contrastes = page('contrastes', 'blanc', `
  ${tete('contrastes', ti('Des contrastes ', 'calculés', '', 64), '', 56, 76, 640)}
  ${box(700, 100, 524, null, chapo(`Rapport WCAG 2, calculé sur les codes de la charte. Encre sur fluo : ${cr(E, F)}. Blanc sur fluo : ${cr(W, F)}, il ne se lit pas.`))}
  ${PAIRES.map(([a, b, n, t], i) => { const r = A.contraste(a, b);
    return tuile(56 + (i % 3) * 396, 196 + Math.floor(i / 3) * 160, 376, 148,
      `<div style="position:absolute;left:0;top:0;bottom:0;width:148px;background:${b};${b === W ? 'box-shadow:inset -1px 0 0 var(--filet)' : ''};display:grid;place-items:center"><span style="font-size:58px;font-weight:600;letter-spacing:-.03em;color:${a}">Aa</span></div>
      <div style="position:absolute;left:166px;right:14px;top:16px"><div style="font-size:14.5px;font-weight:600;letter-spacing:-.01em">${fr(n)}</div>
        <div class="mp-cote" style="font-size:28px;margin-top:10px;letter-spacing:-.02em">${cr(a, b)}${_}:${_}1</div>
        <div class="mp-lbl" style="margin-top:8px;${r < 3 ? `color:${O}` : 'opacity:.6'}">${verdict(r)}</div>
        <p class="mp-txt" style="font-size:12px;margin-top:4px;opacity:.75">${fr(t)}</p></div>`, '', 'background:#fff;box-shadow:inset 0 0 0 1px var(--filet)'); }).join('')}`);

/* =====================================================================================================
   04 · La typographie
   ===================================================================================================== */
const POL = [
  ['01 · Large', 'Archivo étirée', 'Largeur 125 % · graisse 800 · bas de casse · 1 à 5 mots', '.t-large', `<div class="t-large" style="font-size:96px;white-space:nowrap">Transformez</div>`],
  ['02 · Titre', 'Bebas Neue', 'Capitales · toujours un mot surligné · .h-56 à .h-420', '.t-titre', `<div class="t-titre" style="font-size:82px;white-space:nowrap">On fait plus ${A.surl('qu’un maillot')}</div>`],
  ['03 · Texte', 'Inter', 'Texte courant et interface', '.t-chapo · .t-txt · .t-petit', `<div style="font-size:46px;font-weight:500;letter-spacing:-.025em;white-space:nowrap">Chaque objet, sa technique.</div>`],
  ['04 · Repère', 'JetBrains Mono', 'Capitales · cotes, codes d’atelier, métadonnées', '.t-mono', `<div style="font-family:var(--mono);font-size:30px;font-weight:500;letter-spacing:.07em;white-space:nowrap">CST${_}·${_}SER${_}·${_}DTF${_}·${_}BRO${_}·${_}FLO${_}·${_}SUB</div>`]];
P.polices = page('polices', 'noir', `
  ${tete('polices', ti('Quatre polices, ', 'une voix', '', 60), '', 56, 76, 680)}
  ${box(760, 100, 464, null, chapo('La grotesque étirée pour les grands titres, Bebas Neue pour les sections, Inter pour lire, la chasse fixe pour les repères. Les polices de 2025, sans en ajouter une.'))}
  ${POL.map(([k, n, d, c, s], i) => box(56, 196 + i * 120, 1168, 112, `<div class="mp-filet"></div>
    <div style="position:absolute;left:0;top:14px;width:250px">${lbl(k, '', 'mp-doux')}<div style="font-size:19px;font-weight:600;letter-spacing:-.015em;margin-top:6px">${n}</div><p class="mp-txt" style="font-size:12px;opacity:.68;margin-top:4px">${fr(d)}</p><div class="mp-cote" style="margin-top:6px;color:${F};font-size:10px">${c}</div></div>
    <div style="position:absolute;left:280px;right:0;top:14px;bottom:0;display:flex;align-items:center;overflow:hidden">${s}</div>`)).join('')}`);

const etat = (w, final, mot = 'bloc') => `<span style="position:relative;display:inline-block;font-family:var(--titre);text-transform:uppercase;font-size:40px;line-height:.92;padding:.03em .13em 0">
  <i style="position:absolute;left:0;top:0;bottom:0;width:${w}%;background:${F};border-radius:.07em;transform:rotate(-1.6deg);transform-origin:0 50%"></i><span style="position:relative;color:${final ? E : W}">${mot}</span></span>`;
P.surligneur = page('surligneur', 'fluo', `
  ${box(56, 76, null, null, lbl(etiq('surligneur'), 'opacity:.7'))}
  ${box(56, 100, 680, null, ti('Un mot, ', 'un bloc', '', 64, 'noir'))}
  ${box(56, 172, 660, null, chapo('Le surligneur prend un mot ou un groupe dans un bloc de couleur, tourné de −1,6°. Un seul par titre, sur une seule ligne. C’est la signature des titres de Custom.'))}
  ${tuile(56, 264, 684, 232, `<div class="t-titre" style="position:absolute;left:36px;top:40px;font-size:80px;color:#fff">Chaque objet,<br>sa ${A.surl('technique')}</div>
    <div class="mp-cote" style="position:absolute;right:28px;top:22px;color:${F}">−1,6°</div>`, 'mp-t-noir', 'box-shadow:none')}
  ${tuile(756, 76, 468, 420, [['', 'Par défaut', '−1,6°'], ['monte', 'Il monte', '+1,4°'], ['droit', 'Droit', '0°']].map(([c, n, a], i) =>
    `<div style="position:absolute;left:30px;right:30px;top:${34 + i * 128}px;${i ? 'border-top:1px solid rgba(255,255,255,.13);padding-top:22px' : ''}">
      <div class="t-titre" style="font-size:44px;color:#fff">Donnez vie ${A.surl('à vos idées', c)}</div>
      <div class="mp-cote" style="margin-top:12px;color:#fff;opacity:.7">.surl${c ? '.' + c : ''} · ${a} · ${n.toLowerCase()}</div></div>`).join(''), 'mp-t-noir', 'box-shadow:none')}
  ${[['fluo', '', 'Fluo · par défaut'], ['violet', 'violet', 'Violet'], ['orange', 'orange', 'Orange'], ['blanc', 'blanc', 'Blanc'], ['noir', 'noir', 'Noir · sur le fluo']].map(([m, c, n], i) =>
    tuile(56 + i * 139, 516, 128, 84, centre(`<span class="t-titre" style="font-size:30px">${A.surl(m, c)}</span>`), c === 'noir' ? 'mp-t-filet' : 'mp-t-noir', 'box-shadow:' + (c === 'noir' ? `inset 0 0 0 1.5px ${E}` : 'none')) +
    box(56 + i * 139, 610, 128, null, lbl(n, 'font-size:9.5px'))).join('')}
  ${box(756, 516, 468, null, regles(['Un seul surligneur par titre, sur une seule ligne.', 'Fluo par défaut ; violet, orange, blanc ou noir en variation.', 'Il se pose de gauche à droite en 0,25 s, puis le texte passe en Encre.', 'En texte courant : le même geste, sans rotation.']))}`);

const H_NIV = [['Repère', 'JetBrains Mono 500 · 10,5 px · capitales · .t-mono'], ['Large', 'Archivo 125 % · 800 · interligne 0,9 · .t-large'], ['Titre', 'Bebas Neue · capitales · un mot surligné · .t-titre'],
  ['Chapeau', 'Inter 500 · 22 px · interligne 1,32 · .t-chapo'], ['Texte', 'Inter 400 · 15 px · interligne 1,45 · .t-txt'], ['Bouton', 'Inter 600 · 15 px · fond fluo, texte Encre · .bouton']];
const bd = (n, html, st = '') => `<div style="position:relative;${st}"><span class="mp-badge" style="position:absolute;left:-42px;top:0">${n}</span>${html}</div>`;
P.hierarchie = page('hierarchie', 'noir', `
  ${tete('hierarchie', ti('Une hiérarchie<br>', 'montée', '', 64), 'Les quatre voix dans l’ordre : le repère situe, le grand titre accroche, le titre de section nomme, le texte explique.', 56, 76, 400)}
  ${box(56, 330, 410, null, H_NIV.map(([n, d], i) => `<div style="display:grid;grid-template-columns:34px 1fr;align-items:start;padding:9px 0 10px;border-top:1px solid var(--filet)"><span class="mp-badge">${pad(i + 1)}</span><div><div style="font-size:14px;font-weight:600">${n}</div><div class="mp-cote" style="font-size:10px;opacity:.6;margin-top:3px;white-space:normal">${fr(d)}</div></div></div>`).join(''))}
  ${tuile(500, 84, 724, 588, `    <div style="position:absolute;left:64px;right:36px;top:40px">
      ${bd('01', `<div class="t-mono" style="padding-top:5px">02${_}·${_}Textile${_}·${_}Atelier de personnalisation</div>`)}
      ${bd('02', `<div class="t-large" style="font-size:66px">Habillez vos<br>équipes</div>`, 'margin-top:22px')}
      ${bd('03', `<div class="t-titre" style="font-size:50px">On fait plus ${A.surl('qu’un maillot')}</div>`, 'margin-top:40px')}
      ${bd('04', `<div class="t-chapo" style="max-width:560px">${fr('Du tee-shirt au vêtement technique, chaque pièce est marquée dans notre atelier.')}</div>`, 'margin-top:30px')}
      ${bd('05', `<div class="t-txt" style="opacity:.75;padding-top:2px">${D.univers[0].produits.join(' · ')}</div>`, 'margin-top:22px')}
      ${bd('06', `<div class="bouton">Demander mon devis gratuit ${A.fleche(E)}</div>`, 'margin-top:28px')}</div>
    <div style="position:absolute;left:36px;right:36px;bottom:24px;display:flex;justify-content:space-between;align-items:center">${A.code('CST', 'BRO', '2026')}<div style="width:120px">${A.barre({ style: 'height:5px' })}</div></div>`)}`);

/* =====================================================================================================
   05 · Le bloc
   ===================================================================================================== */
const PIC = A.PICTOS.textile, CELL = 44, PX0 = 790, PY0 = 112;
const grilleTraits = (() => { let d = ''; for (let i = 0; i <= 9; i++) d += `M${i * CELL} 0V${9 * CELL}M0 ${i * CELL}H${9 * CELL}`; return d; })();
const marq = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="none" stroke="${O}" stroke-width="2"/>`;
P.coin = page('coin', 'craie', `
  ${tete('coin', ti('Le pixel ', 'arrondi', '', 64), 'Les sprites, les chiffres et les pictos sont faits d’un seul élément : le bloc. On le pose sur une grille, cellule par cellule, comme un point de broderie.', 56, 76, 440)}
  ${[[['#'], 56, 'Seul', '4 coins arrondis'], [['##'], 44, 'Côte à côte', 'Ils fusionnent'], [['##', '#.'], 44, 'En angle', 'Coin rentrant net']].map(([r, c, n, t], i) =>
    tuile(56 + i * 148, 318, 136, 168, `${centre(A.grille(r, { c: E, cell: c, attrs: `style="width:${r[0].length * c}px;height:auto"` }), 'padding-bottom:40px')}<div style="position:absolute;left:12px;bottom:11px"><div class="mp-lbl">${n}</div><div class="mp-txt" style="font-size:11.5px;opacity:.7">${t}</div></div>`, '', 'background:#fff')).join('')}
  ${box(56, 508, 440, null, regles(['<b>Rayon de coin</b> : 30 % de la cellule.', 'Un coin n’est arrondi que s’il est libre : les blocs voisins fusionnent.', 'Un sprite s’anime à 8 images par seconde, sans fondu.']))}
  <svg class="mp-abs" style="left:${PX0}px;top:${PY0}px;overflow:visible" width="${9 * CELL}" height="${9 * CELL}">
    <path d="${grilleTraits}" stroke="${E}" stroke-opacity=".16" stroke-width="1"/>
    <path d="${A.grillePath(PIC, { cell: CELL })}" fill="${E}"/>
    ${marq(CELL, 0)}${marq(CELL * 4, CELL * 2)}<rect x="${CELL * 1.5}" y="-7" width="${CELL}" height="14" fill="none" stroke="${O}" stroke-width="2" rx="3"/></svg>
  ${box(520, 92, 250, null, `<div class="mp-lbl" style="color:${O}">Coin libre</div>${txt('Rayon : 30 % de la cellule, soit 13 px ici.', 'font-size:12.5px;margin-top:4px')}`)}
  ${box(520, 196, 250, null, `<div class="mp-lbl" style="color:${O}">Voisins</div>${txt('Deux blocs côte à côte n’en font qu’un : le bord reste droit.', 'font-size:12.5px;margin-top:4px')}`)}
  ${box(520, 300, 250, null, `<div class="mp-lbl" style="color:${O}">Angle rentrant</div>${txt('Un coin pris entre deux blocs reste net.', 'font-size:12.5px;margin-top:4px')}`)}
  <svg class="mp-abs" style="left:0;top:0;overflow:visible" width="1280" height="720"><path d="M770 104H${PX0 + CELL - 12}M770 208H${PX0 + CELL * 1.5 - 4}L${PX0 + CELL * 1.5 - 4} ${PY0 + 8}M770 312H${PX0 + CELL * 4 - 12}L${PX0 + CELL * 4 - 12} ${PY0 + CELL * 2}" fill="none" stroke="${O}" stroke-width="1.2"/></svg>
  ${box(PX0, PY0 + 9 * CELL + 16, 9 * CELL, null, `<div style="display:flex;justify-content:space-between"><span class="mp-lbl">Picto Textile · 9 × 9 blocs</span><span class="mp-lbl mp-doux">1 cellule = 1 bloc</span></div>`)}`);

const CHIF = [['+500', 'Projets réalisés'], ['7-10j', 'Jours de délai moyen'], ['100%', 'Dans nos ateliers'], ['24h', 'Devis sous 24 h'], ['<5s', 'Pour identifier son univers']];
P.sprites = page('sprites', 'noir', `
  ${tete('sprites', ti('Sprites, chiffres, ', 'pictos', '', 60), '', 56, 76, 700)}
  ${box(760, 100, 464, null, chapo('Trois familles faites du même bloc. Les sprites tournent à 8 images par seconde, en crans, sans fondu ni interpolation.'))}
  ${box(56, 190, 580, null, `${lbl('Moto · 5 images', '', 'mp-doux')}<div style="display:flex;gap:22px;align-items:flex-end;margin-top:10px">${[1, 2, 3, 4, 5].map((i) => A.sprite('moto', i, { c: F, attrs: 'style="height:58px;width:auto"' })).join('')}</div>
    ${lbl('Course · 4 images', 'margin-top:22px', 'mp-doux')}<div style="display:flex;gap:26px;align-items:flex-end;margin-top:10px">${[1, 2, 3, 4].map((i) => A.sprite('course', i, { c: F, attrs: 'style="height:58px;width:auto"' })).join('')}</div>`)}
  ${box(660, 190, 564, null, `${lbl('Dunk · 8 images · le ballon en orange', '', 'mp-doux')}<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:10px">${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => A.dunk(i, { c: W, attrs: 'style="height:150px;width:auto"' })).join('')}</div>`)}
  ${box(56, 392, 1168, null, `<div class="mp-filet"></div>${lbl('Chiffres en blocs · ceux du site, et seulement ceux-là', 'margin-top:12px', 'mp-doux')}
    <div style="display:grid;grid-template-columns:repeat(5,1fr);margin-top:16px">${CHIF.map(([t, n]) => `<div>${A.pix(t, { c: F, attrs: 'style="height:46px;width:auto"' })}<div class="mp-txt" style="font-size:12.5px;margin-top:10px;opacity:.8">${fr(n)}</div></div>`).join('')}</div>`)}
  ${D.univers.map((u, i) => tuile(56 + i * 296, 568, 280, 104, `<div style="position:absolute;left:18px;top:20px">${A.picto(u.cle, { c: F, attrs: 'style="height:62px;width:auto"' })}</div>
    <div style="position:absolute;left:104px;top:22px"><div class="mp-nom" style="font-size:32px">${u.nom}</div><div class="mp-lbl mp-doux" style="margin-top:6px">Picto 9 × 9 · extension</div></div>`)).join('')}`);

/* =====================================================================================================
   06 · Matières et repères
   ===================================================================================================== */
const capT = (n, t) => `<div style="position:absolute;left:0;right:0;bottom:0;z-index:62;padding:10px 14px 11px;background:rgba(16,16,18,.88);color:#fff"><div class="mp-lbl">${n}</div><div class="mp-txt" style="font-size:11.5px;opacity:.75;margin-top:2px">${fr(t)}</div></div>`;
P.matieres = page('matieres', 'noir', `
  ${tete('matieres', ti('Encre, fil, ', 'trame', '', 64), '', 56, 76, 600)}
  ${box(680, 100, 544, null, chapo('Les fonds de Custom ne sont jamais plats : de l’encre balayée, des points de fil, des blocs en quinconce. La matière dit l’atelier avant le texte.'))}
  <div class="mp-abs" data-coupe style="left:-40px;top:194px;width:1360px;height:220px">${A.coulure({ w: 1360, h: 220, c: 'orange', seed: 11, cx: .4, rx: .48, ry: .47, attrs: 'style="width:100%;height:100%;display:block"' })}</div>
  ${box(96, 230, 560, null, `<div class="t-titre" style="font-size:118px;color:${E}">La coulure</div>${txt('Orange, violet ou fluo. Une ou deux par planche, jamais en dégradé. Elle déborde volontiers du cadre et sert aussi de masque.', `color:${E};font-weight:500;margin-top:8px;max-width:440px`)}`, 'z-index:5')}
  ${tuile(56, 436, 330, 236, `<div style="position:absolute;inset:0">${A.piquage({ w: 660, h: 472, c: F, seed: 3, attrs: 'style="width:100%;height:100%;display:block"' })}</div>${capT('Le piquage', 'Des points de fil qui suivent une courbe. Fluo sur noir ou sur blanc.')}`, 'mp-t-noir')}
  ${tuile(398, 436, 250, 236, `<div style="position:absolute;inset:0;background:${F}">${A.motif({ w: 500, h: 472, c: E, l: 46, seed: 4, attrs: 'style="width:100%;height:100%;display:block"' })}</div>${capT('Le motif de blocs', 'Rangs de blocs inclinés en quinconce.')}`)}
  ${tuile(660, 436, 180, 236, `<div class="tx-trame" style="position:absolute;inset:0;color:${F}"></div>${capT('Trame', 'Points de sérigraphie.')}`, 'mp-t-noir')}
  ${tuile(852, 436, 180, 236, `<div class="tx-hachures" style="position:absolute;inset:0;color:${F};--th:9px"></div>${capT('Hachures', 'À la pente du Cran, 13,3°.')}`, 'mp-t-noir')}
  ${tuile(1044, 436, 180, 236, `<div class="tx-toile grain" style="position:absolute;inset:0"></div>${capT('Toile et grain', 'Le tissage sombre des fonds.')}`, 'mp-t-noir')}`);

const ANN = [['01', 'Croix de repérage', 'Aux quatre angles, hors du visuel.', 96], ['02', 'Mire ronde', 'Au milieu des marges.', 270], ['03', 'Barre de contrôle', 'La gamme de la marque, comme en marge d’un tirage d’imprimeur.', 470], ['04', 'Code d’atelier', 'Marque, technique, année, en chasse fixe.', 572]];
P.reperes = page('reperes', 'blanc', `
  ${tete('reperes', ti('Les marges de<br>', 'l’atelier', '', 64), 'Custom emprunte ses repères à la feuille d’imprimeur. Ils signent chaque support comme une pièce sortie de l’atelier ; ce guide les porte à chaque page.', 56, 76, 380)}
  ${box(56, 352, 380, null, `<div class="mp-filet"></div>${lbl('Codes des techniques', 'margin-top:12px')}
    <div style="margin-top:12px;display:grid;gap:8px">${D.techniques.map((t) => `<div style="display:flex;align-items:center;gap:12px"><span class="mp-code">${t.code}</span><span style="font-size:14px;font-weight:500">${t.nom}</span></div>`).join('')}</div>
    <div style="margin-top:16px">${A.code('CST', 'SER', '2026')}</div>${txt('Marque · technique · année.', 'font-size:12px;opacity:.65;margin-top:2px')}`)}
  ${ANN.map(([n, t, d, y]) => box(476, y, 330, null, `<div style="display:flex;gap:10px;align-items:center"><span class="mp-badge">${n}</span><span class="t-titre" style="font-size:28px">${t}</span></div>${txt(d, 'font-size:12.5px;margin-top:6px;padding-left:32px;max-width:300px')}`)).join('')}
  <div class="cadre-r mp-abs" style="left:880px;top:96px;width:300px;height:412px;color:${E}">${A.reperes({ t: 22 })}</div>
  <div class="mp-abs" style="left:900px;top:116px;width:260px;height:372px;background:${N0};overflow:hidden;color:#fff">
    <div style="position:absolute;right:-40px;top:-20px;width:220px;height:180px">${A.coulure({ w: 220, h: 180, c: 'orange', seed: 9, attrs: 'style="width:100%;height:100%;display:block"' })}</div>
    <div style="position:absolute;left:18px;top:18px">${A.logo(W, 'style="height:14px;width:auto"', { sym: F })}</div>
    <div style="position:absolute;left:176px;top:168px">${A.dunk(6, { c: W, attrs: 'style="height:104px;width:auto"' })}</div>
    <div class="t-titre" style="position:absolute;left:18px;bottom:44px;font-size:38px">Donnez vie<br>${A.surl('à vos idées')}</div>
    <div class="t-mono" style="position:absolute;left:18px;right:18px;bottom:16px;display:flex;justify-content:space-between;font-size:8.5px"><span>custom.fr</span><span>SER${_}·${_}2026</span></div></div>
  ${A.mire(24, `position:absolute;left:846px;top:290px;color:${E}`)}${A.mire(24, `position:absolute;left:1190px;top:290px;color:${E}`)}
  ${box(900, 526, 260, null, A.barre({ style: 'height:12px' }))}
  ${box(900, 548, 260, null, `<div style="display:flex;justify-content:space-between">${A.code('CST', 'SER', '2026')}<span class="t-mono">01${_}/${_}03</span></div>`)}
  <svg class="mp-abs" style="left:0;top:0;overflow:visible" width="1280" height="720"><g fill="none" stroke="${E}" stroke-opacity=".45" stroke-width="1">
    <path d="M760 110H868"/><path d="M700 284H842"/><path d="M780 484L896 528"/><path d="M700 586L896 560"/></g></svg>`);

/* =====================================================================================================
   07 · La photo
   ===================================================================================================== */
const photoC = (nom, x, y, w, h, tag) => `<div class="mp-cadre" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${ph(nom, { mode: 'brut' })}
  ${tag ? `<span class="mp-code" style="position:absolute;left:12px;top:12px;z-index:62">${tag}</span>` : ''}
  <div class="mp-leg" style="position:absolute;left:0;right:0;bottom:0;z-index:62;padding:22px 12px 10px;color:#fff;background:linear-gradient(transparent,rgba(16,16,18,.85))">${fr(A.PHOTOS[nom].sujet)}</div></div>`;
P.sujets = page('sujets', 'noir', `
  ${tete('sujets', ti('Le sport,<br>', 'le geste', '', 64), 'Deux sujets, pas un de plus. Le sport en mouvement : le filé, le saut, la poussière. Le geste d’atelier : la macro, la matière, la machine.', 56, 76, 330)}
  ${box(56, 470, 330, null, regles(['<b>Sport</b> : le mouvement, jamais la pose.', '<b>Atelier</b> : la main, la machine, la matière, de très près.', 'Photos de marque générées pour ce projet, sans droit de tiers. Aucune marque d’équipementier.']))}
  ${photoC('dunk', 420, 84, 400, 288, 'Sport en mouvement')}${photoC('trail', 836, 84, 186, 288)}${photoC('moto', 1038, 84, 186, 288)}
  ${photoC('broderie', 420, 388, 400, 284, 'Geste d’atelier')}${photoC('serigraphie', 836, 388, 186, 284)}${photoC('fils', 1038, 388, 186, 284)}`);

const TRT = [['brut', {}, '01', 'Brut', 'Pour raconter.'], ['sombre', {}, '02', 'Sombre', 'Sous un logo.'], ['nb', {}, '03', 'Noir et blanc', 'L’éditorial.'], ['duo', { c: 'fluo' }, '04', 'Duo', 'Noir et une couleur.'],
  ['points', { c: 'fluo', tp: 7 }, '05', 'Tramé · points', 'Comme une sérigraphie.'], ['lignes', { c: 'orange', tp: 6 }, '05', 'Tramé · lignes', 'Le balayage de la coulure.'], ['seuil', { c: 'blanc' }, '06', 'Seuil', 'Le pochoir, sans gris.']];
P.traitements = page('traitements', 'noir', `
  ${tete('traitements', ti('Une photo, ', 'six traitements', '', 60), '', 56, 76, 680)}
  ${box(760, 100, 464, null, chapo('La même photo, six façons de la tenir. Couleur du traitement : fluo, violet, orange ou blanc. Le traitement change, le sujet reste.'))}
  ${TRT.map(([m, o, n, t, d], i) => `<div class="mp-cadre" style="left:${56 + i * 168}px;top:196px;width:160px;height:380px;border-radius:10px">${ph('moto', Object.assign({ mode: m, pos: '46% 55%' }, o))}</div>` +
    box(56 + i * 168, 590, 160, null, `<div class="mp-cote" style="opacity:.55;font-size:10px">${n}</div><div class="t-titre" style="font-size:24px;margin-top:4px">${t}</div>${txt(d, 'font-size:12px;opacity:.72;margin-top:4px')}`)).join('')}`);

const mPix = (t) => masque(A.dataSVG(A.pix(t, { c: '#000' })), 'contain');
const mSprite = masque(A.dataSVG(A.sprite('course', 2, { c: '#000' })), 'contain');
const mCoul = masque(A.coulureURL({ w: 600, h: 440, seed: 7 }));
const cell = (x, y, inner, n, t) => box(x, y, 254, 288, `<div style="position:absolute;left:0;right:0;top:0;height:220px;display:grid;place-items:center">${inner}</div><div style="position:absolute;left:0;bottom:0"><div class="mp-lbl">${n}</div>${txt(t, 'font-size:12px;opacity:.7;margin-top:2px')}</div>`);
P.masques = page('masques', 'craie', `
  ${tete('masques', ti('La photo prend<br>', 'la forme', '', 64), 'Une photo se glisse dans le Cran, dans un bloc, dans une coulure, dans un sprite ou dans un chiffre. Le masque vient toujours de la marque.', 56, 76, 560)}
  <div class="dans-cran mp-abs" style="left:56px;top:300px;width:580px">${ph('dunk', { mode: 'brut' })}</div>
  ${box(56, 644, 580, null, `<div style="display:flex;justify-content:space-between"><span class="mp-lbl">Dans le Cran · .dans-cran</span><span class="mp-lbl mp-doux">Le symbole devient fenêtre</span></div>`)}
  ${cell(690, 84, `<div class="dans-bloc" style="position:relative;width:240px">${ph('trail', { mode: 'brut' })}</div>`, 'Dans un bloc · .dans-bloc', 'Une vignette, un bouton d’image.')}
  ${cell(970, 84, `<div style="position:relative;width:250px;height:190px;${mCoul}">${ph('peloton', { mode: 'duo', c: 'violet' })}</div>`, 'Dans une coulure', 'Marque.coulureURL comme masque.')}
  ${cell(690, 384, `<div style="position:relative;width:240px;height:228px;${mSprite}">${ph('equipe', { mode: 'brut' })}</div>`, 'Dans un sprite', 'Le coureur en blocs, rempli d’image.')}
  ${cell(970, 384, `<div style="position:relative;width:250px;height:110px;${mPix('24h')}">${ph('serigraphie', { mode: 'brut' })}</div>`, 'Dans un chiffre', 'Les chiffres en blocs du site.')}`);

/* =====================================================================================================
   08 · Les cinq techniques (canvas de brand/techniques.js, rendus par GuideApres)
   ===================================================================================================== */
P.techniques = page('techniques', 'noir', `
  ${tete('techniques', ti('Chaque objet, sa ', 'technique', '', 60), '', 56, 76, 700)}
  ${box(760, 100, 464, null, chapo('Le même Cran, marqué cinq fois, sous la même lumière rasante. Seule la matière change : c’est l’argument de Custom, montré.'))}
  ${D.techniques.map((t, i) => box(56 + i * 237, 192, 220, null, `<div style="border-radius:10px;overflow:hidden">${canvas({ tech: t.cle, forme: 'cran', c: F, fond: 'maille', cf: N0, p: 1 }, 220, 165)}</div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:14px"><span class="mp-code">${t.code}</span><span class="t-titre" style="font-size:30px">${t.nom}</span></div>${txt(t.pour, 'font-size:12.5px;opacity:.75;margin-top:8px')}`)).join('')}
  ${tuile(56, 474, 400, 198, `<div style="position:absolute;left:24px;top:22px;right:24px"><div class="t-titre" style="font-size:40px">Un seul ${A.surl('atelier')}</div>
    ${txt('Les concurrents sous-traitent ; Custom fabrique. Sérigraphie, DTF, broderie, flocage, sublimation : les cinq techniques sont opérées en interne.', 'font-size:13px;opacity:.8;margin-top:16px')}
    <div style="display:flex;align-items:flex-end;gap:12px;margin-top:16px">${A.pix('100%', { c: F, attrs: 'style="height:24px;width:auto"' })}<span class="mp-lbl mp-doux">dans nos ateliers</span></div></div>`)}
  <div class="mp-cadre" style="left:472px;top:474px;width:752px;height:198px">${canvas({ tech: 'serigraphie', forme: 'logo', c: F, c2: V, fond: 'coton', cf: N0, p: 1 }, 752, 198)}
    <span class="mp-lbl" style="position:absolute;left:14px;bottom:12px;z-index:62;color:#fff;opacity:.8">Le logo complet · sérigraphie fluo et violet · coton noir</span></div>`);

const TIS = [['maille', N0, 'Maille sport', 'Maillots, chasubles'], ['serge', F, 'Sergé', 'Vestes, casquettes'], ['coton', W, 'Coton jersey', 'Tee-shirts, polos'], ['molleton', V, 'Molleton', 'Sweats']];
P.tissus = page('tissus', 'noir', `
  ${tete('tissus', ti('Quatre tissus, ', 'une lumière', '', 60), '', 56, 76, 700)}
  ${box(760, 100, 464, null, chapo('Les tissus sont rendus fil à fil, sous la même lumière que les marquages. Chaque tissu a ses pièces ; la broderie se montre aussi en cours de couture.'))}
  ${TIS.map(([t, c, n, u], i) => box(56 + i * 296, 192, 280, null, `<div style="border-radius:10px;overflow:hidden">${canvas({ tissu: t, c }, 280, 190)}</div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:12px"><span class="t-titre" style="font-size:28px">${n}</span><span class="mp-lbl mp-doux">${fr(u)}</span></div>`)).join('')}
  ${box(56, 450, 1168, null, `<div class="mp-filet"></div>${lbl('La broderie en cours de couture · de 0 à 1, le fil couvre le Cran', 'margin-top:12px', 'mp-doux')}`)}
  ${[.25, .5, .75, 1].map((p, i) => box(56 + i * 296, 494, 280, null, `<div style="border-radius:10px;overflow:hidden">${canvas({ tech: 'broderie', forme: 'cran', c: F, fond: 'maille', cf: N0, p }, 280, 150)}</div><div class="mp-cote" style="margin-top:10px">p${_}=${_}${String(p).replace('.', ',')}</div>`)).join('')}`);

/* =====================================================================================================
   09 · Le mouvement
   ===================================================================================================== */
const easeSvg = (() => { let c = ''; for (let i = 0; i <= 40; i++) { const x = i / 40; c += `${i ? 'L' : 'M'}${(300 + x * 220).toFixed(1)} ${(140 - A.ease(x) * 120).toFixed(1)}`; }
  /* l'élément monte le long de la pente du Cran ; une silhouette tous les 1/6 du temps : les écarts se resserrent, puis il s'arrête net */
  let gh = ''; for (let i = 0; i <= 6; i++) { const p = A.ease(i / 6), yb = 146 - p * 118, xb = 30 + (146 - yb) * A.CONSTRUCTION.tan;
    gh += i === 6 ? `<path d="${A.blocPath(xb, yb - 16, 70, 16, 3)}" fill="${E}"/>` : `<path d="${A.blocPath(xb, yb - 16, 70, 16, 3)}" fill="none" stroke="${E}" stroke-opacity="${.25 + i * .1}" stroke-width="1"/>`; }
  return `<svg viewBox="0 0 532 160" width="532" height="160" style="display:block;overflow:visible">
    <path d="M26 152L${26 + 140 * A.CONSTRUCTION.tan} 12" stroke="${E}" stroke-width="1" stroke-dasharray="3 3"/>${gh}
    <text x="130" y="150" font-family="JetBrains Mono" font-weight="500" font-size="10" fill="${E}">pente 13,3°</text>
    <text x="150" y="26" font-family="JetBrains Mono" font-weight="500" font-size="10" fill="${E}">arrêt net</text>
    <path d="M300 20V140H520" fill="none" stroke="${E}" stroke-opacity=".5" stroke-width="1"/><path d="${c}" fill="none" stroke="${E}" stroke-width="2.4"/>
    <text x="300" y="156" font-family="JetBrains Mono" font-weight="500" font-size="10" fill="${E}">0</text><text x="520" y="156" text-anchor="end" font-family="JetBrains Mono" font-weight="500" font-size="10" fill="${E}">0,5 s</text>
    <text x="516" y="128" text-anchor="end" font-family="JetBrains Mono" font-weight="500" font-size="10" fill="${E}">quart sortant</text></svg>`; })();
const pasSvg = (() => { let d = 'M0 120'; for (let i = 0; i < 8; i++) d += `H${(i + 1) * 64}V${120 - (i + 1) * 13}`;
  return `<svg viewBox="0 0 532 130" width="532" height="44" style="display:block;overflow:visible"><path d="${d}" fill="none" stroke="${E}" stroke-width="2"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<path d="M${i * 64} 124V130" stroke="${E}" stroke-width="1"/>`).join('')}</svg>`; })();
const LETT = ['C', 'u', 's', 't', 'o', 'm', '.', 'f', 'r'];
const cranSvgT = (() => { const s = 300 / 1.5, x0 = 70; const bar = (y, t0, d, lab, op = 1) => `<rect x="${x0 + t0 * s}" y="${y}" width="${d * s}" height="12" rx="3" fill="${E}" fill-opacity="${op}"/><text x="0" y="${y + 10}" font-family="JetBrains Mono" font-weight="500" font-size="10" fill="${E}">${lab}</text>`;
  return `<svg viewBox="0 0 532 150" width="532" height="150" style="display:block;overflow:visible">
    ${bar(4, 0, .5, 'bloc 1')}${bar(24, .12, .5, 'bloc 2')}
    ${LETT.map((l, i) => `<rect x="${x0 + (.62 + i * .04) * s}" y="${46 + i * 7}" width="${.5 * s}" height="5" rx="1.5" fill="${E}" fill-opacity=".55"/>`).join('')}<text x="0" y="78" font-family="JetBrains Mono" font-weight="500" font-size="10" fill="${E}">lettres</text>
    <path d="M${x0} 118H${x0 + 1.5 * s}" stroke="${E}" stroke-width="1"/>${[0, .12, .5].map((t) => `<path d="M${x0 + t * s} 114V122" stroke="${E}" stroke-width="1"/>`).join('')}
    <text x="${x0 + .12 * s}" y="136" text-anchor="start" font-family="JetBrains Mono" font-weight="500" font-size="10" fill="${E}">0,12 s</text><text x="${x0 + .5 * s}" y="136" text-anchor="middle" font-family="JetBrains Mono" font-weight="500" font-size="10" fill="${E}">0,5 s</text>
    <text x="${x0 + .62 * s}" y="20" font-family="JetBrains Mono" font-weight="500" font-size="10" fill="${E}">0,04 s entre deux lettres</text></svg>`; })();
const panneau = (x, y, titre, sous, inner, noir) => tuile(x, y, 568, 228, `<div style="position:absolute;left:18px;top:16px;right:18px;display:flex;justify-content:space-between;align-items:baseline"><span class="t-titre" style="font-size:30px">${titre}</span><span class="mp-lbl" style="opacity:.7">${fr(sous)}</span></div>
  <div style="position:absolute;left:18px;right:18px;bottom:16px">${inner}</div>`, noir ? 'mp-t-noir' : 'mp-t-filet', noir ? 'box-shadow:none;color:#fff' : `color:${E}`);
P.mouvement = page('mouvement', 'fluo', `
  ${box(56, 76, null, null, lbl(etiq('mouvement'), 'opacity:.7'))}
  ${box(56, 100, 640, null, ti('Tout avance ', 'd’un pas', '', 64, 'noir'))}
  ${box(700, 100, 524, null, chapo('Un élément entre en glissant le long de la pente du Cran et s’arrête net. Pas de rebond, pas de fondu long, pas de flou de mouvement ajouté.'))}
  ${panneau(56, 196, 'Entrée', '0,5 s · quart sortant', easeSvg)}
  ${panneau(656, 196, 'Le surligneur', '0,25 s · de gauche à droite', `<div style="display:flex;justify-content:space-between;align-items:center">${[0, 35, 70, 100].map((w) => etat(w, false)).join('')}${etat(100, true)}</div>
    <div style="display:flex;justify-content:space-between;margin-top:16px" class="mp-cote"><span>0 s</span><span style="opacity:.6">le bloc se pose</span><span>0,25 s</span><span style="color:${F}">puis Encre</span></div>
    <p class="mp-txt" style="margin-top:18px;opacity:.75;font-size:12.5px">${fr('Le texte reste blanc pendant que le bloc se pose, puis passe en Encre.')}</p>`, true)}
  ${panneau(56, 440, 'Les sprites', '8 images par seconde · en crans', `<div style="display:flex;justify-content:space-between;align-items:flex-end;padding:0 18px 0 8px">${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => A.dunk(i, { c: E, c2: O, attrs: 'style="height:64px;width:auto"' })).join('')}</div>
    <div style="margin-top:8px">${pasSvg}</div><div class="mp-cote" style="display:flex;justify-content:space-between;margin-top:4px"><span>0</span><span>1 s · 8 images, sans interpolation</span></div>`)}
  ${panneau(656, 440, 'Le Cran', '0,12 s d’écart · lettre par lettre', cranSvgT)}`);

/* =====================================================================================================
   10 · En situation
   ===================================================================================================== */
const M_ = A.mobile || {}, S_ = A.site || {};
P.site = page('site', 'noir', `
  ${tete('site', ti('Quatre univers,<br>', 'un atelier', '', 60), 'KLYRA a refait le site en 2025, en quatre semaines. Il sépare les quatre univers, met la page Atelier au centre et mène vers une demande de devis qualifiée.', 56, 76, 340)}
  ${box(56, 432, 340, null, regles(['Menu : Textile, Print, Goodies, Signalétique, L’atelier.', 'Le devis se qualifie : univers, technique, volume, échéance.', 'Devis sous 24 h, sans engagement.', 'Les écrans parlent la langue du système : surligneur, blocs, repères.']))}
  ${media('plates', '25-accueil.png', 420, 84, 450, 588, { pos: '50% 0%', tag: 'L’accueil', repli: S_.accueil ? `<div style="position:absolute;left:0;top:0">${A.browser(S_.accueil(), 450 / 1440, { h: 1880 })}</div>` : '' })}
  ${media('plates', '27-pages-univers.png', 886, 84, 338, 260, { pos: '50% 40%', tag: 'Les pages d’univers', repli: S_.univers ? `<div style="position:absolute;left:0;top:0">${A.browser(S_.univers('textile'), 338 / 1440, { h: 1060 })}</div>` : '' })}
  ${tuile(886, 360, 338, 312, `<div style="position:absolute;left:22px;right:22px;top:24px">${A.pix('800', { c: F, attrs: 'style="height:50px;width:auto"' })}${txt('vues de la page Atelier en deux mois', 'font-size:13px;margin-top:10px;opacity:.85')}
    <div class="mp-filet" style="margin:22px 0"></div>${A.pix('<5s', { c: F, attrs: 'style="height:50px;width:auto"' })}${txt('pour identifier son univers en arrivant', 'font-size:13px;margin-top:10px;opacity:.85')}</div>`)}`);

P.textile = page('textile', 'craie', `
  ${tete('textile', ti('On fait plus<br>', 'qu’un maillot', '', 60), 'Une collection d’équipe se marque pièce par pièce. Chaque pièce reprend un élément du système, et chaque marquage a sa technique.', 56, 76, 340)}
  ${box(56, 412, 340, null, regles(D.techniques.filter((t) => t.cle !== 'dtf').map((t) => `<b>${t.nom}</b> : ${t.pour.charAt(0).toLowerCase() + t.pour.slice(1)}`).concat(['Une pièce, un élément du système : piquage, blocs, coulure, hachures ou chiffres.'])))}
  ${media('plates', '35-textile-a-plat.png', 420, 84, 470, 588, { pos: '24% 78%', tag: 'Textile à plat', fond: N0,
    repli: `<div style="position:absolute;inset:0">${A.piquage({ w: 940, h: 1176, c: F, seed: 6, attrs: 'style="width:100%;height:100%;display:block;opacity:.8"' })}</div>${centre(A.logoV(W, 'style="width:200px;height:auto"', { sym: F }))}` })}
  ${media('plates', '36-sweat-porte.png', 906, 84, 318, 588, { pos: '17% 50%', tag: 'Le sweat porté', repli: ph('hoodie', { mode: 'brut' }) })}`);

const AFF = [['affiche-1.png', 'Le Cran comme fenêtre', 'La photo de sport cadrée par le symbole, sur fluo.'], ['affiche-2.png', 'Le sprite et la coulure', 'Un coureur en blocs, pris dans l’encre orange.'], ['affiche-3.png', 'Le mot et le fil', 'La phrase de la marque posée sur le piquage.']];
P.affiches = page('affiches', 'noir', `
  ${tete('affiches', ti('Donnez vie ', 'à vos idées', '', 60), '', 56, 76, 900)}
  ${AFF.map(([f, n, t], i) => media('art', f, 56 + i * 324, 182, 304, 426, { st: 'border-radius:6px', repli: `<div style="position:absolute;inset:0;background:${[F, O, W][i]}"></div>${centre(A.symbol([E, E, E][i], 'style="width:140px;height:auto"'))}` }) +
    box(56 + i * 324, 620, 304, null, `<div class="mp-lbl mp-doux">Affiche 0${i + 1} · 5:7</div><div style="font-size:14px;font-weight:600;margin-top:4px">${fr(n)}</div>${txt(t, 'font-size:12px;opacity:.7;margin-top:2px')}`)).join('')}
  ${box(1040, 182, 184, null, `${chapo('Trois affiches, trois entrées dans le même système : la photo, le bloc, le mot.', 'font-size:15px')}${regles(['Un titre, un mot surligné.', 'Une coulure au plus par affiche.', 'Les repères en marge, le code d’atelier en pied.'], 'margin-top:22px')}`)}`);

/* Rendus 3D de out/final/ : chaque cadre a un repli dessiné en HTML ; l'image le recouvre dès qu'elle existe */
const sangle = (st) => `<div style="position:absolute;width:30px;background:${O};box-shadow:0 0 0 1px rgba(0,0,0,.25);${st}"></div>`;
const R = {
  ecusson: canvas({ tech: 'broderie', forme: 'cran', c: F, fond: 'maille', cf: N0, p: 1, zoom: .7 }, 640, 440),
  serigraphie: `${ph('serigraphie', { mode: 'duo', c: 'fluo' })}`,
  portable: `<div style="position:absolute;inset:0;background:${N0}"></div>${centre(A.laptop(S_.accueil ? S_.accueil() : '', .38))}${sangle('left:150px;top:-30px;height:520px;transform:rotate(13.3deg)')}${sangle('right:150px;top:-30px;height:520px;transform:rotate(13.3deg)')}`,
  telephone: `<div style="position:absolute;inset:0;background:${G}"></div>${centre(A.phone(M_.accueil ? M_.accueil() : '', .44))}${sangle('left:196px;top:-20px;height:500px;transform:rotate(13.3deg)')}`,
  etiquettes: `<div style="position:absolute;inset:0;background:${G}"></div>
    <div class="tx-toile" style="position:absolute;left:60px;top:90px;width:280px;height:120px;border-radius:4px;transform:rotate(-5deg);display:grid;place-items:center">${A.logo(F, 'style="width:200px;height:auto"')}</div>
    <div style="position:absolute;left:250px;top:220px;width:220px;height:160px;border-radius:24px;overflow:hidden;transform:rotate(6deg)">${canvas({ tech: 'broderie', forme: 'cran', c: F, fond: 'molleton', cf: N0, p: 1 }, 220, 160)}</div>`,
  papeterie: `<div style="position:absolute;inset:0;background:${G}"></div>
    <div style="position:absolute;left:70px;top:70px;width:300px;height:186px;border-radius:6px;background:${F};overflow:hidden;transform:rotate(-6deg)">${A.motif({ w: 300, h: 186, c: E, l: 30, seed: 5, attrs: 'style="width:100%;height:100%;display:block;opacity:.9"' })}</div>
    <div style="position:absolute;left:250px;top:200px;width:300px;height:186px;border-radius:6px;background:${N0};transform:rotate(4deg);box-shadow:0 20px 40px -20px #000"><div style="position:absolute;left:22px;top:22px">${A.logo(W, 'style="height:22px;width:auto"', { sym: F })}</div><div class="t-mono" style="position:absolute;left:22px;bottom:20px;color:#fff;font-size:8px">Atelier de personnalisation · custom.fr</div></div>`,
  goodies: `<div style="position:absolute;inset:0;background:${C.craie}"></div>
    <div style="position:absolute;left:110px;top:90px;width:170px;height:240px;border-radius:8px;background:${F};display:grid;place-items:center;box-shadow:0 24px 40px -24px rgba(3,1,14,.6)">${A.symbol(E, 'style="width:96px;height:auto"')}<i style="position:absolute;right:26px;top:0;bottom:0;width:8px;background:${E}"></i></div>
    <div style="position:absolute;left:330px;top:120px;width:200px;height:220px;border-radius:4px;background:#fff;box-shadow:0 24px 40px -24px rgba(3,1,14,.5);display:grid;place-items:center">${A.logoV(E, 'style="width:120px;height:auto"', { sym: E })}</div>
    <div style="position:absolute;left:300px;top:370px;width:220px;height:16px;border-radius:8px;background:${N0};transform:rotate(-4deg)"><i style="position:absolute;right:0;top:0;bottom:0;width:30px;border-radius:0 8px 8px 0;background:${F}"></i></div>`,
  signaletique: `<div style="position:absolute;inset:0;background:${C.craie}"></div>
    <div style="position:absolute;left:80px;top:40px;width:150px;height:380px;background:${N0};border-radius:6px;display:flex;flex-direction:column;align-items:center;gap:22px;padding-top:30px">${A.symbol(F, 'style="width:96px;height:auto"')}${['textile', 'print', 'goodies', 'signaletique'].map((k) => A.picto(k, { c: F, attrs: 'style="height:34px;width:auto"' })).join('')}<span class="t-mono" style="color:#fff;font-size:8px">custom.fr</span></div>
    <div style="position:absolute;left:270px;top:120px;width:200px;height:120px;background:${F};border-radius:6px;padding:16px 18px"><div class="t-titre" style="font-size:34px;color:${E}">L’atelier</div><div style="margin-top:10px">${A.fleche(E, 'width:48px')}</div></div>`,
};
const scene = (k, fond, titre, ch, a, b) => page(k, fond, `
  ${tete(k, titre, '', 56, 76, 640)}
  ${box(700, 100, 524, null, chapo(ch))}
  ${media('final', a[0], a[1], 196, a[2], 440, { repli: R[a[3]], leg: a[4], fond: N0, pos: a[5] })}
  ${media('final', b[0], b[1], 196, b[2], 440, { repli: R[b[3]], leg: b[4], fond: N0, pos: b[5] })}`);
P['s-atelier'] = scene('s-atelier', 'noir', ti('Le geste, ', 'en gros plan', '', 60), 'L’écusson : le Cran brodé, en très gros plan. Le cadre de sérigraphie : la raclette, l’encre fluo, le Cran sur l’écran. Le point de vue de l’atelier.',
  ['02-ecusson.png', 56, 640, 'ecusson', '3D · L’écusson · le Cran brodé', '30% 55%'], ['21-serigraphie.png', 712, 512, 'serigraphie', '3D · Le cadre de sérigraphie', '50% 50%']);
P['s-ecrans'] = scene('s-ecrans', 'craie', ti('L’écran ', 'sanglé', '', 60), 'Les sangles orange des visuels de 2025 tiennent les écrans : le site sur un portable, la version mobile dans la main.',
  ['26-portable.png', 56, 700, 'portable', '3D · Le site sur un portable tenu par des sangles orange', '50% 35%'], ['32-telephone.png', 772, 452, 'telephone', '3D · Le téléphone', '30% 50%']);
P['s-papier'] = scene('s-papier', 'noir', ti('Étiquettes, ', 'papeterie', '', 60), 'L’étiquette tissée, l’écusson et l’emballage ; les cartes, la chemise et l’enveloppe. Le motif de blocs des cartes de visite de 2025 passe sur tout le papier.',
  ['37-etiquettes.png', 56, 540, 'etiquettes', '3D · Étiquettes, écussons, emballage', '45% 60%'], ['39-papeterie.png', 612, 612, 'papeterie', '3D · Papeterie · cartes, chemise, enveloppe', '35% 50%']);
P['s-objets'] = scene('s-objets', 'blanc', ti('Les objets, ', 'les lieux', '', 60), 'Carnet, stylo, gourde, mug, tote bag : le Cran et le fluo sur les objets du quotidien. Le totem et le panneau : la signalétique en blocs.',
  ['40-goodies.png', 56, 640, 'goodies', '3D · Goodies', '50% 50%'], ['41-signaletique.png', 712, 512, 'signaletique', '3D · Signalétique · le totem et le panneau', '28% 50%']);

/* =====================================================================================================
   Dos : signature, crédits, mention
   ===================================================================================================== */
P.dos = page('dos', 'noir', `
  ${box(0, 96, 1280, null, `<div style="display:grid;justify-items:center;gap:30px">${A.logoV(W, 'style="width:230px;height:auto"', { sym: F })}
    <div class="t-titre" style="font-size:76px;text-align:center">Tout est fait ${A.surl('ici.')}</div>
    <div class="t-mono" style="opacity:.75">${A.TRIPTYQUE.join(`${_}${_}·${_}${_}`)}</div></div>`)}
  ${box(56, 452, 1168, null, `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px">${[
    ['Crédits', 'Identité et site : KLYRA pour Custom, 2025. Système et supports : proposition de KLYRA, 2026.'],
    ['Ce guide', 'Proposition de KLYRA, non validée par Custom. Le nom et le logo d’origine sont inchangés.'],
    ['Images', 'Photos de marque générées pour ce projet, sans droit de tiers. Médias d’origine publiés par KLYRA. Polices : Archivo, Bebas Neue, Inter, JetBrains Mono.']].map(([a, b]) =>
    `<div><div class="mp-filet"></div>${lbl(a, 'margin-top:12px', 'mp-doux')}${txt(b, 'margin-top:8px;font-size:13px;opacity:.88')}</div>`).join('')}</div>`)}
  ${box(56, 640, 1168, null, `<div style="display:flex;justify-content:space-between;align-items:center">${A.code('CST', 'GUIDE', '2026')}<span class="t-mono" style="color:${F}">custom.fr</span><div style="width:200px">${A.barre({ style: 'height:8px' })}</div></div>`)}`,
  { sansPied: true });

/* ---------- Après insertion d'une page dans le document : rendre les canvas des techniques ---------- */
const apres = (root) => { if (window.MarqueTech && root && root.querySelector('canvas[data-tech],canvas[data-tissu]')) window.MarqueTech.tous(root); };

window.GuidePages = P;
window.GuideOrder = ORDER;
window.GuideTitles = TITLES;
window.GuideApres = apres;
/* Rendus 3D attendus (pour l'assemblage) : fichiers de out/final/ cités par les pages « En situation » */
window.GuideRendus = ['02-ecusson.png', '21-serigraphie.png', '26-portable.png', '32-telephone.png', '37-etiquettes.png', '39-papeterie.png', '40-goodies.png', '41-signaletique.png'];
})();
