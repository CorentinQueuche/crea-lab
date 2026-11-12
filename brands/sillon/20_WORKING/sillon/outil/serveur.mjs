// Le remplisseur de Sillon : le petit serveur local.
//   node outil/serveur.mjs                    sert la page sur http://127.0.0.1:5417/ et l'ouvre dans le navigateur
//   node outil/serveur.mjs --sans-navigateur  sans ouvrir de fenêtre (tests)
//   SILLON_PORT=5500 node outil/serveur.mjs   un autre port
//
// Il n'écoute que sur la machine (127.0.0.1), ne parle à aucun service extérieur et ne sert que les dossiers utiles du
// projet (outil, brand, reseaux, photos, les polices). L'export rend un des quatre gabarits de reseaux/ exactement comme
// tools/shot.mjs (même Chrome sans écran, même adresse file://, même attente de window.pret, échelle 1) et renvoie le PNG.
// Aucune adresse arbitraire : le modèle et chaque paramètre sont vérifiés d'après outil/regles.json.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGLES = JSON.parse(fs.readFileSync(path.join(RACINE, 'outil', 'regles.json'), 'utf8'));
const HOTE = '127.0.0.1', PORT = +process.env.SILLON_PORT || 5417, ADRESSE = `http://${HOTE}:${PORT}/`;
const APP = 'sillon-remplisseur';
const SANS_NAVIGATEUR = process.argv.includes('--sans-navigateur');

/* ---------- les fichiers servis ---------- */
const PERMIS = ['outil/', 'brand/', 'reseaux/', 'photos/', 'node_modules/@fontsource-variable/'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.md': 'text/plain; charset=utf-8' };

function fichier(pathname) {
  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return null; }
  if (rel.includes('\0')) return null;
  rel = path.posix.normalize(rel).replace(/^\/+/, '');
  if (rel.split('/').some((s) => s === '..') || !PERMIS.some((p) => rel.startsWith(p))) return null;
  if (rel === 'outil/serveur.mjs') return null;
  const abs = path.resolve(RACINE, rel);
  if (!abs.startsWith(RACINE + path.sep)) return null;
  if (!TYPES[path.extname(abs).toLowerCase()]) return null;
  try { if (!fs.statSync(abs).isFile()) return null; } catch { return null; }
  return abs;
}

/* ---------- la validation d'un export ---------- */
const PHOTOS = new Set(fs.readdirSync(path.join(RACINE, 'photos')).filter((f) => /^[a-z][a-z-]*\.jpg$/.test(f)).map((f) => f.slice(0, -4)));
const sansBalise = (s) => String(s).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
const L = REGLES.limites;

/* Renvoie { modele, format, qs } ou lève une erreur lisible. qs : la suite de l'adresse du gabarit, déjà vérifiée. */
function valider(q) {
  const modele = q.get('modele'), M = REGLES.modeles[modele];
  if (!M) throw new Error('Modèle inconnu.');
  const format = q.get('format') || '4x5';
  if (!REGLES.formats[format]) throw new Error('Format inconnu.');
  const out = new URLSearchParams();
  for (const k of M.params) {
    let v = q.get(k);
    if (v == null || v === '') continue;
    if (k === 'texte') {
      v = sansBalise(v);
      const titre = modele !== '24-phrase', nu = v.replace(/[[\]/]/g, '');
      if (titre && (nu.length > L.signesTitre || nu.split(' ').filter(Boolean).length > L.motsTitre)) throw new Error('Phrase trop longue pour ce modèle.');
      if (!titre && nu.length > L.signesPhrase) throw new Error('Phrase trop longue pour ce modèle.');
    } else if (k === 'jus') {
      const liste = v.split('|');
      if (!liste.length || liste.length > 16 || liste.some((j) => !REGLES.jus.includes(j))) throw new Error('Jus inconnu.');
    } else if (k === 'niveau') {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0 || n > 1) throw new Error('Niveau hors limites.');
    } else if (k === 'photo') {
      if (!PHOTOS.has(v)) throw new Error('Photo inconnue.');
    } else if (k === 'fond') {
      if (!M.fonds.includes(v)) throw new Error('Fond inconnu.');
    } else if (k === 'voix') {
      if (modele === '24-phrase') { if (!REGLES.voix.includes(v)) throw new Error('Phrase de la marque inconnue.'); }
      else { v = sansBalise(v); if (v.length > L.signesVoix) throw new Error('Phrase de la contre-étiquette trop longue.'); }
    } else if (k === 'mois') {
      if (!REGLES.mois.includes(v)) throw new Error('Mois inconnu.');
    } else if (k === 'ou') {
      v = sansBalise(v); if (v.length > L.signesOu) throw new Error('Texte « où » trop long.');
    }
    out.set(k, v);
  }
  out.set('format', format);
  return { modele, format, M, qs: out.toString() };
}

/* ---------- le rendu : Chrome sans écran, comme tools/shot.mjs ---------- */
/* Exactement les options de tools/shot.mjs. Limite connue (relevée le 12/11/2026, shot.mjs compris) : Chrome peint
   parfois le papier de la contre-étiquette (la texture webp de brand/matiere.js) de deux façons, à 32 niveaux près sur
   le papier seulement ; deux rendus des mêmes réglages peuvent donc différer de cette façon, invisible à l'œil.
   « --num-raster-threads=1 » a été essayé : il ne supprime pas l'écart. */
const ARGS = ['--force-color-profile=srgb', '--hide-scrollbars'];
let navigateur = null, veille = null;
const ouvrirNavigateur = async () => {
  if (!navigateur || !navigateur.isConnected()) navigateur = await chromium.launch({ channel: 'chrome', headless: true, args: ARGS });
  return navigateur; };
