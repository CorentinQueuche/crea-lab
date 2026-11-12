# Planche 14 — les sachets : trois sachets à soufflet en papier blanc cassé, debout sur un comptoir de bois clair,
# scellés par leur pastille, étiquette et tampon de date. Soleil du matin, ombre d'un rameau sur le mur.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drupe import *

reset(2800, 1575, samples=320)
vue()
world_color(hex_rgb(C['fleur']), opt('ciel', 0.34))

bois = mat_bois('bois', scale=2.0)
plane('comptoir', 2.4, 2.4, (0, 0, 0), (0, 0, math.radians(90)), mat=bois)
plane('mur', 3.0, 3.0, (0, 0.46, 1.2), (math.radians(90), 0, 0), mat=mat_papier('mur', C['parche'], rough=0.85, bump=0.5, echelle=420))

for nom, x, y, rz, a, seed in (('huila', -0.142, 0.045, 13, -5, 1), ('guji', 0.0, -0.035, -3, 8, 2), ('nyeri', 0.150, -0.005, -13, 4, 3)):
    s = sachet('sachet-' + nom, art('sachet-' + nom), art('pastille-' + nom), angle=a, seed=seed)
    s.location = (x, y, 0); s.rotation_euler = (0, 0, math.radians(rz))

# Quelques cerises de café au pied du sachet du milieu
for i, (x, y, rz, c) in enumerate(((0.082, -0.125, 20, 1.45), (0.102, -0.108, 200, 1.62), (-0.238, -0.07, 90, 1.5))):
    cerise(f'cerise{i}', (x, y, 0.0068), rz=math.radians(rz), couche=c)

AZ, EL = opt('az', 232.0), opt('el', 33.0)
soleil(AZ, EL, force=opt('soleil', 3.1), angle=0.9, couleur='#FFF8F0')
ds = vers_soleil(AZ, EL)
rameau('rameau', Vector((-0.42, 0.46, 0.17)) + ds * 0.5, (0.85, 0.1, 0.5), n=4, L=0.12, pas=0.075, seed=5, tige=0.003)
rameau('rameau2', Vector((0.16, 0.46, 0.22)) + ds * 0.55, (0.8, -0.1, 0.45), n=3, L=0.12, pas=0.075, seed=11, tige=0.003)
area('debouche', (0.8, -0.9, 0.6), (0, 0, 0.1), 3.0, size=1.0, color=hex_rgb(C['fleur']))

camera((0.03, -1.02, 0.215), (0.0, 0, 0.103), lens=66, dof=1.0, fstop=6.3)
render('14-sachets.png')
