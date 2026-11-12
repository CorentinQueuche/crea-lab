/* CUSTOM — outils de mouvement partagés par les vidéos de motion/.
   Tout est fonction pure du temps : aucune horloge, aucun hasard sans graine, aucune animation ni transition CSS.
   Règles de MARQUE.md (« Le mouvement ») : tout avance d'un pas. Un élément entre en glissant le long de la pente du Cran
   (13,3°) et s'arrête net : 0,5 s, quart sortant (Marque.ease). Le surligneur se pose de gauche à droite en 0,25 s, puis le
   texte passe en Encre. Les sprites tournent à 8 images par seconde, en crans, sans interpolation. Les deux blocs du Cran
   arrivent à 0,12 s d'écart, le logotype suit lettre par lettre (0,04 s). Pas de rebond, pas de fondu long.
   M.tw(t, début, durée, courbe) renvoie 0 → 1 ; M.mix(a, b, p) interpole ; M.cran(t) cale un temps sur la grille de 8 i/s. */
(function () {
  const M = {};
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  M.clamp = clamp;
  M.mix = (a, b, p) => a + (b - a) * p;
  /* Durées de la marque, en secondes. CRAN : une image de sprite (8 i/s), l'unité de rythme des coupes. */
  M.CRAN = 1 / 8; M.IPS = 8;
  M.ETAT = 0.125; M.ENTRER = 0.5; M.MONTEE = 10; M.DECALAGE = 0.04; M.BLOCS = 0.12; M.SURL = 0.25; M.REPOS = 1.5;
  M.JAUGE = 1.35; M.LOGO = 1.8; // hérités du gabarit, inutilisés par Custom
  /* La pente du Cran : 13,3°. Un glissement suit l'arête des blocs (vers le haut et la droite). */
  M.PENTE = 13.3; M.TAN = 0.2364;
  M.SIN = Math.sin((13.3 * Math.PI) / 180); M.COS = Math.cos((13.3 * Math.PI) / 180);
  /* Courbes : sorties seulement (départ franc, arrêt net). quartOut = Marque.ease ; expoOut ≈ cubic-bezier(.16, 1, .3, 1) */
  M.quartOut = (p) => 1 - Math.pow(1 - clamp(p), 4);
  M.quintOut = (p) => 1 - Math.pow(1 - clamp(p), 5);
  M.cubicOut = (p) => 1 - Math.pow(1 - clamp(p), 3);
  M.expoOut = (p) => (p >= 1 ? 1 : p <= 0 ? 0 : 1 - Math.pow(2, -10 * p));
  M.lin = (p) => clamp(p);
  /* Entrées-sorties, pour un balayage qui traverse le cadre */
  M.cubicInOut = (p) => { p = clamp(p); return p < 0.5 ? 4 * p ** 3 : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  M.sineInOut = (p) => -(Math.cos(Math.PI * clamp(p)) - 1) / 2;
  M.cubicIn = (p) => Math.pow(clamp(p), 3);
  /* progression 0 → 1 entre début et début + durée, passée dans une courbe (quartOut par défaut) */
  M.tw = (t, debut, duree, courbe = M.quartOut) => courbe(clamp((t - debut) / duree));
  /* Crans : temps calé sur la grille de 8 i/s (ou ips), et index d'image d'un sprite de n images (0 → n − 1) */
  M.cran = (t, ips = M.IPS) => Math.floor(t * ips + 1e-6) / ips;
  M.image = (t, n, ips = M.IPS) => ((Math.floor(t * ips + 1e-6) % n) + n) % n;
  /* Progression en marches : p (0 → 1) arrondi à n marches (une animation qui avance d'un pas à la fois) */
  M.marches = (p, n) => Math.floor(clamp(p) * n + 1e-6) / n;
  /* Temps d'une boucle : ramène t dans [0, d) */
  M.boucle = (t, d) => ((t % d) + d) % d;
  /* Glissement le long de la pente : renvoie [dx, dy] pour une distance d (d > 0 : vers le bas et la gauche, d'où l'élément arrive) */
  M.pente = (d) => [-d * M.SIN, d * M.COS];
  /* Entrée de marque Custom : l'élément glisse le long de la pente sur `montee` px et s'arrête net, sans fondu.
     Pose transform sur l'élément ; renvoie la progression. o.extra : transformation ajoutée (échelle, rotation). */
  M.glisse = (el, t, debut, o = {}) => { const { duree = M.ENTRER, montee = 60, courbe = M.quartOut, extra = '', cache = true } = o;
    const k = M.tw(t, debut, duree, courbe), [dx, dy] = M.pente((1 - k) * montee);
    el.style.transform = (k >= 1 ? '' : `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) `) + extra;
    if (cache) el.style.visibility = t < debut ? 'hidden' : 'visible';
    return k; };
  /* Entrée générique (fondu et montée), gardée pour les gabarits : Custom lui préfère M.glisse */
  M.entre = (el, t, debut, o = {}) => { const { duree = M.ENTRER, montee = M.MONTEE, courbe = M.quartOut, extra = '' } = o;
    const k = M.tw(t, debut, duree, courbe);
    el.style.opacity = k.toFixed(3);
    el.style.transform = (k >= 1 ? '' : `translateY(${((1 - k) * montee).toFixed(2)}px) `) + extra;
    return k; };
  /* Couleurs : interpolation par paliers de la palette (chaque palier est court et sans gris).
     M.rampe(['#FFFFFF', '#F1FF93', '#E2FF21'], p) */
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  M.melange = (a, b, p) => { const x = hex(a), y = hex(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * clamp(p)).toString(16).padStart(2, '0')).join(''); };
  M.rampe = (stops, p) => { p = clamp(p); const n = stops.length - 1, i = Math.min(n - 1, Math.floor(p * n)); return M.melange(stops[i], stops[i + 1], p * n - i); };
  /* Du Blanc au Fluo par le Fluo 200 (jamais par un gris) */
  M.PASSAGE = ['#FFFFFF', '#F1FF93', '#E2FF21'];
  M.passage = (p) => M.rampe(M.PASSAGE, p);
  M.VERS_NET = M.PASSAGE;
  /* Traînée d'un sprite : les images précédentes, de la plus récente à la plus ancienne, sans transparence */
  M.TRAINEE = ['#56565A', '#404042', '#272728'];
  /* Générateur pseudo-aléatoire à graine (mulberry32) : déterministe d'un rendu à l'autre */
  M.graine = (s) => { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  M.el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
  /* Montre un seul enfant d'une liste (coupe franche) : M.montre(liste, i) */
  M.montre = (liste, i) => liste.forEach((e, k) => { e.style.display = k === i ? '' : 'none'; });

  /* Mots qui se posent : découpe un élément en mots (balises internes conservées) et renvoie set(t, début) :
     chaque mot glisse le long de la pente, décalé de 40 ms. */
  M.mots = (node) => { const mots = [];
    const walk = (n) => { [...n.childNodes].forEach((c) => {
      if (c.nodeType === 3) { const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((part) => { if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const s = document.createElement('span'); s.textContent = part; s.style.display = 'inline-block'; s.style.visibility = 'hidden'; frag.appendChild(s); mots.push(s); });
        n.replaceChild(frag, c); }
      else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c); }); };
    walk(node);
    const set = (t, debut, o = {}) => mots.forEach((s, i) => M.glisse(s, t, debut + i * (o.decalage || M.DECALAGE), o));
    set.n = mots.length;
    return set; };

  /* Pointeur générique (flèche), pour les vidéos d'écran. press : 0 → 1 (état pressé) */
  M.pointeur = (taille = 30) => `<svg viewBox="0 0 24 24" width="${taille}" height="${taille}" style="position:absolute;left:0;top:0;overflow:visible;z-index:80;transform-origin:2px 2px">
    <path d="M2 2 L2 19.5 L6.8 15.2 L9.9 22 L13.1 20.6 L10.1 13.9 L16.6 13.9 Z" fill="#FFFFFF" stroke="#03010E" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

  /* Polices de Custom : lancer le chargement tout de suite pour que document.fonts.ready les attende
     (l'enregistreur l'attend avant la première image) */
  if (document.fonts) {
    ['800 20px "Archivo"', '400 20px "Bebas Neue"', '400 20px "Inter"', '500 20px "Inter"', '600 20px "Inter"', '500 20px "JetBrains Mono"', '700 20px "JetBrains Mono"'].forEach((f) => document.fonts.load(f));
  }
  window.M = M;
})();
