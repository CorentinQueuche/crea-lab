# Planche 19 (scène G) : la papeterie, posée sur du verre sombre, lumière rasante froide.
# Facture F-2026-010 et CRA d'octobre en A4 (210 × 297 mm), enveloppe de 220 × 110 mm, cartes de visite de 85 × 55 mm
# (recto Coffre et logotype Net, verso Net, tranche Net), capot de portable (312 × 221 mm) avec trois autocollants de 50 à 60 mm.
# Visuels : out/art/facture.png, cra.png, enveloppe.png, carte-recto.png, carte-verso.png, st-icone.png, st-rond.png, st-pilule.png.
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s19_papeterie.py -- --draft
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from decor import *

reset(2800, 1575, samples=420)
nuit(0.02)
plane('verre', 4, 4, (0, 0, 0), mat=mat_floor('verre', color='#070B09', rough=0.1, var=0.04, bump=0.004, scale=24.0))

def feuille(name, w, h, image, loc, rz=0.0, ep=0.0002, tranche='#E9ECEC', rough=0.55, bump=0.06, coat=0.0, lueur=0.0):
    """Feuille, carte ou enveloppe posée à plat : un corps mince et sa face imprimée. loc = centre, z = dessous."""
    box(name + '-corps', w, h, ep, (loc[0], loc[1], loc[2] + ep / 2), (0, 0, rz), mat=tranche if not isinstance(tranche, str) else mat_pbr(name + '-t', tranche, rough=0.6))
    return plane(name, w, h, (loc[0], loc[1], loc[2] + ep + 0.00005), (0, 0, rz), mat=mat_imprime(name + '-img', image, rough=rough, bump=bump, coat=coat, lueur=lueur))

def autocollant(name, w, h, image, loc, rz=0.0):
    m = mat_decal(name, image, rough=0.3)
    nt = m.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'); tex = next(n for n in nt.nodes if n.type == 'TEX_IMAGE')
    nt.links.new(tex.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = 0.3
    return plane(name, w, h, loc, (0, 0, rz), mat=m)

R = math.radians
# Les deux feuilles A4 : le CRA dessous, la facture dessus
feuille('cra', 0.210, 0.297, art('cra'), (-0.238, 0.085, 0), R(9))
feuille('facture', 0.210, 0.297, art('facture'), (-0.108, -0.004, 0.0003), R(-4))

# Le portable fermé, en haut à droite, coupé par le cadre : capot sombre et trois autocollants
LX, LY, LR, LZ = 0.305, 0.118, R(-10), 0.0155
rrect('portable', 0.312, 0.221, 0.011, LZ, bevel=0.002, mat=mat_pbr('alu', '#121715', rough=0.36, metal=1.0), loc=(LX, LY, LZ / 2), rot=(0, 0, LR))
def sur_capot(dx, dy):
    return (LX + dx * math.cos(LR) - dy * math.sin(LR), LY + dx * math.sin(LR) + dy * math.cos(LR), LZ + 0.00012)
autocollant('st-icone', 0.050, 0.050, art('st-icone'), sur_capot(-0.096, 0.046), LR + R(-6))
autocollant('st-rond', 0.060, 0.060, art('st-rond'), sur_capot(-0.024, -0.030), LR + R(10))
autocollant('st-pilule', 0.060, 0.020, art('st-pilule'), sur_capot(-0.100, -0.058), LR + R(-12))

# L'enveloppe, en bas à droite, et une carte côté verso (Net) posée dessus
feuille('enveloppe', 0.220, 0.110, art('enveloppe'), (0.232, -0.118, 0), R(6), ep=0.0014, tranche='#0A0F0C', rough=0.6, lueur=0.12)
feuille('carte-verso', 0.085, 0.055, art('carte-verso'), (0.268, -0.108, 0.0015), R(-13), ep=0.0006, tranche=C['net'], rough=0.42, coat=0.2, lueur=opt('lueur', 0.32))

# La pile de cartes, recto Coffre, tranche Net
net_t = mat_pbr('tranche', C['net'], rough=0.45, emit=C['net'], emit_strength=0.35)
PX, PY, PR, PH = 0.052, -0.102, R(17), 0.009
box('pile', 0.085, 0.055, PH, (PX, PY, PH / 2), (0, 0, PR), mat=net_t)
rnd = random.Random(4)
for i in range(4):
    feuille(f'carte{i}', 0.085, 0.055, art('carte-recto'), (PX + rnd.uniform(-.0012, .0012), PY + rnd.uniform(-.0012, .0012), PH + i * 0.00066), PR + R(rnd.uniform(-1.6, 1.6)),
            ep=0.0006, tranche=net_t, rough=0.42, coat=0.25, lueur=0.15)

# Lumière : un faisceau froid et rasant venu de l'arrière gauche, découpé par deux volets ; une nappe douce au-dessus ;
# un filet vert à droite, pour les reflets du verre et la tranche du portable
spot('rasant', (-1.25, 0.95, 0.62), (0.0, 0.0, 0.0), opt('rasant', 150.0), angle=34, blend=0.5, color=(0.9, 0.97, 1.0), radius=0.02)
noir = mat_pbr('volet', '#000000', rough=1.0)
box('volet1', 0.09, 0.01, 0.9, (-0.72, 0.62, 0.4), (0, R(24), R(-52)), mat=noir)
box('volet2', 0.035, 0.01, 0.9, (-0.82, 0.42, 0.4), (0, R(24), R(-52)), mat=noir)
area('nappe', (0.1, -0.2, 1.3), (0, 0, 0), opt('nappe', 9.0), size=1.4, color=(0.9, 0.97, 1.0))
v = area('vert', (1.0, 0.55, 0.22), (0.25, 0.05, 0), opt('vert', 10.0), size=0.7, size_y=0.12, color=hex_rgb(C['net'])[:3]); v.visible_diffuse = False      # reflets seulement : le papier reste blanc

cam = camera((0.075, -0.56, 0.87), (0.035, 0.012, 0.0), lens=60, dof=1.02, fstop=opt('f', 5.6))
render('19-papeterie.png')
