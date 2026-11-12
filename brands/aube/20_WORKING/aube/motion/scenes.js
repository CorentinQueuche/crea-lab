/* AUBE — scènes animées. Chaque fonction monte sa scène dans un conteneur et renvoie son seek(t).
   Scenes.orbe(el, {w, h}) · Scenes.logo(el, {w, h, descriptor}) · Scenes.app · Scenes.montre · Scenes.scene · Scenes.affiche
   Dépend de brand/aube.js (Aube) et motion/lib.js (M). */
(function () {
  const A = window.Aube, M = window.M;
  const S = {};
  const px = (v) => v.toFixed(2) + 'px';
  const TAU = Math.PI * 2;

  const frame = (el, w, h, cls, bg) => {
    el.className = `scene ${cls}`;
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    if (bg) el.style.background = bg;
    return el;
  };

  /* ============ 08 — L'orbe (boucle parfaite) ============ */
  S.orbe = (el, o = {}) => {
    const { w = 1920, h = 1080, size = Math.round(h * 0.52), loop = 6, grain = true } = o;
    frame(el, w, h, 'sc-orbe' + (grain ? ' grain' : ''));
    el.innerHTML = `
      <div class="veil v1" style="background:radial-gradient(55% 60% at 96% 104%,rgba(196,57,26,.30) 0%,rgba(75,24,56,.22) 38%,rgba(28,17,34,0) 74%)"></div>
      <div class="veil v2" style="background:radial-gradient(48% 58% at 2% -4%,rgba(75,24,56,.42) 0%,rgba(28,17,34,.2) 42%,rgba(10,6,9,0) 76%)"></div>
      <div class="center">${A.orb(size)}</div>`;
    const v1 = el.querySelector('.v1'), v2 = el.querySelector('.v2');
    const orb = el.querySelector('.orb');
    const glow = orb.querySelector('.glow');
    const rings = [...orb.querySelectorAll('.ring')];
    return (t) => {
      const w_ = (TAU * t) / loop;
      A.seekOrbs(t, loop, el);
      // le reflet blanc reste dans le haut du verre : le logotype reste lisible à chaque image
      orb.style.setProperty('--x4', (24 + 30 * Math.cos(w_ + 3.3)).toFixed(2) + '%');
      orb.style.setProperty('--y4', (4 + 9 * Math.sin(w_ + 3.3)).toFixed(2) + '%');
      // la lueur pulse doucement (deux respirations par boucle, amplitude faible)
      const g = 0.5 + 0.5 * Math.sin(w_ * 2 - Math.PI / 2);
      glow.style.opacity = (0.78 + 0.22 * g).toFixed(3);
      glow.style.transform = `scale(${(0.97 + 0.06 * g).toFixed(4)})`;
      // les anneaux respirent, chacun un peu en retard sur le précédent
      rings.forEach((r, i) => {
        const b = 0.5 + 0.5 * Math.sin(w_ - i * 0.55 - Math.PI / 2);
        r.style.transform = `scale(${(1 + (0.008 + i * 0.012) * b).toFixed(4)})`;
        r.style.opacity = (0.65 + 0.35 * b).toFixed(3);
      });
      // le voile dérive à peine
      v1.style.transform = `translate(${px(-14 * Math.sin(w_))},${px(-10 * Math.cos(w_))})`;
      v2.style.transform = `translate(${px(12 * Math.cos(w_))},${px(10 * Math.sin(w_))})`;
      v1.style.opacity = (0.85 + 0.15 * Math.sin(w_ + 1)).toFixed(3);
    };
  };

  /* ============ 26 — Révélation du logotype ============ */
  S.logo = (el, o = {}) => {
    const { w = 1920, h = 1080, descriptor = true, bg = '#1C1122', s0 = null, s1 = null } = o;
    frame(el, w, h, 'sc-logo', bg);
    const id = M.uid('lg');
    const GAP = 14, letters = ['a', 'u', 'b', 'e'];
    // échelles : grande pendant la révélation, réduite pour la version complète
    const S0 = s0 || (descriptor ? (w * 0.48) / 442 : (w * 0.74) / 442);
    const S1 = s1 || (descriptor ? (w * 0.58) / 716 : S0);
    // rayons de coins finaux (tl, tr, br, bl) : on part d'un disque (50 partout)
    const corners = { a: [50, 0, 0, 50], u: [0, 0, 0, 50], b: [0, 50, 50, 0], e: [50, 50, 50, 50] };
    const mid = 221; // centre du logotype en unités
    let defs = `<linearGradient id="${id}sun" gradientUnits="userSpaceOnUse" x1="0" y1="-10" x2="0" y2="110">
        <stop offset="0" stop-color="#FFC46B"/><stop offset=".5" stop-color="#FF632B"/><stop offset="1" stop-color="#C4391A"/></linearGradient>
      <linearGradient id="${id}line" gradientUnits="userSpaceOnUse" x1="${mid - 560}" y1="0" x2="${mid + 560}" y2="0">
        <stop offset="0" stop-color="#FF632B" stop-opacity="0"/><stop offset=".3" stop-color="#FF632B" stop-opacity=".9"/>
        <stop offset=".5" stop-color="#FFC46B"/><stop offset=".7" stop-color="#FF632B" stop-opacity=".9"/><stop offset="1" stop-color="#FF632B" stop-opacity="0"/></linearGradient>
      <radialGradient id="${id}halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#C4391A" stop-opacity=".55"/><stop offset=".45" stop-color="#4B1838" stop-opacity=".35"/><stop offset="1" stop-color="#4B1838" stop-opacity="0"/></radialGradient>
      <filter id="${id}blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="${id}blurL" filterUnits="userSpaceOnUse" x="-600" y="20" width="1700" height="60"><feGaussianBlur stdDeviation="0 2.5"/></filter>
      <clipPath id="${id}clip"><rect class="cliprect" x="-600" y="-400" width="1700" height="450"/></clipPath>`;
    let body = '';
    letters.forEach((c, i) => {
      defs += `<mask id="${id}m${i}" maskUnits="userSpaceOnUse" x="-50" y="-150" width="200" height="350">
        <rect x="-50" y="-150" width="200" height="350" fill="#fff"/>
        <path class="ctr" fill="#000"/>
        ${c === 'e' ? '<rect class="slot" y="66" height="12" fill="#000"/>' : ''}
      </mask>`;
      body += `<g class="L" data-c="${c}"><g mask="url(#${id}m${i})">
          <g class="halo" filter="url(#${id}blur)"><path class="o" fill="#FF632B"/></g>
          <path class="o" fill="url(#${id}sun)"/>${c === 'b' ? `<rect class="stem" x="0" width="24" fill="url(#${id}sun)"/>` : ''}
          <g class="wh"><path class="o" fill="#fff"/>${c === 'b' ? '<rect class="stem" x="0" width="24" fill="#fff"/>' : ''}</g>
        </g></g>`;
    });
    el.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>
      <ellipse class="bgh" fill="url(#${id}halo)"/>
      <g class="word">
        <g class="hz"><line class="hzg" y1="50" y2="50" stroke="url(#${id}line)" stroke-width="10" vector-effect="non-scaling-stroke" filter="url(#${id}blurL)"/>
          <line class="hzl" y1="50" y2="50" stroke="url(#${id}line)" stroke-width="2.2" vector-effect="non-scaling-stroke"/></g>
        <g clip-path="url(#${id}clip)">${body}</g>
      </g>
      ${descriptor ? `<g class="desc" font-family="Outfit" font-weight="400" font-size="52" letter-spacing="-.4" fill="#fff">
        <text class="d1" x="486" y="42">Assistant</text><text class="d2" x="486" y="94">personnel</text></g>` : ''}
    </svg>`;
    const q = (s) => el.querySelector(s);
    const word = q('.word'), clipr = q('.cliprect'), hz = q('.hz'), bgh = q('.bgh');
    const lines = [...el.querySelectorAll('.hz line')];
    const L = [...el.querySelectorAll('.L')].map((g, i) => ({
      g, c: g.dataset.c, i, ox: i * (100 + GAP),
      paths: [...g.querySelectorAll('path.o')], stems: [...g.querySelectorAll('.stem')],
      halo: g.querySelector('.halo'), wh: g.querySelector('.wh'),
      ctr: el.querySelector(`#${id}m${i} .ctr`), slot: el.querySelector(`#${id}m${i} .slot`),
    }));
    const desc = q('.desc'), d1 = q('.d1'), d2 = q('.d2');
    const place = (S_, cx) => ({ X: w / 2 - cx * S_, Y: h / 2 - 40 * S_ });

    return (t) => {
      // 1. la ligne d'horizon se trace depuis le centre
      const pl = M.tw(t, 0.1, 1.1, M.expoOut);
      const half = 560 * pl;
      lines.forEach((l) => { l.setAttribute('x1', mid - half); l.setAttribute('x2', mid + half); });
      const lineFade = 1 - M.tw(t, 2.7, 0.7, M.cubicInOut);
      hz.style.opacity = (Math.min(1, pl * 3) * lineFade).toFixed(3);

      // 2. quatre soleils montent sous l'horizon (masqués sous y = 50), puis la moitié basse se dévoile
      const reveal = M.tw(t, 1.5, 0.75, M.expoOut);
      clipr.setAttribute('height', (450 + 160 * reveal).toFixed(2));
      // 3. les lettres se découpent : coins qui s'équerrent, hampe qui pousse, dômes qui se lèvent
      const white = M.tw(t, 2.0, 0.9, M.cubicInOut);
      L.forEach((l) => {
        const rise = M.tw(t, 0.45 + l.i * 0.09, 1.05, M.quintOut);
        const dy = 112 * (1 - rise);
        l.g.setAttribute('transform', `translate(${l.ox},${dy.toFixed(3)})`);
        const pc = M.tw(t, 1.95 + l.i * 0.07, 0.8, M.expoOut);
        const r = corners[l.c].map((v) => M.mix(50, v, pc));
        const d = M.rrect(0, 0, 100, 100, r[0], r[1], r[2], r[3]);
        l.paths.forEach((p) => p.setAttribute('d', d));
        if (l.stems.length) {
          const ps = M.tw(t, 2.1, 0.75, M.expoOut);
          l.stems.forEach((s) => { s.setAttribute('y', (-42 * ps + 0.5).toFixed(3)); s.setAttribute('height', (42 * ps).toFixed(3)); });
        }
        const pd = M.tw(t, 2.2 + l.i * 0.08, 0.95, M.expoOut);
        if (l.c === 'u') {
          // la contre-forme du « u » descend du haut
          const oy = -52 * (1 - pd);
          l.ctr.setAttribute('d', `M24,${oy - 2} H76 V${oy + 24} A26,26 0 0 1 24,${oy + 24} Z`);
        } else {
          // le dôme se lève comme un soleil : segment d'un disque de 26 qui monte, coupé net sur l'horizon (y = 50)
          const dc = 26 * (1 - pd);
          const hw = Math.sqrt(Math.max(0, 26 * 26 - dc * dc));
          l.ctr.setAttribute('d', hw < 0.01 ? 'M0,0' : `M${(50 - hw).toFixed(3)},50 A26,26 0 0 1 ${(50 + hw).toFixed(3)},50 Z`);
        }
        if (l.slot) {
          const pe = M.tw(t, 2.35, 0.75, M.expoOut);
          l.slot.setAttribute('x', (101 - 51 * pe).toFixed(3));
          l.slot.setAttribute('width', (51 * pe + 1).toFixed(3));
        }
        const hg = M.tw(t, 0.5 + l.i * 0.09, 0.9, M.cubicOut) * (1 - M.tw(t, 1.9, 0.9, M.cubicInOut));
        l.halo.style.opacity = (0.85 * hg).toFixed(3);
        l.wh.style.opacity = white.toFixed(3);
      });

      // 4. le logotype se recale pour accueillir le descripteur
      const pm = descriptor ? M.tw(t, 3.0, 0.95, M.quintInOut) : 0;
      const a0 = place(S0, mid), a1 = place(S1, 358);
      const Sx = M.mix(S0, S1, pm), X = M.mix(a0.X, a1.X, pm), Y = M.mix(a0.Y, a1.Y, pm);
      word.setAttribute('transform', `translate(${X.toFixed(2)},${Y.toFixed(2)}) scale(${Sx.toFixed(4)})`);
      // halo de fond posé sur l'horizon
      const hb = 0.25 + 0.75 * M.tw(t, 0.3, 1.4, M.cubicOut) - 0.45 * M.tw(t, 2.2, 1.4, M.cubicInOut);
      const hy = Y + 50 * Sx;
      bgh.setAttribute('cx', w / 2); bgh.setAttribute('cy', hy.toFixed(1));
      bgh.setAttribute('rx', (w * 0.55).toFixed(1)); bgh.setAttribute('ry', (h * 0.55).toFixed(1));
      bgh.style.opacity = hb.toFixed(3);

      if (desc) {
        desc.setAttribute('transform', `translate(${a1.X.toFixed(2)},${a1.Y.toFixed(2)}) scale(${S1.toFixed(4)})`);
        [d1, d2].forEach((d, k) => {
          const p = M.tw(t, 3.45 + k * 0.12, 0.85, M.quintOut);
          d.style.opacity = p.toFixed(3);
          d.setAttribute('transform', `translate(0,${(14 * (1 - p)).toFixed(2)})`);
        });
      }
    };
  };

  /* ============ 20 — L'app se construit (écran tableau de bord) ============ */
  S.app = (el, o = {}) => {
    const { w = 1920, h = 1080 } = o;
    frame(el, w, h, 'sc-app');
    const id = M.uid('ap');
    const k = (h * 0.865) / 868;
    const mic = A.icons.mic();
    const GAP = 14;
    const word = `<svg class="wm" viewBox="0 -42 442 142" style="height:40px;width:auto;overflow:hidden"><defs><clipPath id="${id}c"><rect x="-10" y="-60" width="470" height="161"/></clipPath></defs>
      <g clip-path="url(#${id}c)">${['a', 'u', 'b', 'e'].map((c, i) => `<path class="lt" fill="#fff" fill-rule="evenodd" d="${A.letterPath(c, i * (100 + GAP))}"/>`).join('')}</g></svg>`;
    const ck = (txt, on) => `<div class="ck"><i></i>${txt}</div>`;
    const card = (cls, inner, style = '') => `<div class="glass dark cd ${cls}" style="padding:13px 15px 15px;${style}">${inner}</div>`;
    const hd = (a, b) => `<div style="display:flex;justify-content:space-between"><span class="cap">${a}</span><span class="cap" style="opacity:.5">${b}</span></div>`;
    const bars = [22, 34, 40, 55, 70, 82, 100].map((v) => `<b style="height:${v}%"></b>`).join('');
    const sbars = [30, 55, 42, 88, 36, 64, 100, 48, 72, 58].map((v) => `<b style="height:${v}%"></b>`).join('');
    const screen = `<div class="ui ui-bg-b"><div class="dark" style="position:absolute;inset:0;background:#0A0609"></div>${A.icons.status()}
      <div style="position:absolute;top:70px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:flex-end;gap:10px">${word}<div class="desc" style="font-size:9.5px;line-height:1.15;font-weight:400;padding-bottom:1px">Assistant<br>personnel</div></div>
        <div class="chip-mic hmic">${mic}</div></div>
      <p class="greet" style="position:absolute;top:140px;left:24px;right:30px;font-size:21px;line-height:1.24">Bonjour Jade. Ta journée est déjà en ordre : trois priorités, deux rendez-vous, une soirée libre. On commence ?</p>
      <div style="position:absolute;top:290px;left:16px;right:16px;display:grid;gap:9px">
        ${card('c1', `${hd('07:30 · À faire', 'Tout voir')}
          <div style="font-size:12.5px;font-weight:500;margin-top:9px">1&nbsp; Rituel du matin</div>${ck('Un café, sans écran.')}${ck('Vingt minutes de marche.')}
          <div style="font-size:12.5px;font-weight:500;margin-top:9px">2&nbsp; Travail</div>${ck('Trier la boîte mail, 4 réponses prêtes.')}`)}
        ${card('c2', `${hd('Élan', 'Tout voir')}
          <div style="font-size:11.5px;opacity:.7;margin-top:7px">Progression de la semaine</div>
          <div style="display:flex;align-items:flex-end;gap:14px;margin-top:2px"><div class="pct" style="font-size:34px;line-height:1;font-weight:300;padding-bottom:2px;width:68px;white-space:nowrap">12&nbsp;%</div>
          <div class="bars" style="flex:1">${bars}</div></div>`)}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
          ${card('c3', `${hd('Focus', 'Voir')}<div style="display:grid;place-items:center;margin-top:8px"><svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="33" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="9"/><circle class="ring" cx="42" cy="42" r="33" fill="none" stroke="url(#${id}fg)" stroke-width="9" stroke-linecap="round" stroke-dasharray="0 208" transform="rotate(-90 42 42)"/><defs><linearGradient id="${id}fg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFC46B"/><stop offset="1" stop-color="#FF632B"/></linearGradient></defs><text class="ftx" x="42" y="47" text-anchor="middle" fill="#fff" font-family="Outfit" font-size="16" font-weight="400">3 h 10</text></svg></div>`, 'height:136px')}
          ${card('c4', `${hd('Sommeil', 'Voir')}<div class="sbars" style="margin-top:14px;justify-content:space-between">${sbars}</div>`, 'height:136px')}
        </div>
        ${card('c5', hd('Suggestions', 'Tout voir'), 'padding-bottom:40px')}
      </div><div class="home"></div></div>`;
    el.innerHTML = `<div class="rig">${A.phone(screen, k)}</div>`;
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
    const rig = q('.rig'), dark = q('.dark'), lts = qa('.lt'), desc = q('.desc'), hmic = q('.hmic');
    const type = M.typer(q('.greet'));
    const cards = ['c1', 'c2', 'c3', 'c4', 'c5'].map((c) => q('.' + c));
    const cardT = [1.95, 2.17, 2.39, 2.49, 2.65];
    const cks = qa('.c1 .ck i');
    const ckT = [3.35, 3.62, 4.75];
    const bar = qa('.bars b'), sbar = qa('.sbars b'), pct = q('.pct'), ring = q('.ring'), ftx = q('.ftx');
    return (t) => {
      // légère poussée de caméra, très lente
      const cam = M.tw(t, 0, 5.6, M.sineInOut);
      rig.style.transform = `translateY(${px(10 * (1 - cam))}) scale(${(0.975 + 0.025 * cam).toFixed(4)})`;
      dark.style.opacity = (1 - M.tw(t, 0.05, 0.9, M.cubicInOut)).toFixed(3);
      lts.forEach((l, i) => {
        const p = M.tw(t, 0.35 + i * 0.07, 0.75, M.expoOut);
        l.setAttribute('transform', `translate(0,${(150 * (1 - p)).toFixed(2)})`);
      });
      const pd = M.tw(t, 0.8, 0.6, M.quintOut);
      desc.style.opacity = pd.toFixed(3);
      desc.style.transform = `translateY(${px(6 * (1 - pd))})`;
      const pm = M.tw(t, 0.7, 0.7, M.expoOut);
      hmic.style.opacity = pm.toFixed(3);
      hmic.style.transform = `scale(${(0.6 + 0.4 * pm).toFixed(4)})`;
      type(M.tw(t, 1.0, 2.35, M.lin));
      cards.forEach((c, i) => {
        const p = M.tw(t, cardT[i], 0.8, M.expoOut);
        c.style.opacity = M.tw(t, cardT[i], 0.45, M.cubicOut).toFixed(3);
        c.style.transform = `translateY(${px(48 * (1 - p))})`;
      });
      cks.forEach((c, i) => {
        const p = M.tw(t, ckT[i], 0.45, M.expoOut);
        c.style.borderColor = `rgba(${Math.round(M.mix(255, 255, p))},${Math.round(M.mix(255, 99, p))},${Math.round(M.mix(255, 43, p))},${(0.7 + 0.3 * p).toFixed(3)})`;
        c.style.boxShadow = `inset 0 0 0 ${(5.5 * p).toFixed(2)}px #FF632B, 0 0 ${(8 * p).toFixed(2)}px rgba(255,99,43,${(0.8 * p).toFixed(3)})`;
      });
      bar.forEach((b, i) => { b.style.transform = `scaleY(${M.tw(t, 2.6 + i * 0.07, 0.8, M.expoOut).toFixed(4)})`; });
      const pv = M.tw(t, 2.55, 1.6, M.expoOut);
      pct.innerHTML = `${Math.round(12 * pv)}&nbsp;%`;
      ring.setAttribute('stroke-dasharray', `${(150 * M.tw(t, 2.85, 1.4, M.expoOut)).toFixed(2)} 208`);
      ftx.style.opacity = M.tw(t, 3.1, 0.6, M.cubicOut).toFixed(3);
      sbar.forEach((b, i) => { b.style.transform = `scaleY(${M.tw(t, 2.95 + i * 0.05, 0.75, M.expoOut).toFixed(4)})`; });
    };
  };

  /* ============ 21 — Montre et cartes de message ============ */
  const CARDS = [
    ['Déjeuner&nbsp;:', 'Midi approche. Tu as prévu quelque chose, ou je te propose deux idées légères près du bureau&nbsp;?'],
    ['Réunion&nbsp;:', 'Point d\'équipe dans 15 minutes. L\'ordre du jour est prêt, je l\'ai envoyé à tout le monde.'],
    ['Sport&nbsp;:', 'Ta séance est à 18 h 30. J\'ai décalé l\'appel de Paul à demain matin.'],
    ['Trajet&nbsp;:', 'Ça roule mal sur le périphérique. Pars dix minutes plus tôt, j\'ai prévenu Marc.'],
    ['Soirée&nbsp;:', 'Rien de prévu ce soir. Je réserve la table pour deux à 20 h 30&nbsp;?'],
  ];
  S.montre = (el, o = {}) => {
    const { w = 1400, h = 800, cards = true, bg = '#1C1122',
      text = 'Point de midi : besoin d\'aide sur une tâche, ou d\'un objectif pour ce soir ?', t0 = 0 } = o;
    frame(el, w, h, 'sc-montre', bg);
    const mic = A.icons.mic();
    const half = cards ? w / 2 : 0;
    const ww = w - half;
    const wk = Math.min((h * 0.8) / 480, (ww * 0.62) / 300);
    const cs = (h / 800) * 1.15, pitch = 0; // échelle des cartes
    const colA = [0, 1, 2, 3, 4, 0, 1, 2, 3, 4], colB = [3, 4, 0, 1, 2, 3, 4, 0, 1, 2];
    const col = (list, cls) => `<div class="col ${cls}" style="transform-origin:0 0">${list.map((i) => A.ncard(CARDS[i][0], CARDS[i][1])).join('')}</div>`;
    const inner = `<div class="cap" style="position:absolute;top:20px;right:30px;font-size:11px;opacity:.9">10:51</div>
      <p class="wtxt" style="position:absolute;top:58px;left:26px;right:24px;font-size:14.5px;line-height:1.3;font-weight:400">${text}</p>
      <div class="pill"><div class="wave"></div><div class="mic">${mic}</div></div>`;
    el.innerHTML = (cards ? `<div class="left g-vif grain" style="position:absolute;left:0;top:0;width:${half}px;height:${h}px;overflow:hidden">${col(colA, 'ca')}${col(colB, 'cb')}</div>` : '') +
      `<div class="right" style="position:absolute;left:${half}px;top:0;width:${ww}px;height:${h}px;overflow:hidden">
        <div style="position:absolute;inset:0;background:radial-gradient(50% 46% at 50% 54%,rgba(75,24,56,.75) 0%,rgba(75,24,56,.25) 50%,rgba(28,17,34,0) 100%)"></div>
        <div class="wrig" style="position:absolute;left:${(ww - 300 * wk) / 2}px;top:${(h - 480 * wk) / 2}px">${A.watch(inner, wk)}</div></div>`;
    const q = (s) => el.querySelector(s);
    const type = M.typer(q('.wtxt'), { soft: 3 });
    const pill = q('.pill'), pmic = q('.pill .mic'), wave = q('.wave'), wrig = q('.wrig');
    const NB = 16;
    wave.innerHTML = Array.from({ length: NB }, () => '<b></b>').join('');
    const bs = [...wave.children];
    let ca, cb, cardH;
    if (cards) {
      ca = q('.ca'); cb = q('.cb');
      [ca, cb].forEach((c) => { c.style.gap = '22px'; });
      cardH = ca.children[0].getBoundingClientRect().height + 22; // pas d'une carte (avant échelle)
    }
    const cw = 340 * cs, gx = 22 * cs;
    const xA = (half - (2 * cw + gx)) / 2, xB = xA + cw + gx;
    const steps = (t, starts) => starts.reduce((s, st) => s + M.tw(t, st, 1.05, M.quintInOut), 0);
    return (t_) => {
      const t = t_ + t0;
      A.seekOrbs(t, 6, el);
      if (cards) {
        const P = cardH * cs;
        const a = steps(t, [0.55, 2.3, 4.05, 5.8]);
        const b = steps(t, [1.4, 3.15, 4.9, 6.65]);
        ca.style.transform = `translate(${px(xA)},${px(-0.35 * P - a * P)}) scale(${cs})`;
        cb.style.transform = `translate(${px(xB)},${px(-4.15 * P + b * P)}) scale(${cs})`;
      }
      const wi = M.tw(t, 0, 1.1, M.expoOut);
      wrig.style.transform = `translateY(${px(14 * (1 - wi))})`;
      type(M.tw(t, 0.55, 2.8, M.lin));
      // le bouton micro s'étire en pilule d'écoute
      const pp = M.tw(t, 3.85, 0.85, M.expoInOut);
      const W0 = 42, W1 = 170, pw = M.mix(W0, W1, pp);
      pill.style.width = px(pw);
      pill.style.left = px(111 - M.mix(W0 / 2, W1 / 2, pp));
      pill.style.bottom = '22px';
      pill.style.background = `rgba(${Math.round(M.mix(10, 255, pp))},${Math.round(M.mix(6, 241, pp))},${Math.round(M.mix(9, 220, pp))},${M.mix(0.45, 0.2, pp).toFixed(3)})`;
      pmic.style.left = px(pw - 42);
      const pl = M.tw(t, 4.35, 0.7, M.cubicOut);
      wave.style.left = '18px';
      wave.style.opacity = pl.toFixed(3);
      bs.forEach((b, i) => {
        const v = 0.5 + 0.5 * Math.sin(t * 7.1 + i * 0.83) * Math.sin(t * 3.3 + i * 0.41 + 1.3);
        const env = Math.sin(Math.PI * (i + 0.5) / NB);
        b.style.height = px(3 + (4 + 18 * v) * env * pl);
        b.style.opacity = (0.55 + 0.45 * env).toFixed(3);
      });
    };
  };

  /* ============ 15 — Écran de scène : compteur « 2 h 07 » ============ */
  S.scene = (el, o = {}) => {
    const { w = 2100, h = 600, t0 = 0 } = o;
    frame(el, w, h, 'sc-scene');
    const s = h / 600;
    const fs = 250 * s, lx = 66 * s;
    const R = 560 * s;
    const rimX = Math.max(0.46 * w, lx + 2.9 * fs + 50 * s); // bord droit du panneau, à mi-hauteur
    const cx = rimX - R, cy = h / 2;
    const disk = (cls, extra) => `<div class="${cls}" style="position:absolute;left:${cx - R}px;top:${cy - R}px;width:${2 * R}px;height:${2 * R}px;border-radius:50%;${extra}"></div>`;
    el.innerHTML = `
      ${disk('pan', 'background:radial-gradient(closest-side at 50% 50%,rgba(28,17,34,0) 55%,rgba(28,17,34,.55) 88%,rgba(75,24,56,.7) 100%),radial-gradient(70% 62% at 22% 40%,#FFC46B 0%,#FF8A3D 16%,#FF632B 30%,#C4391A 52%,#4B1838 78%,#1C1122 100%)')}
      ${[0, 1, 2].map((i) => disk(`horizon arc a${i}`, `background:radial-gradient(closest-side,rgba(10,6,9,0) 0%,rgba(10,6,9,0) 80%,rgba(196,57,26,.3) 93%,rgba(255,99,43,.7) 98.5%,rgba(255,196,107,.95) 100%)`)).join('')}
      <div class="fade" style="position:absolute;top:0;bottom:0;right:0;left:${rimX + 120 * s}px;background:linear-gradient(90deg,rgba(10,6,9,0),#0A0609 ${Math.round(260 * s)}px)"></div>
      <div class="num" style="left:${lx}px;top:${92 * s}px;font-size:${fs}px;text-shadow:0 ${4 * s}px ${30 * s}px rgba(75,24,56,.35)"><span class="d0" style="width:.56em">0</span><span style="width:.26em"></span><span>h</span><span style="width:.24em"></span><span class="d1" style="width:.56em">0</span><span class="d2" style="width:.56em">0</span></div>
      <div class="sub" style="position:absolute;left:${lx + 10 * s}px;top:${388 * s}px;font-size:${58 * s}px;font-weight:300;color:#fff;letter-spacing:-.01em;white-space:nowrap">gagnées chaque jour</div>
      <div class="url mono" style="position:absolute;right:${54 * s}px;top:${40 * s}px;font-size:${19 * s}px;color:rgba(255,255,255,.85)">www.bonjouraube.fr</div>
      <div class="lk" style="position:absolute;right:${54 * s}px;bottom:${44 * s}px;width:${300 * s}px">${A.lockup('#fff', 'style="width:100%;height:auto;display:block"')}</div>`;
    const q = (x) => el.querySelector(x);
    const pan = q('.pan'), arcs = [0, 1, 2].map((i) => q('.a' + i)), num = q('.num'), sub = q('.sub'), url = q('.url'), lk = q('.lk');
    const d0 = q('.d0'), d1 = q('.d1'), d2 = q('.d2');
    const type = M.typer(sub, { soft: 4 });
    const mins = (t) => 127 * M.tw(t, 1.05, 2.7, M.expoOut);
    return (t_) => {
      const t = t_ + t0;
      // le panneau s'ouvre depuis la gauche ; trois arcs d'horizon glissent et se rejoignent au bord
      const pp = M.tw(t, 0.08, 1.7, M.expoOut);
      const off = -(rimX + 40 * s) * (1 - pp);
      pan.style.transform = `translateX(${px(off)})`;
      pan.style.opacity = M.tw(t, 0, 0.5, M.cubicOut).toFixed(3);
      arcs.forEach((a, i) => {
        const p = M.tw(t, 0.08 + i * 0.16, 1.7 + i * 0.45, M.expoOut);
        const lag = (rimX + 40 * s) * (1 - p) + (i ? 0 : 0);
        a.style.transform = `translateX(${px(-lag)})`;
        a.style.opacity = (i === 0 ? M.tw(t, 0, 0.4, M.cubicOut) : M.tw(t, 0.1 + i * 0.15, 0.4, M.cubicOut) * (1 - 0.85 * M.tw(t, 1.9 + i * 0.3, 1.4, M.cubicInOut))).toFixed(3);
      });
      // compteur 0 h 00 → 2 h 07, flou de vitesse
      const m = Math.round(mins(t));
      d0.textContent = Math.floor(m / 60);
      const mm = String(m % 60).padStart(2, '0');
      d1.textContent = mm[0]; d2.textContent = mm[1];
      const v = Math.abs(M.speed(mins, t));
      num.style.filter = `blur(${(Math.min(9, v * 0.05) * s).toFixed(2)}px)`;
      const pn = M.tw(t, 0.75, 0.7, M.quintOut);
      num.style.opacity = pn.toFixed(3);
      num.style.transform = `translateY(${px(18 * s * (1 - pn))})`;
      type(M.tw(t, 3.35, 0.95, M.lin));
      const pu = M.tw(t, 0.55, 0.8, M.quintOut);
      url.style.opacity = pu.toFixed(3);
      const pk = M.tw(t, 0.7, 0.9, M.quintOut);
      lk.style.opacity = pk.toFixed(3);
      lk.style.transform = `translateY(${px(10 * s * (1 - pk))})`;
    };
  };

  /* ============ 18 — Affiche numérique de rue ============ */
  S.affiche = (el, o = {}) => {
    const { w = 800, h = 1200, t0 = 0 } = o;
    frame(el, w, h, 'sc-affiche grain', 'linear-gradient(180deg,#0A0609 0%,#120A14 45%,#1C1122 100%)');
    const s = w / 800;
    const D = 1.95 * w, L = (w - D) / 2;
    const topFinal = 0.47 * h;
    const disk = (cls, extra = '') => `<div class="${cls}" style="position:absolute;left:${L}px;top:0;width:${D}px;height:${D}px;border-radius:50%;${extra}"></div>`;
    el.innerHTML = `
      <div class="sky" style="position:absolute;left:${-0.25 * w}px;width:${1.5 * w}px;height:${1.1 * h}px;top:0;background:radial-gradient(50% 50% at 50% 50%,rgba(255,99,43,.42) 0%,rgba(196,57,26,.28) 30%,rgba(75,24,56,.22) 58%,rgba(28,17,34,0) 100%)"></div>
      ${[0, 1, 2].map((i) => disk(`horizon gh g${i}`)).join('')}
      ${disk('under', 'background:radial-gradient(closest-side,#0A0609 0%,#0A0609 86%,rgba(10,6,9,.6) 100%)')}
      ${disk('horizon main')}
      <div class="tri" style="right:${50 * s}px;top:${50 * s}px;font-size:${66 * s}px"><div class="l0">Clair.</div><div class="l1">Calme.</div><div class="l2">Prêt.</div></div>
      <div class="lk" style="position:absolute;left:${48 * s}px;bottom:${50 * s}px;width:${236 * s}px">${A.lockup('#fff', 'style="width:100%;height:auto;display:block"')}</div>
      <div class="url mono" style="position:absolute;right:${48 * s}px;bottom:${56 * s}px;font-size:${15 * s}px;color:rgba(255,255,255,.85)">www.bonjouraube.fr</div>`;
    const q = (x) => el.querySelector(x);
    const main = q('.main'), under = q('.under'), sky = q('.sky'), ghosts = [0, 1, 2].map((i) => q('.g' + i));
    const lines = [0, 1, 2].map((i) => M.typer(q('.l' + i), { soft: 2 }));
    const lk = q('.lk'), url = q('.url');
    // trois vagues : l'horizon monte par poussées successives
    const pushes = [[0.05, h + 30, 0.73 * h], [1.3, 0.73 * h, 0.6 * h], [2.5, 0.6 * h, topFinal]];
    const topAt = (t) => {
      let y = pushes[0][1];
      pushes.forEach(([st, a, b]) => { if (t >= st) y = M.mix(a, b, M.tw(t, st, 1.15, M.expoOut)); });
      return y;
    };
    return (t_) => {
      const t = t_ + t0;
      const y = topAt(t);
      const breathe = 0.5 + 0.5 * Math.sin(TAU * (t - 3.6) / 2.4);
      const settle = M.tw(t, 3.6, 0.8, M.cubicInOut);
      [main, under].forEach((d) => { d.style.transform = `translateY(${px(y)})`; });
      main.style.opacity = (0.92 + 0.08 * breathe * settle).toFixed(3);
      sky.style.transform = `translateY(${px(y - 0.55 * h)})`;
      sky.style.opacity = (Math.min(1, M.tw(t, 0.15, 1.2, M.cubicOut)) * (0.85 + 0.15 * breathe * settle)).toFixed(3);
      // chaque poussée laisse une onde qui continue de monter et s'éteint
      ghosts.forEach((g, i) => {
        const [st] = pushes[i];
        const p = M.tw(t, st + 0.1, 1.9, M.cubicOut);
        const base = topAt(st + 0.25);
        g.style.transform = `translateY(${px(base - (90 + 40 * i) * s * p - 30 * s)})`;
        g.style.opacity = (t < st + 0.1 ? 0 : 0.75 * Math.sin(Math.PI * Math.min(1, p * 1.05))).toFixed(3);
      });
      [[1.0, 0.5], [1.95, 0.55], [2.95, 0.45]].forEach(([st, d], i) => lines[i](M.tw(t, st, d, M.lin)));
      const pl = M.tw(t, 0.75, 0.9, M.quintOut);
      lk.style.opacity = pl.toFixed(3);
      lk.style.transform = `translateY(${px(10 * s * (1 - pl))})`;
      url.style.opacity = M.tw(t, 0.9, 0.9, M.quintOut).toFixed(3);
    };
  };

  /* ============ Petites scènes pour la mosaïque ============ */
  /* Dégradé vivant + « Clair. Calme. Prêt. » */
  S.triptyque = (el, o = {}) => {
    const { w = 426, h = 420, t0 = 0 } = o;
    frame(el, w, h, 'sc-tri grain');
    const s = h / 420;
    el.innerHTML = `<div class="gr fill"></div>
      <div class="tri" style="position:absolute;right:${26 * s}px;top:${22 * s}px;text-align:right;color:#fff;font-weight:300;font-size:${34 * s}px;line-height:1.08;letter-spacing:-.012em">
        <div class="l0">Clair.</div><div class="l1">Calme.</div><div class="l2">Prêt.</div></div>`;
    const gr = el.querySelector('.gr');
    const lines = [0, 1, 2].map((i) => M.typer(el.querySelector('.l' + i), { soft: 2 }));
    return (t_) => {
      const t = t_ + t0;
      const p = M.tw(t, 0, 2.6, M.expoOut);
      const dr = Math.sin((TAU * t) / 6);
      const X = 8 + 6 * dr, Y = M.mix(150, 104, p) + 3 * Math.cos((TAU * t) / 6), R = M.mix(70, 100, p);
      gr.style.background = `radial-gradient(${R.toFixed(1)}% ${(R * 1.2).toFixed(1)}% at ${X.toFixed(1)}% ${Y.toFixed(1)}%,#FFC46B 0%,#FF632B 22%,#C4391A 44%,rgba(75,24,56,.9) 68%,rgba(28,17,34,0) 92%),radial-gradient(60% 60% at 100% 0%,#2C1530,rgba(10,6,9,0) 80%),#0A0609`;
      [[0.5, 0.45], [1.25, 0.5], [2.05, 0.4]].forEach(([st, d], i) => lines[i](M.tw(t, st, d, M.lin)));
    };
  };
  /* Version complète du logo sur Blanc */
  S.marque = (el, o = {}) => {
    const { w = 426, h = 202, t0 = 0 } = o;
    frame(el, w, h, 'sc-marque', '#FFFFFF');
    el.innerHTML = `<div class="lk" style="position:absolute;left:${w * 0.14}px;top:${h / 2 - (w * 0.72 * 150) / 716 / 2}px;width:${w * 0.72}px">${A.lockup('#1C1122', 'style="width:100%;height:auto;display:block"')}</div>`;
    const lk = el.querySelector('.lk');
    return (t_) => {
      const t = t_ + t0;
      const p = M.tw(t, 0.6, 0.9, M.quintOut);
      lk.style.opacity = p.toFixed(3);
      lk.style.transform = `translateY(${px(8 * (1 - p))})`;
    };
  };
  /* Palette en bandes */
  S.palette = (el, o = {}) => {
    const { w = 426, h = 202, t0 = 0 } = o;
    frame(el, w, h, 'sc-palette', '#E9E3DE');
    const cells = [['Nuit', '#1C1122', '#fff'], ['Noir', '#0A0609', '#fff'], ['Prune', '#4B1838', '#fff'], ['Blanc', '#FFFFFF', '#231A26'],
      ['Braise', '#C4391A', '#fff'], ['Brume', '#E9E3DE', '#231A26'], ['Aurore', '#FF632B', '#231A26'], ['Miel', '#FFC46B', '#231A26']];
    const ch = h / 4;
    el.innerHTML = cells.map(([n, c, ink], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      return `<div class="pc" style="position:absolute;left:${col * w / 2}px;top:${row * ch}px;width:${w / 2}px;height:${ch + 0.5}px;background:${c};transform-origin:${col ? '100%' : '0'} 50%">
        <span class="mono" style="position:absolute;left:12px;top:50%;margin-top:-6px;font-size:10px;line-height:12px;color:${ink};opacity:.8">${n} ${c}</span></div>`;
    }).join('');
    const pcs = [...el.querySelectorAll('.pc')];
    return (t_) => {
      const t = t_ + t0;
      pcs.forEach((p, i) => {
        const row = Math.floor(i / 2), col = i % 2;
        const e = M.tw(t, 0.2 + row * 0.09 + col * 0.05, 0.9, M.expoOut);
        p.style.transform = `scaleX(${e.toFixed(4)})`;
        p.firstElementChild.style.opacity = (0.8 * M.tw(t, 0.6 + row * 0.09, 0.6, M.cubicOut)).toFixed(3);
      });
    };
  };

  window.Scenes = S;
})();
