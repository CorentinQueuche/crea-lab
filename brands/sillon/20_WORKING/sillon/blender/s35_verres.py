# 35 · Les verres. Trois verres droits penchés chacun à sa façon sur la nappe bleue, et la bouteille de macération :
# le paille calé par un éclat de tuffeau (15°), le glou posé sur une pile de six sous-verres (6 × 2,5 mm : 12°, le degré
# de la marque, et le sous-verre du dessus le dit : « Ça penche, ça tient. »), la macération appuyée contre la
# bouteille (40°). Tous les vins sont à la même hauteur : une seule ligne d'aplomb traverse les trois verres et la
# bouteille. Le flash vient d'en haut à gauche, un peu de dos : les ombres colorées des jus se croisent sur la nappe
# (deux jus qui se croisent donnent une robe), et un cerne de glou sèche à côté (« Taches autorisées. »).
# Usage, depuis la racine du projet :
#   blender --factory-startup -b -P blender/s35_verres.py -- --draft
#   blender --factory-startup -b -P blender/s35_verres.py                 (final, out/blender/35-verres.png)
# Options : --niv= (hauteur du vin, m)  --f=  --flash=  --face=  --haut=  --cam=x,y,z  --lens=
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
from sillon_objets import *

sc = reset(2800, 1575, samples=int(opt('spp', 900.0)))
vue(); reglages(sc, transmission=32)
sc.cycles.blur_glossy = 0.2

R, H = 0.036, 0.090
NIV = opt('niv', 0.060)                      # la ligne d'aplomb commune, en monde
verre = mat_verre('verre', teinte='#E3F0E6', densite=5.0)
tuf = mat_tuffeau('tuffeau', layures=0.6)

def verre_penche(nom, jus, x_pivot, theta, cote, trouble, y=0.0, bulles=False, dens=0.9):
    """Un verre droit posé sur le bord de son pied, penché de theta (cote +1 : vers la droite), et son vin d'aplomb."""
    g, ri, zf, cg = verre_droit(nom, verre)
    Mg = Matrix.Translation((x_pivot, y, 0.0005)) @ depuis_pivot(theta, cote, R)
    g.matrix_world = Mg
    pl = plan_local(Mg, NIV)
    v = liquide_cylindre(nom + '-vin', ri + 0.0002, zf - 0.0002, cg, pl, mat_jus(nom + '-jus', jus, trouble=trouble, densite=dens, albedo=0.85))
    v.matrix_world = Mg
    if bulles:   # le paille perle : des bulles accrochées à la paroi, sous la surface
        rnd = random.Random(8); bm_ = mat_bulle(nom + '-bulle')
        for k in range(70):
            a = rnd.uniform(0, 6.283); z = rnd.uniform(zf + 0.003, 0.08)
            x, yy = (ri - 0.0004) * math.cos(a), (ri - 0.0004) * math.sin(a)
            if z > pl(x, yy) - 0.0015: continue
            rr = rnd.uniform(0.00025, 0.0008)
            s_ = bpy.data.meshes.new('b'); import bmesh as _b; b_ = _b.new(); _b.ops.create_uvsphere(b_, u_segments=16, v_segments=10, radius=rr); b_.to_mesh(s_); b_.free()
            for p in s_.polygons: p.use_smooth = True
            s_.materials.append(bm_); o = link(bpy.data.objects.new(f'{nom}-b{k}', s_))
            o.matrix_world = Mg @ Matrix.Translation((x * (1 - rr / ri), yy * (1 - rr / ri), z))
    if jus == 'maceration':
        def dedans(r):
            a = r.uniform(0, 6.283); rr = (ri - 0.002) * math.sqrt(r.random()); x, yy = rr * math.cos(a), rr * math.sin(a)
            zt = pl(x, yy) - 0.002; z = zf + 0.001 + (zt - zf) * r.random() ** 2
            return tuple(Mg @ Vector((x, yy, z))) if z < zt else None
        flocons(nom + '-f', 160, dedans, mat_depot(nom + '-d'), taille=(0.0002, 0.0007))
    return Mg

# ---------- A · le paille, calé par un éclat de tuffeau, penché à gauche ----------
XA = -0.24
MA = verre_penche('A', 'paille', XA, 15.0, -1, 0.22, bulles=True, dens=1.8)
coin = MA @ Vector((R, 0, 0))                # le bord du pied, soulevé
e = eclat_pierre('cale', tuf, taille=0.04, seed=23)
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get(); ev = e.evaluated_get(dg)
zs = [(ev.matrix_world @ v.co).z for v in ev.data.vertices]
e.scale = (1.0, 1.0, (coin.z + 0.0008) / (max(zs) - min(zs)))
e.location = (coin.x - 0.004, 0.0, -min(zs) * e.scale.z + 0.0)

