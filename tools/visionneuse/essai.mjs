// Essai de la visionneuse dans Chrome, piloté par le protocole DevTools.
//   node tools/visionneuse/essai.mjs <url de index.html> <dossier des captures> [mobile]
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [URL0, SHOTS, MODE] = process.argv.slice(2);
const mobile = MODE === 'mobile';
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn('google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
  '--autoplay-policy=no-user-gesture-required', `--remote-debugging-port=${port}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'essai-'))}`, 'about:blank'], { stdio: 'ignore' });
const dort = (ms) => new Promise((r) => setTimeout(r, ms));
let cible;
for (let i = 0; i < 50 && !cible; i++) {
  await dort(200);
  try { cible = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); } catch {}
}
const ws = new WebSocket(cible.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0; const attente = new Map(); const erreurs = [], rates = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && attente.has(m.id)) { attente.get(m.id)(m.result || m); attente.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') erreurs.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erreurs.push(m.params.args.map((a) => a.value).join(' '));
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) rates.push(m.params.response.status + ' ' + m.params.response.url);
  if (m.method === 'Network.loadingFailed' && !m.params.canceled && m.params.errorText !== 'net::ERR_ABORTED') rates.push(m.params.errorText + ' ' + m.params.requestId);
};
const cdp = (method, params = {}) => new Promise((r) => { attente.set(++n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const js = async (expr) => { const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(expr + ' → ' + r.exceptionDetails.text); return r.result.value; };
const photo = async (nom) => { const r = await cdp('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(SHOTS, nom + '.png'), Buffer.from(r.data, 'base64')); };
const clic = async (sel) => {
  const b = await js(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()`);
  if (!b) throw new Error('introuvable : ' + sel);
  await dort(80);
  if (mobile) {
    await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b[0], y: b[1] }] });
    await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: b[0], y: b[1] });
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: b[0], y: b[1], button: 'left', clickCount: 1 });
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: b[0], y: b[1], button: 'left', clickCount: 1 });
  }
  await dort(450);
};
const touche = async (key, code) => { for (const type of ['keyDown', 'keyUp']) await cdp('Input.dispatchKeyEvent', { type, key, code: code || key, windowsVirtualKeyCode: { ArrowRight: 39, ArrowLeft: 37, Escape: 27, End: 35, Home: 36 }[key] }); await dort(350); };
const res = []; const ok = (nom, cond, detail = '') => { res.push([cond ? 'ok ' : 'ÉCHEC', nom, detail]); };
const images = () => js(`(async()=>{await new Promise(r=>setTimeout(r,900));const v=[...document.querySelectorAll('img')].filter(i=>{const r=i.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&r.width>0});return [v.length,v.filter(i=>!(i.complete&&i.naturalWidth>0)).map(i=>i.src.slice(0,90))]})()`);

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable');
await cdp('Emulation.setDeviceMetricsOverride', mobile ? { width: 390, height: 844, deviceScaleFactor: 2, mobile: true } : { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
if (mobile) await cdp('Emulation.setTouchEmulationEnabled', { enabled: true });
else await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'hover' }, { name: 'pointer', value: 'fine' }] });
const P = mobile ? 'm-' : '';

await cdp('Page.navigate', { url: URL0 }); await dort(2500);
ok('index : 7 rangs', await js(`document.querySelectorAll('.rang').length`) === 7);
ok('index : 197 vignettes', await js(`document.querySelectorAll('.bande a').length`) === 197);
let [vus, casses] = await images(); ok(`index : images visibles chargées (${vus})`, (mobile || vus > 4) && !casses.length, casses.join(', '));
ok('index : pas de débordement horizontal', await js(`document.documentElement.scrollWidth<=innerWidth`));
await photo(P + '1-index');
await js(`scrollTo(0,700)`); await dort(700); await photo(P + '2-index-bas');

// une pièce depuis l'index, flèches, fermeture
await clic('.rang:nth-of-type(2) .bande a:nth-child(2)');
ok('visionneuse ouverte depuis l’index', await js(`!!document.querySelector('.visio')&&location.hash`) === '#payout/2', await js('location.hash'));
const defil = await js('scrollY');
await touche('ArrowRight'); ok('flèche droite → pièce 3', await js('location.hash') === '#payout/3');
await touche('ArrowLeft'); await touche('ArrowLeft'); ok('flèche gauche ×2 → pièce 1', await js('location.hash') === '#payout/1');
await touche('End'); ok('Fin → dernière pièce', await js('location.hash') === '#payout/41');
await dort(600); await photo(P + '3-visio');
await touche('Escape');
ok('Échap : retour à l’index, défilement gardé', await js(`!document.querySelector('.visio')&&location.hash===''&&!!document.querySelector('.rang')&&Math.abs(scrollY-${defil})<3`), await js('location.hash+" "+scrollY'));

// dossier
await clic('.rang:nth-of-type(5) .fiche');
ok('dossier Sillon', await js(`location.hash==='#sillon'&&document.querySelectorAll('.tuile').length`) === 36);
ok('dossier : thème de la marque', (await js(`getComputedStyle(document.querySelector('.dossier')).backgroundColor`)) === 'rgb(33, 70, 208)');
ok('dossier : en haut de page', await js('scrollY') === 0);
[vus, casses] = await images(); ok(`dossier : images visibles chargées (${vus})`, (mobile || vus > 3) && !casses.length, casses.join(', '));
ok('mur : chaque ligne remplit la largeur', await js(`(()=>{const m=document.querySelector('.mur'),L=m.clientWidth-2*parseFloat(getComputedStyle(m).paddingLeft);const l={};[...m.children].forEach(e=>{const r=e.getBoundingClientRect();(l[Math.round(r.top)]=l[Math.round(r.top)]||[]).push(r)});const k=Object.keys(l);return k.slice(0,-1).every(t=>Math.abs(l[t].reduce((s,r)=>s+r.width,0)+6*(l[t].length-1)-L)<1.5)&&document.documentElement.scrollWidth<=innerWidth})()`));
await photo(P + '4-dossier');
await clic('.tri button[data-f=v]');
ok('filtre vidéos : 8 tuiles', await js(`[...document.querySelectorAll('.tuile')].filter(e=>!e.hidden).length`) === 8);
if (!mobile) {
  const b = await js(`(()=>{const r=document.querySelector('.tuile[data-k=v]:not([hidden])').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()`);
  await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: b[0], y: b[1] }); await dort(1500);
  ok('survol : la vidéo se lit', await js(`(()=>{const v=document.querySelector('.tuile video');return !!v&&!v.paused&&v.currentTime>0})()`));
  await photo('5-filtre-video');
}
await clic('.tuile[data-k=v]:not([hidden])'); await dort(1200);
ok('visionneuse vidéo en lecture', await js(`(()=>{const v=document.querySelector('.visio video');return !!v&&!v.paused&&v.currentTime>0&&v.videoWidth>0})()`), await js('location.hash'));
ok('vidéo : tient dans la scène', await js(`(()=>{const s=document.querySelector('.visio .scene').getBoundingClientRect(),v=document.querySelector('.visio video').getBoundingClientRect();return v.width<=s.width+1&&v.height<=s.height+1})()`));
await photo(P + '6-visio-video');
await clic('.visio .fermer');
ok('fermer : retour au dossier', await js(`!document.querySelector('.visio')&&location.hash==='#sillon'&&!!document.querySelector('.dossier')`), await js('location.hash'));
await clic('.tri button[data-f=""]');

// planche haute : largeur puis ajustée
await clic('.tuile[data-j="3"]'); await dort(900);
ok('planche haute : ouverte à la largeur, défile', await js(`(()=>{const s=document.querySelector('.visio .scene');return s.classList.contains('large')&&s.scrollHeight>s.clientHeight+50})()`));
ok('pleine définition chargée', await js(`document.querySelector('.visio img.media').naturalWidth`) >= 1600, String(await js(`document.querySelector('.visio img.media').naturalWidth`)));
await clic('.visio img.media');
ok('clic : planche entière à l’écran', await js(`(()=>{const s=document.querySelector('.visio .scene');return !s.classList.contains('large')&&s.scrollHeight<=s.clientHeight+1})()`));
await photo(P + '7-visio-haute');
await cdp('Page.navigateToHistoryEntry', { entryId: (await cdp('Page.getNavigationHistory')).entries.at(-2).id }); await dort(500);
ok('retour du navigateur : ferme la visionneuse', await js(`!document.querySelector('.visio')&&location.hash==='#sillon'`), await js('location.hash'));

// documents
await js('scrollTo(0,0)'); await clic('.actions .btn.p'); await dort(1800);
const src = await js(`document.querySelector('.doc iframe')?.getAttribute('src')`);
ok('guide ouvert dans la page', !!src && await js('location.hash') === '#sillon/guide', src);
ok('guide : contenu chargé', await js(`(()=>{try{return document.querySelector('.doc iframe').contentDocument.title}catch(e){return 'autre origine'}})()`) !== '', await js(`(()=>{try{return document.querySelector('.doc iframe').contentDocument.title}catch(e){return 'autre origine'}})()`));
await photo(P + '8-guide');
await clic('.doc nav a:nth-child(3)'); await dort(1200);
ok('onglet étude de cas', await js(`location.hash==='#sillon/etude'&&document.querySelector('.doc iframe').getAttribute('src')`).then((s) => String(s).includes('etude-de-cas.html')));
await js(`(()=>{try{document.querySelector('.doc iframe').contentWindow.location.hash='essai'}catch(e){}})()`); await dort(300);
await clic('.doc .retour'); await dort(400);
ok('retour au dossier', await js(`!document.querySelector('.doc')&&location.hash==='#sillon'&&!document.documentElement.classList.contains('verrou')`), await js('location.hash'));

// vitrines : vignettes intégrées, film avec son
await clic('#onglets a[data-id=maillon]'); await dort(600);
ok('dossier Maillon : 9 pièces', await js(`document.querySelectorAll('.tuile').length`) === 9);
[vus, casses] = await images(); ok(`Maillon : vignettes intégrées (${vus})`, (mobile || vus >= 4) && !casses.length, casses.join(', '));
await photo(P + '9-maillon');
await clic('.tuile[data-j="8"]'); await dort(2500);
ok('film Maillon en lecture', await js(`(()=>{const v=document.querySelector('.visio video');return !!v&&!v.paused&&v.currentTime>0})()`));
await touche('Escape');
await clic('.suite a:nth-child(2)'); await dort(500);
ok('projet suivant après le dernier : Aube', await js('location.hash') === '#aube');
await clic('.griffe'); await dort(500);
ok('logo : retour à l’index', await js(`location.hash===''&&document.querySelectorAll('.rang').length===7`));

// lien direct vers une pièce
await cdp('Page.navigate', { url: 'about:blank' }); await dort(300);
await cdp('Page.navigate', { url: URL0 + '#drupe/5' }); await dort(2000);
ok('lien direct : pièce ouverte sur son dossier', await js(`!!document.querySelector('.visio')&&!!document.querySelector('.dossier')`));
await touche('Escape');
ok('lien direct : Échap laisse le dossier', await js(`location.hash==='#drupe'&&!document.querySelector('.visio')`), await js('location.hash'));

ok('aucune erreur JavaScript', !erreurs.length, erreurs.join(' | '));
ok('aucune ressource en échec', !rates.length, rates.slice(0, 6).join(' | '));
console.log(res.map((r) => r.join('  ')).join('\n'));
console.log(`\n${res.filter((r) => r[0] === 'ok ').length}/${res.length} réussis (${mobile ? 'mobile 390' : 'bureau 1600'})`);
ws.close(); chrome.kill();
process.exit(res.some((r) => r[0] !== 'ok ') ? 1 : 0);
