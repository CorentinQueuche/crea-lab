// Récupère les images d'études de cas Behance dans la bibliothèque de références (40_KNOWLEDGE/references/branding-behance/).
// Usage : node tools/behance_collecte.mjs <dossier-de-references> id:dossier [id:dossier …]   (id = le numéro dans l’adresse behance.net/gallery/<id>/…)
// Pour chaque projet : lit les données de la page avec un Chrome sans écran, garde les images (1400 px au plus, pas de WEBP),
// les télécharge dans <bibliotheque>/<dossier>/<dossier>-NN.ext et écrit source.json (titre, auteurs, adresse, nombre de vidéos).
// On regarde et on analyse ces images ; on n'en reprend aucune.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const [lib, ...items] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-blink-features=AutomationControlled'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' });
const p = await ctx.newPage();
for (const it of items) {
  const [id, dossier] = it.split(':');
  const dest = path.join(lib, dossier); fs.mkdirSync(dest, { recursive: true });
  try {
    await p.goto(`https://www.behance.net/gallery/${id}/x`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.waitForSelector('#beconfig-store_state', { state: 'attached', timeout: 30000 });
    const info = await p.evaluate(() => {
      const s = JSON.parse(document.querySelector('#beconfig-store_state').textContent), pr = s.project.project, mods = pr.allModules || pr.modules || [];
      const best = (sizes) => { const a = ((sizes && sizes.allAvailable) || []).filter((x) => x.type !== 'WEBP' && x.url); if (!a.length) return null;
        const small = a.filter((x) => x.width <= 1400).sort((x, y) => y.width - x.width)[0]; return (small || a.sort((x, y) => x.width - y.width)[0]).url.split('?')[0]; };
      const imgs = [];
      mods.forEach((m) => { if (m.__typename === 'ImageModule') { const u = best(m.imageSizes); if (u) imgs.push(u); }
        if (m.__typename === 'MediaCollectionModule') (m.components || []).forEach((k) => { const u = best(k.imageSizes); if (u) imgs.push(u); }); });
      return { nom: pr.name, url: pr.url, auteurs: (pr.owners || []).map((o) => o.displayName.trim()).filter(Boolean).join(', '), videos: mods.filter((m) => /Video|Embed/.test(m.__typename)).length,
        textes: mods.filter((m) => m.__typename === 'TextModule').map((m) => (m.text || m.fullBleed || '').toString().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 12), imgs };
    });
    let n = 0, octets = 0;
    for (const u of info.imgs) {
      n++; const ext = (u.match(/\.(\w+)$/) || [, 'jpg'])[1].toLowerCase(); const f = path.join(dest, `${dossier}-${String(n).padStart(2, '0')}.${ext}`);
      if (fs.existsSync(f) && fs.statSync(f).size > 2000) { octets += fs.statSync(f).size; continue; }
      const r = await ctx.request.get(u, { headers: { Referer: 'https://www.behance.net/' }, timeout: 60000 });
      if (!r.ok()) { console.log('  échec', r.status(), u); continue; }
      const buf = await r.body(); fs.writeFileSync(f, buf); octets += buf.length;
    }
    fs.writeFileSync(path.join(dest, 'source.json'), JSON.stringify({ nom: info.nom, url: info.url, auteurs: info.auteurs, images: info.imgs.length, videos: info.videos, textes: info.textes }, null, 1));
    console.log(`${dossier} : ${info.nom} | ${info.auteurs.slice(0, 50)} | ${info.imgs.length} images, ${info.videos} vidéos, ${(octets / 1e6).toFixed(1)} Mo`);
  } catch (e) { console.log(`${dossier} : ERREUR ${String(e).slice(0, 120)}`); }
}
await b.close();
