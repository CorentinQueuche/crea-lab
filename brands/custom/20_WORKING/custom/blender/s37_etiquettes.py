# Planche 37 : étiquettes, écusson, emballage, sur l'établi d'expédition (bois sombre, Poly Haven wood_table_worn, CC0).
# Trois étiquettes volantes de 55 × 95 mm (noire, fluo, dos blanc) tenues par un cordon torsadé fluo, une bande d'étiquettes
# tissées de 64 × 22 mm, l'écusson brodé de la planche 02 (48 × 34 mm, vrais fils), un tee-shirt noir plié dans sa
# pochette transparente (270 × 345 mm) avec sa pastille de taille, un carton d'expédition de 220 × 300 × 110 mm fermé par
# un ruban adhésif de 50 mm au motif de blocs, et le rouleau de ruban.
# Visuels : art/3d1-etiquettes.html (bash art/3d1-rendre.sh etiquettes). Matières de tissu : blender/tex/tissu-*.png.
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s37_etiquettes.py -- --draft
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from custom3d1 import *

DRAFT = '--draft' in argv()
reset(2800, 1575, samples=int(opt('samples', 400)))
world_color((0, 0, 0, 1), 0.0)
LU = opt('lueur', 0.20)

# ---------- l'établi : bois usé, assombri
bois = mat_pbr_tex('etabli', 'wood_table_worn', 'wood_table_worn', scale=1.0, tint=opt('bois', '#8A8076'), rough_mul=1.0, bump_strength=1.2)
plane('etabli', 2.4, 2.4, (0, 0.2, 0), mat=bois, uv_m=opt('boisl', 0.7))

# ---------- le carton d'expédition, au fond : kraft, ruban au motif de blocs sur la fente, étiquette d'expédition
BW, BL, BH = 0.22, 0.30, opt('bh', 0.075)
kraft = mat_kraft('kraft', '#A98458', cannelure=0.0)
ruban_h = mat_print('ruban-h', art('ruban'), rough=0.28, coat=0.25, fluo=LU, ext='REPEAT', echelle=(BL / 0.2, 1))
RV = 0.048
ruban_v = mat_print('ruban-v', art('ruban'), rough=0.28, coat=0.25, fluo=LU, ext='REPEAT', echelle=(RV / 0.2, 1))
carton = [box('carton', BW, BL, BH, (0, 0, BH / 2), mat=kraft, bevel=0.0018, uv_m=0.3),
          plane('fente', 0.0016, BL - 0.004, (0, 0, BH + 0.00005), mat=mat_pbr('fente', '#2A1D10', rough=0.9)),
          plane('ruban-dessus', BL + 0.0006, 0.05, (0, 0, BH + 0.00025), (0, 0, R(90)), mat=ruban_h),
          plane('ruban-devant', RV, 0.05, (0, -BL / 2 - 0.00025, BH - RV / 2), (R(90), R(90), 0), mat=ruban_v),
          plane('ruban-derriere', RV, 0.05, (0, BL / 2 + 0.00025, BH - RV / 2), (R(90), R(90), R(180)), mat=ruban_v),
          screen_v('etiquette-exp', 0.09, 0.06, (-0.060, -BL / 2 - 0.0003, BH / 2 - 0.002), mat_print('etiquette-exp', art('carton-etiquette'), rough=0.5, bump=0.05, fluo=LU), rot_z=0.0)]
groupe('carton-g', carton, loc=(opt('bx', 0.085), opt('by', 0.315), 0), rot=(0, 0, R(opt('brz', 14.0))))

# ---------- le rouleau de ruban adhésif, couché à plat
RX, RY = opt('rx', -0.185), opt('ry', 0.205)
rouleau = [cyl_uv('rouleau-flanc', 0.0502, 0.05, mat_side=mat_print('ruban-r', art('ruban'), rough=0.25, coat=0.3, fluo=LU, ext='REPEAT', echelle=(1.5, 1)), cap_top=False, cap_bottom=False, rot_z=R(25)),
           tour('rouleau-corps', [(0.0385, 0), (0.05, 0), (0.05, 0.05), (0.0385, 0.05), (0.0385, 0)], mat=mat_teinte('ruban-tranche', '#B9CF1E', rough=0.35, lueur=0.05, coat=0.3)),
           tour('rouleau-mandrin', [(0.0352, 0), (0.0385, 0), (0.0385, 0.0502), (0.0352, 0.0502), (0.0352, 0)], mat=kraft)]
groupe('rouleau', rouleau, loc=(RX, RY, 0))

# ---------- le tee-shirt plié dans sa pochette transparente
TW, TH = 0.26, 0.32
PX, PY, PRZ = opt('px', 0.160), opt('py', -0.03), R(opt('prz', -10.0))
tee = mat_print('tee', art('tee-plie'), rough=0.85, fluo=LU, relief=tex('tissu-coton.png'), relief_force=0.5, relief_dist=0.0002, relief_echelle=(TW / 0.05, TH / 0.05))
drape('tee', TW, TH, mat=tee, loc=(PX, PY, 0.0004), rz=PRZ, pas=0.004 if DRAFT else 0.0025, plis=0.0035, echelle=9.0, seed=2.0, bord=0.014, relief=lambda X, Y: 0.019 + 0 * X)
film = mat_plastique('pochette', froisse=opt('froisse', 0.16), echelle=opt('fe', 16.0), voile=opt('voile', 0.02), rough=0.035)
drape('pochette', TW + 0.022, TH + 0.04, mat=film, loc=(PX + 0.012 * math.sin(-PRZ) * 0, PY, 0.0006), rz=PRZ, pas=0.004 if DRAFT else 0.0025, plis=0.0042, echelle=11.0, seed=5.0, bord=0.02,
      relief=lambda X, Y: 0.0218 + 0 * X)
