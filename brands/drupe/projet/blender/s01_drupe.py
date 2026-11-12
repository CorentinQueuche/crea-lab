# Planche 01 — ouverture : la drupe coupée, géante. Deux calottes laquées Cerise face à face, séparées par le sillon,
# inclinées de 24° comme le symbole, posées sur une table Parche au soleil du matin. Un rameau de caféier, hors champ, projette son ombre.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drupe import *

reset(2800, 1575, samples=320)
vue(opt('vue', 'Khronos PBR Neutral'))
world_color(hex_rgb(C['fleur']), opt('ciel', 0.32))

R = 1.0
d = R * 4 / 39                         # demi-sillon (8 sur un rayon de 39, comme le symbole)
hr = math.sqrt(R * R - d * d)
f = math.radians(24)
U = Vector((math.sin(f), 0, math.cos(f)))      # axe du sillon
V = Vector((math.cos(f), 0, -math.sin(f)))     # normale au sillon
Yw = Vector((0, 1, 0))

laque = mat_pbr('laque', C['cerise'], rough=0.22, coat=opt('coat', 0.55))
chair = mat_pbr('chair', C['pulpe'], rough=0.55)
ch = 0.02
a0 = math.degrees(math.asin((d + ch) / R))
dome = arc(R, a0, 90, 56); dome[-1] = (0, R)
prof_dome = [(hr - ch, d)] + dome
prof_face = [(0, d), (hr - ch, d)]

glisse = 0.105 * R                     # la moitié gauche glisse le long du sillon jusqu'à toucher la table
Cc = Vector((0, 0, R - 0.04))
for nom, sens, centre in (('droite', 1, Cc), ('gauche', -1, Cc - U * glisse)):
    for p, m, suf in ((prof_dome, laque, 'dome'), (prof_face, chair, 'face')):
        o = tour(f'{nom}-{suf}', p, mat=m, seg=160, vif=30)
        poser(o, Yw, U * sens, centre)

# La queue : même arc que le symbole (rayon 22, graisse 9, 50°), calée dans le haut du sillon
rq, gq = R * 22 / 39, R * 9 / 39
s0 = Cc + U * (R + R * 4 / 39)
K = s0 + V * rq
pts = [tuple(s0 - U * 0.16)] + [tuple(K + (-V * math.cos(math.radians(t)) + U * math.sin(math.radians(t))) * rq) for t in range(0, 51, 10)]
q = tube('queue', pts, gq / 2, mat=laque); q.data.use_fill_caps = True

# Table et mur
plane('table', 60, 60, (0, 0, 0), mat=mat_papier('table', C['parche'], rough=0.7, bump=0.1, echelle=260))
plane('mur', 60, 14, (0, 5.2, 7), (math.radians(90), 0, 0), mat=mat_papier('mur', C['parche'], rough=0.85, bump=0.5, echelle=60))

AZ, EL = opt('az', 207.0), opt('el', 23.0)
soleil(AZ, EL, force=opt('soleil', 3.0), angle=0.9, couleur='#FFF8F0')
ds = vers_soleil(AZ, EL)
# Rameaux hors champ : l'un porte son ombre sur la table, au premier plan ; l'autre sur le mur
rameau('rameau-table', Vector((-2.3, -3.4, 0.0)) + ds * 4.0, (0.25, 0.9, 0.2), n=3, L=0.9, pas=0.6, seed=4, tige=0.03)
rameau('rameau-mur', Vector((-3.0, 5.2, 2.3)) + ds * 4.2, (0.9, 0.1, 0.42), n=4, L=0.95, pas=0.6, seed=9, tige=0.03)

area('debouche', (6, -6, 5), (0, 0, 1), 90, size=8, color=hex_rgb(C['fleur']))
camera((0.55, -9.6, 1.35), (0.12, 0, 1.08), lens=60)
render(opt('nom', '01-drupe') + '.png')
