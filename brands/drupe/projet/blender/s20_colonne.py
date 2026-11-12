# Planche 20 — l'affiche de rue : une colonne d'affichage en plein jour, devant le mur de la boutique. Sert de décor :
# la vidéo de l'affiche (motion/20) est incrustée ensuite avec tools/incruster.py.
# Écrit out/blender/20-colonne.json : le rectangle de l'écran en pixels (caméra droite, donc rectangle aligné).
# Version simplifiée d'une colonne : trois faces planes (un écran ne s'enroule pas sur un fût rond), chapeau rond.
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rue import *

reset(1920, 1080, samples=380)
vue()
az, el = lumiere_de_rue()
M = construire_rue()

# La colonne : fût à trois faces, socle, corniche, chapeau rond et épi
CX, CY = 9.2, -1.25
Rc = 1.36 / math.sqrt(3)                 # rayon du triangle de côté 1,36 m
ap = Rc / 2                              # distance du centre à une face
fut = [(0, 0), (Rc + 0.07, 0), (Rc + 0.07, 0.40), (Rc, 0.44), (Rc, 2.74), (Rc + 0.07, 2.78), (Rc + 0.07, 2.9), (0, 2.9)]
tour('colonne', fut, mat=M['feuille'], seg=3, loc=(CX, CY, 0), rot=(0, 0, math.radians(90)), vif=30)
tour('chapeau', [(0, 2.9), (0.74, 2.9), (0.78, 2.94), (0.76, 2.99), (0.5, 3.12), (0.22, 3.27), (0.07, 3.33), (0.05, 3.44), (0.075, 3.48), (0.05, 3.52), (0, 3.53)],
     mat=M['feuille'], seg=72, loc=(CX, CY, 0), vif=50)
SW, SH, ZC = 1.2, 1.8, 1.6
yf = CY - ap
box('vitre-cadre', SW + 0.07, 0.008, SH + 0.07, (CX, yf - 0.004, ZC), mat=mat_pbr('cadre-noir', C['marc'], rough=0.2, coat=0.5))
tex = os.path.join(ROOT, 'out', 'motion', '20-affiche-ecran.png')
if not os.path.exists(tex): tex = art('affiche')
ecran = screen_v('ecran', SW, SH, (CX, yf - 0.0085, ZC), mat_screen('ecran', tex, opt('ecran', 1.0), gloss=0.04))

# Feuillage d'un arbre de rue, hors champ : ombres sur le mur et sur le trottoir
ds = vers_soleil(az, el)
for i, (cible, dirv, seed) in enumerate(((Vector((6.6, 0, 3.0)), (0.9, 0.0, 0.45), 3), (Vector((11.6, 0, 2.2)), (0.8, 0.0, 0.6), 7), (Vector((5.6, 0, 1.4)), (0.95, 0, 0.3), 9),
                                         (Vector((12.4, 0, 3.6)), (0.7, 0, 0.7), 5), (Vector((7.4, 0, 4.4)), (0.85, 0, 0.5), 2))):
    rameau(f'arbre{i}', cible + ds * 7.0, dirv, n=5, L=0.75, pas=0.5, seed=seed, tige=0.03)

cam = camera((8.05, -9.3, 1.60), (8.05, 0, 1.60), lens=40)
cam.data.shift_y = 0.012
with open(os.path.join(OUT, '20-colonne.json'), 'w') as f: json.dump({'ecran': cam_rect(ecran), 'w': 1920, 'h': 1080}, f)
render('20-colonne.png')
