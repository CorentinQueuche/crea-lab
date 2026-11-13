/* SITE DU GUIDE : GRDR · Djongoma (site/assets/guide.js) : navigation, éléments vivants, visionneuse, téléchargements.
   Tout ce qui est dessiné vient du socle (window.Marque, Marque.carte, Marque.app) : rien n'est redessiné ici. Les schémas
   communs avec le guide en pages (zone de protection, lecture d'une empreinte, construction) viennent de deck/pages.js
   (window.GuideOutils), pour que le site et le PDF disent la même chose.

   CE QUE LES OUTILS ATTENDENT :
   - Navigation : #nav rempli depuis les .page (data-title, data-subs) ; la page visible porte .on ; une ancre de section
     ouvre sa page puis y descend ; [data-pager] (classe pager) reçoit les liens précédent et suivant ; #burger ouvre et
     ferme #sommaire en version mobile (aria-expanded), Échap le ferme.
   - Visionneuse #lb : .on quand elle est ouverte ; flèches, Échap, focus gardé dedans puis rendu au bouton d'origine.
   - window.GuideTests : les éléments vivants que tools/check_inter.mjs doit tester (un par élément réglable).
   - Écrans de l'outil : seuls ceux dont la fonction existe dans Marque.app ont un onglet (les lots b et c les livrent). */
