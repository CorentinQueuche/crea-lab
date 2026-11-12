# Aube — dossier de travail

Source : création KLYRA, importée de DIGITAL-OS ou du workspace d’essai correspondant.

[Ouvrir le guide ou la planche](40_DELIVERABLES/aube-guideline/index.html). Sources : `20_WORKING/aube/`. Le brief créatif et les médias nécessaires sont conservés ; les notes de coordination restent dans la copie privée.

Depuis `20_WORKING/aube` :

```powershell
npm ci --ignore-scripts
```

Assemblage depuis les rendus existants :

```powershell
python tools/build_presentation.py
```

Les autres outils sont sous `tools/`, les scènes sous `blender/`. Le guide livré est conservé sous `40_DELIVERABLES`.
