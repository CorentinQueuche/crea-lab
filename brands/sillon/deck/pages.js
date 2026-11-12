/* PAGES DU GUIDE — gabarit neutre (deck/pages.js). Trois pages : une couverture, une page type, un dos.
   SOURCE UNIQUE des pages du guide : le PDF (node tools/deck.mjs puis python tools/deck_pdf.py), la visionneuse du site
   (site/presentation.html) et la planche mosaïque de l'étude de cas (plates/NN-charte.html) lisent ce fichier.

   CONTRAT (ce que les outils attendent ; à garder quand on réécrit) :
   - Chargé après brand/marque.js (window.Marque). Styles : brand/marque.css puis deck/pages.css.
   - window.GuidePages   { clé : HTML d'une page }. Une page est un fragment de 1280 × 720 posé dans un conteneur .mp-in.
   - window.GuideOrder   les clés, dans l'ordre. Le PDF et la visionneuse ont autant de pages que cette liste.
   - window.GuideTitles  un titre par clé, dans le même ordre (barre de la visionneuse, vignettes).
   - window.GuideRendus  les fichiers de out/final/ que les pages citent : ce qui doit être rendu avant le PDF.
   - window.GuideApres(racine)  crochet appelé APRÈS l'écriture d'une page dans le document, par deck/render.html (show),
                         la visionneuse et la mosaïque. Pour ce qui ne s'écrit pas en HTML (canvas, mesures). Synchrone :
                         deck.mjs capture juste après.
   - window.show(k)      défini dans deck/render.html, pas ici : tools/deck.mjs l'appelle pour chaque clé de GuideOrder.
   - Images : img(sous-dossier de out/, fichier). window.GuideMedia, défini AVANT ce script par le site, remplace le
     dossier : python tools/build_site.py copie dans guide-media/ chaque .png ou .jpg cité ici et trouvé dans out/final,
     out/plates, out/motion ou out/art (rangés à plat : des noms de fichier uniques).
   - Cadre d'image (media) : le repli dessiné en HTML est SOUS l'image (z-index 1 contre 2). Un fichier absent retire
     l'image, pose data-absente sur le cadre (deck.mjs le signale) et laisse voir le repli.
   - Numéros (bandeau, sommaire) calculés depuis ORDER : on réordonne CH, tout suit. Ne jamais les écrire à la main.
   - Classes préfixées mp-. Un élément coupé exprès par le bord porte data-coupe (deck.mjs ne le signale pas).

   À RÉÉCRIRE : tout le contenu (CH, les pages, chaque « À REMPLIR ») et toute la mise en page (deck/pages.css).
   Les pages ci-dessous ne proposent aucune composition : elles montrent la mécanique, en gris. */
