# Planche 26 : le site sur un ordinateur portable suspendu. Reprise de photos/origine-portable.jpg, en plus tendu :
# le portable (14 pouces, 312 × 221 mm, écran 16:10 de 300 × 187,5 mm) bascule vers l'avant de 28°, porté par deux
# sangles orange de 25 mm passées sous sa base, qui filent vers les angles hauts du cadre ; deux cordes le retiennent
# vers les angles bas. Les six lignes dessinent un X dont il est le centre. Fond : mur noir d'atelier, ton sur ton.
# L'écran reste vertical et la caméra horizontale (cadre décalé par shift_x et shift_y) : l'écran est un rectangle
# aligné dans l'image, une vidéo s'y incruste avec tools/incruster.py. Aucune sangle ne passe devant l'écran.
# Texture d'écran : out/art/3d2-ecran-portable.png (art/3d2-ecran-portable.html). Fond : out/art/3d2-fond.png.
# Écrit out/final/26-portable.json : les quatre coins de l'écran dans l'image de 2800 × 1575 (clé « ecran », lue par
# incruster.py), les mêmes pour un décor de 1920 × 1080 (clé « ecran_1920 ») ; et out/blender/26-portable-decor.json,
# le fichier de coins du décor de 1920 × 1080 (clé « ecran »), à donner tel quel à incruster.py.
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s26_portable.py -- --draft
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from custom3d2 import *

sc = reset(2800, 1575, samples=380)
world_color(hex_rgb(K['noir']), 0.03)

