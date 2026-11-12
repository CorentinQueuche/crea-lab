# Aides communes aux scènes Blender d'une identité de marque (rendu sans écran : blender --factory-startup -b -P blender/scene.py -- [--draft]).
# Copié dans <projet>/blender/lib.py par nouveau_projet.py. Le logo et la police viennent de brand/logo/logo.json (tools/export_logo.py).
import bpy, bmesh, math, os, sys
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'out', 'art')
OUT = os.path.join(ROOT, 'out', 'blender')
TEX = os.path.join(ROOT, 'blender', 'tex')
FONTS = os.path.join(ROOT, 'brand', 'fonts')
os.makedirs(OUT, exist_ok=True)

def argv():
    a = sys.argv
    return a[a.index('--') + 1:] if '--' in a else []

def hex_rgb(h, a=1.0):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c]
    return (*lin, a)

def reset(w=2800, h=1575, samples=256, transform='Standard'):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for dev in ('OPTIX', 'CUDA'):
        try:
            prefs.compute_device_type = dev
            prefs.get_devices()
            break
        except Exception as e:
            print('périphérique', dev, 'indisponible', e)
    for d in prefs.devices:
        d.use = d.type != 'CPU'
    sc.cycles.device = 'GPU'
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.01
    sc.cycles.use_denoising = True
    try: sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    sc.cycles.max_bounces = 8
    sc.cycles.sample_clamp_indirect = 8
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'
    sc.view_settings.view_transform = transform
    try: sc.view_settings.look = 'None'
    except Exception: pass
    world = bpy.data.worlds.new('W'); sc.world = world
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs[0].default_value = (0, 0, 0, 1)
    return sc

