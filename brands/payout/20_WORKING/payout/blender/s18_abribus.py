# Planche 18 (scène E) : l'abribus, la nuit. Caisson d'affichage rétroéclairé de 1,185 × 1,75 m (visuel 1,16 × 1,71 m :
# out/art/affiche.png, « 54 % → 85 % »), au bout d'un abribus de 4,2 × 1,6 × 2,6 m. Trottoir et chaussée mouillés,
# lumières de la rue au loin, floues. Image fixe. Matières Poly Haven (CC0) : concrete_floor_worn_001, asphalt_02.
# Repère : la face du caisson est dans le plan y = 0 et regarde -Y ; l'abri s'étend derrière, vers +Y ; la chaussée est en x < -1,7.
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s18_abribus.py -- --draft
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from decor import *

reset(2800, 1575, samples=420)
ciel_nuit(horizon='#0D1C17', zenith='#020403', etoiles=0.0, hauteur=0.5)

def mouille(m, film=1.0, rugo=0.04):
    """Film d'eau : un vernis lisse par-dessus la matière."""
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Coat Weight'].default_value = film; b.inputs['Coat Roughness'].default_value = rugo; b.inputs['Coat IOR'].default_value = 1.9
    return m

# Sol : trottoir (x > -1,7) et chaussée 14 cm plus bas
trottoir = mouille(mat_pbr_tex('trottoir', 'concrete_floor_worn_001', 'concrete_floor_worn_001', scale=1.0, tint='#4A504D', rough_mul=0.7), 1.0, 0.05)
chaussee = mouille(mat_pbr_tex('chaussee', 'asphalt_02', 'asphalt_02', scale=1.0, tint='#3A3F3D', rough_mul=0.75, bump_strength=1.4), 1.0, 0.035)
plane('trottoir', 16, 140, (6.3, 50, 0), mat=trottoir, uv_m=2.2)
box('bordure', 0.16, 140, 0.16, (-1.78, 50, -0.08), mat=mat_pbr('bordure', '#2A2E2C', rough=0.5, coat=0.6), bevel=0.015)
plane('chaussee', 30, 140, (-16.8, 50, -0.14), mat=chaussee, uv_m=3.0)

metal = mat_pbr('metal', '#0B0E0D', rough=0.34, metal=1.0)
vitre = mat_vitre('vitre', teinte=(0.86, 0.94, 0.9, 1))

# Le caisson : cadre, visuel rétroéclairé, vitre, deux pieds
CW, CH, CE, ZB = 1.185, 1.75, 0.16, 0.62
ZC = ZB + CH / 2
box('caisson', CW, CE, CH, (0, 0, ZC), mat=metal, bevel=0.008)
affiche = screen_v('affiche', 1.16, 1.71, (0, -CE / 2 - 0.001, ZC), mat_ecran_lum('affiche', art('affiche'), cam=1.0, diffus=opt('jet', 5.0), gloss=0.07, rough=0.03))
screen_v('affiche-dos', 1.16, 1.71, (0, CE / 2 + 0.001, ZC), mat_emit('dos', hex_rgb('#0A1410'), 1.0), rot_z=math.radians(180))
for x in (-0.42, 0.42):
    box(f'pied{x}', 0.09, 0.11, ZB, (x, 0, ZB / 2), mat=metal, bevel=0.004)

# L'abri : toit, poteaux arrière, vitrage de fond et d'extrémité, banc, réglette lumineuse sous le toit
Y0, Y1, XF, XA, HT = 0.12, 4.32, -0.8, 0.8, 2.52
box('toit', 1.72, Y1 - Y0 + 0.2, 0.07, (0, (Y0 + Y1) / 2, HT + 0.035), mat=metal, bevel=0.006)
box('rive', 0.05, Y1 - Y0 + 0.2, 0.14, (XF - 0.04, (Y0 + Y1) / 2, HT), mat=metal, bevel=0.004)
for i, y in enumerate((Y0 + 0.06, (Y0 + Y1) / 2, Y1 - 0.06)):
    box(f'poteau{i}', 0.08, 0.08, HT, (XA, y, HT / 2), mat=metal, bevel=0.004)
box('poteau-av', 0.07, 0.07, HT, (XF + 0.05, Y1 - 0.06, HT / 2), mat=metal, bevel=0.004)
for i, (ya, yb) in enumerate(((Y0 + 0.1, (Y0 + Y1) / 2 - 0.04), ((Y0 + Y1) / 2 + 0.04, Y1 - 0.1))):
    plane(f'vitre{i}', 2.0, yb - ya, (XA, (ya + yb) / 2, 1.28), (math.radians(90), 0, math.radians(90)), mat=vitre)
plane('vitre-bout', 1.5, 2.0, (0.02, Y1 - 0.06, 1.28), (math.radians(90), 0, 0), mat=vitre)
box('traverse', 0.05, Y1 - Y0, 0.05, (XA, (Y0 + Y1) / 2, 0.26), mat=metal)
box('banc', 0.36, 2.3, 0.045, (XA - 0.3, 2.3, 0.47), mat=mat_pbr('banc', '#141917', rough=0.3, coat=0.5), bevel=0.006)
for y in (1.4, 3.2):
    box(f'banc-pied{y}', 0.05, 0.05, 0.45, (XA - 0.28, y, 0.225), mat=metal)
box('reglette', 0.035, Y1 - Y0 - 0.5, 0.012, (XA - 0.2, (Y0 + Y1) / 2, HT - 0.008), mat=mat_emit('reglette', hex_rgb('#E9F4EF'), opt('reglette', 7.0)))

# La rue : candélabres le long de la bordure, puis des lumières lointaines que la profondeur de champ arrondit
for i, y in enumerate((30, 52, 76)):
    cyl(f'mat{i}', 0.07, 7.5, (-1.35, y, 3.75), mat=metal, seg=16)
    box(f'crosse{i}', 1.3, 0.1, 0.07, (-1.95, y, 7.45), mat=metal)
    cyl(f'lanterne{i}', 0.22, 0.03, (-2.5, y, 7.4), mat=mat_emit(f'lant{i}', hex_rgb('#EAF6F0'), 40), seg=24)
    j = area(f'eclairage{i}', (-2.5, y, 7.3), (-2.5, y, 0), 900, size=0.5, color=(0.86, 1.0, 0.94)); j.visible_glossy = False
lumieres_lointaines(n=170, seed=opt('graine', 21), zone=((-60, 50), (48, 190)), hauteurs=(0.7, 0.75, 0.8, 1.0, 1.1, 2.4, 3.0, 3.6, 5.0, 6.5, 8.0, 11.0),
                    couleurs=['#F3F6F4', '#F3F6F4', '#DCEBFF', '#DCEBFF', '#DCEBFF', C['net200'], C['net'], '#FFE9C9'], force=(2.5, 16), rayon=(0.1, 0.3),
                    evite=lambda x, y: False)

# Un peu de lumière froide sur l'abri, venue du candélabre voisin (hors champ)
k = area('voisin', (-2.6, -3.5, 7.0), (0, 1.5, 0.5), 900, size=0.6, color=(0.86, 1.0, 0.94)); k.visible_glossy = False

# Longue focale, de loin, grande ouverture : la rue se tasse derrière l'abri et ses lumières deviennent des ronds flous
cam = camera((-5.5, -12.7, 0.92), (-0.55, 0.4, 0.92), lens=85, dof=14.1, fstop=opt('f', 1.0))
droit(cam, shift_x=opt('sx', 0.0), shift_y=opt('sy', 0.075))
render('18-abribus.png')
