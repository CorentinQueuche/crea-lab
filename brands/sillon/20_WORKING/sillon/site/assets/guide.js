/* GUIDE DE MARQUE EN LIGNE — Sillon (site/assets/guide.js) : navigation, pages, éléments vivants, galerie, visionneuse.
   Tout ce qui est dessiné vient du socle : Marque (logo, verres, contre-étiquette, photos, imprimés), Verse (le moteur qui
   remplit et mesure), les fonds .fond-* (matière). Rien n'est redessiné ici ; les règles chiffrées sont celles de
   MARQUE.md et de la fiche de marque.

   Chaque page est construite la première fois qu'on l'ouvre (INIT[id]) : le moteur ne travaille que pour ce qu'on regarde.
   window.GuideTests déclare les éléments vivants à tools/check_inter.mjs (format en tête de ce script). */
(function () {
  'use strict';
  const A = window.Marque, V = window.Verse, C = A.COULEURS, N = A.NOMS, J = A.JUS, NB = A.NB, K = A.CONSTRUCTION;
  const F = window.GuideFichiers || { videos: {}, reseaux: { liste: [] } };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fr = (v, d = 1) => (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d).replace('.', ',');
  const mo = (o) => (o < 1e6 ? Math.max(1, Math.round(o / 1e3)) + NB + 'Ko' : fr(o / 1e6, 1) + NB + 'Mo');
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const etroit = () => window.innerWidth < 600;
  const borne = (v, a, b) => Math.max(a, Math.min(b, v));
  const encreSur = (fond) => (A.contraste(C.cave, fond) >= A.contraste(C.tuffeau, fond) ? C.cave : C.tuffeau);
  const cvs = A.cvs;
  const croix = (c = C.cave) => `<svg class="gd-x" viewBox="0 0 16 16" fill="none" stroke="${c}" stroke-width="2.4" aria-hidden="true"><path d="M2,2 L14,14 M14,2 L2,14"/></svg>`;
  const TONS_BLEU = ['Nuit de cave', 'Veste neuve', 'Bleu de travail', 'Veste portée', 'Bleu lavé'];
  const TONS_PIERRE = ['Taille fraîche', 'Tuffeau', 'Craie', 'Pierre patinée', 'Pierre à l’ombre'];
  const rendre = (racine) => (V ? V.tout(racine) : Promise.resolve([]));

  /* ---------- petits outils ---------- */
  const toast = (msg) => { const t = $('#toast'); t.innerHTML = A.verre({ taille: 18, c: C.bleu, detail: false }) + `<span>${esc(msg)}</span>`; t.classList.add('gd-ouvert'); clearTimeout(toast.k); toast.k = setTimeout(() => t.classList.remove('gd-ouvert'), 1900); };
  const copier = async (texte, msg) => {
    try { await navigator.clipboard.writeText(texte); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = texte; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toast(msg || 'Copié');
  };
  /* Groupe à choix unique : aria-pressed, flèches gauche et droite, appel immédiat sur l'élément initial */
  const choix = (sel, items, f, i0 = 0) => {
    const el = $(sel);
    el.innerHTML = items.map((it, i) => `<button type="button" aria-pressed="false" data-i="${i}"${it.k ? ` data-k="${it.k}"` : ''}>${it.label}</button>`).join('');
    const bts = $$('button', el);
    const set = (i) => { bts.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i))); f(items[i], i); };
    bts.forEach((b, i) => {
      b.addEventListener('click', () => set(i));
      b.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
        e.preventDefault(); const j = (i + d + bts.length) % bts.length; set(j); bts[j].focus(); });
    });
    set(i0); return set;
  };
  /* Un titre de la voix : largeur d'une ligne composée comme le moteur la compose (pour choisir sa taille) */
  const mesureLigne = (texte, o = {}) => { const ctx = mesureLigne.c || (mesureLigne.c = document.createElement('canvas').getContext('2d')), px = 100 / 0.675; let w = 0, n = 0, v = false;
    for (const ch of String(texte)) { if (ch === '[') { v = true; continue; } if (ch === ']') { v = false; continue; } ctx.font = `${o.graisse || 900} ${v ? 'extra-expanded' : o.serre || 'extra-condensed'} ${px}px Anybody`; w += ctx.measureText(ch).width; n++; }
    return w + Math.max(0, n - 1) * (o.inter == null ? 0.012 : o.inter) * px; };

  /* ---------- la marque partout ---------- */
  $$('[data-logo]').forEach((el) => { el.innerHTML = A.wordmark('currentColor', 'aria-hidden="true"', 'maceration'); });
  $$('[data-symbole]').forEach((el) => { el.innerHTML = A.symbol(C.tuffeau, 'aria-hidden="true"', 'maceration'); });
  const fleches = (r = document) => $$('[data-fleche]', r).forEach((el) => { if (!el.firstChild) el.innerHTML = A.fleche('currentColor'); });
  fleches();
  $('#lb-prec').innerHTML = A.fleche('currentColor', '', 180); $('#lb-suiv').innerHTML = A.fleche('currentColor');
  $('#lb-fermer').innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>';

  /* =================================================================== Pages, sommaire, navigation */
  const pages = $$('.page').map((el, i) => ({ el, id: el.id, i, title: el.dataset.title,
    subs: (el.dataset.subs || '').split('|').filter(Boolean).map((s) => { const k = s.indexOf(':'); return { id: s.slice(0, k), t: s.slice(k + 1) }; }) }));
  $('#nav').innerHTML = pages.map((p) => `<a href="#${p.id}" data-p="${p.id}"><i>${pad(p.i)}</i><span>${esc(p.title)}</span><b>${A.verre({ taille: 16, c: C.bleu, jus: J[p.i % 3], detail: false })}</b></a>` +
    (p.subs.length ? `<div class="gd-sous" data-s="${p.id}">${p.subs.map((s) => `<a href="#${s.id}">${esc(s.t)}</a>`).join('')}</div>` : '')).join('');
  pages.forEach((p) => {
    const prev = pages[p.i - 1], next = pages[p.i + 1], el = $('[data-pager]', p.el);
    if (!el) return;
    el.innerHTML = (prev ? `<a href="#${prev.id}" class="gd-prec"><span class="t-etq">Précédent · ${pad(prev.i)}</span><b>${A.fleche('currentColor', '', 180)}${esc(prev.title)}</b></a>` : '<span></span>') +
      (next ? `<a href="#${next.id}" class="gd-suiv"><span class="t-etq">Suivant · ${pad(next.i)}</span><b>${esc(next.title)}${A.fleche('currentColor')}</b></a>` : '');
  });
  const INIT = {}, faits = new Set();
  const construire = (id) => { if (faits.has(id) || !INIT[id]) return; faits.add(id); try { INIT[id](); } catch (e) { console.error(e); } };
  let courante = null, premiere = true;
  const ouvrirNav = (on) => { $('#sommaire').classList.toggle('gd-ouvert', on); $('#burger').setAttribute('aria-expanded', String(on)); $('#burger').setAttribute('aria-label', on ? 'Fermer le sommaire' : 'Ouvrir le sommaire'); };
  const montrer = () => {
    const id = decodeURIComponent(location.hash.slice(1)) || pages[0].id;
    const cible = document.getElementById(id) || pages[0].el;
    const pageEl = cible.classList.contains('page') ? cible : cible.closest('.page') || pages[0].el;
    if (pageEl !== courante) {
      pages.forEach((p) => p.el.classList.toggle('on', p.el === pageEl));
      $$('#nav > a').forEach((a) => { const on = a.dataset.p === pageEl.id; a.classList.toggle('gd-sel', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      $$('#nav .gd-sous').forEach((s) => s.classList.toggle('gd-sel', s.dataset.s === pageEl.id));
      courante = pageEl;
      document.title = (pageEl === pages[0].el ? '' : pageEl.dataset.title + ' — ') + A.NOM + ', guide de marque';
      $$('video').forEach((v) => { if (!pageEl.contains(v)) v.pause(); });
      construire(pageEl.id);
      if (!premiere && cible === pageEl) { const h = $('h1', pageEl); if (h) h.focus({ preventScroll: true }); }
    }
    premiere = false;
    ouvrirNav(false);
    if (cible === pageEl) window.scrollTo(0, 0); else requestAnimationFrame(() => cible.scrollIntoView());
  };
  window.addEventListener('hashchange', montrer);
  $('#burger').addEventListener('click', () => ouvrirNav(!$('#sommaire').classList.contains('gd-ouvert')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#sommaire').classList.contains('gd-ouvert')) { ouvrirNav(false); $('#burger').focus(); } });

  /* Les vidéos : chargées et lues seulement à l'écran ; aucune ne part seule si l'on a demandé moins de mouvement */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((en) => { const v = en.target;
    if (en.isIntersecting) { if (!v.src) { v.src = v.dataset.src; v.preload = 'auto'; } const p = v.play(); if (p) p.catch(() => {}); } else v.pause(); }), { rootMargin: '80px 0px', threshold: 0.2 }) : null;
  const brancherVideos = (r) => $$('video[data-src]', r).forEach((v) => { if (calme || !io) { v.controls = true; v.preload = 'metadata'; v.src = v.dataset.src; } else io.observe(v); });

  /* =================================================================== 00 · Accueil */
  const FIXE = { marque: 'L’idée, les pistes écartées, la cave, la voix sur les objets, le ton.', logo: 'Quatre versions et leurs couleurs, la construction, les tailles, ce qu’on ne fait pas.',
    couleurs: 'Huit couleurs en matière, leurs échelles, les proportions, les contrastes.', ecrire: 'Le titre à verres et ses trois règles, les deux polices, les nombres.',
    kit: 'Les sept éléments, l’abécédaire à ras bord, la pente, la contre-étiquette.', image: 'L’image à niveau, les douze photos, habiller une photo.',
    mouvement: 'Verser en 0,9 s, basculer en 0,6 s, les huit vidéos.', situation: 'Les pièces de l’étude de cas, à filtrer et à agrandir.',
    annonce: 'Les quatre modèles, la zone sûre, la mention sanitaire, l’outil.', ressources: 'Les logos, la fiche, le kit pour les réseaux, les vidéos, les polices.' };
  const NV = Object.keys(F.videos || {}).length, NPAGES = (window.GuideOrder || []).length;
  INIT.accueil = () => {
    const l = etroit() ? Math.min(260, window.innerWidth - 150) : Math.round(borne(window.innerWidth * 0.24, 280, 400));
    $('#hero-photo').innerHTML = A.cadre('verre-penche', { l, h: Math.round(l * 1.24), angle: A.DEGRE, pos: '58% 42%' });
    $('#hero-ce').innerHTML = etroit() ? '' : A.contre({ lot: '00', sujet: 'Guide de marque', lignes: [['Chapitres', String(pages.length - 1)], ['Ce qui penche', 'le mot, le logo, le cadre'], ['Ce qui ne penche pas', 'le vin']], grands: [`12,5${NB}cl`, A.deg(12)], voix: A.VOIX.sousVerre, l: 262 });
    const cv = $('#hero-logo'), larg = $('.gd-hero').clientWidth - 2 * parseFloat(getComputedStyle($('.gd-hero')).paddingLeft);
    const taille = Math.round(borne((larg * (etroit() ? 0.98 : 0.74)) / 7.95, 34, 132));
    V.pret().then(() => { V.logo(cv, { taille, angle: -A.DEGRE, fond: 'bleu' }); cv.dataset.pret = '1'; });
    const voies = [
      { href: 'presentation.html', k: 'Pages', t: 'La fiche de marque', p: `${NPAGES} pages au format 16:9, à feuilleter au clavier ou à projeter, et leur PDF (${mo(F.pdf ? F.pdf.octets : 0)}).`, im: ['deck/01.jpg', 'deck/04.jpg', 'deck/06.jpg'] },
      { href: 'etude-de-cas.html', k: 'Défilement', t: 'L’étude de cas', p: `${F.pieces || ''} pièces, dont ${NV} vidéos, l’une sous l’autre. Ce que la marque donne dans le monde.`, im: ['media/vignettes/14-le-mur.jpg', 'media/vignettes/09-les-trois-jus.jpg', 'media/vignettes/01-la-vitrine.jpg'] },
      { href: '#ressources', k: 'Fichiers', t: 'Ce qu’on télécharge', p: 'Les 24 logos, la fiche en PDF, le kit pour les réseaux, les vidéos, les polices et leur licence.', im: ['media/reseaux/21-jeudi-4x5-a.jpg', 'media/reseaux/24-phrase-4x5-a.jpg', 'media/reseaux/22-plein-4x5-a.jpg'] },
    ];
    $('#voies').innerHTML = voies.map((v) => `<a class="gd-voie" href="${v.href}"><div class="gd-voie-vu">${v.im.map((s) => `<img src="${s}" alt="" loading="lazy">`).join('')}</div><span class="t-etq">${v.k}</span><h3>${v.t} ${A.fleche('currentColor')}</h3><p>${v.p}</p></a>`).join('');
    $('#somm').innerHTML = `<div class="gd-somm-t"><b>${A.NOM.toUpperCase()}</b><span class="t-etq">Guide de marque · sommaire</span></div>` +
      pages.slice(1).map((p) => `<a href="#${p.id}"><span class="gd-num">${pad(p.i)}</span><span class="gd-somm-n">${esc(p.title)}</span><p>${FIXE[p.id] || ''}</p><span class="gd-somm-v">${A.verre({ taille: 26, c: C.bleu, jus: J[p.i % 3] })}</span></a>`).join('') +
      `<div class="gd-somm-g"><b>${pages.length - 1} chapitres</b><span class="t-etq">Une règle, sa raison, ce qu’on fait, ce qu’on ne fait pas</span></div>`;
    const barre = `<div style="display:flex;width:150px;height:40px;border-radius:2px;overflow:hidden">${['bleu', 'cave', 'tuffeau', 'craie', 'lave', 'maceration', 'glou', 'paille'].map((k) => `<i style="flex:1;background:${C[k]}"></i>`).join('')}</div>`;
    const ch = [
      [A.penche(C.tuffeau, { jus: 'maceration', attrs: 'style="width:150px;height:auto"' }), A.deg(12), 'La pente de tout ce qui penche : un mot, un logo, un cadre. Le degré d’un vin de soif.'],
      [A.symbol(C.tuffeau, 'style="height:72px;width:auto"', 'maceration', { detail: true }), '2/3', 'Le creux du logo est plein aux deux tiers.'],
      [cvs('[U]', { taille: 58, fond: 'cave', p: 1, jus: 'glou', id: 'ch-u' }), `12,5<small>cl</small>`, 'Un U large, droit et plein : un verre de dégustation. Six font une bouteille.'],
      [barre, '8', 'couleurs, dont trois jus. Le bleu est une veste, le tuffeau une pierre.'],
      [A.service({ w: 160, h: 76, cols: 4, rangs: 2, c: C.tuffeau, attrs: 'style="width:160px;height:auto"' }), '7', 'éléments dans le kit. Sans le nom, on reconnaît Sillon.'],
    ];
    $('#chiffres').innerHTML = ch.map(([vu, b, p]) => `<div class="gd-chiffre"><div class="gd-chiffre-vu">${vu}</div><b>${b}</b><p>${p}</p></div>`).join('');
    rendre($('#chiffres'));
  };

  /* =================================================================== 01 · La marque */
  INIT.marque = () => {
    const x0 = A.LETTRES.x[2], lw = A.LETTRES.largeur[2], ll = A.letterParts('LL');
    const ll2 = `<svg viewBox="${x0 - 4} -6 ${lw + 8} 112" style="height:96px;width:auto" aria-hidden="true"><path fill="${C.maceration}" d="${ll.jus}"/><path fill="${C.bleu}" fill-rule="evenodd" d="${ll.lettres}"/></svg>`;
    const q = [
      ['Une forme', 'Les deux L soudés font un verre.', ll2],
      ['Une règle', 'Tout ce qui est creux et ouvert vers le haut peut se remplir.', cvs('H[U][V]Y', { taille: 38, tout: '', serre: 'normal', mode: 'imprime', c: 'bleu', jus: 'paille,maceration,glou', inter: 0.06 })],
      ['Un comportement', 'Les mots penchent de 12°, le vin reste d’aplomb.', A.penche(C.bleu, { jus: 'maceration', attrs: 'style="width:210px;height:auto"' })],
      ['Un vocabulaire', 'Le creux, le plein, à ras bord.', `<span class="t-sous" style="font-size:30px;color:${C.bleu};line-height:1">le creux.<br>le plein.<br>à ras bord.</span>`],
    ];
    $('#quatre').innerHTML = q.map(([k, t, vu]) => `<div><div class="gd-quatre-vu">${vu}</div><span class="t-etq">${k}</span><p class="gd-h3">${t.replace('12°', A.deg(12))}</p></div>`).join('');
    $('#piste-logo').innerHTML = A.wordmark(C.tuffeau, 'style="width:min(100%,250px);height:auto" aria-hidden="true"', 'maceration');
    const act = A.DONNEES.activites;
    const vus = [`<div style="width:74px">${A.etiquette({ jus: 'maceration', l: 74 })}</div>`, A.verre({ taille: 84, c: C.bleu, jus: 'glou' }), A.service({ w: 150, h: 70, cols: 3, rangs: 1, c: C.bleu, attrs: 'style="width:150px;height:auto"' })];
    $('#activites').innerHTML = act.map((a, i) => `<div><div class="gd-cave-vu">${vus[i]}</div><h3 class="gd-h3" style="color:${C.bleu};font-size:26px">${a.nom}</h3><p>${a.quoi}</p>${a.nom === 'Le Plein' ? '<p class="gd-note">Le nom de l’abonnement est à valider.</p>' : ''}</div>`).join('');
    const w = $('#objets').clientWidth, une = etroit() || w < 700, col = une ? w : (w - 3 * 22) / 4;
    const objets = [
      ['Sur l’affiche, en vitrine', A.VOIX.vitrine, A.affiche({ l: Math.round(Math.min(col, 236)) }), 3],
      ['Au dos de la bouteille', A.VOIX.dos, A.contre({ sujet: 'Au dos', lignes: [['Le jus', 'Macération'], ['Mention', 'Vin nature · non filtré']], grands: [`75${NB}cl`, A.deg(12)], voix: A.VOIX.dos, l: Math.round(Math.min(col, 250)) }), 3],
      ['Dans la nappe', A.VOIX.nappe, `<div class="gd-nappe fond-bleu lumiere"><span class="usure" style="position:relative;z-index:2">${A.VOIX.nappe}</span></div>`, 3],
      ['Sur le sous-verre', A.VOIX.sousVerre, A.sousVerre({ l: Math.round(Math.min(col, 200)) }), 3],
      ['Dans le colis du mois', A.VOIX.colis, A.mot({ l: Math.round(Math.min(une ? w : col * 2, 360)) }), 6],
      ['Sur la carte', A.VOIX.carte, A.carte({ l: Math.round(Math.min(une ? w : col * 2, 420)) }), 6],
    ];
    $('#objets').innerHTML = objets.map(([o, t, vu, s]) => `<div class="gd-objet" style="grid-column:span ${s}"><div class="gd-objet-vu">${vu}</div><span class="t-etq">${o}</span><q>${t}</q></div>`).join('');
    rendre($('#objets')); rendre($('#quatre')); A.typo($('#marque'));
    $('#ton-table').innerHTML = A.TON.map(([o, n]) => `<div class="gd-dit">${o}</div><div class="gd-evite-pas">${n}</div>`).join('');
    const L = [['Le fondateur valide', 'La signature « On remplit les creux. », toutes les phrases, le nom d’abonnement « Le Plein », les noms des couleurs.'],
      ['Loi Évin', 'Faire relire toutes les phrases avant diffusion, en particulier « Repartez à pied. », « Taches autorisées. », « À ras bord. », « Glou. ». Toute annonce porte la mention sanitaire.'],
      ['Le nom', 'Sillon n’a été vérifié ni à l’INPI, ni comme nom de domaine, ni comme compte de réseau.'],
      ['Les photos', 'Générées pour le projet, avec l’accord du commanditaire. Jamais présentées comme des photos réelles.']];
    $('#a-valider').innerHTML = `<div class="gd-liste-t"><span>À valider avant diffusion</span><span>Sillon · marque fictive</span></div>` + L.map(([a, b]) => `<div><span>${a}</span><span>${b}</span></div>`).join('');
  };

  /* =================================================================== 02 · Le logo */
  const VERSIONS = [
    { v: 'logotype', nom: 'Le logotype', quand: 'Partout où le nom tient en largeur : il est 7,6 fois plus large que haut.',
      dessin: (c, j) => A.wordmark(C[c], 'style="width:min(100%,300px);height:auto"', j ? 'maceration' : null), f: (c, j) => (j ? `logotype-jus-${c}` : `logotype-${c}`) },
    { v: 'penche', nom: 'Le logotype penché', quand: 'Monte de 12°, son vin reste à niveau. Pour une ouverture, une affiche.',
      dessin: (c, j) => A.penche(C[c], { jus: j ? 'maceration' : null, attrs: 'style="width:min(100%,290px);height:auto"' }), f: (c, j) => (j ? `penche-jus-${c}` : null) },
    { v: 'symbole', nom: 'Le symbole', quand: 'Le verre seul. L’avatar, la puce, le motif ; et dès que le format est étroit.',
      dessin: (c, j) => A.symbol(C[c], 'style="height:110px;width:auto"', j ? 'maceration' : null), f: (c, j) => (j ? `symbole-jus-${c}` : `symbole-${c}`) },
    { v: 'complet', nom: 'La version complète', quand: 'Pour se présenter à qui ne connaît pas Sillon. Fichier en un seul aplat.',
      dessin: (c) => A.lockup(C[c], 'style="width:min(100%,340px);height:auto"'), f: (c) => `complet-${c}` },
  ];
  const FONDS = [
    { k: 'bleu', label: `<i style="background:${C.bleu}"></i>Bleu de travail`, cls: 'fond-bleu lumiere', lettres: ['tuffeau'], jus: true },
    { k: 'tuffeau', label: `<i style="background:${C.tuffeau}"></i>Tuffeau`, cls: 'fond-tuffeau lumiere', lettres: ['bleu', 'cave'], jus: true },
    { k: 'craie', label: `<i style="background:${C.craie}"></i>Craie`, cls: 'fond-craie lumiere', lettres: ['bleu', 'cave'], jus: true },
    { k: 'maceration', label: `<i style="background:${C.maceration}"></i>Un jus`, cls: 'jus-maceration', lettres: ['cave'], jus: false },
    { k: 'photo', label: `<i style="background:url(photos/dos-veste.jpg) center/cover"></i>Une photo`, cls: 'gd-scene-photo', photo: 'dos-veste', lettres: ['tuffeau'], jus: true },
  ];
  INIT.logo = () => {
    $('#logo-tete').innerHTML = A.wordmark(C.bleu, 'aria-hidden="true"', 'maceration', { detail: true });
    let fond = FONDS[0], lettre = 'tuffeau';
    const scene = () => {
      const st = $('#stage'); st.className = 'gd-scene-logo ' + fond.cls; st.dataset.fond = fond.k; st.dataset.lettres = lettre; st.style.color = C[lettre];
      st.innerHTML = (fond.photo ? A.photo(fond.photo, { pos: '50% 40%' }) : '') + `<div class="gd-versions">${VERSIONS.map((v) => { const f = v.f(lettre, fond.jus);
        return `<div class="gd-version" data-v="${v.v}"><div class="gd-version-vu">${v.dessin(lettre, fond.jus)}</div><div class="gd-version-pied"><div><b>${v.nom}</b><span>${v.quand.replace('12°', A.deg(12))}</span>${f ? `<code>sillon-${f}.svg</code>` : '<code>Pas de fichier pour ce fond</code>'}</div>` +
          (f ? `<a class="gd-bt gd-petit" href="logo/sillon-${f}.svg" download style="--gd-encre:${C[lettre]};--gd-sur-encre:${encreSur(C[lettre])}" aria-label="Télécharger ${v.nom}, ${N[lettre]}, SVG">SVG</a>` : '') + '</div></div>'; }).join('')}</div>`;
    };
    const setLettres = choix('#lettres-sw', [{ label: 'Bleues', k: 'bleu' }, { label: 'Fond de cave', k: 'cave' }], (it) => { lettre = it.k; scene(); });
    choix('#stage-sw', FONDS, (f) => {
      fond = f; const deux = f.lettres.length > 1; $('#lettres-z').hidden = !deux;
      if (deux) { if (!f.lettres.includes(lettre)) setLettres(0); else scene(); } else { lettre = f.lettres[0]; scene(); }
    });
    /* le penché, réglable */
    const pv = $('#penche-vu'), pa = $('#penche-a');
    const penche = () => { const a = +pa.value;
      pv.innerHTML = A.penche(C.tuffeau, { angle: -a, jus: 'maceration', attrs: 'style="width:100%;height:auto"' }) + '<i class="gd-pente-niv"></i>';
      const s = $('svg', pv), vb = s.viewBox.baseVal, r = s.getBoundingClientRect(), rp = pv.getBoundingClientRect(), k = r.width / vb.width;
      $('.gd-pente-niv', pv).style.top = (r.top - rp.top + (parseFloat(s.dataset.surface) - vb.y) * k) + 'px';
      const t = fr(a, a % 1 ? 1 : 0) + '°'; $('#penche-o').textContent = t; $('#penche-l').innerHTML = fr(a, a % 1 ? 1 : 0) + '°';
      pa.setAttribute('aria-valuetext', `${fr(a, a % 1 ? 1 : 0)} degrés`); pv.dataset.angle = String(a);
      pv.setAttribute('aria-label', `Le logotype penché de ${fr(a, a % 1 ? 1 : 0)} degrés ; la surface du vin reste horizontale.`); };
    pa.addEventListener('input', penche); penche(); window.addEventListener('resize', penche);
    /* la construction, cotée */
    const x0 = A.LETTRES.x[2], lw = A.LETTRES.largeur[2], ll = A.letterParts('LL'), cr = A.CREUX, f = K.fut, Fd = cr.h, sf = K.surface;
    const cote = (x1, y1, x2, y2, t, o = {}) => { const h = y1 === y2, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      return `<path d="M${x1},${y1} L${x2},${y2} ${h ? `M${x1},${y1 - 3} v6 M${x2},${y2 - 3} v6` : `M${x1 - 3},${y1} h6 M${x2 - 3},${y2} h6`}" stroke="${C.cave}" stroke-width=".7" fill="none"/>` +
        `<text x="${h ? mx : x1 + (o.g ? -5 : 5)}" y="${h ? y1 + (o.bas ? 9 : -4) : my + 2.4}" font-size="6.6" fill="${C.cave}" text-anchor="${h ? 'middle' : o.g ? 'end' : 'start'}" letter-spacing=".4">${t}</text>`; };
    const rond = (cx, cy, r, t, dx, dy) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.cave}" stroke-width=".7"/><path d="M${cx},${cy} l${dx * 0.6},${dy * 0.6}" stroke="${C.cave}" stroke-width=".6"/><text x="${cx + dx}" y="${cy + dy}" font-size="6.6" fill="${C.cave}" letter-spacing=".4" text-anchor="middle">${t}</text>`;
    $('#constr-vu').innerHTML = `<svg viewBox="${x0 - 62} -34 ${lw + 124} 160" aria-hidden="true">
      <path d="M${x0 - 62},100 H${x0 + lw + 62} M${x0 - 62},0 H${x0 + lw + 62}" stroke="${C.cave}" stroke-width=".4" stroke-dasharray="2 3" fill="none" opacity=".5"/>
      <path fill="${C.maceration}" d="${ll.jus}"/><path fill="${C.bleu}" fill-rule="evenodd" d="${ll.lettres}"/>
      <path d="M${cr.x - 6},${sf} H${cr.x + cr.l + 6}" stroke="${C.cave}" stroke-width=".7" stroke-dasharray="3 2"/>
      <text x="${cr.x + cr.l / 2}" y="${sf + 8}" font-size="6" fill="${C.cave}" text-anchor="middle" letter-spacing=".4">NIVEAU 2/3</text>
      ${cote(x0, -16, x0 + f, -16, 'FÛT ' + fr(f, 2))}${cote(cr.x, -16, cr.x + cr.l, -16, 'CREUX ' + fr(cr.l, 2))}${cote(cr.x + cr.l, -16, cr.x + cr.l + f, -16, fr(f, 2))}
      ${cote(x0 - 14, 0, x0 - 14, Fd, fr(Fd, 2), { g: true })}${cote(x0 + lw + 14, Fd, x0 + lw + 14, 100, 'PIED ' + fr(K.pied, 2))}${cote(x0 - 44, 0, x0 - 44, 100, 'CAPITALE 100', { g: true })}
      ${cote(x0, 112, x0 + lw, 112, 'DEUX L · ' + fr(lw, 1), { bas: true })}
      ${rond(cr.x + K.rayonFond, Fd - K.rayonFond, K.rayonFond, 'R ' + K.rayonFond, 16, 22)}${rond(cr.x - K.rayonLevre, K.rayonLevre, K.rayonLevre, 'R ' + K.rayonLevre, -14, -12)}${rond(cr.x + cr.l + K.rayonLevre, K.rayonLevre, K.rayonLevre, 'R ' + K.rayonLevre, 14, -12)}
      <text x="${cr.x + cr.l + 3}" y="${sf - 3}" font-size="6" fill="${C.cave}" letter-spacing=".4">+${K.menisque[1]}</text></svg>`;
    const xs = K.x, la = A.LETTRES.largeur;
    $('#constr-mot').innerHTML = `<svg viewBox="-20 -26 ${K.largeur + 40} 156" aria-hidden="true"><path fill="${C.maceration}" d="${A.jusPath()}"/><path fill="${C.bleu}" fill-rule="evenodd" d="${A.lettersPath()}"/>
      ${K.interlettres.map((e, i) => { const a = xs[i] + la[i], b = xs[i + 1]; return `<rect x="${a}" y="0" width="${b - a}" height="100" fill="${C.lave}" opacity=".55"/><text x="${(a + b) / 2}" y="-8" font-size="9" fill="${C.cave}" text-anchor="middle">${e}</text>`; }).join('')}
      ${cote(0, 118, K.largeur, 118, 'LARGEUR ' + fr(K.largeur, 2) + ' · CAPITALE 100', { bas: true }).replace(/font-size="6.6"/g, 'font-size="9"')}</svg>`;
    const cotes = [['Capitale', '100'], ['Fût', fr(f, 2)], ['Pied', fr(K.pied, 2)], ['Creux', `${fr(cr.l, 2)} × ${fr(cr.h, 2)}`], ['Fond du creux', 'R ' + K.rayonFond], ['Lèvres', 'R ' + K.rayonLevre],
      ['Ménisque', '+' + K.menisque[1]], ['Niveau', '2/3'], ['Interlettre', K.interlettres.join(' · ')], ['Largeur', fr(K.largeur, 2)]];
    $('#cotes').innerHTML = cotes.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
    /* les trois échelles de détail, à la taille exacte */
    const ev = $('#ech-vu'), ep = $('#ech-px'), ratio = A.LOGO.symbolBox[2] / A.LOGO.symbolBox[3];
    ep.max = String(Math.max(120, Math.min(320, Math.floor((ev.clientWidth - 60) / ratio))));
    const PAL = [['Moins de 32 px', 'un aplat', ''], ['De 32 à 200 px', 'deux couleurs', '-jus'], ['Au-delà', 'disque, lie, bulles', '-grand']];
    const echelle = () => { const v = +ep.value, n = v < 32 ? 0 : v <= 200 ? 1 : 2;
      ev.innerHTML = A.symbol(C.bleu, `style="height:${v}px;width:auto"`, n ? 'maceration' : null, { detail: n === 2 }) + `<div class="gd-echelle-regle t-etq"><span>${v}${NB}px de haut</span><span>sillon-symbole${PAL[n][2]}-bleu.svg</span></div>`;
      ev.dataset.palier = String(n); ev.setAttribute('aria-label', `Le symbole affiché à ${v} pixels de haut : ${PAL[n][1]}.`);
      $('#ech-o').textContent = v + NB + 'px'; ep.setAttribute('aria-valuetext', `${v} pixels`);
      $('#paliers').innerHTML = PAL.map(([a, b, s], i) => `<div class="${i === n ? 'gd-actif' : ''}"><span class="t-etq">${a}</span><b>${b}</b><code>${s ? 'suffixe ' + s : 'sans suffixe'}</code></div>`).join(''); };
    ep.addEventListener('input', echelle); echelle();
    /* zone de protection (même tracé que la fiche de marque) et tailles minimales */
    const m = cr.l, SB = A.LOGO.symbolBox, ms = SB[2] / 2;
    const carre = (x, y, c) => `<path fill="none" stroke="${c}" stroke-width="2" d="M${x},${y} h${m} v${m} h${-m} Z M${x},${y} l${m},${m} M${x + m},${y} l${-m},${m}"/>`;
    $('#zone-mot').innerHTML = `<span class="t-etq" style="color:${C.bleu}">Logotype, penché, complète</span><svg viewBox="${-m - 6} ${-m - 6} ${K.largeur + 2 * m + 12} ${100 + 2 * m + 12}" style="margin-top:18px"><rect x="${-m}" y="${-m}" width="${K.largeur + 2 * m}" height="${100 + 2 * m}" fill="none" stroke="${C.cave}" stroke-width="2" stroke-dasharray="6 8"/>
      ${[[-m, 50 - m / 2], [K.largeur, 50 - m / 2], [cr.x, -m], [cr.x, 100]].map(([x, y]) => carre(x, y, C.cave)).join('')}<path fill="${C.maceration}" d="${A.jusPath()}"/><path fill="${C.bleu}" d="${A.lettersPath()}"/></svg>
      <p class="gd-note" style="margin-top:14px">Le carré : la largeur du creux, ${fr(m, 2)} pour une capitale de 100.</p>`;
    $('#zone-sym').innerHTML = `<span class="t-etq" style="color:${C.bleu}">Symbole</span><svg viewBox="${-ms - 4} ${-ms - 4} ${SB[2] + 2 * ms + 8} ${SB[3] + 2 * ms + 8}" style="margin-top:18px;max-height:240px"><rect x="${-ms}" y="${-ms}" width="${SB[2] + 2 * ms}" height="${SB[3] + 2 * ms}" fill="none" stroke="${C.cave}" stroke-width="2.4" stroke-dasharray="7 9"/>
      <path fill="none" stroke="${C.cave}" stroke-width="2" d="M${-ms},${SB[3] / 2} H0 M${SB[2]},${SB[3] / 2} H${SB[2] + ms}"/>${A.symbol(C.bleu, `x="0" y="0" width="${SB[2]}" height="${SB[3]}"`, 'maceration')}</svg>
      <p class="gd-note" style="margin-top:14px">La moitié de sa largeur, tout autour.</p>`;
    const T = [[A.wordmark(C.bleu, 'style="width:64px;height:auto"'), 'Logotype', `64${NB}px ou 17${NB}mm de large. En dessous, le symbole.`],
      [A.penche(C.bleu, { attrs: 'style="width:64px;height:auto"' }), 'Logotype penché', `Comme le logotype : 64${NB}px ou 17${NB}mm.`],
      [A.lockup(C.bleu, 'style="width:120px;height:auto"'), 'Version complète', `120${NB}px ou 32${NB}mm, pour que le descripteur se lise.`],
      [A.symbol(C.bleu, 'style="height:16px;width:auto"'), 'Symbole', `16${NB}px ou 4${NB}mm.`]];
    $('#tailles').innerHTML = T.map(([s, n, t]) => `<div><div>${s}</div><p><b>${n}</b> · ${t} À cette taille, le fichier en aplat.</p></div>`).join('');
    $('#complete-vu').innerHTML = A.lockup(C.tuffeau, 'style="width:100%;height:auto" aria-hidden="true"', 'maceration', { detail: true });
    const nx = K.x[4], lg = (corps, w = 172) => `<svg viewBox="${A.LOGO.box.join(' ')}" style="width:${w}px;max-width:100%;height:auto;overflow:visible">${corps}</svg>`;
    const paires = [
      ['Le verre et les lettres penchent, le vin reste horizontal.', A.symbol(C.bleu, 'style="height:96px;width:auto"', 'maceration'), `<div style="transform:rotate(12deg)">${A.verre({ taille: 80, angle: 0, c: C.bleu, detail: false })}</div>`],
      ['Un seul creux se remplit : celui des deux L.', A.wordmark(C.bleu, 'style="width:172px;max-width:100%;height:auto"', 'maceration'), lg(`<path fill="${C.maceration}" d="${A.jusPath()} M${nx + 84.35},22 H${nx + 120} V69 Z"/><path fill="${C.bleu}" d="${A.lettersPath()}"/>`)],
      ['Le creux n’est jamais vide. En une couleur, le vin y reste en bloc.', A.symbol(C.bleu, 'style="height:96px;width:auto"'), `<svg viewBox="${A.LOGO.symbolBox.join(' ')}" style="height:96px;width:auto"><path fill="${C.bleu}" d="${A.symbolParts().verre}"/></svg>`],
      ['Les lettres ne prennent jamais la couleur d’un jus.', A.wordmark(C.cave, 'style="width:172px;max-width:100%;height:auto"', 'maceration'), lg(`<path fill="${C.bleu}" d="${A.jusPath()}"/><path fill="${C.maceration}" d="${A.lettersPath()}"/>`)],
    ];
    $('#paires-logo').innerHTML = paireHTML(paires, 1);
  };
  const paireHTML = (paires, n0) => paires.map(([t, oui, non], i) => `<div class="gd-paire"><div class="gd-paire-vu"><div class="gd-papier"><span class="t-etq" style="color:${C.bleu}">Oui</span>${oui}</div><div class="gd-papier"><span class="t-etq" style="color:${C.bleu}">Non</span>${croix()}${non}</div></div><p><span class="gd-num">${n0 + i}</span><span>${t}</span></p></div>`).join('');

  /* =================================================================== 03 · Les couleurs */
  INIT.couleurs = () => {
    $('#couleurs-tete').innerHTML = cvs('[U][U][U]', { taille: etroit() ? 62 : 104, jus: J.join(','), p: 0.84, inter: 0.05, fond: 'cave' });
    const S = [['bleu', 'fond-bleu lumiere'], ['cave', 'fond-cave lumiere'], ['tuffeau', 'fond-tuffeau lumiere'], ['craie', 'fond-craie lumiere'], ['lave', 'gd-lave lumiere']];
    $('#surfaces').innerHTML = S.map(([k, cls]) => { const t = encreSur(C[k]), tn = t === C.cave ? 'fond de cave' : 'tuffeau';
      return `<button type="button" class="gd-surface ${cls}" data-k="${k}" aria-label="Copier ${N[k]}, ${C[k]}"><span class="gd-ratio">Texte ${tn} · ${fr(A.contraste(t, C[k]), 2)}${NB}:${NB}1</span><span><b>${N[k]}</b><br><code>${C[k]}</code><br>${A.ROLES[k].charAt(0).toUpperCase() + A.ROLES[k].slice(1)}.</span></button>`; }).join('');
    $$('#surfaces button').forEach((b) => b.addEventListener('click', () => copier(C[b.dataset.k], `${N[b.dataset.k]} · ${C[b.dataset.k]} copié`)));
    $('#jus3').innerHTML = J.map((k) => `<div class="gd-jus"><div class="gd-jus-vu">${cvs('[U]', { taille: 92, p: 0.84, jus: k, fond: 'cave' })}</div><div><b>${N[k]}</b><span class="t-etq">${C[k]} · ${A.MATIERES[k].dit}</span></div>
      <div class="gd-jus-tons">${A.ECHELLES[k].map((h, i) => `<button type="button" class="gd-ton-b" data-h="${h}" aria-label="Copier ${N[k]}, ${A.TONS[i]}, ${h}"><i style="background:${h}"></i><span>${A.TONS[i]}</span><code>${h}</code></button>`).join('')}</div></div>`).join('');
    $$('#jus3 .gd-ton-b').forEach((b) => b.addEventListener('click', () => copier(b.dataset.h, `${b.dataset.h} copié`)));
    rendre($('#couleurs-tete')); rendre($('#jus3'));
    const bande = (k, noms) => `<div><span class="t-etq">${k === 'bleu' ? 'Le bleu : de la nuit de cave au bleu lavé' : 'La pierre : de la taille fraîche à la pierre à l’ombre'}</span><div class="gd-bande5">${A.ECHELLES[k].map((h, i) => `<button type="button" data-h="${h}" style="background:${h};color:${encreSur(h)}" aria-label="Copier ${noms[i]}, ${h}"><b>${noms[i]}</b><code>${h}</code></button>`).join('')}</div></div>`;
    $('#echelles-l').innerHTML = bande('bleu', TONS_BLEU) + bande('tuffeau', TONS_PIERRE) + '<p class="gd-note">Les échelles des trois jus, du disque à la lie, sont au-dessus, sous chaque verre.</p>';
    $$('#echelles-l button').forEach((b) => b.addEventListener('click', () => copier(b.dataset.h, `${b.dataset.h} copié`)));
    $('#prop').innerHTML = `<i class="fond-bleu" style="flex:66"></i><i class="fond-tuffeau" style="flex:24"></i><i style="flex:3.4;background:${C.maceration}"></i><i style="flex:3.3;background:${C.glou}"></i><i style="flex:3.3;background:${C.paille}"></i>`;
    /* le testeur de contraste */
    const opts = Object.keys(C).map((k) => `<option value="${k}">${N[k]} · ${C[k]}</option>`).join('');
    $('#ct-texte').innerHTML = opts; $('#ct-fond').innerHTML = opts; $('#ct-texte').value = 'tuffeau'; $('#ct-fond').value = 'bleu';
    const teste = () => { const t = $('#ct-texte').value, f = $('#ct-fond').value, r = A.contraste(C[t], C[f]), vu = $('#ct-vu');
      vu.style.background = C[f]; vu.style.color = C[t]; $('#ct-r').textContent = fr(r, 2) + NB + ':' + NB + '1';
      const jus = J.includes(t), L = [[r >= 4.5, `Texte courant (4,5) : ${r >= 4.5 ? 'lisible' : 'trop faible'}`], [r >= 3, `Grand titre (3) : ${r >= 3 ? 'lisible' : 'trop faible'}`],
        [!jus, jus ? 'Interdit par la charte : un jus ne sert jamais de couleur de texte.' : 'La charte : aucun jus en texte, respecté.']];
      $('#ct-v').innerHTML = L.map(([ok, s]) => `<span class="${ok ? 'gd-ok' : ''}">${s}</span>`).join(''); $('#ct-v').dataset.verdict = jus ? 'interdit' : r >= 4.5 ? 'ok' : 'faible'; };
    $('#ct-texte').addEventListener('change', teste); $('#ct-fond').addEventListener('change', teste);
    $('#ct-inv').addEventListener('click', () => { const a = $('#ct-texte').value; $('#ct-texte').value = $('#ct-fond').value; $('#ct-fond').value = a; teste(); });
    teste();
    $('#mesures').innerHTML = [['tuffeau', 'bleu', 'Le texte sur le bleu.'], ['cave', 'tuffeau', 'Le texte courant.'], ['cave', 'maceration', 'Le texte posé sur un jus.'], ['maceration', 'bleu', 'Jamais en texte.']].map(([a, b, t], i) =>
      `<div class="gd-mesure"><b style="color:${C[a]};background:${C[b]}">Aa${i === 3 ? croix(C.tuffeau) : ''}</b><div><b>${fr(A.contraste(C[a], C[b]), 2)}${NB}:${NB}1</b><p>${N[a]} sur ${N[b].toLowerCase()}. ${t}</p></div></div>`).join('');
    const rond = (a, b) => `<svg viewBox="0 0 58 34" aria-hidden="true"><circle cx="17" cy="17" r="16" fill="${a}"/><circle cx="41" cy="17" r="16" fill="${b}" style="mix-blend-mode:multiply"/></svg>`;
    $('#crois').innerHTML = A.CROISEMENTS.map((x) => `<button type="button" class="gd-papier" data-h="${x.hex}" aria-label="Copier ${x.nom}, ${x.hex}">${rond(x.tons[0], x.tons[1])}<span><b style="color:${C.bleu}">${x.nom}</b><code>${x.hex}</code><br><span class="gd-note">${N[x.a]} ${x.tons[0]} · ${N[x.b].toLowerCase()} ${x.tons[1]}</span></span></button>`).join('');
    $$('#crois button').forEach((b) => b.addEventListener('click', () => copier(b.dataset.h, `${b.dataset.h} copié`)));
    $('#lum').innerHTML = `<div class="fond-bleu lumiere"><span class="t-etq">Avec sa lumière</span><p class="t-sous" style="font-size:24px;margin-top:6px">Le sergé prend du relief.</p></div><div class="fond-bleu"><span class="t-etq">Sans</span><p class="t-sous" style="font-size:24px;margin-top:6px">Il paraît imprimé à plat.</p></div>`;
  };

  /* =================================================================== 04 · Écrire : le titre à verres */
  const auto = (t) => { t = String(t).toUpperCase();
    if (/[[\]]/.test(t)) return t;
    return t.split(/(\s+)/).map((w) => { let n = 0; return [...w].map((ch) => (/[UVÛÙÜ]/.test(ch) && n < 2 ? (n++, `[${ch}]`) : ch)).join(''); }).join(''); };
  let remplir = null;
  INIT.ecrire = () => {
    const vu = $('#r-vu'), cv = $('#r-cv'), txt = $('#r-txt'), ang = $('#r-angle');
    let jus = J.slice(0, 1), mode = { k: 'imprime', cls: 'fond-blanc lumiere', o: { mode: 'imprime', c: 'bleu' } }, occupe = false, encore = false, delai = 0;
    const MODES = [{ label: 'Encre sur papier', k: 'imprime', cls: 'fond-blanc lumiere', o: { mode: 'imprime', c: 'bleu' } }, { label: 'Pierre sur le bleu', k: 'bleu', cls: 'fond-bleu lumiere', o: { fond: 'bleu' } }, { label: 'Pierre, le soir', k: 'cave', cls: 'fond-cave lumiere', o: { fond: 'cave' } }];
    const controle = (t) => { const mots = A.sansCrochets(t).trim().split(/\s+/).filter((m) => /[A-ZÀ-Ü0-9]/i.test(m)), parMot = t.trim().split(/\s+/).map((w) => (w.match(/\[[^\]]*\]/g) || []).join('').replace(/[[\]]/g, '').length), nv = parMot.reduce((a, b) => a + b, 0);
      const L = [[/\.\s*$/.test(t), 'Un point à la fin.'], [nv > 0, nv > 0 ? `${nv} verre${nv > 1 ? 's' : ''} dans le titre.` : 'Aucun U ni V : la phrase prend son verre dans un autre mot, ou le symbole l’accompagne.'],
        [parMot.every((n) => n <= 2), 'Un ou deux verres par mot.'], [null, `${mots.length} mot${mots.length > 1 ? 's' : ''}. La voix en compte trois, et un point.`]];
      $('#r-controle').innerHTML = L.map(([ok, s]) => `<span class="${ok === null ? '' : ok ? 'gd-ok' : 'gd-non'}">${s}</span>`).join(''); };
    const dessiner = async () => {
      if (occupe) { encore = true; return; } occupe = true; vu.setAttribute('aria-busy', 'true');
      await V.pret(); await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
      const brut = txt.value.trim() || 'Du jus.', t = auto(brut), a = +ang.value, sc = $('.gd-remp-scene', vu);
      $('#r-code').textContent = t; controle(t);
      const W = sc.clientWidth - 24, H = Math.max(200, sc.clientHeight - 40), w100 = mesureLigne(t) / 100, rad = (Math.abs(a) * Math.PI) / 180;
      const taille = Math.round(borne(Math.min(W / (w100 * Math.cos(rad) + 1.3 * Math.sin(rad)), H / (w100 * Math.sin(rad) + 1.3 * Math.cos(rad))), 24, 150));
      const r = V.rendre(cv, { texte: t, taille, angle: a, jus, ...mode.o });
      cv.style.margin = '0'; cv.dataset.cl = r.cl.toFixed(2); cv.dataset.angle = String(a); cv.dataset.texte = t; cv.dataset.verres = String(r.poches.length);
      const cl = V.cl(r.cl), nv = r.cl / V.VERRE_CL;
      $('#r-cl').textContent = cl;
      $('#r-mes').innerHTML = r.poches.length ? `Ce titre tient ${cl}, soit ${fr(nv, 2)} verre${nv >= 2 ? 's' : ''} de dégustation.${a ? ` Penché de ${Math.abs(a)}°, chaque verre perd ce qui dépasse de son bord le plus bas.` : ''}` : 'Rien ne tient : aucun verre dans ce titre.';
      cv.setAttribute('aria-label', `Le titre « ${A.sansCrochets(t)} », ${a ? `penché de ${Math.abs(a)} degrés, ` : ''}rempli : il tient ${cl}.`);
      vu.className = 'gd-remp-vu ' + mode.cls; vu.setAttribute('aria-busy', 'false'); occupe = false;
      if (encore) { encore = false; dessiner(); }
    };
    choix('#r-jus', [{ label: `<i style="background:${C.maceration}"></i>Macération`, j: ['maceration'] }, { label: `<i style="background:${C.glou}"></i>Glou`, j: ['glou'] }, { label: `<i style="background:${C.paille}"></i>Paille`, j: ['paille'] }, { label: 'Les trois', j: J }], (it) => { jus = it.j; if (remplir) dessiner(); });
    choix('#r-mode', MODES, (it) => { mode = it; if (remplir) dessiner(); });
    txt.addEventListener('input', () => { clearTimeout(delai); delai = setTimeout(dessiner, 220); });
    ang.addEventListener('input', () => { const a = +ang.value; $('#r-angle-o').textContent = a + '°'; ang.setAttribute('aria-valuetext', `${a} degrés`); dessiner(); });
    $('#r-copier').addEventListener('click', () => copier($('#r-code').textContent, 'Le titre est copié, avec ses crochets'));
    remplir = (t) => { txt.value = t; dessiner(); };
    dessiner();
    /* les trois règles, les styles, la largeur, les titres prêts, les nombres */
    $('#regles3').innerHTML = [['U, V et Û deviennent des verres.', `Larges à 150${NB}%, remplis d’un jus. Les autres lettres restent serrées à 62,5${NB}%.`], ['Un ou deux verres par mot.', 'Un mot sans U ni V reste serré, sans verre : la phrase prend son verre dans un autre mot. On n’invente pas de verre dans une autre lettre.'], ['Trois mots, un point.', 'Une phrase de comptoir, avec « on ». Toujours un point à la fin.']]
      .map(([a, b], i) => `<div><span class="gd-num">${i + 1}</span><div><h3 class="gd-h3">${a}</h3><p>${b}</p></div></div>`).join('');
    $('#styles').innerHTML = [['Titre', `Anybody 900 · capitales · 62,5${NB}% · verres à 150${NB}%`, A.titre('TROIS BO[U]TEILLES PAR MOIS.', { taille: etroit() ? 30 : 46 })],
      ['Sous-titre et voix', `Anybody 800 · largeur 100${NB}% · bas de casse`, '<span class="t-sous" style="font-size:30px">Non filtré. Nous non plus.</span>'],
      ['Texte', 'Hanken Grotesk 400 et 500', '<p class="t-txt" style="font-size:18px;color:var(--cave)">Une cave à vins nature, une dégustation le jeudi soir, trois bouteilles par mois.</p>'],
      ['Mention', `Anybody 600 · 75${NB}% · capitales espacées`, `<span class="t-etq" style="font-size:14px">Contenance 75${NB}cl · 12${NB}%${NB}vol. · Non filtré</span>`]]
      .map(([n, s, ex]) => `<div class="gd-style"><div class="gd-style-t t-etq"><span><b>${n}</b></span><span>${s}</span></div><div class="gd-style-ex">${ex}</div></div>`).join('');
    const lv = $('#larg-vu'), lr = $('#larg'); const larg = () => { const v = +lr.value; lv.style.fontStretch = v + '%'; $('#larg-o').textContent = fr(v, v % 1 ? 1 : 0) + NB + '%'; lr.setAttribute('aria-valuetext', `${fr(v, v % 1 ? 1 : 0)} pour cent`); };
    lr.addEventListener('input', larg); larg();
    $('#prets-l').innerHTML = Object.keys(A.PHRASES).map((k, i) => `<button type="button" class="gd-pret gd-papier" data-k="${k}" aria-label="Verser « ${A.sansCrochets(A.PHRASES[k])} » dans le remplisseur">${cvs(A.PHRASES[k], { taille: 26, mode: 'imprime', c: 'bleu', jus: [J[i % 3], J[(i + 1) % 3]].join(',') })}</button>`).join('');
    $$('#prets-l button').forEach((b) => b.addEventListener('click', () => { remplir(A.PHRASES[b.dataset.k]); $('#remplisseur').scrollIntoView({ behavior: calme ? 'auto' : 'smooth' }); txt.focus({ preventScroll: true }); }));
    rendre($('#prets-l'));
    $('#nombres-l').innerHTML = [[`75${NB}cl ${A.deg(12)}`, 'Sur une contre-étiquette', 'Les deux gros chiffres. Le degré d’un vin de soif est aussi sa pente : le signe ° se garde. Ou « 12,5 cl 12° ».'],
      [`12${NB}%${NB}vol.`, 'Dans une ligne ou un tableau', 'L’étiquette de face, la carte du jeudi, le Plein du mois : « 12 % vol. » ou « 12 % ».'],
      [`12,5${NB}cl`, 'Partout', 'Les nombres à la virgule, une espace insécable avant l’unité, les apostrophes courbes, « on » plutôt que « nous ».']]
      .map(([g, t, p]) => `<div class="gd-papier"><span class="gd-grand">${g}</span><span class="t-etq" style="color:${C.bleu}">${t}</span><p>${p}</p></div>`).join('');
  };

  /* =================================================================== 05 · Le kit */
  INIT.kit = () => {
    V.pret().then(() => V.rendre($('#kit-tete'), { texte: 'GLO[U].', taille: etroit() ? 64 : 92, angle: -A.DEGRE, jus: 'glou', fond: 'bleu' }));
    const el = (n, nom, chez, vient, socle, regle, demo, fond) => `<div class="gd-el gd-el${n} ${fond} lumiere"><div class="gd-el-vu">${demo}</div><div class="gd-el-txt"><span class="t-etq"><span class="gd-num">${n}</span>${socle}</span><h3 class="gd-h3">${nom}</h3><p>${chez}</p><p class="gd-note" style="color:inherit;opacity:.85">D’où ça vient : ${vient}</p><p class="gd-el-r"><b>Règle.</b> ${regle}</p></div></div>`;
    $('#bento').innerHTML = [
      el(1, 'Le creux rempli', 'Le verre que forment les deux L soudés, penché, son vin horizontal.', 'un sillon vu en coupe.', '<code>Marque.verre · service</code>', 'Puce, motif, avatar. Les verres penchent chacun à leur façon, toutes les surfaces sont horizontales.', A.service({ w: 300, h: 140, cols: 5, rangs: 2, c: C.tuffeau, attrs: 'style="width:100%;max-width:300px;height:auto"' }), 'fond-bleu'),
      el(2, 'Les trois jus', 'Macération, trouble avec son dépôt ; glou, limpide ; paille, il perle. Du disque à la lie.', 'les vraies robes du vin nature.', '<code>Marque.JUS · ECHELLES</code>', 'Un jus n’existe que dans un creux. Jamais en texte.', cvs('[U][U][U]', { taille: 54, jus: J.join(','), p: 0.84, inter: 0.05, fond: 'cave' }), 'fond-cave'),
      el(3, 'La voix à verres', 'Capitales serrées à 62,5 %, verres (U, V) larges à 150 %. Des phrases de comptoir sur les objets.', 'le mot devient un rang de verres.', '<code>Verse.rendre · Marque.VOIX</code>', 'Un ou deux verres par mot. Trois mots, un point.', cvs('D[U] J[U]S.', { taille: 46, mode: 'imprime', c: 'bleu', jus: 'paille,glou' }), 'fond-blanc'),
      el(4, 'Douze degrés', 'Tout penche de 12°, le vin jamais.', 'le degré d’un vin de soif.', '<code>Marque.DEGRE · penche · cadre</code>', 'Un mot, un logo, un cadre : ±12°. On tourne, on ne cisaille pas.', `<div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;justify-content:center">${cvs('GLO[U].', { taille: 32, angle: -12 })}${cvs('GLO[U].', { taille: 32, angle: 12, jus: 'paille' })}</div>`, 'fond-bleu'),
      el(5, 'La contre-étiquette', 'Le petit papier du dos d’une bouteille : nom, lot, mentions, deux gros chiffres.', 'l’étiquette arrière.', '<code>Marque.contre · .ce</code>', 'Une par pièce, toujours droite. Elle mesure aussi les photos et porte la mention sanitaire.', A.contre({ sujet: 'Le Plein', lignes: [['Bouteilles', '3 par mois']], grands: [`75${NB}cl`, A.deg(12)], l: 240 }), 'fond-tuffeau'),
      el(6, 'L’image à niveau', 'Une photo se remplit d’un jus jusqu’à une ligne horizontale. Ou elle devient le vin d’un creux.', 'le niveau dans le verre.', '<code>Marque.photo · cadre</code>', 'La ligne ne penche jamais, même dans un cadre penché.', `<div style="display:flex;gap:14px;align-items:center">${A.photo('trois-jus', { mode: 'niveau', niveau: 0.5, jus: 'paille', style: 'width:150px;height:140px' })}${A.cadre('caviste', { l: 92, h: 120, mode: 'niveau', jus: 'glou', niveau: 0.45 })}</div>`, 'fond-cave'),
    ].join('');
    rendre($('#bento'));
    abecedaire();
    /* le service */
    let graine = 1;
    const servir = () => { const cv = $('#service-cv'), vu = $('#service-vu'), w = Math.min(760, vu.clientWidth - 36), h = Math.round(w * (etroit() ? 0.62 : 0.46)), R = A.rnd(graine * 131 + 7), mem = {};
      const de = (i, j) => (mem[i + ',' + j] || (mem[i + ',' + j] = { a: (R() * 2 - 1) * A.DEGRE, n: 0.35 + R() * 0.55, j: J[Math.floor(R() * 3)] }));
      V.pret().then(() => { V.verres(cv, { w, h, cols: etroit() ? 4 : 6, rangs: 3, marge: 10, fond: 'bleu', angle: (i, j) => de(i, j).a, niveau: (i, j) => de(i, j).n, jus: (i, j) => de(i, j).j });
        cv.style.margin = '0'; cv.dataset.graine = String(graine); $('#servi').textContent = graine > 1 ? `Service n° ${graine}` : ''; }); };
    $('#servir').addEventListener('click', () => { graine++; servir(); }); servir();
    /* la pente : quatre paires */
    const ceMini = (rot) => `<div style="zoom:.62;transform:rotate(${rot}deg)">${A.contre({ sujet: 'Dégustation', lignes: [['Le jus', 'Glou']], grands: [`12,5${NB}cl`, A.deg(12)], jus: 'glou', l: 236 })}</div>`;
    const paires = [
      ['On tourne le mot. On ne le cisaille pas : le vin y pencherait.', cvs('GLO[U].', { taille: 40, angle: -12, mode: 'imprime', c: 'bleu' }), `<div style="transform:skewY(-12deg)">${cvs('GLO[U].', { taille: 40, angle: 0, mode: 'imprime', c: 'bleu' })}</div>`],
      ['12 degrés, dans un sens ou dans l’autre. Pas plus.', cvs('GLO[U].', { taille: 40, angle: 12, mode: 'imprime', c: 'bleu', jus: 'glou' }), cvs('GLO[U].', { taille: 32, angle: 30, mode: 'imprime', c: 'bleu', jus: 'glou' })],
      ['La contre-étiquette reste droite, même quand tout penche.', ceMini(0), ceMini(12)],
      ['La ligne d’une photo ne penche jamais, même dans un cadre penché.', A.cadre('verre-penche', { l: 104, h: 132, mode: 'niveau', niveau: 0.5 }), `<div class="cadre" style="width:104px;height:132px;transform:rotate(12deg)">${A.photo('verre-penche', { mode: 'niveau', niveau: 0.5, style: 'position:absolute;inset:0' })}</div>`],
    ];
    $('#paires-pente').innerHTML = paireHTML(paires, 5); rendre($('#paires-pente'));
    $('#ce-vu').innerHTML = A.contre({ lot: '05', sujet: 'Le kit', lignes: [['Le jus', 'Macération'], ['Contenance', 'un verre']], grands: [`12,5${NB}cl`, A.deg(12)], voix: A.VOIX.carte, sanitaire: true, l: 262 });
    $('#ce-l').innerHTML = ['La tête : le nom, et le lieu ou le numéro du lot.', 'Le sujet de la pièce.', 'Les mentions, une par ligne : une étiquette et sa valeur.', 'Les deux gros chiffres, la contenance et le degré, et le verre.', 'Une phrase de la voix.', 'La mention sanitaire, sur toute publicité.']
      .map((t, i) => `<div><span class="gd-num">${i + 1}</span><span>${t}</span></div>`).join('');
  };
  /* L'abécédaire : chaque lettre dit ce qu'elle tient */
  const FERMEES = 'ABDOPQR';
  const abecedaire = () => {
    const vu = $('#abc-vu'), rangs = etroit() ? ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXYZ'] : ['ABCDEFG', 'HIJKLMN', 'OPQRSTU', 'VWXYZ'];
    const avail = vu.clientWidth - 2 * parseFloat(getComputedStyle(vu).paddingLeft), o = { serre: 'normal', inter: 0.06 };
    vu.innerHTML = rangs.map((r, i) => `<div class="gd-abc-rang" data-r="${i}"><canvas></canvas></div>`).join('');
    const LET = {}; let tot = 0;
    V.pret().then(() => {
      const taille = Math.round(borne(Math.min(...rangs.map((r) => (avail - 8) / (mesureLigne(r, o) / 100))), 26, 84));
      rangs.forEach((r, i) => { const box = $(`[data-r="${i}"]`, vu), cv = $('canvas', box);
        const res = V.rendre(cv, { texte: r, taille, tout: true, ...o, jus: [J[i % 3], J[(i + 1) % 3], J[(i + 2) % 3]], mode: 'imprime', c: 'bleu' });
        res.lettres.forEach((g, k) => { LET[g.ch] = { cl: 0, x: g.x, l: g.l }; });
        res.poches.forEach((q) => { const ch = res.lettres[q.i].ch; LET[ch].cl += q.cl || 0; tot += q.cl || 0; });
        box.insertAdjacentHTML('beforeend', res.lettres.map((g) => `<button type="button" data-l="${g.ch}" aria-pressed="false" style="left:${g.x}px;width:${g.l}px" aria-label="${g.ch} : ${LET[g.ch].cl > 0.05 ? 'tient ' + V.cl(LET[g.ch].cl) : 'ne tient rien'}"></button>`).join(''));
      });
      const dire = (ch) => { const L = LET[ch]; $$('button', vu).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.l === ch)));
        $('#abc-l').textContent = ch; const plein = L.cl > 0.05;
        $('#abc-cl').textContent = plein ? V.cl(L.cl) : `0${NB}cl`;
        $('#abc-dit').textContent = plein ? (ch === 'U' ? 'Pleine à ras bord. Élargie à 150 %, comme dans un titre, elle fait un verre de dégustation : 12,5 cl.' : `Ce que la lettre tient, à ras bord, mesuré par le moteur : ${fr(L.cl / V.VERRE_CL, 2)} verre.`)
          : FERMEES.includes(ch) ? 'Sa contre-forme est fermée : une bouteille bouchée ne se remplit pas.' : 'Aucun creux ouvert vers le haut : rien ne tient.';
        vu.dataset.lettre = ch; vu.dataset.cl = L.cl.toFixed(2); };
      $$('button', vu).forEach((b) => b.addEventListener('click', () => dire(b.dataset.l)));
      $('#abc-tot').innerHTML = `<b>${V.cl(tot)}</b><br>L’alphabet entier, à cette largeur : ${fr(tot / V.VERRE_CL, 1)} verres de dégustation.`;
      dire('U'); vu.dataset.pret = '1';
    });
  };

  /* =================================================================== 06 · L'image */
  INIT.image = () => {
    const NOMS = Object.keys(A.PHOTOS), vu = $('#niv-vu'), nr = $('#niv-n');
    const st = { nom: 'verre-penche', mode: 'niveau', jus: 'maceration', niveau: 0.5, angle: 0 };
    /* « comptoir » : l'ouvre-bouteille, en bas à gauche, reste hors champ (cadre étroit, calé à droite) */
    const POS = { comptoir: '86% 45%' };
    const dessiner = () => { const P = A.PHOTOS[st.nom], W = vu.clientWidth - (etroit() ? 40 : 90), H = (etroit() ? 420 : 560) - 70;
      let r = P.ratio; if (st.nom === 'comptoir') r = Math.min(r, 0.8);
      let l = W, h = l / r; if (h > H) { h = H; l = h * r; } if (st.angle) { l *= 0.82; h *= 0.82; }
      const o = { mode: st.mode, jus: st.jus, niveau: st.niveau, pos: POS[st.nom] };
      vu.innerHTML = (st.angle ? A.cadre(st.nom, { ...o, l: Math.round(l), h: Math.round(h), angle: st.angle }) : A.photo(st.nom, { ...o, style: `width:${Math.round(l)}px;height:${Math.round(h)}px` })) +
        `<span class="gd-niv-cote t-etq">${st.mode === 'niveau' ? `Niveau ${Math.round(st.niveau * 100)}${NB}% · la ligne ${A.deg(0)}` : st.mode === 'robe' ? 'En robe : du bleu au tuffeau' : 'Brut, avec son grain'}${st.angle ? ` · le cadre ${A.deg(st.angle)}` : ''}</span>`;
      vu.dataset.photo = st.nom; vu.dataset.mode = st.mode;
      vu.setAttribute('aria-label', `${P.quoi} ${st.mode === 'niveau' ? `Remplie de ${N[st.jus].toLowerCase()} jusqu’à ${Math.round(st.niveau * 100)} %.` : ''}${st.angle ? ' Dans un cadre penché de 12 degrés ; la photo reste d’aplomb.' : ''}`);
      $('#niv-jus-z').hidden = $('#niv-z').hidden = st.mode !== 'niveau'; };
    const niveau = (n) => { st.niveau = borne(n, 0, 1); const t = `top:${Math.round((1 - st.niveau) * 1000) / 10}%`;
      $$('.nj,.nl,.ph-cote', vu).forEach((e) => { e.style.top = Math.round((1 - st.niveau) * 1000) / 10 + '%'; });
      const c = $('.gd-niv-cote', vu); if (c && st.mode === 'niveau') c.innerHTML = `Niveau ${Math.round(st.niveau * 100)}${NB}% · la ligne ${A.deg(0)}${st.angle ? ` · le cadre ${A.deg(st.angle)}` : ''}`;
      nr.value = String(Math.round(st.niveau * 100)); $('#niv-o').textContent = nr.value + NB + '%'; nr.setAttribute('aria-valuetext', `${nr.value} pour cent`); return t; };
    $('#niv-photos').innerHTML = NOMS.map((n) => `<button type="button" data-n="${n}" aria-pressed="${n === st.nom}" aria-label="${esc(A.PHOTOS[n].quoi)}"><img src="${A.photoURL(n)}" alt="" loading="lazy" style="object-position:${POS[n] || A.PHOTOS[n].pos}"></button>`).join('');
    $$('#niv-photos button').forEach((b) => b.addEventListener('click', () => { st.nom = b.dataset.n; $$('#niv-photos button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); dessiner(); }));
    choix('#niv-mode', [{ label: 'À niveau', m: 'niveau' }, { label: 'Brut', m: 'brut' }, { label: 'En robe', m: 'robe' }], (it) => { st.mode = it.m; dessiner(); });
    choix('#niv-jus', J.map((k) => ({ label: `<i style="background:${C[k]}"></i>${N[k]}`, k })), (it) => { st.jus = it.k; dessiner(); });
    choix('#niv-cadre', [{ label: 'Droit', a: 0 }, { label: `Penché de 12°`, a: A.DEGRE }], (it) => { st.angle = it.a; dessiner(); });
    nr.addEventListener('input', () => niveau(+nr.value / 100));
    let tire = false;
    const depuis = (e) => { const ph = $('.ph', vu); if (!ph || st.mode !== 'niveau') return; const r = ph.getBoundingClientRect(); niveau(1 - (e.clientY - r.top) / r.height); };
    vu.addEventListener('pointerdown', (e) => { if (st.mode !== 'niveau') return; tire = true; vu.setPointerCapture(e.pointerId); depuis(e); });
    vu.addEventListener('pointermove', (e) => { if (tire) depuis(e); });
    vu.addEventListener('pointerup', () => { tire = false; }); vu.addEventListener('pointercancel', () => { tire = false; });
    $('#douze').innerHTML = NOMS.map((n) => `<figure>${A.photo(n, { pos: POS[n] })}<figcaption><b>${n}</b>${esc(A.PHOTOS[n].quoi.replace(/ ?:? ?Pour y coller des affiches\.?/, '.'))}</figcaption></figure>`).join('');
    const H3 = [['12-le-dos-de-la-veste', 'Le dos de la veste, brodé en deux fils : la phrase, et le vin en points horizontaux.'], ['13-le-sac', 'Le sac en toile, sérigraphié : une encre et un jus, le cadre penché de 12°.'], ['09-les-trois-jus', 'Les trois bouteilles : étiquette et contre-étiquette collées sur le verre, ses ombres et ses éclats repris.']];
    $('#habille').innerHTML = H3.map(([f, t]) => `<figure><div class="gd-im"><img src="media/vignettes/${f}.jpg" alt="" loading="lazy"></div><figcaption>${t}</figcaption></figure>`).join('');
    dessiner();
  };

  /* =================================================================== 07 · Le mouvement */
  INIT.mouvement = () => {
    const G = [{ id: 'verse', titre: 'On verse', dit: 'Le niveau monte, de vide aux deux tiers.', duree: 900,
        image: (e, petit) => A.verre({ taille: petit ? 46 : 180, niveau: Math.max(0.004, A.NIVEAU * e), c: C.tuffeau, jus: 'maceration', detail: true }) },
      { id: 'bascule', titre: 'Le mot bascule', dit: 'De droit à 12°. La surface reste horizontale.', duree: 600,
        image: (e, petit) => A.penche(C.tuffeau, { angle: -A.DEGRE * e, jus: 'maceration', attrs: `style="width:${petit ? (etroit() ? 52 : 74) : etroit() ? 280 : 420}px;max-width:100%;height:auto"` }) }];
    if (calme) $('#gestes-intro').textContent = 'Le mouvement est réduit sur cet appareil : chaque geste est montré en cinq étapes, de 0 à la fin de sa durée. La courbe est celle du socle, Marque.ease.';
    $('#gestes-l').innerHTML = G.map((g) => `<div class="gd-geste gd-panneau fond-bleu lumiere"><div class="gd-geste-vu" id="g-${g.id}-vu" role="img" aria-label="${g.titre} : ${g.dit}"></div>
      <div class="gd-geste-pied"><div><h3 class="gd-h3">${g.titre} · ${fr(g.duree / 1000, 1)}${NB}s</h3><p class="gd-note">${g.dit}</p></div>${calme ? '' : `<button class="gd-bt gd-petit" type="button" id="g-${g.id}">Rejouer</button>`}
      <div class="gd-chrono"><i id="g-${g.id}-t"></i><span style="left:0">0${NB}s</span><span style="right:0">${fr(g.duree / 1000, 1)}${NB}s</span></div></div></div>`).join('');
    G.forEach((g) => { const vu = $(`#g-${g.id}-vu`), barre = $(`#g-${g.id}-t`);
      if (calme) { vu.innerHTML = `<div class="gd-pellicule">${[0, 0.25, 0.5, 0.75, 1].map((t) => `<div><div style="height:120px;display:grid;place-items:center">${g.image(A.ease(t), true)}</div><span class="t-etq">${fr(g.duree * t / 1000, 2)}${NB}s</span></div>`).join('')}</div>`; barre.style.width = '100%'; vu.dataset.fini = '1'; return; }
      let t0 = 0, id = 0;
      const pas = (t) => { const x = borne((t - t0) / g.duree, 0, 1); vu.innerHTML = g.image(A.ease(x)); barre.style.width = x * 100 + '%'; if (x < 1) id = requestAnimationFrame(pas); else vu.dataset.fini = '1'; };
      const jouer = () => { cancelAnimationFrame(id); vu.dataset.fini = '0'; t0 = performance.now(); id = requestAnimationFrame(pas); };
      $(`#g-${g.id}`).addEventListener('click', jouer); vu.innerHTML = g.image(0); setTimeout(jouer, 350);
    });
    /* les vidéos */
    const ORDRE = [['36-le-film', 'gd-f6'], ['17-story-du-jeudi', 'gd-f2'], ['18-story-du-plein', 'gd-f2'], ['19-story-arrivage', 'gd-f2'], ['03-le-logo-se-remplit', 'gd-f3'], ['35-l-abecedaire', 'gd-f3'], ['31-la-phrase-bascule', 'gd-f3'], ['32-ca-penche-ca-tient', 'gd-f3']];
    $('#films').innerHTML = ORDRE.filter(([n]) => F.videos[n]).map(([n, c]) => { const v = F.videos[n];
      return `<figure class="gd-film ${c}"><video data-src="media/${n}.mp4" poster="media/vignettes/${n}.jpg" muted loop playsinline preload="none" width="${v.l}" height="${v.h}" aria-label="${esc(v.titre)}"></video><figcaption><span>${esc(v.titre)}</span><span>${fr(v.duree, 0)}${NB}s · ${v.l}${NB}×${NB}${v.h}</span></figcaption></figure>`; }).join('');
    if (calme) $('#videos-intro').textContent = 'Le mouvement est réduit sur cet appareil : les vidéos ne partent pas seules. Lancez-les avec leurs commandes.';
    brancherVideos($('#films'));
  };

  /* =================================================================== 08 · En situation : galerie et visionneuse */
  const G = (Array.isArray(window.GuideGalerie) ? window.GuideGalerie : []).map((m) => ({ ...m, v: /\.mp4$/i.test(m.f), stem: m.f.replace(/\.[^.]+$/, '') }));
  INIT.situation = () => {
    const SECTIONS = [...new Set(G.map((m) => m.s))];
    let filtre = null, liste = G;
    const dessinerGal = () => { liste = filtre ? G.filter((m) => m.s === filtre) : G;
      $('#gal').innerHTML = liste.map((m, i) => `<button type="button" data-i="${i}" aria-label="Agrandir : ${esc(m.t)}${m.v ? ' (vidéo)' : ''}"><img src="media/vignettes/${m.stem}.jpg" alt="" loading="lazy" width="${m.v ? 960 : 720}" height="${Math.round((m.v ? 960 : 720) * m.h / m.l)}">${m.v ? `<span class="gd-gal-play" aria-hidden="true"><svg viewBox="0 0 12 12" width="12" height="12"><path d="M3 1.5v9l7.5-4.5z" fill="currentColor"/></svg></span>` : ''}<span class="gd-gal-leg"><i>${esc(m.s)}${m.v ? ' · vidéo' : ''}</i>${esc(m.t)}</span></button>`).join('');
      $$('#gal button').forEach((b) => b.addEventListener('click', () => ouvrirLb(liste, +b.dataset.i))); };
    choix('#filters', [{ label: `Tout <span>${G.length}</span>`, s: null }].concat(SECTIONS.map((s) => ({ label: `${esc(s)} <span>${G.filter((m) => m.s === s).length}</span>`, s }))), (f) => { filtre = f.s; dessinerGal(); });
    $('#voir-etude').textContent = `${G.length} pièces, dont ${G.filter((m) => m.v).length} vidéos, l’une sous l’autre.`;
    $('#voir-fiche').textContent = `${NPAGES} pages à feuilleter, et le PDF.`;
  };
  const lb = $('#lb'); let lbL = [], lbI = 0, lbRetour = null;
  const dessinerLb = () => { const m = lbL[lbI];
    $('#lb-m').innerHTML = m.v ? `<video src="media/${m.f}" ${calme ? '' : 'autoplay '}loop muted playsinline controls aria-label="${esc(m.t)}"></video>` : `<img src="media/${m.f}" alt="${esc(m.t)}">`;
    $('#lb-leg').textContent = m.t; $('#lb-n').textContent = lbL.length > 1 ? `${pad(lbI + 1)} / ${pad(lbL.length)}` : '';
    $('#lb-prec').hidden = $('#lb-suiv').hidden = lbL.length < 2; };
  function ouvrirLb(l, i) { if (!l.length) return; lbRetour = document.activeElement; lbL = l; lbI = Math.max(0, i);
    lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; dessinerLb(); $('#lb-fermer').focus(); }
  const fermerLb = () => { lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); $('#lb-m').innerHTML = ''; document.body.style.overflow = ''; if (lbRetour) lbRetour.focus(); };
  const pasLb = (d) => { lbI = (lbI + d + lbL.length) % lbL.length; dessinerLb(); };
  $('#lb-prec').addEventListener('click', () => pasLb(-1)); $('#lb-suiv').addEventListener('click', () => pasLb(1)); $('#lb-fermer').addEventListener('click', fermerLb);
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.id === 'lb-m') fermerLb(); });
  document.addEventListener('keydown', (e) => { if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') fermerLb(); else if (e.key === 'ArrowLeft') pasLb(-1); else if (e.key === 'ArrowRight') pasLb(1);
    else if (e.key === 'Tab') { const f = $$('button:not([hidden]), video', lb); const i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); } });

  /* =================================================================== 09 · Faire une annonce */
  INIT.annonce = () => {
    const M = [{ k: 'jeudi', n: '21', label: 'Le jeudi', quand: 'Chaque semaine, la dégustation.', change: 'La phrase et le jus du soir.' },
      { k: 'plein', n: '22', label: 'Le Plein du mois', quand: 'Chaque mois, l’abonnement.', change: 'Le mois et les trois jus.' },
      { k: 'arrivage', n: '23', label: 'Un arrivage', quand: 'Un jus qui vient d’arriver.', change: 'La photo et le jus.' },
      { k: 'phrase', n: '24', label: 'Une phrase', quand: 'Une phrase de comptoir, seule.', change: 'La phrase, et l’endroit où elle est écrite.' }];
    const FMT = [{ k: '4x5', label: 'Publication 4:5', l: 1080, h: 1350, z: [64, 64, 64] }, { k: '9x16', label: 'Story 9:16', l: 1080, h: 1920, z: [250, 340, 64] }];
    const st = { m: M[0], f: FMT[0], v: 'a' }, img = $('#md-img'), cadre = $('#md-cadre'), zone = $('#md-zone');
    const montrerM = () => { const nom = `${st.m.n}-${st.m.k}-${st.f.k}-${st.v}`, ok = (F.reseaux.liste || []).includes(nom);
      const maxH = etroit() ? 440 : 600, maxW = $('.gd-modele-vu').clientWidth - 48, w = Math.round(Math.min(maxW, (maxH * st.f.l) / st.f.h));
      img.width = w; img.height = Math.round((w * st.f.h) / st.f.l); img.src = `media/reseaux/${nom}.jpg`; img.dataset.nom = nom;
      img.alt = `Le modèle « ${st.m.label} », ${st.f.label}, variante ${st.v.toUpperCase()}.`;
      const [haut, bas, cote] = st.f.z, px = (v, t) => (v / t) * 100 + '%';
      zone.innerHTML = `<i style="left:0;right:0;top:0;height:${px(haut, st.f.h)}"></i><i style="left:0;right:0;bottom:0;height:${px(bas, st.f.h)}"></i><i style="left:0;width:${px(cote, st.f.l)};top:${px(haut, st.f.h)};bottom:${px(bas, st.f.h)}"></i><i style="right:0;width:${px(cote, st.f.l)};top:${px(haut, st.f.h)};bottom:${px(bas, st.f.h)}"></i><b style="left:${px(cote, st.f.l)};right:${px(cote, st.f.l)};top:${px(haut, st.f.h)};bottom:${px(bas, st.f.h)}"></b>`;
      $('#md-titre').textContent = st.m.label;
      $('#md-dl').innerHTML = [['Quand', st.m.quand], ['On change', st.m.change], ['Ce qui reste', 'La mise en page, le verre, la contre-étiquette et sa mention sanitaire.'], ['Le fichier', `${st.f.l} × ${st.f.h} px · ${st.f.label}${ok ? '' : ' · absent'}`]]
        .map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
      cadre.style.borderRadius = st.f.k === '9x16' ? '18px' : '6px'; };
    choix('#md-m', M, (it) => { st.m = it; montrerM(); });
    choix('#md-f', FMT, (it) => { st.f = it; montrerM(); });
    choix('#md-v', ['a', 'b', 'c'].map((v) => ({ label: 'Variante ' + v.toUpperCase(), v })), (it) => { st.v = it.v; montrerM(); });
    $('#md-zone-bt').addEventListener('click', (e) => { const on = !zone.classList.contains('gd-on'); zone.classList.toggle('gd-on', on); e.currentTarget.setAttribute('aria-pressed', String(on)); });
    $('#mention-ce').innerHTML = A.contre({ sujet: 'Dégustation au verre', lignes: [['Le jus du soir', 'Macération']], grands: [`12,5${NB}cl`, A.deg(12)], voix: A.VOIX.carte, sanitaire: true, l: 300 });
    $('#mention-t').textContent = A.MENTION_SANITAIRE;
    $('#cases').innerHTML = ['La phrase est relue et validée par le fondateur.', 'La phrase a été relue au regard de la loi Évin.', 'La contre-étiquette est là, avec la mention sanitaire, en 22 px au moins.', 'Rien d’important hors de la zone sûre.', 'Aucune adresse, aucun prix, aucun horaire inventés.', 'Le jus annoncé est bien celui du soir, ou du mois.']
      .map((t, i) => `<label><input type="checkbox" id="case-${i}"><span>${t}</span></label>`).join('');
  };

  /* =================================================================== 10 · Ressources */
  INIT.ressources = () => {
    $('#ressources-ce').innerHTML = A.contre({ sujet: 'Les fichiers', lignes: [['Logos', `${(F.logos || {}).n || 24} SVG · ZIP`], ['Fiche de marque', `${NPAGES} pages · PDF`], ['Réseaux', `${(F.reseaux || {}).n || 24} visuels · ZIP`], ['Vidéos', `${NV} MP4`], ['Polices', 'OFL · ZIP']], grands: [`${(F.logos || {}).n || 24}${NB}SVG`, `${NV}${NB}MP4`], verre: true, l: 300 });
    const P = [
      { t: 'Les logos', p: `${(F.logos || {}).n} fichiers SVG : huit versions en trois couleurs.`, f: F.logos, vu: `<div class="fond-bleu lumiere" style="position:absolute;inset:0"></div><div style="position:relative;z-index:2;width:76%">${A.wordmark(C.tuffeau, 'style="width:100%;height:auto"', 'maceration')}</div>`, bt: 'Les logos (ZIP)' },
      { t: 'La fiche de marque', p: `${NPAGES} pages au format 16:9. Le PDF est fait d’images : le rendu est celui de l’écran, le texte ne s’y copie pas.`, f: F.pdf, vu: '<img src="deck/02.jpg" alt="" loading="lazy">', bt: 'La fiche (PDF)' },
      { t: 'Le kit pour les réseaux', p: `${(F.reseaux || {}).n} visuels en JPG : quatre modèles, deux formats, trois variantes.`, f: F.reseaux, vu: '<img src="media/reseaux/21-jeudi-4x5-b.jpg" alt="" loading="lazy" style="max-height:140px">', bt: 'Le kit (ZIP)' },
      { t: 'Les polices', p: 'Anybody et Hanken Grotesk, en version web et de bureau, avec le texte de leur licence OFL.', f: F.polices, vu: `<span style="font-family:var(--titre);font-weight:900;font-size:92px;line-height:1;color:${C.bleu}"><span style="font-stretch:62.5%">A</span><span style="font-stretch:150%">a</span></span>`, bt: 'Les polices (ZIP)' },
    ];
    $('#paquets').innerHTML = P.map((x) => `<div class="gd-fichier gd-papier"><div class="gd-fichier-vu" style="position:relative">${x.vu}</div><h3 class="gd-h3">${x.t}</h3><p>${x.p}</p><div class="gd-rang"><a class="gd-bt" href="${x.f ? x.f.f : '#'}" download>${x.bt}</a><span class="gd-note">${x.f ? mo(x.f.octets) : ''}</span></div></div>`).join('');
    const VER = [['logotype', 'Logotype', 'aplat · sous 32 px'], ['logotype-jus', 'Logotype', 'deux couleurs · 32 à 200 px'], ['logotype-grand', 'Logotype', 'détails · au-delà de 200 px'], ['penche-jus', 'Logotype penché', 'deux couleurs'],
      ['symbole', 'Symbole', 'aplat · sous 32 px'], ['symbole-jus', 'Symbole', 'deux couleurs · 32 à 200 px'], ['symbole-grand', 'Symbole', 'détails · au-delà de 200 px'], ['complet', 'Version complète', 'aplat · 120 px au moins']];
    const COUL = [['bleu', 'Lettres bleues', 'fond-tuffeau'], ['cave', 'Lettres fond de cave', 'fond-craie'], ['tuffeau', 'Lettres tuffeau', 'fond-bleu']];
    $('#logos-tete').innerHTML = '<th scope="col">Version</th>' + COUL.map(([, t]) => `<th scope="col">${t}</th>`).join('');
    $('#logos-table').innerHTML = VER.map(([v, n, d]) => `<tr><th scope="row">${n}<small>${d}</small></th>` + COUL.map(([c, , f]) => { const nom = `sillon-${v}-${c}.svg`;
      return `<td><div class="gd-cel"><span class="${f} lumiere" style="position:relative"><img src="logo/${nom}" alt="" loading="lazy" style="position:relative;z-index:2"></span><a class="gd-bt gd-creux gd-petit" href="logo/${nom}" download aria-label="Télécharger ${n}, ${d}, ${N[c]}, SVG">SVG</a></div></td>`; }).join('') + '</tr>').join('');
    const VID = Object.keys(F.videos || {});
    $('#videos-l').innerHTML = VID.map((n) => { const v = F.videos[n]; return `<div><img src="media/vignettes/${n}.jpg" alt="" loading="lazy"><span>${esc(v.titre)}</span><code>${v.l}${NB}×${NB}${v.h} · ${fr(v.duree, 0)}${NB}s · ${mo(v.octets)}</code><a class="gd-bt gd-creux gd-petit" href="media/${n}.mp4" download aria-label="Télécharger la vidéo : ${esc(v.titre)}">MP4</a></div>`; }).join('');
    $('#polices-l').innerHTML = [['Anybody', 'La voix des titres, des mentions, du logo', 'Graisse 100 à 900 · largeur 50 à 150 %', A.titre('JE[U]DI.', {}), 'assets/fonts/LICENCE-anybody.txt'],
      ['Hanken Grotesk', 'Le texte courant, le descripteur du logo', 'Graisse 100 à 900', '<span style="font-family:var(--font);font-weight:500">Du jus, sans filtre.</span>', 'assets/fonts/LICENCE-hanken-grotesk.txt']]
      .map(([n, r, a, s, lic]) => `<div class="gd-papier"><span class="t-etq" style="color:${C.bleu}">${r}</span><div class="gd-spec">${s}</div><h3 class="gd-h3">${n}</h3><p class="gd-note">${a} · licence SIL Open Font License 1.1</p><div class="gd-rang" style="margin-top:14px"><a class="gd-bt gd-creux gd-petit" href="${lic}">Lire la licence</a></div></div>`).join('');
    $$('#polices-l .t-titre').forEach((e) => { e.style.fontSize = 'inherit'; });
    const css = [':root {', '  /* Sillon — les huit couleurs */', ...Object.keys(C).map((k) => `  --${k}: ${C[k]}; /* ${N[k]} */`), '', '  /* les échelles : du plus sombre au plus clair pour le bleu, du disque à la lie pour les jus */',
      ...Object.keys(A.ECHELLES).map((k) => '  ' + A.ECHELLES[k].map((h, i) => `--${k}-${i + 1}: ${h};`).join(' ')), '', '  /* les polices */', '  --titre: "Anybody", system-ui, sans-serif;', '  --font: "Hanken Grotesk", system-ui, sans-serif;', '}'].join('\n');
    $('#css-vars').textContent = css;
    $('#css-copier').addEventListener('click', () => copier(css, 'Les variables CSS sont copiées'));
  };

  /* =================================================================== Tests des éléments vivants (tools/check_inter.mjs) */
  const lit = () => navigator.clipboard.readText();
  window.GuideTests = [
    { nom: 'logo : le fond « un jus » donne l’aplat fond de cave et son fichier', page: 'versions', capture: '#stage', actions: [{ clic: '#stage-sw button:nth-child(4)' }],
      verifie: () => $('#stage').dataset.fond === 'maceration' && $('#stage a[download]').getAttribute('href') === 'logo/sillon-logotype-cave.svg' && !!$('#stage [data-v="penche"] code') },
    { nom: 'logo : fond au clavier (flèche droite)', page: 'versions', actions: [{ touche: 'ArrowRight', sur: '#stage-sw button:nth-child(1)' }],
      verifie: () => $('#stage').dataset.fond === 'tuffeau' && document.activeElement === $('#stage-sw button:nth-child(2)') && !$('#lettres-z').hidden },
    { nom: 'logo : lettres fond de cave sur la craie', page: 'versions', actions: [{ clic: '#stage-sw button:nth-child(3)' }, { clic: '#lettres-sw button:nth-child(2)' }],
      verifie: () => $('#stage').dataset.lettres === 'cave' && $('#stage a[download]').getAttribute('href') === 'logo/sillon-logotype-jus-cave.svg' },
    { nom: 'logo penché : le curseur règle l’angle', page: 'penche', capture: '#penche-vu', actions: [{ remplir: '#penche-a', valeur: '6' }],
      verifie: () => $('#penche-vu').dataset.angle === '6' && $('#penche-o').textContent === '6°' },
    { nom: 'échelles : sous 32 px, l’aplat ; au-delà de 200 px, le grand', page: 'echelles', capture: '#ech-vu', actions: [{ remplir: '#ech-px', valeur: '20' }],
      verifie: () => $('#ech-vu').dataset.palier === '0' && $('#ech-vu').textContent.includes('sillon-symbole-bleu.svg') },
    { nom: 'couleurs : un clic copie le code', page: 'matieres', actions: [{ clic: '#surfaces button:nth-child(1)' }],
      verifie: async () => (await lit()) === C.bleu && $('#toast').textContent.includes(C.bleu) },
    { nom: 'contraste : un jus en texte est refusé', page: 'contraste', capture: '.gd-testeur', actions: [{ choisir: '#ct-texte', valeur: 'maceration' }],
      verifie: () => $('#ct-v').dataset.verdict === 'interdit' },
    { nom: 'remplisseur : « Du jus. » tient deux verres', page: 'remplisseur', capture: '#r-vu', actions: [{ remplir: '#r-txt', valeur: 'Du jus.' }, { attendre: 1400 }],
      verifie: () => $('#r-cv').dataset.texte === 'D[U] J[U]S.' && Math.abs(parseFloat($('#r-cv').dataset.cl) - 25) < 0.6 },
    { nom: 'remplisseur : penché de 12°, le vin reste d’aplomb et se mesure', page: 'remplisseur', capture: '#r-vu', actions: [{ attendre: 900 }, { remplir: '#r-angle', valeur: '12' }, { attendre: 1400 }],
      verifie: () => $('#r-cv').dataset.angle === '12' && parseFloat($('#r-cv').dataset.cl) > 0 },
    { nom: 'titres prêts : un clic verse le titre dans le remplisseur', page: 'prets', actions: [{ attendre: 600 }, { clic: '#prets-l button:nth-child(1)' }, { attendre: 1400 }],
      verifie: () => $('#r-txt').value === A.PHRASES.jeudi && $('#r-cv').dataset.texte === A.PHRASES.jeudi },
    { nom: 'largeur d’Anybody : le curseur élargit le mot', page: 'polices', actions: [{ remplir: '#larg', valeur: '150' }],
      verifie: () => $('#larg-vu').style.fontStretch === '150%' },
    { nom: 'abécédaire : le H dit ce qu’il tient', page: 'abecedaire', capture: '.gd-abc', actions: [{ attendre: 2000 }, { clic: '#abc-vu button[data-l="H"]' }],
      verifie: () => $('#abc-l').textContent === 'H' && parseFloat($('#abc-vu').dataset.cl) > 0 },
    { nom: 'abécédaire : le O ne tient rien', page: 'abecedaire', actions: [{ attendre: 2000 }, { clic: '#abc-vu button[data-l="O"]' }],
      verifie: () => $('#abc-vu').dataset.cl === '0.00' && $('#abc-dit').textContent.includes('fermée') },
    { nom: 'service : « Servir autrement » change les verres', page: 'service', actions: [{ attendre: 800 }, { clic: '#servir' }, { attendre: 1200 }],
      verifie: () => $('#service-cv').dataset.graine === '2' },
    { nom: 'image à niveau : le curseur pose la ligne', page: 'niveau', capture: '#niv-vu', actions: [{ remplir: '#niv-n', valeur: '80' }],
      verifie: () => $('#niv-vu .nl').style.top === '20%' },
    { nom: 'image à niveau : le cadre penche, la photo reste d’aplomb', page: 'niveau', capture: '#niv-vu', actions: [{ clic: '#niv-cadre button:nth-child(2)' }],
      verifie: () => /rotate\(12deg\)/.test($('#niv-vu .cadre').style.transform) && !!$('#niv-vu .cadre .nl') },
    { nom: 'image : « comptoir » se cadre sans l’ouvre-bouteille', page: 'niveau', actions: [{ clic: '#niv-photos button[data-n="comptoir"]' }],
      verifie: () => $('#niv-vu').dataset.photo === 'comptoir' && $('#niv-vu img').style.objectPosition.startsWith('86%') },
    { nom: 'mouvement : « On verse » se rejoue jusqu’au bout', page: 'gestes', capture: '#gestes-l', actions: [{ attendre: 1400 }, { clic: '#g-verse' }, { attendre: 1300 }],
      verifie: () => $('#g-verse-vu').dataset.fini === '1' && $('#g-verse-t').style.width === '100%' },
    { nom: 'annonce : la zone sûre se montre', page: 'modeles', capture: '.gd-modeles', actions: [{ clic: '#md-f button:nth-child(2)' }, { clic: '#md-zone-bt' }],
      verifie: () => $('#md-zone').classList.contains('gd-on') && $('#md-img').dataset.nom === '21-jeudi-9x16-a' },
    { nom: 'ressources : les variables CSS se copient', page: 'variables', actions: [{ clic: '#css-copier' }],
      verifie: async () => (await lit()).includes('--bleu: #2146D0') },
    { nom: 'ressources : 24 logos, chacun téléchargeable', page: 'logos', actions: [],
      verifie: () => $$('#logos-table a[download]').length === 24 && $$('#logos-table img').length === 24 },
  ];

  montrer();
  window.addEventListener('load', () => { if (location.hash) { const c = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (c && !c.classList.contains('page')) c.scrollIntoView(); } });
})();
