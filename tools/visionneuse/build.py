"""Assemble index.html (la visionneuse du Créa Lab) à partir du dépôt.

    python tools/visionneuse/build.py

Lit les études de cas livrées (ordre et titres des pièces), mesure les vignettes,
fabrique les vignettes manquantes (Roulement, Maillon) et écrit index.html à la racine.
Le fichier produit est autonome : police, logos et données sont dans la page.
Pour ajouter une marque : une entrée de plus dans la liste `marques`, puis relancer.
Il faut Python avec Pillow, Node.js et ffmpeg (ffprobe compris).
"""
import base64, io, json, re, subprocess, sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
B = REPO / 'brands'


def b64(data, mime):
    return f'data:{mime};base64,' + base64.b64encode(data).decode()


def duree(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(p)],
                       capture_output=True, text=True)
    try:
        return round(float(r.stdout.strip()), 1)
    except ValueError:
        return None


def logo(path, mono=True):
    s = Path(path).read_text(encoding='utf-8').strip()
    s = re.sub(r'<\?xml[^>]*>\s*', '', s)
    if mono:
        s = re.sub(r'fill="#[0-9A-Fa-f]{3,8}"', 'fill="currentColor"', s)
    return re.sub(r'\s+(width|height)="[^"]*"', '', s, count=2)


def logo_js(marque_js, appel):
    code = f"global.window={{}};require({json.dumps(str(marque_js))});process.stdout.write(window.Marque.{appel})"
    s = subprocess.run(['node', '-e', code], capture_output=True, text=True, check=True).stdout
    return re.sub(r'\s(width|height)="[^"]*"', '', s, count=2)


def etude(base, vignettes='media/vignettes'):
    """Pièces d'une étude complète : ordre et titres de etude-de-cas.html."""
    h = (B / base / 'etude-de-cas.html').read_text(encoding='utf-8')
    out = []
    for tag, attrs in re.findall(r'<(img|video)\b([^>]*)>', h):
        m = re.search(r'src="(media/[^"/]+)"', attrs)
        if not m:
            continue
        src = m.group(1)
        t = re.search(r'(?:alt|aria-label)="([^"]*)"', attrs)
        nom = Path(src).stem
        vig = f'{vignettes}/{nom}.jpg'
        w, h_ = Image.open(B / base / vig).size
        p = {'s': src, 'v': vig, 'w': w, 'h': h_, 't': (t.group(1) if t else nom).replace('&amp;', '&')}
        if tag == 'video':
            p['k'] = 'v'
            p['d'] = duree(B / base / src)
        out.append(p)
    return out


def vignette(im, largeur=720):
    im = im.convert('RGB')
    im.thumbnail((largeur, largeur * 2), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=60, method=6)
    return b64(buf.getvalue(), 'image/webp'), im.size


def vitrine(base, titres, film, titre_film):
    """Pièces d'une vitrine d'app : visuels PNG et film ; vignettes fabriquées ici."""
    out = []
    for f in sorted((B / base / 'presentation').glob('[0-9][0-9]-*.png')):
        v, (w, h) = vignette(Image.open(f))
        out.append({'s': f'presentation/{f.name}', 'v': v, 'w': w, 'h': h, 't': titres[f.stem[:2]]})
    mp4 = B / base / film
    r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', '6', '-i', str(mp4), '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'],
                       capture_output=True, check=True)
    v, (w, h) = vignette(Image.open(io.BytesIO(r.stdout)))
    out.append({'s': film, 'v': v, 'w': w, 'h': h, 't': titre_film, 'k': 'v', 'd': duree(mp4), 'son': 1})
    return out


G = lambda b: f'{b}/40_DELIVERABLES/{b}-guideline'
DOCS = [['guide', 'Guide de marque', 'index.html'], ['presentation', 'Présentation', 'presentation.html'],
        ['etude', 'Étude de cas', 'etude-de-cas.html']]

