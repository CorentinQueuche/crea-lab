# Planche 39 : la papeterie, sur le tapis de coupe de l'atelier (900 × 600 mm, quadrillé au centimètre, lignes à 13,3°).
# Cartes de visite 85 × 55 mm au motif de blocs (recto blanc, verso fluo, comme les cartes d'origine) en pile et éparpillées,
# chemise à rabats 220 × 310 mm doublée du motif, papier à en-tête qui dépasse, enveloppe 220 × 110 mm à patte doublée,
# carnet A5 à élastique fluo, nuancier de fils 62 × 160 mm (cinq teintes de la charte, bobinées en vrais fils).
# Visuels : art/3d1-papeterie.html (bash art/3d1-rendre.sh papeterie). Noms fictifs, seul custom.fr est cité.
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s39_papeterie.py -- --draft
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from custom3d1 import *

DRAFT = '--draft' in argv()
reset(2800, 1575, samples=int(opt('samples', 380)))
world_color((0, 0, 0, 1), 0.0)

# ---------- l'établi et le tapis de coupe
plane('etabli', 3, 3, (0, 0, -0.003), mat=mat_teinte('etabli', '#0B0B0C', rough=0.55, bump=0.3, echelle=300))
TX, TY = 0.02, 0.06
rrect('tapis-corps', 0.9, 0.6, 0.012, 0.003, mat=mat_teinte('tapis-c', '#101012', rough=0.6), loc=(TX, TY, -0.0015))
tapis = mat_print('tapis', art('tapis'), rough=opt('tapis', 0.5), bump=0.5, fluo=0.0)
plane('tapis', 0.9, 0.6, (TX, TY, 0.00005), mat=tapis)

# ---------- la chemise à rabats : dos (intérieur au motif), lettre qui dépasse, couverture posée un peu de travers
CX, CY, CR = opt('chx', -0.118), opt('chy', 0.150), R(opt('chr', -13.0))
def sur(cx, cy, cr, dx, dy):
    return (cx + dx * math.cos(cr) - dy * math.sin(cr), cy + dx * math.sin(cr) + dy * math.cos(cr))
noir_t = mat_teinte('tranche-noire', '#0A0A0B', rough=0.7)
feuille('chemise-dos', 0.22, 0.31, art('chemise-int'), (CX, CY, 0), CR, ep=0.0005, tranche=noir_t, rough=0.5, fluo=opt('lueur', 0.10))
lx, ly = sur(CX, CY, CR, 0.034, -0.020)
feuille('lettre', 0.21, 0.297, art('lettre'), (lx, ly, 0.0006), CR + R(3.5), ep=0.00012, rough=0.6)
kx, ky = sur(CX, CY, CR, -0.003, 0.006)
feuille('chemise', 0.22, 0.31, art('chemise'), (kx, ky, 0.0009), CR - R(1.1), ep=0.0005, tranche=noir_t, rough=0.42, coat=0.12, fluo=opt('lueur', 0.10))

# ---------- l'enveloppe, dos vers le haut, patte ouverte doublée du motif
EX, EY, ER = opt('ex', 0.205), opt('ey', 0.160), R(opt('er', 15.0))
feuille('enveloppe', 0.22, 0.11, art('enveloppe-dos'), (EX, EY, 0), ER, ep=0.0009, rough=0.62)
px, py = sur(EX, EY, ER, 0, 0.055 + 0.029)
pat = feuille('patte', 0.22, 0.058, art('enveloppe-rabat'), (px, py, 0.0011), ER, ep=0.00016, rough=0.55, fluo=opt('lueur', 0.10), tilt=(R(5.0), 0))

# ---------- le carnet d'atelier : couverture toilée, bloc de pages, élastique fluo, signet orange
NX, NY, NR = opt('cnx', 0.243), opt('cny', -0.100), R(opt('cnr', -15.0))
objs = [box('carnet-dos', 0.148, 0.21, 0.0018, (0, 0, 0.0009), mat=noir_t, bevel=0.0006),
        box('carnet-pages', 0.143, 0.204, 0.0115, (0.001, 0, 0.0018 + 0.00575), mat=mat_tranche('pages', '#EDEDEA', 0.00012)),
        box('carnet-couv', 0.148, 0.21, 0.0018, (0, 0, 0.0133 + 0.0009), mat=noir_t, bevel=0.0006),
        plane('carnet-face', 0.146, 0.208, (0, 0, 0.0151 + 0.00006), mat=mat_print('carnet', art('carnet'), rough=0.6, bump=0.9, coat=0.0, fluo=opt('lueur', 0.10))),
        box('elastique', 0.007, 0.2112, 0.0161, (0.052, 0, 0.0081), mat=mat_teinte('elastique', C['fluo'], rough=0.7, lueur=0.2, bump=0.8, echelle=2500)),
        plane('signet', 0.005, 0.05, (-0.02, -0.122, 0.0004), mat=mat_teinte('signet', C['orange'], rough=0.45))]
groupe('carnet', objs, loc=(NX, NY, 0), rot=(0, 0, NR))

