# Planche 12 (gauche) — cartes de visite sur béton, lumière rasante découpée.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

reset(1400, 1452, samples=360)
world_color((0.02, 0.022, 0.028, 1), 1.0)
beton = mat_pbr_tex('beton', 'concrete_floor_worn_001', 'concrete_floor_worn_001', scale=5.5, tint='#77706f', rough_mul=1.0)
plane('table', 1.4, 1.4, (0, 0, 0), mat=beton)

CW, CH = 0.085, 0.055
papier = mat_pbr('papier', '#f1eeea', rough=0.6)
recto = mat_image('recto', os.path.join(ART, 'carte-recto.png'), rough=0.42, coat=0.25)
verso = mat_image('verso', os.path.join(ART, 'carte-verso.png'), rough=0.6, bump=0.15)

def carte(name, mat, loc, rz, thick=0.0005):
    box(name + '-corps', CW, CH, thick, (loc[0], loc[1], loc[2] + thick / 2), (0, 0, rz), mat=papier)
    plane(name, CW, CH, (loc[0], loc[1], loc[2] + thick + 0.00003), (0, 0, rz), mat=mat)

# Pile : le bloc, puis quelques cartes légèrement décalées
a = math.radians(27)
box('pile', CW, CH, 0.0085, (-0.03, 0.034, 0.00425), (0, 0, a), mat=papier)
import random; random.seed(3)
for i in range(4):
    carte(f'p{i}', recto, (-0.03 + random.uniform(-.0008, .0008), 0.034 + random.uniform(-.0008, .0008), 0.0085 + i * 0.00056), a + math.radians(random.uniform(-1.2, 1.2)))
carte('seule', verso, (0.038, -0.036, 0), math.radians(27))

# Soleil bas et chaud, découpé par deux volets hors champ
spot('soleil', (-0.55, 0.5, 0.62), (0, 0, 0), 135, angle=38, blend=0.15, color=hex_rgb('#ffe3c4'), radius=0.004)
box('volet1', 0.5, 0.01, 0.3, (-0.42, 0.2, 0.36), (0, math.radians(8), math.radians(-48)), mat=papier)
box('volet2', 0.03, 0.01, 0.6, (-0.24, 0.3, 0.3), (0, math.radians(30), math.radians(-48)), mat=papier)
area('debouche', (0.4, -0.4, 0.5), (0, 0, 0), 1.6, size=0.6, color=hex_rgb('#c9d4ea'))
camera((0.012, -0.085, 0.4), (0.004, 0, 0), lens=72)
render('12a-cartes.png')
