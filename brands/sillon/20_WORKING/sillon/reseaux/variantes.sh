#!/bin/bash
# Rend les trois variantes de chaque modèle, en 4:5 et en 9:16, dans out/reseaux/NN-nom-FORMAT-lettre.png.
#   bash reseaux/variantes.sh              tout (24 fichiers, environ deux minutes)
#   bash reseaux/variantes.sh 21-jeudi     un seul modèle
# Pour une seule publication de la semaine, la commande suffit :
#   node tools/shot.mjs "reseaux/21-jeudi.html?texte=À JE[U]DI.&jus=paille&format=4x5" out/reseaux/jeudi.png --w 1080 --h 1350 --scale 1
#   (en story : format=9x16 et --h 1920 ; guides=1 montre la zone sûre avant d'exporter)
cd "$(dirname "$0")/.."
V=(
"21-jeudi|a|jus=maceration|glou"
"21-jeudi|b|texte=À JE[U]DI.&jus=paille&fond=cave&photo=jeudi&niveau=0.8"
"21-jeudi|c|texte=D[U] J[U]S.&jus=glou&niveau=0.55"
"22-plein|a|mois=novembre"
"22-plein|b|mois=décembre&jus=maceration|maceration|paille"
"22-plein|c|mois=janvier&jus=glou|paille|glou"
"23-arrivage|a|photo=trois-jus&jus=glou&niveau=0.4"
"23-arrivage|b|photo=verre-penche&jus=maceration"
"23-arrivage|c|photo=caviste&jus=paille&niveau=0.3"
"24-phrase|a|voix=dos&fond=tuffeau&jus=maceration"
"24-phrase|b|voix=nappe&fond=bleu&jus=glou"
"24-phrase|c|voix=vitrine&fond=craie&jus=paille"
)
for v in "${V[@]}"; do
  IFS='|' read -r nom lettre _ <<< "$v"; params="${v#*|*|}"
  [[ -n "$1" && "$nom" != $1 ]] && continue
  for f in 4x5 9x16; do h=1350; [ $f = 9x16 ] && h=1920
    node tools/shot.mjs "reseaux/$nom.html?$params&format=$f" "out/reseaux/$nom-$f-$lettre.png" --w 1080 --h $h --scale 1
  done
done
