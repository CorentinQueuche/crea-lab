# Planche 28 (scène D) : le téléphone incliné. 71,5 × 146,7 × 7,8 mm, coins de 9 mm, couché en diagonale sur du verre
# sombre, écran « solde » (Marque.screens.solde). Gros plan, profondeur de champ courte, image fixe.
# Variante : -- --ecran=tel-cra
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s28_telephone.py -- --draft
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from decor import *

reset(2800, 1575, samples=420)
nuit(0.02)

# Verre sombre, et une marche d'Ardoise un peu plus claire au fond : la diagonale de la composition
plane('verre', 3, 3, (0, 0, 0), mat=mat_floor('verre', color='#070B09', rough=0.09, var=0.04, bump=0.004, scale=30.0))
box('marche', 1.2, 0.5, 0.012, (-0.14, 0.33, 0.006), (0, 0, math.radians(38)), mat=mat_pbr('marche', '#1A231E', rough=0.42), bevel=0.001)

ecran_m = mat_ecran_lum('ecran', art(opt('ecran', 'tel-solde')), cam=1.0, diffus=2.5, gloss=0.05, rough=0.03, alpha=True)
rep, ecran = telephone('tel', ecran_m, loc=(0.0, 0.0, 0.0), rz=math.radians(-34))

# Lumière : une grande boîte froide et basse à gauche pour le filet sur la tranche, un reflet vert sur le verre à droite
area('froid', (-0.5, 0.25, 0.32), (0, 0, 0), 5.0, size=0.5, color=(0.82, 1.0, 0.93))
v = area('vert', (0.55, 0.5, 0.2), (0.05, 0.05, 0), 3.0, size=0.5, size_y=0.12, color=hex_rgb(C['net'])[:3])

# Mise au point sur le montant du solde (haut de l'écran)
cam = camera((0.052, -0.185, 0.225), (0.018, 0.026, 0.0), lens=70, dof=0.306, fstop=opt('f', 4.0))
render('28-telephone.png')
