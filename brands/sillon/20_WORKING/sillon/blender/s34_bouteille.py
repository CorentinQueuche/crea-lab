# 34 · La bouteille. Gros plan sur deux bouteilles de macération pleines : celle de gauche montre son étiquette, celle de
# droite son dos et sa contre-étiquette, à travers le verre on devine le revers de l'étiquette. Le jus est trouble mais
# laisse passer la lumière (orange vif au bord où il est mince, plus dense au cœur), la lie est tombée au fond, dans
# la piqûre. Papier non couché, logotype gaufré, tranche
# du papier visible. Flash dur d'en haut à gauche, une lumière derrière fait luire le jus, sergé bleu.
# Les visuels viennent du socle : art/34-etiquette.html rendu dans out/art/ (voir l'en-tête de cette page).
# Usage, depuis la racine du projet :
#   blender --factory-startup -b -P blender/s34_bouteille.py -- --draft
#   blender --factory-startup -b -P blender/s34_bouteille.py                 (final, out/blender/34-bouteille.png)
# Options : --rot= (rotation de la bouteille de face, degrés)  --f=  --flash=  --dos= (lumière arrière)  --spp=
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
from sillon_objets import *

sc = reset(2800, 1575, samples=int(opt('spp', 900.0)))
vue(); reglages(sc, transmission=32)

# ---------- Les papiers (proportions des rendus de art/34-etiquette.html) ----------
ETQ_L = 0.080; ETQ_H = ETQ_L * 2778 / 2240
CE_L = 0.060; CE_H = CE_L * 1681 / 2016
ETQ_Z = 0.0725
NIV = opt('niv', 0.268)                     # bouteille pleine : le vin monte dans le goulot, hors du cadre
CE_Z = ETQ_Z + 0.012                        # au dos, la contre-étiquette
print('niveau', round(NIV, 4), 'haut etiquette', round(ETQ_Z + ETQ_H, 4))

verre = mat_verre('verre', teinte='#E3F0E6', densite=5.0)
nt = verre.node_tree; bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
tc = nt.nodes.new('ShaderNodeTexCoord'); nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 90; nz.inputs['Detail'].default_value = 8
nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = 0.5; mr.inputs['From Max'].default_value = 0.75; mr.inputs['To Min'].default_value = 0.0; mr.inputs['To Max'].default_value = 0.08
nt.links.new(nz.outputs['Fac'], mr.inputs['Value']); nt.links.new(mr.outputs[0], bsdf.inputs['Roughness'])   # traces de doigts
tranche = mat_tranche_papier('tranche')
m_etq = mat_papier_imprime('etq', os.path.join(ART, '34-etiquette.png'), os.path.join(ART, '34-etiquette-masque.png'), gaufre=1.2)
m_ce = mat_papier_imprime('ce', os.path.join(ART, '34-contre.png'))
jus = mat_jus('jus', 'maceration', trouble=1.0, densite=opt('dens', 0.9), albedo=opt('albedo', 0.6), ton=int(opt('ton', 1.0)), absorption=(1.0, opt('absg', 0.48), 0.0))
lie = mat_lie('lie', 'maceration', 1400.0)
next(n for n in lie.node_tree.nodes if n.type == 'PRINCIPLED_VOLUME').inputs['Absorption Color'].default_value = (1.0, 0.5, 0.0, 1)   # une lie brune, pas violette
dep = mat_depot('depot')

def une_bouteille(nom, x, y, rz, face):
    """Une bouteille entamée, avec son vin, sa lie et ses papiers ; face=True : l'étiquette regarde la caméra."""
    b, interieur, RB, _ = bouteille(nom, verre)
    papiers = []
    phi = -90 + (opt('rot', 10.0) if face else 0)
    papiers.append(etiquette_cyl(nom + '-etq', RB, ETQ_L, ETQ_H, ETQ_Z, phi if face else phi + 180, m_etq, tranche, ep=0.00025, bord=0.00025))
    papiers.append(etiquette_cyl(nom + '-ce', RB, CE_L, CE_H, CE_Z, phi + 180 if face else phi + 4, m_ce, tranche, ep=0.00025, bord=0.0002))
    v = liquide_revolution(nom + '-vin', interieur, NIV, jus)
    # la lie : un voile dense posé dans l'anneau du fond, autour de la piqûre
    prof = [(0, 0.0262), (0.012, 0.0215), (0.022, 0.0118), (0.030, 0.0082), (0.0355, 0.0105), (0.0362, 0.0142), (0.030, 0.0150), (0.024, 0.0158), (0.016, 0.0225), (0, 0.0272)]
    l = tour(nom + '-lie', prof, mat=lie, seg=120, vif=89)
    RI = RB - 0.0028
    def dedans(r):
        a = r.uniform(0, 6.283); rr = (RI - 0.0015) * math.sqrt(r.uniform(0.15, 1.0))
        z = 0.009 + (0.17 - 0.014) * r.random() ** 3.0
        return (rr * math.cos(a), rr * math.sin(a), z)
    fl = flocons(nom + '-f', 380, dedans, dep, taille=(0.00012, 0.0004), seed=5 if face else 9)
    bpy.context.view_layer.update()   # sinon matrix_world ignore encore la position et l'échelle des flocons
    for o in [b, v, l] + papiers + fl:
        o.matrix_world = Matrix.Translation((x, y, 0)) @ Matrix.Rotation(math.radians(rz), 4, 'Z') @ o.matrix_world
    return RB

RB = une_bouteille('face', -0.051, 0.0, 0.0, True)
une_bouteille('dos', 0.054, 0.035, 0.0, False)

# ---------- Le studio ----------
fond = drape('serge', mat_serge('serge', tuile=0.28, clair=opt('clair', 1.0)), l=4.0, avant=1.5, arriere=0.7, h=1.6, rayon=0.4, plis=0.04, ondes=5)
fond.visible_diffuse = False   # le sergé ne renvoie pas son bleu sur le papier : l'étiquette reste couleur tuffeau
W_IMG = 0.335; LENS = 85.0
D = W_IMG * LENS / 36.0
ZC = 0.1095
cam = camera((0.0, -D, ZC), (0.0, 0, ZC), lens=LENS, dof=D - RB, fstop=opt('f', 11.0))
cam.data.sensor_fit = 'HORIZONTAL'
cam.data.shift_y = (0.089 - ZC) / W_IMG
fl, dl = flash(cam, gauche=1.0, haut=1.0, face=opt('face', 0.35), force=opt('flash', 4.2), angle=0.45)
ciel_studio(force=0.03, rot_z=1.0)
# derrière les bouteilles : le jus s'allume par transparence
area('dos', (0.05, 0.45, 0.13), (0, 0, 0.11), opt('dos', 4.0), size=0.25, size_y=0.12)
# bandes de studio, vues dans le verre : elles dessinent les flancs des bouteilles
carte_lumiere('bande-g', (-0.40, -0.25, 0.14), (0, 0, 0.10), 0.12, 0.6, 2.5)
carte_lumiere('bande-d', (0.40, -0.18, 0.14), (0, 0, 0.10), 0.08, 0.6, 1.4)
render('34-bouteille.png')
