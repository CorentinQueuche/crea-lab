/* SITE DU GUIDE — gabarit neutre (site/assets/guide.js) : navigation, éléments vivants, visionneuse, téléchargements.
   Tout ce qui est dessiné vient du socle (window.Marque) : rien n'est redessiné ici.

   CE QUE LES OUTILS ATTENDENT (à garder) :
   - Navigation : #nav rempli depuis les .page (data-title, data-subs) ; la page visible porte .on ; une ancre de section
     ouvre sa page puis y descend ; [data-pager] (classe pager) reçoit les liens précédent et suivant ; #burger ouvre et
     ferme #sommaire en version mobile (aria-expanded), Échap le ferme.
   - Visionneuse #lb : .on quand elle est ouverte ; flèches, Échap, focus gardé dedans puis rendu au bouton d'origine.
   - window.GuideTests : la liste des éléments propres au site que tools/check_inter.mjs doit tester (format en tête de
     check_inter.mjs). Chaque élément vivant qu'on ajoute y gagne une entrée.
   - Fichiers : logo/<slug>-<version>-<couleur>.svg (export_logo.py), logo/<slug>-logos.zip et
     deck/<slug>-guide-de-marque.pdf (build_site.py) ; vignettes media/vignettes/<nom>.jpg, médias media/<fichier>.

   À RÉÉCRIRE : les sections « page type » (un exemple de chaque mécanisme, à copier puis à remplacer par les vrais
   éléments de la marque) et les textes. Les règles chiffrées (tailles, proportions, durées) sont des choix de direction
   artistique : les décider dans MARQUE.md, puis les écrire ici. */
