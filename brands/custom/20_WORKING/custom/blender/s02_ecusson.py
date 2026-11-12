# Planche 02 : l'écusson. Le Cran brodé en fil fluo sur sergé noir, en macro (le cadre couvre 5 cm), comme la macro
# d'origine de Custom (photos/origine-broderie.jpg). Tout est en vraie géométrie : 120 points de satin en fil torsadé à
# deux brins (0,4 mm), sergé 2/1 tissé en relief, bord cordonnet de 400 points autour d'une âme ronde, aiguille et
# pied presseur de la brodeuse, flous, au second plan. Écusson de 48 × 34 mm, Cran de 34 mm de large (tracé officiel).
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s02_ecusson.py -- --draft
#   options : --pct=60 (taille du brouillon)  --zone=0.3,0.3,0.7,0.7 (détail à pleine définition)  --az= --el= --dist= --f=
import sys, os, math, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from custom3d1 import *

T0 = time.time()
DRAFT = '--draft' in argv()
reset(2800, 1575, samples=int(opt('samples', 420)))
world_color((0, 0, 0, 1), 0.0)

LC = opt('cran', 34.0) * MM                    # largeur du Cran
PW, PH, PR = opt('pw', 48.0) * MM, opt('ph', 34.0) * MM, 5.5 * MM          # écusson
RF = opt('fil', 0.2) * MM                      # rayon du fil à broder
polys, S = contour_svg('symbole', LC)
HC = 110 * S

# ---------- le sergé noir de l'écusson, tissé en relief
toile = mat_tissu('serge', '#060608', rough=0.7, sheen=opt('duvet', 0.12), fibre=0.4, spec=opt('tspec', 0.16))
grille_relief('serge', PW - 1.4 * MM, PH - 1.4 * MM, (0.06 if DRAFT and not opt('zone', '') else 0.034) * MM, serge, mat=toile,
              masque=lambda X, Y: dans_rrect(X, Y, PW - 1.5 * MM, PH - 1.5 * MM, PR - 0.75 * MM))
rrect('corps', PW - 1.0 * MM, PH - 1.0 * MM, PR - 0.5 * MM, 0.75 * MM, mat=mat_pbr('corps', '#050506', rough=0.9), loc=(0, 0, -0.42 * MM))

# ---------- le Cran : deux colonnes de satin, séparées par une couture qui joint les deux angles rentrants
ANG = math.atan2(62.4, 14.75)                  # les points suivent le côté incliné des blocs (13,3° de la verticale)
d = np.array([math.cos(ANG), math.sin(ANG)]); e = np.array([d[1], -d[0]])
g = np.array([64.4, -16.8]); g = g / np.linalg.norm(g)
cr = lambda a, b: a[0] * b[1] - a[1] * b[0]
def couture(c, t0, t1):
    if t1 - t0 < 80 * S: return [(t0, t1)]
    ts = -c * cr(e, g) / cr(d, g)
    return [(t0, ts + 0.14 * MM), (ts - 0.14 * MM, t1)]
PAS = opt('pas', 0.33) * MM
lignes = satin(polys, ANG, pas=PAS, r=RF, haut=opt('haut', 0.38) * MM, bord=RF * 0.9, coupe=couture, seed=4)
fluo = mat_fil('fil-fluo', C['fluo'], rough=opt('rough', 0.38), lueur=opt('lueur', 0.06), spec=opt('spec', 0.22), trans=opt('trans', 0.12))
PROFIL = (opt('brin', 0.70), opt('helice', 0.32)); TORS = opt('torsade', 0.85) * MM
fils('cran', lignes, r=RF, mat=fluo, brins=2, torsade=TORS, seed=2, res=1 if DRAFT and not opt('zone', '') else 3, profil=PROFIL)
# sous-couche : elle bouche les jours entre les fils (comme les points de fond d'une vraie broderie)
sc = logo('sous-couche', height=HC, extrude=0.20 * MM, mat=mat_teinte('sous-couche', C['fluo600'], rough=0.8, lueur=0.06), part='symbole',
          loc=(0, -HC / 2, 0.06 * MM), rot=(0, 0, 0))
sc.data.offset = -0.45 * MM

