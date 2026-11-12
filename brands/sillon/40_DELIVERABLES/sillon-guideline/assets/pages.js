/* FICHE DE MARQUE — Sillon (deck/pages.js). Huit pages de 1920 × 1080, pour deux personnes qui appliquent l'identité
   seules : le fondateur de la cave et quelqu'un qui l'aide. Une page, une chose à retenir.

   Tout ce qui est dit vient de MARQUE.md et du socle (brand/) ; tout ce qui est montré est rendu par Marque et Verse.
   Rendu : node tools/deck.mjs (PNG dans out/deck/), puis python tools/deck_pdf.py (out/deck/sillon-fiche-de-marque.pdf).

   CONTRAT lu par deck/render.html et tools/deck.mjs :
   - window.GuidePages { clé : HTML d'une page }, window.GuideOrder (les clés dans l'ordre), window.GuideTitles.
   - window.GuideApres(racine) : appelé après l'écriture d'une page ; rend les canvas du remplisseur et renvoie une
     promesse (render.html la pose dans window.pret, que deck.mjs et check_planche attendent).
   - Chaque page est un .plate.fm-page de 1920 × 1080. Classes fm- (commun) et fm1- à fm8-. */
(function () {
const A = window.Marque, C = A.COULEURS, NB = A.NB, K = A.CONSTRUCTION, cv = A.cvs, J = A.JUS;
const img = (sub, f) => (window.GuideMedia || '../out/' + sub + '/') + f;
const v = (n, d = 2) => String(Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).replace('.', ',');

const ORDER = ['idee', 'logo', 'interdits', 'couleurs', 'ecrire', 'kit', 'annonce', 'fichiers'];
const TITLES = ['L’idée', 'Le logo', 'Ce qu’on ne fait pas', 'Les couleurs', 'Écrire', 'Le kit', 'Faire une annonce', 'Les fichiers et les limites'];
const num = (k) => ORDER.indexOf(k) + 1;
const pad = (n) => String(n).padStart(2, '0');

/* ---------- commun ---------- */
const tete = (k) => `<div class="fm-tete t-etq"><span>${pad(num(k))} · ${TITLES[num(k) - 1]}</span><span>${A.NOM} · fiche de marque · novembre${NB}2026</span></div>`;
const pied = (k, o = {}) => `<div class="fm-pied t-etq" style="${o.style || ''}">${A.symbol('currentColor')}<span>${A.DESCRIPTEUR} · ${A.LIEU}</span><span class="fm-n">${num(k)}${NB}/${NB}${ORDER.length}</span></div>`;
const page = (k, fond, corps, o = {}) => `<div class="plate fm-page ${fond} lumiere ${o.cls || ''}" data-page="${k}"><div class="fm-in">${o.sansTete ? '' : tete(k)}${corps}${o.sansPied ? '' : pied(k, o)}</div></div>`;
const croix = (c = C.cave) => `<svg class="fm-croix" viewBox="0 0 16 16" fill="none" stroke="${c}" stroke-width="2.4"><path d="M2,2 L14,14 M14,2 L2,14"/></svg>`;
const P = {};

/* ======================= 1 · L'idée =======================
   Le sergé à gauche, la photo du verre penché à droite, le logotype en pierre qui passe de l'un à l'autre. */
P.idee = page('idee', 'fond-bleu', `
  <div class="fm1-photo">${A.photo('verre-penche', { pos: '62% 46%' })}</div><div class="fm1-ombre"></div>
  <div class="fm-a t-etq fm-k" style="left:84px;top:134px">Cave à vins nature · Nantes, quartier des Olivettes</div>
  <div class="t-sous fm1-idee">Il y a un creux dans Sillon, entre ses deux L. On le remplit.</div>
  <ol class="fm1-trois">
    <li><span class="t-etq">Une forme</span><span>Les deux L soudés font un verre.</span></li>
    <li><span class="t-etq">Une règle</span><span>Tout ce qui est creux et ouvert vers le haut peut se remplir.</span></li>
    <li><span class="t-etq">Un geste</span><span>Le mot penche de 12${NB}degrés. Le vin reste d’aplomb.</span></li>
  </ol>
  <div class="t-sous fm1-sign">On remplit les creux.</div>
  <div class="fm1-logo"><canvas data-logo data-taille="112" data-angle="-12"></canvas></div>
  <div class="fm1-ce">${A.contre({ sujet: 'Fiche de marque', lignes: [['Pages', '8'], ['Ce qui penche', 'le mot, le logo, le cadre'], ['Ce qui ne penche pas', 'le vin']], grands: [`12,5${NB}cl`, A.deg(12)], voix: A.VOIX.sousVerre, l: 262 })}</div>
`, { style: 'right:1100px' });

/* ======================= 2 · Le logo =======================
   Sur le papier : quatre versions et quand prendre laquelle, puis la zone, les tailles, les couleurs permises. */
const m = K.creux.l;
const zone = `<svg viewBox="${-m - 6} ${-m - 6} ${K.largeur + 2 * m + 12} ${100 + 2 * m + 12}" style="width:100%;height:auto;overflow:visible">
  <rect x="${-m}" y="${-m}" width="${K.largeur + 2 * m}" height="${100 + 2 * m}" fill="none" stroke="${C.cave}" stroke-width="2" stroke-dasharray="6 8"/>
  ${[[-m, 50 - m / 2], [K.largeur, 50 - m / 2], [K.creux.x, -m], [K.creux.x, 100]].map(([x, y]) => `<path fill="none" stroke="${C.cave}" stroke-width="2" d="M${x},${y} h${m} v${m} h${-m} Z M${x},${y} l${m},${m} M${x + m},${y} l${-m},${m}"/>`).join('')}
  <path fill="${C.maceration}" d="${A.jusPath()}"/><path fill="${C.bleu}" d="${A.lettersPath()}"/></svg>`;
const SB = A.LOGO.symbolBox, ms = SB[2] / 2;
const zoneSym = `<svg viewBox="${-ms - 4} ${-ms - 4} ${SB[2] + 2 * ms + 8} ${SB[3] + 2 * ms + 8}" style="height:100%;width:auto;overflow:visible">
  <rect x="${-ms}" y="${-ms}" width="${SB[2] + 2 * ms}" height="${SB[3] + 2 * ms}" fill="none" stroke="${C.cave}" stroke-width="2.4" stroke-dasharray="7 9"/>
  <path fill="none" stroke="${C.cave}" stroke-width="2" d="M${-ms},${SB[3] / 2} H0 M${SB[2]},${SB[3] / 2} H${SB[2] + ms}"/>
  ${A.symbol(C.bleu, `x="0" y="0" width="${SB[2]}" height="${SB[3]}"`, 'maceration')}</svg>`;
const versions = [
  ['Le logotype', `<canvas data-logo data-taille="44" data-mode="imprime" data-c="bleu"></canvas>`, `Le nom, partout où il tient en largeur : il est 7,6${NB}fois plus large que haut.`],
  ['Le logotype penché', A.penche(C.bleu, { jus: 'maceration', attrs: 'style="width:318px;height:auto"' }), 'Monte de 12°, son vin reste à niveau. Pour une ouverture, une affiche.'],
  ['Le symbole', A.symbol(C.bleu, 'style="height:122px;width:auto"', 'maceration', { detail: true }), 'Le verre seul. L’avatar, la puce, le motif ; et dès que le format est étroit.'],
  ['La version complète', A.lockup(C.bleu, 'style="width:340px;height:auto"', 'maceration'), 'Pour se présenter à qui ne connaît pas Sillon : la devanture, une carte, le colis. Ailleurs, le logotype seul.'],
];
const mini = [
  [A.wordmark(C.bleu, 'style="width:64px;height:auto"', 'maceration'), `<b>Logotype</b> · 64${NB}px ou 17${NB}mm de large. En dessous, le symbole.`],
  [A.penche(C.bleu, { jus: 'maceration', attrs: 'style="width:64px;height:auto"' }), `<b>Penché</b> · comme le logotype, 64${NB}px ou 17${NB}mm.`],
  [A.lockup(C.bleu, 'style="width:120px;height:auto"', 'maceration'), `<b>Complète</b> · 120${NB}px ou 32${NB}mm, pour que le descripteur se lise.`],
  [A.symbol(C.bleu, 'style="height:16px;width:auto"'), `<b>Symbole</b> · 16${NB}px ou 4${NB}mm.`],
];
P.logo = page('logo', 'fond-tuffeau', `
  <h2 class="fm-h fm2-h">Quatre versions, un seul creux.</h2>
  <p class="fm-chapo fm2-chapo">Le creux des deux L est plein aux deux tiers, de macération : la seule couleur vive du logo.</p>
  <div class="fm2-versions">${versions.map(([n, s, t], i) => `<div class="fm2-v"><div class="fm-papier"><span class="fm-tag t-etq">${i + 1}</span>${s}</div><div><div class="t-sous">${n}</div><p class="t-txt" style="margin-top:6px">${t.replace('12°', A.deg(12))}</p></div></div>`).join('')}</div>
  <div class="fm2-bas">
    <div class="fm2-bloc"><span class="t-etq">Zone de protection</span>${zone}
      <p class="t-petit" style="margin-top:12px">Logotype, penché, version complète : la largeur du creux tout autour (0,66${NB}fois la hauteur des capitales).</p>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center;margin-top:16px"><div style="height:104px">${zoneSym}</div><p class="t-petit">Symbole : la moitié de sa largeur tout autour. Rien n’y entre, ni texte ni bord de page.</p></div></div>
    <div class="fm2-bloc"><span class="t-etq">Tailles minimales, et quel fichier prendre</span>
      <div class="fm2-tailles">${mini.map(([s, t]) => `<div><div>${s}</div><p class="t-petit">${t}</p></div>`).join('')}
        <div style="grid-template-columns:repeat(3,1fr);align-items:end;padding-top:14px">${[['Moins de 32 px', 'un aplat', 'sans suffixe', A.symbol(C.bleu, 'style="height:26px;width:auto"')], ['De 32 à 200 px', 'deux couleurs', '-jus', A.symbol(C.bleu, 'style="height:50px;width:auto"', 'maceration')], ['Au-delà', 'disque, lie, bulles', '-grand', A.symbol(C.bleu, 'style="height:84px;width:auto"', 'maceration', { detail: true })]].map(([a, b, f, s]) => `<div style="display:flex;flex-direction:column;gap:7px;align-items:flex-start">${s}<span class="t-etq">${a.replace(/ px/, NB + 'px')}</span><span class="t-petit" style="margin-top:-6px">${b}<br><b style="white-space:nowrap">${f}</b></span></div>`).join('')}</div>
      </div></div>
    <div class="fm2-bloc"><span class="t-etq">Couleurs permises</span>
      <div class="fm2-coul">
        <div><div class="fond-bleu lumiere"><div style="position:relative;z-index:2"><canvas data-logo data-taille="27"></canvas></div></div><p class="t-petit">Sur le bleu : lettres tuffeau, vin macération.</p></div>
        <div><div class="fond-craie lumiere"><div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:12px">${A.wordmark(C.bleu, 'style="width:200px;height:auto"', 'maceration')}<div style="display:flex;gap:16px">${A.wordmark(C.cave, 'style="width:92px;height:auto"', 'glou')}${A.wordmark(C.cave, 'style="width:92px;height:auto"', 'paille')}</div></div></div><p class="t-petit">Sur tuffeau ou craie : lettres bleues ou fond de cave. Macération ; glou ou paille si la pièce parle de ce jus.</p></div>
        <div><div class="jus-maceration">${A.wordmark(C.cave, 'style="width:200px;height:auto"')}</div><p class="t-petit">Sur un jus : un seul aplat, fond de cave.</p></div>
        <div><div style="background:${C.cave}">${A.photo('dos-veste', { pos: '50% 42%', style: 'position:absolute;inset:0' })}<div style="position:relative;z-index:8"><canvas data-logo data-taille="27"></canvas></div></div><p class="t-petit">Sur une photo : une zone calme, lettres tuffeau. Jamais sur un visage ni sur un verre.</p></div>
      </div></div>
  </div>
`);

/* ======================= 3 · Ce qu'on ne fait pas =======================
   Huit paires sur le sergé : ce qu'on fait, ce qu'on ne fait pas. Quatre sur le logo, quatre sur la pente. */
const lg = (corps, w = 172) => `<svg viewBox="${A.LOGO.box.join(' ')}" style="width:${w}px;height:auto;overflow:visible">${corps}</svg>`;
const nx = K.x[4];
const ceMini = (rot) => `<div style="zoom:.66;transform:rotate(${rot}deg)">${A.contre({ sujet: 'Dégustation', lignes: [['Le jus', 'Glou']], grands: [`12,5${NB}cl`, A.deg(12)], jus: 'glou', l: 236 })}</div>`;
const paires = [
  ['Le verre et les lettres penchent, le vin reste horizontal.', A.symbol(C.bleu, 'style="height:118px;width:auto"', 'maceration'), `<div style="transform:rotate(12deg)">${A.verre({ taille: 100, angle: 0, c: C.bleu, detail: false })}</div>`],
  ['Un seul creux se remplit : celui des deux L.', A.wordmark(C.bleu, 'style="width:172px;height:auto"', 'maceration'), lg(`<path fill="${C.maceration}" d="${A.jusPath()} M${nx + 84.35},22 H${nx + 120} V69 Z"/><path fill="${C.bleu}" d="${A.lettersPath()}"/>`)],
  ['Le creux n’est jamais vide. En une couleur, le vin y reste en bloc.', A.symbol(C.bleu, 'style="height:118px;width:auto"'), `<svg viewBox="${A.LOGO.symbolBox.join(' ')}" style="height:118px;width:auto"><path fill="${C.bleu}" d="${A.symbolParts().verre}"/></svg>`],
  ['Les lettres ne prennent jamais la couleur d’un jus.', A.wordmark(C.cave, 'style="width:172px;height:auto"', 'maceration'), lg(`<path fill="${C.bleu}" d="${A.jusPath()}"/><path fill="${C.maceration}" d="${A.lettersPath()}"/>`)],
  ['On tourne le mot. On ne le cisaille pas : le vin y pencherait.', cv('GLO[U].', { taille: 46, angle: -12, mode: 'imprime', c: 'bleu' }), `<div style="transform:skewY(-12deg)">${cv('GLO[U].', { taille: 46, angle: 0, mode: 'imprime', c: 'bleu' })}</div>`],
  ['12 degrés, dans un sens ou dans l’autre. Pas plus.', cv('GLO[U].', { taille: 46, angle: 12, mode: 'imprime', c: 'bleu', jus: 'glou' }), cv('GLO[U].', { taille: 38, angle: 30, mode: 'imprime', c: 'bleu', jus: 'glou' })],
  ['La contre-étiquette reste droite, même quand tout penche.', ceMini(0), ceMini(12)],
  ['La ligne d’une photo ne penche jamais, même dans un cadre penché.', A.cadre('verre-penche', { l: 118, h: 150, mode: 'niveau', niveau: 0.5 }), `<div class="cadre" style="width:118px;height:150px;transform:rotate(12deg)">${A.photo('verre-penche', { mode: 'niveau', niveau: 0.5, style: 'position:absolute;inset:0' })}</div>`],
];
P.interdits = page('interdits', 'fond-bleu', `
  <h2 class="fm-h fm3-h">Ce qu’on ne fait pas.</h2>
  <p class="fm-chapo fm3-chapo">À gauche ce qu’on fait, à droite ce qu’on ne fait pas. Quatre gestes sur le logo, quatre sur la pente de 12${NB}degrés.</p>
  <div class="fm3-grille fm-sur-sombre">${paires.map(([t, oui, non], i) => `<div><div class="fm3-paire">
      <div class="fm3-t fm-papier"><span class="fm-tag t-etq">Oui</span>${oui}</div>
      <div class="fm3-t fm-papier fm3-non"><span class="fm-tag t-etq">Non</span>${croix()}${non}</div></div>
      <p class="fm3-regle t-txt"><span class="fm-num">${i + 1}</span><span>${t}</span></p></div>`).join('')}</div>
  <div class="fm3-ligne"><span class="t-etq">La règle en une phrase</span><i></i><span class="t-sous" style="font-size:30px">Ça penche, ça tient. Le vin, jamais.</span></div>
`);

/* ======================= 4 · Les couleurs =======================
   Sur le mur de cave : cinq matières, trois jus dans leur verre, les contrastes mesurés. */
const ct = (a, b) => A.contraste(a, b);
const encre = (h) => (A.contraste(h, C.cave) > A.contraste(h, C.tuffeau) ? C.cave : C.tuffeau);
const surfaces = [['bleu', 'fond-bleu'], ['cave', 'fond-cave'], ['tuffeau', 'fond-tuffeau'], ['craie', 'fond-craie'], ['lave', 'fm4-lave']];
const bande = (k, noms) => `<div class="fm4-bande">${A.ECHELLES[k].map((h, i) => `<div class="t-etq" style="background:${h};color:${encre(h)}">${noms ? noms[i] + '<br>' + h : h}</div>`).join('')}</div>`;
const rond = (a, b) => `<svg viewBox="0 0 58 34"><circle cx="17" cy="17" r="16" fill="${a}"/><circle cx="41" cy="17" r="16" fill="${b}" style="mix-blend-mode:multiply"/></svg>`;
P.couleurs = page('couleurs', 'fond-cave', `
  <h2 class="fm-h fm4-h">Huit couleurs, dont trois jus.</h2>
  <p class="fm-chapo fm4-chapo">Une couleur de Sillon n’est jamais un aplat : le bleu est un sergé, le tuffeau un papier ou une pierre. Les jus n’existent que dans un creux.</p>
  <div class="fm4-surf">${surfaces.map(([k, f]) => `<div class="fm4-s ${f} lumiere" style="${k === 'lave' ? `background:${C.lave};color:${C.cave}` : ''}">
      <div class="t-sous">${A.NOMS[k]}</div><div class="t-etq">${C[k]}</div><p class="t-petit">${A.ROLES[k].replace(/^le /, 'Le ').replace(/^la /, 'La ')}.</p></div>`).join('')}</div>
  <div class="fm4-ech">
    <div><span class="t-etq">Bleu : de la nuit de cave au bleu lavé</span>${bande('bleu', ['Nuit de cave', 'Veste neuve', 'Bleu de travail', 'Veste portée', 'Bleu lavé'])}</div>
    <div><span class="t-etq">Tuffeau : de la taille fraîche à la pierre à l’ombre</span>${bande('tuffeau', ['Taille fraîche', 'Tuffeau', 'Craie', 'Pierre patinée', 'Pierre à l’ombre'])}</div>
  </div>
  <div class="fm4-jus">${J.map((k) => `<div class="fm4-j"><div class="fm4-cv">${cv('[U]', { taille: 118, p: 0.84, jus: k, fond: 'cave' })}</div>
      <div class="t-sous">${A.NOMS[k]}</div><div class="t-etq fm4-dit">${C[k]} · ${A.MATIERES[k].dit}</div>
      <div class="fm4-tons">${A.ECHELLES[k].map((h, i) => `<div><i style="background:${h}"></i><span class="t-petit">${A.TONS[i]}</span><span class="t-etq">${h}</span></div>`).join('')}</div></div>`).join('')}</div>
  <div class="fm4-crois"><span class="t-etq">Deux jus qui se croisent</span>${A.CROISEMENTS.map((x) => `<span>${rond(x.tons[0], x.tons[1])}<span class="t-etq">${x.nom}<br>${x.hex}</span></span>`).join('')}</div>
  <div class="fm4-prop"><span class="t-etq">Sur une pièce</span><div class="fm4-barre"><i class="fond-bleu" style="flex:66"></i><i class="fond-tuffeau" style="flex:24"></i><i style="flex:3.4;background:${C.maceration}"></i><i style="flex:3.3;background:${C.glou}"></i><i style="flex:3.3;background:${C.paille}"></i></div>
    <p class="t-petit">Le bleu ou le tuffeau porte la pièce : deux tiers. L’autre fait le texte et les papiers : un quart. Les jus, moins d’un dixième.</p></div>
  <div class="fm-a t-etq" style="left:84px;top:836px">Contrastes mesurés</div>
  <div class="fm4-contr">
    ${[['tuffeau', 'bleu', 'Tuffeau sur bleu', 'Le texte sur le bleu.'], ['cave', 'tuffeau', 'Fond de cave sur tuffeau', 'Le texte courant.'], ['cave', 'maceration', 'Fond de cave sur macération', 'Le texte posé sur un jus.']].map(([a, b, n, t]) => `<div class="fm4-c"><b style="color:${C[a]};background:${C[b]}">Aa</b><div><div class="t-sous">${v(ct(a, b))}${NB}:${NB}1</div><div class="t-etq">${n}</div><p class="t-petit fm-k">${t}</p></div></div>`).join('')}
    <div class="fm4-c"><b style="color:${C.maceration};background:${C.bleu};position:relative">Aa${croix(C.tuffeau)}</b><div><div class="t-sous">${v(ct('maceration', 'bleu'))}${NB}:${NB}1</div><div class="t-etq">Macération sur bleu</div><p class="t-petit fm-k">Jamais en texte. Aucun jus ne sert de couleur de texte.</p></div></div>
  </div>
`);

/* ======================= 5 · Écrire =======================
   Sur le papier blanc : le titre à verres coté, ses trois règles, les quatre styles, le ton, six phrases. */
const ton = A.TON.map(([o, n]) => `<div><div class="t-sous">${o}</div></div><div style="display:flex;align-items:center"><span class="fm5-evite">${n}</span></div>`).join('');
const voix = [['Au dos de la bouteille', A.VOIX.dos], ['Sur l’affiche, en vitrine', A.VOIX.vitrine], ['Dans la nappe', A.VOIX.nappe], ['Dans le colis du mois', A.VOIX.colis], ['Sur le sous-verre', A.VOIX.sousVerre], ['Sur la carte', A.VOIX.carte]];
const polices = [
  ['Titre', `Anybody 900 · capitales<br>serrées à 62,5${NB}% · verres à 150${NB}%`,A.titre('TROIS BO[U]TEILLES PAR MOIS.', { taille: 42, style: `color:${C.bleu}` })],
  ['Sous-titre et voix', `Anybody 800 · largeur 100${NB}%<br>bas de casse`, `<div class="t-sous" style="font-size:30px;color:${C.bleu}">Non filtré. Nous non plus.</div>`],
  ['Texte', 'Hanken Grotesk<br>400 et 500', `<p class="t-txt" style="font-size:18px">Une cave à vins nature, une dégustation le jeudi soir, trois bouteilles par mois.</p>`],
  ['Mention', `Anybody 600 · 75${NB}%<br>capitales espacées`, `<div class="t-etq" style="font-size:14px">Contenance 75${NB}cl · 12${NB}%${NB}vol. · Non filtré</div><p class="t-petit fm-k" style="margin-top:6px">Le degré : « 75${NB}cl 12° » sur une contre-étiquette, « 12${NB}%${NB}vol. » dans une ligne ou un tableau.</p>`],
];
P.ecrire = page('ecrire', 'fond-blanc', `
  <div class="fm5-titre"><div style="position:relative;display:inline-block" id="fm5-w">${cv('JE[U]DI, ON GO[Û]TE.', { taille: 138, mode: 'imprime', c: 'bleu', jus: 'maceration,glou', id: 'fm5-t' })}<div class="fm5-cotes" id="fm5-cotes"></div></div></div>
  <div class="fm-a" style="left:84px;top:420px;width:560px">
    <div class="t-etq" style="margin-bottom:14px">Le titre à verres</div>
    ${[['U, V et Û deviennent des verres.', `Larges à 150${NB}%, remplis d’un jus. Les autres lettres restent serrées à 62,5${NB}%.`], ['Un ou deux verres par mot.', 'Un mot sans U ni V reste serré, sans verre : la phrase prend son verre dans un autre mot.'], ['Trois mots, un point.', 'Une phrase de comptoir, avec « on ». Toujours un point à la fin.']].map(([a, b], i) => `<div style="display:grid;grid-template-columns:38px 1fr;border-top:2px solid ${C.bleu};padding:12px 0 16px"><span class="fm-num" style="color:${C.bleu};padding-top:6px">${i + 1}</span><div><div class="t-sous" style="font-size:27px;color:${C.bleu}">${a}</div><p class="t-petit" style="margin-top:6px">${b}</p></div></div>`).join('')}
  </div>
  <div class="fm-a" style="left:84px;top:744px;width:560px">
    <div class="t-etq" style="margin-bottom:12px">Les titres prêts</div>
    <div style="display:flex;flex-wrap:wrap;gap:12px 22px;align-items:baseline;color:${C.bleu};border-top:2px solid ${C.bleu};padding-top:16px">${['jeudi', 'abonnement', 'chantier', 'ouverture', 'jus', 'glou', 'rdv'].map((k, i) => cv(A.PHRASES[k], { taille: 23, mode: 'imprime', c: 'bleu', jus: [J[i % 3], J[(i + 1) % 3]].join(',') })).join('')}</div>
  </div>
  <div class="fm-a" style="left:700px;top:420px;width:470px">
    <div class="t-etq" style="margin-bottom:14px">Deux polices, quatre styles</div>
    ${polices.map(([n, s, ex]) => `<div style="border-top:1.5px solid rgba(14,22,56,.22);padding:11px 0 14px"><div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:9px"><span class="t-etq"><b>${n}</b></span><span class="t-etq fm-k" style="text-align:right">${s}</span></div>${ex}</div>`).join('')}
  </div>
  <div class="fm5-droite" style="top:420px">
    <div class="t-etq" style="margin-bottom:14px">Le ton : on dit, on évite</div>
    <div class="fm5-ton">${ton}</div>
    <div class="t-etq" style="margin:30px 0 12px">Six phrases, chacune sur son objet</div>
    <div class="fm5-voix" style="margin-top:0">${voix.map(([o, t]) => `<div><span class="t-etq fm-k">${o}</span><span class="t-sous">${t}</span></div>`).join('')}</div>
  </div>
`);

/* ======================= 6 · Le kit =======================
   Sur la craie : la pièce maîtresse en grand à gauche, les six autres éléments à droite, chacun montré. */
const kit = (i, nom, quoi, quand, demo, fond, st = '') => `<div class="fm6-c ${fond} lumiere" style="${st}"><div class="fm6-demo">${demo}</div>
  <div class="fm6-txt"><span class="t-etq"><span class="fm-num" style="font-size:13px">${i}</span>${NB}${NB}<b>${nom}</b></span><p>${quoi}</p><p class="fm6-quand"><b>Quand :</b> ${quand}</p></div></div>`;
P.kit = page('kit', 'fond-craie', `
  <h2 class="fm-h fm6-h">Sept éléments. Sans le nom, on reconnaît Sillon.</h2>
  <p class="fm-chapo fm6-chapo" style="top:184px;left:84px;width:1000px;font-size:19px">Chacun vient de l’idée : un creux qu’on remplit, et qui penche sans renverser.</p>
  <div class="fm6-grand fond-blanc lumiere"><div class="fm6-demo"><div style="display:flex;flex-direction:column;gap:14px;align-items:center;position:relative;z-index:2">
      ${['ABCDEFG', 'HIJKLMN', 'OPQRSTU', 'VWXYZ'].map((t, i) => cv(t, { taille: 72, tout: '', serre: 'normal', jus: [J[i % 3], J[(i + 1) % 3], J[(i + 2) % 3]].join(','), mode: 'imprime', c: 'bleu', inter: 0.06 })).join('')}</div></div>
    <div class="fm6-txt" style="padding:16px 22px 22px"><span class="t-etq"><span class="fm-num" style="font-size:13px">7</span>${NB}${NB}<b>L’abécédaire à ras bord</b></span><p>La pièce maîtresse : le moteur remplit chaque lettre de ce qu’elle peut tenir, et le mesure. Un U plein fait un verre, 12,5${NB}cl.</p><p class="fm6-quand"><b>Quand :</b> la seule pièce où tout est plein. Partout ailleurs, seuls les verres le sont.</p></div></div>
  <div class="fm6-grille">
    ${kit(1, 'Le creux rempli', 'Le verre des deux L, penché, son vin horizontal.', 'puce, motif, avatar. Les verres penchent chacun à leur façon.', `<canvas id="fm6-verres"></canvas>`, 'fond-bleu')}
    ${kit(2, 'Les trois jus', 'Macération, trouble ; glou, limpide ; paille, il perle.', 'dans un creux, du disque à la lie. Jamais en texte.', cv('[U][U][U]', { taille: 56, jus: J.join(','), p: 0.84, inter: 0.05, fond: 'cave' }), 'fond-cave')}
    ${kit(3, 'La voix à verres', 'Capitales serrées ; les U et les V, larges comme des verres.', 'les titres. Un ou deux verres par mot.', cv('D[U] J[U]S.', { taille: 44, mode: 'imprime', c: 'bleu', jus: 'paille,glou' }), 'fond-blanc')}
    ${kit(4, 'Douze degrés', 'Tout penche de 12°, le degré d’un vin de soif. Le vin, jamais.', 'un mot, un logo, un cadre. On tourne, on ne cisaille pas.', `<div style="display:flex;gap:6px;align-items:center">${cv('GLO[U].', { taille: 34, angle: -12 })}${cv('GLO[U].', { taille: 34, angle: 12, jus: 'paille' })}</div>`, 'fond-bleu')}
    ${kit(5, 'La contre-étiquette', 'Le petit papier du dos de la bouteille : deux gros chiffres, des mentions.', 'une par pièce, toujours droite. Elle porte la mention sanitaire.', `<div style="zoom:.92">${A.contre({ sujet: 'Le Plein', lignes: [['Bouteilles', '3 par mois']], grands: [`75${NB}cl`, A.deg(12)], l: 250 })}</div>`, 'fond-tuffeau')}
    ${kit(6, 'L’image à niveau', 'Une photo remplie d’un jus jusqu’à une ligne horizontale.', 'toute photo de la marque. La ligne ne penche jamais.', `<div style="display:flex;gap:12px;align-items:center">${A.photo('comptoir', { mode: 'niveau', niveau: 0.5, style: 'width:170px;height:150px' })}${A.cadre('caviste', { l: 96, h: 126, mode: 'niveau', jus: 'glou', niveau: 0.45 })}</div>`, 'fond-cave')}
  </div>
`);

/* ======================= 7 · Faire une annonce =======================
   Sur le mur de cave : les quatre modèles, leurs deux formats, la contre-étiquette et sa mention, l'outil. */
const modeles = [
  ['21-jeudi-4x5-a.png', 'Le jeudi', 'Chaque semaine, la dégustation.', 'On change la phrase et le jus du soir.'],
  ['22-plein-4x5-a.png', 'Le Plein du mois', 'Chaque mois, l’abonnement.', 'On change le mois et les trois jus.'],
  ['23-arrivage-4x5-c.png', 'Un arrivage', 'Un jus qui vient d’arriver.', 'On change la photo et le jus.'],
  ['24-phrase-4x5-a.png', 'Une phrase', 'Une phrase de comptoir, seule.', 'On change la phrase et l’endroit où elle est écrite.'],
];
const fmt = (x, l, h, haut, bas, nom, dims) => { const k = 140 / 1080, W = l * k, H = h * k, s = 64 * k;
  return `<g transform="translate(${x},0)"><rect width="${W}" height="${H}" fill="${C.bleu}"/><rect x="${s}" y="${haut * k}" width="${W - 2 * s}" height="${H - haut * k - bas * k}" fill="none" stroke="${C.tuffeau}" stroke-width="1.4" stroke-dasharray="4 4"/>
    ${haut * k > 20 ? `<text x="${W / 2}" y="${haut * k / 2 + 4}" text-anchor="middle">${haut}</text><text x="${W / 2}" y="${H - (bas * k) / 2 + 4}" text-anchor="middle">${bas}</text>` : `<text x="${W / 2}" y="${H / 2 + 4}" text-anchor="middle">${haut} TOUT AUTOUR</text>`}
    <text x="0" y="${H + 22}" style="fill:${C.tuffeau}">${nom}</text><text x="0" y="${H + 40}" style="fill:${C.tuffeau};opacity:.7">${dims}</text></g>`; };
P.annonce = page('annonce', 'fond-cave', `
  <h2 class="fm-h fm7-h">Chaque jeudi, une annonce.</h2>
  <p class="fm-chapo fm7-chapo">Quatre modèles prêts. On change les mots, le jus, la photo ; la mise en page, le verre et la mention restent.</p>
  <div class="fm7-modeles">${modeles.map(([f, n, q, c]) => `<div class="fm7-m"><img src="${img('reseaux', f)}" alt=""><div class="t-sous">${n}</div><p>${q} ${c}</p></div>`).join('')}</div>
  <div class="fm7-formats"><div class="t-etq" style="margin-bottom:14px">Deux formats, une zone sûre</div>
    <svg viewBox="0 0 328 300" style="width:328px;height:300px;overflow:visible;font-family:var(--mono);font-stretch:75%;font-weight:600;font-size:12px;letter-spacing:.06em;fill:${C.tuffeau}">
      ${fmt(0, 1080, 1350, 64, 64, 'PUBLICATION 4:5', '1080 × 1350 PX')}${fmt(176, 1080, 1920, 250, 340, 'STORY 9:16', '1080 × 1920 PX')}</svg>
    <p class="t-petit" style="margin-top:6px">Marges en pixels. Rien d’important hors des pointillés : en story, le réseau couvre le haut et le bas. Sur les côtés, 64${NB}px.</p></div>
  <div class="fm7-bas fm-sur-sombre">
    <div>${A.contre({ sujet: 'Dégustation au verre', lignes: [['Le jus du soir', 'Macération']], grands: [`12,5${NB}cl`, A.deg(12)], voix: A.VOIX.carte, sanitaire: true, l: 316 })}</div>
    <div><div class="t-sous">Une contre-étiquette par annonce.</div>
      <p class="t-txt" style="margin-top:8px">Toujours droite. Elle dit le jus et la contenance ; sa dernière ligne porte la mention sanitaire, obligatoire sur toute annonce :</p>
      <div class="fm7-mention">${A.MENTION_SANITAIRE}</div>
      <p class="t-petit fm-k">En corps 22${NB}px au moins dans un fichier de 1080${NB}px. Sur une affiche ou une carte, elle va au pied.</p></div>
    <div class="fm7-outil"><img src="${img('outil', 'capture-jeudi.png')}" alt=""><div><div class="t-sous">L’outil : taper, choisir, exporter.</div>
      <p class="t-petit" style="margin-top:8px">On l’ouvre par <b>outil/ouvrir.bat</b>. On tape la phrase, on choisit le modèle, le jus et le format, puis on exporte un PNG de 1080${NB}×${NB}1350 ou 1080${NB}×${NB}1920.</p>
      <p class="t-petit fm-k" style="margin-top:8px">Mode d’emploi : outil/LISEZMOI.md. Avant de publier, relire la phrase.</p></div></div>
  </div>
`);

/* ======================= 8 · Les fichiers et les limites =======================
   Sur le papier : les 24 fichiers logo montrés, les douze photos ; à droite, le dos de la fiche, en contre-étiquette. */
const ordre = ['logotype', 'logotype-jus', 'logotype-grand', 'penche-jus', 'symbole', 'symbole-jus', 'symbole-grand', 'complet'];
const fondDe = { bleu: 'fond-blanc', cave: 'fond-craie', tuffeau: 'fond-bleu' };
const fichiers = ordre.flatMap((o) => ['bleu', 'cave', 'tuffeau'].map((c) => [o, c]));
const ligne = (a, b) => `<div class="ce-l"><span>${a}</span><span style="text-align:left;flex:1">${b}</span></div>`;
const titreCE = (t) => `<div class="ce-l" style="background:${C.bleu};color:${C.tuffeau}"><span><b style="font-weight:800">${t}</b></span><span></span></div>`;
P.fichiers = page('fichiers', 'fond-tuffeau', `
  <h2 class="fm-h fm8-h">Où sont les fichiers.</h2>
  <div class="fm-a t-etq" style="left:84px;top:190px">brand/logo/ · 24 fichiers SVG · sillon-&lt;version&gt;-&lt;couleur&gt;.svg</div>
  <div class="fm8-logos">${fichiers.map(([o, c]) => `<div class="fm8-f"><div class="${fondDe[c]} lumiere"><img src="logo/sillon-${o}-${c}.svg" alt=""></div><span class="t-etq">${o}-${c}</span></div>`).join('')}</div>
  <p class="fm-a t-petit" style="left:84px;top:740px;width:1000px">Sans suffixe : un aplat, sous 32${NB}px. <b>-jus</b> : deux couleurs, de 32 à 200${NB}px. <b>-grand</b> : au-delà, avec le disque, la lie et trois bulles. Le nom de couleur dit la couleur des lettres : bleu ou fond de cave sur le clair, tuffeau sur le bleu.</p>
  <div class="fm-a t-etq" style="left:84px;top:798px">photos/ · douze photos de marque</div>
  <div class="fm8-photos">${Object.keys(A.PHOTOS).map((n) => A.photo(n)).join('')}</div>
  <p class="fm-a t-petit" style="left:84px;top:930px;width:1000px">Générées pour le projet, avec l’accord du commanditaire. Jamais lissées, jamais présentées comme des photos réelles. Sur « comptoir », l’ouvre-bouteille en bas à gauche reste hors champ.</p>
  <div class="fm8-dos"><div style="zoom:1.42;width:486px">
    <div class="ce papier" style="color:${C.bleu}"><div class="ce-in">
      <div class="ce-t"><b>${A.NOM}</b><span>Fiche de marque · dos</span></div>
      ${titreCE('Les fichiers')}
      ${ligne('Logo', 'brand/logo/ · 24 SVG, trois couleurs')}
      ${ligne('Polices', 'Anybody, Hanken Grotesk · licence OFL · brand/fonts/')}
      ${ligne('Photos', 'photos/ · 12, générées pour le projet')}
      ${ligne('Annonces', 'reseaux/ · les quatre modèles')}
      ${ligne('Outil', 'outil/ouvrir.bat · mode d’emploi : outil/LISEZMOI.md')}
      ${titreCE('À valider avant diffusion')}
      ${ligne('Le nom', 'Vérifié ni à l’INPI, ni comme domaine, ni comme compte de réseau')}
      ${ligne('Loi Évin', '« Repartez à pied. », « Taches autorisées. », « À ras bord. », « Glou. » : à faire relire')}
      ${ligne('Polices', 'Joindre le texte de la licence OFL aux fichiers avant de les transmettre : il manque dans brand/fonts/')}
      ${ligne('Le fondateur', 'La signature, les phrases, le nom « Le Plein », les noms des couleurs')}
      <div class="ce-g"><b>24${NB}SVG</b><b>12${NB}photos</b>${A.verre({ taille: 22, c: C.bleu, detail: false })}</div>
      <div class="ce-v">Une proposition de KLYRA, novembre 2026.</div>
      <div class="ce-m">Identité de marque : proposition, novembre 2026. Photos générées pour le projet. Polices Anybody et Hanken Grotesk, licence OFL. Nom et domaine non vérifiés.</div>
    </div></div></div></div>
  <p class="fm-a t-petit" style="left:1146px;top:888px;width:690px">Cette fiche est un PDF fait d’images : le texte ne s’y copie pas. Les codes exacts sont dans brand/marque.css ; ce qu’on transmet à un imprimeur ou à un graphiste, c’est brand/logo/ et brand/fonts/.</p>
`);

/* ---------- après l'écriture d'une page : le remplisseur, puis les cotes du titre (page 5) ---------- */
window.GuideApres = (racine) => {
  A.typo(racine);
  const cvs = [...racine.querySelectorAll('canvas[data-verse],canvas[data-logo]')];
  return Verse.tout(racine).then((R) => {
    const t = racine.querySelector('#fm5-t'), z = racine.querySelector('#fm5-cotes');
    if (t && z) { const r = R[cvs.indexOf(t)], L = r.lettres, cote = (x, l, txt) => `<div class="fm5-cote t-etq" style="left:${x}px;width:${l}px"><span>${txt}</span></div>`;
      const serre = L.slice(0, 2), x0 = serre[0].x, x1 = serre[1].x + serre[1].l;
      z.innerHTML = cote(x0, x1 - x0, `62,5${NB}%`) + L.filter((g) => g.verre).map((g) => cote(g.x, g.l, `150${NB}%`)).join('') +
        ''; }
    const vv = racine.querySelector('#fm6-verres');
    if (vv) return Verse.verres(vv, { w: 330, h: 200, cols: 3, rangs: 2, taille: 52, marge: 6, angle: (i, j, u) => (u - 0.5) * 60 + (j ? 10 : -10), jus: (i, j) => J[(i + j) % 3] });
  });
};

window.GuidePages = P;
window.GuideOrder = ORDER;
window.GuideTitles = TITLES;
window.GuideRendus = [];
})();
