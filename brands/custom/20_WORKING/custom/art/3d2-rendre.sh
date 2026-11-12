#!/usr/bin/env bash
# Rend tous les visuels plaqués du lot 3D-2 (scènes 26, 32, 40, 41) dans out/art/3d2-*.png.
# À lancer depuis la racine du projet :  bash art/3d2-rendre.sh
# Chaque visuel est cadré sur son élément (--sel) : sa taille en pixels fixe la proportion de la surface habillée.
# « ?t » + --transparent : fond transparent (coins arrondis, marquages, étiquettes).
set -e
s() { node tools/shot.mjs "$@" | tail -1; }

# Scène 41, signalétique : panneau d'univers 0,80 × 1,00 m, drapeaux 0,75 × 2,60 m, marquage au sol 6,4 × 3,2 m
s "art/3d2-signaletique.html?t" out/art/3d2-plan.png --w 2100 --scale 2 --transparent --sel "#plan"
for d in a b c; do s art/3d2-signaletique.html out/art/3d2-drapeau-$d.png --w 2100 --scale 2 --sel "#drapeau-$d"; done
s "art/3d2-signaletique.html?t" out/art/3d2-sol.png --w 2100 --scale 1 --transparent --sel "#sol"

# Scène 40, goodies : tapis de découpe 0,90 × 0,60 m, tote 380 × 420 mm, carnets A5, badges 38 mm, étiquette 50 × 90 mm, marquages
s art/3d2-goodies.html out/art/3d2-tapis.png --w 2100 --scale 3 --sel "#tapis"
s art/3d2-goodies.html out/art/3d2-tote.png --w 2100 --scale 2 --sel "#tote"
for v in gourde-marque mug-marque stylo-marque carnet-fluo carnet-kraft badge-1 badge-2 badge-3 badge-4 etiquette; do
  s "art/3d2-goodies.html?t" out/art/3d2-$v.png --w 2100 --scale 4 --transparent --sel "#$v"
done

# Scènes 26 et 32 : écrans (portable 1440 × 900, téléphone 390 × 844 à coins transparents), mur de fond, griffe tissée
s art/3d2-ecran-portable.html out/art/3d2-ecran-portable.png --w 1440 --h 900 --scale 2 --sel "#ecran"
s "art/3d2-ecran-mobile.html?t" out/art/3d2-ecran-mobile.png --w 800 --h 900 --scale 4 --transparent --sel "#ecran"
s art/3d2-portable.html out/art/3d2-fond.png --w 3300 --scale 1.5 --sel "#fond"
for v in griffe griffe-noire; do s "art/3d2-portable.html?t" out/art/3d2-$v.png --w 3300 --scale 4 --transparent --sel "#$v"; done
