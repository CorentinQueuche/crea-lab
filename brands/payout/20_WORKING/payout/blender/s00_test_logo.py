# Test du socle en 3D : logotype, descripteur et symbole de Payout en volume, lus depuis brand/logo/logo.json,
# en scene de nuit : lettres lumineuses en vert Net sur un sol sombre et brillant, la jauge en 20 segments (17 allumes = 85 %).
# A relancer apres toute retouche du logo (tools/export_logo.py) : il revele ce que la page de test HTML ne peut pas voir
# (contours de police qui se chevauchent, lettre trouee, logo en miroir, repere mal declare).
# Le y du logotype descend de 40 % de la hauteur d'x sous la ligne de base : un logotype debout se pose a z = 0,4 x height
# (ou se monte sur un mur), jamais a z = 0.
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s00_test_logo.py -- --draft
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from payout import *

reset(2800, 1100, samples=160)
nuit(0.015)
sol_sombre()
plane('fond', 60, 20, (0, 9, 10), (math.radians(90), 0, 0), mat=mat_pbr('fond', C['coffre'], rough=0.9))

net = mat_net('net', 1.15)
blanc = mat_emit('blanc', hex_rgb('#F3F6F4'), 0.9)
eteint = mat_pbr('eteint', C['net900'], rough=0.35, emit=C['net700'], emit_strength=0.35)
laque = mat_pbr('laque', C['ardoise'], rough=0.22, coat=0.6)

H = 0.5                       # hauteur d'x du logotype, en metres
X = -2.1                      # centre du logotype
Z = 0.4 * H + 0.36            # ligne de base : le y descend de 0,4 x H ; 0,36 m de socle dessous
logo('logotype', height=H, extrude=0.14, mat=net, part='logotype', loc=(X, 0, Z))
logo('descripteur', height=H, extrude=0.03, mat=blanc, part='descripteur', loc=(X, 0, Z))
# Le symbole en volume laque sombre, eclaire par les lettres : il doit rester lisible sans lumiere propre
logo('symbole', height=1.7, extrude=0.3, mat=net, part='symbole', loc=(3.75, 0.2, 0))
# La jauge : 20 segments, 17 allumes (85 %), sous la version complete (largeur 1025 / 100 x H)
L = 1025 / 100 * H
jauge_segments('jauge', L, 0.26, 0.1, p=85, n=20, ecart=0.3, loc=(X - 3.24 / 2 * 1.0 + L / 2 - 0.0, -0.45, 0), mat_on=net, mat_off=eteint)
box('socle', L, 0.12, 0.02, (X - 1.62 + L / 2, 0, Z - 0.4 * H - 0.02 + 0.01), mat=laque)

area('froid', (-6, -6, 7), (0, 0, 0.6), 120, size=4.0, color=(0.75, 1.0, 0.85))
camera((0.1, -13.6, 1.9), (0.1, 0, 0.62), lens=50)
render('00-test-logo.png')
