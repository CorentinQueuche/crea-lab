# Planche 02 (scène A) : le monument. Un mur de 100 blocs (6,0 × 6,0 m, épaisseur 0,8 m ; blocs de 0,52 m, écart de 0,08 m)
# dans un paysage de nuit : 85 blocs allumés en Net, 15 éteints. Logotype lumineux au pied (hauteur d'x 0,45 m).
# Plan fixe, objectif de 35 mm, caméra droite. Ciel et terrain fabriqués ici ; roche Poly Haven (rocky_terrain_02, CC0).
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s02_monument.py -- --draft
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from decor import *

reset(2800, 1575, samples=520)
ciel_nuit(horizon='#2F6654', zenith='#020504', force=opt('ciel', 1.0), hauteur=0.30, densite=0.84)

roche = mat_pbr_tex('roche', 'rocky_terrain_02', 'rocky_terrain_02', scale=130, tint='#8C9690', rough_mul=1.0, bump_strength=2.2)
terrain('terrain', taille=300, n=600, mat=roche, plat=(15, 27), monts=(32, 108), relief=opt('relief', 26.0), bosses=0.6, seed=opt('seed', 5.0))

# Parvis de verre sombre : le monument y est posé. Il avance vers la caméra pour porter le reflet du mur et du logotype.
DZ = 0.22
dalle = mat_floor('dalle', color=C['coffre'], rough=0.06, var=0.035, bump=0.003, scale=1.6)
box('dalle', 17.0, 13.6, DZ, (0.6, -3.9, DZ / 2), mat=dalle, bevel=0.01)

# Une brume très légère : elle fait un halo autour du mur et éloigne les crêtes (option --brume=0 pour l'enlever)
BRUME = opt('brume', 0.00022)
if BRUME > 0:
    bm_, nt_, out_ = lib._mat('brume')
    vs = nt_.nodes.new('ShaderNodeVolumeScatter'); vs.inputs['Density'].default_value = BRUME; vs.inputs['Anisotropy'].default_value = 0.35
    vs.inputs['Color'].default_value = (0.8, 1.0, 0.9, 1)
    nt_.links.new(vs.outputs[0], out_.inputs['Volume'])
    box('brume', 240, 240, 30, (0, 40, 14.5), mat=bm_)

# Le mur : 10 × 10 blocs, remplis depuis le bas (85 allumés). Faces avant et arrière en Net plein, flancs en Net 700.
PAS, B, EP, X0 = 0.60, 0.52, 0.80, -1.9
net = mat_lum('net', cam=1.15, diffus=opt('jet', 4.5), cote=C['net700'])
eteint = mat_pbr('eteint', '#0C2416', rough=0.16, coat=1.0, emit='#0A662A', emit_strength=0.42)
for k in range(100):
    r, c = divmod(k, 10)
    box(f'bloc{k}', B, EP, B, (X0 + (c - 4.5) * PAS, 0, DZ + B / 2 + r * PAS), mat=net if k < 85 else eteint, bevel=0.006)
# La lumière que le mur jette sur le paysage : deux panneaux Net invisibles à l'image et dans les reflets, devant et derrière
for nom, y, sens in (('jet-avant', -0.45, -1), ('jet-arriere', 0.45, 1)):
    j = area(nom, (X0, y, DZ + 2.6), (X0, y + sens, DZ + 2.6), opt('watts', 5200.0), size=5.9, size_y=5.0, color=hex_rgb(C['net'])[:3]); j.visible_glossy = False

# Le logotype au pied, à droite du mur : le y descend de 0,4 × H sous la ligne de base
H = 0.45
logo('logotype', height=H, extrude=0.16, mat=mat_lum('net-logo', cam=1.15, diffus=3.0), part='logotype', loc=(3.95, -1.55, DZ + 0.4 * H))

# Une lune très faible, derrière à gauche : elle dessine les crêtes
ld = bpy.data.lights.new('lune', 'SUN'); ld.energy = opt('lune', 0.12); ld.color = (0.62, 0.86, 0.78); ld.angle = math.radians(3)
lune = link(bpy.data.objects.new('lune', ld)); lune.rotation_euler = (math.radians(66), 0, math.radians(-140))

cam = camera((5.6, -14.6, 1.5), (0.9, 0, 1.5), lens=35)
droit(cam, shift_x=0.0, shift_y=opt('sy', 0.098))
render('02-monument.png')
