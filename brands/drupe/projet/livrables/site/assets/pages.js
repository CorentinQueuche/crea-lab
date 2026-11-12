/* Pages du guide de marque Drupe (1280 × 720 chacune). SOURCE UNIQUE : la mosaïque (plates/19-charte.html), la présentation
   en ligne (site/presentation.html) et le PDF (node tools/deck.mjs puis python tools/deck_pdf.py) lisent ce fichier.
   GuideOrder = ordre des pages ; GuideTitles = leurs titres. Les numéros du pied de page et du sommaire sont CALCULÉS depuis
   GuideOrder (fonction num) : on réordonne CH, tout suit. Styles : plates/plates.css (bloc « Mini-pages du guide », .mp).
   Images en situation : rendus 3D de out/final/, chemin réglable par window.GuideMedia (défini avant ce script). */
(function () {
const A = Marque, C = A.COULEURS;
const MEDIA = window.GuideMedia || '../out/final/';

/* ---------- Chapitres : [intercalaire, numéro, titre, dégradé, couleur du titre, couleur du chiffre, pages] ---------- */
const CH = [
  ['d1', '01', 'La marque', 'g5', C.grain, C.cerise, [['idee', 'L’idée'], ['valeurs', 'Valeurs'], ['ton', 'Ton de voix']]],
  ['d2', '02', 'Le logo', 'g7', C.fleur, C.fleur, [['logo', 'Logo et descripteur'], ['sillon', 'Construction et sillon'], ['zone', 'Zone de protection et tailles'], ['usages', 'Couleurs du logo']]],
  ['d3', '03', 'Couleurs', 'g4', C.feuille, C.feuille, [['palette', 'Palette'], ['contrastes', 'Proportions et contrastes'], ['degrades', 'Dégradés']]],
  ['d4', '04', 'Typographie', 'g6', C.feuille, C.feuille, [['typo', 'Bricolage Grotesque et IBM Plex Mono']]],
  ['d5', '05', 'Motifs', 'g2', C.grain, C.cerise, [['pastille', 'La pastille et le tampon'], ['semis', 'Le semis et le symbole en grand']]],
  ['d6', '06', 'En situation', 'g9', C.fleur, C.fleur, [['ecrans', 'Écrans'], ['emballage', 'Emballage'], ['boutique', 'Boutique et papeterie']]],
];
const ORDER = ['cover', 'sommaire', ...CH.flatMap((c) => [c[0], ...c[6].map((s) => s[0])]), 'dos'];
const TITLES = ['Couverture', 'Sommaire', ...CH.flatMap((c) => [`${c[1]} ${c[2]}`, ...c[6].map((s) => s[1])]), 'Dos'];
const num = (k) => String(ORDER.indexOf(k) + 1).padStart(2, '0');

/* ---------- Éléments communs ---------- */
const mf = (sec, k, c = C.grain) => `<div class="mf" style="color:${c}">${A.symbol(c)}<span>Guide de marque</span><span>${sec}</span><span>2026©</span><span>${num(k)}</span></div>`;
/* En-tête de page : titre puis texte, dans la colonne de gauche (64 → 394), en flux pour que les titres longs poussent le texte */
const head = (t, tx, c = C.grain) => `<div class="hd" style="color:${c}"><div class="t">${t}</div><p class="tx">${tx}</p></div>`;
const bg = (c, cls = '') => `<div class="${cls}" style="position:absolute;inset:0;${c ? 'background:' + c : ''}"></div>`;
const box = (x, y, w, h, inner = '', st = '') => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${st}">${inner}</div>`;
const lab = (t, c = C.grain, st = '') => `<div class="cap2" style="color:${c};${st}">${t}</div>`;
const mono = (t, st = '') => `<span class="mono" style="font-size:13px;letter-spacing:.04em;${st}">${t}</span>`;
const img = (f, x, y, w, h, legende, pos = '50% 50%') => box(x, y, w, h, `<img src="${MEDIA}${f}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:${pos};display:block">`, 'overflow:hidden') +
  `<div class="cap2" style="position:absolute;left:${x}px;top:${y + h + 10}px;width:${w}px;font-size:11.5px;line-height:1.45;opacity:.75">${legende}</div>`;
const L = (r) => `<div style="height:1px;background:${C.grain};opacity:${r || .14}"></div>`;

/* ---------- Pages ---------- */
const P = {};

/* Couverture : aplat Cerise, le symbole en grand entre par la droite et par le bas, en Pulpe */
P.cover = `${bg('', 'g-vif grain')}
  <div style="position:absolute;left:420px;top:230px;width:1000px;height:1000px">${A.symbol(C.pulpe, 'style="width:1000px;height:1000px;display:block"')}</div>
  <div class="big" style="top:52px;font-size:150px;color:${C.fleur}">Guide<br>de marque</div>
  <div class="cap2" style="position:absolute;left:68px;top:380px;color:${C.fleur}">Version 1.0 · novembre 2026</div>
  <div style="position:absolute;left:64px;bottom:52px">${A.lockup(C.fleur, 'style="width:330px;display:block"')}</div>`;

/* Sommaire : deux colonnes de chapitres, numéros calculés */
const tocCol = (chs) => chs.map(([k, n, t, , , , subs]) =>
  `<div style="display:flex;justify-content:space-between;align-items:center;height:38px;font-size:20px;font-weight:500;letter-spacing:-.01em;border-bottom:1px solid rgba(42,26,20,.3)"><span><span class="mono" style="font-size:16px;color:${C.cerise};margin-right:12px">${n}</span>${t}</span><span class="mono" style="font-size:16px;color:${C.cerise}">${num(k)}</span></div>` +
  subs.map(([s, st]) => `<div style="display:flex;justify-content:space-between;align-items:center;height:30px;font-size:15.5px;border-bottom:1px solid rgba(42,26,20,.1)"><span style="padding-left:38px">${st}</span><span class="mono" style="font-size:13px;opacity:.7">${num(s)}</span></div>`).join('')
).join('<div style="height:26px"></div>');
P.sommaire = `${bg(C.parche)}${head('Sommaire', 'Ce guide fixe les règles d’usage de Drupe. Une page, une règle&#8239;; les chiffres sont ceux qu’on applique.')}
  <div style="position:absolute;left:470px;width:350px;top:62px">${tocCol(CH.slice(0, 3))}</div>
  <div style="position:absolute;left:866px;width:350px;top:62px">${tocCol(CH.slice(3))}</div>
  ${mf('Sommaire', 'sommaire')}`;

/* Intercalaires : dégradé de la liste, titre en Medium, grand chiffre en Light coupé par le bas, pages du chapitre */
CH.forEach(([k, n, t, g, ink, chiffre, subs]) => {
  const bas = g === 'g9';  // sur .g9, le haut à droite est clair : la liste passe en bas
  P[k] = `${bg('', g + ' grain')}<div class="big" style="color:${ink}">${t}</div>
  <div style="position:absolute;left:44px;bottom:-138px;font-size:440px;line-height:1;font-weight:300;letter-spacing:-.05em;color:${chiffre}">${n}</div>
  <div style="position:absolute;right:64px;${bas ? 'bottom:56px' : 'top:62px'};width:300px;color:${ink}">${subs.map(([s, st]) =>
    `<div style="display:flex;justify-content:space-between;gap:16px;font-size:15px;line-height:1.3;padding:8px 0;border-top:1px solid currentColor"><span>${st}</span>${mono(num(s))}</div>`).join('')}</div>`;
});

/* 01 — La marque */
P.idee = `${head('L’idée', 'Avant d’être un grain brun, le café est le noyau d’une cerise rouge&nbsp;: la drupe du caféier. Drupe le traite comme un fruit de saison&nbsp;: cueilli mûr, torréfié clair, vendu frais, au coin de la rue.')}
  <p style="position:absolute;left:470px;right:64px;top:50px;font-size:58px;line-height:1.02;font-weight:500;letter-spacing:-.03em">Le café est un <span style="color:${C.cerise}">fruit</span>.<br>Torréfié au coin de la rue.</p>
  <div style="position:absolute;left:470px;right:64px;top:250px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px">${[
    ['48&nbsp;h', 'du tambour à votre boîte aux lettres'], ['12&nbsp;kg', 'par fournée, datée à la main'], ['Mardi', 'on torréfie'], ['Jeudi', 'on livre à vélo']].map(([a, b]) =>
    `<div>${L(.3)}<div style="font-size:62px;line-height:1;font-weight:300;letter-spacing:-.03em;margin-top:18px">${a}</div><div style="font-size:15px;line-height:1.35;margin-top:10px;max-width:150px">${b}</div></div>`).join('')}</div>
  <div style="position:absolute;left:470px;right:64px;top:468px;display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:24px">${[
    ['Triptyque', 'Cueilli mûr. Torréfié clair. Servi frais.'], ['Descripteur', 'Torréfacteur de quartier'], ['Mots-clés', 'Fruit, Fraîcheur, Voisinage, Franchise']].map(([a, b]) =>
    `<div>${L()}${lab(a, C.cerise, 'margin-top:14px')}<div style="font-size:19px;line-height:1.3;font-weight:500;letter-spacing:-.01em;margin-top:8px">${b}</div></div>`).join('')}</div>
  ${mf('La marque', 'idee')}`;

const vals = [['Saison', 'le café est une récolte. La carte change quand la récolte change.'], ['Fraîcheur', 'torréfié chaque mardi, par fournées de 12&nbsp;kg, daté à la main.'],
  ['Voisinage', 'on connaît vos habitudes, on livre à vélo, on reprend les boîtes vides.'], ['Franchise', 'origine, altitude, procédé, prix. Tout est écrit sur la pastille.']];
P.valeurs = `${bg(C.parche)}${head('Valeurs', 'Quatre valeurs, et pour chacune un fait qu’on peut vérifier en boutique. Quand un choix hésite, on revient à elles.')}
  <div style="position:absolute;left:470px;right:64px;top:62px">${vals.map(([v, t], i) =>
    `<div style="display:grid;grid-template-columns:80px 1fr;padding:22px 0 24px;border-top:1px solid rgba(42,26,20,.18)"><span class="mono" style="color:${C.cerise};font-size:16px;padding-top:6px">0${i + 1}</span><p style="font-size:25px;line-height:1.3;letter-spacing:-.01em"><b style="font-weight:500">${v}&nbsp;:</b> ${t}</p></div>`).join('')}</div>
  ${mf('La marque', 'valeurs')}`;

const say = [['Torréfié mardi.', 'Fraîcheur garantie&#8239;!'], ['Fraise, jasmin, une fin de cacao.', 'Une explosion de saveurs.'], ['On vous met un sachet de côté.', 'Optimisez votre abonnement.']];
P.ton = `${head('Ton de voix', 'Vouvoiement chaleureux, phrases courtes. Des faits et des dates plutôt que des adjectifs. Le «&nbsp;on&nbsp;» de l’artisan, qui dit ce qu’il a fait.')}
  <div style="position:absolute;left:470px;right:64px;top:62px;display:grid;grid-template-columns:1fr 1fr;column-gap:40px">
    ${lab('On dit', C.cerise, 'margin-bottom:14px')}${lab('On évite', C.grain, 'margin-bottom:14px;opacity:.66')}
    ${say.map(([a, b]) => `<p style="font-size:24px;line-height:1.25;letter-spacing:-.01em;padding:22px 0;border-top:1px solid rgba(42,26,20,.18);font-weight:500">«&nbsp;${a}&nbsp;»</p><p style="font-size:24px;line-height:1.25;letter-spacing:-.01em;padding:22px 0;border-top:1px solid rgba(42,26,20,.18);opacity:.66">«&nbsp;${b}&nbsp;»</p>`).join('')}</div>
  <div style="position:absolute;left:470px;right:64px;top:470px;display:grid;grid-template-columns:1fr 1fr;column-gap:40px;font-size:16px;line-height:1.42">
    <p><b style="font-weight:500">Les chiffres en chiffres</b>, avec leur unité et une espace insécable&nbsp;: 12&nbsp;kg, 2&nbsp;050&nbsp;m, 8&nbsp;h.</p>
    <p><b style="font-weight:500">Les dates d’abord</b>&nbsp;: le jour de torréfaction, le jour de livraison, l’heure où la carte ferme.</p></div>
  ${mf('La marque', 'ton')}`;

/* 02 — Le logo */
P.logo = `${head('Logo et descripteur', 'Le logotype DRUPE, et à sa droite «&nbsp;Torréfacteur de quartier&nbsp;» sur deux lignes, la dernière posée sur la ligne de base. Trois versions, une par place disponible.')}
  ${box(470, 56, 746, 300, `<div style="display:grid;place-items:center;height:100%">${A.lockup(C.cerise, 'style="width:600px;display:block"')}</div>`, `background:${C.parche}`)}
  <div style="position:absolute;left:470px;right:64px;top:378px;display:grid;grid-template-columns:1.35fr 1fr .8fr;gap:16px">${[
    [A.lockup(C.grain, 'style="width:200px;display:block"'), 'Version complète', 'Enseigne, couverture, emballage, partout où la place le permet.'],
    [A.wordmark(C.grain, 'style="width:150px;display:block"'), 'Logotype seul', 'Quand la place manque en largeur&nbsp;: étiquette, en-tête, pied d’écran.'],
    [A.symbol(C.cerise, 'style="width:62px;display:block"'), 'Symbole', 'Icône, pied de page, enseigne drapeau, pastille.']].map(([s, t, x]) =>
    `<div><div style="height:118px;display:grid;place-items:center;background:${C.fleur};box-shadow:inset 0 0 0 1px rgba(42,26,20,.14)">${s}</div><div style="font-size:16px;font-weight:500;margin-top:14px">${t}</div><div style="font-size:14px;line-height:1.38;margin-top:4px;opacity:.8">${x}</div></div>`).join('')}</div>
  ${mf('Le logo', 'logo')}`;

/* Construction : cotes lues dans le socle (Marque.LETTRES, Marque.SYM) */
const LT = A.LETTRES;
const sillons = LT.ordre.map((c, i) => `<rect x="${A.letterX(i) + LT.graisse}" y="-9" width="${LT.sillon}" height="6" fill="${C.cerise}"/><rect x="${A.letterX(i) + LT.graisse}" y="103" width="${LT.sillon}" height="6" fill="${C.cerise}"/>`).join('');
const cote = (x1, y1, x2, y2, t, tx, ty, anchor = 'middle', col = C.grain) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${col}" stroke-width=".8"/><text x="${tx}" y="${ty}" fill="${col}" text-anchor="${anchor}">${t}</text>`;
const xR = A.letterX(1);
const constr = `<svg viewBox="-60 -44 640 190" width="746" style="display:block;overflow:visible"><g opacity=".14" stroke="${C.grain}" stroke-width=".6">${[0, 20, 40, 60, 80, 100].map((y) => `<path d="M-50 ${y} H560"/>`).join('')}</g>
  <path fill="${C.grain}" fill-rule="evenodd" d="${A.wordPath()}"/>${sillons}
  <g font-family="IBM Plex Mono" font-size="9" letter-spacing=".5">
    ${cote(-22, 0, -22, 100, '100', -28, 54, 'end')}<path d="M-26 0 H-18 M-26 100 H-18" stroke="${C.grain}" stroke-width=".8"/>
    ${cote(0, -18, LT.graisse, -18, LT.graisse, LT.graisse / 2, -24)}<path d="M0 -22 V-14 M${LT.graisse} -22 V-14" stroke="${C.grain}" stroke-width=".8"/>
    ${cote(LT.graisse, -30, LT.graisse + LT.sillon, -30, LT.sillon, LT.graisse + LT.sillon / 2, -35, 'middle', C.cerise)}
    ${cote(LT.largeurs.D, 122, xR, 122, LT.espace, (LT.largeurs.D + xR) / 2, 136)}<path d="M${LT.largeurs.D} 118 V126 M${xR} 118 V126" stroke="${C.grain}" stroke-width=".8"/>
    ${cote(0, 146, A.WORD_W, 146, A.WORD_W, A.WORD_W / 2, 140)}</g></svg>`;
const SY = A.SYM, f = SY.tilt * Math.PI / 180, ux = Math.sin(f), uy = -Math.cos(f);
const symC = `<svg viewBox="-10 -14 120 120" width="220" style="display:block;overflow:visible"><circle cx="${SY.cx}" cy="${SY.cy}" r="${SY.r}" fill="none" stroke="${C.grain}" stroke-opacity=".3" stroke-width=".5" stroke-dasharray="2 2"/>
  <path fill="${C.grain}" fill-rule="evenodd" d="${A.symbolPath()}"/>
  <path d="M${SY.cx} ${SY.cy + 50} V${SY.cy - 64}" stroke="${C.grain}" stroke-opacity=".45" stroke-width=".5" stroke-dasharray="2 2"/>
  <path d="M${SY.cx - 50 * ux} ${SY.cy - 50 * uy} L${SY.cx + 58 * ux} ${SY.cy + 58 * uy}" stroke="${C.cerise}" stroke-width=".8"/>
  <path d="M${SY.cx} ${SY.cy - 46} A46 46 0 0 1 ${SY.cx + 46 * ux} ${SY.cy + 46 * uy}" fill="none" stroke="${C.cerise}" stroke-width=".8"/>
  <text x="${SY.cx + 6}" y="${SY.cy - 50}" font-family="IBM Plex Mono" font-size="6.5" fill="${C.cerise}">${SY.tilt}°</text></svg>`;
P.sillon = `${head('Construction et sillon', 'Des capitales de 100 de haut, en droites et en arcs de cercle. Chaque lettre est fendue d’un sillon de 8 juste après son fût&nbsp;: le sillon du grain de café, et le pont d’un pochoir de sac de jute.')}
  <div style="position:absolute;left:470px;top:84px">${constr}</div>
  <div style="position:absolute;left:470px;top:350px">${symC}</div>
  <div style="position:absolute;left:740px;right:64px;top:352px">${[
    ['Graisse 20, sillon 8, espace 18', 'Les mêmes cotes pour les cinq lettres.'], ['Aucune contre-forme fermée', 'Le logo tient en un seul aplat et se découpe en pochoir.'],
    ['Le symbole, fendu du même sillon', `Un disque de rayon ${SY.r}, incliné de ${SY.tilt}°, et sa queue détachée de ${SY.queue.ecart}.`], ['On ne referme pas le sillon', 'Ni trait, ni contour, ni couleur dans la fente.']].map(([a, b]) =>
    `<div style="display:grid;grid-template-columns:1fr;padding:9px 0 10px;border-top:1px solid rgba(42,26,20,.16);font-size:14.5px;line-height:1.35"><b style="font-weight:500">${a}</b><span style="opacity:.78">${b}</span></div>`).join('')}</div>
  ${mf('Le logo', 'sillon')}`;

/* Zone de protection (x = deux graisses de fût, soit 40 dans le repère du logo) et tailles minimales */
const zone = `<svg viewBox="-62 -62 640 224" width="640" style="display:block"><rect x="-40" y="-40" width="${A.WORD_W + 80}" height="180" fill="${C.parche}"/>
  <rect x="-40" y="-40" width="${A.WORD_W + 80}" height="180" fill="none" stroke="${C.cerise}" stroke-width="1" stroke-dasharray="4 4"/>
  <rect x="0" y="0" width="${A.WORD_W}" height="100" fill="none" stroke="${C.grain}" stroke-opacity=".35" stroke-width=".8" stroke-dasharray="3 3"/>
  <path fill="${C.grain}" fill-rule="evenodd" d="${A.wordPath()}"/>
  <g font-family="IBM Plex Mono" font-size="14" fill="${C.cerise}" text-anchor="middle"><text x="-20" y="55">x</text><text x="${A.WORD_W + 20}" y="55">x</text><text x="${A.WORD_W / 2}" y="-15">x</text><text x="${A.WORD_W / 2}" y="125">x</text></g>
  <rect x="-40" y="-40" width="40" height="40" fill="${C.cerise}" fill-opacity=".14"/></svg>`;
P.zone = `${head('Zone de protection et tailles', 'Autour du logo, gardez libre une marge égale à deux graisses de fût, soit 40&nbsp;% de la hauteur des lettres. Rien n’y entre&nbsp;: ni texte, ni image, ni bord de page. Pour le symbole seul, un quart de son diamètre.')}
  <div style="position:absolute;left:530px;top:56px">${zone}</div>
  <div class="cap2" style="position:absolute;left:530px;top:290px;color:${C.cerise}">x = deux graisses de fût, 40 % de la hauteur des lettres</div>
  <div style="position:absolute;left:470px;right:64px;top:350px">${L(.3)}${lab('Tailles minimales', C.grain, 'margin-top:14px;opacity:.7')}</div>
  <div style="position:absolute;left:470px;right:64px;top:410px;display:grid;grid-template-columns:1.3fr 1fr .8fr;gap:24px;align-items:end">${[
    [A.lockup(C.grain, 'style="width:160px;display:block"'), 'Version complète', '160&nbsp;px · 45&nbsp;mm', 'En dessous, le descripteur ne se lit plus.'],
    [A.wordmark(C.grain, 'style="width:64px;display:block"'), 'Logotype', '64&nbsp;px · 18&nbsp;mm', 'En dessous, le sillon se ferme.'],
    [A.symbol(C.grain, 'style="width:16px;display:block"'), 'Symbole', '16&nbsp;px', 'La plus petite icône.']].map(([s, t, c, x]) =>
    `<div><div style="height:70px;display:flex;align-items:flex-end">${s}</div><div style="font-size:16px;font-weight:500;margin-top:18px">${t}</div><div class="mono" style="font-size:13px;color:${C.cerise};margin-top:4px">${c}</div><div style="font-size:14px;line-height:1.35;opacity:.78;margin-top:4px">${x}</div></div>`).join('')}</div>
  ${mf('Le logo', 'zone')}`;

/* Couleurs du logo : contrastes calculés (formule WCAG 2) */
const lum = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16) / 255).map((c) => (c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4)).reduce((s, c, i) => s + c * [.2126, .7152, .0722][i], 0);
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const fr = (r) => r.toFixed(1).replace('.', ',');
const NOMS = { fleur: 'Fleur', parche: 'Parche', pulpe: 'Pulpe', cerise: 'Cerise', vert: 'Café vert', feuille: 'Feuille', grain: 'Grain', marc: 'Marc' };
const oui = [['cerise', 'fleur'], ['fleur', 'cerise'], ['grain', 'parche'], ['feuille', 'vert']];
const non = [['cerise', 'feuille', 'Cerise sur Feuille'], ['cerise', 'grain', 'Cerise sur Grain'], ['cerise', 'pulpe', 'Cerise sur Pulpe, en petit'], ['cerise', 'parche', 'Étiré ou déformé']];
P.usages = `${head('Couleurs du logo', 'Cerise sur Fleur ou Parche, Fleur sur Cerise ou Feuille, Grain sur tout fond clair, Feuille sur Café vert. Toujours en aplat, d’une seule couleur.')}
  <div style="position:absolute;left:470px;right:64px;top:56px;display:grid;grid-template-columns:1fr 1fr;gap:10px">${oui.map(([c, b]) =>
    `<div style="position:relative;height:150px;background:${C[b]};color:${C[c]};display:grid;place-items:center;${b === 'fleur' ? 'box-shadow:inset 0 0 0 1px rgba(42,26,20,.14)' : ''}">
      <span class="cap2" style="position:absolute;left:16px;top:14px;font-size:11px">${NOMS[c]} sur ${NOMS[b]}</span><span class="mono" style="position:absolute;right:16px;top:14px;font-size:11px">${fr(ratio(C[c], C[b]))}:1</span>${A.lockup(C[c], 'style="width:230px;display:block;margin-top:10px"')}</div>`).join('')}</div>
  <div style="position:absolute;left:470px;right:64px;top:388px">${lab('À éviter', C.grain, 'opacity:.7')}</div>
  <div style="position:absolute;left:470px;right:64px;top:416px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px">${non.map(([c, b, t], i) =>
    `<div><div style="height:104px;background:${C[b]};display:grid;place-items:center;position:relative">${i === 3
      ? `<svg viewBox="0 0 ${A.WORD_W} 100" preserveAspectRatio="none" style="width:150px;height:18px;display:block"><path fill="${C[c]}" fill-rule="evenodd" d="${A.wordPath()}"/></svg>`
      : A.wordmark(C[c], `style="width:${i === 2 ? 52 : 120}px;display:block"`)}
      <svg viewBox="0 0 20 20" style="position:absolute;right:8px;top:8px;width:18px;height:18px"><circle cx="10" cy="10" r="10" fill="${C.fleur}"/><path d="M6 6 L14 14 M14 6 L6 14" stroke="${C.grain}" stroke-width="2" stroke-linecap="round"/></svg></div>
      <div style="font-size:13.5px;line-height:1.3;margin-top:9px">${t}</div><div class="mono" style="font-size:11.5px;opacity:.7;margin-top:2px">${i === 3 ? 'jamais' : fr(ratio(C[c], C[b])) + ':1'}</div></div>`).join('')}</div>
  ${mf('Le logo', 'usages')}`;

