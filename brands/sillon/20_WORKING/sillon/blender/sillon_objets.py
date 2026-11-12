# Objets communs des trois scènes en volume de Sillon (33 la pierre, 34 la bouteille, 35 les verres).
# Complète lib.py et objets.py sans les modifier.  Usage :  from lib import *  puis  from sillon_objets import *
#
# Ce qu'on trouve ici : la lumière commune (un flash dur d'en haut à gauche, des bandes de reflet invisibles à la caméra),
# les matières (tuffeau, sergé bleu, verre épais, les trois jus, papier imprimé et gaufré), le logotype taillé (lettres
# sans le bloc de vin, lues dans brand/logo/logo.json), et les liquides construits à la main : une surface horizontale
# en monde, quel que soit l'angle du contenant, avec un ménisque qui remonte le long des parois.
import bpy, bmesh, math, os, random
from mathutils import Vector, Matrix
import lib
from lib import *
from objets import vue, opt, tour, arc, poser

# ---------- La marque (valeurs de brand/marque.js) ----------
COUL = dict(bleu='#2146D0', cave='#0E1638', tuffeau='#F2EFE4', craie='#E2DDCC', lave='#8EA5F0', maceration='#FF9B21', glou='#FF4F7B', paille='#F7C52B')
ECHELLES = {'maceration': ['#FFE1B0', '#FFBF60', '#FF9B21', '#D5670D', '#8A3A09'], 'glou': ['#FFD3DC', '#FF90AA', '#FF4F7B', '#CD2250', '#7A0F31'],
            'paille': ['#FFF4C2', '#FBDF72', '#F7C52B', '#D09810', '#866308'], 'bleu': ['#0E1638', '#16298A', '#2146D0', '#5B7BE6', '#8EA5F0'],
            'tuffeau': ['#FBF9F2', '#F2EFE4', '#E2DDCC', '#C4BCA4', '#8D866F']}
NIVEAU = 2 / 3
# Le creux du logotype, en unités du logo (capitale 100, ligne de base y = 100, y vers le bas) : CONSTRUCTION de marque.js
LOGO_L = 758.95
CREUX = dict(x=250.89, l=65.77, h=73.19, r_fond=9.0, r_levre=5.0)

def c(h):
    return hex_rgb(h)

# ---------- Réglages de rendu ----------
def reglages(sc=None, transmission=24, volume=4):
    """Rebonds pour le verre épais et le liquide, et un filtre doux contre les lucioles des caustiques."""
    sc = sc or bpy.context.scene
    cy = sc.cycles
    cy.max_bounces = 32; cy.transmission_bounces = transmission; cy.transparent_max_bounces = 32
    cy.glossy_bounces = 8; cy.diffuse_bounces = 4; cy.volume_bounces = volume
    cy.blur_glossy = 0.6; cy.sample_clamp_indirect = 6; cy.caustics_reflective = False; cy.caustics_refractive = True
    cy.adaptive_threshold = 0.006
    try: sc.view_settings.exposure = 0.0
    except Exception: pass

# ---------- Lumière commune ----------
def axes_camera(cam):
    bpy.context.view_layer.update()   # sans cela, matrix_world est encore l'identité juste après camera()
    m = cam.matrix_world.to_3x3()
    return m @ Vector((1, 0, 0)), m @ Vector((0, 1, 0)), m @ Vector((0, 0, -1))   # droite, haut, regard

def flash(cam, gauche=1.0, haut=1.15, face=0.3, force=5.0, angle=1.6, couleur=(1.0, 0.94, 0.85)):
    """Le flash de la marque : une lumière dure qui vient d'en haut à gauche de l'image. Les trois scènes l'appellent
    avec presque les mêmes valeurs (face > 0 : un peu de face ; face < 0 : un peu de dos, pour faire luire le vin)."""
    d, h, v = axes_camera(cam)
    hz = Vector((0, 0, 1))
    dirl = (-d * gauche + hz * haut - v * face).normalized()
    ld = bpy.data.lights.new('flash', 'SUN'); ld.energy = force; ld.angle = math.radians(angle); ld.color = couleur
    o = link(bpy.data.objects.new('flash', ld)); o.rotation_euler = (-dirl).to_track_quat('-Z', 'Y').to_euler(); o.location = dirl * 5
    return o, dirl

def carte_lumiere(name, loc, cible, w, h, force, couleur=(1, 1, 1), diffus=False):
    """Bande de reflet (un panneau de studio) : visible dans les reflets du verre et du liquide, invisible à la caméra.
    diffus=True : elle éclaire aussi les surfaces mates."""
    m = mat_emit(name, (*couleur, 1), force)
    o = plane(name, w, h, loc, mat=m)
    dz = Vector(cible) - Vector(loc); o.rotation_euler = dz.to_track_quat('-Z', 'Y').to_euler()
    o.rotation_euler.rotate_axis('X', math.radians(180))   # la face émissive regarde la cible
    o.visible_camera = False; o.visible_shadow = False
    if not diffus: o.visible_diffuse = False
    return o

def ciel_studio(fichier='studio_small_09_2k.hdr', force=0.35, rot_z=0.0):
    p = os.path.join(TEX, 'hdri', fichier)
    if os.path.exists(p): world_hdri(p, force, rot_z)
    else: world_color(c('#1B2D7A'), force)

# ---------- Nœuds ----------
def _n(nt, t, **kw):
    n = nt.nodes.new(t)
    for k, v in kw.items():
        if k in n.inputs: n.inputs[k].default_value = v
        else: setattr(n, k, v)
    return n

def _rampe(nt, pts, interp='LINEAR'):
    r = nt.nodes.new('ShaderNodeValToRGB'); cr = r.color_ramp; cr.interpolation = interp
    while len(cr.elements) < len(pts): cr.elements.new(0.5)
    for e, (p, col) in zip(cr.elements, pts):
        e.position = p; e.color = col if isinstance(col, tuple) else c(col)
    return r

def _ombre_transparente(nt, out, surface, teinte=(1, 1, 1, 1)):
    """Les rayons d'ombre traversent le verre et le liquide (teintés par leur volume) : ombres colorées sans caustiques."""
    lp = nt.nodes.new('ShaderNodeLightPath'); tr = _n(nt, 'ShaderNodeBsdfTransparent'); tr.inputs[0].default_value = teinte
    mx = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(lp.outputs['Is Shadow Ray'], mx.inputs[0]); nt.links.new(surface, mx.inputs[1]); nt.links.new(tr.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs['Surface'])

