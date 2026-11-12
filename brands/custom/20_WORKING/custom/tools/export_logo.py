# Exporte, depuis le socle brand/marque.js : les polices TTF (pour Blender), les fichiers logo SVG entièrement
# vectorisés (logotype, symbole, version complète, une série par couleur) et brand/logo/logo.json (tracés pour la 3D).
# Usage, depuis la racine du projet :  python tools/export_logo.py
import sys
try: sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
except Exception: pass
import json, os, subprocess, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
# Les contours qui se chevauchent dans une police (fréquent : T, e, a de certaines grotesques) sont mal remplis par Blender :
# le texte 3D sort troué ou faux, sans message. On les fusionne, ce qui demande skia-pathops (pip install skia-pathops).
try:
    import pathops
    from fontTools.ttLib.removeOverlaps import removeOverlaps
except Exception:
    removeOverlaps = None
    print('ATTENTION : skia-pathops absent (pip install skia-pathops). Les contours de la police ne sont pas fusionnés : le texte 3D peut sortir troué.')

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(os.path.join(root, 'brand', 'fonts'), exist_ok=True)
os.makedirs(os.path.join(root, 'brand', 'logo'), exist_ok=True)

# Lire le contrat du socle avec Node (le socle est du JavaScript de navigateur : on lui prête un faux window)
js = ("globalThis.window={};globalThis.document={};await import('file:///" + os.path.join(root, 'brand', 'marque.js').replace(os.sep, '/') + "');"
      "const M=window.Marque;console.log(JSON.stringify({nom:M.NOM,slug:M.SLUG,logo:M.LOGO,lockup:M.LOCKUP,fonts:M.FONTS,couleurs:M.COULEURS_LOGO,word:M.wordPath(),sym:M.symbolPath(),extras:M.fichiersLogo?M.fichiersLogo():null}))")
M = json.loads(subprocess.run(['node', '--input-type=module', '-e', js], capture_output=True, text=True, check=True, encoding='utf-8').stdout)

# Nettoyer ce qui vient d'une autre marque (le projet démarre comme une copie de l'exemple)
# (modifié pour Payout : la police des chiffres, FONTS.chiffres, est exportée et gardée elle aussi)
_garde = [M['fonts']['nom'].replace(' ', '') + '-'] + ([M['fonts']['chiffres']['nom'].replace(' ', '') + '-'] if M['fonts'].get('chiffres') else [])
# (Custom : une police de titre statique et une police large à deux axes sont exportées aussi)
_garde += [M['fonts'][k]['fichier'] for k in ('titre', 'large') if M['fonts'].get(k)]
for sub, keep in (('logo', (M['slug'] + '-',)), ('fonts', tuple(_garde))):
    d = os.path.join(root, 'brand', sub)
    for f in os.listdir(d):
        if f.endswith(('.svg', '.ttf', '.zip')) and not f.startswith(keep):
            os.remove(os.path.join(d, f)); print('retiré (autre marque) :', sub + '/' + f)

# Polices : une variable à instancier, ou des fichiers statiques par graisse
F = M['fonts']; fonts = {}
nm = os.path.join(root, 'node_modules')
for name, w in F['graisses'].items():
    if F.get('variable'):
        f = instancer.instantiateVariableFont(TTFont(os.path.join(nm, F['variable'])), {'wght': w})
    else:
        f = TTFont(os.path.join(nm, F['statiques'][name]))
    f.flavor = None
    if removeOverlaps: removeOverlaps(f)
    p = os.path.join(root, 'brand', 'fonts', f"{F['nom'].replace(' ', '')}-{name}.ttf")
    f.save(p); fonts[name] = TTFont(p)
    print('police', os.path.relpath(p, root))

# Police des chiffres (propre à Payout) : mêmes graisses en TTF, pour un texte 3D en chasse fixe (blender/payout.py : chiffres())
if F.get('chiffres'):
    G = F['chiffres']
    for name, w in G['graisses'].items():
        g = instancer.instantiateVariableFont(TTFont(os.path.join(nm, G['variable'])), {'wght': w})
        g.flavor = None
        if removeOverlaps: removeOverlaps(g)
        p = os.path.join(root, 'brand', 'fonts', f"{G['nom'].replace(' ', '')}-{name}.ttf")
        g.save(p); print('police', os.path.relpath(p, root))

