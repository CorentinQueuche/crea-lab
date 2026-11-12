# Aides communes aux huit scènes de Payout (s02 à s35) : lumière de marque qui garde sa teinte, écrans, ciel de nuit,
# terrain, lumières lointaines, ordinateur portable, téléphone. S'appuie sur payout.py, lib.py et objets.py sans les modifier.
# Usage dans une scène :  from decor import *
import bpy, bmesh, math, os, random
from mathutils import Vector, noise
import lib
from payout import *

SUR = '#F3F6F4'


def box(name, sx, sy, sz, loc=(0, 0, 0), rot=(0, 0, 0), mat=None, bevel=0.0, seg=3, uv_m=1.0):
    """lib.box, corrigé pour les surfaces brillantes : avec un chanfrein, lib.box lisse tout le maillage et les normales
    des grandes faces se courbent (les reflets d'un plateau, d'une dalle ou d'un socle ondulent). On pondère les normales
    par l'aire des faces : les grandes faces restent planes, seul le chanfrein est adouci."""
    o = lib.box(name, sx, sy, sz, loc, rot, mat, bevel, seg, uv_m)
    if bevel:
        md = o.modifiers.new('normales', 'WEIGHTED_NORMAL'); md.keep_sharp = True; md.weight = 100
    return o


def _force_selon_rayon(nt, emission, cam, diffus):
    """Force d'émission : cam pour la caméra et les reflets (la teinte reste juste), diffus pour la lumière jetée sur les
    surfaces mates. Sans cela, il faudrait monter l'émission au-delà de 1,2 et le Net virerait au menthe."""
    if not diffus or diffus == cam:
        emission.inputs[1].default_value = cam; return
    lp = nt.nodes.new('ShaderNodeLightPath'); mr = nt.nodes.new('ShaderNodeMapRange')
    mr.inputs[3].default_value = cam; mr.inputs[4].default_value = diffus
    nt.links.new(lp.outputs['Is Diffuse Ray'], mr.inputs[0]); nt.links.new(mr.outputs[0], emission.inputs[1])


def mat_lum(name, color=None, cam=1.15, diffus=None, cote=None):
    """Lumière de marque (Net par défaut). cam : force vue par la caméra, 1,2 au plus. diffus : force de la lumière jetée.
    cote : couleur des faces qui ne regardent ni -Y ni +Y (donne du volume à un bloc lumineux sans l'éclairer)."""
    m, nt, out = lib._mat(name)
    e = nt.nodes.new('ShaderNodeEmission')
    col = hex_rgb(color or C['net']) if not isinstance(color, tuple) else color
    if cote:
        geo = nt.nodes.new('ShaderNodeNewGeometry'); sep = nt.nodes.new('ShaderNodeSeparateXYZ')
        ab = nt.nodes.new('ShaderNodeMath'); ab.operation = 'ABSOLUTE'
        mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'
        mx.inputs[6].default_value = hex_rgb(cote); mx.inputs[7].default_value = col
        nt.links.new(geo.outputs['Normal'], sep.inputs[0]); nt.links.new(sep.outputs[1], ab.inputs[0])
        nt.links.new(ab.outputs[0], mx.inputs[0]); nt.links.new(mx.outputs[2], e.inputs[0])
    else:
        e.inputs[0].default_value = col
    _force_selon_rayon(nt, e, cam, diffus)
    nt.links.new(e.outputs[0], out.inputs[0]); return m


def mat_ecran_lum(name, image_path, cam=1.0, diffus=None, gloss=0.05, rough=0.04, alpha=False):
    """Écran : l'image en émission à force cam (1 = couleurs exactes du visuel), et diffus pour la lumière qu'il jette.
    alpha : coins arrondis par la transparence de l'image (téléphone)."""
    m = (mat_ecran if alpha else mat_screen)(name, image_path, cam, gloss=gloss, rough=rough)
    e = next(n for n in m.node_tree.nodes if n.type == 'EMISSION')
    _force_selon_rayon(m.node_tree, e, cam, diffus)
    return m