# ---------- Matières ----------
def mat_tuffeau(name, ton=1.0, layures=1.0, pores=1.0, echelle=1.0, seed=0.0, mouille=None):
    """Tuffeau de Loire : calcaire tendre et crème, au grain de sucre, piqué de pores (petits et quelques gros), avec de
    rares débris de coquille clairs et les traces de la taille (la « layure » : stries parallèles du ciseau à dents,
    par plages). Échelle en mètres réels (coordonnées objet)."""
    m, nt, out = lib._mat(name)
    b = _n(nt, 'ShaderNodeBsdfPrincipled', **{'Roughness': 0.92, 'Subsurface Weight': 0.15, 'Subsurface Scale': 0.003, 'Specular IOR Level': 0.3})
    b.inputs['Subsurface Radius'].default_value = (1.0, 0.8, 0.55)
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = _n(nt, 'ShaderNodeMapping'); mp.inputs['Scale'].default_value = (echelle,) * 3; mp.inputs['Location'].default_value = (seed, seed * 0.7, seed * 0.3)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); V = mp.outputs['Vector']
    L = nt.links.new
    def noise(s, d=6.0, r=0.6):
        n = _n(nt, 'ShaderNodeTexNoise', Scale=s, Detail=d, Roughness=r); L(V, n.inputs['Vector']); return n.outputs['Fac']
    def vor(s):
        v = _n(nt, 'ShaderNodeTexVoronoi', Scale=s, Randomness=1.0); L(V, v.inputs['Vector']); return v
    def rng(x, a, b, c_=0.0, d=1.0, smooth=False):
        r = _n(nt, 'ShaderNodeMapRange'); r.inputs['From Min'].default_value = a; r.inputs['From Max'].default_value = b
        r.inputs['To Min'].default_value = c_; r.inputs['To Max'].default_value = d
        if smooth: r.interpolation_type = 'SMOOTHSTEP'
        L(x, r.inputs['Value']); return r.outputs['Result']
    def op(o, a, b_=None, k=None):
        n = _n(nt, 'ShaderNodeMath', operation=o)
        if isinstance(a, (int, float)): n.inputs[0].default_value = a
        else: L(a, n.inputs[0])
        if b_ is not None:
            if isinstance(b_, (int, float)): n.inputs[1].default_value = b_
            else: L(b_, n.inputs[1])
        return n.outputs[0]
    # couleur : nuages lents (veines plus jaunes, plus grises) et grain de sucre
    tons = _rampe(nt, [(0.0, tuple(x * ton for x in c('#DCD4BF')[:3]) + (1,)), (0.45, tuple(x * ton for x in c('#EFEADB')[:3]) + (1,)), (1.0, tuple(x * ton for x in c('#F9F6EC')[:3]) + (1,))])
    mel = op('ADD', op('MULTIPLY', noise(3.0, 4, 0.5), 0.55), op('MULTIPLY', noise(28.0, 6, 0.65), 0.45))
    L(rng(mel, 0.3, 0.7), tons.inputs[0])
    sucre = rng(noise(2400.0, 2, 0.5), 0.3, 0.7, -0.07, 0.07)
    # pores : des creux irréguliers, groupés par plages (un seuil sur un bruit, pas des points réguliers)
    amas = rng(noise(14.0, 3, 0.5), 0.40, 0.66, 0.0, 1.0, smooth=True)
    amas2 = rng(noise(5.0, 2, 0.5), 0.5, 0.7, 0.0, 1.0, smooth=True)
    n1 = _n(nt, 'ShaderNodeTexNoise', Scale=420.0, Detail=3.0, Roughness=0.7, Distortion=0.6); L(V, n1.inputs['Vector'])
    n2 = _n(nt, 'ShaderNodeTexNoise', Scale=120.0, Detail=4.0, Roughness=0.7, Distortion=0.8); L(V, n2.inputs['Vector'])
    p1 = op('MULTIPLY', rng(n1.outputs['Fac'], 0.61, 0.69, 0, 1), amas)
    p2 = op('MULTIPLY', rng(n2.outputs['Fac'], 0.66, 0.73, 0, 1), amas2)
    p3 = rng(noise(1500.0, 2, 0.5), 0.6, 0.68, 0, 0.5)
    pore = op('MINIMUM', op('MAXIMUM', op('MAXIMUM', op('MULTIPLY', p1, pores), op('MULTIPLY', p2, pores)), p3), 1.0)
    # débris de coquille : rares points blancs
    vs = vor(230.0)
    coq = op('MULTIPLY', rng(vs.outputs['Distance'], 0.06, 0.025), op('GREATER_THAN', vs.outputs['Color'], 0.86))
    col1 = _n(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='ADD'); L(tons.outputs['Color'], col1.inputs['A']); col1.inputs['Factor'].default_value = 1.0
    cs = nt.nodes.new('ShaderNodeCombineXYZ'); L(sucre, cs.inputs[0]); L(sucre, cs.inputs[1]); L(sucre, cs.inputs[2]); L(cs.outputs[0], col1.inputs['B'])
    col2 = _n(nt, 'ShaderNodeMix', data_type='RGBA'); L(op('MULTIPLY', pore, 0.8), col2.inputs['Factor']); L(col1.outputs['Result'], col2.inputs['A']); col2.inputs['B'].default_value = c('#8F8569')
    col3 = _n(nt, 'ShaderNodeMix', data_type='RGBA'); L(coq, col3.inputs['Factor']); L(col2.outputs['Result'], col3.inputs['A']); col3.inputs['B'].default_value = c('#FFFEF8')
    couleur = col3.outputs['Result']
    if mouille:
        # la pierre boit le vin : au-dessus du niveau, sur quelques millimètres, elle est plus foncée, teintée et moins mate.
        # mouille = dict(niv, x0, x1, y0, y1, haut, teinte) en coordonnées du monde
        geo = nt.nodes.new('ShaderNodeNewGeometry'); sp = nt.nodes.new('ShaderNodeSeparateXYZ'); L(geo.outputs['Position'], sp.inputs[0])
        def dans(v, a, b_):
            return op('MULTIPLY', op('GREATER_THAN', v, a), op('LESS_THAN', v, b_))
        franges = op('ADD', op('MULTIPLY', noise(90.0, 3, 0.5), 0.0016), -0.0008)
        zlim = op('ADD', franges, mouille['niv'] + mouille['haut'])
        # seulement un liseré : sous le vin, c'est le vin qu'on voit, la pierre ne doit pas le brunir
        mk = op('MULTIPLY', op('MULTIPLY', dans(sp.outputs[0], mouille['x0'], mouille['x1']), dans(sp.outputs[1], mouille['y0'], mouille['y1'])), dans(sp.outputs[2], mouille['niv'] - 0.0015, zlim))
        cm = _n(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); L(mk, cm.inputs['Factor']); L(couleur, cm.inputs['A']); cm.inputs['B'].default_value = c(mouille.get('teinte', '#C8875A'))
        couleur = cm.outputs['Result']
        rg = rng(mk, 0, 1, 0.92, 0.42)
        L(rg, b.inputs['Roughness'])
    L(couleur, b.inputs['Base Color'])
    # traces de sciage : stries droites et parallèles d'un pas de 3 à 4 mm, par plages (le bloc a été scié puis dressé)
    wv = _n(nt, 'ShaderNodeTexWave', wave_type='BANDS', bands_direction='Z', wave_profile='SIN'); wv.inputs['Scale'].default_value = 170.0
    wv.inputs['Distortion'].default_value = 0.6; wv.inputs['Detail'].default_value = 1.0; wv.inputs['Detail Scale'].default_value = 0.2
    L(V, wv.inputs['Vector'])
    plage = rng(noise(7.0, 3, 0.55), 0.45, 0.62, 0.15, 1, smooth=True)
    stries = op('MULTIPLY', op('MULTIPLY', wv.outputs['Fac'], plage), 0.2 * layures)
    # relief : grain + stries + pores en creux + ondulation lente
    h = op('ADD', op('MULTIPLY', noise(1600.0, 8, 0.65), 0.45), stries)
    h = op('ADD', h, op('MULTIPLY', noise(60.0, 4, 0.5), 0.6))
    h = op('SUBTRACT', h, op('MULTIPLY', pore, 1.6))
    bp = _n(nt, 'ShaderNodeBump', Strength=0.7, Distance=0.0006); L(h, bp.inputs['Height']); L(bp.outputs[0], b.inputs['Normal'])
    if not mouille: L(rng(pore, 0, 1, 0.9, 0.98), b.inputs['Roughness'])
    L(b.outputs[0], out.inputs['Surface'])
    return m