# ---------- B · le glou, sur six sous-verres : 12° ----------
XB = 0.0
MB = verre_penche('B', 'glou', XB, 12.0, 1, 0.08, dens=1.6)
coinB = MB @ Vector((-R, 0, 0))
sv_face = mat_papier_imprime('sv', os.path.join(ART, '34-sous-verre.png'), rough=0.7)
sv_bord = mat_tranche_papier('sv-bord', '#F4F1E8')
rnd = random.Random(2); EPS = 0.0025
for k in range(6):
    p = plaque(f'sv{k}', 0.09, 0.09, 0.0063, EPS - 0.00005, sv_face if k == 5 else sv_bord, sv_bord)
    p.location = (coinB.x - 0.03 + rnd.uniform(-0.003, 0.003), -0.026 + rnd.uniform(-0.003, 0.003), k * EPS)
    p.rotation_euler = (0, 0, math.radians(rnd.uniform(-5, 5) + (8 if k == 5 else 0)))

# ---------- C · la macération, appuyée contre la bouteille : 40° ----------
XC = 0.10
MC = verre_penche('C', 'maceration', XC, 40.0, 1, 1.0)  # même jus que 33 et 34
contact = MC @ Vector((R, 0, H))
bv = mat_verre('bouteille-verre', teinte='#E3F0E6', densite=5.0)
bo, interieur, RB, _ = bouteille('bouteille', bv)
XBT = contact.x + RB + 0.0009
bo.location = (XBT, 0, 0)
tr = mat_tranche_papier('tranche')
ETQ_L = 0.080; ETQ_H = ETQ_L * 2778 / 2240; CE_L = 0.058; CE_H = CE_L * 1681 / 2016; ETQ_Z = 0.0725; CE_Z = ETQ_Z + 0.01   # la contre-étiquette est au dos
for nom, l_, h_, z_, img, rel in (('etq', ETQ_L, ETQ_H, ETQ_Z, '34-etiquette.png', '34-etiquette-masque.png'), ('ce', CE_L, CE_H, CE_Z, '34-contre.png', None)):
    o = etiquette_cyl('b-' + nom, RB, l_, h_, z_, (-90 - 20) if nom == 'etq' else (90 - 20), mat_papier_imprime('b-' + nom, os.path.join(ART, img), os.path.join(ART, rel) if rel else None, gaufre=1.2), tr, bord=0.0002)
    o.location = (XBT, 0, 0)
vb = liquide_revolution('bouteille-vin', interieur, NIV, mat_jus('bouteille-jus', 'maceration', trouble=1.0, densite=0.8)); vb.location = (XBT, 0, 0)

# ---------- La nappe et le fond ----------
AV = 1.6
taches = [(-0.075, -0.12 + AV, 0.0345, 0.003, 'glou')]
nappe = drape('nappe', mat_serge('nappe', tuile=0.30, tache=taches), l=4.0, avant=AV, arriere=0.55, h=1.4, rayon=0.3, plis=0.035, ondes=6)
nappe.visible_shadow = False   # le flash vient de derrière le fond : le fond ne doit pas faire d'ombre à la table

# ---------- Caméra et lumière ----------
pos = Vector(tuple(float(v) for v in opt('cam', '-0.02,-0.92,0.21').split(',')))
cible = Vector((opt('cx', -0.005), 0.0, opt('cz', 0.055)))
cam = camera(tuple(pos), tuple(cible), lens=opt('lens', 64.0), dof=(pos - Vector((XB, 0, NIV))).length, fstop=opt('f', 9.0))
fl, dl = flash(cam, gauche=1.0, haut=opt('haut', 0.6), face=opt('face', -0.55), force=opt('flash', 4.0), angle=0.45)
ciel_studio(force=0.14, rot_z=1.0)
spot('fond', (0.0, 0.0, 1.8), (0.05, 0.55, 0.55), opt('fond', 120.0), angle=70, blend=1.0, radius=0.5)
carte_lumiere('bande-g', (-0.7, -0.5, 0.35), (0, 0, 0.06), 0.25, 0.8, 3.0)
carte_lumiere('bande-d', (0.7, -0.4, 0.3), (0.1, 0, 0.06), 0.2, 0.8, 1.6)
render('35-verres.png')
