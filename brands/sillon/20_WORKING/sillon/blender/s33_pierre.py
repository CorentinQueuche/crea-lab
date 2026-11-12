# 33 · La pierre. Le logotype SILLON taillé en relief dans une dalle de tuffeau, d'un seul bloc avec son pied ; le dessus
# du bloc est dressé à 12°, le degré de la marque. Le vin de macération a été versé dans le creux des deux L : rien ne
# le retient que le pied des deux L et la pierre elle-même. Il fait une flaque dont la surface reste horizontale quand
# tout le reste penche : profonde contre le pied, mince et claire là où elle meurt sur la pente, avec un ménisque contre
# la pierre et un liseré de pierre mouillée au-dessus de la ligne de vin. Flash dur d'en haut à gauche, sergé bleu.
# Usage, depuis la racine du projet :
#   blender --factory-startup -b -P blender/s33_pierre.py -- --draft      (brouillon)
#   blender --factory-startup -b -P blender/s33_pierre.py                 (final, out/blender/33-pierre.png)
# Options : --az= --el= --dist= --lens= (caméra)  --f=  --flash=  --haut= --face= (lumière)  --spp=
#           --vue=detail (gros plan sur le creux : out/blender/33-pierre-detail.png)
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bmesh
from lib import *
from sillon_objets import *

DETAIL = opt('vue', '') == 'detail'
sc = reset(2800, 1575, samples=int(opt('spp', 640.0)))
vue(); reglages(sc)
sc.cycles.blur_glossy = 0.0   # reflets nets (le flash dans le vin)

# ---------- Cotes, dans le repère de la dalle (x : le long du mot, y : vers le haut du mot, z : hors de la dalle) ----------
CAP, RELIEF, BIS = 0.12, 0.034, 0.0012      # hauteur de capitale, relief des lettres, arrondi des arêtes
DALLE = dict(x=1.0, y=0.235, z=0.05)
YB = -CAP / 2                               # ligne de base du mot
s_ = CAP / 100
X0 = (CREUX['x'] - LOGO_L / 2) * s_ + BIS   # parois du creux (l'arrondi épaissit les lettres)
X1 = (CREUX['x'] + CREUX['l'] - LOGO_L / 2) * s_ - BIS
Y0 = YB + (100 - CREUX['h']) * s_ + BIS     # le pied des deux L, qui retient le vin
Y1 = YB + 100 * s_                          # le haut du creux, ouvert
DEG = 12.0
H0 = 0.107
M = Matrix.Translation((0, 0, H0)) @ Matrix.Rotation(math.radians(DEG), 4, 'X')   # le haut du mot s'éloigne et monte
def W(p): return M @ Vector(p)

# ---------- La flaque : elle meurt aux deux tiers du creux ; sa surface est horizontale dans le monde ----------
YE = Y0 + NIVEAU * (Y1 - Y0)                # là où la surface du vin rencontre la pente
NIVW = W((0, YE, 0)).z
PL = plan_local(M, NIVW)
print('profondeur contre le pied (mm)', round(PL(0, Y0) * 1000, 1), 'relief', RELIEF * 1000)

# ---------- Le bloc ----------
mouille = dict(niv=NIVW, x0=X0 - 0.002, x1=X1 + 0.002, y0=W((0, Y0 - 0.003, 0)).y, y1=W((0, Y1 + 0.004, 0)).y, haut=0.0035, teinte='#B98761')
tuf = mat_tuffeau('tuffeau', ton=1.0, layures=0.9, mouille=mouille)
L = lettres('lettres', CAP, RELIEF + 0.002, biseau=BIS)
L.rotation_euler = (0, 0, 0); L.location = (0, YB, (RELIEF + 0.002) / 2 - 0.002)
mes = [en_maillage(L)]; bpy.data.objects.remove(L)
bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
for v in bm.verts:
    v.co.x *= DALLE['x']; v.co.y *= DALLE['y']; v.co.z = (v.co.z - 0.5) * DALLE['z']
dalle = bpy.data.meshes.new('dalle'); bm.to_mesh(dalle); bm.free()
for me in mes + [dalle]: me.transform(M)
# le pied du bloc, du dessous de la dalle penchée jusqu'au sol
coins = [W((sx * DALLE['x'] / 2, sy * DALLE['y'] / 2, -DALLE['z'] + 0.004)) for sx in (-1, 1) for sy in (-1, 1)]
bm = bmesh.new()
hv = [bm.verts.new(p) for p in coins]; bv = [bm.verts.new((p.x, p.y, 0.0)) for p in coins]
bm.faces.new([hv[i] for i in (0, 2, 3, 1)]); bm.faces.new([bv[i] for i in (1, 3, 2, 0)])
for i, j in ((0, 2), (2, 3), (3, 1), (1, 0)):
    bm.faces.new((bv[i], bv[j], hv[j], hv[i]))
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
pied = bpy.data.meshes.new('pied'); bm.to_mesh(pied); bm.free()
pierre = taille_pierre('pierre', mes + [dalle, pied], tuf, voxel=0.001 if '--draft' in argv() else 0.00055, relief=0.0004, eclats=0.0)