marques = [
    dict(id='aube', nom='Aube', base=G('aube'),
         quoi='Assistant personnel IA', secteur='Technologie (IA)', nature='Étude complète',
         statut='Marque fictive, projet vitrine',
         signature='Le jour se lève. Tout est prêt.',
         texte='Pendant la nuit, Aube trie, prépare et anticipe. Au réveil, la journée est déjà en ordre : tout le système visuel vient du lever du jour.',
         polices='Outfit, DM Mono', fond='#1C1122', encre='#FFF1DC', accent='#FF632B',
         palette=['#0A0609', '#1C1122', '#4B1838', '#C4391A', '#FF632B', '#FFC46B', '#FFF1DC'],
         logo=logo(B / G('aube') / 'logo/aube-logotype-blanc.svg'), lh=1.0,
         docs=DOCS, pdf='deck/aube-guide-de-marque.pdf', zip='logo/aube-logos.zip',
         live='https://aube-guideline.vercel.app/', pieces=etude(G('aube'))),
    dict(id='payout', nom='Payout', base=G('payout'),
         quoi='Fintech pour freelances en SASU', secteur='Fintech', nature='Étude complète',
         statut='Proposition KLYRA, non approuvée par la marque',
         signature='La part qui vous revient.',
         texte='Payout aide les freelances en SASU à garder jusqu’à 85 % de leur TJM. La proposition pousse l’identité de 2025 plus loin : un noir, un vert électrique et une seule image.',
         polices='Instrument Sans, Chivo Mono', fond='#060A08', encre='#EEF1F2', accent='#36FF72',
         palette=['#060A08', '#101713', '#7B8782', '#EEF1F2', '#36FF72', '#FF5B35'],
         logo=logo(B / G('payout') / 'logo/payout-logotype-blanc.svg'), lh=1.12,
         docs=DOCS, pdf='deck/payout-guide-de-marque.pdf', zip='logo/payout-logos.zip',
         pieces=etude(G('payout'))),
    dict(id='custom', nom='Custom', base=G('custom'),
         quoi='Atelier de personnalisation', secteur='Textile, print, goodies, signalétique', nature='Étude complète',
         statut='Proposition KLYRA, non approuvée par la marque',
         signature='Tout est fait ici.',
         texte='Rien n’est redessiné : le logo, les couleurs et les polices livrés en 2025 sont mis en système, puis poussés sur tous les supports de l’atelier.',
         polices='Bebas Neue, Archivo, Inter, JetBrains Mono', fond='#101012', encre='#FFFFFF', accent='#E2FF21',
         palette=['#101012', '#272728', '#DBDBDE', '#FFFFFF', '#E2FF21', '#8E3EFF', '#FE3600'],
         logo=logo(B / G('custom') / 'logo/custom-logo-blanc.svg'), lh=0.82,
         docs=DOCS, pdf='deck/custom-guide-de-marque.pdf', zip='logo/custom-logos.zip',
         pieces=etude(G('custom'))),
    dict(id='drupe', nom='Drupe', base='drupe/projet/livrables/site',
         quoi='Torréfacteur de café de quartier', secteur='Café, commerce de quartier', nature='Étude complète',
         statut='Marque fictive, projet vitrine',
         signature='Le café est un fruit.',
         texte='Avant d’être un grain brun, le café est le noyau d’une cerise rouge. Drupe la traite comme un fruit de saison : cueillie mûre, torréfiée clair, vendue au coin de la rue.',
         polices='Bricolage Grotesque, IBM Plex Mono', fond='#F4ECDD', encre='#2A1A14', accent='#CF2145',
         palette=['#FFFDF8', '#F4ECDD', '#F6C3C0', '#CF2145', '#C7D5A9', '#1E4A36', '#2A1A14'],
         logo=logo(B / 'drupe/projet/livrables/site/logo/drupe-logotype-fleur.svg'), lh=0.86, logoPage='#CF2145',
         docs=DOCS, pdf='deck/drupe-guide-de-marque.pdf', zip='logo/drupe-logos.zip',
         live='https://drupe-guideline.vercel.app/', pieces=etude('drupe/projet/livrables/site')),
    dict(id='sillon', nom='Sillon', base=G('sillon'),
         quoi='Cave à vins nature, Nantes', secteur='Vin nature, commerce de quartier', nature='Étude complète',
         statut='Marque fictive',
         signature='On remplit les creux.',
         texte='Il y a un creux dans Sillon, entre ses deux L. On le remplit. La boutique, la dégustation du jeudi soir, l’abonnement de trois bouteilles par mois.',
         polices='Anybody, Hanken Grotesk', fond='#2146D0', encre='#F2EFE4', accent='#FF9B21',
         palette=['#2146D0', '#0E1638', '#8EA5F0', '#F2EFE4', '#FF9B21', '#FF4F7B', '#F7C52B'],
         logo=logo(B / G('sillon') / 'logo/sillon-logotype-jus-tuffeau.svg', mono=False), lh=0.84,
         docs=[['guide', 'Guide de marque', 'index.html'], ['presentation', 'Fiche de marque', 'presentation.html'],
               ['etude', 'Étude de cas', 'etude-de-cas.html']],
         pdf='deck/sillon-fiche-de-marque.pdf', zip='logo/sillon-logos.zip',
         live='https://sillon-guideline.vercel.app/', pieces=etude(G('sillon'))),
    dict(id='roulement', nom='Roulement', base='roulement',
         quoi='Planning du personnel de trois brasseries', secteur='Restauration, outil métier', nature='Identité et vitrine d’app',
         statut='App fictive, essai',
         signature='Le planning des trois brasseries, et ce qu’il coûte.',
         texte='Trois postes, salle, bar et cuisine, se relaient autour de la semaine : un anneau en trois segments, qui tourne. Les comptes se lisent sur une ardoise sombre posée dans une page couleur nappe.',
         polices='Geist, Geist Mono', fond='#ECE5D6', encre='#1F1A15', accent='#1E5C49',
         palette=['#ECE5D6', '#F9F5EC', '#1F1A15', '#1E5C49', '#9B3D4E', '#D9A441', '#2F6385', '#DE4526'],
         logo=logo_js(B / 'roulement/marque.js', "logotype({encre:'#f2ede1',sombre:true})"),
         logoPageSvg=logo_js(B / 'roulement/marque.js', 'logotype({})'), lh=1.02,
         docs=[['identite', 'Planche d’identité', 'identite.html'], ['app', 'Interface', 'index.html']],
         pieces=vitrine('roulement', {'01': 'Le trou du samedi', '02': 'Qui peut venir', '03': 'Affluence et semaine',
                                      '04': 'Ardoise et planning', '05': 'Les trois brasseries', '06': 'Coût par jour',
                                      '07': 'Vue d’ensemble', '08': 'Identité'},
                        'presentation/film.mp4', 'Le film de présentation')),
    dict(id='maillon', nom='Maillon', base='maillon',
         quoi='Automatisation des dossiers d’une PME', secteur='Outil métier, menuiserie d’agencement', nature='Identité et vitrine d’app',
         statut='App fictive, essai',
         signature='De la demande à la facture, sans ressaisie.',
         texte='Le dossier d’un comptoir réfrigéré, de l’e-mail reçu à la facture d’acompte. Un canvas de blocs reliés, vu en gros plans, avec l’ambre de la lumière d’atelier.',
         polices='Geist, Geist Mono', fond='#050506', encre='#F3F1EC', accent='#FF9A2E',
         palette=['#050506', '#4B4944', '#B9B6AE', '#F3F1EC', '#FF9A2E', '#FFD9A3'],
         logo=logo_js(B / 'maillon/marque.js', "logotype({fond:'#000'})"),
         logoPageSvg=logo_js(B / 'maillon/marque.js', "logotype({fond:'#050506'})"), lh=1.02,
         docs=[['identite', 'Planche d’identité', 'identite.html'], ['app', 'Interface', 'index.html']],
         pieces=vitrine('maillon', {'01': 'Devis et liens', '02': 'Validation du devis', '03': 'Plan d’agencement',
                                    '04': 'Pose et analyse', '05': 'Explorateur', '06': 'Charge de l’atelier',
                                    '07': 'Vue d’ensemble', '08': 'Identité'},
                        'presentation/maillon-film.mp4', 'Le film de présentation')),
]

