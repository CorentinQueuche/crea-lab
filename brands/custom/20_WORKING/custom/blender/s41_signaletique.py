# Planche 41 : la signalétique. Le totem fluo de Custom (mât, panneau-flèche portant le Cran, panneau d'univers),
# trois drapeaux et l'enseigne, devant la façade sombre de l'atelier, au crépuscule, sol mouillé.
# Reprise de photos/origine-totem.jpg : mêmes pièces, même fluo, mais la nuit tombe et le fluo accroche la lumière.
# Repère : la façade est dans le plan y = 0 et regarde -Y. Cotes : totem 3,0 m, flèche 1,32 × 0,54 m, panneau 0,80 × 1,00 m,
# drapeaux 0,75 × 2,60 m, enseigne 4,0 m de large. Visuels : art/3d2-signaletique.html (out/art/3d2-plan, 3d2-drapeau-a/b/c, 3d2-sol).
# Sol : asphalt_02 (Poly Haven, CC0). Fond de la baie : photos/traceur.jpg.
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s41_signaletique.py -- --draft
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from custom3d2 import *

reset(2800, 1575, samples=320)
ciel_crepuscule(horizon=opt('horizon', '#7A4FE0'), milieu=opt('milieu', '#2F2268'), zenith='#0A0A16', force=opt('ciel', 1.0), bas=opt('bciel', 0.26), hauteur=opt('hciel', 0.7))

LUEUR = opt('lueur', 0.42)                       # part du fluo en émission (pigment fluorescent)
fluo = mat_fluo('fluo', lueur=LUEUR, rough=0.55, spec=0.15)
encre = mat_pbr('encre', K['encre'], rough=0.38)
sombre = mat_pbr('metal-sombre', '#141416', rough=0.38, metal=0.9)

# ---------- Le sol : asphalte mouillé ----------
sol = mat_sol_mouille('sol', scale=1.0, tint=opt('sol', '#8A8A94'), rough_mul=opt('rsol', 0.42), flaques=opt('flaques', 0.6), echelle=opt('eflaques', 0.5), seed=opt('graine', 3.0))
plane('sol', 80, 80, (0, -20, 0), mat=sol, uv_m=2.4)
ML = opt('ml', 6.4)
marq = plane('marquage', ML, ML / 2, (opt('mx', 1.1), opt('my', -3.9), 0.004), (0, 0, R(opt('mrz', 38.0))), mat=mat_imprime('marquage', art('3d2-sol'), rough=0.5, lueur=LUEUR * 0.8, alpha=True))

# ---------- La façade : bardage sombre à nervures, baie vitrée sous un auvent ----------
HM = 5.6; BX0, BX1, BH = 2.6, 6.2, 2.75                  # la baie : de x = 2,6 à 6,2, haute de 2,75 m
mur = mat_pbr('mur', '#19191B', rough=0.55, metal=0.4)
nerv = mat_pbr('nervure', '#222225', rough=0.34, metal=0.9)
box('mur-g', BX0 + 20, 0.3, HM, ((BX0 - 20) / 2, 0.15, HM / 2), mat=mur)
box('mur-d', 20, 0.3, HM, (BX1 + 10, 0.15, HM / 2), mat=mur)
box('mur-h', BX1 - BX0, 0.3, HM - BH, ((BX0 + BX1) / 2, 0.15, (HM + BH) / 2), mat=mur)
bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
nm = bpy.data.meshes.new('nervure'); bm.to_mesh(nm); bm.free(); nm.materials.append(nerv)
PASN = 0.22
for i in range(-70, 90):
    x = i * PASN + 0.05
    dans = BX0 - 0.1 < x < BX1 + 0.1
    z0 = BH + 0.02 if dans else 0.0
    o = link(bpy.data.objects.new(f'nerv{i}', nm)); o.scale = (0.07, 0.045, HM - z0); o.location = (x, -0.0225, (HM + z0) / 2)