def mat_serge(name, tuile=0.3, clair=1.0, plis=None, tache=None):
    """Le sergé bleu de travail (la veste du caviste) : la photo de denim Poly Haven (denim_fabric_03, CC0) dont on
    garde l'armure et le relief, recolorée dans l'échelle des bleus de la marque. tuile : côté d'une répétition, en mètres.
    tache : liste de (x, y, rayon, épaisseur, jus) en mètres (UV), des cernes de vin sur la nappe (« Taches autorisées. »)."""
    m, nt, out = lib._mat(name)
    b = _n(nt, 'ShaderNodeBsdfPrincipled', **{'Roughness': 0.9, 'Sheen Weight': 0.06, 'Sheen Roughness': 0.5, 'Specular IOR Level': 0.12})
    b.inputs['Sheen Tint'].default_value = c('#4F74E8')
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = _n(nt, 'ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1 / tuile, 1 / tuile, 1)
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector'])
    base = 'denim_fabric_03'
    def img(suf, cs):
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(TEX, base, f'{base}_{suf}_2k.jpg')); t.image.colorspace_settings.name = cs
        nt.links.new(mp.outputs['Vector'], t.inputs['Vector']); return t
    d = img('diff', 'sRGB'); n = img('nor_gl', 'Non-Color'); r = img('rough', 'Non-Color')
    bw = nt.nodes.new('ShaderNodeRGBToBW'); nt.links.new(d.outputs['Color'], bw.inputs[0])
    k = clair
    # l'image est lue en linéaire : sa luminance va de 0,05 (fond de l'armure) à 0,27 (fils clairs), médiane 0,084
    rp = _rampe(nt, [(0.05, tuple(x * k for x in c('#1C329E')[:3]) + (1,)), (0.084, tuple(x * k for x in c('#2B45C6')[:3]) + (1,)), (0.12, tuple(x * k for x in c('#3654D4')[:3]) + (1,)), (0.26, tuple(x * k for x in c('#6F90EE')[:3]) + (1,))])
    nt.links.new(bw.outputs[0], rp.inputs[0])
    couleur = rp.outputs['Color']
    if tache:
        # cernes : un anneau plus foncé (le vin sèche au bord), teinté du jus, un peu plus lisse
        for i, (tx, ty, rad, ep, jus) in enumerate(tache):
            sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['UV'], sep.inputs[0])
            dx = _n(nt, 'ShaderNodeMath', operation='SUBTRACT'); dx.inputs[1].default_value = tx; nt.links.new(sep.outputs[0], dx.inputs[0])
            dy = _n(nt, 'ShaderNodeMath', operation='SUBTRACT'); dy.inputs[1].default_value = ty; nt.links.new(sep.outputs[1], dy.inputs[0])
            cm = nt.nodes.new('ShaderNodeCombineXYZ'); nt.links.new(dx.outputs[0], cm.inputs[0]); nt.links.new(dy.outputs[0], cm.inputs[1])
            ln = _n(nt, 'ShaderNodeVectorMath', operation='LENGTH'); nt.links.new(cm.outputs[0], ln.inputs[0])
            nz = _n(nt, 'ShaderNodeTexNoise', Scale=40.0, Detail=4.0); nt.links.new(tc.outputs['UV'], nz.inputs['Vector'])
            nm = _n(nt, 'ShaderNodeMath', operation='MULTIPLY_ADD'); nm.inputs[1].default_value = 0.004; nm.inputs[2].default_value = -0.002; nt.links.new(nz.outputs['Fac'], nm.inputs[0])
            ad = _n(nt, 'ShaderNodeMath', operation='ADD'); nt.links.new(ln.outputs['Value'], ad.inputs[0]); nt.links.new(nm.outputs[0], ad.inputs[1])
            ring = _n(nt, 'ShaderNodeMapRange', interpolation_type='SMOOTHSTEP'); ring.inputs['From Min'].default_value = rad - ep; ring.inputs['From Max'].default_value = rad
            nt.links.new(ad.outputs[0], ring.inputs['Value'])
            out_ = _n(nt, 'ShaderNodeMapRange', interpolation_type='SMOOTHSTEP'); out_.inputs['From Min'].default_value = rad + 0.0006; out_.inputs['From Max'].default_value = rad - 0.0002
            nt.links.new(ad.outputs[0], out_.inputs['Value'])
            fond = _n(nt, 'ShaderNodeMath', operation='MULTIPLY'); fond.inputs[1].default_value = 0.12; nt.links.new(out_.outputs[0], fond.inputs[0])
            bord = _n(nt, 'ShaderNodeMath', operation='MULTIPLY'); nt.links.new(ring.outputs[0], bord.inputs[0]); nt.links.new(out_.outputs[0], bord.inputs[1])
            f = _n(nt, 'ShaderNodeMath', operation='MAXIMUM', use_clamp=True); nt.links.new(fond.outputs[0], f.inputs[0]); nt.links.new(bord.outputs[0], f.inputs[1])
            mx = _n(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); nt.links.new(f.outputs[0], mx.inputs['Factor'])
            nt.links.new(couleur, mx.inputs['A']); mx.inputs['B'].default_value = c(ECHELLES[jus][4])
            couleur = mx.outputs['Result']
    nt.links.new(couleur, b.inputs['Base Color'])
    rm = _n(nt, 'ShaderNodeMapRange'); rm.inputs['To Min'].default_value = 0.7; rm.inputs['To Max'].default_value = 0.95; nt.links.new(r.outputs['Color'], rm.inputs['Value']); nt.links.new(rm.outputs[0], b.inputs['Roughness'])
    nm = _n(nt, 'ShaderNodeNormalMap', Strength=1.0); nt.links.new(n.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs[0], b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs['Surface'])
    return m

