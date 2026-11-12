// Contrôle des éléments vivants du guide de Custom (livrables/site/index.html) : clique, lit l'état, capture dans out/guide/inter-*.png.
// Usage : node tools/check_inter.mjs livrables/site/index.html
import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const OUT = 'out/guide'; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
const url = pathToFileURL(path.resolve(process.argv[2])).href;
const ok = (nom, cond, detail = '') => console.log((cond ? 'OK   ' : 'ÉCHEC') + ' ' + nom + (detail ? ' · ' + detail : ''));
const ev = (f, a) => p.evaluate(f, a);
const shot = (sel, nom) => p.locator(sel).first().screenshot({ path: path.join(OUT, 'inter-' + nom + '.png') });
const va = async (h) => { await p.goto(url + '#' + h); await p.waitForTimeout(500); };

// Accueil : le sprite tourne à 8 images par seconde
await va('accueil'); await p.evaluate(() => document.fonts.ready);
const h1 = await p.textContent('#hero-n'); await p.waitForTimeout(260); const h2 = await p.textContent('#hero-n');
ok('sprite de l’accueil animé', h1 !== h2, `${h1} puis ${h2}`);

// Logo : sous-ancre, fonds, zone de protection, curseur de construction
await va('construction');
ok('sous-ancre #construction', await ev(() => document.querySelector('.page.on').id === 'logo' && scrollY > 500), await ev(() => 'scrollY=' + Math.round(scrollY)));
await p.goto(url + '#versions'); await p.waitForTimeout(300);
await p.click('#stage-sw button:nth-child(4)'); await p.click('#zone-bt');
ok('fond violet + zone de protection', await ev(() => document.querySelector('#stage').dataset.fond === 'violet' && document.querySelector('#stage').classList.contains('gd-zone-on')));
await shot('#stage', 'logo-violet-zone');
await p.click('#stage-sw button:nth-child(6)'); await p.waitForTimeout(300); await shot('#stage', 'logo-photo');
await p.goto(url + '#construction'); await p.waitForTimeout(300); await p.fill('#ecart', '100'); await p.dispatchEvent('#ecart', 'input');
ok('construction décomposée', await ev(() => /translate\((?!0 )/.test(document.querySelector('#construction-vu').innerHTML)));
await shot('.gd-construction', 'construction');

// Couleurs : copie, testeur de contraste
await va('couleurs'); await p.click('#bands .bande:nth-child(2)'); await p.waitForTimeout(150);
ok('copie du fluo', (await ev(() => navigator.clipboard.readText())) === '#E2FF21', await p.textContent('#toast'));
await p.selectOption('#ct-texte', 'blanc'); await p.selectOption('#ct-fond', 'fluo');
ok('contraste blanc sur fluo refusé', /jamais de blanc/i.test(await p.textContent('#ct-verdict')), (await p.textContent('#ct-r')).replace(/\s+/g, ' '));
await p.click('#ct-inverser'); ok('inverser', (await p.inputValue('#ct-texte')) === 'fluo');
await shot('.gd-testeur', 'contraste');

// Typographie : testeur du surligneur
await va('surligneur'); await p.fill('#sl-txt', 'On fait plus qu’un maillot'); await p.waitForTimeout(100);
await p.click('#sl-mots button:nth-child(4)'); await p.click('#sl-mots button:nth-child(5)');
await p.click('#sl-c button:nth-child(2)'); await p.click('#sl-a button:nth-child(2)');
const sl = await ev(() => { const s = document.querySelector('#sl-vu .surl'); return s.className + ' | ' + s.textContent; });
ok('surligneur : groupe, violet, monte', sl === 'surl violet monte | qu’un maillot', sl);
await p.click('#sl-copier'); ok('copie du HTML', (await ev(() => navigator.clipboard.readText())).includes('surl violet monte'));
await shot('.gd-sl', 'surligneur');

// Le bloc : lecteur de sprites, générateur de chiffres
await va('sprites'); await p.click('#sp-nom button:nth-child(3)');
const s1 = await p.textContent('#sp-n'); await p.waitForTimeout(400); const s2 = await p.textContent('#sp-n');
ok('lecteur : dunk en lecture', s1 !== s2 && / \/ 08$/.test(s2), `${s1} puis ${s2}`);
await p.click('#sp-lire'); const s3 = await p.textContent('#sp-n'); await p.waitForTimeout(400);
ok('pause', s3 === await p.textContent('#sp-n'));
await p.click('#sp-suiv'); ok('image suivante', (await p.textContent('#sp-n')) !== s3, await p.textContent('#sp-n'));
await p.focus('#sp-zone'); await p.keyboard.press('ArrowLeft'); ok('clavier : image précédente', (await p.textContent('#sp-n')) === s3);
await shot('.gd-lecteur', 'lecteur');
await p.fill('#px-txt', '+500 Projets'); await p.waitForTimeout(100);
ok('chiffres en blocs', await ev(() => !!document.querySelector('#px-vu svg')), (await p.textContent('#px-ecart')).trim());
await shot('.gd-pix', 'pix');

// Matières : coulure à graine
await va('coulure'); const d1 = await ev(() => document.querySelector('#cl-vu path').getAttribute('d').length);
await p.click('#cl-c button:nth-child(2)'); await p.click('#cl-f button:nth-child(3)'); await p.fill('#cl-seed', '42'); await p.dispatchEvent('#cl-seed', 'input');
const d2 = await ev(() => document.querySelector('#cl-vu path').getAttribute('d').length);
ok('coulure : graine, couleur, forme', d1 !== d2 && /seed: 42/.test(await p.textContent('#cl-code')), await p.textContent('#cl-code'));
await shot('.gd-gen', 'coulure');

// Photo : choix, traitement, couleur, masques
await va('traitements'); await p.click('#ph-liste button[data-k="moto"]'); await p.click('#ph-mode button:nth-child(5)'); await p.click('#ph-c button:nth-child(3)');
await p.waitForTimeout(600);
ok('photo tramée orange', await ev(() => { const ph = document.querySelector('#ph-vu .ph'); return ph.classList.contains('tr') && /moto\.jpg$/.test(ph.querySelector('img').src) && ph.getAttribute('style').includes('#FE3600'); }), await p.textContent('#ph-code'));
await shot('.gd-ph', 'photo-trame'); await p.click('#ph-mode button:nth-child(6)'); await p.waitForTimeout(400); await shot('#ph-vu', 'photo-seuil');
ok('masques suivent la photo', await ev(() => [...document.querySelectorAll('#masques-grille img')].every((i) => /moto\.jpg$/.test(i.src))));
await shot('#masques-grille', 'masques');

// Techniques : onglets, tissu, curseur de fabrication
await va('techniques'); await p.waitForTimeout(800);
const px = () => ev(() => { const c = document.querySelector('#tq-cv'), x = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < x.length; i += 4 * 97) s += x[i] + x[i + 1]; return s; });
const a = await px(); await p.click('#tq-tabs [role="tab"]:nth-child(1)'); await p.click('#tq-tissu button:nth-child(4)');
await p.fill('#tq-p', '35'); await p.dispatchEvent('#tq-p', 'input'); await p.waitForTimeout(700); const bb = await px();
ok('techniques : sérigraphie, molleton, p = 0,35', a !== bb && (await p.getAttribute('#tq-tabs [role="tab"]:nth-child(1)', 'aria-selected')) === 'true', await p.getAttribute('#tq-cv', 'aria-label'));
await shot('.gd-tq', 'techniques');
await p.focus('#tq-tabs [role="tab"]:nth-child(1)'); await p.keyboard.press('ArrowRight'); ok('onglets au clavier', (await p.getAttribute('#tq-tabs [role="tab"]:nth-child(2)', 'aria-selected')) === 'true');

