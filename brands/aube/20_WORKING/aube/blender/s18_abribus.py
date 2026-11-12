# Planche 18 — affiche numérique dans une rue la nuit. Sert de décor : la vidéo de l'affiche est incrustée ensuite.
# Écrit out/blender/18-abribus.json : le rectangle de l'écran en pixels.
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

sc = reset(1920, 1080, samples=420, transform='AgX')
rot, hd, st = 0.0, 'viale_giuseppe_garibaldi', 0.35
for a in argv():
    if a.startswith('--rot='): rot = float(a.split('=')[1])
    if a.startswith('--hdri='): hd = a.split('=')[1]
    if a.startswith('--st='): st = float(a.split('=')[1])
world_hdri(os.path.join(TEX, 'hdri', hd + '_4k.hdr'), strength=st, rot_z=math.radians(rot))

tex = os.path.join(ROOT, 'out', 'motion', '18-affiche-ecran.png')
if not os.path.exists(tex): tex = os.path.join(ART, 'lightbox.png')
SW, SH = 1.2, 1.8
ZC = 1.62
metal = mat_pbr('metal', '#0d0d0f', rough=0.36, metal=1.0)
box('cadre', SW + 0.16, 0.2, SH + 0.2, (0, 0, ZC), mat=metal, bevel=0.012)
ecran = screen_v('ecran', SW, SH, (0, -0.102, ZC), mat_screen('ecran', tex, 2.2, gloss=0.05))
box('pied', 0.5, 0.16, ZC - SH / 2 - 0.1, (0, 0, (ZC - SH / 2 - 0.1) / 2), mat=metal, bevel=0.008)
box('semelle', 0.8, 0.34, 0.04, (0, 0, 0.02), mat=metal, bevel=0.005)
sol = mat_pbr_tex('sol', 'concrete_floor_worn_001', 'concrete_floor_worn_001', scale=30, tint='#19191c', rough_mul=0.8)
plane('sol', 60, 60, (0, 0, 0), mat=sol)

# Lumières lointaines floues : feux de voiture, lampadaires, vitrines
import random; random.seed(11)
cols = ['#ff3b1f', '#ff3b1f', '#ffb26b', '#fff1dc', '#ff632b', '#ffd9a0', '#9fd0ff']
for i in range(26):
    x = random.uniform(-22, 26); y = random.uniform(22, 70); z = random.choice([0.7, 0.8, 1.0, 3.5, 4.5, 6.0, 2.2])
    if -4 < x < 2 and y < 30: continue
    o = cyl(f'feu{i}', random.uniform(0.07, 0.2), 0.02, (x, y, z), (math.radians(90), 0, 0), mat=mat_emit(f'feu{i}', hex_rgb(random.choice(cols)), random.uniform(25, 90)), seg=24)
cam = camera((0, -6.2, 1.5), (0, 0, 1.5), lens=50, dof=6.1, fstop=1.2)
cam.data.shift_x = 0.17
with open(os.path.join(OUT, '18-abribus.json'), 'w') as f: json.dump({'ecran': cam_rect(ecran), 'w': 1920, 'h': 1080}, f)
render('18-abribus.png')
