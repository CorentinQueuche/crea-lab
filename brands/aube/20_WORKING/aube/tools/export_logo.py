# Exporte les polices statiques (TTF, pour Blender) et les fichiers logo SVG entièrement vectorisés.
import subprocess, os, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(root, 'node_modules', '@fontsource-variable', 'outfit', 'files', 'outfit-latin-wght-normal.woff2')
os.makedirs(os.path.join(root, 'brand', 'fonts'), exist_ok=True)
os.makedirs(os.path.join(root, 'brand', 'logo'), exist_ok=True)
fonts = {}
for name, w in (('Light', 300), ('Regular', 400), ('Medium', 500)):
    f = TTFont(src)
    f = instancer.instantiateVariableFont(f, {'wght': w})
    f.flavor = None
    p = os.path.join(root, 'brand', 'fonts', f'Outfit-{name}.ttf')
    f.save(p)
    fonts[name] = TTFont(p)
    print('police', p)

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

js = "globalThis.window={};globalThis.document={};await import('file:///" + os.path.join(root, 'brand', 'aube.js').replace(os.sep, '/') + "');console.log(window.Aube.wordPath()+'|'+window.Aube.letterPath('a',0))"
word, sym = subprocess.run(['node', '--input-type=module', '-e', js], capture_output=True, text=True, check=True).stdout.strip().split('|')
t1, x1 = text_path(fonts['Regular'], 'Assistant', 486, 42, 52, -0.4)
t2, x2 = text_path(fonts['Regular'], 'personnel', 486, 94, 52, -0.4)
W = round(max(x1, x2)) + 2
colors = {'nuit': '#1C1122', 'blanc': '#FFFFFF', 'aurore': '#FF632B', 'noir': '#0A0609'}
for cn, c in colors.items():
    open(os.path.join(root, 'brand', 'logo', f'aube-logotype-{cn}.svg'), 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -42 442 142"><path fill="{c}" fill-rule="evenodd" d="{word}"/></svg>')
    open(os.path.join(root, 'brand', 'logo', f'aube-symbole-{cn}.svg'), 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="{c}" fill-rule="evenodd" d="{sym}"/></svg>')
    open(os.path.join(root, 'brand', 'logo', f'aube-complet-{cn}.svg'), 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -42 {W} 150"><path fill="{c}" fill-rule="evenodd" d="{word}"/><path fill="{c}" d="{t1} {t2}"/></svg>')
open(os.path.join(root, 'brand', 'lockup-text.js'), 'w').write(f'window.AubeLockup={{w:{W},d:"{t1} {t2}"}};')
print('logos exportés, largeur complet', W)
