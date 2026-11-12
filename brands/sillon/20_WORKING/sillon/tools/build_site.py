# Assemble le guide de marque en ligne de Sillon, prêt à déployer : le guide où l'on se promène (site/index.html), la
# présentation de la fiche de marque (site/presentation.html), l'étude de cas en défilement (générée ici depuis
# presentation.json), le socle, les polices, les fonds en matière précalculés, les médias allégés, les fichiers à télécharger.
#
# Usage, depuis la racine du projet :  python tools/build_site.py [--sortie <dossier>]
#   défaut : <capsule>/40_DELIVERABLES/sillon-guideline   (le dossier .vercel, s'il existe, est gardé)
# À lancer après deck.mjs et deck_pdf.py (la fiche sort dans out/deck/), et quand out/plates, out/final, out/motion,
# out/reseaux et out/outil sont rendus. Rien n'est lu hors du projet ; rien n'est écrit hors de la sortie et de out/guide/.
import sys
try: sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
except Exception: pass
import glob, html, json, os, re, shutil, subprocess, zipfile
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAPS = os.path.dirname(os.path.dirname(ROOT))
a = sys.argv[1:]
DEST = os.path.abspath(a[a.index('--sortie') + 1]) if '--sortie' in a else os.path.join(CAPS, '40_DELIVERABLES', 'sillon-guideline')
OUT = os.path.join(ROOT, 'out')
NM = os.path.join(ROOT, 'node_modules', '@fontsource-variable')
SLUG = 'sillon'
e = html.escape

# ---------- 0. Sortie propre (le lien Vercel se garde) ----------
garde = os.path.join(DEST, '.vercel'); tmp = None
if os.path.isdir(garde):
    tmp = DEST + '-vercel-tmp'; shutil.rmtree(tmp, ignore_errors=True); shutil.move(garde, tmp)
shutil.rmtree(DEST, ignore_errors=True)
for d in ('assets/fonts', 'assets/matiere', 'photos', 'media/vignettes', 'media/reseaux', 'guide-media', 'deck', 'logo', 'ressources'):
    os.makedirs(os.path.join(DEST, d), exist_ok=True)
if tmp: shutil.move(tmp, garde)
J = lambda *p: os.path.join(DEST, *p)
lire = lambda p: open(p, encoding='utf-8').read()
def ecrire(p, t):
    with open(p, 'w', encoding='utf-8', newline='\n') as f: f.write(t)
def jpg(src, dst, larg, q=84):
    im = Image.open(src).convert('RGB')
    if im.width > larg: im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    im.save(dst, quality=q, optimize=True, progressive=True); return im.size
