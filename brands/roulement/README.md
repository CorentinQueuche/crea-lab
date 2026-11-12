# Roulement — vitrine d'une app de planning du personnel

Essai du skill `vitrine-app` (11/11/2026). App fictive, données fictives, aucune marque réelle.

## Sujet

Roulement est le planning du personnel d'un groupe de trois brasseries (Le Zinc des Carmes, Brasserie
Armance, Le Comptoir du Quai). La responsable d'exploitation y prépare la semaine suivante : elle voit
la semaine par poste (salle, bar, cuisine), les créneaux sans personne, qui peut venir, et ce que la
semaine coûte en masse salariale rapportée au chiffre d'affaires prévu. L'outil remplace le tableur
affiché en cuisine et les appels pour trouver un remplaçant.

Fil suivi par les visuels et le film : semaine 47 (16 au 22 novembre 2026), un trou le samedi soir au
bar après un arrêt maladie, comblé par une barmaid d'une autre brasserie du groupe ; la part de masse
salariale passe de 31,8 % à 32,0 %, sous l'objectif de 32,5 %, puis le planning est publié.

## Cadrage visuel

```
Marque      : proposée (page blanche)
Police      : Geist + Geist Mono (heures, montants)
Accent      : #1E5C49 vert bouteille — texte clair dessus : 7,3:1
Densité     : dense — corps 13 px, rangée 56 px
Mode        : clair d'abord, un seul mode
Divergence  : les comptes se lisent sur une ardoise sombre posée dans une page couleur nappe
```

