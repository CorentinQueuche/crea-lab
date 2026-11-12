# Test du socle en 3D : logotype, descripteur et symbole en volume, lus depuis brand/logo/logo.json.
# A lancer des que le socle est ecrit : il revele ce que la page de test HTML ne peut pas voir
# (contours de police qui se chevauchent, lettre trouee, logo en miroir, repere mal declare).
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s00_test_logo.py -- --draft
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

reset(2800, 1100, samples=128)
world_color((1, 1, 1, 1), 0.3)
plane('sol', 30, 30, (0, 0, 0), mat=mat_pbr('sol', '#E8E4DF', rough=0.7))
a = mat_pbr('a', '#222226', rough=0.4)
b = mat_pbr('b', '#8A8A90', rough=0.5)
logo('logotype', height=0.5, extrude=0.12, mat=a, part='logotype', loc=(-0.9, 0, 0))
logo('descripteur', height=0.5, extrude=0.03, mat=b, part='descripteur', loc=(-0.9, 0, 0))
logo('symbole', height=0.9, extrude=0.16, mat=a, part='symbole', loc=(3.6, 0.4, 0))
area('jour', (-3.5, -4.5, 6), (0.4, 0, 0.3), 700, size=1.2)
camera((1.0, -9.5, 2.3), (1.0, 0, 0.36), lens=50)
render('00-test-logo.png')
