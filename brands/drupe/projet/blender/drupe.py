# Aides propres aux scènes de Drupe (marque de jour) : soleil, papier, vitre, décalque, volumes de révolution,
# sachet à soufflet, pastille en disque, gobelet sans déformation, tasse, cerise de café, feuillage pour les ombres.
# S'appuie sur lib.py (bibliothèque commune du skill), sans la modifier.
import bpy, bmesh, math, os, random
from mathutils import Vector, Matrix
import lib
from lib import *

C = dict(fleur='#FFFDF8', parche='#F4ECDD', pulpe='#F6C3C0', cerise='#CF2145', vert='#C7D5A9', feuille='#1E4A36', grain='#2A1A14', marc='#150F0C')

def art(nom):
    return os.path.join(ART, nom + '.png')

def opt(cle, defaut):
    """Option de ligne de commande : --cle=valeur après le « -- »."""
    for a in argv():
        if a.startswith('--' + cle + '='): return type(defaut)(a.split('=', 1)[1])
    return defaut

def vue(transform='Khronos PBR Neutral'):
    """Transformation de vue qui garde la couleur de marque et arrondit les hautes lumières (scènes au soleil)."""
    sc = bpy.context.scene
    try: sc.view_settings.view_transform = transform
    except Exception as e: print('vue indisponible', transform, e)

def soleil(az, el, force=3.0, angle=1.2, couleur='#FFEBD6'):
    """Soleil. az : azimut d'où vient la lumière (degrés ; 0 = depuis +X, 90 = depuis +Y, 180 = depuis -X, 270 = depuis -Y).
    el : hauteur au-dessus de l'horizon. angle : diamètre apparent (netteté des ombres)."""
    ld = bpy.data.lights.new('soleil', 'SUN'); ld.energy = force; ld.angle = math.radians(angle); ld.color = hex_rgb(couleur)[:3]
    o = link(bpy.data.objects.new('soleil', ld))
    a, e = math.radians(az), math.radians(el)
    d = Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e)))
    o.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler(); o.location = d * 10
    return o

def vers_soleil(az, el):
    a, e = math.radians(az), math.radians(el)
    return Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e)))

def mat_papier(name, color, rough=0.82, bump=0.18, echelle=900, froisse=0.0):
    """Papier ou carton mat : grain fin, et un léger froissé à grande échelle si froisse > 0."""
    m, nt, out = lib._mat(name)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Base Color'].default_value = color if isinstance(color, tuple) else hex_rgb(color)
    b.inputs['Roughness'].default_value = rough
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = echelle; nz.inputs['Detail'].default_value = 4
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.0002
    nt.links.new(nz.outputs[0], bp.inputs['Height'])
    if froisse:
        nz2 = nt.nodes.new('ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = 26; nz2.inputs['Detail'].default_value = 3; nz2.inputs['Roughness'].default_value = 0.6
        nt.links.new(tc.outputs['Object'], nz2.inputs['Vector'])
        bp2 = nt.nodes.new('ShaderNodeBump'); bp2.inputs['Strength'].default_value = froisse; bp2.inputs['Distance'].default_value = 0.004
        nt.links.new(nz2.outputs[0], bp2.inputs['Height']); nt.links.new(bp.outputs[0], bp2.inputs['Normal']); nt.links.new(bp2.outputs[0], b.inputs['Normal'])
    else:
        nt.links.new(bp.outputs[0], b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs[0]); return m

def mat_ecran(name, image_path, force=1.0, gloss=0.05, rough=0.03):
    """Écran à coins arrondis : lib.mat_screen, découpé par la transparence de l'image. Sans cela, les coins carrés de
    l'image dépassent des arrondis du téléphone (invisible sur un décor sombre, flagrant sur un décor clair)."""
    m = mat_screen(name, image_path, force, gloss=gloss, rough=rough)
    nt = m.node_tree; out = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'); tex = next(n for n in nt.nodes if n.type == 'TEX_IMAGE')
    lk = out.inputs[0].links[0]; src = lk.from_socket; nt.links.remove(lk)
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(tex.outputs['Alpha'], mix.inputs[0]); nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(src, mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0]); return m

