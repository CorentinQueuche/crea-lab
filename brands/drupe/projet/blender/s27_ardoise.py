# Planche 27 — l'ardoise : l'écran derrière le comptoir, sur le mur Pulpe de la boutique, au-dessus de l'étagère des sachets
# et du plan de travail (un gobelet, une tasse).
# Sert de décor : la vidéo de l'ardoise (motion/27) est incrustée ensuite avec tools/incruster.py.
# Écrit out/blender/27-ardoise.json : le rectangle de l'écran en pixels (caméra droite, donc rectangle aligné).
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drupe import *

reset(1920, 1080, samples=380)
vue()
world_color(hex_rgb(C['fleur']), opt('ciel', 0.3))

plane('mur', 8, 8, (0, 0, 2), (math.radians(90), 0, 0), mat=mat_papier('mur', C['pulpe'], rough=0.85, bump=0.4, echelle=300))
# L'écran et son cadre
EW, EH, EZ = 1.6, 0.9, 1.90
feuille_ = mat_pbr('laque-feuille', C['feuille'], rough=0.35, coat=0.3)
box('cadre', EW + 0.07, 0.035, EH + 0.07, (0, -0.0175, EZ), mat=feuille_, bevel=0.004)
tex = os.path.join(ROOT, 'out', 'motion', '27-ardoise-ecran.png')
if not os.path.exists(tex): tex = art('ardoise')
ecran = screen_v('ecran', EW, EH, (0, -0.0365, EZ), mat_screen('ecran', tex, opt('ecran', 1.0), gloss=0.03))

# Étagère et sachets
bois = mat_bois('bois', scale=1.0)
hetre = mat_pbr('hetre', '#dcc7a2', rough=0.5)
box('etagere', 2.3, 0.2, 0.03, (0, -0.1, 1.14), mat=hetre)
for x in (-0.9, 0.9): box(f'console{x}', 0.03, 0.16, 0.12, (x, -0.08, 1.065), mat=feuille_)
ordre = ['huila', 'guji', 'nyeri', 'guji', 'huila', 'nyeri', 'guji']
for i, nom in enumerate(ordre):
    s = sachet(f'sachet{i}', art('sachet-' + nom), art('pastille-' + nom), angle=(-7, 5, 9, -4, 6, -8, 3)[i], seed=i)
    s.location = (-0.93 + i * 0.31 + (0.012 if i % 2 else -0.008), -0.105, 1.155); s.rotation_euler = (0, 0, math.radians((6, -4, 3, -7, 5, -3, 8)[i]))

# Le plan de travail contre le mur, un gobelet et une tasse
plane('comptoir', 5, 0.62, (0, -0.31, 0.90), mat=bois)
box('comptoir-face', 5, 0.02, 0.9, (0, -0.61, 0.449), mat=feuille_)
g = gobelet('gobelet', art('gobelet'), loc=(-1.02, -0.30, 0.90), rz=math.radians(8))
gres = mat_gres('gres', C['vert'])
tasse('tasse', gres, loc=(1.0, -0.33, 0.9045), rz=math.radians(-30), soucoupe=gres)

AZ, EL = opt('az', 214.0), opt('el', 30.0)
soleil(AZ, EL, force=opt('soleil', 2.6), angle=0.8, couleur='#FFF8F0')
ds = vers_soleil(AZ, EL)
rameau('rameau', Vector((-1.75, 0, 2.15)) + ds * 1.5, (0.8, 0.1, 0.5), n=3, L=0.26, pas=0.17, seed=5, tige=0.008)
area('debouche', (2.5, -4, 3), (0, 0, 1.6), 90, size=3, color=hex_rgb(C['fleur']))

cam = camera((0, -3.3, 1.52), (0, 0, 1.52), lens=40)
cam.data.shift_y = 0.03
with open(os.path.join(OUT, '27-ardoise.json'), 'w') as f: json.dump({'ecran': cam_rect(ecran), 'w': 1920, 'h': 1080}, f)
render('27-ardoise.png')
