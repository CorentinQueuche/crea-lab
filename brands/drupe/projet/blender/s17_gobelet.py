# Planche 17 — gobelet et tasse : un gobelet à emporter Fleur à pastille Cerise et une tasse en grès Café vert,
# sur le rebord de la vitrine. Le soleil traverse la vitrophanie : les drupes du semis tombent en ombres longues.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drupe import *

reset(2800, 1575, samples=340)
vue()
world_color(hex_rgb(C['fleur']), opt('ciel', 0.34))

# Rebord en bois clair, allège et mur du fond peints
plane('rebord', 2.4, 2.4, (0, 1.06, 0), mat=mat_bois('rebord', scale=2.4))
box('chant', 2.4, 0.012, 0.034, (0, -0.146, -0.017), mat=mat_pbr('chant', '#d9c4a3', rough=0.6))
box('allege', 2.4, 0.02, 1.0, (0, -0.132, -0.534), mat=mat_papier('allege', C['parche'], rough=0.85, bump=0.4, echelle=420))
plane('mur', 3.0, 3.0, (0, 0.235, 1.2), (math.radians(90), 0, 0), mat=mat_papier('mur', C['parche'], rough=0.85, bump=0.5, echelle=420))

g = gobelet('gobelet', art('gobelet'), loc=(-0.075, 0.03, 0), rz=math.radians(-9))
gres = mat_gres('gres', C['vert'])
t = tasse('tasse', gres, loc=(0.092, -0.022, 0.0045), rz=math.radians(-32), soucoupe=gres)
for i, (x, y, rz, c) in enumerate(((0.212, 0.045, 30, 1.5), (0.236, 0.022, 160, 1.62), (-0.205, -0.06, 80, 1.48))):
    cerise(f'cerise{i}', (x, y, 0.0068), rz=math.radians(rz), couche=c)

AZ, EL = opt('az', 228.0), opt('el', 24.0)
soleil(AZ, EL, force=opt('soleil', 3.2), angle=0.6, couleur='#FFF8F0')
ds = vers_soleil(AZ, EL)
# La vitrophanie : un plan perpendiculaire au soleil, hors champ, dont seul le semis arrête la lumière
e1 = Vector((-ds.y, ds.x, 0)).normalized(); e2 = ds.cross(e1).normalized()
if e2.z < 0: e2 = -e2
vit = plane('vitrophanie', 0.64, 0.457, mat=mat_decal('vitro', art('gobo')))
poser(vit, e1, e2, Vector((0.02, 0.10, 0.10)) + ds * 0.75)
# Le haut de la baie : une traverse qui coupe la lumière en haut du mur
poser(box('traverse', 3.0, 0.5, 0.01, mat=mat_pbr('traverse', C['feuille'], rough=0.5)), e1, e2, Vector((0.02, 0.235, 0.58)) + ds * 1.2 + e2 * 0.25)
area('debouche', (0.5, -0.8, 0.5), (0, 0, 0.06), 3.2, size=1.0, color=hex_rgb(C['fleur']))

camera((0.075, -0.66, 0.125), (0.012, 0, 0.066), lens=56, dof=0.67, fstop=6.3)
render('17-gobelet.png')
