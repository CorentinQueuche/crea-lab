# Aides communes aux quatre scènes d'atelier du lot 3D-1 de Custom (02 écusson, 21 sérigraphie, 37 étiquettes, 39 papeterie).
# S'appuie sur lib.py et objets.py sans les modifier. Usage dans une scène :  from custom3d1 import *
# Contenu : couleurs de la charte, matière imprimée dont le fluo reste électrique, fils torsadés en vraie géométrie
# (point de satin, cordonnet, bobinage), tissus en relief (sergé, jersey), feuilles et cartes, cordons, caches de lumière.
import bpy, bmesh, math, os, random, sys
import numpy as np
from mathutils import Vector, Matrix
import lib
from lib import *
from objets import opt, mat_papier, mat_decal, mat_vitre, poser, tour, arc, vue, mat_bois

C = dict(noir='#101012', fluo='#E2FF21', blanc='#FFFFFF', graphite='#272728', fonte='#404042', acier='#56565A', violet='#8E3EFF',
         orange='#FE3600', encre='#03010E', craie='#DBDBDE', fluo600='#C2DC0C', fluo700='#8EA20A', fluo800='#5A6609')
R = math.radians
MM = 0.001


def art(nom):
    """Visuel de support du lot : out/art/3d1-<nom>.png"""
    return os.path.join(ART, '3d1-' + nom + '.png')


def tex(nom):
    return os.path.join(TEX, nom)


def image(path, non_color=False):
    im = bpy.data.images.load(path, check_existing=True)
    if non_color: im.colorspace_settings.name = 'Non-Color'
    return im


def groupe(name, objets, loc=(0, 0, 0), rot=(0, 0, 0)):
    """Réunit des objets (construits autour de l'origine) sous un repère vide, puis pose l'ensemble."""
    e = link(bpy.data.objects.new(name, None))
    for o in objets:
        if o is not None: o.parent = e
    e.location = loc; e.rotation_euler = rot
    return e


# ---------------------------------------------------------------- matières
def _lueur_fluo(nt, couleur_socket, bsdf, force):
    """Le fluo d'une image émet un peu de lumière (encre fluorescente) : il reste proche de #E2FF21 même à l'ombre,
    sans toucher au blanc, au noir, au violet ni à l'orange. Masque : vert moins bleu (en linéaire)."""
    sep = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(couleur_socket, sep.inputs[0])
    sub = nt.nodes.new('ShaderNodeMath'); sub.operation = 'SUBTRACT'
    nt.links.new(sep.outputs[1], sub.inputs[0]); nt.links.new(sep.outputs[2], sub.inputs[1])
    mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs[1].default_value = 0.30; mr.inputs[2].default_value = 0.85
    mr.inputs[3].default_value = 0.0; mr.inputs[4].default_value = force
    nt.links.new(sub.outputs[0], mr.inputs[0])
    nt.links.new(couleur_socket, bsdf.inputs['Emission Color']); nt.links.new(mr.outputs[0], bsdf.inputs['Emission Strength'])


def mat_print(name, image_path, rough=0.55, coat=0.0, bump=0.0, fluo=0.22, alpha=False, relief=None, relief_force=0.4,
              relief_dist=0.0003, ext='EXTEND', echelle=(1, 1), metal=0.0, relief_echelle=None):
    """Surface imprimée (papier, carton, tissu) : l'image en couleur de base ; fluo : part de lumière émise par les aplats fluo.
    alpha : découpe par la transparence de l'image. relief : image de hauteur (niveaux de gris) pour le bump."""
    m, nt, out = lib._mat(name)
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = image(image_path); t.extension = ext
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (echelle[0], echelle[1], 1)
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], t.inputs['Vector'])
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if coat: b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.12
    nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
    if fluo: _lueur_fluo(nt, t.outputs['Color'], b, fluo)
    normal = None
    if bump:
        nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1400; nz.inputs['Detail'].default_value = 4
        nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
        bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.0002
        nt.links.new(nz.outputs[0], bp.inputs['Height']); normal = bp.outputs[0]
    if relief:
        # relief_echelle : nombre de répétitions de l'image de relief sur la surface (une matière de tissu raccordable)
        rt = nt.nodes.new('ShaderNodeTexImage'); rt.image = image(relief, True); rt.extension = 'REPEAT' if relief_echelle else ext
        if relief_echelle:
            mp2 = nt.nodes.new('ShaderNodeMapping'); mp2.inputs['Scale'].default_value = (relief_echelle[0], relief_echelle[1], 1)
            nt.links.new(tc.outputs['UV'], mp2.inputs['Vector']); nt.links.new(mp2.outputs['Vector'], rt.inputs['Vector'])
        else:
            nt.links.new(mp.outputs['Vector'], rt.inputs['Vector'])
        bp2 = nt.nodes.new('ShaderNodeBump'); bp2.inputs['Strength'].default_value = relief_force; bp2.inputs['Distance'].default_value = relief_dist
        nt.links.new(rt.outputs['Color'], bp2.inputs['Height'])
        if normal is not None: nt.links.new(normal, bp2.inputs['Normal'])
        normal = bp2.outputs[0]
    if normal is not None: nt.links.new(normal, b.inputs['Normal'])
    if alpha:
        tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mix = nt.nodes.new('ShaderNodeMixShader')
        nt.links.new(t.outputs['Alpha'], mix.inputs[0]); nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(b.outputs[0], mix.inputs[2])
        nt.links.new(mix.outputs[0], out.inputs[0])
    else:
        nt.links.new(b.outputs[0], out.inputs[0])
    return m


