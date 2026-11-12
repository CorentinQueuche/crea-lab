# Planche 21 : le cadre de sérigraphie. Cadre aluminium de 520 × 620 mm (profilé de 38 mm), toile à l'émulsion violette,
# le Cran en réserve (24 cm de large, chargé d'encre fluo), raclette de 34 cm (manche de bois, lame orange) posée en biais
# avec son bourrelet d'encre, et dessous le tee-shirt noir où le Cran vient d'être imprimé à la même taille. Le cadre a été
# glissé vers le col pour découvrir l'impression. Établi de contreplaqué (Poly Haven plywood, CC0), fond d'atelier flou,
# lumière chaude à gauche et froide à contre-jour, comme dans photos/serigraphie.jpg.
# Visuels : art/3d1-serigraphie.html (bash art/3d1-rendre.sh serigraphie). Matière du coton : blender/tex/tissu-coton.png.
# Usage, depuis la racine du projet :  blender --factory-startup -b -P blender/s21_serigraphie.py -- --draft
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from custom3d1 import *

DRAFT = '--draft' in argv()
reset(2800, 1575, samples=int(opt('samples', 420)))
world_color((0.006, 0.007, 0.009, 1), 1.0)
LU = opt('lueur', 0.14)

# ---------- l'établi
ply = mat_pbr_tex('etabli', 'plywood', 'plywood', scale=1.0, tint=opt('bois', '#8C8076'), rough_mul=1.0, bump_strength=0.8)
box('etabli', 2.8, 2.3, 0.04, (0.1, 0.42, -0.02), mat=ply, bevel=0.002, uv_m=0.8)

