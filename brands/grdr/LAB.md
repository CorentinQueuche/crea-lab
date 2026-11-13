# GRDR · Djongoma — dossier de travail

Source : création KLYRA, importée de DIGITAL-OS le 13 novembre 2026.

[Ouvrir le guide de marque](40_DELIVERABLES/grdr-guideline/index.html). Sources : `20_WORKING/grdr/`. Le brief créatif (`MARQUE.md`) et les médias nécessaires sont conservés ; les notes de coordination restent dans la copie privée.

Le sujet : la direction artistique de l’étude de cas publiée sur https://klyra.fr/realisations/grdr, l’outil de gestion budgétaire que KLYRA a fait pour le GRDR. L’identité du GRDR ne change pas. L’idée : un budget se lit comme son symbole. Chaque projet reçoit une empreinte, une boucle par année, tracée jusqu’à ce qui est exécuté.

Depuis `20_WORKING/grdr` :

```powershell
npm ci --ignore-scripts
```

Tout rendre de nouveau depuis le socle (`brand/`) : écrans, planches, scènes, photos rhabillées. Il faut Node.js, Chrome, et Python avec Pillow, numpy et scipy :

```powershell
bash tools/tout_rendre.sh
```

Assemblage à partir des rendus conservés ; ces commandes écrivent dans `livrables/`, indépendamment de la photographie conservée sous `40_DELIVERABLES` :

```powershell
python tools/build_presentation.py
node tools/deck.mjs
python tools/deck_pdf.py
python tools/build_site.py
```

Les vidéos sont sous `motion/` (une page par film, enregistrée image par image par `tools/record.mjs`). `tools/rehabiller.py` remplace l’écran d’une photo de mockup par un nouveau rendu, en perspective. `_prep/` garde les scripts qui extraient le logo et calculent la carte.

Livrables conservés sous `40_DELIVERABLES` :

- `grdr-guideline/` : le site. Le guide où l’on se promène (12 pages, éléments réglables), la présentation en 22 pages, l’étude de cas en défilement (49 pièces dont 6 vidéos) et le [prototype navigable de l’outil](40_DELIVERABLES/grdr-guideline/prototype.html) (15 écrans).
- `grdr-presentation/` : l’étude de cas d’origine, avec les planches en PNG.
- `grdr-guide-pdf/` : la [présentation en pages](40_DELIVERABLES/grdr-guide-pdf/grdr-guide-de-marque.pdf) (PDF, 22 pages, en images).
- `grdr-logo/` : 13 fichiers logo.

Proposition KLYRA, non validée par le GRDR.

- Le logo, les couleurs et la police (Nunito) appartiennent au GRDR. Le logo est repris en tracés de son rapport d’activité 2025, sans être redessiné. Ce rapport n’est pas redistribué ici : `_prep/extraire_logo.py` dit où le trouver.
- Les projets, montants et effectifs reprennent les captures déjà publiées sur klyra.fr. Les personnes (un prénom et une initiale), les bailleurs (par type), les mois, le journal et les écritures comptables sont inventés pour la démonstration. La citation est celle de l’étude de cas publiée.
- Les trois photos de terrain et les photos de mockup viennent de l’étude de cas publiée ; leurs écrans ont été remplacés par le code. Aucune image n’a été générée.
- Carte : Natural Earth, domaine public. Polices : Nunito, Nunito Sans, Geist Mono, licences libres OFL (`licenses/`).
- Les règles chiffrées du guide (zone de protection, tailles minimales, proportions) sont des choix de direction artistique, non validés.