def mat_teinte(name, color, rough=0.6, lueur=0.0, coat=0.0, bump=0.0, echelle=1400, metal=0.0, spec=None):
    """Aplat de couleur (carton teinté, encre, plastique). lueur : part émise (pour le fluo : 0,15 à 0,3)."""
    m, nt, out = lib._mat(name)
    col = color if isinstance(color, tuple) else hex_rgb(color)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Base Color'].default_value = col
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if spec is not None: b.inputs['Specular IOR Level'].default_value = spec
    if coat: b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.1
    if lueur: b.inputs['Emission Color'].default_value = col; b.inputs['Emission Strength'].default_value = lueur
    if bump:
        tc = nt.nodes.new('ShaderNodeTexCoord'); nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = echelle; nz.inputs['Detail'].default_value = 4
        nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
        bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.0002
        nt.links.new(nz.outputs[0], bp.inputs['Height']); nt.links.new(bp.outputs[0], b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs[0]); return m


def mat_fil(name, color, rough=0.42, lueur=0.0, spec=0.25, sheen=0.0, trans=0.0, reflet=None):
    """Fil à broder : satiné. Le reflet est teinté par le fil à tous les angles (un vernis ordinaire blanchit à contre-jour
    et le fluo vire au jaune pâle) ; reflet : couleur du reflet si elle doit différer (fil noir). trans : lumière traversante."""
    m, nt, out = lib._mat(name)
    col = color if isinstance(color, tuple) else hex_rgb(color)
    cr = reflet if reflet is not None else col
    if not isinstance(cr, tuple): cr = hex_rgb(cr)
    tc = nt.nodes.new('ShaderNodeTexCoord'); nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 9000; nz.inputs['Detail'].default_value = 2
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.25; bp.inputs['Distance'].default_value = 0.00003
    nt.links.new(nz.outputs[0], bp.inputs['Height'])
    df = nt.nodes.new('ShaderNodeBsdfDiffuse'); df.inputs['Color'].default_value = col; df.inputs['Roughness'].default_value = 0.6
    gl = nt.nodes.new('ShaderNodeBsdfGlossy'); gl.inputs['Color'].default_value = cr; gl.inputs['Roughness'].default_value = rough
    nt.links.new(bp.outputs[0], df.inputs['Normal']); nt.links.new(bp.outputs[0], gl.inputs['Normal'])
    mx = nt.nodes.new('ShaderNodeMixShader'); mx.inputs[0].default_value = spec
    nt.links.new(df.outputs[0], mx.inputs[1]); nt.links.new(gl.outputs[0], mx.inputs[2]); cur = mx.outputs[0]
    if trans:
        tl = nt.nodes.new('ShaderNodeBsdfTranslucent'); tl.inputs[0].default_value = col
        m2 = nt.nodes.new('ShaderNodeMixShader'); m2.inputs[0].default_value = trans
        nt.links.new(cur, m2.inputs[1]); nt.links.new(tl.outputs[0], m2.inputs[2]); cur = m2.outputs[0]
    if lueur:
        em = nt.nodes.new('ShaderNodeEmission'); em.inputs[0].default_value = col; em.inputs[1].default_value = lueur
        ad = nt.nodes.new('ShaderNodeAddShader'); nt.links.new(cur, ad.inputs[0]); nt.links.new(em.outputs[0], ad.inputs[1]); cur = ad.outputs[0]
    nt.links.new(cur, out.inputs[0]); return m


def mat_tissu(name, color='#0B0B0D', rough=0.86, sheen=0.6, fibre=0.35, echelle=5200, teinte_sheen=(0.55, 0.56, 0.6, 1), spec=0.5):
    """Tissu sombre : très mat, duvet (sheen) qui accroche la lumière rasante, fibres en relief fin.
    Le relief du tissage est porté par la géométrie (grille_relief) ou par une image (mat_print relief=)."""
    m, nt, out = lib._mat(name)
    col = color if isinstance(color, tuple) else hex_rgb(color)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Base Color'].default_value = col; b.inputs['Roughness'].default_value = rough
    b.inputs['Specular IOR Level'].default_value = spec          # à contre-jour rasant, un tissu noir à 0,5 vire au gris
    try:
        b.inputs['Sheen Weight'].default_value = sheen; b.inputs['Sheen Roughness'].default_value = 0.5; b.inputs['Sheen Tint'].default_value = teinte_sheen
    except Exception: pass
    tc = nt.nodes.new('ShaderNodeTexCoord'); nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = echelle; nz.inputs['Detail'].default_value = 3
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = fibre; bp.inputs['Distance'].default_value = 0.00004
    nt.links.new(nz.outputs[0], bp.inputs['Height']); nt.links.new(bp.outputs[0], b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs[0]); return m


def mat_velours(name, color='#17171A', fibre=0.6, echelle=2600):
    """Feutre ou velours sombre : diffus pur, sans reflet (un fond qui reste noir sous une lumière rasante)."""
    m, nt, out = lib._mat(name)
    df = nt.nodes.new('ShaderNodeBsdfDiffuse'); df.inputs['Color'].default_value = color if isinstance(color, tuple) else hex_rgb(color); df.inputs['Roughness'].default_value = 1.0
    tc = nt.nodes.new('ShaderNodeTexCoord'); nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = echelle; nz.inputs['Detail'].default_value = 3
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = fibre; bp.inputs['Distance'].default_value = 0.00006
    nt.links.new(nz.outputs[0], bp.inputs['Height']); nt.links.new(bp.outputs[0], df.inputs['Normal'])
    nt.links.new(df.outputs[0], out.inputs[0]); return m


