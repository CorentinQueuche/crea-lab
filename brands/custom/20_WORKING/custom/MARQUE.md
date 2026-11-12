# Custom — brief de marque

Ce fichier est le brief de tous ceux qui produisent une pièce de ce projet. Il doit suffire. Le socle (`brand/marque.css`, `brand/marque.js`) fait foi pour les valeurs ; ce fichier dit comment s'en servir.

## 1. La règle du projet

Custom (custom.fr) est un vrai client de KLYRA. Son identité (logo, couleurs, polices, sprites, site) a été livrée en 2025 et **elle ne change pas**. Corentin, le 12/11/2026 : « inspire-toi vraiment de ce qui est déjà fait, ne la change pas », « sois vraiment moderne, créatif, unique », « des images, des textures, des masks », « toute technique est autorisée ».

Donc : on ne redessine rien. On prend ce qui existe, on en fait un système, et on le pousse très loin sur tous les supports. Chaque pièce doit se reconnaître comme du Custom sans le logo.

- Ce qui existe et qu'on garde tel quel : le symbole (deux blocs inclinés décalés), le logotype « Custom.fr », les couleurs, Bebas Neue en capitales avec un mot surligné, la grotesque étirée des grands titres, les sprites en pixels arrondis (moto, course, dunk), les chiffres en blocs (« 24 h »), les taches d'encre balayées (orange, violet), les croix de repérage, le motif de blocs des cartes de visite, les sangles orange autour des écrans, la photo de sport en mouvement, la macro d'atelier.
- Ce qu'on ajoute (à présenter comme une proposition de KLYRA) : les noms donnés aux éléments (le Cran, le bloc, la coulure, le piquage), les règles chiffrées, les six traitements photo, les masques, les cinq techniques rendues en matière, la barre de contrôle, les pictos d'univers, le gris Craie, l'échelle de fluo, les supports nouveaux.

## 2. Custom en bref (source : la page publiée par KLYRA)

Atelier français de personnalisation. Quatre univers sous un même toit : **textile, print, goodies, signalétique**. Cinq techniques opérées en interne : **sérigraphie, DTF, broderie, flocage, sublimation**. Les concurrents sous-traitent ; Custom fabrique. C'est l'argument.

KLYRA a refait en 2025, en quatre semaines, le branding et le site (UX/UI). Le site sépare les quatre univers, met la page Atelier au centre, et mène vers une demande de devis qualifiée (univers, technique, volume, échéance).

**Chiffres autorisés, et seulement ceux-là** : 800 vues de la page Atelier en deux mois ; moins de 5 secondes pour identifier son univers ; 2025 ; 4 semaines ; et les chiffres affichés par le site : +500 projets, 7 à 10 jours de délai moyen, 100 % dans nos ateliers, devis sous 24 h, 4 univers, 5 techniques. Aucun autre chiffre, aucun résultat inventé.

**Citation publiée** (à reprendre mot pour mot ou pas du tout) : « Le site reflète enfin ce qu'on fait vraiment. Nos clients comprennent en arrivant qu'on a un atelier intégré et que chaque projet est traité chez nous. » — Loïc Caron, fondateur de Custom.

## 3. L'idée

**Tout est fait ici.** Le symbole dit déjà tout : deux blocs identiques, décalés d'un pas. L'atelier et vous, à une marche l'un de l'autre. Pas d'intermédiaire. Nous appelons le symbole **le Cran**.

- Triptyque : **Imaginé chez vous. Fabriqué chez nous. Porté partout.**
- Descripteur : Atelier de personnalisation.
- Phrases du site, à réutiliser : « Transformez vos idées en produits personnalisés premium », « On fait plus qu'un maillot », « Chaque objet, sa technique », « Prêt à donner vie à votre projet ? », « Travaillons ensemble en toute sérénité », « En quelques chiffres », « Donnez vie à vos idées ».
- Ton : le vouvoiement, des phrases courtes, le verbe d'abord, un mot surligné par titre. L'énergie du sport, la précision de l'atelier. Jamais de jargon, jamais de superlatif creux.
- Mots-clés : atelier, geste, matière, pas, équipe, série, pièce unique, repère.

## 4. Le système

