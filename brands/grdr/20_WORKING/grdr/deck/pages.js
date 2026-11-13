/* PAGES DU GUIDE : GRDR · Djongoma (deck/pages.js). Vingt-deux pages de 1280 × 720.
   SOURCE UNIQUE des pages du guide : le PDF (node tools/deck.mjs puis python tools/deck_pdf.py) et la visionneuse du site
   (site/presentation.html) lisent ce fichier.

   L'identité du GRDR existe et ne change pas : ce guide documente comment elle a été mise en système pour l'outil.
   Tout ce qui est dessiné vient du socle (window.Marque, brand/carte.js, brand/ecrans.js) : rien n'est redessiné ici.
   Les chiffres sont ceux que MARQUE.md autorise (section 2) ; les règles chiffrées décidées ici (zone de protection,
   tailles minimales, proportions de couleur, taille minimale de l'empreinte) sont signalées « à valider » dans le compte rendu.

   CONTRAT (ce que les outils attendent) :
   - Chargé après brand/marque.js, carte.js, ecrans.js (et ecrans-b.js, ecrans-c.js s'ils existent). Styles : marque.css,
     ecrans.css, puis deck/pages.css.
   - window.GuidePages { clé : HTML }, window.GuideOrder, window.GuideTitles, window.GuideRendus, window.GuideApres(racine).
   - Images : img(sous-dossier de out/, fichier) ; window.GuideMedia, défini avant ce script par le site, remplace le dossier.
   - Cadre d'image (media) : le repli dessiné est SOUS l'image (z-index 1 contre 2).
   - Numéros (bandeau, sommaire de couverture) calculés depuis ORDER. Classes préfixées mp-. Un élément coupé exprès par le
     bord porte data-coupe. */
