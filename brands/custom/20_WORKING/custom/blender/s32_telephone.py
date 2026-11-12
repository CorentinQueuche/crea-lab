# Planche 32 : le téléphone. Le site mobile sur un téléphone (71,5 × 146,7 × 7,8 mm) posé sur la maille technique noire
# de l'atelier, ceinturé par une sangle orange de 18 mm tendue à la pente du Cran (13,3°), une griffe tissée sur la sangle,
# un passant noir, et un écusson brodé « Custom.fr » à côté. Gros plan, lumière rasante venue de la gauche et du fond.
# Tissu : blender/tex/tissu-maille.png (sinon photos/maille.jpg). Écusson : blender/tex/tech-broderie-logo.png.
# Écran : out/art/3d2-ecran-mobile.png (art/3d2-ecran-mobile.html). Griffe : out/art/3d2-griffe.png (art/3d2-portable.html).
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s32_telephone.py -- --draft
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from custom3d2 import *
from mathutils import noise

reset(2800, 1575, samples=420)
world_color(hex_rgb(K['noir']), 0.04)
RZ = R(opt('rz', PENTE))                                            # le téléphone penche de 13,3° : la sangle monte à la pente du Cran
ROT = Matrix.Rotation(RZ, 3, 'Z')
TW, TH, TE = 0.0715, 0.1467, 0.0078
YS = opt('ys', -0.0285); LS = 0.018                                 # la sangle croise l'écran sous la photo

# ---------- Le tissu : maille technique noire, quelques plis, à plat sous le téléphone et sous la sangle ----------
def dans_tel(p):
    q = ROT.inverted() @ p; dx = max(0.0, abs(q.x) - TW / 2); dy = max(0.0, abs(q.y) - TH / 2); return math.hypot(dx, dy), q
def lisse(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)
def tissu(name, w=0.70, h=0.56, pas=0.0028, seed=5.0):
    nx, ny = int(w / pas), int(h / pas)
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); V = []
    for j in range(ny + 1):
        row = []
        for i in range(nx + 1):
            x, y = (i / nx - 0.5) * w, (j / ny - 0.5) * h; p = Vector((x, y, 0))
            d, q = dans_tel(p)
            libre = lisse(0.006, 0.07, d) * lisse(0.012, 0.05, abs(q.y - YS))
            z = 0.0042 * noise.noise(Vector((x * 7.0 + seed, y * 4.0, seed))) + 0.0022 * noise.noise(Vector((x * 17.0, y * 13.0, seed + 2)))
            z += 0.0034 * math.exp(-((x * 0.5 - y * 0.87 + 0.115) / 0.016) ** 2) + 0.003 * math.exp(-((x * 0.94 + y * 0.34 - 0.165) / 0.02) ** 2)       # deux plis francs
            row.append(bm.verts.new((x, y, max(0.0, z + 0.0016) * libre)))
        V.append(row)
    for j in range(ny):
        for i in range(nx):
            f = bm.faces.new((V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i])); f.smooth = True
            for l, (a, b) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))): l[uvl].uv = (a / nx, b / ny)
    bm.normal_update(); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); return o, w, h

src = os.path.join(TEX, 'tissu-maille.png')
if not os.path.exists(src): src = os.path.join(ROOT, 'photos', 'maille.jpg')
print('TISSU', src)
def mat_maille(name, path, w, h, motif=0.062, relief=0.9, clair=1.0):
    """Maille : l'image répétée tous les « motif » mètres, en couleur et en relief (les trous se creusent)."""
    m, nt, out = lib._mat(name)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Roughness'].default_value = 0.78; b.inputs['Specular IOR Level'].default_value = opt('stissu', 0.12)      # sous une lumière rasante, un tissu noir à 0,35 vire au gris
    try: b.inputs['Sheen Weight'].default_value = opt('velours', 0.08); b.inputs['Sheen Roughness'].default_value = 0.45; b.inputs['Sheen Tint'].default_value = (0.62, 0.64, 0.7, 1)
    except Exception: pass
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (w / motif, h / motif, 1); mp.inputs['Rotation'].default_value[2] = R(4)
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(path); tex.extension = 'REPEAT'
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], tex.inputs['Vector'])
    hs = nt.nodes.new('ShaderNodeHueSaturation'); hs.inputs['Value'].default_value = clair; hs.inputs['Saturation'].default_value = 0.6
    nt.links.new(tex.outputs['Color'], hs.inputs['Color']); nt.links.new(hs.outputs['Color'], b.inputs['Base Color'])
    bw = nt.nodes.new('ShaderNodeRGBToBW'); nt.links.new(tex.outputs['Color'], bw.inputs[0])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = relief; bp.inputs['Distance'].default_value = 0.0007
    nt.links.new(bw.outputs[0], bp.inputs['Height']); nt.links.new(bp.outputs[0], b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs[0]); return m
t_, tw_, th_ = tissu('tissu')
t_.data.materials.append(mat_maille('maille', src, tw_, th_, motif=opt('motif', 0.062), clair=opt('clair', 0.8)))
plane('dessous', 3, 3, (0, 0, -0.002), mat=mat_pbr('dessous', '#050506', rough=0.8))

# ---------- Le téléphone ----------
ecran_m = mat_ecran_lum('ecran', art('3d2-ecran-mobile'), cam=1.0, diffus=opt('jet', 1.6), gloss=0.05, rough=0.03, alpha=True)
rep, ecran = telephone('tel', ecran_m, loc=(0, 0, 0.0004), rz=RZ, coque='#303034')
ZD = 0.0004 + TE                                                   # dessus du téléphone

