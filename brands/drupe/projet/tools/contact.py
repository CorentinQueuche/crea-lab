# Planche-contact : assemble des images (et la première image utile de vidéos) en colonnes, pour tout regarder d'un coup.
# Usage :  python tools/contact.py <sortie.jpg> <fichier ou motif> [...] [--cols 3] [--l 620] [--numeros] [--par 8]
#   --par N : une planche par groupe de N fichiers (sortie-1.jpg, sortie-2.jpg…), pour garder des vignettes lisibles.
# Exemples :  python tools/contact.py out/plates/_contact.jpg "out/plates/[0-9]*.png"
#             python tools/contact.py out/blender/_brouillons.jpg "out/blender/draft-*.png" --cols 2 --numeros
import sys
try: sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
except Exception: pass
import glob, os, subprocess, tempfile
from PIL import Image, ImageDraw

a = sys.argv[1:]
def opt(k, d):
    if ('--' + k) in a:
        i = a.index('--' + k); v = a[i + 1]; del a[i:i + 2]; return int(v)
    return d
cols_n, W, PAR = opt('cols', 3), opt('l', 620), opt('par', 0)
numeros = '--numeros' in a
if numeros: a.remove('--numeros')
out, pats = a[0], a[1:]
files = []
for p in pats:
    files += sorted(glob.glob(p)) or ([p] if os.path.exists(p) else [])
files = [f for f in files if os.path.abspath(f) != os.path.abspath(out)]
if not files: sys.exit('Aucun fichier trouvé.')
tmp = tempfile.mkdtemp()
groupes = [files[i:i + PAR] for i in range(0, len(files), PAR)] if PAR else [files]
base_out = out; num0 = 0
for gi, files in enumerate(groupes, 1):
  out = base_out.replace('.jpg', f'-{gi}.jpg') if PAR else base_out
  cols = [[] for _ in range(cols_n)]; hs = [0] * cols_n
  for n, f in enumerate(files, num0 + 1):
      src = f
      if f.lower().endswith(('.mp4', '.gif', '.webm', '.mov')):
          d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout.strip()
          d = float(d) if d and d != 'N/A' else 2.0
          src = os.path.join(tmp, f'{n}.jpg')
          subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(d * 0.7), '-i', f, '-frames:v', '1', src], capture_output=True)
      im = Image.open(src).convert('RGB'); im = im.resize((W, max(1, round(im.height * W / im.width))), Image.LANCZOS)
      if numeros:
          dr = ImageDraw.Draw(im); label = f'{n} {os.path.basename(f)}'
          dr.rectangle((0, 0, 9 + 7 * len(label), 18), fill=(0, 0, 0)); dr.text((5, 3), label, fill=(255, 255, 255))
      k = hs.index(min(hs)); cols[k].append(im); hs[k] += im.height + 10
  sheet = Image.new('RGB', (cols_n * (W + 10) - 10, max(hs)), (70, 70, 70))
  for k, c in enumerate(cols):
      y = 0
      for im in c: sheet.paste(im, (k * (W + 10), y)); y += im.height + 10
  sheet.save(out, quality=86)
  print(out, sheet.size, len(files), 'fichiers')
  num0 += len(files)
