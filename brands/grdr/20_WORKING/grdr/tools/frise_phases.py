"""Redessine la frise « Déroulé du projet » de la page klyra.fr/realisations/grdr (Timeline.svg) dans la direction artistique
du projet. Mêmes dimensions (1076 × 155), mêmes six phases et mêmes durées que la frise publiée. Cette fois chaque phase a
la longueur de sa durée : c'est un trait continu, à bouts ronds, comme le symbole. Texte vectorisé (Nunito, Geist Mono),
pour que le fichier s'affiche sans dépendre des polices du site.

    python tools/frise_phases.py        # écrit out/final/Timeline.svg
"""
import os

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = os.path.join(RACINE, 'brand', 'fonts')
NUNITO = TTFont(os.path.join(F, 'Nunito-ExtraBold.ttf'))
MONO = TTFont(os.path.join(F, 'GeistMono-Medium.ttf'))

# phases et durées publiées (texte alternatif et frise de la page actuelle)
PHASES = [('Cadrage', 3), ('Wireframe', 3), ('Design UI', 5), ('Dév. front', 10), ('Dév. back', 9), ('Déploiement', 3)]
COULEURS = ['#E85330', '#F18873', '#F3B464', '#296C6E', '#3F8C84', '#009F71']   # vermillon, corail, pêche, lagune, lagune claire, émeraude
ENCRE = '#2A1E17'
W, H = 1076, 155


def texte(font, s, x, y, taille, ancre='start', espace=0.0):
    gs = font.getGlyphSet(); cmap = font.getBestCmap(); upm = font['head'].unitsPerEm; k = taille / upm
    larg = sum(gs[cmap[ord(c)]].width * k + espace for c in s) - espace
    if ancre == 'middle': x -= larg / 2
    if ancre == 'end': x -= larg
    d = []
    for c in s:
        g = gs[cmap[ord(c)]]; pen = SVGPathPen(gs); g.draw(TransformPen(pen, (k, 0, 0, -k, x, y))); d.append(pen.getCommands()); x += g.width * k + espace
    return ' '.join(d), larg


total = sum(j for _, j in PHASES)
marge, ep, trou, y = 16, 26, 8, 62
utile = W - 2 * marge - trou * (len(PHASES) - 1)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" fill="none" viewBox="0 0 {W} {H}">']
x = marge
for (nom, jours), c in zip(PHASES, COULEURS):
    l = utile * jours / total
    x0, x1 = x + ep / 2, x + l - ep / 2
    svg.append(f'<path d="M{x0:.1f},{y} H{max(x1, x0 + 0.1):.1f}" stroke="{c}" stroke-width="{ep}" stroke-linecap="round"/>')
    d, _ = texte(MONO, f'{jours} JOURS', x + 2, 30, 10.5, espace=0.9)
    svg.append(f'<path fill="{ENCRE}" fill-opacity=".6" d="{d}"/>')
    d, lg = texte(NUNITO, nom, x + 2, 108, 17, espace=-0.3)
    if lg > l + trou - 4:   # un nom plus long que sa phase : on le pose sur deux niveaux, relié par un filet
        d, lg = texte(NUNITO, nom, x + 2, 134, 17, espace=-0.3)
        svg.append(f'<path d="M{x + 6:.1f},{y + ep / 2 + 6} V118" stroke="{ENCRE}" stroke-opacity=".35" stroke-width="1.2" stroke-linecap="round"/>')
    svg.append(f'<path fill="{ENCRE}" d="{d}"/>')
    x += l + trou
svg.append('</svg>')
os.makedirs(os.path.join(RACINE, 'out', 'final'), exist_ok=True)
with open(os.path.join(RACINE, 'out', 'final', 'Timeline.svg'), 'w', encoding='utf-8') as f:
    f.write(''.join(svg))
print('out/final/Timeline.svg', total, 'jours')