Teintes de poste réservées aux données : salle (banquette, #9B3D4E), bar (laiton, #96690F), cuisine
(inox, #2F6385). Vermillon hachuré (#DE4526) pour les créneaux à pourvoir.

## Fichiers

- `index.html`, `styles.css`, `app.js` : l'interface à plat, 2000 × 1300. La grille, la courbe
  d'affluence et l'histogramme sont construits par `app.js` à partir des données.
- `identite.html` : planche d'identité, 1600 × 1200.
- `vitrine.json` : cadrages des 7 visuels, planche directe, film, ambiance.
- `film.css`, `film.js` : déroulé du film (23 s). `film.html` est recréé à chaque capture.
- `son/sons.json` : prompts de la musique et de 14 bruitages. **Rien n'a été généré.**
- `presentation/` : livrables.
- `rendu/plat.png` : capture à plat (12 000 × 7 800), gardée.

## Livrables (`presentation/`)

| Fichier | Format |
|---|---|
| `01-le-trou-du-samedi.png` à `07-vue-d-ensemble.png` | PNG 3200 × 2400 |
| `08-identite.png` | PNG 3200 × 2400 |
| `planche.jpg` | 4920 × 1872 |
| `film-muet.mp4` | 1920 × 1080, 60 images/s, 23 s (1 380 images), H.264, 25,7 Mo, sans son |

## Refaire un rendu

Depuis `~/.claude/skills/vitrine-app/scripts` :

```bash
python mockups.py <projet> --apercu     # aperçus 800 px + rendu/apercus/planche.jpg
python mockups.py <projet> --plat       # recapture l'interface, puis rendu final des 8 visuels
python mockups.py <projet> 4 7          # seulement les visuels 4 et 7
python film.py <projet> --apercu        # planche du film, une image par demi-seconde
python film.py <projet>                 # film complet (environ 8 Go d'images dans rendu/)
python film.py <projet> --nettoyer      # supprime les images intermédiaires
```

Après `--plat`, vérifier que `rendu/plat.png` est peint jusqu'en bas : pendant l'essai, une capture sur six
(la première à l'échelle 6) est sortie tronquée, moitié basse vide, sans message d'erreur. Relancer a suffi ;
la cause n'a pas été trouvée.

## Son

Aucun crédit Sunra dépensé. `python sons_sunra.py <projet> --estimer` du 11/11/2026 : 15 sons,
94 crédits (musique ElevenLabs 80, 14 bruitages à 1), solde lu 720. Il reste à générer, mesurer
(`analyse_sons.py`), écrire `son/mix.json` à partir de `rendu/reperes.json`, puis `mixage.py --monter`.

## Limites

- Le film n'a été contrôlé que sur des images fixes (planches d'aperçu et images extraites de la
  vidéo encodée) : la fluidité et le rythme restent à juger en lecture.
- Pas de bande-son.
- Contraste : le texte tertiaire (#776B5E) est à 4,1:1 sur le fond papier, sous le seuil de 4,5:1 ;
  la mention « Repos » des cases vides est volontairement très pâle (2,2:1).
- Une seule police disponible sans téléchargement (Geist) : la voix typographique est la même que
  celle de l'exemple du skill.

## Bande-son (ajoutée le 11/11/2026)

`presentation/film.mp4` : le film avec son ; `film-muet.mp4` : la même image, sans son.

- Sons générés avec Sunra, accord de Corentin pour 94 puis 10 crédits : **104 crédits** dépensés
  (solde lu 720 avant, 616 après). 14 bruitages ElevenLabs Sound Effects (1 crédit chacun), une
  première musique ElevenLabs Music (80 crédits) et une seconde musique Suno v5.5 (10 crédits).
- La première musique est sortie avec 6 s audibles sur 23 : écartée, gardée dans `son/ecartes/`.
- La musique retenue est un morceau Suno de 3 min 14 dont on garde 23 s à partir de 157,2 s : sa
  pause tombe sur le plan calme (6,8 à 9 s du film), sa basse sur le dépôt d'Inès (11,6 s) et son
  accord final sur le logo (21 s).
- Les deux signatures sonores du logo ne sont pas posées : la musique joue déjà à ces instants.
- Mixage : `son/mix.json`, niveau intégré −15,1 LUFS, crête −1,5 dB.
- Non écoutée : le calage est fait par mesure (attaques, niveaux), l'accord entre la musique et les
  bruitages reste à juger à l'oreille.

## Marque, ouverture et fin (11/11/2026, soir)

Retours de Corentin : sons « trop bruts », le son de la courbe « pas vraiment bon pour le mouvement »,
puis « la même intro, le même finish, un logo pas très complexe » que Maillon, et sa décision : pas de
logo au début, la marque seulement à la fin.

- **Logotype** : `marque.js`. Idée : le roulement, c'est l'équipe qui tourne. Lettres épaisses à bouts
  francs (graisse 17, hauteur d'x 60) ; le « o » est un anneau en trois segments aux couleurs des
  postes (salle, bar, cuisine), qui sert de symbole et qui tourne. Volontairement à l'opposé du
  logotype de Maillon (trait fin et rond, maillons emboîtés).
- **Ouverture** : plus de carton de titre. Fondu depuis le papier, directement dans le planning ; la
  courbe d'affluence se dessine dès 0,35 s et sur 5,25 s, la grille se remplit sous elle, les manques
  d'effectif s'allument à son passage.
- **Fin** : claire, sur papier (celle de Maillon est noire). Le papier remonte, la caméra revient de
  face sans coupe, l'anneau arrive en tournant segment par segment, puis les lettres sortent de part et
  d'autre, puis l'accroche.
- **Bande-son** (`son/mix.json`) : un seul son continu pour la courbe, de la durée de son tracé, qui
  monte et va de gauche à droite ; sons choisis par mesure parmi les variantes du dossier voisin
  `2026-11-11-sons-ecoute` et accordés sur fa, la, do ; pas de signature de logo, l'accord final de la
  musique tombe à 21,0 s, quand l'anneau arrive.
- Versions précédentes gardées dans `presentation/` : `film-son-v1.mp4`, `film-son-v2.mp4`,
  `film-v3-ancienne-ouverture.mp4`.
- Contrôle : 1 380 images, `verif_film.py` ne trouve aucun saut hors des trois coupes ; −15,9 LUFS.
  Ni le film en lecture ni la bande-son n'ont été vus ou écoutés par l'assistant.
