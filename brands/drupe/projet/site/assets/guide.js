/* Guide de marque Drupe — navigation et éléments vivants.
   Les couleurs, le logo, les pastilles, le semis et les écrans viennent du socle (window.Marque) : rien n'est redessiné ici. */
(function () {
  const A = window.Marque, C = A.COULEURS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, '0');
  const NB = ' '; // espace insécable

  /* ---------- Copier, message ---------- */
  const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.k); toast.k = setTimeout(() => t.classList.remove('on'), 1600); };
  const copy = async (text, msg) => {
    try { await navigator.clipboard.writeText(text); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toast(msg || 'Copié');
  };

  /* ---------- Données de marque ---------- */
  // Ordre de la planche Palette : du vert au rouge, puis les encres. g = largeur relative de la bande.
  const COLORS = [
    { k: 'feuille', n: 'Feuille', r: 'Fond dense, accent', g: 1.1 },
    { k: 'vert', n: 'Café vert', r: 'Aplat doux', g: 1.3 },
    { k: 'parche', n: 'Parche', r: 'Fond de marque', g: 2.4 },
    { k: 'fleur', n: 'Fleur', r: 'Papier, cartes', g: 2.2 },
    { k: 'pulpe', n: 'Pulpe', r: 'Lumière', g: 1.3 },
    { k: 'cerise', n: 'Cerise', r: 'Vive, rare', g: 0.8 },
    { k: 'grain', n: 'Grain', r: 'Encre du texte', g: 1 },
    { k: 'marc', n: 'Marc', r: '3D et vidéo', g: 0.8 },
  ].map((c) => ({ ...c, h: C[c.k] }));
  const hex = (n) => (COLORS.find((c) => c.n === n || c.k === n) || {}).h;
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const lum = (h) => { const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const surFonce = (h) => lum(h) < 0.3;
  const encreSur = (h) => (surFonce(h) ? C.fleur : C.grain);
  const virgule = (x, d = 1) => x.toFixed(d).replace('.', ',');

  /* ---------- Pages, sommaire, navigation ---------- */
  const pages = $$('.page').map((el, i) => ({ el, id: el.id, i, title: el.dataset.title, subs: (el.dataset.subs || '').split('|').filter(Boolean).map((s) => { const k = s.indexOf(':'); return { id: s.slice(0, k), t: s.slice(k + 1) }; }) }));
  $('#marque-lien').innerHTML = A.wordmark(C.cerise, 'aria-hidden="true"') + '<span>Guide<br>de marque</span>';
  $('#nav').innerHTML = pages.map((p) => `<a href="#${p.id}" data-p="${p.id}"><i>${p.i ? pad(p.i) : '—'}</i>${p.title}</a>` + (p.subs.length ? `<div class="sous" data-s="${p.id}">${p.subs.map((s) => `<a href="#${s.id}">${s.t}</a>`).join('')}</div>` : '')).join('');
  pages.forEach((p) => {
    const prev = pages[p.i - 1], next = pages[p.i + 1];
    $('[data-pager]', p.el).innerHTML = (prev ? `<a href="#${prev.id}"><span>← Précédent</span><b>${prev.title}</b></a>` : '') + (next ? `<a href="#${next.id}"><span>Suivant →</span><b>${next.title}</b></a>` : '');
  });
  let current = null;
  const show = () => {
    const id = decodeURIComponent(location.hash.slice(1)) || 'accueil';
    const target = document.getElementById(id) || pages[0].el;
    const pageEl = target.classList.contains('page') ? target : target.closest('.page') || pages[0].el;
    if (pageEl !== current) {
      pages.forEach((p) => p.el.classList.toggle('on', p.el === pageEl));
      $$('#nav > a').forEach((a) => { const on = a.dataset.p === pageEl.id; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      $$('#nav .sous').forEach((s) => s.classList.toggle('on', s.dataset.s === pageEl.id));
      current = pageEl;
      document.title = (pageEl.id === 'accueil' ? '' : pageEl.dataset.title + ' — ') + 'Drupe, guide de marque';
      $$('video').forEach((v) => { if (!pageEl.contains(v)) v.pause(); });
    }
    $('#sommaire').classList.remove('open'); $('#burger').setAttribute('aria-expanded', 'false');
    if (target === pageEl) window.scrollTo(0, 0); else requestAnimationFrame(() => target.scrollIntoView());
  };
  window.addEventListener('hashchange', show);
  $('#burger').addEventListener('click', () => { const o = $('#sommaire').classList.toggle('open'); $('#burger').setAttribute('aria-expanded', String(o)); });

  /* ---------- Accueil ---------- */
  const SEMIS_3 = [C.pulpe, C.vert, C.pulpe, C.cerise, C.vert];
  $('#hero-visuel').innerHTML = A.semis({ cols: 6, rows: 6, pas: 110, taille: 50, tons: SEMIS_3, seed: 1 }) + A.pastille('guji', 250, { angle: -6, pose: true });
  const TILE_POS = { logo: '50% 0%', elements: '50% 0%' };
  const TILE = { marque: '03-mots-cles', logo: '07-logo-variantes', couleurs: '12-palette', typographie: '15-typographie', elements: '09-pastilles', interface: '10-ecrans', mouvement: '11-mosaique', situation: '18-devanture', ressources: '24-papeterie' };
  $('#tuiles').innerHTML = pages.slice(1).map((p) => `<a href="#${p.id}"><div class="im"><img src="media/vignettes/${TILE[p.id]}.jpg" alt="" loading="lazy" style="--pos:${TILE_POS[p.id] || '50% 50%'}"></div><div class="leg"><i>${pad(p.i)}</i>${p.title}</div></a>`).join('');
  // Présentation : nombre de pages et vignettes lus dans deck/pages.js (même source que le PDF)
  const ORDRE = Array.isArray(window.GuideOrder) ? window.GuideOrder : null;
  const nPages = ORDRE ? ORDRE.length : 0;
  $$('[data-nb-pages]').forEach((e) => { e.textContent = nPages ? `PDF · ${nPages} pages · 16:9` : 'PDF · 16:9'; });
  const choisir = (fin) => { const n = nPages || 4; const k = fin ? [0.45, 0.6, 0.75, 0.9] : [0, 0.3, 0.55, 0.8]; return [...new Set(k.map((x) => Math.min(n, 1 + Math.round(x * (n - 1)))))]; };
  $$('[data-apercu]').forEach((a) => { a.innerHTML = choisir(a.dataset.apercu === 'fin').map((n) => `<img src="deck/${pad(n)}.jpg" alt="" loading="lazy">`).join(''); });

  /* ---------- 01 Marque ---------- */
  $('#mots-grille').innerHTML = [['Fruit', 'fleur', 'Le café se cueille mûr, comme une cerise.'], ['Fraîcheur', 'cerise', 'Une date sur chaque sachet, pas un adjectif.'], ['Voisinage', 'vert', 'On livre à vélo, on reprend les boîtes vides.'], ['Franchise', 'feuille', 'Origine, altitude, procédé, prix&nbsp;: tout est écrit.']]
    .map(([m, t, d], i) => { const T = A.TONS[t]; return `<div class="carte"><div style="width:64px;height:64px;border-radius:50%;background:${T.bg};display:grid;place-items:center;margin-bottom:18px;box-shadow:inset 0 0 0 1px var(--ligne)">${A.symbol(T.acc, 'style="width:30px;height:auto" aria-hidden="true"')}</div><span class="num">${pad(i + 1)}</span><div class="gros">${m}</div><p style="margin-top:10px">${d}</p></div>`; }).join('');
  $('#valeurs-grille').innerHTML = [
    ['Saison', 'Le café est une récolte. La carte change quand la récolte change.'],
    ['Fraîcheur', 'Torréfié chaque mardi, par fournées de 12&nbsp;kg, daté à la main.'],
    ['Voisinage', 'On connaît vos habitudes, on livre à vélo, on reprend les boîtes vides.'],
    ['Franchise', 'Origine, altitude, procédé, prix. Tout est écrit sur la pastille.'],
  ].map(([a, b], i) => `<div class="carte"><span class="num">${pad(i + 1)}</span><h3 style="font-size:24px;letter-spacing:-.02em">${a}</h3><p>${b}</p></div>`).join('');
  $('#perso').innerHTML = [['Artisan', 'Industriel', 16], ['Chaleureux', 'Réservé', 30], ['Factuel', 'Lyrique', 20], ['Simple', 'Recherché', 32], ['De quartier', 'De partout', 14], ['Sérieux', 'Joueur', 44]]
    .map(([a, b, v]) => `<div style="display:grid;grid-template-columns:minmax(0,120px) 1fr minmax(0,120px);gap:18px;align-items:center;padding:11px 0;font-size:15px"><span>${a}</span><span style="position:relative;height:1px;background:var(--ligne-forte)"><i style="position:absolute;left:${v}%;top:-6px;width:13px;height:13px;margin-left:-6px;border-radius:50%;background:var(--vif)"></i></span><span style="text-align:right;color:var(--texte-3)">${b}</span></div>`).join('');
  $('#ton-table').innerHTML = [
    ['Torréfié mardi.', 'Fraîcheur garantie !'],
    ['Fraise, jasmin, une fin de cacao.', 'Une explosion de saveurs.'],
    ['On vous met un sachet de côté.', 'Optimisez votre abonnement.'],
    [`La carte ferme lundi à 20${NB}h.`, 'Dernière chance, ne ratez pas l’offre !'],
    ['Livré jeudi, à vélo.', 'Livraison express éco-responsable.'],
  ].map(([a, b]) => `<tr><td style="color:var(--encre)">«${NB}${a}${NB}»</td><td style="color:var(--texte-3)">«${NB}${b.replace(' !', NB + '!')}${NB}»</td></tr>`).join('');

  /* ---------- 02 Logo ---------- */
  const SCENES = [['Fleur', C.fleur, C.cerise, ''], ['Parche', C.parche, C.cerise, ''], ['Cerise', C.cerise, C.fleur, ''], ['Feuille', C.feuille, C.fleur, ''], ['Café vert', C.vert, C.feuille, ''], ['Dégradé .g-vif', '', C.fleur, 'g-vif grain'], ['Dégradé .g4', '', C.grain, 'g4 grain']];
  const setScene = (i) => { const [, bg, fg, cls] = SCENES[i]; const s = $('#scene'); s.className = 'scene ' + cls; s.style.background = bg; s.innerHTML = A.lockup(fg, 'role="img" aria-label="Drupe, torréfacteur de quartier"'); $$('#scene-choix button').forEach((b, k) => b.classList.toggle('on', k === i)); };
  $('#scene-choix').innerHTML = SCENES.map((s) => `<button>${s[0]}</button>`).join('');
  $$('#scene-choix button').forEach((b, i) => b.addEventListener('click', () => setScene(i)));
  setScene(0);
  const VERS = [['complet', 'Version complète', 'Logotype et descripteur sur deux lignes. La version par défaut.', (c, a = '') => A.lockup(c, a)], ['logotype', 'Logotype', 'Quand le contexte dit déjà ce qu’est Drupe&nbsp;: sachet, enseigne, couvercle.', (c, a = '') => A.wordmark(c, a)], ['symbole', 'Symbole', 'Icône, pastille, enseigne drapeau, pied de page, très petits formats.', (c, a = '') => A.symbol(c, a)]];
  const CN = ['cerise', 'grain', 'fleur', 'feuille'];
  $('#logo-cartes').innerHTML = VERS.map(([k, t, d, f]) => `<div class="carte logocarte"><div class="vu">${f(C.cerise, 'aria-hidden="true"')}</div><div class="corps"><h3>${t}</h3><p>${d}</p><div class="dl">${CN.map((c) => `<a class="bt vide p" href="logo/${A.SLUG}-${k}-${c}.svg" download>SVG ${c}</a>`).join('')}</div></div></div>`).join('');
  // Zone de protection : marge de 40 (deux graisses de fût) autour de la version complète (repère [0, -14, 828, 128])
  const [bx, by, bw, bh] = A.LOCKUP.box, m = 2 * A.LETTRES.graisse;
  const carre = (x, y) => `<rect x="${x}" y="${y}" width="${m}" height="${m}" fill="${C.pulpe}"/><text x="${x + m / 2}" y="${y + m / 2 + 5}" text-anchor="middle" font-family="IBM Plex Mono" font-weight="500" font-size="14" fill="${C.feuille}">2f</text>`;
  $('#protection-vu').innerHTML = `<svg viewBox="${bx - m - 60} ${by - m - 60} ${bw + 2 * m + 120} ${bh + 2 * m + 120}" style="width:min(88%,860px);height:auto" role="img" aria-label="Zone de protection du logo : une marge de deux graisses de fût tout autour">
    <rect x="${bx - m}" y="${by - m}" width="${bw + 2 * m}" height="${bh + 2 * m}" fill="${C.pulpe}" fill-opacity=".25" stroke="${C.cerise}" stroke-width="1.5" stroke-dasharray="7 6"/>
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="none" stroke="${C.cerise}" stroke-width="1" stroke-opacity=".6"/>
    ${carre(bx - m, by + bh / 2 - m / 2)}${carre(bx + bw, by + bh / 2 - m / 2)}${carre(bx + bw / 2 - m / 2, by - m)}${carre(bx + bw / 2 - m / 2, by + bh)}
    ${A.lockup(C.grain, `x="${bx}" y="${by}" width="${bw}" height="${bh}"`)}
    <text x="${bx - m}" y="${by - m - 16}" font-family="IBM Plex Mono" font-weight="500" font-size="14" fill="${C.feuille}" letter-spacing="1.2">ZONE DE PROTECTION</text>
    <text x="${bx + bw + m}" y="${by + bh + m + 30}" text-anchor="end" font-family="IBM Plex Mono" font-weight="500" font-size="14" fill="${C.feuille}" letter-spacing="1.2">f = GRAISSE DU FÛT, 20 DANS LE REPÈRE DU LOGO</text></svg>`;
  $('#tailles-table').innerHTML = [['Version complète', 160, 45, (w) => A.lockup(C.grain, `style="width:${w}px;height:auto" aria-hidden="true"`)], ['Logotype', 64, 18, (w) => A.wordmark(C.grain, `style="width:${w}px;height:auto" aria-hidden="true"`)], ['Symbole', 16, 5, (w) => A.symbol(C.grain, `style="width:${w}px;height:auto" aria-hidden="true"`)], ['Pastille', 56, 30, (w) => A.pastille('guji', w, { angle: 6 })]]
    .map(([t, px, mm, f]) => `<tr><td style="color:var(--encre);font-weight:500">${t}</td><td class="mono" style="font-size:13px;white-space:nowrap">${px}${NB}px</td><td class="mono" style="font-size:13px;white-space:nowrap">${mm}${NB}mm</td><td><span style="display:inline-grid;place-items:center;background:var(--clair);border-radius:10px;padding:14px 18px;min-width:180px;min-height:64px">${f(px)}</span></td></tr>`).join('');
  $('#combos').innerHTML = [[C.fleur, C.cerise, 'Cerise sur Fleur'], [C.parche, C.cerise, 'Cerise sur Parche'], [C.cerise, C.fleur, 'Fleur sur Cerise'], [C.feuille, C.fleur, 'Fleur sur Feuille'], [C.parche, C.grain, 'Grain sur Parche'], [C.vert, C.feuille, 'Feuille sur Café vert']]
    .map(([bg, fg, t]) => `<div class="combo" style="background:${bg};color:${encreSur(bg)}">${A.wordmark(fg, 'aria-hidden="true"')}<span>${t}</span></div>`).join('');
  const W = (style, fill = C.cerise, attrs = '') => A.wordmark(fill, `style="${style}" aria-hidden="true" ${attrs}`);
  $('#interdits-grille').innerHTML = [
    ['Ne pas déformer', W('width:84%;height:26px', C.cerise, 'preserveAspectRatio="none"'), ''],
    ['Ne pas boucher le sillon', W('', C.cerise, `stroke="${C.cerise}" stroke-width="9"`), ''],
    ['Ne pas incliner ni faire pivoter', W('transform:rotate(-10deg)'), ''],
    ['Ne pas poser la Cerise sur la Feuille', W('', C.cerise), `background:${C.feuille}`],
    ['Ne pas utiliser en contour', A.wordmark('none', `stroke="${C.cerise}" stroke-width="2.5" aria-hidden="true"`), ''],
    ['Ne pas poser sur le semis plein', A.semis({ cols: 5, rows: 2, pas: 90, taille: 46, tons: SEMIS_3, seed: 4 }) + W('', C.cerise), ''],
  ].map(([t, svg, bg]) => `<div class="mal"><div class="vu" style="${bg}">${svg}</div><div class="corps"><span class="ko">À ne pas faire</span>${t}</div></div>`).join('');

  /* ---------- 03 Couleurs ---------- */
  $('#bandes').innerHTML = COLORS.map((c) => `<button class="bande" style="--g:${c.g};flex:${c.g} 1 0;background:${c.h};color:${encreSur(c.h)}" data-hex="${c.h}" title="Copier ${c.h}"><b>${c.n}</b><span>${c.h}<em><br>RVB ${rgb(c.h).join(' ')}<br>${c.r}</em></span></button>`).join('');
  $$('#bandes .bande').forEach((b) => b.addEventListener('click', () => copy(b.dataset.hex, b.dataset.hex + ' copié')));
  const PROP = [['parche', 45], ['fleur', 30], ['pulpe', 8], ['vert', 7], ['cerise', 5], ['feuille', 3], ['grain', 2]];
  $('#prop').innerHTML = PROP.map(([k, v]) => `<div style="flex:${v};background:${C[k]}"></div>`).join('');
  $('#prop-leg').innerHTML = PROP.map(([k, v]) => `<span><i style="background:${C[k]}"></i>${COLORS.find((c) => c.k === k).n} ${v}${NB}%</span>`).join('');
  const NOTE = { 'Cerise/Parche': ' · dès 16 px', 'Cerise/Pulpe': '', 'Cerise/Café vert': '' };
  $('#contrastes-table').innerHTML = [['Grain', 'Parche'], ['Grain', 'Fleur'], ['Grain', 'Pulpe'], ['Grain', 'Café vert'], ['Feuille', 'Parche'], ['Feuille', 'Café vert'], ['Fleur', 'Feuille'], ['Fleur', 'Cerise'], ['Cerise', 'Fleur'], ['Cerise', 'Parche'], ['Cerise', 'Pulpe'], ['Cerise', 'Café vert'], ['Cerise', 'Grain'], ['Cerise', 'Feuille']]
    .map(([t, b]) => { const r = ratio(hex(t), hex(b)); const note = NOTE[t + '/' + b] || ''; const badge = r >= 4.5 ? `<span class="badge">AA · tout texte${note}</span>` : r >= 3 ? '<span class="badge titre">AA · titres seulement</span>' : '<span class="badge non">Décor seulement</span>'; return `<tr><td><span class="smp" style="background:${hex(b)};color:${hex(t)}">Aa</span></td><td>${t}</td><td>${b}</td><td class="mono">${virgule(Math.floor(r * 10) / 10)}${NB}:${NB}1</td><td>${badge}</td></tr>`; }).join('');
  const GR = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g-vif'], DENSES = ['g7', 'g8', 'g9', 'g-vif'];
  $('#degrades-grille').innerHTML = GR.map((g) => `<button class="deg ${g} grain ${DENSES.includes(g) ? 'dense' : ''}" data-g="${g}" title="Copier le CSS de .${g}"><span>.${g}</span></button>`).join('');
  $$('#degrades-grille .deg').forEach((b) => b.addEventListener('click', () => { const cs = getComputedStyle(b); copy(`background: ${cs.backgroundImage}, ${cs.backgroundColor};`, 'CSS du dégradé .' + b.dataset.g + ' copié'); }));

  /* ---------- 04 Typographie ---------- */
  const spec = $('#specimen'), gr = $('#graisse');
  const setG = (v) => { spec.style.fontWeight = v; gr.value = v; $('#graisse-v').textContent = v; $$('#graisse-choix button').forEach((b) => b.classList.toggle('on', +b.dataset.w === +v)); };
  const GRAISSES = [[300, 'Light', 'Les très grands chiffres&nbsp;: 48&nbsp;h, 12&nbsp;kg.'], [400, 'Regular', 'Le texte courant, les notes de dégustation.'], [500, 'Medium', 'Les titres, serrés à −0,03&nbsp;em, interligne 1,02.'], [600, 'SemiBold', 'Les noms de café&nbsp;: Guji, Huila, Nyeri.']];
  $('#graisse-choix').innerHTML = GRAISSES.map(([w, n]) => `<button data-w="${w}">${n} ${w}</button>`).join('');
  $$('#graisse-choix button').forEach((b) => b.addEventListener('click', () => setG(b.dataset.w)));
  gr.addEventListener('input', () => setG(gr.value)); setG(500);
  $('#graisses').innerHTML = GRAISSES.map(([w, n, u]) => `<div class="carte"><span class="num">BRICOLAGE GROTESQUE ${n.toUpperCase()} ${w}</span><div class="alpha" style="font-weight:${w}">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 àâçéèêëîïôùûœ €</div><p style="margin-top:12px">${u}</p></div>`).join('');
  $('#hier').innerHTML = [
    ['Titre XL', '<span style="font-size:clamp(30px,4.4vw,64px);font-weight:500;line-height:1.02;letter-spacing:-.03em">Le café est un fruit.</span>', 'Medium 500 · 64 px · interligne 1,02 · -3 %'],
    ['Titre L', '<span style="font-size:clamp(26px,3.2vw,44px);font-weight:500;line-height:1.05;letter-spacing:-.025em">Torréfié mardi.</span>', 'Medium 500 · 44 px · interligne 1,05 · -2,5 %'],
    ['Titre M', '<span style="font-size:28px;font-weight:500;line-height:1.15;letter-spacing:-.015em">La carte de la semaine</span>', 'Medium 500 · 28 px · interligne 1,15 · -1,5 %'],
    ['Grand chiffre', '<span style="font-size:clamp(56px,7vw,96px);font-weight:300;line-height:1;letter-spacing:-.03em">48&nbsp;h</span>', 'Light 300 · 96 px et plus · -3 %'],
    ['Nom de café', '<span style="font-size:24px;font-weight:600;letter-spacing:-.02em">Guji</span>', 'SemiBold 600 · 22 à 24 px · -2 %'],
    ['Corps', '<span style="font-size:17px;line-height:1.5">Fraise, jasmin, une fin de cacao.</span>', 'Regular 400 · 16 à 19 px · interligne 1,4 à 1,5'],
    ['Étiquette', '<span class="mono" style="font-size:11px;font-weight:500;letter-spacing:.08em;text-transform:uppercase">Éthiopie · 2 050 m</span>', 'IBM Plex Mono 400 ou 500 · 9,5 à 12 px · capitales · +8 %'],
  ].map(([s, e, r]) => `<tr><td style="color:var(--encre);font-weight:500">${s}</td><td>${e}</td><td class="mono" style="font-size:12px;color:var(--texte-3)">${r.replace(/ (px|%|em)(?=\W|$)/g, NB + '$1').replace(/-(\d)/g, '−$1')}</td></tr>`).join('');

  /* ---------- 05 Éléments ---------- */
  const SEMIS = [
    ['Trois tons sur Parche', C.parche, '', { tons: SEMIS_3 }, false],
    ['Ton sur ton sur Cerise', '', 'g-vif grain', { tons: [C.pulpe], opacite: 0.32, seed: 2 }, false],
    ['Ton sur ton sur Pulpe', C.pulpe, '', { tons: [C.fleur], opacite: 0.5, seed: 3 }, false],
    ['À 30 % derrière un texte', C.parche, '', { tons: SEMIS_3, opacite: 0.3 }, true],
  ];
  const setSemis = (i) => { const [, bg, cls, o, txt] = SEMIS[i]; const s = $('#semis-plateau'); s.className = 'plateau ' + cls; s.style.background = bg;
    s.innerHTML = A.semis({ cols: 10, rows: 4, pas: 120, taille: 54, ...o }) + (txt ? `<p class="surtexte">Le café est une récolte. La carte change quand la récolte change&nbsp;: on torréfie chaque mardi, par fournées de 12&nbsp;kg.</p>` : '');
    $$('#semis-choix button').forEach((b, k) => b.classList.toggle('on', k === i)); };
  $('#semis-choix').innerHTML = SEMIS.map((s) => `<button>${s[0].replace(' %', NB + '%')}</button>`).join('');
  $$('#semis-choix button').forEach((b, i) => b.addEventListener('click', () => setSemis(i)));
  setSemis(0);
  const TON_NOM = { cerise: 'Cerise', vert: 'Café vert', pulpe: 'Pulpe', grain: 'Grain', feuille: 'Feuille', fleur: 'Fleur' };
  const ANGLES = [-6, 8, -3, 10, -8];
  $('#pastilles').innerHTML = A.CAFES.map((c, i) => `<figure style="display:grid;justify-items:center;gap:14px">${A.pastille(c, 150, { angle: ANGLES[i], pose: true })}<figcaption class="etiq" style="text-align:center">${c.nom} · ton ${TON_NOM[c.ton]}<br>${c.usage} · ${c.prix.replace(' ', NB)}</figcaption></figure>`).join('');
  const setLue = (i) => { $('#pastille-lue').innerHTML = A.pastille(A.CAFES[i], 260, { angle: ANGLES[i], pose: true }); $$('#pastille-choix button').forEach((b, k) => b.classList.toggle('on', k === i)); };
  $('#pastille-choix').innerHTML = A.CAFES.map((c) => `<button>${c.nom}</button>`).join('');
  $$('#pastille-choix button').forEach((b, i) => b.addEventListener('click', () => setLue(i)));
  setLue(0);
  $('#grand').innerHTML = [[C.pulpe, C.cerise, 'Cerise sur Pulpe'], [C.parche, C.cerise, 'Cerise sur Parche'], [C.cerise, C.pulpe, 'Pulpe sur Cerise']]
    .map(([bg, fg, t]) => `<figure><div style="position:relative;aspect-ratio:4/5;border-radius:18px;overflow:hidden;background:${bg};box-shadow:inset 0 0 0 1px var(--ligne)">${A.symbol(fg, 'aria-hidden="true" style="position:absolute;height:130%;width:auto;right:-22%;bottom:-40%"')}</div><figcaption class="etiq" style="margin-top:10px">${t}</figcaption></figure>`).join('');
  $('#tampon-vu').innerHTML = `<span class="tampon" style="zoom:2.4">${A.DATES.tampon}</span>` + A.etiquette('huila', 0.85);

  /* ---------- 06 Interface ---------- */
  const SCR = [['Accueil', () => A.screens.accueil()], ['La carte', () => A.screens.carte()], ['Abonnement', () => A.screens.abonnement()], ['Fiche du Guji', () => A.screens.fiche('guji')]];
  const petit = () => window.innerWidth < 600;
  const setEcran = (i) => { $('#telephone').innerHTML = A.phone(SCR[i][1](), petit() ? 0.62 : 0.74); $$('#onglets button').forEach((b, k) => b.classList.toggle('on', k === i)); };
  $('#onglets').innerHTML = SCR.map((s) => `<button>${s[0]}</button>`).join('');
  $$('#onglets button').forEach((b, i) => b.addEventListener('click', () => setEcran(i)));
  setEcran(0);
  $('#montre').innerHTML = A.watch(A.watchScreen(), petit() ? 0.7 : 0.9);
  const ligneCafe = (id) => { const c = A.cafe(id); return `<div class="u-card" style="padding:14px 16px;display:flex;align-items:center;gap:14px;width:100%">${A.pastille(c, 58)}<div style="flex:1;min-width:0"><div style="font-size:19px;font-weight:500;letter-spacing:-.015em;line-height:1.1">${c.nom}</div><div class="cap" style="margin-top:4px">${c.pays} · ${c.procede}</div><div style="font-size:13px;margin-top:3px;opacity:.8">${c.notes.join(', ').toLowerCase()}</div></div><div style="font-size:14px;font-weight:500">${c.prix}</div></div>`; };
  const gouts = [['Fruité', 82, C.cerise], ['Floral', 58, C.pulpe], ['Chocolaté', 34, C.grain], ['Épicé', 18, C.feuille]];
  $('#composants-grille').innerHTML = [
    ['Bouton principal', 'Un seul bouton Cerise par écran, 50&nbsp;px de haut, texte Fleur en Medium. Le second choix est en contour.', '<div style="display:grid;gap:10px;width:100%;max-width:280px"><div class="u-btn">Modifier ma boîte</div><div class="u-btn ghost">Mettre en pause</div></div>'],
    ['Puces et sélecteur', 'Des puces de 32&nbsp;px pour filtrer la carte, un sélecteur à trois choix pour le rythme. Le choix actif passe en plein.', `<div style="display:grid;gap:12px;justify-items:center;width:100%"><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><span class="u-chip on">Tous</span><span class="u-chip">Filtre</span><span class="u-chip">Espresso</span></div><div class="u-card" style="padding:10px;width:100%;max-width:280px"><div class="u-seg"><span>7 jours</span><span class="on">15 jours</span><span>1 mois</span></div></div></div>`],
    ['Ajouter un café', 'Le bouton rond de 34&nbsp;px ajoute un café à la boîte&nbsp;; il passe en Cerise, coché, quand c’est fait.', `<div style="display:flex;gap:16px;align-items:center">${A.pastille('cerrado', 74, { angle: -6 })}<div class="u-add">${A.icons.plus()}</div><div class="u-add on">${A.icons.check()}</div></div>`],
    ['Ligne de café', 'La pastille sert de vignette&nbsp;: nom en Medium, origine en Plex Mono, notes en minuscules, prix à droite.', ligneCafe('nyeri')],
    ['Votre goût', 'Des barres de 8&nbsp;px, une couleur par famille de goût, sans axe ni grille.', `<div style="display:grid;gap:9px;width:100%;max-width:300px">${gouts.map(([n, v, col]) => `<div style="display:grid;grid-template-columns:82px 1fr 34px;align-items:center;gap:10px;font-size:13.5px"><span>${n}</span><div class="u-bar"><b style="width:${v}%;background:${col}"></b></div><span class="mono" style="font-size:10.5px;text-align:right;opacity:.7">${v}${NB}%</span></div>`).join('')}</div>`],
    ['Barre d’onglets', 'Trois onglets posés en bas, sur une carte Fleur. L’onglet actif est en Grain plein.', '<div style="position:relative;width:100%;max-width:340px;height:80px"><div class="u-tabs" style="bottom:13px;left:0;right:0"><span class="on">Accueil</span><span>La carte</span><span>Abonnement</span></div></div>'],
  ].map(([t, d, h]) => `<div class="compo"><div class="demo">${h}</div><div><h3>${t}</h3><p>${d}</p></div></div>`).join('');
  $('#notes').innerHTML = A.ncard('Torréfié ce matin', `Votre Guji sort du tambour. Il repose deux jours, puis il part à vélo jeudi, avant 9${NB}h.`, { heure: '8:12' })
    + A.ncard('Plus que ce soir', `La carte de la semaine ferme à 20${NB}h. Sans nouvelles de vous, on remet les deux mêmes cafés.`, { heure: '17:30', action: 'Voir la carte' })
    + A.ncard('C’est noté pour mardi', 'Nyeri et Huila partent dans la boîte n°' + NB + '17. Torréfiés mardi 17, livrés jeudi 19.', { heure: '19:04', action: 'Voir ma boîte' });
  const icone = (size, bg, fg, cls = '') => `<div class="icone ${cls}" style="width:${size}px;height:${size}px;${bg ? 'background:' + bg + ';' : ''}${bg === C.fleur ? 'box-shadow:inset 0 0 0 1px var(--ligne-forte)' : ''}">${A.symbol(fg, 'aria-hidden="true"')}</div>`;
  $('#icones').innerHTML = `<figure>${icone(132, '', C.fleur, 'g-vif grain')}<figcaption class="etiq">Icône · Fleur sur Cerise</figcaption></figure>` +
    [[C.fleur, C.cerise, 'Cerise sur Fleur'], [C.feuille, C.fleur, 'Fleur sur Feuille'], [C.vert, C.feuille, 'Feuille sur Café vert'], [C.pulpe, C.grain, 'Grain sur Pulpe']]
      .map(([bg, fg, t], i) => `<figure>${icone(84, bg, fg)}<figcaption class="etiq">Variante ${i + 1}<br>${t}</figcaption></figure>`).join('');

  /* ---------- 07 Mouvement ---------- */
  // Mêmes durées et courbes que les vidéos (motion/lib.js : cubicInOut, expoOut, quintOut).
  const MURIR = 'cubic-bezier(.65, 0, .35, 1)', OUVRIR = 'cubic-bezier(.16, 1, .3, 1)', DOUCE = 'cubic-bezier(.22, 1, .36, 1)', REBOND = 'cubic-bezier(.34, 1.56, .64, 1)';
  const parts = A.symbolPath().split(/(?=M)/).map((s) => s.trim()).filter(Boolean);
  const tilt = (A.SYM.tilt * Math.PI) / 180, V = [Math.cos(tilt), Math.sin(tilt)], ec = A.LETTRES.sillon / 2;
  const symParts = (fill) => `<svg viewBox="-10 -6 120 112" width="84" height="78" aria-hidden="true"><path class="pa" fill="${fill}" d="${parts[0]}"/><path class="pb" fill="${fill}" d="${parts[1]}"/><path class="pq" fill="${fill}" d="${parts[2]}"/></svg>`;
  const PISTES = [
    ['murir', 'Mûrir', '1 350 ms', MURIR, 'Du Café vert à la Pulpe, puis à la Cerise. Logo, pastilles, semis.', () => symParts(C.cerise),
      (z) => $$('path', z).forEach((p) => p.animate([{ fill: C.vert }, { fill: C.pulpe }, { fill: C.cerise }], { duration: 1350, easing: MURIR }))],
    ['ouvrir', 'Ouvrir', '500 ms', OUVRIR, 'Les deux moitiés s’écartent de 8, la largeur du sillon. Juste après le mûrissement.', () => symParts(C.cerise),
      (z) => { [['.pa', 1], ['.pb', -1]].forEach(([s, k]) => $(s, z).animate([{ transform: 'translate(0px, 0px)' }, { transform: `translate(${k * ec * V[0]}px, ${k * ec * V[1]}px)` }], { duration: 500, easing: OUVRIR, fill: 'forwards' })); }],
    ['poser', 'Poser', '900 ms', DOUCE, 'La pastille descend en tournant de 20° et s’arrête de travers, entre −8° et 12°.', () => A.pastille('guji', 80, { angle: -6 }),
      (z) => $('.pastille', z).animate([{ transform: 'translateY(-30px) rotate(14deg)', opacity: 0 }, { transform: 'translateY(0) rotate(-6deg)', opacity: 1 }], { duration: 900, easing: DOUCE, fill: 'forwards' })],
    ['entrer', 'Entrer', '420 ms', DOUCE, 'Cartes et pages de l’interface&nbsp;: 12&nbsp;px de montée, en fondu. 150&nbsp;ms de décalage dans un groupe.', () => `<div style="display:flex;gap:8px">${['Guji', 'Huila', 'Nyeri'].map((n) => `<span class="u-chip" style="background:var(--papier)">${n}</span>`).join('')}</div>`,
      (z) => $$('.u-chip', z).forEach((c, i) => c.animate([{ transform: 'translateY(12px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: DOUCE, delay: i * 150, fill: 'backwards' }))],
    ['etat', 'Changer d’état', '180 ms', 'ease-out', 'Survol, sélection, ajout d’un café.', () => `<div class="u-add" style="transition:background 180ms ease-out,box-shadow 180ms ease-out">${A.icons.plus()}</div>`,
      (z) => { const b = $('.u-add', z); const on = !b.classList.contains('on'); b.classList.toggle('on', on); b.innerHTML = on ? A.icons.check() : A.icons.plus(); }],
    ['balancer', 'Balancer', 'boucle de 8 s', 'sinus, ±14°', 'Le semis, en continu. Jamais plus vite.', () => `<div style="position:absolute;inset:0">${A.semis({ cols: 8, rows: 1, pas: 96, taille: 50, tons: SEMIS_3, seed: 5 })}</div>`, null],
    ['rebond', 'Rebond, à éviter', '600 ms', REBOND, 'Ça dépasse puis ça revient&nbsp;: ce n’est pas Drupe.', () => '<i class="bille"></i>',
      (z) => $('.bille', z).animate([{ transform: 'translateX(0)' }, { transform: `translateX(${z.clientWidth - 64}px)` }], { duration: 600, easing: REBOND, fill: 'forwards' })],
  ];
  $('#pistes').innerHTML = PISTES.map(([id, n, d, e, t, vu], i) => `<div class="piste ${id === 'rebond' ? 'eviter' : ''}" data-i="${i}"><div class="nom">${n}<small>${d.replace(' ms', NB + 'ms').replace(' s', NB + 's')} · ${e}</small></div><div><div class="zone" ${PISTES[i][6] ? 'role="button" tabindex="0" aria-label="Rejouer : ' + n + '" style="cursor:pointer"' : ''}>${vu()}</div><p>${t}</p></div><span class="etiq">${PISTES[i][6] ? 'Rejouer' : 'En continu'}</span></div>`).join('');
  $$('#pistes .piste').forEach((p) => { const f = PISTES[+p.dataset.i][6]; if (!f) return; const z = $('.zone', p); const go = () => f(z); z.addEventListener('click', go); z.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
  const MVT = `:root {\n  --duree-etat: 180ms;     /* survol, sélection, ajout */\n  --duree-entree: 420ms;   /* cartes et pages de l'interface */\n  --duree-ouvrir: 500ms;   /* les deux moitiés s'écartent de la largeur du sillon */\n  --duree-poser: 900ms;    /* une pastille se pose de travers */\n  --duree-murir: 1350ms;   /* Café vert, Pulpe, Cerise */\n  --decalage: 150ms;       /* entre deux éléments d'un groupe */\n  --montee: 12px;          /* distance d'entrée, depuis le bas */\n  --courbe-douce: ${DOUCE};   /* entrer, poser */\n  --courbe-ouvrir: ${OUVRIR};  /* ouvrir */\n  --courbe-murir: ${MURIR};   /* mûrir */\n  --balancement: 8s;       /* boucle du semis, ±14° (Marque.seekSemis) */\n}`;
  $('#mouvement-css').textContent = MVT;
  $('#copier-mouvement').addEventListener('click', () => copy(MVT, 'Variables de mouvement copiées'));

  /* ---------- 08 Galerie et agrandissement ---------- */
  const KIND = { '3d': 'Mockup 3D', video: 'Vidéo', planche: 'Planche' };
  const M = [
    ['01-ouverture.jpg', ['3d'], 'Ouverture : la drupe coupée'], ['14-sachets.jpg', ['3d'], 'Les sachets'], ['16-boite.jpg', ['3d'], 'La boîte d’abonnement'],
    ['17-gobelet.jpg', ['3d'], 'Gobelet et tasse'], ['18-devanture.jpg', ['3d'], 'La devanture'], ['20-affiche-rue.mp4', ['video', '3d'], 'Affiche de rue'],
    ['24-papeterie.jpg', ['3d'], 'Papeterie et petite signalétique'], ['25-telephone.jpg', ['3d'], 'Le téléphone'], ['27-ardoise.mp4', ['video', '3d'], 'L’ardoise'],
    ['26-reseaux.jpg', ['planche'], 'Réseaux sociaux'], ['10-ecrans.jpg', ['planche'], 'Écrans de l’application'], ['22-app.mp4', ['video'], 'L’application'],
    ['23-montre.mp4', ['video'], 'Montre et messages'], ['21-icone.jpg', ['planche'], 'Icône d’application'], ['11-mosaique.mp4', ['video'], 'Mosaïque'],
    ['08-semis.mp4', ['video'], 'Le semis'], ['09-pastilles.jpg', ['planche'], 'Les pastilles'], ['07-logo-variantes.jpg', ['planche'], 'Logo et variantes'],
    ['06-logo-anime.mp4', ['video'], 'Révélation du logotype'], ['05-construction.jpg', ['planche'], 'Construction du logotype'], ['12-palette.jpg', ['planche'], 'Palette'],
    ['13-degrades.jpg', ['planche'], 'Dégradés'], ['15-typographie.jpg', ['planche'], 'Typographie'], ['03-mots-cles.jpg', ['planche'], 'Mots-clés'],
    ['04-valeurs.jpg', ['planche'], 'Valeurs'], ['02-presentation.jpg', ['planche'], 'Présentation'], ['19-guide-de-marque.jpg', ['planche'], 'Guide de marque'],
    ['28-merci.jpg', ['planche'], 'Merci'],
  ].map(([f, k, c]) => ({ f, k, c: c.replace(' : ', NB + ': '), v: f.endsWith('.mp4'), th: 'media/vignettes/' + f.replace('.mp4', '.jpg') }));
  const FIL = [['tout', 'Tout'], ['3d', 'Mockups 3D'], ['video', 'Vidéos'], ['planche', 'Planches']];
  let list = M;
  const drawGal = (k) => {
    list = k === 'tout' ? M : M.filter((m) => m.k.includes(k));
    $('#gal').innerHTML = list.map((m, i) => `<button data-i="${i}" aria-label="Agrandir : ${m.c}"><div class="im"><img src="${m.th}" alt="${m.c}" loading="lazy">${m.v ? '<span class="lire" aria-hidden="true"></span>' : ''}</div><figcaption><i>${m.k.map((x) => KIND[x]).join(' · ')}</i>${m.c}</figcaption></button>`).join('');
    $$('#gal button').forEach((b) => b.addEventListener('click', () => openLb(list, +b.dataset.i)));
    $$('#filtres button').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
  };
  $('#filtres').innerHTML = FIL.map(([k, t]) => `<button data-k="${k}">${t} <span style="opacity:.55">${k === 'tout' ? M.length : M.filter((m) => m.k.includes(k)).length}</span></button>`).join('');
  $$('#filtres button').forEach((b) => b.addEventListener('click', () => drawGal(b.dataset.k)));
  drawGal('tout');
  const lb = $('#lb'); let lbList = [], lbI = 0, lbRetour = null;
  const drawLb = () => { const m = lbList[lbI]; $('#lb-media').innerHTML = m.v ? `<video src="media/${m.f}" autoplay loop muted playsinline controls></video>` : `<img src="media/${m.f}" alt="${m.c}">`; $('#lb-leg').textContent = m.c; $('#lb-num').textContent = lbList.length > 1 ? `${pad(lbI + 1)} / ${pad(lbList.length)}` : ''; $('#lb-prec').style.display = $('#lb-suiv').style.display = lbList.length > 1 ? '' : 'none'; };
  function openLb(l, i) { lbRetour = document.activeElement; lbList = l; lbI = i; lb.classList.add('on'); document.body.style.overflow = 'hidden'; drawLb(); $('#lb-fermer').focus(); }
  const closeLb = () => { lb.classList.remove('on'); $('#lb-media').innerHTML = ''; document.body.style.overflow = ''; if (lbRetour) lbRetour.focus(); };
  const step = (d) => { lbI = (lbI + d + lbList.length) % lbList.length; drawLb(); };
  $('#lb-prec').addEventListener('click', () => step(-1)); $('#lb-suiv').addEventListener('click', () => step(1)); $('#lb-fermer').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.id === 'lb-media') closeLb(); });
  document.addEventListener('keydown', (e) => { if (!lb.classList.contains('on')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
  $$('[data-lb]').forEach((im) => im.addEventListener('click', () => { const m = M.find((x) => x.f === im.dataset.lb); if (m) openLb([m], 0); }));

  /* ---------- 09 Ressources ---------- */
  $('#fichiers-table').innerHTML = VERS.map(([k, t, , f]) => `<tr><td style="color:var(--encre);font-weight:500"><span style="display:inline-flex;align-items:center;gap:14px"><span style="display:inline-grid;place-items:center;width:74px;height:40px;background:var(--clair);border-radius:8px">${f(C.grain, 'aria-hidden="true" style="max-width:54px;max-height:18px"')}</span>${t}</span></td>${CN.map((c) => `<td><a class="bt vide p" href="logo/${A.SLUG}-${k}-${c}.svg" download>SVG</a></td>`).join('')}</tr>`).join('');
  const ROLES = [['encre', 'grain', 'texte sur fond clair'], ['vif', 'cerise', 'la couleur vive'], ['clair', 'parche', 'la lumière, accent secondaire'], ['moyen', 'vert', 'le ton moyen'], ['sombre', 'feuille', 'le fond dense'], ['scene', 'parche', 'fond des scènes et du site'], ['sur-scene', 'grain', 'texte posé sur --scene'], ['papier', 'fleur', 'fond des pages de charte'], ['doux', 'parche', 'fond neutre teinté']];
  const vars = ':root {\n' + COLORS.map((c) => `  --${c.k}: ${c.h};`.padEnd(22) + `/* ${c.n} : ${c.r} */`).join('\n') +
    '\n  /* Rôles */\n' + ROLES.map(([r, k, d]) => `  --${r}: var(--${k});`.padEnd(30) + `/* ${d} */`).join('\n') +
    '\n  --font: "Bricolage Grotesque", system-ui, sans-serif;\n  --mono: "IBM Plex Mono", ui-monospace, monospace;\n}';
  $('#variables-css').textContent = vars;
  $('#copier-variables').addEventListener('click', () => copy(vars, 'Variables CSS copiées'));
  $('#coordonnees-table').innerHTML = [['Site', 'www.drupe-cafe.fr'], ['Courriel', 'bonjour@drupe-cafe.fr'], ['Réseaux', '@drupe.cafe'], ['Téléphone', `04${NB}65${NB}71${NB}02${NB}47`], ['Adresse', 'À l’angle de la rue du Tambour'], ['Horaires', `Du mardi au samedi, 8${NB}h à 18${NB}h`], ['Torréfaction', 'Jeanne Lemoine, torréfactrice'], ['Boutique et tournées', 'Samuel Perrin']]
    .map(([a, b]) => `<tr><td class="etiq" style="width:220px">${a}</td><td style="color:var(--encre)">${b}</td></tr>`).join('');

  /* ---------- Vie : semis qui se balance, vidéos qui jouent quand on les voit ---------- */
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calme) { const t0 = performance.now(); const loop = (now) => { if (current && !document.hidden) A.seekSemis((now - t0) / 1000, 8, current); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  if ('IntersectionObserver' in window && !calme) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target; if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { threshold: 0.5 });
    $$('video.v').forEach((v) => io.observe(v));
  }
  show();
})();
