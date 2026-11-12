# Assemble la présentation finale dans 40_DELIVERABLES : médias (JPG + MP4), originaux PNG, logos, page index.html.
# python tools/build_presentation.py
import os, shutil, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAPS = os.path.dirname(os.path.dirname(ROOT))
DEST = os.path.join(CAPS, '40_DELIVERABLES', 'aube-presentation')
MEDIA = os.path.join(DEST, 'media'); PNG = os.path.join(DEST, 'planches-png')
LOGO = os.path.join(CAPS, '40_DELIVERABLES', 'aube-logo')
for d in (MEDIA, PNG, LOGO): os.makedirs(d, exist_ok=True)

# (fichier source relatif à out/, nom final, légende)
ORDER = [
    ('final/01-dome.png', '01-ouverture', "Ouverture : le dôme lumineux"),
    ('plates/02-intro.png', '02-presentation', "Présentation"),
    ('plates/03-mots-cles.png', '03-mots-cles', "Mots-clés"),
    ('plates/04-valeurs.png', '04-valeurs', "Valeurs"),
    ('plates/05-construction.png', '05-construction', "Construction du logotype"),
    ('motion/26-logo.mp4', '06-logo-anime', "Révélation du logotype"),
    ('plates/07-logo-variantes.png', '07-logo-variantes', "Logo et variantes"),
    ('motion/08-orbe.mp4', '08-astre', "L'astre"),
    ('plates/06-ecrans.png', '09-ecrans', "Écrans de l'application"),
    ('motion/09-mosaique.mp4', '10-mosaique', "Mosaïque"),
    ('plates/10-palette.png', '11-palette', "Palette"),
    ('plates/11-degrades.png', '12-degrades', "Dégradés"),
    ('final/12-cartes-enseigne.png', '13-cartes-enseigne', "Cartes de visite et enseigne"),
    ('plates/13-typographie.png', '14-typographie', "Typographie"),
    ('final/14-panneau.png', '15-panneau', "Panneau lumineux"),
    ('final/15-scene.mp4', '16-scene', "Écran de scène"),
    ('final/16-facade.png', '17-facade', "Façade"),
    ('plates/17-charte.png', '18-guide-de-marque', "Guide de marque"),
    ('final/18-affiche.mp4', '19-affiche-rue', "Affiche de rue"),
    ('plates/19-icone.png', '20-icone', "Icône d'application"),
    ('motion/20-app.mp4', '21-app', "L'application"),
    ('motion/21-montre.mp4', '22-montre', "Montre et messages"),
    ('final/22-telephone.png', '23-telephone', "Publication"),
    ('plates/23-reseaux.png', '24-reseaux', "Réseaux sociaux"),
    ('final/24-caisson.png', '25-caisson', "Caisson lumineux"),
    ('plates/25-merci.png', '26-merci', "Merci"),
]
items, missing = [], []
for src, name, cap in ORDER:
    p = os.path.join(ROOT, 'out', *src.split('/'))
    if not os.path.exists(p):
        missing.append(src); continue
    if src.endswith('.mp4'):
        shutil.copyfile(p, os.path.join(MEDIA, name + '.mp4'))
        items.append(('video', name + '.mp4', cap))
    else:
        shutil.copyfile(p, os.path.join(PNG, name + '.png'))
        Image.open(p).convert('RGB').save(os.path.join(MEDIA, name + '.jpg'), quality=93, subsampling=0)
        items.append(('img', name + '.jpg', cap))

for f in os.listdir(os.path.join(ROOT, 'brand', 'logo')):
    shutil.copyfile(os.path.join(ROOT, 'brand', 'logo', f), os.path.join(LOGO, f))

blocks = []
for kind, f, cap in items:
    if kind == 'img':
        blocks.append(f'<figure><img src="media/{f}" alt="{cap}" loading="lazy"></figure>')
    else:
        blocks.append(f'<figure><video src="media/{f}" autoplay muted loop playsinline preload="metadata" aria-label="{cap}"></video></figure>')
html = f'''<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aube — identité de marque</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#0A0609;color:#E9E3DE;font-family:Outfit,system-ui,-apple-system,"Segoe UI",sans-serif;font-weight:300}}
header{{max-width:1400px;margin:0 auto;padding:56px 32px 40px;display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap}}
h1{{font-weight:300;font-size:clamp(28px,4vw,48px);letter-spacing:-.01em;color:#fff}}
header p{{font-size:15px;line-height:1.5;max-width:520px;opacity:.75}}
main{{max-width:1400px;margin:0 auto}}
figure{{display:block;line-height:0}}
img,video{{width:100%;height:auto;display:block}}
footer{{max-width:1400px;margin:0 auto;padding:40px 32px 72px;font-size:13px;line-height:1.6;opacity:.6}}
</style></head>
<body>
<header><h1>Aube — identité de marque</h1><p>Assistant personnel IA, projet vitrine KLYRA. Identité, interface, supports, mockups 3D et animations. {len(items)} planches, dont {sum(1 for k, _, _ in items if k == 'video')} vidéos.</p></header>
<main>
{chr(10).join(blocks)}
</main>
<footer>Référence d'inspiration : « Jor Personal Assistant », Typefool et Sam Miles (Behance). Polices : Outfit et DM Mono (OFL). Matières et ciels des scènes 3D : Poly Haven (CC0). 2026© KLYRA.</footer>
</body></html>'''
open(os.path.join(DEST, 'index.html'), 'w', encoding='utf-8').write(html)
print('planches', len(items), '| manquantes', missing)