box('acrotere', 60, 0.42, 0.1, (5, 0.1, HM + 0.05), mat=sombre)
# La baie : cadre, vitres, montants, et l'atelier derrière
box('baie-cadre-h', BX1 - BX0 + 0.16, 0.34, 0.08, ((BX0 + BX1) / 2, 0.13, BH + 0.04), mat=sombre)
for x in (BX0 - 0.04, BX1 + 0.04, BX0 + 1.2, BX0 + 2.4): box(f'baie-m{x}', 0.07, 0.12, BH, (x, 0.2, BH / 2), mat=sombre)
box('baie-traverse', BX1 - BX0, 0.1, 0.06, ((BX0 + BX1) / 2, 0.2, 2.15), mat=sombre)
plane('vitre', BX1 - BX0, BH, ((BX0 + BX1) / 2, 0.22, BH / 2), (R(90), 0, 0), mat=mat_vitre('vitre', teinte=(0.9, 0.93, 0.95, 1)))
fond = os.path.join(ROOT, 'photos', 'traceur.jpg')
plane('atelier', 6.4, 4.3, ((BX0 + BX1) / 2 - 0.3, 2.6, 1.75), (R(90), 0, 0), mat=mat_ecran_lum('atelier', fond, cam=opt('atelier', 0.75), diffus=2.5, gloss=0))
plane('atelier-sol', 8, 3, ((BX0 + BX1) / 2, 1.5, 0.01), mat=mat_pbr('atelier-sol', '#2A2A2E', rough=0.25))
for x in (BX0 - 0.6, BX1 + 0.6): box(f'atelier-mur{x}', 0.1, 2.6, HM, (x, 1.5, HM / 2), mat=mur)
box('atelier-plafond', 8, 3, 0.1, ((BX0 + BX1) / 2, 1.6, BH + 0.9), mat=mur)
# Une rampe en tête de façade : elle lèche le bardage et fait sortir les nervures
for k, (x0, x1) in enumerate(((-14.0, BX0 - 0.9), (BX1 + 0.9, 16.0))):
    area(f'leche{k}', ((x0 + x1) / 2, -0.32, HM + 0.02), ((x0 + x1) / 2, -0.12, 0), opt('leche', 9.0) * (x1 - x0), size=x1 - x0, size_y=0.05, color=(0.82, 0.8, 1.0), spread=R(70))
a_in = area('atelier-lum', ((BX0 + BX1) / 2, 1.9, 2.6), ((BX0 + BX1) / 2, -2.5, 0), opt('interieur', 260.0), size=2.6, size_y=0.6, color=(0.92, 0.96, 1.0))
# L'auvent : une dalle sombre, un filet fluo en rive, une rampe de lumière dessous
AX0, AX1, AZ, AP = BX0 - 0.7, BX1 + 0.7, 3.05, opt('auvent', 1.7)
box('auvent', AX1 - AX0, AP, 0.2, ((AX0 + AX1) / 2, -AP / 2, AZ + 0.1), mat=mat_pbr('auvent', '#101012', rough=0.45, metal=0.6), bevel=0.004)
box('auvent-rive', AX1 - AX0 - 0.04, 0.012, 0.035, ((AX0 + AX1) / 2, -AP - 0.006, AZ + 0.045), mat=mat_lum('rive', K['fluo'], cam=1.0, diffus=3.0))
box('auvent-rampe', AX1 - AX0 - 1.2, 0.07, 0.02, ((AX0 + AX1) / 2, -AP + 0.5, AZ - 0.01), mat=mat_lum('rampe', '#F4F6FF', cam=1.0, diffus=1.0))
r = area('rampe', ((AX0 + AX1) / 2, -AP + 0.5, AZ - 0.03), ((AX0 + AX1) / 2, -AP + 0.5, 0), opt('rampe', 420.0), size=AX1 - AX0 - 1.2, size_y=0.06, color=(0.94, 0.96, 1.0))

# ---------- L'enseigne : le Cran fluo et « Custom.fr » blanc, lettres lumineuses décollées du bardage ----------
EH = opt('eh', 0.62); EX, EZ = (BX0 + BX1) / 2 + opt('ex', 0.2), opt('ez', 4.62)
# Lettres-boîtiers : le chant est sombre, seule la face éclaire (sinon, vues d'en bas, les lettres s'empâtent)
logo_complet('enseigne-chant', EH, extrude=0.06, mat=sombre, loc=(EX, -0.045 - 0.05 - 0.03, EZ), rot=(R(90), 0, 0))
logo_complet('enseigne', EH, extrude=0.003, mat=mat_lum('ens-blanc', '#FFFFFF', cam=0.92, diffus=opt('jet', 5.0)),
             mat_sym=mat_lum('ens-fluo', K['fluo'], cam=1.0, diffus=opt('jet', 5.0)), loc=(EX, -0.045 - 0.05 - 0.03 - 0.0318, EZ), rot=(R(90), 0, 0))