// Supports : filtres, visionneuse
await va('supports'); await p.click('#filters button:nth-child(3)'); const n3 = await ev(() => document.querySelectorAll('#gal button').length);
ok('filtre par section', n3 > 0 && n3 < (await ev(() => window.GuideGalerie.length)), n3 + ' médias');
await p.click('#gal button:nth-child(2)'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300);
ok('visionneuse', await ev(() => document.querySelector('#lb').classList.contains('on')), await p.textContent('#lb-n'));
await p.waitForTimeout(400); await p.screenshot({ path: path.join(OUT, 'inter-visionneuse.png') });
await p.keyboard.press('Escape'); ok('fermée', await ev(() => !document.querySelector('#lb').classList.contains('on')));
await p.click('.page.on .pager a:last-child'); await p.waitForTimeout(300); ok('suivant', (await ev(() => document.querySelector('.page.on').id)) === 'telecharger');
await p.click('#copier-variables'); ok('variables copiées', (await ev(() => navigator.clipboard.readText())).includes('--fluo: #E2FF21'));

// Mobile : sommaire replié
await p.setViewportSize({ width: 390, height: 800 }); await va('logo');
ok('mobile : sommaire caché', await ev(() => getComputedStyle(document.querySelector('#sommaire')).visibility === 'hidden'));
await p.click('#burger'); await p.waitForTimeout(400); await p.screenshot({ path: path.join(OUT, 'inter-mobile-nav.png') });
ok('mobile : sommaire ouvert', (await p.getAttribute('#burger', 'aria-expanded')) === 'true');
await p.click('#nav a[data-p="couleurs"]'); await p.waitForTimeout(300); ok('mobile : navigation', (await ev(() => document.querySelector('.page.on').id)) === 'couleurs' && (await p.getAttribute('#burger', 'aria-expanded')) === 'false');
console.log('erreurs :', errs.length ? errs : 'aucune'); await b.close();
