"""Extrait le logo officiel du GRDR, en tracés, de la dernière page du rapport d'activité 2025.

Source : https://www.grdr.org/IMG/pdf/grdr_ra_2025_web.pdf (page 88), convertie par
`pdftocairo -svg -f 88 -l 88` en `_prep/sources/ra2025-p88.svg`.
Rien n'est redessiné : les tracés sont recopiés, puis recalés dans le repère du socle
(hauteur d'x du mot « grdr » = 100, ligne de base à y = 100, bord gauche du g à x = 0).

Sortie : `_prep/logo_officiel.json` (lu une fois pour écrire brand/marque.js) et
`_prep/logo_officiel.svg` (contrôle visuel, à superposer au PNG du site grdr.org).
"""
import json
import re
import sys
from pathlib import Path

ICI = Path(__file__).resolve().parent
SRC = ICI / 'sources' / 'ra2025-p88.svg'

# Couleurs relevées dans le PDF (pourcentages RVB écrits par pdftocairo)
ORANGE = (90.823364, 32.720947, 18.878174)   # « grdr »
OCRE = (69.995117, 37.374878, 14.326477)     # le symbole
LAGUNE = (15.937805, 42.405701, 43.232727)   # Migrations Citoyenneté Solidarités
ZONE = (410, 256, 546, 326)                  # le logo sur la page, en points

NUM = r'-?\d+\.?\d*(?:e-?\d+)?'


def hexa(rvb):
    return '#' + ''.join(f'{round(v * 2.55):02X}' for v in rvb)


def lire(d):
    """Découpe un attribut d (commandes absolues M L C Z) en [(cmd, [x, y, ...])]."""
    out = []
    for cmd, args in re.findall(r'([MLCZHV])([^MLCZHV]*)', d):
        out.append((cmd, [float(x) for x in re.findall(NUM, args)]))
    return out


