// Textures PNG pour Blender, rendues par brand/techniques.js dans Chrome (sans écran).
//
// Usage : node tools/tex_techniques.mjs [--only broderie,tissu-serge,...] [--bench]
//   écrit dans blender/tex/ :
//     tech-<technique>-cran.png   2048 × 2048  cran fluo #E2FF21 sur maille noire #101012 (5 fichiers)
//     tech-broderie-logo.png      4096 × 1024  logo complet, broderie fluo sur sergé noir
//     tissu-<type>.png            2048 × 2048  maille, serge, coton, molleton noirs, raccordables
//   --only : ne rend que les fichiers dont le nom contient l'un des mots donnés.
//   --bench : mesure aussi le temps d'un rendu 1600 × 1200 de chaque technique.
// Les textures de marquage sont rendues sans vignettage (vignette: 0) : la lumière de la scène 3D s'en charge.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'blender', 'tex');
const args = process.argv.slice(2);
const only = (() => { const i = args.indexOf('--only'); return i > -1 ? args[i + 1].split(',') : null; })();

const TECHS = ['broderie', 'serigraphie', 'dtf', 'flocage', 'sublimation'];
const jobs = [
  ...TECHS.map((t) => ({ nom: `tech-${t}-cran.png`, w: 2048, h: 2048, o: { tech: t, forme: 'cran', c: '#E2FF21', fond: 'maille', cf: '#101012', vignette: 0 } })),
  { nom: 'tech-broderie-logo.png', w: 4096, h: 1024, o: { tech: 'broderie', forme: 'logo', c: '#E2FF21', fond: 'serge', cf: '#101012', marge: 0.08, vignette: 0 } },
  ...['maille', 'serge', 'coton', 'molleton'].map((t) => ({ nom: `tissu-${t}.png`, w: 2048, h: 2048, tissu: { type: t, c: '#101012' } })),
].filter((j) => !only || only.some((k) => j.nom.includes(k)));

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('ERREUR PAGE', e.message));
await page.setContent('<!doctype html><meta charset="utf-8"><body></body>');
await page.addScriptTag({ path: path.join(root, 'brand', 'traces.js') });
await page.addScriptTag({ path: path.join(root, 'brand', 'techniques.js') });

for (const j of jobs) {
  const { url, ms } = await page.evaluate((j) => {
    const c = document.createElement('canvas'); c.width = j.w; c.height = j.h;
    const ms = j.tissu ? MarqueTech.tissu(c, j.tissu) : MarqueTech.rendre(c, j.o);
    return { url: c.toDataURL('image/png'), ms };
  }, j);
  const f = path.join(outDir, j.nom);
  fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
  console.log(`${path.relative(root, f)}  ${j.w}×${j.h}  ${Math.round(ms)} ms`);
}

if (args.includes('--bench')) {
  for (const t of TECHS) {
    const ms = await page.evaluate((t) => { const c = document.createElement('canvas'); c.width = 1600; c.height = 1200; return MarqueTech.rendre(c, { tech: t, forme: 'cran' }); }, t);
    console.log(`banc 1600×1200  ${t.padEnd(12)} ${Math.round(ms)} ms`);
  }
}
await browser.close();