def mat_verre(name, teinte='#E6F2EC', densite=6.0, rough=0.0):
    """Verre épais, clair : légèrement vert dans l'épaisseur (le chant d'une vitre ou le fond d'un verre)."""
    m, nt, out = lib._mat(name)
    b = _n(nt, 'ShaderNodeBsdfPrincipled', **{'Roughness': rough, 'IOR': 1.52, 'Transmission Weight': 1.0})
    b.inputs['Base Color'].default_value = (1, 1, 1, 1)
    _ombre_transparente(nt, out, b.outputs[0], (0.97, 0.99, 0.98, 1))
    va = _n(nt, 'ShaderNodeVolumeAbsorption', Density=densite); va.inputs['Color'].default_value = c(teinte)
    nt.links.new(va.outputs[0], out.inputs['Volume'])
    return m

def mat_jus(name, jus='maceration', trouble=1.0, densite=1.0, ior=1.34, absorption=None, albedo=1.0, ton=2):
    """Un jus de la marque : surface d'eau, volume qui absorbe et qui diffuse. trouble : la part de lumière diffusée
    (macération 1, paille 0,4, glou 0,15 : limpide). La couleur vient de l'échelle du jus (robe et cœur)."""
    E = ECHELLES[jus]
    m, nt, out = lib._mat(name)
    b = _n(nt, 'ShaderNodeBsdfPrincipled', **{'Roughness': 0.0, 'IOR': ior, 'Transmission Weight': 1.0})
    b.inputs['Base Color'].default_value = (1, 1, 1, 1)
    _ombre_transparente(nt, out, b.outputs[0])
    # un seul nœud de volume (diffusion + absorption) : deux nœuds séparés dépassent la limite de fermetures de Cycles
    # trouble : la diffusion (albédo) suit le trouble ; un jus limpide ne fait presque qu'absorber, il reste clair et vif
    if trouble >= 0.8:
        pv = _n(nt, 'ShaderNodeVolumePrincipled', Density=(40.0 + 90.0 * trouble) * densite, Anisotropy=0.35)
        # albedo < 1 : le jus renvoie moins de lumière, il reste saturé (sinon il pâlit en pêche sous un flash fort)
        pv.inputs['Color'].default_value = tuple(x * albedo for x in c(E[ton])[:3]) + (1,); pv.inputs['Absorption Color'].default_value = c(E[min(4, ton + 1)])
    else:
        pv = _n(nt, 'ShaderNodeVolumePrincipled', Density=(28.0 + 60.0 * trouble) * densite, Anisotropy=0.5)
        k = min(1.0, trouble * 1.2)
        pv.inputs['Color'].default_value = tuple(x * k for x in c(E[2] if jus == 'maceration' else E[1])[:3]) + (1,)
        pv.inputs['Absorption Color'].default_value = c(E[1] if jus == 'paille' else E[2])
    if absorption is not None:
        # réglage direct (linéaire) de la couleur absorbée, pour un long trajet dans le jus (bouteille)
        pv.inputs['Absorption Color'].default_value = tuple(absorption) + (1,)
    nt.links.new(pv.outputs[0], out.inputs['Volume'])
    return m

def mat_lie(name, jus='maceration', densite=900.0):
    """La lie : un volume seul (pas de surface), dense et sombre, posé au fond du jus."""
    E = ECHELLES[jus]; m, nt, out = lib._mat(name)
    pv = _n(nt, 'ShaderNodeVolumePrincipled', Density=densite, Anisotropy=0.1)
    pv.inputs['Color'].default_value = tuple(x * 0.6 for x in c(E[3])[:3]) + (1,); pv.inputs['Absorption Color'].default_value = c(E[3])
    nt.links.new(pv.outputs[0], out.inputs['Volume'])
    return m

def mat_depot(name, jus='maceration'):
    """Les paillettes du dépôt : de petits flocons mats, du cœur à la lie."""
    E = ECHELLES[jus]; m, nt, out = lib._mat(name)
    b = _n(nt, 'ShaderNodeBsdfPrincipled', Roughness=0.55); b.inputs['Base Color'].default_value = c(E[4])
    oi = nt.nodes.new('ShaderNodeObjectInfo'); mx = _n(nt, 'ShaderNodeMix', data_type='RGBA'); nt.links.new(oi.outputs['Random'], mx.inputs['Factor'])
    mx.inputs['A'].default_value = c(E[4]); mx.inputs['B'].default_value = c(E[3]); nt.links.new(mx.outputs['Result'], b.inputs['Base Color'])
    b.inputs['Subsurface Weight'].default_value = 0.3; b.inputs['Subsurface Scale'].default_value = 0.0006
    nt.links.new(b.outputs[0], out.inputs['Surface']); return m

def mat_bulle(name):
    """Une bulle dans le jus : de l'air, donc un indice inférieur à celui du liquide qui l'entoure."""
    m, nt, out = lib._mat(name)
    g = _n(nt, 'ShaderNodeBsdfPrincipled', **{'Roughness': 0.0, 'IOR': 1 / 1.34, 'Transmission Weight': 1.0}); g.inputs['Base Color'].default_value = (1, 1, 1, 1)
    _ombre_transparente(nt, out, g.outputs[0]); return m