# Police de titre (fichier statique woff -> ttf) et police large (variable instanciée sur plusieurs axes), propres à Custom
for cle in ('titre', 'large'):
    G = F.get(cle)
    if not G: continue
    g = TTFont(os.path.join(nm, G['statique'])) if G.get('statique') else instancer.instantiateVariableFont(TTFont(os.path.join(nm, G['variable'])), G['axes'])
    g.flavor = None
    if removeOverlaps:
        try: removeOverlaps(g)
        except Exception as e: print('  fusion des contours impossible pour', G['fichier'], ':', e)
    p = os.path.join(root, 'brand', 'fonts', G['fichier'] + '.ttf')
    g.save(p); print('police', os.path.relpath(p, root))

def text_path(font, text, x, y, size, tracking=0.0):
    gs = font.getGlyphSet(); cmap = font.getBestCmap(); upm = font['head'].unitsPerEm
    s = size / upm; d = []
    for ch in text:
        g = gs[cmap[ord(ch)]]
        pen = SVGPathPen(gs)
        g.draw(TransformPen(pen, (s, 0, 0, -s, x, y)))
        d.append(pen.getCommands())
        x += g.width * s + tracking
    return ' '.join(d), x

K = M['lockup']; L = M['logo']; slug = M['slug']
tds, xmax = [], 0
for line, base in zip(K['lines'], K['baselines']):
    d, x = text_path(fonts[F['logo']], line, K['x'], base, K['size'], K['tracking'])
    tds.append(d); xmax = max(xmax, x)
desc = ' '.join(tds)
box = list(K['box']); box[2] = round(xmax - box[0]) + 2
vb = lambda b: ' '.join(str(v) for v in b)
svg = lambda b, body: f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb(b)}">{body}</svg>'
def out(kind, cn, s):
    with open(os.path.join(root, 'brand', 'logo', f'{slug}-{kind}-{cn}.svg'), 'w', encoding='utf-8') as fh: fh.write(s)
for cn, c in M['couleurs'].items():
    out('logotype', cn, svg(L['box'], f'<path fill="{c}" fill-rule="evenodd" d="{M["word"]}"/>'))
    out('symbole', cn, svg(L['symbolBox'], f'<path fill="{c}" fill-rule="evenodd" d="{M["sym"]}"/>'))
    out('complet', cn, svg(box, f'<path fill="{c}" fill-rule="evenodd" d="{M["word"]}"/><path fill="{c}" d="{desc}"/>'))
# Fichiers supplémentaires déclarés par le socle (Marque.fichiersLogo : SVG complets où {c} est la couleur)
for cn, c in M['couleurs'].items():
    for kind, s_ in (M.get('extras') or {}).items(): out(kind, cn, s_.replace('{c}', c))
with open(os.path.join(root, 'brand', 'logo', 'logo.json'), 'w', encoding='utf-8') as fh:
    json.dump({'nom': M['nom'], 'slug': slug, 'police': F['nom'].replace(' ', ''),
               'logotype': {'d': M['word'], 'box': L['box'], 'x_height': L['xHeight'], 'baseline': L['baseline']},
               'symbole': {'d': M['sym'], 'box': L['symbolBox'], 'x_height': L['symbolBox'][3], 'baseline': L.get('symbolBaseline', L['symbolBox'][1] + L['symbolBox'][3])},
               'descripteur': {'d': desc, 'box': box, 'x_height': L['xHeight'], 'baseline': L['baseline']}}, fh)
if abs(box[2] - K['box'][2]) > 2:
    print(f"À REPORTER dans brand/marque.js : LOCKUP.box[2] = {box[2]} (largeur réelle de la version complète ; le socle déclare {K['box'][2]}).")
print('logos exportés :', len(M['couleurs']) * 3, 'fichiers SVG + logo.json ; largeur de la version complète', box[2])
