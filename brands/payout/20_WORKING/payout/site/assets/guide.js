/* Guide de marque Payout — navigation et éléments vivants.
   Le logo, les couleurs, la jauge, les motifs, les écrans et les appareils viennent du socle (window.Marque) : rien n'est redessiné ici.
   Les couleurs sont lues dans Marque.COULEURS, Marque.ECHELLE et les variables CSS du socle ; les rapports de contraste sont calculés
   (Marque.contraste) ; le nombre de pages du guide est lu dans GuideOrder (deck/pages.js) ; le nom du PDF et de l'archive dans Marque.SLUG.
   Règles chiffrées : celles de MARQUE.md (« Règles chiffrées »), recopiées telles quelles dans REGLES ci-dessous. */
(function () {
  const A = window.Marque, C = A.COULEURS, N = A.ECHELLE, D = A.DONNEES;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, '0');
  const NB = ' ';
  const virgule = (x, d = 1) => (Math.round(x * 10 ** d) / 10 ** d).toFixed(d).replace('.', ',').replace(/,0+$/, '');
  const pc = (n) => virgule(n) + NB + '%';
  const css = (el, v) => getComputedStyle(el).getPropertyValue(v).trim();
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Règles chiffrées (MARQUE.md, fixées le 11/11/2026, non validées par Payout) ---------- */
  const REGLES = {
    protection: { logo: 2, symbole: 1 },                         // en graisses (26 dans le repère)
    tailles: [['complet', 'Version complète', 180, 48], ['logotype', 'Logotype', 64, 18], ['symbole', 'Symbole (hauteur)', 16, 5], ['icone', 'Icône d’app', 16, null]],
    proportions: [['coffre', 'Coffre', 62], ['ardoise', 'Ardoise', 14], ['net', 'Net', 10], ['texte', 'Texte clair', 6], ['releve', 'Relevé et Blanc', 6], ['acier', 'Acier', 1.5], ['preleve', 'Prélevé', 0.5]],
    mouvement: { etat: 160, entree: 420, montee: 12, decalage: 80, depart: 400, jauge: 1350, logo: 1800, boucle: 8, courbe: 'cubic-bezier(.16, 1, .3, 1)' },
  };

  /* ---------- Couleurs lues dans le socle ---------- */
  const sonde = document.createElement('div'); sonde.className = 'theme'; sonde.hidden = true; document.body.appendChild(sonde);
  const sondeClair = document.createElement('div'); sondeClair.className = 'theme clair'; sondeClair.hidden = true; document.body.appendChild(sondeClair);
  const TX_CLAIR = css(document.documentElement, '--sur-scene').toUpperCase();   // texte sur Coffre
  const TX_NET = css(sonde, '--t-sur-acc').toUpperCase();                          // texte sur Net
  const PRELEVE_CLAIR = css(sondeClair, '--t-due').toUpperCase();                  // Prélevé du thème clair
  sonde.remove(); sondeClair.remove();
  const COLORS = [
    { k: 'coffre', n: 'Coffre', r: 'Fond de marque', g: 2.4 },
    { k: 'ardoise', n: 'Ardoise', r: 'Panneaux et cartes sombres', g: 1.5 },
    { k: 'acier', n: 'Acier', r: 'Texte secondaire', g: 1 },
    { k: 'releve', n: 'Relevé', r: 'Panneaux clairs, thème clair', g: 1.1 },
    { k: 'blanc', n: 'Blanc', r: 'Cœur des halos, cartes claires', g: 1 },
    { k: 'net', n: 'Net', r: 'Le vert électrique, la part gardée', g: 1.5 },
    { k: 'preleve', n: 'Prélevé', r: 'Ce qui part, rare', g: 0.7 },
  ].map((c) => ({ ...c, h: C[c.k] }));
  const HEX = { ...C, texte: TX_CLAIR, surnet: TX_NET, preleveClair: PRELEVE_CLAIR };
  Object.keys(N).forEach((k) => { HEX['net' + k] = N[k]; });
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const encreSur = (h) => (A.contraste(h, C.coffre) >= A.contraste(h, TX_CLAIR) ? C.coffre : TX_CLAIR);
  const theme = $('#theme-couleur'); if (theme) theme.setAttribute('content', C.coffre);

  /* ---------- Fichiers : noms lus, pas écrits ---------- */
  const PDF = `deck/${A.SLUG}-guide-de-marque.pdf`, ZIP = `logo/${A.SLUG}-logos.zip`;
  $$('[data-pdf]').forEach((a) => { a.href = PDF; });
  $$('[data-zip]').forEach((a) => { a.href = ZIP; });
  const fichier = (chemin) => chemin.split('/').pop();

  /* ---------- Flèches et croix : dessinées par le socle (les polices n'ont pas « → ») ---------- */
  $$('[data-fleche]').forEach((el) => { el.innerHTML = A.fleche('currentColor', el.dataset.fleche === 'g' ? 'transform:rotate(180deg)' : ''); });
  $$('[data-croix]').forEach((el) => { el.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>'; });

  /* ---------- Copier, message ---------- */
  const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('gd-ouvert'); clearTimeout(toast.k); toast.k = setTimeout(() => t.classList.remove('gd-ouvert'), 1600); };
  const copy = async (text, msg) => {
    try { await navigator.clipboard.writeText(text); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toast(msg || 'Copié');
  };

  /* ---------- Médias : ceux qui manquent encore (scènes 3D à venir) disparaissent sans casser la page ---------- */
  const manquants = new Set();
  document.addEventListener('error', (e) => { const t = e.target; if (!t || !t.closest) return; const w = t.closest('[data-media]'); if (!w) return;
    manquants.add(w.dataset.media); w.remove(); }, true);

  /* ---------- Pages, sommaire, navigation ---------- */
  const pages = $$('.page').map((el, i) => ({ el, id: el.id, i, title: el.dataset.title, subs: (el.dataset.subs || '').split('|').filter(Boolean).map((s) => { const k = s.indexOf(':'); return { id: s.slice(0, k), t: s.slice(k + 1) }; }) }));
  $('#marque-lien').innerHTML = A.wordmark(C.net, 'aria-hidden="true"') + '<span>Guide<br>de marque</span>';
  $('#nav').innerHTML = pages.map((p) => `<a href="#${p.id}" data-p="${p.id}"><i>${p.i ? pad(p.i) : '—'}</i>${p.title}</a>` + (p.subs.length ? `<div class="gd-sous" data-s="${p.id}">${p.subs.map((s) => `<a href="#${s.id}">${s.t}</a>`).join('')}</div>` : '')).join('');
  pages.forEach((p) => {
    const prev = pages[p.i - 1], next = pages[p.i + 1], f = (c) => A.fleche('currentColor', c);
    $('[data-pager]', p.el).innerHTML = (prev ? `<a href="#${prev.id}"><span>${f('transform:rotate(180deg);margin-right:8px')}Précédent</span><b>${prev.title}</b></a>` : '') + (next ? `<a href="#${next.id}"><span>Suivant${f('margin-left:8px')}</span><b>${next.title}</b></a>` : '');
  });
  let current = null;
  const show = () => {
    const id = decodeURIComponent(location.hash.slice(1)) || 'accueil';
    const target = document.getElementById(id) || pages[0].el;
    const pageEl = target.classList.contains('page') ? target : target.closest('.page') || pages[0].el;
    if (pageEl !== current) {
      pages.forEach((p) => p.el.classList.toggle('on', p.el === pageEl));
      $$('#nav > a').forEach((a) => { const on = a.dataset.p === pageEl.id; a.classList.toggle('gd-sel', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      $$('#nav .gd-sous').forEach((s) => s.classList.toggle('gd-sel', s.dataset.s === pageEl.id));
      current = pageEl;
      document.title = (pageEl.id === 'accueil' ? '' : pageEl.dataset.title + ' — ') + 'Payout, guide de marque';
      $$('video').forEach((v) => { if (!pageEl.contains(v)) v.pause(); });
      requestAnimationFrame(ajuster);
    }
    $('#sommaire').classList.remove('gd-ouvert'); $('#burger').setAttribute('aria-expanded', 'false');
    if (target === pageEl) window.scrollTo(0, 0); else requestAnimationFrame(() => target.scrollIntoView());
  };
  window.addEventListener('hashchange', show);
  $('#burger').addEventListener('click', () => { const o = $('#sommaire').classList.toggle('gd-ouvert'); $('#burger').setAttribute('aria-expanded', String(o)); });

  /* ---------- Accueil ---------- */
  $('#hero-vu').innerHTML = `<span class="gd-etiq">Sur 100${NB}€ facturés, jusqu’à 85${NB}€ pour vous</span>
    <div class="chiffre gd-hero-chiffre"><span data-j="val">${A.PART.apres}</span><span class="pct">%</span></div>
    ${A.jauge({ forme: 'segments', p: A.PART.apres, avant: A.PART.avant, h: 72, anim: true, c4: C.blanc })}
    <div class="gd-hero-legende"><span>0</span><s>${A.PART.avant} · aujourd’hui</s><b>jusqu’à ${A.PART.apres} · avec Payout</b><span>100</span></div>`;
  const TILE = { marque: '04-avant-apres', logo: '09-logo-variantes', couleurs: '12-couleur', typographie: '14-typographie', elements: '11-jauge-etats', interface: '25-cockpit', mouvement: '10-jauge', situation: '34-reseaux', ressources: '17-archive' };
  $('#tuiles').innerHTML = pages.slice(1).map((p) => `<a href="#${p.id}" data-media="${TILE[p.id]}"><div class="gd-im"><img src="media/vignettes/${TILE[p.id]}.jpg" alt="" loading="lazy"></div><div class="gd-leg"><i>${pad(p.i)}</i>${p.title}</div></a>`).join('');
  // Présentation : nombre de pages et vignettes lus dans deck/pages.js (même source que le PDF)
  const ORDRE = Array.isArray(window.GuideOrder) ? window.GuideOrder : null;
  const nPages = ORDRE ? ORDRE.length : 0;
  $$('[data-nb-pages]').forEach((e) => { e.textContent = nPages ? `PDF · ${nPages}${NB}pages · 16:9` : 'PDF · 16:9'; });
  const repli = `<span class="gd-apercu-vide g1 grain">${A.wordmark(C.blanc, 'aria-hidden="true"')}</span>`;
  const choisir = (fin) => { const n = nPages || 4; const k = fin ? [0.45, 0.6, 0.75, 0.9] : [0, 0.3, 0.55, 0.8]; return [...new Set(k.map((x) => Math.min(n, 1 + Math.round(x * (n - 1)))))]; };
  $$('[data-apercu]').forEach((a) => {
    if (!nPages) { a.innerHTML = repli; return; }
    a.innerHTML = choisir(a.dataset.apercu === 'fin').map((n) => `<img src="deck/${pad(n)}.jpg" alt="" loading="lazy">`).join('');
    $$('img', a).forEach((im) => im.addEventListener('error', () => { a.innerHTML = repli; }, { once: true }));
  });

  /* ---------- 01 Marque ---------- */
  $('#chiffre-scene').innerHTML = `<span>${A.pcH(A.PART.apres)}</span>`;
  $('#phrases').innerHTML = `<b>Votre CRA devient une facture.</b> Zéro ressaisie. <b>Sur 100${NB}€ facturés, jusqu’à 85${NB}€ pour vous.</b> 54${NB}% aujourd’hui. <b class="gd-vert">Jusqu’à 85${NB}% avec Payout.</b> L’impôt prend sa part. <b>Pas la vôtre.</b> Un cockpit à la place de trois outils.`;
  $('#avant-apres-table').innerHTML = [
    ['On garde', 'Le nom, le vert, le P, la promesse 54 → 85', 'Les mêmes', 'Évolution, pas rupture : la marque reste reconnaissable'],
    ['Idée', 'Aucune image centrale', 'La part qui vous revient : une proportion', 'Sans idée, rien ne distingue Payout d’un autre SaaS vert'],
    ['Symbole', 'P en verre brillant, queue qui s’échappe, dégradé', 'P-jauge à plat : un anneau gardé à 85 %, ouvert de 15 %, et son fût', 'Le symbole dit la promesse et tient à 16 px en un seul aplat'],
    ['Logotype', '« Payout » dans une grotesque du commerce, précédé du pictogramme', '« Payout » dessiné avec le même anneau ; son P est le symbole', 'Un logotype à soi, une règle de construction en une ligne'],
    ['Couleur', 'Gamme de verts sur blanc, sarcelle, rouge', 'Noir Coffre, un seul vert électrique (Net) et son échelle, gris froid', 'Une palette propre ; le vert devient lumière'],
    ['Chiffres', 'Dans la police de texte', 'Chivo Mono, tabulaires, en très grand', 'Les chiffres sont la voix de la marque'],
    ['Motif', 'Illustrations isométriques, deux photos', 'La jauge, les bandes, le damier, le halo', 'Un motif reconnaissable sans le logo, fait avec les données'],
    ['Interface', 'Blanche, cartes arrondies, vert en accent', 'Cockpit sombre (phare) et variante claire, mêmes intitulés', 'Le produit devient le héros ; même structure, autre tenue'],
  ].map((r) => `<tr>${r.map((x, i) => `<td>${x.replace(/ ([:;%])/g, NB + '$1').replace(/ px/g, NB + 'px').replace(' → ', NB + A.fleche('currentColor', 'margin:0 .2em') + ' ')}</td>`).join('')}</tr>`).join('');
  const MOTS = [
    ['Net', 'On parle en chiffres, au centime.', `<span class="chiffre" style="font-size:54px;color:var(--vif)">${A.pcH(A.PART.apres)}</span>`],
    ['Précis', 'Chaque montant a sa source.', `<span class="mt" style="font-size:24px;font-weight:500;letter-spacing:-.05em">${A.eurH(D.tva.due)}</span>`],
    ['Direct', 'Un bouton par écran.', '<span class="theme" style="display:block;width:100%"><span class="u-btn" style="height:44px;font-size:14px">Valider le CRA</span></span>'],
    ['Automatique', 'Le CRA devient la facture.', `<span class="theme" style="display:block">${A.cra({ cell: 14, gap: 2, entete: false, nums: false })}</span>`],
  ];
  $('#mots-grille').innerHTML = MOTS.map(([m, d, vu], i) => `<div class="gd-bloc" style="display:flex;flex-direction:column;gap:18px"><div style="height:64px;display:flex;align-items:center">${vu}</div><div><span class="gd-num" style="margin-bottom:8px">${pad(i + 1)}</span><div class="gd-gros">${m}</div><p style="margin-top:8px">${d}</p></div></div>`).join('');
  $('#valeurs-grille').innerHTML = [
    ['Net', 'On parle en chiffres, au centime. Un pourcentage vaut mieux qu’un adjectif.'],
    ['Précis', 'Sur des données financières, l’erreur n’est pas permise. Chaque montant a sa source.'],
    ['Direct', 'Des phrases courtes, un bouton par écran, aucune notion fiscale sans son chiffre.'],
    ['Automatique', 'Le CRA devient la facture, la TVA se calcule seule. Zéro ressaisie.'],
  ].map(([a, b], i) => `<div class="gd-bloc"><span class="gd-num">${pad(i + 1)}</span><h3 style="font-size:28px;letter-spacing:-.045em">${a}</h3><p>${b}</p></div>`).join('');
  $('#ton-table').innerHTML = [
    [`Gardez jusqu’à 85${NB}% de votre TJM.`, 'Stop à l’hémorragie financière !'],
    ['Votre CRA devient une facture.', 'Une solution innovante pour optimiser votre activité.'],
    [`TVA d’octobre${NB}: ${A.eur(D.tva.due)} à reverser avant le 24.`, 'Pensez à vos obligations déclaratives.'],
    ['L’impôt prend sa part. Pas la vôtre.', 'Payez moins d’impôts grâce à notre astuce !'],
    ['Un cockpit à la place de trois outils.', 'La plateforme tout-en-un qui révolutionne votre gestion.'],
  ].map(([a, b]) => `<tr><td class="gd-fort">«${NB}${a}${NB}»</td><td>«${NB}${b.replace(' !', NB + '!')}${NB}»</td></tr>`).join('');

  /* ---------- 02 Logo ---------- */
  const FONDS = [['Coffre', C.coffre, C.net, ''], ['Ardoise', C.ardoise, C.net, ''], ['Halo .g1', '', C.blanc, 'g1 grain'], ['Net', C.net, C.coffre, ''], ['.g-vif', '', C.coffre, 'g-vif grain'], ['Relevé', C.releve, C.coffre, ''], ['Blanc', C.blanc, C.coffre, '']];
  const VERS = [
    ['complet', 'Version complète', 'Logotype et descripteur sur deux lignes. La version par défaut.', (c, a = '') => A.lockup(c, a), true],
    ['logotype', 'Logotype', 'Quand le contexte dit déjà ce qu’est Payout : écran, enseigne, avatar long.', (c, a = '') => A.wordmark(c, a), true],
    ['symbole', 'Symbole', 'Le P-jauge seul : icône, favicon, pied de page, très petits formats.', (c, a = '') => A.symbol(c, a), true],
    ['empile', 'Version empilée', 'Pour les supports étroits. Descripteur en capitales Chivo Mono. En HTML seulement.', (c, a = '') => A.lockupV(c, a), false],
  ];
  let fondI = 0, versI = 0;
  const drawStage = () => { const [nom, bg, fg, cls] = FONDS[fondI], v = VERS[versI]; const s = $('#stage');
    s.className = 'gd-scene ' + cls; s.style.background = bg; s.style.color = encreSur(bg || (cls.includes('vif') ? C.net : C.coffre));
    s.innerHTML = `<span class="gd-scene-leg">${v[1]} · ${fg === C.net ? 'Net' : fg === C.blanc ? 'Blanc' : 'Coffre'} sur ${nom}</span>` + v[3](fg, `role="img" aria-label="Payout, ${v[1].toLowerCase()}"` + (v[0] === 'symbole' ? ' style="width:auto;height:58%"' : ''));
    $$('#stage-sw button').forEach((b, k) => b.classList.toggle('gd-sel', k === fondI)); $$('#stage-v button').forEach((b, k) => b.classList.toggle('gd-sel', k === versI)); };
  $('#stage-sw').innerHTML = FONDS.map((f) => `<button>${f[0]}</button>`).join('');
  $('#stage-sw').insertAdjacentHTML('afterend', `<div class="gd-choix" id="stage-v">${VERS.map((v) => `<button>${v[1]}</button>`).join('')}</div>`);
  $$('#stage-sw button').forEach((b, i) => b.addEventListener('click', () => { fondI = i; drawStage(); }));
  $$('#stage-v button').forEach((b, i) => b.addEventListener('click', () => { versI = i; drawStage(); }));
  drawStage();
  const CN = Object.keys(A.COULEURS_LOGO), CN_NOM = { net: 'Net', blanc: 'Blanc', coffre: 'Coffre', releve: 'Relevé' };
  const logoUrl = (k, c) => `logo/${A.SLUG}-${k}-${c}.svg`;
  $('#logo-cartes').innerHTML = VERS.map(([k, t, d, f, dl]) => `<div class="gd-bloc gd-logo-carte"><div class="gd-vu">${f(C.net, 'aria-hidden="true"' + (k === 'symbole' ? ' style="height:84px"' : k === 'empile' ? ' style="height:76px"' : ''))}</div><div class="gd-corps"><h3>${t}</h3><p>${d.replace(' :', NB + ':')}</p>${dl ? `<div class="gd-dl">${CN.map((c) => `<a class="gd-bt gd-creux gd-petit" href="${logoUrl(k, c)}" download>SVG ${CN_NOM[c]}</a>`).join('')}</div>` : ''}</div></div>`).join('');

  // Construction : le P-jauge réglable de 54 à 85
  const K = A.CONSTRUCTION;
  const drawPJ = (p) => { const parts = A.symbolParts(p), plein = p >= A.PART.apres ? C.net : C.blanc;
    $('#pj-vu').innerHTML = `<svg viewBox="-8 -8 116 156" role="img" aria-label="Le P-jauge rempli à ${p} %">
      <circle cx="50" cy="50" r="50" fill="none" stroke="${C.acier}" stroke-width=".4" stroke-dasharray="1.6 1.6"/><circle cx="50" cy="50" r="${K.anneau.rayonInterieur}" fill="none" stroke="${C.acier}" stroke-width=".4" stroke-dasharray="1.6 1.6"/>
      <line x1="50" y1="-6" x2="50" y2="50" stroke="${C.acier}" stroke-width=".4"/>
      <path d="${parts.part}" fill="none" stroke="${C.acier}" stroke-width=".5" stroke-dasharray="2 1.5"/>
      <path d="${A.symbolPath(p)}" fill="${plein}" fill-rule="evenodd"/></svg>`;
    $('#pj-val').innerHTML = `<span>${A.pcH(p)}</span>`; };
  $('#pj-range').addEventListener('input', (e) => drawPJ(+e.target.value)); drawPJ(A.PART.apres);
  const ap = K.approches, apv = Object.values(ap).join(' · ');
  $('#cotes').innerHTML = [
    ['Anneau', `Ø${NB}${K.anneau.diametre}`, `Graisse ${K.anneau.graisse}, rayon intérieur ${K.anneau.rayonInterieur}.`],
    ['Ouverture', `${K.ouverture.fin}° · ${K.ouverture.degres}°`, `${K.ouverture.garde}${NB}% gardés, ${K.ouverture.part}${NB}% qui partent, ${K.ouverture.sens}.`],
    ['Fût', `${K.fut} × ${K.symbole.fut[3]}`, `Il rejoint l’anneau à ${virgule(K.jonction.angle)}°.`],
    ['Lettres', `${K.hauteurX} · ${K.capitale}`, `Hauteur d’x et capitale ; descendante du y ${K.descendante}, ascendante du t ${K.ascendanteT}.`],
    ['Approches', apv, Object.keys(ap).map((x) => x.replace(/ \(.*\)/, '')).join(', ') + '.'],
    ['Repère', A.LOGO.box.join(' '), 'Boîte du logotype ; celle du symbole : ' + A.LOGO.symbolBox.join(' ') + '.'],
  ].map(([a, b, c]) => `<div><span class="gd-etiq">${a}</span><div class="gd-gros">${b}</div><p>${c}</p></div>`).join('');

  // Zone de protection : deux graisses autour du logotype, une autour du symbole
  const G = A.LETTRES.graisse, mL = REGLES.protection.logo * G, mS = REGLES.protection.symbole * G;
  const zone = (box, m, inner, leg) => { const [x, y, w, h] = box; return `<svg viewBox="${x - m - 30} ${y - m - 50} ${w + 2 * m + 60} ${h + 2 * m + 100}" style="height:auto;flex:1 1 0;min-width:0;max-width:${w > 300 ? 640 : 220}px" role="img" aria-label="${leg}">
    <rect x="${x - m}" y="${y - m}" width="${w + 2 * m}" height="${h + 2 * m}" fill="${C.net}" fill-opacity=".08" stroke="${C.net}" stroke-width="1.4" stroke-dasharray="6 5"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${C.acier}" stroke-width="1"/>
    ${inner}<text x="${x - m}" y="${y - m - 16}" font-family="Chivo Mono" font-size="${w > 300 ? 15 : 11}" fill="${C.net}" letter-spacing="1">${leg.toUpperCase()}</text></svg>`; };
  $('#protection-vu').innerHTML = `<div style="display:flex;gap:40px;align-items:center;justify-content:center;width:100%;flex-wrap:wrap">` +
    zone(A.LOGO.box, mL, `<path d="${A.wordPath()}" fill="${TX_CLAIR}" fill-rule="evenodd"/>`, `Logotype · ${mL} = ${REGLES.protection.logo} graisses`) +
    zone(A.LOGO.symbolBox, mS, `<path d="${A.symbolPath()}" fill="${TX_CLAIR}" fill-rule="evenodd"/>`, `Symbole · ${mS}`) + `</div>`;
  const TAILLE = { complet: (px) => A.lockup(TX_CLAIR, `style="width:${px}px;height:auto" aria-hidden="true"`), logotype: (px) => A.wordmark(TX_CLAIR, `style="width:${px}px;height:auto" aria-hidden="true"`),
    symbole: (px) => A.symbol(TX_CLAIR, `style="height:${px}px;width:auto" aria-hidden="true"`), icone: (px) => A.icone(px, 'net') };
  $('#tailles-table').innerHTML = REGLES.tailles.map(([k, t, px, mm]) => `<tr><td class="gd-fort">${t}</td><td class="gd-mono gd-nowrap">${px}${NB}px</td><td class="gd-mono gd-nowrap">${mm ? mm + NB + 'mm' : '—'}</td><td><span style="display:inline-grid;place-items:center;background:var(--scene);border-radius:12px;padding:14px 18px;min-width:200px;min-height:64px">${TAILLE[k](px)}</span></td></tr>`).join('');
  $('#accords').innerHTML = [[C.coffre, C.net, 'Net sur Coffre'], [C.coffre, C.blanc, 'Blanc sur Coffre'], [C.ardoise, C.net, 'Net sur Ardoise'], [C.net, C.coffre, 'Coffre sur Net'], [C.releve, C.coffre, 'Coffre sur Relevé'], [C.blanc, C.coffre, 'Coffre sur Blanc']]
    .map(([bg, fg, t]) => `<div class="gd-accord" style="background:${bg};color:${encreSur(bg)}">${A.wordmark(fg, 'aria-hidden="true"')}<span>${t} · ${virgule(A.contraste(fg, bg))}</span></div>`).join('');
  const W = (fill, attrs = '', style = '') => A.wordmark(fill, `aria-hidden="true" style="${style}" ${attrs}`);
  const degrade = W('url(#gd-deg)').replace('>', `><defs><linearGradient id="gd-deg" x1="0" x2="1"><stop offset="0" stop-color="${C.blanc}"/><stop offset=".5" stop-color="${C.net}"/><stop offset="1" stop-color="${N[800]}"/></linearGradient></defs>`);
  $('#interdits-grille').innerHTML = [
    ['Déformer', W(C.net, 'preserveAspectRatio="none"', 'width:84%;height:30px'), ''],
    ['Pivoter', W(C.net, '', 'transform:rotate(-10deg)'), ''],
    ['Doubler le P', `<span style="display:flex;align-items:center;gap:10px;width:70%;position:relative;z-index:60">${A.symbol(C.net, 'style="height:36px;width:auto;flex:none" aria-hidden="true"')}${W(C.net, '', 'width:100%;height:auto')}</span>`, ''],
    ['Dégrader', degrade, ''],
    ['Poser le Net sur un fond clair', W(C.net), `background:${C.releve}`],
    ['Poser sans marge sur un motif', A.bandes({ n: 22, seed: 4 }) + W(TX_CLAIR, '', 'width:96%'), ''],
  ].map(([t, svg, bg]) => `<div class="gd-mal"><div class="gd-vu" style="${bg}">${svg}</div><div class="gd-corps"><span class="gd-eviter">À ne pas faire</span>${t}</div></div>`).join('');

  /* ---------- 03 Couleurs ---------- */
  $('#bands').innerHTML = COLORS.map((c) => `<button class="bande" style="--gd-g:${c.g};flex:${c.g} 1 0;background:${c.h};color:${encreSur(c.h)}" data-hex="${c.h}" title="Copier ${c.h}"><b>${c.n}</b><span>${c.h}<em><br>RVB ${rgb(c.h).join(' ')}<br>${c.r}</em></span></button>`).join('');
  $$('#bands .bande').forEach((b) => b.addEventListener('click', () => copy(b.dataset.hex, b.dataset.hex + ' copié')));
  $('#tx-clair').textContent = TX_CLAIR; $('#tx-net').textContent = TX_NET;
  const PAS = Object.keys(N).map(Number);
  $('#echelle-net').innerHTML = PAS.map((k) => `<button class="${k === 500 ? 'gd-500' : ''}" style="background:${N[k]};color:${encreSur(N[k])}" data-hex="${N[k]}" title="Copier ${N[k]}"><b>${k}</b><span>${N[k]}<br>${virgule(A.contraste(N[k], C.coffre))}${NB}:${NB}1</span></button>`).join('');
  $$('#echelle-net button').forEach((b) => b.addEventListener('click', () => copy(b.dataset.hex, 'Net ' + b.querySelector('b').textContent + ' copié')));
  const echelleCss = ':root {\n' + PAS.map((k) => `  --net-${k}: ${N[k]};`).join('\n') + '\n}';
  $('#copier-echelle').addEventListener('click', () => copy(echelleCss, 'Échelle du Net copiée'));
  $('#prop').innerHTML = REGLES.proportions.map(([k, , v]) => `<div style="flex:${v};background:${HEX[k]}"></div>`).join('');
  $('#prop-leg').innerHTML = REGLES.proportions.map(([k, n, v]) => `<span><i style="background:${HEX[k]}"></i>${n} ${pc(v)}</span>`).join('');
  const PAIRES = [
    ['Net', 'net', 'Coffre', 'coffre'], ['Net', 'net', 'Ardoise', 'ardoise'], ['Texte clair', 'texte', 'Coffre', 'coffre'], ['Acier', 'acier', 'Coffre', 'coffre'], ['Acier', 'acier', 'Ardoise', 'ardoise'],
    ['Prélevé', 'preleve', 'Coffre', 'coffre'], ['Coffre', 'coffre', 'Net', 'net'], ['Coffre', 'coffre', 'Relevé', 'releve'], ['Net 800', 'net800', 'Blanc', 'blanc'], ['Net 800', 'net800', 'Relevé', 'releve'],
    ['Prélevé du thème clair', 'preleveClair', 'Blanc', 'blanc'], ['Prélevé', 'preleve', 'Relevé', 'releve'], ['Net', 'net', 'Relevé', 'releve'], ['Net', 'net', 'Blanc', 'blanc'],
  ];
  $('#contrastes-table').innerHTML = PAIRES.map(([tn, tk, bn, bk]) => { const r = A.contraste(HEX[tk], HEX[bk]);
    const badge = r >= 4.5 ? '<span class="gd-badge gd-b-ok">Tout texte</span>' : r >= 3 ? '<span class="gd-badge gd-b-titre">Titres seulement</span>' : '<span class="gd-badge gd-b-non">Jamais en texte</span>';
    return `<tr><td><span class="gd-smp" style="background:${HEX[bk]};color:${HEX[tk]}">Aa</span></td><td class="gd-fort">${tn}${tk === 'preleveClair' ? ` <span class="gd-mono" style="color:var(--gd-tx3);font-weight:400">${PRELEVE_CLAIR}</span>` : ''}</td><td>${bn}</td><td class="gd-mono">${virgule(r)}${NB}:${NB}1</td><td>${badge}</td></tr>`; }).join('');
  $('#recette').innerHTML = [['base', '01 · Base', 'Rampe du blanc au noir · opacité 100' + NB + '%, mode normal'], ['grain', '02 · Grain', 'Bruit fractal · incrustation, 50' + NB + '%'], ['teinte', '03 · Teinte', 'Net 500 · mode couleur, 100' + NB + '%']]
    .map(([e, t, d]) => `<figure><div class="gd-vu">${A.recette(e, 'bandes', { n: 24, seed: 7 })}</div><figcaption><span class="gd-etiq">${t}</span><b>${e === 'base' ? 'La forme' : e === 'grain' ? 'La matière' : 'La couleur'}</b><span>${d}</span></figcaption></figure>`).join('');
  const GR = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g-vif'], CLAIRS = ['g8', 'g9', 'g-vif'];
  $('#grads').innerHTML = GR.map((g) => `<button class="gt ${g} grain ${CLAIRS.includes(g) ? 'gd-sur-clair' : ''}" data-g="${g}" title="Copier le CSS de .${g}"><span>.${g}</span></button>`).join('');
  $$('#grads .gt').forEach((b) => b.addEventListener('click', () => { const cs = getComputedStyle(b); copy(`background: ${cs.backgroundImage}, ${cs.backgroundColor};`, 'CSS du dégradé .' + b.dataset.g + ' copié'); }));

  /* ---------- 04 Typographie ---------- */
  const spec = $('#specimen'), gr = $('#graisse');
  const GRAISSES = [[400, 'Regular', 'Le texte courant, les intitulés de l’interface.'], [500, 'Medium', 'Les titres, très grands, serrés à −0,055 em.'], [600, 'SemiBold', 'Les boutons et les libellés forts du cockpit.']];
  const setG = (v) => { spec.style.fontWeight = v; gr.value = v; $('#graisse-v').textContent = v; $$('#graisse-choix button').forEach((b) => b.classList.toggle('gd-sel', +b.dataset.w === +v)); };
  $('#graisse-choix').innerHTML = GRAISSES.map(([w, n]) => `<button data-w="${w}">${n} ${w}</button>`).join('');
  $$('#graisse-choix button').forEach((b) => b.addEventListener('click', () => setG(b.dataset.w)));
  gr.addEventListener('input', () => setG(gr.value)); setG(500);
  $('#graisses').innerHTML = GRAISSES.map(([w, n, u]) => `<div class="gd-bloc"><span class="gd-num">Instrument Sans ${n} ${w}</span><div class="gd-alpha" style="font-weight:${w}">ABCDEFGHIJKLM<br>NOPQRSTUVWXYZ<br>abcdefghijklm<br>nopqrstuvwxyz<br>àâçéèêëîïôùûœ</div><p style="margin-top:12px">${u.replace(' em', NB + 'em')}</p></div>`).join('');
  $('#specimen-chiffres').innerHTML = `<span>${A.PART.apres}</span><span class="pct">%</span>`;
  const T = (txt, st) => `<span style="display:block;${st}">${txt}</span>`;
  $('#hier').innerHTML = [
    ['Chiffre de scène', `<span class="chiffre" style="font-size:clamp(72px,9vw,136px);color:var(--vif)">${A.pcH(A.PART.apres)}</span>`, 'Chivo Mono Medium · 136 à 320 px · interligne 0,86 · −0,06 em · .chiffre'],
    ['Display', T('La part.', 'font-size:clamp(44px,6.4vw,96px);font-weight:500;line-height:.92;letter-spacing:-.055em'), 'Instrument Sans Medium · 96 px · 0,92 · −0,055 em · .d-t1'],
    ['Titre 300', T('Zéro ressaisie.', 'font-size:clamp(40px,5.8vw,88px);font-weight:500;line-height:.93;letter-spacing:-.055em'), 'Instrument Sans Medium · 88 px · 0,93 · −0,055 em · .h-xl'],
    ['Titre 200', T('Votre CRA devient une facture.', 'font-size:clamp(30px,3.6vw,52px);font-weight:500;line-height:.98;letter-spacing:-.045em'), 'Instrument Sans Medium · 52 px · 0,98 · −0,045 em · .h-l'],
    ['Titre 100', T('Obligations déclaratives', 'font-size:28px;font-weight:500;line-height:1.05;letter-spacing:-.035em'), 'Instrument Sans Medium · 28 px · 1,05 · −0,035 em'],
    ['Phrase bicolore', `<span class="gd-bicolore" style="font-size:clamp(20px,1.9vw,27px);line-height:1.3;letter-spacing:-.02em;display:block"><b>L’impôt prend sa part.</b> Pas la vôtre.</span>`, 'Instrument Sans Medium · 21 à 27 px · 1,3 · −0,02 em · .bicolore'],
    ['Texte 200', T(`Payout aide les freelances en SASU à garder jusqu’à 85${NB}% de leur TJM après impôts.`, 'font-size:19px;line-height:1.4;letter-spacing:-.01em;max-width:560px'), 'Instrument Sans Regular · 19 px · 1,4 · −0,01 em · .body-l'],
    ['Texte 100', T(`TVA d’octobre${NB}: ${A.eur(D.tva.due)} à reverser avant le 24${NB}novembre.`, 'font-size:14.5px;line-height:1.4'), 'Instrument Sans Regular · 14,5 px · 1,4 · 0'],
    ['Montant 200', `<span class="mt" style="font-size:clamp(26px,3vw,44px);font-weight:500;line-height:1.1;letter-spacing:-.05em">${A.eurH(D.simulateur.apres)}</span>`, 'Chivo Mono Medium · 26 à 44 px · 1,1 · −0,035 à −0,06 em · .d-v'],
    ['Montant 100', `<span class="mt" style="font-size:13.5px;font-weight:500;line-height:1.3">F-2026-010 · ${A.eurH(D.cra.ht)} HT</span>`, 'Chivo Mono Medium · 13,5 px · 1,3 · −0,01 em · .mt'],
    ['Étiquette', `<span class="gd-mono" style="font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;line-height:1.5">Solde disponible · Qonto connecté</span>`, 'Chivo Mono Regular, capitales · 10 à 10,5 px · 1,5 · +0,06 à +0,08 em · .cap'],
  ].map(([s, e, r]) => `<tr><td class="gd-fort">${s}</td><td>${e}</td><td>${r.replace(/ (px|em)(?=\W|$)/g, NB + '$1')}</td></tr>`).join('');

  /* ---------- 05 Éléments ---------- */
  const EL = $('#elements');
  $('#jg-val').innerHTML = `<span data-j="val">${A.PART.apres}</span><span class="pct">%</span>`;
  $('#jg-eur').innerHTML = `<span data-j="eur" data-base="${D.simulateur.facture}">${A.eurH(D.simulateur.apres, 0)}</span>`;
  $('#jg-avant').textContent = A.eur(D.simulateur.avant, 0);
  $('#jg-segments').innerHTML = A.jauge({ forme: 'segments', p: A.PART.apres, avant: A.PART.avant, repere: A.PART.avant, h: 96, anim: true, c4: C.blanc });
  const FORMES = [
    ['segments', 'Segments · 100 traits, un par euro', 'gd-large', { forme: 'segments', h: 64, avant: A.PART.avant, c4: C.blanc }],
    ['blocs', 'Blocs · 10 × 10, depuis le bas', 'gd-tiers', { forme: 'blocs', l: 220, g: 3.3 }],
    ['escalier', 'Escalier · les marches de 54 à 85', 'gd-tiers', { forme: 'escalier', h: 220, avant: A.PART.avant, degrade: true }],
    ['anneau', 'Anneau · celui du symbole, depuis midi', 'gd-tiers', { forme: 'anneau', taille: 200 }],
    ['barre', 'Barre · ce qui part hachuré', 'gd-large', { forme: 'barre', h: 56 }],
  ];
  $('#formes-grille').innerHTML = FORMES.map(([k, t, cls, o]) => `<div class="gd-forme ${cls}"><span class="gd-etiq">${t.replace(' × ', NB + '×' + NB)}</span><div class="gd-vu" style="width:100%">${A.jauge({ ...o, p: A.PART.apres, anim: true, style: k === 'segments' || k === 'barre' || k === 'escalier' ? 'width:100%' : '' })}</div></div>`).join('');
  $('#jg-range').addEventListener('input', (e) => A.majJauge(+e.target.value, EL));
  const MOTIFS = [
    ['Les bandes', () => A.bandes({ n: 36, seed: 7, profil: 'monte' })],
    ['Les stries', () => A.bandes({ n: 30, seed: 3, forme: 'stries' })],
    ['Le damier', () => A.damier({ cols: 14, rows: 6, seed: 3 })],
    ['Le halo haut', () => A.halo('haut')],
    ['Le halo bas', () => A.halo('bas')],
    ['Avec un texte', () => A.bandes({ n: 36, seed: 7, profil: 'monte' }) + `<p class="gd-surtexte">Sur 100${NB}€ facturés, jusqu’à 85${NB}€ pour vous. Le texte garde une marge sombre tout autour.</p>`],
  ];
  const setMotif = (i) => { $('#motif-vu').innerHTML = MOTIFS[i][1](); $$('#motif-sw button').forEach((b, k) => b.classList.toggle('gd-sel', k === i)); };
  $('#motif-sw').innerHTML = MOTIFS.map((m) => `<button>${m[0]}</button>`).join('');
  $$('#motif-sw button').forEach((b, i) => b.addEventListener('click', () => setMotif(i)));
  setMotif(0);
  $('#decomptes').innerHTML = [
    A.decompte({ titre: 'Sur 100 € facturés, aujourd’hui', lignes: [['Facturé', 100], ['Ce qui part', -(100 - A.PART.avant), 'part']], total: ['Ce qui vous reste', A.PART.avant], p: A.PART.avant }),
    A.decompte({}),
    A.decompte({ titre: 'Votre mois d’octobre', ref: 'Décompte', lignes: [[`${D.cra.factures} jours à ${D.cra.tjm} €`, D.cra.ht], ['Ce qui part', D.simulateur.apres - D.cra.ht, 'part']], total: ['Pour vous, jusqu’à', D.simulateur.apres], clair: true }),
  ].map((h) => `<div style="position:relative;z-index:60;zoom:.9">${h}</div>`).join('');

  /* ---------- 06 Interface ---------- */
  const SCR = [
    ['Compte pro', (o) => A.screens.solde(o), 'Le solde en carte dense, les comptes connectés, les transactions au centime, chacune avec sa référence.'],
    ['Planning', (o) => A.screens.cra(o), 'Le compte rendu d’activité d’octobre : 20 jours facturés. Une fois validé, il devient la facture F-2026-010.'],
    ['Facture', (o) => A.screens.facture(o), 'La facture générée depuis le CRA, sans ressaisie.'],
    ['Cash-Out', (o) => A.screens.cashouts(o), 'Les frais pro remboursés mois par mois : kilomètres, repas, abonnements, calculés depuis le CRA.'],
    ['Simulateur', (o) => A.screens.simulateur(o), 'De 54 à 85 : 600 € de TJM, 20 jours, 12 mois. Jusqu’à 10 200 € par mois au lieu de 6 480 €.'],
    ['Tableau de bord', (o) => A.screens.bord(o), 'La part qui vous revient, en grand, et ce qui reste à faire.'],
  ];
  let ecranI = 0, clair = false;
  const petit = () => window.innerWidth < 600;
  const drawPhone = () => { $('#phone').innerHTML = A.phone(SCR[ecranI][1]({ clair }), petit() ? 0.68 : 0.8); $('#ecran-texte').textContent = SCR[ecranI][2].replace(/ ([:;%€])/g, NB + '$1');
    $$('#tabs button').forEach((b, k) => b.classList.toggle('gd-sel', k === ecranI)); $$('#theme-sw button').forEach((b, k) => b.classList.toggle('gd-sel', !!k === clair)); };
  $('#tabs').innerHTML = SCR.map((s) => `<button>${s[0]}</button>`).join('');
  $$('#tabs button').forEach((b, i) => b.addEventListener('click', () => { ecranI = i; drawPhone(); }));
  $('#theme-sw').innerHTML = '<button>Sombre</button><button>Clair</button>';
  $$('#theme-sw button').forEach((b, i) => b.addEventListener('click', () => { clair = !!i; drawPhone(); drawDesk(); }));
  const DESK = [['Tableau de bord', (o) => A.desk.bord(o), 'payout.fr/tableau-de-bord', true], ['Cash-Out', (o) => A.desk.cashouts(o), 'payout.fr/cash-out', true], ['Planning', (o) => A.desk.cra(o), 'payout.fr/planning', true], ['Le site', () => A.desk.site({}), 'payout.fr', false]];
  let deskI = 0;
  function drawDesk() { const cadre = $('#desk'); if (!cadre.offsetParent && cadre.innerHTML) return; const w = cadre.clientWidth || 900, k = Math.min(1, w / 1440), d = DESK[deskI], c = clair && d[3];
    cadre.innerHTML = A.browser(d[1]({ clair: c }), k, { url: d[2], clair: c }); cadre.style.height = Math.ceil(946 * k) + 'px';
    $$('#desk-tabs button').forEach((b, i) => b.classList.toggle('gd-sel', i === deskI)); }
  $('#desk-tabs').innerHTML = DESK.map((d) => `<button>${d[0]}</button>`).join('');
  $$('#desk-tabs button').forEach((b, i) => b.addEventListener('click', () => { deskI = i; drawDesk(); }));
  const mt = (n, st = '', dec = 2) => `<span class="mt" style="${st}">${A.eurH(n, dec)}</span>`;
  const F = D.factures;
  $('#composants-grille').innerHTML = [
    ['Boutons', 'Un seul bouton plein par écran, 52 px de haut, rayon d’une demi-hauteur. Le second choix est en contour.', '<div style="display:grid;gap:10px;width:100%;max-width:280px"><div class="u-btn">Valider le CRA</div><div class="u-btn ghost">Plus tard</div></div>'],
    ['Pastilles d’état', 'En Chivo Mono capitales. Payé en vert, à venir en filet, en cours inversé, en retard et à déclarer en Prélevé.', '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><span class="u-pill ok">Payée</span><span class="u-pill att">À venir</span><span class="u-pill cours">En cours</span><span class="u-pill due">En retard</span></div>'],
    ['Champ et filtres', 'Champs et puces à rayon d’une demi-hauteur, filet fin. La puce active passe en plein.', `<div style="display:grid;gap:12px;width:100%"><div class="u-field">${A.icon('recherche', 'currentColor', 17)}Rechercher une transaction…</div><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="u-chip on">Tous les comptes</span><span class="u-chip">Filtres</span></div></div>`],
    ['Lignes de factures', 'Référence insécable, client et objet en dessous, montant et état à droite.', `<div style="width:100%">${[F[1], F[0]].map((f) => `<div class="d-row"><div><b class="gd-nowrap">${f.ref}</b><small>${f.client} · ${f.objet}</small></div><div style="display:grid;justify-items:end;gap:5px">${mt(f.ht, 'font-weight:500')}<span class="d-pill ${f.ton}">${f.statut}</span></div></div>`).join('')}</div>`],
    ['Carte de solde', 'La carte dense : une par écran, en aplat Net dans le thème sombre, en noir dans le thème clair.', `<div class="u-card dense" style="padding:16px 18px;width:100%"><div class="cap" style="opacity:.75">Solde disponible</div><div class="mt" style="font-size:32px;font-weight:500;letter-spacing:-.06em;margin-top:8px;line-height:1">${A.eurH(D.solde)}</div></div>`],
    ['Jauge et curseur', 'La jauge du simulateur, 50 segments, et le curseur à rond creux.', `<div style="display:grid;gap:14px;width:100%">${A.jauge({ forme: 'segments', n: 50, p: A.PART.apres, avant: A.PART.avant, h: 40, g: 2, c4: 'var(--t-tx)' })}<div class="u-range"><b style="width:62%"></b><i style="left:62%"></i></div></div>`],
  ].map(([t, d, h]) => `<div class="gd-compo"><div class="gd-demo">${h}</div><div><h3>${t}</h3><p>${d.replace(/ (px|:)/g, NB + '$1')}</p></div></div>`).join('');
  $('#compo-sw').innerHTML = '<button>Sombre</button><button>Clair</button>';
  const setCompo = (i) => { $('#composants-grille').classList.toggle('clair', !!i); $$('#compo-sw button').forEach((b, k) => b.classList.toggle('gd-sel', k === i)); };
  $$('#compo-sw button').forEach((b, i) => b.addEventListener('click', () => setCompo(i))); setCompo(0);
  $('#notifs').innerHTML = A.ncard('Facture générée', `Votre CRA d’octobre est validé. La facture ${D.cra.facture} de ${A.eur(D.cra.ht, 0)} HT est prête, avec son PDF.`, { heure: '9:41', action: 'Voir la facture' })
    + A.ncard('TVA à déclarer', `CA3 d’octobre${NB}: ${A.eur(D.tva.due)} à reverser avant le 24${NB}novembre. Tout est déjà calculé.`, { heure: '8:30', action: 'Ouvrir la déclaration' })
    + A.ncard('Cash-Out d’octobre', `${A.eur(718.30)} de frais pro à vous rembourser. Kilomètres, repas, abonnements.`, { heure: '9:12', action: 'Voir le détail' });
  $('#icones').innerHTML = `<figure>${A.icone(132, 'net')}<figcaption class="gd-etiq">Par défaut<br>Coffre sur Net</figcaption></figure>` +
    [['coffre', 'Net sur Coffre'], ['releve', 'Coffre sur Relevé']].map(([t, n]) => `<figure>${A.icone(96, t)}<figcaption class="gd-etiq">Variante<br>${n}</figcaption></figure>`).join('') +
    [64, 32, 16].map((s) => `<figure>${A.icone(s, 'net')}<figcaption class="gd-etiq">${s}${NB}px</figcaption></figure>`).join('');

  /* ---------- 07 Mouvement ---------- */
  const MV = REGLES.mouvement, COURBE = MV.courbe, REBOND = 'cubic-bezier(.34, 1.56, .64, 1)';
  const ms = (x) => (x >= 1000 ? String(x).replace(/\B(?=(\d{3})+(?!\d))/g, NB) : x) + NB + 'ms';
  const anime = (dur, f, fin) => { const t0 = performance.now(); const pas = (now) => { const x = Math.min(1, (now - t0) / dur); f(x); if (x < 1) requestAnimationFrame(pas); else if (fin) fin(); }; requestAnimationFrame(pas); };
  const PISTES = [
    ['etat', 'Changer d’état', `${ms(MV.etat)} · ${COURBE}`, 'Survol, sélection, bascule d’une pastille.', () => `<span class="theme" style="display:flex;gap:8px"><span class="u-chip" style="transition:all ${MV.etat}ms ${COURBE}">Facturer</span><span class="u-chip on" style="transition:all ${MV.etat}ms ${COURBE}">Déclarer</span><span class="u-chip" style="transition:all ${MV.etat}ms ${COURBE}">Garder</span></span>`,
      (z) => { const c = $$('.u-chip', z), i = c.findIndex((x) => x.classList.contains('on')); c.forEach((x, k) => x.classList.toggle('on', k === (i + 1) % c.length)); }],
    ['entrer', 'Entrer', `${ms(MV.entree)} · montée de ${MV.montee}${NB}px · ${ms(MV.decalage)} de décalage`, 'Cartes, lignes et pages entrent par le bas, en fondu, l’une après l’autre.', () => `<span class="theme" style="display:flex;gap:8px">${['Payée', 'À venir', 'En cours'].map((t, i) => `<span class="u-pill ${['ok', 'att', 'cours'][i]}">${t}</span>`).join('')}</span>`,
      (z) => $$('.u-pill', z).forEach((c, i) => c.animate([{ transform: `translateY(${MV.montee}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: MV.entree, easing: COURBE, delay: i * MV.decalage, fill: 'backwards' }))],
    ['jauge', 'La jauge, de 54 à 85', `départ à ${virgule(MV.depart / 1000)}${NB}s · ${ms(MV.jauge)} · 1 − (1 − x)<sup>4</sup>`, 'Le chiffre compte avec elle. Sortie douce, aucun dépassement.', () => `<span class="chiffre" style="font-size:44px;color:var(--vif);flex:none;width:2.6em"><span data-j="val">${A.PART.apres}</span><span class="pct">%</span></span>${A.jauge({ forme: 'segments', n: 50, p: A.PART.apres, avant: A.PART.avant, h: 44, g: 2, anim: true, c4: C.blanc })}`,
      (z) => anime(MV.depart + MV.jauge, (x) => A.majJauge(A.pJauge((x * (MV.depart + MV.jauge)) / 1000), z))],
    ['logo', 'Le logo', `${ms(MV.logo)} · ${COURBE}`, 'L’anneau se remplit en blanc jusqu’à 54, rejoint le fût à 85 et passe au Net.', () => `<svg viewBox="0 0 100 140" style="height:72px;width:auto;flex:none" aria-hidden="true"><path fill="${C.net}" fill-rule="evenodd" d="${A.symbolPath()}"/></svg>${A.wordmark(TX_CLAIR, 'style="height:40px;width:auto" aria-hidden="true"')}`,
      (z) => { const p = $('path', z); anime(MV.logo, (x) => { const v = Math.max(1, A.ease(x) * A.PART.apres); p.setAttribute('d', A.symbolPath(v)); p.setAttribute('fill', v >= A.PART.apres - 0.5 ? C.net : C.blanc); }); }],
    ['boucle', 'La boucle', `${MV.boucle}${NB}s · la jauge redescend sur la dernière seconde`, 'Vidéos, écrans de salon, fonds animés : un raccord parfait.', () => `<span class="chiffre" style="font-size:44px;color:var(--vif);flex:none;width:2.6em"><span data-j="val">${A.PART.apres}</span><span class="pct">%</span></span>${A.jauge({ forme: 'segments', n: 50, p: A.PART.apres, h: 44, g: 2, anim: true })}`, null],
    ['rebond', 'Rebond, à éviter', `600${NB}ms · ${REBOND}`, 'Ça dépasse puis ça revient : ce n’est pas Payout.', () => '<i class="gd-bille"></i>',
      (z) => $('.gd-bille', z).animate([{ transform: 'translateX(0)' }, { transform: `translateX(${z.clientWidth - 70}px)` }], { duration: 600, easing: REBOND, fill: 'forwards' })],
  ];
  $('#pistes').innerHTML = PISTES.map(([id, n, d, t, vu, f], i) => `<div class="gd-piste ${id === 'rebond' ? 'gd-a-eviter' : ''}" data-i="${i}"><div class="gd-piste-nom">${n}<small>${d}</small></div><div><div class="gd-zone" data-piste="${id}" ${f ? `role="button" tabindex="0" aria-label="Rejouer : ${n}"` : ''}>${vu()}</div><p>${t.replace(' :', NB + ':')}</p></div><span class="gd-etiq">${f ? 'Rejouer' : 'En continu'}</span></div>`).join('');
  $$('#pistes .gd-piste').forEach((p) => { const f = PISTES[+p.dataset.i][5]; if (!f) return; const z = $('.gd-zone', p); const go = () => f(z); z.addEventListener('click', go); z.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
  const MVT = `:root {\n  --duree-etat: ${MV.etat}ms;      /* survol, sélection, bascule */\n  --duree-entree: ${MV.entree}ms;    /* cartes, lignes, pages */\n  --montee: ${MV.montee}px;          /* entrée depuis le bas */\n  --decalage: ${MV.decalage}ms;        /* entre deux éléments d'un groupe */\n  --depart-jauge: ${MV.depart}ms;    /* la jauge attend, puis monte de 54 à 85 */\n  --duree-jauge: ${MV.jauge}ms;\n  --duree-logo: ${MV.logo}ms;\n  --boucle: ${MV.boucle}s;             /* la jauge redescend sur la dernière seconde */\n  --courbe: ${COURBE};   /* sortie douce : 1 − (1 − x)^4 (Marque.ease) */\n}`;
  $('#mouvement-css').textContent = MVT;
  $('#copier-mouvement').addEventListener('click', () => copy(MVT, 'Variables de mouvement copiées'));
  $('#videos').innerHTML = [['08-logo', 'Révélation du logo · 6 s'], ['10-jauge', 'La jauge, de 54 à 85 · boucle de 6 s'], ['16-detail', 'Un détail s’allume · boucle de 6 s'], ['28-telephone-ecran', 'L’écran vivant · 10 s'], ['23-mur', 'Mur de pages · boucle de 14 s'], ['38-derive', 'Mosaïque en dérive · 20 s']]
    .map(([f, t]) => `<figure class="gd-video" data-media="${f}"><img src="media/vignettes/${f}.jpg" alt="" hidden><video class="gd-v" src="media/${f}.mp4" poster="media/vignettes/${f}.jpg" controls loop muted playsinline preload="none" aria-label="${t}"></video><figcaption class="gd-etiq">${t.replace(/ s(?=\W|$)/g, NB + 's')}</figcaption></figure>`).join('');

  /* ---------- 08 Galerie et agrandissement ---------- */
  const KIND = { '3d': 'Scène 3D', video: 'Vidéo', planche: 'Planche' };
  // Mêmes noms que presentation.json ; les scènes 3D encore à venir disparaissent d'elles-mêmes tant qu'elles manquent.
  const M = [
    ['02-monument', ['3d'], 'Le monument'], ['01-couverture', ['planche'], 'Couverture'], ['08-logo', ['video'], 'Révélation du logo'],
    ['10-jauge-volume', ['3d'], 'La jauge en volume'], ['04-avant-apres', ['planche'], 'Avant / après'], ['06-bento', ['planche'], 'Bento d’identité'],
    ['18-abribus', ['3d'], 'Affichage urbain'], ['10-jauge', ['video'], 'La jauge, de 54 à 85'], ['07-construction', ['planche'], 'Construction'],
    ['19-papeterie', ['3d'], 'Papeterie'], ['09-logo-variantes', ['planche'], 'Logo et variantes'], ['11-jauge-etats', ['planche'], 'La jauge et ses états'],
    ['21-portable', ['3d', 'video'], 'Le site sur un portable'], ['12-couleur', ['planche'], 'Fiche couleur'], ['13-degrades', ['planche'], 'Recette de dégradé'],
    ['28-telephone', ['3d'], 'Le téléphone'], ['14-typographie', ['planche'], 'Échelle typographique'], ['16-detail', ['video'], 'Un détail s’allume'],
    ['32-stand', ['3d'], 'Stand de salon'], ['15-icones', ['planche'], 'Grille d’icônes'], ['17-archive', ['planche'], 'Archive du système'],
    ['35-enseigne', ['3d'], 'Enseigne de bureau'], ['22-pages-site', ['planche'], 'Pages du site'], ['23-mur', ['video'], 'Mur de pages'],
    ['25-cockpit', ['planche'], 'Le cockpit'], ['26-ecran-detail', ['planche'], 'Écran et détail'], ['27-cra-facture', ['planche'], 'Du CRA à la facture'],
    ['28-telephone-ecran', ['video'], 'L’écran vivant'], ['29-theme-clair', ['planche'], 'Thème clair'], ['30-composants', ['planche'], 'Feuille de composants'],
    ['31-trois-supports', ['planche'], 'Même écran, trois supports'], ['33-icone-app', ['planche'], 'Icône d’application'], ['34-reseaux', ['planche'], 'Réseaux sociaux'],
    ['36-guide', ['planche'], 'Guide de marque'], ['38-derive', ['video'], 'Mosaïque en dérive'], ['37-contact', ['planche'], 'Planche-contact'], ['39-cloture', ['planche'], 'Clôture'],
  ].map(([f, k, c]) => ({ f, k, c, v: k.includes('video'), th: 'media/vignettes/' + f + '.jpg' }));
  const FIL = [['tout', 'Tout'], ['planche', 'Planches'], ['video', 'Vidéos'], ['3d', 'Scènes 3D']];
  const dispo = () => M.filter((m) => !manquants.has(m.f));
  let list = M, filtre = 'tout';
  const compte = () => $$('#filters button').forEach((b) => { const k = b.dataset.k; b.querySelector('span').textContent = (k === 'tout' ? dispo() : dispo().filter((m) => m.k.includes(k))).length; });
  const drawGal = (k) => { filtre = k;
    list = k === 'tout' ? dispo() : dispo().filter((m) => m.k.includes(k));
    $('#gal').innerHTML = list.map((m, i) => `<button data-i="${i}" data-media="${m.f}" aria-label="Agrandir : ${m.c}"><div class="gd-im"><img src="${m.th}" alt="${m.c}" loading="lazy">${m.v ? '<span class="gd-lire" aria-hidden="true"></span>' : ''}</div><figcaption><i>${m.k.map((x) => KIND[x]).join(' · ')}</i>${m.c}</figcaption></button>`).join('');
    $$('#gal button').forEach((b) => b.addEventListener('click', () => openLb(list.filter((m) => !manquants.has(m.f)), list.filter((m) => !manquants.has(m.f)).findIndex((m) => m.f === b.dataset.media))));
    $$('#filters button').forEach((b) => b.classList.toggle('gd-sel', b.dataset.k === k)); compte(); };
  $('#filters').innerHTML = FIL.map(([k, t]) => `<button data-k="${k}">${t} <span style="opacity:.55"></span></button>`).join('');
  $$('#filters button').forEach((b) => b.addEventListener('click', () => drawGal(b.dataset.k)));
  drawGal('tout');
  document.addEventListener('error', () => { clearTimeout(compte.k); compte.k = setTimeout(compte, 120); }, true);
  const lb = $('#lb'); let lbList = [], lbI = 0, lbRetour = null;
  const drawLb = () => { const m = lbList[lbI]; $('#lb-m').innerHTML = m.v ? `<video src="media/${m.f}.mp4" autoplay loop muted playsinline controls></video>` : `<img src="media/${m.f}.jpg" alt="${m.c}">`; $('#lb-leg').textContent = m.c; $('#lb-n').textContent = lbList.length > 1 ? `${pad(lbI + 1)} / ${pad(lbList.length)}` : ''; $('#lb-prec').style.display = $('#lb-suiv').style.display = lbList.length > 1 ? '' : 'none'; };
  function openLb(l, i) { if (!l.length) return; lbRetour = document.activeElement; lbList = l; lbI = Math.max(0, i); lb.classList.add('gd-ouvert'); document.body.style.overflow = 'hidden'; drawLb(); $('#lb-fermer').focus(); }
  const closeLb = () => { lb.classList.remove('gd-ouvert'); $('#lb-m').innerHTML = ''; document.body.style.overflow = ''; if (lbRetour) lbRetour.focus(); };
  const step = (d) => { lbI = (lbI + d + lbList.length) % lbList.length; drawLb(); };
  $('#lb-prec').addEventListener('click', () => step(-1)); $('#lb-suiv').addEventListener('click', () => step(1)); $('#lb-fermer').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.id === 'lb-m') closeLb(); });
  document.addEventListener('keydown', (e) => { if (!lb.classList.contains('gd-ouvert')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
  $$('[data-lb]').forEach((im) => im.addEventListener('click', () => { const m = M.find((x) => x.f === im.dataset.lb); if (m) openLb([m], 0); }));

  /* ---------- 09 Ressources ---------- */
  $('#fichiers-tete').innerHTML = '<th>Version</th>' + CN.map((c) => `<th>${CN_NOM[c]}</th>`).join('');
  $('#fichiers-table').innerHTML = VERS.filter((v) => v[4]).map(([k, t, , f]) => `<tr><td class="gd-fort"><span style="display:inline-flex;align-items:center;gap:14px"><span style="display:inline-grid;place-items:center;width:74px;height:42px;background:var(--scene);border-radius:8px;box-shadow:inset 0 0 0 1px var(--gd-ligne)">${f(C.net, 'aria-hidden="true" style="max-width:56px;max-height:20px;width:auto;height:auto"')}</span>${t}</span></td>${CN.map((c) => `<td><a class="gd-bt gd-creux gd-petit" href="${logoUrl(k, c)}" download>SVG</a></td>`).join('')}</tr>`).join('');
  const ROLES = [['vif', 'net', 'la couleur vive'], ['clair', 'net-200', 'la lumière, accent secondaire'], ['moyen', 'acier', 'le ton moyen'], ['sombre', 'ardoise', 'le fond dense'], ['scene', 'coffre', 'le fond des scènes et du site'], ['papier', 'blanc', 'le fond des pages claires'], ['doux', 'releve', 'le fond neutre teinté'], ['encre', 'coffre', 'le texte sur fond clair']];
  const root = document.documentElement;
  const vars = ':root {\n' + COLORS.map((c) => `  --${c.k}: ${c.h};`.padEnd(24) + `/* ${c.n} : ${c.r} */`).join('\n') +
    '\n  /* Échelle du Net */\n' + PAS.map((k) => `  --net-${k}: ${N[k]};`).join('\n') +
    '\n  /* Rôles */\n' + ROLES.map(([r, k, d]) => `  --${r}: var(--${k});`.padEnd(30) + `/* ${d} */`).join('\n') +
    `\n  --sur-scene: ${TX_CLAIR};`.padEnd(31) + '/* le texte posé sur Coffre */' +
    `\n  --font: ${css(root, '--font')};\n  --mono: ${css(root, '--mono')};\n}`;
  $('#variables-css').textContent = vars;
  $('#copier-variables').addEventListener('click', () => copy(vars, 'Variables CSS copiées'));
  $('#police-texte').innerHTML = `<a class="gd-bt gd-creux gd-petit" href="assets/fonts/${fichier(A.FONTS.variable)}" download>Fichier WOFF2</a>`;
  $('#police-chiffres').innerHTML = `<a class="gd-bt gd-creux gd-petit" href="assets/fonts/${fichier(A.FONTS.chiffres.variable)}" download>Fichier WOFF2</a>`;
  $('#coordonnees-table').innerHTML = [['Site', 'payout.fr'], ['Téléphone, si un support l’exige', `01${NB}99${NB}00${NB}12${NB}85 · plage réservée aux fictions`], ['Personne d’exemple (carte de visite)', 'Inès Caron, accompagnement des freelances']]
    .map(([a, b]) => `<tr><td class="gd-etiq" style="width:300px">${a}</td><td class="gd-fort">${b}</td></tr>`).join('');

  /* ---------- Mise à l'échelle des écrans ---------- */
  function ajuster() { if (current && current.id === 'interface') { drawDesk(); } }
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { drawPhone(); ajuster(); }, 150); });
  drawPhone();

  /* ---------- Vie : la jauge de l'accueil et la boucle de 8 s, vidéos qui jouent quand on les voit ---------- */
  if (!calme) {
    const t0 = performance.now();
    const loop = (now) => { if (current && !document.hidden) { const t = (now - t0) / 1000;
      if (current.id === 'accueil') A.seekJauge(t, { boucle: MV.boucle, root: $('#hero-vu') });
      if (current.id === 'mouvement') A.seekJauge(t, { boucle: MV.boucle, root: $('[data-piste="boucle"]') }); }
      requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  if ('IntersectionObserver' in window && !calme) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target; if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { threshold: 0.5 });
    $$('video.gd-v').forEach((v) => io.observe(v));
  }
  show();
})();