# ---------- le bord cordonnet
RA = opt('ame', 0.95) * MM; ZA = -0.25 * MM
bords, ame = cordonnet(rrect_pts(PW, PH, PR), r_ame=RA, r_fil=0.2 * MM, pas=0.36 * MM, penche=0.4, z=ZA)
noirf = mat_fil('fil-noir', opt('bord', '#0C0C0E'), rough=0.3, spec=0.3, reflet='#6E7078')
fils('cordonnet', bords, r=0.2 * MM, mat=noirf, brins=2, torsade=1.4 * MM, seed=7, res=1 if DRAFT and not opt('zone', '') else 2)
cu = bpy.data.curves.new('ame', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = RA * 0.97; cu.bevel_resolution = 4
sp = cu.splines.new('POLY'); sp.points.add(len(ame) - 1)
for p, a in zip(sp.points, ame): p.co = (*a, 1)
sp.use_cyclic_u = True
link(bpy.data.objects.new('ame', cu)); cu.materials.append(mat_pbr('ame', '#0A0A0B', rough=0.8))

# ---------- le plan de travail : feutre noir ; une chute de fil fluo, floue, au premier plan
ZS = ZA - RA - 0.42 * MM
# le feutre est un diffus pur, sans vernis : à contre-jour rasant, le moindre reflet le rendrait gris (et le fond avec lui)
plane('feutre', 0.8, 0.8, (0, 0, ZS), mat=mat_velours('feutre', opt('feutre', '#17171A')))
chute = lisser([(-0.0225, -0.0112, 0.0003), (-0.0200, -0.0128, 0.0010), (-0.0172, -0.0139, 0.0004), (-0.0150, -0.0128, 0.0003),
                (-0.0146, -0.0146, 0.0009), (-0.0118, -0.0150, 0.0003), (-0.0086, -0.0143, 0.0003)], 40)
fils('chute', [chute], r=RF * 0.9, mat=fluo, brins=2, torsade=TORS, seed=11, profil=PROFIL)

# ---------- l'aiguille et le pied presseur de la brodeuse, au-dessus du dernier point (flous)
acier = mat_metal('acier', '#D7D9DD', rough=0.16)
acier2 = mat_metal('acier-mat', '#B8BABF', rough=0.34, brosse=0.12, echelle=(500, 500, 6))
dernier = lignes[-1][-1] if lignes[-1][-1][1] > lignes[-1][0][1] else lignes[-1][0]
NX, NY = dernier[0] + opt('nx', 0.0016), dernier[1] + opt('ny', 0.0026)
tour('aiguille', [(0, 0.0012), (0.00012, 0.0016), (0.00042, 0.0048), (0.00046, 0.0062), (0.00046, 0.024), (0.001, 0.0255), (0.001, 0.040), (0, 0.040)], mat=acier, loc=(NX, NY, 0), seg=32)
tour('barre', [(0, 0.036), (0.0032, 0.036), (0.0036, 0.0368), (0.0036, 0.12), (0, 0.12)], mat=acier2, loc=(NX, NY, 0), seg=48)
cyl('vis', 0.0014, 0.0052, (NX + 0.0042, NY, 0.041), (0, R(90), 0), mat=acier, seg=24)
# pied presseur : un anneau au ras du tissu, tenu par une tige coudée
tore('pied', 0.0034, 0.00055, mat=acier, loc=(NX, NY, 0.0019))
tube('tige', [(NX, NY + 0.0034, 0.0019), (NX, NY + 0.0052, 0.0034), (NX, NY + 0.0072, 0.010), (NX, NY + 0.0072, 0.05), (NX, NY + 0.0072, 0.12)], 0.0011, mat=acier)
box('bloc-machine', 0.05, 0.04, 0.06, (NX + 0.004, NY + 0.012, 0.118), mat=mat_pbr('carter', '#E6E4DE', rough=0.42), bevel=0.004)
# le fil : il descend le long de l'aiguille, passe le chas et rejoint le dernier point planté
fil_pts = [(NX - 0.0011, NY - 0.0004, 0.085), (NX - 0.0008, NY - 0.0003, 0.03), (NX - 0.0005, NY - 0.0002, 0.008), (NX, NY, 0.0052),
           (NX + 0.0002, NY + 0.0001, 0.0042), ((NX + dernier[0]) / 2 + 0.0003, (NY + dernier[1]) / 2, 0.0018), (dernier[0], dernier[1], 0.0001)]
fils('fil-aiguille', [lisser(fil_pts, 60)], r=RF * 0.9, mat=fluo, brins=2, torsade=TORS, seed=9, profil=PROFIL)

# ---------- lumière : une rasante froide venue de l'arrière gauche, un contre-jour chaud à droite, une nappe de face
KZ = opt('kel', 19.0)
kd = 0.42; ka = R(opt('kaz', 122.0))
spot('rasante', (kd * math.cos(ka) * math.cos(R(KZ)), kd * math.sin(ka) * math.cos(R(KZ)), kd * math.sin(R(KZ))), (0, 0, 0), opt('key', 11.0), angle=22, blend=0.6, color=(0.93, 0.97, 1.0), radius=0.012)
area('chaud', (0.30, 0.16, 0.07), (0.01, 0.0, 0.0), opt('chaud', 1.6), size=0.10, color=(1.0, 0.80, 0.58))
area('nappe', (0.02, -0.16, 0.30), (0, 0, 0), opt('nappe', 0.8), size=0.30, color=(0.94, 0.97, 1.0))
# un panneau clair hors champ, pour que l'acier ait quelque chose à refléter
rf = plane('reflet', 0.25, 0.18, (0.10, -0.06, 0.26), mat=mat_emit('reflet', (0.9, 0.95, 1.0, 1), opt('reflet', 1.2)))
rf.rotation_euler = (R(28), R(-18), 0); rf.visible_camera = False; rf.visible_diffuse = False

az, el, dist = R(opt('az', -7.0)), R(opt('el', 35.0)), opt('dist', 0.126)
cible = (opt('cx', 0.0005), opt('cy', 0.0036), 0.0002)
pos = (cible[0] - math.sin(az) * math.cos(el) * dist, cible[1] - math.cos(az) * math.cos(el) * dist, cible[2] + math.sin(el) * dist)
net = Vector((opt('mx', 0.0), opt('my', -0.0015), 0.0003))          # le point net : la couture entre les deux blocs
cam = macro(camera(pos, cible, lens=opt('lens', 100.0), dof=(net - Vector(pos)).length, fstop=opt('f', 11.0)))
print('GEOMETRIE', round(time.time() - T0, 1), 's ;', len(lignes), 'points de satin ;', len(bords), 'points de cordonnet')
rendre('02-ecusson.png')
print('TOTAL', round(time.time() - T0, 1), 's')