def mat_decal(name, image_path, rough=0.5):
    """Image à fond transparent : vitrophanie, lettrage sur verre, cache d'ombre. Le transparent laisse passer la lumière."""
    m, nt, out = lib._mat(name)
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(image_path); tex.extension = 'CLIP'
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Roughness'].default_value = rough
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(tex.outputs['Color'], b.inputs['Base Color'])
    nt.links.new(tex.outputs['Alpha'], mix.inputs[0]); nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(b.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0]); return m

def mat_vitre(name='vitre', teinte=(0.93, 0.96, 0.94, 1), ior=1.5, rough=0.0):
    """Vitre mince : transparente de face, réfléchissante en biais. Laisse passer la lumière sans caustiques."""
    m, nt, out = lib._mat(name)
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); tr.inputs[0].default_value = teinte
    gl = nt.nodes.new('ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = rough
    fr = nt.nodes.new('ShaderNodeFresnel'); fr.inputs[0].default_value = ior
    mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(fr.outputs[0], mix.inputs[0]); nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(gl.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0]); return m

def mat_bois(name, dossier='oak_veneer_01', scale=2.0, clair=1.55, sat=0.72, rough_mul=1.0):
    """Bois clair : matière Poly Haven éclaircie et désaturée (lib.mat_pbr_tex ne sait que teinter, donc assombrir)."""
    m = mat_pbr_tex(name, dossier, dossier, scale=scale, rough_mul=rough_mul)
    nt = m.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    lk = b.inputs['Base Color'].links[0]; src = lk.from_socket; nt.links.remove(lk)
    hs = nt.nodes.new('ShaderNodeHueSaturation'); hs.inputs['Saturation'].default_value = sat; hs.inputs['Value'].default_value = clair
    nt.links.new(src, hs.inputs['Color']); nt.links.new(hs.outputs['Color'], b.inputs['Base Color'])
    return m