# ---------- Le portable : écran vertical, base qui plonge vers la caméra ----------
ALPHA = opt('alpha', 28.0)
ecran_m = mat_ecran_lum('ecran', art('3d2-ecran-portable'), cam=1.0, diffus=opt('jet', 2.2), gloss=0.03, rough=0.06)
rep, ecran, pivot = portable('portable', ecran_m, ouverture=90 + ALPHA, loc=(0, 0, 0), coque=opt('coque', '#2B2B2E'), pont=opt('pont', '#77787C'))
rep.rotation_euler = (R(ALPHA), 0, 0); bpy.context.view_layer.update()
M = rep.matrix_world.copy(); M3 = M.to_3x3()
SC = ecran.matrix_world.translation.copy()                       # centre de l'écran
pb = next(n for n in bpy.data.materials['portable-pont'].node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
pb.inputs['Metallic'].default_value = opt('pmetal', 0.35); pb.inputs['Roughness'].default_value = 0.5      # un pont clair et mat : il se lit dans le noir, et ne renvoie de l'écran qu'une lueur
print('ECRAN centre', tuple(round(v, 4) for v in SC))

# ---------- La caméra : droite, décalée à droite et au-dessus ; le cadre est ramené sur le portable ----------
D = opt('dist', 1.95); LENS = opt('lens', 85.0)
T = Vector((opt('vx', 0.0), SC.y, SC.z + opt('vz', -0.085)))       # le point au centre de l'image
CP = Vector((opt('camx', 0.6), SC.y - D, SC.z + opt('camz', 0.36)))
cam = camera(tuple(CP), (CP.x, SC.y, CP.z), lens=LENS, dof=D, fstop=opt('f', 5.6))
droit(cam, shift_x=(T.x - CP.x) / D * LENS / 36, shift_y=(T.z - CP.z) / D * LENS / 36)

# ---------- Les sangles : deux élingues sous la base, qui montent vers les angles hauts ----------
LS = 0.025
sangle = mat_sangle('sangle', K['orange'], cols=7, pas_fil=0.12, rough=0.7, relief=1.0, lueur=opt('lueur', 0.09), spec=0.04)
W = M3 @ Vector((0, 1, 0))                                        # la largeur des sangles reste parallèle au flanc de la base
HX = 0.156 + 0.0016                                               # demi-largeur de la base, plus l'épaisseur de sangle
def elingue(name, ys, ancre_g, ancre_d, part=0.8, de=0.16, a=0.6):
    """Une sangle passée sous la base à la cote ys (repère du portable), tendue vers deux ancrages hors champ.
    Sortie de sous la base, elle vrille pour présenter son plat à la caméra (part : 1 = de face)."""
    dessous = [M @ Vector((x, ys, -0.0010)) for x in (-HX, HX)]
    for cote, (p0, p1, anc) in enumerate(((dessous[1], dessous[0], ancre_g), (dessous[0], dessous[1], ancre_d))):
        milieu = (p0 + p1) / 2
        pts = arrondir([milieu, p1, Vector(anc)], 0.006, n=10)
        ruban(f'{name}-{cote}', pts, LS, ep=0.0014, mat=sangle, lisse=False, travers=W * (1 if cote else -1), vers=CP, vers_part=part, vrille_de=de, vrille_a=a, pas=0.003)
        yield list(ruban.reperes)

YA = opt('ya', 0.066); YB = opt('yb', -0.082)
ZH = SC.z + opt('zh', 0.86); XH = opt('xh', 1.05)
# Les deux sangles d'un même côté restent parallèles : l'ancrage de l'avant est celui de l'arrière, décalé comme leurs départs
DEC = M3 @ Vector((0, YB - YA, 0))
RA = list(elingue('sangle-a', YA, (-XH, opt('pya', 0.34), ZH), (XH, opt('pya', 0.34), ZH), part=opt('parta', 0.72)))
RB = list(elingue('sangle-b', YB, (-XH + DEC.x, opt('pya', 0.34) + DEC.y, ZH + DEC.z), (XH + DEC.x, opt('pya', 0.34) + DEC.y, ZH + DEC.z), part=opt('partb', 0.9), de=0.2, a=0.62))

# Une griffe tissée « Custom.fr » cousue sur la sangle avant, côté droit, là où elle se présente à plat
def griffe(name, reperes, s, image, l=0.044, h=0.018):
    p, t, nr, side, _ = reperes[int(s * (len(reperes) - 1))]
    y = side if t.cross(side).dot(CP - p) > 0 else -side          # la griffe du côté de la caméra, à l'endroit
    n = t.cross(y)
    g = plane(name, l, h, mat=mat_imprime(name, image, rough=0.7, bump=0.3, lueur=0.25, alpha=True, spec=0.2))
    orient(g, t, y, p + n * 0.0011)
    c = box(name + '-fond', l + 0.0006, h + 0.0006, 0.0005, mat=mat_pbr(name + '-fond', K['encre'], rough=0.8)); orient(c, t, y, p + n * 0.0008)
    return g
griffe('griffe', RB[1], opt('sg', 0.3), art('3d2-griffe'))

# ---------- Les cordes : deux haubans vers les angles bas, noués aux élingues ----------
corde = mat_fluo('corde', K['orange'], lueur=opt('lueur', 0.09), rough=0.7, spec=0.04)
noir = mat_pbr('noir', '#0B0B0D', rough=0.4)
ZB = SC.z - opt('zb', 0.62); XB = opt('xb', 0.95)
for s in (-1, 1):
    dep = M @ Vector((s * (HX + 0.004), YB, 0.002))
    anc = Vector((s * XB, opt('pyc', -0.25), ZB))
    tube(f'corde{s}', [tuple(dep), tuple(dep.lerp(anc, 0.5)), tuple(anc)], 0.0028, mat=corde)
    d = (anc - dep).normalized()
    q = cyl(f'serre{s}', 0.0062, 0.016, mat=noir, seg=24, bevel=0.001); q.matrix_world = Matrix.Translation(dep + d * 0.03) @ d.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    # la boucle autour de la sangle
    tube(f'boucle{s}', [tuple(dep + d * 0.022), tuple(dep + W * 0.016 + d * 0.004), tuple(dep - d * 0.006), tuple(dep - W * 0.016 + d * 0.004), tuple(dep + d * 0.022)], 0.0026, mat=corde)

# ---------- Le fond : un mur noir, texture ton sur ton, dans l'axe du cadre ----------
DM = opt('mur', 1.25)
centre_mur = CP + (T - CP) * ((D + DM) / D)
plane('mur', 3.2, 1.8, (centre_mur.x, SC.y + DM, centre_mur.z), (R(90), 0, 0), mat=mat_imprime('mur', art('3d2-fond'), rough=0.82, bump=0.25, spec=0.3))
plane('mur-large', 14, 9, (centre_mur.x, SC.y + DM + 0.004, centre_mur.z), (R(90), 0, 0), mat=mat_pbr('mur-large', '#111113', rough=0.85))

# ---------- La lumière ----------
# Un projecteur haut, à gauche : il dessine la base, le clavier et les sangles, et porte leurs ombres sur le mur
spot('cle', (-1.25, SC.y - 1.45, SC.z + 1.25), (0.05, SC.y, SC.z - 0.08), opt('cle', 215.0), angle=46, blend=0.7, color=(1.0, 0.98, 0.95), radius=opt('rcle', 0.07))
# Une nappe basse sur le mur, qui ne touche ni le portable ni les sangles : la texture du fond se lit, sans s'éclaircir
n = spot('nappe', (centre_mur.x - 0.9, SC.y + DM - 0.5, centre_mur.z - 1.0), (centre_mur.x + 0.1, SC.y + DM, centre_mur.z + 0.05), opt('nappe', 26.0), angle=95, blend=1.0, radius=0.25)
# Un contre-jour froid à droite : le liseré du capot et le fil des sangles
k = area('contre', (1.25, SC.y + 0.75, SC.z + 0.5), (0, SC.y, SC.z - 0.05), opt('contre', 60.0), size=0.6, color=(0.8, 0.86, 1.0))
# Un appoint de face, très faible, pour que les sangles gardent leur orange dans l'ombre
area('face', (0.5, SC.y - 1.6, SC.z - 0.5), (0, SC.y, SC.z), opt('face', 22.0), size=1.2)

# ---------- Les coins de l'écran, pour l'incrustation ----------
c = cam_rect(ecran)                                               # bas-gauche, bas-droit, haut-droit, haut-gauche
k19 = 1920 / 2800
info = {'ecran': c, 'w': 2800, 'h': 1575, 'ordre': ['bas-gauche', 'bas-droit', 'haut-droit', 'haut-gauche'],
        'ecran_1920': [[round(x * k19, 2), round(y * k19, 2)] for x, y in c], 'w_1920': 1920, 'h_1920': 1080,
        'image': 'out/final/26-portable.png', 'texture': 'out/art/3d2-ecran-portable.png', 'proportion_ecran': '16:10 (1440 x 900)'}
os.makedirs(os.path.join(ROOT, 'out', 'final'), exist_ok=True)
with open(os.path.join(ROOT, 'out', 'final', '26-portable.json'), 'w', encoding='utf-8') as f: json.dump(info, f, indent=1)
# Le même rectangle pour le décor de 1920 × 1080 (out/blender/26-portable-decor.png, le rendu brut réduit, sans halo :
#   python tools/post.py out/blender/26-portable.png out/blender/26-portable-decor.png --bloom 0 --vignette 0.05 --w 1920)
with open(os.path.join(OUT, '26-portable-decor.json'), 'w', encoding='utf-8') as f:
    json.dump({'ecran': info['ecran_1920'], 'w': 1920, 'h': 1080, 'ordre': info['ordre'], 'image': 'out/blender/26-portable-decor.png', 'texture': info['texture']}, f, indent=1)
print('RECT', c, '| aligné :', max(abs(c[0][1] - c[1][1]), abs(c[2][1] - c[3][1]), abs(c[0][0] - c[3][0]), abs(c[1][0] - c[2][0])) < 1.5)
render('26-portable.png')
