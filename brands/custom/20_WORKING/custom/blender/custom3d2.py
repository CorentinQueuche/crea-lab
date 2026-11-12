# Aides communes aux quatre scènes du lot 3D-2 de Custom (26 portable, 32 téléphone, 40 goodies, 41 signalétique).
# S'appuie sur lib.py et objets.py sans les modifier. Reprend de l'essai Payout (decor.py) ce qui sert ici : lumière de
# marque à deux forces, écrans, portable, téléphone, caméra droite ; et ajoute : la sangle plate, le volume de révolution
# avec UV, l'étiquette courbe, le logo complet, le fluo peint, le sol mouillé, le ciel de crépuscule.
# Usage dans une scène :  from custom3d2 import *
import bpy, bmesh, math, os, random
from mathutils import Vector, Matrix
import lib
from lib import *
from objets import *

K = dict(noir='#101012', fluo='#E2FF21', blanc='#FFFFFF', graphite='#272728', fonte='#404042', acier='#56565A', violet='#8E3EFF',
         orange='#FE3600', encre='#03010E', craie='#DBDBDE', kraft='#B28C62')
R = math.radians
PENTE = 13.3          # l'inclinaison du Cran


def box(name, sx, sy, sz, loc=(0, 0, 0), rot=(0, 0, 0), mat=None, bevel=0.0, seg=3, uv_m=1.0):
    """lib.box, avec des normales pondérées quand il y a un chanfrein (les grandes faces restent planes)."""
    o = lib.box(name, sx, sy, sz, loc, rot, mat, bevel, seg, uv_m)
    if bevel:
        md = o.modifiers.new('normales', 'WEIGHTED_NORMAL'); md.keep_sharp = True; md.weight = 100
    return o


def _force_selon_rayon(nt, emission, cam, diffus):
    """Force d'émission : cam pour la caméra et les reflets (la teinte reste juste), diffus pour la lumière jetée."""
    if not diffus or diffus == cam:
        emission.inputs[1].default_value = cam; return
    lp = nt.nodes.new('ShaderNodeLightPath'); mr = nt.nodes.new('ShaderNodeMapRange')
    mr.inputs[3].default_value = cam; mr.inputs[4].default_value = diffus
    nt.links.new(lp.outputs['Is Diffuse Ray'], mr.inputs[0]); nt.links.new(mr.outputs[0], emission.inputs[1])


def mat_lum(name, color=None, cam=1.0, diffus=None):
    """Lumière de marque : cam = force vue par la caméra (1 = la couleur exacte), diffus = force de la lumière jetée."""
    m, nt, out = lib._mat(name)
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs[0].default_value = hex_rgb(color or K['fluo']) if not isinstance(color, tuple) else color
    _force_selon_rayon(nt, e, cam, diffus)
    nt.links.new(e.outputs[0], out.inputs[0]); return m


def mat_ecran_lum(name, image_path, cam=1.0, diffus=None, gloss=0.05, rough=0.04, alpha=False):
    """Écran : l'image en émission à force cam (1 = couleurs exactes du visuel), diffus pour la lumière qu'il jette."""
    m = (mat_ecran if alpha else mat_screen)(name, image_path, cam, gloss=gloss, rough=rough)
    e = next(n for n in m.node_tree.nodes if n.type == 'EMISSION')
    _force_selon_rayon(m.node_tree, e, cam, diffus)
    return m


def mat_fluo(name='fluo', color=None, lueur=0.0, rough=0.5, coat=0.0, metal=0.0, spec=0.5):
    """Le fluo peint (ou toute couleur de marque) : couleur de base + une part de la même couleur en émission.
    Un pigment fluo paraît plus lumineux que ce qui l'entoure : la lueur le dit, et garde la teinte quand la lumière baisse.
    Régler lumière + lueur pour que les zones éclairées restent près de 1 (au-delà, le vert sature et la teinte jaunit).
    spec : reflet blanc de la surface (0,5 = normal). Le baisser (0,15) quand un ciel coloré ou une lampe blanche délave la teinte."""
    m, nt, out = lib._mat(name)
    c = hex_rgb(color or K['fluo']) if not isinstance(color, tuple) else color
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Base Color'].default_value = c
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    b.inputs['Specular IOR Level'].default_value = spec
    if coat: b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.12
    if lueur: b.inputs['Emission Color'].default_value = c; b.inputs['Emission Strength'].default_value = lueur
    nt.links.new(b.outputs[0], out.inputs[0]); return m


