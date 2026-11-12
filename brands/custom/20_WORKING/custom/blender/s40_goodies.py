# Planche 40 : les goodies. Une nature morte d'atelier, vue de trois quarts haut, sous une lumière dure : gourde noire,
# mug émaillé blanc, deux carnets (kraft au Cran, fluo au motif de blocs), stylo, tote bag écru, quatre badges, étiquette kraft,
# posés sur le tapis de découpe noir de l'atelier. Chaque objet porte le Cran, un sprite ou « custom.fr ».
# Cotes : gourde Ø 72 × 280 mm, mug Ø 83 × 90 mm, carnets A5 (148 × 210 × 13 mm), stylo 142 mm, tote 380 × 420 mm,
# badges Ø 38 mm, étiquette 50 × 90 mm, tapis 900 × 600 mm. Visuels : art/3d2-goodies.html (out/art/3d2-*.png).
# Repère : celui du tapis (x vers la droite, y vers le fond) ; la caméra tourne de 13,3° autour, la pente du Cran.
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s40_goodies.py -- --draft
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from custom3d2 import *
from mathutils import noise

reset(2800, 1575, samples=360)
world_color((0.66, 0.68, 0.74, 1), opt('ambiance', 0.18))
soleil(opt('az', 112.0), opt('el', 47.0), force=opt('soleil', 3.3), angle=opt('angle', 1.1), couleur='#FFF7EC')
LUEUR = opt('lueur', 0.10)

noir_mat = mat_pbr('noir-mat', '#111113', rough=0.52)
noir_sat = mat_pbr('noir-satin', '#0C0C0E', rough=0.3)
inox = mat_pbr('inox', '#C4C6CB', rough=0.26, metal=1.0)
fluo = mat_fluo('fluo', lueur=LUEUR, rough=0.5, spec=0.1)

# ---------- La table et le tapis de découpe ----------
plane('table', 6, 6, (0, 0, -0.0005), mat=mat_pbr('table', '#0B0B0C', rough=0.42))
rrect('tapis-corps', 0.90, 0.60, 0.012, 0.003, bevel=0.0006, mat=mat_pbr('tapis-corps', '#0E0E10', rough=0.6), loc=(0.02, 0.02, 0.0015))
plane('tapis', 0.90, 0.60, (0.02, 0.02, 0.00306), mat=mat_imprime('tapis', art('3d2-tapis'), rough=0.62, bump=0.25, spec=opt('stapis', 0.15)))