# ---------- les cartes de visite : la pile (verso fluo dessus) et les cartes éparpillées
PX, PY, PR = opt('px', 0.070), opt('py', -0.018), R(opt('pr', 9.0))
N = 46; EP = 0.00038
pile('pile', 0.085, 0.055, N, art('carte-verso'), (PX, PY, 0), PR, ep=EP, seed=3, fluo=opt('lueur', 0.10))
HP = N * EP
cartes = [  # (image, dos, dx, dy depuis la pile, z, rotation, inclinaison x, y)
    ('carte-recto-a', 'carte-verso', 0.108, 0.030, 0.0, -13, 0, 0),
    ('carte-verso', 'carte-recto-a', 0.045, -0.074, 0.0, 21, 0, 0),
    ('carte-recto-b', 'carte-verso', 0.094, -0.040, 0.0006, 6, 0.5, 0),
    ('carte-verso', 'carte-recto-b', -0.140, 0.048, 0.0016, -29, 0, 0),
    ('carte-recto-a', 'carte-verso', -0.070, -0.032, 0.0009, 14, 0, 0),
    ('carte-recto-b', 'carte-verso', -0.020, 0.078, 0.0, -7, 0, 0),
    ('carte-verso', 'carte-recto-a', 0.016, 0.006, HP + 0.0001, 24, 0, 0),          # posée de travers sur la pile, en porte-à-faux
]
for i, (img, dos, dx, dy, z, rz, tx, ty) in enumerate(cartes):
    feuille(f'carte{i}', 0.085, 0.055, art(img), (PX + dx, PY + dy, z), R(rz), ep=EP, dos=art(dos), rough=0.58, fluo=opt('lueur', 0.10), tilt=(R(tx), R(ty)))

# ---------- le nuancier de fils : la carte, et cinq teintes bobinées en vrais fils
QX, QY, QR = opt('qx', -0.088), opt('qy', -0.116), R(opt('qr', 21.0))
QW, QH, QE = 0.062, 0.160, 0.0012
carte_n = [box('nuancier-corps', QW, QH, QE, (0, 0, QE / 2), mat=noir_t),
           plane('nuancier-face', QW, QH, (0, 0, QE + 0.00005), mat=mat_print('nuancier', art('nuancier'), rough=0.6, bump=0.3, fluo=opt('lueur', 0.10)))]
RN = 0.00016
for k, (nom, col, lue) in enumerate((('fluo', C['fluo'], 0.12), ('blanc', '#F4F4F2', 0.0), ('violet', C['violet'], 0.05), ('orange', C['orange'], 0.05), ('acier', C['acier'], 0.0))):
    y_haut = QH / 2 - (0.040 + k * 0.0232); rnd = random.Random(20 + k); lignes = []
    for couche in range(2):
        n = 44 - couche * 6
        for i in range(n):
            y0 = y_haut - 0.0006 - (0.0138 * (i + 0.5) / n) - couche * 0.0004 + rnd.uniform(-1, 1) * 0.00006
            pente = (0.0006 if couche == 0 else -0.0011) + rnd.uniform(-1, 1) * 0.0001
            z = QE + RN * (1.0 + couche * 1.7) + rnd.uniform(0, 1) * 0.00004
            lignes.append(lisser([(-QW / 2 - RN * 1.1, y0 - pente, QE * 0.2), (-QW / 2 - RN * 0.4, y0 - pente, z * 0.92), (-QW / 2 + 0.004, y0 - pente * 0.8, z),
                                  (0, y0, z + 0.00003), (QW / 2 - 0.004, y0 + pente * 0.8, z), (QW / 2 + RN * 0.4, y0 + pente, z * 0.92), (QW / 2 + RN * 1.1, y0 + pente, QE * 0.2)], 10))
    mf = mat_fil('fil-' + nom, col, rough=0.4, lueur=lue, spec=0.2, reflet='#A8AAB0' if nom == 'acier' else None)
    carte_n.append(fils('bobinage-' + nom, lignes, r=RN, mat=mf, brins=2, torsade=0.0008, seed=k, res=1 if DRAFT else 2, profil=(0.7, 0.32)))
groupe('nuancier', carte_n, loc=(QX, QY, 0), rot=(0, 0, QR))

# le papier imprimé est mat : on baisse son reflet, qui blanchit le fluo sous la lumière rasante (le tapis garde le sien)
for m in bpy.data.materials:
    if m.name != 'tapis' and m.node_tree and any(n.type == 'TEX_IMAGE' for n in m.node_tree.nodes):
        for n in m.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED': n.inputs['Specular IOR Level'].default_value = opt('spec', 0.25)

# ---------- lumière : une rasante froide venue de l'arrière gauche, découpée par deux volets (comme un store) ;
# un appoint chaud à droite ; une nappe douce au-dessus
SP = (-0.95, 0.85, opt('sz', 0.50))
spot('rasante', SP, (0.03, -0.02, 0.0), opt('key', 44.0), angle=36, blend=0.5, color=(0.92, 0.97, 1.0), radius=0.018)
volet('volet1', (-0.60, 0.52, 0.30), SP, l=0.07, h=0.9)
volet('volet2', (-0.50, 0.66, 0.30), SP, l=0.035, h=0.9)
area('chaud', (0.75, 0.10, 0.30), (0.10, -0.03, 0.0), opt('chaud', 7.0), size=0.5, size_y=0.18, color=(1.0, 0.82, 0.62))
area('nappe', (0.05, -0.25, 1.1), (0, 0, 0), opt('nappe', 7.0), size=1.2, color=(0.93, 0.97, 1.0))

cam = camera((opt('camx', 0.14), opt('camy', -0.62), opt('camz', 0.44)), (opt('tx', 0.03), opt('ty', -0.01), 0.0), lens=opt('lens', 60.0), dof=1.0, fstop=opt('f', 4.0))
net = Vector((PX + 0.02, PY - 0.01, HP))
cam.data.dof.focus_distance = (net - cam.location).length
rendre('39-papeterie.png')
