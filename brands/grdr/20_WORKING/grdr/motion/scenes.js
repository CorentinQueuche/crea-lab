/* Outils communs aux six vidéos du lot 29 à 34 (objet global MV ; classes préfixées mv- dans motion.css).
   Rien ici ne bouge tout seul : ce sont des fonctions pures, appelées par le seek(t) de chaque page.
   Dépend de brand/marque.js (Marque) et de motion/lib.js (M). */
(function () {
  const A = window.Marque, M = window.M, MV = {};

  /* ---------- Chargement ----------
     Les polices du socle sont en font-display:block : on les demande toutes avant la première image
     (lib.js ne précharge pas celles de ce projet). MV.pret(racine) attend aussi les images. */
  const POLICES = ['600 20px Nunito', '700 20px Nunito', '800 20px Nunito', '900 20px Nunito',
    '400 20px "Nunito Sans"', '600 20px "Nunito Sans"', '700 20px "Nunito Sans"',
    '400 20px "Geist Mono"', '500 20px "Geist Mono"', '600 20px "Geist Mono"'];
  MV.polices = () => (document.fonts ? Promise.all(POLICES.map((f) => document.fonts.load(f, '0aé€’').catch(() => 0))) : Promise.resolve());
  MV.images = (racine = document) => Promise.all([...racine.querySelectorAll('img')].map((i) => (i.decode ? i.decode().catch(() => 0) : 0)));
  MV.pret = (racine) => MV.polices().then(() => MV.images(racine)).then(() => (document.fonts ? document.fonts.ready : 0));

  /* ---------- Temps ---------- */
  /* progression linéaire 0 → 1 (pour les blocs du socle, qui appliquent eux-mêmes Marque.ease) */
  MV.lin = (t, debut, duree) => M.clamp((t - debut) / duree);
  /* entrée courte : montée et fondu. p déjà passé dans une courbe de sortie. */
  MV.entree = (el, p, dy = 24) => { el.style.opacity = p <= 0 ? '0' : p >= 1 ? '1' : p.toFixed(3); el.style.transform = p >= 1 ? 'none' : `translateY(${((1 - p) * dy).toFixed(2)}px)`; };
  MV.arr = (v, d = 2) => { const k = Math.pow(10, d); return Math.round(v * k) / k; };

  /* ---------- Mise à jour sur place ----------
     Le socle rend ses blocs en HTML (option p). Plutôt que de remplacer le bloc à chaque image (les images
     se rechargeraient), on recopie dans le bloc en place ce qui a changé : textes, attributs, petits SVG. */
  const gabarit = document.createElement('template');
  MV.analyser = (html) => { gabarit.innerHTML = html.trim(); return gabarit.content.firstElementChild; };
  MV.morph = (a, b) => {
    if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) { a.replaceWith(document.importNode(b, true)); return; }
    if (a.nodeType === 3) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
    if (a.nodeType !== 1) return;
    for (const at of [...a.attributes]) if (!b.hasAttribute(at.name)) a.removeAttribute(at.name);
    for (const at of [...b.attributes]) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
    const ac = a.childNodes, bc = b.childNodes;
    if (ac.length !== bc.length) { a.innerHTML = b.innerHTML; return; }
    for (let i = 0; i < ac.length; i++) MV.morph(ac[i], bc[i]);
  };
  /* bloc(el, rendu) renvoie maj(p) : ne refait le bloc que si p a changé */
  MV.bloc = (el, rendu) => { let dernier = null; return (p) => { const q = MV.arr(p, 4); if (q === dernier) return false; dernier = q; MV.morph(el, MV.analyser(rendu(q))); return true; }; };

  /* ---------- L'empreinte, image par image ----------
     tracé(n, pas) : un chemin caché par boucle, pour connaître la position du bout du trait (le « bout de la boucle »). */
  MV.sondes = (n, pas) => { const G = A.empreinteGeo(n, pas), ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute'; document.body.appendChild(svg);
    return G.map((g) => { const p = document.createElementNS(ns, 'path'); p.setAttribute('d', g.d); svg.appendChild(p); const tot = p.getTotalLength();
      return { ...g, bout: (part) => { const q = p.getPointAtLength(Math.min(tot, M.clamp(part) * g.l)); return [q.x, q.y]; } }; }); };

  /* ---------- Chiffres ---------- */
  MV.euroHTML = (n) => `${A.nombre(n)}<i>€</i>`;

  window.MV = MV;
})();
