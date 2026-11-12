/* Le remplisseur de Sillon : la page. Elle lit le socle (Marque) et outil/regles.json, construit l'adresse d'un des
   quatre gabarits de reseaux/, l'affiche à l'échelle dans un cadre, et demande au serveur local le PNG exact.
   Le fondateur ne voit jamais la syntaxe des gabarits : il tape une phrase, la page propose les verres. */
(function () {
  const M = window.Marque, $ = (s) => document.querySelector(s), NB = M.NB;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  /* ---------- les verres : la règle de la marque, sans crochets ----------
     Une lettre peut devenir un verre si c'est un U ou un V (avec ou sans accent). Par défaut, un verre par mot : le
     premier U, sinon le premier V (comme dans JE[U]DI, O[U]VRE, [V]IN). Deux par mot au plus, au choix du fondateur. */
  const FAMILLE_U = 'UÛÙÜÚ', PEUT = (ch) => FAMILLE_U.includes(ch) || ch === 'V';
  const normaliser = (s, majuscules) => { let t = String(s).replace(/[<>[\]]/g, '').replace(/'/g, '’').replace(/\s+/g, ' ').trim();
    t = t.replace(/\s*\/\s*/g, ' / ').replace(/^\/ |\/$| \/$/g, '').trim();
    return majuscules ? t.toLocaleUpperCase('fr-FR') : t; };
  /* les mots d'une phrase : { n, debut, mot } (la barre « / » et l'espace séparent) */
  const mots = (T) => { const out = []; const re = /[^ /]+/g; let m, n = 0; while ((m = re.exec(T))) out.push({ n: n++, debut: m.index, mot: m[0] }); return out; };
  const auto = (mot) => { const chars = [...mot]; let i = chars.findIndex((c) => FAMILLE_U.includes(c)); if (i < 0) i = chars.indexOf('V'); return i < 0 ? [] : [i]; };
  /* un état de phrase : le texte tapé, et les choix faits à la main (clé : rang du mot et le mot lui-même) */
  const nouvellePhrase = (brut = '') => ({ brut, choix: {} });
  const analyse = (P) => { const T = normaliser(P.brut, true), W = mots(T), verres = new Set();
    W.forEach((w) => { const k = w.n + ':' + w.mot, pos = P.choix[k] || auto(w.mot); pos.forEach((p) => verres.add(w.debut + p)); });
    return { T, W, verres }; };
  /* la phrase avec ses crochets, pour l'adresse du gabarit (JE[U]DI, ON GO[Û]TE.) */
  const avecCrochets = ({ T, verres }) => [...T].map((c, i) => (verres.has(i) ? `[${c}]` : c)).join('');
  /* une phrase de la marque (avec crochets) devient un état de phrase : les verres sont repris tels quels */
  const depuisCrochets = (t) => { let plain = '', v = false; const idx = new Set();
    for (const ch of String(t)) { if (ch === '[') { v = true; continue; } if (ch === ']') { v = false; continue; } if (v) idx.add(plain.length); plain += ch; }
    const P = nouvellePhrase(plain), T = normaliser(plain, true);
    mots(T).forEach((w) => { P.choix[w.n + ':' + w.mot] = [...w.mot].map((_, i) => i).filter((i) => idx.has(w.debut + i)); });
    return P; };
  const basculer = (P, i) => { const A = analyse(P), w = A.W.find((x) => i >= x.debut && i < x.debut + x.mot.length); if (!w || !PEUT(A.T[i])) return 'non';
    const k = w.n + ':' + w.mot, pos = (P.choix[k] || auto(w.mot)).slice(), p = i - w.debut, j = pos.indexOf(p);
    if (j >= 0) pos.splice(j, 1); else { if (pos.length >= R.limites.verresParMot) return 'plein'; pos.push(p); pos.sort((a, b) => a - b); }
    P.choix[k] = pos; return 'ok'; };

  /* ---------- l'état de l'outil ---------- */
  let R = null;
  const MOIS_ICI = () => R.mois[new Date().getMonth()];
  const S = {
    modele: '21-jeudi', format: '4x5', guides: false,
    phrase: { '21-jeudi': depuisCrochets(M.PHRASES.jeudi), '23-arrivage': depuisCrochets('D[U] NO[U]VEAU.') },
    jus: { '21-jeudi': 'maceration', '23-arrivage': 'maceration', '24-phrase': 'maceration' },
    jusVerres: [],                       /* 21 : le jus des verres 2, 3… de la phrase (le premier est le jus du soir) */
    photo: { '21-jeudi': '', '23-arrivage': 'trois-jus' },
    niveau: { '21-jeudi': 0.7, '23-arrivage': 0.42 }, niveauAuto: true,
    fond: { '21-jeudi': 'bleu', '24-phrase': 'tuffeau' },
    ce21: 'carte', mois: '', plein: ['maceration', 'glou', 'paille'],
    voix24: 'dos', texte24: '', ou24: '',
  };
  const estTitre = () => S.modele === '21-jeudi' || S.modele === '23-arrivage';

  /* les paramètres de l'adresse du gabarit, d'après l'état (jamais les guides : ils ne vont pas dans le fichier) */
  function params() { const p = new URLSearchParams(), m = S.modele;
    if (estTitre()) { const A = analyse(S.phrase[m]); p.set('texte', avecCrochets(A)); }
    if (m === '21-jeudi') { const n = analyse(S.phrase[m]).verres.size, j0 = S.jus[m], J = [j0];
      for (let i = 1; i < n; i++) J.push(S.jusVerres[i] || j0);
      p.set('jus', J.join('|')); p.set('niveau', String(S.niveau[m])); if (S.photo[m]) p.set('photo', S.photo[m]); p.set('fond', S.fond[m]); p.set('voix', M.VOIX[S.ce21]); }
    if (m === '22-plein') { p.set('mois', S.mois); p.set('jus', S.plein.join('|')); }
    if (m === '23-arrivage') { p.set('photo', S.photo[m]); p.set('jus', S.jus[m]); if (!S.niveauAuto) p.set('niveau', String(S.niveau[m])); }
    if (m === '24-phrase') { const t = normaliser(S.texte24, false); if (t) { p.set('texte', t); const ou = normaliser(S.ou24, false); if (ou) p.set('ou', ou); } else p.set('voix', S.voix24);
      p.set('fond', S.fond[m]); p.set('jus', S.jus[m]); }
    p.set('format', S.format); return p; }

  /* ce qu'on sait avant de dessiner : vide, trop de mots, aucun verre */
  function avant() { const L = R.limites;
    if (estTitre()) { const A = analyse(S.phrase[S.modele]), nu = A.T.replace(/[/]/g, '').replace(/ +/g, ' ').trim();
      if (!nu) return { ko: 'Tapez une phrase.' };
      if (A.W.length > L.motsTitre || nu.length > L.signesTitre) return { ko: `Trop longue pour ce modèle : ${A.W.length}${NB}mots, ${nu.length}${NB}signes. Visez trois mots et un point.` };
      /* le gabarit ne sait pas faire plus de lignes que son maxL (reseaux/21 : 3 ou 4 ; 23 : 2 ou 3) */
      const maxL = { '21-jeudi': { '4x5': 3, '9x16': 4 }, '23-arrivage': { '4x5': 2, '9x16': 3 } }[S.modele][S.format], lignes = A.T.split('/').filter((s) => s.trim()).length;
      if (lignes > maxL) return { ko: `Trop de coupes « / » : ce modèle tient en ${maxL}${NB}lignes au plus.` };
      if (!A.verres.size) return { info: 'Pas de U ni de V : la phrase n’aura pas de verre. Elle passe quand même.' };
      return {}; }
    if (S.modele === '24-phrase') { const t = normaliser(S.texte24, false); if (t.length > L.signesPhrase) return { ko: `Trop longue pour ce modèle : ${t.length}${NB}signes, ${L.signesPhrase} au plus.` }; }
    return {}; }

  /* la phrase qui sera publiée, telle qu'on la lit (pour le rappel de relecture) */
  function phraseLue() { if (estTitre()) return analyse(S.phrase[S.modele]).T.replace(/ \/ /g, ' ');
    if (S.modele === '24-phrase') return normaliser(S.texte24, false) || M.VOIX[S.voix24];
    return ''; }
  const CONNUES = () => new Set([...Object.values(M.PHRASES).map((t) => normaliser(M.sansCrochets(t), true)), ...Object.values(M.VOIX).map((t) => normaliser(t, true)), 'D[U] NO[U]VEAU.'.replace(/[[\]]/g, '')]);

  /* ---------- construire les réglages ---------- */
  const pastille = (nom, jus, coche, dit = M.NOMS[jus]) => { const E = M.ECHELLES[jus];
    return `<label class="o-pastille"><input type="radio" name="${nom}" value="${jus}" ${coche ? 'checked' : ''}><span><i style="--j0:${E[0]};--j2:${E[2]};--j4:${E[4]}"></i>${esc(dit)}</span></label>`; };

  function construire() {
    /* l'icône de l'onglet : le symbole du socle */
    const sym = M.symbol(M.COULEURS.bleu, '', 'maceration', {}); document.querySelector('link[rel=icon]').href = 'data:image/svg+xml,' + encodeURIComponent(sym.includes('xmlns') ? sym : sym.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'));
    $('#marque').innerHTML = M.wordmark(M.COULEURS.bleu, 'role="img" aria-label="Sillon"', 'maceration', { detail: true });
    $('#mention').textContent = M.MENTION_SANITAIRE;
    $('#modeles').innerHTML = Object.entries(R.modeles).map(([k, m]) => `<label class="o-carte"><input type="radio" name="modele" value="${k}" ${k === S.modele ? 'checked' : ''}><span><b>${esc(m.titre)}</b><small>${esc({ '21-jeudi': 'La dégustation de la semaine', '22-plein': 'Le colis de l’abonnement', '23-arrivage': 'Un jus qui vient d’arriver', '24-phrase': 'Une phrase de comptoir' }[k])}</small></span></label>`).join('');
    $('#formats').innerHTML = Object.entries(R.formats).map(([k, f]) => `<label class="o-format"><input type="radio" name="format" value="${k}" ${k === S.format ? 'checked' : ''}><span><i style="width:${k === '4x5' ? 16 : 13}px;height:${k === '4x5' ? 20 : 23}px"></i><em>${esc(f.dit)}<small>${f.l}${NB}×${NB}${f.h}</small></em></span></label>`).join('');
    $('#mois').innerHTML = R.mois.map((m) => `<option value="${m}">${m.charAt(0).toUpperCase() + m.slice(1)}</option>`).join('');
    S.mois = MOIS_ICI(); $('#mois').value = S.mois;
    $('#ce21').innerHTML = Object.entries(M.VOIX).filter(([, v]) => v.length <= 40).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join(''); $('#ce21').value = S.ce21;
    $('#pretes-titre').innerHTML = [...Object.values(M.PHRASES), 'D[U] NO[U]VEAU.'].filter((t, i, a) => a.indexOf(t) === i).map((t) => `<button type="button" class="o-puce o-puce-titre" data-crochets="${esc(t)}">${M.titre(t, { cls: '' }).replace(/^<span[^>]*>|<\/span>$/g, '')}</button>`).join('');
    $('#pretes-voix').innerHTML = Object.entries(M.VOIX).map(([k, v]) => `<button type="button" class="o-puce" data-voix="${k}" aria-pressed="false">${esc(v)}</button>`).join('');
  }

  /* les blocs qui changent avec le modèle */
  function majReglages() { const m = S.modele;
    document.querySelectorAll('[data-pour]').forEach((el) => { el.hidden = !el.dataset.pour.split(' ').includes(m); });
    /* la phrase */
    if (estTitre()) { const P = S.phrase[m]; if ($('#phrase').value !== P.brut) $('#phrase').value = P.brut; majLettres(); }
    if ($('#phrase24').value !== S.texte24) $('#phrase24').value = S.texte24;
    if ($('#ou24').value !== S.ou24) $('#ou24').value = S.ou24;
    majPuces24();
    /* le jus */
    $('#jus-titre').textContent = { '21-jeudi': 'Le jus du soir', '23-arrivage': 'Le jus arrivé', '24-phrase': 'Le rond du verre' }[m] || 'Le jus';
    if (S.jus[m]) $('#jus').innerHTML = R.jus.map((j) => pastille('jus', j, S.jus[m] === j)).join('');
    majJusVerres();
    $('#jus-plein').innerHTML = [0, 1, 2].map((i) => `<div class="o-sous"><span class="t-etq">Bouteille ${i + 1}</span><div class="o-jus" role="radiogroup" aria-label="Bouteille ${i + 1}">${R.jus.map((j) => pastille('plein' + i, j, S.plein[i] === j)).join('')}</div></div>`).join('');
    /* la photo */
    $('#photo-titre').textContent = m === '21-jeudi' ? 'Dans le grand verre' : 'La photo';
    if (S.photo[m] !== undefined) { const vin = m === '21-jeudi' ? `<label class="o-vignette" title="Du vin"><input type="radio" name="photo" value="" ${S.photo[m] ? '' : 'checked'}><span><em>Du vin</em></span></label>` : '';
      $('#photos').innerHTML = vin + Object.keys(M.PHOTOS).map((k) => `<label class="o-vignette" title="${esc(M.PHOTOS[k].quoi)}"><input type="radio" name="photo" value="${k}" ${S.photo[m] === k ? 'checked' : ''} aria-label="${esc(k)}"><span><img src="${M.photoURL(k)}" alt="" loading="lazy" style="object-position:${M.PHOTOS[k].pos || '50% 50%'}"></span></label>`).join(''); }
    /* le niveau */
    if (S.niveau[m] !== undefined) { $('#niveau').min = m === '23-arrivage' ? 0.12 : 0; $('#niveau').max = m === '23-arrivage' ? 0.75 : 1; $('#niveau').value = S.niveau[m]; }
    $('#niveau-auto').checked = S.niveauAuto; majNiveau();
    /* le fond */
    if (S.fond[m]) $('#fonds').innerHTML = R.modeles[m].fonds.map((f) => `<label class="o-pastille"><input type="radio" name="fond" value="${f}" ${S.fond[m] === f ? 'checked' : ''}><span><i style="--j0:${M.col(f === 'bleu' ? 'bleu' : f)};--j2:${M.col(f)};--j4:${M.col(f)}"></i>${esc({ bleu: 'Bleu de travail', cave: 'Fond de cave (le soir)', tuffeau: 'Tuffeau', craie: 'Craie' }[f])}</span></label>`).join('');
  }
  const majPuces24 = () => document.querySelectorAll('#pretes-voix .o-puce').forEach((b) => b.setAttribute('aria-pressed', String(!normaliser(S.texte24, false) && b.dataset.voix === S.voix24)));
  function majNiveau() { const m = S.modele, auto = m === '23-arrivage' && S.niveauAuto;
    $('.o-niveau').classList.toggle('o-off', auto); $('#niveau').disabled = auto;
    $('#niveau-dit').textContent = auto ? 'auto' : Math.round((S.niveau[m] || 0) * 100) + NB + '%'; }

  /* les lettres de la phrase, à cliquer */
  function majLettres() { const P = S.phrase[S.modele], A = analyse(P), J = jusDesVerres(A.verres.size); let rang = 0;
    const lettre = (c, i) => { if (!PEUT(c)) return `<span aria-hidden="true">${esc(c)}</span>`;
      const v = A.verres.has(i), j = v ? J[rang++] : null;
      return `<button type="button" data-i="${i}" aria-pressed="${v}" ${v ? `style="--j:${M.ECHELLES[j][2]}"` : ''} aria-label="${esc(c)} : ${v ? 'verre, cliquer pour le retirer' : 'cliquer pour en faire un verre'}">${esc(c)}</button>`; };
    /* un mot ne se coupe jamais : chaque mot est un bloc ; la barre « / » force la ligne suivante */
    let html = '', fin = 0; const coupes = [...A.T.matchAll(/\//g)].map((m) => m.index);
    A.W.forEach((w) => { if (coupes.some((c) => c >= fin && c < w.debut)) html += '<span class="o-coupe" aria-hidden="true"></span>';
      html += `<span class="o-mot">${[...w.mot].map((c, k) => lettre(c, w.debut + k)).join('')}</span>`; fin = w.debut + w.mot.length; });
    $('#lettres').innerHTML = html;
    $('#lettres').setAttribute('aria-label', 'Les verres de la phrase ' + A.T); }
  const jusDesVerres = (n) => { const m = S.modele, j0 = S.jus[m]; return Array.from({ length: n }, (_, i) => (m === '21-jeudi' && i > 0 ? S.jusVerres[i] || j0 : j0)); };
  function majJusVerres() { const box = $('#jus-verres'); if (S.modele !== '21-jeudi') { box.innerHTML = ''; return; }
    const A = analyse(S.phrase['21-jeudi']), lettres = [...A.verres].sort((a, b) => a - b).map((i) => A.T[i]), J = jusDesVerres(lettres.length);
    box.innerHTML = lettres.length > 1 ? `<p class="o-aide">Le premier verre de la phrase prend le jus du soir, comme le grand verre. Les autres :</p>` + lettres.slice(1).map((c, k) => `<div class="o-sous"><span class="t-etq">Verre ${k + 2} · ${esc(c)}</span><div class="o-jus" role="radiogroup" aria-label="Verre ${k + 2}">${R.jus.map((j) => pastille('verre' + (k + 1), j, J[k + 1] === j)).join('')}</div></div>`).join('') : ''; }

  /* ---------- l'aperçu : le gabarit dans un cadre, à l'échelle ---------- */
  const AP = { url: '', jeton: 0, cadre: null, controle: null, mention: false, pret: false, erreur: '' };
  let attente = null;
  const rafraichir = (vite) => { clearTimeout(attente); attente = setTimeout(charger, vite ? 0 : 380); majGardes(); };

  function charger() { const pre = avant(), F = R.formats[S.format];
    $('#apercu-dit').textContent = `${R.modeles[S.modele].titre} · ${F.dit} · ${F.l}${NB}×${NB}${F.h}`;
    if (pre.ko) { $('#cadre').classList.add('o-perime'); AP.pret = false; AP.url = ''; $('#rendu').textContent = ''; majGardes(); return; }
    const p = params(); if (S.guides) p.set('guides', '1');
    const url = `../reseaux/${S.modele}.html?${p}`; if (url === AP.url) { majGardes(); return; }
    AP.url = url; AP.pret = false; const j = ++AP.jeton;
    $('#rendu').textContent = 'Le vin coule…';
    const f = document.createElement('iframe'); f.className = 'o-attente'; f.width = F.l; f.height = F.h; f.title = 'Aperçu de la publication'; f.tabIndex = -1; f.setAttribute('aria-hidden', 'true');
    f.addEventListener('load', async () => { let erreur = '';
      try { const w = f.contentWindow; if (!w.pret) throw new Error('pas de pret');
        await Promise.race([w.pret, new Promise((_, ko) => setTimeout(() => ko(new Error('trop long')), 60000))]); } catch (e) { erreur = 'Le modèle n’a pas pu dessiner cette phrase.'; }
      if (j !== AP.jeton) { f.remove(); return; }
      const w = f.contentWindow, norme = (s) => String(s).replace(/\s+/g, ' ').trim().toLocaleLowerCase('fr-FR');
      AP.controle = (w.controle || [])[0] || null; AP.mention = norme(w.document.body.innerText || '').includes(norme(R.mentionSanitaire)); AP.erreur = erreur; AP.pret = true;
      if (AP.cadre && AP.cadre !== f) AP.cadre.remove(); AP.cadre = f; f.classList.remove('o-attente'); $('#cadre').classList.remove('o-perime');
      $('#rendu').textContent = ''; echelle(); majGardes(); });
    f.src = url; $('#cadre').appendChild(f); echelle(); }

  function echelle() { const F = R.formats[S.format], sc = $('#scene'), r = sc.getBoundingClientRect(), s = Math.min((r.width - 4) / F.l, (r.height - 4) / F.h, 1);
    const c = $('#cadre'); c.style.width = Math.floor(F.l * s) + 'px'; c.style.height = Math.floor(F.h * s) + 'px';
    c.querySelectorAll('iframe').forEach((f) => { f.style.transform = `scale(${s})`; }); }

  /* ---------- les garde-fous ---------- */
  function majGardes() { const pre = avant(), m = S.modele, etat = estTitre() ? $('#phrase-etat') : $('#phrase24-etat'); let ko = pre.ko || '', info = pre.info || '';
    if (!ko && AP.pret && AP.url) {
      if (AP.erreur) ko = AP.erreur;
      else if (!AP.mention) ko = 'La mention sanitaire n’apparaît pas : export bloqué.';
      else { const c = AP.controle, seuil = R.seuils[m] && R.seuils[m][S.format], t = c && (c.taille || c.corps);
        if (c && c.tient === false) ko = 'La phrase ne tient pas dans le cadre.';
        else if (seuil && t && t < seuil) ko = `Trop longue pour ce modèle : les lettres tombent à ${Math.round(t)}${NB}px (${seuil} au moins). Raccourcissez, ou coupez avec « / ».`; } }
    ['#phrase-etat', '#phrase24-etat'].forEach((s) => { const e = $(s); e.textContent = ''; e.classList.remove('o-ko'); });
    if (etat) { etat.textContent = ko || MESSAGE.texte || info; etat.classList.toggle('o-ko', !!ko); }
    $('#alerte').hidden = !ko; $('#alerte').textContent = ko;
    const enCours = !AP.pret || AP.url !== urlVoulue();
    $('#exporter').disabled = !!ko || enCours || EXPORT.enCours;
    /* le rappel : toute phrase nouvelle, et celles que le brief désigne, sont à faire relire */
    const lue = phraseLue(), connue = !lue || CONNUES().has(normaliser(lue, true)), sensible = R.aRelire.some((t) => normaliser(t, true) === normaliser(lue, true) || (m === '21-jeudi' && M.VOIX[S.ce21] && M.VOIX[S.ce21].includes(t)));
    $('#relire').innerHTML = !connue ? '<b>Phrase nouvelle.</b> À faire relire avant diffusion : c’est une publicité pour de l’alcool (loi Évin).'
      : sensible ? '<b>Phrase à faire relire</b> avant diffusion (loi Évin) : elle n’a pas encore été vérifiée.'
      : 'Publicité pour de l’alcool : une phrase nouvelle se fait relire avant diffusion.'; }
  const urlVoulue = () => { if (avant().ko) return ''; const p = params(); if (S.guides) p.set('guides', '1'); return `../reseaux/${S.modele}.html?${p}`; };

  /* ---------- l'export : le serveur rend le fichier exact ---------- */
  const EXPORT = { enCours: false };
  /* un message passager (le refus d'un troisième verre) : il reste jusqu'au prochain geste sur la phrase */
  const MESSAGE = { texte: '' };
  async function exporter() { if ($('#exporter').disabled) return; const p = params(); p.set('modele', S.modele);
    EXPORT.enCours = true; majGardes(); $('#statut').textContent = 'Rendu du fichier…';
    try {
      const r = await fetch('/api/export?' + p, { headers: { 'X-Sillon': '1' } });
      if (!r.ok) { $('#statut').textContent = 'Export refusé : ' + (await r.text()); return; }
      const blob = await r.blob(), nom = ((r.headers.get('Content-Disposition') || '').match(/filename="([^"]+)"/) || [])[1] || 'sillon.png';
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nom; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      const F = R.formats[S.format]; $('#statut').textContent = `Enregistré : ${nom} (${F.l}${NB}×${NB}${F.h}), dans le dossier Téléchargements.`;
    } catch (e) { $('#statut').textContent = 'Le serveur ne répond pas. Relancez « ouvrir.bat ».'; }
    finally { EXPORT.enCours = false; majGardes(); } }

  /* ---------- les événements ---------- */
  function brancher() { const form = $('#reglages');
    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('change', (e) => { const t = e.target, n = t.name, m = S.modele;
      if (n === 'modele') { MESSAGE.texte = ''; S.modele = t.value; $('#statut').textContent = ''; majReglages(); rafraichir(true); return; }
      if (n === 'format') S.format = t.value;
      else if (n === 'jus') { S.jus[m] = t.value; if (estTitre()) majLettres(); majJusVerres(); }
      else if (/^verre\d+$/.test(n)) { S.jusVerres[+n.slice(5)] = t.value; majLettres(); }
      else if (/^plein\d$/.test(n)) S.plein[+n.slice(5)] = t.value;
      else if (n === 'photo') S.photo[m] = t.value;
      else if (n === 'fond') S.fond[m] = t.value;
      else if (t.id === 'niveau-auto') { S.niveauAuto = t.checked; majNiveau(); }
      else if (t.id === 'guides') S.guides = t.checked;
      else if (t.id === 'mois') S.mois = t.value;
      else if (t.id === 'ce21') S.ce21 = t.value;
      else return;
      rafraichir(true); });
    $('#niveau').addEventListener('input', (e) => { S.niveau[S.modele] = +e.target.value; majNiveau(); rafraichir(); });
    $('#phrase').addEventListener('input', (e) => { MESSAGE.texte = ''; S.phrase[S.modele].brut = e.target.value; majLettres(); majJusVerres(); rafraichir(); });
    $('#phrase24').addEventListener('input', (e) => { S.texte24 = e.target.value; majPuces24(); rafraichir(); });
    $('#ou24').addEventListener('input', (e) => { S.ou24 = e.target.value; rafraichir(); });
    $('#lettres').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (!b) return; const i = +b.dataset.i;
      const r = basculer(S.phrase[S.modele], i);
      MESSAGE.texte = r === 'plein' ? 'Deux verres par mot au plus : retirez-en un d’abord.' : '';
      majLettres(); majJusVerres(); const nb = $(`#lettres button[data-i="${i}"]`); if (nb) nb.focus(); rafraichir(); });
    $('#pretes-titre').addEventListener('click', (e) => { const b = e.target.closest('[data-crochets]'); if (!b) return;
      S.phrase[S.modele] = depuisCrochets(b.dataset.crochets); $('#phrase').value = S.phrase[S.modele].brut; majLettres(); majJusVerres(); rafraichir(true); });
    $('#pretes-voix').addEventListener('click', (e) => { const b = e.target.closest('[data-voix]'); if (!b) return; S.voix24 = b.dataset.voix; S.texte24 = ''; S.ou24 = ''; majReglages(); rafraichir(true); });
    $('#exporter').addEventListener('click', exporter);
    new ResizeObserver(echelle).observe($('#scene'));
  }

  /* les fonctions pures, pour les tests (outil/tests) */
  window.Remplisseur = { normaliser, analyse, avecCrochets, depuisCrochets, basculer, nouvellePhrase, params: () => params().toString(), etat: S, apercu: AP };

  fetch('regles.json').then((r) => r.json()).then((regles) => { R = regles; construire(); majReglages(); brancher(); rafraichir(true); window.Remplisseur.pret = true; })
    .catch(() => { document.body.insertAdjacentHTML('afterbegin', '<p class="o-alerte" role="alert">Le remplisseur s’ouvre par « ouvrir.bat » (il a besoin de son serveur local).</p>'); });
})();
