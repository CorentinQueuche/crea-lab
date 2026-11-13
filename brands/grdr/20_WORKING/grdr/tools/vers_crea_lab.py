"""Verse ce projet dans le dépôt public Créa Lab (CorentinQueuche/crea-lab), sous brands/grdr/, selon ses conventions :

    brands/grdr/20_WORKING/grdr/      les sources et les rendus qui alimentent l'assemblage
    brands/grdr/40_DELIVERABLES/      grdr-guideline (le site), grdr-presentation, grdr-guide-pdf, grdr-logo
    brands/grdr/licenses/             les licences des polices et des données de carte

    python tools/vers_crea_lab.py <chemin du dépôt crea-lab>

Le dépôt est public : la copie laisse de côté ce qui n'a pas à y être (documents du client, notes de coordination,
jeu de médias propre au site de KLYRA, rendus intermédiaires) et réécrit trois passages de coordination du brief.
Le script ne valide ni ne pousse rien : il écrit des fichiers, et la liste de ce qu'il a écarté (pour l'inventaire du dépôt).
"""
import json
import os
import re
import shutil
import sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if len(sys.argv) < 2:
    sys.exit(__doc__)
DEPOT = os.path.abspath(sys.argv[1])
DEST = os.path.join(DEPOT, 'brands', 'grdr')
W = os.path.join(DEST, '20_WORKING', 'grdr')
D = os.path.join(DEST, '40_DELIVERABLES')

# Ce qu'on écarte de la copie de travail : (motif sur le chemin relatif, raison)
ECARTS = [
    (r'^node_modules/', 'dépendances, à réinstaller (npm ci)'),
    (r'^livrables/', 'doublon des livrables rangés sous 40_DELIVERABLES ; le jeu de médias pour le site de KLYRA reste dans la copie privée'),
    (r'^blender/', 'gabarit 3D non utilisé par ce projet'),
    (r'^_prep/sources/', 'documents du GRDR (rapport d’activité, logo du site) : à télécharger sur grdr.org, non redistribués'),
    (r'^_prep/existant/(businesscard\.png|klyra-realisation-grdr\.html)$', 'média non repris (carte de visite) et page du site de KLYRA'),
    (r'^_prep/existant/(img3|card)\.png$', 'médias de la page d’origine que ce projet n’utilise pas'),
    (r'^tools/export_klyra\.py$', 'outil propre au site de KLYRA'),
    (r'^out/(deck|gen|guide|_zones)/', 'rendus intermédiaires et captures de contrôle'),
    (r'^out/_(?!test\.png$)', 'journaux et planches-contact de travail'),
    (r'^out/plates/(_.*|.*-(large|4x3|menu)\.png)$', 'variantes de format pour le site de KLYRA et planche-contact'),
    (r'^out/ecrans/(?!connexion-900).*-900\.png$', 'écrans à hauteur fixe, à rendre de nouveau (tools/tout_rendre.sh)'),
    (r'^out/motion/(_contact-.*|.*-planche)\.jpg$', 'planches de contrôle des vidéos'),
    (r'^out/final/41-carte-de-visite\.jpg$', 'média non repris (carte de visite)'),
    (r'(^|/)__pycache__/|\.pyc$|\.log$', 'caches et journaux'),
]
# Les passages de coordination du brief, réécrits pour la copie publique : (fichier, ancien, nouveau)
RETOUCHES = [
    ('MARQUE.md', re.compile(r'Corentin \(KLYRA\), le 13 novembre 2026 : « .*? ».\n', re.S),
     'KLYRA, novembre 2026 : reprendre la direction artistique de cette réalisation à partir des médias existants, en restant dans les grandes lignes de la marque.\n'),
    ('MARQUE.md', re.compile(r' Usage : remplacer les médias de cette page, et montrer ce que KLYRA sait faire\.'), ' Usage : montrer ce que KLYRA sait faire.'),
    ('MARQUE.md', re.compile(r'\(nom déclaré par Corentin le 21/09/2026 ; il n\'apparaît pas sur la page publique actuelle : à confirmer avant publication, une seule ligne à changer dans le socle, `Marque\.PRODUIT`\)'),
     '(une seule ligne à changer dans le socle si le nom évolue : `Marque.PRODUIT`)'),
    ('MARQUE.md', re.compile(r', plus \*\*le jeu de médias de remplacement pour klyra\.fr\*\* \(mêmes emplacements et proportions que les treize médias actuels\) et \*\*un prototype navigable\*\* de l\'outil\.'),
     ', plus **un prototype navigable** de l\'outil.'),
    ('brand/marque.js', re.compile(r"/\* le nom de l'outil \(à confirmer avant publication : une seule ligne à changer\) \*/"), "/* le nom de l'outil : une seule ligne à changer */"),
]
LIVRABLES = [('site', 'grdr-guideline'), ('presentation', 'grdr-presentation'), ('guide-pdf', 'grdr-guide-pdf'), ('logo', 'grdr-logo')]
LICENCES = [('@fontsource-variable/nunito', 'LICENSE'), ('@fontsource-variable/nunito-sans', 'LICENSE'), ('@fontsource-variable/geist-mono', 'LICENSE'), ('world-atlas', 'LICENSE')]