def mat_gres(name, color, rough=0.32, mouchete=0.5):
    """Grès émaillé : couleur légèrement nuancée, petites mouchetures sombres, émail satiné."""
    m, nt, out = lib._mat(name)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Roughness'].default_value = rough
    b.inputs['Coat Weight'].default_value = 0.4; b.inputs['Coat Roughness'].default_value = 0.12
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 520; nz.inputs['Detail'].default_value = 2
    cr = nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].position = 0.28; cr.color_ramp.elements[1].position = 0.36
    base = hex_rgb(color); sombre = tuple(c * (1 - 0.55 * mouchete) for c in base[:3]) + (1,)
    cr.color_ramp.elements[0].color = sombre; cr.color_ramp.elements[1].color = base
    nz2 = nt.nodes.new('ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = 14; nz2.inputs['Detail'].default_value = 2
    mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 0.22
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector']); nt.links.new(tc.outputs['Object'], nz2.inputs['Vector'])
    nt.links.new(nz.outputs[0], cr.inputs[0]); nt.links.new(cr.outputs[0], mx.inputs['A']); nt.links.new(nz2.outputs[0], mx.inputs['B'])
    nt.links.new(mx.outputs['Result'], b.inputs['Base Color'])
    nt.links.new(b.outputs[0], out.inputs[0]); return m

def tour(name, profil, mat=None, seg=96, loc=(0, 0, 0), rot=(0, 0, 0), vif=40):
    """Volume de révolution autour de Z. profil : liste de (rayon, z) de bas en haut ; un rayon nul ferme le volume.
    vif : angle (degrés) au-delà duquel une arête reste vive."""
    bm = bmesh.new(); rings = []
    for r, z in profil:
        if r < 1e-9: rings.append([bm.verts.new((0, 0, z))])
        else: rings.append([bm.verts.new((r * math.cos(2 * math.pi * i / seg), r * math.sin(2 * math.pi * i / seg), z)) for i in range(seg)])
    for a, b in zip(rings, rings[1:]):
        for i in range(seg):
            j = (i + 1) % seg
            if len(a) == 1 and len(b) == 1: continue
            if len(a) == 1: bm.faces.new((a[0], b[j], b[i]))
            elif len(b) == 1: bm.faces.new((a[i], a[j], b[0]))
            else: bm.faces.new((a[i], a[j], b[j], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces: f.smooth = True
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = rot
    if mat: me.materials.append(mat)
    md = o.modifiers.new('aretes', 'EDGE_SPLIT'); md.split_angle = math.radians(vif)
    return o

def arc(r, a0, a1, n=16, cx=0.0, cz=0.0):
    """Points (rayon, z) d'un arc de profil, pour tour()."""
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cz + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]

def disque_image(name, d, image, ep=0.0004, tranche=None):
    """Disque mince dont la face du dessus (+Z local) porte une image carrée, haut de l'image vers +Y local."""
    o = cyl_uv(name, d / 2, ep, mat_side=tranche or mat_papier(name + '-tr', C['fleur']), mat_caps=mat_image(name + '-img', image, rough=0.55), seg=96)
    return o

def poser(obj, x_axis, y_axis, loc, parent=None, tourner=0.0):
    """Oriente un objet par deux axes (comme lib.orient), avec une rotation en plus autour de sa normale, et un parent éventuel."""
    x = Vector(x_axis).normalized(); y = Vector(y_axis).normalized(); z = x.cross(y)
    m = Matrix((x, y, z)).transposed().to_4x4() @ Matrix.Rotation(math.radians(tourner), 4, 'Z'); m.translation = Vector(loc)
    if parent is not None:
        obj.parent = parent; obj.matrix_parent_inverse = Matrix.Identity(4); obj.matrix_local = m
    else: obj.matrix_world = m
    return obj

def sachet(name, face, pastille=None, w=0.105, d=0.06, h=0.19, rabat=0.03, pastille_d=0.052, angle=7, papier=None, seed=0):
    """Sachet de café à soufflet, debout sur z = 0, face avant vers -Y. face : image de la face avant (proportion w × h).
    Le haut est pincé puis rabattu vers l'avant ; pastille : image carrée de la pastille qui scelle le rabat.
    Renvoie l'objet du sachet (le disque en est l'enfant) : le déplacer ou le coucher par location / rotation_euler."""
    rnd = random.Random(seed)
    papier = papier or mat_papier(name + '-papier', C['parche'], froisse=0.35)
    nx, nz = 10, 18; z0 = 0.42 * h
    def dy(z):
        t = min(1.0, max(0.0, (z - z0) / (h - z0))); s = t * t * (3 - 2 * t)
        return (d / 2) * (1 - s) + 0.0016 * s
    def bombe(i, z):
        return 0.0045 * math.sin(math.pi * i / nx) * math.sin(math.pi * min(1.0, z / (0.86 * h))) ** 0.7
    bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap'); rings = []
    levels = [0.0, 0.004] + [0.004 + (h - 0.004) * k / (nz - 1) for k in range(1, nz)]
    for k, z in enumerate(levels):
        e = dy(z); g = (d / 2 - e) * 0.9; rentre = 0.965 if k == 0 else 1.0
        ring = [bm.verts.new((rentre * (-w / 2 + w * i / nx), -(e * rentre) - bombe(i, z), z)) for i in range(nx + 1)]
        ring.append(bm.verts.new((rentre * (w / 2 - g), 0, z)))
        ring += [bm.verts.new((rentre * (w / 2 - w * i / nx), (e * rentre) + bombe(i, z), z)) for i in range(nx + 1)]
        ring.append(bm.verts.new((rentre * (-w / 2 + g), 0, z)))
        rings.append(ring)
    n = len(rings[0])
    for a, b in zip(rings, rings[1:]):
        for j in range(n):
            f = bm.faces.new((a[j], a[(j + 1) % n], b[(j + 1) % n], b[j])); f.smooth = True
            if j < nx:
                f.material_index = 1
                for l in f.loops: l[uv].uv = ((l.vert.co.x + w / 2) / w, l.vert.co.z / h)
    bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])
    # Rabat : une bande de papier repliée sur le devant
    yb = -dy(h - rabat) - 0.0022; yt = -0.0026; ep = 0.0012
    v = [bm.verts.new(p) for p in ((-w / 2 - .0005, yb, h - rabat), (w / 2 + .0005, yb, h - rabat), (w / 2 + .0005, yt, h + .001), (-w / 2 - .0005, yt, h + .001),
                                   (-w / 2 - .0005, yb - ep, h - rabat), (w / 2 + .0005, yb - ep, h - rabat), (w / 2 + .0005, yt - ep, h + .001), (-w / 2 - .0005, yt - ep, h + .001))]
    for q in ((4, 5, 6, 7), (1, 0, 3, 2), (0, 1, 5, 4), (3, 7, 6, 2), (0, 4, 7, 3), (1, 2, 6, 5)): bm.faces.new([v[i] for i in q])
    # Dos du rabat jusqu'à l'arrière (le pli du haut)
    bmesh.ops.recalc_face_normals(bm, faces=[f for f in bm.faces if f.material_index == 0])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.materials.append(papier); me.materials.append(mat_image(name + '-face', face, rough=0.8, bump=0.12))
    o = link(bpy.data.objects.new(name, me))
    md = o.modifiers.new('aretes', 'EDGE_SPLIT'); md.split_angle = math.radians(50)
    if pastille:
        # La pastille enjambe le bas du rabat : on la pose sur la corde qui va du rabat au devant du sachet,
        # décollée de ce qui dépasse (sinon sa moitié basse s'enfonce dans le papier bombé).
        zc = h - rabat; rr = pastille_d / 2
        def devant(z):
            if z >= zc: return yb + (yt - yb) * (z - zc) / (rabat + .001) - ep
            return -dy(z) - bombe(nx // 2, z)
        pt = Vector((0, devant(zc + rr * 0.92), zc + rr * 0.92)); pb = Vector((0, devant(zc - rr * 0.92), zc - rr * 0.92))
        haut = (pt - pb).normalized(); nrm = Vector((0, -haut.z, haut.y))
        dep = max(0.0, max((Vector((0, devant(z), z)) - pb).dot(nrm) for z in [zc - rr + 2 * rr * k / 24 for k in range(25)] + [zc - 1e-5, zc + 1e-5]))
        dq = disque_image(name + '-pastille', pastille_d, pastille)
        poser(dq, (1, 0, 0), haut, (pt + pb) / 2 + nrm * (dep + 0.0005) + Vector((rnd.uniform(-.004, .004), 0, 0)), parent=o, tourner=angle)
    return o

def gobelet(name, bandeau, rb=0.029, rt=0.0445, h=0.11, seg=128, couvercle=True, loc=(0, 0, 0), rz=0.0):
    """Gobelet à emporter, base en z = 0. bandeau : image de proportion (2 pi rt) × génératrice ; son milieu fait face à -Y.
    Contrairement à lib.cyl_uv, le bandeau n'est pas comprimé vers le bas : chaque hauteur prend la largeur d'image qui
    correspond à sa circonférence (le bas n'en utilise que le centre), donc une pastille reste ronde."""
    bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap'); B, T = [], []
    for i in range(seg + 1):
        a = 2 * math.pi * i / seg + math.pi / 2
        B.append(bm.verts.new((rb * math.cos(a), rb * math.sin(a), 0))); T.append(bm.verts.new((rt * math.cos(a), rt * math.sin(a), h)))
    k = rb / rt
    for i in range(seg):
        f = bm.faces.new((B[i], B[i + 1], T[i + 1], T[i])); f.smooth = True
        u0, u1 = i / seg, (i + 1) / seg
        for l, (u_, v_) in zip(f.loops, ((0.5 + (u0 - 0.5) * k, 0), (0.5 + (u1 - 0.5) * k, 0), (u1, 1), (u0, 1))): l[uv].uv = (u_, v_)
    bm.normal_update()
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.materials.append(mat_image(name + '-flanc', bandeau, rough=0.62, bump=0.06))
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = (0, 0, rz)
    carton = mat_papier(name + '-carton', C['fleur'], rough=0.6, bump=0.05)
    fond = tour(name + '-fond', [(0, 0.004), (rb - 0.0006, 0.004), (rb - 0.0006, 0)], mat=carton); fond.parent = o
    if couvercle:
        lid = mat_pbr(name + '-couv', C['fleur'], rough=0.42)
        p = [(rt + 0.0008, h - 0.007), (rt + 0.0022, h - 0.005), (rt + 0.0022, h + 0.0015), (rt + 0.0008, h + 0.003), (rt - 0.004, h + 0.0035),
             (rt - 0.007, h + 0.012), (rt - 0.0085, h + 0.0135), (rt - 0.0105, h + 0.0135), (rt - 0.012, h + 0.0105), (0.006, h + 0.0105), (0, h + 0.0105)]
        c = tour(name + '-couvercle', p, mat=lid, vif=60); c.parent = o
        bec = rrect(name + '-bec', 0.011, 0.0045, 0.002, 0.0012, mat=mat_pbr(name + '-bec', C['grain'], rough=0.5), loc=(0, -(rt - 0.019), h + 0.0108)); bec.parent = o
    return o

def tasse(name, mat, r=0.041, h=0.068, cafe=True, loc=(0, 0, 0), rz=0.0, soucoupe=None):
    """Tasse en grès, cylindrique à bord arrondi, avec son anse (vers +X) et le café dedans."""
    ep = 0.0035
    p = [(0, 0), (r - 0.008, 0)] + arc(0.008, -90, 0, 8, r - 0.008, 0.008) + [(r, h - ep / 2)] + arc(ep / 2, 0, 180, 8, r - ep / 2, h - ep / 2) + [(r - ep, 0.012), (r - ep - 0.006, 0.006), (0, 0.006)]
    o = tour(name, p, mat=mat, loc=loc, vif=70); o.rotation_euler = (0, 0, rz)
    anse = tube(name + '-anse', [(r - 0.002, 0, h * 0.80), (r + 0.016, 0, h * 0.84), (r + 0.026, 0, h * 0.60), (r + 0.020, 0, h * 0.34), (r - 0.002, 0, h * 0.24)], 0.0048, mat=mat); anse.parent = o
    if cafe:
        k = tour(name + '-cafe', [(0, h - 0.009), (r - ep - 0.0002, h - 0.009)], mat=mat_pbr(name + '-cafe', '#2a120a', rough=0.06, coat=0.5)); k.parent = o
    if soucoupe:
        s = tour(name + '-soucoupe', [(0, 0), (0.035, 0), (0.068, 0.008), (0.070, 0.0105), (0.066, 0.0115), (0.034, 0.0045), (0, 0.0045)], mat=soucoupe, vif=70); s.parent = o
        s.location = (0, 0, -0.0045)
    return o

def cerise(name, loc, r=0.0075, rz=0.0, mat=None, queue=True, couche=0.0):
    """Cerise de café : petit fruit ovale laqué, posé sur z = loc.z, avec un bout de queue."""
    mat = mat or mat_pbr(name, C['cerise'], rough=0.22, coat=0.6)
    p = [(r * math.cos(math.radians(a)) * (1 - 0.06 * math.sin(math.radians(a))), r * 1.12 * (1 + math.sin(math.radians(a)))) for a in range(-90, 91, 10)]
    p[0] = (0, 0.0003); p[-1] = (0, p[-1][1] - 0.0006)
    o = tour(name, p, mat=mat, seg=48, loc=loc, vif=80)
    o.rotation_euler = (couche, 0, rz)
    if queue:
        q = tube(name + '-q', [(0, 0, r * 2.18), (0.0008, 0, r * 2.6), (0.0026, 0, r * 3.0)], 0.0007, mat=mat_pbr(name + '-q', '#5b4a2a', rough=0.7)); q.parent = o
    return o

def feuille(name, L=0.13, W=0.05, mat=None, pli=0.18, onde=1.0):
    """Feuille de caféier : ovale allongé à pointe, légèrement pliée sur sa nervure. Dans XY, pétiole à l'origine, pointe vers +X."""
    bm = bmesh.new(); n = 18; haut, bas, axe = [], [], []
    for i in range(n + 1):
        t = i / n; x = L * t
        l = W / 2 * (math.sin(math.pi * t ** 0.85) ** 0.75) * (1 - 0.25 * t) if 0 < t < 1 else 0.0
        ond = 0.006 * onde * L / 0.13 * math.sin(t * 9)
        axe.append(bm.verts.new((x, 0, -0.012 * L / 0.13 * math.sin(math.pi * t))))
        if l > 0:
            haut.append(bm.verts.new((x, l, pli * l + ond))); bas.append(bm.verts.new((x, -l, pli * l - ond)))
        else: haut.append(None); bas.append(None)
    for i in range(n):
        for cote in (haut, bas):
            q = [axe[i], axe[i + 1], cote[i + 1], cote[i]]; q = [v for v in q if v is not None]
            if len(q) >= 3: bm.faces.new(q)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces: f.smooth = True
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me))
    me.materials.append(mat or mat_pbr(name, C['feuille'], rough=0.35, coat=0.3))
    return o