/* Chrome se ferme après deux minutes sans export : rien ne reste ouvert pour rien */
const endormir = () => { clearTimeout(veille); veille = setTimeout(async () => { const n = navigateur; navigateur = null; if (n) await n.close().catch(() => {}); }, 120000); };
/* un export à la fois */
let file = Promise.resolve();
const enFile = (fn) => { const p = file.then(fn, fn); file = p.catch(() => {}); return p; };
const delai = (p, ms, quoi) => Promise.race([p, new Promise((_, ko) => setTimeout(() => ko(new Error(quoi)), ms))]);
const norme = (s) => String(s).replace(/\s+/g, ' ').trim().toLocaleLowerCase('fr-FR');

async function rendre({ modele, format, qs }) {
  const F = REGLES.formats[format], b = await ouvrirNavigateur();
  const page = await b.newPage({ viewport: { width: F.l, height: F.h }, deviceScaleFactor: 1 });
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
  try {
    await page.goto(pathToFileURL(path.join(RACINE, 'reseaux', modele + '.html')).href + '?' + qs);
    await page.evaluate(() => document.fonts.ready);
    await delai(page.evaluate(() => (window.pret && window.pret.then ? window.pret.then(() => 1) : 0)), 60000, 'Le gabarit n’a pas fini de dessiner.');
    await page.waitForTimeout(150);
    if (erreurs.length) throw new Error('Le gabarit a signalé une erreur : ' + erreurs[0]);
    const etat = await page.evaluate(() => ({ texte: document.body.innerText, controle: window.controle || [] }));
    if (!norme(etat.texte).includes(norme(REGLES.mentionSanitaire))) throw new Error('La mention sanitaire manque : export refusé.');
    const seuil = REGLES.seuils[modele] && REGLES.seuils[modele][format];
    const c = etat.controle[0];
    if (c && (c.tient === false || (seuil && (c.taille || c.corps) < seuil))) throw new Error('Phrase trop longue pour ce modèle : les lettres seraient trop petites.');
    return await page.screenshot({ clip: { x: 0, y: 0, width: F.l, height: F.h } });
  } finally { await page.close().catch(() => {}); endormir(); }
}

/* ---------- le serveur ---------- */
const HOTES = new Set([`${HOTE}:${PORT}`, `localhost:${PORT}`]);
const envoyer = (res, code, corps, type = 'text/plain; charset=utf-8', plus = {}) => {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...plus }); res.end(corps); };

const serveur = http.createServer(async (req, res) => {
  /* seulement la machine elle-même, sous son propre nom (pas de page d'un autre site qui se ferait passer pour elle) */
  if (!HOTES.has(req.headers.host || '')) return envoyer(res, 403, 'Refusé.');
  if (req.method !== 'GET' && req.method !== 'HEAD') return envoyer(res, 405, 'Méthode refusée.');
  const u = new URL(req.url, ADRESSE);
  if (u.pathname === '/') { res.writeHead(302, { Location: '/outil/' }); return res.end(); }
  if (u.pathname === '/api/sante') return envoyer(res, 200, JSON.stringify({ app: APP }), 'application/json; charset=utf-8');
  if (u.pathname === '/api/export') {
    /* l'en-tête X-Sillon ne peut venir que de la page de l'outil : une autre page ne peut pas lancer un rendu */
    if (req.headers['x-sillon'] !== '1') return envoyer(res, 403, 'Refusé.');
    let v;
    try { v = valider(u.searchParams); } catch (e) { return envoyer(res, 400, e.message); }
    try {
      const png = await enFile(() => rendre(v));
      const nom = `sillon-${v.M.nom}-${v.format}.png`;
      console.log(new Date().toLocaleTimeString('fr-FR'), 'export', nom, png.length, 'octets');
      return envoyer(res, 200, png, 'image/png', { 'Content-Disposition': `attachment; filename="${nom}"` });
    } catch (e) { console.error('export refusé :', e.message); return envoyer(res, 422, e.message); }
  }
  const abs = fichier(u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname);
  if (!abs) return envoyer(res, 404, 'Introuvable.');
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(abs).toLowerCase()], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(abs).pipe(res);
});

const ouvrirPage = () => {
  if (SANS_NAVIGATEUR) return;
  const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', ADRESSE]] : process.platform === 'darwin' ? ['open', [ADRESSE]] : ['xdg-open', [ADRESSE]];
  spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref(); };

serveur.on('error', async (e) => {
  if (e.code !== 'EADDRINUSE') { console.error('Le serveur n’a pas pu démarrer :', e.message); process.exit(1); }
  /* le port est pris : si c'est déjà le remplisseur, on ouvre simplement la page */
  try {
    const r = await fetch(ADRESSE + 'api/sante');
    if ((await r.json()).app === APP) { console.log('Le remplisseur est déjà ouvert :', ADRESSE); ouvrirPage(); process.exit(0); }
  } catch {}
  console.error(`Le port ${PORT} est pris par un autre programme. Relancer avec une autre valeur : SILLON_PORT=5500`); process.exit(1);
});

serveur.listen(PORT, HOTE, () => {
  console.log('Le remplisseur de Sillon est ouvert :', ADRESSE);
  console.log('Pour l’arrêter : fermer cette fenêtre (ou Ctrl+C).');
  ouvrirPage();
});

const arreter = async () => { clearTimeout(veille); serveur.close(); if (navigateur) await navigateur.close().catch(() => {}); process.exit(0); };
for (const s of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) process.on(s, arreter);
