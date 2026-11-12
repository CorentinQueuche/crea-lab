# Planche 32 (scène F) : le stand de salon tech. Stand d'angle de 3 × 3 m, cloisons Coffre de 2,5 m ; mur d'écran de
# 2,0 × 1,125 m (le tableau de bord, out/art/ecran-mur.png) ; logotype lumineux au-dessus ; cloison latérale imprimée
# (out/art/cloison.png) ; kakémono rétroéclairé de 0,85 × 2,0 m (out/art/kakemono.png) ; comptoir de 1,0 × 0,5 × 1,05 m
# à bandeau de 20 segments (17 allumés), un portable de démonstration posé dessus (out/art/ecran-bord.png).
# Hall sombre, sol poli (Poly Haven concrete_floor_worn_001, CC0), lumières du salon au loin.
# Repère : stand centré à l'origine, cloison de fond en y = +1,5, cloison latérale en x = -1,5, allées devant (-Y) et à droite (+X).
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s32_stand.py -- --draft
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from decor import *

reset(2800, 1575, samples=420)
nuit(0.03)

# Hall : sol de béton poli, plafond noir hors champ
sol = mat_pbr_tex('hall', 'concrete_floor_worn_001', 'concrete_floor_worn_001', scale=1.0, tint='#3B403E', rough_mul=0.55)
b = next(n for n in sol.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'); b.inputs['Coat Weight'].default_value = 0.8; b.inputs['Coat Roughness'].default_value = 0.06
plane('hall', 120, 120, (0, 20, 0), mat=sol, uv_m=3.0)

coffre = mat_pbr('cloison', '#090E0B', rough=0.55)
metal = mat_pbr('metal', '#0B0E0D', rough=0.34, metal=1.0)
laque = mat_pbr('laque', '#0A0F0C', rough=0.12, coat=1.0)
net = mat_lum('net', cam=1.15, diffus=4.0)
eteint = mat_pbr('eteint', '#0A1F14', rough=0.2, emit=C['net900'], emit_strength=0.5)

# Plancher du stand, avec un filet Net sur les deux bords ouverts
PZ = 0.05
box('plancher', 3.0, 3.0, PZ, (0, 0, PZ / 2), mat=mat_pbr('plancher', '#0C120F', rough=0.16, coat=0.8), bevel=0.004)
box('filet-avant', 3.0, 0.012, 0.012, (0, -1.506, PZ - 0.012), mat=net)
box('filet-droit', 0.012, 3.0, 0.012, (1.506, 0, PZ - 0.012), mat=net)

# Cloisons : fond et côté gauche, 2,5 m de haut
HC = 2.5
box('fond', 3.08, 0.08, HC, (-0.04, 1.54, PZ + HC / 2), mat=coffre)
box('cote', 0.08, 3.0, HC, (-1.54, 0, PZ + HC / 2), mat=coffre)
plane('cloison', 3.0, HC, (-1.499, 0, PZ + HC / 2), (math.radians(90), 0, math.radians(90)), mat=mat_imprime('cloison-img', art('cloison'), rough=0.5, lueur=opt('lueur', 0.16)))

# Mur d'écran : 2,0 × 1,125 m, cadre fin
EX, EZ = -0.38, PZ + 1.36
box('ecran-cadre', 2.03, 0.05, 1.155, (EX, 1.475, EZ), mat=metal, bevel=0.004)
screen_v('ecran', 2.0, 1.125, (EX, 1.448, EZ), mat_ecran_lum('ecran', art('ecran-mur'), cam=1.0, diffus=3.0, gloss=0.04))
# Logotype lumineux au-dessus de l'écran, aligné sur son bord gauche (lettres de 30 mm, décollées de 20 mm)
HL = 0.15
logo('logotype', height=HL, extrude=0.03, mat=net, part='logotype', loc=(EX - 1.0 + 6.48 * HL / 2, 1.5 - 0.02 - 0.015, PZ + 2.12))

# Kakémono rétroéclairé, au fond à droite, tourné vers l'allée
KW, KH, KE = 0.85, 2.0, 0.07
rz = math.radians(22)
kx, ky = 1.06, 1.06
ax, ay = (math.cos(rz), math.sin(rz), 0), (0, 0, 1)                 # la droite du visuel, le haut
nx = (math.sin(rz), -math.cos(rz), 0)                               # la normale de la face
orient(box('kake-cadre', KW + 0.03, KH + 0.03, KE, mat=metal, bevel=0.004), ax, ay, (kx, ky, PZ + 0.03 + KH / 2))
orient(plane('kakemono', KW, KH, mat=mat_ecran_lum('kake', art('kakemono'), cam=1.0, diffus=3.0, gloss=0.0)), ax, ay, (kx + nx[0] * (KE / 2 + 0.001), ky + nx[1] * (KE / 2 + 0.001), PZ + 0.03 + KH / 2))
orient(box('kake-pied', KW + 0.1, 0.32, 0.02, mat=metal), ax, (-nx[0], -nx[1], 0), (kx, ky, PZ + 0.012))

# Comptoir : 1,0 × 0,5 × 1,05 m, bandeau de 20 segments en façade, petit logotype au-dessus
CX, CY, CH = -0.55, -0.95, 1.05
box('comptoir', 1.0, 0.5, CH, (CX, CY, PZ + CH / 2), mat=laque, bevel=0.004)
jauge_segments('bandeau', 0.86, 0.11, 0.012, p=85, n=20, ecart=0.3, loc=(CX, CY - 0.25 - 0.006, PZ + 0.56), mat_on=net, mat_off=eteint)
logo('logo-comptoir', height=0.042, extrude=0.008, mat=net, part='logotype', loc=(CX - 0.43 + 6.48 * 0.042 / 2, CY - 0.25 - 0.004, PZ + 0.80))
# Portable de démonstration, tourné vers l'allée
portable('demo', mat_ecran_lum('demo-ecran', art('ecran-bord'), cam=1.0, diffus=2.5), ouverture=104.0, loc=(CX + 0.12, CY + 0.03, PZ + CH), rz=math.radians(18))

# Éclairage du stand : trois projecteurs froids sur un pont, hors champ
for i, (x, cible) in enumerate(((-0.9, (-1.5, 0.0, 1.3)), (0.2, (-0.3, 1.5, 2.2)), (1.2, (-0.5, -0.9, 0.9)))):
    spot(f'proj{i}', (x, -2.6, 4.2), cible, opt('proj', 300.0), angle=38, blend=0.6, color=(0.86, 1.0, 0.94), radius=0.12)

# Le salon autour : stands voisins en silhouettes, lumières du plafond et des allées, floues
gris = mat_pbr('voisin', '#0A0D0C', rough=0.6)
for i, (x, y, w, h_) in enumerate(((-7.5, 9, 5, 3.2), (-1.5, 13, 6, 3.6), (6.5, 10.5, 5, 3.0), (12, 4, 4, 3.4), (-13, 3.5, 4, 3.0), (3, 22, 9, 4.2))):
    box(f'voisin{i}', w, 0.3, h_, (x, y, h_ / 2), mat=gris)
    box(f'voisin-filet{i}', w, 0.02, 0.03, (x, y - 0.16, h_ - 0.2), mat=mat_emit(f'voisin-e{i}', hex_rgb(('#DCEBFF', '#F3F6F4', '#BFD2CC')[i % 3]), 1.2))
lumieres_lointaines(n=70, seed=opt('graine', 8), zone=((-40, 44), (16, 90)), hauteurs=(7.0, 8.0, 9.0, 10.0), couleurs=['#F3F6F4', '#DCEBFF', '#DCEBFF', '#EAF6F0'],
                    force=(1.5, 5), rayon=(0.05, 0.12), evite=lambda x, y: False)
lumieres_lointaines(n=26, seed=3, zone=((-34, 36), (14, 60)), hauteurs=(1.2, 1.8, 2.4, 3.0), couleurs=['#F3F6F4', '#DCEBFF', C['net200'], '#FFE9C9'],
                    force=(1.0, 3.0), rayon=(0.05, 0.11), evite=lambda x, y: (-6 < x < 6 and y < 16))

cam = camera((2.75, -4.75, 1.5), (-0.2, 0.5, 1.5), lens=30, dof=5.7, fstop=opt('f', 2.0))
droit(cam, shift_x=opt('sx', 0.0), shift_y=opt('sy', -0.015))
render('32-stand.png')
