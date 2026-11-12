# Planche 10 (scène B) : la jauge en volume. 20 segments debout sur 2,0 m (70 × 40 × 400 mm, écart de 30 mm),
# 17 allumés en Net (85 %), 3 éteints (ce qui part). Sol sombre et brillant, règle et repères 0, 54, 85 et 100 devant.
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s10_jauge.py -- --draft
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from decor import *

reset(2800, 1575, samples=320)
nuit(0.02)
plane('sol', 40, 40, (0, 0, 0), mat=mat_floor('sol', color=C['coffre'], rough=0.1, var=0.05, bump=0.006, scale=7.0))
# Fond : un mur sombre et mat, loin derrière, qui prend un peu du vert de la jauge
plane('fond', 60, 16, (0, 7.5, 8), (math.radians(90), 0, 0), mat=mat_pbr('fond', '#0B100E', rough=0.85))

L, H, EP, N = 2.0, 0.40, 0.04, 20
net = mat_lum('net', cam=1.15, diffus=5.0, cote=C['net700'])
eteint = mat_pbr('eteint', '#0A1F14', rough=0.14, coat=1.0, emit=C['net900'], emit_strength=0.6)
jauge_segments('jauge', L, H, EP, p=85, n=N, ecart=0.30, loc=(0, 0, 0), mat_on=net, mat_off=eteint)

# Repères posés à plat devant la jauge, en Chivo Mono : 0, 54 (Prélevé, le seul accent chaud), 85, 100
gris = mat_emit('gris', hex_rgb(C['acier']), 0.55)
blanc = mat_emit('blanc', hex_rgb(SUR), 0.9)
chaud = mat_emit('chaud', hex_rgb(C['preleve']), 1.0)
x = lambda p: -L / 2 + L * p / 100
Y0 = -0.16
box('regle', L, 0.0016, 0.0006, (0, Y0, 0.0004), mat=gris)
for p, m, t in ((0, gris, '0'), (54, chaud, '54'), (85, blanc, '85'), (100, gris, '100')):
    box(f'trait{p}', 0.0022, 0.05, 0.0006, (x(p), Y0 - 0.025, 0.0005), mat=m)
    # chiffres debout, face à la caméra : à plat, ils seraient illisibles sous cet angle
    chiffres(f'n{p}', t, 0.062, 'Medium', loc=(x(p) + 0.012, Y0 - 0.03, 0.006), rot=(math.radians(90), 0, 0), mat=m, extrude=0.0015)

# Un trait de lumière froide très doux, de côté, pour dessiner les trois segments éteints
area('froid', (3.2, -2.4, 1.6), (0.8, 0, 0.2), 140, size=1.6, color=(0.8, 1.0, 0.9))
# Lueur verte au bas du mur du fond : elle détache la jauge du noir (invisible dans les reflets du sol)
h = area('lueur', (-0.6, 4.6, 0.25), (-0.4, 7.5, 1.6), 900, size=7.0, size_y=0.6, color=hex_rgb(C['net'])[:3]); h.visible_glossy = False
camera((1.05, -3.05, 0.5), (0.075, 0.0, 0.14), lens=46, dof=3.1, fstop=2.8)
render('10-jauge.png')
