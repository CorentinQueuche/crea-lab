# Planche 22 — un téléphone posé sur du béton, publication Aube à l'écran, lumière dure du matin.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

reset(2800, 1600, samples=360)
world_color((0.03, 0.032, 0.04, 1), 1.0)
beton = mat_pbr_tex('beton', 'concrete_floor_02', 'concrete_floor_02', scale=5.0, tint='#8b8582')
plane('table', 2.0, 2.0, (0, 0, 0), mat=beton)
# Marche : un second plan plus haut, au fond, pour la profondeur
box('marche', 2.0, 0.6, 0.05, (0, 0.48, 0.025), (0, 0, math.radians(-7)), mat=beton)

PW, PH, PT = 0.0716, 0.1470, 0.0082
rz = math.radians(-24)
titane = mat_pbr('titane', '#4b4a4d', rough=0.32, metal=1.0)
verre = mat_pbr('verre', '#020203', rough=0.04, coat=1.0)
rrect('corps', PW, PH, 0.0118, PT, bevel=0.0012, mat=titane, loc=(0, 0, PT / 2), rot=(0, 0, rz))
rrect('dalle', PW - 0.0022, PH - 0.0022, 0.0108, 0.0004, mat=verre, loc=(0, 0, PT + 0.0001), rot=(0, 0, rz))
plane('ecran', PW - 0.0052, PH - 0.0052, (0, 0, PT + 0.00035), (0, 0, rz), mat=mat_screen('ecran', os.path.join(ART, 'post.png'), 1.5, gloss=0.05, rough=0.03))

spot('soleil', (-1.1, 0.8, 0.62), (0, 0.02, 0), 560, angle=30, blend=0.1, color=hex_rgb('#ffe6cc'), radius=0.006)
box('volet', 1.6, 0.02, 0.5, (-0.3, 0.62, 0.5), (0, math.radians(6), math.radians(-18)), mat=titane)
area('debouche', (0.5, -0.5, 0.6), (0, 0, 0), 2.2, size=0.8, color=hex_rgb('#c9d4ea'))
camera((0.015, -0.13, 0.46), (0.004, 0.014, 0), lens=62)
render('22-telephone.png')
