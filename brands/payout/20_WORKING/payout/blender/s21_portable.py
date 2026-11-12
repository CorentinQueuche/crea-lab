# Planche 21 (scène C) : le site sur un ordinateur portable de 14 pouces (312 × 221 × 15,5 mm, écran 16:10),
# posé sur un socle noir laqué de 0,6 × 0,6 × 0,95 m, fond en dégradé sombre. Plan fixe : seul l'écran vit.
# La caméra est droite (horizontale, cadre décalé par shift_x et shift_y) et l'écran vertical : l'écran est un rectangle
# aligné dans l'image, une vidéo s'y incruste avec tools/incruster.py.
# Texture d'écran : out/motion/21-site-ecran.png si elle existe (image fixe de la vidéo du site), sinon out/art/ecran-site.png.
# Écrit out/blender/21-portable.json (coins de l'écran pour un décor de 1920 × 1080) et rend deux images :
#   21-portable.png        2800 × 1575, l'image fixe de la planche
#   21-portable-decor.png  1920 × 1080, le décor de l'incrustation (sauf avec --sans-decor)
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s21_portable.py -- --draft
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from decor import *

sc = reset(2800, 1575, samples=360)
nuit(0.02)

tex = os.path.join(ROOT, 'out', 'motion', '21-site-ecran.png')
if not os.path.exists(tex): tex = art('ecran-site')
print('ECRAN', tex)

# Sol et fond : un mur mat loin derrière, éclairé par une nappe verte basse qui fait le dégradé
plane('sol', 40, 40, (0, 0, 0), mat=mat_floor('sol', color=C['coffre'], rough=0.14, var=0.06, bump=0.008, scale=5.0))
plane('fond', 30, 12, (0, 4.2, 6), (math.radians(90), 0, 0), mat=mat_pbr('fond', '#0C1210', rough=0.9))
h = area('nappe', (-0.3, 3.95, 0.15), (-0.3, 4.2, 1.4), opt('nappe', 110.0), size=4.5, size_y=0.3, color=hex_rgb(C['net'])[:3]); h.visible_glossy = False

# Le socle : noir laqué, arêtes à peine adoucies
SW, SH = 0.60, 0.95
laque = mat_pbr('laque', '#141B17', rough=0.12, coat=1.0)
box('socle', SW, SW, SH, (0, 0, SH / 2), mat=laque, bevel=0.003)

# Le portable, écran vertical face à la caméra, posé un peu en retrait du bord
ecran_m = mat_ecran_lum('ecran', tex, cam=1.0, diffus=opt('jet', 3.0), gloss=0.04)
rep, ecran = portable('portable', ecran_m, ouverture=90.0, loc=(0, 0.02, SH))

# Un liseré froid sur l'arête du capot et du socle
area('froid', (-1.6, -0.6, 2.3), (0, 0.05, SH + 0.1), 55, size=1.2, color=(0.8, 1.0, 0.92))
# La face avant du socle : un faisceau froid et rasant, venu de la gauche, qui s'éteint vers la droite
spot('rasant', (-2.4, -1.5, 0.62), (0.25, -0.3, 0.74), opt('r1', 16.0), angle=17, blend=0.9, color=(0.8, 1.0, 0.92), radius=0.08)
# Une boîte à lumière verte, hors champ, qui ne sert qu'à se refléter en filet sur le flanc droit du socle
b2 = area('reflet-flanc', (2.6, 2.4, 0.55), (0.3, 0, 0.55), opt('r2', 22.0), size=0.5, size_y=0.8, color=hex_rgb(C['net'])[:3]); b2.visible_diffuse = False

CAM = dict(pos=(0.52, -1.92, SH + 0.21), lens=85)
cam = camera(CAM['pos'], (CAM['pos'][0], 0, CAM['pos'][2]), lens=CAM['lens'], dof=1.92 + 0.125, fstop=5.6)      # mise au point sur le plan de l'écran (y = 0,125)
droit(cam, shift_x=opt('sx', -0.60), shift_y=opt('sy', -0.118))

# Coins de l'écran pour le décor de 1920 × 1080 (même cadrage : les deux formats sont en 16:9)
sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
with open(os.path.join(OUT, '21-portable.json'), 'w') as f:
    json.dump({'ecran': cam_rect(ecran), 'w': 1920, 'h': 1080, 'texture': os.path.relpath(tex, ROOT).replace(os.sep, '/')}, f)
print('RECT', cam_rect(ecran))
if '--sans-decor' not in argv() and '--draft' not in argv():
    # Décor de la vidéo : le plateau du socle est dépoli, pour que le reflet de l'écran ne soit qu'une lueur.
    # Net, il montrerait l'image fixe pendant que l'écran incrusté défile.
    pb = next(n for n in laque.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    net_ = (pb.inputs['Roughness'].default_value, pb.inputs['Coat Roughness'].default_value)
    pb.inputs['Roughness'].default_value = 0.5; pb.inputs['Coat Roughness'].default_value = 0.34
    render('21-portable-decor.png', 1920, 1080)
    pb.inputs['Roughness'].default_value, pb.inputs['Coat Roughness'].default_value = net_
render('21-portable.png', 2800, 1575)