def mat_papier_imprime(name, image, relief=None, rough=0.72, fibres=0.25, gaufre=0.9):
    """Papier imprimé non couché : l'image en couleur, des fibres en relief, et un gaufrage optionnel (image noir et blanc :
    blanc = relevé). Les bords du gaufrage accrochent la lumière comme sur un vrai papier embossé."""
    m, nt, out = lib._mat(name)
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(image); tex.extension = 'EXTEND'; tex.interpolation = 'Cubic'
    b = _n(nt, 'ShaderNodeBsdfPrincipled', **{'Roughness': rough, 'Sheen Weight': 0.15, 'Sheen Roughness': 0.5})
    nt.links.new(tex.outputs['Color'], b.inputs['Base Color'])
    tc = nt.nodes.new('ShaderNodeTexCoord')
    f1 = _n(nt, 'ShaderNodeTexNoise', Scale=5200.0, Detail=6.0, Roughness=0.7); nt.links.new(tc.outputs['Object'], f1.inputs['Vector'])
    f2 = _n(nt, 'ShaderNodeTexWave', wave_type='BANDS', bands_direction='Z'); f2.inputs['Scale'].default_value = 900.0; f2.inputs['Distortion'].default_value = 18.0; f2.inputs['Detail'].default_value = 4.0
    nt.links.new(tc.outputs['Object'], f2.inputs['Vector'])
    hm = _n(nt, 'ShaderNodeMath', operation='MULTIPLY_ADD'); hm.inputs[1].default_value = 0.35; nt.links.new(f2.outputs['Fac'], hm.inputs[0]); nt.links.new(f1.outputs['Fac'], hm.inputs[2])
    bp = _n(nt, 'ShaderNodeBump', Strength=fibres, Distance=0.00008); nt.links.new(hm.outputs[0], bp.inputs['Height'])
    if relief:
        rt = nt.nodes.new('ShaderNodeTexImage'); rt.image = bpy.data.images.load(relief); rt.image.colorspace_settings.name = 'Non-Color'; rt.extension = 'EXTEND'; rt.interpolation = 'Cubic'
        nt.links.new(tex.inputs['Vector'].links[0].from_socket if tex.inputs['Vector'].links else tc.outputs['UV'], rt.inputs['Vector'])
        bg = _n(nt, 'ShaderNodeBump', Strength=gaufre, Distance=0.00025); nt.links.new(rt.outputs['Color'], bg.inputs['Height']); nt.links.new(bp.outputs[0], bg.inputs['Normal'])
        nt.links.new(bg.outputs[0], b.inputs['Normal'])
    else:
        nt.links.new(bp.outputs[0], b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs['Surface'])
    return m

def mat_tranche_papier(name, couleur='#F7F4EA'):
    m, nt, out = lib._mat(name)
    b = _n(nt, 'ShaderNodeBsdfPrincipled', Roughness=0.85); b.inputs['Base Color'].default_value = c(couleur)
    b.inputs['Subsurface Weight'].default_value = 0.2; b.inputs['Subsurface Scale'].default_value = 0.0005
    nt.links.new(b.outputs[0], out.inputs['Surface']); return m

# ---------- Tissu en studio : sol et fond courbe ----------
def drape(name, mat, l=3.0, avant=1.2, arriere=1.0, h=1.6, rayon=0.5, plis=0.0, ondes=7, seed=3, nx=180, ny=140, pli_sol=0.0):
    """Le tissu de fond : un sol qui remonte en arrondi en un mur (fond de studio), avec des plis verticaux qui
    s'amplifient en hauteur (un drap tendu par le haut). UV en mètres : la matière garde son échelle."""
    rnd = random.Random(seed)
    phases = [(rnd.uniform(0.6, 1.4), rnd.uniform(0, 6.28), rnd.uniform(0.5, 1.0)) for _ in range(5)]
    # profil (y, z) le long de l'abscisse curviligne s
    L1 = avant + arriere - rayon; La = math.pi / 2 * rayon; L2 = h - rayon; S = L1 + La + L2
    def prof(s):
        if s <= L1: return Vector((0, -avant + s, 0)), Vector((0, 0, 1))
        if s <= L1 + La:
            a = (s - L1) / rayon; return Vector((0, arriere - rayon + rayon * math.sin(a), rayon - rayon * math.cos(a))), Vector((0, -math.sin(a), math.cos(a)))
        return Vector((0, arriere, rayon + (s - L1 - La))), Vector((0, -1, 0))
    bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap'); rows = []
    for j in range(ny + 1):
        s = S * j / ny; p, nrm = prof(s)
        amp = plis * max(0.0, (s - L1 * 0.85) / (S - L1 * 0.85)) ** 1.4
        row = []
        for i in range(nx + 1):
            x = -l / 2 + l * i / nx
            dpl = sum(w * math.sin(x * ondes * f + ph + s * 0.8 * f) for f, ph, w in phases) / 3.0
            dsol = pli_sol * math.sin(x * 2.1 + 1.3) * math.sin(s * 1.7) if s < L1 else 0.0
            v = Vector((x, p.y, p.z)) + nrm * (amp * dpl + dsol)
            row.append((bm.verts.new(v), (x, s)))
        rows.append(row)
    for j in range(ny):
        for i in range(nx):
            q = (rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i])
            f = bm.faces.new([a for a, _ in q]); f.smooth = True
            for lp, (_, (u, v)) in zip(f.loops, q): lp[uv].uv = (u, v)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    return link(bpy.data.objects.new(name, me))

# ---------- Le logotype taillé ----------
def creux_monde(cap, base_z=0.0, centre_x=LOGO_L / 2):
    """Le creux du double L, en mètres : murs gauche et droit, fond, haut. cap = hauteur de capitale en mètres."""
    s = cap / 100
    return dict(x0=(CREUX['x'] - centre_x) * s, x1=(CREUX['x'] + CREUX['l'] - centre_x) * s, z0=base_z + (100 - CREUX['h']) * s, z1=base_z + 100 * s,
                r_fond=CREUX['r_fond'] * s, r_levre=CREUX['r_levre'] * s, s=s)