def mat_imprime(name, image_path, rough=0.5, coat=0.0, bump=0.0, lueur=0.0, alpha=False, spec=0.5):
    """Surface imprimée. lueur : une part de l'image en émission (un aplat fluo reste fluo sous une lumière faible).
    alpha : la transparence de l'image découpe la surface (étiquette, marquage, décalque). spec : reflet blanc (voir mat_fluo)."""
    m = mat_image(name, image_path, rough=rough, coat=coat, bump=bump)
    nt = m.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'); tex = next(n for n in nt.nodes if n.type == 'TEX_IMAGE')
    b.inputs['Specular IOR Level'].default_value = spec
    if lueur:
        nt.links.new(tex.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = lueur
    if alpha:
        tex.extension = 'CLIP'
        out = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL')
        tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mix = nt.nodes.new('ShaderNodeMixShader')
        nt.links.new(tex.outputs['Alpha'], mix.inputs[0]); nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(b.outputs[0], mix.inputs[2])
        nt.links.new(mix.outputs[0], out.inputs[0])
    return m


def groupe(name, objets, loc=(0, 0, 0), rot=(0, 0, 0)):
    """Réunit des objets sous un repère vide, puis pose l'ensemble. Les objets sont construits autour de l'origine."""
    e = link(bpy.data.objects.new(name, None))
    for o in objets:
        if o is not None and o.parent is None: o.parent = e
    e.location = loc; e.rotation_euler = rot
    return e


def droit(cam, shift_x=0.0, shift_y=0.0):
    """Caméra droite : on décale le cadre au lieu d'incliner l'appareil (les verticales restent verticales)."""
    cam.data.shift_x = shift_x; cam.data.shift_y = shift_y; return cam


def logo_complet(name, hauteur, extrude=0.004, mat=None, mat_sym=None, loc=(0, 0, 0), rot=(0, 0, 0), part='complet'):
    """Le logo de référence en volume : le Cran puis « Custom.fr », dans le plan XY du repère renvoyé (lisible vu de +Z,
    le haut vers +Y). hauteur = hauteur du Cran. Centré sur la boîte du logo (714 × 110). rot=(90°, 0, 0) le met debout
    face à -Y. part='empile' : le Cran au-dessus du logotype, centré (boîte 487 × 218, hauteur = hauteur totale)."""
    if part == 'empile':
        s = hauteur / 218.0
        sym = lib.logo(name + '-sym', height=110 * s, extrude=extrude, mat=mat_sym or mat, part='symbole', loc=(0, (218 / 2 - 110) * s, 0), rot=(0, 0, 0))
        mot = lib.logo(name + '-mot', height=55.2 * s, extrude=extrude, mat=mat, part='logotype', loc=(0, (218 / 2 - 122 - 92.2) * s, 0), rot=(0, 0, 0))
    else:
        s = hauteur / 110.0
        sym = lib.logo(name + '-sym', height=hauteur, extrude=extrude, mat=mat_sym or mat, part='symbole', loc=((95.525 - 357) * s, -55 * s, 0), rot=(0, 0, 0))
        mot = lib.logo(name + '-mot', height=55.2 * s, extrude=extrude, mat=mat, part='logotype', loc=((227.05 + 243.5 - 357) * s, (17.8 - 55) * s, 0), rot=(0, 0, 0))
    return groupe(name, [sym, mot], loc=loc, rot=rot)


# ---------- La sangle : un ruban plat qui suit un chemin ----------
def _catmull(pts, pas):
    """Courbe lisse passant par les points (Catmull-Rom centripète simplifiée), échantillonnée tous les « pas » mètres."""
    P = [Vector(p) for p in pts]
    if len(P) < 3: return _lineaire(P, pas)
    out = []
    Q = [P[0] + (P[0] - P[1])] + P + [P[-1] + (P[-1] - P[-2])]
    for i in range(1, len(Q) - 2):
        p0, p1, p2, p3 = Q[i - 1], Q[i], Q[i + 1], Q[i + 2]
        n = max(2, int((p2 - p1).length / pas))
        for k in range(n):
            t = k / n; t2 = t * t; t3 = t2 * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(P[-1].copy())
    return out


def _lineaire(P, pas):
    P = [Vector(p) for p in P]; out = []
    for a, b in zip(P, P[1:]):
        n = max(1, int((b - a).length / pas))
        for k in range(n): out.append(a.lerp(b, k / n))
    out.append(P[-1].copy()); return out


def arrondir(pts, r, n=8):
    """Arrondit les angles d'une ligne brisée (points 3D) par des arcs de rayon r. Renvoie une ligne dense."""
    P = [Vector(p) for p in pts]; out = [P[0]]
    for i in range(1, len(P) - 1):
        a, b, c = P[i - 1], P[i], P[i + 1]
        u = (a - b); v = (c - b); lu, lv = u.length, v.length
        if lu < 1e-9 or lv < 1e-9: out.append(b); continue
        u.normalize(); v.normalize()
        ang = u.angle(v)
        if ang > math.pi - 1e-3: out.append(b); continue
        d = min(r / math.tan(ang / 2), lu * 0.49, lv * 0.49)
        p0 = b + u * d; p1 = b + v * d
        for k in range(n + 1):
            t = k / n
            out.append((1 - t) ** 2 * p0 + 2 * (1 - t) * t * b + t * t * p1)      # arc approché par une conique
    out.append(P[-1]); return out


def ruban(name, pts, largeur, ep=0.0013, mat=None, normale=(0, 0, 1), normales=None, vrille=0.0, pas=0.004, lisse=True, uv_m=None, v0=0.0,
          travers=None, vrille_de=0.0, vrille_a=1.0, vers=None, vers_part=1.0):
    """Sangle plate : bande de largeur × ep qui suit les points. lisse : courbe lisse par les points ; sinon ligne brisée
    (à arrondir avant avec arrondir()). normale : direction du plat de la sangle (perpendiculaire à sa face), reprojetée
    le long du chemin ; normales : une par point de pts, interpolées ; travers : à la place, la direction de la largeur
    (une sangle qui passe sous un objet garde sa largeur parallèle à l'arête qu'elle contourne). vrille : tours ajoutés le
    long du ruban (0,25 = un quart de tour), entre les parts vrille_de et vrille_a de sa longueur, en douceur.
    vers : à la place de vrille, un point vers lequel la sangle tourne sa face (la caméra) ; vers_part : part de ce
    mouvement (1 = face pleine, 0,6 = de trois quarts). Sans cela, d'un côté du cadre la sangle se montre sur la tranche.
    UV : u en travers (0 à 1), v le long (une unité par uv_m mètres, par défaut la largeur).
    Après l'appel, ruban.reperes donne pour chaque échantillon (position, tangente, normale, travers, abscisse en mètres)."""
    S = _catmull(pts, pas) if lisse else _lineaire(pts, pas)
    n = len(S); uv_m = uv_m or largeur
    # normale de référence à chaque échantillon
    if normales:
        ctrl = [Vector(p) for p in pts]; cum = [0.0]
        for a, b in zip(ctrl, ctrl[1:]): cum.append(cum[-1] + (b - a).length)
        def ref(s):
            x = s * cum[-1]
            for i in range(len(cum) - 1):
                if x <= cum[i + 1] or i == len(cum) - 2:
                    t = 0 if cum[i + 1] == cum[i] else min(1.0, max(0.0, (x - cum[i]) / (cum[i + 1] - cum[i])))
                    return Vector(normales[i]).lerp(Vector(normales[i + 1]), t)
    else:
        ref = lambda s: Vector(normale)
    L = [0.0]
    for a, b in zip(S, S[1:]): L.append(L[-1] + (b - a).length)
    tot = L[-1] or 1.0
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); rings = []
    prev_n = None; ruban.reperes = []
    for i, p in enumerate(S):
        t = (S[min(n - 1, i + 1)] - S[max(0, i - 1)]).normalized()
        nr = t.cross(Vector(travers)) if travers is not None else ref(L[i] / tot)
        nr = nr - t * nr.dot(t)
        if nr.length < 1e-6: nr = prev_n if prev_n is not None else t.orthogonal()
        nr.normalize()
        if vrille or vers is not None:
            k = min(1.0, max(0.0, (L[i] / tot - vrille_de) / max(1e-6, vrille_a - vrille_de))); k = k * k * (3 - 2 * k)
            ang = 2 * math.pi * vrille
            if vers is not None:                                   # la sangle se tourne vers un point (la caméra) : au plus un quart de tour
                v = Vector(vers) - p; n1 = v - t * v.dot(t)
                if n1.length > 1e-6:
                    n1.normalize()
                    if n1.dot(nr) < 0: n1 = -n1
                    ang = math.atan2(nr.cross(n1).dot(t), nr.dot(n1)) * vers_part
            nr = Matrix.Rotation(ang * k, 3, t) @ nr
        prev_n = nr
        side = t.cross(nr).normalized()
        ruban.reperes.append((p.copy(), t.copy(), nr.copy(), side.copy(), L[i]))
        a, b = side * (largeur / 2), nr * (ep / 2)
        rings.append([bm.verts.new(p - a + b), bm.verts.new(p + a + b), bm.verts.new(p + a - b), bm.verts.new(p - a - b)])
    us = (0.0, 1.0, 1.0, 0.0)
    for i in range(n - 1):
        A, B = rings[i], rings[i + 1]; va, vb = v0 + L[i] / uv_m, v0 + L[i + 1] / uv_m
        for k in range(4):
            j = (k + 1) % 4
            f = bm.faces.new((A[k], A[j], B[j], B[k])); f.smooth = k in (0, 2)
            for l, (u_, v_) in zip(f.loops, ((us[k], va), (us[j], va), (us[j], vb), (us[k], vb))): l[uvl].uv = (u_, v_)
    bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me))
    if mat: me.materials.append(mat)
    md = o.modifiers.new('aretes', 'EDGE_SPLIT'); md.split_angle = R(50)
    return o


