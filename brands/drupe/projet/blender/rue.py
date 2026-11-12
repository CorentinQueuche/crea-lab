# La rue de Drupe : la boutique d'angle (façade A dans le plan y = 0, tournée vers -Y ; façade B dans le plan x = 0, tournée
# vers -X), son trottoir, la chaussée et les immeubles voisins. Partagée par la scène 18 (la devanture) et la scène 20
# (la colonne d'affichage), pour que les deux images montrent le même coin de rue.
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drupe import *
import numpy as np

def soleil_du_ciel(fichier):
    """Direction du soleil d'un ciel Poly Haven, pour rot_z = 0 : (azimut, hauteur) en degrés, même convention que drupe.soleil.
    Évite de chercher l'orientation du ciel à tâtons : on lit le point le plus lumineux de l'image."""
    im = bpy.data.images.load(fichier, check_existing=True); w, h = im.size
    px = np.empty(w * h * 4, dtype=np.float32); im.pixels.foreach_get(px)
    lum = px.reshape(h, w, 4)[:, :, :3].sum(axis=2)
    r, c = np.unravel_index(int(np.argmax(lum)), lum.shape)
    phi = ((c + 0.5) / w - 0.5) * 2 * math.pi; el = ((r + 0.5) / h - 0.5) * math.pi
    d = Vector((-math.cos(el) * math.cos(phi), math.cos(el) * math.sin(phi), math.sin(el)))
    return math.degrees(math.atan2(d.y, d.x)) % 360, math.degrees(el)

def ciel(az_voulu=229.0, force=1.0, nom='qwantani_morning_puresky'):
    """Ciel de jour tourné pour que son soleil vienne de l'azimut voulu. Renvoie (azimut, hauteur) du soleil dans la scène.
    Essayé pour la devanture puis écarté : le soleil bas de ce ciel est orange et jaunit le Café vert et la Cerise.
    Gardé comme option (--ciel=hdri)."""
    f = os.path.join(TEX, 'hdri', nom + '_2k.hdr')
    az0, el = soleil_du_ciel(f)
    rot = opt('rot', az_voulu - az0)
    world_hdri(f, strength=force, rot_z=math.radians(rot))
    print('CIEL soleil az0=%.1f el=%.1f rot=%.1f' % (az0, el, rot))
    return az0 + rot, el

def ciel_uni(fond='#CFE2EE', lumiere='#E6EEF6', force=0.6):
    """Ciel uni : la caméra voit un bleu pâle, la scène reçoit une lumière d'ambiance presque blanche.
    Avec drupe.soleil() par-dessus, les couleurs de marque restent justes et le soleil se règle au degré près."""
    nt = bpy.context.scene.world.node_tree
    bg = next(n for n in nt.nodes if n.type == 'BACKGROUND'); out = next(n for n in nt.nodes if n.type == 'OUTPUT_WORLD')
    bg.inputs[0].default_value = hex_rgb(lumiere); bg.inputs[1].default_value = force
    bg2 = nt.nodes.new('ShaderNodeBackground'); bg2.inputs[0].default_value = hex_rgb(fond); bg2.inputs[1].default_value = 1.0
    lp = nt.nodes.new('ShaderNodeLightPath'); mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(lp.outputs['Is Camera Ray'], mix.inputs[0]); nt.links.new(bg.outputs[0], mix.inputs[1]); nt.links.new(bg2.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0])

def lumiere_de_rue(az=226.0, el=32.0):
    """Lumière des deux scènes de rue. Renvoie (azimut, hauteur) du soleil."""
    if opt('ciel', 'uni') == 'hdri': return ciel(opt('az', az), force=opt('force', 0.4))
    az, el = opt('az', az), opt('el', el)
    ciel_uni(force=opt('force', 0.6)); soleil(az, el, force=opt('soleil', 3.0), angle=0.6, couleur='#FFF5E8')
    return az, el

def mur(name, x0, x1, y0, y1, z0, z1, mat):
    return box(name, x1 - x0, y1 - y0, z1 - z0, ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), mat=mat)

