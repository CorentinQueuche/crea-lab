# Planche 14 — grand panneau lumineux posé sur un socle de pierre, vu de trois quarts.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

reset(2800, 1600, samples=320)
W, H, D = 5.0, 2.0, 0.36
Z = 1.72
metal = mat_pbr('metal', '#121012', rough=0.34, metal=1.0)
box('cadre', W + 0.07, D, H + 0.07, (0, 0, Z), mat=metal, bevel=0.01)
screen_v('ecran', W, H, (0, -D / 2 - 0.003, Z), mat_screen('ecran', os.path.join(ART, 'billboard.png'), 1.0, gloss=0.035))
pierre = mat_pbr_tex('pierre', 'concrete_wall_003', 'concrete_wall_003', scale=1.0, tint='#5a5559')
socle = box('socle', W * 0.86, D * 1.5, 0.62, (0, 0.02, 0.31), mat=pierre, bevel=0.006)
# UV simples pour le socle
import bmesh as _bm
bpy.context.view_layer.objects.active = socle
uv = socle.data.uv_layers.new(name='UVMap')
for poly in socle.data.polygons:
    for li in poly.loop_indices:
        co = socle.data.vertices[socle.data.loops[li].vertex_index].co
        uv.data[li].uv = ((co.x + co.y) * 0.5, co.z * 0.5 + co.y * 0.3)
box('joint', W * 0.8, D * 1.2, 0.06, (0, 0.02, 0.65), mat=metal)

plane('sol', 90, 90, (0, 0, 0), mat=mat_floor(rough=0.2, var=0.1, bump=0.02, scale=3.0))
area('douce', (-6, -7, 7), (0, 0, 1), 1500, size=6, color=hex_rgb('#b9c2d6'))
camera((-5.6, -10.4, 1.28), (0.25, 0, 1.42), lens=58)
render('14-panneau.png')