def sur_pochette(dx, dy, z):
    return (PX + dx * math.cos(PRZ) - dy * math.sin(PRZ), PY + dx * math.sin(PRZ) + dy * math.cos(PRZ), z)
plane('pastille', 0.04, 0.04, sur_pochette(-0.070, -0.105, 0.0294), (R(1.5), R(-2.0), PRZ + R(-8)), mat=mat_print('pastille', art('pastille'), rough=0.4, fluo=LU, alpha=True))

# ---------- les trois étiquettes volantes, en éventail sur le même cordon
EX, EY = opt('ex', -0.125), opt('ey', -0.005)
def tag(nom, img, dos, rot, dz, tranche):
    a = R(rot); oy = 0.095 / 2 - 0.009          # l'étiquette tourne autour de son œillet
    cx = EX + oy * math.sin(a); cy = EY - oy * math.cos(a)
    return etiquette(nom, 0.055, 0.095, art(img), (cx, cy, dz), a, tranche=tranche, dos=art(dos), fluo=LU)
tag('tag-dos', 'tag-dos', 'tag-noir', 44, 0.0, '#E9E9E6')
tag('tag-fluo', 'tag-fluo', 'tag-dos', 9, 0.0008, '#C8E01A')
_, oe = tag('tag-noir', 'tag-noir', 'tag-dos', -27, 0.0016, '#0A0A0B')
fluo_c = mat_fil('cordon-fluo', C['fluo'], rough=0.5, lueur=0.10, spec=0.12)
cordon('cordon', [(oe[0] + 0.0006, oe[1] - 0.0005, oe[2] + 0.0004), (oe[0] - 0.006, oe[1] + 0.012, 0.0022), (oe[0] - 0.026, oe[1] + 0.034, 0.0006), (oe[0] - 0.060, oe[1] + 0.052, 0.0006),
                  (oe[0] - 0.088, oe[1] + 0.034, 0.0006), (oe[0] - 0.080, oe[1] + 0.004, 0.0006), (oe[0] - 0.050, oe[1] - 0.004, 0.0006), (oe[0] - 0.020, oe[1] + 0.006, 0.0012),
                  (oe[0] - 0.004, oe[1] + 0.004, 0.0026), (oe[0] - 0.0006, oe[1] + 0.0005, oe[2] + 0.0004)], r=0.0006, mat=fluo_c, seed=3)

# ---------- la bande d'étiquettes tissées (deux étiquettes, un bout qui se relève)
LW, LH = 0.128, 0.022
tisse = mat_print('tissee', art('tissee'), rough=0.7, fluo=LU, ext='REPEAT', echelle=(2, 1), relief=tex('tissu-serge.png'), relief_force=0.6, relief_dist=0.00012, relief_echelle=(LW / 0.012, LH / 0.012))
bande = grille_relief('tissee', LW, LH, 0.001, lambda X, Y: 0.0010 + 0.0052 * np.clip((X - 0.02) / 0.044, 0, 1) ** 2.2 + 0.0006 * np.sin(X * 70), mat=tisse,
                      loc=(opt('lx', -0.068), opt('ly', -0.110), 0))
bande.rotation_euler = (0, 0, R(opt('lrz', 16.0)))

# ---------- l'écusson brodé (celui de la planche 02)
ecusson('ecusson', loc=(opt('qx', -0.022), opt('qy', 0.062), 0), rz=R(opt('qrz', -12.0)), pas_tissu=0.00009 if DRAFT else 0.00006, res=1 if DRAFT else 2, lueur=0.10)

# ---------- lumière : rasante froide de l'arrière gauche découpée par des volets, appoint chaud à droite, nappe douce
SP = (-1.0, 0.95, opt('sz', 0.55))
spot('rasante', SP, (0.0, 0.02, 0.0), opt('key', 104.0), angle=38, blend=0.5, color=(0.92, 0.97, 1.0), radius=0.02)
volet('volet1', (-0.62, 0.50, 0.32), SP, l=0.06, h=0.9)
volet('volet2', (-0.50, 0.70, 0.32), SP, l=0.03, h=0.9)
area('chaud', (0.80, -0.05, 0.34), (0.10, 0.0, 0.03), opt('chaud', 9.0), size=0.5, size_y=0.2, color=(1.0, 0.80, 0.60))
area('nappe', (0.0, -0.3, 1.1), (0, 0, 0), opt('nappe', 8.0), size=1.2, color=(0.93, 0.97, 1.0))
# une « fenêtre » au fond, visible seulement dans les reflets : elle dessine le film de la pochette et le ruban brillant
fen = area('fenetre', (0.25, 1.5, 0.95), (0.1, 0.0, 0.0), opt('fenetre', 2.2), size=1.3, size_y=0.35, color=(0.9, 0.96, 1.0)); fen.visible_diffuse = False

cam = camera((opt('camx', -0.13), opt('camy', -0.56), opt('camz', 0.38)), (opt('tx', -0.025), opt('ty', 0.03), 0.012), lens=opt('lens', 58.0), dof=1.0, fstop=opt('f', 4.0))
net = Vector((EX + 0.01, EY - 0.04, 0.002))
cam.data.dof.focus_distance = (net - cam.location).length
rendre('37-etiquettes.png')
