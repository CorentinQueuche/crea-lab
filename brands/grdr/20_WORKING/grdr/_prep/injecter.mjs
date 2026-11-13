/* Injecte dans le socle ce qui vient des sources officielles :
   - les tracés du logo (_prep/logo_officiel.json) et les lignes médianes du symbole (_prep/kit.json) dans brand/marque.js,
     entre les marques  /*@TRACES*​/ … /*@FIN*​/ ;
   - la carte « ici et là-bas » dans brand/carte.js (fichier complémentaire : Marque.carte).
   À relancer après _prep/extraire_logo.py ou _prep/preparer_kit.mjs.   node _prep/injecter.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url)), RACINE = path.join(ICI, '..');
const logo = JSON.parse(fs.readFileSync(path.join(ICI, 'logo_officiel.json'), 'utf8'));
const kit = JSON.parse(fs.readFileSync(path.join(ICI, 'kit.json'), 'utf8'));

const traces = { source: logo.source, mot: logo.mot, symbole: logo.symbole, descripteur: logo.descripteur, boite: logo.boite, traits: kit.symboleTrait.traits, epaisseur: kit.symboleTrait.epaisseur };
const f = path.join(RACINE, 'brand', 'marque.js');
let s = fs.readFileSync(f, 'utf8');
const a = s.indexOf('/*@TRACES*/'), b = s.indexOf('/*@FIN*/');
if (a < 0 || b < 0) throw new Error('marques /*@TRACES*/ … /*@FIN*/ introuvables dans brand/marque.js');
s = s.slice(0, a) + '/*@TRACES*/' + JSON.stringify(traces) + s.slice(b);
fs.writeFileSync(f, s);
console.log('brand/marque.js : tracés injectés,', JSON.stringify(traces).length, 'caractères');

const c = kit.carte;
const carte = `/* LA CARTE « ICI ET LÀ-BAS » — complément du socle (Marque.carte). Fichier écrit par _prep/injecter.mjs : ne pas le modifier à la main.
   Fond : ${c.source}. Pays d'intervention et bureaux : rapport d'activité 2025 du GRDR (pages 54 à 75, 85).
   Marque.carte(o) → SVG.  o : w (largeur en px), cadre [x, y, l, h] dans le repère ${c.w} × ${c.h} (pour recadrer), terres, mer (couleurs ; mer null = transparent),
     pays { code: couleur } (les pays d'intervention à colorer ; sinon tous en cPays), cPays, filet (couleur des frontières),
     villes (true : tous les bureaux ; ou liste de noms), cVille, noms (true : écrire les noms), cNom, tailleNom,
     epingles [{ ville | pays, v (0 à 1 : taille), c, label }] : des empreintes posées sur la carte,
     par (preserveAspectRatio, « xMidYMid slice » par défaut),
     ke (échelle des épingles : unités de carte par pixel d'écran, pour qu'elles gardent leur taille quand la carte est petite), attrs */
(function () {
  const A = window.Marque, C = ${JSON.stringify({ w: c.w, h: c.h, villes: c.villes })};
  const TERRES = ${JSON.stringify(c.terres)};
  const PAYS = ${JSON.stringify(c.pays)};
  const col = A.col, r1 = (v) => Math.round(v * 10) / 10;
  A.CARTE = { w: C.w, h: C.h, villes: C.villes, pays: Object.fromEntries(Object.entries(PAYS).map(([k, v]) => [k, { nom: v.nom, centre: v.centre }])) };
  A.cartePaysPath = (code) => (PAYS[code] || {}).d || '';
  A.carteTerres = () => TERRES;
  A.carte = (o = {}) => { const { w, cadre = [0, 0, C.w, C.h], terres = 'sable', mer = null, pays = null, cPays = 'corail', filet = 'papier', villes = false, cVille = 'lagune', noms = false, cNom = 'encre', tailleNom = 15, epingles = [], attrs = '', rVille = 5, ke = 1, par = 'xMidYMid slice' } = o;
    let s = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="\${cadre.join(' ')}" \${w ? \`width="\${w}"\` : ''} preserveAspectRatio="\${par}" \${attrs}>\`;
    if (mer) s += \`<rect x="\${cadre[0]}" y="\${cadre[1]}" width="\${cadre[2]}" height="\${cadre[3]}" fill="\${col(mer)}"/>\`;
    if (terres) s += \`<path d="\${TERRES}" fill="\${col(terres)}"/>\`;
    for (const [k, p] of Object.entries(PAYS)) { const cc = pays ? pays[k] : cPays; if (!cc) continue; s += \`<path d="\${p.d}" fill="\${col(cc)}" stroke="\${col(filet)}" stroke-width="1.6" stroke-linejoin="round"/>\`; }
    const vs = villes === true ? C.villes : (villes || []).map((n) => C.villes.find((v) => v.nom === n)).filter(Boolean);
    for (const v of vs) { s += \`<circle cx="\${v.x}" cy="\${v.y}" r="\${rVille}" fill="\${col(cVille)}"/>\`; if (noms) s += \`<text x="\${v.x + rVille + 5}" y="\${v.y + tailleNom * 0.34}" font-family="Nunito, sans-serif" font-weight="700" font-size="\${tailleNom}" letter-spacing="-.01em" fill="\${col(cNom)}">\${v.nom}</text>\`; }
    for (const e of epingles) { const at = e.ville ? C.villes.find((v) => v.nom === e.ville) : null, xy = at ? [at.x, at.y] : (PAYS[e.pays] ? PAYS[e.pays].centre : (e.xy || [0, 0]));
      const n = e.cernes ? e.cernes.length : 3, pas = (4 + 5 * (e.v == null ? 0.5 : e.v)) * ke, ep = pas * 0.365, G = A.empreinteGeo(n, pas), outer = G[n - 1];
      /* l'empreinte est posée par son pied : le lieu */
      const tx = xy[0] - outer.pied[0], ty = xy[1] - outer.pied[1];
      s += \`<g transform="translate(\${r1(tx)} \${r1(ty)})" fill="none" stroke-linecap="round" stroke-width="\${r1(ep)}">\` + G.map((g, i) => \`<path d="\${g.d}" stroke="\${col(e.piste || 'blanc')}" stroke-opacity="\${e.piste === null ? 0 : 0.9}"/>\${(e.cernes ? e.cernes[i] : 1) > 0.002 ? \`<path d="\${g.d}" stroke="\${col(e.c || 'lagune')}" stroke-dasharray="\${r1((e.cernes ? e.cernes[i] : 1) * g.l)} \${r1(g.l * 2)}"/>\` : ''}\`).join('') + \`</g>\`;
      if (e.label) s += \`<text x="\${r1(xy[0] + 10)}" y="\${r1(xy[1] + 4)}" font-family="Nunito, sans-serif" font-weight="800" font-size="\${e.taille || 15}" letter-spacing="-.01em" fill="\${col(e.cLabel || 'encre')}">\${e.label}</text>\`; }
    return s + '</svg>'; };
})();
`;
fs.writeFileSync(path.join(RACINE, 'brand', 'carte.js'), carte);
console.log('brand/carte.js :', carte.length, 'caractères');