(function () {
const A = window.Marque, C = A.COULEURS, NB = A.NB || ' ';
const img = (sub, f) => (window.GuideMedia || '../out/' + sub + '/') + f;

/* ---------- Chapitres : [numéro, titre, pages [clé, titre]] (À REMPLIR) ---------- */
const CH = [
  ['01', 'À REMPLIR : chapitre', [['type', 'À REMPLIR : page type']]],
];
const ORDER = ['couverture', ...CH.flatMap((c) => c[2].map((s) => s[0])), 'dos'];
const TITLES = ['Couverture', ...CH.flatMap((c) => c[2].map((s) => s[1])), 'Dos'];
const pad = (n) => String(n).padStart(2, '0');
const num = (k) => pad(ORDER.indexOf(k) + 1);
const chap = (k) => CH.find((c) => c[2].some((s) => s[0] === k));
const etiq = (k) => { const c = chap(k); return c ? `${c[0]} · ${c[1]}` : ''; };

/* ---------- Typographie française : espaces insécables (texte seulement, jamais dans un SVG) ---------- */
const fr = (s) => String(s)
  .replace(/(\d) (?=\d{3}(?!\d))/g, '$1' + NB)
  .replace(/(\d) (?=(%|px|mm|ms|s|h|°)(?![\wÀ-ÿ]))/g, '$1' + NB)
  .replace(/ ([:;!?»])/g, NB + '$1')
  .replace(/« /g, '«' + NB);

/* ---------- Éléments communs (mécanique) ---------- */
const lbl = (t) => `<p class="mp-lbl">${fr(t)}</p>`;
const titre = (t, taille = 46) => `<h2 class="mp-titre" style="font-size:${taille}px">${fr(t)}</h2>`;
const chapo = (t) => `<p class="mp-chapo">${fr(t)}</p>`;
const regles = (L) => `<ol class="mp-regles">${L.map((r, i) => `<li><i>${pad(i + 1)}</i><span>${fr(r)}</span></li>`).join('')}</ol>`;
const vide = (t) => `<div class="mp-vide">${fr(t)}</div>`;
/* Bandeau : marque, chapitre, titre de la page, numéro sur le total */
const bande = (k) => { const i = ORDER.indexOf(k);
  return `<div class="mp-bande"><span>${A.NOM} · Guide de marque</span><span>${fr(etiq(k))}</span><span>${fr(TITLES[i])}</span><span>${num(k)}${NB}/${NB}${pad(ORDER.length)}</span></div>`; };
/* Une page : fond (« » ou « clair »), contenu, bandeau sauf mention contraire */
const page = (k, fond, inner, o = {}) => `<div class="mp-page${fond ? ' mp-' + fond : ''}" data-page="${k}">${inner}${o.sansBande ? '' : bande(k)}</div>`;
/* Image de out/<sub>/ dans un cadre : repli (z 1) SOUS l'image (z 2). L'image absente se retire et marque le cadre. */
const media = (sub, f, o = {}) => `<div class="mp-cadre" style="${o.st || ''}">` +
  `<div class="mp-repli" data-coupe>${o.repli || ''}</div>` +
  `<img class="mp-img" src="${img(sub, f)}" alt="" style="object-position:${o.pos || '50% 50%'}" onerror="this.parentNode.setAttribute('data-absente',this.getAttribute('src'));this.remove()">` +
  `</div>`;
/* Canvas rendu par GuideApres après insertion (défini à deux fois sa taille d'affichage) */
const canvas = (w, h) => `<canvas class="mp-canvas" data-mp-apres width="${w * 2}" height="${h * 2}" style="width:${w}px;height:${h}px"></canvas>`;

const P = {};

/* ---------- Couverture (À REMPLIR) ---------- */
P.couverture = page('couverture', '', `
  <div class="mp-pile">
    <div class="mp-logo">${A.wordmark('currentColor', 'aria-hidden="true"')}</div>
    <div>${lbl(`${A.NOM} · Guide de marque · ${ORDER.length} pages`)}${titre('À REMPLIR : titre de couverture', 72)}${chapo('À REMPLIR : une phrase qui dit ce que contient ce guide.')}</div>
    ${vide('À REMPLIR : la couverture se compose pour la marque (signature, image, pièce maîtresse). Rien ici n’est une proposition.')}
  </div>`, { sansBande: true });

/* ---------- Page type : colonne de texte et zone de démonstration (À REMPLIR) ----------
   Une page, une règle : un titre, trois à cinq lignes, une démonstration, deux à quatre règles courtes. */
P.type = page('type', '', `
  <div class="mp-corps">
    <div class="mp-colonne">
      ${lbl(etiq('type'))}
      ${titre('À REMPLIR : le titre de la page, dans un bloc qui coule')}
      ${chapo('À REMPLIR : trois à cinq lignes d’introduction. Les valeurs chiffrées (zone de protection, tailles, proportions) viennent de MARQUE.md, mot pour mot.')}
      ${regles(['À REMPLIR : première règle courte.', 'À REMPLIR : deuxième règle courte.', 'À REMPLIR : troisième règle, s’il en faut une.'])}
    </div>
    <div class="mp-demo">
      ${media('plates', '01-essai.png', { repli: vide('Repli : image absente (out/plates/01-essai.png). Dès que le fichier existe, l’image passe au-dessus de ce repli.') })}
      <div class="mp-demo-bas">${canvas(120, 68)}<p class="mp-leg">${fr('À REMPLIR : légende. À gauche, un canvas dessiné par GuideApres après l’insertion de la page (exemple de crochet, à remplacer).')}</p></div>
    </div>
  </div>`);

/* ---------- Dos (À REMPLIR) ---------- */
P.dos = page('dos', 'clair', `
  <div class="mp-pile">
    <div class="mp-logo">${A.wordmark('currentColor', 'aria-hidden="true"')}</div>
    <div>${lbl('Crédits')}${chapo('À REMPLIR : crédits (client, studio, année, polices et licences, sources des images).')}</div>
    ${vide('À REMPLIR : la mention qui clôt le guide (marque fictive ou réelle, validation, contact).')}
  </div>`, { sansBande: true });

/* ---------- Crochet après insertion (À REMPLIR : rendre ici les canvas de la marque) ----------
   Exemple neutre : une grille grise dans chaque canvas[data-mp-apres], pour vérifier que les trois lecteurs l'appellent. */
const apres = (racine) => {
  if (!racine) return;
  racine.querySelectorAll('canvas[data-mp-apres]').forEach((cv) => {
    const g = cv.getContext('2d'), w = cv.width, h = cv.height, c = getComputedStyle(cv).color;
    g.clearRect(0, 0, w, h); g.strokeStyle = c; g.globalAlpha = 0.35; g.lineWidth = 2;
    for (let x = 0; x <= w; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.globalAlpha = 1; g.beginPath(); g.moveTo(0, h); g.lineTo(w, 0); g.stroke();
  });
};

window.GuidePages = P;
window.GuideOrder = ORDER;
window.GuideTitles = TITLES;
window.GuideApres = apres;
/* Rendus 3D attendus (fichiers de out/final/ cités par les pages). À REMPLIR quand une page cite un rendu. */
window.GuideRendus = [];
})();
