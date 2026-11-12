# Construit le site à mettre en ligne pour Sillon : l'étude de cas avec des médias allégés, la fiche de marque et les logos.
#   python sillon_site.py <capsule PRJ-2026-096>
# Sortie : <capsule>/40_DELIVERABLES/sillon-identite/ (le dossier du projet Vercel).
import html, io, json, os, shutil, subprocess, sys, zipfile
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
CAPS = os.path.abspath(sys.argv[1])
P = os.path.join(CAPS, '20_WORKING', 'sillon')
DEST = os.path.join(CAPS, '40_DELIVERABLES', 'sillon-identite')
garde = os.path.join(DEST, '.vercel')
tmp = None
if os.path.isdir(garde):  # le lien avec le projet Vercel se garde d'une construction à l'autre
    tmp = os.path.join(CAPS, '40_DELIVERABLES', '_vercel-tmp'); shutil.rmtree(tmp, ignore_errors=True); shutil.move(garde, tmp)
shutil.rmtree(DEST, ignore_errors=True)
for d in ('media', 'fonts', 'fichiers'):
    os.makedirs(os.path.join(DEST, d))
if tmp:
    shutil.move(tmp, garde)

CFG = json.load(io.open(os.path.join(P, 'presentation.json'), encoding='utf-8'))


