# Assemble la fiche de marque en PDF à partir des pages rendues par tools/deck.mjs (out/deck/NN-*.png).
# Les pages du PDF sont des images (JPEG dans le PDF) : rendu identique à l'écran, texte non sélectionnable.
# Usage, depuis la racine du projet :  python tools/deck_pdf.py [--sortie <dossier>]   (défaut : out/deck/)
import sys
try: sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
except Exception: pass
import glob, json, os
from PIL import Image, JpegImagePlugin, PdfImagePlugin
Image.init()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = sys.argv[1:]
SORTIE = os.path.abspath(a[a.index('--sortie') + 1]) if '--sortie' in a else os.path.join(ROOT, 'out', 'deck')
os.makedirs(SORTIE, exist_ok=True)
with open(os.path.join(ROOT, 'brand', 'logo', 'logo.json'), encoding='utf-8') as f: M = json.load(f)
fs = sorted(glob.glob(os.path.join(ROOT, 'out', 'deck', '[0-9]*.png')))
if not fs: sys.exit('Aucune page dans out/deck : lancer d\'abord node tools/deck.mjs')
ims = [Image.open(f).convert('RGB') for f in fs]
pdf = os.path.join(SORTIE, f"{M['slug']}-fiche-de-marque.pdf")
# 3840 × 2160 px à 288 ppp : une page de 13,3 × 7,5 pouces, nette à l'écran comme à l'impression
ims[0].save(pdf, save_all=True, append_images=ims[1:], resolution=288.0, quality=90, title=f"{M['nom']} — Fiche de marque", author='KLYRA')
print(len(ims), 'pages |', round(os.path.getsize(pdf) / 1e6, 1), 'Mo |', pdf)