# ---------- Le tote bag : toile écrue, posée à plat, à peine froissée ----------
def tote(name, loc, rz=0.0, w=0.38, h=0.42, ep=0.0034, seed=4.0):
    nx, ny = 95, 105
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); V = []
    for j in range(ny + 1):
        row = []
        for i in range(nx + 1):
            u, v = i / nx, j / ny; x, y = (u - 0.5) * w, (v - 0.5) * h
            bord = min(u, 1 - u) * w; bordy = min(v, 1 - v) * h; b = min(bord, bordy)
            t = min(1.0, b / 0.006); arr = math.sin(t * math.pi / 2) ** 0.6                      # bord arrondi du sac
            pli = 0.0016 * noise.noise(Vector((x * 9, y * 9, seed))) + 0.0009 * noise.noise(Vector((x * 26, y * 26, seed + 3)))
            pli += 0.0012 * math.exp(-((x * 0.8 + y * 0.6 - 0.02) / 0.02) ** 2)               # un pli de rangement, en diagonale
            row.append(bm.verts.new((x, y, ep * arr + max(0.0, pli + 0.0012) * arr)))
        V.append(row)
    for j in range(ny):
        for i in range(nx):
            f = bm.faces.new((V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i])); f.smooth = True
            for l, uv_ in zip(f.loops, ((i / nx, j / ny), ((i + 1) / nx, j / ny), ((i + 1) / nx, (j + 1) / ny), (i / nx, (j + 1) / ny))): l[uvl].uv = uv_
    bm.normal_update(); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    m = mat_imprime(name + '-img', art('3d2-tote'), rough=0.86, spec=0.25)
    nt = m.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')                 # armure toile : deux trames croisées
    tc = nt.nodes.new('ShaderNodeTexCoord'); h_ = None
    for k, (sx, sy) in enumerate(((0.314 * w / 0.0009, 0.0), (0.0, 0.314 * h / 0.0009))):      # un fil tous les 0,9 mm
        mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (sx or 1e-4, sy or 1e-4, 1)
        wv = nt.nodes.new('ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'X' if sx else 'Y'; wv.inputs['Scale'].default_value = 1.0
        wv.inputs['Distortion'].default_value = 0.6; wv.inputs['Detail'].default_value = 1.0
        nt.links.new(tc.outputs['UV'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], wv.inputs['Vector'])
        if h_ is None: h_ = wv.outputs[1]
        else:
            ad = nt.nodes.new('ShaderNodeMath'); ad.operation = 'MAXIMUM'; nt.links.new(h_, ad.inputs[0]); nt.links.new(wv.outputs[1], ad.inputs[1]); h_ = ad.outputs[0]
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.55; bp.inputs['Distance'].default_value = 0.0003
    nt.links.new(h_, bp.inputs['Height']); nt.links.new(bp.outputs[0], b.inputs['Normal'])
    try: b.inputs['Sheen Weight'].default_value = 0.3
    except Exception: pass
    me.materials.append(m)
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = (0, 0, rz); return o

# ---------- La gourde ----------
def gourde(name, loc, az=0.0):
    r = 0.036
    prof = [(0, 0), (r - 0.005, 0)] + arc(0.005, -90, 0, 6, r - 0.005, 0.005) + [(r, 0.198), (r - 0.0006, 0.208), (r - 0.003, 0.219), (r - 0.007, 0.229), (r - 0.0115, 0.2365), (0.0228, 0.241), (0.0228, 0.247)]
    corps = tour_uv(name, prof, mat=noir_mat)
    bague = tour_uv(name + '-bague', [(0.0228, 0.2455), (0.0238, 0.2462), (0.0238, 0.2505), (0.0228, 0.2512)], mat=inox)
    bouchon = tour_uv(name + '-bouchon', [(0.0246, 0.2505), (0.0246, 0.2755)] + arc(0.004, 0, 90, 6, 0.0206, 0.2755) + [(0, 0.2795)], mat=noir_sat)
    anse = tube(name + '-anse', [(-0.0165, 0, 0.277), (-0.0175, 0, 0.289), (-0.010, 0, 0.3005), (0.010, 0, 0.3005), (0.0175, 0, 0.289), (0.0165, 0, 0.277)], 0.0031, mat=fluo)
    marque = etiquette_courbe(name + '-marque', r, 0.082, 0.0854, 0.066, mat_imprime(name + '-marque', art('3d2-gourde-marque'), rough=0.5, lueur=LUEUR, alpha=True, spec=0.3), az=0.0)
    g = groupe(name, [corps, bague, bouchon, anse, marque], loc=loc, rot=(0, 0, az)); return g

# ---------- Le mug émaillé ----------
def mug(name, loc, az=0.0, anse_az=R(140)):
    r, h, ep = 0.0415, 0.090, 0.0022
    email = mat_pbr(name + '-email', '#F3F3F0', rough=0.14, coat=0.6)
    bord = mat_pbr(name + '-bord', '#0A0A0C', rough=0.16, coat=0.6)
    prof = [(0, 0, 0), (r - 0.004, 0, 0)] + [(x, z, 0) for x, z in arc(0.004, -90, 0, 6, r - 0.004, 0.004)] + [(r, h - 0.003, 1)]
    prof += [(x, z, 1) for x, z in arc(0.0021, -40, 220, 12, r - 0.0011, h)]
    prof += [(r - ep, h - 0.004, 0), (r - ep, 0.007, 0)] + [(x, z, 0) for x, z in arc(0.004, 0, -90, 5, r - ep - 0.004, 0.007)] + [(0, 0.003, 0)]
    corps = tour_uv(name, prof, mats=[email, bord], vif=50)
    cafe = tour_uv(name + '-cafe', [(0, h - 0.013), (r - ep - 0.0002, h - 0.013)], mat=mat_pbr(name + '-cafe', '#0D0705', rough=0.04, coat=0.6))
    pa = Matrix.Rotation(anse_az - az, 3, 'Z')
    pts = [tuple(pa @ Vector(p)) for p in ((r - 0.0015, 0, h * 0.80), (r + 0.017, 0, h * 0.83), (r + 0.027, 0, h * 0.58), (r + 0.021, 0, h * 0.31), (r - 0.0015, 0, h * 0.22))]
    anse = tube(name + '-anse', pts, 0.0046, mat=email)
    marque = etiquette_courbe(name + '-marque', r, 0.020, 0.052, 0.0807, mat_imprime(name + '-marque', art('3d2-mug-marque'), rough=0.18, coat=0.5, alpha=True))
    return groupe(name, [corps, cafe, anse, marque], loc=loc, rot=(0, 0, az))

# ---------- Les carnets ----------
def carnet(name, image, loc, rz=0.0, couv='#E2FF21', w=0.148, h=0.210, ep=0.0130, lueur=0.0, signet=None, elastique=True):
    carton = mat_fluo(name + '-couv', couv, lueur=lueur, rough=0.62, spec=0.1)
    pages = mat_papier(name + '-pages', '#EDEAE1', rough=0.8, bump=0.3, echelle=1400)
    objs = [rrect(name + '-dos', w, h, 0.006, 0.0018, bevel=0.0003, mat=carton, loc=(0, 0, 0.0009)),
            rrect(name + '-plat', w, h, 0.006, 0.0018, bevel=0.0003, mat=carton, loc=(0, 0, ep - 0.0009)),
            rrect(name + '-pages', w - 0.004, h - 0.005, 0.005, ep - 0.0036, mat=pages, loc=(-0.0004, 0, ep / 2)),
            box(name + '-tranche', 0.0018, h - 0.012, ep - 0.0006, (-w / 2 + 0.0009, 0, ep / 2), mat=carton),
            plane(name + '-img', w, h, (0, 0, ep + 0.00005), mat=mat_imprime(name + '-img', image, rough=0.62, bump=0.12, lueur=lueur, alpha=True, spec=0.1))]
    if elastique:
        el = mat_pbr(name + '-elastique', '#0B0B0D', rough=0.75)
        objs.append(box(name + '-el', 0.0075, h + 0.0012, 0.0009, (w / 2 - 0.021, 0, ep + 0.0005), mat=el))
        for s in (-1, 1): objs.append(box(f'{name}-el{s}', 0.0075, 0.0009, ep + 0.001, (w / 2 - 0.021, s * (h / 2 + 0.0004), ep / 2), mat=el))
    if signet:
        x0 = 0.018
        objs.append(ruban(name + '-signet', [(x0, -h / 2 + 0.004, ep * 0.55), (x0 + 0.001, -h / 2 - 0.012, ep * 0.5), (x0 + 0.004, -h / 2 - 0.026, 0.0016), (x0 + 0.009, -h / 2 - 0.046, 0.0008)],
                          0.007, ep=0.0004, mat=mat_fluo(name + '-signet', signet, lueur=LUEUR, rough=0.4), pas=0.002))
    return groupe(name, objs, loc=loc, rot=(0, 0, rz))

# ---------- Le stylo ----------
def stylo(name, loc, cap, vers_cam):
    """Stylo couché. cap : angle de son axe dans le plan de la table (degrés). vers_cam : direction horizontale vers la caméra."""
    r = 0.0052
    mats = [mat_pbr(name + '-noir', '#0E0E10', rough=0.34), inox, fluo]
    prof = [(0, 0, 1), (0.0010, 0, 1), (0.0019, 0.006, 1), (0.0044, 0.0185, 2), (0.0054, 0.0195, 2), (0.0054, 0.0225, 0), (r, 0.0235, 0), (r, 0.128, 1), (r + 0.0002, 0.1285, 1), (r + 0.0002, 0.1315, 2),
            (0.0037, 0.132, 2), (0.0037, 0.1405, 2), (0.0030, 0.142, 2), (0, 0.142, 2)]
    corps = tour_uv(name, prof, mats=mats, seg=48, vif=30)
    d = Vector((math.cos(R(cap)), math.sin(R(cap)), 0)); up = Vector((0, 0, 1))
    h_ = Vector(vers_cam); h_ = (h_ - d * h_.dot(d)).normalized()
    n = (up * 0.72 + h_ * 0.69).normalized()                      # le marquage regarde entre le ciel et la caméra
    X = (-n).cross(d); s = 1 if X.z >= 0 else -1                  # l'agrafe du côté qui monte
    agrafe = [box(name + '-agrafe', 0.0013, 0.0034, 0.044, (s * (r + 0.0019), 0, 0.106), mat=fluo, bevel=0.0004),
              box(name + '-agrafe-pied', 0.0034, 0.0034, 0.005, (s * (r + 0.0006), 0, 0.1265), mat=fluo, bevel=0.0004)]
    marque = etiquette_courbe(name + '-marque', r, 0.050, 0.055, 0.009, mat_imprime(name + '-marque', art('3d2-stylo-marque'), rough=0.34, lueur=LUEUR, alpha=True, spec=0.3), seg=16, decolle=0.00006)
    g = groupe(name, [corps, marque] + agrafe)
    m = Matrix((X, -n, d)).transposed().to_4x4(); m.translation = Vector(loc) + up * (r + 0.0003) - d * 0.071
    g.matrix_world = m; return g

# ---------- Les badges ----------
def badge(name, image, loc, rz=0.0, d=0.038):
    r = d / 2; hb = 0.0046; seg = 72
    prof = [(0, hb), (r * 0.45, hb * 0.985), (r * 0.72, hb * 0.93), (r * 0.88, hb * 0.80), (r * 0.965, hb * 0.58), (r, hb * 0.30), (r, 0.0009)]
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); rings = []
    for rr, z in prof:
        rings.append([bm.verts.new((0, 0, z))] if rr < 1e-9 else [bm.verts.new((rr * math.cos(2 * math.pi * i / seg), rr * math.sin(2 * math.pi * i / seg), z)) for i in range(seg)])
    for a, b in zip(rings, rings[1:]):
        for i in range(seg):
            j = (i + 1) % seg
            f = bm.faces.new((a[0], b[i], b[j])) if len(a) == 1 else bm.faces.new((a[i], b[i], b[j], a[j]))
            f.smooth = True
            for l in f.loops: l[uvl].uv = (0.5 + 0.47 * l.vert.co.x / r, 0.5 + 0.47 * l.vert.co.y / r)
    bm.normal_update(); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.materials.append(mat_imprime(name + '-img', image, rough=0.1, coat=1.0, lueur=LUEUR))
    o = link(bpy.data.objects.new(name, me))
    dos = cyl(name + '-dos', r - 0.0006, 0.0012, (0, 0, 0.0006), mat=inox, seg=48)
    return groupe(name, [o, dos], loc=loc, rot=(0, 0, rz))