def lettres(name, cap, ep, biseau=0.0015, mat=None, base_z=0.0, y=0.0):
    """Les six lettres de SILLON en volume, debout face à -Y, sans le bloc de vin du logotype en aplat (lu dans
    brand/logo/logo.json, on écarte le contour qui tient dans le creux). Renvoie l'objet courbe."""
    P = logo_data()['logotype']; s = cap / 100; x0 = LOGO_L / 2
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'
    n = 0
    for loop in svg_loops(P['d'], n=24):
        xs = [p[0] for p in loop]
        if min(xs) > CREUX['x'] - 0.5 and max(xs) < CREUX['x'] + CREUX['l'] + 0.5: continue   # le vin en aplat : on le retire
        if abs(loop[0][0] - loop[-1][0]) < 1e-6 and abs(loop[0][1] - loop[-1][1]) < 1e-6: loop = loop[:-1]
        sp = cu.splines.new('POLY'); sp.points.add(len(loop) - 1)
        for p, (x, yy) in zip(sp.points, loop): p.co = ((x - x0) * s, (P['baseline'] - yy) * s, 0, 1)
        sp.use_cyclic_u = True; n += 1
    cu.extrude = max(0.0, ep / 2 - biseau); cu.bevel_depth = biseau; cu.bevel_resolution = 3
    o = link(bpy.data.objects.new(name, cu)); o.location = (0, y, base_z); o.rotation_euler = (math.radians(90), 0, 0)
    if mat: cu.materials.append(mat)
    print('lettres : contours gardés', n)
    return o

def en_maillage(o):
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    me.transform(o.matrix_world)
    return me

def taille_pierre(name, maillages, mat, voxel=0.0008, relief=0.0007, eclats=0.0012, seed=1):
    """Assemble des maillages en un seul bloc de pierre (remaillage en voxels : les volumes se soudent), puis lui
    donne une surface de pierre taillée : une ondulation lente et de petits éclats."""
    bm = bmesh.new()
    for me in maillages:
        bm.from_mesh(me)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); me.materials.append(mat)
    r = o.modifiers.new('voxels', 'REMESH'); r.mode = 'VOXEL'; r.voxel_size = voxel; r.use_smooth_shade = True
    t1 = bpy.data.textures.new(name + '-ond', 'CLOUDS'); t1.noise_scale = 0.012; t1.noise_depth = 2
    d1 = o.modifiers.new('ondulation', 'DISPLACE'); d1.texture = t1; d1.strength = relief; d1.mid_level = 0.5; d1.texture_coords = 'GLOBAL'
    if eclats:
        # de rares éclats en creux (la pierre tendre s'épaufre) : cellules de Voronoï dont seules les plus proches du
        # centre descendent, le reste ne bouge pas
        t2 = bpy.data.textures.new(name + '-ecl', 'VORONOI'); t2.noise_scale = 0.012; t2.distance_metric = 'DISTANCE'
        t2.weight_1 = 1.0; t2.weight_2 = 0.0; t2.noise_intensity = 1.0
        t2.use_color_ramp = True; cr = t2.color_ramp; cr.elements[0].position = 0.0; cr.elements[0].color = (0, 0, 0, 1)
        cr.elements[1].position = 0.12; cr.elements[1].color = (1, 1, 1, 1)
        d2 = o.modifiers.new('eclats', 'DISPLACE'); d2.texture = t2; d2.strength = eclats; d2.mid_level = 1.0; d2.texture_coords = 'GLOBAL'
    return o

# ---------- Liquides ----------
def menisque(d, hauteur=0.0022, largeur=0.0028):
    """Hauteur du ménisque à la distance d d'une paroi : le liquide monte le long du verre (eau sur verre : ~2 mm)."""
    if d <= 0: return hauteur
    return hauteur * math.exp(-d / (largeur * 0.38))

def _pas(a, b, n, serre=0.0):
    """n+1 abscisses de a à b, resserrées vers les deux bords (pour dessiner le ménisque)."""
    out = []
    for i in range(n + 1):
        t = i / n
        if serre: t = 0.5 - 0.5 * math.cos(math.pi * t) if serre < 0 else t
        out.append(a + (b - a) * t)
    if serre > 0:
        L = b - a; extra = []
        for k in range(1, 9):
            e = serre * (k / 8) ** 2
            extra += [a + e, b - e]
        out = sorted(set([round(v, 7) for v in out + extra]))
    return out