def world_color(col, strength=1.0):
    bg = next(n for n in bpy.context.scene.world.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs[0].default_value = col; bg.inputs[1].default_value = strength

def world_hdri(path, strength=1.0, rot_z=0.0):
    nt = bpy.context.scene.world.node_tree
    bg = next(n for n in nt.nodes if n.type == 'BACKGROUND')
    env = nt.nodes.new('ShaderNodeTexEnvironment'); env.image = bpy.data.images.load(path)
    mp = nt.nodes.new('ShaderNodeMapping'); tc = nt.nodes.new('ShaderNodeTexCoord')
    mp.inputs['Rotation'].default_value[2] = rot_z
    nt.links.new(tc.outputs['Generated'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], env.inputs['Vector'])
    nt.links.new(env.outputs['Color'], bg.inputs['Color']); bg.inputs[1].default_value = strength

def _mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    return m, nt, out

nouvelle_matiere = _mat   # pour écrire une matière maison : m, nt, out = nouvelle_matiere('nom')

def mat_pbr(name, color, rough=0.5, metal=0.0, spec=None, coat=0.0, emit=None, emit_strength=0.0):
    m, nt, out = _mat(name)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = color if isinstance(color, tuple) else hex_rgb(color)
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if coat: b.inputs['Coat Weight'].default_value = coat
    if emit is not None:
        b.inputs['Emission Color'].default_value = emit if isinstance(emit, tuple) else hex_rgb(emit)
        b.inputs['Emission Strength'].default_value = emit_strength
    nt.links.new(b.outputs[0], out.inputs[0])
    return m

def mat_emit(name, color, strength=1.0):
    m, nt, out = _mat(name)
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs[0].default_value = color if isinstance(color, tuple) else hex_rgb(color); e.inputs[1].default_value = strength
    nt.links.new(e.outputs[0], out.inputs[0]); return m

def mat_screen(name, image_path, strength=1.0, gloss=0.06, rough=0.08):
    """Écran lumineux : image en émission, avec un léger reflet de verre par-dessus."""
    m, nt, out = _mat(name)
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(image_path); tex.extension = 'EXTEND'
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs[1].default_value = strength
    nt.links.new(tex.outputs['Color'], e.inputs[0])
    if gloss > 0:
        g = nt.nodes.new('ShaderNodeBsdfGlossy'); g.inputs['Roughness'].default_value = rough
        add = nt.nodes.new('ShaderNodeMixShader'); fr = nt.nodes.new('ShaderNodeFresnel'); fr.inputs[0].default_value = 1.45
        mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = gloss / 0.04
        nt.links.new(fr.outputs[0], mul.inputs[0]); nt.links.new(mul.outputs[0], add.inputs[0])
        nt.links.new(e.outputs[0], add.inputs[1]); nt.links.new(g.outputs[0], add.inputs[2])
        nt.links.new(add.outputs[0], out.inputs[0])
    else:
        nt.links.new(e.outputs[0], out.inputs[0])
    return m

def mat_image(name, image_path, rough=0.5, spec=0.5, bump=0.0, coat=0.0):
    """Surface imprimée : image en couleur de base (papier, carte, affiche)."""
    m, nt, out = _mat(name)
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(image_path); tex.extension = 'EXTEND'
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Roughness'].default_value = rough
    if coat: b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.15
    nt.links.new(tex.outputs['Color'], b.inputs['Base Color'])
    if bump:
        nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 900; nz.inputs['Detail'].default_value = 4
        bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.0002
        nt.links.new(nz.outputs[0], bp.inputs['Height']); nt.links.new(bp.outputs[0], b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs[0]); return m

def mat_floor(name='sol', color='#050305', rough=0.2, var=0.12, bump=0.02, scale=6.0):
    """Sol sombre et brillant, avec une légère irrégularité pour des reflets vivants."""
    m, nt, out = _mat(name)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Base Color'].default_value = hex_rgb(color)
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = scale; nz.inputs['Detail'].default_value = 8; nz.inputs['Roughness'].default_value = 0.6
    mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs[3].default_value = max(0.0, rough - var); mr.inputs[4].default_value = rough + var
    nt.links.new(nz.outputs[0], mr.inputs[0]); nt.links.new(mr.outputs[0], b.inputs['Roughness'])
    if bump:
        nz2 = nt.nodes.new('ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = scale * 40; nz2.inputs['Detail'].default_value = 6
        bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.002
        nt.links.new(nz2.outputs[0], bp.inputs['Height']); nt.links.new(bp.outputs[0], b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs[0]); return m

def mat_pbr_tex(name, folder, base, scale=1.0, rough_mul=1.0, tint=None, bump_strength=1.0):
    """Matériau à partir d'un jeu Poly Haven (diff, rough, nor_gl) rangé dans blender/tex/<folder>."""
    m, nt, out = _mat(name)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (scale, scale, scale)
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector'])
    def img(suffix, cs):
        p = os.path.join(TEX, folder, f'{base}_{suffix}_2k.jpg')
        if not os.path.exists(p): return None
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(p); t.image.colorspace_settings.name = cs
        nt.links.new(mp.outputs['Vector'], t.inputs['Vector']); return t
    d = img('diff', 'sRGB'); r = img('rough', 'Non-Color'); n = img('nor_gl', 'Non-Color')
    if d:
        if tint:
            mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 1.0
            mx.inputs['B'].default_value = hex_rgb(tint) if isinstance(tint, str) else tint
            nt.links.new(d.outputs['Color'], mx.inputs['A']); nt.links.new(mx.outputs['Result'], b.inputs['Base Color'])
        else:
            nt.links.new(d.outputs['Color'], b.inputs['Base Color'])
    if r:
        ml = nt.nodes.new('ShaderNodeMath'); ml.operation = 'MULTIPLY'; ml.inputs[1].default_value = rough_mul; ml.use_clamp = True
        nt.links.new(r.outputs['Color'], ml.inputs[0]); nt.links.new(ml.outputs[0], b.inputs['Roughness'])
    if n:
        nm = nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = bump_strength
        nt.links.new(n.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs[0], b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs[0]); return m

def link(obj):
    bpy.context.scene.collection.objects.link(obj); return obj

def plane(name, w, h, loc=(0, 0, 0), rot=(0, 0, 0), mat=None, uv_scale=1.0, uv_m=None):
    """Plan dans XY (normale +Z), UV 0-1 (une image s'y étale entière). Pour une matière répétée sur un plan non carré,
    donner uv_m : la taille en mètres d'une répétition de la texture (sinon la matière est étirée)."""
    me = bpy.data.meshes.new(name)
    v = [(-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0)]
    me.from_pydata(v, [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new(name='UVMap')
    su, sv = (w / uv_m, h / uv_m) if uv_m else (uv_scale, uv_scale)
    for i, co in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]): uv.data[i].uv = (co[0] * su, co[1] * sv)
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = rot
    if mat: me.materials.append(mat)
    return o

def screen_v(name, w, h, loc, mat, rot_z=0.0):
    """Plan vertical face à -Y (visible depuis une caméra placée en y négatif), image à l'endroit."""
    return plane(name, w, h, loc, (math.radians(90), 0, rot_z), mat)

def box(name, sx, sy, sz, loc=(0, 0, 0), rot=(0, 0, 0), mat=None, bevel=0.0, seg=3, uv_m=1.0):
    """Boîte centrée. Les UV sont projetés face par face, uv_m mètres par répétition de texture : une matière
    Poly Haven s'y applique sans étirement (sans UV, elle donnerait un aplat, sans message)."""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co.x *= sx; v.co.y *= sy; v.co.z *= sz
    uvl = bm.loops.layers.uv.new('UVMap'); bm.normal_update()
    for f in bm.faces:
        n = f.normal; k = max(range(3), key=lambda i: abs(n[i])); ax = [i for i in range(3) if i != k]
        for l in f.loops: l[uvl].uv = (l.vert.co[ax[0]] / uv_m, l.vert.co[ax[1]] / uv_m)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = rot
    if mat: me.materials.append(mat)
    if bevel:
        md = o.modifiers.new('bevel', 'BEVEL'); md.width = bevel; md.segments = seg; md.limit_method = 'ANGLE'
        for p in me.polygons: p.use_smooth = True
    return o

def cyl(name, r, depth, loc=(0, 0, 0), rot=(0, 0, 0), mat=None, seg=96, bevel=0.0):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=r, depth=depth)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = rot
    if mat: me.materials.append(mat)
    for p in me.polygons: p.use_smooth = len(p.vertices) == 4
    if bevel:
        md = o.modifiers.new('bevel', 'BEVEL'); md.width = bevel; md.segments = 3; md.limit_method = 'ANGLE'
    return o

def camera(loc, target, lens=50, dof=None, fstop=2.8, sensor=36):
    cd = bpy.data.cameras.new('cam'); cd.lens = lens; cd.sensor_width = sensor
    o = link(bpy.data.objects.new('cam', cd)); o.location = loc
    d = Vector(target) - Vector(loc); o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    if dof is not None:
        cd.dof.use_dof = True; cd.dof.focus_distance = dof; cd.dof.aperture_fstop = fstop
    bpy.context.scene.camera = o; return o

def area(name, loc, target, power, size=1.0, size_y=None, color=(1, 1, 1), spread=None):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = power; ld.size = size; ld.color = color[:3]
    if size_y: ld.shape = 'RECTANGLE'; ld.size_y = size_y
    if spread is not None: ld.spread = spread
    o = link(bpy.data.objects.new(name, ld)); o.location = loc
    d = Vector(target) - Vector(loc); o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler(); return o

def spot(name, loc, target, power, angle=40, blend=0.3, color=(1, 1, 1), radius=0.05):
    ld = bpy.data.lights.new(name, 'SPOT'); ld.energy = power; ld.spot_size = math.radians(angle); ld.spot_blend = blend; ld.color = color[:3]; ld.shadow_soft_size = radius
    o = link(bpy.data.objects.new(name, ld)); o.location = loc
    d = Vector(target) - Vector(loc); o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler(); return o

_LOGO = None
def logo_data():
    """Tracés et police de la marque, écrits par tools/export_logo.py dans brand/logo/logo.json."""
    global _LOGO
    if _LOGO is None:
        import json
        with open(os.path.join(ROOT, 'brand', 'logo', 'logo.json'), encoding='utf-8') as f: _LOGO = json.load(f)
    return _LOGO

def text(name, body, size, font='Regular', loc=(0, 0, 0), rot=(0, 0, 0), mat=None, extrude=0.0, align='LEFT', spacing=1.0, line=1.0):
    """Texte en police de marque (graisse : Light, Regular, Medium… selon Marque.FONTS.graisses)."""
    cu = bpy.data.curves.new(name, 'FONT'); cu.body = body; cu.size = size; cu.extrude = extrude
    cu.font = bpy.data.fonts.load(os.path.join(FONTS, f"{logo_data()['police']}-{font}.ttf")); cu.align_x = align; cu.space_character = spacing; cu.space_line = line
    o = link(bpy.data.objects.new(name, cu)); o.location = loc; o.rotation_euler = rot
    if mat: cu.materials.append(mat)
    return o

# ---------- Logo en géométrie : lu depuis les tracés SVG de la marque ----------
def _arc(cx, cy, r, a0, a1, n=48):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]