dos = logo_complet('enseigne-dos', EH, extrude=0.004, mat=mat_emit('dos', hex_rgb('#F2F4FF'), opt('halo', 16.0)),
                   mat_sym=mat_emit('dos-f', hex_rgb(K['fluo']), opt('halo', 16.0) * 1.3), loc=(EX, -0.052, EZ), rot=(R(90), 0, 0))
for c in dos.children: c.visible_camera = False; c.visible_glossy = False

# ---------- Le totem ----------
def totem(name, loc, rz):
    H = 3.0; objs = []
    objs.append(cyl(name + '-mat', 0.05, H, (0, 0, H / 2), mat=fluo, seg=64))
    objs.append(cyl(name + '-coiffe', 0.05, 0.004, (0, 0, H + 0.002), mat=fluo, seg=64))
    objs.append(cyl(name + '-platine', 0.17, 0.014, (0, 0, 0.007), mat=fluo, seg=64, bevel=0.002))
    for k in range(4):
        a = R(45 + 90 * k); objs.append(cyl(f'{name}-boulon{k}', 0.014, 0.012, (0.125 * math.cos(a), 0.125 * math.sin(a), 0.02), mat=sombre, seg=6))
    # Le panneau-flèche : deux plaques qui pincent le mât, comme sur l'original
    fx0, fx1, fh, pointe, fz = -0.42, 0.90, 0.54, 0.27, 2.60
    pts = [(fx0, -fh / 2), (fx1 - pointe, -fh / 2), (fx1, 0), (fx1 - pointe, fh / 2), (fx0, fh / 2)]
    for k, y in enumerate((-0.074, 0.074)):
        objs.append(plaque(f'{name}-fleche{k}', pts, 0.026, mat=fluo, rayon=0.035, bevel=0.003, loc=(0, y, fz), rot=(R(90), 0, 0)))
    for x in (-0.2, 0.3):
        objs.append(cyl(f'{name}-entretoise{x}', 0.016, 0.13, (x, 0, fz + 0.16), (R(90), 0, 0), mat=fluo, seg=24))
        objs.append(cyl(f'{name}-entretoise-b{x}', 0.016, 0.13, (x, 0, fz - 0.16), (R(90), 0, 0), mat=fluo, seg=24))
    # Le Cran, en plaque noire rapportée (3 mm), centré sur le corps de la flèche
    ch = 0.31; cx = (fx0 + fx1 - pointe) / 2 + 0.03
    objs.append(logo(name + '-cran', height=ch, extrude=0.004, mat=encre, part='symbole', loc=(cx, -0.074 - 0.013 - 0.002, fz - ch / 2)))
    # Le panneau d'univers : 0,80 × 1,00 m, déporté vers la droite du mât
    pw, phh, px, pz = 0.80, 1.00, 0.25, 1.60
    objs.append(rrect(name + '-panneau', pw, phh, 0.03, 0.03, bevel=0.003, mat=fluo, loc=(px, -0.074, pz), rot=(R(90), 0, 0)))
    objs.append(screen_v(name + '-plan', pw, phh, (px, -0.074 - 0.015 - 0.0006, pz), mat_imprime('plan', art('3d2-plan'), rough=0.55, lueur=LUEUR, alpha=True, spec=0.15)))
    objs.append(box(name + '-patte', 0.2, 0.06, 0.05, (0.06, -0.035, pz + 0.3), mat=fluo))
    objs.append(box(name + '-patte2', 0.2, 0.06, 0.05, (0.06, -0.035, pz - 0.3), mat=fluo))
    return groupe(name, objs, loc=loc, rot=(0, 0, rz))

TX, TY = opt('tx', -1.55), opt('ty', -4.4)
totem('totem', (TX, TY, 0), R(opt('trz', -9.0)))

