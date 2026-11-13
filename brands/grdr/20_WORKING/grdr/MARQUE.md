# GRDR · Djongoma — brief de marque

Ce fichier est le brief de tous ceux qui produisent une pièce de ce projet. Le socle (`brand/marque.css`, `brand/marque.js`, `brand/carte.js`, `brand/ecrans.css`, `brand/ecrans.js`) fait foi pour les valeurs ; ce fichier dit comment s'en servir. La page de test `plates/_test.html` (rendu `out/_test.png`) montre tout le socle ; `out/ecrans/tableauDeBord.png` et `out/ecrans/ficheProjet.png` montrent le niveau attendu pour l'interface.

## 1. La commande

KLYRA, novembre 2026 : reprendre la direction artistique de cette réalisation à partir des médias existants, en restant dans les grandes lignes de la marque.

Le sujet : l'étude de cas publiée sur https://klyra.fr/realisations/grdr (l'application de gestion budgétaire que KLYRA a faite pour le GRDR). Usage : montrer ce que KLYRA sait faire.

- **Imposé** : l'identité du GRDR (logo, couleurs, police) ne change pas. Les faits de l'étude de cas ne changent pas.
- **Libre** : la direction artistique de l'outil et de sa présentation, le nombre et la nature des pièces.
- **Le point à corriger en priorité** : les écrans de l'outil (tableaux de bord), jugés faibles.

## 2. La marque en bref

Le GRDR (Groupe de recherche et de réalisations pour le développement rural, « Migrations, Citoyenneté, Solidarités ») est une association de solidarité internationale. Signature : « Citoyens d'ici et de là-bas ». Elle agit dans huit pays : France, Mali, Mauritanie, Sénégal, Guinée, Guinée-Bissau, Tunisie, Algérie (rapport d'activité 2025, pages 54 à 75), avec des bureaux à Montreuil (siège), en Île-de-France, Hauts-de-France, Haute-Normandie, à Kayes, Bamako, Nouakchott, Sélibaby, Kaédi, Dakar, Bakel et Matam, Ziguinchor, Canchungo, Conakry, Boké (page 85).

L'outil s'appelle **Djongoma** (une seule ligne à changer dans le socle si le nom évolue : `Marque.PRODUIT`). C'est une application web qui remplace le fichier Excel de gestion budgétaire : projets pluriannuels et multi-bailleurs, prorata temporis, budgets exécutés et restants, affectation des salariés aux lignes budgétaires, extraction des dépenses depuis la comptabilité Sage, rôles (gestionnaire financier, chef de projet, administrateur), journal de chaque action.

**Chiffres et phrases autorisés, et seulement ceux-là :**

- De l'étude de cas publiée : 2025 ; 7 semaines ; « 100+ salariés affectables aux projets » ; « 0 ressaisie » ; 6 phases ; jusqu'à trois personnes par ligne budgétaire ; la citation d'Arezki Harkouk (GRDR), mot pour mot ou pas du tout : « Notre gestion budgétaire reposait sur un fichier Excel que tout le monde craignait de casser. KLYRA en a fait une vraie application : nos équipes saisissent en confiance, les calculs sont automatiques et on garde le lien avec notre comptabilité. »
- Des captures déjà publiées sur cette page : 12 projets signés ; budget total 15 628 761 € ; taux d'exécution moyen 34 % ; 196 employés dont 186 actifs, 10 inactifs, 5 surchargés ; 17 comptes (4 administrateurs, 5 gestionnaires financiers, 4 chefs de projet, 4 N+1) ; les codes et libellés de projets (ECOS, DEAR, OICC, ECSI, ECOD, JPAT, AMIS, PDLD, HWCL) et leurs montants : tout est dans `Marque.DONNEES.projets`.
- Du cahier des charges : 202 jours travaillés par an (base de calcul de la charge).
- **Tout le reste est « démo »** (personnes, bailleurs par type, mois, journal, dates non lisibles) : voir les commentaires de `Marque.DONNEES`. Ne jamais citer un nom d'organisme bailleur ; ne jamais inventer un chiffre présenté comme un résultat (pas de « −70 % de temps »).

## 3. L'idée

**Un budget se lit comme le symbole du GRDR : un lieu, et les années qui s'enroulent autour.**