for d in (W, D, os.path.join(DEST, 'licenses')):
    if os.path.isdir(d):
        shutil.rmtree(d)
ecartes, copies = [], 0
for base, dirs, files in os.walk(RACINE):
    rel_dir = os.path.relpath(base, RACINE).replace(os.sep, '/')
    rel_dir = '' if rel_dir == '.' else rel_dir + '/'
    garde = []
    for d in dirs:
        raison = next((r for m, r in ECARTS if re.search(m, rel_dir + d + '/')), None)
        if raison:
            ecartes.append({'brand': 'grdr', 'path': rel_dir + d + '/', 'reason': raison})
        else:
            garde.append(d)
    dirs[:] = garde
    for f in files:
        rel = rel_dir + f
        raison = next((r for m, r in ECARTS if re.search(m, rel)), None)
        if raison:
            ecartes.append({'brand': 'grdr', 'path': rel, 'reason': raison}); continue
        cible = os.path.join(W, rel)
        os.makedirs(os.path.dirname(cible), exist_ok=True)
        shutil.copyfile(os.path.join(RACINE, rel), cible); copies += 1

for rel, motif, neuf in RETOUCHES:
    p = os.path.join(W, rel)
    s = open(p, encoding='utf-8').read()
    s2, n = motif.subn(neuf, s)
    if n != 1:
        sys.exit(f'retouche introuvable dans {rel} : {motif.pattern[:60]}')
    open(p, 'w', encoding='utf-8', newline='\n').write(s2)

for src, nom in LIVRABLES:
    shutil.copytree(os.path.join(RACINE, 'livrables', src), os.path.join(D, nom))
    copies += sum(len(f) for _, _, f in os.walk(os.path.join(D, nom)))
for paquet, fichier in LICENCES:
    cible = os.path.join(DEST, 'licenses', paquet, fichier)
    os.makedirs(os.path.dirname(cible), exist_ok=True)
    shutil.copyfile(os.path.join(RACINE, 'node_modules', paquet, fichier), cible); copies += 1

# Contrôle : rien d'interne dans ce qui part (chemins de machine, noms de dossiers privés)
INTERDITS = re.compile(rb'/var/lib/|openbot|DIGITAL-OS|CL-0010|PRJ-2026|queuc|camille\.martin', re.I)
fautes = []
for base, _, files in os.walk(DEST):
    for f in files:
        p = os.path.join(base, f)
        if f == 'vers_crea_lab.py':   # ce script cite lui-même les mots qu'il cherche
            continue
        if os.path.splitext(f)[1].lower() in ('.html', '.js', '.mjs', '.css', '.md', '.json', '.py', '.sh', '.svg', '.txt'):
            if INTERDITS.search(open(p, 'rb').read()):
                fautes.append(os.path.relpath(p, DEST))
json.dump(ecartes, open(os.path.join(DEPOT, 'inventory', '_ecartes-grdr.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'{copies} fichiers copiés sous {os.path.relpath(DEST, DEPOT)} | {len(ecartes)} chemins écartés')
if fautes:
    print('MENTIONS INTERNES à retirer avant de valider :', *fautes, sep='\n  ')
    sys.exit(1)
