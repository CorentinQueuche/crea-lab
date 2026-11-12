# Aube — guide de marque de travail

Aube est un assistant personnel IA fictif. Cette identité est un projet vitrine : une étude de cas complète, dans l'esprit de la référence « Jor Personal Assistant » (Typefool et Sam Miles, Behance), sans la copier. Référence téléchargée dans `../../10_INPUTS/reference-jor/` (24 fichiers, `jor-01` à `jor-24`, dans l'ordre de la page). On en reprend la structure de présentation, l'ambiance (fonds sombres, dégradés lumineux, orbe de verre, grands titres en graisse légère, beaucoup d'air) et le niveau de finition. Tout le reste est à nous : nom, logo, couleurs, textes, objets.

## L'idée

Pendant la nuit, Aube trie, prépare et anticipe. Au réveil, la journée est déjà en ordre. Tout le système visuel vient de là : le lever du jour.

- Signature : **Le jour se lève. Tout est prêt.**
- Triptyque (affiches, posts) : **Clair. Calme. Prêt.**
- Descripteur : **Assistant personnel**
- Adresse : `www.bonjouraube.fr`
- Chiffre de scène : **2 h 07** « gagnées chaque jour »
- Mots-clés : Clarté, Élan, Anticipation, Sérénité
- Valeurs : 01 Clarté, 02 Attention, 03 Fiabilité, 04 Initiative
- Ton : français, tutoiement, phrases courtes et calmes, concret (« J'ai prévenu Marc de ton arrivée »). Pas de jargon, pas d'emphase.
- Texte de présentation : « Aube est un assistant personnel intelligent, pensé pour celles et ceux qui mènent de front un métier et une vie. Pendant la nuit, il trie, prépare et anticipe ; au réveil, la journée est déjà en ordre. Tâches, rendez-vous, conseils sur mesure : Aube s'occupe du reste, pour que chaque matin commence clair. »
- Crédits : Client : Aube, assistant personnel. Secteur : technologie (IA). 2026©. Direction artistique, identité de marque et motion design : KLYRA.

## Le système

| Élément | Règle |
|---|---|
| Logotype | « aube » en minuscules, construit sur quatre disques de 100, graisse 24. Les contre-formes sont des dômes posés sur la ligne d'horizon (y = 50) : un soleil qui se lève dans chaque lettre. Moitié basse pleine. |
| Symbole | La lettre « a » seule (icône d'app, avatar, pied de page). |
| Version complète | Logotype + « Assistant / personnel » sur deux lignes à droite. |
| Couleurs | Nuit `#1C1122`, Prune `#4B1838`, Braise `#C4391A`, Aurore `#FF632B`, Miel `#FFC46B`, Blanc `#FFFFFF`, Brume `#E9E3DE`, Noir `#0A0609`. Texte sur fond clair : `#231A26`. |
| Dégradés | Classes `.g1` à `.g9` et `.g-vif`. Toujours Noir → Prune → Braise → Aurore → Miel, jamais d'autre teinte. Ajouter `.grain` sur les grandes surfaces. |
| Typographie | Outfit (Light 300 pour les titres et le texte, Regular 400, Medium 500 pour les intitulés). DM Mono pour les petites étiquettes, codes hex, numéros. |
| L'astre | Orbe de verre chaud, vivant : `Aube.orb(taille)`. |
| L'horizon | Grand disque au liseré lumineux qui monte du bas ou entre par un bord : classe `.horizon` (donner width, height, left, top). C'est l'équivalent maison des arcs lumineux de la référence. |
| Fond des planches | Blanc ou Brume pour les planches de charte, Noir ou Nuit pour les scènes. |

## Technique

Dossier de travail : ce dossier (`20_WORKING/aube`). Rien ici n'est suivi par Git.

- `brand/aube.css` + `brand/aube.js` : le socle. **Lecture seule.** Une page l'utilise ainsi :
  `<link rel="stylesheet" href="../brand/aube.css"><script src="../brand/aube.js"></script>`
- `Aube.wordmark(couleur, attrs)`, `Aube.symbol(couleur, attrs)`, `Aube.lockup(couleur, attrs)` : logos en SVG (chaînes HTML). `Aube.wordPath()`, `Aube.letterPath('a'|'u'|'b'|'e', décalageX)` : tracés bruts (viewBox du logotype : `0 -42 442 142`).
- `Aube.orb(taille, {mark, rings, glow})`, `Aube.seekOrbs(t, boucle)` : orbe, et son animation déterministe.
- `Aube.phone(écran, échelle)`, `Aube.watch(Aube.watchScreen(texte), échelle)`, `Aube.ncard(titre, texte)`.
- Écrans (390 × 844) : `Aube.screens.voix()`, `.jour()`, `.bord()`, `.chat()`.
- `Aube.foot('Rubrique', 'Sous-rubrique', couleur)` : pied de planche (symbole, deux intitulés, année).
- Fichiers logo vectorisés : `brand/logo/*.svg`. Polices TTF : `brand/fonts/`.
- Page d'exemple qui montre tout : `plates/_test.html`, rendu `out/_test.png`.
- Image fixe : `node tools/shot.mjs plates/x.html out/plates/x.png` (1400 px de large, rendu ×2 = 2800 px ; `--h` pour fixer la hauteur, sinon celle de `.plate`).
- Vidéo : `node tools/record.mjs motion/x.html out/motion/x.mp4 --w 1920 --h 1080 --fps 30 --dur 6`. La page expose `window.seek(t)` qui place tout l'état à l'instant t (aucune animation CSS ni horloge : tout est calculé depuis t).
- Lancer les commandes depuis ce dossier. Regarder chaque rendu (outil Read sur le PNG) avant de le déclarer fini.

## Qui fait quoi

- `plates/` et `out/plates/` : Iris (planches fixes).
- `motion/` et `out/motion/` : Jules (vidéos).
- `art/`, `blender/` et `out/blender/` : Cicco (visuels de supports et mockups 3D).