def mat_sangle(name='sangle', color=None, cols=7, pas_fil=0.11, rough=0.62, relief=0.9, lueur=0.0, lisiere=True, spec=0.2, sheen=0.0):
    """Sangle tissée : chevrons fins en relief (tissage sergé), lisières plus serrées. Les UV viennent de ruban()
    (u en travers, v le long, une unité par largeur). pas_fil : pas des fils, en part de la largeur.
    spec et sheen bas : un reflet blanc ou un velours délavent l'orange (il vire au saumon)."""
    m, nt, out = lib._mat(name)
    c = hex_rgb(color or K['orange'])
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Roughness'].default_value = rough
    b.inputs['Specular IOR Level'].default_value = spec
    try: b.inputs['Sheen Weight'].default_value = sheen; b.inputs['Sheen Roughness'].default_value = 0.4
    except Exception: pass
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['UV'], sep.inputs[0])
    def math_(op, a=None, bv=None, cv=None):
        n = nt.nodes.new('ShaderNodeMath'); n.operation = op
        for k, v in enumerate((a, bv, cv)):
            if v is None: continue
            if isinstance(v, (int, float)): n.inputs[k].default_value = v
            else: nt.links.new(v, n.inputs[k])
        return n.outputs[0]
    uc = math_('MULTIPLY', sep.outputs[0], cols)
    tri = math_('PINGPONG', uc, 0.5)                               # dents de scie symétriques : le chevron
    ph = math_('ADD', math_('MULTIPLY', sep.outputs[1], 1.0 / pas_fil), math_('MULTIPLY', tri, 2.2))
    onde = math_('SINE', math_('MULTIPLY', ph, 2 * math.pi))
    # fils de chaîne : fines côtes le long de la sangle
    cote = math_('SINE', math_('MULTIPLY', sep.outputs[0], 2 * math.pi * cols * 4))
    h = math_('ADD', math_('MULTIPLY', onde, 0.5), math_('MULTIPLY', cote, 0.22))
    if lisiere:                                                    # lisières : deux bourrelets au bord
        bord = math_('SUBTRACT', 0.5, math_('ABSOLUTE', math_('SUBTRACT', sep.outputs[0], 0.5)))      # 0 au bord, 0,5 au milieu
        bour = nt.nodes.new('ShaderNodeMapRange'); bour.inputs[1].default_value = 0.0; bour.inputs[2].default_value = 0.07; bour.inputs[3].default_value = 0.9; bour.inputs[4].default_value = 0.0
        nt.links.new(bord, bour.inputs[0]); h = math_('ADD', h, bour.outputs[0])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = relief; bp.inputs['Distance'].default_value = 0.0004
    nt.links.new(h, bp.inputs['Height']); nt.links.new(bp.outputs[0], b.inputs['Normal'])
    mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs[1].default_value = -0.8; mr.inputs[2].default_value = 0.8; mr.inputs[3].default_value = 0.72; mr.inputs[4].default_value = 1.0
    nt.links.new(h, mr.inputs[0])
    mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs[0].default_value = 1.0
    mx.inputs[6].default_value = c; nt.links.new(mr.outputs[0], mx.inputs[7])
    nt.links.new(mx.outputs[2], b.inputs['Base Color'])
    if lueur:
        nt.links.new(mx.outputs[2], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = lueur
    nt.links.new(b.outputs[0], out.inputs[0]); return m


# ---------- Volumes de révolution habillés ----------
def tour_uv(name, profil, mat=None, seg=128, loc=(0, 0, 0), rot=(0, 0, 0), vif=40, mats=None):
    """Volume de révolution autour de Z, avec UV : u fait le tour (0 à 1, u = 0,5 face à -Y, couture à l'arrière),
    v = part de la hauteur totale (z). profil : liste de (rayon, z) ; ou (rayon, z, i) pour donner l'indice de matière
    du tronçon qui part de ce point (mats = liste des matières)."""
    zs = [p[1] for p in profil]; z0, z1 = min(zs), max(zs); dz = (z1 - z0) or 1.0
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); rings = []
    for p in profil:
        r, z = p[0], p[1]
        if r < 1e-9: rings.append([bm.verts.new((0, 0, z))])
        else: rings.append([bm.verts.new((r * math.cos(2 * math.pi * i / seg + math.pi / 2), r * math.sin(2 * math.pi * i / seg + math.pi / 2), z)) for i in range(seg + 1)])
    for k, (a, b) in enumerate(zip(rings, rings[1:])):
        mi = profil[k][2] if len(profil[k]) > 2 else 0
        va, vb = (profil[k][1] - z0) / dz, (profil[k + 1][1] - z0) / dz
        for i in range(seg):
            u0, u1 = i / seg, (i + 1) / seg
            if len(a) == 1 and len(b) == 1: continue
            if len(a) == 1: f = bm.faces.new((a[0], b[i + 1], b[i])); uvs = (((u0 + u1) / 2, va), (u1, vb), (u0, vb))
            elif len(b) == 1: f = bm.faces.new((a[i], a[i + 1], b[0])); uvs = ((u0, va), (u1, va), ((u0 + u1) / 2, vb))
            else: f = bm.faces.new((a[i], a[i + 1], b[i + 1], b[i])); uvs = ((u0, va), (u1, va), (u1, vb), (u0, vb))
            f.smooth = True; f.material_index = mi
            for l, uv_ in zip(f.loops, uvs): l[uvl].uv = uv_
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = rot
    for m_ in (mats or ([mat] if mat else [])): me.materials.append(m_)
    md = o.modifiers.new('aretes', 'EDGE_SPLIT'); md.split_angle = R(vif)
    return o


