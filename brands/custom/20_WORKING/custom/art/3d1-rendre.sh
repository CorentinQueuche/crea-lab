#!/usr/bin/env bash
# Rend les visuels de supports du lot 3D-1 (scènes 21, 37 et 39) dans out/art/3d1-*.png.
# À lancer depuis la racine du projet :  bash art/3d1-rendre.sh [papeterie|etiquettes|serigraphie]
# Chaque visuel est cadré exactement sur son élément (--sel) : sa taille fixe la proportion de la surface habillée.
# --w 2600 : assez large pour que la mise en page ne bouge pas quand shot.mjs agrandit la fenêtre.
set -e
s() { node tools/shot.mjs "$@" | tail -1; }
quoi="${1:-tout}"

if [ "$quoi" = tout ] || [ "$quoi" = papeterie ]; then
  for v in carte-recto-a carte-recto-b carte-verso chemise chemise-int lettre enveloppe-dos enveloppe-rabat carnet nuancier; do
    s art/3d1-papeterie.html out/art/3d1-$v.png --w 2600 --scale 2 --sel "#$v"; done
  s art/3d1-papeterie.html out/art/3d1-tapis.png --w 3800 --scale 1.5 --sel "#tapis"
fi
if [ "$quoi" = tout ] || [ "$quoi" = etiquettes ]; then
  for v in tag-noir tag-fluo tag-dos tissee ruban carton-etiquette pastille tee-plie; do
    s art/3d1-etiquettes.html out/art/3d1-$v.png --w 2600 --scale 2 --transparent --sel "#$v"; done
fi
if [ "$quoi" = tout ] || [ "$quoi" = serigraphie ]; then
  for v in ecran tee; do
    s art/3d1-serigraphie.html out/art/3d1-$v.png --w 4200 --scale 2 --transparent --sel "#$v"; done
fi
