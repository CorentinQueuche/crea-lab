/* Visuels de supports Drupe : une fonction par support, appelée par une page de trois lignes (shot.mjs ne passe pas de paramètre d'URL).
   Chaque fonction écrit dans #p, dont la taille en px CSS est la proportion exacte de la surface 3D (cotes en mètres rappelées en commentaire). */
(function () {
  const M = Marque, C = M.COULEURS, $ = () => document.getElementById('p');
  const Art = {};

  /* Face avant d'un sachet de 250 g : 0,105 × 0,190 m -> 525 × 950. Le haut (150 px) passe sous le rabat, la pastille de scellé est un disque 3D. */
  Art.sachet = (id) => { $().innerHTML =
    `<div style="position:absolute;left:72px;top:318px">${M.etiquette(id, 1.19, 'box-shadow:0 1px 0 rgba(42,26,20,.10),0 2px 5px rgba(42,26,20,.10)')}</div>
     <div class="a-mono" style="position:absolute;left:0;right:0;bottom:44px;text-align:center;font-size:11.5px;opacity:.7">Café en grains · 250 g · www.drupe-cafe.fr</div>`; };

  /* Pastille seule, plein cadre, pour un disque 3D (le fond prend le ton de la pastille : le disque est rogné au cercle) */
  Art.pastille = (id) => { const c = M.cafe(id); document.body.style.background = M.TONS[c.ton].bg; $().style.background = M.TONS[c.ton].bg;
    $().innerHTML = M.pastille(c, 400); };

  /* Intérieur du couvercle de la boîte d'abonnement : 0,270 × 0,200 m -> 945 × 700 */
  Art.couvercle = () => { $().innerHTML =
    `<div style="position:absolute;left:0;right:0;top:196px;display:grid;place-items:center">${M.wordmark(C.cerise, 'style="width:600px"')}</div>
     <div class="a-mono" style="position:absolute;left:0;right:0;top:356px;text-align:center;font-size:15px;color:${C.cerise}">Torréfacteur de quartier</div>
     <div style="position:absolute;left:60px;right:60px;bottom:54px;display:flex;justify-content:space-between;align-items:flex-end">
       <div class="a-mono" style="font-size:12.5px;line-height:1.7">Boîte n° 17<br>Torréfié le mardi · Livré à vélo le jeudi</div>
       <div style="font-size:19px;font-weight:500;letter-spacing:-.015em;text-align:right;line-height:1.25">Rendez-nous la boîte vide.<br>On la remplit.</div></div>`; };

  /* Papier de soie au semis : carré de 0,50 m -> 800 × 800 */
  Art.soie = () => { $().innerHTML = M.semis({ cols: 8, rows: 8, pas: 100, taille: 52, tons: [C.pulpe, C.vert, C.pulpe, C.cerise, C.vert] }); };

  /* Carte glissée dans la boîte : A6, 0,105 × 0,148 m -> 525 × 740 */
  Art.carteMardi = () => { $().innerHTML =
    `<div style="position:absolute;left:44px;top:44px">${M.symbol(C.fleur, 'style="width:54px;display:block"')}</div>
     <div class="a-mono" style="position:absolute;right:44px;top:50px;font-size:11px;text-align:right;line-height:1.7">Boîte n° 17<br>Semaine 47</div>
     <div class="a-t" style="position:absolute;left:44px;top:188px;font-size:92px">Torréfié<br>mardi.</div>
     <p style="position:absolute;left:44px;right:56px;top:416px;font-size:20.5px;line-height:1.38">Bonjour Inès, voici votre Guji et votre Huila. Ils sortent du tambour : laissez-les reposer deux jours, puis 15 g pour 250 ml.</p>
     <div style="position:absolute;left:44px;bottom:44px;font-size:20.5px;font-weight:500">Jeanne</div>
     <div class="a-mono" style="position:absolute;right:44px;bottom:48px;font-size:11px">Livré à vélo, jeudi 19 nov.</div>`; };

  /* Bandeau du gobelet : circonférence haute 0,2796 m × génératrice 0,1111 m -> 1398 × 555. Le milieu (u = 0,5) fait face à la caméra.
     Le flanc 3D est déplié sans déformation : le bas n'utilise que le centre du bandeau, rien d'important hors du tiers central en bas. */
  Art.gobelet = () => { const ligne = 'Le café est un fruit · Torréfié au coin de la rue · '; $().innerHTML =
    `<div class="a-mono" style="position:absolute;left:0;right:0;top:40px;font-size:13px;white-space:nowrap;text-align:center;color:${C.cerise}">${ligne.repeat(3)}</div>
     <div style="position:absolute;left:0;right:0;top:136px;display:grid;place-items:center">${M.pastille('guji', 300, { angle: -6 })}</div>
     <div style="position:absolute;left:1060px;top:240px">${M.wordmark(C.cerise, 'style="width:210px"')}</div>
     <div style="position:absolute;left:128px;top:240px">${M.wordmark(C.cerise, 'style="width:210px"')}</div>`; };

  /* Affiche de la colonne (image finale de la vidéo 20) : 1,20 × 1,80 m -> 800 × 1200 */
  Art.affiche = () => { $().innerHTML =
    `<div style="position:absolute;left:-420px;top:372px">${M.symbol(C.cerise, 'style="width:1500px;display:block"')}</div>
     <div class="a-t" style="position:absolute;left:64px;top:60px;font-size:104px">Cueilli mûr.<br>Torréfié clair.<br>Servi frais.</div>
     <div style="position:absolute;left:64px;bottom:64px">${M.wordmark(C.fleur, 'style="width:300px;display:block"')}</div>
     <div class="a-mono" style="position:absolute;left:64px;bottom:150px;font-size:15px;color:${C.fleur};line-height:1.7">Torréfacteur de quartier<br>À l'angle de la rue du Tambour</div>`; };

  /* Chevalet de trottoir : 0,60 × 0,90 m -> 600 × 900 */
  Art.chevalet = () => { $().innerHTML =
    `<div style="position:absolute;left:44px;top:44px">${M.wordmark(C.fleur, 'style="width:190px;display:block"')}</div>
     <div style="position:absolute;right:44px;top:36px">${M.symbol(C.vert, 'style="width:52px;display:block"')}</div>
     <div class="a-t" style="position:absolute;left:44px;top:236px;font-size:88px">Cueilli<br>mûr.<br>Torréfié<br>clair.<br>Servi<br>frais.</div>
     <div class="a-mono" style="position:absolute;left:44px;right:44px;bottom:44px;font-size:13px;line-height:1.7;color:${C.vert}">Du mardi au samedi · 8 h – 18 h<br>On torréfie le mardi</div>`; };

  /* Vitrophanie : vitre de 2,60 × 1,80 m -> 1300 × 900, fond transparent, semis en Fleur sur la bande basse */
  Art.vitro = () => { $().innerHTML =
    `<div style="position:absolute;left:0;right:0;bottom:0;height:340px">${M.semis({ cols: 12, rows: 3, pas: 110, taille: 70, tons: [C.fleur] })}</div>`; };

  /* Porte vitrée : 0,90 × 2,10 m -> 450 × 1050, fond transparent */
  Art.porte = () => { $().innerHTML =
    `<div style="position:absolute;left:0;right:0;top:330px;display:grid;place-items:center">${M.symbol(C.fleur, 'style="width:150px;display:block"')}</div>
     <div style="position:absolute;left:0;right:0;top:520px;text-align:center;color:${C.fleur};font-size:27px;font-weight:500;line-height:1.3;letter-spacing:-.01em">Du mardi au samedi<br>8 h – 18 h</div>
     <div class="a-mono" style="position:absolute;left:0;right:0;top:612px;text-align:center;color:${C.fleur};font-size:12.5px;line-height:1.8">On torréfie le mardi<br>www.drupe-cafe.fr</div>`; };

  /* Gobo de fenêtre (scène 17) : même semis, plein cadre, sert seulement d'ombre portée */
  Art.gobo = () => { $().innerHTML = M.semis({ cols: 7, rows: 5, pas: 160, taille: 96, tons: [C.grain] }); };

  /* Carte de visite 85 × 55 mm -> 850 × 550 */
  Art.carteRecto = () => { $().innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center">${M.lockup(C.fleur, 'style="width:560px;display:block;margin-top:8px"')}</div>`; };
  Art.carteVerso = () => { $().innerHTML =
    `<div style="position:absolute;left:56px;top:50px">${M.symbol(C.cerise, 'style="width:78px;display:block"')}</div>
     <div style="position:absolute;right:56px;top:58px;text-align:right;font-size:30px;font-weight:500;letter-spacing:-.02em;line-height:1.15">Jeanne Lemoine<div class="a-mono" style="font-size:13px;margin-top:10px;opacity:.75">Torréfactrice</div></div>
     <div style="position:absolute;left:56px;bottom:54px;font-size:19px;line-height:1.4">À l'angle de la rue du Tambour<br><span style="opacity:.7">Du mardi au samedi, 8 h à 18 h</span></div>
     <div style="position:absolute;right:56px;bottom:54px;text-align:right;font-size:19px;line-height:1.4">04 65 71 02 47<br>bonjour@drupe-cafe.fr<br><b style="font-weight:500;color:${C.cerise}">www.drupe-cafe.fr</b></div>`; };
  /* Carte de fidélité, même format : dix cases, six tamponnées */
  Art.carteFidelite = () => { const ang = [-14, 9, 22, -6, 31, -19], pris = 6; let cases = '';
    for (let i = 0; i < 10; i++) cases += `<div style="width:112px;height:112px;border-radius:50%;box-shadow:inset 0 0 0 1.5px rgba(42,26,20,.28);display:grid;place-items:center;font-family:var(--mono);font-size:13px;color:rgba(42,26,20,.45)">` +
      (i < pris ? M.symbol(C.cerise, `style="width:84px;display:block;transform:rotate(${ang[i]}deg) translate(${(i % 3) - 1}px,${(i % 2) * 2 - 1}px)"`) : (i === 9 ? 'OFFERT' : String(i + 1).padStart(2, '0'))) + `</div>`;
    $().innerHTML =
    `<div style="position:absolute;left:56px;top:50px;right:56px;display:flex;justify-content:space-between;align-items:flex-start">
       <div><div class="a-mono" style="font-size:13px;opacity:.75">Carte de fidélité</div><div class="a-t" style="font-size:40px;margin-top:10px">Le dixième café<br>est pour nous.</div></div>${M.wordmark(C.cerise, 'style="width:150px;display:block"')}</div>
     <div style="position:absolute;left:56px;right:56px;bottom:50px;display:grid;grid-template-columns:repeat(5,112px);justify-content:space-between;row-gap:18px">${cases}</div>`; };

  /* Sac en kraft blanchi, face : 0,24 × 0,32 m -> 720 × 960 */
  Art.sac = () => { $().innerHTML =
    `<div style="position:absolute;left:0;right:0;top:330px;display:grid;place-items:center">${M.wordmark(C.cerise, 'style="width:520px;display:block"')}</div>
     <div class="a-mono" style="position:absolute;left:0;right:0;top:462px;text-align:center;font-size:17px;color:${C.cerise}">Torréfacteur de quartier</div>
     <div style="position:absolute;left:0;right:0;bottom:70px;display:grid;place-items:center">${M.symbol(C.cerise, 'style="width:74px;display:block"')}</div>`; };

  /* Écran du téléphone : la fiche du Guji, 390 × 844 */
  Art.ecran = () => { $().innerHTML = M.screens.fiche('guji'); };

  /* Ardoise derrière le comptoir (image finale de la vidéo 27) : écran 16:9 -> 1280 × 720 */
  Art.ardoise = () => { const rows = M.CAFES.map((c) =>
      `<div style="display:grid;grid-template-columns:64px 190px 1fr 96px;align-items:center;gap:22px;height:92px;border-top:1px solid rgba(42,26,20,.14)">${M.pastille(c, 64, { angle: ((c.nom.length * 7) % 13) - 6 })}
        <div style="font-size:34px;font-weight:600;letter-spacing:-.02em">${c.nom}</div>
        <div><div class="a-mono" style="font-size:11.5px;opacity:.7">${c.pays} · ${c.alt} · ${c.procede}</div><div style="font-size:18px;margin-top:5px">${c.notes[0]}, ${c.notes.slice(1).join(', ').toLowerCase()}.</div></div>
        <div style="font-size:24px;font-weight:500;text-align:right">${c.prix}</div></div>`).join('');
    $().innerHTML =
    `<div style="position:absolute;left:56px;top:48px;width:330px"><div class="a-mono" style="font-size:12.5px;opacity:.75">La carte · Semaine 47</div>
       <div style="font-size:200px;font-weight:300;letter-spacing:-.05em;line-height:.9;margin-top:54px;color:${C.cerise}">48&#8239;h</div>
       <div style="font-size:23px;line-height:1.25;font-weight:500;letter-spacing:-.015em;margin-top:22px">du tambour à votre<br>boîte aux lettres.</div>
       <div class="a-mono" style="font-size:12px;line-height:1.8;margin-top:142px;opacity:.75">Torréfié mardi 17 nov.<br>Fournées de 12 kg</div></div>
     <div style="position:absolute;left:440px;right:56px;top:112px">${rows}<div style="border-top:1px solid rgba(42,26,20,.14)"></div></div>
     <div class="a-mono" style="position:absolute;left:440px;top:52px;font-size:12.5px;opacity:.75">Les 250 g, en grains ou moulus à la demande</div>
     <div style="position:absolute;right:56px;top:40px">${M.wordmark(C.cerise, 'style="width:150px;display:block"')}</div>`; };

  window.Art = Art;
})();