def etiquette_courbe(name, r, z0, h, largeur, mat, az=0.0, seg=48, decolle=0.00025, parent=None):
    """Marquage sur un cylindre : portion de cylindre de rayon r (+ decolle), haute de h à partir de z0, large de
    « largeur » mètres (mesurée sur la circonférence), centrée sur l'azimut az (0 = face à -Y, positif vers +X).
    L'image de la matière s'y étale entière, à l'endroit vue de l'extérieur."""
    rr = r + decolle; ang = largeur / r
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); B, T = [], []
    for i in range(seg + 1):
        a = -math.pi / 2 + az + ang * (i / seg - 0.5)
        B.append(bm.verts.new((rr * math.cos(a), rr * math.sin(a), z0))); T.append(bm.verts.new((rr * math.cos(a), rr * math.sin(a), z0 + h)))
    for i in range(seg):
        f = bm.faces.new((B[i], B[i + 1], T[i + 1], T[i])); f.smooth = True
        for l, uv_ in zip(f.loops, ((i / seg, 0), ((i + 1) / seg, 0), ((i + 1) / seg, 1), (i / seg, 1))): l[uvl].uv = uv_
    bm.normal_update()
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    o = link(bpy.data.objects.new(name, me))
    if parent is not None: o.parent = parent
    return o