# ---------- le tee-shirt noir, à plat : le Cran vient d'être imprimé (encre plus lisse que le coton)
TX, TY = opt('tx', -0.075), opt('ty', 0.062)
tee = mat_print('tee', art('tee'), rough=0.92, fluo=LU, alpha=True, relief=tex('tissu-coton.png'), relief_force=0.45, relief_dist=0.0003, relief_echelle=(10, 10))
nt = tee.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'); t = next(n for n in nt.nodes if n.type == 'TEX_IMAGE')
sep = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(t.outputs['Color'], sep.inputs[0])
sub = nt.nodes.new('ShaderNodeMath'); sub.operation = 'SUBTRACT'; nt.links.new(sep.outputs[1], sub.inputs[0]); nt.links.new(sep.outputs[2], sub.inputs[1])
mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs[1].default_value = 0.3; mr.inputs[2].default_value = 0.85; mr.inputs[3].default_value = 0.92; mr.inputs[4].default_value = opt('encre', 0.36)
nt.links.new(sub.outputs[0], mr.inputs[0]); nt.links.new(mr.outputs[0], b.inputs['Roughness'])
b.inputs['Specular IOR Level'].default_value = 0.28
# le duvet du coton accroche la lumière rasante, mais pas l'encre : sur l'aplat fluo, ce voile blanc ferait pâlir la couleur
mr2 = nt.nodes.new('ShaderNodeMapRange'); mr2.inputs[1].default_value = 0.3; mr2.inputs[2].default_value = 0.85; mr2.inputs[3].default_value = opt('duvet', 0.21); mr2.inputs[4].default_value = 0.0
nt.links.new(sub.outputs[0], mr2.inputs[0]); nt.links.new(mr2.outputs[0], b.inputs['Sheen Weight'])
b.inputs['Sheen Roughness'].default_value = 0.5; b.inputs['Sheen Tint'].default_value = (0.5, 0.52, 0.56, 1)
mr3 = nt.nodes.new('ShaderNodeMapRange'); mr3.inputs[1].default_value = 0.3; mr3.inputs[2].default_value = 0.85; mr3.inputs[3].default_value = 0.28; mr3.inputs[4].default_value = opt('encre_spec', 0.12)
nt.links.new(sub.outputs[0], mr3.inputs[0]); nt.links.new(mr3.outputs[0], b.inputs['Specular IOR Level'])
# les côtes du jersey : un relief fin et régulier, dans le sens de la hauteur du vêtement (1,2 mm de pas)
tc_ = nt.nodes.new('ShaderNodeTexCoord'); wv = nt.nodes.new('ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'X'; wv.inputs['Scale'].default_value = 262
wv.inputs['Distortion'].default_value = 0.6; wv.inputs['Detail'].default_value = 1.0
nt.links.new(tc_.outputs['Object'], wv.inputs['Vector'])
bj = nt.nodes.new('ShaderNodeBump'); bj.inputs['Strength'].default_value = opt('cotes', 0.55); bj.inputs['Distance'].default_value = 0.0004
prec = b.inputs['Normal'].links[0].from_socket
nt.links.new(wv.outputs[0], bj.inputs['Height']); nt.links.new(prec, bj.inputs['Normal']); nt.links.new(bj.outputs[0], b.inputs['Normal'])
drape('tee', 0.8, 0.8, mat=tee, loc=(TX, TY, 0.0005), pas=0.006 if DRAFT else 0.004, plis=opt('plis', 0.009), echelle=opt('plie', 4.2), seed=opt('plig', 4.0))

# ---------- le cadre : quatre profilés d'aluminium, la toile collée dessous
FW, FL, PF = 0.52, 0.62, 0.038
FX, FY, FR, FZ = opt('fx', 0.135), opt('fy', 0.555), R(opt('fr', -9.0)), 0.0085
alu_y = mat_metal('alu-y', '#B4B7BD', rough=0.3, brosse=0.1, echelle=(700, 5, 700))
alu_x = mat_metal('alu-x', '#B4B7BD', rough=0.3, brosse=0.1, echelle=(5, 700, 700))
toile = mat_print('toile', art('ecran'), rough=opt('toile', 0.62), fluo=LU, bump=0.9)
next(n for n in toile.node_tree.nodes if n.type == 'BSDF_PRINCIPLED').inputs['Specular IOR Level'].default_value = 0.25
ZT = 0.0016                                                  # la toile, dans le repère du cadre
cad = groupe('cadre', [box('barre-g', PF, FL, PF, (-FW / 2 + PF / 2, 0, PF / 2), mat=alu_y, bevel=0.0025),
                       box('barre-d', PF, FL, PF, (FW / 2 - PF / 2, 0, PF / 2), mat=alu_y, bevel=0.0025),
                       box('barre-av', FW - 2 * PF, PF, PF, (0, -FL / 2 + PF / 2, PF / 2), mat=alu_x, bevel=0.0025),
                       box('barre-ar', FW - 2 * PF, PF, PF, (0, FL / 2 - PF / 2, PF / 2), mat=alu_x, bevel=0.0025),
                       plane('toile', FW - 2 * PF, FL - 2 * PF, (0, 0, ZT), mat=toile)], loc=(FX, FY, FZ), rot=(0, 0, FR))

# ---------- la raclette, posée en biais : le fil de la lame sur la toile, le manche appuyé sur l'angle du cadre
SL, SH, ST = 0.34, 0.105, 0.026                              # longueur, hauteur du manche, épaisseur ; la lame dépasse de 25 mm
hetre = mat_bois('manche', 'plywood', scale=3.0, clair=opt('hetre', 1.25), sat=0.9, rough_mul=0.9)
lame = mat_teinte('lame', C['orange'], rough=0.32, coat=0.2)
encre = mat_teinte('encre', C['fluo'], rough=opt('brillant', 0.14), lueur=opt('encre_l', 0.12), coat=0.6, spec=0.6)
HM = 110 * 0.034 / 191.05 * 1.9                              # hauteur du Cran marqué sur le manche (65 mm de large)
rg = groupe('raclette', [box('lame', SL, 0.05, 0.009, (0, 0.025, 0), mat=lame, bevel=0.0012),
                         box('manche', SL, SH, ST, (0, 0.03 + SH / 2, 0), mat=hetre, bevel=0.009, seg=5, uv_m=0.5),
                         box('lame-encre', SL - 0.004, 0.015, 0.0102, (0, 0.0072, 0), mat=encre, bevel=0.002),
                         logo('marque-manche', height=HM, extrude=0.0003, mat=mat_teinte('marque-manche', C['encre'], rough=0.5), part='symbole', loc=(0.105, 0.03 + SH / 2 - HM / 2, ST / 2 + 0.0001), rot=(0, 0, 0))])
TH = R(opt('penche', 26.0)); A = R(opt('biais', 40.0))
u = Vector((math.cos(A), math.sin(A), 0)); n = Vector((math.sin(A), -math.cos(A), 0))           # axe de la raclette ; vers l'intérieur du cadre
z0 = ZT + 0.0048                                             # le dessous de la lame touche la toile
s_ = (PF + (ST / 2) * math.cos(TH) - z0) / math.sin(TH)      # distance, le long de la raclette, du fil de la lame à l'appui sur le cadre
ab = opt('appui', 0.22)                                      # longueur de l'appui entre les deux barres
Ax, Ay = -FW / 2 + PF, FL / 2 - PF - ab * math.sin(A)
M = Vector((Ax + ab * math.cos(A) / 2, Ay + ab * math.sin(A) / 2, 0))
P0 = M + n * (s_ * math.cos(TH)); P0.z = z0
poser(rg, u, -n * math.cos(TH) + Vector((0, 0, math.sin(TH))), P0, parent=cad)

# le bourrelet d'encre : des gouttes fondues le long de la lame, et une langue qui s'étale vers le Cran
rnd = random.Random(5)
mb = bpy.data.metaballs.new('bourrelet'); mb.resolution = 0.0035 if DRAFT else 0.0016; mb.render_resolution = mb.resolution; mb.threshold = 0.6
for i in range(46):
    t_ = (i / 45 - 0.5) * (SL - 0.03)
    k = 0.5 + 0.5 * math.sin(i * 0.9) * rnd.uniform(0.6, 1.0)
    av = 0.002 + 0.011 * k + rnd.uniform(0, 0.004)
    q = P0 + u * t_ + n * av
    el = mb.elements.new(type='BALL'); el.co = (q.x, q.y, 0.006); el.radius = rnd.uniform(0.013, 0.019)
for i in range(10):                                          # la langue d'encre
    t_ = 0.02 + i * 0.004 + rnd.uniform(-0.004, 0.004); av = 0.018 + i * 0.007
    q = P0 + u * t_ + n * av
    el = mb.elements.new(type='BALL'); el.co = (q.x, q.y, 0.004); el.radius = rnd.uniform(0.012, 0.017) * (1 - i * 0.04)
mo = link(bpy.data.objects.new('bourrelet', mb)); mb.materials.append(encre); mo.scale = (1, 1, 0.42); mo.location = (0, 0, ZT)
mo.parent = cad

# ---------- au fond : le pot d'encre fluo, ouvert, et sa spatule
PX_, PY_ = opt('potx', -0.10), opt('poty', 1.05)
blanc = mat_teinte('pot', '#E9E9E6', rough=0.35)
tour('pot', [(0, 0), (0.056, 0), (0.062, 0.105), (0.064, 0.108), (0.064, 0.112), (0.059, 0.112), (0.0575, 0.006), (0, 0.006)], mat=blanc, loc=(PX_, PY_, 0))
tour('pot-encre', [(0, 0.082), (0.0585, 0.082)], mat=encre, loc=(PX_, PY_, 0))
box('spatule', 0.022, 0.19, 0.0015, (PX_ + 0.02, PY_ - 0.03, 0.118), (R(-24), 0, R(18)), mat=mat_metal('spatule', '#C9CBCF', rough=0.25))

# ---------- le fond d'atelier : des lumières lointaines que la profondeur de champ arrondit
rnd = random.Random(int(opt('seed', 7)))
teintes = [((1.0, 0.72, 0.42, 1), 1.0), ((1.0, 0.80, 0.55, 1), 1.0), ((0.72, 0.86, 1.0, 1), 0.9), ((0.80, 0.90, 1.0, 1), 0.8), (hex_rgb(C['fluo']), 0.95), ((1.0, 0.62, 0.35, 1), 1.0)]
for i in range(int(opt('lampes', 40))):
    col, k = rnd.choice(teintes)
    x = rnd.uniform(-1.6, 7.5); y = rnd.uniform(2.6, 6.2); z = rnd.uniform(-0.22, 0.34)
    r = rnd.uniform(0.07, 0.2)
    cyl(f'lampe{i}', r, 0.002, (x, y, z), (R(90), 0, 0), mat=mat_halo(f'lampe{i}', col, rnd.uniform(0.6, 1.7) * k * opt('fond', 1.0), r=r), seg=32)

# ---------- lumière : chaude et latérale à gauche, froide à contre-jour à droite, nappe faible
area('chaude', (-1.25, -0.05, 0.62), (0.0, 0.25, 0.0), opt('chaude', 20.0), size=0.5, size_y=0.35, color=(1.0, 0.84, 0.66))
area('froide', (1.55, 0.85, 0.75), (0.1, 0.45, 0.0), opt('froide', 30.0), size=0.6, size_y=0.3, color=(0.74, 0.88, 1.0))
area('nappe', (0.0, 0.1, 1.5), (0, 0.3, 0), opt('nappe', 4.0), size=1.6, color=(0.92, 0.96, 1.0))

cam = camera((opt('camx', -0.36), opt('camy', -0.27), opt('camz', 0.27)), (opt('cx', 0.04), opt('cy', 0.40), opt('cz', 0.0)), lens=opt('lens', 35.0), dof=1.0, fstop=opt('f', 5.0))
net = Vector((opt('nx', 0.0), opt('ny', 0.30), 0.03))
cam.data.dof.focus_distance = (net - cam.location).length
rendre('21-serigraphie.png')