def mat_halo(name, color, force=2.0, r=0.08, dur=2.2):
    """Lumière lointaine déjà floue : un disque lumineux dont le bord s'éteint en douceur (transparent autour).
    À poser sur un disque de rayon r ; la profondeur de champ seule ne suffit pas à l'arrondir quand le diaphragme est fermé."""
    m, nt, out = lib._mat(name)
    tc = nt.nodes.new('ShaderNodeTexCoord'); ln = nt.nodes.new('ShaderNodeVectorMath'); ln.operation = 'LENGTH'
    nt.links.new(tc.outputs['Object'], ln.inputs[0])
    mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs[1].default_value = r * 0.35; mr.inputs[2].default_value = r; mr.inputs[3].default_value = 1.0; mr.inputs[4].default_value = 0.0
    try: mr.interpolation_type = 'SMOOTHSTEP'
    except Exception: pass
    nt.links.new(ln.outputs['Value'], mr.inputs[0])
    em = nt.nodes.new('ShaderNodeEmission'); em.inputs[0].default_value = color if isinstance(color, tuple) else hex_rgb(color); em.inputs[1].default_value = force
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(mr.outputs[0], mix.inputs[0]); nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0]); return m


def mat_metal(name, color='#C9CBCF', rough=0.22, brosse=0.0, echelle=(4, 600, 600)):
    """Acier ou aluminium. brosse : rayures fines dans une direction (aluminium brossé d'un cadre)."""
    m, nt, out = lib._mat(name)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Base Color'].default_value = hex_rgb(color)
    b.inputs['Metallic'].default_value = 1.0; b.inputs['Roughness'].default_value = rough
    if brosse:
        tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = echelle
        nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.0; nz.inputs['Detail'].default_value = 6
        nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
        mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs[3].default_value = max(0.02, rough - brosse); mr.inputs[4].default_value = rough + brosse
        nt.links.new(nz.outputs[0], mr.inputs[0]); nt.links.new(mr.outputs[0], b.inputs['Roughness'])
        bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.12; bp.inputs['Distance'].default_value = 0.0002
        nt.links.new(nz.outputs[0], bp.inputs['Height']); nt.links.new(bp.outputs[0], b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs[0]); return m


# ---------------------------------------------------------------- fils en vraie géométrie
def _brins(P, rayon, pas, n, phase):
    """Brins torsadés autour d'une ligne centrale P (n × 3) : hélices de rayon donné, un tour tous les « pas » mètres."""
    d = np.gradient(P, axis=0); T = d / np.maximum(np.linalg.norm(d, axis=1, keepdims=True), 1e-12)
    B = np.cross(T, np.array([0.0, 0.0, 1.0])); nb = np.linalg.norm(B, axis=1, keepdims=True)
    B = np.where(nb > 1e-6, B / np.maximum(nb, 1e-12), np.array([1.0, 0.0, 0.0]))
    N = np.cross(B, T)
    s = np.concatenate([[0.0], np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))])
    th = 2 * np.pi * s / pas + phase
    return [P + rayon * (np.cos(th + 2 * np.pi * k / n)[:, None] * N + np.sin(th + 2 * np.pi * k / n)[:, None] * B) for k in range(n)]


def fils(name, lignes, r=0.00018, mat=None, brins=2, torsade=0.0011, seed=0, res=2, profil=None):
    """Fils en volume. lignes : liste de lignes centrales (tableaux n × 3, en mètres). r : rayon du fil.
    Chaque fil est fait de « brins » torsadés (2 = fil à broder) ; brins=1 donne un fil lisse."""
    rnd = random.Random(seed)
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    rs, rh = {1: (r, 0.0), 2: (r * 0.58, r * 0.44), 3: (r * 0.5, r * 0.52)}[brins]
    if profil: rs, rh = r * profil[0], r * profil[1]          # (rayon d'un brin, rayon de l'hélice), en parts du rayon du fil
    cu.bevel_depth = rs; cu.bevel_resolution = res; cu.use_fill_caps = True
    for P in lignes:
        P = np.asarray(P, dtype=float)
        if len(P) < 2: continue
        S_ = [P] if brins == 1 else _brins(P, rh, torsade * rnd.uniform(0.9, 1.1), brins, rnd.uniform(0, 6.283))
        for S in S_:
            sp = cu.splines.new('POLY'); sp.points.add(len(S) - 1)
            sp.points.foreach_set('co', np.concatenate([S, np.ones((len(S), 1))], axis=1).ravel())
    o = link(bpy.data.objects.new(name, cu))
    if mat: cu.materials.append(mat)
    return o


def contour_svg(part='symbole', largeur=0.034):
    """Contours du logo en mètres, à plat dans XY (y vers le haut), centrés sur la boîte de la pièce.
    Même repère que lib.logo(part, rot=(0,0,0), loc=(0, -hauteur/2, z)) pour le symbole. Renvoie (liste de tableaux n × 2, échelle)."""
    P = logo_data()[part]; bx = P['box']; s = largeur / bx[2]
    cx, cy = bx[0] + bx[2] / 2, bx[1] + bx[3] / 2
    out = []
    for loop in svg_loops(P['d'], n=24):
        a = np.array([((x - cx) * s, (cy - y) * s) for x, y in loop])
        if np.linalg.norm(a[0] - a[-1]) < 1e-9: a = a[:-1]
        out.append(a)
    return out, s


