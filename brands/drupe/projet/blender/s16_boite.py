# Planche 16 — la boîte d'abonnement, ouverte, vue de trois quarts haut : deux sachets couchés (Guji et Huila, la boîte n° 17),
# papier de soie au semis, carte « Torréfié mardi » appuyée contre la boîte, logotype au pochoir à l'intérieur du couvercle.
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drupe import *

reset(2800, 1575, samples=340)
vue()
world_color(hex_rgb(C['fleur']), opt('ciel', 0.36))

plane('table', 2.4, 2.4, (0, 0, 0), mat=mat_bois('table', scale=2.0))
plane('mur', 4.0, 4.0, (0, 0.62, 1.6), (math.radians(90), 0, 0), mat=mat_papier('mur', C['parche'], rough=0.85, bump=0.5, echelle=420))

# Boîte : fond, quatre parois, couvercle à charnière relevé
BX, BY, BZ, EP = 0.270, 0.212, 0.082, 0.003
carton = mat_papier('carton', C['parche'], rough=0.78, bump=0.3, echelle=700)
# (les volumes ne se recouvrent pas : deux faces confondues donnent des traits noirs au rendu)
box('fond', BX - 2 * EP, BY - 2 * EP, EP, (0, 0, EP / 2), mat=carton)
box('paroi-av', BX, EP, BZ, (0, -BY / 2 + EP / 2, BZ / 2), mat=carton)
box('paroi-ar', BX, EP, BZ, (0, BY / 2 - EP / 2, BZ / 2), mat=carton)
box('paroi-g', EP, BY - 2 * EP, BZ, (-BX / 2 + EP / 2, 0, BZ / 2), mat=carton)
box('paroi-d', EP, BY - 2 * EP, BZ, (BX / 2 - EP / 2, 0, BZ / 2), mat=carton)
phi = math.radians(opt('ouvert', 103.0))
Lv = Vector((0, -math.cos(phi), math.sin(phi))); Xv = Vector((1, 0, 0)); Nv = Xv.cross(Lv)
charn = Vector((0, BY / 2, BZ + 0.001))
poser(box('couvercle', BX, BY, EP, mat=carton), Xv, Lv, charn + Lv * (BY / 2) - Nv * (EP / 2))
poser(plane('couvercle-int', BX - 0.006, (BX - 0.006) * 700 / 945, mat=mat_image('couv', art('couvercle'), rough=0.78, bump=0.12)), Xv, Lv, charn + Lv * (BY / 2) + Nv * 0.0002)
poser(box('languette', BX - 0.008, 0.045, EP, mat=carton), Xv, Nv, charn + Lv * (BY - EP / 2) + Nv * 0.0225)
# Symbole au pochoir sur la paroi avant
logo('pochoir', height=0.034, extrude=0.0003, mat=mat_pbr('pochoir', C['cerise'], rough=0.7), part='symbole', loc=(0.088, -BY / 2 - 0.0002, 0.022))