# contrôle : chaque fichier cité existe dans le dépôt
manque = []
for m in marques:
    racine = B / m['base']
    cibles = [p['s'] for p in m['pieces']] + [p['v'] for p in m['pieces'] if not p['v'].startswith('data:')]
    cibles += [d[2] for d in m['docs']] + [m[k] for k in ('pdf', 'zip') if m.get(k)]
    manque += [f"{m['id']}: {c}" for c in cibles if not (racine / c).exists()]
if manque:
    sys.exit('Fichiers introuvables :\n' + '\n'.join(manque))

klyra = re.sub(r'\s(width|height)="[^"]*"', '', (HERE / 'klyra-logo-white.svg').read_text(encoding='utf-8'), count=2)
page = (HERE / 'template.html').read_text(encoding='utf-8')
page = page.replace('/*POLICE*/', b64((HERE / 'gsf-latin.woff2').read_bytes(), 'font/woff2'))
page = page.replace('<!--KLYRA-->', klyra)
page = page.replace('/*DONNEES*/', json.dumps(marques, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/'))
(REPO / 'index.html').write_text(page, encoding='utf-8', newline='\n')
n = sum(len(m['pieces']) for m in marques)
print(f"index.html : {len(page) / 1024:.0f} Ko, {len(marques)} marques, {n} pièces, "
      f"{sum(1 for m in marques for p in m['pieces'] if p.get('k') == 'v')} vidéos")