def construire_rue(interieur=True):
    T = 0.3
    M = {}
    M['crepi'] = mat_papier('crepi', C['parche'], rough=0.9, bump=0.6, echelle=90)
    M['pied'] = mat_papier('pied', '#DDD3C0', rough=0.9, bump=0.5, echelle=60)
    M['fleur'] = mat_pbr('peint-fleur', C['fleur'], rough=0.6)
    M['feuille'] = mat_pbr('peint-feuille', C['feuille'], rough=0.38, coat=0.3)
    M['cerise'] = mat_pbr('laque-cerise', C['cerise'], rough=0.28, coat=0.5)
    M['vert'] = mat_pbr('peint-vert', C['vert'], rough=0.6)
    M['toile'] = mat_papier('toile', C['vert'], rough=0.95, bump=0.5, echelle=1400)
    M['vitre'] = mat_vitre('vitre')
    M['voisin'] = mat_papier('voisin', '#F8F3EA', rough=0.9, bump=0.5, echelle=60)
    M['voisin2'] = mat_papier('voisin2', '#F2DDD6', rough=0.9, bump=0.5, echelle=60)
    crepi, feuille_, fleur = M['crepi'], M['feuille'], M['fleur']

    # Sol : trottoir, bordure, chaussée
    plane('trottoir', 43, 53, (18.9, 23.9, 0), mat=mat_bois('trottoir', 'concrete_pavement', scale=22, clair=1.45, sat=0.45))
    mur('bordure', -2.75, 40.4, -2.75, 50.4, -0.16, -0.004, mat_pbr('bordure', '#bdb6aa', rough=0.8))
    plane('chaussee', 300, 300, (0, 0, -0.15), mat=mat_papier('chaussee', '#55514d', rough=0.8, bump=0.8, echelle=40))
    mur('trottoir-en-face', -24, -8.6, -30, 80, -0.16, 0.0, mat_pbr('trottoir2', '#cfc8bc', rough=0.85))

    # Façade A (y de 0 à T)
    mur('A-angle', 0, 0.5, 0, 0.5, 0, 3.6, crepi)
    mur('A-trumeau', 1.5, 1.8, 0, T, 0, 2.6, crepi)
    mur('A-allege', 1.8, 4.6, 0.04, T, 0, 0.6, feuille_)
    mur('A-linteau', 0.5, 4.6, 0, T, 2.6, 3.6, crepi)
    mur('A-mur', 4.6, 14, 0, T, 0, 3.6, crepi)
    mur('A-etage', 0, 14, 0, T, 3.6, 8.2, crepi)
    mur('A-pied', 4.6, 14, -0.025, 0, 0, 0.55, M['pied'])
    # Façade B (x de 0 à T)
    mur('B-allege', 0.04, T, 0.5, 3.3, 0, 0.6, feuille_)
    mur('B-linteau', 0, T, 0.5, 3.3, 2.6, 3.6, crepi)
    mur('B-mur', 0, T, 3.3, 12, 0, 3.6, crepi)
    mur('B-etage', 0, T, T, 12, 3.6, 8.2, crepi)
    mur('B-pied', -0.025, 0, 3.3, 12, 0, 0.55, M['pied'])
    mur('corniche-A', -0.09, 14, -0.09, 0, 3.6, 3.75, fleur)
    mur('corniche-B', -0.09, 0, 0, 12, 3.6, 3.75, fleur)
    mur('toit', 0, 14, 0, 12, 8.2, 8.4, fleur)
    # Voisins
    mur('voisin-A', 14, 40, 0, 10, 0, 9.4, M['voisin'])
    mur('voisin-B', 0, 10, 12, 30, 0, 7.2, M['voisin2'])
    mur('voisin-B2', 0, 10, 30, 50, 0, 9.0, M['voisin'])
    mur('en-face-B', -24, -9.4, -4, 26, 0, 8.6, M['voisin'])
    mur('en-face-B2', -24, -9.4, 26, 70, 0, 7.4, M['voisin2'])

    # Bandeaux de devanture, lettres découpées, descripteur
    mur('bandeau-A', 0.55, 4.55, -0.03, 0, 2.74, 3.44, fleur)
    mur('bandeau-B', -0.03, 0, 0.55, 3.25, 2.74, 3.44, fleur)
    logo('lettres', height=0.36, extrude=0.05, mat=M['cerise'], loc=(2.55, -0.058, 2.91))
    t = text('descripteur', 'Torréfacteur de quartier', 0.15, font='Medium', mat=M['cerise'], extrude=0.008, align='CENTER')
    poser(t, (0, -1, 0), (0, 0, 1), (-0.04, 1.9, 3.04))

    # Vitrines : cadres Feuille, vitre, vitrophanie au semis
    def cadre_A(x0, x1, z0, z1, e=0.08):
        mur(f'cA{x0}g', x0, x0 + e, 0.05, 0.19, z0, z1, feuille_); mur(f'cA{x0}d', x1 - e, x1, 0.05, 0.19, z0, z1, feuille_)
        mur(f'cA{x0}b', x0, x1, 0.05, 0.19, z0, z0 + e, feuille_); mur(f'cA{x0}h', x0, x1, 0.05, 0.19, z1 - e, z1, feuille_)
    cadre_A(1.8, 4.6, 0.6, 2.6)
    plane('vitre-A', 2.64, 1.84, (3.2, 0.12, 1.6), (math.radians(90), 0, 0), mat=M['vitre'])
    plane('vitro-A', 2.6, 1.8, (3.2, 0.112, 1.6), (math.radians(90), 0, 0), mat=mat_decal('vitro', art('vitro')))
    for nom, a, b in (('g', 0.5, 0.58), ('d', 3.22, 3.3)): mur('cB' + nom, 0.05, 0.19, a, b, 0.6, 2.6, feuille_)
    for nom, a, b in (('b', 0.6, 0.68), ('h', 2.52, 2.6)): mur('cB' + nom, 0.05, 0.19, 0.5, 3.3, a, b, feuille_)
    poser(plane('vitre-B', 2.64, 1.84, mat=M['vitre']), (0, -1, 0), (0, 0, 1), (0.12, 1.9, 1.6))
    poser(plane('vitro-B', 2.6, 1.8, mat=mat_decal('vitroB', art('vitro'))), (0, -1, 0), (0, 0, 1), (0.112, 1.9, 1.6))

    # Porte vitrée
    mur('porte-g', 0.5, 0.57, 0.05, 0.17, 0, 2.6, feuille_); mur('porte-d', 1.43, 1.5, 0.05, 0.17, 0, 2.6, feuille_)
    mur('porte-b', 0.57, 1.43, 0.07, 0.15, 0.03, 0.26, feuille_); mur('porte-h', 0.57, 1.43, 0.05, 0.17, 2.52, 2.6, feuille_)
    mur('porte-t', 0.57, 1.43, 0.07, 0.15, 2.18, 2.25, feuille_)
    mur('seuil', 0.5, 1.5, -0.04, T, 0, 0.03, mat_pbr('seuil', '#cfc8bc', rough=0.7))
    plane('vitre-porte', 0.86, 2.3, (1.0, 0.11, 1.4), (math.radians(90), 0, 0), mat=M['vitre'])
    plane('vitro-porte', 0.84, 1.96, (1.0, 0.102, 1.22), (math.radians(90), 0, 0), mat=mat_decal('porte', art('porte')))
    tube('poignee', [(1.36, 0.04, 0.95), (1.36, 0.03, 1.15), (1.36, 0.04, 1.35)], 0.012, mat=mat_pbr('laiton', '#b79a63', rough=0.3, metal=1.0))

    # Store banne Café vert au-dessus de la vitrine A, lambrequin
    ang = math.atan2(0.42, 1.1); Ls = math.hypot(0.42, 1.1)
    box('store', 3.0, Ls, 0.02, (3.2, -0.55, 2.43), (ang, 0, 0), mat=M['toile'])
    mur('lambrequin', 1.7, 4.7, -1.105, -1.095, 2.02, 2.22, M['toile'])
    for x in (1.72, 4.68):
        tube(f'bras{x}', [(x, -0.02, 2.2), (x, -1.08, 2.2)], 0.012, mat=feuille_)

    # Enseigne drapeau ronde, à l'angle, sur la façade B
    Cz = Vector((-0.66, 3.80, 3.12)); R = 0.33
    cyl('enseigne', R, 0.07, tuple(Cz), (math.radians(90), 0, 0), mat=M['cerise'])
    cyl('enseigne-jonc', R + 0.012, 0.03, tuple(Cz), (math.radians(90), 0, 0), mat=feuille_)
    H = 0.46
    for sgn in (-1, 1):
        o = logo('enseigne-symbole%d' % sgn, height=H, extrude=0.006, mat=fleur, part='symbole')
        orient(o, (-sgn, 0, 0), (0, 0, 1), (Cz.x, Cz.y + sgn * 0.038, Cz.z - H * 0.465))
    mur('potence', -1.04, 0.0, 3.785, 3.815, 3.56, 3.59, feuille_)
    mur('tige1', -0.675, -0.645, 3.79, 3.81, 3.45, 3.56, feuille_)
    mur('platine', -0.012, 0.0, 3.72, 3.88, 3.46, 3.68, feuille_)

    # Plaque de rue
    mur('plaque', 0.42, 1.52, -0.012, 0, 4.02, 4.3, feuille_)
    t2 = text('plaque-texte', 'RUE DU TAMBOUR', 0.085, font='Medium', mat=fleur, extrude=0.001, align='CENTER', spacing=1.12, loc=(0.97, -0.014, 4.13), rot=(math.radians(90), 0, 0))

    # Fenêtres de l'étage, volets Café vert
    sombre = mat_pbr('vitre-etage', '#2c3a3a', rough=0.05, metal=0.9)
    for i, xc in enumerate((1.7, 4.3, 7.2, 10.1)):
        mur(f'fa{i}', xc - 0.6, xc + 0.6, -0.02, 0, 4.55, 6.55, fleur)
        plane(f'fav{i}', 1.04, 1.84, (xc, -0.022, 5.55), (math.radians(90), 0, 0), mat=sombre)
        mur(f'fam{i}', xc - 0.02, xc + 0.02, -0.03, -0.02, 4.63, 6.47, fleur)
        for s in (-1, 1): mur(f'vo{i}{s}', xc + s * 0.62, xc + s * 1.16, -0.045, 0, 4.57, 6.53, M['vert']) if s > 0 else mur(f'vo{i}{s}', xc - 1.16, xc - 0.62, -0.045, 0, 4.57, 6.53, M['vert'])
    for i, yc in enumerate((1.9, 5.4, 8.9)):
        mur(f'fb{i}', -0.02, 0, yc - 0.6, yc + 0.6, 4.55, 6.55, fleur)
        poser(plane(f'fbv{i}', 1.04, 1.84, mat=sombre), (0, -1, 0), (0, 0, 1), (-0.022, yc, 5.55))
        mur(f'vb{i}a', -0.045, 0, yc - 1.16, yc - 0.62, 4.57, 6.53, M['vert']); mur(f'vb{i}b', -0.045, 0, yc + 0.62, yc + 1.16, 4.57, 6.53, M['vert'])

    # Chevalet de trottoir
    P0 = Vector((1.62, -1.55, 0)); yaw = math.radians(-24)
    xa = Vector((math.cos(yaw), math.sin(yaw), 0)); back = Vector((-math.sin(yaw), math.cos(yaw), 0))
    incl = math.radians(13)
    ya = (Vector((0, 0, 1)) * math.cos(incl) + back * math.sin(incl)).normalized(); na = xa.cross(ya)
    cadre = mat_pbr('chevalet-bois', '#d8c09a', rough=0.55)
    poser(box('chevalet-av', 0.66, 1.02, 0.03, mat=cadre), xa, ya, P0 + ya * 0.51 - na * 0.016)
    poser(plane('chevalet', 0.6, 0.9, mat=mat_image('chevalet', art('chevalet'), rough=0.6)), xa, ya, P0 + ya * 0.54 + na * 0.0006)
    yb = (Vector((0, 0, 1)) * math.cos(incl) - back * math.sin(incl)).normalized()
    poser(box('chevalet-ar', 0.66, 1.02, 0.03, mat=cadre), xa, yb, P0 + back * (2 * 1.02 * math.sin(incl)) + yb * 0.51)

    # Un caféier en pot près de la vitrine
    pot = Vector((5.05, -0.42, 0))
    tour('pot', [(0, 0), (0.17, 0), (0.2, 0.03), (0.24, 0.42), (0.25, 0.45), (0.225, 0.45), (0.215, 0.4), (0, 0.4)], mat=mat_gres('pot', C['fleur'], mouchete=0.3), loc=tuple(pot), vif=60)
    rnd = random.Random(12)
    for i in range(6):
        a = i * 1.05 + rnd.uniform(-.3, .3); k = rnd.uniform(0.12, 0.3)
        rameau(f'cafeier{i}', pot + Vector((0.05 * math.cos(a), 0.05 * math.sin(a), 0.38)), (k * math.cos(a), k * math.sin(a), 1), n=rnd.choice((4, 5)), L=0.2, pas=0.15, seed=20 + i, tige=0.008)

    if interieur:
        plane('sol-int', 6, 6, (3.3, 3.3, 0.02), mat=mat_bois('parquet', scale=3))
        plane('mur-fond', 6, 3.4, (3.3, 6.2, 1.7), (math.radians(90), 0, 0), mat=mat_pbr('mur-pulpe', C['pulpe'], rough=0.8))
        poser(plane('mur-cote', 6, 3.4, mat=mat_pbr('mur-int', C['fleur'], rough=0.8)), (0, 1, 0), (0, 0, 1), (6.2, 3.3, 1.7))
        plane('plafond', 6, 6, (3.3, 3.3, 3.4), (math.radians(180), 0, 0), mat=mat_pbr('plafond', C['fleur'], rough=0.8))
        box('comptoir', 2.8, 0.7, 0.92, (3.3, 2.9, 0.48), mat=mat_pbr('comptoir', '#d8c09a', rough=0.5))
        box('comptoir-plateau', 2.9, 0.78, 0.04, (3.3, 2.9, 0.96), mat=fleur)
        plane('ardoise', 1.6, 0.9, (3.3, 6.17, 2.1), (math.radians(90), 0, 0), mat=mat_screen('ardoise', art('ardoise'), 1.6, gloss=0.02))
        box('etagere', 2.4, 0.22, 0.03, (3.3, 6.05, 1.35), mat=mat_pbr('etagere', '#d8c09a', rough=0.5))
        for i in range(9):
            box(f'sac{i}', 0.105, 0.06, 0.19, (2.35 + i * 0.235, 6.03, 1.46), (0, 0, rnd.uniform(-.2, .2)), mat=mat_papier(f'sacp{i}', C['parche']))
            cyl(f'sacpast{i}', 0.026, 0.002, (2.35 + i * 0.235, 5.998, 1.51), (math.radians(90), 0, 0), mat=mat_pbr(f'sacd{i}', (C['cerise'], C['vert'], C['pulpe'])[i % 3], rough=0.5), seg=32)
        abat = mat_pbr('abat', C['cerise'], rough=0.3, coat=0.4)
        for i, x in enumerate((2.5, 3.3, 4.1)):
            tour(f'suspension{i}', [(0.02, 0.22), (0.05, 0.2), (0.17, 0.0), (0.165, 0.0), (0.045, 0.19), (0.02, 0.2)], mat=abat, loc=(x, 2.9, 2.15), seg=48)
            cyl(f'fil{i}', 0.004, 1.05, (x, 2.9, 2.88), mat=feuille_, seg=8)
            o = bpy.data.objects.new(f'amp{i}', bpy.data.lights.new(f'amp{i}', 'POINT')); o.data.energy = 60; o.data.color = (1, 0.86, 0.7); o.data.shadow_soft_size = 0.05
            link(o); o.location = (x, 2.9, 2.12)
        area('plafonnier', (3.3, 3.0, 3.3), (3.3, 3.0, 0), 420, size=3.5, color=(1, 0.93, 0.84))
    return M