def _coupes(poly, e, d, c):
    """Intersections de la droite { c·e + t·d } avec un polygone fermé : valeurs de t triées."""
    A = poly; B = np.roll(poly, -1, axis=0)
    sa = A @ e - c; sb = B @ e - c
    k = (sa * sb < 0) | ((sa == 0) & (sb != 0))
    f = sa[k] / (sa[k] - sb[k]); X = A[k] + (B[k] - A[k]) * f[:, None]
    return np.sort(X @ d)


def satin(polys, direction, pas=0.00036, r=0.00017, haut=0.00034, bord=0.0, coupe=None, seed=1, pas_pts=0.00009, jitter=0.00005, min_len=0.0006):
    """Lignes centrales d'un point de satin qui remplit des polygones (liste de tableaux n × 2, à plat).
    direction : angle des points (radians, depuis l'axe X). pas : écart entre deux fils. haut : hauteur du dos du fil.
    coupe(c, t0, t1) : renvoie la liste des tronçons d'une traversée (pour séparer deux colonnes de satin). Les fils
    vont en zigzag serré, comme le fait la machine : chaque point repart d'où le précédent s'est planté."""
    rnd = random.Random(seed)
    d = np.array([math.cos(direction), math.sin(direction)]); e = np.array([d[1], -d[0]])
    lignes = []
    allp = np.concatenate(polys); c0, c1 = (allp @ e).min(), (allp @ e).max()
    n = int((c1 - c0 - 2 * bord) / pas)
    start = c0 + bord + ((c1 - c0 - 2 * bord) - n * pas) / 2
    for k in range(n + 1):
        c = start + k * pas
        sens = 1 if k % 2 == 0 else -1
        ts = []
        for poly in polys:
            t = _coupes(poly, e, d, c)
            for i in range(0, len(t) - 1, 2): ts.append((t[i], t[i + 1]))
        segs = []
        for t0, t1 in ts: segs += (coupe(c, t0, t1) if coupe else [(t0, t1)])
        for t0, t1 in segs:
            L = t1 - t0 - 2 * r * 0.6
            if L < min_len: continue
            a = t0 + r * 0.6 + rnd.uniform(-1, 1) * jitter; b = t1 - r * 0.6 + rnd.uniform(-1, 1) * jitter
            npts = max(8, int((b - a) / pas_pts))
            u = np.linspace(0, 1, npts)
            lat = c + sens * (u - 0.5) * pas * 0.9 + rnd.uniform(-1, 1) * jitter * 0.4     # zigzag : le fil glisse d'un demi-pas
            t = a + (b - a) * u
            h = haut * rnd.uniform(0.9, 1.08)
            z = -r * 0.9 + (h + r * 0.9) * (1 - np.abs(2 * u - 1) ** 3.2) ** (1 / 2.2)
            z += (rnd.uniform(-1, 1) * 0.06 * haut) * np.sin(np.pi * u)
            xy = lat[:, None] * e[None, :] + t[:, None] * d[None, :]
            lignes.append(np.concatenate([xy, z[:, None]], axis=1))
    return lignes


def cordonnet(contour, r_ame=0.0011, r_fil=0.00019, pas=0.00035, penche=0.35, z=0.0, a0=-50, a1=215, seed=3):
    """Bord cordonnet d'un écusson : fils qui enjambent une âme ronde le long d'un contour fermé (tableau n × 2, sens direct).
    Renvoie (lignes des fils, points de l'âme). L'âme est à l'intérieur du contour, à r_ame du bord."""
    rnd = random.Random(seed)
    P = np.asarray(contour, float); seg = np.linalg.norm(np.roll(P, -1, axis=0) - P, axis=1)
    s = np.concatenate([[0.0], np.cumsum(seg)]); total = s[-1]
    n = int(total / pas); lignes = []; ame = []
    Pc = np.concatenate([P, P[:1]])
    ang = np.radians(np.linspace(a0, a1, 44))
    for k in range(n):
        sk = k * total / n
        i = min(len(P) - 1, int(np.searchsorted(s, sk, side='right') - 1)); f = (sk - s[i]) / max(seg[i], 1e-12)
        p = Pc[i] + (Pc[i + 1] - Pc[i]) * f; t = (Pc[i + 1] - Pc[i]) / max(seg[i], 1e-12)
        nout = np.array([t[1], -t[0]])                    # normale sortante pour un contour en sens direct
        c = p - nout * r_ame
        if k % 3 == 0: ame.append((c[0], c[1], z))
        rr = (r_ame + r_fil) * rnd.uniform(0.97, 1.04)
        along = penche * r_ame * np.cos(ang) + rnd.uniform(-1, 1) * pas * 0.12
        xy = c[None, :] + (rr * np.cos(ang))[:, None] * nout[None, :] + along[:, None] * t[None, :]
        lignes.append(np.concatenate([xy, (z + rr * np.sin(ang))[:, None]], axis=1))
    return lignes, ame


def rrect_pts(w, h, r, n=24):
    """Contour d'un rectangle arrondi, sens direct (tableau n × 2)."""
    pts = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n); pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return np.array(pts)


def dans_rrect(X, Y, w, h, r):
    """Masque : points à l'intérieur d'un rectangle arrondi centré."""
    qx = np.abs(X) - (w / 2 - r); qy = np.abs(Y) - (h / 2 - r)
    return (np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - r) <= 0


# ---------------------------------------------------------------- tissus en relief
def _hash(i, j=0, s=0):
    x = np.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453
    return x - np.floor(x)


