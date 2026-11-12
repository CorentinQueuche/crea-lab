/* AUBE — gabarits partagés : logo, orbe, appareils, écrans.
   Usage dans une page : <script src="../brand/aube.js"></script> puis Aube.wordmark('#fff'), Aube.orb(400), Aube.phone(Aube.screens.voix()) …
   Tout renvoie une chaîne HTML. Aube.seekOrbs(t) anime tous les orbes de la page (t en secondes, déterministe). */
(function () {
  const A = {};

  /* ---------- Logo : construit sur des disques de 100, graisse 24, contre-formes en dôme posées sur l'horizon (y = 50) ---------- */
  const GAP = 14;
  const dome = (ox) => `M${ox + 24},50 A26,26 0 0 1 ${ox + 76},50 Z`;
  const L = {
    a: (ox) => `M${ox + 50},0 H${ox + 100} V100 H${ox + 50} A50,50 0 0 1 ${ox + 50},0 Z ` + dome(ox),
    u: (ox) => `M${ox},0 H${ox + 24} V24 A26,26 0 0 0 ${ox + 76},24 V0 H${ox + 100} V100 H${ox + 50} A50,50 0 0 1 ${ox},50 Z`,
    b: (ox) => `M${ox},-42 H${ox + 24} V0 H${ox + 50} A50,50 0 0 1 ${ox + 50},100 H${ox} Z ` + dome(ox),
    e: (ox) => `M${ox + 50},0 A50,50 0 0 1 ${ox + 97.37},66 H${ox + 50} V78 H${ox + 91.42} A50,50 0 0 1 ${ox + 50},100 A50,50 0 0 1 ${ox + 50},0 Z ` + dome(ox),
  };
  A.letterPath = (ch, ox = 0) => L[ch](ox);
  A.wordPath = () => ['a', 'u', 'b', 'e'].map((c, i) => L[c](i * (100 + GAP))).join(' ');
  A.WORD_W = 4 * 100 + 3 * GAP; // 442
  /* Logotype « aube » */
  A.wordmark = (fill = 'currentColor', attrs = '') =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -42 ${A.WORD_W} 142" ${attrs}><path fill="${fill}" fill-rule="evenodd" d="${A.wordPath()}"/></svg>`;
  /* Symbole : le « a » seul */
  A.symbol = (fill = 'currentColor', attrs = '') =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" ${attrs}><path fill="${fill}" fill-rule="evenodd" d="${L.a(0)}"/></svg>`;
  /* Logotype + descripteur sur deux lignes (police Outfit requise dans la page) */
  A.lockup = (fill = 'currentColor', attrs = '') =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -42 716 150" ${attrs}><path fill="${fill}" fill-rule="evenodd" d="${A.wordPath()}"/>` +
    `<text x="486" y="42" fill="${fill}" font-family="Outfit" font-weight="400" font-size="52" letter-spacing="-.4">Assistant</text>` +
    `<text x="486" y="94" fill="${fill}" font-family="Outfit" font-weight="400" font-size="52" letter-spacing="-.4">personnel</text></svg>`;

  /* ---------- Orbe ---------- */
  A.orb = (size = 400, opts = {}) => {
    const { mark = true, rings = true, glow = true, cls = '' } = opts;
    const s = typeof size === 'number' ? size + 'px' : size;
    return `<div class="orb ${cls}" style="--s:${s}">${glow ? '<div class="glow"></div>' : ''}${rings ? '<div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div>' : ''}` +
      `<div class="body"><div class="blob b2"></div><div class="blob b5"></div><div class="blob b1"></div><div class="blob b3"></div><div class="blob b4"></div><div class="spec"></div><div class="shade"></div></div>` +
      (mark ? `<div class="mark">${A.wordmark('#fff')}</div>` : '') + `</div>`;
  };
  /* Anime les orbes : t en secondes. Boucle parfaite toutes les `loop` secondes. */
  A.seekOrbs = (t, loop = 6, root = document) => {
    const w = (2 * Math.PI * t) / loop;
    root.querySelectorAll('.orb').forEach((o, i) => {
      const p = i * 1.7;
      const set = (k, v) => o.style.setProperty(k, v.toFixed(2) + '%');
      set('--x1', -16 + 26 * Math.sin(w + p));          set('--y1', -12 + 22 * Math.cos(w + p));
      set('--x2', 44 + 24 * Math.cos(w + 1.2 + p));     set('--y2', 40 + 26 * Math.sin(w + 1.2 + p));
      set('--x3', 18 + 30 * Math.sin(2 * w + 2.1 + p)); set('--y3', 52 + 16 * Math.cos(w + 2.1 + p));
      set('--x4', 30 + 34 * Math.cos(w + 3.3 + p));     set('--y4', 22 + 30 * Math.sin(w + 3.3 + p));
      set('--x5', 40 + 30 * Math.sin(w + 4.4 + p));     set('--y5', 10 + 34 * Math.cos(2 * w + 4.4 + p));
    });
  };

  /* ---------- Icônes ---------- */
  const mic = (c = '#fff') => `<svg viewBox="0 0 16 22" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"><rect x="4.5" y="1" width="7" height="12" rx="3.5"/><path d="M1.5 10.5a6.5 6.5 0 0 0 13 0M8 17v4"/></svg>`;
  const statusIcons = `<span style="display:flex;gap:6px;align-items:center"><svg viewBox="0 0 18 12" fill="#fff"><rect x="0" y="8" width="3" height="4" rx=".7"/><rect x="5" y="5.5" width="3" height="6.5" rx=".7"/><rect x="10" y="3" width="3" height="9" rx=".7"/><rect x="15" y="0" width="3" height="12" rx=".7"/></svg>` +
    `<svg viewBox="0 0 17 12" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><path d="M1.5 4.2a10 10 0 0 1 14 0M4.2 7a6.2 6.2 0 0 1 8.6 0"/><circle cx="8.5" cy="10.2" r="1" fill="#fff" stroke="none"/></svg>` +
    `<svg viewBox="0 0 27 12" fill="none"><rect x=".6" y=".6" width="22.8" height="10.8" rx="3.2" stroke="#fff" stroke-opacity=".5"/><rect x="2.2" y="2.2" width="19.6" height="7.6" rx="1.8" fill="#fff"/><rect x="25" y="4" width="1.6" height="4" rx=".8" fill="#fff" fill-opacity=".5"/></svg></span>`;
  const status = (time = '9:41') => `<div class="status"><span>${time}</span>${statusIcons}</div>`;
  A.icons = { mic, status };

  /* ---------- Appareils ---------- */
  A.phone = (screenHTML, k = 1, extra = '') =>
    `<div class="phone" style="--k:${k};${extra}"><i class="btn l1"></i><i class="btn l2"></i><i class="btn l3"></i><i class="btn r1"></i><div class="screen"><div class="island"></div>${screenHTML}</div></div>`;
  A.watch = (inner, k = 1, extra = '') =>
    `<div class="watch" style="--k:${k};${extra}"><div class="band t"></div><div class="band b"></div><div class="crown"></div><div class="side"></div><div class="case"><div class="wscreen">${inner}</div></div></div>`;

  /* ---------- Écrans (390 × 844) ---------- */
  const S = {};
  /* 1. Accueil vocal */
  S.voix = (o = {}) => `<div class="ui ui-bg-a">${status()}
    <div style="position:absolute;top:168px;left:0;right:0;display:grid;place-items:center">${A.orb(196)}</div>
    <p style="position:absolute;top:452px;left:0;right:0;text-align:center;font-size:27px;line-height:1.24;letter-spacing:-.005em">${o.text || 'Bonjour Nina.<br>Le jour se lève,<br>tout est prêt.'}</p>
    <div class="home"></div></div>`;
  /* 2. La journée */
  S.jour = () => `<div class="ui ui-bg-b">${status()}
    <div style="position:absolute;top:76px;left:26px;right:26px;display:flex;justify-content:space-between;align-items:center">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="#fff" stroke-width="1.6"><rect x="2" y="2" width="11" height="11" rx="2.5"/><rect x="17" y="2" width="11" height="11" rx="2.5"/><rect x="2" y="17" width="11" height="11" rx="2.5"/><rect x="17" y="17" width="11" height="11" rx="2.5"/></svg>
      <div class="chip-mic">${mic()}</div></div>
    <div style="position:absolute;top:150px;left:26px;right:26px;display:flex;justify-content:space-between;align-items:flex-end">
      <div style="font-size:62px;line-height:.95;font-weight:400;letter-spacing:-.02em">Lundi</div>
      <div style="text-align:right"><div style="font-size:24px;line-height:1">02.11.26</div><div class="cap" style="margin-top:6px">07:12:34</div></div></div>
    <div style="position:absolute;top:240px;left:18px;right:18px;display:grid;gap:10px">
      <div class="glass" style="padding:15px 16px 16px"><div style="font-size:13px;font-weight:500;margin-bottom:8px">1&nbsp;&nbsp; Rituel du matin</div>
        <div class="ck on"><i></i>Un café, sans écran, face à la fenêtre.</div><div class="ck on"><i></i>Vingt minutes de marche avant le premier appel.</div></div>
      <div class="glass" style="padding:15px 16px 16px"><div style="font-size:13px;font-weight:500;margin-bottom:8px">2&nbsp;&nbsp; Travail</div>
        <div class="ck on"><i></i>Trier la boîte mail : 4 réponses déjà rédigées.</div><div class="ck"><i></i>Point d'équipe à 10 h, ordre du jour prêt.</div><div class="ck"><i></i>Rapport trimestriel : relire la synthèse.</div></div>
      <div class="glass" style="padding:15px 16px 16px"><div style="font-size:13px;font-weight:500;margin-bottom:8px">3&nbsp;&nbsp; Pour soi</div>
        <div class="ck"><i></i>Trente minutes de lecture, chapitre 7.</div><div class="ck"><i></i>Appeler Louise avant 19 h.</div></div>
      <div class="glass" style="padding:15px 16px 16px"><div style="font-size:13px;font-weight:500;margin-bottom:8px">4&nbsp;&nbsp; Ce soir</div>
        <div class="ck"><i></i>Dîner réservé à 20 h 30, table pour deux.</div></div>
    </div><div class="home"></div></div>`;
  /* 3. Tableau de bord */
  S.bord = () => `<div class="ui ui-bg-b">${status()}
    <div style="position:absolute;top:70px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;align-items:flex-end;gap:10px">${A.wordmark('#fff', 'style="height:40px;width:auto"')}<div style="font-size:9.5px;line-height:1.15;font-weight:400;padding-bottom:1px">Assistant<br>personnel</div></div>
      <div class="chip-mic">${mic()}</div></div>
    <p style="position:absolute;top:140px;left:24px;right:30px;font-size:21px;line-height:1.24">Bonjour Jade. Ta journée est déjà en ordre : trois priorités, deux rendez-vous, une soirée libre. On commence&nbsp;?</p>
    <div style="position:absolute;top:290px;left:16px;right:16px;display:grid;gap:9px">
      <div class="glass dark" style="padding:13px 15px 15px"><div style="display:flex;justify-content:space-between"><span class="cap">07:30 · À faire</span><span class="cap" style="opacity:.5">Tout voir</span></div>
        <div style="font-size:12.5px;font-weight:500;margin-top:9px">1&nbsp; Rituel du matin</div><div class="ck on"><i></i>Un café, sans écran.</div><div class="ck on"><i></i>Vingt minutes de marche.</div>
        <div style="font-size:12.5px;font-weight:500;margin-top:9px">2&nbsp; Travail</div><div class="ck"><i></i>Trier la boîte mail, 4 réponses prêtes.</div></div>
      <div class="glass dark" style="padding:13px 15px 15px"><div style="display:flex;justify-content:space-between"><span class="cap">Élan</span><span class="cap" style="opacity:.5">Tout voir</span></div>
        <div style="font-size:11.5px;opacity:.7;margin-top:7px">Progression de la semaine</div>
        <div style="display:flex;align-items:flex-end;gap:14px;margin-top:2px"><div style="font-size:34px;line-height:1;font-weight:300;padding-bottom:2px">12&nbsp;%</div>
          <div class="bars" style="flex:1"><b style="height:22%"></b><b style="height:34%"></b><b style="height:40%"></b><b style="height:55%"></b><b style="height:70%"></b><b style="height:82%"></b><b style="height:100%"></b></div></div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
        <div class="glass dark" style="padding:13px 15px 15px;height:136px"><div style="display:flex;justify-content:space-between"><span class="cap">Focus</span><span class="cap" style="opacity:.5">Voir</span></div>
          <div style="display:grid;place-items:center;margin-top:8px"><svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="33" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="9"/><circle cx="42" cy="42" r="33" fill="none" stroke="url(#fg)" stroke-width="9" stroke-linecap="round" stroke-dasharray="150 208" transform="rotate(-90 42 42)"/><defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFC46B"/><stop offset="1" stop-color="#FF632B"/></linearGradient></defs><text x="42" y="47" text-anchor="middle" fill="#fff" font-family="Outfit" font-size="16" font-weight="400">3 h 10</text></svg></div></div>
        <div class="glass dark" style="padding:13px 15px 15px;height:136px"><div style="display:flex;justify-content:space-between"><span class="cap">Sommeil</span><span class="cap" style="opacity:.5">Voir</span></div>
          <div class="sbars" style="margin-top:14px;justify-content:space-between"><b style="height:30%"></b><b style="height:55%"></b><b style="height:42%"></b><b style="height:88%"></b><b style="height:36%"></b><b style="height:64%"></b><b style="height:100%"></b><b style="height:48%"></b><b style="height:72%"></b><b style="height:58%"></b></div></div></div>
      <div class="glass dark" style="padding:13px 15px 40px"><div style="display:flex;justify-content:space-between"><span class="cap">Suggestions</span><span class="cap" style="opacity:.5">Tout voir</span></div></div>
    </div><div class="home"></div></div>`;
  /* 4. Conversation */
  S.chat = () => `<div class="ui ui-bg-c">${status()}
    <div style="position:absolute;top:84px;left:26px;right:26px;display:flex;justify-content:space-between;align-items:center">${A.symbol('#fff', 'style="height:30px;width:auto"')}<span class="cap">Aujourd'hui · 11:18</span></div>
    <p style="position:absolute;top:158px;left:26px;right:30px;font-size:25px;line-height:1.26">Tu as rendez-vous chez ton client à midi. Ça roule mal sur le périphérique&nbsp;: pars dix minutes plus tôt, j'ai prévenu Marc de ton arrivée. Bonne route&nbsp;!</p>
    <div class="glass" style="position:absolute;left:14px;right:14px;bottom:34px;height:250px;border-radius:34px;padding:26px 24px"><div style="font-size:19px;color:rgba(255,255,255,.62)">Écris ou parle…</div>
      <div class="chip-mic" style="position:absolute;right:20px;top:-21px">${mic()}</div></div>
    <div class="home"></div></div>`;
  A.screens = S;

  /* Écran de montre */
  A.watchScreen = (text = 'Point de midi&nbsp;: besoin d\'aide sur une tâche, ou d\'un objectif pour ce soir&nbsp;?') =>
    `<div class="cap" style="position:absolute;top:20px;right:30px;font-size:11px;opacity:.9">10:51</div>
     <p class="wtxt" style="position:absolute;top:58px;left:26px;right:24px;font-size:14.5px;line-height:1.3;font-weight:400">${text}</p>
     <div class="chip-mic" style="position:absolute;bottom:22px;left:50%;margin-left:-21px;background:rgba(10,6,9,.45);box-shadow:inset 0 0 0 1px rgba(255,255,255,.35)">${mic()}</div>`;

  /* Carte de message */
  A.ncard = (title, text) => `<div class="ncard"><div class="hd">${A.orb(54, { mark: false, rings: false, glow: false })}<span>${title}</span></div><div class="tx">${text}</div><div class="in"><span>Écris ou parle…</span><div class="chip-mic ghost">${mic()}</div></div></div>`;

  /* Pied de planche : symbole + rubriques + année */
  A.foot = (a, b, color = '#231A26') => `<div class="pfoot" style="color:${color}">${A.symbol(color)}<span>${a}</span><span>${b}</span><span>2026©</span></div>`;

  window.Aube = A;
})();
