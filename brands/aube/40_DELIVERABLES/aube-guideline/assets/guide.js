/* Guide de marque Aube — navigation et éléments vivants. */
(function () {
  const A = window.Aube;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- Copier, message ---------- */
  const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.k); toast.k = setTimeout(() => t.classList.remove('on'), 1600); };
  const copy = async (text, msg) => {
    try { await navigator.clipboard.writeText(text); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toast(msg || 'Copié');
  };

  /* ---------- Données de marque ---------- */
  const COLORS = [
    { n: 'Nuit', h: '#1C1122', r: 'Fond de marque', g: 3.2 },
    { n: 'Prune', h: '#4B1838', r: 'Ombre chaude des dégradés', g: 1.3 },
    { n: 'Braise', h: '#C4391A', r: 'Ton moyen, aplats', g: 1.6 },
    { n: 'Aurore', h: '#FF632B', r: 'Couleur vive, accents', g: 2.6 },
    { n: 'Miel', h: '#FFC46B', r: 'Lumière', g: 1.1 },
    { n: 'Blanc', h: '#FFFFFF', r: 'Texte sur sombre, pages', g: 0.9 },
    { n: 'Brume', h: '#E9E3DE', r: 'Fond des planches', g: 0.9 },
    { n: 'Noir', h: '#0A0609', r: 'Scènes et écrans', g: 1.3 },
  ];
  const hex = (n) => (COLORS.find((c) => c.n === n) || { h: n === 'Encre' ? '#231A26' : n }).h;
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const lum = (h) => { const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const onDark = (h) => lum(h) < 0.35;

  /* ---------- Pages, sommaire, navigation ---------- */
  const pages = $$('.page').map((el, i) => ({ el, id: el.id, i, title: el.dataset.title, subs: (el.dataset.subs || '').split('|').filter(Boolean).map((s) => { const k = s.indexOf(':'); return { id: s.slice(0, k), t: s.slice(k + 1) }; }) }));
  $('#brand').innerHTML = A.wordmark('#fff') + '<span>Guide<br>de marque</span>';
  $('#nav').innerHTML = pages.map((p) => `<a href="#${p.id}" data-p="${p.id}"><i>${p.i ? pad(p.i) : '—'}</i>${p.title}</a>` + (p.subs.length ? `<div class="sub" data-s="${p.id}">${p.subs.map((s) => `<a href="#${s.id}">${s.t}</a>`).join('')}</div>` : '')).join('');
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
      $$('#nav > a').forEach((a) => a.classList.toggle('on', a.dataset.p === pageEl.id));
      $$('#nav .sub').forEach((s) => s.classList.toggle('on', s.dataset.s === pageEl.id));
      current = pageEl;
      document.title = (pageEl.id === 'accueil' ? '' : pageEl.dataset.title + ' — ') + 'Aube, guide de marque';
      $$('video').forEach((v) => { if (!pageEl.contains(v)) v.pause(); });
      layoutHorizon();
    }
    $('#side').classList.remove('open');
    if (target === pageEl) window.scrollTo(0, 0); else requestAnimationFrame(() => target.scrollIntoView());
  };
  window.addEventListener('hashchange', show);
  $('#burger').addEventListener('click', () => $('#side').classList.toggle('open'));

  /* ---------- Accueil ---------- */
  $('#hero-orb').innerHTML = A.orb('min(300px, 56vw)');
  const TILE = { marque: '03-mots-cles', logo: '07-logo-variantes', couleurs: '11-palette', typographie: '14-typographie', elements: '08-astre', interface: '09-ecrans', mouvement: '10-mosaique', situation: '15-panneau', ressources: '18-guide-de-marque' };
  $('#tiles').innerHTML = pages.slice(1).map((p) => `<a href="#${p.id}"><img src="media/vignettes/${TILE[p.id]}.jpg" alt="" loading="lazy"><div><i>${pad(p.i)}</i>${p.title}</div></a>`).join('');

  /* ---------- 01 Marque ---------- */
  $('#mots-grid').innerHTML = [['Clarté', 'On y voit clair dès le réveil.'], ['Élan', 'La journée démarre sans friction.'], ['Anticipation', 'Aube a un temps d\'avance.'], ['Sérénité', 'Rien n\'est oublié, on peut souffler.']].map(([a, b], i) => `<div class="card"><span class="num">${pad(i + 1)}</span><div class="big">${a}</div><p style="margin-top:10px">${b}</p></div>`).join('');
  $('#valeurs-grid').innerHTML = [
    ['Clarté', 'Dire l\'essentiel, simplement. Chaque message tient en une phrase et se comprend du premier coup.'],
    ['Attention', 'Écouter avant d\'agir. Aube apprend tes habitudes et respecte ton rythme et tes priorités.'],
    ['Fiabilité', 'Tenir parole, chaque jour. Ce qui est prévu est fait, et tes données restent les tiennes.'],
    ['Initiative', 'Avoir un temps d\'avance. Aube prépare la suite et propose une solution avant même que tu la cherches.'],
  ].map(([a, b], i) => `<div class="card"><span class="num">${pad(i + 1)}</span><h3 style="font-size:22px;font-weight:400">${a}</h3><p>${b}</p></div>`).join('');
  $('#perso').innerHTML = [['Calme', 'Énergique', 22], ['Chaleureux', 'Distant', 16], ['Simple', 'Sophistiqué', 30], ['Discret', 'Expansif', 26], ['Humain', 'Technique', 34], ['Sérieux', 'Joueur', 42]]
    .map(([a, b, v]) => `<div style="display:grid;grid-template-columns:110px 1fr 110px;gap:18px;align-items:center;padding:11px 0;font-size:15px"><span>${a}</span><span style="position:relative;height:1px;background:rgba(255,255,255,.2)"><i style="position:absolute;left:${v}%;top:-6px;width:13px;height:13px;margin-left:-6px;border-radius:50%;background:var(--aurore);box-shadow:0 0 12px rgba(255,99,43,.8)"></i></span><span style="text-align:right;opacity:.55">${b}</span></div>`).join('');
  $('#ton-table').innerHTML = [
    ['J\'ai prévenu Marc de ton arrivée.', 'Notification envoyée avec succès !'],
    ['Trois priorités aujourd\'hui, pas une de plus.', 'Optimisez votre productivité dès maintenant !'],
    ['Ça roule mal : pars dix minutes plus tôt.', 'Une erreur inattendue est survenue.'],
    ['Ta soirée est libre. Je réserve quelque part ?', 'Découvrez nos suggestions personnalisées.'],
  ].map(([a, b]) => `<tr><td style="color:#fff">« ${a} »</td><td style="opacity:.5">« ${b} »</td></tr>`).join('');

  /* ---------- 02 Logo ---------- */
  const STAGES = [['Blanc', '#FFFFFF', '#1C1122', ''], ['Brume', '#E9E3DE', '#1C1122', ''], ['Nuit', '#1C1122', '#FF632B', ''], ['Aurore', '#FF632B', '#1C1122', ''], ['Dégradé', '', '#FFFFFF', 'g1 grain'], ['Noir', '#0A0609', '#FFFFFF', '']];
  const setStage = (i) => { const [, bg, fg, cls] = STAGES[i]; const s = $('#stage'); s.className = 'stage ' + cls; s.style.background = bg; s.innerHTML = A.lockup(fg, 'role="img" aria-label="Aube, assistant personnel"'); $$('#stage-sw button').forEach((b, k) => b.classList.toggle('on', k === i)); };
  $('#stage-sw').innerHTML = STAGES.map((s) => `<button>${s[0]}</button>`).join('');
  $$('#stage-sw button').forEach((b, i) => b.addEventListener('click', () => setStage(i)));
  setStage(0);
  const VERS = [['complet', 'Version complète', 'Logotype et descripteur sur deux lignes. La version par défaut.', (c) => A.lockup(c)], ['logotype', 'Logotype', 'Quand le contexte dit déjà ce qu\'est Aube.', (c) => A.wordmark(c)], ['symbole', 'Symbole', 'Icône, avatar, pied de page, très petits formats.', (c) => A.symbol(c)]];
  const CN = ['nuit', 'blanc', 'aurore', 'noir'];
  $('#logo-cards').innerHTML = VERS.map(([k, t, d, f]) => `<div class="card logocard"><div class="v">${f('#1C1122')}</div><div class="b"><h3>${t}</h3><p>${d}</p><div class="dl">${CN.map((c) => `<a class="bt ghost s" href="logo/aube-${k}-${c}.svg" download>SVG ${c}</a>`).join('')}</div></div></div>`).join('');
  $('#protect').innerHTML = `<svg viewBox="-110 -150 936 366" style="width:min(86%,820px)" role="img" aria-label="Zone de protection du logo">
    <rect x="-50" y="-92" width="812" height="242" fill="rgba(255,99,43,.09)" stroke="#FF632B" stroke-width="1.5" stroke-dasharray="7 6"/>
    <rect x="0" y="-42" width="712" height="142" fill="none" stroke="#FF632B" stroke-width="1" opacity=".5"/>
    ${[[-50, 4], [712, 4], [331, -92], [331, 100]].map(([x, y]) => `<rect x="${x}" y="${y}" width="50" height="50" fill="rgba(255,99,43,.28)"/><text x="${x + 25}" y="${y + 30}" text-anchor="middle" font-family="DM Mono" font-size="15" fill="#C4391A">½ x</text>`).join('')}
    ${A.lockup('#1C1122', 'x="0" y="-42" width="716" height="150"')}
    <text x="-50" y="-104" font-family="DM Mono" font-size="13" fill="#C4391A" letter-spacing="1">ZONE DE PROTECTION</text>
    <text x="762" y="170" text-anchor="end" font-family="DM Mono" font-size="13" fill="#C4391A" letter-spacing="1">x = HAUTEUR D'X DU LOGOTYPE</text></svg>`;
  $('#tailles-table').innerHTML = [['Version complète', 120, 30, (w) => A.lockup('#1C1122', `style="width:${w}px;height:auto"`)], ['Logotype', 64, 16, (w) => A.wordmark('#1C1122', `style="width:${w}px;height:auto"`)], ['Symbole', 16, 5, (w) => A.symbol('#1C1122', `style="width:${w}px;height:auto"`)]]
    .map(([t, px, mm, f]) => `<tr><td style="color:#fff">${t}</td><td class="mono" style="font-size:13px">${px} px de large</td><td class="mono" style="font-size:13px">${mm} mm de large</td><td><span style="display:inline-grid;place-items:center;background:#fff;border-radius:10px;padding:14px 18px;min-width:160px;min-height:56px">${f(px)}</span></td></tr>`).join('');
  $('#combos').innerHTML = [['#FFFFFF', '#1C1122', 'Nuit sur Blanc', '#1C1122', ''], ['#1C1122', '#FF632B', 'Aurore sur Nuit', '#fff', ''], ['#FF632B', '#1C1122', 'Nuit sur Aurore', '#1C1122', ''], ['', '#FFFFFF', 'Blanc sur dégradé', '#fff', 'g1 grain']]
    .map(([bg, fg, t, tc, cls]) => `<div class="combo ${cls}" style="background:${bg};color:${tc}">${A.wordmark(fg)}<span>${t}</span></div>`).join('');
  const W = (extra, fill = '#1C1122', attrs = '') => A.wordmark(fill, `style="${extra}" ${attrs}`);
  $('#misuse').innerHTML = [
    ['Ne pas déformer', W('width:74%;height:38px', '#1C1122', 'preserveAspectRatio="none"'), ''],
    ['Ne pas incliner ni faire pivoter', W('transform:rotate(-11deg)'), ''],
    ['Ne pas changer la couleur', W('', '#2B7BD6'), ''],
    ['Ne pas utiliser en contour', A.wordmark('none', 'stroke="#1C1122" stroke-width="3"'), ''],
    ['Ne pas ajouter d\'ombre ni d\'effet', W('filter:drop-shadow(5px 7px 5px rgba(0,0,0,.45))'), ''],
    ['Ne pas poser sur un fond sans contraste', W('', '#FF632B'), 'background:#C4391A'],
  ].map(([t, svg, bg]) => `<div class="mis"><div class="v" style="${bg}">${svg}</div><div class="b"><span class="ko">À ne pas faire</span>${t}</div></div>`).join('');

  /* ---------- 03 Couleurs ---------- */
  $('#bands').innerHTML = COLORS.map((c) => `<button class="bande" style="--g:${c.g};flex:${c.g} 1 0;background:${c.h};color:${onDark(c.h) ? '#fff' : '#1C1122'};${c.n === 'Blanc' ? '' : ''}${c.n === 'Noir' || c.n === 'Nuit' ? 'box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)' : ''}" data-hex="${c.h}" title="Copier ${c.h}"><b>${c.n}</b><span>${c.h}<em><br>RVB ${rgb(c.h).join(" ")}<br>${c.r}</em></span></button>`).join('');
  $$('#bands .bande').forEach((b) => b.addEventListener('click', () => copy(b.dataset.hex, b.dataset.hex + ' copié')));
  $('#prop').innerHTML = [['Noir', 34], ['Nuit', 28], ['Prune', 8], ['Braise', 8], ['Aurore', 14], ['Miel', 4], ['Blanc', 4]].map(([n, v]) => `<div style="flex:${v};background:${hex(n)};color:${onDark(hex(n)) ? '#fff' : '#1C1122'}">${n} ${v} %</div>`).join('');
  $('#contrast').innerHTML = [['Blanc', 'Noir'], ['Blanc', 'Nuit'], ['Blanc', 'Prune'], ['Blanc', 'Braise'], ['Blanc', 'Aurore'], ['Nuit', 'Aurore'], ['Nuit', 'Miel'], ['Nuit', 'Blanc'], ['Encre', 'Brume'], ['Aurore', 'Nuit'], ['Miel', 'Nuit'], ['Aurore', 'Blanc'], ['Braise', 'Blanc']]
    .map(([t, b]) => { const r = ratio(hex(t), hex(b)); const badge = r >= 4.5 ? '<span class="badge">AA · tout texte</span>' : r >= 3 ? '<span class="badge lg">AA · grands titres seulement</span>' : '<span class="badge no">Décor seulement</span>'; return `<tr><td><span class="smp" style="background:${hex(b)};color:${hex(t)}">Aa</span></td><td>${t}</td><td>${b}</td><td class="mono">${r.toFixed(1).replace('.', ',')} : 1</td><td>${badge}</td></tr>`; }).join('');
  const GR = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g-vif'];
  $('#grads').innerHTML = GR.map((g) => `<button class="gt ${g} grain" data-g="${g}" title="Copier le CSS"><span>.${g}</span></button>`).join('');
  $$('#grads .gt').forEach((b) => b.addEventListener('click', () => { const cs = getComputedStyle(b); copy(`background: ${cs.backgroundImage}, ${cs.backgroundColor};`, 'CSS du dégradé .' + b.dataset.g + ' copié'); }));

  /* ---------- 04 Typographie ---------- */
  const spec = $('#spec'), wght = $('#wght');
  const setW = (v) => { spec.style.fontWeight = v; wght.value = v; $('#wv').textContent = v; $$('#wbtn button').forEach((b) => b.classList.toggle('on', +b.dataset.w === +v)); };
  $('#wbtn').innerHTML = [[300, 'Light'], [400, 'Regular'], [500, 'Medium']].map(([w, n]) => `<button data-w="${w}">${n} ${w}</button>`).join('');
  $$('#wbtn button').forEach((b) => b.addEventListener('click', () => setW(b.dataset.w)));
  wght.addEventListener('input', () => setW(wght.value)); setW(300);
  $('#weights').innerHTML = [[300, 'Light', 'Titres, texte courant'], [400, 'Regular', 'Interface, légendes'], [500, 'Medium', 'Intitulés, boutons']].map(([w, n, u]) => `<div class="card"><span class="num">OUTFIT ${n.toUpperCase()} ${w}</span><div style="font-weight:${w};font-size:22px;line-height:1.35;color:#fff;word-break:break-all">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 àâçéèêëîïôùû</div><p style="margin-top:12px">${u}</p></div>`).join('');
  $('#hier').innerHTML = [
    ['Titre XL', '<span style="font-size:52px;font-weight:300;line-height:1.05;letter-spacing:-.02em;color:#fff">Le jour se lève.</span>', 'Outfit Light · 56 px · interligne 1,08 · -1,2 %'],
    ['Titre L', '<span style="font-size:40px;font-weight:400;line-height:1.1;letter-spacing:-.01em;color:#fff">Tout est prêt.</span>', 'Outfit Regular · 44 px · interligne 1,1 · -1 %'],
    ['Titre M', '<span style="font-size:27px;font-weight:300;line-height:1.2;color:#fff">Trois priorités, deux rendez-vous.</span>', 'Outfit Light · 27 px · interligne 1,24'],
    ['Corps', '<span style="font-size:19px;font-weight:300;line-height:1.36">Ta journée est déjà en ordre. On commence ?</span>', 'Outfit Light · 19 px · interligne 1,36'],
    ['Intitulé', '<span style="font-size:15px;font-weight:500;color:#fff">Rituel du matin</span>', 'Outfit Medium · 13 à 16 px'],
    ['Étiquette', '<span class="mono" style="font-size:11px;letter-spacing:.09em;text-transform:uppercase">07:30 · À faire</span>', 'DM Mono · 9,5 à 12 px · capitales · +9 %'],
  ].map(([s, e, r]) => `<tr><td style="color:#fff">${s}</td><td>${e}</td><td class="mono" style="font-size:12px;opacity:.7">${r}</td></tr>`).join('');

  /* ---------- 05 Éléments ---------- */
  $('#astre-stage').innerHTML = A.orb('min(300px, 44vw)') + A.orb('min(190px, 26vw)', { mark: false });
  const hz = $('#hz'), hzr = $('#hzr');
  function layoutHorizon() { const st = $('#hz-stage'); const w = st.clientWidth; if (!w) return; const D = Math.max(1300, w * 1.6); hz.style.width = hz.style.height = D + 'px'; hz.style.left = (w - D) / 2 + 'px'; hz.style.top = (st.clientHeight - 14 - (+hzr.value / 100) * (st.clientHeight * 0.74)) + 'px'; }
  hzr.addEventListener('input', layoutHorizon); window.addEventListener('resize', layoutHorizon);

  /* ---------- 06 Interface ---------- */
  const SCR = [['voix', 'Accueil vocal'], ['jour', 'La journée'], ['bord', 'Tableau de bord'], ['chat', 'Conversation']];
  const small = () => window.innerWidth < 600;
  const setScreen = (i) => { $('#phone').innerHTML = A.phone(A.screens[SCR[i][0]](), small() ? 0.62 : 0.74); $$('#tabs button').forEach((b, k) => b.classList.toggle('on', k === i)); };
  $('#tabs').innerHTML = SCR.map((s) => `<button>${s[1]}</button>`).join('');
  $$('#tabs button').forEach((b, i) => b.addEventListener('click', () => setScreen(i)));
  setScreen(2);
  $('#watch').innerHTML = A.watch(A.watchScreen(), small() ? 0.7 : 0.9);
  const demoBg = 'border-radius:14px;padding:22px;background:radial-gradient(120% 90% at 30% -10%,#FF8A3D 0%,#C4391A 30%,rgba(75,24,56,.9) 62%,#150C1A 100%)';
  $('#comps').innerHTML = [
    ['Bouton micro', 'Rond, lumineux, toujours au même endroit. 42 px.', `<div style="display:flex;gap:16px;align-items:center"><div class="chip-mic">${A.icons.mic()}</div><div class="chip-mic ghost">${A.icons.mic()}</div></div>`],
    ['Carte de verre', 'Fond translucide, bord clair d\'un pixel, rayon 18.', `<div class="glass" style="padding:14px 16px;width:100%"><div style="font-size:13px;font-weight:500;margin-bottom:6px">1&nbsp;&nbsp; Rituel du matin</div><div class="ck on"><i></i>Un café, sans écran.</div><div class="ck"><i></i>Vingt minutes de marche.</div></div>`],
    ['Graphique', 'Barres en dégradé Miel vers Braise, sans axe ni grille.', `<div style="display:flex;align-items:flex-end;gap:14px;width:100%"><div style="font-size:32px;font-weight:300">12&nbsp;%</div><div class="bars" style="flex:1"><b style="height:22%"></b><b style="height:34%"></b><b style="height:40%"></b><b style="height:55%"></b><b style="height:70%"></b><b style="height:82%"></b><b style="height:100%"></b></div></div>`],
  ].map(([t, d, h]) => `<div class="comp"><div class="demo" style="${demoBg}">${h}</div><div><h3>${t}</h3><p style="font-size:14.5px;color:rgba(237,230,225,.7)">${d}</p></div></div>`).join('');
  $('#ncards').innerHTML = A.ncard('Déjeuner :', 'Midi approche. Tu as prévu quelque chose, ou je te propose deux idées légères près du bureau ?') + A.ncard('Réunion :', 'Point d\'équipe dans 15 minutes. L\'ordre du jour est prêt, je l\'ai envoyé à tout le monde.') + A.ncard('Trajet :', 'Ça roule mal sur le périphérique. Pars dix minutes plus tôt, j\'ai prévenu Marc.');

  /* ---------- 07 Mouvement ---------- */
  const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const TR = [['Rapide', 200, EASE, 'survol, états, cases'], ['Normal', 450, EASE, 'entrées de cartes, changements d\'écran'], ['Lent', 900, EASE, 'scènes, logo, horizon'], ['Linéaire, à éviter', 900, 'linear', 'mécanique, sans vie']];
  $('#tracks').innerHTML = TR.map(([n, d, , u], i) => `<div style="margin-top:16px"><div style="display:flex;justify-content:space-between;font-size:15px"><span style="color:#fff">${n} <span class="mono" style="font-size:12px;opacity:.6;margin-left:8px">${d} ms</span></span><span style="opacity:.55;font-size:14px">${u}</span></div><div class="track" data-i="${i}"><i></i><span>Rejouer</span></div></div>`).join('');
  const play = (tr) => { const [, d, e] = TR[+tr.dataset.i]; const dot = $('i', tr); dot.animate([{ transform: 'translateX(0)', opacity: 0.4 }, { transform: `translateX(${tr.clientWidth - 58}px)`, opacity: 1 }], { duration: d, easing: e, fill: 'forwards' }); };
  $$('.track').forEach((t) => t.addEventListener('click', () => play(t)));
  $('#motion-css').textContent = `:root {\n  --duree-rapide: 200ms;\n  --duree-normale: 450ms;\n  --duree-lente: 900ms;\n  --courbe-lever: ${EASE};   /* départ net, arrivée très douce */\n  --decalage: 60ms;                                   /* entre deux éléments d'un groupe */\n  --montee: 14px;                                     /* distance d'entrée, depuis le bas */\n}`;

  /* ---------- 08 Galerie et agrandissement ---------- */
  const M = [
    ['01-ouverture.jpg', '3d', 'Ouverture : le dôme lumineux'], ['15-panneau.jpg', '3d', 'Panneau lumineux'], ['16-scene.mp4', 'video', 'Écran de scène'],
    ['17-facade.jpg', '3d', 'Enseigne de façade au lever du jour'], ['13-cartes-enseigne.jpg', '3d', 'Cartes de visite et enseigne'], ['19-affiche-rue.mp4', 'video', 'Affiche numérique de rue'],
    ['25-caisson.jpg', '3d', 'Caisson lumineux'], ['23-telephone.jpg', '3d', 'Publication sur téléphone'], ['24-reseaux.jpg', 'planche', 'Réseaux sociaux'],
    ['09-ecrans.jpg', 'planche', 'Écrans de l\'application'], ['21-app.mp4', 'video', 'L\'application'], ['22-montre.mp4', 'video', 'Montre et messages'],
    ['20-icone.jpg', 'planche', 'Icône d\'application'], ['10-mosaique.mp4', 'video', 'Mosaïque animée'], ['08-astre.mp4', 'video', 'L\'astre'],
    ['07-logo-variantes.jpg', 'planche', 'Logo et variantes'], ['06-logo-anime.mp4', 'video', 'Révélation du logotype'], ['05-construction.jpg', 'planche', 'Construction du logotype'],
    ['11-palette.jpg', 'planche', 'Palette'], ['12-degrades.jpg', 'planche', 'Dégradés'], ['14-typographie.jpg', 'planche', 'Typographie'],
    ['03-mots-cles.jpg', 'planche', 'Mots-clés'], ['04-valeurs.jpg', 'planche', 'Valeurs'], ['02-presentation.jpg', 'planche', 'Présentation'],
    ['18-guide-de-marque.jpg', 'planche', 'Pages du guide imprimé'], ['26-merci.jpg', 'planche', 'Merci'],
  ].map(([f, k, c]) => ({ f, k, c, v: f.endsWith('.mp4'), th: 'media/vignettes/' + f.replace('.mp4', '.jpg') }));
  const FIL = [['tout', 'Tout'], ['3d', 'Mockups 3D'], ['video', 'Vidéos'], ['planche', 'Planches']];
  let list = M;
  const drawGal = (k) => {
    list = k === 'tout' ? M : M.filter((m) => m.k === k);
    $('#gal').innerHTML = list.map((m, i) => `<button data-i="${i}" aria-label="Agrandir : ${m.c}"><img src="${m.th}" alt="${m.c}" loading="lazy">${m.v ? '<span class="play"></span>' : ''}<figcaption>${m.c}</figcaption></button>`).join('');
    $$('#gal button').forEach((b) => b.addEventListener('click', () => openLb(list, +b.dataset.i)));
    $$('#filters button').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
  };
  $('#filters').innerHTML = FIL.map(([k, t]) => `<button data-k="${k}">${t} <span style="opacity:.5">${k === 'tout' ? M.length : M.filter((m) => m.k === k).length}</span></button>`).join('');
  $$('#filters button').forEach((b) => b.addEventListener('click', () => drawGal(b.dataset.k)));
  drawGal('tout');
  const lb = $('#lb'); let lbList = [], lbI = 0;
  const drawLb = () => { const m = lbList[lbI]; $('#lb-m').innerHTML = m.v ? `<video src="media/${m.f}" autoplay loop muted playsinline controls></video>` : `<img src="media/${m.f}" alt="${m.c}">`; $('#lb-c').textContent = m.c; $('#lb-n').textContent = lbList.length > 1 ? `${pad(lbI + 1)} / ${pad(lbList.length)}` : ''; $('#lb-p').style.display = $('#lb-nx').style.display = lbList.length > 1 ? '' : 'none'; };
  function openLb(l, i) { lbList = l; lbI = i; lb.classList.add('on'); document.body.style.overflow = 'hidden'; drawLb(); }
  const closeLb = () => { lb.classList.remove('on'); $('#lb-m').innerHTML = ''; document.body.style.overflow = ''; };
  const step = (d) => { lbI = (lbI + d + lbList.length) % lbList.length; drawLb(); };
  $('#lb-p').addEventListener('click', () => step(-1)); $('#lb-nx').addEventListener('click', () => step(1)); $('#lb-x').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.id === 'lb-m') closeLb(); });
  document.addEventListener('keydown', (e) => { if (!lb.classList.contains('on')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
  $$('[data-lb]').forEach((im) => im.addEventListener('click', () => { const m = M.find((x) => x.f === im.dataset.lb); if (m) openLb([m], 0); }));

  /* ---------- 09 Ressources ---------- */
  $('#files').innerHTML = VERS.map(([k, t, , f]) => `<tr><td style="color:#fff"><span style="display:inline-flex;align-items:center;gap:14px"><span style="display:inline-grid;place-items:center;width:74px;height:40px;background:#fff;border-radius:8px">${f('#1C1122').replace('<svg ', '<svg style="max-width:54px;max-height:18px" ')}</span>${t}</span></td>${CN.map((c) => `<td><a class="bt ghost s" href="logo/aube-${k}-${c}.svg" download>SVG</a></td>`).join('')}</tr>`).join('');
  const vars = ':root {\n' + COLORS.map((c) => `  --${c.n.toLowerCase()}: ${c.h};`.padEnd(22) + `/* ${c.r} */`).join('\n') + '\n  --encre: #231A26;   /* Texte sur fond clair */\n  --police: "Outfit", system-ui, sans-serif;\n  --police-mono: "DM Mono", ui-monospace, monospace;\n}';
  $('#vars').textContent = vars;
  $('#copy-vars').addEventListener('click', () => copy(vars, 'Variables CSS copiées'));

  /* ---------- Vie : orbes animés, vidéos qui jouent quand on les voit ---------- */
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm) { const t0 = performance.now(); const loop = (now) => { if (current && !document.hidden) A.seekOrbs((now - t0) / 1000, 8, current); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  if ('IntersectionObserver' in window && !calm) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target; if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { threshold: 0.5 });
    $$('video.v').forEach((v) => io.observe(v));
  }
  show();
})();