def liquide_grille(name, xs, ys, haut, bas, mat):
    """Un liquide fermé, construit sur une grille (x, y) : surface du dessus z = haut(x, y), fond z = bas(x, y), parois
    verticales sur le pourtour. Sert au creux du logotype (parois de pierre à gauche et à droite, vitres devant et derrière)."""
    bm = bmesh.new(); T, B = {}, {}
    for i, x in enumerate(xs):
        for j, y in enumerate(ys):
            zt, zb = haut(x, y), bas(x, y)
            if zt < zb + 1e-4: zt = zb + 1e-4
            T[i, j] = bm.verts.new((x, y, zt)); B[i, j] = bm.verts.new((x, y, zb))
    nx, ny = len(xs) - 1, len(ys) - 1
    for i in range(nx):
        for j in range(ny):
            bm.faces.new((T[i, j], T[i + 1, j], T[i + 1, j + 1], T[i, j + 1]))
            bm.faces.new((B[i, j], B[i, j + 1], B[i + 1, j + 1], B[i + 1, j]))
    bord = [(i, 0) for i in range(nx)] + [(nx, j) for j in range(ny)] + [(i, ny) for i in range(nx, 0, -1)] + [(0, j) for j in range(ny, 0, -1)]
    for k in range(len(bord)):
        a, b = bord[k], bord[(k + 1) % len(bord)]
        bm.faces.new((B[a], B[b], T[b], T[a]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces: f.smooth = True
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    return link(bpy.data.objects.new(name, me))

def liquide_cylindre(name, ri, z_fond, conge, plan, mat, men=(0.0022, 0.0028), nr=40, nphi=160):
    """Liquide dans un verre droit, en coordonnées du verre (axe Z). plan(x, y) donne la hauteur locale de la surface
    (horizontale en monde : c'est le verre qui penche). Fond plat à z_fond, raccordé à la paroi par un congé.
    Renvoie un objet à placer avec la même matrice que le verre."""
    def bas(r):
        d = ri - r
        return z_fond + (conge - math.sqrt(max(0.0, conge * conge - (conge - d) ** 2)) if d < conge else 0.0)
    rs = [ri * (1 - (1 - k / nr) ** 1.0) for k in range(nr + 1)]
    rs = sorted(set([round(r, 7) for r in rs + [ri - men[1] * t for t in (0.02, 0.06, 0.12, 0.2, 0.3, 0.45, 0.65, 0.9, 1.3, 1.8)] + [ri - conge * t for t in (0.1, 0.3, 0.5, 0.7, 0.9)] if r > 0]))
    rs = [0.0] + [r for r in rs if r > 1e-5]
    bm = bmesh.new(); T, B = [], []
    for r in rs:
        if r == 0: T.append([bm.verts.new((0, 0, plan(0, 0)))]); B.append([bm.verts.new((0, 0, bas(0)))]); continue
        rt, rb = [], []
        for k in range(nphi):
            a = 2 * math.pi * k / nphi; x, y = r * math.cos(a), r * math.sin(a)
            zt = plan(x, y) + menisque(ri - r, *men); zb = bas(r)
            if zt < zb + 2e-4: raise ValueError(f'{name} : la surface touche le fond (r={r:.4f}) : monter le niveau')
            rt.append(bm.verts.new((x, y, zt))); rb.append(bm.verts.new((x, y, zb)))
        T.append(rt); B.append(rb)
    for L in (T, B):
        for a, b in zip(L, L[1:]):
            for k in range(nphi):
                k2 = (k + 1) % nphi
                if len(a) == 1: bm.faces.new((a[0], b[k], b[k2]))
                else: bm.faces.new((a[k], b[k], b[k2], a[k2]))
    for k in range(nphi):
        k2 = (k + 1) % nphi; bm.faces.new((B[-1][k], B[-1][k2], T[-1][k2], T[-1][k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces: f.smooth = True
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    return link(bpy.data.objects.new(name, me))

def flocons(name, n, dedans, mat, taille=(0.00025, 0.0009), seed=4, parent=None):
    """Le dépôt en suspension : n petits flocons irréguliers tirés dans la région dedans() -> (x, y, z) ou None."""
    rnd = random.Random(seed)
    bm0 = bmesh.new(); bmesh.ops.create_icosphere(bm0, subdivisions=1, radius=1.0)
    for v in bm0.verts: v.co = Vector((v.co.x * rnd.uniform(0.6, 1.4), v.co.y * rnd.uniform(0.6, 1.4), v.co.z * rnd.uniform(0.25, 0.5)))
    me = bpy.data.meshes.new(name + '-m'); bm0.to_mesh(me); bm0.free(); me.materials.append(mat)
    for p in me.polygons: p.use_smooth = True
    obs = []; essais = 0
    while len(obs) < n and essais < n * 50:
        essais += 1; p = dedans(rnd)
        if p is None: continue
        o = link(bpy.data.objects.new(f'{name}-{len(obs)}', me)); k = rnd.uniform(*taille) * (1 + 2.5 * rnd.random() ** 6)
        o.scale = (k, k, k); o.rotation_euler = (rnd.uniform(0, 6.3), rnd.uniform(0, 6.3), rnd.uniform(0, 6.3))
        if parent is not None: o.parent = parent
        o.location = p; obs.append(o)
    return obs

# ---------- Contenants ----------
def verre_droit(name, mat, R=0.036, H=0.090, paroi=0.0024, fond=0.009, conge=0.004, seg=160):
    """Le verre droit du comptoir (cylindre, fond épais, bord arrondi). Base en z = 0, axe Z.
    Renvoie (objet, rayon intérieur, hauteur du fond intérieur, congé intérieur)."""
    ri = R - paroi; e = paroi / 2
    p = [(0, 0.0012), (R - 0.006, 0.0)] + arc(0.0035, -90, 0, 8, R - 0.0035, 0.0035) + [(R, H - e)] + arc(e, 0, 180, 10, R - e, H - e) + \
        [(ri, fond + conge)] + arc(conge, 0, -90, 10, ri - conge, fond + conge) + [(0, fond)]
    o = tour(name, p, mat=mat, seg=seg, vif=75)
    return o, ri, fond, conge

def bouteille(name, mat, seg=200):
    """Bouteille bourguignonne de 75 cl (Ø 80 mm, 300 mm), verre de 2,8 mm, piqûre au fond. Renvoie (objet, profil
    intérieur [(r, z)] du bas vers le haut, rayon extérieur du corps, hauteur du corps droit)."""
    ext = [(0, 0.021), (0.012, 0.018), (0.022, 0.009), (0.029, 0.0025), (0.032, 0.0)] + arc(0.0075, -90, 0, 10, 0.0325, 0.0075)[1:] + \
          [(0.040, 0.176), (0.0396, 0.186), (0.0378, 0.198), (0.0345, 0.210), (0.0298, 0.222), (0.0245, 0.233), (0.0198, 0.243), (0.0165, 0.252), (0.0151, 0.260), (0.0148, 0.268),
           (0.0148, 0.287), (0.0158, 0.2875), (0.0165, 0.290), (0.0166, 0.296), (0.0161, 0.2995), (0.0148, 0.3012), (0.0105, 0.3015), (0.0094, 0.2995)]
    th = 0.0028
    inn = [(0.0092, 0.288), (0.0120, 0.262)]
    for r, z in [(0.0151, 0.260), (0.0165, 0.252), (0.0198, 0.243), (0.0245, 0.233), (0.0298, 0.222), (0.0345, 0.210), (0.0378, 0.198), (0.0396, 0.186), (0.040, 0.176)]:
        inn.append((r - th, z - 0.0008))
    inn += [(0.040 - th, 0.013)] + arc(0.006, 0, -90, 8, 0.040 - th - 0.006, 0.013)[1:] + [(0.024, 0.0105), (0.014, 0.020), (0, 0.0245)]
    prof = ext + inn
    o = tour(name, prof, mat=mat, seg=seg, vif=80)
    interieur = list(reversed(inn))
    return o, interieur, 0.040, 0.176

def liquide_revolution(name, interieur, niveau, mat, men=(0.0022, 0.0028), recouvre=0.00025, seg=200):
    """Le jus d'une bouteille debout : la forme intérieure jusqu'au niveau, avec son ménisque, un peu plus large que
    l'intérieur du verre (les deux surfaces ne doivent pas coïncider)."""
    pts = []
    for (r, z) in interieur:
        if z > niveau: break
        pts.append((r + recouvre if r > 0 else 0, z - recouvre))
    # rayon intérieur au niveau
    for (r0, z0), (r1, z1) in zip(interieur, interieur[1:]):
        if z0 <= niveau <= z1:
            rn = r0 + (r1 - r0) * (niveau - z0) / max(1e-9, z1 - z0); break
    rn += recouvre
    pts.append((rn, niveau + men[0]))
    for t in (0.06, 0.15, 0.3, 0.5, 0.8, 1.2, 1.8, 2.6, 4.0):
        d = men[1] * t; pts.append((rn - d, niveau + menisque(d, *men)))
    pts.append((0, niveau))
    return tour(name, pts, mat=mat, seg=seg, vif=89)

def etiquette_cyl(name, rayon, largeur, hauteur, z0, phi_c, mat_face, mat_tranche, ep=0.00018, decolle=0.00006, nu=120, nv=40, bord=0.0):
    """Un papier collé sur un cylindre (étiquette, contre-étiquette) : une coque mince qui épouse le verre, avec sa
    tranche. phi_c : angle du milieu (-90° = face à -Y). L'image s'y lit à l'endroit depuis l'extérieur.
    bord : les coins se décollent un peu (en mètres), comme un papier collé à la main."""
    span = largeur / rayon; bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap')
    def pt(u, v, r):
        a = math.radians(phi_c) - span / 2 + span * u
        lift = bord * (max(0.0, abs(u - 0.5) * 2 - 0.85) / 0.15) ** 2 * (max(0.0, abs(v - 0.5) * 2 - 0.6) / 0.4) if bord else 0.0
        rr = r + lift
        return (rr * math.cos(a), rr * math.sin(a), z0 + hauteur * v)
    F = [[bm.verts.new(pt(i / nu, j / nv, rayon + decolle + ep)) for j in range(nv + 1)] for i in range(nu + 1)]
    D = [[bm.verts.new(pt(i / nu, j / nv, rayon + decolle)) for j in range(nv + 1)] for i in range(nu + 1)]
    for i in range(nu):
        for j in range(nv):
            f = bm.faces.new((F[i][j], F[i + 1][j], F[i + 1][j + 1], F[i][j + 1])); f.material_index = 0; f.smooth = True
            for l, (uu, vv) in zip(f.loops, ((i / nu, j / nv), ((i + 1) / nu, j / nv), ((i + 1) / nu, (j + 1) / nv), (i / nu, (j + 1) / nv))): l[uv].uv = (uu, vv)
            g = bm.faces.new((D[i][j], D[i][j + 1], D[i + 1][j + 1], D[i + 1][j])); g.material_index = 1; g.smooth = True
    ring = [(i, 0) for i in range(nu)] + [(nu, j) for j in range(nv)] + [(i, nv) for i in range(nu, 0, -1)] + [(0, j) for j in range(nv, 0, -1)]
    for k in range(len(ring)):
        a, b = ring[k], ring[(k + 1) % len(ring)]
        f = bm.faces.new((D[a[0]][a[1]], D[b[0]][b[1]], F[b[0]][b[1]], F[a[0]][a[1]])); f.material_index = 1
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat_face); me.materials.append(mat_tranche)
    return link(bpy.data.objects.new(name, me))

def plaque(name, w, h, r, ep, mat_face, mat_tranche, seg=12):
    """Rectangle arrondi épais (sous-verre en carton) : face du dessus imprimée (UV 0-1, haut de l'image vers +Y)."""
    pts = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        pts += [(cx + r * math.cos(math.radians(a0 + 90 * k / seg)), cy + r * math.sin(math.radians(a0 + 90 * k / seg))) for k in range(seg + 1)]
    bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap')
    top = [bm.verts.new((x, y, ep)) for x, y in pts]; bot = [bm.verts.new((x, y, 0)) for x, y in pts]
    ft = bm.faces.new(top); ft.material_index = 0
    for l in ft.loops: l[uv].uv = (l.vert.co.x / w + 0.5, l.vert.co.y / h + 0.5)
    fb = bm.faces.new(list(reversed(bot))); fb.material_index = 1
    n = len(pts)
    for k in range(n):
        f = bm.faces.new((bot[k], bot[(k + 1) % n], top[(k + 1) % n], top[k])); f.material_index = 1; f.smooth = True
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat_face); me.materials.append(mat_tranche)
    o = link(bpy.data.objects.new(name, me))
    b = o.modifiers.new('biseau', 'BEVEL'); b.width = min(0.0005, ep / 3); b.segments = 2; b.limit_method = 'ANGLE'
    return o

def eclat_pierre(name, mat, taille=0.03, seed=7):
    """Un éclat de tuffeau tombé du bloc : un caillou anguleux (cube biseauté, coupé et déformé)."""
    rnd = random.Random(seed)
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=2, radius=taille / 2)
    plans = [(Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-1, 1))).normalized(), rnd.uniform(0.2, 0.42) * taille) for _ in range(9)]
    for v in bm.verts:
        p = v.co.copy()
        for nrm, d in plans:
            k = p.dot(nrm)
            if k > d: p -= nrm * (k - d)
        v.co = p
    bm.verts.ensure_lookup_table()
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    o = link(bpy.data.objects.new(name, me))
    s = o.modifiers.new('sub', 'SUBSURF'); s.levels = s.render_levels = 2
    t = bpy.data.textures.new(name + '-t', 'CLOUDS'); t.noise_scale = 0.01
    d = o.modifiers.new('d', 'DISPLACE'); d.texture = t; d.strength = taille * 0.04; d.texture_coords = 'GLOBAL'
    for p in me.polygons: p.use_smooth = True
    return o

def depuis_pivot(theta_deg, cote, R):
    """Matrice d'un verre penché de theta autour de l'axe Y, posé sur le bord de son pied (cote = +1 : il penche vers +X
    et repose sur son bord droit ; -1 : vers -X, sur son bord gauche). Le pivot est à l'origine."""
    return Matrix.Rotation(math.radians(theta_deg) * cote, 4, 'Y') @ Matrix.Translation((-cote * R, 0, 0))

def plan_local(M, Z):
    """Hauteur locale (dans le repère du verre M) d'un plan horizontal z = Z du monde : fonction (x, y) -> z local."""
    Mi = M.inverted(); o = Mi @ Vector((0, 0, Z)); n = (Mi.to_3x3() @ Vector((0, 0, 1)))
    # plan : n . (p - o) = 0  ->  z = o.z - (n.x (x - o.x) + n.y (y - o.y)) / n.z
    return lambda x, y: o.z - (n.x * (x - o.x) + n.y * (y - o.y)) / n.z
