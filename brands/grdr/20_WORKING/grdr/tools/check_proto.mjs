// Contrôle du prototype navigable (site/prototype.html) : chaque écran s'ouvre, la barre latérale mène au bon écran,
// une ligne de projet ouvre la fiche, le sélecteur atteint la connexion et le téléphone. Captures dans out/guide/proto-*.png.
// Usage, depuis la racine du projet :  node tools/check_proto.mjs livrables/site/prototype.html
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const cible = process.argv[2] || 'livrables/site/prototype.html';
const url = pathToFileURL(path.resolve(cible)).href;
const OUT = 'out/guide'; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.setDefaultTimeout(5000);
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
/* Une image dont l'écran est remplacé avant la fin du chargement est « abandonnée » : ce n'est pas un fichier manquant */
p.on('requestfailed', (r) => { const f = (r.failure() || {}).errorText || ''; if (!/ERR_ABORTED/.test(f)) errs.push('REQ ' + r.url().split('/').slice(-2).join('/') + ' ' + f); });
let echecs = 0;
const ok = (nom, cond, detail = '') => { if (!cond) echecs++; console.log((cond ? 'OK        ' : 'ÉCHEC     ') + nom + (detail ? ' · ' + detail : '')); };
const courant = () => p.evaluate(() => window.Prototype.courant());

await p.goto(url); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
const ecrans = await p.evaluate(() => window.Prototype.ecrans);
ok('écrans proposés', ecrans.length > 0, ecrans.join(', '));
ok('écran de départ', (await courant()) === ecrans[0], await courant());
ok('mise à l’échelle : pas de débordement horizontal', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 1440);

/* Chaque écran s'ouvre par le sélecteur, sans erreur, avec du contenu */
for (const n of ecrans) {
  await p.selectOption('#proto-ecran', n); await p.waitForTimeout(250);
  const etat = await p.evaluate(() => ({ c: window.Prototype.courant(), h: document.querySelector('#proto').innerHTML.length, r: !!document.querySelector('#proto .dj, #proto .djm'), sw: document.documentElement.scrollWidth, w: innerWidth }));
  ok(`sélecteur → ${n}`, etat.c === n && etat.r && etat.h > 2000 && etat.sw <= etat.w, `${etat.h} caractères`);
}

/* La barre latérale : chaque libellé mène à l'écran attendu, s'il existe */
const NAV = [['Tableau de bord', 'tableauDeBord'], ['Projets', 'projets'], ['Ressources humaines', 'rh'], ['Extractions Sage', 'sage'], ['Statistiques', 'stats'], ['Journal', 'journal'], ['Administration', 'admin']];
await p.selectOption('#proto-ecran', ecrans[0]); await p.waitForTimeout(250);
for (const [libelle, nom] of NAV) {
  if (!ecrans.includes(nom)) { console.log('—         barre latérale : « ' + libelle + ' » sans écran livré'); continue; }
  await p.locator('#proto .dj-nav a', { hasText: libelle }).first().click(); await p.waitForTimeout(250);
  ok(`barre latérale : « ${libelle} » → ${nom}`, (await courant()) === nom, await courant());
}

/* Une ligne de projet, puis « Voir les 12 projets » */
if (ecrans.includes('ficheProjet')) {
  await p.selectOption('#proto-ecran', ecrans.includes('projets') ? 'projets' : 'tableauDeBord'); await p.waitForTimeout(250);
  await p.locator('#proto tr[data-va="ficheProjet"]').first().click(); await p.waitForTimeout(250);
  ok('ligne de projet → fiche projet', (await courant()) === 'ficheProjet', await courant());
  await p.screenshot({ path: path.join(OUT, 'proto-fiche.png') });
}
if (ecrans.includes('projets') && ecrans.includes('tableauDeBord')) {
  await p.selectOption('#proto-ecran', 'tableauDeBord'); await p.waitForTimeout(250);
  await p.locator('#proto .dj-lien', { hasText: 'Voir les' }).first().click(); await p.waitForTimeout(250);
  ok('« Voir les 12 projets » → projets', (await courant()) === 'projets', await courant());
}

/* Adresse directe, puis téléphone */
if (ecrans.includes('connexion')) { await p.goto(url + '#connexion'); await p.reload(); await p.waitForTimeout(400); ok('adresse directe #connexion', (await courant()) === 'connexion'); await p.screenshot({ path: path.join(OUT, 'proto-connexion.png') }); }
const tel = ecrans.find((n) => /^m[A-Z]/.test(n));
if (tel) { await p.selectOption('#proto-ecran', tel); await p.waitForTimeout(300);
  ok('téléphone : ' + tel, await p.evaluate(() => !!document.querySelector('#proto .phone .djm')));
  await p.screenshot({ path: path.join(OUT, 'proto-telephone.png') });
  await p.setViewportSize({ width: 390, height: 800 }); await p.waitForTimeout(300);
  ok('téléphone, fenêtre de 390 px : pas de débordement', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 390, 'largeur ' + (await p.evaluate(() => document.documentElement.scrollWidth)));
}
ok('aucune erreur de script ni de console', errs.length === 0, errs.slice(0, 4).join(' | '));
console.log(`\n${echecs} échec(s).`);
process.exitCode = echecs ? 1 : 0;
await b.close();