def main():
    s = SRC.read_text(encoding='utf-8')
    s = re.sub(r'xlink:href="data:[^"]*"', 'xlink:href=""', s)
    pieces = {'mot': [], 'symbole': [], 'descripteur': []}
    for m in re.finditer(r'<path\b([^>]*)>', s):
        a = m.group(1)
        f = re.search(r'fill="rgb\(([\d.]+)%, ([\d.]+)%, ([\d.]+)%\)"', a)
        d = re.search(r'\bd="([^"]*)"', a)
        if not f or not d:
            continue
        rvb = tuple(float(x) for x in f.groups())
        cle = None
        for nom, ref in (('mot', ORANGE), ('symbole', OCRE), ('descripteur', LAGUNE)):
            if all(abs(u - v) < 0.01 for u, v in zip(rvb, ref)):
                cle = nom
        if not cle:
            continue
        if 'transform=' in a:
            sys.exit('tracé avec transformation : cas non prévu, à traiter avant de continuer')
        cmds = lire(d.group(1))
        xs = [v for c, args in cmds for v in args[0::2]]
        ys = [v for c, args in cmds for v in args[1::2]]
        if not xs or min(xs) < ZONE[0] or max(xs) > ZONE[2] or min(ys) < ZONE[1] or max(ys) > ZONE[3]:
            continue
        pieces[cle].append({'cmds': cmds, 'bbox': [min(xs), min(ys), max(xs), max(ys)]})

    # Le mot : 4 lettres, de gauche à droite (g, r, d, r)
    pieces['mot'].sort(key=lambda p: p['bbox'][0])
    assert len(pieces['mot']) == 4, len(pieces['mot'])
    assert len(pieces['symbole']) == 5, len(pieces['symbole'])
    g, r1, dd, r2 = pieces['mot']
    x0 = g['bbox'][0]
    base = r1['bbox'][3]                       # bas du premier r = ligne de base
    haut_x = r1['bbox'][3] - r1['bbox'][1]     # hauteur d'x
    k = 100 / haut_x

    def recale(cmds):
        d = ''
        for c, args in cmds:
            if c == 'Z':
                d += 'Z '
                continue
            pts = []
            for i in range(0, len(args), 2):
                pts.append(f'{round((args[i] - x0) * k, 1):g},{round((args[i + 1] - base) * k + 100, 1):g}')
            d += c + ' '.join(pts) + ' '
        return d.strip()

    def boite(ps):
        b = [min(p['bbox'][0] for p in ps), min(p['bbox'][1] for p in ps), max(p['bbox'][2] for p in ps), max(p['bbox'][3] for p in ps)]
        return [round((b[0] - x0) * k, 1), round((b[1] - base) * k + 100, 1), round((b[2] - b[0]) * k, 1), round((b[3] - b[1]) * k, 1)]

    # Le descripteur : trois lignes, rangées par ordonnée puis par abscisse
    desc = sorted(pieces['descripteur'], key=lambda p: (p['bbox'][1] + p['bbox'][3]) / 2)
    lignes, cour = [], [desc[0]]
    for p in desc[1:]:
        cy, py = (p['bbox'][1] + p['bbox'][3]) / 2, (cour[-1]['bbox'][1] + cour[-1]['bbox'][3]) / 2
        # la ligne penche : on compare au tracé le plus proche en abscisse dans la ligne courante
        ref = min(cour, key=lambda q: abs(q['bbox'][0] - p['bbox'][0]))
        if abs(cy - (ref['bbox'][1] + ref['bbox'][3]) / 2) > 5.2:
            lignes.append(cour)
            cour = [p]
        else:
            cour.append(p)
    lignes.append(cour)
    lignes = [sorted(l, key=lambda p: p['bbox'][0]) for l in lignes]

    tout = pieces['mot'] + pieces['symbole'] + pieces['descripteur']
    sortie = {
        'source': 'grdr_ra_2025_web.pdf, page 88',
        'echelle': round(k, 5),
        'couleurs': {'orange': hexa(ORANGE), 'ocre': hexa(OCRE), 'lagune': hexa(LAGUNE)},
        'mot': {'lettres': [recale(p['cmds']) for p in pieces['mot']], 'boites': [boite([p]) for p in pieces['mot']], 'boite': boite(pieces['mot'])},
        'symbole': {'pieces': [recale(p['cmds']) for p in pieces['symbole']], 'boites': [boite([p]) for p in pieces['symbole']], 'boite': boite(pieces['symbole'])},
        'descripteur': {'lignes': [' '.join(recale(p['cmds']) for p in l) for l in lignes], 'boites': [boite(l) for l in lignes], 'boite': boite(pieces['descripteur']), 'lettres': [len(l) for l in lignes]},
        'boite': boite(tout),
    }
    (ICI / 'logo_officiel.json').write_text(json.dumps(sortie, ensure_ascii=False), encoding='utf-8')
    b = sortie['boite']
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{b[0] - 20} {b[1] - 20} {b[2] + 40} {b[3] + 40}">'
    svg += f'<path fill="{hexa(ORANGE)}" d="{" ".join(sortie["mot"]["lettres"])}"/>'
    svg += f'<path fill="{hexa(OCRE)}" d="{" ".join(sortie["symbole"]["pieces"])}"/>'
    svg += f'<path fill="{hexa(LAGUNE)}" d="{" ".join(sortie["descripteur"]["lignes"])}"/></svg>'
    (ICI / 'logo_officiel.svg').write_text(svg, encoding='utf-8')
    print('échelle', round(k, 4), '| boîte', b)
    print('mot', sortie['mot']['boite'], [x for x in sortie['mot']['boites']])
    print('symbole', sortie['symbole']['boite'])
    print('descripteur', sortie['descripteur']['boite'], sortie['descripteur']['lettres'], sortie['descripteur']['boites'])
    print('couleurs', sortie['couleurs'])
    print('poids', len(json.dumps(sortie)))


main()
