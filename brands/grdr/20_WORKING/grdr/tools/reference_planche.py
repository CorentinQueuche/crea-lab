# Prépare un dossier de référence pour qu'on puisse le regarder vite : une vignette par média et une planche d'ensemble.
# Usage :  python tools/reference_planche.py <dossier-de-la-reference> [<autre-dossier> …] [--l 1100] [--cols 4]
#   <dossier>/_vignettes/<nom>.jpg : une image de 1100 px de large par média (pour un GIF : six images réparties dans le temps)
#   <dossier>/_planche.jpg         : tous les médias dans l'ordre, en colonnes, pour une vue d'ensemble
# Les médias sont les fichiers image du dossier (png, jpg, jpeg, gif, webp), dans l'ordre de leur nom.
import sys
try: sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
except Exception: pass
import glob, os
from PIL import Image, ImageSequence

a = sys.argv[1:]
opt = lambda k, d: int(a[a.index('--' + k) + 1]) if ('--' + k) in a else d
L, COLS = opt('l', 1100), opt('cols', 4)
dossiers = [x for i, x in enumerate(a) if not x.startswith('--') and (i == 0 or not a[i - 1].startswith('--'))]

def vignette(f):
    im = Image.open(f)
    if getattr(im, 'is_animated', False) and im.n_frames > 4:
        idx = [round(k * (im.n_frames - 1) / 5) for k in range(6)]; fr = []
        for k, frame in enumerate(ImageSequence.Iterator(im)):
            if k in idx: fr.append(frame.convert('RGB').copy())
        w = L // 3; fr = [x.resize((w, max(1, round(x.height * w / x.width)))) for x in fr]
        h = fr[0].height; out = Image.new('RGB', (w * 3, h * 2), (0, 0, 0))
        for k, x in enumerate(fr[:6]): out.paste(x, ((k % 3) * w, (k // 3) * h))
        return out
    im = im.convert('RGB')
    if im.width > L: im = im.resize((L, round(im.height * L / im.width)), Image.LANCZOS)
    return im

for d in dossiers:
    fs = sorted(f for f in glob.glob(os.path.join(d, '*')) if os.path.splitext(f)[1].lower() in ('.png', '.jpg', '.jpeg', '.gif', '.webp') and not os.path.basename(f).startswith('_'))
    if not fs: print(d, ': aucun média'); continue
    os.makedirs(os.path.join(d, '_vignettes'), exist_ok=True); vs = []
    for f in fs:
        try: v = vignette(f)
        except Exception as e: print('  illisible :', os.path.basename(f), e); continue
        v.save(os.path.join(d, '_vignettes', os.path.splitext(os.path.basename(f))[0] + '.jpg'), quality=84); vs.append(v)
    # planche : colonnes de 360 px, chaque image dans la colonne la plus courte (l'ordre de lecture reste à peu près celui de la page)
    w = 360; cols = [[] for _ in range(COLS)]; hs = [0] * COLS
    for v in vs:
        t = v.resize((w, max(1, round(v.height * w / v.width)))); k = hs.index(min(hs)); cols[k].append((hs[k], t)); hs[k] += t.height + 8
    out = Image.new('RGB', (COLS * (w + 8) - 8, max(hs)), (60, 60, 60))
    for k, c in enumerate(cols):
        for y, t in c: out.paste(t, (k * (w + 8), y))
    out.save(os.path.join(d, '_planche.jpg'), quality=82)
    print(f'{os.path.basename(os.path.normpath(d))} : {len(vs)} vignettes, planche {out.size[0]}x{out.size[1]}')
