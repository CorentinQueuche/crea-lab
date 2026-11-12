# Télécharge les matières et les ciels Poly Haven (licence CC0) listés dans blender/polyhaven.json vers blender/tex/.
# Format : {"textures": ["concrete_floor_worn_001", ...], "hdris": ["the_sky_is_on_fire", ...], "resolution_hdri": "4k"}
# Chercher des identifiants :  python tools/polyhaven.py --chercher textures concrete     (ou : hdris night)
# Usage, depuis la racine du projet :  python tools/polyhaven.py
import sys
try: sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
except Exception: pass
import json, os, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEX = os.path.join(ROOT, 'blender', 'tex')
UA = {'User-Agent': 'Mozilla/5.0'}
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()

a = sys.argv[1:]
if a and a[0] == '--chercher':
    kind, word = a[1], a[2]
    d = json.loads(get(f'https://api.polyhaven.com/assets?t={kind}'))
    r = [(k, v) for k, v in d.items() if word in k or word in v.get('categories', []) or word in v.get('tags', [])]
    for k, v in sorted(r, key=lambda kv: -kv[1].get('download_count', 0))[:25]:
        print(k, '|', ', '.join(v.get('categories', []))[:90])
    sys.exit()

with open(os.path.join(ROOT, 'blender', 'polyhaven.json'), encoding='utf-8') as f: cfg = json.load(f)
def fetch(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 10000: return 'déjà là'
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    data = get(url)
    with open(dest, 'wb') as fh: fh.write(data)
    return f'{len(data) // 1024} Ko'
for t in cfg.get('textures', []):
    for m in ('diff', 'nor_gl', 'rough'):
        try: print(t, m, fetch(f'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/{t}/{t}_{m}_2k.jpg', os.path.join(TEX, t, f'{t}_{m}_2k.jpg')))
        except Exception as e: print(t, m, 'ÉCHEC', e)
res = cfg.get('resolution_hdri', '4k')
for h in cfg.get('hdris', []):
    try: print(h, fetch(f'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/{res}/{h}_{res}.hdr', os.path.join(TEX, 'hdri', f'{h}_{res}.hdr')))
    except Exception as e: print(h, 'ÉCHEC', e)
