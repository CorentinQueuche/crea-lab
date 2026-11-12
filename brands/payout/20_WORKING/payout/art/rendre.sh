#!/usr/bin/env bash
# Rend tous les visuels de supports de Payout dans out/art/. À lancer depuis la racine du projet :  bash art/rendre.sh
# Chaque visuel est cadré exactement sur son élément (--sel) : sa taille en pixels fixe la proportion de la surface habillée.
set -e
s() { node tools/shot.mjs "$@" | tail -1; }

# Affiche d'abribus : visuel de 1,16 × 1,71 m
s art/affiche.html out/art/affiche.png --w 1160 --sel "#affiche"

# Faces d'écran : portable et moniteur (16:10), mur d'écran du stand (16:9), téléphone (390 × 844, coins transparents)
s art/ecrans.html out/art/ecran-site.png --w 1600 --sel "#site"
s art/ecrans.html out/art/ecran-bord.png --w 1600 --sel "#bord"
s art/ecrans.html out/art/ecran-mur.png --w 1600 --sel "#mur"
s art/ecrans.html out/art/tel-solde.png --w 1600 --scale 4 --transparent --sel "#tel-solde"
s art/ecrans.html out/art/tel-cra.png --w 1600 --scale 4 --transparent --sel "#tel-cra"

# Stand : kakémono de 0,85 × 2,0 m, cloison latérale de 3,0 × 2,5 m
s art/stand.html out/art/kakemono.png --w 1600 --sel "#kakemono"
s art/stand.html out/art/cloison.png --w 1600 --sel "#cloison"

# Papeterie : cartes de visite 85 × 55 mm, facture et CRA en A4, enveloppe 220 × 110 mm
for v in carte-recto carte-verso facture cra enveloppe; do s art/papeterie.html out/art/$v.png --w 2200 --sel "#$v"; done

# Autocollants, sur fond transparent
for v in st-icone st-rond st-pilule; do s art/autocollants.html out/art/$v.png --w 1400 --transparent --sel "#$v"; done
