# Fabrique le guide de marque en PDF à partir des pages rendues par tools/deck.mjs (out/deck/NN-*.png),
# plus les vignettes de la visionneuse. Les pages du PDF sont des images : rendu identique à l'écran, texte non sélectionnable.
# Usage, depuis la racine du projet :  python tools/deck_pdf.py [--sortie <dossier>]   (défaut : livrables/)
import sys
try: sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
except Exception: pass
import glob, json, os, shutil, sys
from PIL import Image, JpegImagePlugin, PdfImagePlugin
Image.init()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = sys.argv[1:]
SORTIE = os.path.abspath(a[a.index('--sortie') + 1]) if '--sortie' in a else os.path.join(ROOT, 'livrables')
with open(os.path.join(ROOT, 'brand', 'logo', 'logo.json'), encoding='utf-8') as f: M = json.load(f)
P = os.path.join(SORTIE, 'guide-pdf'); os.makedirs(os.path.join(P, 'pages'), exist_ok=True); os.makedirs(os.path.join(P, 'vignettes'), exist_ok=True)
fs = sorted(glob.glob(os.path.join(ROOT, 'out', 'deck', '[0-9]*.png')))
if not fs: sys.exit('Aucune page dans out/deck : lancer d\'abord node tools/deck.mjs')
ims = [Image.open(f).convert('RGB') for f in fs]
pdf = os.path.join(P, f"{M['slug']}-guide-de-marque.pdf")
ims[0].save(pdf, save_all=True, append_images=ims[1:], resolution=192.0, quality=90, title=f"{M['nom']} — Guide de marque")
for i, (f, im) in enumerate(zip(fs, ims)):
    im.resize((640, 360), Image.LANCZOS).save(os.path.join(P, 'vignettes', f'{i + 1:02d}.jpg'), quality=86)
    shutil.copyfile(f, os.path.join(P, 'pages', os.path.basename(f)))
print(len(ims), 'pages |', round(os.path.getsize(pdf) / 1e6, 1), 'Mo |', pdf)