def svg_loops(d, n=20):
    """Aplatit un attribut d de <path> SVG en contours fermés (listes de points, repère SVG, y vers le bas).
    Commandes prises en charge : M L H V C S Q T A Z, absolues et relatives."""
    import re
    pos = 0; L = len(d)
    num_re = re.compile(r'\s*,?\s*([-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?)')
    sep_re = re.compile(r'\s*,?\s*')
    def num():
        nonlocal pos
        m = num_re.match(d, pos)
        if not m: raise ValueError('nombre attendu à ' + str(pos) + ' : ' + d[pos:pos + 20])
        pos = m.end(); return float(m.group(1))
    def flag():
        nonlocal pos
        while pos < L and d[pos] in ' ,\t\r\n': pos += 1
        c = d[pos]; pos += 1; return c == '1'
    loops = []; cur = []; x = y = sx = sy = 0.0; px = py = None; cmd = None
    def bez(pts):
        for i in range(1, n + 1):
            t = i / n
            if len(pts) == 3:
                cur.append(((1 - t) ** 2 * pts[0][0] + 2 * (1 - t) * t * pts[1][0] + t * t * pts[2][0], (1 - t) ** 2 * pts[0][1] + 2 * (1 - t) * t * pts[1][1] + t * t * pts[2][1]))
            else:
                cur.append(((1 - t) ** 3 * pts[0][0] + 3 * (1 - t) ** 2 * t * pts[1][0] + 3 * (1 - t) * t * t * pts[2][0] + t ** 3 * pts[3][0], (1 - t) ** 3 * pts[0][1] + 3 * (1 - t) ** 2 * t * pts[1][1] + 3 * (1 - t) * t * t * pts[2][1] + t ** 3 * pts[3][1]))
    def arc(x1, y1, rx, ry, phi, fa, fs, x2, y2):
        if rx == 0 or ry == 0 or (x1 == x2 and y1 == y2): cur.append((x2, y2)); return
        rx, ry = abs(rx), abs(ry); ph = math.radians(phi); c, s_ = math.cos(ph), math.sin(ph)
        dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
        xp, yp = c * dx + s_ * dy, -s_ * dx + c * dy
        lam = xp * xp / (rx * rx) + yp * yp / (ry * ry)
        if lam > 1: rx *= math.sqrt(lam); ry *= math.sqrt(lam)
        den = rx * rx * yp * yp + ry * ry * xp * xp
        k = math.sqrt(max(0.0, (rx * rx * ry * ry - den) / den)) * (-1 if fa == fs else 1)
        cxp, cyp = k * rx * yp / ry, -k * ry * xp / rx
        cx, cy = c * cxp - s_ * cyp + (x1 + x2) / 2, s_ * cxp + c * cyp + (y1 + y2) / 2
        a1 = math.atan2((yp - cyp) / ry, (xp - cxp) / rx); a2 = math.atan2((-yp - cyp) / ry, (-xp - cxp) / rx)
        da = a2 - a1
        if fs and da < 0: da += 2 * math.pi
        if not fs and da > 0: da -= 2 * math.pi
        m = max(4, int(abs(da) / (2 * math.pi) * 96))
        for i in range(1, m + 1):
            a = a1 + da * i / m
            cur.append((cx + rx * math.cos(a) * c - ry * math.sin(a) * s_, cy + rx * math.cos(a) * s_ + ry * math.sin(a) * c))
    while pos < L:
        while pos < L and d[pos] in ' ,\t\r\n': pos += 1
        if pos >= L: break
        if d[pos].isalpha(): cmd = d[pos]; pos += 1
        rel = cmd.islower(); C = cmd.upper(); ox, oy = (x, y) if rel else (0.0, 0.0)
        if C == 'Z':
            if len(cur) > 2: loops.append(cur)
            cur = []; x, y = sx, sy; px = py = None; continue
        if C == 'M':
            if len(cur) > 2: loops.append(cur)
            x, y = num() + ox, num() + oy; sx, sy = x, y; cur = [(x, y)]; cmd = 'l' if rel else 'L'; px = py = None
        elif C == 'L': x, y = num() + ox, num() + oy; cur.append((x, y)); px = py = None
        elif C == 'H': x = num() + ox; cur.append((x, y)); px = py = None
        elif C == 'V': y = num() + oy; cur.append((x, y)); px = py = None
        elif C == 'C':
            p1 = (num() + ox, num() + oy); p2 = (num() + ox, num() + oy); p3 = (num() + ox, num() + oy)
            bez([(x, y), p1, p2, p3]); px, py = p2; x, y = p3
        elif C == 'S':
            p1 = (2 * x - px, 2 * y - py) if px is not None else (x, y); p2 = (num() + ox, num() + oy); p3 = (num() + ox, num() + oy)
            bez([(x, y), p1, p2, p3]); px, py = p2; x, y = p3
        elif C == 'Q':
            p1 = (num() + ox, num() + oy); p2 = (num() + ox, num() + oy)
            bez([(x, y), p1, p2]); px, py = p1; x, y = p2
        elif C == 'T':
            p1 = (2 * x - px, 2 * y - py) if px is not None else (x, y); p2 = (num() + ox, num() + oy)
            bez([(x, y), p1, p2]); px, py = p1; x, y = p2
        elif C == 'A':
            rx, ry, phi = num(), num(), num(); fa, fs = flag(), flag(); x2, y2 = num() + ox, num() + oy
            arc(x, y, rx, ry, phi, fa, fs, x2, y2); x, y = x2, y2; px = py = None
        else: raise ValueError('commande SVG inconnue : ' + cmd)
    if len(cur) > 2: loops.append(cur)
    return loops