# ---------- Le vin ----------
REC, MW = 0.0006, 0.0028
YEND = YE + 0.0026                          # le bourrelet du bord de la flaque
def axe(a, b, n, w, bords=True):
    pts = [a + (b - a) * i / n for i in range(n + 1)]
    for t in (0.02, 0.05, 0.1, 0.17, 0.26, 0.38, 0.55, 0.8, 1.15, 1.6, 2.3, 3.2):
        pts += [a + REC + w * t] + ([b - REC - w * t] if bords else [])
    return sorted(set(round(p, 7) for p in pts if a <= p <= b))
xs = axe(X0 - REC, X1 + REC, 90, MW)
ys = sorted(set(axe(Y0 - REC, YEND, 110, MW, bords=False) + [round(YEND - 0.006 * (1 - t), 7) for t in [i / 24 for i in range(25)]]))
def bourrelet(y):
    r, h = 0.0032, 0.0011
    if y <= YEND - r: return h
    return h * math.sqrt(max(0.0, 1 - ((y - (YEND - r)) / r) ** 2))
def haut(x, y):
    d = min(x - X0, X1 - x, y - Y0)
    return max(PL(x, y) + menisque(max(0.0, d), 0.0018, MW), bourrelet(y))
vin = liquide_grille('vin', xs, ys, haut, lambda x, y: -REC, mat_jus('jus', 'maceration', trouble=1.0, densite=opt('dens', 0.35), albedo=opt('albedo', 0.85))); vin.matrix_world = M
# la lie : un voile dense au fond, contre le pied, là où c'est profond
xs2 = axe(X0 + 0.0005, X1 - 0.0005, 50, 0.002); ys2 = axe(Y0 + 0.0005, YE - 0.02, 50, 0.002, bords=False)
lie = liquide_grille('lie', xs2, ys2, lambda x, y: min(PL(x, y) - 0.0008, 0.0017), lambda x, y: -0.0002, mat_lie('lie', 'maceration', 700.0))
lie.matrix_world = M
def dedans(r):
    x, y = r.uniform(X0 + 0.0015, X1 - 0.0015), r.uniform(Y0 + 0.0015, YE - 0.004)
    zt = PL(x, y) - 0.0008
    if zt < 0.001: return None
    z = 0.0004 + (zt - 0.0004) * r.random() ** 2.5
    return tuple(W((x, y, z)))
flocons('flocon', 220, dedans, mat_depot('depot'), taille=(0.00012, 0.0004))

# ---------- Le studio ----------
drape('serge', mat_serge('serge', tuile=0.30), l=6.0, avant=2.5, arriere=opt('mur', 0.9), h=2.0, rayon=0.45, plis=0.05, ondes=4)
for i, (x, y, t) in enumerate(((-0.66, -0.30, 0.024), (-0.58, -0.36, 0.011), (-0.72, -0.40, 0.008), (0.64, -0.26, 0.017), (0.70, -0.34, 0.007))):
    e = eclat_pierre(f'eclat{i}', tuf, taille=t, seed=11 + i); e.location = (x, y, t * 0.28); e.rotation_euler = (0.3 * i, 0.5, 1.1 * i)
creux_c = W(((X0 + X1) / 2, (Y0 + YE) / 2, 0.006))
centre = W((0.0, 0.0, 0.012))
AZ, EL, DIST = math.radians(opt('az', -18.0)), math.radians(opt('el', 60.0)), opt('dist', 1.34)
if DETAIL: AZ, EL = math.radians(opt('az', -18.0)), math.radians(opt('el', 55.0))
cible = creux_c if DETAIL else centre + Vector((opt('cx', 0.0), opt('decy', 0.0), opt('cz', 0.0)))
pos = cible + Vector((math.sin(AZ) * math.cos(EL), -math.cos(AZ) * math.cos(EL), math.sin(EL))) * (DIST if not DETAIL else opt('dd', 0.34))
cam = camera(tuple(pos), tuple(cible), lens=opt('lens', 50.0) if not DETAIL else 90, dof=(pos - creux_c).length, fstop=opt('f', 7.0) if not DETAIL else 5.6)
# le flash : dur (petite source), d'en haut à gauche, un peu de face ; presque pas de lumière d'appoint
fl, dl = flash(cam, gauche=1.0, haut=opt('haut', 0.9), face=opt('face', 0.35), force=opt('flash', 5.0), angle=0.45)
ciel_studio(force=0.05, rot_z=2.2)
# le reflet net du flash dans le vin : une petite source vue seulement par les reflets, au miroir de la caméra
d = (creux_c - pos).normalized(); rf = Vector((d.x, d.y, -d.z))
carte_lumiere('reflet', tuple(creux_c + rf * 1.6), tuple(creux_c), 0.011, 0.008, opt('reflet', 1400.0))   # un flash : petit et dur
render(opt('nom', '33-pierre.png' if not DETAIL else '33-pierre-detail.png'))
