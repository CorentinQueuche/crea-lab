# Maillon — mockups de workflow (11/11/2026)

Demande de Corentin du 11/11/2026 : refaire une série de mockups dans l’esprit de la référence DR-34 Approvio (canvas de blocs reliés, gros plans en 3D, profondeur de champ), pour un autre projet, avec une interface en français et un autre contenu.

## Sujet

**Maillon**, outil fictif d’automatisation des dossiers pour une PME : ici la Menuiserie Halgand, agencement de commerces. Le flux montré suit le dossier `AGC-2026-118` (comptoir réfrigéré de la Fromagerie Brévent, Annecy), de la demande reçue par e-mail à la facture d’acompte : devis, plan d’agencement, validation de la gérante, commandes fournisseurs, pose sur site.

Toutes les données sont fictives. Accent ambre (le bois, la lumière d’atelier) à la place du vert de la référence ; police Geist embarquée (OFL).

## Fichiers

- `index.html`, `styles.css`, `app.js` : l’interface réelle, à plat, 2000 × 1300 px CSS. Elle s’ouvre telle quelle dans un navigateur.
- `identite.html` : planche d’identité.
- `presentation/01` à `08` : les huit visuels, PNG 3200 × 2400.
- `presentation/planche.jpg` : les huit visuels sur une planche.
- `rendu/rendre.py` : rendu des visuels 01 à 07. Chrome capture l’interface en 6x (12000 × 7800), puis le script place une caméra par visuel : perspective, profondeur de champ, halo des liens, vignette, grain.

## Refaire un rendu

```bash
python rendu/rendre.py --plat        # recapture l'interface puis rend tout
python rendu/rendre.py --apercu 2 5  # aperçus 800 × 600 des visuels 2 et 5
```

Les cadrages se règlent dans `VISUELS` (cible, zoom, inclinaisons, force du flou). L’accent se change dans `styles.css` (`--accent`) et dans les couleurs des liens de `app.js`.

## Film de présentation

`presentation/maillon-film.mp4` : 22,8 s, 1920 × 1080, 60 images/s, avec bande-son (`maillon-film-muet.mp4` : la même image, sans son). Demande de Corentin du 11/11/2026 (« vidéo motion product », carte blanche).

Déroulé : carton titre, plongée dans le canvas, lien tiré à la souris de la demande au devis, plan d’agencement qui se dessine, validation du devis avec raccourci clavier et saisie « Accorder 2 % de remise », onde sur la grille, commandes fournisseurs, vue d’ensemble, carton de fin.

- `film/film.js` : tout l’état de l’interface et la caméra sont des fonctions du temps (`window.film(t)`).
- `film/capturer.mjs` : Chrome capture chaque image de la zone visible (protocole DevTools, sans dépendance).
- `film/post.py` : caméra 3D, profondeur de champ, halo, vignette et grain, sur 12 processus.
- `film/mixage.py` : pose la musique et chaque bruitage à l’instant de son événement, puis écrit `film/maillon-son.wav`.

```bash
node film/capturer.mjs --sortie src
python film/post.py --src src --sortie images
ffmpeg -framerate 60 -i film/images/f%05d.png -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart presentation/maillon-film.mp4
```

Un rendu complet prend une dizaine de minutes et environ 8 Go d’images intermédiaires, à supprimer ensuite. `--pas 30` et `post.py --apercu` donnent une planche d’aperçu en moins d’une minute.

### Bande-son (Sunra)

Demande de Corentin du 11/11/2026 : « utilise Sunra ». Sons générés, modèles ElevenLabs Music (1 musique de 23 s, 80 crédits) et ElevenLabs Sound Effects (14 bruitages, 1 crédit chacun) : **94 crédits**, solde lu 814 avant et 720 après. Projet Sunra : « Projet du soir 2026-11-11 Maillon ». Prompts dans `film/sons-sunra.json`, fichiers reçus dans `film/sons/`.

La musique générée démarre à 1 s et s’éteint vers 19 s : elle est décalée de 1,53 s pour entrer pendant la plongée, tomber sur la coupe de 9,0 s, la validation de 12,55 s et le recul de 16,6 s, puis finir sur le carton de fin. Niveau du mixage : −15,4 LUFS, crête −1,5 dB.

```bash
python film/mixage.py
ffmpeg -i presentation/maillon-film-muet.mp4 -i film/maillon-son.wav -c:v copy -c:a aac -b:a 256k -movflags +faststart -shortest presentation/maillon-film.mp4
```

### Correction du carton de fin (11/11/2026, 16 h 40)

Dans la première version, le logo apparaissait pendant le fondu final, encore vu par la caméra
inclinée de la vue d'ensemble, puis sautait à sa place de face. Il n'apparaît plus qu'après la bascule
de caméra. Film entièrement rerendu, bande-son inchangée. Contrôle par mesure : écart maximal entre
images voisines de 2,9 entre 20,0 et 21,5 s, pour 15,9 à 35 sur les deux coupes voulues.

## Marque, ouverture et fin (11/11/2026, soir)

Retours de Corentin : bandes-son « trop brutes », puis « la même intro, le même finish, un logo pas très
complexe, sans une bonne D.A. », et sa décision : pas de logo au début, la marque seulement à la fin.

- **Logotype** : `marque.js`. Idée : un maillon relie deux pièces d'une chaîne comme l'outil relie deux
  étapes d'un dossier. Le mot « maillon » est tracé d'un seul trait rond (graisse 11, hauteur d'x 60) ;
  les deux « l » sont deux maillons emboîtés, le second en ambre. Symbole : les deux maillons seuls.
  La barre de l'app, la planche d'identité et le film appellent ce fichier.
- **Ouverture** : plus de carton de titre. Fondu depuis le noir sur la notification « Nouvelle
  demande », en gros plan, qui se range sur le canvas et devient la première pile.
- **Fin** : le fond monte, la caméra revient de face sans coupe, les deux maillons se tracent en
  lumière, puis les lettres en s'éloignant d'eux, puis l'accroche.
- **Bande-son** (`son/mix.json`, mixée avec le skill vitrine-app) : musique A (Suno, fa majeur) prise à
  9,52 s, dont l'entrée de basse tombe sur la validation du devis ; sons choisis par mesure parmi trois
  variantes et accordés sur fa, la, do ; gestes synthétisés à la durée des mouvements. Sons et page
  d'écoute : dossier voisin `2026-11-11-sons-ecoute` (59 crédits Sunra).
- Versions précédentes gardées dans `presentation/` : `maillon-film-son-v1.mp4`, `-son-v2.mp4`, et
  `maillon-film-v3-ancienne-ouverture.mp4`.
- Contrôle : 1 368 images, aucun saut hors des coupes de 6,2 s et 9,0 s ; −15,7 LUFS. Ni le film en
  lecture ni la bande-son n'ont été vus ou écoutés par l'assistant.

## Limites

- Série produite hors du workflow du Projet du soir : pas de proposition à 18 h, pas d’auto-revue complète du guide, pas de dépôt dans `projet-du-soir`.
- Les blocs restent dans le plan de l’écran : pas d’épaisseur ni de vrai décollement en 3D.
- Le film n’a été contrôlé que sur des images extraites, pas en lecture continue.
- La bande-son n’a pas été écoutée : elle est calée et contrôlée par mesure (niveaux, attaques, durées), pas à l’oreille.