def sonde(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', p], capture_output=True, text=True)
    d = json.loads(r.stdout); s = d['streams'][0]
    return int(s['width']), int(s['height']), float(d['format']['duration'])

# ---------- 1. Pages et scripts du site ----------
for f in glob.glob(os.path.join(ROOT, 'site', '*.html')): shutil.copyfile(f, J(os.path.basename(f)))
for f in glob.glob(os.path.join(ROOT, 'site', 'assets', '*')):
    if os.path.isfile(f): shutil.copyfile(f, J('assets', os.path.basename(f)))
for f in ('marque.js', 'verse.js', 'matiere.js'): shutil.copyfile(os.path.join(ROOT, 'brand', f), J('assets', f))
# La fiche de marque (deck/pages.js) cite les logos par « ../brand/logo/ » : sur le site, ils sont dans logo/.
pj = lire(os.path.join(ROOT, 'deck', 'pages.js')).replace("../brand/logo/", "logo/")
ecrire(J('assets', 'pages.js'), pj)
shutil.copyfile(os.path.join(ROOT, 'deck', 'pages.css'), J('assets', 'pages.css'))

# ---------- 2. Socle CSS : les polices pointent vers node_modules dans le projet, vers assets/fonts sur le site ----------
css = lire(os.path.join(ROOT, 'brand', 'marque.css'))
def police(m):
    src = os.path.normpath(os.path.join(ROOT, 'brand', m.group(1)))
    shutil.copyfile(src, J('assets', 'fonts', os.path.basename(src)))
    return 'url("fonts/' + os.path.basename(src) + '")'
css = re.sub(r'url\("(\.\./node_modules/[^"]+)"\)', police, css)
ecrire(J('assets', 'marque.css'), css)

# ---------- 3. Fonds en matière : brand/matiere.js les calcule au chargement (une seconde sur un ordinateur, bien plus sur
# un téléphone). On les calcule ici une fois, avec le même code, et le site pose window.MatiereSans puis assets/matiere.css.
os.makedirs(os.path.join(OUT, 'guide'), exist_ok=True)
hm = os.path.join(OUT, 'guide', '_matiere.html'); jm = os.path.join(OUT, 'guide', '_matiere.mjs')
ecrire(hm, '<!doctype html><meta charset="utf-8"><script>window.MatiereSans = true;</script><script src="../../brand/marque.js"></script><script src="../../brand/matiere.js"></script>')
ecrire(jm, """import { chromium } from 'playwright-core';
import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const [page, dest] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome', headless: true }); const p = await b.newPage();
await p.goto(pathToFileURL(path.resolve(page)).href);
for (const n of ['tissu', 'papier', 'blanc', 'craie', 'cave']) {
  const u = await p.evaluate((n) => window.Matiere.url(n), n);
  fs.writeFileSync(path.join(dest, n + '.webp'), Buffer.from(u.split(',')[1], 'base64'));
}
await b.close();
""")
subprocess.run(['node', jm, hm, J('assets', 'matiere')], check=True, cwd=ROOT)
for f in (hm, jm): os.remove(f)

# ---------- 4. Photos de marque (Marque.photo les cherche dans photos/) : 1600 px de large au plus ----------
for f in sorted(glob.glob(os.path.join(ROOT, 'photos', '*.jpg'))):
    if not os.path.basename(f).startswith('_'): jpg(f, J('photos', os.path.basename(f)), 1600, 84)

# ---------- 5. Étude de cas : les 36 pièces de presentation.json ----------
CFG = json.load(open(os.path.join(ROOT, 'presentation.json'), encoding='utf-8'))
SECTION = {'01': 'Le monde', '02': 'Le monde', '03': 'Le mouvement', '04': 'Le système', '05': 'Le volume', '06': 'Le système', '07': 'Le système',
           '08': 'Le système', '09': 'Le monde', '10': 'Le volume', '11': 'Le monde', '12': 'Le monde', '13': 'Le monde', '14': 'Le monde',
           '15': 'Le monde', '16': 'Les objets', '17': 'Le mouvement', '18': 'Le mouvement', '19': 'Le mouvement', '20': 'Le monde',
           '21': 'Le volume', '22': 'Les objets', '23': 'Les objets', '24': 'Les objets', '25': 'Les objets', '26': 'Le monde',
           '27': 'Les réseaux', '28': 'Les réseaux', '29': 'Les réseaux', '30': 'Les réseaux', '31': 'Le mouvement', '32': 'Le mouvement',
           '33': 'Les réseaux', '34': 'Le système', '35': 'Le mouvement', '36': 'Le mouvement'}
items, gal, videos = [], [], {}
for src, nom, leg in CFG['planches']:
    p = os.path.join(OUT, *src.split('/'))
    if src.endswith('.mp4'):
        shutil.copyfile(p, J('media', nom + '.mp4'))
        w, h, dur = sonde(p)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{dur * 0.62:.2f}', '-i', p, '-frames:v', '1', '-vf', 'scale=960:-2', '-q:v', '4', J('media', 'vignettes', nom + '.jpg')], check=True)
        items.append(('video', nom, leg, (w, h))); videos[nom] = {'l': w, 'h': h, 'duree': round(dur, 1), 'octets': os.path.getsize(p), 'titre': leg}
        gal.append({'f': nom + '.mp4', 't': leg, 's': SECTION.get(nom[:2], 'Le mouvement'), 'l': w, 'h': h})
    else:
        size = jpg(p, J('media', nom + '.jpg'), 2000, 84)
        jpg(J('media', nom + '.jpg'), J('media', 'vignettes', nom + '.jpg'), 720, 80)
        items.append(('img', nom, leg, size))
        gal.append({'f': nom + '.jpg', 't': leg, 's': SECTION.get(nom[:2], 'Le monde'), 'l': size[0], 'h': size[1]})
ecrire(J('assets', 'galerie.js'), '/* Généré par tools/build_site.py depuis presentation.json : f fichier dans media/, t légende, s section, l × h. */\n'
       'window.GuideGalerie = ' + json.dumps(gal, ensure_ascii=False, indent=1) + ';\n')

# ---------- 6. Fiche de marque : vignettes et PDF ; images que ses pages citent (guide-media/) ----------
for i, f in enumerate(sorted(glob.glob(os.path.join(OUT, 'deck', '[0-9][0-9]-*.png'))), 1):
    jpg(f, J('deck', f'{i:02d}.jpg'), 960, 80)
pdf = os.path.join(OUT, 'deck', f'{SLUG}-fiche-de-marque.pdf')
shutil.copyfile(pdf, J('deck', os.path.basename(pdf)))
cites = set(re.findall(r"[\w.-]+\.png", pj))
for name in sorted(cites):
    for sub in ('reseaux', 'outil', 'final', 'plates', 'motion'):
        src = os.path.join(OUT, sub, name)
        if os.path.exists(src):
            im = Image.open(src)
            if im.width > 900: im = im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS)
            im.save(J('guide-media', name), optimize=True); break
    else: print('ATTENTION : image citée par deck/pages.js introuvable :', name)