def serge(X, Y, px=0.00026, py=0.00036, amp=0.00011):
    """Hauteur d'un sergé 2/1 (chaîne dessus, côtes montant vers la droite). X, Y en mètres."""
    u = X / px; v = Y / py; i = np.floor(u); j = np.floor(v); fu = u - i - 0.5; fv = v - j - 0.5
    k = np.mod(i - j, 3)
    s = np.clip(((2 - k) + fv + 0.5) / 2, 0, 1)
    chaine = np.cos(np.pi * fu) ** 0.8 * (0.30 + 0.70 * np.sin(np.pi * s) ** 0.55) * (0.86 + 0.28 * _hash(i, 0, 1))
    trame = 0.5 * np.cos(np.pi * fv) ** 0.8 * (0.45 + 0.55 * np.sin(np.pi * (fu + 0.5)) ** 0.6) * (0.9 + 0.2 * _hash(j, 0, 2))
    return np.where(k == 0, trame, chaine) * amp


def jersey(X, Y, px=0.00045, py=0.00034, amp=0.00010):
    """Hauteur d'un jersey (maille de tee-shirt) : colonnes de mailles en V."""
    u = X / px; i = np.floor(u); fu = u - i - 0.5
    v = Y / py + 0.35 * np.abs(fu) * 2
    fv = v - np.floor(v) - 0.5
    jambe = np.cos(np.pi * (np.abs(fu) * 2 - 0.5)) ** 2
    return amp * (0.25 + 0.75 * jambe) * (0.55 + 0.45 * np.cos(2 * np.pi * fv)) * (0.9 + 0.2 * _hash(i, 0, 5))


def grille_relief(name, w, h, pas, hauteur, mat=None, loc=(0, 0, 0), masque=None, lisse=True):
    """Surface dense dont le relief est une fonction hauteur(X, Y) (tableaux numpy, mètres) : un tissage en vraie géométrie,
    pour que la lumière rasante y porte de vraies ombres. masque(X, Y) : ne garde que les faces dont le centre répond vrai."""
    nx = int(round(w / pas)) + 1; ny = int(round(h / pas)) + 1
    X, Y = np.meshgrid(np.linspace(-w / 2, w / 2, nx), np.linspace(-h / 2, h / 2, ny))
    Z = hauteur(X, Y) if callable(hauteur) else np.full_like(X, hauteur)
    co = np.stack([X, Y, Z], axis=-1).reshape(-1, 3)
    idx = np.arange(nx * ny).reshape(ny, nx)
    q = np.stack([idx[:-1, :-1], idx[:-1, 1:], idx[1:, 1:], idx[1:, :-1]], axis=-1).reshape(-1, 4)
    if masque is not None:
        cx = (X[:-1, :-1] + X[1:, 1:]) / 2; cy = (Y[:-1, :-1] + Y[1:, 1:]) / 2
        q = q[masque(cx, cy).reshape(-1)]
    me = bpy.data.meshes.new(name)
    me.vertices.add(len(co)); me.vertices.foreach_set('co', co.ravel())
    me.loops.add(q.size); me.loops.foreach_set('vertex_index', q.ravel().astype(np.int32))
    me.polygons.add(len(q)); me.polygons.foreach_set('loop_start', np.arange(0, q.size, 4, dtype=np.int32)); me.polygons.foreach_set('loop_total', np.full(len(q), 4, dtype=np.int32))
    if lisse: me.polygons.foreach_set('use_smooth', np.ones(len(q), dtype=bool))
    uv = me.uv_layers.new(name='UVMap')
    uvs = np.stack([(co[:, 0] + w / 2) / w, (co[:, 1] + h / 2) / h], axis=-1)[q.ravel()]
    uv.data.foreach_set('uv', uvs.ravel())
    me.update(calc_edges=True)
    o = link(bpy.data.objects.new(name, me)); o.location = loc
    if mat: me.materials.append(mat)
    return o


def drape(name, w, h, mat=None, loc=(0, 0, 0), rz=0.0, pas=0.004, plis=0.004, echelle=7.0, seed=1.0, bord=0.0, relief=None):
    """Tissu posé à plat avec de légers plis (bruit lissé). UV de 0 à 1. relief(X, Y) : hauteur ajoutée (bosse sous le tissu)."""
    from mathutils import noise
    nx = int(round(w / pas)) + 1; ny = int(round(h / pas)) + 1
    xs = np.linspace(-w / 2, w / 2, nx); ys = np.linspace(-h / 2, h / 2, ny)
    Z = np.zeros((ny, nx))
    for a in range(ny):
        for b_ in range(nx):
            p = Vector((xs[b_] * echelle, ys[a] * echelle, seed))
            Z[a, b_] = plis * (0.5 + 0.5 * noise.fractal(p, 1.0, 2.0, 3)) + 0.35 * plis * noise.noise(p * 3.1)
    X, Y = np.meshgrid(xs, ys)
    if relief is not None: Z = Z + relief(X, Y)
    if bord:
        dist = np.minimum(np.minimum(X + w / 2, w / 2 - X), np.minimum(Y + h / 2, h / 2 - Y))
        Z = Z * np.clip(dist / bord, 0, 1) ** 0.5 + 0.0006
    o = grille_relief(name, w, h, pas, lambda A, B: Z, mat=mat, loc=loc)
    o.rotation_euler = (0, 0, rz)
    return o