def logo(name, height=1.0, extrude=0.05, bevel=0.0, mat=None, part='logotype', loc=(0, 0, 0), rot=(math.radians(90), 0, 0), center=True):
    """Logo de la marque en volume. part : 'logotype', 'symbole' ou 'descripteur' (le texte à droite du logotype, même repère).
    height = hauteur d'x du logotype en mètres (pour le symbole : sa hauteur totale). Debout face à -Y par défaut,
    posé sur sa ligne de base en z = loc.z. center=True centre sur la largeur du logotype (ou du symbole).
    L'extrusion se fait de part et d'autre de loc : pour plaquer des lettres sur un mur, décaler loc d'une demi-épaisseur.
    Le centre vertical du symbole est à loc.z + height / 2."""
    P = logo_data()[part]; s = height / P['x_height']
    ref = logo_data()['symbole' if part == 'symbole' else 'logotype']['box']
    x0 = ref[0] + ref[2] / 2 if center else ref[0]
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'
    for loop in svg_loops(P['d']):
        if abs(loop[0][0] - loop[-1][0]) < 1e-6 and abs(loop[0][1] - loop[-1][1]) < 1e-6: loop = loop[:-1]
        sp = cu.splines.new('POLY'); sp.points.add(len(loop) - 1)
        for p, (x, y) in zip(sp.points, loop): p.co = ((x - x0) * s, (P['baseline'] - y) * s, 0, 1)
        sp.use_cyclic_u = True
    cu.extrude = extrude / 2; cu.bevel_depth = bevel; cu.bevel_resolution = 3
    o = link(bpy.data.objects.new(name, cu)); o.location = loc; o.rotation_euler = rot
    if mat: cu.materials.append(mat)
    return o

