/* Guide de marque Custom — navigation et éléments vivants.
   Tout ce qui est dessiné vient du socle : window.Marque (marque.js) et window.MarqueTech (techniques.js). Rien n'est redessiné ici.
   Les règles chiffrées sont celles de MARQUE.md (zone de protection, tailles minimales, proportions, 8 images par seconde) ;
   les rapports de contraste sont calculés (Marque.contraste). La galerie lit window.GuideGalerie (assets/galerie.js). */
(function () {
  'use strict';
  const A = window.Marque, C = A.COULEURS, N = A.NOMS, D = A.DONNEES, NB = ' ';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, '0');
  const virgule = (x, d = 1) => (Math.round(x * 10 ** d) / 10 ** d).toFixed(d).replace('.', ',');
  const fr = (x) => String(x).replace('.', ',');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IMG = 1000 / 8; // un sprite : 8 images par seconde

  /* ---------- Règles chiffrées (MARQUE.md, § 4) ---------- */
  const REGLES = {
    protection: 0.28,                                                   // fois la hauteur du Cran, sur les quatre côtés
    tailles: [['logo', 'Logo de référence', 90, 24], ['logotype', 'Logotype seul', 64, 18], ['cran', 'Cran seul', 16, 4]], // px, mm de large
    proportions: [['noir', 'Noir atelier', 60], ['fluo', 'Fluo', 25], ['blanc', 'Blanc', 10], ['violet', 'Couleurs d’atelier', 5]],
  };

  /* ---------- Petits outils ---------- */
  const texteSur = (h) => (A.contraste(h, C.encre) >= A.contraste(h, C.blanc) ? C.encre : C.blanc);
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('gd-ouvert'); clearTimeout(toast.k); toast.k = setTimeout(() => t.classList.remove('gd-ouvert'), 1700); };
  const copier = async (texte, msg) => {
    try { await navigator.clipboard.writeText(texte); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = texte; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toast(msg || 'Copié');
  };
  /* Groupe de boutons à choix unique : aria-pressed, appel immédiat de f sur l'élément initial */
  const choix = (sel, items, f, i0 = 0) => {
    const el = $(sel);
    el.innerHTML = items.map((it, i) => `<button type="button" aria-pressed="false" data-i="${i}">${it.label}</button>`).join('');
    const set = (i, appel = true) => { $$('button', el).forEach((b, k) => b.setAttribute('aria-pressed', String(k === i))); if (appel) f(items[i], i); };
    $$('button', el).forEach((b, i) => b.addEventListener('click', () => set(i)));
    set(i0); return set;
  };

  /* ---------- Décors posés partout : flèches, croix, repères, barres, codes ---------- */
  $$('[data-fleche]').forEach((el) => { el.innerHTML = A.fleche('currentColor', '', el.dataset.fleche === 'g' ? 180 : 0); });
  $$('[data-croix]').forEach((el) => { el.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>'; });
  const poserReperes = (root) => $$('[data-reperes]', root).forEach((el) => { if (!el.querySelector(':scope > .croix')) el.insertAdjacentHTML('afterbegin', A.reperes({ t: 18 })); });
  poserReperes(document);
  $$('[data-barre]').forEach((el) => { el.innerHTML = A.barre({ n: 2 }); });
  $$('[data-code]').forEach((el) => { el.innerHTML = A.code(...el.dataset.code.split('|')); });
  $('#som-logo').innerHTML = A.logo(C.blanc, 'aria-hidden="true"', { sym: C.fluo });
  $('#haut-logo').innerHTML = A.logo(C.blanc, 'aria-hidden="true"', { sym: C.fluo });
  $('#pied-sym').innerHTML = A.symbol(C.fluo, 'aria-hidden="true"');

  /* ---------- Pages, sommaire, navigation ---------- */
  const pages = $$('.page').map((el, i) => ({ el, id: el.id, i, title: el.dataset.title,
    subs: (el.dataset.subs || '').split('|').filter(Boolean).map((s) => { const k = s.indexOf(':'); return { id: s.slice(0, k), t: s.slice(k + 1) }; }) }));
  $('#nav').innerHTML = pages.map((p) => `<a href="#${p.id}" data-p="${p.id}"><i>${pad(p.i)}</i><span>${p.title}</span></a>` +
    (p.subs.length ? `<div class="gd-sous" data-s="${p.id}">${p.subs.map((s) => `<a href="#${s.id}">${s.t}</a>`).join('')}</div>` : '')).join('');
  pages.forEach((p) => {
    const prev = pages[p.i - 1], next = pages[p.i + 1];
    $('[data-pager]', p.el).innerHTML = (prev ? `<a href="#${prev.id}" class="gd-prec"><span class="gd-etiq">${A.fleche('currentColor', 'margin-right:8px', 180)}Précédent</span><b>${prev.title}</b></a>` : '<span></span>') +
      (next ? `<a href="#${next.id}" class="gd-suiv"><span class="gd-etiq">Suivant${A.fleche('currentColor', 'margin-left:8px')}</span><b>${next.title}</b></a>` : '');
  });
  const aLaPage = {}; // initialisations paresseuses, à la première visite d'une page
  let current = null;
  const fermerNav = () => { $('#sommaire').classList.remove('gd-ouvert'); $('#burger').setAttribute('aria-expanded', 'false'); };
  const show = () => {
    const id = decodeURIComponent(location.hash.slice(1)) || 'accueil';
    const target = document.getElementById(id) || pages[0].el;
    const pageEl = target.classList.contains('page') ? target : target.closest('.page') || pages[0].el;
    if (pageEl !== current) {
      pages.forEach((p) => p.el.classList.toggle('on', p.el === pageEl));
      $$('#nav > a').forEach((a) => { const on = a.dataset.p === pageEl.id; a.classList.toggle('gd-sel', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      $$('#nav .gd-sous').forEach((s) => s.classList.toggle('gd-sel', s.dataset.s === pageEl.id));
      current = pageEl;
      document.title = (pageEl.id === 'accueil' ? '' : pageEl.dataset.title + ' — ') + 'Custom, guide de marque';
      $$('video').forEach((v) => { if (!pageEl.contains(v)) v.pause(); });
      if (aLaPage[pageEl.id]) { const f = aLaPage[pageEl.id]; delete aLaPage[pageEl.id]; requestAnimationFrame(f); }
    }
    fermerNav();
    if (target === pageEl) window.scrollTo(0, 0); else requestAnimationFrame(() => target.scrollIntoView());
  };
  window.addEventListener('hashchange', show);
  $('#burger').addEventListener('click', () => { const o = $('#sommaire').classList.toggle('gd-ouvert'); $('#burger').setAttribute('aria-expanded', String(o)); $('#burger').setAttribute('aria-label', o ? 'Fermer le sommaire' : 'Ouvrir le sommaire'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#sommaire').classList.contains('gd-ouvert')) { fermerNav(); $('#burger').focus(); } });

  /* =================================================================== 00 ACCUEIL */
  const DUNK = Array.from({ length: A.SPRITES.dunk }, (_, i) => A.dunk(i + 1, { c: C.blanc, c2: C.orange, attrs: 'style="height:100%;width:auto" aria-hidden="true"' }));
  $('#hero-sprite').innerHTML = DUNK[0];
  $('#hero-coulure').innerHTML = A.coulure({ w: 1200, h: 520, c: C.orange, seed: 11, cx: 0.62, cy: 0.62, rx: 0.5, ry: 0.36, attrs: 'style="width:100%;height:100%"' });
  const liste = (sel, items) => { $(sel).innerHTML = items.map((x) => `<li>${x}</li>`).join(''); };
  liste('#liste-garde', ['Le symbole&nbsp;: deux blocs inclinés, décalés', 'Le logotype «&nbsp;Custom.fr&nbsp;»', 'Les couleurs de la charte', 'Bebas Neue en capitales, un mot surligné', 'La grotesque étirée des grands titres', 'Les sprites en pixels arrondis', 'Les chiffres en blocs', 'Les taches d’encre balayées', 'Les croix de repérage', 'La photo de sport, la macro d’atelier']);
  liste('#liste-systeme', ['Le Cran&nbsp;: 13,3°, deux blocs, un pas', 'La zone de protection et les tailles minimales', 'Noir 60, fluo 25, blanc 10, atelier 5', 'Un seul surligneur par titre, trois angles', 'Le bloc&nbsp;: un rayon de 30&nbsp;% de la cellule', 'Les sprites&nbsp;: 8 images par seconde, sans fondu', 'La coulure&nbsp;: une ou deux par planche']);
  liste('#liste-ajout', ['Les noms&nbsp;: le Cran, le bloc, la coulure, le piquage', 'Les six traitements photo et les masques', 'Les cinq techniques rendues en matière', 'La barre de contrôle et les codes d’atelier', 'Les pictos d’univers', 'Le gris Craie et l’échelle du fluo', 'Les supports nouveaux']);
  $('#tripty').innerHTML = [
    ['01', 'chez vous', A.TRIPTYQUE[0], 'gd-t-blanc'],
    ['02', 'chez nous', A.TRIPTYQUE[1], 'gd-t-fluo'],
    ['03', 'partout', A.TRIPTYQUE[2], 'gd-t-photo'],
  ].map(([n, k, t, cls], i) => `<div class="gd-marche gd-m${i + 1}"><div class="pan ${cls}">${cls === 'gd-t-photo' ? A.photo('peloton', { mode: 'sombre', style: 'position:absolute;inset:0' }) : ''}<span class="gd-marche-n">${n} · ${k}</span><span class="t-large gd-marche-t">${t}</span></div></div>`).join('') +
    `<div class="gd-chemin" aria-hidden="true">${A.chemin({ w: 520, h: 220, c: C.fluo, de: 'Notre atelier', a: 'Vous' }).replace('width="520" height="220"', 'style="width:100%;height:auto"')}</div>`;
  const CHIFFRES = [['+500', 'Projets', 'réalisés, affichés sur le site'], ['7-10j', 'Jours', 'de délai moyen de livraison'], ['100%', 'Dans nos ateliers', 'la production est intégrée'],
    ['24h', 'Devis', 'détaillé, sans engagement'], ['<5s', 'Pour s’y retrouver', 'identifier son univers sur le site'], ['800', 'Vues', 'de la page Atelier en deux mois']];
  $('#chiffres-grille').innerHTML = CHIFFRES.map(([px, t, d], i) => `<div class="gd-carte gd-chiffre${i === 3 ? ' gd-carte-fluo' : ''}">${A.pix(px, { c: i === 3 ? C.encre : i % 2 ? C.blanc : C.fluo, attrs: `role="img" aria-label="${px.replace('-', ' à ').replace('j', ' jours').replace('h', ' heures').replace('<5s', 'moins de 5 secondes')}" class="gd-chiffre-px"` })}<div><b>${t}</b><p>${d}</p></div></div>`).join('');
  const MINI = {
    logo: () => A.logo(C.blanc, 'style="width:74%;height:auto"', { sym: C.fluo }),
    couleurs: () => `<span class="gd-mini-bandes">${['noir', 'fluo', 'blanc', 'violet', 'orange'].map((k) => `<i style="background:${C[k]};flex:${{ noir: 6, fluo: 2.5, blanc: 1, violet: .4, orange: .3 }[k]}"></i>`).join('')}</span>`,
    typographie: () => `<span class="t-titre gd-mini-titre">Une ${A.surl('voix')}</span>`,
    bloc: () => A.sprite('course', 2, { c: C.fluo, attrs: 'style="height:64%;width:auto"' }),
    matieres: () => A.coulure({ w: 600, h: 320, c: C.violet, seed: 4, attrs: 'style="position:absolute;inset:0;width:100%;height:100%"' }),
    photo: () => A.photo('moto', { mode: 'duo', c: 'fluo', style: 'position:absolute;inset:0' }),
    techniques: () => `<canvas data-tech="broderie" data-forme="cran" data-c="${C.fluo}" data-fond="maille" data-zoom="1.4" width="480" height="300" style="position:absolute;inset:0;width:100%;height:100%"></canvas>`,
    supports: () => `<span class="gd-mini-pictos">${Object.keys(A.PICTOS).map((k) => A.picto(k, { c: C.fluo })).join('')}</span>`,
    telecharger: () => `<span class="gd-mini-dl">${A.symbol(C.fluo, 'style="height:46px;width:auto"')}<span class="t-mono">SVG · ZIP · PDF</span></span>`,
  };
  $('#tuiles').innerHTML = pages.slice(1).map((p) => `<a href="#${p.id}" class="gd-tuile"><div class="gd-tuile-vu" aria-hidden="true">${MINI[p.id] ? MINI[p.id]() : ''}</div><div class="gd-tuile-leg"><i>${pad(p.i)}</i>${p.title}<span data-fleche></span></div></a>`).join('');
  $$('#tuiles [data-fleche]').forEach((el) => { el.innerHTML = A.fleche('currentColor'); });
  if (window.MarqueTech) window.MarqueTech.tous($('#tuiles'));

  /* =================================================================== 01 LOGO */
  const FONDS = [
    { label: 'Noir', k: 'noir', fg: C.fluo, tx: C.blanc },
    { label: 'Fluo', k: 'fluo', fg: C.encre, tx: C.encre },
    { label: 'Blanc', k: 'blanc', fg: C.encre, tx: C.encre },
    { label: 'Violet', k: 'violet', fg: C.blanc, tx: C.blanc },
    { label: 'Orange', k: 'orange', fg: C.encre, tx: C.encre },
    { label: 'Photo', k: 'photo', fg: C.fluo, tx: C.blanc },
  ];
  // Repères en unités du tracé : le Cran mesure 110 de haut dans toutes les versions (même échelle que le logo de référence).
  const M = REGLES.protection * A.LOGO.symbolBox[3];
  const VERS = [
    { k: 'logo', n: 'Logo de référence', u: 'Le Cran puis le logotype, sur une ligne. Partout où la place le permet.', f: (c, a) => A.logo(c, a), W: 714, H: 110 },
    { k: 'empile', n: 'Empilé', u: 'Le Cran au-dessus, centré. Formats carrés et hauts.', f: (c, a) => A.logoV(c, a), W: 487, H: 218 },
    { k: 'logotype', n: 'Logotype seul', u: 'Pour les très grands usages.', f: (c, a) => A.wordmark(c, a), W: 487, H: 82 },
    { k: 'cran', n: 'Cran seul', u: 'Icône, bouton, signalétique, fin de vidéo.', f: (c, a) => A.symbol(c, a), W: 191.05, H: 110 },
    { k: 'filaire', n: 'Filaire', u: 'Le contour, au fil, sur le textile.', f: (c, a) => A.logo(c, a, { contour: 2 }), W: 714, H: 110 },
    { k: 'descripteur', n: 'Avec descripteur', u: 'Quand il faut dire le métier&nbsp;: «&nbsp;Atelier de personnalisation&nbsp;».', f: (c, a) => A.lockup(c, a), W: 760, H: 82 },
  ];
  const r1 = (x) => Math.round(x * 10) / 10;
  /* Un logo dans un repère élargi de la zone de protection ; la zone (hachures, filet) n'apparaît qu'avec .gd-zone-on */
  const avecZone = (v, c, label, style) => { const { W, H } = v, id = 'hz-' + v.k + '-' + Math.random().toString(36).slice(2, 7);
    return `<svg viewBox="${r1(-M)} ${r1(-M)} ${r1(W + 2 * M)} ${r1(H + 2 * M)}" style="${style}" role="img" aria-label="${label}">` +
      `<g class="gd-z" fill="none" stroke="${c}"><defs><pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-76.7)"><rect width="2.4" height="9" fill="${c}"/></pattern></defs>` +
      `<path fill="url(#${id})" fill-opacity=".45" stroke="none" fill-rule="evenodd" d="M${r1(-M)},${r1(-M)}h${r1(W + 2 * M)}v${r1(H + 2 * M)}h${r1(-W - 2 * M)}z M0,0v${H}h${W}v${-H}z"/>` +
      `<rect x="${r1(-M)}" y="${r1(-M)}" width="${r1(W + 2 * M)}" height="${r1(H + 2 * M)}" stroke-width="1.6" stroke-dasharray="7 5"/><rect width="${W}" height="${H}" stroke-width="1" stroke-opacity=".6"/></g>` +
      v.f(c, `x="0" y="0" width="${W}" height="${H}" style="overflow:visible"`) + `</svg>`; };
  let fondI = 0;
  const dessinerStage = () => { const F = FONDS[fondI], st = $('#stage'), bg = $('#stage-fond');
    st.dataset.fond = F.k; st.style.color = F.tx;
    bg.innerHTML = F.k === 'photo' ? A.photo('peloton', { mode: 'sombre', style: 'position:absolute;inset:0' }) : '';
    bg.style.background = F.k === 'photo' ? '' : C[F.k];
    $('#versions-grille').innerHTML = VERS.map((v) => { const large = (v.W + 2 * M) / (v.H + 2 * M) > 2.4;
      return `<figure class="gd-version"><div class="gd-version-vu">${avecZone(v, F.fg, `Custom, ${v.n.toLowerCase()}, sur fond ${F.label.toLowerCase()}`, large ? 'width:100%;max-width:330px;height:auto' : 'height:118px;width:auto;max-width:100%')}</div><figcaption><b>${v.n}</b><span>${v.u}</span></figcaption></figure>`; }).join(''); };
  choix('#stage-sw', FONDS, (f, i) => { fondI = i; dessinerStage(); });
  $('#zone-bt').addEventListener('click', (e) => { const on = $('#stage').classList.toggle('gd-zone-on'); e.currentTarget.setAttribute('aria-pressed', String(on)); });

  // Zone de protection cotée, sur le logo de référence
  (() => { const v = VERS[0], W = v.W, H = v.H, m = M, t = 13, mono = `font-family="JetBrains Mono" font-size="${t}" letter-spacing=".8" fill="${C.fluo}"`;
    $('#protection-vu').innerHTML = `<svg viewBox="${r1(-m - 70)} ${r1(-m - 58)} ${r1(W + 2 * m + 140)} ${r1(H + 2 * m + 116)}" role="img" aria-label="Le logo de référence et sa zone de protection : 0,28 fois la hauteur du Cran sur les quatre côtés" style="width:100%;height:auto">
      <rect x="${r1(-m)}" y="${r1(-m)}" width="${r1(W + 2 * m)}" height="${r1(H + 2 * m)}" fill="${C.fluo}" fill-opacity=".07" stroke="${C.fluo}" stroke-width="1.4" stroke-dasharray="7 5"/>
      <rect width="${W}" height="${H}" fill="none" stroke="${C.acier}" stroke-width="1"/>
      ${A.logo(C.blanc, `x="0" y="0" width="${W}" height="${H}"`, { sym: C.fluo })}
      <g stroke="${C.fluo}" stroke-width="1.2"><path d="M${r1(-m)},${H + m + 22}h${r1(m)} M${r1(-m)},${H + m + 16}v12 M0,${H + m + 16}v12"/><path d="M${-m - 24},0v${H} M${-m - 30},0h12 M${-m - 30},${H}h12"/></g>
      <text x="${r1(-m)}" y="${H + m + 44}" ${mono}>X = 0,28 H</text>
      <text x="${-m - 36}" y="${H / 2}" ${mono} text-anchor="end" transform="rotate(-90 ${-m - 36} ${H / 2})">H</text>
      <text x="${r1(-m)}" y="${r1(-m - 18)}" ${mono}>ZONE DE PROTECTION · LA MOITIÉ D’UN BLOC</text></svg>`; })();

  // Tailles minimales, à la taille exacte
  const TAILLE = { logo: (px) => A.logo(C.blanc, `style="width:${px}px;height:auto" aria-hidden="true"`, { sym: C.fluo }), logotype: (px) => A.wordmark(C.blanc, `style="width:${px}px;height:auto" aria-hidden="true"`), cran: (px) => A.symbol(C.fluo, `style="width:${px}px;height:auto" aria-hidden="true"`) };
  $('#tailles-table').innerHTML = REGLES.tailles.map(([k, t, px, mm]) => `<tr><td class="gd-fort">${t}</td><td class="gd-mono">${px}${NB}px</td><td class="gd-mono">${mm}${NB}mm</td><td><span class="gd-taille">${TAILLE[k](px)}</span></td></tr>`).join('');

  // Couleurs permises du logo
  const ACCORDS = [['noir', C.fluo, null, 'Fluo sur noir'], ['noir', C.blanc, null, 'Blanc sur noir'], ['noir', C.blanc, C.fluo, 'Cran fluo, logotype blanc'], ['fluo', C.encre, null, 'Encre sur fluo'],
    ['blanc', C.encre, null, 'Encre sur blanc'], ['violet', C.blanc, null, 'Blanc sur violet'], ['orange', C.encre, null, 'Encre sur orange'], ['photo', C.fluo, null, 'Fluo sur photo assombrie']];
  $('#accords-grille').innerHTML = ACCORDS.map(([bg, fg, sym, t]) => `<figure class="gd-accord" style="${bg === 'photo' ? '' : `background:${C[bg]};`}color:${bg === 'photo' ? C.blanc : texteSur(C[bg])}">${bg === 'photo' ? A.photo('trail', { mode: 'sombre', style: 'position:absolute;inset:0' }) : ''}
    <div class="gd-accord-vu">${A.logo(fg, 'aria-hidden="true"', sym ? { sym } : {})}</div><figcaption><span>${t}</span><span class="gd-mono">${bg === 'photo' ? 'photo sombre' : virgule(A.contraste(fg, C[bg])) + NB + ':' + NB + '1'}</span></figcaption></figure>`).join('');

  // Interdits
  const L = (c, a = '', o) => A.logo(c, 'aria-hidden="true" ' + a, o);
  const degrade = L('url(#gd-deg)', 'style="width:84%;height:auto"').replace('>', `><defs><linearGradient id="gd-deg" x1="0" x2="1"><stop offset="0" stop-color="${C.fluo}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient></defs>`);
  const contour = L(C.fluo, 'style="width:80%;height:auto"').split('fill-rule="evenodd"').join(`fill-rule="evenodd" stroke="${C.blanc}" stroke-width="7" paint-order="stroke" stroke-linejoin="round"`);
  $('#interdits-grille').innerHTML = [
    ['Dégrader', degrade, C.noir],
    ['Ajouter une ombre', L(C.fluo, `style="width:80%;height:auto;filter:drop-shadow(6px 8px 3px ${C.encre})"`), C.graphite],
    ['Ajouter un contour', contour, C.noir],
    ['Pivoter', L(C.fluo, 'style="width:78%;height:auto;transform:rotate(-12deg)"'), C.noir],
    ['Déformer', L(C.fluo, 'preserveAspectRatio="none" style="width:86%;height:34px"'), C.noir],
    ['Poser du blanc sur le fluo', L(C.blanc, 'style="width:80%;height:auto"'), C.fluo],
  ].map(([t, svg, bg]) => `<figure class="gd-interdit"><div class="gd-interdit-vu" style="background:${bg}">${svg}<i class="gd-raye" aria-hidden="true"></i></div><figcaption><span class="gd-pastille gd-non">À ne pas faire</span>${t}</figcaption></figure>`).join('');

  // Construction du Cran
  const K = A.CONSTRUCTION, P = A.symbolParts(), TAN = K.tan;
  const construction = (t) => { const d = t * 38, dx = r1(TAN * d), dy = r1(-d), o = Math.max(0, 1 - t * 3), s = 'stroke-width=".6"', mono = `font-family="JetBrains Mono" font-size="5.4" letter-spacing=".25" fill="${C.blanc}"`;
    const ligne = (x1, y1, x2, y2, extra = '') => `<path d="M${x1},${y1}L${x2},${y2}" stroke="${C.fluo}" ${s} ${extra}/>`;
    return `<svg viewBox="-46 -62 300 210" style="width:100%;height:auto" role="img" aria-label="Construction du Cran : deux blocs de 117,8 sur 62,4, inclinés de 13,3 degrés, décalés de 62,5 en x et 47,6 en y">
      <defs><pattern id="gd-grille" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10,0V10H0" fill="none" stroke="${C.blanc}" stroke-opacity=".07" stroke-width=".4"/></pattern>
      <pattern id="gd-hach" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-76.7)"><rect width="1.2" height="4" fill="${C.encre}"/></pattern></defs>
      <rect x="-46" y="-62" width="300" height="210" fill="url(#gd-grille)"/>
      <path d="${A.symbolPath()}" fill="none" stroke="${C.acier}" stroke-width=".7" stroke-dasharray="2.2 1.6"/>
      <path d="${P.bas}" fill="${C.violet}"/>
      <g transform="translate(${dx} ${dy})"><path d="${P.haut}" fill="${C.fluo}" fill-opacity="${t ? 1 : .94}"/></g>
      <g opacity="${o}">
        <path d="M${r1(60.5 + K.recouvrement * TAN)},${K.decalage.y}L130.65,${K.decalage.y}L${r1(130.65 - K.recouvrement * TAN)},62.4L60.5,62.4Z" fill="url(#gd-hach)" opacity=".7"/>
        ${ligne(60.5, 62.4, 60.5, -2, 'stroke-dasharray="1.5 1.2"')}${ligne(60.5, 62.4, 75.25, 0)}
        <path d="M60.5,30 A32.4,32.4 0 0 1 68.2,30.9" fill="none" stroke="${C.fluo}" ${s}/>
        <text x="52" y="24" ${mono} text-anchor="end">${fr(K.angle)}°</text>
        ${ligne(75.25, -10, 193.05, -10)}${ligne(75.25, -13, 75.25, -7)}${ligne(193.05, -13, 193.05, -7)}<text x="134" y="-14" ${mono} text-anchor="middle">BLOC ${fr(K.bloc.l)} × ${fr(K.bloc.h)}</text>
        ${ligne(-1.9, 120, 60.5, 120)}${ligne(-1.9, 117, -1.9, 123)}${ligne(60.5, 117, 60.5, 123)}<text x="29" y="131" ${mono} text-anchor="middle">PAS ${fr(K.decalage.x)}</text>
        ${ligne(-24, 0, -24, 47.6)}${ligne(-27, 0, -21, 0)}${ligne(-27, 47.6, -21, 47.6)}<text x="-28" y="26" ${mono} text-anchor="end">${fr(K.decalage.y)}</text>
        ${ligne(206, 47.6, 206, 62.4)}${ligne(203, 47.6, 209, 47.6)}${ligne(203, 62.4, 209, 62.4)}<text x="212" y="54" ${mono}>${fr(K.recouvrement)}</text><text x="212" y="61" ${mono} opacity=".7">RECOUVREMENT</text>
        <text x="200" y="4" ${mono}>RAYON ${fr(K.bloc.rayon)}</text>
      </g>
      <text x="-40" y="142" ${mono} opacity=".55">REPÈRE ${fr(K.box[0])} × ${K.box[1]}</text></svg>`; };
  const ecart = $('#ecart');
  const majConstruction = () => { $('#construction-vu').innerHTML = construction(+ecart.value / 100); };
  ecart.addEventListener('input', majConstruction); majConstruction();
  $('#cotes').innerHTML = [
    ['Angle', `${fr(K.angle)}°`, `tangente ${fr(K.tan)}`], ['Bloc', `${fr(K.bloc.l)} × ${fr(K.bloc.h)}`, 'les deux blocs sont identiques'], ['Rayon de coin', fr(K.bloc.rayon), 'un vrai congé à chaque angle'],
    ['Décalage', `${fr(K.decalage.x)} · ${fr(K.decalage.y)}`, 'en x et en y : le pas'], ['Recouvrement', fr(K.recouvrement), 'en hauteur'], ['Repère', `${fr(K.box[0])} × ${K.box[1]}`, 'la boîte du Cran'],
  ].map(([a, b, c]) => `<div><dt class="gd-etiq">${a}</dt><dd><b>${b}</b><span>${c.replace(' :', NB + ':')}</span></dd></div>`).join('');

  /* =================================================================== 02 COULEURS */
  const ROLE = { noir: 'Le fond', fluo: 'La couleur de Custom', blanc: 'Texte sur noir, cartes claires', graphite: 'Cartes sur le noir', fonte: 'Filets pleins, pictos éteints', acier: 'Texte secondaire, pixels au repos', violet: 'Couleur d’atelier', orange: 'Couleur d’atelier (le ballon, une sangle)', encre: 'Texte sur fluo et sur blanc', craie: 'Gris clair des fonds d’écrans (extension)' };
  const CLES = Object.keys(C);
  $('#bands').innerHTML = CLES.map((k) => `<button type="button" class="bande gd-bande" style="background:${C[k]};color:${texteSur(C[k])}" data-hex="${C[k]}" title="Copier ${C[k]}" aria-label="${N[k]}, ${C[k]} : copier le code"><b>${N[k]}</b><span class="gd-mono">${C[k]}<br>RVB ${rgb(C[k]).join(' ')}</span><em>${ROLE[k]}</em></button>`).join('');
  $$('#bands .bande').forEach((b) => b.addEventListener('click', () => copier(b.dataset.hex, b.dataset.hex + ' copié')));
  $('#prop').innerHTML = REGLES.proportions.map(([k, , v]) => `<div style="flex:${v};background:${C[k]}">${k === 'violet' ? `<i style="background:${C.orange}"></i>` : ''}<span class="t-titre" style="color:${texteSur(C[k])}">${v}</span></div>`).join('');
  $('#prop-leg').innerHTML = REGLES.proportions.map(([k, n, v]) => `<span><i style="background:${C[k]}"></i>${n} ${v}${k === 'violet' ? ' (violet ou orange, un seul domine)' : ''}</span>`).join('');
  // Testeur de contraste
  const opts = CLES.map((k) => `<option value="${k}">${N[k]} · ${C[k]}</option>`).join('');
  const ctT = $('#ct-texte'), ctF = $('#ct-fond'); ctT.innerHTML = opts; ctF.innerHTML = opts; ctT.value = 'encre'; ctF.value = 'fluo';
  const CHARTE = { 'blanc/fluo': ['non', 'Charte : jamais de blanc sur le fluo.'], 'fluo/blanc': ['non', 'Charte : le fluo n’est jamais un texte sur le blanc.'], 'blanc/violet': ['titre', 'Charte : texte blanc sur le violet, en grand corps seulement.'],
    'encre/fluo': ['ok', 'Charte : sur le fluo, le texte est toujours en Encre.'], 'encre/orange': ['ok', 'Charte : sur l’orange, le texte est en Encre.'], 'blanc/orange': ['non', 'Charte : sur l’orange, le texte est en Encre, pas en blanc.'], 'acier/noir': ['non', 'Sur le noir, l’Acier sert aux pixels au repos, pas au texte courant.'] };
  const verdict = (r) => (r >= 4.5 ? ['ok', 'Tout texte'] : r >= 3 ? ['titre', 'Grands titres seulement'] : ['non', 'Jamais en texte']);
  const majContraste = () => { const t = ctT.value, f = ctF.value, r = A.contraste(C[t], C[f]), [cls, txt] = verdict(r), ch = CHARTE[t + '/' + f];
    const vu = $('#ct-vu'); vu.style.background = C[f]; vu.style.color = C[t];
    $('#ct-r').innerHTML = `${virgule(r)}<small>${NB}:${NB}1</small>`;
    $('#ct-verdict').innerHTML = `<span class="gd-badge gd-b-${cls}">${txt}</span><ul class="gd-crit"><li class="${r >= 4.5 ? 'gd-oui' : 'gd-non'}">Texte courant, 4,5</li><li class="${r >= 3 ? 'gd-oui' : 'gd-non'}">Grands titres, 3</li><li class="${r >= 7 ? 'gd-oui' : 'gd-non'}">Niveau renforcé, 7</li></ul>` +
      (ch ? `<p class="gd-charte gd-b-${ch[0]}">${ch[1].replace(' :', NB + ':')}</p>` : ''); };
  ctT.addEventListener('change', majContraste); ctF.addEventListener('change', majContraste);
  $('#ct-inverser').addEventListener('click', () => { const x = ctT.value; ctT.value = ctF.value; ctF.value = x; majContraste(); });
  majContraste();
  $('#paires-grille').innerHTML = [['encre', 'fluo'], ['blanc', 'noir'], ['fluo', 'noir'], ['encre', 'blanc'], ['blanc', 'violet'], ['encre', 'orange'], ['blanc', 'graphite'], ['acier', 'noir']].map(([t, f]) => {
    const r = A.contraste(C[t], C[f]), [cls, txt] = verdict(r), ch = CHARTE[t + '/' + f], badge = ch && ch[0] === 'titre' ? ['titre', 'Grand corps seulement'] : [cls, txt];
    return `<button type="button" class="gd-paire" data-t="${t}" data-f="${f}" aria-label="Tester ${N[t]} sur ${N[f]}"><span class="gd-paire-vu t-titre" style="background:${C[f]};color:${C[t]}">Aa</span><span class="gd-paire-n">${N[t]} sur ${N[f]}</span><span class="gd-mono">${virgule(r)}${NB}:${NB}1</span><span class="gd-badge gd-b-${badge[0]}">${badge[1]}</span></button>`; }).join('');
  $$('#paires-grille .gd-paire').forEach((b) => b.addEventListener('click', () => { ctT.value = b.dataset.t; ctF.value = b.dataset.f; majContraste(); $('#contraste').scrollIntoView({ behavior: calme ? 'auto' : 'smooth' }); }));
  $('#echelle-fluo').innerHTML = Object.keys(A.ECHELLE).map((k) => `<button type="button" style="background:${A.ECHELLE[k]};color:${texteSur(A.ECHELLE[k])}" data-hex="${A.ECHELLE[k]}" aria-label="Fluo ${k}, ${A.ECHELLE[k]} : copier"${k === '500' ? ' class="gd-500"' : ''}><b>${k}</b><span class="gd-mono">${A.ECHELLE[k]}</span></button>`).join('');
  $$('#echelle-fluo button').forEach((b) => b.addEventListener('click', () => copier(b.dataset.hex, 'Fluo ' + b.querySelector('b').textContent + ' copié')));

  /* =================================================================== 03 TYPOGRAPHIE */
  $('#specimens').innerHTML = [
    ['Large · .t-large', 'Archivo étirée', 'Largeur 125&nbsp;%, graisse 800, bas de casse. Les grands titres, de 1 à 5 mots.', '<div class="t-large gd-spec-large" contenteditable="true" spellcheck="false" aria-label="Spécimen Archivo modifiable">Transformez</div>', 'gd-span2'],
    ['Titre · .t-titre', 'Bebas Neue', 'Capitales étroites. Les titres de section, toujours avec un mot surligné.', `<div class="t-titre gd-spec-titre">On fait plus ${A.surl('qu’un maillot')}</div><div class="t-titre gd-spec-alpha">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>0123456789 ÀÉÈÊÇ</div>`, ''],
    ['Texte · .t-chapo, .t-txt', 'Inter', 'Le texte courant et l’interface, en 400, 500 et 600.', `<div class="gd-spec-texte" contenteditable="true" spellcheck="false" aria-label="Spécimen Inter modifiable">Textile, print, goodies, signalétique&nbsp;: quatre univers sous un même toit. Sérigraphie, DTF, broderie, flocage, sublimation, tout est opéré dans notre atelier.</div><div class="gd-spec-graisses"><span style="font-weight:400">Regular 400</span><span style="font-weight:500">Medium 500</span><span style="font-weight:600">SemiBold 600</span></div>`, ''],
    ['Repère · .t-mono', 'JetBrains Mono', 'Capitales espacées. Les cotes, les codes d’atelier, les métadonnées.', `<div class="t-mono gd-spec-mono">CST · SER · DTF · BRO · FLO · SUB<br>REPÈRE 0123456789 · 2026</div>`, 'gd-span2'],
  ].map(([e, n, d, vu, cls]) => `<div class="gd-carte gd-spec ${cls}"><span class="gd-etiq">${e}</span><h3>${n}</h3><p>${d}</p><div class="gd-spec-vu">${vu}</div></div>`).join('');

  // Testeur du surligneur
  const SL_C = [{ label: 'Fluo', cls: '' }, { label: 'Violet', cls: 'violet' }, { label: 'Orange', cls: 'orange' }, { label: 'Blanc', cls: 'blanc' }, { label: 'Noir', cls: 'noir' }];
  const SL_A = [{ label: '−1,6° (défaut)', cls: '' }, { label: '+1,4° (monte)', cls: 'monte' }, { label: '0° (droit)', cls: 'droit' }];
  const sl = { mots: [], sel: [0, 0], c: SL_C[0], a: SL_A[0] };
  const lireMots = () => { sl.mots = $('#sl-txt').value.trim().split(/\s+/).filter(Boolean); const n = sl.mots.length; sl.sel = n ? [Math.min(sl.sel[0], n - 1), Math.min(sl.sel[1], n - 1)] : [0, 0]; if (sl.sel[0] > sl.sel[1]) sl.sel[0] = sl.sel[1]; };
  const dessinerSl = () => { const { mots, sel } = sl, cls = [sl.c.cls, sl.a.cls].filter(Boolean).join(' ');
    $('#sl-mots').innerHTML = mots.map((m, i) => `<button type="button" data-i="${i}" aria-pressed="${i >= sel[0] && i <= sel[1]}">${esc(m)}</button>`).join('') || '<span class="gd-note">Tapez une phrase.</span>';
    $$('#sl-mots button').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.i, [a, z] = sl.sel;
      if (i >= a && i <= z) sl.sel = [i, i]; else if (i === a - 1 && z - i < 4) sl.sel = [i, z]; else if (i === z + 1 && i - a < 4) sl.sel = [a, i]; else sl.sel = [i, i];
      dessinerSl(); $(`#sl-mots button[data-i="${i}"]`).focus(); }));
    const avant = mots.slice(0, sel[0]).map(esc).join(' '), groupe = mots.slice(sel[0], sel[1] + 1).map(esc).join(' '), apres = mots.slice(sel[1] + 1).map(esc).join(' ');
    const html = mots.length ? `${avant ? avant + ' ' : ''}<span class="surl${cls ? ' ' + cls : ''}">${groupe}</span>${apres ? ' ' + apres : ''}` : '';
    $('#sl-vu').innerHTML = html; $('#sl-vu').parentElement.classList.toggle('gd-sur-fluo', sl.c.cls === 'noir');
    $('#sl-code').textContent = `<h2 class="t-titre">${html.replace(/&amp;/g, '&')}</h2>`; };
  $('#sl-txt').addEventListener('input', () => { lireMots(); dessinerSl(); });
  lireMots(); sl.sel = [sl.mots.length - 1, sl.mots.length - 1];
  choix('#sl-c', SL_C, (c) => { sl.c = c; dessinerSl(); });
  choix('#sl-a', SL_A, (a) => { sl.a = a; dessinerSl(); });
  $('#sl-copier').addEventListener('click', () => copier($('#sl-code').textContent, 'HTML du titre copié'));
  const regles = (sel, items) => { $(sel).innerHTML = items.map((x) => `<li>${x}</li>`).join(''); };
  regles('#regles-typo-1', ['Large&nbsp;: Archivo à 125&nbsp;% et 800, en bas de casse, de 1 à 5 mots.', 'Titre&nbsp;: Bebas Neue en capitales, toujours avec un mot surligné.', 'Un seul surligneur par titre, sur une seule ligne. Fluo par défaut.', 'Le texte en Inter&nbsp;; les cotes, les codes et les métadonnées en JetBrains Mono capitales.']);
  regles('#regles-typo-2', ['Le vouvoiement, des phrases courtes, le verbe d’abord.', 'Espace insécable avant «&nbsp;:&nbsp;; ? ! %&nbsp;» et dans «&nbsp;24&nbsp;h&nbsp;».', 'Pas de flèche ni de coche en caractère&nbsp;: la flèche est dessinée par le socle.', 'Jamais de jargon, jamais de superlatif creux.']);

  /* =================================================================== 04 LE BLOC */
  const SEQ = [{ label: 'Moto · 5 images', k: 'moto' }, { label: 'Course · 4 images', k: 'course' }, { label: 'Dunk · 8 images', k: 'dunk' }];
  const imageSp = (k, i, h = '100%') => (k === 'dunk' ? A.dunk(i, { c: C.blanc, c2: C.orange, attrs: `style="height:${h};width:auto" aria-hidden="true"` }) : A.sprite(k, i, { c: C.fluo, attrs: `style="height:${h};width:auto;max-width:100%" aria-hidden="true"` }));
  const sp = { k: 'moto', n: 5, i: 0, lit: !calme, t0: 0, cache: [] };
  const dessinerSp = () => { $('#sp-vu').innerHTML = sp.cache[sp.i]; $('#sp-n').textContent = `${pad(sp.i + 1)} / ${pad(sp.n)}`;
    $$('#sp-planche button').forEach((b, k) => b.setAttribute('aria-pressed', String(k === sp.i))); };
  const majLire = () => { const b = $('#sp-lire'); b.textContent = sp.lit ? 'Pause' : 'Lecture'; b.setAttribute('aria-pressed', String(sp.lit)); b.setAttribute('aria-label', sp.lit ? 'Mettre en pause' : 'Lancer la lecture'); };
  const lire = (on) => { sp.lit = on; if (on) sp.t0 = performance.now() - sp.i * IMG; majLire(); };
  const pas = (d) => { lire(false); sp.i = (sp.i + d + sp.n) % sp.n; dessinerSp(); };
  choix('#sp-nom', SEQ, (s) => { sp.k = s.k; sp.n = A.SPRITES[s.k]; sp.i = 0; sp.cache = Array.from({ length: sp.n }, (_, i) => imageSp(s.k, i + 1));
    $('#sp-planche').innerHTML = sp.cache.map((svg, i) => `<button type="button" aria-label="Image ${i + 1}" aria-pressed="false">${imageSp(s.k, i + 1, '46px')}<span>${pad(i + 1)}</span></button>`).join('');
    $$('#sp-planche button').forEach((b, i) => b.addEventListener('click', () => { lire(false); sp.i = i; dessinerSp(); }));
    sp.t0 = performance.now(); dessinerSp(); });
  $('#sp-lire').addEventListener('click', () => lire(!sp.lit)); $('#sp-prec').addEventListener('click', () => pas(-1)); $('#sp-suiv').addEventListener('click', () => pas(1));
  $('#sp-zone').addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); pas(-1); } if (e.key === 'ArrowRight') { e.preventDefault(); pas(1); } if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); lire(!sp.lit); } });
  majLire();

  // Générateur de chiffres en blocs
  const PX_C = [{ label: 'Fluo', c: C.fluo }, { label: 'Blanc', c: C.blanc }, { label: 'Orange', c: C.orange }, { label: 'Violet', c: C.violet }];
  const px = { c: C.fluo };
  $('#px-permis').textContent = A.PIXELS.map((x) => (x === ' ' ? 'espace' : x)).join(' ');
  const pixTexte = () => { const brut = $('#px-txt').value, bas = brut.toLowerCase(), ok = [...bas].filter((x) => A.PIXELS.includes(x)).join(''), hors = [...new Set([...bas].filter((x) => !A.PIXELS.includes(x)))]; return { ok: ok.trim() ? ok : '', hors }; };
  const majPix = () => { const { ok, hors } = pixTexte();
    $('#px-vu').innerHTML = ok ? A.pix(ok, { c: px.c, attrs: `role="img" aria-label="${esc(ok)} en blocs" style="width:100%;height:auto;max-height:240px"` }) : '<p class="gd-note">Tapez des chiffres ou des signes permis.</p>';
    $('#px-ecart').textContent = hors.length ? `Pas en blocs, donc ignoré${hors.length > 1 ? 's' : ''}${NB}: ${hors.join(' ')}` : ''; };
  $('#px-txt').addEventListener('input', majPix);
  choix('#px-c', PX_C, (c) => { px.c = c.c; majPix(); });
  $('#px-copier').addEventListener('click', () => { const { ok } = pixTexte(); if (ok) copier(A.pix(ok, { c: px.c }), 'SVG copié'); });
  $('#pictos-grille').innerHTML = D.univers.map((u, i) => `<div class="gd-carte gd-picto"><div class="gd-picto-vu">${A.picto(u.cle, { c: C.fluo, attrs: `role="img" aria-label="Picto ${u.nom}"` })}</div><span class="gd-etiq">${pad(i + 1)} · Marque.picto('${u.cle}')</span><h3>${u.nom}</h3><p>${u.produits.join(', ')}.</p></div>`).join('');
  $('#regle-bloc-grille').innerHTML = [[['#'], 'Seul', 'Quatre coins arrondis.'], [['##'], 'Côte à côte', 'Les blocs fusionnent&nbsp;: plus de coin entre eux.'], [['##', '#.'], 'En angle', 'Le coin rentrant reste net, seuls les coins libres s’arrondissent.']]
    .map(([rows, t, d]) => `<div class="gd-carte gd-regle-bloc"><div class="gd-regle-vu">${A.grille(rows, { c: C.fluo, cell: 10, attrs: 'style="height:100%;width:auto" aria-hidden="true"' })}</div><h3>${t}</h3><p>${d}</p></div>`).join('');

  /* =================================================================== 05 MATIÈRES */
  const CL_C = [{ label: 'Orange', k: 'orange', fond: C.blanc }, { label: 'Violet', k: 'violet', fond: C.blanc }, { label: 'Fluo', k: 'fluo', fond: C.graphite }];
  const CL_F = [{ label: 'Tache', o: { cx: 0.5, cy: 0.5, rx: 0.42, ry: 0.44 } }, { label: 'Bande', o: { cx: 0.5, cy: 0.55, rx: 0.6, ry: 0.2, frange: 0.1 } }, { label: 'Débord', o: { cx: 0.86, cy: 0.38, rx: 0.5, ry: 0.55 } }];
  const cl = { c: CL_C[0], f: CL_F[0] };
  const clSeed = $('#cl-seed');
  const appelCoulure = () => { const o = Object.assign({ w: 900, h: 560, c: cl.c.k, seed: Math.max(1, Math.min(9999, Math.round(+clSeed.value) || 1)) }, cl.f.o);
    return { o, txt: 'Marque.coulure({ ' + Object.entries(o).map(([k, v]) => `${k}: ${typeof v === 'string' ? `'${v}'` : v}`).join(', ') + ' })' }; };
  const majCoulure = () => { const { o, txt } = appelCoulure(); const vu = $('#cl-vu'); vu.style.background = cl.c.fond;
    vu.innerHTML = A.coulure(Object.assign({}, o, { attrs: `role="img" aria-label="Coulure ${cl.c.label.toLowerCase()}, graine ${o.seed}" style="width:100%;height:100%"` })); $('#cl-code').textContent = txt; };
  choix('#cl-c', CL_C, (c) => { cl.c = c; majCoulure(); });
  choix('#cl-f', CL_F, (f) => { cl.f = f; majCoulure(); });
  clSeed.addEventListener('input', majCoulure);
  $('#cl-hasard').addEventListener('click', () => { clSeed.value = 1 + Math.floor(Math.random() * 9999); majCoulure(); });
  $('#cl-copier').addEventListener('click', () => copier(appelCoulure().txt, 'Appel copié'));
  const pq = { fond: C.noir, seed: 3 };
  const majPiquage = () => { const vu = $('#pq-vu'); vu.style.background = pq.fond; vu.innerHTML = A.piquage({ w: 1200, h: 740, c: C.fluo, seed: pq.seed, courbe: +$('#pq-courbe').value / 100, attrs: 'style="width:100%;height:100%" role="img" aria-label="Piquage fluo"' }); };
  choix('#pq-f', [{ label: 'Sur noir', c: C.noir }, { label: 'Sur blanc', c: C.blanc }], (f) => { pq.fond = f.c; majPiquage(); });
  $('#pq-courbe').addEventListener('input', majPiquage);
  $('#pq-hasard').addEventListener('click', () => { pq.seed = 1 + Math.floor(Math.random() * 9999); majPiquage(); });
  const MT_C = [{ label: 'Fluo sur noir', c: C.fluo, f: C.noir }, { label: 'Noir sur fluo', c: C.noir, f: C.fluo }, { label: 'Fonte sur noir', c: C.fonte, f: C.noir }];
  const mt = { c: MT_C[0] };
  const majMotif = () => { const tr = +$('#mt-trou').value / 100, vu = $('#mt-vu'); vu.style.background = mt.c.f; $('#mt-v').textContent = Math.round(tr * 100) + NB + '%';
    vu.innerHTML = A.motif({ w: 1200, h: 620, l: 74, seed: 2, trou: tr, c: mt.c.c, attrs: 'style="width:100%;height:100%" role="img" aria-label="Motif de blocs"' }); };
  $('#mt-trou').addEventListener('input', majMotif);
  choix('#mt-c', MT_C, (c) => { mt.c = c; majMotif(); });
  $('#trames-grille').innerHTML = [
    ['tx-trame', 'La trame', 'Points de sérigraphie, pas réglé par --tp.', `color:${C.fluo}`],
    ['tx-lignes', 'Les lignes', 'Le balayage horizontal des coulures.', `color:${C.fluo}`],
    ['tx-hachures', 'Les hachures', 'À la pente du Cran, 13,3°. La bande de signalisation.', `color:${C.fluo}`],
    ['tx-motif', 'Le motif en CSS', 'Le motif de blocs posé en masque, raccordable.', `color:${C.fonte}`],
    ['tx-toile', 'La toile', 'Le tissage serré du fond des pictos.', ''],
    ['grain', 'Le grain', 'Sur un fond plein&nbsp;; le contenu passe au-dessus avec .net.', `background:${C.graphite}`],
  ].map(([cls, t, d, st]) => `<button type="button" class="gd-trame" data-cls="${cls}" aria-label="${t} : copier la classe ${cls}"><span class="gd-trame-vu ${cls}" style="${st}"></span><span class="gd-etiq">.${cls}</span><b>${t}</b><span>${d}</span></button>`).join('');
  $$('#trames-grille .gd-trame').forEach((b) => b.addEventListener('click', () => copier(b.dataset.cls, 'Classe .' + b.dataset.cls + ' copiée')));
  $('#reperes-grille').innerHTML = [
    ['Croix de repérage', 'Aux quatre angles de la feuille. Marque.reperes() dans un .cadre-r.', `<div class="cadre-r gd-rep-cadre">${A.reperes({ t: 22 })}</div>`],
    ['Mire', 'Au milieu des marges&nbsp;: le centre de calage.', A.mire(64, `color:${C.blanc}`)],
    ['Barre de contrôle', 'La gamme de la marque, comme en marge d’un tirage.', A.barre({ n: 2, style: 'width:100%;height:22px' })],
    ['Code d’atelier', 'Marque, technique, année. SER, DTF, BRO, FLO, SUB.', `<span class="gd-rep-code">${A.code('CST', 'BRO', '2026')}</span>`],
  ].map(([t, d, vu]) => `<div class="gd-carte gd-repere"><div class="gd-repere-vu">${vu}</div><h3>${t}</h3><p>${d}</p></div>`).join('');

  /* =================================================================== 06 PHOTO */
  const PH = Object.keys(A.PHOTOS);
  const PH_M = [{ label: 'Brut', m: 'brut' }, { label: 'Sombre', m: 'sombre' }, { label: 'Noir et blanc', m: 'nb' }, { label: 'Duo', m: 'duo' }, { label: 'Tramée', m: 'trame' }, { label: 'Seuil', m: 'seuil' }];
  const ph = { k: 'dunk', m: 'duo', trame: 'points', c: 'fluo' };
  const modePh = () => (ph.m === 'trame' ? ph.trame : ph.m);
  const enCouleur = () => ['duo', 'trame', 'seuil'].includes(ph.m);
  const majPhoto = () => { const mode = modePh(), o = { mode, style: 'position:absolute;inset:0' }; if (enCouleur()) o.c = ph.c;
    $('#ph-vu').innerHTML = A.photo(ph.k, o) + `<span class="gd-ph-leg t-mono">${esc(A.PHOTOS[ph.k].sujet)} · ${PH_M.find((x) => x.m === ph.m).label}</span>`;
    $('#ph-trame-z').hidden = ph.m !== 'trame';
    $$('#ph-c button').forEach((b) => { b.disabled = !enCouleur(); });
    $('#ph-code').textContent = `Marque.photo('${ph.k}', { mode: '${mode}'${enCouleur() ? `, c: '${ph.c}'` : ''} })`;
    $$('#ph-liste button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === ph.k)));
    majMasques(); };
  $('#ph-liste').innerHTML = PH.map((k) => `<button type="button" data-k="${k}" aria-pressed="false" title="${esc(A.PHOTOS[k].sujet)}"><img src="${A.photoURL(k)}" alt="" loading="lazy" style="object-position:${A.PHOTOS[k].pos}"><span>${esc(A.PHOTOS[k].sujet)}</span></button>`).join('');
  $$('#ph-liste button').forEach((b) => b.addEventListener('click', () => { ph.k = b.dataset.k; majPhoto(); }));
  const masque = (url) => `-webkit-mask-image:${url};mask-image:${url};-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat`;
  const boite = (rows) => A.grilleBox(rows, 10);
  function majMasques() { const o = { mode: modePh(), style: 'position:absolute;inset:0' }; if (enCouleur()) o.c = ph.c; const im = A.photo(ph.k, o);
    const sRows = A.spriteRows('moto', 3), sB = boite(sRows), pRows = A.pixRows('24h'), pB = boite(pRows);
    $('#masques-grille').innerHTML = [
      ['Dans le Cran', 'dans-cran', '', '.dans-cran'],
      ['Dans un bloc', 'dans-bloc', '', '.dans-bloc'],
      ['Dans une coulure', '', `aspect-ratio:3/2;${masque(A.coulureURL({ w: 600, h: 400, seed: 5 }))}`, 'Marque.coulureURL()'],
      ['Dans un sprite', '', `aspect-ratio:${sB[0]}/${sB[1]};${masque(A.dataSVG(A.sprite('moto', 3, { c: '#000', c2: '#000' })))}`, 'Marque.sprite()'],
      ['Dans un chiffre', '', `aspect-ratio:${pB[0]}/${pB[1]};${masque(A.dataSVG(A.pix('24h', { c: '#000' })))}`, 'Marque.pix()'],
    ].map(([t, cls, st, code], i) => `<figure class="gd-masque gd-mq${i + 1}"><div class="gd-masque-vu"><div class="gd-masque-forme ${cls}" style="${st}">${im}</div></div><figcaption><b>${t}</b><span class="gd-mono">${code}</span></figcaption></figure>`).join(''); }
  choix('#ph-mode', PH_M, (m) => { ph.m = m.m; majPhoto(); }, 3);
  choix('#ph-trame', [{ label: 'Points', t: 'points' }, { label: 'Lignes', t: 'lignes' }], (t) => { ph.trame = t.t; majPhoto(); });
  choix('#ph-c', [{ label: 'Fluo', c: 'fluo' }, { label: 'Violet', c: 'violet' }, { label: 'Orange', c: 'orange' }], (c) => { ph.c = c.c; majPhoto(); });

  /* =================================================================== 07 TECHNIQUES */
  const TQ = D.techniques, TISSUS = [{ label: 'Maille sport', k: 'maille', d: 'maille sport noire' }, { label: 'Sergé', k: 'serge', d: 'sergé noir' }, { label: 'Coton jersey', k: 'coton', d: 'coton jersey noir' }, { label: 'Molleton', k: 'molleton', d: 'molleton noir' }];
  const tq = { i: 2, tissu: 'maille', forme: 'cran', p: 1, pret: false, attente: false };
  const cv = $('#tq-cv');
  const rendreTq = () => { if (!tq.pret || tq.attente || !window.MarqueTech) return; tq.attente = true;
    requestAnimationFrame(() => { tq.attente = false; const t = TQ[tq.i];
      window.MarqueTech.rendre(cv, { tech: t.cle, forme: tq.forme, c: C.fluo, fond: tq.tissu, cf: C.noir, p: tq.p, seed: 3, marge: tq.forme === 'logo' ? 0.08 : 0.16 });
      cv.setAttribute('aria-label', `${t.nom} : ${tq.forme === 'logo' ? 'le logo' : 'le Cran'} fluo sur ${TISSUS.find((x) => x.k === tq.tissu).d}, fabrication à ${virgule(tq.p, 2)}`); }); };
  const majTq = () => { const t = TQ[tq.i]; $('#tq-code').textContent = t.code; $('#tq-nom').textContent = t.nom; $('#tq-pour').textContent = t.pour; $('#tq-pv').textContent = virgule(tq.p, 2);
    $$('#tq-tabs [role="tab"]').forEach((b, k) => { b.setAttribute('aria-selected', String(k === tq.i)); b.tabIndex = k === tq.i ? 0 : -1; }); rendreTq(); };
  $('#tq-tabs').innerHTML = TQ.map((t) => `<button type="button" role="tab" aria-selected="false" aria-controls="tq-cv">${t.nom}</button>`).join('');
  $$('#tq-tabs [role="tab"]').forEach((b, i) => { b.addEventListener('click', () => { tq.i = i; majTq(); });
    b.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault(); tq.i = (tq.i + d + TQ.length) % TQ.length; majTq(); $$('#tq-tabs [role="tab"]')[tq.i].focus(); }); });
  choix('#tq-tissu', TISSUS, (t) => { tq.tissu = t.k; rendreTq(); });
  choix('#tq-forme', [{ label: 'Le Cran', k: 'cran' }, { label: 'Le logo', k: 'logo' }], (f) => { tq.forme = f.k; rendreTq(); });
  $('#tq-p').addEventListener('input', (e) => { tq.p = +e.target.value / 100; $('#tq-pv').textContent = virgule(tq.p, 2); rendreTq(); });
  $('#cinq-grille').innerHTML = TQ.map((t, i) => `<button type="button" class="gd-cinq" data-i="${i}" aria-label="Ouvrir ${t.nom} dans le marquage"><canvas data-tech="${t.cle}" data-forme="cran" data-c="${C.fluo}" data-fond="maille" width="400" height="300"></canvas><span class="gd-pastille">${t.code}</span><b>${t.nom}</b><span>${t.pour}</span></button>`).join('');
  $$('#cinq-grille .gd-cinq').forEach((b) => b.addEventListener('click', () => { tq.i = +b.dataset.i; majTq(); $('#atelier-tq').scrollIntoView({ behavior: calme ? 'auto' : 'smooth' }); }));
  majTq();
  aLaPage.techniques = () => { tq.pret = true; rendreTq(); if (window.MarqueTech) setTimeout(() => window.MarqueTech.tous($('#cinq-grille')), 60); };

  /* =================================================================== 08 SUPPORTS : galerie et visionneuse */
  const G = (Array.isArray(window.GuideGalerie) ? window.GuideGalerie : []).map((m) => ({ ...m, v: /\.mp4$/i.test(m.f), stem: m.f.replace(/\.[^.]+$/, '') }));
  const SECTIONS = [...new Set(G.map((m) => m.s))];
  let filtre = 'Tout', liste_ = G;
  const dessinerGal = () => { liste_ = filtre === 'Tout' ? G : G.filter((m) => m.s === filtre);
    $('#gal').innerHTML = liste_.length ? liste_.map((m, i) => `<button type="button" data-i="${i}" aria-label="Agrandir : ${esc(m.t)}${m.v ? ' (vidéo)' : ''}"><span class="gd-im"><img src="media/vignettes/${m.stem}.jpg" alt="" loading="lazy">${m.v ? '<span class="gd-lire" aria-hidden="true"></span>' : ''}</span><span class="gd-gal-leg"><i>${esc(m.s)}${m.v ? ' · vidéo' : ''}</i>${esc(m.t)}</span></button>`).join('')
      : '<p class="gd-note">La galerie se remplit à l’assemblage de l’étude de cas.</p>';
    $$('#gal button').forEach((b) => b.addEventListener('click', () => ouvrirLb(liste_, +b.dataset.i))); };
  const FIL = [{ label: `Tout <span>${G.length}</span>`, s: 'Tout' }].concat(SECTIONS.map((s) => ({ label: `${esc(s)} <span>${G.filter((m) => m.s === s).length}</span>`, s })));
  choix('#filters', FIL, (f) => { filtre = f.s; dessinerGal(); });
  const lb = $('#lb'); let lbL = [], lbI = 0, lbRetour = null;
  const dessinerLb = () => { const m = lbL[lbI];
    $('#lb-m').innerHTML = m.v ? `<video src="media/${m.f}" autoplay loop muted playsinline controls aria-label="${esc(m.t)}"></video>` : `<img src="media/${m.f}" alt="${esc(m.t)}">`;
    $('#lb-leg').textContent = m.t; $('#lb-n').textContent = lbL.length > 1 ? `${pad(lbI + 1)} / ${pad(lbL.length)}` : '';
    $('#lb-prec').hidden = $('#lb-suiv').hidden = lbL.length < 2; };
  function ouvrirLb(l, i) { if (!l.length) return; lbRetour = document.activeElement; lbL = l; lbI = Math.max(0, i); lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; dessinerLb(); $('#lb-fermer').focus(); }
  const fermerLb = () => { lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); $('#lb-m').innerHTML = ''; document.body.style.overflow = ''; if (lbRetour) lbRetour.focus(); };
  const pasLb = (d) => { lbI = (lbI + d + lbL.length) % lbL.length; dessinerLb(); };
  $('#lb-prec').addEventListener('click', () => pasLb(-1)); $('#lb-suiv').addEventListener('click', () => pasLb(1)); $('#lb-fermer').addEventListener('click', fermerLb);
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.id === 'lb-m') fermerLb(); });
  document.addEventListener('keydown', (e) => { if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') fermerLb(); else if (e.key === 'ArrowLeft') pasLb(-1); else if (e.key === 'ArrowRight') pasLb(1);
    else if (e.key === 'Tab') { const f = $$('button:not([hidden])', lb); const i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); } });

  /* =================================================================== 09 TÉLÉCHARGER */
  // Fichiers présents dans brand/logo/ (export_logo.py) : custom-<version>-<couleur>.svg
  const LOGOS = {
    versions: [['logo', 'Logo de référence', (c, a) => A.logo(c, a)], ['logo-empile', 'Empilé', (c, a) => A.logoV(c, a)], ['logotype', 'Logotype seul', (c, a) => A.wordmark(c, a)], ['symbole', 'Cran seul', (c, a) => A.symbol(c, a)], ['complet', 'Avec descripteur', (c, a) => A.lockup(c, a)]],
    couleurs: [['fluo', 'Fluo'], ['blanc', 'Blanc'], ['noir', 'Noir'], ['encre', 'Encre']],
  };
  const fichierLogo = (v, c) => `logo/${A.SLUG}-${v}-${c}.svg`;
  $('#fichiers-tete').innerHTML = '<th>Version</th>' + LOGOS.couleurs.map(([, n]) => `<th>${n}</th>`).join('');
  $('#fichiers-table').innerHTML = LOGOS.versions.map(([k, t, f]) => `<tr><td class="gd-fort"><span class="gd-dl-v"><span class="gd-dl-apercu">${f(C.fluo, 'aria-hidden="true"')}</span>${t}</span></td>` +
    LOGOS.couleurs.map(([c, n]) => `<td><a class="gd-bt gd-creux gd-petit" href="${fichierLogo(k, c)}" download aria-label="${t}, ${n.toLowerCase()}, SVG">SVG</a></td>`).join('') + '</tr>').join('');
  $('#nb-logos').textContent = `${LOGOS.versions.length * LOGOS.couleurs.length} fichiers SVG, ${LOGOS.versions.length} versions en ${LOGOS.couleurs.length} couleurs.`;
  $('#zip').href = `logo/${A.SLUG}-logos.zip`;
  $('#pdf-vu').innerHTML = `<span class="gd-pdf-page gd-p1">${A.logo(C.encre, 'aria-hidden="true"')}<span class="t-titre">Guide de ${A.surl('marque', 'noir')}</span></span><span class="gd-pdf-page gd-p2">${A.symbol(C.fluo, 'aria-hidden="true"')}</span>`;
  $('#polices-grille').innerHTML = [
    ['Archivo', 'Large · grands titres', 'https://fonts.google.com/specimen/Archivo', 'font-family:var(--large);font-stretch:125%;font-weight:800'],
    ['Bebas Neue', 'Titre · sections', 'https://fonts.google.com/specimen/Bebas+Neue', 'font-family:var(--titre)'],
    ['Inter', 'Texte · interface', 'https://rsms.me/inter/', 'font-family:var(--font);font-weight:600'],
    ['JetBrains Mono', 'Repère · cotes et codes', 'https://www.jetbrains.com/lp/mono/', 'font-family:var(--mono);font-weight:500'],
  ].map(([n, r, u, st]) => `<div class="gd-carte gd-police"><span class="gd-police-aa" style="${st}" aria-hidden="true">Aa</span><h3>${n}</h3><p>${r}. Licence OFL.</p><a class="gd-bt gd-creux gd-petit" href="${u}" target="_blank" rel="noopener">Page officielle<span class="gd-ext" aria-hidden="true">${A.fleche('currentColor', 'margin-left:8px', -45)}</span><span class="gd-sr"> (nouvel onglet)</span></a></div>`).join('');
  const root = getComputedStyle(document.documentElement), v = (n) => root.getPropertyValue(n).trim();
  const VARS = ':root {\n  /* Couleurs de Custom (charte de 2025) */\n' + CLES.map((k) => `  --${k}: ${C[k]};`.padEnd(24) + `/* ${N[k]} : ${ROLE[k]} */`).join('\n') +
    '\n  /* Échelle du fluo (extension) */\n' + Object.keys(A.ECHELLE).map((k) => `  --fluo-${k}: ${A.ECHELLE[k]};`).join('\n') +
    '\n  /* Rôles */\n' + ['vif', 'clair', 'moyen', 'sombre', 'scene', 'sur-scene', 'papier', 'doux'].map((r) => `  --${r}: ${v('--' + r)};`).join('\n') +
    '\n  /* Polices */\n' + ['large', 'titre', 'font', 'mono'].map((r) => `  --${r}: ${v('--' + r)};`).join('\n') + `\n  /* La pente du Cran */\n  --pente: ${v('--pente')};\n}`;
  $('#variables-css').textContent = VARS;
  $('#copier-variables').addEventListener('click', () => copier(VARS, 'Variables CSS copiées'));

  /* =================================================================== Vie : une seule boucle, pilotée par le temps */
  let heroI = -1;
  const boucle = (now) => {
    if (current && !document.hidden) {
      if (current.id === 'accueil' && !calme) { const i = Math.floor(now / IMG) % DUNK.length; if (i !== heroI) { heroI = i; $('#hero-sprite').innerHTML = DUNK[i]; $('#hero-n').textContent = `${pad(i + 1)} / ${pad(DUNK.length)}`; } }
      if (current.id === 'bloc' && sp.lit) { const i = Math.floor((now - sp.t0) / IMG) % sp.n; if (i !== sp.i) { sp.i = i; dessinerSp(); } }
    }
    requestAnimationFrame(boucle);
  };
  requestAnimationFrame(boucle);
  show();
})();