# ---------- L'étiquette volante ----------
def etiquette(name, loc, rz=0.0, w=0.050, h=0.090):
    kraft = mat_papier(name + '-kraft', '#B8926A', rough=0.85, bump=0.35, echelle=1100)
    objs = [rrect(name + '-carte', w, h, 0.003, 0.0007, mat=kraft, loc=(0, 0, 0.00035)),
            plane(name + '-img', w, h, (0, 0, 0.00074), mat=mat_imprime(name + '-img', art('3d2-etiquette'), rough=0.85, bump=0.3, alpha=True, spec=0.25))]
    fil = mat_pbr(name + '-fil', '#E9E6DE', rough=0.8)
    y0 = h / 2 - 0.0075
    objs.append(tube(name + '-fil', [(0.0, y0, 0.0012), (0.004, y0 + 0.012, 0.0022), (0.016, y0 + 0.030, 0.001), (0.040, y0 + 0.036, 0.001), (0.058, y0 + 0.020, 0.001), (0.050, y0 - 0.004, 0.0016), (0.026, y0 + 0.004, 0.0024),
                                    (0.006, y0 + 0.004, 0.0022), (-0.001, y0 - 0.0005, 0.0012)], 0.0006, mat=fil))
    return groupe(name, objs, loc=loc, rot=(0, 0, rz))

