# Planche 35 (scène H) : l'enseigne de bureau. Logotype lumineux de 1,6 m de large (hauteur d'x 0,247 m), lettres de 25 mm
# d'épaisseur à 30 mm du mur, sur un mur sombre et mat, la nuit. Halo vert sur le mur, sol poli, un poste de travail
# allumé au second plan (out/art/ecran-bord.png). Enduit Poly Haven (plaster_grey_04, CC0), béton concrete_floor_worn_001.
# Repère : le mur est dans le plan y = 0 et regarde -Y.
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s35_enseigne.py -- --draft
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from decor import *

reset(2800, 1575, samples=420)
nuit(0.02)
R = math.radians

# Le mur : enduit sombre et mat, joints creux tous les 2,4 m, plinthe noire
HM = 3.1
enduit = mat_pbr_tex('enduit', 'plaster_grey_04', 'plaster_grey_04', scale=1.0, tint=opt('mur', '#5C6862'), rough_mul=1.0, bump_strength=0.8)
for i in range(-4, 5):                                    # panneaux de 2,4 m : aucun joint ne traverse l'enseigne
    plane(f'mur{i}', 2.392, HM, (i * 2.4, 0, HM / 2), (R(90), 0, 0), mat=enduit, uv_m=1.6)
plane('fond-joint', 20, HM, (0, 0.012, HM / 2), (R(90), 0, 0), mat=mat_pbr('joint', '#020303', rough=0.9))
box('plinthe', 20, 0.014, 0.08, (0, -0.007, 0.04), mat=mat_pbr('plinthe', '#070A09', rough=0.3))

# Sol poli et plafond sombre
sol = mat_pbr_tex('sol', 'concrete_floor_worn_001', 'concrete_floor_worn_001', scale=1.0, tint='#343A37', rough_mul=0.5)
b = next(n for n in sol.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'); b.inputs['Coat Weight'].default_value = 0.9; b.inputs['Coat Roughness'].default_value = 0.05
plane('sol', 40, 40, (0, -10, 0), mat=sol, uv_m=3.0)
plane('plafond', 40, 40, (0, -10, HM), (R(180), 0, 0), mat=mat_pbr('plafond', '#060908', rough=0.8))

# L'enseigne : hauteur d'x 0,247 m (largeur 1,6 m), épaisseur 25 mm, à 30 mm du mur
HX, EP, ZB = 0.247, 0.025, 1.42
logo('enseigne', height=HX, extrude=EP, mat=mat_lum('net', cam=1.15, diffus=opt('jet', 7.0)), part='logotype', loc=(0, -0.03 - EP / 2, ZB))
# Le halo : le dos des lettres éclaire le mur. Des lettres jumelles, plus fines, invisibles à l'image, portent cette lumière.
dos = logo('enseigne-dos', height=HX, extrude=0.004, mat=mat_emit('dos', hex_rgb(C['net']), opt('halo', 30.0)), part='logotype', loc=(0, -0.026, ZB))
dos.visible_camera = False; dos.visible_glossy = False

# Second plan : un poste de travail allumé, plus loin le long du mur
metal = mat_pbr('metal', '#0B0E0D', rough=0.34, metal=1.0)
plateau = mat_pbr('plateau', '#0D1210', rough=0.25, coat=0.5)
def poste(name, x, y, rz, allume=True):
    objs = [box(name + '-plateau', 1.6, 0.75, 0.03, (0, 0, 0.735), mat=plateau, bevel=0.003)]
    for sx in (-0.72, 0.72):
        objs.append(box(f'{name}-pied{sx}', 0.04, 0.6, 0.72, (sx, 0, 0.36), mat=metal))
    objs.append(box(name + '-socle', 0.22, 0.18, 0.012, (0, 0.2, 0.756), mat=metal))
    objs.append(box(name + '-tige', 0.04, 0.02, 0.3, (0, 0.24, 0.9), mat=metal))
    objs.append(box(name + '-dalle', 0.615, 0.02, 0.39, (0, 0.215, 1.13), mat=metal, bevel=0.004))
    m = mat_ecran_lum(name + '-ecran', art('ecran-bord'), cam=1.0, diffus=3.0, gloss=0.03) if allume else mat_pbr(name + '-noir', '#020303', rough=0.06, coat=1.0)
    objs.append(screen_v(name + '-ecran', 0.595, 0.372, (0, 0.2045, 1.13), m))
    objs.append(box(name + '-clavier', 0.36, 0.12, 0.012, (0, -0.1, 0.756), mat=metal, bevel=0.002))
    # fauteuil : assise, dossier, pied
    objs += [box(name + '-assise', 0.48, 0.46, 0.06, (0.1, -0.75, 0.47), mat=plateau, bevel=0.02), box(name + '-dossier', 0.46, 0.05, 0.5, (0.1, -0.99, 0.78), (R(-8), 0, 0), mat=plateau, bevel=0.02),
             cyl(name + '-fut', 0.03, 0.42, (0.1, -0.75, 0.24), mat=metal, seg=16), cyl(name + '-etoile', 0.3, 0.03, (0.1, -0.75, 0.03), mat=metal, seg=5)]
    return groupe(name, objs, loc=(x, y, 0), rot=(0, 0, rz))
poste('poste1', 2.45, -1.2, R(-38))
poste('poste2', 4.55, -2.3, R(-38), allume=False)

# Premier plan : une table de réunion au plateau de verre sombre, où l'enseigne se reflète
verre = mat_pbr('verre-table', '#050807', rough=0.045, coat=1.0)
box('table', 3.6, 1.45, 0.03, (-0.25, -3.2, 0.725), mat=verre, bevel=0.004)
for x in (-1.6, 1.1):
    box(f'table-pied{x}', 0.06, 1.0, 0.71, (x, -3.2, 0.355), mat=metal)
# Un filet clair sur le chant du plateau, pour que la table se lise
box('table-chant', 3.6, 0.004, 0.006, (-0.25, -3.2 + 0.725, 0.737), mat=mat_emit('chant', hex_rgb(C['acier']), 0.5))

# Une lueur froide très faible, venue de la droite (une baie hors champ) : elle dessine le mur, le sol et les meubles
k = area('nuit-baie', (6.0, -4, 2.2), (1, -1, 1.0), opt('baie', 200.0), size=3.0, color=(0.8, 0.95, 1.0)); k.visible_glossy = False

cam = camera((-1.9, -4.3, 1.05), (0.75, 0.0, 1.05), lens=35, dof=4.7, fstop=opt('f', 2.8))
droit(cam, shift_x=opt('sx', 0.0), shift_y=opt('sy', -0.03))
render('35-enseigne.png')