def render(name, w=None, h=None):
    sc = bpy.context.scene
    if w: sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.filepath = os.path.join(OUT, name)
    if '--draft' in argv():
        sc.render.resolution_percentage = 35; sc.cycles.samples = 48
        sc.render.filepath = os.path.join(OUT, 'draft-' + name)
    bpy.ops.render.render(write_still=True)
    print('RENDU', sc.render.filepath)

def rrect(name, w, h, r, thick, bevel=0.0, mat=None, loc=(0, 0, 0), rot=(0, 0, 0)):
    """Rectangle arrondi extrudé (dans XY, épaisseur selon Z, centré)."""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'
    pts = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        pts += _arc(cx, cy, r, a0, a0 + 90, 20)
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, (x, y) in zip(sp.points, pts): p.co = (x, y, 0, 1)
    sp.use_cyclic_u = True
    cu.extrude = max(0.0, thick / 2 - bevel); cu.bevel_depth = bevel; cu.bevel_resolution = 4
    o = link(bpy.data.objects.new(name, cu)); o.location = loc; o.rotation_euler = rot
    if mat: cu.materials.append(mat)
    return o

def orient(obj, x_axis, y_axis, loc):
    """Place un objet : son axe X local, son axe Y local (monde), sa position."""
    from mathutils import Matrix
    x = Vector(x_axis).normalized(); y = Vector(y_axis).normalized(); z = x.cross(y)
    m = Matrix((x, y, z)).transposed().to_4x4(); m.translation = Vector(loc)
    obj.matrix_world = m; return obj