# Papier de soie : une feuille froissée qui tapisse le fond, remonte les parois et retombe un peu sur les côtés.
# Les UV suivent la longueur réelle du papier (et non sa projection), sinon le semis s'étire sur les parois.
def soie(motif=0.26):
    nx, ny = 170, 130
    x0, x1 = -BX / 2 - 0.034, BX / 2 + 0.034; y0, y1 = -BY / 2 + EP + 0.001, BY / 2 - EP - 0.001
    ix, iy = BX / 2 - EP, BY / 2 - EP
    def pli(x, y):
        return 0.0030 * math.sin(41 * x + 3 * math.sin(23 * y)) + 0.0022 * math.sin(57 * y + 1.7 + 2 * math.sin(31 * x)) + 0.0013 * math.sin(120 * x + 90 * y)
    def haut(x, y):
        dedans = min(ix - abs(x), iy - abs(y))
        if dedans > 0.012: return EP + 0.004 + pli(x, y)
        if dedans > 0: return EP + 0.004 + (BZ + 0.004 - EP - 0.004) * (1 - dedans / 0.012) ** 1.5 + pli(x, y) * dedans / 0.012
        dehors = -dedans
        return BZ + 0.004 + 0.004 * math.sin(min(1, dehors / 0.012) * math.pi) - max(0, dehors - 0.008) * 1.25 + pli(x, y) * min(1, dehors / 0.02) * 1.8
    P = [[Vector((x0 + (x1 - x0) * i / nx, y0 + (y1 - y0) * j / ny, 0)) for i in range(nx + 1)] for j in range(ny + 1)]
    for row in P:
        for p in row: p.z = max(haut(p.x, p.y), 0.0015)
    # Longueurs comptées depuis le milieu de la feuille, vers chaque bord : compter depuis un bord cisaille le motif
    # sur les parois (les rangs du fond descendent une paroi de plus que ceux du haut).
    Uc = [[0.0] * (nx + 1) for _ in range(ny + 1)]; Vc = [[0.0] * (nx + 1) for _ in range(ny + 1)]
    mi, mj = nx // 2, ny // 2
    for j in range(ny + 1):
        for i in range(mi + 1, nx + 1): Uc[j][i] = Uc[j][i - 1] + (P[j][i] - P[j][i - 1]).length
        for i in range(mi - 1, -1, -1): Uc[j][i] = Uc[j][i + 1] - (P[j][i] - P[j][i + 1]).length
    for i in range(nx + 1):
        for j in range(mj + 1, ny + 1): Vc[j][i] = Vc[j - 1][i] + (P[j][i] - P[j - 1][i]).length
        for j in range(mj - 1, -1, -1): Vc[j][i] = Vc[j + 1][i] - (P[j][i] - P[j + 1][i]).length
    bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap')
    vs = [[bm.verts.new(p) for p in row] for row in P]
    for j in range(ny):
        for i in range(nx):
            f = bm.faces.new((vs[j][i], vs[j][i + 1], vs[j + 1][i + 1], vs[j + 1][i])); f.smooth = True
            for l, (jj, ii) in zip(f.loops, ((j, i), (j, i + 1), (j + 1, i + 1), (j + 1, i))): l[uv].uv = (Uc[jj][ii] / motif, Vc[jj][ii] / motif)
    me = bpy.data.meshes.new('soie'); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new('soie', me))
    m = mat_image('soie', art('soie'), rough=0.55, bump=0.1)
    next(n for n in m.node_tree.nodes if n.type == 'TEX_IMAGE').extension = 'REPEAT'
    me.materials.append(m)
soie()

# Deux sachets couchés, face vers le haut, le haut vers le fond de la boîte
for nom, x, rz, a, seed in (('guji', -0.062, 2.5, -6, 1), ('huila', 0.064, -3.0, 9, 2)):
    s = sachet('sachet-' + nom, art('sachet-' + nom), art('pastille-' + nom), angle=a, seed=seed)
    s.rotation_euler = (math.radians(-90), 0, math.radians(rz)); s.location = (x, -0.098, EP + 0.006 + 0.03)

# La carte, debout sur la table, appuyée contre la paroi avant
CWd, CHt = 0.105, 0.148
incl = math.atan2(BZ, 0.05); yaw = math.radians(-6)
xa = Vector((math.cos(yaw), math.sin(yaw), 0)); ya = Vector((0, math.cos(incl), math.sin(incl))); ya = (ya - xa * ya.dot(xa)).normalized(); na = xa.cross(ya)
pied = Vector((-0.058, -BY / 2 - 0.052, 0.0))
poser(box('carte-corps', CWd, CHt, 0.0007, mat=mat_papier('carte-p', C['fleur'])), xa, ya, pied + ya * (CHt / 2) + na * 0.0004)
poser(plane('carte', CWd, CHt, mat=mat_image('carte', art('carte-mardi'), rough=0.6, bump=0.1)), xa, ya, pied + ya * (CHt / 2) + na * 0.0008)

AZ, EL = opt('az', 222.0), opt('el', 40.0)
soleil(AZ, EL, force=opt('soleil', 3.0), angle=0.9, couleur='#FFF8F0')
ds = vers_soleil(AZ, EL)
rameau('rameau', Vector((-0.42, -0.12, 0.0)) + ds * 0.6, (0.5, 0.75, 0.2), n=4, L=0.13, pas=0.08, seed=5, tige=0.003)
rameau('rameau2', Vector((0.38, 0.62, 0.28)) + ds * 0.8, (0.85, 0.0, 0.45), n=3, L=0.13, pas=0.08, seed=8, tige=0.003)
area('debouche', (0.9, -0.8, 0.8), (0, 0, 0.1), 5.0, size=1.2, color=hex_rgb(C['fleur']))

camera((0.34, -0.80, 0.60), (0.005, 0.0, 0.136), lens=49, dof=0.98, fstop=8)
render('16-boite.png')
