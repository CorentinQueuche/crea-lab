# Assemble le site du guide de marque, prêt à déployer : pages du dossier site/, socle, polices, médias allégés,
# vignettes, logos (et leur ZIP), présentation (pages, vignettes, PDF) et étude de cas en défilement.
# À lancer après build_presentation.py, deck.mjs et deck_pdf.py.
# Usage, depuis la racine du projet :  python tools/build_site.py [--sortie <dossier>]   (défaut : livrables/)  -> <sortie>/site
import sys
try: sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
except Exception: pass
import glob, json, os, re, shutil, subprocess, sys, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = sys.argv[1:]
SORTIE = os.path.abspath(a[a.index('--sortie') + 1]) if '--sortie' in a else os.path.join(ROOT, 'livrables')
SITE = os.path.join(SORTIE, 'site'); PRES = os.path.join(SORTIE, 'presentation'); PDF = os.path.join(SORTIE, 'guide-pdf')
if not os.path.exists(os.path.join(ROOT, 'brand', 'logo', 'logo.json')): sys.exit('brand/logo/logo.json introuvable : lancer d\'abord python tools/export_logo.py')
with open(os.path.join(ROOT, 'brand', 'logo', 'logo.json'), encoding='utf-8') as f: M = json.load(f)
for d in ('assets/fonts', 'media/vignettes', 'logo', 'deck'): os.makedirs(os.path.join(SITE, d), exist_ok=True)
ff = lambda *args: subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True)

# 1. Pages et scripts du site
for f in glob.glob(os.path.join(ROOT, 'site', '*.html')): shutil.copyfile(f, os.path.join(SITE, os.path.basename(f)))
for f in glob.glob(os.path.join(ROOT, 'site', 'assets', '*')):
    if os.path.isfile(f): shutil.copyfile(f, os.path.join(SITE, 'assets', os.path.basename(f)))
shutil.copyfile(os.path.join(ROOT, 'brand', 'marque.js'), os.path.join(SITE, 'assets', 'marque.js'))
if os.path.exists(os.path.join(ROOT, 'deck', 'pages.js')): shutil.copyfile(os.path.join(ROOT, 'deck', 'pages.js'), os.path.join(SITE, 'assets', 'pages.js'))
# (Custom) Le socle a des fichiers complémentaires (techniques.js, ecrans.js, ecrans.css) : ils suivent marque.js.
for f in glob.glob(os.path.join(ROOT, 'brand', '*.js')) + glob.glob(os.path.join(ROOT, 'brand', '*.css')):
    if os.path.basename(f) not in ('marque.js', 'marque.css', 'traces.js'): shutil.copyfile(f, os.path.join(SITE, 'assets', os.path.basename(f)))
for f in glob.glob(os.path.join(ROOT, 'plates', 'plates-*.css')): shutil.copyfile(f, os.path.join(SITE, 'assets', os.path.basename(f)))
# (Custom) Styles des pages du guide (deck/pages.css, lus par presentation.html). Tant qu'ils n'existent pas, un fichier vide évite un lien cassé.
for f in glob.glob(os.path.join(ROOT, 'deck', '*.css')):
    if os.path.basename(f) != 'deck.css': shutil.copyfile(f, os.path.join(SITE, 'assets', os.path.basename(f)))
if not os.path.exists(os.path.join(ROOT, 'deck', 'pages.css')):
    with open(os.path.join(SITE, 'assets', 'pages.css'), 'w', encoding='utf-8') as f: f.write('/* deck/pages.css pas encore écrit */\n')
# (Custom) Photos de marque : Marque.photo() les cherche dans window.MarquePhotos ('photos/' sur le site), réduites à 1600 px.
os.makedirs(os.path.join(SITE, 'photos'), exist_ok=True)
for f in glob.glob(os.path.join(ROOT, 'photos', '*.jpg')):
    ff('-i', f, '-vf', "scale='min(1600,iw)':-2:flags=lanczos", '-q:v', '4', os.path.join(SITE, 'photos', os.path.basename(f)))
# plates/plates.css n'existe que si le projet en écrit un (les exemples en ont un, le départ neutre non)
if os.path.exists(os.path.join(ROOT, 'plates', 'plates.css')): shutil.copyfile(os.path.join(ROOT, 'plates', 'plates.css'), os.path.join(SITE, 'assets', 'plates.css'))

# 2. Socle CSS : les polices pointent vers node_modules dans le projet, vers assets/fonts sur le site
css = open(os.path.join(ROOT, 'brand', 'marque.css'), encoding='utf-8').read()
def font(m):
    src = os.path.normpath(os.path.join(ROOT, 'brand', m.group(1)))
    shutil.copyfile(src, os.path.join(SITE, 'assets', 'fonts', os.path.basename(src)))
    return 'url("fonts/' + os.path.basename(src) + '")'
css = re.sub(r'url\("(\.\./node_modules/[^"]+)"\)', font, css)
with open(os.path.join(SITE, 'assets', 'marque.css'), 'w', encoding='utf-8') as f: f.write(css)