def _coins_arrondis(P, r, n=10):
    """Contour fermé (points 3D) dont chaque angle est remplacé par un arc de rayon r."""
    out = []; N = len(P)
    for i in range(N):
        a, b, c = P[i - 1], P[i], P[(i + 1) % N]
        u = a - b; v = c - b; lu, lv = u.length, v.length; u.normalize(); v.normalize()
        d = min(r / math.tan(u.angle(v) / 2), lu * 0.49, lv * 0.49)
        p0 = b + u * d; p1 = b + v * d
        for k in range(n + 1):
            t = k / n; out.append((1 - t) ** 2 * p0 + 2 * (1 - t) * t * b + t * t * p1)
    return out


def plaque(name, pts, ep, mat=None, rayon=0.0, bevel=0.0, loc=(0, 0, 0), rot=(0, 0, 0), n=10):
    """Plaque découpée : polygone (points 2D) à coins arrondis, extrudé de ep (centré sur son plan). Dans le plan XY ;
    rot=(90°, 0, 0) la met debout face à -Y (le y des points devient la hauteur)."""
    P = [Vector((p[0], p[1], 0)) for p in pts]
    loop = _coins_arrondis(P, rayon, n) if rayon else P
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'
    sp = cu.splines.new('POLY'); sp.points.add(len(loop) - 1)
    for q, v in zip(sp.points, loop): q.co = (v.x, v.y, 0, 1)
    sp.use_cyclic_u = True
    cu.extrude = max(0.0, ep / 2 - bevel); cu.bevel_depth = bevel; cu.bevel_resolution = 3
    o = link(bpy.data.objects.new(name, cu)); o.location = loc; o.rotation_euler = rot
    if mat: cu.materials.append(mat)
    return o