# ---------- 7. Logos et leur archive ----------
svgs = sorted(glob.glob(os.path.join(ROOT, 'brand', 'logo', '*.svg')))
for f in svgs: shutil.copyfile(f, J('logo', os.path.basename(f)))
with zipfile.ZipFile(J('logo', f'{SLUG}-logos.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
    for f in svgs: z.write(f, f'{SLUG}-logos/' + os.path.basename(f))
shutil.copyfile(os.path.join(ROOT, 'brand', 'logo', f'{SLUG}-symbole-jus-bleu.svg'), J('favicon.svg'))

# ---------- 8. Kit pour les réseaux : 24 visuels. Sur le site, en 720 px (la visionneuse) ; dans l'archive, en JPG pleine taille.
rs = sorted(glob.glob(os.path.join(OUT, 'reseaux', '[0-9][0-9]-*.png')))
with zipfile.ZipFile(J('ressources', f'{SLUG}-reseaux.zip'), 'w', zipfile.ZIP_STORED) as z:
    for f in rs:
        b = os.path.splitext(os.path.basename(f))[0]
        jpg(f, J('media', 'reseaux', b + '.jpg'), 720, 82)
        t = os.path.join(OUT, 'guide', '_r.jpg'); jpg(f, t, 1080, 92); z.write(t, f'{SLUG}-reseaux/{b}.jpg'); os.remove(t)

# ---------- 9. Polices et leurs licences (OFL) ----------
with zipfile.ZipFile(J('ressources', f'{SLUG}-polices.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
    for fam in ('anybody', 'hanken-grotesk'):
        for f in glob.glob(os.path.join(NM, fam, 'files', '*-latin-*normal.woff2')):
            if ('anybody' in fam and 'wdth' in f) or ('hanken' in fam and 'wght' in f): z.write(f, f'{SLUG}-polices/web/' + os.path.basename(f))
        z.write(os.path.join(NM, fam, 'LICENSE'), f'{SLUG}-polices/LICENCE-{fam}.txt')
    for f in sorted(glob.glob(os.path.join(ROOT, 'brand', 'fonts', '*.ttf'))): z.write(f, f'{SLUG}-polices/bureau/' + os.path.basename(f))
for fam in ('anybody', 'hanken-grotesk'): shutil.copyfile(os.path.join(NM, fam, 'LICENSE'), J('assets', 'fonts', f'LICENCE-{fam}.txt'))

# ---------- 10. Ce que le site doit savoir des fichiers (poids, durées) : jamais écrit à la main dans les pages ----------
taille = lambda p: os.path.getsize(p)
FICHIERS = {'pdf': {'f': f'deck/{SLUG}-fiche-de-marque.pdf', 'octets': taille(J('deck', f'{SLUG}-fiche-de-marque.pdf'))},
            'logos': {'f': f'logo/{SLUG}-logos.zip', 'octets': taille(J('logo', f'{SLUG}-logos.zip')), 'n': len(svgs)},
            'reseaux': {'f': f'ressources/{SLUG}-reseaux.zip', 'octets': taille(J('ressources', f'{SLUG}-reseaux.zip')), 'n': len(rs), 'liste': [os.path.splitext(os.path.basename(f))[0] for f in rs]},
            'polices': {'f': f'ressources/{SLUG}-polices.zip', 'octets': taille(J('ressources', f'{SLUG}-polices.zip'))},
            'videos': videos, 'pieces': len(items), 'pages': len(glob.glob(J('deck', '[0-9][0-9].jpg')))}
ecrire(J('assets', 'fichiers.js'), '/* Généré par tools/build_site.py : poids et durées des fichiers à télécharger. */\nwindow.GuideFichiers = ' + json.dumps(FICHIERS, ensure_ascii=False, indent=1) + ';\n')

# ---------- 11. Étude de cas en défilement ----------
def video(nom, leg, dim, cls=''):
    return (f'<video class="{cls}" data-src="media/{nom}.mp4" poster="media/vignettes/{nom}.jpg" muted loop playsinline preload="none" '
            f'width="{dim[0]}" height="{dim[1]}" aria-label="{e(leg)}"></video>')
blocs, i, premiere = [], 0, True
while i < len(items):
    genre, nom, leg, dim = items[i]
    if genre == 'img':
        attente = '' if premiere else ' loading="lazy"'
        blocs.append(f'<figure><img src="media/{nom}.jpg" alt="{e(leg)}" width="{dim[0]}" height="{dim[1]}"{attente} decoding="async"><figcaption>{e(leg)}</figcaption></figure>')
        premiere = False; i += 1; continue
    if dim[1] <= dim[0]:
        blocs.append(f'<figure>{video(nom, leg, dim)}<figcaption>{e(leg)}</figcaption></figure>'); i += 1; continue
    g = []
    while i < len(items) and items[i][0] == 'video' and items[i][3][1] > items[i][3][0] and len(g) < 3: g.append(items[i]); i += 1
    blocs.append('<figure class="ec-rangee fond-cave">' + ''.join(f'<div>{video(n, l, d)}<p>{e(l)}</p></div>' for _, n, l, d in g) + '</figure>')
nv = sum(1 for it in items if it[0] == 'video')
logo_svg = lire(os.path.join(ROOT, 'brand', 'logo', f'{SLUG}-logotype-jus-tuffeau.svg')).replace('<svg ', '<svg aria-hidden="true" ', 1)
etude = f'''<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sillon — l’étude de cas</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="Sillon, cave à vins nature : l’étude de cas de son identité de marque, {len(items)} pièces dont {nv} vidéos. Marque fictive, proposition de KLYRA.">
<meta name="theme-color" content="#0E1638">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/marque.css">
<style>
html,body{{overflow:auto}}
body{{background:var(--cave);color:var(--tuffeau);font-family:var(--font)}}
a{{color:inherit}}
:focus-visible{{outline:2px solid var(--tuffeau);outline-offset:3px}}
.ec-evite{{position:fixed;left:12px;top:12px;z-index:10;padding:10px 14px;background:var(--tuffeau);color:var(--cave);opacity:0;pointer-events:none}}
.ec-evite:focus{{opacity:1;pointer-events:auto}}
.ec-barre{{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:18px;padding:12px clamp(16px,3vw,32px);background:color-mix(in srgb,var(--cave) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--filet)}}
.ec-barre>a:first-child svg{{height:22px;width:auto}}
.ec-barre nav{{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap}}
.ec-barre nav a{{font-family:var(--mono);font-stretch:75%;font-weight:600;font-size:12px;letter-spacing:.075em;text-transform:uppercase;text-decoration:none;min-height:44px;display:inline-flex;align-items:center;padding:0 14px;border-radius:3px;box-shadow:inset 0 0 0 1.5px var(--filet)}}
.ec-barre nav a:hover{{box-shadow:inset 0 0 0 1.5px var(--tuffeau)}}
header.ec-tete{{max-width:1400px;margin:0 auto;padding:clamp(40px,7vw,96px) clamp(20px,3vw,32px) 48px;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:28px 64px;align-items:end}}
h1{{font-family:var(--titre);font-weight:800;font-size:clamp(36px,5.4vw,76px);line-height:.96;letter-spacing:-.02em;margin:0}}
h1 span{{display:block;margin-top:18px;font-weight:600;font-stretch:75%;font-size:max(12px,.2em);letter-spacing:.08em;text-transform:uppercase;opacity:.75;line-height:1.4}}
header p{{margin:0;font-size:17px;line-height:1.55;max-width:560px;opacity:.88}}
main{{max-width:1400px;margin:0 auto}}
figure{{margin:0;position:relative}}
figure img,figure video{{display:block;width:100%;height:auto}}
figcaption{{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}}
.ec-rangee{{display:flex;justify-content:center;gap:clamp(14px,2.4vw,32px);padding:clamp(28px,5vw,72px) clamp(16px,4vw,56px)}}
.ec-rangee>div{{flex:1 1 0;min-width:0;max-width:400px}}
.ec-rangee video{{border-radius:14px;box-shadow:0 30px 60px -30px rgba(0,0,0,.8)}}
.ec-rangee p{{margin:14px 2px 0;font-size:14px;line-height:1.45;opacity:.8}}
footer{{max-width:1400px;margin:0 auto;padding:48px clamp(20px,3vw,32px) 80px;display:grid;grid-template-columns:auto 1fr;gap:24px;font-size:14px;line-height:1.6;opacity:.8}}
footer svg{{height:28px;width:auto}}
footer p{{margin:0 0 10px}}
@media (max-width:820px){{header.ec-tete{{grid-template-columns:1fr}}.ec-rangee{{flex-direction:column;align-items:center}}.ec-rangee>div{{max-width:360px;width:100%}}footer{{grid-template-columns:1fr}}.ec-barre nav a:nth-child(3){{display:none}}}}
</style>
<link rel="stylesheet" href="assets/matiere.css">
</head>
<body>
<a class="ec-evite" href="#etude">Aller aux pièces</a>
<div class="ec-barre"><a href="index.html" aria-label="Sillon, le guide de marque en ligne">{logo_svg}</a>
<nav aria-label="Le reste du guide"><a href="index.html">Le guide en ligne</a><a href="presentation.html">La fiche en pages</a><a href="index.html#ressources">Fichiers</a></nav></div>
<header class="ec-tete">
  <h1>{e(CFG["titre"].split(" — ")[0])}<span>{e(CFG["titre"].split(" — ")[-1])} · l’étude de cas</span></h1>
  <p>{e(CFG["sous_titre"])} {len(items)} pièces, dont {nv} vidéos.</p>
</header>
<main id="etude" tabindex="-1">
{chr(10).join(blocs)}
</main>
<footer><div>{lire(os.path.join(ROOT, 'brand', 'logo', f'{SLUG}-symbole-jus-tuffeau.svg')).replace('<svg ', '<svg aria-hidden="true" ', 1)}</div><div><p>{e(CFG["pied"])}</p><p><a href="index.html">Le guide de marque en ligne</a> · <a href="presentation.html">La fiche de marque en pages</a> · <a href="index.html#ressources">Les fichiers</a></p></div></footer>
<script>
/* Les vidéos ne se chargent et ne jouent qu'à l'écran ; aucune ne part seule si la personne a demandé moins de mouvement. */
(function () {{
  var calme = matchMedia('(prefers-reduced-motion: reduce)').matches, V = [].slice.call(document.querySelectorAll('video[data-src]'));
  var charge = function (v) {{ if (!v.src) {{ v.src = v.dataset.src; v.preload = 'auto'; }} }};
  if (calme || !('IntersectionObserver' in window)) {{ V.forEach(function (v) {{ v.controls = true; v.preload = 'metadata'; v.src = v.dataset.src; }}); return; }}
  var io = new IntersectionObserver(function (es) {{ es.forEach(function (en) {{ var v = en.target;
    if (en.isIntersecting) {{ charge(v); var p = v.play(); if (p) p.catch(function () {{}}); }} else v.pause(); }}); }}, {{ rootMargin: '120px 0px', threshold: 0.15 }});
  V.forEach(function (v) {{ io.observe(v); }});
}})();
</script>
</body></html>'''
ecrire(J('etude-de-cas.html'), etude)

# (un url() posé dans une variable CSS se résout depuis la feuille qui l'emploie : les fonds en matière ne s'emploient
#  donc que par les classes de assets/marque.css, jamais dans un style écrit dans une page)
# ---------- 12. Mise en ligne : pas d'indexation, l'icône à /favicon.ico, cache long des médias ----------
ecrire(J('vercel.json'), json.dumps({
    'rewrites': [{'source': '/favicon.ico', 'destination': '/favicon.svg'}],
    'headers': [{'source': '/(.*)', 'headers': [{'key': 'X-Robots-Tag', 'value': 'noindex, nofollow'}]},
                {'source': '/(media|photos|assets/fonts|assets/matiere)/(.*)', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=31536000, immutable'}]}],
}, indent=2) + '\n')
ecrire(J('.gitignore'), '.vercel\n')
ecrire(J('robots.txt'), 'User-agent: *\nDisallow: /\n')

# ---------- 13. Bilan ----------
tot = sum(os.path.getsize(os.path.join(dp, x)) for dp, dn, fs in os.walk(DEST) if '.vercel' not in dp for x in fs)
gros = sorted(((os.path.getsize(os.path.join(dp, x)), os.path.relpath(os.path.join(dp, x), DEST)) for dp, dn, fs in os.walk(DEST) if '.vercel' not in dp for x in fs), reverse=True)[:5]
print('guide assemblé :', DEST)
print(f'{len(items)} pièces dont {nv} vidéos | {len(svgs)} logos | {len(rs)} visuels réseaux | {round(tot / 1e6, 1)} Mo')
print('plus gros :', ', '.join(f'{f} {round(s / 1e6, 1)} Mo' for s, f in gros))
if tot > 80e6: print('ATTENTION : le dossier dépasse 80 Mo')
