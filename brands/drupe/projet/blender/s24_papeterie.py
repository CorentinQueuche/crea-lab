# Planche 24 — papeterie et petite signalétique : cartes de visite (recto Cerise, verso Fleur), carte de fidélité à tamponner
# et son tampon, sac en kraft blanchi au pochoir, pastilles autocollantes, sur une table claire.
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drupe import *

reset(2800, 1575, samples=340)
vue()
world_color(hex_rgb(C['fleur']), opt('ciel', 0.36))
plane('table', 1.6, 1.6, (0, 0, 0), (0, 0, math.radians(90)), mat=mat_bois('table', scale=1.6))

# Sac en kraft blanchi, à plat : un corps mince, sa face imprimée, le fond replié
kraft = mat_papier('kraft', C['parche'], rough=0.85, bump=0.3, echelle=700, froisse=0.25)
SW, SH = 0.24, 0.32; rs = math.radians(7); cs = (-0.105, 0.022)
box('sac-corps', SW, SH, 0.004, (cs[0], cs[1], 0.002), (0, 0, rs), mat=kraft, bevel=0.0012)
plane('sac', SW - 0.002, SH - 0.002, (cs[0], cs[1], 0.00412), (0, 0, rs), mat=mat_image('sac', art('sac'), rough=0.85, bump=0.25))

CW, CH = 0.085, 0.055
blanc = mat_papier('papier', C['fleur'], rough=0.7)
# Carte de fidélité, posée sur le bas du sac
carte('fidelite', CW, CH, art('carte-fidelite'), (-0.062, -0.058, 0.0043), rz=math.radians(-9), papier=blanc)
# Pile de cartes de visite, recto Cerise, et une carte retournée
a = math.radians(-13); pile = (0.098, 0.052)
box('pile', CW, CH, 0.008, (pile[0], pile[1], 0.004), (0, 0, a), mat=blanc)
random.seed(3)
for i in range(4):
    carte(f'recto{i}', CW, CH, art('carte-recto'), (pile[0] + random.uniform(-.001, .001), pile[1] + random.uniform(-.001, .001), 0.008 + i * 0.00066), rz=a + math.radians(random.uniform(-2.2, 2.2)), papier=blanc)
carte('verso', CW, CH, art('carte-verso'), (0.118, -0.050, 0), rz=math.radians(9), papier=blanc)

# Tampon : semelle, col et pommeau laqué Feuille ; sa plaque porte le symbole
bois = mat_pbr('hetre', '#d6b98c', rough=0.5)
tp = (0.035, -0.082)
tour('tampon-semelle', [(0, 0), (0.0205, 0), (0.0215, 0.001), (0.0215, 0.011), (0.0205, 0.012), (0, 0.012)], mat=bois, loc=(tp[0], tp[1], 0), vif=50)
tour('tampon-manche', [(0, 0.012), (0.011, 0.012), (0.0075, 0.022), (0.0065, 0.036)] + arc(0.0125, -55, 90, 14, 0, 0.047)[1:-1] + [(0, 0.0595)],
     mat=mat_pbr('laque-feuille', C['feuille'], rough=0.25, coat=0.6), loc=(tp[0], tp[1], 0), vif=60)

# Pastilles autocollantes
for nom, x, y, rz in (('huila', 0.052, 0.110, -8), ('nyeri', 0.192, 0.012, 11), ('guji', 0.172, 0.100, 5)):
    dq = disque_image('pastille-' + nom, 0.05, art('pastille-' + nom), ep=0.0003); dq.location = (x, y, 0); dq.rotation_euler = (0, 0, math.radians(rz))
for i, (x, y, rz, c) in enumerate(((0.045, -0.02, 30, 1.5), (0.19, -0.085, 200, 1.6), (0.172, -0.098, 80, 1.46))):
    cerise(f'cerise{i}', (x, y, 0.0068), rz=math.radians(rz), couche=c)

AZ, EL = opt('az', 152.0), opt('el', 30.0)
soleil(AZ, EL, force=opt('soleil', 3.0), angle=0.8, couleur='#FFF8F0')
ds = vers_soleil(AZ, EL)
rameau('rameau', Vector((0.22, 0.10, 0.0)) + ds * 0.45, (-0.75, -0.6, 0.15), n=4, L=0.12, pas=0.075, seed=5, tige=0.003)
area('debouche', (0.4, -0.6, 0.7), (0, 0, 0), 3.0, size=1.0, color=hex_rgb(C['fleur']))

camera((0.0, -0.36, 0.56), (-0.002, 0.008, 0), lens=56, dof=0.66, fstop=8)
render('24-papeterie.png')