def mat_imprime(name, image_path, rough=0.5, coat=0.0, bump=0.0, lueur=0.0):
    """Surface imprimée. lueur : un peu de l'image en émission, pour qu'un aplat Net reste électrique sous une lumière faible."""
    m = mat_image(name, image_path, rough=rough, coat=coat, bump=bump)
    if lueur:
        nt = m.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'); tex = next(n for n in nt.nodes if n.type == 'TEX_IMAGE')
        nt.links.new(tex.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = lueur
    return m


def mat_verre_sombre(name='verre', color=None, rough=0.06, coat=1.0):
    """Verre sombre, laque noire : socles, dalles, capots."""
    return mat_pbr(name, color or C['coffre'], rough=rough, coat=coat)


def ciel_nuit(horizon='#14302A', zenith='#030605', force=1.0, etoiles=1.0, hauteur=0.38, densite=0.88):
    """Ciel de nuit sans fichier : dégradé de l'horizon au zénith dans la teinte du Coffre, et des étoiles fines."""
    nt = bpy.context.scene.world.node_tree
    bg = next(n for n in nt.nodes if n.type == 'BACKGROUND')
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Generated'], sep.inputs[0])
    mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs[1].default_value = 0.0; mr.inputs[2].default_value = hauteur; mr.inputs[3].default_value = 1.0; mr.inputs[4].default_value = 0.0
    pw = nt.nodes.new('ShaderNodeMath'); pw.operation = 'POWER'; pw.inputs[1].default_value = 2.4
    nt.links.new(sep.outputs[2], mr.inputs[0]); nt.links.new(mr.outputs[0], pw.inputs[0])
    grad = nt.nodes.new('ShaderNodeMix'); grad.data_type = 'RGBA'
    grad.inputs[6].default_value = hex_rgb(zenith); grad.inputs[7].default_value = hex_rgb(horizon)
    nt.links.new(pw.outputs[0], grad.inputs[0])
    vor = nt.nodes.new('ShaderNodeTexVoronoi'); vor.voronoi_dimensions = '3D'; vor.feature = 'F1'
    vor.inputs['Scale'].default_value = 85; vor.inputs['Randomness'].default_value = 1.0
    nt.links.new(tc.outputs['Generated'], vor.inputs['Vector'])
    pt = nt.nodes.new('ShaderNodeMapRange'); pt.inputs[1].default_value = 0.0; pt.inputs[2].default_value = 0.055; pt.inputs[3].default_value = 1.0; pt.inputs[4].default_value = 0.0
    nt.links.new(vor.outputs['Distance'], pt.inputs[0])
    sc_ = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(vor.outputs['Color'], sc_.inputs[0])
    tri = nt.nodes.new('ShaderNodeMapRange'); tri.inputs[1].default_value = densite; tri.inputs[2].default_value = 1.0; tri.inputs[3].default_value = 0.0; tri.inputs[4].default_value = 1.0
    nt.links.new(sc_.outputs[0], tri.inputs[0])
    haut = nt.nodes.new('ShaderNodeMapRange'); haut.inputs[1].default_value = 0.02; haut.inputs[2].default_value = 0.22; haut.inputs[3].default_value = 0.0; haut.inputs[4].default_value = 1.0
    nt.links.new(sep.outputs[2], haut.inputs[0])
    m1 = nt.nodes.new('ShaderNodeMath'); m1.operation = 'MULTIPLY'; m2 = nt.nodes.new('ShaderNodeMath'); m2.operation = 'MULTIPLY'; m3 = nt.nodes.new('ShaderNodeMath'); m3.operation = 'MULTIPLY'
    nt.links.new(pt.outputs[0], m1.inputs[0]); nt.links.new(tri.outputs[0], m1.inputs[1])
    nt.links.new(m1.outputs[0], m2.inputs[0]); nt.links.new(haut.outputs[0], m2.inputs[1])
    nt.links.new(m2.outputs[0], m3.inputs[0]); m3.inputs[1].default_value = 1.6 * etoiles
    add = nt.nodes.new('ShaderNodeMix'); add.data_type = 'RGBA'; add.blend_type = 'ADD'; add.inputs[0].default_value = 1.0
    nt.links.new(grad.outputs[2], add.inputs[6]); nt.links.new(m3.outputs[0], add.inputs[7])
    nt.links.new(add.outputs[2], bg.inputs['Color']); bg.inputs[1].default_value = force


def _lisse(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)


def terrain(name, taille=280, n=560, mat=None, plat=(8, 17), monts=(34, 120), relief=12.0, bosses=0.35, seed=3.0, puissance=1.7):
    """Sol bruité : plat autour de l'origine (rayon plat[0] à plat[1]), vallonné ensuite, montagnes au loin (monts).
    La grille est resserrée près de l'origine. UV de 0 à 1 sur toute la surface."""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); h = taille / 2
    def pos(i):
        u = 2 * i / n - 1; return math.copysign(abs(u) ** puissance, u) * h
    def haut(x, y):
        d = math.hypot(x, y); f = _lisse(plat[0], plat[1], d); loin = _lisse(monts[0], monts[1], d)
        p = Vector((x, y, seed))
        petit = bosses * (noise.fractal(p * 0.22, 1.0, 2.0, 5) + 0.3 * noise.noise(p * 1.3))
        mont = relief * noise.ridged_multi_fractal(p * 0.011 + Vector((seed * 7.1, seed * 3.3, 0)), 1.0, 2.1, 6, 1.0, 2.0) * 0.5
        return f * petit * (1 + 2.5 * loin) + loin * mont
    vs = [[bm.verts.new((pos(i), pos(j), haut(pos(i), pos(j)))) for j in range(n + 1)] for i in range(n + 1)]
    for i in range(n):
        for j in range(n):
            f = bm.faces.new((vs[i][j], vs[i + 1][j], vs[i + 1][j + 1], vs[i][j + 1])); f.smooth = True
            for l in f.loops: l[uvl].uv = (l.vert.co.x / taille + 0.5, l.vert.co.y / taille + 0.5)
    bm.normal_update()
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me))
    if mat: me.materials.append(mat)
    return o


