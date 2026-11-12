# Aides communes aux scènes Blender d'Aube (rendu sans écran : blender -b -P scene.py -- [options]).
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

def plane(name, w, h, loc=(0, 0, 0), rot=(0, 0, 0), mat=None, uv_scale=1.0):
    """Plan dans XY (normale +Z), UV 0-1."""
    me = bpy.data.meshes.new(name)
    v = [(-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0)]
    me.from_pydata(v, [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new(name='UVMap')
    for i, co in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]): uv.data[i].uv = (co[0] * uv_scale, co[1] * uv_scale)
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = rot
    if mat: me.materials.append(mat)
    return o

def screen_v(name, w, h, loc, mat, rot_z=0.0):
    """Plan vertical face à -Y (visible depuis une caméra placée en y négatif), image à l'endroit."""
    return plane(name, w, h, loc, (math.radians(90), 0, rot_z), mat)

def box(name, sx, sy, sz, loc=(0, 0, 0), rot=(0, 0, 0), mat=None, bevel=0.0, seg=3):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co.x *= sx; v.co.y *= sy; v.co.z *= sz
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

def text(name, body, size, font='Regular', loc=(0, 0, 0), rot=(0, 0, 0), mat=None, extrude=0.0, align='LEFT', spacing=1.0, line=1.0):
    cu = bpy.data.curves.new(name, 'FONT'); cu.body = body; cu.size = size; cu.extrude = extrude
    cu.font = bpy.data.fonts.load(os.path.join(FONTS, f'Outfit-{font}.ttf')); cu.align_x = align; cu.space_character = spacing; cu.space_line = line
    o = link(bpy.data.objects.new(name, cu)); o.location = loc; o.rotation_euler = rot
    if mat: cu.materials.append(mat)
    return o

# ---------- Logo en géométrie (mêmes cotes que brand/aube.js : disque 100, graisse 24, dôme 26, espace 14) ----------
def _arc(cx, cy, r, a0, a1, n=48):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]

def _dome(ox):
    # dôme de rayon 26 posé sur l'horizon (y = 50 dans le repère SVG, y vers le bas) -> ici y vers le haut : horizon à 50, sommet à 76
    return [(ox + 24, 50)] + _arc(ox + 50, 50, 26, 180, 0)[1:-1] + [(ox + 76, 50)]

def letter_loops(ch, ox=0.0):
    """Contours (listes de points, y vers le haut, ligne de base à 0, hauteur d'x à 100)."""
    if ch == 'a':
        outer = [(ox + 50, 100), (ox + 100, 100), (ox + 100, 0), (ox + 50, 0)] + _arc(ox + 50, 50, 50, 270, 90)[1:-1]
        return [outer, _dome(ox)]
    if ch == 'u':
        outer = [(ox, 100), (ox + 24, 100), (ox + 24, 76)] + _arc(ox + 50, 76, 26, 180, 360)[1:-1] + [(ox + 76, 76), (ox + 76, 100), (ox + 100, 100), (ox + 100, 0), (ox + 50, 0)] + _arc(ox + 50, 50, 50, 270, 180)[1:]
        return [outer]
    if ch == 'b':
        outer = [(ox, 142), (ox + 24, 142), (ox + 24, 100), (ox + 50, 100)] + _arc(ox + 50, 50, 50, 90, -90)[1:] + [(ox, 0)]
        return [outer, _dome(ox)]
    if ch == 'e':
        a1 = math.degrees(math.asin((34 - 50) / 50))   # y = 34 (soit 66 en SVG)
        a2 = math.degrees(math.asin((22 - 50) / 50))   # y = 22 (soit 78 en SVG)
        outer = _arc(ox + 50, 50, 50, 90, a1) + [(ox + 50, 34), (ox + 50, 22)] + _arc(ox + 50, 50, 50, a2, -270)[:-1]
        return [outer, _dome(ox)]

def logo(name, height=1.0, extrude=0.05, bevel=0.0, mat=None, word='aube', loc=(0, 0, 0), rot=(math.radians(90), 0, 0), center=True):
    """Logotype (ou une lettre) en courbe 2D remplie, extrudée. `height` = hauteur d'x en mètres. Debout face à -Y par défaut."""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'
    s = height / 100.0
    total = len(word) * 100 + (len(word) - 1) * 14
    x0 = -total / 2 if center else 0
    for i, ch in enumerate(word):
        for loop in letter_loops(ch, x0 + i * 114):
            sp = cu.splines.new('POLY'); sp.points.add(len(loop) - 1)
            for p, (x, y) in zip(sp.points, loop): p.co = (x * s, y * s, 0, 1)
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
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = 6; cu.resolution_u = 24
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
