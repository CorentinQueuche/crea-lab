# Planche 12 (droite) — enseigne drapeau ronde, allumée, sur un mur de brique la nuit.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

reset(1400, 1452, samples=420)
world_color((0.012, 0.015, 0.024, 1), 1.0)
brique = mat_pbr_tex('brique', 'red_brick_03', 'red_brick_03', scale=3.2, tint='#6f6a6c', rough_mul=1.0, bump_strength=1.4)
# Mur : plan vertical en y = 0, tourné vers -Y
plane('mur', 8, 8, (0, 0, 2), (math.radians(90), 0, 0), mat=brique)
box('ombre-porte', 2.6, 0.5, 8, (-2.9, -0.1, 2), mat=mat_pbr('noir', '#060607', rough=0.8))

metal = mat_pbr('metal', '#0e0d0f', rough=0.4, metal=1.0)
blanc = mat_emit('blanc', (1, 0.975, 0.95, 1), 2.4)
nuit = mat_pbr('nuit', '#1C1122', rough=0.5)
R, T = 0.34, 0.13
C = (0.35, -0.62, 2.35)   # centre du disque, axe selon X
rx = (0, math.radians(90), 0)
cyl('corps', R, T, C, rx, mat=metal)
cyl('faces', R - 0.022, T + 0.006, C, rx, mat=blanc)
# Symbole « a » sur chaque face (hauteur d'x = 0,30 m), lisible depuis chaque côté
for sgn in (-1, 1):
    o = logo('a' + str(sgn), height=0.30, extrude=0.004, mat=nuit, word='a')
    # centre du glyphe : (0, 50) en unités logo -> 0,15 m de haut
    orient(o, (0, sgn, 0), (0, 0, 1), (C[0] + sgn * (T / 2 + 0.0045), C[1], C[2] - 0.15))
# Potence
box('potence', 0.03, 0.62, 0.03, (C[0], -0.31, C[2] + R + 0.05), mat=metal)
box('tige', 0.012, 0.012, 0.06, (C[0], C[1], C[2] + R + 0.02), mat=metal)
box('platine', 0.14, 0.012, 0.2, (C[0], -0.006, C[2] + R + 0.02), mat=metal)

area('lune', (-3, -5, 5), (0.3, 0, 2.2), 700, size=4, color=hex_rgb('#8ea2c8'))
camera((-1.95, -2.5, 1.5), (0.1, -0.25, 2.28), lens=46)
render('12b-enseigne.png')