# 3. Médias : images à 2000 px, vignettes à 960 px, vidéos recopiées (réencodées si elles dépassent 5 Mo)
n = 0
for f in sorted(glob.glob(os.path.join(PRES, 'media', '*'))):
    b = os.path.basename(f); stem = os.path.splitext(b)[0]
    if b.endswith('.jpg'):
        ff('-i', f, '-vf', 'scale=2000:-2:flags=lanczos', '-q:v', '3', os.path.join(SITE, 'media', b))
        ff('-i', f, '-vf', 'scale=960:-2', '-q:v', '4', os.path.join(SITE, 'media', 'vignettes', b))
    elif b.endswith('.mp4'):
        if os.path.getsize(f) > 5e6:
            ff('-i', f, '-c:v', 'libx264', '-crf', '19', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', os.path.join(SITE, 'media', b))
        else:
            shutil.copyfile(f, os.path.join(SITE, 'media', b))
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout.strip() or 1)
        ff('-ss', str(dur * 0.85), '-i', f, '-frames:v', '1', '-vf', 'scale=960:-2', '-q:v', '4', os.path.join(SITE, 'media', 'vignettes', stem + '.jpg'))
    n += 1

# 4. Logos et archive
svgs = sorted(glob.glob(os.path.join(ROOT, 'brand', 'logo', '*.svg')))
for f in svgs: shutil.copyfile(f, os.path.join(SITE, 'logo', os.path.basename(f)))
with zipfile.ZipFile(os.path.join(SITE, 'logo', f"{M['slug']}-logos.zip"), 'w', zipfile.ZIP_DEFLATED) as z:
    for f in svgs: z.write(f, os.path.basename(f))

# 5. Présentation : vignettes et PDF
for f in glob.glob(os.path.join(PDF, 'vignettes', '*.jpg')): shutil.copyfile(f, os.path.join(SITE, 'deck', os.path.basename(f)))
for f in glob.glob(os.path.join(PDF, '*.pdf')): shutil.copyfile(f, os.path.join(SITE, 'deck', os.path.basename(f)))

# 5 bis. Images que les pages du guide citent (rendus de out/final, out/plates…) : copiées dans guide-media/, à 1100 px.
# Les pages les appellent par  const MEDIA = window.GuideMedia || '../out/final/'  ; la visionneuse du site définit
# window.GuideMedia = 'guide-media/' avant de charger pages.js.
from PIL import Image
js = open(os.path.join(ROOT, 'deck', 'pages.js'), encoding='utf-8').read()
gm = os.path.join(SITE, 'guide-media'); cites = sorted(set(re.findall(r"[\w.-]+\.(?:png|jpg)", js)))
for name in cites:
    for sub in ('final', 'plates', 'motion', 'art'):
        src = os.path.join(ROOT, 'out', sub, name)
        if os.path.exists(src):
            os.makedirs(gm, exist_ok=True)
            im = Image.open(src)
            if im.width > 1100: im = im.resize((1100, round(im.height * 1100 / im.width)), Image.LANCZOS)
            im.save(os.path.join(gm, name)); break

# 5 ter. Galerie : si site/assets/galerie.js porte le marqueur « @auto », sa copie dans le site est remplacée par la liste
# lue dans presentation.json (planches présentes dans <sortie>/presentation/media, dans l'ordre). Section : 4e élément
# d'une planche s'il existe, sinon « Images » ou « Vidéos ». Sans marqueur, le fichier écrit à la main est gardé tel quel.
gj = os.path.join(SITE, 'assets', 'galerie.js')
if os.path.exists(gj) and '@auto' in open(gj, encoding='utf-8').read():
    with open(os.path.join(ROOT, 'presentation.json'), encoding='utf-8') as f: planches = json.load(f).get('planches', [])
    gal = []
    for e in planches:
        nom = e[1] + ('.mp4' if e[0].endswith('.mp4') else '.jpg')
        if os.path.exists(os.path.join(PRES, 'media', nom)):
            gal.append({'f': nom, 't': e[2], 's': e[3] if len(e) > 3 else ('Vidéos' if nom.endswith('.mp4') else 'Images')})
    with open(gj, 'w', encoding='utf-8') as f:
        f.write('/* Généré par tools/build_site.py depuis presentation.json (marqueur @auto de site/assets/galerie.js). */\n'
                'window.GuideGalerie = ' + json.dumps(gal, ensure_ascii=False, indent=1) + ';\n')

# 6. Étude de cas en défilement, avec la police du socle
p = os.path.join(PRES, 'index.html')
if os.path.exists(p):
    h = open(p, encoding='utf-8').read().replace('<style>', '<link rel="stylesheet" href="assets/marque.css"><style>html,body{overflow:auto}', 1)
    with open(os.path.join(SITE, 'etude-de-cas.html'), 'w', encoding='utf-8') as f: f.write(h)
with open(os.path.join(SITE, '.gitignore'), 'w') as f: f.write('.vercel\n')
tot = sum(os.path.getsize(os.path.join(dp, x)) for dp, _, fs in os.walk(SITE) for x in fs)
print('site assemblé :', SITE, '|', n, 'médias |', round(tot / 1e6, 1), 'Mo')
