# Aides propres aux scènes de Payout : marque sombre, scènes de nuit, lumière verte (Net) et écrans lumineux.
# S'appuie sur lib.py et objets.py (bibliothèques communes du skill), sans les modifier.
# Usage dans une scène :  from payout import *   (donne aussi tout lib et tout objets : reset, logo, mat_floor, mat_screen, carte…)
import bpy, math, os
import lib
from lib import *
from objets import *

# Palette de la marque : mêmes codes que brand/marque.css
C = dict(coffre='#060A08', ardoise='#101713', acier='#7B8782', releve='#EEF1F2', blanc='#FFFFFF', net='#36FF72', preleve='#FF5B35',
         net200='#A3FFBF', net700='#0B983A', net900='#08371A')
PART = dict(avant=54, apres=85)

def nuit(force=0.02):
    """Fond de scène : le noir Coffre, à peine éclairant. Les objets lumineux font la lumière."""
    world_color(hex_rgb(C['coffre']), force)

def sol_sombre(taille=40, rough=0.16):
    """Sol sombre et brillant (verre sombre) : il reflète les écrans et les lettres lumineuses."""
    return plane('sol', taille, taille, (0, 0, 0), mat=mat_floor('sol', color=C['coffre'], rough=rough, var=0.08, bump=0.012, scale=5.0))

def mat_net(name='net', force=4.0):
    """Le vert électrique en lumière : lettres, jauge, filets lumineux."""
    return mat_emit(name, hex_rgb(C['net']), force)

def chiffres(name, body, size, font='Medium', loc=(0, 0, 0), rot=(0, 0, 0), mat=None, extrude=0.0, align='LEFT', spacing=1.0):
    """Texte en Chivo Mono, la police des montants et des pourcentages (graisses : Light, Regular, Medium, Bold).
    Les fichiers viennent de tools/export_logo.py (brand/fonts/ChivoMono-*.ttf). Pas de caractère « → » dans cette police."""
    cu = bpy.data.curves.new(name, 'FONT'); cu.body = body; cu.size = size; cu.extrude = extrude
    cu.font = bpy.data.fonts.load(os.path.join(FONTS, f'ChivoMono-{font}.ttf')); cu.align_x = align; cu.space_character = spacing
    o = link(bpy.data.objects.new(name, cu)); o.location = loc; o.rotation_euler = rot
    if mat: cu.materials.append(mat)
    return o

def jauge_segments(name, longueur, hauteur, ep, p=85, n=20, ecart=0.25, loc=(0, 0, 0), mat_on=None, mat_off=None):
    """La jauge en volume : n segments debout le long de X, les p % premiers en mat_on, les autres en mat_off (ou absents si None).
    ecart : part du pas laissée vide entre deux segments. Posée sur z = loc.z, centrée en X. Bouts droits, jamais arrondis."""
    pas = longueur / n; w = pas * (1 - ecart); on = round(n * p / 100.0); objs = []
    for i in range(n):
        m = mat_on if i < on else mat_off
        if m is None: continue
        objs.append(box(f'{name}-{i}', w, ep, hauteur, (loc[0] - longueur / 2 + pas * (i + 0.5), loc[1], loc[2] + hauteur / 2), mat=m))
    return objs

def jauge_blocs(name, cote, ep, p=85, cols=10, ecart=0.14, loc=(0, 0, 0), mat_on=None, mat_off=None, debout=True):
    """Les 100 blocs en volume (10 × 10), remplis depuis le bas : « sur 100, 85 ». debout : mur face à -Y ; sinon à plat sur le sol.
    cote : côté total en mètres. Centré en X, posé sur z = loc.z (debout) ou centré en Y (à plat)."""
    pas = cote / cols; w = pas * (1 - ecart); on = round(cols * cols * p / 100.0); objs = []
    for k in range(cols * cols):
        r, c = divmod(k, cols); m = mat_on if k < on else mat_off
        if m is None: continue
        x = loc[0] - cote / 2 + pas * (c + 0.5)
        if debout: objs.append(box(f'{name}-{k}', w, ep, w, (x, loc[1], loc[2] + pas * (r + 0.5)), mat=m))
        else: objs.append(box(f'{name}-{k}', w, w, ep, (x, loc[1] - cote / 2 + pas * (r + 0.5), loc[2] + ep / 2), mat=m))
    return objs
