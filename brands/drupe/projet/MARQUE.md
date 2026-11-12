# Drupe — guide de marque de travail

Drupe est un torréfacteur de café de quartier, fictif. Il vend en boutique et par abonnement : une petite application sert à composer sa boîte et à régler son rythme. Cette identité est un projet vitrine pour le portfolio KLYRA, sans référence imposée. Demande de départ : lumineux, de jour, artisanal mais net, tout en français, pas de mise en ligne pour l'instant.

État au 11 novembre 2026 : la marque est conçue, le socle est écrit et vérifié (`plates/_test.html`, rendu `out/_test.png`). Les planches, les vidéos, les scènes 3D, le guide et le site restent à produire ; les fichiers de l'exemple encore présents dans `plates/`, `motion/`, `art/`, `blender/`, `deck/` et `site/` sont ceux de l'exemple du skill et sont à réécrire entièrement (ils appellent des fonctions qui n'existent plus dans ce socle).

## L'idée

**Le café est un fruit.** Avant d'être un grain brun, le café est le noyau d'une cerise rouge, la drupe du caféier. Drupe la traite comme un fruit de saison : cueillie mûre, torréfiée clair, vendue fraîche, au coin de la rue. Tout le système visuel vient de là : le fruit ouvert en deux, ses deux grains face à face, séparés par un sillon.

Pistes écartées : « la tournée » (tout tourne : le tambour, la livraison, l'abonnement ; juste, mais sans couleur propre) et « le coin de la rue » (le quartier ; dit où, pas quoi).

- Nom : **Drupe** (le fruit à noyau, en botanique). Non vérifié : ni dépôt de marque, ni disponibilité du domaine. Une application de téléphonie porte déjà ce nom à l'étranger ; à revoir si la marque devenait réelle.
- Signature : **Le café est un fruit. Torréfié au coin de la rue.**
- Triptyque (affiches, publications) : **Cueilli mûr. Torréfié clair. Servi frais.**
- Descripteur : **Torréfacteur de quartier** (sur deux lignes à droite du logotype).
- Chiffre de scène : **48 h** « du tambour à votre boîte aux lettres ». Autres chiffres vrais dans l'histoire : fournées de **12 kg**, torréfaction **chaque mardi**, livraison à vélo **le jeudi**.
- Mots-clés : Fruit, Fraîcheur, Voisinage, Franchise.
- Valeurs :
  - 01 Saison : le café est une récolte. La carte change quand la récolte change.
  - 02 Fraîcheur : torréfié chaque mardi, par fournées de 12 kg, daté à la main.
  - 03 Voisinage : on connaît vos habitudes, on livre à vélo, on reprend les boîtes vides.
  - 04 Franchise : origine, altitude, procédé, prix. Tout est écrit sur la pastille.
- Ton : français, vouvoiement chaleureux, phrases courtes, des faits et des dates plutôt que des adjectifs. Le « on » de l'artisan.
  - On dit « Torréfié mardi. » ; on évite « Fraîcheur garantie ».
  - On dit « Fraise, jasmin, une fin de cacao. » ; on évite « Une explosion de saveurs ».
  - On dit « On vous met un sachet de côté. » ; on évite « Optimisez votre abonnement ».
- Texte de présentation : « Drupe est un torréfacteur de quartier. Nous achetons le café comme un fruit de saison, nous le torréfions clair chaque mardi par petites fournées, et nous le livrons à vélo le jeudi. En boutique ou par abonnement, vous choisissez vos cafés ; nous écrivons sur chaque sachet d'où il vient et quand il a été torréfié. »
- Crédits : Client : Drupe, torréfacteur de quartier. Secteur : alimentation, commerce de proximité. 2026©. Direction artistique, identité de marque et motion design : KLYRA. Polices : Bricolage Grotesque et IBM Plex Mono (licence OFL).

### Données fictives (à utiliser telles quelles, partout)

- Site : `www.drupe-cafe.fr`. Courriel : `bonjour@drupe-cafe.fr`. Réseaux : `@drupe.cafe`.
- Téléphone : `04 65 71 02 47` (plage réservée aux numéros fictifs).
- Adresse : « À l'angle de la rue du Tambour », sans numéro ni ville. Horaires : du mardi au samedi, 8 h à 18 h.
- Personnes : Jeanne Lemoine, torréfactrice ; Samuel Perrin, boutique et tournées. Cliente de l'application : Inès.
- Les cinq cafés de la carte sont dans `Marque.CAFES` (Guji, Huila, Nyeri, Cerrado, Cauca) avec pays, altitude, procédé, notes, prix et ton de pastille. Ne pas en inventer d'autres sans les y ajouter.
- Dates de l'histoire (`Marque.DATES`) : nous sommes le samedi 14 novembre 2026, semaine 47 à venir ; torréfaction le mardi 17, livraison le jeudi 19 ; la carte ferme le lundi à 20 h. Abonnement : 2 sachets de 250 g tous les 15 jours, 21 € par envoi, vélo compris. Boîte n° 17.

## Le système

| Élément | Règle |
|---|---|
| Logotype | « DRUPE » en capitales de 100 de haut, graisse 20, formes en droites et arcs de cercle. **Chaque lettre est fendue d'un sillon vertical de 8, juste après son fût** : c'est le sillon du grain de café, et le pont d'un pochoir de sac de jute ou de cagette. Aucune contre-forme fermée : le logo tient en un seul aplat et se découpe réellement en pochoir. Espace entre lettres : 18. Repère : `0 0 516 100`. |
| Symbole | La drupe coupée : un disque de rayon 39 fendu par le même sillon de 8, incliné de 24°, surmonté de sa queue (arc de graisse 9, détaché de 7). Deux grains face à face dans le fruit. Icône d'application, pied de page, enseigne, pastille. |
| Version complète | Logotype + « Torréfacteur / de quartier » en Bricolage Grotesque Medium, sur deux lignes à droite, dernière ligne posée sur la ligne de base. |
| Taille minimale | Logotype : 64 px ou 18 mm de large (le sillon se ferme en dessous, le mot reste lisible). Symbole : 16 px. |
| Couleurs | Fleur `#FFFDF8` (papier, cartes), Parche `#F4ECDD` (fond de marque), Pulpe `#F6C3C0` (lumière), **Cerise `#CF2145`** (vive, rare), Café vert `#C7D5A9` (aplat doux), Feuille `#1E4A36` (fond dense, texte d'accent), Grain `#2A1A14` (encre du texte), Marc `#150F0C` (noir de scène, 3D et vidéo seulement). |
| Proportions | Marque de jour : trois quarts de clair (Parche, Fleur), un peu de Pulpe ou de Café vert, la Cerise par touches (un mot, un bouton, une pastille, un aplat de couverture). Feuille et Grain servent de contrepoint, jamais de fond dominant d'une série. |
| Logo en couleur | Cerise sur Fleur ou Parche ; Fleur sur Cerise ou Feuille ; Grain sur tout fond clair ; Feuille sur Café vert. Interdits : Cerise sur Feuille (1,9), Cerise sur Grain (3,2), Cerise sur Pulpe ou Café vert en petit. |
| Contrastes | Cerise sur Fleur 5,2 · sur Parche 4,5 (texte courant possible dès 16 px) · sur Pulpe 3,4 et sur Café vert 3,4 (titres seulement). Grain sur Parche 14,2. Feuille sur Parche 8,6 · sur Café vert 6,5. Fleur sur Feuille 9,9 · sur Cerise 5,2. |
| Dégradés | Classes `.g1` à `.g9` et `.g-vif`. Toujours dans l'ordre du mûrissement : Feuille → Café vert → Parche → Pulpe → Cerise, jamais d'autre teinte. `.g1` à `.g6` sont clairs (texte en Grain ou Feuille), `.g7` à `.g9` et `.g-vif` sont denses (texte en Fleur). Ajouter `.grain` sur les grandes surfaces (grain de papier, en multiplication). Ne jamais fondre la Cerise directement dans la Feuille : cela donne du brun. |
| Typographie | Bricolage Grotesque : Medium 500 pour les titres, serrés (interlettrage -0,03 em, interligne 1,02) ; Regular 400 pour le texte ; SemiBold 600 pour les noms de café ; Light 300 disponible pour de très grands chiffres. IBM Plex Mono 400 et 500, en capitales espacées, pour les étiquettes, codes, dates, prix au kilo, altitudes. |
| La pastille | L'étiquette ronde de chaque café, comme celle qu'on colle sur un fruit : `Marque.pastille(café, taille, {angle, pose})`. Un ton par café (Cerise, Café vert, Pulpe, Grain, Feuille, Fleur). Toujours posée un peu de travers (angle entre -8° et 12°), jamais déformée, jamais sous 56 px. Elle scelle les sachets, signe les gobelets, sert de vignette dans l'application. |
| Le semis | Des drupes en quinconce, chacune tournée d'un angle fixe, comme un papier d'emballage de fruits : `Marque.semis({cols, rows, pas, taille, tons, opacite})`. Trois tons sur Parche (Pulpe, Café vert, une Cerise de temps en temps) ou ton sur ton sur Cerise et sur Pulpe. Fond de planche, papier de soie, intérieur de boîte, fond d'écran. Jamais derrière un texte courant sans le passer à 30 % d'opacité. |
| Le symbole en grand | Le symbole peut entrer par un bord : au moins 1,2 fois la hauteur du cadre, coupé par deux bords, la queue visible. En Cerise sur Pulpe ou Parche, en Pulpe sur Cerise. Un seul par composition. |
| Le tampon | La date de torréfaction, en IBM Plex Mono Cerise dans un cadre fin, penchée de -3° : classe `.tampon`, texte `Marque.DATES.tampon`. Sur les sachets et dans la fiche d'un café, nulle part ailleurs. |
| Mouvement | Les choses mûrissent puis s'ouvrent : la couleur arrive d'abord (du Café vert à la Cerise), puis les deux moitiés s'écartent de la largeur du sillon. Les pastilles se posent en tournant de quelques degrés. Le semis se balance doucement (`Marque.seekSemis`). Sorties douces, aucun rebond, aucun flash, aucune lueur. |
| Lumière des scènes | Toujours de jour : soleil du matin rasant, ombres longues et nettes, ombres de feuilles sur un mur clair. Matières : papier, kraft blanchi, bois clair, grès, émail, métal laqué. Pas de nuit, pas de néon, pas de sol noir brillant. |
| Fond des planches | Fleur ou Parche pour les planches de charte ; Pulpe, Café vert ou `.g-vif` pour les planches d'ambiance ; Feuille pour une respiration dense, une fois sur six au plus. |

## Règles chiffrées

Fixées le 11/11/2026 pour que le guide en pages et le site disent la même chose. Décidées en production, non validées par Corentin.

| Règle | Valeur |
|---|---|
| Zone de protection | Deux graisses de fût autour du logo (40 dans son repère, soit 40 % de la hauteur des lettres). Symbole seul : un quart de son diamètre. |
| Tailles minimales | Version complète 160 px ou 45 mm ; logotype 64 px ou 18 mm ; symbole 16 px ou 5 mm ; pastille 56 px ou 30 mm imprimée. |
| Proportions des couleurs | Parche 45, Fleur 30, Pulpe 8, Café vert 7, Cerise 5, Feuille 3, Grain 2 (en %). Une seule touche de Cerise par écran, une composition Feuille au plus sur six. |
| Mouvement | État 180 ms ; entrer 420 ms, montée de 12 px ; ouvrir 500 ms ; poser 900 ms ; mûrir 1 350 ms ; décalage dans un groupe 150 ms ; balancement du semis en boucle de 8 s. |

## Planches de l'étude de cas

Ordre proposé pour `presentation.json`. « 3D » : scène Blender. « Vidéo » : page de `motion/` enregistrée image par image. Le reste : planche HTML de 1400 px. Alterner clair et dense, jamais trois planches de même nature à la suite.

| N° | Planche | Type | Ce qu'elle montre |
|---|---|---|---|
| 01 | Ouverture | 3D | La drupe coupée, géante : deux demi-sphères laquées Cerise, face à face, posées sur une table Parche au soleil du matin ; une feuille de caféier projette son ombre. |
| 02 | Présentation | HTML | Le texte de présentation en grand sur Fleur, crédits sur quatre colonnes, symbole Cerise. |
| 03 | Mots-clés | HTML | Fruit, Fraîcheur, Voisinage, Franchise sur `.g5`, chacun dans une pastille vide ; semis ton sur ton derrière. |
| 04 | Valeurs | HTML | Titre à gauche, quatre valeurs numérotées à droite, sur Parche. |
| 05 | Construction du logotype | HTML | Les cinq lettres sur leur grille : hauteur 100, graisse 20, sillon 8 après chaque fût, rayons 50, 30 et 10 ; à côté, le symbole et son inclinaison de 24°. Fond Feuille, tracés en Café vert. |
| 06 | Révélation du logotype | Vidéo | Les lettres arrivent pleines, en Café vert ; elles mûrissent jusqu'à la Cerise ; le sillon les fend l'une après l'autre ; le descripteur se pose. |
| 07 | Logo et variantes | HTML | Version complète en grand, puis quatre pavés : Cerise sur Fleur, Fleur sur Cerise, Grain sur Parche, Feuille sur Café vert ; tailles minimales. |
| 08 | Le semis | Vidéo | Boucle : le semis plein cadre se balance, une drupe sur six mûrit du Café vert à la Cerise. |
| 09 | Les pastilles | HTML | Les cinq cafés de la carte et l'assemblage maison, en grand, sur Fleur, avec la lecture d'une pastille (nom, origine, altitude, notes). |
| 10 | Écrans de l'application | HTML | Quatre téléphones décalés (accueil, carte, abonnement, fiche), recadrés en haut et en bas, sur `.g2`. |
| 11 | Mosaïque | Vidéo | Tuiles arrondies où vivent ensemble le semis, une pastille qui se pose, le minuteur, le tampon, un sachet qui se remplit. |
| 12 | Palette | HTML | Huit bandes verticales de largeurs inégales (Parche et Fleur larges, Cerise étroite), nom, code, rôle. |
| 13 | Dégradés | HTML | Titre, court texte sur le mûrissement, grille 3 × 3 des préréglages. |
| 14 | Les sachets | 3D | Trois sachets à soufflet en papier blanc cassé, debout sur un comptoir de bois clair, scellés par leur pastille, étiquette `Marque.etiquette`, tampon de date. |
| 15 | Typographie | HTML | « Bricolage » en très grand, les graisses, IBM Plex Mono sur une ligne d'étiquette (origine, altitude, prix, date). |
| 16 | La boîte d'abonnement | 3D | La boîte en carton livrée à vélo, ouverte, vue de trois quarts haut : deux sachets, papier de soie au semis, carte « Torréfié mardi », logotype au pochoir sur le couvercle. |
| 17 | Gobelet et tasse | 3D | Un gobelet à emporter Fleur avec pastille Cerise et une tasse en grès Café vert, sur le rebord de la vitrine, ombres longues. |
| 18 | La devanture | 3D | Boutique d'angle de jour : façade Parche, lettres DRUPE découpées en Cerise, enseigne drapeau ronde au symbole, vitrophanie au semis, store Café vert, chevalet de trottoir avec le triptyque. |
| 19 | Guide de marque | HTML | Mosaïque des pages du guide (`deck/pages.js`). |
| 20 | Affiche de rue | Vidéo dans décor 3D | Colonne d'affichage en plein jour : le triptyque s'écrit ligne par ligne, puis le symbole entre en grand par un bord. |
| 21 | Icône d'application | HTML | Icône (symbole Fleur sur Cerise), variantes de ton, écran d'accueil générique. |
| 22 | L'application | Vidéo | Composer sa boîte : la carte défile, deux pastilles se posent dans la boîte, le bouton passe à « C'est noté pour mardi ». |
| 23 | Montre et messages | Vidéo | Le minuteur d'infusion qui tourne (2:30), puis deux cartes de message qui se succèdent. |
| 24 | Papeterie et petite signalétique | 3D | Cartes de visite recto Cerise, verso Fleur, carte de fidélité à tamponner, sac en kraft au pochoir, sur une table claire. |
| 25 | Le téléphone | 3D | Un téléphone posé sur le comptoir à côté d'un sachet et de quelques cerises de café, écran sur la fiche du Guji. |
| 26 | Réseaux sociaux | HTML | Trois publications génériques : le triptyque, une pastille en gros plan, « Torréfié mardi ». |
| 27 | L'ardoise | Vidéo dans décor 3D | L'écran derrière le comptoir : le chiffre 48 h monte, puis la carte de la semaine s'affiche café par café. |
| 28 | Merci | HTML | Fin sobre sur Cerise, logotype Fleur, crédits, adresse fictive. |

Scènes 3D (huit) : 01, 14, 16, 17, 18, 20, 24, 25, plus le décor de la 27 si le temps le permet. Vidéos (sept) : 06, 08, 11, 20, 22, 23, 27. Les visuels de supports à plaquer en 3D (étiquettes, cartes, affiches, écran) se font en HTML dans `art/` avec le socle.

Test 3D déjà fait : `blender/_test_logo.py` rend le logotype, le descripteur et le symbole en volume (`out/blender/draft-_test_logo.png`).

## Technique

Dossier de travail : ce dossier. Lancer toutes les commandes depuis sa racine. Pas de commit Git, pas de mise en ligne.

- `brand/marque.css` + `brand/marque.js` : le socle. **Lecture seule** pour tous ceux qui produisent. Une page l'utilise ainsi : `<link rel="stylesheet" href="../brand/marque.css"><script src="../brand/marque.js"></script>`.
- Page qui montre tout : `plates/_test.html`, rendu `out/_test.png`. À regarder avant de commencer.
- Logo : `Marque.wordmark(couleur, attrs)`, `Marque.symbol(couleur, attrs)`, `Marque.lockup(couleur, attrs)` renvoient du SVG. Tracés bruts : `Marque.wordPath()`, `Marque.symbolPath()`, `Marque.letterPath('D'|'R'|'U'|'P'|'E', décalageX)`, position de chaque lettre `Marque.letterX(i)`, cotes dans `Marque.LETTRES` et `Marque.SYM`.
- Couleurs en JavaScript : `Marque.COULEURS.cerise`, etc. En CSS : `var(--cerise)`, `var(--parche)`… et quatre rôles, `var(--encre)`, `var(--vif)`, `var(--clair)`, `var(--sombre)`.
- Motifs : `Marque.pastille(id ou objet, taille, {ton, angle, pose, haut})` ; `Marque.semis({cols, rows, pas, taille, tons, seed, opacite})` dans un parent en `position: relative` ; `Marque.seekSemis(t, boucle)` pour le balancement (déterministe, boucle parfaite, aucune animation CSS).
- Application (390 × 844) : `Marque.screens.accueil()`, `.carte({pris})`, `.abonnement()`, `.fiche(id)`. Appareils : `Marque.phone(écran, échelle)`, `Marque.watch(Marque.watchScreen({temps, part}), échelle)`. Carte de message : `Marque.ncard(titre, texte, {heure, action})`. Étiquette de sachet (320 × 430) : `Marque.etiquette(id, échelle)`.
- Classes d'interface du socle, préfixées `u-` (`.u-card`, `.u-btn`, `.u-chip`, `.u-tabs`, `.u-seg`, `.u-bar`, `.u-add`, `.u-line`, `.u-h`) ; ne pas créer ailleurs de classe du même nom, ni `.g1` à `.g9`, `.grain`, `.semis`, `.pastille`, `.tampon`, `.etiquette`, `.ncard`, `.phone`, `.watch`, `.cap`, `.mono`.
- Pied de planche : `Marque.foot('Rubrique', 'Sous-rubrique', couleur)`.
- Fichiers logo vectorisés : `brand/logo/drupe-{logotype,symbole,complet}-{cerise,grain,fleur,feuille}.svg`. Polices pour la 3D : `brand/fonts/BricolageGrotesque-{Light,Regular,Medium,SemiBold}.ttf`. Tracés pour Blender : `brand/logo/logo.json`, lus par `lib.logo(part='logotype'|'symbole'|'descripteur')`.
- Image fixe : `node tools/shot.mjs plates/x.html out/plates/x.png` (1400 px de large, rendu ×2 ; `--h` pour fixer la hauteur). Vidéo : `node tools/record.mjs motion/x.html out/motion/x.mp4 --w 1920 --h 1080 --fps 30 --dur 6`, la page expose `window.seek(t)`. 3D : `blender -b -P blender/scene.py -- --draft`.
- Regarder chaque rendu avant de le déclarer fini.

### À savoir avant de reprendre les fichiers de l'exemple

- Les fonctions de l'exemple n'existent plus : `Marque.orb`, `Marque.seekOrbs`, `Marque.screens.voix/jour/bord/chat`, `Marque.icons.mic`, classes `.orb`, `.horizon`, `.glass`, `.chip-mic`, `.ck`, `.bars`. Toute page de l'exemple plante tant qu'elle n'est pas réécrite.
- Les feuilles communes citent encore les couleurs de l'exemple : `plates/plates.css` (`--aurore`, `--nuit`), `site/assets/guide.css` (`--aurore`, `--miel`, `--brume`, `--noir`), et des codes en dur dans `motion/motion.css`, `motion/scenes.js`, `site/assets/guide.js`, `art/art.css`. Les remplacer par les rôles (`--vif`, `--sombre`, `--clair`, `--encre`) ou par les couleurs de Drupe.
- L'interface est claire : texte en Grain sur Parche. Les gabarits de l'exemple supposent du texte blanc sur fond sombre (planches de scène, pied de présentation, `presentation.json` : `fond`, `texte`, `police`).
- `tools/export_logo.py` a été modifié dans ce projet : il fusionne les contours qui se chevauchent dans la police (sans cela, Blender remplit mal le T et le e de Bricolage Grotesque). Il s'appuie sur `skia-pathops`, installé dans `tools/_pydeps` pour ce projet seulement. Le relancer après toute retouche du logo.
- `package.json` ne contient plus les polices de l'exemple.

## Qui fait quoi

- `plates/` et `out/plates/` : planches fixes (designer).
- `motion/` et `out/motion/` : vidéos (motion designer).
- `art/`, `blender/` et `out/blender/` : visuels de supports et scènes 3D.
- `deck/`, `site/`, `livrables/` : guide, présentation et site, après les trois chantiers.
