# Sillon — dossier de travail

Source : création KLYRA, importée de DIGITAL-OS ou du workspace d’essai correspondant.

[Ouvrir le guide de marque](40_DELIVERABLES/sillon-guideline/index.html), en ligne sur https://sillon-guideline.vercel.app. Sources : `20_WORKING/sillon/`. Le brief créatif et les médias nécessaires sont conservés ; les notes de coordination restent dans la copie privée.

Depuis `20_WORKING/sillon` :

```powershell
npm ci --ignore-scripts
```

Assemblage depuis les rendus existants :

```powershell
python tools/build_presentation.py
```

Les autres outils sont sous `tools/`, les scènes sous `blender/`, les gabarits pour les réseaux sous `reseaux/`, les vidéos sous `motion/`, la fiche de marque sous `deck/`. L’outil pour composer une annonce est sous `outil/` : il se lance par `outil/ouvrir.bat` une fois les dépendances installées (Node.js et Chrome).

Livrables conservés sous `40_DELIVERABLES` : le site du guide (`sillon-guideline/` : le guide où l’on se promène, la présentation en pages, l’étude de cas en défilement ; il s’assemble par `python tools/build_site.py`), l’étude de cas d’origine (36 pièces dont 8 vidéos, avec les planches en PNG), la [fiche de marque](40_DELIVERABLES/sillon-fiche-de-marque/sillon-fiche-de-marque.pdf) (PDF, 8 pages), 24 visuels pour les réseaux, 8 vidéos, 24 fichiers logo.

Marque fictive. Les photos ont été générées pour le projet. Les phrases de la marque n’ont pas été relues au regard de la loi Évin ; le nom n’est vérifié ni à l’INPI ni comme domaine.