# ---------- Les drapeaux : mât sombre, potence, voile légèrement ondulée ----------
def drapeau(name, image, loc, rz=0.0, w=0.75, h=2.6, zb=0.85, seed=1, onde=0.11):
    rnd = random.Random(seed); ph = rnd.uniform(0, 6.28); objs = []
    objs.append(cyl(name + '-mat', 0.022, zb + h + 0.12, (0, 0, (zb + h + 0.12) / 2), mat=sombre, seg=24))
    objs.append(cyl(name + '-potence', 0.012, w + 0.04, (w / 2, 0, zb + h + 0.03), (0, R(90), 0), mat=sombre, seg=16))
    objs.append(cyl(name + '-pied', 0.2, 0.03, (0, 0, 0.015), mat=sombre, seg=48, bevel=0.004))
    nx, nz = 14, 44
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); V = []
    for j in range(nz + 1):
        row = []
        for i in range(nx + 1):
            u, v = i / nx, j / nz
            libre = u * (1 - 0.75 * v)                           # le bas et le bord libre bougent le plus
            y = onde * libre * math.sin(5.2 * u + 3.1 * v + ph) + 0.4 * onde * libre * math.sin(11 * v + 2 * ph)
            # le tissu qui ondule raccourcit : le bord libre rentre un peu, et le coin bas se relève (silhouette de drapeau)
            retrait = 0.045 * libre * (1 + math.sin(7.0 * v + ph))
            leve = 0.05 * u * u * (1 - v) ** 3 + 0.012 * u * (1 - v) * math.sin(9 * u + ph)
            row.append(bm.verts.new((0.03 + u * w - retrait, y, zb + v * h + leve)))
        V.append(row)
    for j in range(nz):
        for i in range(nx):
            f = bm.faces.new((V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i])); f.smooth = True
            for l, uv_ in zip(f.loops, ((i / nx, j / nz), ((i + 1) / nx, j / nz), ((i + 1) / nx, (j + 1) / nz), (i / nx, (j + 1) / nz))): l[uvl].uv = uv_
    bm.normal_update(); me = bpy.data.meshes.new(name + '-voile'); bm.to_mesh(me); bm.free()
    me.materials.append(mat_imprime(name + '-img', image, rough=0.7, lueur=LUEUR * 0.9, spec=0.15))
    objs.append(link(bpy.data.objects.new(name + '-voile', me)))
    return groupe(name, objs, loc=loc, rot=(0, 0, rz))

DY = opt('dy', -1.35)
drapeau('drapeau-c', art('3d2-drapeau-c'), (opt('d1', -4.92), DY, 0), R(8), seed=2)
drapeau('drapeau-b', art('3d2-drapeau-b'), (opt('d2', -3.78), DY, 0), R(5), seed=5)
drapeau('drapeau-a', art('3d2-drapeau-a'), (opt('d3', -2.64), DY, 0), R(3), seed=9)
# Des projecteurs encastrés au pied des drapeaux, et leur lueur sur le bardage
for k, x in enumerate((-4.57, -3.43, -2.29)):
    s = spot(f'pied{k}', (x - 1.0, DY - 1.9, 0.05), (x, DY, 2.2), opt('pieds', 200.0), angle=46, blend=0.8, color=(1.0, 0.98, 0.94), radius=0.04)

# ---------- La lumière ----------
# Un projecteur haut, venu de la gauche de la caméra, pour le totem : le fluo doit rester près de #E2FF21
spot('projecteur', (TX - 2.6, TY - 4.2, 5.2), (TX + 0.25, TY, 1.9), opt('proj', 700.0), angle=30, blend=0.55, color=(1.0, 0.99, 0.96), radius=0.12)
# Un contre-jour froid, très faible, qui détache le mât et la tranche des plaques
spot('contre', (TX + 3.5, TY + 2.8, 3.4), (TX, TY, 2.0), opt('contre', 240.0), angle=40, blend=0.6, color=(0.75, 0.8, 1.0), radius=0.2)

# ---------- La caméra : basse, droite (cadre décalé vers le haut), mise au point sur le totem ----------
CP = (opt('camx', -3.0), opt('camy', -8.6), opt('camz', 0.55))      # (pas d'option « --cy » : Cycles la prend pour une des siennes)
cam = camera(CP, (CP[0] + opt('vx', 0.36), CP[1] + 1.0, CP[2]), lens=opt('lens', 26.0), dof=opt('dof', 4.6), fstop=opt('f', 5.6))
droit(cam, shift_x=opt('sx', 0.0), shift_y=opt('sy', 0.15))
render('41-signaletique.png')