def lumieres_lointaines(n=30, seed=11, zone=((-22, 26), (22, 70)), hauteurs=(0.7, 1.0, 2.2, 3.5, 4.5, 6.0), couleurs=None, force=(20, 80), rayon=(0.07, 0.2), evite=None, vers=(math.radians(90), 0, 0)):
    """Disques lumineux au loin, que la profondeur de champ transforme en ronds flous : rue, salon, ville.
    couleurs : liste de codes. evite(x, y) : renvoie vrai là où il n'en faut pas."""
    rnd = random.Random(seed)
    cols = couleurs or ['#F3F6F4', '#F3F6F4', '#DCEBFF', '#DCEBFF', C['net200'], C['net'], '#FFE9C9']
    mats = {}
    for i in range(n):
        x = rnd.uniform(*zone[0]); y = rnd.uniform(*zone[1]); z = rnd.choice(hauteurs); c = rnd.choice(cols); f = rnd.uniform(*force); r = rnd.uniform(*rayon)
        if evite and evite(x, y): continue
        k = (c, round(f / 10))
        if k not in mats: mats[k] = mat_emit(f'loin-{len(mats)}', hex_rgb(c), f)
        cyl(f'loin{i}', r, 0.02, (x, y, z), vers, mat=mats[k], seg=24)


def groupe(name, objets, loc=(0, 0, 0), rot=(0, 0, 0)):
    """Réunit des objets sous un repère vide, puis pose l'ensemble. Les objets sont construits autour de l'origine."""
    e = link(bpy.data.objects.new(name, None))
    for o in objets: o.parent = e
    e.location = loc; e.rotation_euler = rot
    return e