Le symbole du GRDR est une épingle de carte faite de boucles concentriques, comme une empreinte ou les cernes d'un arbre. Un budget pluriannuel a la même forme : un projet, ancré quelque part, qui grossit année après année. L'outil dessine donc chaque projet avec le trait du symbole : **l'empreinte**, une boucle par année, tracée jusqu'à ce qui est exécuté. Tout le reste (graphiques, pictogrammes, mouvement) reprend ce trait.

- Pistes écartées : (1) « le tableur apprivoisé », une D.A. de grilles et de cellules : juste mais froide, et sans lien avec le GRDR ; (2) « ici et là-bas », la carte comme héros : belle, mais un outil de budget n'est pas d'abord une carte (elle reste un élément du kit).
- Nom : Djongoma. Signature de l'outil : « Le budget de chaque projet, à l'euro près. » Triptyque : « Sûr. Lisible. Partagé. » Phrases à réutiliser : `Marque.PHRASES`.
- Ton : celui d'un collègue précis et chaleureux. On dit « exécuté », « reste à exécuter », « prorata », « ligne budgétaire », « bailleur », « extraction Sage », « à l'euro près ». On évite « dashboard », « KPI », « data », les superlatifs, les points d'exclamation. Phrases courtes. On vouvoie.

## 4. La forme de ce projet

