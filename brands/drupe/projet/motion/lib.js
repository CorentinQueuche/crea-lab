/* DRUPE — outils de mouvement partagés.
   Tout est fonction pure du temps : aucune horloge, aucun hasard, aucune animation CSS.
   M.tw(t, début, durée, courbe) renvoie 0 → 1 ; M.mix(a, b, p) interpole ; M.ramp(couleurs, p) suit le mûrissement. */
(function () {
  const M = {};
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  M.clamp = clamp;
  M.mix = (a, b, p) => a + (b - a) * p;
  M.lin = (p) => p;
  M.expoOut = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
  M.expoIn = (p) => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10));
  M.expoInOut = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2);
  M.quintOut = (p) => 1 - Math.pow(1 - p, 5);
  M.quartOut = (p) => 1 - Math.pow(1 - p, 4);
  M.cubicOut = (p) => 1 - Math.pow(1 - p, 3);
  M.quintInOut = (p) => (p < 0.5 ? 16 * p ** 5 : 1 - Math.pow(-2 * p + 2, 5) / 2);
  M.cubicInOut = (p) => (p < 0.5 ? 4 * p ** 3 : 1 - Math.pow(-2 * p + 2, 3) / 2);
  M.sineInOut = (p) => -(Math.cos(Math.PI * p) - 1) / 2;
  /* progression 0 → 1 entre start et start + dur, passée dans une courbe */
  M.tw = (t, start, dur, ease = M.expoOut) => ease(clamp((t - start) / dur));
  /* dérivée numérique (vitesse) d'une fonction du temps */
  M.speed = (f, t, h = 1 / 120) => (f(t + h) - f(t - h)) / (2 * h);
  /* identifiants uniques pour les masques et dégradés SVG */
  let uid = 0;
  M.uid = (p = 'm') => `${p}${++uid}`;
  M.el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
  M.css = (node, o) => { for (const k in o) node.style[k] = o[k]; };
  M.px = (v) => v.toFixed(2) + 'px';

  /* Couleurs : mélange de deux codes hexadécimaux, et rampe à pas égaux.
     Pour mûrir, toujours dans l'ordre de la marque : Café vert → Pulpe → Cerise (jamais Cerise ↔ Feuille directement). */
  const h2r = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  M.mixHex = (a, b, p) => { const A = h2r(a), B = h2r(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * clamp(p)).toString(16).padStart(2, '0')).join(''); };
  M.ramp = (stops, p) => { p = clamp(p); const n = stops.length - 1, k = Math.min(n - 1, Math.floor(p * n));
    return M.mixHex(stops[k], stops[k + 1], p * n - k); };

  /* Le symbole découpé en trois sous-tracés : les deux moitiés du fruit et la queue.
     moitiés[0] est du côté +V (direction perpendiculaire au sillon), moitiés[1] du côté -V. */
  M.symbolParts = () => {
    const parts = window.Marque.symbolPath().split(/(?=M)/).map((s) => s.trim()).filter(Boolean);
    const f = (window.Marque.SYM.tilt * Math.PI) / 180;
    return { a: parts[0], b: parts[1], queue: parts[2], V: [Math.cos(f), Math.sin(f)] };
  };

  /* Texte écrit lettre à lettre : découpe un élément en spans (balises <br> conservées),
     renvoie set(p) où p = 0 → 1 (part du texte écrite). Les dernières lettres arrivent en fondu et montée. */
  M.typer = (node, opts = {}) => {
    const { soft = 3, rise = 0.18 } = opts;
    const chars = [];
    const walk = (n) => {
      [...n.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          // un mot = un span insécable, pour que la mise à la ligne ne bouge jamais pendant l'écriture
          c.textContent.split(/([ \t\n\r]+)/).forEach((part) => {
            if (!part) return;
            if (/^[ \t\n\r]+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); chars.push(null); return; }
            const w = document.createElement('span');
            w.style.whiteSpace = 'nowrap';
            [...part].forEach((ch) => {
              const s = document.createElement('span');
              s.textContent = ch;
              s.style.display = 'inline-block';
              s.style.whiteSpace = 'pre';
              w.appendChild(s);
              chars.push(s);
            });
            frag.appendChild(w);
          });
          n.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    };
    walk(node);
    const n = chars.length;
    const set = (p) => {
      const head = p * (n + soft);
      chars.forEach((s, i) => {
        if (!s) return;
        const k = clamp((head - i) / soft);
        const e = M.cubicOut(k);
        s.style.opacity = e.toFixed(3);
        s.style.transform = k >= 1 ? 'none' : `translateY(${((1 - e) * rise).toFixed(3)}em)`;
      });
    };
    set(0);
    set.count = n;
    return set;
  };

  /* Arrondi : rectangle à rayons de coins indépendants (tl, tr, br, bl) en tracé SVG */
  M.rrect = (x, y, w, h, tl, tr, br, bl) => {
    const f = (v) => +v.toFixed(3);
    return `M${f(x + tl)},${f(y)} H${f(x + w - tr)} A${f(tr)},${f(tr)} 0 0 1 ${f(x + w)},${f(y + tr)} V${f(y + h - br)} A${f(br)},${f(br)} 0 0 1 ${f(x + w - br)},${f(y + h)} H${f(x + bl)} A${f(bl)},${f(bl)} 0 0 1 ${f(x)},${f(y + h - bl)} V${f(y + tl)} A${f(tl)},${f(tl)} 0 0 1 ${f(x + tl)},${f(y)} Z`;
  };

  /* Polices : on lance le chargement tout de suite pour que document.fonts.ready les attende */
  if (document.fonts) {
    ['300 20px "Bricolage Grotesque"', '400 20px "Bricolage Grotesque"', '500 20px "Bricolage Grotesque"', '600 20px "Bricolage Grotesque"',
      '400 20px "IBM Plex Mono"', '500 20px "IBM Plex Mono"'].forEach((f) => document.fonts.load(f));
  }
  window.M = M;
})();
