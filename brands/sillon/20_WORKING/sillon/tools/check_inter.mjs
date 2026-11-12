// Contrôle des éléments vivants du site du guide : clique, lit l'état, capture dans out/guide/inter-*.png.
// Usage, depuis la racine du projet :  node tools/check_inter.mjs livrables/site/index.html
//
// Ce script ne connaît aucune marque. Il teste la MÉCANIQUE COMMUNE des sites du guide :
//   - navigation : chaque .page s'ouvre par son lien du sommaire (#nav a[href="#<id>"]) ; une ancre de section
//     (data-subs) ouvre sa page et y descend ; le lien « suivant » de .pager mène à la page d'après ;
//   - clavier : Tab atteint un élément, et son focus se voit ;
//   - galerie et visionneuse, si la page a un #gal : filtres (#filters ou #filtres), ouverture de #lb (classe .on),
//     flèche droite, Échap ; focus déplacé dans la visionneuse puis rendu (recommandé : signalé, pas bloquant) ;
//   - version mobile (390 px) : pas de débordement horizontal ; #burger ouvre le sommaire, un lien y mène à sa page
//     et le referme ;
//   - aucune erreur de script ni de console ;
//   - puis les éléments propres au site, déclarés par le site lui-même dans window.GuideTests (format ci-dessous).
//
// FORMAT DE window.GuideTests (défini par le site, par exemple à la fin de assets/guide.js) : un tableau d'objets
//   { nom: 'texte affiché',
//     page: 'ancre à ouvrir avant le test (id d'une .page ou d'une section)',
//     actions: [ { clic: 'sélecteur' }
//              | { remplir: 'sélecteur', valeur: 'texte' }          // champ texte ou curseur (événement input envoyé)
//              | { choisir: 'sélecteur', valeur: 'valeur' }         // <select>
//              | { touche: 'ArrowRight', sur: 'sélecteur' }         // sur : élément à qui donner le focus d'abord
//              | { attendre: 300 } ],                               // millisecondes
//     verifie: () => true | false,     // exécutée dans la page après les actions ; peut être async ; peut lire
//                                      // navigator.clipboard.readText() (droits accordés par ce script)
//     capture: 'sélecteur' }           // facultatif : capture de cet élément dans out/guide/inter-<n>.png
// La page est rechargée avant chaque test : un test ne dépend pas du précédent.
// Sortie : une ligne par contrôle (OK, ÉCHEC, ATTENTION, —) ; code de sortie 1 s'il y a au moins un ÉCHEC.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const cible = process.argv[2];
if (!cible) { console.error('Usage : node tools/check_inter.mjs livrables/site/index.html'); process.exit(2); }
const url = cible.startsWith('http') ? cible.replace(/#.*$/, '') : pathToFileURL(path.resolve(cible)).href;
const OUT = 'out/guide'; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
const p = await ctx.newPage(); p.setDefaultTimeout(5000);
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

let echecs = 0, attentions = 0;
const ok = (nom, cond, detail = '') => { if (!cond) echecs++; console.log((cond ? 'OK        ' : 'ÉCHEC     ') + nom + (detail ? ' · ' + detail : '')); };
const attention = (nom, cond, detail = '') => { if (!cond) attentions++; console.log((cond ? 'OK        ' : 'ATTENTION ') + nom + (detail ? ' · ' + detail : '')); };
const note = (nom) => console.log('—         ' + nom);
const ev = (f, a) => p.evaluate(f, a);
const va = async (h, recharger = false) => { if (recharger) await p.goto('about:blank'); await p.goto(url + (h ? '#' + h : '')); await p.waitForTimeout(400); };
const surPage = () => ev(() => (document.querySelector('.page.on') || {}).id || '');
/* Un élément est « à l'écran » s'il est affiché, non masqué et dans la fenêtre */
const aLEcran = (sel) => ev((s) => { const e = document.querySelector(s); if (!e) return false; const cs = getComputedStyle(e), r = e.getBoundingClientRect();
  return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && r.width > 0 && r.right > 1 && r.left < innerWidth - 1; }, sel);

await va('');
await p.evaluate(() => document.fonts.ready);
const pages = await ev(() => [...document.querySelectorAll('.page')].map((e) => ({ id: e.id, subs: (e.dataset.subs || '').split('|').filter(Boolean).map((s) => s.split(':')[0]) })));
ok('pages .page trouvées', pages.length > 0, pages.map((x) => x.id).join(', '));
if (!pages.length) { await b.close(); process.exit(1); }

/* ---------- 1. Navigation ---------- */
for (const pg of pages) {
  const sel = `#nav a[href="#${pg.id}"]`;
  if (!(await p.$(sel))) { ok(`sommaire : lien vers #${pg.id}`, false, 'introuvable'); continue; }
  await p.click(sel); await p.waitForTimeout(250);
  ok(`sommaire → ${pg.id}`, (await surPage()) === pg.id);
}
const avecSous = pages.find((x, i) => i > 0 && x.subs.length) || pages.find((x) => x.subs.length);
if (avecSous) {
  const s = avecSous.subs[avecSous.subs.length - 1];
  await va(pages[0].id); await va(s);
  const vu = await ev((id) => { const e = document.getElementById(id); if (!e) return false; const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }, s);
  ok(`sous-ancre #${s} ouvre ${avecSous.id}`, (await surPage()) === avecSous.id && vu, await ev(() => 'scrollY=' + Math.round(scrollY)));
} else note('aucune ancre de section (data-subs) : sous-ancre non testée');
if (pages.length > 1) {
  await va(pages[0].id);
  if (await p.$('.page.on .pager a:last-child')) { await p.click('.page.on .pager a:last-child'); await p.waitForTimeout(300); ok('pager : suivant', (await surPage()) === pages[1].id, await surPage()); }
  else ok('pager : lien suivant sur la première page', false, 'introuvable (.page.on .pager a)');
}

/* ---------- 2. Clavier ---------- */
await va(pages[0].id, true);
await p.keyboard.press('Tab');
const f1 = await ev(() => { const a = document.activeElement; if (!a || a === document.body) return null; const cs = getComputedStyle(a);
  return { el: a.tagName.toLowerCase() + (a.getAttribute('href') ? `[href="${a.getAttribute('href')}"]` : a.id ? '#' + a.id : ''), vu: cs.outlineStyle !== 'none' || cs.boxShadow !== 'none' }; });
ok('clavier : Tab atteint un élément', !!f1, f1 ? f1.el : 'focus resté sur la page');
if (f1) attention('clavier : le focus se voit', f1.vu, f1.el);

/* ---------- 3. Galerie et visionneuse ---------- */
const galPage = await ev(() => { const g = document.querySelector('#gal'); return g ? (g.closest('.page') || {}).id || '' : null; });
if (galPage === null) note('pas de #gal : galerie et visionneuse non testées');
else {
  await va(galPage);
  const ITEMS = '#gal button, #gal a, #gal [role="button"]';
  const nb = () => ev((s) => document.querySelectorAll(s).length, ITEMS);
  const n = await nb();
  const fsel = (await p.$('#filters')) ? '#filters' : (await p.$('#filtres')) ? '#filtres' : null;
  if (fsel && n && (await ev((s) => document.querySelectorAll(s + ' button').length, fsel)) > 1) {
    await p.click(`${fsel} button:last-child`); await p.waitForTimeout(250); const m = await nb();
    ok('galerie : filtre par section', m > 0 && m <= n, `${m} sur ${n}`);
    await p.click(`${fsel} button:first-child`); await p.waitForTimeout(250);
  } else note('filtres non testés (pas de #filters, une seule section ou galerie vide)');
  if (!n) attention('galerie : au moins un média', false, 'galerie vide (aucune planche assemblée) : visionneuse non testée');
  else {
    await p.locator(ITEMS).first().click(); await p.waitForTimeout(400);
    ok('visionneuse : ouverte (#lb.on)', await ev(() => document.querySelector('#lb').classList.contains('on')));
    attention('visionneuse : focus dedans', await ev(() => document.querySelector('#lb').contains(document.activeElement)));
    await p.screenshot({ path: path.join(OUT, 'inter-visionneuse.png') });
    if (n > 1) {
      const h0 = await ev(() => document.querySelector('#lb').innerHTML);
      await p.keyboard.press('ArrowRight'); await p.waitForTimeout(250);
      ok('visionneuse : flèche droite', await ev((h) => document.querySelector('#lb').classList.contains('on') && document.querySelector('#lb').innerHTML !== h, h0));
    }
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok('visionneuse : Échap ferme', await ev(() => !document.querySelector('#lb').classList.contains('on')));
    attention('visionneuse : focus rendu à la galerie', await ev(() => !!document.activeElement.closest('#gal')));
  }
}

/* ---------- 4. Éléments déclarés par le site (window.GuideTests) ---------- */
await va(pages[0].id, true);
const tests = await ev(() => (Array.isArray(window.GuideTests) ? window.GuideTests : []).map((t) => ({ nom: t.nom, page: t.page, actions: t.actions || [], capture: t.capture || null })));
if (!tests.length) note('aucun window.GuideTests : seuls les contrôles communs ont tourné');
for (let i = 0; i < tests.length; i++) {
  const t = tests[i];
  try {
    await va(t.page || '', true);
    for (const a of t.actions) {
      if (a.clic) await p.click(a.clic);
      else if (a.remplir) { await p.fill(a.remplir, String(a.valeur)); await p.dispatchEvent(a.remplir, 'input'); }
      else if (a.choisir) await p.selectOption(a.choisir, String(a.valeur));
      else if (a.touche) { if (a.sur) await p.focus(a.sur); await p.keyboard.press(a.touche); }
      else if (a.attendre) await p.waitForTimeout(a.attendre);
    }
    await p.waitForTimeout(200);
    const r = await ev(async (k) => { try { return (await window.GuideTests[k].verifie()) === true ? true : 'vérification fausse'; } catch (e) { return 'erreur : ' + e.message; } }, i);
    ok(t.nom, r === true, r === true ? '' : r);
    if (t.capture) await p.locator(t.capture).first().screenshot({ path: path.join(OUT, `inter-${String(i + 1).padStart(2, '0')}.png`) });
  } catch (e) { ok(t.nom, false, e.message.split('\n')[0]); }
}

/* ---------- 5. Version mobile (390 px) ---------- */
await p.setViewportSize({ width: 390, height: 800 });
const dernier = pages[pages.length - 1].id;
await va(pages[0].id, true);
const sw = await ev(() => document.documentElement.scrollWidth);
ok('mobile : pas de débordement horizontal', sw <= 390, 'largeur ' + sw);
if (await p.$('#burger')) {
  ok('mobile : sommaire fermé au départ', !(await aLEcran('#nav')));
  await p.click('#burger'); await p.waitForTimeout(450);
  const exp = await p.getAttribute('#burger', 'aria-expanded');
  ok('mobile : #burger ouvre le sommaire', (await aLEcran('#nav')) && exp !== 'false', exp === null ? 'sans aria-expanded' : 'aria-expanded=' + exp);
  attention('mobile : #burger annonce son état (aria-expanded)', exp !== null);
  await p.screenshot({ path: path.join(OUT, 'inter-mobile-nav.png') });
  await p.click(`#nav a[href="#${dernier}"]`); await p.waitForTimeout(450);
  ok('mobile : un lien du sommaire mène à sa page et le referme', (await surPage()) === dernier && !(await aLEcran('#nav')), await surPage());
} else note('pas de #burger : sommaire mobile non testé');

ok('aucune erreur de script ni de console', errs.length === 0, errs.slice(0, 5).join(' | '));
console.log(`\n${echecs} échec(s), ${attentions} point(s) d'attention.`);
process.exitCode = echecs ? 1 : 0;
await b.close();