# ---------------------------------------------------------------- papeterie
def feuille(name, w, h, img, loc=(0, 0, 0), rz=0.0, ep=0.0004, tranche='#F2F2F0', rough=0.55, bump=0.05, coat=0.0, fluo=0.22,
            dos=None, tilt=(0.0, 0.0), mat_face=None, relief=None, relief_force=0.4):
    """Feuille, carte ou enveloppe : un corps mince et sa face imprimée (dos : image de l'autre face, facultatif).
    loc = centre, z = dessous. tilt : inclinaisons autour de X et Y (radians) pour une carte appuyée sur une autre."""
    mt = tranche if not isinstance(tranche, str) else mat_teinte(name + '-t', tranche, rough=0.7, lueur=0.2 if tranche.upper() == C['fluo'] else 0.0)
    objs = [box(name + '-corps', w, h, ep, (0, 0, ep / 2), mat=mt)]
    mf = mat_face or mat_print(name + '-img', img, rough=rough, bump=bump, coat=coat, fluo=fluo, relief=relief, relief_force=relief_force)
    objs.append(plane(name, w, h, (0, 0, ep + 0.00004), mat=mf))
    if dos:
        objs.append(plane(name + '-dos', w, h, (0, 0, -0.00004), (math.pi, 0, 0), mat=mat_print(name + '-dos', dos, rough=rough, bump=bump, fluo=fluo)))
    return groupe(name + '-g', objs, loc=loc, rot=(tilt[0], tilt[1], rz))


def pile(name, w, h, n, img, loc=(0, 0, 0), rz=0.0, ep=0.0004, tranche='#F2F2F0', seed=1, jeu=0.0006, tourne=1.2, rough=0.5, fluo=0.22, visibles=6):
    """Pile de n cartes : un bloc pour le bas de la pile, les « visibles » dernières cartes posées une à une, un peu de travers."""
    rnd = random.Random(seed); hb = (n - visibles) * ep
    mt = mat_tranche(name + '-tr', tranche, ep)
    objs = [box(name + '-bloc', w, h, hb, (0, 0, hb / 2), mat=mt)]
    g = groupe(name, objs, loc=loc, rot=(0, 0, rz))
    mf = mat_print(name + '-img', img, rough=rough, bump=0.05, fluo=fluo)
    for i in range(visibles):
        c = feuille(f'{name}-c{i}', w, h, img, (rnd.uniform(-jeu, jeu), rnd.uniform(-jeu, jeu), hb + i * ep), R(rnd.uniform(-tourne, tourne)), ep=ep, tranche=mt, mat_face=mf)
        c.parent = g
    return g


def mat_tranche(name, color='#F2F2F0', ep=0.0004):
    """Tranche d'une pile de papier : fines lignes horizontales (une par feuille)."""
    m, nt, out = lib._mat(name)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Roughness'].default_value = 0.8
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs[0])
    ml = nt.nodes.new('ShaderNodeMath'); ml.operation = 'MULTIPLY'; ml.inputs[1].default_value = 1.0 / ep
    fr = nt.nodes.new('ShaderNodeMath'); fr.operation = 'FRACT'
    nt.links.new(sep.outputs[2], ml.inputs[0]); nt.links.new(ml.outputs[0], fr.inputs[0])
    cr = nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].position = 0.0; cr.color_ramp.elements[1].position = 0.22
    base = hex_rgb(color); cr.color_ramp.elements[0].color = tuple(c * 0.45 for c in base[:3]) + (1,); cr.color_ramp.elements[1].color = base
    nt.links.new(fr.outputs[0], cr.inputs[0]); nt.links.new(cr.outputs[0], b.inputs['Base Color'])
    nt.links.new(b.outputs[0], out.inputs[0]); return m


def volet(name, loc, cible, l=0.4, h=0.4):
    """Cache noir entre une lumière et la scène : découpe un faisceau (volet de projecteur)."""
    o = box(name, l, 0.002, h, loc, mat=mat_pbr(name, '#000000', rough=1.0))
    d = Vector(cible) - Vector(loc); o.rotation_euler = d.to_track_quat('Y', 'Z').to_euler()
    o.visible_camera = False
    return o


def macro(cam, clip=0.002):
    """Caméra de macro : le plan de coupe proche de Blender (10 cm) mangerait la scène."""
    cam.data.clip_start = clip; cam.data.clip_end = 50; return cam


def tore(name, R_, r, mat=None, loc=(0, 0, 0), rot=(0, 0, 0), seg=64):
    """Anneau (tore) autour de Z."""
    prof = [(R_ + r * math.cos(2 * math.pi * i / 16), r * math.sin(2 * math.pi * i / 16)) for i in range(17)]
    return tour(name, prof, mat=mat, seg=seg, loc=loc, rot=rot, vif=80)


def lisser(pts, n=24):
    """Courbe lisse passant par des points (Catmull-Rom), rééchantillonnée : n points par tronçon. Renvoie un tableau m × 3."""
    P = np.asarray(pts, float); Q = np.concatenate([P[:1] * 2 - P[1:2], P, P[-1:] * 2 - P[-2:-1]])
    out = []
    for i in range(len(P) - 1):
        p0, p1, p2, p3 = Q[i], Q[i + 1], Q[i + 2], Q[i + 3]
        for k in range(n):
            t = k / n
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(P[-1])
    return np.array(out)


def rendre(nom):
    """Comme lib.render, avec deux options de contrôle : --pct=60 (taille du brouillon, 35 par défaut) et
    --zone=x0,y0,x1,y1 (parts du cadre, origine en bas à gauche) pour rendre un détail à pleine définition
    dans out/blender/zone-<nom>."""
    sc = bpy.context.scene
    sc.render.filepath = os.path.join(OUT, nom)
    zone = opt('zone', '')
    if zone:
        x0, y0, x1, y1 = [float(v) for v in zone.split(',')]
        sc.render.use_border = True; sc.render.use_crop_to_border = True
        sc.render.border_min_x, sc.render.border_min_y, sc.render.border_max_x, sc.render.border_max_y = x0, y0, x1, y1
        sc.cycles.samples = int(opt('ds', 96)); sc.render.filepath = os.path.join(OUT, 'zone-' + nom)
    elif '--draft' in argv():
        sc.render.resolution_percentage = int(opt('pct', 35)); sc.cycles.samples = int(opt('ds', 48))
        sc.render.filepath = os.path.join(OUT, 'draft-' + nom)
    bpy.ops.render.render(write_still=True)
    print('RENDU', sc.render.filepath)