# ---------- Décor ----------
def ciel_crepuscule(horizon='#3B2A6E', milieu='#15122B', zenith='#050509', force=1.0, hauteur=0.45, bas=-0.02):
    """Ciel de crépuscule sans fichier : dégradé de l'horizon (violet sourd) au zénith (presque noir).
    bas, hauteur : hauteurs (z de la direction, de 0 à 1) où commence et finit le dégradé. Une caméra basse et droite
    ne voit qu'une bande de ciel : régler ces deux valeurs sur cette bande, sinon le ciel est un aplat."""
    nt = bpy.context.scene.world.node_tree
    bg = next(n for n in nt.nodes if n.type == 'BACKGROUND')
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Generated'], sep.inputs[0])
    cr = nt.nodes.new('ShaderNodeValToRGB'); e = cr.color_ramp.elements
    e[0].position = 0.0; e[0].color = hex_rgb(horizon); e[1].position = 1.0; e[1].color = hex_rgb(zenith)
    mid = cr.color_ramp.elements.new(hauteur * 0.45); mid.color = hex_rgb(milieu)
    mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs[1].default_value = bas; mr.inputs[2].default_value = hauteur
    nt.links.new(sep.outputs[2], mr.inputs[0]); nt.links.new(mr.outputs[0], cr.inputs[0])
    nt.links.new(cr.outputs[0], bg.inputs['Color']); bg.inputs[1].default_value = force