/* 03 — Couleurs */
const pal = [['parche', 'F4ECDD', 'Fond de marque', 'La peau claire du grain.', 118, C.grain], ['fleur', 'FFFDF8', 'Papier, cartes', 'La fleur du caféier.', 100, C.grain],
  ['pulpe', 'F6C3C0', 'Lumière, aplat doux', 'La chair du fruit.', 64, C.grain], ['vert', 'C7D5A9', 'Second aplat doux', 'Le grain avant le feu.', 64, C.feuille],
  ['cerise', 'CF2145', 'Couleur vive, rare', 'Le fruit mûr.', 52, C.fleur], ['feuille', '1E4A36', 'Fond dense, accent', 'La feuille du caféier.', 52, C.fleur],
  ['grain', '2A1A14', 'Encre du texte', 'Le café torréfié.', 48, C.fleur], ['marc', '150F0C', 'Noir de scène', '3D et vidéo seulement.', 44, C.fleur]];
const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)).join(' ');
P.palette = `${head('Palette', 'Huit couleurs prises au caféier, de la fleur au grain torréfié. Parche et Fleur font le fond, Pulpe et Café vert la lumière, la Cerise signe. Feuille et Grain donnent le contrepoint.')}
  <div style="position:absolute;left:470px;right:64px;top:56px">${pal.map(([k, h, role, d, ht, t]) =>
    `<div style="height:${ht}px;background:${C[k]};color:${t};display:grid;grid-template-columns:150px 120px 130px 1fr;align-items:center;padding:0 20px;font-size:14.5px;${k === 'fleur' ? 'box-shadow:inset 0 0 0 1px rgba(42,26,20,.14)' : ''}">
      <span style="font-size:19px;font-weight:500;letter-spacing:-.01em">${NOMS[k]}</span><span class="mono" style="font-size:12.5px">#${h}</span><span class="mono" style="font-size:12.5px;opacity:.8">${rgb(h)}</span><span><b style="font-weight:500">${role}.</b> ${d}</span></div>`).join('')}</div>
  ${mf('Couleurs', 'palette')}`;

const prop = [['parche', 45], ['fleur', 30], ['pulpe', 8], ['vert', 7], ['cerise', 5], ['feuille', 3], ['grain', 2]];
const paires = [['grain', 'fleur'], ['grain', 'parche'], ['fleur', 'feuille'], ['feuille', 'parche'], ['feuille', 'vert'], ['cerise', 'fleur'],
  ['fleur', 'cerise'], ['cerise', 'parche'], ['cerise', 'pulpe'], ['cerise', 'vert'], ['cerise', 'grain'], ['cerise', 'feuille']];
const verdict = (r, a, b) => (a === 'cerise' && (b === 'grain' || b === 'feuille')) ? ['À éviter', 'jamais, ni texte ni logo']
  : r >= 7 ? ['Tout texte', 'AAA'] : r >= 4.5 ? ['Texte courant', 'AA, dès 16&nbsp;px'] : r >= 3 ? ['Titres seulement', '24&nbsp;px et plus'] : ['À éviter', 'illisible'];
P.contrastes = `${head('Proportions et contrastes', 'Une marque de jour&nbsp;: trois quarts de clair, un peu de Pulpe ou de Café vert, la Cerise par touches. Les contrastes sont calculés selon la formule WCAG&nbsp;2.')}
  <div style="position:absolute;left:470px;right:64px;top:62px;height:56px;display:flex">${prop.map(([k, w]) => `<div style="flex:${w};background:${C[k]};${k === 'fleur' ? 'box-shadow:inset 0 0 0 1px rgba(42,26,20,.14)' : ''}"></div>`).join('')}</div>
  <div style="position:absolute;left:470px;right:64px;top:130px;display:grid;grid-template-columns:2.6fr 1.2fr 1fr 1.2fr;gap:16px;font-size:13.5px;line-height:1.3">${[
    ['Parche et Fleur, trois quarts', 'Le fond, le papier, les cartes.'], ['Pulpe, Café vert', 'La lumière, les aplats doux.'], ['Cerise', 'Un mot, un bouton, une pastille.'], ['Feuille, Grain', 'Le texte, le contrepoint.']].map(([a, b]) =>
    `<div><b style="font-weight:500">${a}</b><br><span style="opacity:.75">${b}</span></div>`).join('')}</div>
  <div style="position:absolute;left:470px;right:64px;top:222px;display:grid;grid-template-columns:1fr 1fr;column-gap:30px">${paires.map(([a, b]) => { const r = ratio(C[a], C[b]), [v, s] = verdict(r, a, b);
    return `<div style="display:grid;grid-template-columns:48px 1fr 58px 120px;align-items:center;gap:10px;height:62px;border-top:1px solid rgba(42,26,20,.14)">
      <div style="height:42px;background:${C[b]};color:${C[a]};display:grid;place-items:center;font-size:19px;font-weight:500;${b === 'fleur' ? 'box-shadow:inset 0 0 0 1px rgba(42,26,20,.14)' : ''}">Aa</div>
      <span style="font-size:14px;line-height:1.2;white-space:nowrap">${NOMS[a]}<br><span style="opacity:.7">sur ${NOMS[b]}</span></span><span class="mono" style="font-size:14px">${fr(r)}:1</span>
      <span style="font-size:13.5px;line-height:1.2;${v === 'À éviter' ? `color:${C.cerise}` : ''}"><b style="font-weight:500">${v}</b><br><span style="opacity:.75">${s}</span></span></div>`; }).join('')}</div>
  ${mf('Couleurs', 'contrastes')}`;

const mur = ['feuille', 'vert', 'parche', 'pulpe', 'cerise'];
P.degrades = `${head('Dégradés', 'Ils suivent le mûrissement du fruit, toujours dans cet ordre. La Cerise ne touche jamais la Feuille&nbsp;: entre les deux, il y a du clair. Sur les grandes surfaces, un grain de papier.')}
  <div style="position:absolute;left:64px;top:430px;width:330px">${lab('Ordre du mûrissement', C.grain, 'opacity:.7;margin-bottom:14px')}
    <div style="display:flex;align-items:center;gap:8px">${mur.map((k, i) => `<i style="width:30px;height:30px;border-radius:50%;background:${C[k]};${k === 'parche' ? 'box-shadow:inset 0 0 0 1px rgba(42,26,20,.2)' : ''}"></i>${i < 4 ? `<span style="opacity:.5">→</span>` : ''}`).join('')}</div>
    <div class="mono" style="font-size:11px;margin-top:10px;opacity:.75">Feuille · Café vert · Parche · Pulpe · Cerise</div></div>
  <div style="position:absolute;left:470px;right:64px;top:56px;height:560px;display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:1fr 1fr;gap:8px">${['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g-vif'].map((g, i) =>
    `<div class="${g} grain" style="position:relative"><span class="mono" style="position:absolute;left:10px;bottom:10px;font-size:12px;line-height:1.35;padding:5px 8px;border-radius:4px;background:${C.fleur};color:${C.grain}">.${g} · ${i < 6 ? 'clair' : 'dense'}</span></div>`).join('')}</div>
  ${mf('Couleurs', 'degrades')}`;

/* 04 — Typographie */
const hier = [['Titre', 'Bricolage Medium 500', 'serré, −0,03&nbsp;em, interligne 1,02', 'font-size:30px;font-weight:500;letter-spacing:-.03em;line-height:1.02', 'Torréfié mardi.'],
  ['Texte', 'Bricolage Regular 400', 'interligne 1,4', 'font-size:17px;line-height:1.4', 'Les cerises sèchent entières au soleil.'],
  ['Nom de café', 'Bricolage SemiBold 600', 'sur les pastilles et les fiches', 'font-size:26px;font-weight:600;letter-spacing:-.02em', 'Guji'],
  ['Grand chiffre', 'Bricolage Light 300', 'très grands chiffres seulement', 'font-size:34px;font-weight:300;letter-spacing:-.03em', '48&nbsp;h'],
  ['Étiquette', 'IBM Plex Mono 400 et 500', 'capitales espacées', 'font-family:var(--mono);font-size:13px;letter-spacing:.06em;text-transform:uppercase', 'Éthiopie · 2&nbsp;050&nbsp;m · 46,00&nbsp;€ le kilo']];
P.typo = `${head('Typographie', 'Bricolage Grotesque porte la voix de la marque. IBM Plex Mono, en capitales espacées, écrit tout ce qui se mesure&nbsp;: origine, altitude, prix au kilo, date.')}
  <div style="position:absolute;left:470px;top:26px;font-size:174px;line-height:1;font-weight:500;letter-spacing:-.04em;white-space:nowrap">Bricolage</div>
  <div class="mono" style="position:absolute;left:478px;top:214px;font-size:15px;letter-spacing:.04em">IBM Plex Mono — ABCDEFGHIJKLM 0123456789</div>
  <div style="position:absolute;left:470px;right:64px;top:262px">${hier.map(([a, f, r, st, ex]) =>
    `<div style="display:grid;grid-template-columns:130px 210px 1fr;align-items:center;gap:16px;min-height:74px;border-top:1px solid rgba(42,26,20,.14)">
      <span style="font-size:15px;font-weight:500">${a}</span><span style="font-size:13.5px;line-height:1.3">${f}<br><span style="opacity:.7">${r}</span></span><span style="${st}">${ex}</span></div>`).join('')}</div>
  ${mf('Typographie', 'typo')}`;

/* 05 — Motifs */
const TON = { cerise: 'Cerise', vert: 'Café vert', pulpe: 'Pulpe', grain: 'Grain', feuille: 'Feuille' };
const ang = [-6, 9, -3, 12, -8];
P.pastille = `${head('La pastille et le tampon', 'L’étiquette ronde de chaque café, comme celle qu’on colle sur un fruit. Un ton par café, toujours posée un peu de travers. Elle scelle les sachets, signe les gobelets, sert de vignette dans l’application.')}
  <div style="position:absolute;left:470px;right:64px;top:56px;display:grid;grid-template-columns:repeat(5,1fr)">${A.CAFES.map((c, i) =>
    `<div style="display:grid;justify-items:center;gap:12px;padding-top:${i % 2 ? 12 : 0}px">${A.pastille(c, 124, { angle: ang[i], pose: true })}<div class="cap2" style="font-size:10.5px;text-align:center;line-height:1.5">Ton ${TON[c.ton]}<br><span style="opacity:.65">${c.usage} · ${c.prix}</span></div></div>`).join('')}</div>
  <div style="position:absolute;left:470px;width:350px;top:300px">${L(.3)}${lab('Règles', C.grain, 'margin:14px 0 10px;opacity:.7')}${[
    'Penchée entre −8° et 12°, jamais droite.', 'Jamais sous 56&nbsp;px, jamais déformée.', 'Le nom en SemiBold, l’origine en IBM Plex Mono.', 'Les données viennent de la carte&nbsp;: on n’invente pas de café.'].map((t) =>
    `<p style="font-size:15px;line-height:1.35;padding:7px 0;border-bottom:1px solid rgba(42,26,20,.1)">${t}</p>`).join('')}</div>
  <div style="position:absolute;left:866px;width:350px;top:300px">${L(.3)}${lab('Le tampon', C.cerise, 'margin:14px 0 10px')}
    <div style="height:84px;display:flex;align-items:center"><div style="zoom:1.9;white-space:nowrap"><span class="tampon">${A.DATES.tampon}</span></div></div>
    <p style="font-size:15px;line-height:1.38">La date de torréfaction, en IBM Plex Mono Cerise, penchée de −3°. Sur le sachet et la fiche d’un café, nulle part ailleurs.</p></div>
  ${mf('Motifs', 'pastille')}`;

P.semis = `${head('Le semis et le symbole en grand', 'Des drupes en quinconce, chacune tournée d’un angle fixe, comme un papier d’emballage de fruits. Derrière un texte courant, le semis passe à 30&nbsp;%.')}
  ${box(470, 56, 368, 330, A.semis({ cols: 4, rows: 4, pas: 92, taille: 46, tons: [C.pulpe, C.vert, C.pulpe, C.vert, C.cerise] }), `background:${C.parche};overflow:hidden`)}
  <div class="g-vif grain" style="position:absolute;left:848px;top:56px;width:368px;height:330px;overflow:hidden">${A.semis({ cols: 4, rows: 4, pas: 92, taille: 46, tons: [C.pulpe], opacite: .4, seed: 2 })}</div>
  ${box(470, 424, 746, 178, `<div style="position:absolute;left:${746 - 300 * .86}px;top:18px">${A.symbol(C.cerise, 'style="width:300px;height:300px;display:block"')}</div>`, `background:${C.pulpe};overflow:hidden`)}
  <div class="cap2" style="position:absolute;left:470px;top:398px;font-size:11px;opacity:.75">Trois tons sur Parche · ton sur ton sur Cerise</div>
  <div style="position:absolute;left:492px;top:446px;width:300px">${lab('Le symbole en grand', C.grain)}<p style="font-size:14.5px;line-height:1.38;margin-top:8px">Il entre par un bord, coupé par deux, la queue visible. Au moins 1,2&nbsp;fois la hauteur du cadre. Un seul par composition.</p></div>
  ${mf('Motifs', 'semis')}`;

/* 06 — En situation */
const icon = (s) => `<div class="appi g-vif grain" style="width:${s}px;height:${s}px">${A.symbol(C.fleur)}</div>`;
P.ecrans = `${head('Écrans', 'Des fonds clairs, des cartes Fleur, un seul bouton Cerise par écran. La pastille sert de vignette&nbsp;; les dates et les prix sont écrits en toutes lettres.')}
  <div style="position:absolute;left:64px;top:470px;display:flex;align-items:center;gap:18px">${icon(84)}<div style="font-size:14px;line-height:1.38"><b style="font-weight:500">Icône</b><br><span style="opacity:.75">Symbole Fleur sur Cerise,<br>la queue en haut.</span></div></div>
  ${box(450, 0, 830, 720, '', `background:${C.parche}`)}
  ${[['accueil', 470, 74], ['carte', 668, 128], ['abonnement', 866, 50], ['fiche', 1064, 104]].map(([s, x, y]) =>
    `<div style="position:absolute;left:${x}px;top:${y}px">${A.phone(s === 'fiche' ? A.screens.fiche('guji') : A.screens[s](), .45)}</div>`).join('')}
  ${mf('En situation', 'ecrans')}`;

P.emballage = `${head('Emballage', 'Un sachet blanc cassé à soufflet, scellé par la pastille du café&nbsp;: le nom en grand, l’origine, le tampon de la date. La boîte d’abonnement porte le logotype au pochoir et un papier de soie au semis.')}
  ${img('14-sachets.png', 470, 56, 746, 300, 'Sachets 250&nbsp;g · pastille, étiquette, tampon', '50% 60%')}
  ${img('16-boite.png', 470, 404, 368, 186, 'Boîte d’abonnement · carte «&nbsp;Torréfié mardi&nbsp;»', '50% 55%')}
  ${img('17-gobelet.png', 848, 404, 368, 186, 'Gobelet Fleur et pastille · tasse en grès Café vert', '50% 62%')}
  ${mf('En situation', 'emballage')}`;

P.boutique = `${head('Boutique et papeterie', 'De jour, toujours&nbsp;: façade Parche, lettres DRUPE découpées en Cerise, store Café vert. Les cartes ont un recto Cerise et un verso Fleur&nbsp;; l’affiche écrit le triptyque.')}
  ${img('18-devanture.png', 470, 56, 460, 534, 'Devanture d’angle · enseigne drapeau au symbole', '42% 50%')}
  ${img('24-papeterie.png', 940, 56, 276, 252, 'Cartes, carte de fidélité, sac kraft', '0% 50%')}
  ${img('20-colonne.png', 940, 356, 276, 234, 'Colonne d’affichage · le triptyque', '78% 50%')}
  ${mf('En situation', 'boutique')}`;

/* Dos */
P.dos = `${bg(C.feuille)}
  <div style="position:absolute;left:0;right:0;top:232px;display:grid;justify-items:center;gap:40px">${A.lockup(C.fleur, 'style="width:440px;display:block"')}
    <div class="mono" style="color:${C.vert};font-size:15px;letter-spacing:.04em;text-align:center;line-height:1.9">www.drupe-cafe.fr · bonjour@drupe-cafe.fr · @drupe.cafe<br>À l’angle de la rue du Tambour · du mardi au samedi, 8&nbsp;h à 18&nbsp;h · 04&nbsp;65&nbsp;71&nbsp;02&nbsp;47</div></div>
  <div class="mf" style="color:${C.vert};grid-template-columns:1fr auto"><span>Le café est un fruit. Torréfié au coin de la rue.</span><span>Guide de marque · version 1.0 · 2026©</span></div>`;

window.GuidePages = P;
window.GuideOrder = ORDER;
window.GuideTitles = TITLES;
})();
