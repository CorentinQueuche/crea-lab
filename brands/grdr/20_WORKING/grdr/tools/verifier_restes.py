# Cherche dans le projet (sources et livrables) ce qui reste des exemples Aube et Drupe : nom, adresse, signature, chiffres,
# personnes, noms de couleurs. Les termes de la marque en cours ne sont évidemment pas des restes : le script lit son nom
# dans brand/marque.js et ignore l'exemple auquel elle correspond.
# Un projet livré ne doit plus rien contenir de l'exemple. Sort avec le code 1 s'il reste des éléments bloquants.
# Usage, depuis la racine du projet :  python tools/verifier_restes.py [--tout]   (--tout affiche chaque ligne)
import sys
try: sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
except Exception: pass
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Le départ neutre laisse aussi des traces à retirer : la marque factice « Gabarit » et les mentions « À REMPLIR ».
GABARIT = [r'À REMPLIR', r'(?-i:\bGabarit\b)(?!s? de | neutre)', r'gabarit\.example', r'--gab-']
# (GRDR : « aube » est ici le nom d'un lavis du kit, pas la marque d'exemple. Le mot seul n'est plus bloquant dans ce projet ;
#  les autres traces de l'exemple Aube, adresse, signature, chiffres, le restent.)
BLOQUANT = GABARIT + [r'\bdrupe\b', r'drupe-cafe', r'Torr[ée]facteur de quartier', r'rue du Tambour', r'Cueilli m[ûu]r', r'\bGuji\b|\bHuila\b|\bNyeri\b', r'bonjouraube', r'2\s*h\s*07', r'Le jour se l[èe]ve', r'Clair\.\s*(<br>)?\s*Calme', r'Jade Morel', r'Camille Martin', r"l['’]astre", r'Typefool|Sam Miles|\bJor\b']
A_VERIFIER = [r'\b(Fleur|Parche|Pulpe|Cerise|Feuille)\b', r'#CF2145|#1E4A36|#F4ECDD|#F6C3C0|#C7D5A9', r'Bricolage', r'\b(Nuit|Prune|Braise|Aurore|Miel|Brume)\b', r'#1C1122|#4B1838|#C4391A|#FF632B|#FFC46B|#E9E3DE', r'Assistant\s*(<br>|/)?\s*personnel', r'\bOutfit\b', r'KLYRA']
EXT = ('.html', '.js', '.css', '.py', '.md', '.json', '.mjs', '.svg')
SKIP = ('node_modules', 'out', 'tools', '.vercel', 'tex', 'logo', 'fonts', '_pydeps', 'media', 'planches-png', 'guide-media', 'pages', 'vignettes', '__pycache__')
tout = '--tout' in sys.argv
try:
    _js = open(os.path.join(ROOT, 'brand', 'marque.js'), encoding='utf-8').read()
    _slug = (re.search(r"A\.SLUG\s*=\s*'([^']+)'", _js) or re.search(r'SLUG\s*[:=]\s*["\']([^"\']+)', _js)).group(1).lower()
except Exception: _slug = ''
if _slug == 'drupe': BLOQUANT = [p for p in BLOQUANT if not re.search(r'drupe|Torr|Tambour|Cueilli|Guji', p)]; A_VERIFIER = [p for p in A_VERIFIER if not re.search(r'Fleur|CF2145|Bricolage', p)]
if _slug == 'aube': BLOQUANT = [r'\bdrupe\b', r'drupe-cafe']; A_VERIFIER = []
def scan(pats):
    res = {}
    for dp, dn, fs in os.walk(ROOT):
        dn[:] = [d for d in dn if d not in SKIP and not d.startswith('.')]
        for f in fs:
            if not f.endswith(EXT) or (dp.endswith('blender') and f in ('lib.py', 'objets.py')) or f.startswith('_exemple'): continue
            p = os.path.join(dp, f)
            try: lines = open(p, encoding='utf-8').read().split('\n')
            except Exception: continue
            for i, line in enumerate(lines, 1):
                for pat in pats:
                    if re.search(pat, line, re.I if pats is BLOQUANT else 0):
                        res.setdefault(os.path.relpath(p, ROOT), []).append((i, pat, line.strip()[:110])); break
    return res
b = scan(BLOQUANT); v = scan(A_VERIFIER)
for dp, dn, fs in os.walk(ROOT):
    dn[:] = [d for d in dn if d not in ('node_modules', 'out', 'tools', '.vercel', 'tex', '_pydeps', '__pycache__', 'livrables')]
    for f in fs:
        if re.search({'aube': r'drupe|bricolage', 'drupe': r'aube|outfit'}.get(_slug, r'aube|outfit|drupe|bricolage'), f, re.I) and not f.startswith('_exemple') and not f.startswith('aq-'):
            b.setdefault(os.path.relpath(os.path.join(dp, f), ROOT), []).append((0, 'nom de fichier', 'fichier hérité de l\'exemple'))
for titre, r in (('RESTES DE L\'EXEMPLE (bloquant)', b), ('À VÉRIFIER (peut être voulu : couleur ou police reprises)', v)):
    print(f'\n{titre} : {sum(len(x) for x in r.values())} lignes dans {len(r)} fichiers')
    for f, hits in sorted(r.items()):
        print(f'  {f} : {len(hits)}')
        if tout:
            for i, pat, line in hits[:40]: print(f'      l.{i}  {line}')
sys.exit(1 if b else 0)