### Le logo
- **Logo de référence** : le Cran puis « Custom.fr », sur une ligne (`Marque.logo`). **Empilé** : le Cran au-dessus, centré (`Marque.logoV`). **Logotype seul** pour les très grands usages (`Marque.wordmark`). **Cran seul** : icône, bouton, signalétique, fin de vidéo (`Marque.symbol`). **Filaire** (contour) : sur le textile, au fil (`{ contour: 2 }`). **Avec descripteur** (`Marque.lockup`).
- Le Cran : deux blocs de 117,8 × 62,4, inclinés de **13,3°**, décalés de 62,5 en x et 47,6 en y, recouvrement 14,8, rayon de coin 7,2 (repère 191,05 × 110). Tout est dans `Marque.CONSTRUCTION`.
- Zone de protection : la moitié de la hauteur d'un bloc (soit 0,28 fois la hauteur du Cran) sur les quatre côtés.
- Tailles minimales : logo de référence 90 px ou 24 mm de large ; logotype seul 64 px ou 18 mm ; Cran seul 16 px ou 4 mm.
- Couleurs du logo : fluo sur noir, blanc sur noir, encre sur fluo, encre sur blanc, blanc sur violet, encre sur orange, fluo ou blanc sur photo assombrie. Le Cran peut être fluo et le logotype blanc. Jamais de dégradé, d'ombre, de contour ajouté, de rotation, de déformation.

### Les couleurs (codes de la charte, inchangés)
| Nom | Code | Rôle |
|---|---|---|
| Noir atelier | `#101012` | le fond |
| Fluo | `#E2FF21` | la couleur de Custom |
| Blanc | `#FFFFFF` | texte sur noir, cartes claires |
| Graphite | `#272728` | cartes sur le noir |
| Fonte | `#404042` | filets pleins, pictos éteints |
| Acier | `#56565A` | pixels au repos, pictos éteints, filets (jamais de texte courant sur le noir : contraste 2,6) |
| Violet | `#8E3EFF` | couleur d'atelier |
| Orange | `#FE3600` | couleur d'atelier (le ballon, une sangle) |
| Encre | `#03010E` | texte sur fluo et sur blanc |
| Craie (extension) | `#DBDBDE` | gris clair des fonds d'écrans |

Proportions sur un support : noir 60, fluo 25, blanc 10, couleurs d'atelier 5. Une seule couleur d'atelier domine par support (violet ou orange), l'autre n'apparaît qu'en détail. Sur le fluo, le texte est toujours en Encre (contraste 18,3) ; jamais de blanc sur fluo. Sur le violet, texte blanc (4,9, donc en grand corps seulement). Sur l'orange, texte en Encre. Pas de couleur hors palette, gris compris. Le texte secondaire sur le noir est du blanc à 62 % (`.t-doux`), pas de l'Acier.

### La typographie
| Rôle | Police | Classe | Usage |
|---|---|---|---|
| Large | Archivo étirée à 125 %, graisse 800 | `.t-large` | les grands titres en bas de casse (« Transformez »), 1 à 5 mots |
| Titre | Bebas Neue, capitales | `.t-titre` + `.h-56` à `.h-420` | les titres de section, toujours avec un mot surligné |
| Texte | Inter | `.t-chapo`, `.t-txt`, `.t-petit` | texte courant, interface |
| Repère | JetBrains Mono, capitales | `.t-mono` | cotes, codes d'atelier, métadonnées |

Le **surligneur** (`.surl`, `Marque.surl(txt, cls)`) : un mot ou un groupe pris dans un bloc de couleur, tourné de −1,6° (`.monte` : +1,4°, `.droit` : 0). Un seul par titre, sur une seule ligne. Fluo par défaut ; `.violet`, `.orange`, `.blanc`, `.noir` en variation.

Les polices latines n'ont ni « → » ni « ✓ » : flèche avec `Marque.fleche()`, jamais de caractère spécial non vérifié.

### Le bloc
Le pixel arrondi de la marque. Rayon de coin : 30 % de la cellule ; un coin n'est arrondi que s'il est libre (les blocs voisins fusionnent). Trois familles : les **sprites** (`moto` 5 images, `course` 4, `dunk` 8 avec le ballon orange), les **chiffres en blocs** (`Marque.pix('24h')`), les **pictos d'univers** (`Marque.picto('textile')`). Un sprite s'anime à 8 images par seconde, sans fondu.

