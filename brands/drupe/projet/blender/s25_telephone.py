# Planche 25 — le téléphone : posé sur le comptoir de bois clair, écran sur la fiche du Guji, à côté d'un sachet couché
# et de quelques cerises de café. Lumière du matin, ombre de feuilles.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drupe import *

reset(2800, 1575, samples=340)
vue()
world_color(hex_rgb(C['fleur']), opt('ciel', 0.36))
plane('comptoir', 1.6, 1.6, (0, 0, 0), (0, 0, math.radians(90)), mat=mat_bois('bois', scale=1.6))

# Téléphone
PW, PH, PT = 0.0716, 0.1470, 0.0082
rz = math.radians(-14); P = (0.068, 0.0)
alu = mat_pbr('alu', '#cfc9bf', rough=0.3, metal=1.0)
verre = mat_pbr('verre', '#050404', rough=0.04, coat=1.0)
rrect('corps', PW, PH, 0.0118, PT, bevel=0.0012, mat=alu, loc=(P[0], P[1], PT / 2), rot=(0, 0, rz))
rrect('dalle', PW - 0.0022, PH - 0.0022, 0.0108, 0.0004, mat=verre, loc=(P[0], P[1], PT + 0.0001), rot=(0, 0, rz))
plane('ecran', PW - 0.0052, (PW - 0.0052) * 844 / 390, (P[0], P[1], PT + 0.00035), (0, 0, rz), mat=mat_ecran('ecran', art('ecran'), opt('ecran', 1.25)))

# Sachet couché à gauche, le haut vers le fond
s = sachet('sachet', art('sachet-guji'), art('pastille-guji'), angle=-7, seed=2)
s.rotation_euler = (math.radians(-90), 0, math.radians(11)); s.location = (-0.082, -0.105, 0.030)

# Cerises de café et deux feuilles
import random; random.seed(7)
for i, (x, y) in enumerate(((0.150, -0.050), (0.168, -0.030), (0.142, -0.022), (0.186, 0.040), (0.004, 0.088), (-0.006, -0.108), (0.200, 0.058))):
    cerise(f'cerise{i}', (x, y, 0.0068), rz=random.uniform(0, 6.28), couche=random.uniform(1.42, 1.66))
vert = mat_pbr('feuille', C['feuille'], rough=0.32, coat=0.4)
f1 = feuille('feuille1', L=0.105, W=0.044, mat=vert, pli=0.07, onde=0.35); f1.location = (0.092, 0.082, 0.0065); f1.rotation_euler = (math.radians(180), 0, math.radians(14))

AZ, EL = opt('az', 148.0), opt('el', 31.0)
soleil(AZ, EL, force=opt('soleil', 3.0), angle=0.8, couleur='#FFF8F0')
ds = vers_soleil(AZ, EL)
rameau('rameau', Vector((0.26, 0.02, 0.0)) + ds * 0.45, (-0.8, -0.5, 0.15), n=4, L=0.12, pas=0.075, seed=6, tige=0.003)
area('debouche', (0.4, -0.6, 0.7), (0, 0, 0), 3.0, size=1.0, color=hex_rgb(C['fleur']))

camera((0.012, -0.31, 0.55), (0.008, -0.004, 0), lens=57, dof=0.63, fstop=8)
render('25-telephone.png')