(function () {
  'use strict';
  const A = window.Marque, C = A.COULEURS, N = A.NOMS || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CLES = Object.keys(C);
  /* Couleur de texte la plus lisible sur un fond (calculée, jamais devinée) */
  const lisible = (fond) => (A.contraste(fond, '#FFFFFF') >= A.contraste(fond, '#000000') ? '#FFFFFF' : '#000000');

  /* ---------- Petits outils ---------- */
  const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('gd-ouvert'); clearTimeout(toast.k); toast.k = setTimeout(() => t.classList.remove('gd-ouvert'), 1800); };
  const copier = async (texte, msg) => {
    try { await navigator.clipboard.writeText(texte); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = texte; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toast(msg || 'Copié');
  };
  /* Groupe de boutons à choix unique : aria-pressed, flèches gauche et droite, appel immédiat sur l'élément initial */
  const choix = (sel, items, f, i0 = 0) => {
    const el = $(sel);
    el.innerHTML = items.map((it, i) => `<button type="button" aria-pressed="false" data-i="${i}">${it.label}</button>`).join('');
    const bts = $$('button', el);
    const set = (i) => { bts.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i))); f(items[i], i); };
    bts.forEach((b, i) => {
      b.addEventListener('click', () => set(i));
      b.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
        e.preventDefault(); const j = (i + d + bts.length) % bts.length; set(j); bts[j].focus(); });
    });
    set(i0); return set;
  };

  /* ---------- Marque partout : logos, titre, icône ---------- */
  $$('[data-logo]').forEach((el) => { el.innerHTML = A.wordmark('currentColor', 'aria-hidden="true"'); });
  $('#favicon').href = `logo/${A.SLUG}-symbole-${Object.keys(A.COULEURS_LOGO)[0]}.svg`;
  $('#lb-prec').innerHTML = A.fleche('currentColor', '', 180); $('#lb-suiv').innerHTML = A.fleche('currentColor');
  $('#lb-fermer').innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>';

  /* =================================================================== Pages, sommaire, navigation */
  const pages = $$('.page').map((el, i) => ({ el, id: el.id, i, title: el.dataset.title,
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
      document.title = (pageEl === pages[0].el ? '' : pageEl.dataset.title + ' — ') + A.NOM + ', guide de marque';
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

  /* =================================================================== Accueil */
  const PDF = `deck/${A.SLUG}-guide-de-marque.pdf`;
  $('#accueil-pdf').href = PDF;
  $('#tuiles').innerHTML = pages.slice(1).map((p) => `<a href="#${p.id}" class="gd-tuile"><i>${pad(p.i)}</i><span>${esc(p.title)}</span></a>`).join('');

  /* =================================================================== Page type : un élément réglable relié au socle */
  const FONDS = CLES.map((k) => ({ label: esc(k), k }));
  choix('#reglage-choix', FONDS, (f) => {
    const sc = $('#reglage-scene'), fond = C[f.k], fg = lisible(fond);
    sc.dataset.fond = f.k; sc.style.background = fond; sc.style.color = fg;
    sc.setAttribute('aria-label', `Le logo sur le fond ${f.k} (${fond})`);
    sc.innerHTML = `${A.symbol('currentColor', 'class="gd-scene-sym" aria-hidden="true"')}${A.wordmark('currentColor', 'class="gd-scene-mot" aria-hidden="true"')}<span class="gd-etiq">${f.k} · ${fond} · contraste ${String(A.contraste(fg, fond)).replace('.', ',')} : 1</span>`;
  });

  /* =================================================================== Page type : une valeur à copier */
  $('#nuances').innerHTML = CLES.map((k) => `<button type="button" class="gd-nuance" data-k="${k}" aria-label="Copier ${k}, ${C[k]}"><span class="gd-nuance-vu" style="background:${C[k]}"></span><b>${esc(N[k] || k)}</b><span class="gd-mono">${C[k]}</span></button>`).join('');
  $$('#nuances .gd-nuance').forEach((b) => b.addEventListener('click', () => copier(C[b.dataset.k], `${C[b.dataset.k]} copié`)));

  /* =================================================================== Page type : galerie filtrable et visionneuse */
  const G = (Array.isArray(window.GuideGalerie) ? window.GuideGalerie : []).map((m) => ({ ...m, v: /\.mp4$/i.test(m.f), stem: m.f.replace(/\.[^.]+$/, '') }));
  const SECTIONS = [...new Set(G.map((m) => m.s))];
  let filtre = null, liste = G;
  const dessinerGal = () => { liste = filtre ? G.filter((m) => m.s === filtre) : G;
    $('#gal').innerHTML = liste.length ? liste.map((m, i) => `<button type="button" data-i="${i}" aria-label="Agrandir : ${esc(m.t)}${m.v ? ' (vidéo)' : ''}"><span class="gd-im"><img src="media/vignettes/${m.stem}.jpg" alt="" loading="lazy"></span><span class="gd-gal-leg"><i>${esc(m.s)}${m.v ? ' · vidéo' : ''}</i>${esc(m.t)}</span></button>`).join('')
      : '<p class="gd-note">Aucun média pour l’instant : la galerie se remplit à l’assemblage, depuis presentation.json.</p>';
    $$('#gal button').forEach((b) => b.addEventListener('click', () => ouvrirLb(liste, +b.dataset.i))); };
  choix('#filters', [{ label: `Tout <span>${G.length}</span>`, s: null }].concat(SECTIONS.map((s) => ({ label: `${esc(s)} <span>${G.filter((m) => m.s === s).length}</span>`, s }))), (f) => { filtre = f.s; dessinerGal(); });

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

  /* =================================================================== Télécharger */
  /* Les fichiers que tools/export_logo.py écrit dans brand/logo/ : <slug>-<version>-<couleur>.svg.
     Versions : celles d'export_logo.py (plus celles de Marque.fichiersLogo si le socle en déclare). Couleurs : Marque.COULEURS_LOGO. */
  const LOGOS = {
    versions: [['logotype', 'Logotype', (c, a) => A.wordmark(c, a)], ['symbole', 'Symbole', (c, a) => A.symbol(c, a)], ['complet', 'Version complète', (c, a) => A.lockup(c, a)]],
    couleurs: Object.keys(A.COULEURS_LOGO),
  };
  const fichierLogo = (v, c) => `logo/${A.SLUG}-${v}-${c}.svg`;
  $('#logos-tete').innerHTML = '<th scope="col">Version</th>' + LOGOS.couleurs.map((c) => `<th scope="col">${esc(c)}</th>`).join('');
  $('#logos-table').innerHTML = LOGOS.versions.map(([k, t, f]) => `<tr><th scope="row"><span class="gd-dl-v"><span class="gd-dl-apercu">${f('currentColor', 'aria-hidden="true"')}</span>${t}</span></th>` +
    LOGOS.couleurs.map((c) => `<td><a class="gd-bt gd-creux gd-petit" href="${fichierLogo(k, c)}" download aria-label="${t}, ${esc(c)}, SVG">SVG</a></td>`).join('') + '</tr>').join('');
  $('#nb-logos').textContent = `${LOGOS.versions.length * LOGOS.couleurs.length} fichiers SVG : ${LOGOS.versions.length} versions en ${LOGOS.couleurs.length} couleurs.`;
  $('#zip').href = `logo/${A.SLUG}-logos.zip`;
  $('#pdf').href = PDF;
  const nbPages = (window.GuideOrder || []).length;
  $('#pdf-texte').textContent = `Le guide de marque complet, ${nbPages} pages au format 16:9. Les pages du PDF sont des images : le rendu est celui de l’écran, le texte ne se sélectionne pas.`;

  /* =================================================================== Tests des éléments propres au site (check_inter.mjs) */
  window.GuideTests = [
    { nom: 'élément réglable : le fond suit le choix', page: 'reglage', capture: '#reglage-scene',
      actions: [{ clic: '#reglage-choix button:nth-child(2)' }],
      verifie: () => $('#reglage-scene').dataset.fond === CLES[1] },
    { nom: 'élément réglable : au clavier', page: 'reglage',
      actions: [{ touche: 'ArrowRight', sur: '#reglage-choix button:nth-child(2)' }],
      verifie: () => $('#reglage-scene').dataset.fond === CLES[2] && document.activeElement === $('#reglage-choix button:nth-child(3)') },
    { nom: 'copie : la valeur arrive dans le presse-papiers', page: 'copie', capture: '#nuances',
      actions: [{ clic: '#nuances button:nth-child(1)' }],
      verifie: async () => (await navigator.clipboard.readText()) === C[CLES[0]] && $('#toast').textContent.includes(C[CLES[0]]) },
  ];

  montrer();
  if (calme) document.documentElement.classList.add('gd-calme');
})();