- **À qui on parle** : aux visiteurs de klyra.fr (dirigeants de PME et d'associations qui ont un Excel critique), et au GRDR lui-même. Registre : **produit**, dans une enveloppe **éditoriale chaleureuse** (papier, aquarelle, photos de terrain).
- **Ce qui porte le projet** : le produit (les écrans, à très haut niveau de finition) et la donnée (l'empreinte). Le mouvement vient en appui.
- **L'ampleur** : une quarantaine de pièces : 14 écrans (11 de bureau, 3 de téléphone), une dizaine de planches de système, 6 vidéos, une douzaine de mises en situation.
- **Livrables** : le socle (guide en ligne, présentation en pages et PDF, étude de cas en défilement, fichiers logo), plus **un prototype navigable** de l'outil.
- **Déroulé** : ouverture sur le tableau de bord plein cadre ; l'existant (d'où l'on part) ; l'idée (du symbole à l'empreinte) ; le système ; l'outil écran par écran ; ici et là-bas (territoires, rôles, téléphone) ; le mur des empreintes ; clôture sur la citation.
- **Ce qui distingue cette forme des projets précédents** : première identité existante dont on ne redessine rien, première marque claire et chaude portée par un produit, aucune scène 3D, pas de mosaïque d'ouverture ni de planche-contact de clôture.

## 5. Le kit de la marque

| Élément | Chez GRDR · Djongoma | D'où ça vient | Dans le socle | Règle d'usage |
|---|---|---|---|---|
| L'unité | **L'empreinte** : des boucles concentriques sur une jambe inclinée | La famille gauche du symbole officiel, mesurée (pas 27,4 ; jambe à 22,8° ; trois quarts de tour) | `Marque.empreinte()`, `Marque.cernesDe()` | Une boucle = une année (ou un bailleur). Tracée depuis le pied. L'année en cours en vermillon. Jamais décorative : elle porte toujours une donnée, sauf en très grand, coupée par les bords. |
| La matière | **L'aquarelle** sur papier crème | Les lavis de la couverture du rapport 2025 | `Marque.aquarelle()`, classe `.aq`, `photos/aq-*.jpg`, `.grain` | Un seul panneau d'aquarelle par écran ou par planche. Toujours du corail vers le miel. |
| La marge du métier | **La marge du comptable** : code analytique, montant à l'euro, tampon du journal | Les documents de suivi budgétaire | `Marque.code()`, `Marque.montant()`, `Marque.euro()`, `Marque.tampon()`, `.t-mono` | Les codes en chasse fixe, les montants en Nunito grasse et chiffres tabulaires, jamais arrondis dans un tableau. |
| L'image | **Ici et là-bas** : la carte du double espace, les photos de terrain sous un lavis | La couverture du rapport 2025 ; les photos déjà publiées | `Marque.carte()` (dans `brand/carte.js`), `Marque.photo()`, `.dans-symbole` | Carte en sable sur papier, pays d'intervention en teintes d'aquarelle. Photos : seulement les trois existantes. |
| Le mouvement | **Le trait qui s'enroule** | Le geste du symbole | `Marque.symbolTrace()`, option `p` de tous les tracés | Tout part du pied, monte, s'enroule ; une boucle après l'autre. Rien ne rebondit, rien ne tourne sur soi. |
| La pièce maîtresse | **Le mur des empreintes** | Le portefeuille de projets | `Marque.empreinte()` en série | Tous les projets, chacun son empreinte, aucune pareille. |

Écart avec le registre du skill : Payout (fintech) a une jauge et un écran sombre ; ici la donnée est un tracé enroulé, sur papier clair et chaud, avec de la photo. Custom met une photo tramée dans son symbole ; ici la photo passe sous un lavis, sans trame.

## 6. Le système

- **Logo** : officiel, en tracés (`Marque.lockup()` : trois couleurs officielles ; `Marque.lockup('blanc')` : une teinte ; `Marque.court()` : sans descripteur ; `Marque.symbol()`). Fonds permis : blanc de papier, papier, sable (en couleurs ou en encre) ; nuit, lagune, vermillon, aquarelle (en blanc). On ne le déforme pas, on ne le recolore pas autrement, on ne touche pas au descripteur. Largeur minimale de la version complète : 110 px ; en dessous, `court()`.
- **Couleurs** (`Marque.COULEURS`, origine dans `Marque.ORIGINES`) : vermillon `#E85330` (vive, rare : alertes, année en cours, un mot) ; ocre `#B25F25` ; lagune `#296C6E` (texte coloré, tracés) ; émeraude `#009F71` (exécuté, à jour : en aplat seulement) ; nuit `#12312F` (un panneau dense) ; papier `#F6EADE`, sable `#EBD1B8`, blanc de papier `#FFFBF6`, encre `#2A1E17` ; aquarelle : corail, rose, pêche, miel ; menthe et brume en fonds de pastille. Contrastes mesurés : encre sur papier 13,7 ; lagune sur blanc 5,9 ; blanc sur nuit 13,5 ; miel sur nuit 10,3 ; vermillon et émeraude sur blanc 3,6 et 3,3 (**jamais en petit texte**).
- **Typographie** : Nunito (titres : 800 ou 900, serrée, bas de casse ; `.t-titre`, `.t-geant`, `.t-chapo`, `.t-cap`), Nunito Sans (texte et interface ; `.t-txt`, `.t-petit`), Geist Mono (codes, étiquettes ; `.t-mono`). Chiffres tabulaires (`.chiffres`).
- **Images** : `photos/marche.jpg`, `atelier.jpg`, `artisan.jpg` (les trois photos de terrain déjà publiées par KLYRA) ; `photos/aq-aube|lagune|terre|nuit|brume.jpg` (lavis rendus par `art/aquarelle.html`). Aucune personne générée : on ne fabrique pas de faux bénéficiaires.
- **Mouvement** : le trait part du pied et s'enroule. Durées 0,6 à 1,4 s par tracé, décalage de 0,08 à 0,15 s entre éléments, sortie quartique (`Marque.ease`), 1,5 s immobile à la fin. Les chiffres montent avec leur tracé. Jamais de rebond, de rotation, de fondu enchaîné entre deux couleurs éloignées.

## 7. L'API du socle

`brand/marque.js` (objet `Marque`) :

- Identité : `NOM`, `PRODUIT`, `PRODUIT_DESC`, `SIGNATURE` (celle du GRDR), `SIGNATURE_OUTIL`, `TRIPTYQUE`, `PHRASES`, `COULEURS`, `NOMS`, `ORIGINES`, `KIT`, `CONSTRUCTION`.
- Logo : `lockup(c?, attrs)`, `court(c?, attrs)`, `wordmark(c, attrs)`, `symbol(c, attrs)`, `symbolTrace({ p, c, piste, id, attrs })` (p : nombre ou tableau de 5 avancements ; `id` unique par page), `symbolParts()`, `icone(taille, fond, signe)`.
- Kit : `empreinte({ cernes, c, piste, actif, cActif, ep, pas, taille, cadre, attrs })`, `empreinteGeo(n, pas)`, `cernesDe(projet)`, `ondes({…})`, `filigrane({ c, op, style })`, `aquarelle(nom, { cls, style, pos, html })`, `aqURL(nom)`.
- Marge du métier : `euro(n)`, `euroK(n)`, `nombre(n)`, `pct(x, décimales)`, `montant(n)`, `code(txt, c)`, `tampon(txt, c)`.
- Graphiques : `jauge({ v, w, ep, c, piste, repere })`, `courbe({ w, h, series, labels, max, marge, p, point, id })`, `annees({ w, h, annees, ep, p })`, `lisse(points)`.
- Photo et masques : `photo(nom, { mode: brut|sombre|nb|duo|lavis, c, c2, aq, pos, cls, style })`, classes `.dans-symbole`, `.dans-traits`.
- Planches et appareils : `entete()`, `foot(a, b, c)`, `fleche()`, `phone(html, k)`, `browser(html, k, { url, h, nuit })`, `laptop(html, k)`.
- Données : `DONNEES` (exercice, extraction, synthese, projets, autres, bailleurs, mois, cumulPrevu, cumulExecute, personnes, journal, pays).

`brand/carte.js` : `carte({ w, cadre, par, terres, mer, pays, cPays, filet, villes, noms, epingles, ke, attrs })`, `CARTE`.

`brand/ecrans.js` (objet `Marque.app`) : briques `ico(nom)`, `av(nom)`, `avs(noms)`, `chip(txt, cls)`, `statut(s)`, `btn(txt, cls, icone)`, `num(n)`, `lbl(t)`, `carte(titre, sous, corps, { span, cls, droite })`, `tete(titre, sous, droite, fil)`, `shell(actif, contenu, { h, moi, roles })`, `emp(projet)`, `periode(projet)`, `ecoule(projet)` ; écrans `tableauDeBord(o)`, `ficheProjet(o)` et leurs blocs (`blocHero`, `blocTaux`, `blocCourbe`, `blocAlertes`, `blocProjets`, `blocTerritoires`) ; téléphone `mobile(contenu, { actif, heure })`. `brand/ecrans-b.js` ajoute `projets`, `projetsGrille`, `rh`, `affectation`, `sage`, `nouveauProjet` ; `brand/ecrans-c.js` ajoute `stats`, `journal`, `admin`, `connexion`, `mAccueil`, `mProjet`, `mAlerte`. Option commune `p` (0 à 1) : fait monter chiffres et tracés. Voir un écran seul : `plates/_ecran.html?e=<fonction>[&h=900][&p=0.5]`.

Classes d'interface (`brand/ecrans.css`, toutes préfixées `dj-`) : `.dj` (racine 1440), `.dj-g` (grille 12 colonnes), `.dj-c` (carte ; variantes `.nuit`, `.aq`, `.pap`), `.dj-ct` (titre de carte), `.dj-t` (tableau), `.dj-chip` (`.ok`, `.att`, `.al`, `.lag`), `.dj-btn` (`.p`, `.v`, `.e`, `.s`, `.clair`), `.dj-num`, `.dj-lbl`, `.dj-av`, `.dj-seg`, `.dj-champ`, `.dj-al`, `.dj-jr`, `.dj-eq`, `.dj-bar` ; téléphone : `.djm`.

## 8. Règles de fabrication

- Une planche = un fichier `plates/NN-nom.html`, un conteneur `.plate` (1400 px de large par défaut). Rendu : `node tools/shot.mjs plates/NN-nom.html out/plates/NN-nom.png` (×2). Puis `node tools/check_planche.mjs plates/NN-nom.html --zones out/_zones`, et regarder le rendu, entier puis en recadrage (`--crop x,y,l,h`).
- Une page qui charge des images expose `window.pret` (voir `plates/_test.html`).
- Les classes du socle sont globales : **préfixer toute classe qu'on écrit** (le préfixe est donné dans chaque brief). Ne jamais modifier `brand/marque.*`, `brand/carte.js`, `brand/ecrans.*` hors du lot qui en a la charge : demander.
- Pas d'animation CSS, pas d'horloge. Une vidéo expose `window.seek(t)`.
- Écrire les fichiers avec l'outil d'écriture, jamais par heredoc de shell (apostrophes).
- Français, apostrophes typographiques (’), espaces insécables (le socle les pose devant ; : ! ? au chargement), montants avec `Marque.euro()`. Pas de tiret cadratin dans les textes.
- Marque réelle : seuls les chiffres de la section 2 ; aucune coordonnée, aucun nom de personne réelle (les personnes de démo ont un prénom et une initiale) ; aucun nom de bailleur.
- Crédit, là où il y a des crédits : « Proposition KLYRA, non validée par le GRDR. Logo, couleurs et police du GRDR. Données de démonstration. »

## 9. Les pièces

V = vidéo, S = mise en situation (photo existante ou décor rendu, écran plaqué par le code).

| N° | Pièce | Ce qu'elle doit montrer | Construction | Lot |
|---|---|---|---|---|
| 01 | Ouverture | Le tableau de bord, seul | plein cadre, sans un mot | héros |
| 02 | L'existant | Le logo officiel, la couverture du rapport, les anciens écrans | planche d'archives, petits formats | système |
| 03 | L'idée | Du symbole à l'empreinte : la construction mesurée | schéma coté, très grand | système |
| 04 | Lire une empreinte | Trois projets, trois empreintes, la légende | frise | système |
| 05 | Le mur des empreintes | Douze projets | grille, plein cadre | héros |
| 06 | Couleurs | La palette en usage, origines | bandes inégales | système |
| 07 | Typographie | Nunito, Nunito Sans, Geist Mono | mot géant coupé | système |
| 08 | L'aquarelle | Les cinq lavis, le filigrane | très gros plan de matière | système |
| 09 | La marge du comptable | Codes, montants, tampons | à-plat, étiquettes | système |
| 10 | Les graphiques | Jauge, courbe à échos, années | écran et détail | système |
| 11 | Composants | Boutons, pastilles, champs, tableaux | feuille à plat | système |
| 12 à 22 | Écrans de bureau | tableau de bord, fiche projet, projets, ressources humaines, affectation, extraction Sage, statistiques, journal, administration, connexion, nouveau projet | écran incliné, écran et détail, page entière | écrans |
| 23 à 25 | Écrans de téléphone | accueil du chef de projet, projet, alerte | rangée de trois | écrans |
| 26 | Ici et là-bas | La carte, les bureaux, les budgets | carte plein cadre | héros |
| 27 | Chacun son périmètre | Trois rôles, trois vues | triptyque | héros |
| 28 | Avant, après | Le tableur, puis l'outil | diptyque | héros |
| 29 à 34 | V | le symbole se trace ; une empreinte pousse ; le tableau de bord se construit ; du tableur à l'outil ; le mur s'anime ; à l'euro près | 6 à 10 s | vidéos |
| 35 à 45 | S | portable sur velours, portable sur bloc de terre, téléphone (photos existantes rhabillées par `tools/rehabiller.py`), suivi imprimé, affiche, terrain, carte de visite, trois pistes, citation | photo et écran | situations |

## 10. Pièges connus

- `Marque.symbolTrace` utilise des masques SVG : donner un `id` différent à chaque appel d'une même page.
- `.dj-t` est en `table-layout:fixed` : donner un `<colgroup>` à chaque tableau.
- Dans une carte de 8 colonnes sur 12, la largeur utile est de 694 px ; 4 colonnes : 303 px ; 5 colonnes : 408 px ; 3 colonnes : 218 px.
- Les sélecteurs du type `.x span` attrapent les pastilles et les avatars imbriqués : écrire `.x>div>span`.
- `Marque.carte` : pour une petite carte, passer `ke` (unités de carte par pixel d'écran), sinon les épingles sont minuscules.
- L'émeraude et le vermillon ne passent pas en petit texte sur fond clair : texte en lagune ou en encre, pastille en fond.
- `Marque.cernesDe(projet)` répartit l'exécuté sur les mois écoulés (au 16 juin 2025) et ne trace jamais une année à venir ; un projet peut porter ses propres boucles (`cernes`, comme ECOS). Toute pièce qui lit ces valeurs est à rendre de nouveau si elles changent : `bash tools/tout_rendre.sh`.
- Écran à hauteur fixe : `shell(…, { h })` pose la classe `.fixe` (la barre latérale garde son pied visible). Ne pas passer `h` aux blocs.
- `Marque.empreinte({ attrs })` écrit déjà `class="emp"` : une classe passée dans `attrs` est ignorée, tout mettre dans `style`.
- Le verre dépoli (`.dj-verre`) se rend mal dans un plan incliné : `plates/sc.css` le remplace par un blanc presque opaque dans `.sc-plan`.
- Les vidéos sont enregistrées contre le socle du 13/11 à 14 h 20 : après un changement visible du socle, les relancer (`tools/record.mjs`, environ 3 min chacune).
- Le prorata se compte en mois écoulés : au 16 juin, 5,5 mois sur 12 (`Marque.app.ecoule`).