(function () {
const A = window.Marque, C = A.COULEURS, N = A.NOMS, D = A.DONNEES, NB = A.NB || ' ', APP = A.app || {};
const img = (sub, f) => (window.GuideMedia || '../out/' + sub + '/') + f;
const existe = (n) => typeof APP[n] === 'function';
const virg = (x, d) => (d == null ? String(x) : x.toFixed(d)).replace('.', ',');

/* ---------- Chapitres : [numéro, titre, pages [clé, titre]] ---------- */
const CH = [
  ['01', 'La marque', [['existant', 'D’où l’on part'], ['idee', 'L’idée'], ['ton', 'Le ton']]],
  ['02', 'Le logo', [['logo', 'Le logo officiel'], ['protection', 'Zone de protection et tailles'], ['interdits', 'Les interdits']]],
  ['03', 'L’empreinte', [['construction', 'Une construction mesurée'], ['lecture', 'Lire une empreinte'], ['usage', 'Règles d’usage']]],
  ['04', 'Les couleurs', [['palette', 'La palette'], ['contrastes', 'Proportions et contrastes']]],
  ['05', 'La typographie', [['typographie', 'Trois polices']]],
  ['06', 'Matière et image', [['aquarelle', 'L’aquarelle'], ['image', 'Ici et là-bas']]],
  ['07', 'Marge et graphiques', [['marge', 'La marge du comptable'], ['graphiques', 'Les graphiques']]],
  ['08', 'L’interface', [['interface', 'Les principes'], ['ecrans', 'Les écrans']]],
  ['09', 'Le mouvement', [['mouvement', 'Le trait qui s’enroule']]],
  ['10', 'En situation', [['situation', 'Hors de l’écran']]],
];
const ORDER = ['couverture', ...CH.flatMap((c) => c[2].map((s) => s[0])), 'credits'];
const TITLES = ['Couverture', ...CH.flatMap((c) => c[2].map((s) => s[1])), 'Crédits'];
const pad = (n) => String(n).padStart(2, '0');
const num = (k) => pad(ORDER.indexOf(k) + 1);
const chap = (k) => CH.find((c) => c[2].some((s) => s[0] === k));
const etiq = (k) => { const c = chap(k); return c ? `${c[0]} · ${c[1]}` : ''; };

/* ---------- Typographie française : espaces insécables (texte seulement, jamais dans un SVG) ---------- */
const fr = (s) => String(s)
  .replace(/(\d) (?=\d{3}(?!\d))/g, '$1' + NB)
  .replace(/(\d) (?=(%|px|mm|ms|s|h|°|€)(?![\wÀ-ÿ]))/g, '$1' + NB)
  .replace(/ ([:;!?»])/g, NB + '$1')
  .replace(/« /g, '«' + NB);

/* ---------- Éléments communs ---------- */
const lbl = (t, st = '') => `<p class="mp-lbl"${st ? ` style="${st}"` : ''}>${fr(t)}</p>`;
const titre = (t, taille = 44) => `<h2 class="mp-titre" style="font-size:${taille}px">${fr(t)}</h2>`;
const chapo = (t) => `<p class="mp-chapo">${fr(t)}</p>`;
const regles = (L) => `<ol class="mp-regles">${L.map((r, i) => `<li><i>${pad(i + 1)}</i><span>${fr(r)}</span></li>`).join('')}</ol>`;
const leg = (t, st = '') => `<p class="mp-leg"${st ? ` style="${st}"` : ''}>${fr(t)}</p>`;
/* Bandeau : marque, chapitre, titre de la page, numéro sur le total */
const bande = (k) => { const i = ORDER.indexOf(k);
  return `<div class="mp-bande"><span>${A.NOM} · ${A.PRODUIT} · Guide de marque</span><span>${fr(etiq(k))}</span><span>${fr(TITLES[i])}</span><span>${num(k)}${NB}/${NB}${pad(ORDER.length)}</span></div>`; };
/* Une page : fond (« », « blanc » ou « nuit »), contenu, bandeau sauf mention contraire */
const page = (k, fond, inner, o = {}) => `<div class="mp-page${fond ? ' mp-' + fond : ''}" data-page="${k}">${inner}${o.sansBande ? '' : bande(k)}</div>`;
/* La colonne de texte : étiquette du chapitre, titre, chapô, règles */
const colonne = (k, t, c, R, o = {}) => `<div class="mp-colonne">${lbl(etiq(k))}${titre(t, o.taille)}${chapo(c)}${R ? regles(R) : ''}${o.apres || ''}</div>`;
const corps = (k, t, c, R, demo, o = {}) => `<div class="mp-corps${o.cls ? ' ' + o.cls : ''}">${colonne(k, t, c, R, o)}<div class="mp-demo"${o.st ? ` style="${o.st}"` : ''}>${demo}</div></div>`;
/* Image de out/<sub>/ dans un cadre : repli (z 1) SOUS l'image (z 2). L'image absente se retire et marque le cadre. */
const media = (sub, f, o = {}) => `<div class="mp-cadre" style="${o.st || ''}">` +
  `<div class="mp-repli" data-coupe>${o.repli || ''}</div>` +
  `<img class="mp-img" src="${img(sub, f)}" alt="" style="object-position:${o.pos || '50% 50%'}" onerror="this.parentNode.setAttribute('data-absente',this.getAttribute('src'));this.remove()">` +
  `</div>`;
const OUI = `<span class="mp-marque mp-oui"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>`;
const NON = `<span class="mp-marque mp-non"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></span>`;
/* Pastilles de couleur : un rond, le nom, le code */
const pastilles = (ks) => `<div class="mp-past">${ks.map((k) => `<span><u style="background:${C[k]}"></u><b>${N[k]}</b><i>${C[k]}</i></span>`).join('')}</div>`;
const clair = (h) => A.contraste(h, C.encre) > A.contraste(h, C.blanc);
/* Une fenêtre de l'outil, sans barre de navigateur, mise à l'échelle */
const fenetre = (html, k, st = '') => `<div class="mp-fen" data-coupe style="--z:${k};${st}"><div>${html}</div></div>`;

/* ---------- Lire une empreinte : le tracé du socle, et une étiquette par année ----------
   L'empreinte est celle de Marque.empreinte, posée telle quelle dans un SVG plus large ; les filets partent de chaque boucle. */
const etat = (v, actif) => (v > 0.002 ? `${Math.round(v * 100)} %` : 'à venir') + (actif ? ' · en cours' : '');
const lire = (p, o = {}) => { const c = A.cernesDe(p), n = c.annees.length, b = A.empreinteCadre(n), G = A.empreinteGeo(n), h = o.taille || 300, k = h / b[3];
  const fg = o.nuit ? C.blanc : C.encre, R = G[n - 1].r, y1 = 17, yn = -0.86 * R, pasY = n > 1 ? (y1 - yn) / (n - 1) : 0, xl = R + 30, tf = 10.5 / k, large = 170 / k;
  let s = '';
  for (let i = n - 1; i >= 0; i--) { const r = G[i].r, y = yn + (n - 1 - i) * pasY, x = Math.sqrt(Math.max(0, r * r - y * y)), act = i === c.actif;
    s += `<path d="M${(x + 8).toFixed(1)},${y.toFixed(1)} H${xl - 5}" stroke="${fg}" stroke-opacity=".34" stroke-width="${(1 / k).toFixed(2)}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2.6 / k).toFixed(2)}" fill="${fg}"/>` +
      `<text x="${xl}" y="${(y + tf * 0.36).toFixed(1)}" font-family="Geist Mono, monospace" font-size="${tf.toFixed(2)}" letter-spacing=".04em" fill="${fg}"><tspan font-weight="600">${c.annees[i]}</tspan><tspan fill-opacity=".62"> · ${etat(c.cernes[i], act)}</tspan></text>`; }
  return `<svg class="mp-lire" xmlns="http://www.w3.org/2000/svg" viewBox="${b[0]} ${b[1]} ${(b[2] + large).toFixed(1)} ${b[3]}" style="height:${h}px;width:${Math.round((b[2] + large) * k)}px">` +
    A.empreinte({ cernes: c.cernes, actif: c.actif, cadre: n, c: o.nuit ? 'menthe' : 'lagune', piste: o.nuit ? 'rgba(255,251,246,.13)' : 'sable', cActif: o.nuit ? 'miel' : 'vermillon', attrs: `x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}"` }) + s + `</svg>`; };

const P = {};
const ecos = D.projets[0], cE = A.cernesDe(ecos);
const parCode = (code) => D.projets.find((p) => p.code === code);
const plage = (p) => { const c = A.cernesDe(p); return `${c.annees[0]}–${c.annees[c.annees.length - 1]}`; };

/* =================================================================== Couverture */
P.couverture = page('couverture', '', `
  ${A.aquarelle('aube', { cls: 'mp-couv-aq grain', pos: '50% 45%', html: `<div class="mp-couv-emp" data-coupe>${A.empreinte({ cernes: cE.cernes, actif: cE.actif, c: 'blanc', piste: 'rgba(255,251,246,.4)', cActif: 'nuit' })}</div><p class="mp-couv-note net">${fr(`${ecos.code} · ${ecos.titre} · ${plage(ecos)} · exécuté à ${A.pct(ecos.taux)}`)}</p>` })}
  <div class="mp-couv">
    <div class="mp-couv-logo">${A.lockup(null, 'aria-hidden="true"')}</div>
    <div class="mp-couv-t">${lbl(`Guide de marque · ${ORDER.length} pages · 2026`)}<h1>${A.PRODUIT}</h1><p>${fr('L’identité du GRDR, mise en système pour son outil de gestion budgétaire.')}</p></div>
    <div class="mp-couv-bas"><ol class="mp-som">${CH.map((c) => `<li><i>${c[0]}</i><span>${fr(c[1])}</span><b>${num(c[2][0][0])}</b></li>`).join('')}</ol>
      ${lbl('Proposition KLYRA · non validée par le GRDR')}</div>
  </div>`, { sansBande: true });

/* =================================================================== 01 La marque */
P.existant = page('existant', '', corps('existant', 'D’où l’on part',
  'Le GRDR a déjà son identité : un logo, trois couleurs, la police Nunito, des lavis d’aquarelle. Rien de cela ne change. Ce guide documente comment on l’a mise en système pour Djongoma, son outil de gestion budgétaire.',
  ['Ce qui est au GRDR reste au GRDR : le logo, les couleurs, la police.', 'Ce qui est ajouté pour l’outil est une proposition, signalée comme telle.', 'Un seul trait relie les deux : celui du symbole.'],
  `<section class="mp-carte mp-ex">${lbl('Ce qui existe · on n’y touche pas')}
     <div class="mp-ex-g">
       <figure><div class="mp-ex-v mp-ex-logo">${A.lockup()}</div>${leg('Le logo officiel')}</figure>
       <figure><div class="mp-ex-v">${pastilles(['vermillon', 'ocre', 'lagune'])}</div>${leg('Trois couleurs relevées sur le logo')}</figure>
       <figure><div class="mp-ex-v mp-ex-aa"><b>Aa</b><span>Nunito</span></div>${leg('La police des publications')}</figure>
       <figure>${A.aquarelle('aube', { cls: 'mp-ex-v mp-ex-aq', html: A.filigrane({ c: 'blanc', op: 0.55, style: 'right:-34px;top:-22px;width:130px;height:175px' }) })}${leg('Les lavis du rapport 2025')}</figure>
     </div></section>
   <section class="mp-carte mp-ex mp-sable">${lbl('Ce que l’outil ajoute · proposition')}
     <div class="mp-ex-g">
       <figure><div class="mp-ex-v">${A.empreinte({ cernes: cE.cernes, actif: cE.actif, taille: 124 })}</div>${leg('L’empreinte d’un projet')}</figure>
       <figure><div class="mp-ex-v mp-ex-marge">${A.code(ecos.code, 'vermillon')}${A.montant(ecos.total)}${A.tampon('Sage · à jour')}</div>${leg('La marge du comptable')}</figure>
       <figure><div class="mp-ex-v mp-ex-gr">${A.jauge({ v: 0.76, repere: 0.69, c: 'vermillon', w: 150 })}${A.jauge({ v: 0.45, repere: 0.33, w: 150 })}${A.jauge({ v: 0.19, repere: 0.46, w: 150 })}</div>${leg('Les graphiques, au même trait')}</figure>
       <figure><div class="mp-ex-v">${pastilles(['nuit', 'encre', 'blanc'])}</div>${leg('Les deux bouts de l’échelle')}</figure>
     </div></section>`, { st: 'grid-template-rows:1fr 1fr' }));

P.idee = page('idee', '', corps('idee', 'Un budget se lit comme le symbole du GRDR',
  'Le symbole du GRDR est une épingle de carte faite de boucles concentriques, comme les cernes d’un arbre. Un budget pluriannuel a la même forme : un projet, ancré quelque part, qui grossit année après année.',
  ['Un projet, une empreinte.', 'Une boucle par année, tracée jusqu’à ce qui est exécuté.', 'Graphiques, pictogrammes et mouvement reprennent ce trait.'],
  `<section class="mp-carte mp-idee">
     <figure class="mp-idee-a">${A.symbol('ocre')}${leg('Le symbole du GRDR · un lieu, des boucles')}</figure>
     <div class="mp-idee-f">${A.fleche('encre')}</div>
     <figure class="mp-idee-b">${lire(ecos, { taille: 318 })}${leg(`L’empreinte d’${ecos.code} · cinq années, cinq boucles`)}</figure>
   </section>
   <div class="mp-cles">
     <span><u style="--lc:${C.lagune}"></u>${fr('Le tracé : l’exécuté')}</span>
     <span><u style="--lc:${C.vermillon}"></u>${fr('L’année en cours')}</span>
     <span><u style="--lc:${C.sable}"></u>${fr('La piste : ce qui reste')}</span>
     <span><u class="mp-pt"></u>${fr('Le pied : le lieu du projet')}</span>
   </div>`, { taille: 40, st: 'grid-template-rows:1fr auto' }));

const PH = A.PHRASES;
P.ton = page('ton', '', corps('ton', 'La voix d’un collègue précis et chaleureux',
  'Djongoma parle comme la personne du service financier à qui l’on aime poser ses questions : elle sait, elle explique, elle ne fait pas la leçon. Phrases courtes. On vouvoie.',
  ['Le mot juste du métier, jamais le jargon de l’outil.', 'Un chiffre est exact ou absent : à l’euro près.', 'Ni superlatif, ni point d’exclamation.'],
  `<section class="mp-carte mp-n mp-trip grain nuit"><div class="mp-trip-e" data-coupe>${A.empreinte({ cernes: [1, 1, 1, 0.9, 0.34], c: '#1F4F4B', piste: '#17403D', actif: 4, cActif: 'miel' })}</div>
     ${lbl('Le triptyque')}<p class="mp-trip-t net">${A.TRIPTYQUE.map((m, i) => `<span${i === 2 ? ` style="color:${C.miel}"` : ''}>${m}</span>`).join(' ')}</p>
     <p class="mp-trip-s net">${fr('Le budget de chaque projet, à l’euro près.')}</p></section>
   <section class="mp-carte mp-phrases">${[['À l’annonce', PH.excel], ['À l’extraction', PH.sage], ['Au journal', PH.journal]].map(([q, t]) => `<div>${lbl(q)}<p>${fr(t)}</p></div>`).join('')}</section>
   <div class="mp-g2">
     <section class="mp-carte mp-dit">${OUI}${lbl('On dit')}<p>${['exécuté', 'reste à exécuter', 'prorata', 'ligne budgétaire', 'bailleur', 'extraction Sage', 'à l’euro près'].map((m) => `<span>${m}</span>`).join('')}</p></section>
     <section class="mp-carte mp-dit mp-evite">${NON}${lbl('On évite')}<p>${['dashboard', 'KPI', 'data', 'les superlatifs', 'le point d’exclamation'].map((m) => `<span>${m}</span>`).join('')}</p></section>
   </div>`, { taille: 40, st: 'grid-template-rows:1.25fr auto auto' }));

/* =================================================================== 02 Le logo */
const FONDS = [['blanc', null, 'Blanc de papier · en couleurs'], ['papier', null, 'Papier · en couleurs'], ['sable', null, 'Sable · en couleurs'], ['papier', 'encre', 'Papier · en encre'],
  ['nuit', 'blanc', 'Nuit · en blanc'], ['lagune', 'blanc', 'Lagune · en blanc'], ['vermillon', 'blanc', 'Vermillon · en blanc'], ['aq', 'blanc', 'Aquarelle · en blanc']];
const tuileFond = ([f, c, t]) => (f === 'aq'
  ? A.aquarelle('aube', { cls: 'mp-fond-t', html: `<div class="net">${A.lockup(c)}</div><p class="net">${fr(t)}</p>` })
  : `<div class="mp-fond-t${f === 'blanc' ? ' mp-bord' : ''}" style="background:${C[f]};color:${clair(C[f]) ? C.encre : C.blanc}"><div>${A.lockup(c)}</div><p>${fr(t)}</p></div>`);
P.logo = page('logo', '', corps('logo', 'Le logo du GRDR, tel qu’il est',
  'Le logo est celui du GRDR, recopié en tracés depuis son rapport d’activité 2025. On ne le redessine pas. Trois versions suffisent : la complète, la courte sans descripteur, le symbole seul.',
  ['En couleurs ou en encre sur blanc de papier, papier et sable.', 'En blanc sur nuit, lagune, vermillon et aquarelle.', 'Le mot en vermillon, le symbole en ocre, le descripteur en lagune : toujours ces trois-là.'],
  `<section class="mp-carte mp-versions">
     <figure>${A.lockup(null, 'style="height:150px;width:auto"')}${leg('Version complète · Marque.lockup()')}</figure>
     <figure>${A.court(null, 'style="height:74px;width:auto"')}${leg('Version courte · Marque.court()')}</figure>
     <figure>${A.symbol('ocre', 'style="height:74px;width:auto"')}${leg('Symbole · Marque.symbol()')}</figure>
   </section>
   <div class="mp-fonds">${FONDS.map(tuileFond).join('')}</div>`, { st: 'grid-template-rows:auto 1fr' }));

const tb = A.TRACES.boite, XH = 100;
const zoneSVG = (() => { const x0 = tb[0] - XH, y0 = tb[1] - XH, w = tb[2] + 2 * XH, h = tb[3] + 2 * XH, m = 16, coin = (x, y) => `<rect x="${x}" y="${y}" width="${XH}" height="${XH}" fill="${C.vermillon}" fill-opacity=".12"/><text x="${x + XH / 2}" y="${y + XH / 2 + 13}" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="38" fill="${C.vermillon}">x</text>`;
  return `<svg class="mp-zone" xmlns="http://www.w3.org/2000/svg" viewBox="${x0 - m} ${y0 - m} ${w + 2 * m} ${h + 2 * m}">
    <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="18" fill="${C.blanc}" stroke="${C.vermillon}" stroke-width="2.6" stroke-dasharray="2 10" stroke-linecap="round"/>
    ${coin(x0, y0)}${coin(x0 + w - XH, y0)}${coin(x0, y0 + h - XH)}${coin(x0 + w - XH, y0 + h - XH)}
    <rect x="${tb[0]}" y="${tb[1]}" width="${tb[2]}" height="${tb[3]}" fill="none" stroke="${C.encre}" stroke-opacity=".22" stroke-width="1.4"/>
    <path d="M${tb[0] - 26},0 H${tb[0] + 418} M${tb[0] - 26},100 H${tb[0] + 418}" stroke="${C.lagune}" stroke-width="1.6" stroke-dasharray="5 6"/>
    <path d="M${tb[0] - 44},0 V100 M${tb[0] - 52},0 h16 M${tb[0] - 52},100 h16" stroke="${C.lagune}" stroke-width="2"/>
    <text x="${tb[0] - 58}" y="62" text-anchor="end" font-family="Nunito, sans-serif" font-weight="800" font-size="34" fill="${C.lagune}">x</text>
    <path fill="${C.vermillon}" d="${A.wordPath()}"/><path fill="${C.ocre}" d="${A.symbolPath()}"/><path fill="${C.lagune}" d="${A.descPath()}"/></svg>`; })();
P.protection = page('protection', '', corps('protection', 'De l’air, et une taille plancher',
  'L’unité de mesure est dans le logo : x, la hauteur d’x du mot « grdr ». On laisse un x libre tout autour. Et quand la place manque, on change de version plutôt que de réduire.',
  ['Zone de protection : un x sur les quatre côtés, pour les trois versions.', 'Version complète : 110 px de large au minimum. En dessous, la version courte.', 'Version courte : 48 px de large. Symbole seul : 24 px de haut.', 'À l’impression : 30 mm, 14 mm et 6 mm.'],
  `<section class="mp-carte mp-prot">${lbl('Zone de protection · x = hauteur d’x du mot « grdr »')}${zoneSVG}</section>
   <section class="mp-carte mp-tailles">${lbl('Tailles minimales · à l’échelle de la page')}
     <div><div class="mp-t-v">${A.lockup(null, 'style="width:110px;height:auto"')}</div><b>Version complète</b><span>${fr('110 px de large · 30 mm')}</span></div>
     <div><div class="mp-t-v">${A.court(null, 'style="width:48px;height:auto"')}</div><b>Version courte</b><span>${fr('48 px de large · 14 mm')}</span></div>
     <div><div class="mp-t-v">${A.symbol('ocre', 'style="height:24px;width:auto"')}</div><b>Symbole seul</b><span>${fr('24 px de haut · 6 mm')}</span></div>
   </section>`, { st: 'grid-template-rows:1.9fr 1fr' }));

const faux = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${A.LOCKUP.box.join(' ')}"><path fill="${C.vermillon}" d="${A.wordPath()}"/><path fill="${C.ocre}" d="${A.symbolPath()}"/><text x="166" y="188" font-family="Nunito, sans-serif" font-weight="700" font-size="50" fill="${C.lagune}">Gestion</text><text x="166" y="240" font-family="Nunito, sans-serif" font-weight="700" font-size="50" fill="${C.lagune}">budgétaire</text></svg>`;
const INTERDITS = [
  ['Déformer', `<div class="mp-int-v">${A.lockup(null, 'preserveAspectRatio="none" style="width:214px;height:66px"')}</div>`],
  ['Recolorer autrement', `<div class="mp-int-v">${A.lockup('emeraude', 'style="height:92px;width:auto"')}</div>`],
  ['Toucher au descripteur', `<div class="mp-int-v mp-int-faux">${faux}</div>`],
  ['Incliner', `<div class="mp-int-v">${A.lockup(null, 'style="height:88px;width:auto;transform:rotate(-12deg)"')}</div>`],
  ['Poser sur une photo sans lavis', `<div class="mp-int-v">${A.photo('marche', { style: 'position:absolute;inset:0' })}<div style="position:relative;z-index:5">${A.lockup('blanc', 'style="height:88px;width:auto"')}</div></div>`],
  ['Garder le descripteur sous 110 px', `<div class="mp-int-v">${A.lockup(null, 'style="width:62px;height:auto"')}</div>`],
];
P.interdits = page('interdits', '', corps('interdits', 'Six gestes à ne jamais faire',
  'Le logo n’appartient pas à l’outil : il appartient au GRDR. On le pose, on ne le travaille pas. Ces six gestes sont à écarter, même pour un essai.',
  ['On ne le déforme pas, on ne l’incline pas.', 'On ne le recolore pas hors des versions permises.', 'On ne touche pas au descripteur.'],
  `<div class="mp-int">${INTERDITS.map(([t, v]) => `<figure class="mp-carte">${NON}${v}<figcaption>${fr(t)}</figcaption></figure>`).join('')}</div>`));

/* =================================================================== 03 L'empreinte */
const K = A.CONSTRUCTION, sbx = A.LOGO.symbolBox, TH = K.inclinaison * Math.PI / 180, sx = Math.sin(TH), cx_ = Math.cos(TH);
const mesureSymbole = (() => { const g = K.gauche, d = K.droite, td = -d.inclinaison * Math.PI / 180, R2 = d.rayons[d.rayons.length - 1];
  const jambes = g.rayons.map((r, i) => { const t = [g.centre[0] - r * cx_, g.centre[1] + r * sx]; return `M${t[0].toFixed(1)},${t[1].toFixed(1)} l${(g.jambes[i] * sx).toFixed(1)},${(g.jambes[i] * cx_).toFixed(1)}`; }).join(' ');
  const t2 = [d.centre[0] + R2 * Math.cos(td), d.centre[1] + R2 * Math.sin(td)];
  return `<svg class="mp-mes" xmlns="http://www.w3.org/2000/svg" viewBox="${sbx[0] - 16} ${sbx[1] - 16} ${sbx[2] + 32} ${sbx[3] + 32}" fill="none">
    <path fill="${C.sable}" d="${A.symbolPath()}"/>
    ${g.rayons.map((r) => `<circle cx="${g.centre[0]}" cy="${g.centre[1]}" r="${r}" stroke="${C.lagune}" stroke-width="1.5" stroke-dasharray="2.5 4"/>`).join('')}
    ${d.rayons.map((r) => `<circle cx="${d.centre[0]}" cy="${d.centre[1]}" r="${r}" stroke="${C.vermillon}" stroke-width="1.5" stroke-dasharray="2.5 4"/>`).join('')}
    <path d="${jambes}" stroke="${C.lagune}" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M${t2[0].toFixed(1)},${t2[1].toFixed(1)} l${(-d.jambe * Math.sin(td)).toFixed(1)},${(d.jambe * Math.cos(td)).toFixed(1)}" stroke="${C.vermillon}" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="${g.centre[0]}" cy="${g.centre[1]}" r="3.6" fill="${C.lagune}"/><circle cx="${d.centre[0]}" cy="${d.centre[1]}" r="3.6" fill="${C.vermillon}"/></svg>`; })();
const mesureEmpreinte = (() => { const G = A.empreinteGeo(3), R = G[2].r, t3 = [-R * cx_, R * sx], a = 40 * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), b = 15 * Math.PI / 180;
  const T = (x, y, t, anc = 'start') => `<text x="${x}" y="${y}" text-anchor="${anc}" font-family="Geist Mono, monospace" font-size="8.6" letter-spacing=".05em" fill="${C.encre}">${t}</text>`;
  return `<svg class="mp-mes" xmlns="http://www.w3.org/2000/svg" viewBox="-128 -106 330 286" fill="none" stroke-linecap="round">
    ${G.map((g) => `<path d="${g.d}" stroke="${C.lagune}" stroke-width="${K.epaisseur}" stroke-linejoin="round"/>`).join('')}
    <g stroke="${C.encre}" stroke-width=".9">
      <path d="M-5,0 H5 M0,-5 V5"/>
      <path d="M0,0 L${(104 * ca).toFixed(1)},${(-104 * sa).toFixed(1)}" stroke-dasharray="1.5 3"/>
      <path d="M${(77.2 * Math.cos(b)).toFixed(1)},${(77.2 * Math.sin(b)).toFixed(1)} L${(87.2 * Math.cos(b)).toFixed(1)},${(87.2 * Math.sin(b)).toFixed(1)} M${(87.2 * Math.cos(b) + 3).toFixed(1)},${(87.2 * Math.sin(b) + 1).toFixed(1)} H108" stroke="${C.blanc}" stroke-width="1.6"/>
      <path d="M${(87.2 * Math.cos(b) + 4).toFixed(1)},${(87.2 * Math.sin(b) + 1).toFixed(1)} H110"/>
      <path d="M${t3[0].toFixed(1)},${t3[1].toFixed(1)} v78" stroke-dasharray="1.5 3"/>
      <path d="M${t3[0].toFixed(1)},${(t3[1] + 52).toFixed(1)} A52,52 0 0 0 ${(t3[0] + 52 * sx).toFixed(1)},${(t3[1] + 52 * cx_).toFixed(1)}"/>
      <path d="M${(G[2].fin[0] + 8).toFixed(1)},${(G[2].fin[1] + 3).toFixed(1)} l14,7"/>
      <path d="M${(G[2].pied[0] + 9).toFixed(1)},${(G[2].pied[1] - 2).toFixed(1)} h22"/>
    </g>
    ${G.map((g) => `<circle cx="${(g.r * ca).toFixed(1)}" cy="${(-g.r * sa).toFixed(1)}" r="2.6" fill="${C.encre}"/>`).join('')}
    <circle cx="${G[2].fin[0].toFixed(1)}" cy="${G[2].fin[1].toFixed(1)}" r="2.6" fill="${C.encre}"/>
    ${T((108 * ca).toFixed(1), (-108 * sa).toFixed(1), `pas ${virg(K.pas)}`)}
    ${T(114, (87.2 * Math.sin(b) + 4).toFixed(1), `trait ${K.epaisseur}`)}
    ${T((t3[0] - 6).toFixed(1), (t3[1] + 74).toFixed(1), `${virg(K.inclinaison)}°`, 'end')}
    ${T((G[2].fin[0] + 26).toFixed(1), (G[2].fin[1] + 14).toFixed(1), 'trois quarts de tour')}
    ${T((G[2].pied[0] + 35).toFixed(1), (G[2].pied[1] + 1).toFixed(1), 'jambe : rayon + 1,45 pas')}
  </svg>`; })();
P.construction = page('construction', '', corps('construction', 'Une construction mesurée',
  'L’empreinte n’est pas dessinée à l’œil. Elle reprend la famille gauche du symbole officiel, mesurée sur son tracé : des boucles concentriques au même pas, chacune prolongée par une jambe inclinée.',
  [`Un pas de ${virg(K.pas)} entre deux boucles, pour un trait de ${K.epaisseur}.`, `Une jambe inclinée de ${virg(K.inclinaison)}°, tangente à sa boucle.`, 'Trois quarts de tour : la boucle ne se ferme jamais.'],
  `<section class="mp-carte mp-cons">
     <figure>${mesureSymbole}${leg('Le symbole officiel · deux familles de cercles au même pas')}</figure>
     <div class="mp-idee-f">${A.fleche('encre')}</div>
     <figure>${mesureEmpreinte}${leg('L’empreinte · la famille gauche, prolongée')}</figure>
   </section>
   <div class="mp-mesures">${[['Pas', virg(K.pas)], ['Trait', String(K.epaisseur)], ['Inclinaison', `${virg(K.inclinaison)}°`], ['Rayons mesurés', K.gauche.rayons.map((r) => virg(r)).join(' · ')], ['Unité', 'hauteur d’x du mot = 100']].map(([a, b]) => `<div>${lbl(a)}<b>${fr(b)}</b></div>`).join('')}</div>`, { st: 'grid-template-rows:1fr auto' }));

const LUS = ['ECOS', 'ECSI', 'HWCL'].map(parCode);
P.lecture = page('lecture', 'nuit', `<img class="mp-fond" src="${A.aqURL('nuit')}" alt="" style="opacity:.5">
  <div class="mp-lec">
    <div class="mp-lec-h">
      <div>${lbl(etiq('lecture'))}${titre('Lire une empreinte', 54)}</div>
      ${chapo('Une empreinte se lit du centre vers le bord, comme on compte les cernes d’un arbre. Chaque boucle est une année du projet. Le trait plein dit ce qui est exécuté, la piste ce qui reste.')}
      ${regles(['La boucle du centre est la première année.', 'L’année en cours : en vermillon sur fond clair, en miel sur la nuit.', 'Le pied touche le lieu : sur une carte, il désigne le bureau.'])}
    </div>
    <div class="mp-lus">${LUS.map((p) => `<figure>${lire(p, { taille: 270, nuit: true })}
      <figcaption><b>${fr(p.titre.length > 34 ? p.titre.slice(0, 33).replace(/\s+\S*$/, '') + '…' : p.titre)}</b><i>${Math.round(p.taux * 100)}<small>%</small></i><span>${A.code(p.code)}${plage(p)} · ${A.euro(p.total)}</span></figcaption></figure>`).join('')}</div>
    <div class="mp-cles mp-cles-n">
      <span><u style="--lc:${C.menthe}"></u>${fr('Une boucle par année, tracée jusqu’à l’exécuté')}</span>
      <span><u style="--lc:${C.miel}"></u>${fr('L’année en cours')}</span>
      <span><u style="--lc:rgba(255,251,246,.2)"></u>${fr('Ce qui reste à exécuter')}</span>
    </div>
  </div>`);

const mini = (o) => A.empreinte({ piste: 'sable', ...o });
P.usage = page('usage', '', corps('usage', 'Une donnée, jamais un décor',
  'L’empreinte est un graphique avant d’être un motif. Elle porte toujours les années d’un projet, ou les bailleurs d’un budget. Une seule exception : en très grand, coupée par les bords.',
  ['De deux à six boucles. Au-delà, on regroupe les années les plus anciennes.', 'Hauteur minimale : 32 px. En dessous, la jauge prend le relais.', 'Tracé en lagune, piste en sable, année en cours en vermillon.', 'Jamais retournée, jamais recolorée, jamais fermée.'],
  `<div class="mp-us">
     <figure class="mp-carte">${OUI}<div class="mp-us-v mp-us-ligne">${mini({ cernes: cE.cernes, actif: cE.actif, taille: 38, cadre: 5 })}<div><b>${fr(ecos.titre)}</b><span>${A.code(ecos.code, 'vermillon')}${plage(ecos)}</span></div></div><figcaption>${fr('En ligne de tableau · 38 px')}</figcaption></figure>
     <figure class="mp-carte">${OUI}<div class="mp-us-v">${mini({ cernes: A.cernesDe(parCode('ECSI')).cernes, actif: 1, taille: 118 })}</div><figcaption>${fr('En tête de fiche · 150 px')}</figcaption></figure>
     <figure class="mp-carte mp-n">${OUI}<div class="mp-us-v mp-us-geant" data-coupe>${A.empreinte({ cernes: [1, 1, 1, 0.62, 0.2], c: 'menthe', piste: '#1D4A47', actif: 3, cActif: 'miel' })}</div><figcaption>${fr('Géante, coupée par les bords')}</figcaption></figure>
     <figure class="mp-carte">${OUI}<div class="mp-us-v" style="gap:10px">${A.icone(44)}${A.icone(44, 'nuit', 'miel')}${A.icone(44, 'papier', 'vermillon')}</div><figcaption>${fr('En icône de l’outil')}</figcaption></figure>
     <figure class="mp-carte">${NON}<div class="mp-us-v mp-us-puces">${[0, 1, 2].map(() => `<p>${mini({ cernes: [1, 1, 1], taille: 20 })}<i></i></p>`).join('')}</div><figcaption>${fr('En puce, sans donnée')}</figcaption></figure>
     <figure class="mp-carte">${NON}<div class="mp-us-v">${mini({ cernes: [1, 1, 1, 1, 1, 0.8, 0.5, 0.2, 0], actif: 7, taille: 118 })}</div><figcaption>${fr('Plus de six boucles')}</figcaption></figure>
     <figure class="mp-carte">${NON}<div class="mp-us-v" style="gap:16px">${mini({ cernes: [1, 0.7, 0.2], actif: 1, taille: 14 })}${mini({ cernes: [1, 0.7, 0.2], actif: 1, taille: 20 })}</div><figcaption>${fr('Sous 32 px')}</figcaption></figure>
     <figure class="mp-carte">${NON}<div class="mp-us-v"><div style="transform:scaleX(-1) rotate(24deg)">${A.empreinte({ cernes: [1, 1, 0.6, 0.2], c: 'rose', piste: 'miel', taille: 108 })}</div></div><figcaption>${fr('Retournée, recolorée')}</figcaption></figure>
   </div>`));

/* =================================================================== 04 Les couleurs */
const ROLES = { vermillon: 'alertes, année en cours, un mot', ocre: 'le symbole, la terre', lagune: 'texte coloré, tracés', papier: 'la page', sable: 'fonds neutres, pistes', corail: 'aquarelle', rose: 'aquarelle', peche: 'aquarelle', miel: 'aquarelle, accent sur la nuit',
  emeraude: 'exécuté, à jour', nuit: 'un panneau dense', encre: 'le texte', blanc: 'cartes, écrans', menthe: 'fond de pastille', brume: 'fond de pastille' };
const nuance = (k) => `<div class="mp-nu${k === 'blanc' || k === 'papier' ? ' mp-bord' : ''}" style="background:${C[k]};color:${clair(C[k]) ? C.encre : C.blanc}"><b>${N[k]}</b><i>${C[k]}</i><span>${fr(ROLES[k])}</span></div>`;
P.palette = page('palette', '', corps('palette', 'Quinze couleurs, chacune son rôle',
  'Neuf sont relevées sur les documents du GRDR : son logo, la couverture de son rapport 2025. Une vient de l’application livrée. Cinq sont proposées, pour tenir les deux bouts de l’échelle.',
  ['Vermillon : vif et rare. Une alerte, l’année en cours, un mot.', 'Lagune : le texte coloré et les tracés.', 'Émeraude : ce qui est exécuté, en aplat seulement.', 'Nuit : un seul panneau dense par écran.'],
  `<div class="mp-pal">
     ${lbl('Relevées sur le logo officiel')}<div class="mp-pal-r mp-pal-a">${['vermillon', 'ocre', 'lagune'].map(nuance).join('')}</div>
     ${lbl('Relevées sur le rapport d’activité 2025')}<div class="mp-pal-r">${['papier', 'sable', 'corail', 'rose', 'peche', 'miel'].map(nuance).join('')}</div>
     ${lbl('De l’application livrée, puis proposées')}<div class="mp-pal-r">${['emeraude', 'nuit', 'encre', 'blanc', 'menthe', 'brume'].map(nuance).join('')}</div>
   </div>`));

const PROP = [['papier', 46, 'Papier'], ['blanc', 24, 'Blanc de papier'], ['encre', 12, 'Encre'], ['lagune', 6, 'Lagune'], ['nuit', 4, 'Nuit'], ['aq', 5, 'Aquarelle'], ['vermillon', 3, 'Vermillon']];
const PAIRES = [['encre', 'papier'], ['encre', 'blanc'], ['lagune', 'blanc'], ['lagune', 'papier'], ['blanc', 'nuit'], ['miel', 'nuit'], ['blanc', 'lagune'], ['ocre', 'blanc'], ['vermillon', 'blanc'], ['emeraude', 'blanc']];
const verdict = (r) => (r >= 7 ? 'tout texte' : r >= 4.5 ? 'texte courant' : r >= 3 ? 'grands titres seulement' : 'jamais en texte');
P.contrastes = page('contrastes', '', corps('contrastes', 'Du papier, de l’encre, et la couleur par touches',
  'La page est en papier, le texte en encre. La couleur arrive par touches : un panneau d’aquarelle, un panneau de nuit, un mot en vermillon. Les contrastes ci-contre sont calculés, pas estimés.',
  ['Texte courant : encre sur clair, blanc sur nuit.', 'Vermillon et émeraude : jamais en petit texte sur fond clair.', 'Pour dire « exécuté » en texte : la lagune. L’émeraude reste un aplat.'],
  `<section class="mp-carte mp-prop">${lbl('Proportions sur un écran ou une planche')}
     <div class="mp-prop-b">${PROP.map(([k, v, t]) => `<div style="flex:${v};${k === 'aq' ? 'background:var(--aq-aube)' : `background:${C[k]}`}"></div>`).join('')}</div>
     <div class="mp-prop-l">${PROP.map(([k, v, t]) => `<span><u style="${k === 'aq' ? 'background:var(--aq-aube)' : `background:${C[k]}`}"></u>${fr(t)}<b>${v}${NB}%</b></span>`).join('')}</div></section>
   <section class="mp-carte mp-ctr">${lbl('Contrastes mesurés · texte sur fond')}
     <div class="mp-ctr-g">${PAIRES.map(([a, b]) => { const r = A.contraste(C[a], C[b]); return `<div><span class="mp-ctr-e${b === 'blanc' ? ' mp-bord' : ''}" style="background:${C[b]};color:${C[a]}">Aa 761</span><p><b>${fr(`${N[a]} sur ${N[b].toLowerCase()}`)}</b><span>${fr(verdict(r))}</span></p><i>${virg(r, 1)}</i></div>`; }).join('')}</div></section>`, { taille: 38, st: 'grid-template-rows:auto 1fr' }));

/* =================================================================== 05 La typographie */
P.typographie = page('typographie', '', `<div class="mp-corps mp-typo-h">
    ${colonne('typographie', 'Nunito, et deux compagnes', 'Nunito est la police des publications du GRDR : ronde, franche, en bas de casse. On lui adjoint Nunito Sans pour le texte et l’interface, et Geist Mono pour les codes.',
      ['Titres en Nunito 800 ou 900, serrés, en bas de casse.', 'Montants en chiffres tabulaires, jamais arrondis dans un tableau.', 'Codes et étiquettes en Geist Mono, en capitales.'])}
    <div class="mp-demo mp-fam">
      <section class="mp-carte"><b class="mp-fam-aa" style="font-family:var(--titre);font-weight:900;color:${C.vermillon}">Aa</b><h3>Nunito</h3>${leg('Titres, chiffres clés · 800 et 900')}<div class="mp-fam-g" style="font-family:var(--titre)">${[600, 700, 800, 900].map((g) => `<span style="font-weight:${g}">grdr<i>${g}</i></span>`).join('')}</div><p style="font-family:var(--titre);font-weight:800;font-size:19px;letter-spacing:-.03em;line-height:1.08">${fr('Un budget pluriannuel, lisible d’un regard.')}</p></section>
      <section class="mp-carte"><b class="mp-fam-aa" style="font-weight:400">Aa</b><h3>Nunito Sans</h3>${leg('Texte courant, interface · 400 à 700')}<div class="mp-fam-g">${[400, 500, 600, 700].map((g) => `<span style="font-weight:${g}">budget<i>${g}</i></span>`).join('')}</div><p style="font-size:12.5px;line-height:1.45">${fr('Prorata temporis, budgets acquis et restants : les calculs se font seuls, les montants exécutés viennent de Sage.')}</p></section>
      <section class="mp-carte"><b class="mp-fam-aa" style="font-family:var(--mono);font-weight:500;color:${C.lagune};letter-spacing:-.06em">Aa</b><h3>Geist Mono</h3>${leg('Codes, étiquettes, journal · 500')}<div class="mp-fam-g" style="font-family:var(--mono)">${[400, 500, 600].map((g) => `<span style="font-weight:${g}">ECOS<i>${g}</i></span>`).join('')}</div><p class="chiffres" style="font-family:var(--titre);font-weight:800;font-size:19px;letter-spacing:-.03em;line-height:1.2;text-align:right">${A.nombre(D.synthese.budget)}<br>${A.nombre(ecos.total)}</p></section>
    </div></div>
  <div class="mp-typo-g" data-coupe>à l’euro près</div>
  <div class="mp-typo-n">${[['Géant', 'Nunito 900 · interligne 0,86 · approche −0,05 em'], ['Titre', 'Nunito 800 · 0,96 · −0,035 em'], ['Chapô', 'Nunito 600 · 24 px'], ['Texte', 'Nunito Sans 400 · 16 px'], ['Étiquette', 'Geist Mono 500 · 10,5 px']].map(([a, b]) => `<span><b>${a}</b>${fr(b)}</span>`).join('')}</div>`);

/* =================================================================== 06 Matière et image */
P.aquarelle = page('aquarelle', '', corps('aquarelle', 'L’aquarelle, sur papier crème',
  'La matière vient de la couverture du rapport 2025 : des lavis sur papier crème. Cinq lavis sont rendus une fois pour toutes. Le symbole s’y pose en filigrane, très grand, coupé par les bords.',
  ['Un seul panneau d’aquarelle par écran ou par planche.', 'Toujours du corail vers le miel, jamais l’inverse.', 'Le filigrane : le symbole en blanc, à 50 %, coupé par deux bords au moins.', 'Sur le lavis, le texte est en encre et le logo en blanc.'],
  `${A.aquarelle('aube', { cls: 'mp-aq-g grain', pos: '50% 40%', html: `${A.filigrane({ c: 'blanc', op: 0.5, style: 'right:-60px;top:-120px;width:430px;height:580px' })}<p class="mp-lbl net">${fr('Lavis « aube » · filigrane blanc à 50 %')}</p><p class="mp-aq-t net">${fr('Citoyens d’ici et de là-bas')}</p>` })}
   <div class="mp-aq-r">${Object.keys(A.AQUARELLES).map((n) => `<figure>${A.aquarelle(n)}<figcaption><b>${n}</b>${fr(A.AQUARELLES[n])}</figcaption></figure>`).join('')}</div>`, { st: 'grid-template-rows:1fr auto' }));

/* Teintes d'aquarelle par pays : les couleurs nommées du socle, et les trois lavis clairs que le tableau de bord emploie déjà */
const TEINTES = { MR: 'corail', FR: 'peche', SN: 'rose', ML: 'miel', GN: '#F6C98E', GW: '#F1DCC4', TN: '#F6C98E', DZ: '#F8DDB8' };
const CADRE = [84, 0, 720, 1166];
P.image = page('image', '', corps('image', 'Ici et là-bas',
  'L’image de la marque, c’est son double espace : huit pays sur une même carte, de la France au fleuve Sénégal. Les photos de terrain sont les trois déjà publiées ; elles passent sous un lavis.',
  ['La carte : en sable sur papier, les pays d’intervention en teintes d’aquarelle.', 'Une empreinte se pose par son pied, sur le bureau.', 'Trois photos, pas une de plus. Aucune personne générée.', 'Brute, sous lavis ou en deux tons. Jamais tramée.'],
  `<section class="mp-carte mp-map">
     ${typeof A.carte === 'function' ? A.carte({ cadre: CADRE, par: 'xMidYMid slice', ke: 1.93, terres: 'sable', filet: 'papier', pays: TEINTES, villes: true, rVille: 6, cVille: 'encre', attrs: 'class="mp-map-s"',
       epingles: [{ ville: 'Sélibaby', v: 0.7, cernes: cE.cernes.slice(0, 4), c: 'nuit' }, { ville: 'Tunis', v: 0.45, cernes: [1, 0.56, 0], c: 'nuit' }, { ville: 'Conakry', v: 0.45, cernes: [1, 0.63, 0], c: 'nuit' }] }) +
       A.carte({ cadre: CADRE, par: 'xMidYMid slice', terres: null, pays: {}, villes: ['Montreuil', 'Alger', 'Dakar', 'Bamako'], noms: true, tailleNom: 25, rVille: 0, attrs: 'class="mp-map-s"' }) : ''}
     ${lbl('Les bureaux · rapport d’activité 2025')}</section>
   <div class="mp-photos">
     <figure>${A.photo('marche')}${leg('Brute')}</figure>
     <figure>${A.photo('atelier', { mode: 'lavis', aq: 'aube' })}${leg('Sous lavis')}</figure>
     <figure>${A.photo('artisan', { mode: 'duo', c: 'peche', c2: 'nuit' })}${leg('En deux tons')}</figure>
   </div>`, { st: 'grid-template-columns:1fr 1fr' }));

/* =================================================================== 07 Marge et graphiques */
const ligne = (p) => `<tr><td>${A.code(p.code, p.alerte ? 'vermillon' : 'lagune')}</td><td>${fr(p.titre.length > 24 ? p.titre.slice(0, 23).replace(/\s+\S*$/, '') + '…' : p.titre)}</td><td class="d">${A.nombre(p.total)}</td><td class="d">${A.nombre(p.execute)}</td><td class="d l">${A.nombre(p.total - p.execute)}</td></tr>`;
P.marge = page('marge', '', corps('marge', 'La marge du comptable',
  'Tout document de suivi budgétaire a sa marge : un code analytique, un montant, la trace de qui a fait quoi. On la garde, et on la soigne.',
  ['Le code : en chasse fixe, dans sa pastille.', 'Le montant : en Nunito grasse et chiffres tabulaires, à l’euro près.', 'Le tampon dit qui, quoi, quand.', 'Dans un tableau, un montant ne s’arrondit jamais.'],
  `<section class="mp-carte mp-feuille">
     <div class="mp-f-tete">${lbl(`Portefeuille · ${D.synthese.projets} projets signés · exercice ${D.exercice}`)}${A.tampon(`Extrait de Sage · ${D.extraction.court}`)}</div>
     <div class="mp-f-total">${A.montant(D.synthese.budget)}</div>
     <table class="mp-f-t chiffres"><colgroup><col style="width:62px"><col><col style="width:86px"><col style="width:86px"><col style="width:86px"></colgroup>
       <thead><tr><th>Code</th><th>Projet</th><th class="d">Budget total</th><th class="d">Exécuté</th><th class="d">Reste</th></tr></thead>
       <tbody>${D.projets.map(ligne).join('')}</tbody></table>
     <div class="mp-f-pied">${A.tampon('Modifié par Julien P. · 14:52', 'ocre')}${A.tampon('ECOS · se termine dans 8 mois', 'vermillon')}</div>
   </section>
   <div class="mp-anat">
     <section class="mp-carte">${lbl('Le code')}<div class="mp-anat-v" style="font-size:15px">${D.projets.slice(0, 4).map((p, i) => A.code(p.code, ['lagune', 'ocre', 'vermillon', 'emeraude'][i])).join('')}</div><p>${fr('Geist Mono 600, sur une pastille teintée à 13 %.')}</p></section>
     <section class="mp-carte">${lbl('Le montant')}<div class="mp-anat-v" style="font-size:40px;color:${C.lagune}">${A.montant(ecos.total - ecos.execute)}</div><p>${fr('Nunito 800, espaces fines, le signe € en retrait.')}</p></section>
     <section class="mp-carte">${lbl('Le tampon')}<div class="mp-anat-v">${A.tampon(`Awa D. · Affectation · 11:07`, 'lagune')}</div><p>${fr('Un point de couleur, puis qui, quoi, quand.')}</p></section>
   </div>`, { st: 'grid-template-columns:2.15fr 1fr' }));

const ecoule = (p) => (APP.ecoule ? APP.ecoule(p) : null);
const FICHE = APP.FICHE || { annees: [{ a: 2022, prevu: 610000, execute: 588400 }, { a: 2023, prevu: 780000, execute: 771300 }, { a: 2024, prevu: 790000, execute: 742640 }, { a: 2025, prevu: 760000, execute: 260600, encours: true }, { a: 2026, prevu: 154068, execute: 0 }] };
P.graphiques = page('graphiques', '', corps('graphiques', 'Le trait du symbole, appliqué aux chiffres',
  'Les graphiques sont tracés comme le symbole : bouts ronds, épaisseur constante. Sous la courbe, des échos parallèles : les cernes, à plat.',
  ['La jauge : une piste en sable, l’exécuté tracé, un repère pour le prorata.', 'La courbe : l’exécuté en lagune avec ses échos, l’attendu en pointillé ocre.', 'Les années : le prévu en sable, l’exécuté en lagune, l’année en cours en vermillon.'],
  `<section class="mp-carte mp-gr-c">${lbl(`La courbe à échos · exécution de l’exercice ${D.exercice}, cumul`)}
     ${A.courbe({ w: 716, h: 236, labels: D.mois, max: 4400000, marge: [12, 14, 26, 58], series: [{ v: D.cumulPrevu, c: 'ocre', ep: 2.2, tirets: '1.5 7' }, { v: D.cumulExecute, c: 'lagune', ep: 3.8, echos: 8, pasEcho: 10 }], point: 1, id: 'mpc' })}</section>
   <div class="mp-g2" style="grid-template-columns:1fr 1.1fr">
     <section class="mp-carte">${lbl(`Les années · ${ecos.code}`)}${A.annees({ w: 320, h: 188, annees: FICHE.annees, ep: 20 })}</section>
     <section class="mp-carte mp-gr-j">${lbl('La jauge · exécuté, et repère du prorata')}
       ${['ECOS', 'ECSI', 'JPAT', 'HWCL'].map(parCode).map((p) => `<div>${A.code(p.code, p.alerte ? 'vermillon' : 'lagune')}${A.jauge({ v: p.taux, repere: ecoule(p), w: 190, ep: 7, c: p.alerte ? 'vermillon' : 'emeraude' })}<b>${A.pct(p.taux)}</b></div>`).join('')}</section>
   </div>`, { taille: 40, st: 'grid-template-rows:auto 1fr' }));

/* =================================================================== 08 L'interface */
const ecran = (n, o = {}) => (existe(n) ? APP[n](o) : '');
P.interface = page('interface', '', `<div class="mp-corps mp-large">
    ${colonne('interface', 'Du papier, pas du gris', 'Fond crème, cartes en blanc de papier. Un panneau d’aquarelle pour le chiffre qui compte, un panneau de nuit pour ce qui est dense. Le reste se tait.',
      ['Une grille de 12 colonnes, des cartes au rayon de 22 px.', 'Un seul panneau d’aquarelle et un seul panneau de nuit par écran.', 'Le chiffre d’abord, en Nunito grasse ; son étiquette en chasse fixe.', 'Chaque projet garde son empreinte, partout où il apparaît.'], { taille: 42 })}
    <div class="mp-demo"></div></div>
  ${fenetre(ecran('tableauDeBord', { h: 1010, id: 'mpi' }), 0.64, 'left:416px;top:78px')}`);

const aTel = existe('mAccueil');
P.ecrans = page('ecrans', '', `<div class="mp-corps mp-large">
    ${colonne('ecrans', 'La même grammaire, d’écran en écran', 'Du portefeuille à la ligne budgétaire : l’empreinte en tête, les montants à droite, le journal en marge.' + (aTel ? ' Sur téléphone, le chef de projet retrouve ses projets et ses alertes.' : ''),
      ['Bureau : 1440 px de large. Téléphone : 390 × 844.', 'Jusqu’à trois personnes par ligne budgétaire.', 'Rien ne change sans laisser de trace : le journal est sur chaque fiche.'], { taille: 40 })}
    <div class="mp-demo"></div></div>
  ${fenetre(ecran('ficheProjet', { h: 1180 }), 0.54, 'left:416px;top:78px')}
  ${aTel ? `<div class="mp-tel" data-coupe>${A.phone(APP.mAccueil({}), 0.56)}</div>` : ''}`);

/* =================================================================== 09 Le mouvement */
const DUREE = 1, DECAL = 0.12, FIN = DUREE + 4 * DECAL;
const temps = [0.15, 0.4, 0.7, 1.0, FIN];
const courbeEase = (() => { const w = 230, h = 150, pts = []; for (let i = 0; i <= 28; i++) { const x = i / 28; pts.push(`${(20 + x * (w - 34)).toFixed(1)},${(h - 22 - A.ease(x) * (h - 38)).toFixed(1)}`); }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none" stroke-linecap="round"><path d="M20,${h - 22} H${w - 14} M20,${h - 22} V16" stroke="${C.encre}" stroke-opacity=".25"/><path d="M20,16 H${w - 14}" stroke="${C.encre}" stroke-opacity=".14" stroke-dasharray="2 5"/><path d="M${pts.join(' L')}" stroke="${C.vermillon}" stroke-width="3.6" stroke-linejoin="round"/><text x="20" y="${h - 6}" font-family="Geist Mono, monospace" font-size="9" fill="${C.encre}" fill-opacity=".55">0</text><text x="${w - 14}" y="${h - 6}" text-anchor="end" font-family="Geist Mono, monospace" font-size="9" fill="${C.encre}" fill-opacity=".55">durée du tracé</text></svg>`; })();
const partition = (() => { const w = 440, tot = FIN + 1.5, X = (t) => 8 + (t / tot) * (w - 16); let s = '';
  for (let i = 0; i < 5; i++) s += `<path d="M${X(i * DECAL).toFixed(1)},${14 + i * 17} H${X(i * DECAL + DUREE).toFixed(1)}" stroke="${C.ocre}" stroke-width="9"/>`;
  s += `<path d="M${X(FIN).toFixed(1)},${14 + 2 * 17} H${X(tot).toFixed(1)}" stroke="${C.sable}" stroke-width="9" stroke-dasharray=".1 15"/>`;
  s += `<path d="M${X(0)},104 H${X(tot)}" stroke="${C.encre}" stroke-opacity=".2"/>` + [[0, '0'], [FIN, `${virg(FIN, 2)} s`], [tot, `${virg(tot, 2)} s`]].map(([t, l], i) => `<path d="M${X(t).toFixed(1)},100 v8" stroke="${C.encre}" stroke-opacity=".4"/><text x="${X(t).toFixed(1)}" y="122" text-anchor="${i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}" font-family="Geist Mono, monospace" font-size="9" fill="${C.encre}" fill-opacity=".6">${l}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 128" width="${w}" height="128" fill="none" stroke-linecap="round">${s}</svg>`; })();
P.mouvement = page('mouvement', '', corps('mouvement', 'Le trait qui s’enroule',
  'Tout part du pied, monte, s’enroule. Une boucle après l’autre. Les chiffres montent avec leur tracé, puis l’image se pose et ne bouge plus.',
  ['De 0,6 à 1,4 s par tracé.', 'De 0,08 à 0,15 s de décalage entre deux éléments.', 'Une sortie quartique, puis 1,5 s immobile.', 'Jamais de rebond, de rotation, de fondu entre deux couleurs éloignées.'],
  `<section class="mp-carte mp-film">${lbl(`Le symbole se trace · cinq traits de ${virg(DUREE)} s, décalés de ${virg(DECAL)} s`)}
     <div>${temps.map((t, n) => `<figure>${A.symbolTrace({ p: [0, 1, 2, 3, 4].map((i) => A.ease((t - i * DECAL) / DUREE)), piste: 'sable', id: 'mpm' + n, attrs: 'style="height:182px;width:auto"' })}${leg(`${virg(t, 2)} s`)}</figure>`).join('')}</div></section>
   <div class="mp-g2" style="grid-template-columns:auto 1fr">
     <section class="mp-carte">${lbl('La courbe · sortie quartique')}${courbeEase}</section>
     <section class="mp-carte">${lbl('La partition · cinq tracés, puis l’image se pose')}${partition}</section>
   </div>`, { st: 'grid-template-rows:1fr auto' }));

/* =================================================================== 10 En situation */
const repli = (t) => `<div class="mp-repli-t">${A.symbol('ocre')}<span>${fr(t)}</span></div>`;
P.situation = page('situation', '', corps('situation', 'Hors de l’écran',
  'Sur un portable, dans un rapport imprimé, sur une affiche : l’outil et son système tiennent ensemble, loin de l’interface.',
  ['L’écran est plaqué tel qu’il est, jamais redessiné pour la photo.', 'Un décor de papier, de terre ou de velours sombre : rien qui dispute la couleur.', 'Une pièce, une idée.'],
  `<div class="mp-sit">
     ${media('final', '35-portable-velours.jpg', { st: 'grid-column:1 / span 2', pos: '50% 46%', repli: repli('Le portable, sur velours') })}
     ${media('plates', '38-affiche.png', { st: 'grid-row:1 / span 2;grid-column:3', pos: '50% 46%', repli: repli('L’affiche') })}
     ${media('final', '36-portable-terre.jpg', { pos: '50% 50%', repli: repli('Le portable, sur terre') })}
     ${media('plates', '37-suivi-imprime.png', { pos: '30% 40%', repli: repli('Le suivi imprimé') })}
   </div>`, { cls: 'mp-large' }));

/* =================================================================== Crédits */
P.credits = page('credits', 'nuit', `<img class="mp-fond" src="${A.aqURL('nuit')}" alt="" style="opacity:.55">
  <div class="mp-cred-e" data-coupe>${A.empreinte({ cernes: [1, 1, 1, 1, 0.62, 0.2], c: 'menthe', piste: 'rgba(255,251,246,.1)', actif: 4, cActif: 'miel' })}</div>
  <div class="mp-cred">
    <div class="mp-couv-logo">${A.lockup('blanc', 'aria-hidden="true"')}</div>
    <div class="mp-cred-t"><p>${fr('Le budget de chaque projet,')}<br><em>${fr('à l’euro près.')}</em></p></div>
    <div class="mp-cred-g">
      <div>${lbl('Mention')}<p>${fr('Proposition KLYRA, non validée par le GRDR. Logo, couleurs et police du GRDR. Données de démonstration.')}</p></div>
      <div>${lbl('Polices')}<p>${fr('Nunito, Nunito Sans, Geist Mono. Licences libres (SIL Open Font License).')}</p></div>
      <div>${lbl('Sources')}<p>${fr('Logo, couleurs, pays et bureaux : rapport d’activité 2025 du GRDR. Photos : les trois images de terrain déjà publiées.')}</p></div>
      <div>${lbl('Guide')}<p>${fr(`${ORDER.length} pages · 2026 · KLYRA pour le GRDR`)}</p></div>
    </div>
  </div>`, { sansBande: true });

/* ---------- Crochet après insertion : rien à rendre hors HTML (pas de canvas) ; gardé pour le contrat ---------- */
const apres = (racine) => { if (!racine) return; };

window.GuidePages = P;
window.GuideOrder = ORDER;
window.GuideTitles = TITLES;
window.GuideApres = apres;
/* Ce que le guide en ligne reprend tel quel, pour dire la même chose que les pages (site/assets/guide.js) */
window.GuideOutils = { fr, lire, zoneSVG, mesureSymbole, mesureEmpreinte, courbeEase, faux, clair, verdict, FONDS, ROLES, PROP, PAIRES, TEINTES, FICHE, chapitres: CH };
/* Rendus de out/final cités par les pages (à produire avant le PDF) */
window.GuideRendus = ['35-portable-velours.jpg', '36-portable-terre.jpg'];
})();