def canette(name, loc=(0, 0, 0), rz=0.0, fil=None, r=0.0103, l=0.0098):
    """Canette de brodeuse couchée sur la tranche : deux joues d'acier et le fil bobiné entre elles. Axe horizontal."""
    acier = mat_metal(name + '-acier', '#CFD1D6', rough=0.2)
    objs = [tour(name + '-j1', [(0.003, 0), (r, 0), (r, 0.0006), (0.003, 0.0006)], mat=acier, seg=64),
            tour(name + '-j2', [(0.003, l), (r, l), (r, l + 0.0006), (0.003, l + 0.0006)], mat=acier, seg=64),
            tour(name + '-fil', [(0.003, 0.0006), (r * 0.86, 0.0006), (r * 0.9, l * 0.5), (r * 0.86, l), (0.003, l)], mat=fil, seg=64)]
    g = groupe(name, objs, loc=(loc[0], loc[1], loc[2] + r), rot=(R(90), 0, rz))
    return g


def ecusson(name, loc=(0, 0, 0), rz=0.0, lc=0.034, pw=0.048, ph=0.034, pr=0.0055, rf=0.0002, pas_tissu=0.00007, res=1, lueur=0.08):
    """L'écusson de la planche 02, comme objet posé (dessous en z = loc.z) : Cran brodé au point de satin sur sergé noir,
    bord cordonnet. Même construction que blender/s02_ecusson.py, en moins fin."""
    polys, S = contour_svg('symbole', lc); HC = 110 * S
    toile = mat_tissu(name + '-serge', '#060608', rough=0.7, sheen=0.12, fibre=0.4, spec=0.16)
    objs = [grille_relief(name + '-serge', pw - 0.0014, ph - 0.0014, pas_tissu, serge, mat=toile,
                          masque=lambda X, Y: dans_rrect(X, Y, pw - 0.0015, ph - 0.0015, pr - 0.00075)),
            rrect(name + '-corps', pw - 0.001, ph - 0.001, pr - 0.0005, 0.00075, mat=mat_pbr(name + '-corps', '#050506', rough=0.9), loc=(0, 0, -0.00042))]
    ang = math.atan2(62.4, 14.75)
    d = np.array([math.cos(ang), math.sin(ang)]); e = np.array([d[1], -d[0]]); g = np.array([64.4, -16.8]); g = g / np.linalg.norm(g)
    cr = lambda a, b: a[0] * b[1] - a[1] * b[0]
    def couture(c, t0, t1):
        if t1 - t0 < 80 * S: return [(t0, t1)]
        ts = -c * cr(e, g) / cr(d, g)
        return [(t0, ts + 0.00014), (ts - 0.00014, t1)]
    lignes = satin(polys, ang, pas=0.00033, r=rf, haut=0.00038, bord=rf * 0.9, coupe=couture, seed=4, pas_pts=0.00012)
    fluo = mat_fil(name + '-fluo', C['fluo'], rough=0.38, lueur=lueur, spec=0.22, trans=0.12)
    objs.append(fils(name + '-cran', lignes, r=rf, mat=fluo, brins=2, torsade=0.00085, seed=2, res=res, profil=(0.70, 0.32)))
    sc = logo(name + '-sous-couche', height=HC, extrude=0.0002, mat=mat_teinte(name + '-sc', C['fluo600'], rough=0.8, lueur=0.06), part='symbole',
              loc=(0, -HC / 2, 0.00006), rot=(0, 0, 0))
    sc.data.offset = -0.00045; objs.append(sc)
    ra, za = 0.00095, -0.00025
    bords, ame = cordonnet(rrect_pts(pw, ph, pr), r_ame=ra, r_fil=0.0002, pas=0.00036, penche=0.4, z=za)
    objs.append(fils(name + '-cordonnet', bords, r=0.0002, mat=mat_fil(name + '-noir', '#0C0C0E', rough=0.3, spec=0.3, reflet='#6E7078'), brins=2, torsade=0.0014, seed=7, res=res))
    cu = bpy.data.curves.new(name + '-ame', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = ra * 0.97; cu.bevel_resolution = 4
    sp = cu.splines.new('POLY'); sp.points.add(len(ame) - 1)
    for p, a in zip(sp.points, ame): p.co = (*a, 1)
    sp.use_cyclic_u = True; cu.materials.append(mat_pbr(name + '-ame', '#0A0A0B', rough=0.8))
    objs.append(link(bpy.data.objects.new(name + '-ame', cu)))
    return groupe(name, objs, loc=(loc[0], loc[1], loc[2] + 0.0016), rot=(0, 0, rz))


def mat_kraft(name, color='#A98458', rough=0.78, cannelure=0.0):
    """Carton kraft : fibres claires et sombres, grain du papier ; cannelure : relief des ondulations (carton ondulé)."""
    m, nt, out = lib._mat(name)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Roughness'].default_value = rough
    tc = nt.nodes.new('ShaderNodeTexCoord'); base = hex_rgb(color)
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (40, 900, 900)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.0; nz.inputs['Detail'].default_value = 5; nz.inputs['Roughness'].default_value = 0.7
    nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    crp = nt.nodes.new('ShaderNodeValToRGB'); crp.color_ramp.elements[0].position = 0.3; crp.color_ramp.elements[1].position = 0.75
    crp.color_ramp.elements[0].color = tuple(c * 0.72 for c in base[:3]) + (1,); crp.color_ramp.elements[1].color = tuple(min(1, c * 1.12) for c in base[:3]) + (1,)
    nt.links.new(nz.outputs[0], crp.inputs[0]); nt.links.new(crp.outputs[0], b.inputs['Base Color'])
    nz2 = nt.nodes.new('ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = 700; nz2.inputs['Detail'].default_value = 4
    nt.links.new(tc.outputs['Object'], nz2.inputs['Vector'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.35; bp.inputs['Distance'].default_value = 0.0003
    nt.links.new(nz2.outputs[0], bp.inputs['Height']); cur = bp.outputs[0]
    if cannelure:
        wv = nt.nodes.new('ShaderNodeTexWave'); wv.inputs['Scale'].default_value = 160; wv.wave_type = 'BANDS'; wv.bands_direction = 'X'
        nt.links.new(tc.outputs['Object'], wv.inputs['Vector'])
        bp2 = nt.nodes.new('ShaderNodeBump'); bp2.inputs['Strength'].default_value = cannelure; bp2.inputs['Distance'].default_value = 0.0004
        nt.links.new(wv.outputs[0], bp2.inputs['Height']); nt.links.new(cur, bp2.inputs['Normal']); cur = bp2.outputs[0]
    nt.links.new(cur, b.inputs['Normal']); nt.links.new(b.outputs[0], out.inputs[0]); return m


def mat_plastique(name='pochette', teinte=(0.93, 0.95, 0.97, 1), rough=0.06, ior=1.6, froisse=0.6, echelle=38.0, voile=0.06):
    """Film de pochette transparente : laisse voir ce qu'il emballe, brille en biais, se froisse (bump à deux échelles).
    voile : part de blanc laiteux (un film n'est jamais tout à fait invisible)."""
    m, nt, out = lib._mat(name)
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = echelle; nz.inputs['Detail'].default_value = 3; nz.inputs['Roughness'].default_value = 0.55
    nz2 = nt.nodes.new('ShaderNodeTexVoronoi'); nz2.inputs['Scale'].default_value = echelle * 0.55; nz2.feature = 'DISTANCE_TO_EDGE'
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector']); nt.links.new(tc.outputs['Object'], nz2.inputs['Vector'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = froisse; bp.inputs['Distance'].default_value = 0.004
    nt.links.new(nz.outputs[0], bp.inputs['Height'])
    bp2 = nt.nodes.new('ShaderNodeBump'); bp2.inputs['Strength'].default_value = froisse * 0.5; bp2.inputs['Distance'].default_value = 0.002
    nt.links.new(nz2.outputs[0], bp2.inputs['Height']); nt.links.new(bp.outputs[0], bp2.inputs['Normal'])
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); tr.inputs[0].default_value = teinte
    df = nt.nodes.new('ShaderNodeBsdfDiffuse'); df.inputs[0].default_value = (0.9, 0.92, 0.95, 1)
    mv = nt.nodes.new('ShaderNodeMixShader'); mv.inputs[0].default_value = voile
    nt.links.new(tr.outputs[0], mv.inputs[1]); nt.links.new(df.outputs[0], mv.inputs[2])
    gl = nt.nodes.new('ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = rough
    nt.links.new(bp2.outputs[0], gl.inputs['Normal']); nt.links.new(bp2.outputs[0], df.inputs['Normal'])
    fr = nt.nodes.new('ShaderNodeFresnel'); fr.inputs[0].default_value = ior; nt.links.new(bp2.outputs[0], fr.inputs['Normal'])
    mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(fr.outputs[0], mix.inputs[0]); nt.links.new(mv.outputs[0], mix.inputs[1]); nt.links.new(gl.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0]); return m


def cordon(name, pts, r=0.0005, mat=None, torsade=0.0022, n=28, seed=0, res=2):
    """Cordon torsadé à deux brins passant par des points (lissés)."""
    return fils(name, [lisser(pts, n)], r=r, mat=mat, brins=2, torsade=torsade, seed=seed, res=res, profil=(0.62, 0.42))


def etiquette(name, w, h, img, loc=(0, 0, 0), rz=0.0, ep=0.0007, tranche='#0A0A0B', dos=None, fluo=0.1, oeillet_y=0.009, metal='#C9CBCF'):
    """Étiquette volante : carton épais, œillet de métal à oeillet_y du haut (son trou est un disque sombre).
    Renvoie (groupe, position monde de l'œillet)."""
    g = feuille(name, w, h, img, loc, rz, ep=ep, tranche=tranche, rough=0.6, bump=0.08, fluo=fluo, dos=dos)
    oy = h / 2 - oeillet_y
    t = tore(name + '-oeillet', 0.0023, 0.00055, mat=mat_metal(name + '-m', metal, rough=0.25), loc=(0, oy, ep + 0.0002)); t.parent = g
    c = cyl(name + '-trou', 0.0019, 0.0002, (0, oy, ep + 0.00012), mat=mat_pbr(name + '-trou', '#020203', rough=0.9), seg=32); c.parent = g
    wx = loc[0] - oy * math.sin(rz); wy = loc[1] + oy * math.cos(rz)
    return g, (wx, wy, loc[2] + ep)