# ---------- La sangle : tendue par-dessus le téléphone, d'un bord du cadre à l'autre ----------
sangle = mat_sangle('sangle', K['orange'], cols=6, pas_fil=0.13, rough=0.7, relief=1.0, lueur=opt('lueur', 0.12), spec=0.04)
L = lambda x, y, z: ROT @ Vector((x, y, z))                        # du repère du téléphone à celui de la scène
bx = TW / 2 + 0.0011
pts = arrondir([L(-0.62, YS, 0.0014), L(-bx, YS, ZD + 0.0012), L(bx, YS, ZD + 0.0012), L(0.62, YS, 0.0014)], 0.0045, n=10)
ruban('sangle', pts, LS, ep=0.0013, mat=sangle, lisse=False, travers=ROT @ Vector((0, 1, 0)), pas=0.0015)
RS = list(ruban.reperes)
def sur_sangle(x):
    """Repère de la sangle à l'abscisse x du téléphone (mètres, 0 = son axe)."""
    p, t, nr, side, _ = min(RS, key=lambda r: abs((ROT.inverted() @ r[0]).x - x))
    if nr.z < 0: nr = -nr
    return p, t, nr
# La griffe tissée « Custom.fr », cousue sur la sangle à gauche du téléphone
def griffe(name, x, image, l=0.036, h=0.0147):
    p, t, nr = sur_sangle(x); y = nr.cross(t)
    g = plane(name, l, h, mat=mat_imprime(name, image, rough=0.7, bump=0.35, lueur=opt('lueur_g', 0.0), alpha=True, spec=0.2)); orient(g, t, y, p + nr * 0.00125)
    c = box(name + '-fond', l + 0.0005, h + 0.0005, 0.0006, mat=mat_pbr(name + '-fond', K['encre'], rough=0.8)); orient(c, t, y, p + nr * 0.0008)
griffe('griffe', opt('gx', -0.072), art('3d2-griffe'))
# Un passant noir, à droite : deux barrettes qui pincent la sangle
def passant(name, x):
    p, t, nr = sur_sangle(x); y = nr.cross(t); noir = mat_pbr(name, '#0C0C0E', rough=0.32, coat=0.3)
    for k, dx in enumerate((-0.0048, 0.0048)):
        o = box(f'{name}-b{k}', 0.0032, LS + 0.007, 0.0034, mat=noir, bevel=0.0009); orient(o, t, y, p + t * dx + nr * 0.0014)
    for k, dy in enumerate((-(LS / 2 + 0.0026), LS / 2 + 0.0026)):
        o = box(f'{name}-c{k}', 0.0128, 0.0026, 0.0034, mat=noir, bevel=0.0009); orient(o, t, y, p + y * dy + nr * 0.0008)
passant('passant', opt('px', 0.078))

# ---------- L'écusson brodé ----------
def ecusson(name, loc, rz, w=0.074, h=0.0185):
    img = os.path.join(TEX, 'tech-broderie-logo.png'); objs = []
    objs.append(rrect(name + '-corps', w, h, 0.003, 0.0013, bevel=0.0003, mat=mat_pbr(name + '-corps', '#0D0D0F', rough=0.8), loc=(0, 0, 0.00065)))
    if os.path.exists(img): objs.append(plane(name + '-img', w - 0.0012, h - 0.0012, (0, 0, 0.00134), mat=mat_imprime(name + '-img', img, rough=0.6, bump=0.0, lueur=opt('lueur_e', 0.4), spec=0.3)))
    else: objs.append(logo_complet(name + '-logo', h * 0.5, extrude=0.0005, mat=mat_fluo(name + '-fil', lueur=0.1), loc=(0, 0, 0.0015)))
    # le bord surjeté : un cordon de fil fluo qui fait le tour
    r = 0.003; n = 8; c = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        c += [(cx + r * math.cos(R(a0 + 90 * k / n)), cy + r * math.sin(R(a0 + 90 * k / n)), 0.0009) for k in range(n + 1)]
    cu = bpy.data.curves.new(name + '-bord', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.00085; cu.bevel_resolution = 5
    sp = cu.splines.new('POLY'); sp.points.add(len(c) - 1); sp.use_cyclic_u = True
    for q, v in zip(sp.points, c): q.co = (*v, 1)
    cu.materials.append(mat_fluo(name + '-bord', lueur=opt('lueur_e', 0.4), rough=0.5, spec=0.2)); objs.append(link(bpy.data.objects.new(name + '-bord', cu)))
    return groupe(name, objs, loc=loc, rot=(0, 0, rz))
ecusson('ecusson', (opt('ex', 0.090), opt('ey', -0.046), 0.0006), RZ)

# ---------- La lumière : rasante, venue de la gauche et du fond ----------
area('rasante', (-0.55, 0.30, opt('hr', 0.15)), (0.0, 0.0, 0.0), opt('rasante', 9.5), size=0.20, size_y=0.07, color=(1.0, 0.97, 0.93))
k = area('contre', (0.45, 0.42, 0.16), (0.02, 0.0, 0.0), opt('contre', 4.0), size=0.3, color=(0.9, 0.93, 1.0))
area('appoint', (0.1, -0.35, 0.5), (0, 0, 0), opt('appoint', 1.2), size=0.6)

# ---------- La caméra : plongeante, serrée, mise au point sur le haut de l'écran ----------
EL = R(opt('el', 54.0)); DC = opt('dist', 0.505)
CT = Vector((opt('cx', 0.02), opt('cty', -0.004), 0.004))
CP = CT + DC * Vector((0, -math.cos(EL), math.sin(EL)))
cam = camera(tuple(CP), tuple(CT), lens=opt('lens', 70.0), dof=opt('dof', DC - 0.004), fstop=opt('f', 11.0))
render('32-telephone.png')