# ---------- La composition ----------
TOURNE = opt('tourne', PENTE)
AZC = R(-90 - TOURNE); ELC = R(opt('elc', 50.0)); DC = opt('dist', 1.75)
VERS = Vector((math.cos(AZC), math.sin(AZC), 0))                              # du sujet vers la caméra, à plat
DR = Vector((-VERS.y, VERS.x, 0)); FD = -VERS                                 # la droite et le fond, vus de la caméra
Z0 = 0.0031                                                                   # dessus du tapis
ZT = Z0 + 0.0046                                                              # dessus du tote
def V(vx, vy, z=Z0):
    """Position donnée dans le repère de l'image (vx vers la droite, vy vers le fond), rendue dans celui du tapis."""
    p = DR * vx + FD * vy; return (p.x, p.y, z)
tote('tote', V(opt('tx', -0.215), opt('ty', 0.10)), rz=R(0))
gourde('gourde', V(opt('gx', 0.03), opt('gy', 0.0)), az=AZC + R(90) + R(4))
mug('mug', V(opt('ux', 0.24), opt('uy', 0.12)), az=AZC + R(90) - R(6), anse_az=R(35))
carnet('carnet-kraft', art('3d2-carnet-kraft'), V(-0.27, -0.135, ZT), rz=R(0), couv='#B8926A', elastique=False)
carnet('carnet-fluo', art('3d2-carnet-fluo'), V(-0.125, -0.125, Z0), rz=R(-5), couv=K['fluo'], lueur=LUEUR, signet=K['orange'])
stylo('stylo', V(opt('sx', 0.205), opt('sy', -0.165)), cap=opt('cap', 22.0), vers_cam=VERS)
badge('badge-1', art('3d2-badge-1'), V(0.165, -0.03), rz=R(-6))
badge('badge-2', art('3d2-badge-2'), V(-0.075, 0.03, ZT), rz=R(8))
badge('badge-3', art('3d2-badge-3'), V(0.218, -0.068), rz=R(5))
badge('badge-4', art('3d2-badge-4'), V(0.228, -0.008), rz=R(-3))
etiquette('etiquette', V(opt('ex', 0.32), opt('ey', -0.05)), rz=R(opt('erz', -24.0)))

CT = Vector((opt('cx', 0.0), opt('cty', 0.0), 0.035))
cam = camera(tuple(CT + DC * Vector((math.cos(ELC) * math.cos(AZC), math.cos(ELC) * math.sin(AZC), math.sin(ELC)))), tuple(CT), lens=opt('lens', 85.0), dof=DC, fstop=opt('f', 10.0))
render('40-goodies.png')