def taille_video(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', p], capture_output=True, text=True)
    w, h = r.stdout.strip().split(',')[:2]
    return int(w), int(h)


items = []
for src, nom, legende in CFG['planches']:
    p = os.path.join(P, 'out', *src.split('/'))
    if src.endswith('.mp4'):
        shutil.copyfile(p, os.path.join(DEST, 'media', nom + '.mp4'))
        items.append(('video', nom + '.mp4', legende, taille_video(p)))
    else:
        im = Image.open(p).convert('RGB')
        if im.size[0] > 2000:
            im = im.resize((2000, round(im.size[1] * 2000 / im.size[0])), Image.LANCZOS)
        im.save(os.path.join(DEST, 'media', nom + '.jpg'), quality=84, optimize=True, progressive=True)
        items.append(('img', nom + '.jpg', legende, im.size))

# polices de la marque (licence OFL), fiche de marque, logos
nm = os.path.join(P, 'node_modules', '@fontsource-variable')
shutil.copyfile(os.path.join(nm, 'anybody', 'files', 'anybody-latin-wdth-normal.woff2'), os.path.join(DEST, 'fonts', 'anybody.woff2'))
shutil.copyfile(os.path.join(nm, 'hanken-grotesk', 'files', 'hanken-grotesk-latin-wght-normal.woff2'), os.path.join(DEST, 'fonts', 'hanken-grotesk.woff2'))
for f in ('anybody', 'hanken-grotesk'):
    shutil.copyfile(os.path.join(nm, f, 'LICENSE'), os.path.join(DEST, 'fonts', 'LICENCE-' + f + '.txt'))
shutil.copyfile(os.path.join(P, 'out', 'deck', 'sillon-fiche-de-marque.pdf'), os.path.join(DEST, 'fichiers', 'sillon-fiche-de-marque.pdf'))
shutil.copyfile(os.path.join(P, 'brand', 'logo', 'sillon-symbole-jus-bleu.svg'), os.path.join(DEST, 'favicon.svg'))   # l'icône de l'onglet : le symbole
with zipfile.ZipFile(os.path.join(DEST, 'fichiers', 'sillon-logos.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
    d = os.path.join(P, 'brand', 'logo')
    for f in sorted(os.listdir(d)):
        if f.endswith('.svg'):
            z.write(os.path.join(d, f), 'sillon-logos/' + f)

e = html.escape
blocs, i = [], 0


def video(f, cap, dim):
    return f'<video src="media/{f}" muted loop playsinline preload="metadata" width="{dim[0]}" height="{dim[1]}" aria-label="{e(cap)}"></video>'


premiere = True
while i < len(items):
    genre, f, cap, dim = items[i]
    if genre == 'img':
        attente = '' if premiere else ' loading="lazy"'
        premiere = False
        blocs.append(f'<figure><img src="media/{f}" alt="{e(cap)}" width="{dim[0]}" height="{dim[1]}"{attente}></figure>'); i += 1; continue
    if dim[1] < dim[0]:
        blocs.append(f'<figure>{video(f, cap, dim)}</figure>'); i += 1; continue
    groupe = []
    while i < len(items) and items[i][0] == 'video' and items[i][3][1] >= items[i][3][0] and len(groupe) < 3:
        groupe.append(items[i]); i += 1
    blocs.append('<figure class="rangee">' + ''.join(video(f, cap, dim) for _, f, cap, dim in groupe) + '</figure>')

nv = sum(1 for it in items if it[0] == 'video')
titre = 'Sillon — identité de marque d’une cave à vins nature'
page = f'''<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{titre}</title><meta name="robots" content="noindex, nofollow">
<meta name="description" content="Identité de marque de Sillon, cave à vins nature : étude de cas, proposition de KLYRA.">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preload" href="fonts/anybody.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face{{font-family:"Anybody";src:url("fonts/anybody.woff2") format("woff2");font-weight:100 900;font-stretch:50% 150%;font-display:swap}}
@font-face{{font-family:"Hanken Grotesk";src:url("fonts/hanken-grotesk.woff2") format("woff2");font-weight:100 900;font-display:swap}}
*{{box-sizing:border-box;margin:0;padding:0}}
html{{background:#0E1638}}
body{{background:#0E1638;color:#F2EFE4;font-family:"Hanken Grotesk",system-ui,-apple-system,"Segoe UI",sans-serif;font-weight:400;-webkit-font-smoothing:antialiased}}
header{{max-width:1400px;margin:0 auto;padding:72px 32px 56px;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:40px 64px;align-items:end}}
h1{{font-family:"Anybody",system-ui,sans-serif;font-weight:800;font-stretch:100%;font-size:clamp(34px,5vw,68px);line-height:.98;letter-spacing:-.02em}}
h1 span{{display:block;font-size:.36em;font-weight:600;font-stretch:75%;letter-spacing:.08em;text-transform:uppercase;opacity:.72;margin-top:18px;line-height:1.3}}
header p{{font-size:17px;line-height:1.55;opacity:.86;max-width:560px}}
nav{{margin-top:22px;display:flex;gap:10px;flex-wrap:wrap}}
nav a{{font-family:"Anybody",system-ui,sans-serif;font-weight:600;font-stretch:75%;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#0E1638;background:#F2EFE4;text-decoration:none;padding:11px 16px 10px;border-radius:999px}}
nav a:hover,nav a:focus-visible{{background:#FF9B21;outline:none}}
main{{max-width:1400px;margin:0 auto}}
figure{{display:block;line-height:0}}
img,video{{width:100%;height:auto;display:block}}
.rangee{{display:flex;justify-content:center;align-items:center;gap:28px;padding:64px 48px}}
.rangee video{{flex:1 1 0;min-width:0;max-width:400px;border-radius:14px}}
footer{{max-width:1400px;margin:0 auto;padding:48px 32px 88px;font-size:14px;line-height:1.6;opacity:.7}}
footer p+p{{margin-top:10px}}
footer a{{color:inherit}}
@media (max-width:820px){{header{{grid-template-columns:1fr;padding:48px 22px 36px}} .rangee{{flex-direction:column;padding:28px 22px;gap:18px}} .rangee video{{max-width:100%}} footer{{padding:36px 22px 64px}}}}
@media (prefers-reduced-motion:reduce){{video{{display:block}}}}
</style></head>
<body>
<header>
  <h1>Sillon<span>Identité de marque d’une cave à vins nature</span></h1>
  <div><p>{e(CFG['sous_titre'])} {len(items)} pièces, dont {nv} vidéos.</p>
  <nav aria-label="Fichiers"><a href="fichiers/sillon-fiche-de-marque.pdf">Fiche de marque (PDF)</a><a href="fichiers/sillon-logos.zip" download>Fichiers logo (ZIP)</a></nav></div>
</header>
<main>
{chr(10).join(blocs)}
</main>
<footer><p>{e(CFG['pied'])}</p></footer>
<script>
/* Les vidéos ne jouent que lorsqu'elles sont à l'écran ; aucune si la personne a demandé moins de mouvement. */
(function () {{
  var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var videos = [].slice.call(document.querySelectorAll('video'));
  if (calme) {{ videos.forEach(function (v) {{ v.controls = true; }}); return; }}
  if (!('IntersectionObserver' in window)) {{ videos.forEach(function (v) {{ v.play().catch(function () {{}}); }}); return; }}
  var io = new IntersectionObserver(function (es) {{ es.forEach(function (en) {{ if (en.isIntersecting) en.target.play().catch(function () {{}}); else en.target.pause(); }}); }}, {{ rootMargin: '200px 0px' }});
  videos.forEach(function (v) {{ io.observe(v); }});
}})();
</script>
</body></html>'''
io.open(os.path.join(DEST, 'index.html'), 'w', encoding='utf-8', newline='\n').write(page)
io.open(os.path.join(DEST, 'vercel.json'), 'w', encoding='utf-8', newline='\n').write(json.dumps({
    'cleanUrls': True,
    'rewrites': [{'source': '/favicon.ico', 'destination': '/favicon.svg'}],
    'headers': [{'source': '/(.*)', 'headers': [{'key': 'X-Robots-Tag', 'value': 'noindex, nofollow'}]},
                {'source': '/(media|fonts)/(.*)', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=31536000, immutable'}]}],
}, indent=2) + '\n')
poids = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(DEST) for f in fs if '.vercel' not in r)
plus_gros = max(((os.path.getsize(os.path.join(DEST, 'media', f)), f) for f in os.listdir(os.path.join(DEST, 'media'))))
print(len(items), 'pièces,', nv, 'vidéos |', round(poids / 1e6, 1), 'Mo au total | plus gros média :', plus_gros[1], round(plus_gros[0] / 1e6, 1), 'Mo')