def portable(name, ecran, ouverture=90.0, w=0.312, d=0.221, ep=0.0155, loc=(0, 0, 0), rz=0.0, clavier=True):
    """Ordinateur portable de 14 pouces (312 × 221 × 15,5 mm fermé), écran 16:10 de 300 × 187,5 mm. Posé sur z = loc.z,
    écran face à -Y quand rz = 0. ouverture : angle du capot en degrés (90 = écran vertical, pour une incrustation droite).
    ecran : matière de l'écran. Renvoie (repère, plan de l'écran)."""
    alu = mat_pbr(name + '-alu', '#111614', rough=0.34, metal=1.0)
    noir = mat_pbr(name + '-noir', '#050706', rough=0.5)
    touche = mat_pbr(name + '-touche', '#0A0D0C', rough=0.42, coat=0.2)
    verre = mat_pbr(name + '-verre', '#020303', rough=0.05, coat=1.0)
    tb, tl = 0.0098, ep - 0.0098                       # épaisseurs de la base et du capot
    objs = [rrect(name + '-base', w, d, 0.011, tb, bevel=0.0012, mat=alu, loc=(0, 0, tb / 2))]
    if clavier:
        objs.append(rrect(name + '-cuve', 0.276, 0.106, 0.004, 0.0006, mat=noir, loc=(0, 0.036, tb + 0.0001)))
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts: v.co.x *= 0.0162; v.co.y *= 0.0158; v.co.z *= 0.0012
        km = bpy.data.meshes.new(name + '-touche'); bm.to_mesh(km); bm.free(); km.materials.append(touche)
        pas = 0.0192
        for r in range(5):
            y = 0.036 + 0.106 / 2 - 0.0125 - r * 0.0199
            for c in range(14):
                if r == 4 and 4 <= c <= 8: continue
                o = link(bpy.data.objects.new(f'{name}-t{r}-{c}', km)); o.location = ((c - 6.5) * pas, y, tb + 0.0011); objs.append(o)
        objs.append(box(name + '-espace', 0.0162 + 4 * pas, 0.0158, 0.0012, ((6 - 6.5) * pas, 0.036 + 0.106 / 2 - 0.0125 - 4 * 0.0199, tb + 0.0011), mat=touche))
        objs.append(rrect(name + '-pave', 0.128, 0.078, 0.006, 0.0004, mat=mat_pbr(name + '-pave', '#0D1210', rough=0.22, metal=0.6), loc=(0, -0.064, tb + 0.0001)))
    # Capot : construit debout (plan XZ, face écran vers -Y), charnière sur l'arête arrière de la base
    sw, sh = 0.300, 0.1875
    capot = [rrect(name + '-capot', w, d, 0.011, tl, bevel=0.001, mat=alu, loc=(0, tl / 2, d / 2), rot=(math.radians(90), 0, 0)),
             rrect(name + '-dalle', w - 0.003, d - 0.003, 0.0095, 0.0004, mat=verre, loc=(0, -0.0002, d / 2), rot=(math.radians(90), 0, 0))]
    plan = screen_v(name + '-ecran', sw, sh, (0, -0.0006, d - 0.0065 - sh / 2), ecran)
    capot.append(plan)
    pivot = groupe(name + '-pivot', capot, loc=(0, d / 2 - tl, tb + 0.0004), rot=(math.radians(90 - ouverture), 0, 0))
    objs.append(pivot)
    rep = groupe(name, objs, loc=loc, rot=(0, 0, rz))
    bpy.context.view_layer.update()
    return rep, plan


def telephone(name, ecran, loc=(0, 0, 0), rz=0.0, w=0.0715, h=0.1467, ep=0.0078, coin=0.009):
    """Téléphone posé à plat, écran vers le haut (71,5 × 146,7 × 7,8 mm, coins de 9 mm). L'écran utile mesure
    64,6 × 139,8 mm (proportion 390 × 844) : son image porte ses propres coins arrondis en transparence.
    Renvoie (repère, plan de l'écran)."""
    titane = mat_pbr(name + '-titane', '#2B302D', rough=0.3, metal=1.0)
    verre = mat_pbr(name + '-verre', '#010202', rough=0.03, coat=1.0)
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


def droit(cam, shift_x=0.0, shift_y=0.0):
    """Caméra droite : on décale le cadre au lieu d'incliner l'appareil (les verticales restent verticales)."""
    cam.data.shift_x = shift_x; cam.data.shift_y = shift_y; return cam
