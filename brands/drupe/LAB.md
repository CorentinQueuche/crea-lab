# Drupe — dossier de travail

Source : création KLYRA, importée de DIGITAL-OS ou du workspace d’essai correspondant.

[Ouvrir le guide ou la planche](projet/livrables/site/index.html). Sources : `projet/`. Le brief créatif et les médias nécessaires sont conservés ; les notes de coordination restent dans la copie privée.

Depuis `projet` :

```powershell
npm ci --ignore-scripts
```

Assemblage à partir des rendus conservés (Python avec Pillow), puis guide à partir de Chrome ; ces commandes écrivent uniquement dans la copie :

```powershell
python tools/build_presentation.py
node tools/deck.mjs
python tools/deck_pdf.py
python tools/build_site.py
```

Les sorties par défaut vont dans `livrables/`, indépendamment de la photographie conservée sous `40_DELIVERABLES`.