(function () {
  'use strict';
  const A = window.Marque, C = A.COULEURS, N = A.NOMS || {}, D = A.DONNEES, APP = A.app || {}, U = window.GuideOutils || {}, NB = A.NB;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const virg = (x, d) => (d == null ? String(x) : x.toFixed(d)).replace('.', ',');
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CLES = Object.keys(C);
  const existe = (n) => typeof APP[n] === 'function';
  /* Couleur de texte la plus lisible sur un fond (calculée, jamais devinée) */
  const lisible = (fond) => (A.contraste(fond, C.encre) > A.contraste(fond, C.blanc) ? C.encre : C.blanc);
  const verdict = U.verdict || ((r) => (r >= 4.5 ? 'texte courant' : r >= 3 ? 'grands titres seulement' : 'jamais en texte'));
  const PJ = D.projets, ECOS = PJ[0];
  const parCode = (c) => PJ.find((p) => p.code === c);
  const plage = (p) => { const c = A.cernesDe(p); return `${c.annees[0]}–${c.annees[c.annees.length - 1]}`; };
  const OUI = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>', NON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const fn = (ok, visuel, legende, cls = '') => `<figure class="gd-fn ${cls}"><span class="gd-m ${ok ? 'gd-oui' : 'gd-non'}" role="img" aria-label="${ok ? 'À faire' : 'À éviter'}">${ok ? OUI : NON}</span><div class="gd-fn-v">${visuel}</div><figcaption>${legende}</figcaption></figure>`;
  const fig = (visuel, legende, cls = '') => `<figure><div class="gd-ex-v ${cls}">${visuel}</div><figcaption>${legende}</figcaption></figure>`;
  const pastilles = (ks) => `<div class="gd-past">${ks.map((k) => `<span><u style="background:${C[k]}"></u><b>${N[k]}</b><i>${C[k]}</i></span>`).join('')}</div>`;

  /* ---------- Petits outils ---------- */
  const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('gd-ouvert'); clearTimeout(toast.k); toast.k = setTimeout(() => t.classList.remove('gd-ouvert'), 1800); };
  const copier = async (texte, msg) => {
    try { await navigator.clipboard.writeText(texte); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = texte; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toast(msg || 'Copié');
  };
  /* Groupe de boutons à choix unique : aria-pressed, flèches gauche et droite, appel immédiat sur l'élément initial */
  const choix = (sel, items, f, i0 = 0) => {
    const el = typeof sel === 'string' ? $(sel) : sel;
    el.innerHTML = items.map((it, i) => `<button type="button" aria-pressed="false" data-i="${i}">${it.label}</button>`).join('');
    const bts = $$('button', el);
    const set = (i) => { bts.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i))); f(items[i], i); };
    bts.forEach((b, i) => {
      b.addEventListener('click', () => set(i));
      b.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
        e.preventDefault(); const j = (i + d + bts.length) % bts.length; set(j); bts[j].focus(); });
    });
    if (items.length) set(Math.max(0, Math.min(items.length - 1, i0))); return set;
  };
  /* Un geste : f(x) pour x de 0 à 1 pendant duree ms (linéaire : la courbe du socle s'applique dans f). Renvoie l'arrêt. */
  const anime = (duree, f, fin) => {
    if (calme) { f(1); if (fin) fin(); return () => {}; }
    let t0 = null, stop = false;
    const pas = (t) => { if (stop) return; if (t0 === null) t0 = t; const x = Math.min(1, (t - t0) / duree); f(x); if (x < 1) requestAnimationFrame(pas); else if (fin) fin(); };
    requestAnimationFrame(pas); return () => { stop = true; };
  };
  /* Une empreinte qui se trace : chaque boucle part du pied, décalée de la précédente (durées de MARQUE.md) */
  const DUR = 900, DEC = 110;
  const tracerEmp = (el, o, animer = true) => { const n = o.cernes.length, T = DUR + (n - 1) * DEC;
    const dessin = (x) => { el.innerHTML = A.empreinte({ ...o, cernes: o.cernes.map((v, i) => v * A.ease((x * T - i * DEC) / DUR)) }); };
    if (!animer) { dessin(1); return () => {}; }
    return anime(T, dessin); };
  /* Suivre la taille d'un élément (et son apparition quand sa page s'ouvre) */
  const suivre = (el, f) => { if (!el) return; let k = 0; new ResizeObserver(() => { cancelAnimationFrame(k); k = requestAnimationFrame(() => { if (el.clientWidth > 0) f(el.clientWidth, el.clientHeight); }); }).observe(el); };

  /* ---------- Marque partout : logos, icône, titre ---------- */
  $$('[data-logo]').forEach((el) => { el.innerHTML = A.lockup(null, 'aria-hidden="true"'); });
  $$('[data-icone]').forEach((el) => { el.innerHTML = A.icone(38); });
  $$('[data-produit]').forEach((el) => { el.textContent = A.PRODUIT; });
  $$('[data-fleche]').forEach((el) => { el.innerHTML = A.fleche('currentColor'); });
  $$('[data-oui]').forEach((el) => { el.innerHTML = OUI; });
  $$('[data-non]').forEach((el) => { el.innerHTML = NON; });
  $('#favicon').href = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${C.vermillon}"/>${A.empreinte({ cernes: [1, 1, 1], c: 'blanc', piste: null, attrs: 'x="15" y="9" width="34" height="46"' })}</svg>`);
  $('#lb-prec').innerHTML = A.fleche('currentColor', '', 180); $('#lb-suiv').innerHTML = A.fleche('currentColor');
  $('#lb-fermer').innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>';

  /* =================================================================== Pages, sommaire, navigation */
  const pages = $$('.page').map((el, i) => ({ el, id: el.id, i, title: el.dataset.title, desc: el.dataset.desc || '',
    subs: (el.dataset.subs || '').split('|').filter(Boolean).map((s) => { const k = s.indexOf(':'); return { id: s.slice(0, k), t: s.slice(k + 1) }; }) }));
  $('#nav').innerHTML = pages.map((p) => `<a href="#${p.id}" data-p="${p.id}"><i>${pad(p.i)}</i><span>${esc(p.title)}</span></a>` +
    (p.subs.length ? `<div class="gd-sous" data-s="${p.id}">${p.subs.map((s) => `<a href="#${s.id}">${esc(s.t)}</a>`).join('')}</div>` : '')).join('');
  pages.forEach((p) => {
    const prev = pages[p.i - 1], next = pages[p.i + 1], el = $('[data-pager]', p.el);
    if (!el) return;
    el.innerHTML = (prev ? `<a href="#${prev.id}" class="gd-prec"><span class="gd-etiq">Précédent</span><b>${esc(prev.title)}</b></a>` : '<span></span>') +
      (next ? `<a href="#${next.id}" class="gd-suiv"><span class="gd-etiq">Suivant</span><b>${esc(next.title)}</b></a>` : '');
  });
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
      document.title = (pageEl === pages[0].el ? '' : pageEl.dataset.title + ' · ') + `${A.NOM} · ${A.PRODUIT}, guide de marque`;
      $$('video').forEach((v) => { if (!pageEl.contains(v)) v.pause(); });
      /* Changement de page au clavier ou au lecteur d'écran : le focus va au titre de la nouvelle page */
      if (!premiere && cible === pageEl) { const h = $('h1', pageEl); if (h) h.focus({ preventScroll: true }); }
    }
    premiere = false;
    ouvrirNav(false);
    if (cible === pageEl) window.scrollTo(0, 0); else requestAnimationFrame(() => cible.scrollIntoView());
  };
  window.addEventListener('hashchange', montrer);
  $('#burger').addEventListener('click', () => ouvrirNav(!$('#sommaire').classList.contains('gd-ouvert')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#sommaire').classList.contains('gd-ouvert')) { ouvrirNav(false); $('#burger').focus(); } });

  /* =================================================================== Accueil : la signature, une empreinte vivante */
  const PDF = `deck/${A.SLUG}-guide-de-marque.pdf`;
  $('#accueil-pdf').href = PDF;
  $('#tuiles').innerHTML = pages.slice(1).map((p) => `<a href="#${p.id}" class="gd-tuile"><i>${pad(p.i)}</i><b>${esc(p.title)}</b><span>${esc(p.desc)}</span></a>`).join('');
  $('#accueil-vivant').innerHTML = A.aquarelle('aube', { cls: 'grain', pos: '50% 45%' }) +
    `<button type="button" class="gd-vivant" id="accueil-emp" aria-label="Voir l’empreinte du projet suivant"></button><p class="gd-hero-leg" id="accueil-leg" aria-live="polite"></p>`;
  let iAcc = 0, stopAcc = null;
  const montrerAcc = (i, animer = true) => { iAcc = (i + PJ.length) % PJ.length; const p = PJ[iAcc], c = A.cernesDe(p);
    $('#accueil-emp').dataset.code = p.code;
    $('#accueil-leg').innerHTML = `<span class="gd-verre"><span class="gd-etiq">${p.code} · ${plage(p)} · ${iAcc + 1}${NB}/${NB}${PJ.length}</span><b>${esc(p.titre)}</b></span><span class="gd-verre"><i>${Math.round(p.taux * 100)}<small>%</small></i></span>`;
    if (stopAcc) stopAcc();
    stopAcc = tracerEmp($('#accueil-emp'), { cernes: c.cernes, actif: c.actif, c: 'blanc', piste: 'rgba(255,251,246,.4)', cActif: 'nuit', cadre: 5 }, animer); };
  $('#accueil-emp').addEventListener('click', () => montrerAcc(iAcc + 1));
  montrerAcc(0);

  /* =================================================================== La marque */
  const cE = A.cernesDe(ECOS);
  $('#existe').innerHTML =
    fig(A.lockup(null, 'style="height:112px;width:auto"'), 'Le logo officiel') +
    fig(pastilles(['vermillon', 'ocre', 'lagune']), 'Trois couleurs relevées sur le logo') +
    fig(`<b style="font-family:var(--titre);font-weight:900;font-size:84px;line-height:.9;letter-spacing:-.05em;color:${C.vermillon}">Aa</b><span style="font-family:var(--titre);font-weight:800;font-size:17px;letter-spacing:-.02em">Nunito</span>`, 'La police des publications', 'gd-col') +
    fig(A.aquarelle('aube', { html: A.filigrane({ c: 'blanc', op: 0.55, style: 'right:-34px;top:-22px;width:130px;height:175px' }) }), 'Les lavis du rapport 2025');
  $('#ajoute').innerHTML =
    fig(A.empreinte({ cernes: cE.cernes, actif: cE.actif, taille: 120 }), 'L’empreinte d’un projet') +
    fig(`${A.code(ECOS.code, 'vermillon')}<span style="font-size:26px">${A.montant(ECOS.total)}</span>${A.tampon('Sage · à jour')}`, 'La marge du comptable', 'gd-col') +
    fig(`${A.jauge({ v: 0.76, repere: 0.69, c: 'vermillon', w: 150 })}${A.jauge({ v: 0.45, repere: 0.33, w: 150 })}${A.jauge({ v: 0.19, repere: 0.46, w: 150 })}`, 'Les graphiques, au même trait', 'gd-col') +
    fig(pastilles(['nuit', 'encre', 'blanc']), 'Les deux bouts de l’échelle');
  $('#idee-phrase').textContent = A.IDEE;
  const lire = (p, o) => (U.lire ? U.lire(p, o).replace('class="mp-lire"', 'class="gd-lire"') : A.empreinte({ ...A.cernesDe(p), taille: o.taille }));
  $('#idee-vue').innerHTML = `<figure>${A.symbol('ocre', 'style="height:250px;width:auto"')}<figcaption class="gd-etiq">Le symbole du GRDR · un lieu, des boucles</figcaption></figure>` +
    `<div class="gd-idee-f" aria-hidden="true">${A.fleche('encre')}</div>` +
    `<figure>${lire(ECOS, { taille: 290 })}<figcaption class="gd-etiq">L’empreinte d’${ECOS.code} · cinq années, cinq boucles</figcaption></figure>`;
  const PH = A.PHRASES;
  $('#phrases').innerHTML = [['À l’annonce', PH.excel], ['À l’extraction', PH.sage], ['Au journal', PH.journal]].map(([q, t]) => `<div><span class="gd-etiq">${q}</span><p>${esc(t)}</p></div>`).join('');

  /* =================================================================== Le logo */
  const FONDS = (U.FONDS || [['blanc', null, 'Blanc de papier · en couleurs']]).map(([f, c, t]) => { const [a, b] = t.split(' · '); return { f, c, t, label: `${esc(a)} <span>${esc(b || '')}</span>` }; });
  choix('#logo-fonds', FONDS, (o) => { const sc = $('#logo-scene');
    sc.dataset.fond = o.f + (o.c ? '-' + o.c : '');
    const fond = o.f === 'aq' ? null : C[o.f];
    sc.style.background = fond || 'none'; sc.style.color = fond ? lisible(fond) : C.encre;
    sc.setAttribute('aria-label', `Le logo du GRDR, ${o.t.replace(' · ', ', ')}`);
    sc.innerHTML = (fond ? A.lockup(o.c) : A.aquarelle('aube', { cls: 'grain' }) + `<div class="net">${A.lockup(o.c)}</div>`) + `<span class="gd-etiq">${esc(o.t)}${fond ? ' · ' + fond : ''}</span>`; });
  $('#logo-versions').innerHTML =
    `<figure>${A.lockup(null, 'style="height:150px;width:auto"')}<figcaption class="gd-etiq">Version complète · <code>Marque.lockup()</code></figcaption></figure>` +
    `<figure>${A.court(null, 'style="height:74px;width:auto"')}<figcaption class="gd-etiq">Version courte · <code>Marque.court()</code></figcaption></figure>` +
    `<figure>${A.symbol('ocre', 'style="height:74px;width:auto"')}<figcaption class="gd-etiq">Symbole · <code>Marque.symbol()</code></figcaption></figure>`;
  $('#logo-zone').innerHTML = (U.zoneSVG || '').replace('class="mp-zone"', 'class="gd-zone" role="img" aria-label="Le logo et sa zone de protection : un x libre sur les quatre côtés"');
  $('#logo-tailles').innerHTML = [
    [A.lockup(null, 'style="width:110px;height:auto"'), 'Version complète', '110 px de large · 30 mm'],
    [A.court(null, 'style="width:48px;height:auto"'), 'Version courte', '48 px de large · 14 mm'],
    [A.symbol('ocre', 'style="height:24px;width:auto"'), 'Symbole seul', '24 px de haut · 6 mm'],
  ].map(([v, t, s]) => `<div><div class="gd-t-v">${v}</div><b>${t}</b><span>${s}</span></div>`).join('');
  $('#logo-interdits').innerHTML = [
    ['Déformer', A.lockup(null, 'preserveAspectRatio="none" style="width:230px;height:70px"')],
    ['Recolorer autrement', A.lockup('emeraude', 'style="height:100px;width:auto"')],
    ['Toucher au descripteur', (U.faux || '').replace('<svg ', '<svg style="height:100px;width:auto" ')],
    ['Incliner', A.lockup(null, 'style="height:96px;width:auto;transform:rotate(-12deg)"')],
    ['Poser sur une photo sans lavis', A.photo('marche', { style: 'position:absolute;inset:0' }) + `<div style="position:relative;z-index:5;display:grid;place-items:center">${A.lockup('blanc', 'style="height:96px;width:auto"')}</div>`],
    ['Garder le descripteur sous 110 px', A.lockup(null, 'style="width:62px;height:auto"')],
  ].map(([t, v]) => fn(false, v, t)).join('');
  /* Le symbole se trace : le curseur est le temps, chaque trait a sa sortie quartique */
  const DUR_T = 1, DEC_T = 0.12, TOT_T = DUR_T + 4 * DEC_T;
  const dessinerTrace = (x) => { const t = x * TOT_T, v = $('#trace-vue');
    v.innerHTML = A.symbolTrace({ p: [0, 1, 2, 3, 4].map((i) => A.ease((t - i * DEC_T) / DUR_T)), piste: 'sable', id: 'gdt' });
    v.dataset.p = String(Math.round(x * 100)); $('#trace-o').textContent = `${Math.round(x * 100)}${NB}%`; };
  $('#trace-p').addEventListener('input', (e) => dessinerTrace(e.target.value / 100));
  let stopTrace = null;
  $('#trace-rejouer').addEventListener('click', () => { if (stopTrace) stopTrace(); stopTrace = anime(TOT_T * 1000, (x) => { $('#trace-p').value = Math.round(x * 100); dessinerTrace(x); }); });
  dessinerTrace($('#trace-p').value / 100);
  /* Téléchargements : les fichiers de brand/logo (export_logo.py), et la version courte écrite à la volée par le socle */
  const uri = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const fichier = (v, c) => `logo/${A.SLUG}-${v}-${c}.svg`;
  const TEINTES_LOGO = [['officiel', 'Couleurs officielles'], ['encre', 'Encre'], ['blanc', 'Blanc de papier']];
  const VERSIONS_LOGO = [
    ['Version complète', A.lockup(null, 'aria-hidden="true"'), (c) => (c === 'officiel' ? [`logo/${A.SLUG}-officiel.svg`, `${A.SLUG}-officiel.svg`] : [fichier('complet', c), `${A.SLUG}-complet-${c}.svg`])],
    ['Version courte', A.court(null, 'aria-hidden="true"'), (c) => [uri(A.court(c === 'officiel' ? null : c)), `${A.SLUG}-court-${c}.svg`]],
    ['Symbole', A.symbol('ocre', 'aria-hidden="true"'), (c) => (c === 'officiel' ? [uri(A.symbol('ocre')), `${A.SLUG}-symbole-ocre.svg`] : [fichier('symbole', c), `${A.SLUG}-symbole-${c}.svg`])],
  ];
  $('#logos-tete').innerHTML = '<th scope="col">Version</th>' + TEINTES_LOGO.map(([, t]) => `<th scope="col">${t}</th>`).join('');
  $('#logos-table').innerHTML = VERSIONS_LOGO.map(([t, apercu, f]) => `<tr><th scope="row"><span class="gd-dl-v"><span class="gd-dl-apercu">${apercu}</span>${t}</span></th>` +
    TEINTES_LOGO.map(([c, tc]) => { const [href, nom] = f(c); return `<td><a class="gd-bt gd-creux gd-petit" href="${href}" download="${nom}" aria-label="${t}, ${tc.toLowerCase()}, SVG">SVG</a></td>`; }).join('') + '</tr>').join('');
  $('#nb-logos').textContent = 'Neuf fichiers SVG : trois versions, en couleurs officielles, en encre, en blanc.';
  ['#zip', '#zip-2'].forEach((s) => { $(s).href = `logo/${A.SLUG}-logos.zip`; });
  ['#logo-officiel', '#logo-officiel-2'].forEach((s) => { $(s).href = `logo/${A.SLUG}-officiel.svg`; });

  /* =================================================================== L'empreinte : l'atelier */
  const AT = { annees: [2023, 2024, 2025, 2026], cernes: [1, 0.8, 0.35, 0], actif: 2, fond: 'papier', projet: null };
  $('#at-vue').innerHTML = '<div id="at-emp"></div><div class="gd-at-lec" id="at-lec"></div>';
  let stopAt = null;
  const rendreAtelier = (animer = false) => { const vue = $('#at-vue'), nuit = AT.fond === 'nuit', n = AT.cernes.length, p = AT.projet;
    vue.classList.toggle('gd-n', nuit);
    vue.dataset.cernes = AT.cernes.map((v) => +v.toFixed(2)).join(','); vue.dataset.n = String(n); vue.dataset.actif = String(AT.actif); vue.dataset.projet = p ? p.code : '';
    vue.setAttribute('aria-label', `Empreinte de ${n} années : ` + AT.annees.map((a, i) => `${a}, ${Math.round(AT.cernes[i] * 100)} %${i === AT.actif ? ', année en cours' : ''}`).join(' ; '));
    const part = p ? p.taux : AT.cernes.reduce((a, v) => a + v, 0) / n;
    $('#at-lec').innerHTML = `<div><span class="gd-etiq">${p ? `${p.code} · ${D.pays[p.pays]} · ${AT.annees[0]}–${AT.annees[n - 1]}` : `Projet libre · ${AT.annees[0]}–${AT.annees[n - 1]}`}</span><b>${p ? esc(p.titre) : 'Votre empreinte'}</b>` +
      `<span class="gd-etiq">${p ? A.euro(p.total) : `${n} boucles`}</span></div><i>${Math.round(part * 100)}<small>%</small></i>`;
    if (stopAt) stopAt();
    stopAt = tracerEmp($('#at-emp'), { cernes: AT.cernes, actif: AT.actif, c: nuit ? 'menthe' : 'lagune', piste: nuit ? 'rgba(255,251,246,.13)' : 'sable', cActif: nuit ? 'miel' : 'vermillon' }, animer); };
  const libre = () => { AT.projet = null; $$('#at-projets button').forEach((b) => b.setAttribute('aria-pressed', 'false')); };
  let enInit = false;
  const curseurs = () => {
    $('#at-n').value = AT.cernes.length; $('#at-n-o').textContent = `${AT.cernes.length} ans`;
    $('#at-curseurs').innerHTML = AT.annees.map((a, i) => `<div class="gd-curseur${i === AT.actif ? ' gd-actif' : ''}"><label for="at-c${i}">${a}</label><input type="range" id="at-c${i}" min="0" max="100" step="1" value="${Math.round(AT.cernes[i] * 100)}"><output for="at-c${i}">${Math.round(AT.cernes[i] * 100)}${NB}%</output></div>`).join('');
    $$('#at-curseurs input').forEach((inp, i) => inp.addEventListener('input', () => { AT.cernes[i] = inp.value / 100; inp.nextElementSibling.textContent = `${inp.value}${NB}%`; libre(); rendreAtelier(); }));
    enInit = true;
    choix('#at-actif', AT.annees.map((a) => ({ label: String(a) })).concat([{ label: 'Aucune' }]), (o, i) => { AT.actif = i < AT.annees.length ? i : -1; if (!enInit) libre();
      $$('#at-curseurs .gd-curseur').forEach((c, k) => c.classList.toggle('gd-actif', k === AT.actif)); rendreAtelier(); }, AT.actif < 0 ? AT.annees.length : AT.actif);
    enInit = false;
  };
  $('#at-n').addEventListener('input', (e) => { const n = +e.target.value;
    while (AT.cernes.length < n) { AT.annees.push(AT.annees[AT.annees.length - 1] + 1); AT.cernes.push(0); }
    while (AT.cernes.length > n) { AT.annees.pop(); AT.cernes.pop(); }
    if (AT.actif >= n) AT.actif = -1;
    libre(); curseurs(); rendreAtelier(); });
  $('#at-projets').innerHTML = PJ.map((p) => { const c = A.cernesDe(p);
    return `<button type="button" aria-pressed="false" data-code="${p.code}" aria-label="Charger ${esc(p.titre)}, ${p.code}">${A.empreinte({ cernes: c.cernes, actif: c.actif, cadre: 5 })}<b>${esc(p.titre)}</b><span>${A.code(p.code, p.alerte ? 'vermillon' : 'lagune')}${plage(p)} · ${A.pct(p.taux)}</span></button>`; }).join('');
  $$('#at-projets button').forEach((b) => b.addEventListener('click', () => { const p = parCode(b.dataset.code), c = A.cernesDe(p);
    AT.annees = c.annees.slice(); AT.cernes = c.cernes.slice(); AT.actif = c.actif; AT.projet = p;
    curseurs(); AT.projet = p; $$('#at-projets button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    rendreAtelier(true);
    const r = $('#at-vue').getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) $('#atelier').scrollIntoView({ behavior: calme ? 'auto' : 'smooth' }); }));
  choix('#at-fond', [{ label: 'Papier', k: 'papier' }, { label: 'Nuit', k: 'nuit' }], (o) => { AT.fond = o.k; rendreAtelier(); });
  curseurs(); rendreAtelier();
  /* Lire, construire, utiliser */
  $('#lectures').innerHTML = ['ECOS', 'ECSI', 'HWCL'].map(parCode).filter(Boolean).map((p) => `<figure style="display:grid;gap:12px;align-content:space-between">${lire(p, { taille: 236 })}<figcaption><b style="font-family:var(--titre);font-weight:800;letter-spacing:-.02em">${esc(p.titre.length > 34 ? p.titre.slice(0, 33).replace(/\s+\S*$/, '') + '…' : p.titre)}</b><br><span class="gd-etiq">${p.code} · ${plage(p)} · exécuté à ${A.pct(p.taux)}</span></figcaption></figure>`).join('');
  $('#cles').innerHTML = [[C.lagune, 'Le tracé : ce qui est exécuté'], [C.vermillon, 'L’année en cours'], [C.sable, 'La piste : ce qui reste à exécuter']].map(([c, t]) => `<span><u style="--lc:${c}"></u>${t}</span>`).join('');
  const K = A.CONSTRUCTION;
  $('#construction-vue').innerHTML = `<figure>${(U.mesureSymbole || '').replace('class="mp-mes"', 'width="270" role="img" aria-label="Le symbole officiel et ses deux familles de cercles"')}<figcaption class="gd-etiq">Le symbole officiel · deux familles de cercles au même pas</figcaption></figure>` +
    `<div class="gd-idee-f" aria-hidden="true">${A.fleche('encre')}</div>` +
    `<figure>${(U.mesureEmpreinte || '').replace('class="mp-mes"', 'width="400" role="img" aria-label="La construction de l’empreinte, cotée"')}<figcaption class="gd-etiq">L’empreinte · la famille gauche, prolongée</figcaption></figure>`;
  $('#mesures').innerHTML = [['Pas', virg(K.pas), 'L’écart entre deux boucles'], ['Trait', String(K.epaisseur), 'L’épaisseur, celle du symbole'], ['Inclinaison', `${virg(K.inclinaison)}°`, 'La jambe, tangente à sa boucle'],
    ['Tour', 'trois quarts', 'La boucle ne se ferme jamais'], ['Jambe', 'rayon + 1,45 pas', 'La longueur de chaque jambe'], ['Rayons mesurés', K.gauche.rayons.map((r) => virg(r)).join(' · '), 'La famille gauche du symbole officiel']]
    .map(([a, b, c]) => `<tr><th scope="row">${a}</th><td class="gd-mono">${b}</td><td>${c}</td></tr>`).join('');
  const mini = (o) => A.empreinte({ piste: 'sable', ...o });
  $('#usages').innerHTML =
    fn(true, `${mini({ cernes: cE.cernes, actif: cE.actif, taille: 38, cadre: 5 })}<div style="font-size:13px;font-weight:700;line-height:1.2">${esc(ECOS.titre)}<br><span style="display:inline-flex;gap:6px;align-items:center;margin-top:5px;font-family:var(--mono);font-size:10px;font-weight:500">${A.code(ECOS.code, 'vermillon')}${plage(ECOS)}</span></div>`, 'En ligne de tableau · 38 px') +
    fn(true, mini({ cernes: A.cernesDe(parCode('ECSI')).cernes, actif: 1, taille: 118 }), 'En tête de fiche · 150 px') +
    fn(true, `<div class="gd-geant">${A.empreinte({ cernes: [1, 1, 1, 0.62, 0.2], c: 'menthe', piste: '#1D4A47', actif: 3, cActif: 'miel' })}</div>`, 'Géante, coupée par les bords', 'gd-nuit') +
    fn(true, `${A.icone(46)}${A.icone(46, 'nuit', 'miel')}${A.icone(46, 'papier', 'vermillon')}`, 'En icône de l’outil') +
    fn(false, `<div class="gd-puces">${[0, 1, 2].map(() => `<p>${mini({ cernes: [1, 1, 1], taille: 20 })}<i></i></p>`).join('')}</div>`, 'En puce, sans donnée') +
    fn(false, mini({ cernes: [1, 1, 1, 1, 1, 0.8, 0.5, 0.2, 0], actif: 7, taille: 118 }), 'Plus de six boucles') +
    fn(false, `${mini({ cernes: [1, 0.7, 0.2], actif: 1, taille: 14 })}${mini({ cernes: [1, 0.7, 0.2], actif: 1, taille: 20 })}`, 'Sous 32 px') +
    fn(false, `<div style="transform:scaleX(-1) rotate(24deg)">${A.empreinte({ cernes: [1, 1, 0.6, 0.2], c: 'rose', piste: 'miel', taille: 108 })}</div>`, 'Retournée, recolorée');

  /* =================================================================== Les couleurs */
  const ROLES = U.ROLES || {};
  const nuance = (k) => `<button type="button" class="gd-nuance${k === 'blanc' || k === 'papier' ? ' gd-bord' : ''}" data-k="${k}" style="background:${C[k]};color:${lisible(C[k])}" aria-label="Copier ${N[k]}, ${C[k]}"><b>${N[k]}</b><span class="gd-mono">${C[k]}</span><small>${esc(ROLES[k] || '')}</small></button>`;
  $('#nuances').innerHTML = [['Relevées sur le logo officiel', 'gd-a', ['vermillon', 'ocre', 'lagune']], ['Relevées sur le rapport d’activité 2025', 'gd-b', ['papier', 'sable', 'corail', 'rose', 'peche', 'miel']], ['De l’application livrée, puis proposées', 'gd-b', ['emeraude', 'nuit', 'encre', 'blanc', 'menthe', 'brume']]]
    .map(([t, cls, ks]) => `<span class="gd-etiq gd-pal-t">${t}</span><div class="gd-pal ${cls}">${ks.map(nuance).join('')}</div>`).join('');
  $$('#nuances .gd-nuance').forEach((b) => b.addEventListener('click', () => copier(C[b.dataset.k], `${N[b.dataset.k]} · ${C[b.dataset.k]} copié`)));
  const PROP = U.PROP || [], fondDe = (k) => (k === 'aq' ? 'background:var(--aq-aube)' : `background:${C[k]}`);
  $('#proportions-barre').innerHTML = PROP.map(([k, v]) => `<div style="flex:${v};${fondDe(k)}"></div>`).join('');
  $('#proportions-legende').innerHTML = PROP.map(([k, v, t]) => `<span><u style="${fondDe(k)}"></u>${t}<b>${v}${NB}%</b></span>`).join('');
  $('#contrastes-table').innerHTML = (U.PAIRES || []).map(([a, b]) => { const r = A.contraste(C[a], C[b]);
    return `<div><span class="gd-ctr-e${b === 'blanc' ? ' gd-bord' : ''}" style="background:${C[b]};color:${C[a]}">Aa 761</span><p><b>${N[a]} sur ${N[b].toLowerCase()}</b><span>${verdict(r)}</span></p><i>${virg(r, 1)}</i></div>`; }).join('');
  const options = (sel) => CLES.map((k) => `<option value="${k}"${k === sel ? ' selected' : ''}>${N[k]}</option>`).join('');
  $('#ct-texte').innerHTML = options('lagune'); $('#ct-fond').innerHTML = options('blanc');
  const essai = () => { const a = $('#ct-texte').value, b = $('#ct-fond').value, r = A.contraste(C[a], C[b]), v = $('#ct-vue');
    v.style.background = C[b]; v.style.color = C[a]; v.dataset.ratio = String(r);
    v.innerHTML = `<span><b>${N[a]} sur ${N[b].toLowerCase()}</b><small>${verdict(r)}</small></span><i>${virg(r, 1)}</i>`; };
  $('#ct-texte').addEventListener('change', essai); $('#ct-fond').addEventListener('change', essai); essai();

  /* =================================================================== La typographie */
  const POLICES = [{ label: 'Nunito', f: 'var(--titre)', min: 200, max: 1000, g: 900 }, { label: 'Nunito Sans', f: 'var(--font)', min: 200, max: 1000, g: 400 }, { label: 'Geist Mono', f: 'var(--mono)', min: 100, max: 900, g: 500 }];
  const SP = { police: POLICES[0] };
  const specimen = () => { const v = $('#sp-vue'), t = +$('#sp-taille').value, g = +$('#sp-graisse').value;
    v.style.fontFamily = SP.police.f; v.style.fontWeight = g; v.style.fontSize = `min(${t}px, 21vw)`; v.textContent = $('#sp-texte').value || ' ';
    v.dataset.graisse = String(g); v.dataset.police = SP.police.label;
    $('#sp-taille-o').textContent = `${t}${NB}px`; $('#sp-graisse-o').textContent = String(g); };
  choix('#sp-police', POLICES, (p) => { SP.police = p; const g = $('#sp-graisse'); g.min = p.min; g.max = p.max; g.value = p.g; specimen(); });
  ['#sp-texte', '#sp-taille', '#sp-graisse'].forEach((s) => $(s).addEventListener('input', specimen));
  $('#graisses-liste').innerHTML = [['Nunito', 'var(--titre)', [600, 700, 800, 900], 'Un budget se lit'], ['Nunito Sans', 'var(--font)', [400, 500, 600, 700], 'Reste à exécuter'], ['Geist Mono', 'var(--mono)', [400, 500, 600], 'ECOS-MR-22']]
    .map(([nom, f, gs, mot]) => `<div class="gd-carte"><h3 class="gd-h3">${nom}</h3><div class="gd-gr gd-esp" style="font-family:${f}">${gs.map((g) => `<div style="font-weight:${g}"><i>${g}</i><span>${mot}</span></div>`).join('')}</div></div>`).join('');
  $('#hierarchie-liste').innerHTML = [
    ['Géant', 'Nunito 900 · interligne 0,86 · approche −0,05 em', `<p class="t-geant" style="font-size:clamp(46px,9vw,112px);color:${C.vermillon}">à l’euro près</p>`],
    ['Titre', 'Nunito 800 · interligne 0,96 · approche −0,035 em', '<p class="t-titre" style="font-size:clamp(28px,4vw,44px)">Un budget pluriannuel, lisible d’un regard.</p>'],
    ['Chapô', 'Nunito 600 · 24 px · interligne 1,28', `<p class="t-chapo" style="font-size:clamp(19px,2.2vw,24px)">${esc(PH.promesse)}</p>`],
    ['Texte', 'Nunito Sans 400 · 16 px · interligne 1,5', '<p class="t-txt" style="max-width:600px">Prorata temporis, budgets acquis et restants, répartition des coûts salariaux : les calculs se font seuls, les montants exécutés viennent de Sage.</p>'],
    ['Petit', 'Nunito Sans 400 · 13 px · interligne 1,45', `<p class="t-petit">Extrait le ${D.extraction.date} à ${D.extraction.heure}. Aucune ressaisie.</p>`],
    ['Étiquette', 'Geist Mono 500 · 10,5 px · capitales · approche +0,08 em', `<p class="t-mono">${ECOS.code} · ${A.euro(ECOS.total)} · ${A.pct(ECOS.taux, 1)}</p>`],
  ].map(([a, b, c]) => `<div><span class="gd-etiq"><b>${a}</b>${b}</span>${c}</div>`).join('');
  $('#ch-vue').innerHTML = [D.synthese.budget, ECOS.total, parCode('JPAT').total, parCode('ECOD').total, parCode('DEAR').total].map((n) => `<span>${A.nombre(n)}${NB}€</span>`).join('');
  choix('#ch-choix', [{ label: 'Tabulaires', k: 't' }, { label: 'Proportionnels', k: 'p' }], (o) => { const v = $('#ch-vue'); v.classList.toggle('gd-prop-n', o.k === 'p'); v.classList.toggle('chiffres', o.k === 't'); v.dataset.chiffres = o.k; });

  /* =================================================================== Matière et image */
  const AQ = Object.keys(A.AQUARELLES || { aube: '' });
  choix('#lavis-choix', AQ.map((n) => ({ label: n.charAt(0).toUpperCase() + n.slice(1), n })), (o) => { const p = $('#lavis-panneau');
    p.dataset.lavis = o.n; p.classList.toggle('gd-n', o.n === 'nuit');
    p.innerHTML = A.aquarelle(o.n, { cls: 'grain', pos: '50% 45%' }) + `<span class="gd-etiq">Lavis « ${o.n} » · ${esc(A.AQUARELLES[o.n])}</span><p class="gd-lavis-t">${esc(PH.cernes)}</p>`; A.typo(p); });
  $('#lavis-mini').innerHTML = AQ.map((n) => `<figure>${A.aquarelle(n)}<figcaption><b>${n}</b>${esc(A.AQUARELLES[n])}</figcaption></figure>`).join('');
  const filigrane = (on) => { const v = $('#filigrane-vue'), b = $('#filigrane-bt'); v.dataset.filigrane = on ? '1' : '0'; b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Filigrane posé' : 'Filigrane retiré';
    v.innerHTML = A.aquarelle('aube', { cls: 'grain', pos: '50% 40%', html: on ? A.filigrane({ c: 'blanc', op: 0.5 }) : '' }) + `<span class="gd-etiq">Lavis « aube »${on ? ' · filigrane blanc à 50 %' : ''}</span><p class="gd-lavis-t">${esc(A.SIGNATURE)}</p>`; };
  $('#filigrane-bt').addEventListener('click', () => filigrane($('#filigrane-vue').dataset.filigrane !== '1')); filigrane(true);
  /* La carte : l'échelle des épingles suit la taille du cadre */
  const TEINTES = U.TEINTES || {}, CADRE = [0, 0, 1000, 1166];
  let modeCarte = 'bureaux';
  const rendreCarte = () => { const v = $('#carte-vue'); if (typeof A.carte !== 'function' || !v.clientWidth) return;
    const ke = 1 / Math.min(v.clientWidth / CADRE[2], v.clientHeight / CADRE[3]), budgets = modeCarte === 'budgets';
    const ep = (ville, code, v0) => { const p = parCode(code), c = A.cernesDe(p); return { ville, v: v0, cernes: c.cernes, c: 'nuit' }; };
    v.dataset.mode = modeCarte;
    v.innerHTML = A.carte({ cadre: CADRE, par: 'xMidYMid meet', ke, terres: 'sable', filet: 'papier', pays: TEINTES, villes: !budgets, rVille: 3 * ke, cVille: 'encre',
        epingles: budgets ? [ep('Sélibaby', 'ECOS', 1), ep('Montreuil', 'ECSI', 0.6), ep('Tunis', 'JPAT', 0.7), ep('Conakry', 'OICC', 0.7), ep('Alger', 'PDLD', 0.6)] : [] }) +
      A.carte({ cadre: CADRE, par: 'xMidYMid meet', terres: null, pays: {}, villes: budgets ? ['Sélibaby', 'Montreuil', 'Tunis', 'Conakry', 'Alger'] : ['Montreuil', 'Nouakchott', 'Dakar', 'Bamako', 'Conakry', 'Tunis', 'Alger'], noms: true, tailleNom: 13.5 * ke, rVille: budgets ? 2 * ke : 0 }); };
  choix('#carte-choix', [{ label: 'Les bureaux', k: 'bureaux' }, { label: 'Les budgets', k: 'budgets' }], (o) => { modeCarte = o.k; rendreCarte(); });
  suivre($('#carte-vue'), rendreCarte);
  if (A.CARTE) $('#carte-bureaux').innerHTML = ['FR', 'MR', 'SN', 'ML', 'GN', 'GW', 'TN', 'DZ'].map((k) => { const vs = A.CARTE.villes.filter((v) => v.pays === k && /siège|antenne|bureau$/.test(v.note || ''));
    return `<li><b><u style="background:${A.col(TEINTES[k] || 'sable')}"></u>${D.pays[k]}</b><span>${vs.length ? vs.map((v) => esc(v.nom) + (v.note === 'siège' ? ' (siège)' : '')).join(', ') : '<span style="color:var(--gd-doux)">pas de bureau listé</span>'}</span></li>`; }).join('');
  const MODES = [{ label: 'Brute', mode: 'brut' }, { label: 'Sous lavis', mode: 'lavis' }, { label: 'En deux tons', mode: 'duo' }];
  choix('#photo-choix', MODES, (o) => { const v = $('#photos-vue'); v.dataset.mode = o.mode;
    v.innerHTML = Object.keys(A.PHOTOS).map((n) => `<figure>${A.photo(n, { mode: o.mode, aq: 'aube', c: 'peche', c2: 'nuit' })}</figure>`).join(''); }, 1);

  /* =================================================================== Graphiques et marge du comptable */
  const JG = { c: 'emeraude' };
  const jauge = () => { const v = $('#jg-v').value / 100, r = $('#jg-r').value / 100, d = Math.round((v - r) * 100), vue = $('#jg-vue');
    vue.innerHTML = A.jauge({ v, repere: r, w: 420, ep: 10, c: JG.c }); vue.dataset.v = String(Math.round(v * 100)); vue.dataset.c = JG.c;
    $('#jg-nb').textContent = A.pct(v); $('#jg-v-o').textContent = A.pct(v); $('#jg-r-o').textContent = A.pct(r);
    $('#jg-lecture').textContent = d === 0 ? 'Exécuté au prorata, exactement.' : `Exécuté à ${A.pct(v)}, pour ${A.pct(r)} attendus au prorata : ${Math.abs(d)} point${Math.abs(d) > 1 ? 's' : ''} ${d > 0 ? 'au-dessus' : 'en dessous'}.`; };
  $('#jg-v').addEventListener('input', jauge); $('#jg-r').addEventListener('input', jauge);
  choix('#jg-etat', [{ label: 'À jour', c: 'emeraude' }, { label: 'À regarder', c: 'vermillon' }], (o) => { JG.c = o.c; jauge(); });
  const courbe = (p) => { const v = $('#cb-vue'); v.dataset.p = String(Math.round(p * 100));
    v.innerHTML = A.courbe({ w: 1000, h: 340, labels: D.mois, max: 4400000, marge: [12, 16, 28, 62], series: [{ v: D.cumulPrevu, c: 'ocre', ep: 2.4, tirets: '1.5 7' }, { v: D.cumulExecute, c: 'lagune', ep: 3.8, echos: 8, pasEcho: 11 }], point: 1, p, id: 'gdc', attrs: 'role="img" aria-label="Exécuté cumulé de l’exercice, face au prorata attendu"' }); };
  let stopCb = null;
  $('#cb-rejouer').addEventListener('click', () => { if (stopCb) stopCb(); stopCb = anime(1200, (x) => courbe(Math.min(0.999, A.ease(x))), () => courbe(1)); });
  courbe(1);
  $('#an-vue').innerHTML = A.annees({ w: 520, h: 270, annees: (U.FICHE || APP.FICHE || { annees: [] }).annees, ep: 26, attrs: `role="img" aria-label="Budget d’${ECOS.code} par année, prévu et exécuté"` }) + `<span class="gd-etiq">${ECOS.code} · budget par année · prévu et exécuté</span>`;
  $('#mg-codes').innerHTML = PJ.map((p) => A.code(p.code, p.alerte ? 'vermillon' : 'lagune')).join('');
  const montant = () => { const n = Math.max(0, Math.min(99999999, Math.round(+$('#mg-montant').value || 0))), v = $('#mg-vue'); v.innerHTML = A.montant(n); v.dataset.txt = A.euro(n); v.style.color = C.lagune; };
  $('#mg-montant').addEventListener('input', montant); montant();
  $('#mg-tampons').innerHTML = A.tampon(`Extrait de Sage · ${D.extraction.court}`) + A.tampon('Modifié par Julien P. · 14:52', 'ocre') + A.tampon('ECOS · se termine dans 8 mois', 'vermillon');

  /* =================================================================== L'interface : les écrans, vivants */
  const ECRANS = [['tableauDeBord', 'Tableau de bord'], ['ficheProjet', 'Fiche projet'], ['projets', 'Projets'], ['projetsGrille', 'Projets en empreintes'], ['rh', 'Ressources humaines'], ['affectation', 'Affectation'],
    ['sage', 'Extraction Sage'], ['nouveauProjet', 'Nouveau projet'], ['stats', 'Statistiques'], ['journal', 'Journal'], ['admin', 'Administration'], ['connexion', 'Connexion']].filter(([n]) => existe(n)).map(([n, t]) => ({ n, label: t, t }));
  const TELS = [['mAccueil', 'Accueil'], ['mProjet', 'Projet'], ['mAlerte', 'Alerte']].filter(([n]) => existe(n)).map(([n, t]) => ({ n, label: t, t }));
  const EC = { nom: ECRANS.length ? ECRANS[0].n : null, rendu: null, tel: TELS.length ? TELS[0].n : null, telRendu: null };
  const ajusterEcran = () => { const el = $('#ecran'), w = el.clientWidth; if (!w || !EC.nom) return; const k = w / 1440;
    if (EC.rendu !== EC.nom) { let html = ''; try { html = APP[EC.nom]({ id: 'gde' }); } catch (e) { html = `<p style="padding:40px">Cet écran n’a pas pu être rendu.</p>`; }
      el.innerHTML = `<div>${html}</div>`; A.typo(el); el.scrollTop = 0; EC.rendu = EC.nom; }
    el.firstElementChild.style.zoom = k; el.style.height = Math.round(900 * k) + 'px'; el.dataset.ecran = EC.nom;
    $('#ecran-note').innerHTML = `Rendu par <code>Marque.app.${EC.nom}()</code> · 1440 px, à l’échelle ${virg(k, 2)} · la fenêtre défile.`; };
  if (ECRANS.length) choix('#tabs', ECRANS, (o) => { EC.nom = o.n; $('#ecran-url').textContent = `${A.PRODUIT} · ${o.t}`; ajusterEcran(); });
  else $('#ecran-note').textContent = 'Les écrans de l’outil ne sont pas encore livrés.';
  suivre($('#ecran'), ajusterEcran);
  const ajusterTel = () => { const el = $('#phone'), w = el.clientWidth; if (!w || !EC.tel) return; const k = Math.min(0.8, (w - 32) / 414);
    if (EC.telRendu !== EC.tel + k) { el.innerHTML = A.aquarelle('brume', { cls: 'grain' }) + A.phone(APP[EC.tel]({}), +k.toFixed(3)); A.typo(el); EC.telRendu = EC.tel + k; }
    el.dataset.ecran = EC.tel; };
  if (TELS.length) choix('#tabs-tel', TELS, (o) => { EC.tel = o.n; ajusterTel(); });
  else { $('#tabs-tel').hidden = true; $('#phone').innerHTML = '<p class="gd-note" style="padding:0 24px">Les écrans de téléphone ne sont pas encore livrés.</p>'; }
  suivre($('#phone'), ajusterTel);
  /* Composants : les briques du socle, dans une racine .dj réduite à ses variables */
  const dj = (html, st = '') => `<div class="dj gd-dj" style="${st}">${html}</div>`;
  const comp = (t, html, cls = '') => `<div class="gd-carte ${cls}"><span class="gd-etiq">${t}</span>${html}</div>`;
  if (APP.btn) $('#composants-liste').innerHTML =
    comp('Boutons', dj(`<div class="gd-rang">${APP.btn('Nouveau projet', 'p', 'plus')}${APP.btn('Exporter', '', 'export')}${APP.btn('Filtrer', 's', 'filtre')}${APP.btn('Ajouter une ligne', 's', 'plus')}</div>`)) +
    comp('Sur la nuit', dj(`<div class="gd-rang">${APP.btn('Extraire', 'clair', 'sync')}${APP.chip('À jour', 'ok')}${A.tampon('Sage · à jour')}</div>`, 'color:var(--blanc)'), 'gd-nuit') +
    comp('Pastilles', dj(`<div class="gd-rang">${APP.statut('Signé')}${APP.statut('En attente')}${APP.chip('100 % acquis', 'lag', false)}${APP.chip('4', 'al', false)}${D.projets.slice(0, 3).map((p) => A.code(p.code, p.alerte ? 'vermillon' : 'lagune')).join('')}</div>`)) +
    comp('Personnes · jusqu’à trois par ligne', dj(`<div class="gd-rang" style="gap:18px">${APP.av(D.personnes[0].nom)}${APP.avs(D.personnes.slice(1, 4).map((p) => p.nom))}${APP.avs(D.personnes.slice(4, 6).map((p) => p.nom), 2)}</div>`)) +
    comp('Champs', dj(`<div style="display:grid;gap:14px;grid-template-columns:repeat(2,minmax(0,1fr))"><div class="dj-champ">Code analytique<div>${APP.ico('document')}ECOS-MR-22</div></div><div class="dj-champ">Budget total<div class="foc">${A.nombre(ECOS.total)}<i>€</i></div></div></div>`)) +
    comp('Onglets et chiffre', dj(`<div class="gd-rang" style="gap:22px"><span class="dj-seg"><span class="on">Cumul</span><span>Mensuel</span></span><div>${APP.lbl('Reste à exécuter')}<div style="font-size:30px;margin-top:6px;color:${C.lagune}">${APP.num(ECOS.total - ECOS.execute)}</div></div></div>`));
  if (APP.ICO) $('#pictos').innerHTML = Object.keys(APP.ICO).map((n) => `<div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${APP.ICO[n]}"${n === 'points' ? ' stroke-width="2.6"' : ''}/></svg>${n}</div>`).join('');

  /* =================================================================== Le mouvement : un seul geste, à rejouer */
  $('#mv-scene').innerHTML = '<div class="gd-mv-s" id="mv-s"></div><div class="gd-mv-e" id="mv-e"></div><div class="gd-mv-c"><span class="gd-etiq">' + `${ECOS.code} · exécuté` + '</span><b id="mv-n"></b><div id="mv-j"></div></div>';
  const TOT_M = 1600;
  const geste = (x) => { const t = x * TOT_M;
    $('#mv-s').innerHTML = A.symbolTrace({ p: [0, 1, 2, 3, 4].map((i) => A.ease((t - i * 120) / 1000)), piste: 'sable', id: 'gdm' });
    $('#mv-e').innerHTML = A.empreinte({ cernes: cE.cernes.map((v, i) => v * A.ease((t - i * DEC) / DUR)), actif: cE.actif });
    const k = A.ease(t / 1200); $('#mv-n').innerHTML = `${A.nombre(ECOS.execute * k)}<i>€</i>`; $('#mv-j').innerHTML = A.jauge({ v: ECOS.taux * k, repere: APP.ecoule ? APP.ecoule(ECOS) : null, w: 420, ep: 9, c: 'vermillon' }); };
  let stopMv = null;
  const poser = (etat) => { $('#mv-scene').dataset.etat = etat; $('#mv-etat').textContent = etat === 'trace' ? 'Le trait s’enroule' : 'Posé : l’image ne bouge plus'; };
  $('#rejouer').addEventListener('click', () => { if (stopMv) stopMv(); poser('trace'); $('#mv-scene').dataset.jeux = String(+($('#mv-scene').dataset.jeux || 0) + 1); stopMv = anime(TOT_M, geste, () => poser('pose')); });
  geste(1); poser('pose');
  $('#mv-courbe').innerHTML = `<span class="gd-etiq">La courbe · sortie quartique</span>` + (U.courbeEase || '').replace('<svg ', '<svg style="display:block;width:100%;height:auto;margin-top:10px" role="img" aria-label="Courbe de sortie quartique : rapide au départ, lente à l’arrivée" ');

  /* =================================================================== En situation : galerie filtrable et visionneuse */
  const G = (Array.isArray(window.GuideGalerie) ? window.GuideGalerie : []).map((m) => ({ ...m, v: /\.mp4$/i.test(m.f), stem: m.f.replace(/\.[^.]+$/, '') }));
  const SECTIONS = [...new Set(G.map((m) => m.s))];
  let filtre = null, liste = G;
  const dessinerGal = () => { liste = filtre ? G.filter((m) => m.s === filtre) : G;
    $('#gal').innerHTML = liste.length ? liste.map((m, i) => `<button type="button" data-i="${i}" aria-label="Agrandir : ${esc(m.t)}${m.v ? ' (vidéo)' : ''}"><span class="gd-im"><img src="media/vignettes/${m.stem}.jpg" alt="" loading="lazy"></span><span class="gd-gal-leg"><i>${esc(m.s)}${m.v ? ' · vidéo' : ''}</i>${esc(m.t)}</span></button>`).join('')
      : '<p class="gd-note">Aucun média pour l’instant : la galerie se remplit à l’assemblage, depuis presentation.json.</p>';
    $$('#gal button').forEach((b) => b.addEventListener('click', () => ouvrirLb(liste, +b.dataset.i))); };
  choix('#filters', [{ label: `Tout <span>${G.length}</span>`, s: null }].concat(SECTIONS.map((s) => ({ label: `${esc(s)} <span>${G.filter((m) => m.s === s).length}</span>`, s }))), (f) => { filtre = f.s; dessinerGal(); });
  /* Les vidéos du chapitre « mouvement » : celles que l'assemblage a rangées dans media/ */
  const V = G.filter((m) => m.v);
  $('#videos-liste').innerHTML = V.length ? V.map((m) => `<figure><video src="media/${m.f}" poster="media/vignettes/${m.stem}.jpg" controls muted loop playsinline preload="none" aria-label="${esc(m.t)}"></video><figcaption>${esc(m.t)}</figcaption></figure>`).join('')
    : '<p class="gd-note">Les vidéos arrivent à l’assemblage, avec les médias de l’étude de cas.</p>';

  const lb = $('#lb'); let lbL = [], lbI = 0, lbRetour = null;
  const dessinerLb = () => { const m = lbL[lbI];
    $('#lb-m').innerHTML = m.v ? `<video src="media/${m.f}" autoplay loop muted playsinline controls aria-label="${esc(m.t)}"></video>` : `<img src="media/${m.f}" alt="${esc(m.t)}">`;
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

  /* =================================================================== Ressources */
  $('#pdf').href = PDF;
  const nbPages = (window.GuideOrder || []).length;
  $('#pdf-texte').textContent = `Le guide de marque complet, ${nbPages} pages au format 16:9. Les pages du PDF sont des images : le rendu est celui de l’écran, le texte ne se sélectionne pas.`;
  const O = A.ORIGINES || {}, groupe = (re) => CLES.filter((k) => re.test(O[k] || '')).map((k) => `  --${k}: ${C[k]};`).join('\n');
  const VARS = `:root {\n  /* GRDR : relevées sur le logo et le rapport d’activité 2025 */\n${groupe(/^officiel/)}\n  /* de l’application livrée */\n${groupe(/^outil/)}\n  /* propositions */\n${groupe(/^proposition/)}\n\n  /* rôles */\n  --scene: var(--papier);\n  --sur-scene: var(--encre);\n  --vif: var(--vermillon);\n  --moyen: var(--ocre);\n  --sombre: var(--nuit);\n  --doux: var(--sable);\n\n  /* polices */\n  --titre: "Nunito", system-ui, sans-serif;\n  --font: "Nunito Sans", system-ui, sans-serif;\n  --mono: "Geist Mono", ui-monospace, monospace;\n}`;
  $('#variables-code').textContent = VARS;
  $('#copier-variables').addEventListener('click', () => copier(VARS, 'Variables copiées'));

  /* =================================================================== Tests des éléments vivants (tools/check_inter.mjs) */
  const ecosC = A.cernesDe(ECOS).cernes.map((v) => +v.toFixed(2)).join(',');
  window.GuideTests = [
    { nom: 'accueil : un clic passe à l’empreinte du projet suivant', page: 'accueil', capture: '#accueil-vivant',
      actions: [{ clic: '#accueil-emp' }, { attendre: 1500 }],
      verifie: () => $('#accueil-emp').dataset.code === PJ[1].code && $$('#accueil-emp svg path').length > 0 },
    { nom: 'logo : le fond choisi impose sa version', page: 'versions', capture: '#logo-scene',
      actions: [{ clic: '#logo-fonds button:nth-child(5)' }],
      verifie: () => $('#logo-scene').dataset.fond === 'nuit-blanc' && $('#logo-scene svg path').getAttribute('fill') === C.blanc },
    { nom: 'logo : fonds au clavier', page: 'versions',
      actions: [{ touche: 'ArrowRight', sur: '#logo-fonds button:nth-child(1)' }],
      verifie: () => $('#logo-scene').dataset.fond === 'papier' && document.activeElement === $('#logo-fonds button:nth-child(2)') },
    { nom: 'logo : le curseur pilote le tracé du symbole', page: 'trace', capture: '#trace-vue',
      actions: [{ remplir: '#trace-p', valeur: '30' }],
      verifie: () => $('#trace-vue').dataset.p === '30' && $$('#trace-vue svg mask').length === 5 },
    { nom: 'logo : rejouer le tracé va au bout', page: 'trace',
      actions: [{ remplir: '#trace-p', valeur: '0' }, { clic: '#trace-rejouer' }, { attendre: 1900 }],
      verifie: () => $('#trace-vue').dataset.p === '100' },
    { nom: 'atelier : le nombre d’années règle les boucles', page: 'atelier', capture: '#at-vue',
      actions: [{ remplir: '#at-n', valeur: '6' }],
      verifie: () => $('#at-vue').dataset.n === '6' && $$('#at-curseurs input').length === 6 && $$('#at-emp svg path').length >= 6 },
    { nom: 'atelier : un curseur retrace sa boucle', page: 'atelier',
      actions: [{ remplir: '#at-c0', valeur: '40' }],
      verifie: () => $('#at-vue').dataset.cernes.split(',')[0] === '0.4' && /^\d/.test(($$('#at-emp svg path')[4] || $$('#at-emp svg path')[0]).getAttribute('stroke-dasharray') || '') },
    { nom: 'atelier : un projet réel se charge d’un clic', page: 'projets', capture: '#at-vue',
      actions: [{ clic: '#at-projets button[data-code="ECOS"]' }, { attendre: 1700 }],
      verifie: () => $('#at-vue').dataset.projet === 'ECOS' && $('#at-vue').dataset.cernes === ecosC && $$('#at-curseurs input').length === A.cernesDe(ECOS).annees.length && $('#at-projets button[data-code="ECOS"]').getAttribute('aria-pressed') === 'true' },
    { nom: 'atelier : le fond passe à la nuit', page: 'atelier',
      actions: [{ clic: '#at-fond button:nth-child(2)' }],
      verifie: () => $('#at-vue').classList.contains('gd-n') },
    { nom: 'couleurs : un clic copie le code', page: 'palette', capture: '#nuances',
      actions: [{ clic: '#nuances .gd-nuance[data-k="vermillon"]' }],
      verifie: async () => (await navigator.clipboard.readText()) === C.vermillon && $('#toast').textContent.includes(C.vermillon) },
    { nom: 'couleurs : le contraste se calcule', page: 'contrastes', capture: '#ct-vue',
      actions: [{ choisir: '#ct-texte', valeur: 'vermillon' }, { choisir: '#ct-fond', valeur: 'blanc' }],
      verifie: () => $('#ct-vue').dataset.ratio === String(A.contraste(C.vermillon, C.blanc)) && $('#ct-vue').textContent.includes('grands titres') },
    { nom: 'typographie : la graisse suit le curseur', page: 'specimen', capture: '#sp-vue',
      actions: [{ remplir: '#sp-graisse', valeur: '600' }, { remplir: '#sp-texte', valeur: 'reste à exécuter' }],
      verifie: () => $('#sp-vue').dataset.graisse === '600' && getComputedStyle($('#sp-vue')).fontWeight === '600' && $('#sp-vue').textContent === 'reste à exécuter' },
    { nom: 'typographie : chiffres tabulaires ou proportionnels', page: 'chiffres',
      actions: [{ clic: '#ch-choix button:nth-child(2)' }],
      verifie: () => $('#ch-vue').dataset.chiffres === 'p' && $('#ch-vue').classList.contains('gd-prop-n') },
    { nom: 'matière : le lavis change derrière le panneau', page: 'lavis', capture: '#lavis-panneau',
      actions: [{ clic: '#lavis-choix button:nth-child(2)' }],
      verifie: () => $('#lavis-panneau').dataset.lavis === AQ[1] && $('#lavis-panneau img').getAttribute('src').includes('aq-' + AQ[1]) },
    { nom: 'matière : le filigrane se retire', page: 'filigrane',
      actions: [{ clic: '#filigrane-bt' }],
      verifie: () => $('#filigrane-vue').dataset.filigrane === '0' && !$('#filigrane-vue .filigrane') && $('#filigrane-bt').getAttribute('aria-pressed') === 'false' },
    { nom: 'matière : la carte passe des bureaux aux budgets', page: 'carte', capture: '#carte-vue',
      actions: [{ clic: '#carte-choix button:nth-child(2)' }, { attendre: 200 }],
      verifie: () => $('#carte-vue').dataset.mode === 'budgets' && $$('#carte-vue svg g path').length > 4 },
    { nom: 'matière : le traitement photo change', page: 'photos', capture: '#photos-vue',
      actions: [{ clic: '#photo-choix button:nth-child(3)' }],
      verifie: () => $('#photos-vue').dataset.mode === 'duo' && $$('#photos-vue .ph.duo').length === 3 },
    { nom: 'graphiques : la jauge suit ses curseurs', page: 'jauge', capture: '#jg-vue',
      actions: [{ remplir: '#jg-v', valeur: '40' }, { remplir: '#jg-r', valeur: '55' }, { clic: '#jg-etat button:nth-child(2)' }],
      verifie: () => $('#jg-vue').dataset.v === '40' && $('#jg-vue').dataset.c === 'vermillon' && $('#jg-lecture').textContent.includes('15 points en dessous') },
    { nom: 'graphiques : la courbe se retrace', page: 'courbe',
      actions: [{ clic: '#cb-rejouer' }, { attendre: 1500 }],
      verifie: () => $('#cb-vue').dataset.p === '100' && !!$('#cb-vue svg circle') },
    { nom: 'marge : le montant s’écrit à l’euro près', page: 'marge', capture: '#mg-vue',
      actions: [{ remplir: '#mg-montant', valeur: '15628761' }],
      verifie: () => $('#mg-vue').dataset.txt === A.euro(15628761) },
    { nom: 'interface : un onglet par écran livré, et il change l’écran', page: 'ecrans', capture: '#ecran',
      actions: [{ attendre: 300 }, { clic: '#tabs button:nth-child(2)' }, { attendre: 300 }],
      verifie: () => $$('#tabs button').length === ECRANS.length && ECRANS.every((e) => existe(e.n)) && $('#ecran').dataset.ecran === ECRANS[Math.min(1, ECRANS.length - 1)].n && !!$('#ecran .dj') },
    { nom: 'interface : les écrans de téléphone', page: 'telephone', capture: '#phone',
      actions: [{ attendre: 300 }, ...(TELS.length > 1 ? [{ clic: '#tabs-tel button:last-child' }, { attendre: 300 }] : [])],
      verifie: () => (TELS.length ? $('#phone').dataset.ecran === TELS[TELS.length - 1].n && !!$('#phone .djm') : $('#tabs-tel').hidden) },
    { nom: 'mouvement : rejouer relance le geste, puis l’image se pose', page: 'regle', capture: '#mv-scene',
      actions: [{ clic: '#rejouer' }, { attendre: 2100 }],
      verifie: () => $('#mv-scene').dataset.jeux === '1' && $('#mv-scene').dataset.etat === 'pose' && $('#mv-n').textContent.replace(/\D/g, '') === String(ECOS.execute) },
    { nom: 'ressources : les variables se copient', page: 'variables',
      actions: [{ clic: '#copier-variables' }],
      verifie: async () => (await navigator.clipboard.readText()).includes('--vermillon: ' + C.vermillon) },
  ];

  montrer();
  /* Au chargement, le navigateur descend de lui-même vers l'ancre : pour une page entière, on reste en haut */
  window.addEventListener('load', () => { const c = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (!c || c.classList.contains('page')) window.scrollTo(0, 0); });
  if (calme) document.documentElement.classList.add('gd-calme');
})();
