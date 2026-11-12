# Planche 18 — la devanture : boutique d'angle de jour. Façade Parche, lettres DRUPE découpées en Cerise, enseigne drapeau
# ronde au symbole, vitrophanie au semis, store Café vert, chevalet de trottoir avec le triptyque.
# Options : --az= et --el= (soleil), --ciel=hdri pour essayer le ciel Poly Haven.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rue import *

reset(2800, 1870, samples=380)
vue()
az, el = lumiere_de_rue()
construire_rue()

# Un arbre de rue, hors champ à gauche : son feuillage tombe en ombres sur la façade A
ds = vers_soleil(az, el)
for i, (cible, dirv, seed) in enumerate(((Vector((7.6, 0, 5.2)), (0.9, 0.0, 0.45), 3), (Vector((9.0, 0, 3.4)), (0.8, 0.0, 0.6), 7), (Vector((6.4, 0, 2.2)), (0.95, 0, 0.3), 9), (Vector((10.5, 0, 5.6)), (0.7, 0, 0.7), 5))):
    rameau(f'arbre{i}', cible + ds * 7.5, dirv, n=5, L=0.75, pas=0.5, seed=seed, tige=0.03)

camera((-4.7, -8.3, 1.55), (1.95, 0, 2.2), lens=35)
render('18-devanture.png')