def mat_sol_mouille(name='sol', dossier='asphalt_02', scale=1.0, tint='#5A5A60', rough_mul=0.75, flaques=0.5, echelle=0.35, seed=0.0):
    """Sol mouillé : matière Poly Haven assombrie, et des flaques (bruit à grande échelle) où le sol devient un miroir.
    flaques : part de la surface en eau (0 à 1). echelle : taille du bruit (plus petit = flaques plus grandes)."""
    m = mat_pbr_tex(name, dossier, dossier, scale=scale, tint=tint, rough_mul=rough_mul)
    nt = m.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Location'].default_value = (seed, seed * 0.37, 0)
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = echelle; nz.inputs['Detail'].default_value = 5; nz.inputs['Roughness'].default_value = 0.55
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    cr = nt.nodes.new('ShaderNodeValToRGB'); e = cr.color_ramp.elements
    seuil = 0.5 + (0.5 - flaques) * 0.3
    e[0].position = max(0.0, seuil - 0.035); e[0].color = (0, 0, 0, 1); e[1].position = min(1.0, seuil + 0.035); e[1].color = (1, 1, 1, 1)
    nt.links.new(nz.outputs[0], cr.inputs[0])
    # rugosité : celle de la matière hors de l'eau, miroir dans l'eau
    lk = b.inputs['Roughness'].links
    mxr = nt.nodes.new('ShaderNodeMix'); mxr.data_type = 'FLOAT'
    nt.links.new(cr.outputs[0], mxr.inputs[0])
    if lk: src = lk[0].from_socket; nt.links.remove(lk[0]); nt.links.new(src, mxr.inputs[2])
    else: mxr.inputs[2].default_value = 0.6
    mxr.inputs[3].default_value = 0.015
    nt.links.new(mxr.outputs[0], b.inputs['Roughness'])
    # relief : effacé dans l'eau
    nm = next((n for n in nt.nodes if n.type == 'NORMAL_MAP'), None)
    if nm:
        inv = nt.nodes.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0
        nt.links.new(cr.outputs[0], inv.inputs[1]); nt.links.new(inv.outputs[0], nm.inputs['Strength'])
    # couleur : plus sombre dans l'eau
    lkc = b.inputs['Base Color'].links
    if lkc:
        srcc = lkc[0].from_socket; nt.links.remove(lkc[0])
        mxc = nt.nodes.new('ShaderNodeMix'); mxc.data_type = 'RGBA'; mxc.blend_type = 'MULTIPLY'
        mxc.inputs[7].default_value = (0.35, 0.35, 0.38, 1)
        nt.links.new(cr.outputs[0], mxc.inputs[0]); nt.links.new(srcc, mxc.inputs[6]); nt.links.new(mxc.outputs[2], b.inputs['Base Color'])
    return m


