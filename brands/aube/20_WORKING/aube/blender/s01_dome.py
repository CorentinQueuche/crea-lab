# Planche 01 — image d'ouverture : le dôme lumineux, un demi-disque écran posé sur un sol brillant.
# Son reflet referme le disque : un soleil à moitié levé.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

reset(2800, 1575, samples=320)
R, T = 1.7, 0.2

# Demi-disque : face avant (écran), tranche et dos (métal sombre)
N = 128
bm = bmesh.new()
front = [bm.verts.new((R * math.cos(math.pi * i / N), -T / 2, R * math.sin(math.pi * i / N))) for i in range(N + 1)]
back = [bm.verts.new((v.co.x, T / 2, v.co.z)) for v in front]
f_front = bm.faces.new(front)
bm.faces.new(list(reversed(back)))
for i in range(N):
    bm.faces.new((front[i + 1], front[i], back[i], back[i + 1]))
bm.faces.new((front[0], front[N], back[N], back[0]))
bm.normal_update()
me = bpy.data.meshes.new('dome');
uv = bm.loops.layers.uv.new('UVMap')
for f in bm.faces:
    for l in f.loops:
        l[uv].uv = ((l.vert.co.x + R) / (2 * R), l.vert.co.z / R)
f_front.material_index = 1
bm.to_mesh(me); bm.free()
dome = link(bpy.data.objects.new('dome', me))
me.materials.append(mat_pbr('metal', '#0c0a0c', rough=0.32, metal=1.0))
me.materials.append(mat_screen('ecran', os.path.join(ART, 'dome.png'), strength=1.0, gloss=0.03))
# la face avant doit regarder -Y
if me.polygons[0].normal.y > 0:
    bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table(); bmesh.ops.reverse_faces(bm, faces=[bm.faces[0]]); bm.to_mesh(me); bm.free()

plane('sol', 80, 80, (0, 0, 0), mat=mat_floor(rough=0.16, var=0.1, bump=0.015, scale=3.0))
# Lueur chaude au sol derrière le dôme, très faible, pour détacher la silhouette


camera((0, -13.5, 0.7), (0, 0, 0.5), lens=58)
render('01-dome.png')
