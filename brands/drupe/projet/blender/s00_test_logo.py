# Test du socle en 3D : logotype, descripteur et symbole de Drupe en volume, lus depuis brand/logo/logo.json.
# A relancer apres toute retouche du logo (tools/export_logo.py) : il revele ce que la page de test HTML ne peut pas voir
# (contours de police qui se chevauchent, lettre trouee, logo en miroir, repere mal declare).
# Usage, depuis la racine du projet :  blender -b -P blender/s00_test_logo.py -- --draft
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drupe import *

reset(2800, 1100, samples=128)
vue()
world_color(hex_rgb(C['fleur']), 0.35)
plane('sol', 30, 30, (0, 0, 0), mat=mat_papier('sol', C['parche'], rough=0.7, bump=0.1, echelle=260))
cerise_laque = mat_pbr('cerise', C['cerise'], rough=0.3, coat=0.4)
grain = mat_pbr('grain', C['grain'], rough=0.5)
feuille_laque = mat_pbr('feuille', C['feuille'], rough=0.3, coat=0.4)
logo('logotype', height=0.5, extrude=0.12, mat=cerise_laque, part='logotype', loc=(-0.9, 0, 0))
logo('descripteur', height=0.5, extrude=0.03, mat=grain, part='descripteur', loc=(-0.9, 0, 0))
logo('symbole', height=0.9, extrude=0.16, mat=feuille_laque, part='symbole', loc=(3.6, 0.4, 0))
soleil(215, 30, force=3.0, angle=0.9, couleur='#FFF8F0')
camera((1.0, -9.5, 2.3), (1.0, 0, 0.36), lens=50)
render('00-test-logo.png')
