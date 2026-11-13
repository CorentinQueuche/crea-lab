#!/usr/bin/env bash
# Rend toutes les pièces du projet depuis le socle, dans l'ordre : écrans, planches, variantes, incrustations.
# À relancer après toute modification du socle (brand/).   bash tools/tout_rendre.sh [ecrans|planches|situations]
set -u
cd "$(dirname "$0")/.."
QUOI="${1:-tout}"
shot() { node tools/shot.mjs "$@" 2>&1 | grep -v "^$" | tail -1; }

if [ "$QUOI" = tout ] || [ "$QUOI" = ecrans ]; then
  for e in tableauDeBord ficheProjet projets projetsGrille rh affectation sage nouveauProjet stats journal admin; do
    shot "plates/_ecran.html?e=$e" out/ecrans/$e.png --w 1440 --scale 2
    shot "plates/_ecran.html?e=$e&h=900" out/ecrans/$e-900.png --w 1440 --h 900 --scale 2
  done
  shot "plates/_ecran.html?e=connexion&h=900" out/ecrans/connexion-900.png --w 1440 --h 900 --scale 2
  cp out/ecrans/connexion-900.png out/ecrans/connexion.png
  for e in mAccueil mProjet mAlerte; do shot "plates/_ecran.html?e=$e&m=1" out/ecrans/$e.png --w 390 --h 844 --scale 3; done
fi

if [ "$QUOI" = tout ] || [ "$QUOI" = planches ]; then
  # les planches à rendu simple : un fichier, un rendu
  for f in plates/[0-9]*.html; do n=$(basename "$f" .html)
    case "$n" in 15-gros-plans|18-mur-d-ecrans|39-terrain) continue;; esac
    shot "$f" out/plates/$n.png
  done
  # les planches à variantes
  shot "plates/01-ouverture.html?v=incline" out/plates/12-tableau-de-bord-incline.png
  shot "plates/15-gros-plans.html?v=menu" out/plates/15-barre-laterale.png
  shot "plates/15-gros-plans.html?v=menu&f=menu" out/plates/15-barre-laterale-menu.png --w 1400 --h 943
  shot "plates/15-gros-plans.html?v=table" out/plates/16-tableau-des-projets.png
  shot "plates/15-gros-plans.html?v=courbe" out/plates/17-courbe.png
  shot "plates/18-mur-d-ecrans.html" out/plates/18-mur-d-ecrans.png --w 1600 --h 900
  shot "plates/39-terrain.html" out/plates/39-terrain.png
  shot "plates/39-terrain.html?v=symbole" out/plates/40-des-gens.png
  shot "plates/39-terrain.html?v=symbole&f=large" out/plates/40-des-gens-large.png --w 1600 --h 900
  shot "plates/05-mur-des-empreintes.html?v=large" out/plates/05-mur-des-empreintes-large.png --w 1600 --h 900
  shot "plates/05-mur-des-empreintes.html?v=large&H=1200" out/plates/05-mur-des-empreintes-4x3.png --w 1600 --h 1200
  shot "plates/37-suivi-imprime.html?f=large" out/plates/37-suivi-imprime-large.png --w 1600 --h 900
  # les scènes inclinées (plates/_scene.html)
  shot "plates/_scene.html?e=ficheProjet&fond=nuit&rx=50&rz=28&x=-250&y=-150&k=1.0&he=1680&fil=haut" out/plates/14-fiche-inclinee.png --w 1400 --h 1050
  shot "plates/_scene.html?e=projets&rx=44&rz=22&x=-90&y=-70&k=0.94&he=1210&lavis=lagune&fil=non" out/plates/19-projets.png --w 1400 --h 1050
  shot "plates/_scene.html?e=rh&fond=nuit&rx=50&rz=-26&x=200&y=-160&k=1.0&he=1370&fil=bas" out/plates/20-ressources-humaines.png --w 1400 --h 1050
  shot "plates/_scene.html?e=sage&rx=42&rz=-32&x=220&y=-30&k=0.98&he=1490&lavis=terre&fil=haut" out/plates/21-extraction-sage.png --w 1400 --h 1050
  shot "plates/_scene.html?e=stats&rx=46&rz=26&x=-170&y=-130&k=1.0&he=1560&lavis=aube&fil=non" out/plates/22-statistiques.png --w 1400 --h 1050
fi

if [ "$QUOI" = tout ] || [ "$QUOI" = situations ]; then
  mkdir -p out/gen out/final
  shot "plates/_ecran.html?e=ficheProjet&h=880" out/gen/_ecran-fiche.png --w 1440 --h 880 --scale 2
  shot "plates/_ecran.html?e=tableauDeBord&h=880" out/gen/_ecran-tdb.png --w 1440 --h 880 --scale 2
  shot "plates/_ecran.html?e=mAccueil&m=1" out/gen/_ecran-mAccueil.png --w 390 --h 844 --scale 3
  R="python3 -W ignore tools/rehabiller.py"
  $R _prep/existant/desktop.png out/gen/_ecran-fiche.png out/final/35-portable-velours.jpg --quad 835.1,229.2 1923.9,451.2 1844.2,1163.4 794.4,907.7 --masque clair --seuil 226 --ombre 0.45 --teinte 85:172:60 --sat 0.92 --val 0.9
  $R _prep/existant/hero.png out/gen/_ecran-tdb.png out/final/36-portable-terre.jpg --quad 442,503.2 1506,677 1506,1497 442,1324 --masque clair --seuil 205 --ombre 0.35 --teinte 160:20:50 --sat 0.82 --val 1.0 --fond 246,234,222
  $R _prep/existant/phone.png out/gen/_ecran-mAccueil.png out/final/42-telephone.jpg --quad 640.2,306.8 1815.9,173.1 1802.3,2733 652.8,2866.8 --masque clair --seuil 246 --ilot --ombre 0.3 --fond 246,234,222
  python3 tools/frise_phases.py
fi