def rameau(name, base, direction, n=4, L=0.13, pas=0.07, seed=1, mat=None, tige=0.004):
    """Rameau de caféier : une tige droite et n paires de feuilles opposées. Sert surtout de cache : ses ombres tombent
    sur la table ou le mur. base : point de départ ; direction : vecteur de la tige."""
    rnd = random.Random(seed); mat = mat or mat_pbr(name + '-m', C['feuille'], rough=0.35, coat=0.3)
    dv = Vector(direction).normalized(); b = Vector(base)
    up = Vector((0, 0, 1)); side = dv.cross(up)
    if side.length < 1e-3: side = Vector((1, 0, 0))
    side.normalize(); nrm = side.cross(dv).normalized()
    tube(name + '-tige', [tuple(b + dv * (pas * i)) for i in range(n + 2)], tige, mat=mat)
    for i in range(n):
        p = b + dv * (pas * (i + 0.7))
        for s in (-1, 1):
            f = feuille(f'{name}-f{i}{s}', L=L * rnd.uniform(0.8, 1.1), W=L * 0.46 * rnd.uniform(0.85, 1.1), mat=mat)
            ax = (side * s * math.cos(math.radians(35)) + dv * math.sin(math.radians(35))).normalized()
            ax = (ax + nrm * rnd.uniform(-0.35, 0.1)).normalized()
            ay = (dv - ax * dv.dot(ax)).normalized() * (-s)
            ay = (ay + nrm * rnd.uniform(-0.3, 0.3)); ay = (ay - ax * ay.dot(ax)).normalized()
            poser(f, ax, ay, p)
    f = feuille(name + '-bout', L=L, W=L * 0.4, mat=mat); ay = (side - dv * side.dot(dv)).normalized(); poser(f, dv, ay, b + dv * (pas * (n + 1)))

def carte(name, w, h, image, loc, rz=0.0, ep=0.0006, papier=None, tilt=(0, 0)):
    """Carte posée à plat : un corps de papier et sa face imprimée. loc = centre, z = dessous de la carte."""
    papier = papier or mat_papier(name + '-p', C['fleur'])
    b = box(name + '-corps', w, h, ep, (loc[0], loc[1], loc[2] + ep / 2), (tilt[0], tilt[1], rz), mat=papier)
    p = plane(name, w, h, (loc[0], loc[1], loc[2] + ep + 0.00004), (tilt[0], tilt[1], rz), mat=mat_image(name + '-img', image, rough=0.62, bump=0.1))
    return p
