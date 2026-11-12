# Assemble l'étude de cas en défilement : médias (JPG + MP4), originaux PNG, fichiers logo, page index.html.
# L'ordre des planches est dans presentation.json, à la racine du projet : [source dans out/, nom, légende] ou, avec une
# section pour la galerie du site, [source, nom, légende, section]. Une liste vide donne une page sans planche.
# Usage, depuis la racine du projet :  python tools/build_presentation.py [--sortie <dossier>]   (défaut : livrables/)
import sys
try: sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
except Exception: pass
import html, json, os, shutil, subprocess, sys

def taille_video(p):
    # largeur et hauteur d'une vidéo, pour ranger côte à côte celles qui sont verticales ou carrées
    try:
        r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', p], capture_output=True, text=True)
        w, h = r.stdout.strip().split(',')[:2]; return int(w), int(h)
    except Exception:
        return 16, 9
from PIL import Image, JpegImagePlugin

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = sys.argv[1:]
SORTIE = os.path.abspath(a[a.index('--sortie') + 1]) if '--sortie' in a else os.path.join(ROOT, 'livrables')
with open(os.path.join(ROOT, 'presentation.json'), encoding='utf-8') as f: CFG = json.load(f)
DEST = os.path.join(SORTIE, 'presentation'); MEDIA = os.path.join(DEST, 'media'); PNG = os.path.join(DEST, 'planches-png'); LOGO = os.path.join(SORTIE, 'logo')
for d in (MEDIA, PNG, LOGO): os.makedirs(d, exist_ok=True)

items, missing = [], []
for e in CFG.get('planches', []):
    src, name, cap = e[0], e[1], html.escape(e[2])
    p = os.path.join(ROOT, 'out', *src.split('/'))
    if not os.path.exists(p):
        missing.append(src); continue
    if src.endswith('.mp4'):
        shutil.copyfile(p, os.path.join(MEDIA, name + '.mp4'))
        items.append(('video', name + '.mp4', cap, taille_video(p)))
    else:
        shutil.copyfile(p, os.path.join(PNG, name + '.png'))
        Image.open(p).convert('RGB').save(os.path.join(MEDIA, name + '.jpg'), quality=93, subsampling=0)
        items.append(('img', name + '.jpg', cap, None))

ld = os.path.join(ROOT, 'brand', 'logo')
for f in (os.listdir(ld) if os.path.isdir(ld) else []):
    if f.endswith('.svg'): shutil.copyfile(os.path.join(ld, f), os.path.join(LOGO, f))

blocks = []
i = 0
while i < len(items):
    kind, f, cap, dim = items[i]
    if kind == 'img':
        blocks.append(f'<figure><img src="media/{f}" alt="{cap}" loading="lazy"></figure>'); i += 1; continue
    video = lambda f, cap, dim: f'<video src="media/{f}" autoplay muted loop playsinline preload="metadata" aria-label="{cap}" style="aspect-ratio:{dim[0]}/{dim[1]}"></video>'
    if dim[1] < dim[0]:
        blocks.append(f'<figure>{video(f, cap, dim)}</figure>'); i += 1; continue
    # une suite de vidéos verticales ou carrées : une rangée, trois au plus
    groupe = []
    while i < len(items) and items[i][0] == 'video' and items[i][3][1] >= items[i][3][0] and len(groupe) < 3:
        groupe.append(items[i]); i += 1
    blocks.append('<figure class="rangee">' + ''.join(video(f, cap, dim) for _, f, cap, dim in groupe) + '</figure>')
nv = sum(1 for it in items if it[0] == 'video')
html = f'''<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{CFG['titre']}</title><meta name="robots" content="noindex">
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:{CFG.get('fond', '#0A0609')};color:{CFG.get('texte', '#E9E3DE')};font-family:{CFG.get('police', 'system-ui')},system-ui,-apple-system,"Segoe UI",sans-serif;font-weight:300}}
header{{max-width:1400px;margin:0 auto;padding:56px 32px 40px;display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap}}
h1{{font-weight:300;font-size:clamp(28px,4vw,48px);letter-spacing:-.01em}}
header p{{font-size:15px;line-height:1.5;max-width:520px;opacity:.75}}
main{{max-width:1400px;margin:0 auto}}
figure{{display:block;line-height:0}}
img,video{{width:100%;height:auto;display:block}}
.rangee{{display:flex;justify-content:center;align-items:center;gap:28px;padding:64px 48px;background:{CFG.get('fond_rangee', CFG.get('fond', '#0A0609'))}}}
.rangee video{{flex:1 1 0;min-width:0;max-width:400px;border-radius:14px}}
@media (max-width:700px){{.rangee{{flex-direction:column;padding:32px 24px}} .rangee video{{max-width:100%}}}}
footer{{max-width:1400px;margin:0 auto;padding:40px 32px 72px;font-size:13px;line-height:1.6;opacity:.6}}
</style></head>
<body>
<header><h1>{CFG['titre']}</h1><p>{CFG.get('sous_titre', '')} {len(items)} planches, dont {nv} vidéos.</p></header>
<main>
{chr(10).join(blocks)}
</main>
<footer>{CFG.get('pied', '')}</footer>
</body></html>'''
with open(os.path.join(DEST, 'index.html'), 'w', encoding='utf-8') as f: f.write(html)
print('planches', len(items), '| manquantes', missing, '|', DEST)
