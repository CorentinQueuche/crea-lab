# Planche 16 — le logotype en lettres lumineuses au sommet d'un immeuble, ciel d'aube.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

sc = reset(2800, 1882, samples=300, transform='AgX')
rot = 0.0
for a in argv():
    if a.startswith('--rot='): rot = float(a.split('=')[1])
world_hdri(os.path.join(TEX, 'hdri', 'the_sky_is_on_fire_4k.hdr'), strength=1.0, rot_z=math.radians(rot))

L, HT, BAND = 18.0, 15.0, 3.6          # largeur de façade, hauteur, bandeau haut
beton = mat_pbr_tex('beton', 'concrete_wall_003', 'concrete_wall_003', scale=3.0, tint='#6c6a6e')
sombre = mat_pbr('sombre', '#1b1b1f', rough=0.55, metal=0.6)
lame = mat_pbr('lame', '#232328', rough=0.4, metal=0.8)
verre = mat_pbr('verre', '#0a1220', rough=0.02, metal=1.0)
meneau = mat_pbr('meneau', '#17171a', rough=0.45, metal=0.7)

# Volume
box('volume', L, L, HT, (L / 2, L / 2, HT / 2), mat=sombre)
# Façade A (y = 0, tournée vers -Y) : vitrage en bas, bandeau à lames en haut
plane('vitrage', L, HT - BAND, (L / 2, -0.02, (HT - BAND) / 2), (math.radians(90), 0, 0), mat=verre)
nx, nz = 11, 8
for i in range(nx + 1):
    box(f'mv{i}', 0.07, 0.1, HT - BAND, (i * L / nx, -0.06, (HT - BAND) / 2), mat=meneau)
for j in range(nz + 1):
    box(f'mh{j}', L, 0.1, 0.07, (L / 2, -0.06, j * (HT - BAND) / nz), mat=meneau)
box('bandeau', L, 0.2, BAND, (L / 2, -0.1, HT - BAND / 2), mat=sombre)
n = int(BAND / 0.15)
for k in range(n):
    box(f'l{k}', L, 0.09, 0.055, (L / 2, -0.24, HT - BAND + 0.08 + k * 0.15), (math.radians(-28), 0, 0), mat=lame)
for i in range(nx + 1):
    box(f'mb{i}', 0.05, 0.14, BAND, (i * L / nx, -0.25, HT - BAND / 2), mat=sombre)
# Façade B (x = 0, tournée vers -X) : panneaux de béton
fb = plane('betonB', L, HT, (-0.02, L / 2, HT / 2), (math.radians(90), 0, math.radians(-90)), mat=beton, uv_scale=1.0)
for j in range(1, 4):
    box(f'jb{j}', 0.03, L, 0.03, (-0.03, L / 2, j * HT / 4), mat=sombre)
for i in range(1, 3):
    box(f'jv{i}', 0.03, 0.03, HT, (-0.03, i * L / 3, HT / 2), mat=sombre)
box('acrotere', L + 0.3, L + 0.3, 0.18, (L / 2, L / 2, HT + 0.09), mat=sombre)
# Antennes
for (x, y, h) in ((1.2, 5, 3.2), (6.5, 3, 2.2), (9, 8, 4.2), (14, 4, 2.6), (16.5, 9, 3.4)):
    cyl('ant', 0.03, h, (x, y, HT + h / 2), mat=mat_pbr('ant', '#d8d8dc', rough=0.4, metal=1.0), seg=12)

# Lettres lumineuses
lum = mat_pbr('lettres', '#ffffff', rough=0.35, emit=(1, 0.96, 0.9, 1), emit_strength=2.2)
XH = 1.55
logo('logo', height=XH, extrude=0.22, bevel=0.0, mat=lum, loc=(5.6, -0.42, HT - BAND + 0.72), center=True)
text('desc', 'Assistant\npersonnel', 0.66, font='Regular', loc=(9.6, -0.36, HT - BAND + 0.72 + 0.74), rot=(math.radians(90), 0, 0), mat=lum, extrude=0.06, line=0.92)

camera((-8.5, -19.5, 1.5), (6.6, 0, 11.6), lens=38)
render('16-facade.png')