# ---------- Appareils ----------
def portable(name, ecran, ouverture=90.0, w=0.312, d=0.221, ep=0.0155, loc=(0, 0, 0), rz=0.0, clavier=True, coque='#1D1D20', pont='#2A2A2D'):
    """Ordinateur portable de 14 pouces (312 × 221 × 15,5 mm fermé), écran 16:10 de 300 × 187,5 mm. La base est posée
    sur z = loc.z, l'écran fait face à -Y quand rz = 0. ouverture : angle du capot en degrés (90 = écran vertical).
    Renvoie (repère de l'ensemble, plan de l'écran, repère du capot)."""
    alu = mat_pbr(name + '-alu', coque, rough=0.36, metal=1.0)
    alu2 = mat_pbr(name + '-pont', pont, rough=0.42, metal=1.0)
    noir = mat_pbr(name + '-noir', '#060607', rough=0.6)
    touche = mat_pbr(name + '-touche', '#0B0B0D', rough=0.5, coat=0.15)
    verre = mat_pbr(name + '-verre', '#020203', rough=0.06, coat=1.0)
    tb, tl = 0.0098, ep - 0.0098
    objs = [rrect(name + '-base', w, d, 0.011, tb, bevel=0.0012, mat=alu, loc=(0, 0, tb / 2))]
    if clavier:
        objs.append(rrect(name + '-pont', w - 0.004, d - 0.004, 0.0095, 0.0003, mat=alu2, loc=(0, 0, tb + 0.00005)))
        objs.append(rrect(name + '-cuve', 0.276, 0.106, 0.004, 0.0006, mat=noir, loc=(0, 0.036, tb + 0.0002)))
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts: v.co.x *= 0.0162; v.co.y *= 0.0158; v.co.z *= 0.0012
        km = bpy.data.meshes.new(name + '-touche'); bm.to_mesh(km); bm.free(); km.materials.append(touche)
        pas = 0.0192
        for r in range(5):
            y = 0.036 + 0.106 / 2 - 0.0125 - r * 0.0199
            for c in range(14):
                if r == 4 and 4 <= c <= 8: continue
                o = link(bpy.data.objects.new(f'{name}-t{r}-{c}', km)); o.location = ((c - 6.5) * pas, y, tb + 0.0012); objs.append(o)
        objs.append(lib.box(name + '-espace', 0.0162 + 4 * pas, 0.0158, 0.0012, ((6 - 6.5) * pas, 0.036 + 0.106 / 2 - 0.0125 - 4 * 0.0199, tb + 0.0012), mat=touche))
        objs.append(rrect(name + '-pave', 0.128, 0.078, 0.006, 0.0004, mat=mat_pbr(name + '-pave', '#232326', rough=0.26, metal=0.7), loc=(0, -0.064, tb + 0.0003)))
    sw, sh = 0.300, 0.1875
    capot = [rrect(name + '-capot', w, d, 0.011, tl, bevel=0.001, mat=alu, loc=(0, tl / 2, d / 2), rot=(R(90), 0, 0)),
             rrect(name + '-dalle', w - 0.003, d - 0.003, 0.0095, 0.0004, mat=verre, loc=(0, -0.0002, d / 2), rot=(R(90), 0, 0))]
    plan = screen_v(name + '-ecran', sw, sh, (0, -0.0006, d - 0.0065 - sh / 2), ecran)
    capot.append(plan)
    pivot = groupe(name + '-pivot', capot, loc=(0, d / 2 - tl, tb + 0.0004), rot=(R(90 - ouverture), 0, 0))
    objs.append(pivot)
    rep = groupe(name, objs, loc=loc, rot=(0, 0, rz))
    bpy.context.view_layer.update()
    return rep, plan, pivot


def telephone(name, ecran, loc=(0, 0, 0), rz=0.0, w=0.0715, h=0.1467, ep=0.0078, coin=0.009, coque='#2A2A2D'):
    """Téléphone posé à plat, écran vers le haut (71,5 × 146,7 × 7,8 mm, coins de 9 mm). L'écran utile mesure
    64,6 × 139,8 mm (proportion 390 × 844) : son image porte ses propres coins arrondis en transparence.
    Renvoie (repère, plan de l'écran)."""
    titane = mat_pbr(name + '-titane', coque, rough=0.3, metal=1.0)
    verre = mat_pbr(name + '-verre', '#010102', rough=0.03, coat=1.0)
    sw, sh = 0.0646, 0.1398
    plan = plane(name + '-ecran', sw, sh, (0, 0, ep + 0.00042), mat=ecran)
    objs = [rrect(name + '-corps', w, h, coin, ep, bevel=0.0013, mat=titane, loc=(0, 0, ep / 2)),
            rrect(name + '-dalle', w - 0.0026, h - 0.0026, coin - 0.0013, 0.0005, mat=verre, loc=(0, 0, ep + 0.0001)),
            plan,
            box(name + '-b1', 0.0012, 0.017, 0.003, (w / 2 + 0.0003, 0.02, ep / 2), mat=titane, bevel=0.0004),
            box(name + '-b2', 0.0012, 0.010, 0.003, (-w / 2 - 0.0003, 0.034, ep / 2), mat=titane, bevel=0.0004),
            box(name + '-b3', 0.0012, 0.010, 0.003, (-w / 2 - 0.0003, 0.020, ep / 2), mat=titane, bevel=0.0004)]
    rep = groupe(name, objs, loc=loc, rot=(0, 0, rz))
    bpy.context.view_layer.update()
    return rep, plan


def coins_ecran(obj):
    """Coins d'un plan d'écran dans l'image, dans l'ordre haut-gauche, haut-droit, bas-droit, bas-gauche (pixels)."""
    p = cam_rect(obj)
    p = sorted(p, key=lambda q: q[1]); haut = sorted(p[:2]); bas = sorted(p[2:])
    return [haut[0], haut[1], bas[1], bas[0]]