### Les matières d'encre
- **La coulure** (`Marque.coulure`) : tache d'encre balayée, bords effilochés en traits horizontaux. Orange, violet ou fluo. Elle déborde volontiers du cadre. Une ou deux par planche, jamais en dégradé. Sert aussi de masque (`Marque.coulureURL`).
- **Le piquage** (`Marque.piquage`) : champ de points de fil qui suivent une courbe. Fluo sur blanc ou sur noir.
- **Le motif de blocs** (`Marque.motif`, `.tx-motif`) : rangs de blocs inclinés en quinconce.
- **Trames** : `.tx-trame` (points), `.tx-lignes`, `.tx-hachures` (à la pente du Cran), `.tx-toile` (tissage sombre).
- **Grain** : `.grain` (l'élément doit avoir un fond ; le contenu au-dessus prend `.net`).

### Les repères d'impression
La marque emprunte les marges de la feuille d'atelier : croix de repérage aux angles (`Marque.reperes()` dans un `.cadre-r`), mire ronde (`Marque.mire()`), barre de contrôle aux couleurs de la marque (`Marque.barre()`), codes en chasse fixe (`Marque.code('CST', 'BRO', '2026')` ; codes des techniques : SER, DTF, BRO, FLO, SUB).

### La photo
Deux sujets : le **sport en mouvement** (filé, saut, poussière) et le **geste d'atelier** (macro, matière, machine). 14 photos de marque dans `photos/` (générées pour ce projet avec Sunra, aucun droit de tiers) : `dunk`, `trail`, `moto`, `equipe`, `peloton`, `serigraphie`, `broderie`, `presse`, `fils`, `traceur`, `pliage`, `maille`, `mur`, `hoodie`. 14 médias d'origine publiés par KLYRA : `origine-vignette`, `origine-velo`, `origine-ski`, `origine-veste`, `origine-drap`, `origine-totem`, `origine-broderie`, `origine-affiche-cartes`, `origine-site-pages`, `origine-site-ecrans`, `origine-tablette`, `origine-portable`, `origine-goodies`, `origine-sprites` (à montrer comme « l'existant », sans les retoucher).

Six traitements (`Marque.photo(nom, { mode })`) : `brut`, `sombre` (sous un logo), `nb`, `duo` (noir et une couleur), `points` et `lignes` (tramées), `seuil`. Couleur du traitement : fluo, violet, orange ou blanc. Les **masques** : une photo dans le Cran (`.dans-cran`), dans un bloc (`.dans-bloc`), dans une coulure, dans un sprite ou un chiffre.

### Les cinq techniques
`brand/techniques.js` (objet `MarqueTech`) rend une forme sur canvas comme une macro de vrai marquage : `broderie`, `serigraphie`, `dtf`, `flocage`, `sublimation`, sur quatre tissus (`maille`, `serge`, `coton`, `molleton`). Usage : `<canvas data-tech="broderie" data-forme="cran" data-c="#E2FF21" data-fond="maille" data-p="1" width="1600" height="1200" style="width:800px;height:600px"></canvas>`, charger `../brand/techniques.js`, puis `MarqueTech.tous()`. `data-p` (0 à 1) anime la fabrication. Autres attributs : `data-c2` (seconde couleur), `data-cf` (couleur du tissu), `data-fond` (`maille`, `serge`, `coton`, `molleton`, ou vide pour un fond transparent), `data-zoom` (à 1, le petit côté du canvas couvre 32 mm de tissu), `data-marge`, `data-angle`, `data-seed`. Tissu seul : `<canvas data-tissu="serge" data-c="#101012">`. En JS : `MarqueTech.rendre(canvas, { tech, forme, c, c2, fond, cf, p, zoom, vignette })` (0,5 s pour 1600 × 1200) ; `forme` vaut `cran`, `logotype`, `logo` ou `{ d, box }`. Contrôle visuel : `out/_tech.png`. Des textures prêtes pour Blender sont dans `blender/tex/tech-*.png` et `tissu-*.png`.

### Le mouvement
Tout avance d'un pas. Un élément entre en glissant le long de la pente du Cran (13,3°) et s'arrête net : 0,5 s, courbe `Marque.ease` (quart sortant). Le surligneur se pose de gauche à droite en 0,25 s, puis le texte passe en Encre. Les sprites tournent à 8 images par seconde, en crans, sans interpolation. Les deux blocs du Cran arrivent l'un après l'autre (0,12 s d'écart), le logotype suit lettre par lettre (0,04 s). Pas de rebond, pas de fondu long, pas de flou de mouvement ajouté.

## 5. L'API du socle

Charger `../brand/marque.css` puis `../brand/marque.js` (ne pas lire la deuxième ligne du JS : ce sont les tracés, 23 Ko). Objet `Marque` :

- Logo : `logo(c, attrs, {sym, contour})`, `logoV(c, attrs, {sym, inverse, contour})`, `wordmark(c, attrs, {contour})`, `symbol(c, attrs, {contour})`, `lockup(c, attrs)`, `icone(taille, ton)`. `attrs` est une chaîne d'attributs SVG (`'style="height:60px"'`). Tracés : `symbolPath()`, `wordPath()`, `letterPath('C')`, `LETTRES` (ordre et x de chaque lettre), `LOGO` (boîtes), `symbolParts()` (les deux blocs), `CONSTRUCTION`.
- Blocs : `blocPath(x, y, l, h, r)`, `bloc(c, attrs, {l, h})`, `marches(n)` → `{d, box}`, `rpoly(points, r)`.
- Grilles : `sprite(nom, i, {c, c2, cell, attrs})`, `dunk(i, {c, c2, attrs})`, `spriteRows(nom, i)`, `pix(txt, o)`, `pixRows(txt)`, `picto(nom, o)`, `grille(rows, o)`, `grillePath(rows, {cell, r})`, `SPRITES`.
- Matières : `coulure({w, h, c, seed, pas, cx, cy, rx, ry, frange, attrs})`, `coulurePath(o)`, `coulureURL(o)`, `piquage({w, h, c, seed, px, py, angle, courbe, attrs})`, `motif({w, h, c, l, seed, trou, attrs})`, `chemin({w, h, c, de, a})`, `fleche(c, style, sens)`.
- Repères : `reperes({t, cadre})`, `croix(style, t)`, `mire(t, style)`, `barre({couleurs, n, v, style})`, `code(...parts)`.
- Texte : `surl(txt, cls)`, `PHRASES`, `IDEE`, `TRIPTYQUE`, `DESCRIPTEUR`.
- Photo : `photo(nom, {mode, c, pos, tp, ta, inv, ct, lu, cls, style})`, `photoURL(nom)`, `PHOTOS`.
- Gabarits : `entete(cols, c)`, `foot(a, b, c)`, `pastille(t, on)`, `onglets(liste, actif)`, `SECTIONS`.
- Appareils : `phone(html, k)`, `browser(html, k, {url, h, clair})`, `laptop(html, k)`.
- Données : `DONNEES` (univers, techniques, chiffres, promesses, devis, menu, citation), `COULEURS`, `NOMS`, `ECHELLE`, `contraste(a, b)`, `ease`, `easeIO`, `rnd(seed)`, `col(nom)`.
- Écrans du site : `brand/ecrans.js` et `brand/ecrans.css` (objet `Marque.site`), écrits à part.

Variables CSS : couleurs (`--noir`, `--fluo`, `--blanc`, `--graphite`, `--fonte`, `--acier`, `--violet`, `--orange`, `--encre`, `--craie`), rôles (`--vif`, `--clair`, `--moyen`, `--sombre`, `--scene`, `--sur-scene`, `--papier`, `--doux`, `--filet`), polices (`--large`, `--titre`, `--font`, `--mono`), `--pente`. La page de test `plates/_test.html` (rendu : `out/_test.png`) montre tout.

## 6. Règles de fabrication

- Une planche = un fichier HTML dans `plates/`, un conteneur `<div class="plate">` large de 1400 px, hauteur libre (800 à 1400 en général). Rendu : `node tools/shot.mjs plates/NN-nom.html out/plates/NN-nom.png` (×2, soit 2800 px). **Regarder chaque rendu**, entier puis en recadrage (`--crop x,y,l,h`).
- Bandeau d'en-tête `Marque.entete()` sur les planches (sauf mosaïque et plein cadre photo), en haut. Marges : 28 px pour le bandeau, 84 px pour le contenu.
- Les classes du socle sont globales : préfixer toute classe qu'on écrit (le préfixe est donné dans chaque brief). Ne jamais modifier `brand/`.
- Pas d'animation CSS, pas d'horloge. Une vidéo expose `window.seek(t)`.
- Écrire les fichiers avec l'outil d'écriture, jamais par heredoc de shell (apostrophes et antislashs).
- Français, apostrophes typographiques (’) dans les textes affichés, espace insécable avant « : ; ? ! % » et dans « 24 h ».
- Personnes et coordonnées : aucune coordonnée inventée pour Custom (seul `custom.fr` est cité). Noms fictifs sur les cartes de visite, téléphone fictif `01 99 00 12 34` si besoin. Aucune marque tierce, aucun logo d'équipementier.
- Crédit à écrire là où il y a des crédits : « Identité et site : KLYRA pour Custom, 2025. Système et supports : proposition de KLYRA, 2026. »

## 7. Les pièces

Sections : ouverture, **La marque**, **L'atelier**, **Le site**, **Les supports**, clôture. V = vidéo, 3D = scène Blender.

| N° | Pièce | Lot |
|---|---|---|
| 01 | Couverture | A |
| 02 | 3D · L'écusson : le Cran brodé, en très gros plan | 3D-1 |
| 03 | Mosaïque d'ouverture | assemblage |
| 04 | L'existant : ce qu'on garde, ce qu'on met en système, ce qu'on ajoute | A |
| 05 | Section · La marque | A |
| 06 | Bento de marque | A |
| 07 | Construction du Cran | A |
| 08 | V · Révélation du logo (1920 × 1080, 6 s) | M-1 |
| 09 | Logo et variantes | A |
| 10 | Couleurs | A |
| 11 | Typographie et surligneur | A |
| 12 | V · Le surligneur (1080 × 1080, 8 s, boucle) | M-1 |
| 13 | Le bloc : sprites, chiffres, pictos | A |
| 14 | V · Les sprites en mouvement (1920 × 1080, 6 s, boucle) | M-1 |
| 15 | Coulures, piquage, trames | A |
| 16 | Photographie : traitements et masques | A |
| 17 | Repères d'impression | A |
| 18 | Section · L'atelier | C |
| 19 | Cinq techniques, un même logo | C |
| 20 | V · Cinq techniques en fabrication (1920 × 1080, 12 s) | M-1 |
| 21 | 3D · Le cadre de sérigraphie | 3D-1 |
| 22 | Matières : les tissus, les gestes | C |
| 23 | Quatre univers | C |
| 24 | Section · Le site | B |
| 25 | L'accueil du site | B |
| 26 | 3D + V · Le site sur un portable tenu par des sangles orange | 3D-2 |
| 27 | Quatre pages d'univers | B |
| 28 | V · Le site défile (écran seul, 1920 × 1200, 12 s) | M-2 |
| 29 | La page Atelier et les chiffres | B |
| 30 | Le parcours de devis | B |
| 31 | Composants d'interface | B |
| 32 | 3D · Le téléphone | 3D-2 |
| 33 | V · L'écran mobile vivant (1080 × 1350, 8 s) | M-2 |
| 34 | Section · Les supports | C |
| 35 | Textile à plat : « On fait plus qu'un maillot » | C |
| 36 | Le sweat porté (photo et marquage) | C |
| 37 | 3D · Étiquettes, écussons, emballage | 3D-1 |
| 38 | Affiches (série de trois) | C |
| 39 | 3D · Papeterie : cartes, chemise, enveloppe | 3D-1 |
| 40 | 3D · Goodies | 3D-2 |
| 41 | 3D · Signalétique : le totem et le panneau | 3D-2 |
| 42 | Véhicule d'atelier | C |
| 43 | Réseaux sociaux | C |
| 44 | Icône et favicon | C |
| 45 | Guide de marque (mosaïque des pages) | guide |
| 46 | V · Dérive sur la mosaïque (1920 × 1080, 20 s) | assemblage |
| 47 | Planche-contact | assemblage |
| 48 | Clôture | B |

## 8. Pièges connus

- `Marque.dataSVG` et `coulureURL` renvoient `url('…')` avec des apostrophes : on peut les poser dans un `style="…"`.
- Un `canvas` de technique ne se rend qu'après `MarqueTech.tous()`, à appeler après avoir écrit le HTML dans la page.
- Les traitements photo tramés (`points`, `lignes`, `seuil`) reposent sur `filter: contrast()` : ne pas poser un autre filtre ni une opacité sur le même élément ; l'envelopper.
- `Marque.chemin` : en dessous de 400 px de large, le texte « Notre atelier » touche la première marche ; lui donner au moins 420 px.
- `.pan` utilise des unités de conteneur : lui donner une hauteur explicite.
- La planche-contact et la mosaïque rangent les médias à plat par nom : un fichier de `out/final` et un de `out/motion` ne doivent pas porter le même nom.
