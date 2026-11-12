/* DRUPE — scènes animées. Chaque fonction monte sa scène dans un conteneur et renvoie son seek(t).
   Grandes scènes : logo (06), semis (08), affiche (20), app (22), montre (23), ardoise (27).
   Petites scènes de la mosaïque (11) : pose (pastille qui se pose), minuteur, tampon, sachet, compteur.
   Mouvement de la marque : la couleur mûrit d'abord (Café vert → Pulpe → Cerise), puis les deux moitiés s'ouvrent
   de la largeur du sillon ; les pastilles se posent en tournant de quelques degrés. Sorties douces, aucun rebond, aucune lueur.
   Dépend de brand/marque.js (Marque) et motion/lib.js (M). */
(function () {
  const A = window.Marque, M = window.M, C = A.COULEURS;
  const S = {};
  const px = M.px;
  const TAU = Math.PI * 2;
  const ombre = (k) => `rgba(42,26,20,${k.toFixed(3)})`; // ombres teintées Grain

  const frame = (el, w, h, cls, bg) => {
    el.className = `scene ${cls}`;
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    if (bg) el.style.background = bg;
    return el;
  };
  /* Pastille qui se pose : rotation de quelques degrés, ombre qui se resserre. p = 0 → 1. */
  const poser = (node, p, { a0 = -16, a1 = 6, lift = 36, s0 = 1.1 } = {}) => {
    const e = M.expoOut(p);
    node.style.opacity = M.cubicOut(Math.min(1, p * 2.2)).toFixed(3);
    node.style.transform = `translateY(${px(-lift * (1 - e))}) scale(${M.mix(s0, 1, e).toFixed(4)}) rotate(${M.mix(a0, a1, e).toFixed(3)}deg)`;
    const hgt = 1 - e;
    node.style.filter = `drop-shadow(0 ${px(1 + 10 * hgt)} ${px(1 + 6 * hgt)} ${ombre(0.16 - 0.08 * hgt)}) drop-shadow(0 ${px(6 + 22 * hgt)} ${px(10 + 18 * hgt)} ${ombre(0.1)})`;
  };

  /* ============ 06 — Révélation du logotype ============
     Les lettres arrivent pleines (sans sillon), en Café vert ; elles mûrissent de bas en haut jusqu'à la Cerise ;
     le sillon les fend l'une après l'autre, de haut en bas ; le logotype se décale et le descripteur se pose. */
  S.logo = (el, o = {}) => {
    const { w = 1920, h = 1080, descriptor = true, bg = C.parche, t0 = 0 } = o;
    frame(el, w, h, 'sc-logo', bg);
    const id = M.uid('lg');
    const L = A.LETTRES, K = A.LOCKUP, WW = A.WORD_W;
    const S0 = (w * (descriptor ? 0.5 : 0.7)) / WW;
    const S1 = descriptor ? (w * 0.66) / K.box[2] : S0;
    // pont qui comble le sillon (la lettre « pleine ») : 8 de large juste après le fût, un peu débordant pour éviter les jours
    const yU = (x, r) => 52 + Math.sqrt(Math.max(0, r * r - (x - 48) * (x - 48)));
    const pont = (ch) => ch === 'U'
      ? `M20,52 A28,28 0 0 0 28.3,${yU(28.3, 28).toFixed(3)} L28.3,${yU(28.3, 48).toFixed(3)} A48,48 0 0 1 20,${yU(20, 48).toFixed(3)} L19.7,${yU(20, 48).toFixed(3)} L19.7,52 Z`
      : 'M19.7,0 H28.3 V100 H19.7 Z';
    let defs = '', body = '';
    L.ordre.forEach((ch, i) => {
      defs += `<linearGradient id="${id}g${i}" gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="0" y2="0">
          <stop class="s0" offset="0" stop-color="${C.cerise}"/><stop class="s1" offset="0" stop-color="${C.cerise}"/>
          <stop class="s2" offset="0" stop-color="${C.pulpe}"/><stop class="s3" offset="0" stop-color="${C.vert}"/><stop offset="1" stop-color="${C.vert}"/></linearGradient>
        <clipPath id="${id}c${i}"><rect class="cut" x="-10" y="-5" width="60" height="200"/></clipPath>`;
      body += `<g class="L"><path fill="url(#${id}g${i})" fill-rule="evenodd" d="${A.letterPath(ch, 0)}"/>
        <path class="pont" clip-path="url(#${id}c${i})" fill="url(#${id}g${i})" d="${pont(ch)}"/></g>`;
    });
    el.innerHTML = `<div class="lum fill" style="background:radial-gradient(70% 60% at 50% 105%,${C.pulpe} 0%,rgba(246,195,192,.45) 45%,rgba(246,195,192,0) 100%)"></div>
      <svg style="position:absolute;inset:0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>
        <g class="word">${body}</g>
        ${descriptor ? `<g class="desc" font-family="${A.FONTS.nom}" font-weight="500" font-size="${K.size}" letter-spacing="${K.tracking}" fill="${C.cerise}">
          ${K.lines.map((tx, k) => `<text class="d${k}" x="${K.x}" y="${K.baselines[k]}">${tx}</text>`).join('')}</g>` : ''}
      </svg>`;
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
    const word = q('.word'), lum = q('.lum'), desc = q('.desc');
    const D = qa('.desc text');
    const LL = qa('.L').map((g, i) => ({ g, i, ox: A.letterX(i), st: qa(`#${id}g${i} stop`), cut: q(`#${id}c${i} .cut`) }));
    // placement : logotype seul centré, puis version complète centrée (boîte du descripteur)
    const pos = (s, bx, bw, by, bh) => ({ X: w / 2 - (bx + bw / 2) * s, Y: h / 2 - (by + bh / 2) * s });
    const p0 = pos(S0, 0, WW, 0, 100), p1 = pos(S1, K.box[0], K.box[2], K.box[1], K.box[3]);
    return (t_) => {
      const t = t_ + t0;
      LL.forEach((l) => {
        // 1. arrivée : montée douce, sans rebond
        const pa = M.tw(t, 0.15 + l.i * 0.09, 1.0, M.quintOut);
        l.g.setAttribute('transform', `translate(${l.ox},${(46 * (1 - pa)).toFixed(3)})`);
        l.g.style.opacity = M.tw(t, 0.15 + l.i * 0.09, 0.6, M.cubicOut).toFixed(3);
        // 2. mûrissement : la Cerise monte du bas, précédée d'une bande de Pulpe
        const a = M.mix(-0.4, 1.05, M.tw(t, 1.15 + l.i * 0.15, 1.35, M.cubicInOut));
        const off = [0, a, a + 0.14, a + 0.34].map((v) => Math.max(0, Math.min(1, v)).toFixed(4));
        l.st.slice(0, 4).forEach((s, k) => s.setAttribute('offset', off[k]));
        // 3. le sillon fend la lettre de haut en bas
        const pc = M.tw(t, 3.0 + l.i * 0.15, 0.5, M.expoOut);
        l.cut.setAttribute('y', (-5 + 110 * pc).toFixed(3));
      });
      lum.style.opacity = (0.15 + 0.6 * M.tw(t, 1.2, 2.2, M.cubicInOut)).toFixed(3);
      // 4. le logotype se recale pour accueillir le descripteur
      const pm = descriptor ? M.tw(t, 4.0, 1.0, M.quintInOut) : 0;
      const Sx = M.mix(S0, S1, pm), X = M.mix(p0.X, p1.X, pm), Y = M.mix(p0.Y, p1.Y, pm);
      word.setAttribute('transform', `translate(${X.toFixed(2)},${Y.toFixed(2)}) scale(${Sx.toFixed(5)})`);
      if (desc) {
        desc.setAttribute('transform', `translate(${p1.X.toFixed(2)},${p1.Y.toFixed(2)}) scale(${S1.toFixed(5)})`);
        D.forEach((d, k) => {
          const p = M.tw(t, 4.55 + k * 0.12, 0.8, M.quintOut);
          d.style.opacity = p.toFixed(3);
          d.setAttribute('transform', `translate(0,${(12 * (1 - p)).toFixed(2)})`);
        });
      }
    };
  };

  /* ============ 08 — Le semis (boucle parfaite) ============
     Le semis se balance ; une drupe sur six mûrit du Café vert à la Cerise, puis redevient verte (la saison suivante). */
  S.semis = (el, o = {}) => {
    const { w = 1920, h = 1080, loop = 8, pas = 196, taille = 102, bg = C.parche, cls = 'grain',
      tons = [C.pulpe, C.vert, C.pulpe, C.vert, C.vert], murir = true, opacite = 1, seed = 0, amp = 14, logo = null, t0 = 0 } = o;
    const cols = Math.ceil(w / pas), rows = Math.ceil(h / pas) + 1;
    frame(el, w, h, 'sc-semis ' + cls, bg);
    el.innerHTML = `<div class="fill">${A.semis({ cols, rows, pas, taille, tons, seed, opacite })}</div>` +
      (logo ? `<div class="mo-logo" style="position:absolute;left:50%;top:50%;width:${logo.w}px;transform:translate(-50%,-50%)">${A.wordmark(logo.c, 'style="width:100%;height:auto;display:block"')}</div>` : '');
    const paths = [...el.querySelectorAll('.semis .sm path')];
    // une drupe sur six mûrit : la Cerise monte dans le fruit, précédée d'une bande de Pulpe (comme le logotype),
    // puis le vert de la saison suivante remonte de la même façon. Jamais de mélange direct vert ↔ Cerise (il donne du brun).
    const id = M.uid('sm');
    const svg = el.querySelector('.semis');
    let defs = '';
    const mures = murir ? paths.filter((_, i) => i % 6 === 2).map((p, k) => {
      defs += `<linearGradient id="${id}${k}" x1="0" y1="1" x2="0" y2="0">${[0, 1, 2, 3, 4].map((j) => `<stop offset="${j === 4 ? 1 : 0}" stop-color="${C.vert}"/>`).join('')}</linearGradient>`;
      p.setAttribute('fill', `url(#${id}${k})`);
      return { p, k, ph: (k * 0.382) % 1 };
    }) : [];
    if (defs) svg.insertAdjacentHTML('afterbegin', `<defs>${defs}</defs>`);
    mures.forEach((m) => { m.st = [...svg.querySelectorAll(`#${id}${m.k} stop`)]; });
    const montee = (p) => M.mix(-0.45, 1.05, M.cubicInOut(M.clamp(p)));
    const lg = el.querySelector('.mo-logo');
    return (t_) => {
      const t = t_ + t0;
      A.seekSemis(t, loop, el, amp);
      mures.forEach((m) => {
        const c = (((t / loop + m.ph) % 1) + 1) % 1;
        // saison périodique : verte → mûrit (0,12 à 0,42) → mûre → le vert revient (0,72 à 1) ; la boucle raccorde
        const [lo, hi, a] = c < 0.42 ? [C.cerise, C.vert, montee((c - 0.12) / 0.3)] : [C.vert, C.cerise, montee((c - 0.72) / 0.28)];
        const off = [0, a, a + 0.14, a + 0.34, 1].map((v) => Math.max(0, Math.min(1, v)).toFixed(4));
        const col = [lo, lo, C.pulpe, hi, hi];
        m.st.forEach((s, j) => { s.setAttribute('offset', off[j]); s.setAttribute('stop-color', col[j]); });
      });
      if (lg && logo.t != null) {
        const p = M.tw(t, logo.t, 0.9, M.quintOut);
        lg.style.opacity = p.toFixed(3);
        lg.style.transform = `translate(-50%,calc(-50% + ${px(10 * (1 - p))}))`;
      }
    };
  };

  /* ============ 20 — Affiche de la colonne (contenu seul, 800 × 1200) ============
     Le triptyque s'écrit ligne par ligne, puis le symbole entre en grand par le coin bas gauche et ses deux moitiés s'ouvrent. */
  S.affiche = (el, o = {}) => {
    const { w = 800, h = 1200, t0 = 0 } = o;
    frame(el, w, h, 'sc-affiche grain', C.pulpe);
    const s = w / 800;
    const SY = A.SYM, sp = M.symbolParts();
    const k = 15 * s;                                   // 1 unité du symbole = 15 px : boîte de 1500 px (1,25 fois la hauteur)
    const cx = 150 * s, cy = 1265 * s;                  // centre du disque : coupé par le bord gauche et le bord bas
    const ox = cx - SY.cx * k, oy = cy - SY.cy * k;
    const half = A.LETTRES.sillon / 2;
    el.innerHTML = `
      <svg style="position:absolute;inset:0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <g class="sym"><g class="ha"><path fill="${C.cerise}" d="${sp.a}"/></g><g class="hb"><path fill="${C.cerise}" d="${sp.b}"/></g><path class="qu" fill="${C.cerise}" d="${sp.queue}"/></g>
      </svg>
      <div class="mo-titre" style="position:absolute;left:${58 * s}px;top:${62 * s}px;font-size:${106 * s}px;color:${C.grain}">
        <div class="l0">Cueilli mûr.</div><div class="l1">Torréfié clair.</div><div class="l2">Servi frais.</div></div>
      <div class="mo-cap url" style="position:absolute;left:${62 * s}px;top:${436 * s}px;font-size:${19 * s}px;color:${C.grain};opacity:.85">www.drupe-cafe.fr</div>
      <div class="lk" style="position:absolute;left:${310 * s}px;bottom:${64 * s}px;width:${330 * s}px">${A.lockup(C.fleur, 'style="width:100%;height:auto;display:block;overflow:visible"')}</div>`;
    const q = (x) => el.querySelector(x);
    const sym = q('.sym'), ha = q('.ha'), hb = q('.hb'), qu = q('.qu'), lk = q('.lk'), url = q('.url');
    const lines = [0, 1, 2].map((i) => M.typer(q('.l' + i), { soft: 3 }));
    return (t_) => {
      const t = t_ + t0;
      [[0.35, 0.75], [1.35, 0.85], [2.45, 0.75]].forEach(([st, d], i) => lines[i](M.tw(t, st, d, M.lin)));
      url.style.opacity = (0.85 * M.tw(t, 3.0, 0.8, M.cubicOut)).toFixed(3);
      // entrée du symbole : glisse depuis le coin, se redresse de quelques degrés
      const pe = M.tw(t, 3.3, 1.5, M.expoOut);
      const dx = -560 * s * (1 - pe), dy = 620 * s * (1 - pe), rot = 9 * (1 - pe);
      sym.setAttribute('transform', `translate(${(ox + dx).toFixed(2)},${(oy + dy).toFixed(2)}) scale(${k}) rotate(${rot.toFixed(3)} ${SY.cx} ${SY.cy})`);
      // les deux moitiés, d'abord jointes, s'écartent de la largeur du sillon
      const po = M.tw(t, 4.55, 0.9, M.quintInOut);
      const g = (half + 0.25) * (1 - po); // jointes, elles se chevauchent d'un rien : aucun liseré
      ha.setAttribute('transform', `translate(${(-sp.V[0] * g).toFixed(3)},${(-sp.V[1] * g).toFixed(3)})`);
      hb.setAttribute('transform', `translate(${(sp.V[0] * g).toFixed(3)},${(sp.V[1] * g).toFixed(3)})`);
      qu.style.opacity = M.tw(t, 4.35, 0.6, M.cubicOut).toFixed(3);
      const pl = M.tw(t, 5.0, 0.9, M.quintOut);
      lk.style.opacity = pl.toFixed(3);
      lk.style.transform = `translateY(${px(10 * s * (1 - pl))})`;
    };
  };

  /* ============ 22 — L'application : composer sa boîte ============
     La carte défile, deux pastilles se posent dans la boîte, le bouton passe à « C'est noté pour mardi ». */
  S.app = (el, o = {}) => {
    const { w = 1920, h = 1080, t0 = 0 } = o;
    frame(el, w, h, 'sc-app g2 grain');
    const k = (h * 0.9) / 868;
    const RH = 106, LT = 194, LH = 432; // hauteur de ligne, haut de la liste, hauteur visible de la liste
    const row = (c, i) => `<div style="position:absolute;left:0;right:0;top:${i * RH}px;height:${RH}px">
        <div class="u-line"></div>
        <div style="position:absolute;left:0;top:16px">${A.pastille(c, 74)}</div>
        <div style="position:absolute;left:88px;right:56px;top:20px"><div style="font-size:22px;font-weight:500;letter-spacing:-.02em;line-height:1.1">${c.nom}</div>
          <div class="cap" style="margin-top:5px">${c.pays} · ${c.alt} · ${c.procede}</div><div style="font-size:13.5px;line-height:1.25;margin-top:4px;opacity:.8">${c.notes.join(', ').toLowerCase()}</div></div>
        <div class="u-add add${i}" style="position:absolute;right:0;top:26px"><span class="pl">${A.icons.plus()}</span></div>
        <div style="position:absolute;right:0;top:68px;font-size:13.5px;font-weight:500">${c.prix}</div></div>`;
    const screen = `<div class="ui ui-bg-b">${A.icons.status()}
      <div style="position:absolute;top:74px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:flex-end">
        <div class="u-h" style="font-size:44px">La carte</div><div class="cap" style="text-align:right;padding-bottom:6px">Semaine 47<br><span class="cnt">0</span> sur 2 choisis</div></div>
      <div style="position:absolute;top:142px;left:24px;right:0;display:flex;gap:8px"><span class="u-chip on">Tous</span><span class="u-chip">Filtre</span><span class="u-chip">Espresso</span><span class="u-chip">Déca</span></div>
      <div style="position:absolute;top:${LT}px;left:24px;right:24px;height:${LH}px;overflow:hidden"><div class="list" style="position:absolute;left:0;right:0;top:0;height:${A.CAFES.length * RH}px">${A.CAFES.map(row).join('')}</div></div>
      <div class="mo-sheet" style="height:218px">
        <div style="position:absolute;left:24px;right:24px;top:22px;display:flex;justify-content:space-between"><span class="cap">Ma boîte · N° 17</span><span class="cap">Torréfaction ${A.DATES.torrefaction}</span></div>
        <div class="mo-slot sl0" style="left:24px;top:52px"></div><div class="mo-slot sl1" style="left:112px;top:52px"></div>
        <div class="bx" style="position:absolute;left:206px;right:24px;top:62px;font-size:14px;line-height:1.35"><span class="bxt">Choisissez deux cafés.<br>On les torréfie mardi.</span></div>
        <div class="u-btn ghost bt" style="position:absolute;left:16px;right:16px;bottom:30px;height:54px;border-radius:27px">
          <span class="b0" style="position:absolute">Choisir deux cafés</span><span class="b1" style="position:absolute;opacity:0">Valider ma boîte</span>
          <span class="b2" style="position:absolute;opacity:0;display:flex;align-items:center;gap:9px"><span style="display:block;width:16px;height:16px">${A.icons.check()}</span>C'est noté pour mardi</span></div>
      </div>
      <div class="fly f0" style="position:absolute;left:0;top:0;z-index:20;opacity:0">${A.pastille('nyeri', 74)}</div>
      <div class="fly f1" style="position:absolute;left:0;top:0;z-index:20;opacity:0">${A.pastille('huila', 74)}</div>
      <div class="mo-touch" style="opacity:0"></div>
      <div class="home"></div></div>`;
    el.innerHTML = `<div class="rig" style="position:absolute;left:${(w - 414 * k) / 2}px;top:${(h - 868 * k) / 2}px">${A.phone(screen, k)}</div>`;
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
    const rig = q('.rig'), list = q('.list'), cnt = q('.cnt'), touch = q('.mo-touch'), bt = q('.bt');
    const b0 = q('.b0'), b1 = q('.b1'), b2 = q('.b2'), bxt = q('.bxt'), slots = [q('.sl0'), q('.sl1')];
    const fl = [q('.f0'), q('.f1')];
    const sheetTop = 844 - 218;
    // défilement de la liste (en px) : descend jusqu'au Cauca (bas de la liste), remonte pour montrer le Huila et le Nyeri
    const fond = A.CAFES.length * RH - LH;
    const scroll = (t) => fond * M.tw(t, 0.9, 1.4, M.quintInOut) - (fond - 40) * M.tw(t, 2.55, 1.1, M.quintInOut);
    // [indice du café, instant du toucher, emplacement]
    const picks = [[2, 3.85, 0], [1, 5.05, 1]];
    const taps = [...picks.map(([i, tt]) => tt), 6.85];
    const addPos = (i, t) => ({ x: 24 + 390 - 48 - 17, y: LT + i * RH + 26 + 17 - scroll(t) });
    return (t_) => {
      const t = t_ + t0;
      const pin = M.tw(t, 0, 1.0, M.quintOut);
      rig.style.opacity = M.tw(t, 0, 0.6, M.cubicOut).toFixed(3);
      rig.style.transform = `translateY(${px(40 * (1 - pin))})`;
      const sc = scroll(t);
      list.style.transform = `translateY(${px(-sc)})`;
      let n = 0;
      picks.forEach(([i, tt, sl], j) => {
        const on = t >= tt + 0.1;
        if (on) n++;
        const add = q('.add' + i);
        add.classList.toggle('on', on);
        add.innerHTML = on ? A.icons.check() : A.icons.plus();
        // la pastille quitte la ligne et se pose dans son emplacement en tournant
        const p = M.tw(t, tt + 0.12, 0.95, M.expoInOut);
        const x0 = 24, y0 = LT + i * RH + 16 - scroll(tt + 0.12);
        const x1 = 24 + (sl ? 88 : 0) + 1, y1 = sheetTop + 52 + 1;
        const x = M.mix(x0, x1, p), y = M.mix(y0, y1, p) - 60 * Math.sin(Math.PI * p);
        const f = fl[j];
        f.style.opacity = t < tt + 0.12 ? '0' : '1';
        const pe = M.tw(t, tt + 0.12, 1.1, M.expoOut);
        f.style.transform = `translate(${px(x)},${px(y)}) rotate(${M.mix(-14, sl ? 7 : -5, pe).toFixed(2)}deg) scale(${(1 + 0.08 * Math.sin(Math.PI * p)).toFixed(4)})`;
        f.style.filter = `drop-shadow(0 ${px(2 + 14 * Math.sin(Math.PI * p))} ${px(4 + 12 * Math.sin(Math.PI * p))} ${ombre(0.18)})`;
        slots[sl].style.opacity = (1 - M.tw(t, tt + 0.8, 0.3, M.cubicOut)).toFixed(3);
      });
      cnt.textContent = n;
      // le toucher : un disque discret qui se resserre, sans éclat
      touch.style.opacity = '0';
      taps.forEach((tt, j) => {
        const p = M.clamp((t - tt + 0.18) / 0.55);
        if (p > 0 && p < 1) {
          const pos = j < 2 ? addPos(picks[j][0], t) : { x: 195, y: 844 - 30 - 27 };
          touch.style.left = px(pos.x); touch.style.top = px(pos.y);
          touch.style.opacity = (0.16 * Math.sin(Math.PI * p)).toFixed(3);
          touch.style.transform = `scale(${M.mix(1.25, 0.85, M.cubicOut(p)).toFixed(3)})`;
        }
      });
      // le bouton : fantôme, puis Cerise quand la boîte est complète, puis « C'est noté pour mardi »
      const pr = M.tw(t, 6.2, 0.45, M.cubicOut), pv = M.tw(t, 6.95, 0.5, M.cubicOut);
      bt.style.background = pr > 0 ? M.mixHex(C.fleur, C.cerise, pr) : 'transparent';
      bt.style.color = M.mixHex(C.grain, C.fleur, pr);
      bt.style.boxShadow = `inset 0 0 0 1.5px rgba(42,26,20,${(0.28 * (1 - pr)).toFixed(3)})`;
      b0.style.opacity = (1 - pr).toFixed(3);
      b1.style.opacity = (pr * (1 - pv)).toFixed(3);
      b1.style.transform = `translateY(${px(-8 * pv)})`;
      b2.style.opacity = pv.toFixed(3);
      b2.style.transform = `translateY(${px(8 * (1 - pv))})`;
      bt.style.transform = `scale(${(1 - 0.025 * Math.sin(Math.PI * M.clamp((t - 6.8) / 0.3))).toFixed(4)})`;
      bxt.innerHTML = t >= 7.0 ? 'Nyeri et Huila.<br>Livrés à vélo jeudi.' : n === 2 ? 'Nyeri et Huila.<br>On les torréfie mardi.' : 'Choisissez deux cafés.<br>On les torréfie mardi.';
    };
  };

  /* ============ 23 — Montre et messages ============
     Le minuteur d'infusion tourne jusqu'à 2:30, puis deux cartes de message se succèdent. */
  const MESSAGES = [
    ['Torréfié ce matin', 'Votre Guji sort du tambour. Il repose deux jours, puis il part à vélo jeudi, avant 9 h.', { heure: '8:12' }],
    ['Plus que ce soir', 'La carte de la semaine ferme à 20 h. Sans nouvelles de vous, on remet les deux mêmes cafés.', { heure: '17:30', action: 'Voir la carte' }],
  ];
  const minuteur = (t, debut, duree) => {
    const p = M.tw(t, debut, duree, M.cubicInOut);
    const sec = Math.round(150 * p);
    return { p, temps: `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` };
  };
  S.montre = (el, o = {}) => {
    const { w = 1920, h = 1080, t0 = 0 } = o;
    frame(el, w, h, 'sc-montre g6 grain');
    const wk = (h * 0.8) / 480, cs = h / 720;
    el.innerHTML = `<div class="wrig" style="position:absolute;left:${w * 0.31 - 150 * wk}px;top:${(h - 480 * wk) / 2}px">${A.watch(A.watchScreen({ temps: '0:00', part: 0 }), wk)}</div>
      <div class="cards" style="position:absolute;left:${w * 0.56}px;top:0;width:${340 * cs}px;height:${h}px">
        ${MESSAGES.map(([a, b, op], i) => `<div class="mc m${i}" style="position:absolute;left:0;top:0;transform-origin:0 0">${A.ncard(a, b, op)}</div>`).join('')}</div>`;
    const q = (s) => el.querySelector(s);
    const wrig = q('.wrig'), ws = q('.wscreen'), m0 = q('.m0'), m1 = q('.m1');
    const gap = 26 * cs;
    return (t_) => {
      const t = t_ + t0;
      const ch = m0.offsetHeight * cs; // mesuré à chaque image : la police peut arriver après le montage
      const wi = M.tw(t, 0, 1.0, M.quintOut);
      wrig.style.opacity = M.tw(t, 0, 0.6, M.cubicOut).toFixed(3);
      wrig.style.transform = `translateY(${px(30 * (1 - wi))})`;
      const m = minuteur(t, 0.7, 3.2);
      ws.innerHTML = A.watchScreen({ temps: m.temps, part: Math.max(0.0001, m.p), heure: '10:51' });
      // carte 1 : arrive seule au centre ; carte 2 : arrive, la première remonte
      // la première remonte d'abord, la seconde n'arrive qu'une fois la place libre : aucun chevauchement
      const p0 = M.tw(t, 4.15, 0.9, M.expoOut), p1 = M.tw(t, 6.0, 0.95, M.expoOut), pu = M.tw(t, 5.4, 0.85, M.quintInOut);
      const yc = (h - ch) / 2, yTop = (h - (2 * ch + gap)) / 2;
      const y0 = M.mix(yc, yTop, pu) + 50 * cs * (1 - p0);
      m0.style.opacity = M.tw(t, 4.15, 0.5, M.cubicOut).toFixed(3);
      m0.style.transform = `translateY(${px(y0)}) scale(${cs})`;
      m1.style.opacity = M.tw(t, 6.0, 0.5, M.cubicOut).toFixed(3);
      m1.style.transform = `translateY(${px(yTop + ch + gap + 50 * cs * (1 - p1))}) scale(${cs})`;
    };
  };

  /* ============ 27 — L'ardoise derrière le comptoir (contenu seul, 1920 × 1080) ============
     Le chiffre 48 h monte, puis la carte de la semaine s'affiche café par café. */
  S.ardoise = (el, o = {}) => {
    const { w = 1920, h = 1080, t0 = 0 } = o;
    frame(el, w, h, 'sc-ardoise g9 grain');
    const s = h / 1080;
    const PX = 1010 * s, PW = w - PX - 70 * s; // panneau de la carte
    const RH = 158 * s;
    const ligne = (c, i) => `<div class="rw r${i}" style="position:absolute;left:${44 * s}px;right:${44 * s}px;top:${(150 + i * 158) * s}px;height:${RH}px">
        <div style="position:absolute;left:0;right:0;top:0;height:1px;background:rgba(42,26,20,.12)"></div>
        <div class="ps" style="position:absolute;left:0;top:${22 * s}px">${A.pastille(c, 114 * s)}</div>
        <div style="position:absolute;left:${142 * s}px;top:${30 * s}px">
          <div style="font-weight:600;font-size:${40 * s}px;letter-spacing:-.025em;line-height:1">${c.nom}</div>
          <div class="cap" style="font-size:${16 * s}px;margin-top:${9 * s}px;opacity:.8">${c.pays} · ${c.alt} · ${c.procede}</div>
          <div style="font-size:${23 * s}px;margin-top:${7 * s}px">${c.notes[0]}, ${c.notes.slice(1).join(', ').toLowerCase()}.</div></div>
        <div style="position:absolute;right:0;top:${30 * s}px;text-align:right"><div style="font-weight:500;font-size:${34 * s}px;letter-spacing:-.02em">${c.prix}</div>
          <div class="cap" style="font-size:${15 * s}px;margin-top:${8 * s}px;opacity:.8">250 g · ${c.usage}</div></div></div>`;
    const fs = 430 * s;
    el.innerHTML = `
      <div class="big" style="position:absolute;left:0;top:0;width:${w}px;height:${h}px;transform-origin:50% 50%">
        <div class="mo-num n" style="left:0;right:0;top:${250 * s}px;text-align:center;font-weight:300;font-size:${fs}px;color:${C.fleur}">
          <span class="d0" style="width:.6em">0</span><span class="d1" style="width:.6em">0</span><span style="width:.18em"></span><span style="font-size:.52em;font-weight:400;letter-spacing:-.02em">h</span></div>
        <div class="sub" style="position:absolute;left:0;right:0;top:${720 * s}px;text-align:center;font-size:${50 * s}px;font-weight:400;letter-spacing:-.015em;color:${C.vert}">du tambour à votre boîte aux lettres</div>
      </div>
      <div class="pan" style="position:absolute;left:${PX}px;top:${64 * s}px;width:${PW}px;height:${h - 128 * s}px;background:${C.fleur};color:${C.grain};border-radius:${36 * s}px;box-shadow:0 ${30 * s}px ${60 * s}px -${30 * s}px rgba(21,15,12,.45)">
        <div style="position:absolute;left:${44 * s}px;right:${44 * s}px;top:${44 * s}px;display:flex;justify-content:space-between;align-items:flex-end">
          <div class="u-h" style="font-size:${58 * s}px">La carte</div>
          <div class="cap" style="font-size:${16 * s}px;text-align:right;line-height:1.5;opacity:.85">Semaine 47<br>Torréfaction ${A.DATES.torrefaction}</div></div>
        ${A.CAFES.map(ligne).join('')}
      </div>
      <div class="lk" style="position:absolute;left:${90 * s}px;bottom:${84 * s}px;width:${380 * s}px">${A.lockup(C.fleur, 'style="width:100%;height:auto;display:block;overflow:visible"')}</div>
      <div class="info mo-cap" style="position:absolute;left:${92 * s}px;top:${84 * s}px;font-size:${21 * s}px;line-height:1.65;color:${C.vert}">Torréfié chaque mardi<br>Livré à vélo le jeudi<br>Fournées de 12 kg</div>`;
    const q = (x) => el.querySelector(x), qa = (x) => [...el.querySelectorAll(x)];
    const big = q('.big'), n = q('.n'), d0 = q('.d0'), d1 = q('.d1'), sub = q('.sub'), pan = q('.pan'), lk = q('.lk'), info = q('.info');
    const rows = qa('.rw').map((r, i) => ({ r, ps: r.querySelector('.ps'), i, a: [-6, 5, -3, 7, -5][i] }));
    const type = M.typer(sub, { soft: 4 });
    const val = (t) => 48 * M.tw(t, 0.35, 2.0, M.expoOut);
    return (t_) => {
      const t = t_ + t0;
      const v = Math.round(val(t));
      d0.textContent = Math.floor(v / 10); d1.textContent = v % 10;
      const pn = M.tw(t, 0.2, 0.8, M.quintOut);
      n.style.opacity = pn.toFixed(3);
      n.style.transform = `translateY(${px(24 * s * (1 - pn))})`;
      type(M.tw(t, 1.35, 1.0, M.lin));
      // le chiffre se range à gauche, le panneau de la carte entre par la droite
      const pm = M.tw(t, 3.0, 1.1, M.quintInOut);
      const sc = M.mix(1, 0.56, pm);
      big.style.transform = `translate(${px(M.mix(0, -0.245 * w, pm))},${px(M.mix(0, 0.06 * h, pm))}) scale(${sc.toFixed(4)})`;
      const pp = M.tw(t, 3.15, 1.1, M.expoOut);
      pan.style.transform = `translateX(${px((w - PX + 40 * s) * (1 - pp))})`;
      rows.forEach((r) => {
        const p = M.tw(t, 3.75 + r.i * 0.3, 0.8, M.quintOut);
        r.r.style.opacity = M.tw(t, 3.75 + r.i * 0.3, 0.45, M.cubicOut).toFixed(3);
        r.r.style.transform = `translateY(${px(22 * s * (1 - p))})`;
        r.ps.style.transform = `rotate(${M.mix(-16, r.a, M.tw(t, 3.75 + r.i * 0.3, 1.0, M.expoOut)).toFixed(2)}deg)`;
      });
      const pl = M.tw(t, 4.2, 0.9, M.quintOut);
      lk.style.opacity = pl.toFixed(3);
      lk.style.transform = `translateY(${px(10 * s * (1 - pl))})`;
      info.style.opacity = M.tw(t, 4.4, 0.9, M.cubicOut).toFixed(3);
    };
  };

  /* ============ Petites scènes pour la mosaïque ============ */
  /* Une pastille qui se pose */
  S.pose = (el, o = {}) => {
    const { w = 426, h = 420, cafe = 'guji', bg = C.parche, debut = 0.4, t0 = 0 } = o;
    frame(el, w, h, 'sc-pose grain', bg);
    const c = A.cafe(cafe), size = Math.min(w, h) * 0.6, s = h / 420;
    el.innerHTML = `<div class="pz" style="position:absolute;left:${(w - size) / 2}px;top:${(h - size) / 2 - 18 * s}px">${A.pastille(c, size)}</div>
      <div class="cp mo-cap" style="position:absolute;left:0;right:0;bottom:${30 * s}px;text-align:center;font-size:${11 * s}px;color:${C.feuille}">${c.nom} · ${c.pays} · ${c.alt}</div>`;
    const pz = el.querySelector('.pz'), cp = el.querySelector('.cp');
    return (t_) => {
      const t = t_ + t0;
      poser(pz, M.clamp((t - debut) / 1.2), { a0: -22, a1: 6, lift: 40 * s, s0: 1.14 });
      cp.style.opacity = M.tw(t, debut + 0.8, 0.7, M.cubicOut).toFixed(3);
    };
  };
  /* Le minuteur d'infusion sur la montre */
  S.minuteur = (el, o = {}) => {
    const { w = 426, h = 420, bg = null, cls = 'g4 grain', debut = 0.3, duree = 3.4, t0 = 0 } = o;
    frame(el, w, h, 'sc-minuteur ' + cls, bg);
    const wk = (h * 0.92) / 480;
    el.innerHTML = `<div style="position:absolute;left:${(w - 300 * wk) / 2}px;top:${(h - 480 * wk) / 2}px">${A.watch(A.watchScreen({ temps: '0:00', part: 0 }), wk)}</div>`;
    const ws = el.querySelector('.wscreen');
    return (t_) => {
      const t = t_ + t0, m = minuteur(t, debut, duree);
      ws.innerHTML = A.watchScreen({ temps: m.temps, part: Math.max(0.0001, m.p), heure: '10:51' });
    };
  };
  /* Le tampon de torréfaction qui frappe l'étiquette d'un sachet */
  S.tampon = (el, o = {}) => {
    const { w = 426, h = 202, cafe = 'guji', debut = 0.9, bg = C.vert, t0 = 0 } = o;
    frame(el, w, h, 'sc-tampon grain', bg);
    const k = h / 250;
    // haut de l'étiquette : logotype, nom, notes, pastille et tampon ; le bas (la fiche) sort du cadre
    el.innerHTML = `<div style="position:absolute;left:${(w - 320 * k) / 2}px;top:${-4 * k}px">${A.etiquette(cafe, k)}</div>`;
    const tp = el.querySelector('.tampon');
    tp.style.transformOrigin = '50% 50%';
    return (t_) => {
      const t = t_ + t0;
      const p = M.tw(t, debut, 0.42, M.expoOut);
      tp.style.opacity = M.tw(t, debut, 0.12, M.lin).toFixed(3);
      tp.style.transform = `rotate(${M.mix(-9, -3, p).toFixed(2)}deg) scale(${M.mix(1.45, 1, p).toFixed(4)})`;
    };
  };
  /* Un sachet qui se remplit de grains, puis se ferme et reçoit sa pastille */
  S.sachet = (el, o = {}) => {
    const { w = 426, h = 420, cafe = 'nyeri', bg = C.pulpe, t0 = 0 } = o;
    frame(el, w, h, 'sc-sachet grain', bg);
    const s = h / 420, BW = 190 * s, BH = 250 * s, bx = (w - BW) / 2, by = 128 * s;
    const win = { x: 55 * s, y: 108 * s, w: 80 * s, h: 116 * s }; // fenêtre du sachet (repère du sachet)
    // grains dans la fenêtre : quinconce fixe, chaque grain a sa place et son angle
    let grains = '';
    const gx = 15 * s, gy = 11 * s;
    for (let r = 0; r < 14; r++) for (let c = -1; c < 7; c++) {
      const x = win.x + c * gx + (r % 2 ? gx / 2 : 0) + 4 * s, y = win.y + win.h - r * gy - 2 * s;
      const a = ((c * 47 + r * 29) % 120) - 60;
      grains += `<g class="gn" data-y="${y.toFixed(2)}" transform="translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${a})"><ellipse rx="${7.2 * s}" ry="${5.2 * s}" fill="${C.grain}"/><path d="M${-6 * s},0 Q0,${-2.2 * s} ${6 * s},0" fill="none" stroke="${C.parche}" stroke-opacity=".55" stroke-width="${1.1 * s}"/></g>`;
    }
    // grains qui tombent dans l'ouverture (positions fixes, décalées dans le temps)
    let chute = '';
    for (let i = 0; i < 9; i++) chute += `<g class="ch" data-i="${i}"><ellipse rx="${7.2 * s}" ry="${5.2 * s}" fill="${C.grain}"/></g>`;
    const id = M.uid('sa');
    el.innerHTML = `<svg style="position:absolute;inset:0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs><clipPath id="${id}w"><rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="${win.w / 2}"/></clipPath>
        <clipPath id="${id}l"><rect class="lvl" x="0" y="${win.y + win.h}" width="${BW}" height="${win.h + 20 * s}"/></clipPath></defs>
      <ellipse cx="${w / 2}" cy="${by + BH + 6 * s}" rx="${BW * 0.62}" ry="${12 * s}" fill="rgba(42,26,20,.14)"/>
      <g class="chute">${chute}</g>
      <g transform="translate(${bx},${by})">
        <path d="M${6 * s},0 H${BW - 6 * s} L${BW},${BH - 10 * s} Q${BW},${BH} ${BW - 10 * s},${BH} H${10 * s} Q0,${BH} 0,${BH - 10 * s} Z" fill="${C.fleur}"/>
        <path d="M${BW - 26 * s},0 H${BW - 6 * s} L${BW},${BH - 10 * s} Q${BW},${BH} ${BW - 10 * s},${BH} H${BW - 22 * s} Z" fill="${C.parche}"/>
        <g class="haut"><rect x="${6 * s}" y="${-26 * s}" width="${BW - 12 * s}" height="${26 * s}" fill="${C.fleur}"/><rect x="${6 * s}" y="${-26 * s}" width="${BW - 12 * s}" height="${3 * s}" fill="${C.parche}"/></g>
        <rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="${win.w / 2}" fill="${C.parche}"/>
        <g clip-path="url(#${id}w)"><g clip-path="url(#${id}l)">${grains}</g></g>
        <rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="${win.w / 2}" fill="none" stroke="rgba(42,26,20,.18)" stroke-width="${1.2 * s}"/>
        <g transform="translate(${22 * s},${58 * s}) scale(${(146 * s) / 516})">${`<path fill="${C.cerise}" fill-rule="evenodd" d="${A.wordPath()}"/>`}</g>
        <text x="${22 * s}" y="${100 * s}" font-family="IBM Plex Mono" font-weight="500" font-size="${8.5 * s}" letter-spacing="${1.2 * s}" fill="${C.grain}" opacity=".75">250 G · ${A.cafe(cafe).nom.toUpperCase()}</text>
      </g></svg>
      <div class="pz" style="position:absolute;left:${bx + BW / 2 - 33 * s}px;top:${by - 21 * s}px">${A.pastille(cafe, 66 * s)}</div>`;
    const lvl = el.querySelector('.lvl'), haut = el.querySelector('.haut'), pz = el.querySelector('.pz');
    const ch = [...el.querySelectorAll('.ch')];
    const top = win.y + win.h, plein = win.y + 14 * s;
    return (t_) => {
      const t = t_ + t0;
      const pf = M.tw(t, 0.3, 2.8, M.cubicInOut);
      lvl.setAttribute('y', M.mix(top + 4 * s, plein, pf).toFixed(2));
      // chute des grains : chacun tombe de 150 px dans l'ouverture, puis disparaît dans le sachet
      ch.forEach((g, i) => {
        const st = 0.25 + i * 0.3, p = M.clamp((t - st) / 0.55);
        const x = w / 2 + (((i * 37) % 60) - 30) * s, y0 = by - 150 * s, y1 = by + 6 * s;
        const y = M.mix(y0, y1, p * p);
        g.setAttribute('transform', `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${(i * 53 + 200 * p).toFixed(1)})`);
        g.style.opacity = p <= 0 || p >= 1 || t > 3.1 ? '0' : '1';
      });
      // le haut du sachet se replie, la pastille le scelle
      const pr = M.tw(t, 3.25, 0.7, M.quintInOut);
      haut.setAttribute('transform', `translate(0,${(18 * s * pr).toFixed(2)}) scale(1,${(1 - 0.55 * pr).toFixed(4)})`);
      poser(pz, M.clamp((t - 3.85) / 1.1), { a0: -20, a1: 8, lift: 26 * s, s0: 1.12 });
    };
  };
  /* Le compteur « 48 h » */
  S.compteur = (el, o = {}) => {
    const { w = 426, h = 202, bg = C.feuille, debut = 0.3, t0 = 0 } = o;
    frame(el, w, h, 'sc-compteur', bg);
    const s = h / 202;
    el.innerHTML = `<div class="mo-num n" style="left:${30 * s}px;top:${28 * s}px;font-weight:300;font-size:${112 * s}px;color:${C.fleur}">
        <span class="d0" style="width:.6em">0</span><span class="d1" style="width:.6em">0</span><span style="width:.16em"></span><span style="font-size:.5em;font-weight:400">h</span></div>
      <div class="sub" style="position:absolute;left:${32 * s}px;bottom:${26 * s}px;font-size:${17 * s}px;color:${C.vert}">du tambour à votre boîte aux lettres</div>`;
    const d0 = el.querySelector('.d0'), d1 = el.querySelector('.d1');
    const type = M.typer(el.querySelector('.sub'), { soft: 3 });
    return (t_) => {
      const t = t_ + t0, v = Math.round(48 * M.tw(t, debut, 2.0, M.expoOut));
      d0.textContent = Math.floor(v / 10); d1.textContent = v % 10;
      type(M.tw(t, debut + 1.0, 1.0, M.lin));
    };
  };

  window.Scenes = S;
})();
