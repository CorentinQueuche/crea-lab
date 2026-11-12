/* PAYOUT — outils de mouvement partagés par les vidéos de motion/.
   Tout est fonction pure du temps : aucune horloge, aucun hasard sans graine, aucune animation ni transition CSS.
   Règles de MARQUE.md : état 160 ms · entrer 420 ms, montée de 12 px · jauge 54 → 85 en 1 350 ms (Marque.ease) ·
   décalage dans un groupe 80 ms · départ franc, arrivée amortie, aucun rebond · 1,5 s immobile sur l'état final.
   M.tw(t, début, durée, courbe) renvoie 0 → 1 ; M.mix(a, b, p) interpole. */
(function () {
  const M = {};
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  M.clamp = clamp;
  M.mix = (a, b, p) => a + (b - a) * p;
  /* Durées de la marque, en secondes */
  M.ETAT = 0.16; M.ENTRER = 0.42; M.MONTEE = 12; M.DECALAGE = 0.08; M.JAUGE = 1.35; M.LOGO = 1.8; M.REPOS = 1.5;
  /* Courbes : sorties seulement (départ franc, arrivée amortie). quartOut = Marque.ease ; expoOut ≈ cubic-bezier(.16, 1, .3, 1) */
  M.quartOut = (p) => 1 - Math.pow(1 - clamp(p), 4);
  M.quintOut = (p) => 1 - Math.pow(1 - clamp(p), 5);
  M.cubicOut = (p) => 1 - Math.pow(1 - clamp(p), 3);
  M.expoOut = (p) => (p >= 1 ? 1 : p <= 0 ? 0 : 1 - Math.pow(2, -10 * p));
  /* Entrées-sorties, pour un mouvement de caméra ou un défilement qui part et s'arrête */
  M.cubicInOut = (p) => { p = clamp(p); return p < 0.5 ? 4 * p ** 3 : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  M.sineInOut = (p) => -(Math.cos(Math.PI * clamp(p)) - 1) / 2;
  /* progression 0 → 1 entre début et début + durée, passée dans une courbe (quartOut par défaut) */
  M.tw = (t, debut, duree, courbe = M.quartOut) => courbe(clamp((t - debut) / duree));
  /* Entrée de marque : fondu et montée de 12 px en 420 ms. Pose opacity et transform sur l'élément ; renvoie la progression. */
  M.entre = (el, t, debut, o = {}) => { const { duree = M.ENTRER, montee = M.MONTEE, courbe = M.quartOut, extra = '' } = o;
    const k = M.tw(t, debut, duree, courbe);
    el.style.opacity = k.toFixed(3);
    el.style.transform = (k >= 1 ? '' : `translateY(${((1 - k) * montee).toFixed(2)}px) `) + extra;
    return k; };
  /* Couleurs : interpolation par paliers de la palette, en RVB linéaire par palier (chaque palier est court et sans gris).
     M.rampe(['#FFFFFF', '#A3FFBF', '#36FF72'], p) */
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  M.melange = (a, b, p) => { const x = hex(a), y = hex(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * clamp(p)).toString(16).padStart(2, '0')).join(''); };
  M.rampe = (stops, p) => { p = clamp(p); const n = stops.length - 1, i = Math.min(n - 1, Math.floor(p * n)); return M.melange(stops[i], stops[i + 1], p * n - i); };
  /* Du 54 (Prélevé) au 85 (Net) sans traverser de couleur terne : le mélange direct passe par un kaki. On passe par le Blanc
     (cœur des halos), puis par le Net 200 : chaque palier reste lumineux et saturé. */
  M.PASSAGE = ['#FF5B35', '#FFFFFF', '#A3FFBF', '#36FF72'];
  M.passage = (p) => M.rampe(M.PASSAGE, p);
  /* Du Blanc au Net, par le Net 200 */
  M.VERS_NET = ['#FFFFFF', '#A3FFBF', '#36FF72'];
  /* Générateur pseudo-aléatoire à graine (mulberry32) : déterministe d'un rendu à l'autre */
  M.graine = (s) => { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  M.el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

  /* Mots qui se posent : découpe un élément en mots (balises internes conservées) et renvoie set(t, début) :
     chaque mot entre en fondu et montée, décalé de 80 ms. */
  M.mots = (node) => { const mots = [];
    const walk = (n) => { [...n.childNodes].forEach((c) => {
      if (c.nodeType === 3) { const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((part) => { if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const s = document.createElement('span'); s.textContent = part; s.style.display = 'inline-block'; s.style.opacity = '0'; frag.appendChild(s); mots.push(s); });
        n.replaceChild(frag, c); }
      else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c); }); };
    walk(node);
    const set = (t, debut, o = {}) => mots.forEach((s, i) => M.entre(s, t, debut + i * (o.decalage || M.DECALAGE), o));
    set.n = mots.length;
    return set; };

  /* Pointeur générique (flèche), pour les vidéos d'écran. press : 0 → 1 (état pressé) */
  M.pointeur = (taille = 30) => `<svg viewBox="0 0 24 24" width="${taille}" height="${taille}" style="position:absolute;left:0;top:0;overflow:visible;z-index:80;transform-origin:2px 2px">
    <path d="M2 2 L2 19.5 L6.8 15.2 L9.9 22 L13.1 20.6 L10.1 13.9 L16.6 13.9 Z" fill="#F3F6F4" stroke="#060A08" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

  /* Polices : lancer le chargement tout de suite pour que document.fonts.ready les attende (l'enregistreur l'attend avant la première image) */
  if (document.fonts) {
    ['400 20px "Instrument Sans"', '500 20px "Instrument Sans"', '600 20px "Instrument Sans"', '400 20px "Chivo Mono"', '500 20px "Chivo Mono"'].forEach((f) => document.fonts.load(f));
  }
  window.M = M;
})();