def tube(name, pts, radius, mat=None):
    """Câble : courbe de Bézier lissée passant par les points."""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = 6; cu.resolution_u = 24; cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = link(bpy.data.objects.new(name, cu))
    if mat: cu.materials.append(mat)
    return o

def cam_rect(obj):
    """Rectangle écran (pixels, origine en haut à gauche) occupé par les 4 coins d'un plan, vu par la caméra."""
    from bpy_extras.object_utils import world_to_camera_view
    sc = bpy.context.scene; bpy.context.view_layer.update()
    w, h = sc.render.resolution_x, sc.render.resolution_y
    out = []
    for v in obj.data.vertices:
        c = world_to_camera_view(sc, sc.camera, obj.matrix_world @ v.co)
        out.append([round(c.x * w, 2), round((1 - c.y) * h, 2)])
    return out

def cyl_uv(name, r, h, loc=(0, 0, 0), mat_side=None, mat_caps=None, r_top=None, seg=128, rot_z=0.0, cap_top=True, cap_bottom=True):
    """Cylindre ou tronc de cône debout (base en z = loc.z) dont le flanc est déplié en UV : u fait le tour (0 à 1),
    v monte (0 à 1). Sert aux emballages et objets ronds habillés d'une image : boîte, gobelet, pot, bougie, canette.
    L'image du flanc est un bandeau de proportion (2 * pi * r) x h ; son milieu (u = 0,5) fait face à -Y quand rot_z = 0.
    r_top différent de r donne un gobelet. mat_side : matière du flanc ; mat_caps : matière des deux disques."""
    rt = r if r_top is None else r_top
    bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap')
    ring_b, ring_t = [], []
    for i in range(seg + 1):
        a = 2 * math.pi * i / seg + math.pi / 2          # u = 0,5 en face de -Y
        ring_b.append(bm.verts.new((r * math.cos(a), r * math.sin(a), 0)))
        ring_t.append(bm.verts.new((rt * math.cos(a), rt * math.sin(a), h)))
    for i in range(seg):
        f = bm.faces.new((ring_b[i], ring_b[i + 1], ring_t[i + 1], ring_t[i])); f.smooth = True; f.material_index = 0
        us = (i / seg, (i + 1) / seg, (i + 1) / seg, i / seg); vs = (0, 0, 1, 1)
        for l, u_, v_ in zip(f.loops, us, vs): l[uv].uv = (u_, v_)
    for ring, z, on, flip in ((ring_b, 0, cap_bottom, True), (ring_t, h, cap_top, False)):
        if not on: continue
        rr = r if z == 0 else rt
        vs_ = [bm.verts.new((rr * math.cos(2 * math.pi * i / seg), rr * math.sin(2 * math.pi * i / seg), z)) for i in range(seg)]
        f = bm.faces.new(list(reversed(vs_)) if flip else vs_); f.material_index = 1
        for l in f.loops: l[uv].uv = (0.5 + l.vert.co.x / (2 * rr), 0.5 + l.vert.co.y / (2 * rr))
    bm.normal_update()
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.materials.append(mat_side or mat_pbr(name + '-flanc', '#DDDDDD', rough=0.5))
    me.materials.append(mat_caps or mat_side or mat_pbr(name + '-disque', '#DDDDDD', rough=0.5))
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = (0, 0, rot_z)
    return o
