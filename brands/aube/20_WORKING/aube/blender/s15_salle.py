# Planche 15 — salle de conférence vide, écran géant. Sert de décor : la vidéo de l'écran est incrustée ensuite.
# Écrit out/blender/15-salle.json : le rectangle de l'écran en pixels.
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

reset(1920, 1080, samples=420)
tex = os.path.join(ROOT, 'out', 'motion', '15-scene-ecran.png')
if not os.path.exists(tex): tex = os.path.join(ART, 'billboard.png')
SW, SH = 26.25, 7.5
ecran = screen_v('ecran', SW, SH, (0, 20, 7.6), mat_screen('ecran', tex, 9.0, gloss=0.0))
noir = mat_pbr('noir', '#050506', rough=0.6)
box('mur', 60, 0.4, 24, (0, 20.4, 10), mat=noir)
box('scene', 32, 6, 1.1, (0, 18.5, 0.55), mat=mat_pbr('scene', '#08080a', rough=0.3))
box('nez', 32, 0.03, 0.04, (0, 15.49, 1.06), mat=mat_emit('nez', hex_rgb('#FF632B'), 3.0))
plane('sol', 120, 120, (0, 0, 0), mat=mat_floor(color='#101012', rough=0.16, var=0.08, bump=0.01, scale=2.0))
plane('plafond', 80, 80, (0, 0, 13.5), (math.radians(180), 0, 0), mat=mat_pbr('plafond', '#060607', rough=0.7))
# Rails techniques au plafond : fines lignes mates, pour la profondeur
for k in range(7):
    box(f'rail{k}', 46, 0.08, 0.08, (0, -10 + k * 4.5, 12.8), mat=mat_pbr('rail', '#151517', rough=0.5, metal=0.8))

# Chaise : assise, dossier, quatre pieds, fusionnés dans un seul maillage puis instanciés
def chair_mesh():
    bm = bmesh.new()
    def add(sx, sy, sz, x, y, z):
        r = bmesh.ops.create_cube(bm, size=1.0)
        for v in r['verts']:
            v.co.x = v.co.x * sx + x; v.co.y = v.co.y * sy + y; v.co.z = v.co.z * sz + z
    add(0.46, 0.44, 0.045, 0, 0, 0.46)
    add(0.46, 0.035, 0.40, 0, -0.22, 0.74)
    for x in (-0.2, 0.2):
        for y in (-0.19, 0.19):
            add(0.025, 0.025, 0.46, x, y, 0.23)
    me = bpy.data.meshes.new('chaise'); bm.to_mesh(me); bm.free(); return me
cm = chair_mesh(); cm.materials.append(mat_pbr('chaise', '#3a3a40', rough=0.3, metal=0.5))
n = 0
for r in range(24):
    y = -11 + r * 1.05
    for c in range(-24, 25):
        x = c * 0.62
        if 4.0 < abs(x) < 5.3: continue      # allées
        if abs(x) > 17.5: continue
        o = bpy.data.objects.new(f'c{n}', cm); link(o); o.location = (x, y, 0); n += 1
print('chaises', n)

_c = camera((0, -4.5, 3.1), (0, 20, 3.1), lens=24); _c.data.shift_y = 0.062
bpy.context.scene.view_settings.exposure = 1.2
with open(os.path.join(OUT, '15-salle.json'), 'w') as f: json.dump({'ecran': cam_rect(ecran), 'w': 1920, 'h': 1080}, f)
render('15-salle.png')
