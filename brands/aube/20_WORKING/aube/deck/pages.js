/* Pages du guide de marque Aube (1280 × 720). Généré depuis plates/17-charte.html par l'étape de présentation : ne pas modifier à la main. */
(function(){
const A = Aube, NU = '#1C1122', AU = '#FF632B', EN = '#231A26';

/* ---------- Éléments communs ---------- */
const mf = (sec, n, c = EN) => `<div class="mf" style="color:${c}">${A.symbol(c)}<span>Guide de marque</span><span>${sec}</span><span>2026©</span><span>${n}</span></div>`;
const head = (t, tx, c = EN) => `<div class="t" style="color:${c}">${t}</div><p class="tx" style="color:${c}">${tx}</p>`;
const icon = (size, bg, sym, badge = '') => `<div class="appi ${bg.startsWith('.') ? bg.slice(1) + ' grain' : ''}" style="width:${size}px;height:${size}px;${bg.startsWith('.') ? '' : 'background:' + bg}">${A.symbol(sym)}</div>`;

/* ---------- Pages ---------- */
const P = {};
P.cover = `<div class="g2 grain" style="position:absolute;inset:0"></div>
  <div class="big" style="top:52px;font-size:150px;line-height:.98">Guide<br>de marque</div>
  <div style="position:absolute;left:64px;bottom:52px">${A.lockup('#fff', 'style="width:330px"')}</div>
  <div class="cap2" style="position:absolute;right:64px;top:70px;color:#fff;opacity:.8">Version 1.0 · 2026</div>`;

const toc = [['01', 'La marque', '03', ['Mission', '04'], ['Valeurs', '05'], ['Personnalité', '06'], ['Ton de voix', '07']],
  ['02', 'Le logo', '08', ['Logo et signature', '09'], ['Zone de protection', '10'], ['Usages du logo', '11'], ['Icône d’app', '12']],
  ['03', 'Couleurs', '13', ['Palette', '14'], ['Dégradés', '15']],
  ['04', 'Typographie', '16', ['Outfit et DM Mono', '17']],
  ['05', 'En situation', '18', ['L’astre', '19'], ['Écrans', '20'], ['Cartes de visite', '21'], ['Écran de scène', '22']]];
P.sommaire = `<div style="position:absolute;inset:0;background:${NU}"></div>
  <div class="t" style="color:#fff">Sommaire</div>
  <div style="position:absolute;left:600px;right:64px;top:50px;color:#fff">${toc.map(([n, s, p, ...subs]) =>
    `<div style="display:flex;justify-content:space-between;font-size:19px;font-weight:500;height:31px;align-items:center;border-bottom:1px solid rgba(255,255,255,.22)"><span>${n}&nbsp;&nbsp;${s}</span><span class="mono" style="color:${AU};font-size:16px">${p}</span></div>` +
    subs.map(([t, q]) => `<div style="display:flex;justify-content:space-between;font-size:15px;height:27px;align-items:center;opacity:.62;border-bottom:1px solid rgba(255,255,255,.08)"><span>${t}</span><span class="mono" style="font-size:14px">${q}</span></div>`).join('')).join('')}</div>
  ${mf('Sommaire', '02', '#fff')}`;

P.mission = `${head('Mission', 'Aube s’occupe de la logistique invisible du quotidien&nbsp;: agenda, messages, trajets, rappels. Pour que tu gardes ton attention pour ce qui compte.')}
  <p style="position:absolute;left:600px;right:64px;top:56px;font-size:58px;line-height:1.1;letter-spacing:-.015em">Rendre à chacun le temps de bien commencer sa journée.</p>
  ${mf('La marque', '04')}`;

const vals = [['Clarté', 'dire l’essentiel, simplement.'], ['Attention', 'écouter avant d’agir.'], ['Fiabilité', 'tenir parole, chaque jour.'], ['Initiative', 'avoir un temps d’avance.']];
P.valeurs = `${head('Valeurs', 'Quatre valeurs guident chaque mot et chaque écran. Quand un choix hésite, on revient à elles.')}
  <div style="position:absolute;left:600px;right:64px;top:62px">${vals.map(([v, t], i) =>
    `<div style="display:grid;grid-template-columns:90px 1fr;font-size:24px;line-height:1.35;margin-bottom:34px"><span class="mono" style="color:${AU};font-size:20px;padding-top:3px">0${i + 1}</span><p><b style="font-weight:500">${v}&nbsp;:</b> ${t}</p></div>`).join('')}</div>
  ${mf('La marque', '05')}`;

const pers = [['Calme', 'Énergique', .24], ['Chaleureux', 'Distant', .18], ['Simple', 'Sophistiqué', .3], ['Discret', 'Expansif', .32], ['Précis', 'Approximatif', .1], ['Familier', 'Formel', .4], ['Patient', 'Pressé', .14], ['Léger', 'Sérieux', .6], ['Classique', 'Novateur', .7], ['Humain', 'Technique', .26]];
P.perso = `${head('Personnalité', 'Aube parle comme un proche bien organisé&nbsp;: calme, chaleureux, précis. Jamais pressant, jamais technique. Les curseurs fixent le ton juste entre deux extrêmes.')}
  <div style="position:absolute;left:600px;right:64px;top:50px">${pers.map(([a, b, v]) => `<div class="sl"><span>${a}</span><div class="tr"><i style="left:${v * 100}%"></i></div><span>${b}</span></div>`).join('')}</div>
  ${mf('La marque', '06')}`;

const say = ['J’ai prévenu Marc de ton arrivée.', 'Trois priorités aujourd’hui, pas une de plus.', 'Ça roule mal&nbsp;: pars dix minutes plus tôt.'];
const avoid = ['Notification envoyée avec succès&nbsp;!', 'Optimisez votre productivité dès maintenant&nbsp;!', 'Une erreur inattendue est survenue.'];
const quote = (t, on) => `<p style="font-size:21px;line-height:1.3;padding:16px 0;border-top:1px solid #E9E3DE;${on ? '' : 'color:#8B8088'}">«&nbsp;${t}&nbsp;»</p>`;
P.ton = `${head('Ton de voix', 'Tutoiement, phrases courtes, mots simples. Aube dit ce qu’il a fait, pas ce qu’il sait faire. Pas de jargon, pas d’emphase.')}
  <div style="position:absolute;left:600px;right:64px;top:62px;display:grid;grid-template-columns:1fr 1fr;gap:40px">
    <div><div class="cap2" style="color:${AU};margin-bottom:14px">On dit</div>${say.map((t) => quote(t, 1)).join('')}</div>
    <div><div class="cap2" style="color:#8B8088;margin-bottom:14px">On évite</div>${avoid.map((t) => quote(t, 0)).join('')}</div></div>
  ${mf('La marque', '07')}`;

const divider = (n, t, g) => `<div class="${g} grain" style="position:absolute;inset:0"></div><div class="big">${t}</div>
  <div style="position:absolute;left:52px;bottom:-128px;font-size:420px;line-height:1;font-weight:300;color:#fff;letter-spacing:-.04em">${n}</div>`;
P.d1 = divider('01', 'La marque', 'g5');
P.d2 = divider('02', 'Le logo', 'g7');
P.d5 = divider('05', 'En situation', 'g9');
P.s1 = divider('03', 'Couleurs', 'g4');
P.s2 = divider('04', 'Typographie', 'g8');
P.s3 = divider('06', 'Contacts', 'g6');

P.logo = `${head('Logo et signature', 'Le logotype est dessiné sur quatre disques. Dans chaque lettre, un dôme se pose sur la ligne d’horizon&nbsp;: un soleil qui se lève. La signature «&nbsp;Assistant personnel&nbsp;» l’accompagne à droite.')}
  <div style="position:absolute;left:470px;right:0;top:0;bottom:90px;display:grid;place-items:center">${A.lockup(NU, 'style="width:560px"')}</div>
  ${mf('Le logo', '09')}`;

/* Zone de protection : symbole de 200, marge x = 100 (moitié de la hauteur) */
P.zone = `${head('Zone de protection', 'Autour du symbole, garde un espace libre égal à la moitié de sa hauteur. Rien n’y entre&nbsp;: ni texte, ni image, ni bord de page.')}
  <div style="position:absolute;left:690px;top:70px;width:440px;height:440px;background:var(--brume)">
    <svg width="440" height="440" viewBox="0 0 440 440" style="position:absolute;inset:0">
      <g stroke="${AU}" stroke-width="1.5" stroke-dasharray="6 6" fill="none"><path d="M120 0V440M320 0V440M0 120H440M0 320H440"/></g>
      <g transform="translate(120 120) scale(2)"><path fill="${NU}" fill-rule="evenodd" d="${A.letterPath('a')}"/></g>
      <g font-family="DM Mono" font-size="22" fill="${AU}" text-anchor="middle"><text x="60" y="228">x</text><text x="380" y="228">x</text><text x="220" y="68">x</text><text x="220" y="390">x</text></g>
    </svg></div>
  <div class="cap2" style="position:absolute;left:690px;top:530px;color:#8B8088">x = moitié de la hauteur du symbole</div>
  ${mf('Le logo', '10')}`;

const tiles = [[NU, AU], ['.g1', '#fff'], ['#fff', NU], [AU, NU], ['#C4391A', '#fff'], ['#E9E3DE', NU]];
P.usages = `${head('Usages du logo', 'Le logo s’emploie en aplat&nbsp;: Nuit, Blanc ou Aurore. Sur un dégradé, il passe en blanc. Ne le déforme pas, ne l’ombre pas, ne change pas ses proportions.')}
  <div style="position:absolute;left:470px;right:0;top:0;height:600px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr">${tiles.map(([b, c]) =>
    `<div class="${b.startsWith('.') ? b.slice(1) + ' grain' : ''}" style="display:grid;place-items:center;${b.startsWith('.') ? '' : 'background:' + b};${b === '#fff' ? 'box-shadow:inset 0 0 0 1px #E9E3DE' : ''}">${A.wordmark(c, 'style="width:170px"')}</div>`).join('')}</div>
  ${mf('Le logo', '11')}`;

P.icone = `${head('Icône d’app', 'L’icône reprend le symbole en blanc, sur un dégradé qui se lève par le bas. Quatre variantes en aplat servent les fonds particuliers.')}
  <div style="position:absolute;left:600px;top:120px">${icon(250, '.g3', '#fff')}<div style="position:absolute;right:-26px;top:-26px;width:70px;height:70px;border-radius:50%;background:#C4391A;color:#fff;display:grid;place-items:center;font-size:36px;font-weight:400">3</div></div>
  <div style="position:absolute;left:960px;top:56px;display:grid;gap:22px">${[[AU, NU, 'Aurore · Nuit'], [NU, AU, 'Nuit · Aurore'], ['#C4391A', '#fff', 'Braise · Blanc'], ['#0A0609', '#FFC46B', 'Noir · Miel']].map(([b, s, l], i) =>
    `<div style="display:flex;align-items:center;gap:20px">${icon(108, b, s)}<div style="font-size:15px;line-height:1.35"><b style="font-weight:500">Icône ${i + 1}</b><br><span style="color:#8B8088">${l}</span></div></div>`).join('')}</div>
  ${mf('Le logo', '12')}`;

const pal = [['Nuit', '#1C1122', 130, '#fff'], ['Prune', '#4B1838', 80, '#fff'], ['Braise', '#C4391A', 80, '#fff'], ['Aurore', '#FF632B', 120, NU], ['Miel', '#FFC46B', 80, NU], ['Blanc', '#FFFFFF', 60, NU], ['Brume', '#E9E3DE', 60, NU], ['Noir', '#0A0609', 70, '#fff']];
P.palette = `${head('Palette', 'Huit couleurs prises au ciel du matin. La Nuit et l’Aurore portent la marque&nbsp;; la Prune, la Braise et le Miel nourrissent les dégradés&nbsp;; le Blanc, la Brume et le Noir laissent respirer.')}
  <div style="position:absolute;left:520px;right:64px;top:56px;height:560px;display:flex">${pal.map(([n, h, w, t]) =>
    `<div style="flex:${w};background:${h};color:${t};position:relative;${n === 'Blanc' ? 'box-shadow:inset 0 0 0 1px #E9E3DE' : ''}"><span style="position:absolute;left:50%;top:18px;transform:translateX(-50%);writing-mode:vertical-rl;font-size:16px">${n}</span><span class="mono" style="position:absolute;left:50%;bottom:18px;transform:translateX(-50%);writing-mode:vertical-rl;font-size:13px">#${h.slice(1)}</span></div>`).join('')}</div>
  ${mf('Couleurs', '14')}`;

P.degrades = `${head('Dégradés', 'Toujours de la nuit vers la lumière&nbsp;: Noir, Prune, Braise, Aurore, Miel. Neuf préréglages couvrent tous les usages. Sur les grandes surfaces, ajoute un grain léger.')}
  <div style="position:absolute;left:520px;right:64px;top:56px;height:560px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr)">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<div class="g${i}"></div>`).join('')}</div>
  ${mf('Couleurs', '15')}`;

P.typo = `${head('Typographie', 'Outfit porte toute la marque&nbsp;: Light pour les titres et le texte, Medium pour les intitulés. DM Mono reste aux étiquettes, aux codes et aux numéros.')}
  <div style="position:absolute;left:510px;top:4px;font-size:300px;line-height:1;letter-spacing:-.035em;white-space:nowrap">Outfit</div>
  <div style="position:absolute;left:520px;top:390px;font-size:17px;line-height:1.4"><b style="font-weight:500">Outfit — Light</b><br>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789</div>
  <div style="position:absolute;left:880px;top:390px;font-size:17px;line-height:1.4;font-weight:500">Outfit — Medium<br>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789</div>
  <div class="mono" style="position:absolute;left:520px;top:540px;font-size:17px">DM Mono — 0123456789 · #FF632B</div>
  ${mf('Typographie', '17')}`;

P.astre = `${head('L’astre', 'L’astre est l’objet de la marque&nbsp;: une sphère de verre chaud, en mouvement lent. Il incarne Aube qui écoute et qui prépare. Il se montre seul, ou porte le logotype en blanc.')}
  <div style="position:absolute;left:520px;top:56px;width:340px;height:560px;border-left:1px solid #E9E3DE;padding-left:22px"><div style="font-size:15px">L’astre</div></div>
  <div style="position:absolute;left:880px;top:56px;width:336px;height:560px;border-left:1px solid #E9E3DE;padding-left:22px"><div style="font-size:15px">L’astre et le logo</div></div>
  <div style="position:absolute;left:560px;top:200px">${A.orb(280, { mark: false })}</div>
  <div style="position:absolute;left:918px;top:200px">${A.orb(280)}</div>
  ${mf('En situation', '19')}`;

P.ecrans = `${head('Écrans', 'L’interface prolonge l’identité&nbsp;: fonds sombres, lumière qui monte du bas, cartes de verre, texte en Outfit Light. Chaque écran dit une seule chose à la fois.')}
  <div style="position:absolute;left:470px;right:0;top:0;bottom:0;background:var(--brume)"></div>
  <div style="position:absolute;left:510px;top:90px">${A.phone(A.screens.voix(), .55)}</div>
  <div style="position:absolute;left:770px;top:140px">${A.phone(A.screens.bord(), .55)}</div>
  <div style="position:absolute;left:1030px;top:60px">${A.phone(A.screens.chat(), .55)}</div>
  ${mf('En situation', '20')}`;

P.cartes = `<div style="position:absolute;inset:0;background:var(--brume)"></div>${head('Cartes de visite', 'Recto en Nuit avec le logotype en Aurore, verso blanc pour les coordonnées. Papier mat, texte en Outfit Light.')}
  <div style="position:absolute;left:520px;top:70px;width:400px;height:259px;border-radius:10px;background:${NU};display:grid;place-items:center;box-shadow:0 30px 40px -24px rgba(35,26,38,.5)">${A.wordmark(AU, 'style="width:190px"')}</div>
  <div style="position:absolute;left:790px;top:330px;width:400px;height:259px;border-radius:10px;background:#fff;box-shadow:0 30px 40px -24px rgba(35,26,38,.4);padding:34px 36px">
    ${A.symbol(AU, 'style="width:40px"')}
    <div style="position:absolute;left:36px;bottom:34px;font-size:16px;line-height:1.35"><b style="font-weight:500;font-size:20px">Camille Martin</b><br>Responsable produit<div class="mono" style="font-size:12.5px;margin-top:14px;color:#8B8088">camille@bonjouraube.fr<br>www.bonjouraube.fr</div></div></div>
  ${mf('En situation', '21')}`;

P.scene = `<div style="position:absolute;inset:0;background:#0A0609"></div>${head('Écran de scène', 'Pour les salons et les conférences, un seul chiffre en grand sur un dégradé qui se lève. Le texte reste court&nbsp;: il se lit de loin, en trois secondes.', '#fff')}
  <div style="position:absolute;left:500px;top:70px;width:716px;height:403px;overflow:hidden;box-shadow:0 0 0 1px rgba(255,214,170,.18)" class="g3 grain">
    <div style="position:absolute;left:44px;top:30px;font-size:170px;line-height:1;font-weight:300;color:#fff;letter-spacing:-.03em">2 h 07</div>
    <div style="position:absolute;left:52px;top:214px;font-size:30px;color:#fff">gagnées chaque jour</div>
    <div style="position:absolute;right:40px;top:40px">${A.wordmark('#fff', 'style="width:120px"')}</div></div>
  <div style="position:absolute;left:470px;width:776px;top:480px;height:120px;background:radial-gradient(50% 60% at 50% 0%,rgba(255,99,43,.35),rgba(10,6,9,0) 80%)"></div>
  ${mf('En situation', '22', '#fff')}`;

P.dos = `<div style="position:absolute;inset:0;background:${NU}"></div>
  <div class="horizon" style="width:1900px;height:1900px;left:-310px;top:480px"></div>
  <div style="position:absolute;left:0;right:0;top:210px;display:grid;justify-items:center;gap:26px">${A.wordmark('#fff', 'style="width:300px"')}<div class="mono" style="color:#fff;opacity:.75;font-size:17px;letter-spacing:.06em">www.bonjouraube.fr</div></div>`;


window.GuidePages = P;
window.GuideOrder = ["cover", "sommaire", "d1", "mission", "valeurs", "perso", "ton", "d2", "logo", "zone", "usages", "icone", "s1", "palette", "degrades", "s2", "typo", "d5", "astre", "ecrans", "cartes", "scene", "dos"];
window.GuideTitles = ["Couverture", "Sommaire", "01 La marque", "Mission", "Valeurs", "Personnalité", "Ton de voix", "02 Le logo", "Logo et signature", "Zone de protection", "Usages du logo", "Icône d’app", "03 Couleurs", "Palette", "Dégradés", "04 Typographie", "Typographie", "05 En situation", "L’astre", "Écrans", "Cartes de visite", "Écran de scène", "Dos"];
})();
