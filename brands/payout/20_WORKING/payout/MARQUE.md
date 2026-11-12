# Payout — guide de marque de travail

**Registre : fintech, startup moderne.** Le niveau et le ton visés sont ceux des néobanques et des outils financiers d'aujourd'hui pour entreprises et indépendants : produit d'abord, net, sûr de lui, précis. Le produit est le héros (de vrais écrans, denses, des montants au centime, des états), les chiffres sont la voix de la marque, le noir et un seul vert électrique font le reste. Rien d'artisanal, de papier, de vintage ni d'organique : pas de texture de papier, pas de tampon, pas d'illustration dessinée. Ces marques servent de repère de niveau ; on n'en reprend ni logo, ni couleur, ni texte.

Payout est une vraie startup française (FinTech) : elle aide les freelances en SASU à garder jusqu'à 85 % de leur TJM après impôts, au lieu de 54 %. KLYRA a créé en 2025, en six semaines, son identité, son site vitrine (avec simulateur) et le front de sa web app (un cockpit financier). Ce dossier est une **proposition d'évolution faite par KLYRA** pour son portfolio : ce n'est pas l'identité officielle de Payout, et rien n'est mis en ligne sans décision de Corentin.

État au 11 novembre 2026 : la marque est conçue, le socle est écrit et vérifié (`plates/_test.html`, rendu `out/_test.png` ; test 3D `out/blender/draft-00-test-logo.png`). Les planches, les vidéos, les scènes 3D, le guide et le site restent à produire. Les fichiers encore présents dans `plates/`, `motion/`, `art/`, `blender/` (sauf `lib.py`, `objets.py`, `payout.py`, `s00_test_logo.py`), `deck/` et `site/` sont ceux de l'exemple sombre du skill : ils servent de mécanique et sont à réécrire entièrement.

## Ce qu'on prend aux références

Références regardées en images : Sui (studio Holographik, référence principale), Suno (Nea Studio), Rentio (chapitre sombre seulement). Elles sont dans `40_KNOWLEDGE/references/branding-behance/`. On emprunte des procédés et un niveau de modernité, jamais une marque, un texte ni une image. À citer dans les crédits.

| N° | Procédé | Vient de | Où il sert chez Payout |
|---|---|---|---|
| 1 | Bandeau d'en-tête en chasse fixe, quatre colonnes (studio, client, sujet, année), répété sur chaque planche | Sui 05, 07 | `Marque.entete()` en haut de toutes les planches ; en bas sur la couverture |
| 2 | Un noir et une seule couleur électrique, avec son échelle de 50 à 900 et sa fiche couleur | Sui (bleu), planche « Core » | Coffre et Net ; planche 12, page couleur du guide |
| 3 | Dégradés en recette de trois calques : base, grain, teinte, avec opacité et mode de fusion écrits | Sui 05 (« Gradient 03, 04 ») | `Marque.recette()`, classes `.grain` et `.teinte` ; planche 13 |
| 4 | Les données deviennent le motif : bandes verticales en histogramme, blocs en damier, halo en arc | Sui 01, 02, 16 | `Marque.bandes()`, `Marque.damier()`, `Marque.halo()` ; couverture, fonds, affiches, écran du site |
| 5 | Mosaïque d'ouverture, puis planche-contact numérotée : la quantité devient une preuve | Sui 03, 07 | Planches 03 et 35 ; vidéo de la mosaïque en dérive |
| 6 | « Archive » du système en grille, échelle typographique en tableau, grille d'icônes où un carré s'allume | Sui 05, 06, 18 | Planches 14, 15, 17 ; vidéo V3 |
| 7 | Objet de marque devenu monument dans un paysage nocturne ; écrans lumineux sur socle, appareils inclinés | Sui 09, 12, 14 | Scènes 3D A, C, D |
| 8 | Bandeau de section à onglets en pilules, dont les coins hauts mordent sur la planche précédente | Suno 02, 10, 20, 25 | `Marque.section()` : trois sections, La marque, Le site, La web app |
| 9 | Phrase bicolore : les mots forts en contraste plein, le reste éteint | Suno 02, Rentio 12 | `Marque.bicolore()` sous chaque bandeau de section et dans les tuiles |
| 10 | Bento d'identité en tuiles à grand rayon ; écran et détail agrandi ; plateforme en thème sombre et clair | Suno 04, 12, 21 | `Marque.tuile()` ; planches 06 et 27 ; cockpit sombre (phare) et clair |
| 11 | Chapitre sombre pour la fonction phare, écrans reliés avec pastilles d'étape | Rentio 18, 12 | Planches 26 et 28 (du CRA à la facture) |

Ce qui reste à nous : le nom, le P-jauge, le vert, la proportion 54 → 85 comme sujet unique, les textes, les écrans du vrai produit, les objets des scènes.

## L'idée

**La part qui vous revient.** Tout part d'une proportion : sur 100 € facturés, un freelance en SASU en garde 54 aujourd'hui, et jusqu'à 85 avec Payout. La marque ne montre que cela : une jauge qui passe de 54 à 85. Le symbole est cette jauge, le motif est cette jauge, les titres sont ces chiffres.

Pistes écartées : « le cockpit » (dit l'outil, pas le bénéfice ; tous les tableaux de bord se ressemblent) et « le versement » (le « pay out » pris au mot : juste, mais c'est un instant, pas une promesse).

- Nom : **Payout** (inchangé). Site réel : `payout.fr`.
- Signature : **Gardez jusqu'à 85 % de votre TJM.** Variante longue pour une clôture : « Gardez la part qui vous revient. »
- Triptyque (affiches, pilules, publications) : **Facturer. Déclarer. Garder.** Il prolonge l'actuel « Optimiser, encaisser, déclarer ».
- Descripteur : **Le copilote des freelances** (deux lignes à droite du logotype). La page KLYRA dit « copilot business des freelances ».
- Chiffre de scène : **85 %**, avec « 54 % » en regard. Toujours accompagné de « jusqu'à » dans la phrase.
- Phrases prêtes : « Votre CRA devient une facture. » · « Zéro ressaisie. » · « Sur 100 € facturés, jusqu'à 85 € pour vous. » · « 54 % aujourd'hui. Jusqu'à 85 % avec Payout. » · « L'impôt prend sa part. Pas la vôtre. » · « Un cockpit à la place de trois outils. »
- Mots-clés : Net, Précis, Direct, Automatique.
- Valeurs :
  - 01 Net : on parle en chiffres, au centime. Un pourcentage vaut mieux qu'un adjectif.
  - 02 Précis : sur des données financières, l'erreur n'est pas permise. Chaque montant a sa source.
  - 03 Direct : des phrases courtes, un bouton par écran, aucune notion fiscale sans son chiffre.
  - 04 Automatique : le CRA devient la facture, la TVA se calcule seule. Zéro ressaisie.
- Ton : français, vouvoiement, direct, court, chiffré. Un peu frondeur avec l'impôt, jamais racoleur, jamais « astuce fiscale ».
  - On dit « Gardez jusqu'à 85 % de votre TJM. » ; on évite « Stop à l'hémorragie financière ! ».
  - On dit « Votre CRA devient une facture. » ; on évite « Une solution innovante pour optimiser votre activité ».
  - On dit « TVA d'octobre : 2 213,60 € à reverser avant le 24. » ; on évite « Pensez à vos obligations déclaratives ».
- Texte de présentation : « Payout aide les freelances en SASU à garder jusqu'à 85 % de leur TJM après impôts, au lieu de 54 %. KLYRA a créé son identité, son site et le front de sa web app en 2025, en six semaines. Cette proposition pousse la marque plus loin : un noir, un vert électrique, et une seule image, la part qui vous revient. »
- Crédits : Client : Payout, FinTech, France. Identité, site vitrine et front de la web app : KLYRA, 2025. Proposition d'évolution de l'identité, direction artistique et motion design : KLYRA, 2026. Références de présentation : Sui (Holographik), Suno (Nea Studio), Rentio (Behance). Polices : Instrument Sans et Chivo Mono (licence OFL). Écrans : personnes et montants fictifs.

### Chiffres autorisés

Seulement ceux publiés sur la page KLYRA : **85 %** (toujours « jusqu'à »), **54 %**, **zéro ressaisie**, **2025**, **six semaines**. Aucun nombre de clients, aucun résultat, aucun témoignage. Ne pas reprendre les compteurs ni les pourcentages visibles sur les captures de l'ancien site (ils ne sont pas dans la liste). Les montants des écrans sont des exemples fictifs, cohérents entre eux, qui appliquent 54 % et 85 % à un TJM d'exemple. La répartition de « ce qui part » (cotisations, impôts) n'est jamais détaillée : elle n'est pas publiée.

## Avant / après

Sert à la planche de comparaison (planche 04). Le logo actuel est dans `10_INPUTS/klyra-realisation-payout/logo-payout.svg`, sa palette dans `img4.svg`.

| | Avant (2025) | Après (proposition 2026) | Pourquoi |
|---|---|---|---|
| On garde | Le nom, le vert, le P, la promesse 54 → 85 | Les mêmes | Évolution, pas rupture : la marque reste reconnaissable |
| Idée | Aucune image centrale | La part qui vous revient : une proportion | Sans idée, rien ne distingue Payout d'un autre SaaS vert |
| Symbole | P en verre brillant, queue qui s'échappe, dégradé | P-jauge à plat : un anneau gardé à 85 %, ouvert de 15 %, et son fût | Le symbole dit la promesse et tient à 16 px en un seul aplat |
| Logotype | « Payout » dans une grotesque du commerce, précédé du pictogramme (deux P) | « Payout » dessiné avec le même anneau ; son P est le symbole | Un logotype à soi, une règle de construction en une ligne |
| Couleur | Gamme de verts Tailwind sur blanc, sarcelle, rouge | Noir Coffre, un seul vert électrique (Net) et son échelle, gris froid | Une palette propre ; le vert devient lumière |
| Chiffres | Dans la police de texte | Chivo Mono, tabulaires, en très grand | Les chiffres sont la voix de la marque |
| Motif | Illustrations isométriques, deux photos | La jauge (segments, blocs, escalier), les bandes, le halo | Un motif reconnaissable sans le logo, fait avec les données |
| Interface | Blanche, cartes arrondies, vert en accent | Cockpit sombre (phare) et variante claire, mêmes intitulés | Le produit devient le héros ; même structure, autre tenue |

## Données fictives et données communes

À utiliser telles quelles, partout. Elles sont dans `Marque.DONNEES` ; ne pas inventer d'autres montants sans les y ajouter.

- Nous sommes le **jeudi 12 novembre 2026**, 9:41.
- Freelance : **Lucie Morel**, consultante data, **LM Conseil** (SASU), `lucie.morel@example.com`. Mission principale : **Hexa Mobilités**, TJM **600 € HT**. Second client : **Atelier Norma**. Personnes et sociétés inventées.
- Simulateur : 600 € de TJM, 20 jours, 12 mois. Facturé 12 000 € par mois ; 54 % = 6 480 € ; jusqu'à 85 % = **10 200 €** ; écart 3 720 €.
- Exercice 2026 (simulation) : 188 jours, **112 800 € HT** facturés ; jusqu'à 85 % = 95 880 € ; 54 % = 60 912 €. Par mois : 12 000, 12 000, 13 200, 11 400, 10 200, 12 600, 10 800, 6 000, 12 600, 12 000, 4 800 (novembre en cours), 0.
- Comptes (Qonto connecté) : Compte principal **14 382,60 €**, Compte taxes **7 200,00 €**, solde disponible **21 582,60 €**.
- CRA d'octobre 2026 : 22 jours ouvrés, **20 facturés** (14 sur site, 6 en télétravail les 2, 7, 9, 14, 21, 28 ; absences les 29 et 30). Facture **F-2026-010** : 12 000,00 € HT, TVA 2 400,00 €, TTC 14 400,00 €.
- Factures : F-2026-011 (novembre, 4 800,00 €, à venir), F-2026-010 (payée), F-2026-009 Atelier Norma (1 800,00 €, **en retard**), F-2026-008 (septembre, 10 800,00 €, payée).
- Cash-Outs : total remboursé **1 235,80 €** (septembre 804,60 ; août 431,20), à venir **1 231,05 €** (novembre 512,75 ; octobre 718,30), 4 mois. Détail d'octobre : indemnités kilométriques 312,40 ; frais de repas 286,00 ; abonnements 119,90.
- TVA d'octobre : collectée 2 400,00 ; déductible 186,40 ; à reverser **2 213,60 €** avant le 24 novembre.
- Coordonnées de Payout sur les supports : `payout.fr` seulement. Pas d'adresse mail inventée, pas d'adresse de rue. Si un téléphone est nécessaire : `01 99 00 12 85` (plage réservée aux fictions). Personne fictive pour une carte de visite : Inès Caron, accompagnement des freelances.
- Payout n'émet pas de carte de paiement : **ne pas en dessiner**.

## Le système

Marque **sombre**. Le noir Coffre est le fond, le Net est la lumière. Les panneaux clairs (Relevé) donnent le rythme : une planche claire sur quatre environ.

| Élément | Règle |
|---|---|
| Règle de construction | **Un seul anneau (diamètre 100, graisse 26) et un seul fût (26) : chaque lettre est faite de l'anneau, entier ou coupé, et du fût.** |
| Symbole | Le P-jauge. Un anneau de diamètre 100 (rayon intérieur 24) rempli dans le sens horaire depuis midi sur 306° (85 % du tour), ouvert de 54° (les 15 % qui partent). Le fût, large de 26, descend à gauche depuis le centre de l'anneau sur 90 ; il rejoint l'anneau à 208,7°. Boîte `0 0 100 140`. `Marque.symbolPath(pct)` le dessine à n'importe quel remplissage : à 54 %, l'anneau ne touche pas encore le fût ; à 85 %, la boucle est faite et le versement part. |
| Logotype | « Payout », hauteur d'x 100, capitale 140 (le P monte de 40), descendante du y 40, ascendante du t 30. Le P est le symbole. a : anneau + fût à droite. y et u : demi-anneau bas + deux fûts. o : anneau entier (les 100 %). t : fût, quart d'anneau en pied, barre de 76. Approches : 6 (P a), 22 (a y), 16 (y o, o u), 12 (u t). Repère `0 -40 648 180`. Cotes dans `Marque.CONSTRUCTION`. |
| Version complète | Logotype + « Le copilote / des freelances » en Instrument Sans Medium, deux lignes à droite, la seconde sur la ligne de base (`Marque.lockup`). Version empilée pour les supports étroits : `Marque.lockupV` (descripteur en capitales Chivo Mono). Il n'y a pas de pictogramme posé devant le mot : le P du logotype est le symbole. |
| Icône d'app | Carré à coins de 22,5 %, symbole à 62 % de la hauteur : `Marque.icone(taille, ton)`. Coffre sur Net par défaut ; Net sur Coffre ; Coffre sur Relevé. |
| Couleurs | **Coffre `#060A08`** (noir à peine teinté de vert, fond de marque) · Ardoise `#101713` (panneaux et cartes sombres) · Acier `#7B8782` (texte secondaire) · Relevé `#EEF1F2` (gris très clair et froid, panneaux clairs) · Blanc `#FFFFFF` (cœur des halos, cartes du thème clair) · **Net `#36FF72`** (le vert électrique, seule couleur vive) · Prélevé `#FF5B35` (le seul accent chaud : ce qui part, le « 54 % », un retard). Texte sur Coffre : `#F3F6F4`. Texte sur Net : `#04140A`. |
| Échelle du Net | 50 `#EDFFF3` · 100 `#D1FFDF` · 200 `#A3FFBF` · 300 `#75FF9F` · 400 `#52FF86` · **500 `#36FF72`** · 600 `#0DD34C` · 700 `#0B983A` · 800 `#0A662A` · 900 `#08371A`. Sur fond clair, le texte vert est en Net 800 ; le Net 500 n'y sert qu'en aplat (bouton, jauge) avec du texte Coffre. |
| Contrastes | Net sur Coffre 14,9 · sur Ardoise 13,6. Texte clair sur Coffre 18,3. Acier sur Coffre 5,3 (texte secondaire possible), sur Ardoise 4,9. Prélevé sur Coffre 6,4. Coffre sur Net 14,9 · sur Relevé 17,5. Net 800 sur Blanc 7,1. Interdits : Net 500 en texte sur Relevé ou Blanc (1,2), Prélevé en petit texte sur Relevé (2,7). Le thème clair utilise le Prélevé foncé `#B03417` (`Marque.PRELEVE_CLAIR`) : 5,5 sur Relevé, 6,3 sur Blanc, 4,8 dans sa pastille teintée à 10 % (l'ancienne valeur `#D9431F` ne tenait pas l'AA en étiquette de 10 px). Filet d'une pilule sur fond clair : Coffre à 46 %, 3,1 sur Relevé. |
| Prélevé | Un seul usage par écran ou par planche, et seulement pour ce qui part : le « 54 % », le repère 54 d'une jauge, « Ce qui part », une TVA à reverser, un retard. Jamais en aplat de fond, jamais dans un dégradé. Sur le tableau de bord (`desk.bord`, `screens.bord`), deux usages au plus : le repère 54 de la jauge et le statut « En retard » ; « À déclarer » et « 54 % sans Payout » y sont neutres. |
| Dégradés | Une recette en trois calques : **base** (rampe du blanc au noir appliquée à une forme : bande, bloc, arc), **grain** (bruit fractal en incrustation, 50 %, classe `.grain`), **teinte** (Net 500 en mode couleur, 100 %, classe `.teinte`). Dans le socle la rampe est déjà teintée : Blanc → Net 200 → Net 500 → Net 700 → Net 900 → Coffre, toujours dans cet ordre. Préréglages : `.g1` halo en arc haut, `.g2` halo en arc bas, `.g3` stries, `.g4` bandes, `.g5` damier, `.g6` lueur de coin, `.g7` Ardoise, `.g8` halo sur Relevé, `.g9` Blanc vers Relevé, `.g-vif` aplat Net. `.g1` à `.g7` sont sombres (texte clair), `.g8`, `.g9` et `.g-vif` portent du texte Coffre. Toujours avec `.grain` sur une grande surface. |
| Typographie | **Instrument Sans** (Regular 400, Medium 500, SemiBold 600) : titres en Medium, très grands, interlettrage négatif (−0,055 em), interligne serré (0,93). **Chivo Mono** : tous les chiffres (montants, pourcentages, dates, références), tabulaires, et les métadonnées en capitales espacées (+0,06 em). Les chiffres font les titres : `.chiffre` pour un chiffre de scène, `Marque.pcH(85)` pour le signe % en petit exposant, `Marque.eurH(n)` pour un montant à la virgule resserrée. |
| La jauge (motif principal) | La proportion gardée, de 54 à 85, sur 100. Le plein est ce qui vous revient ; ce qui part est hachuré à 45° ou éteint ; ce qu'on gagne entre 54 et 85 peut passer en blanc (option `avant`). Bouts droits, **jamais arrondis**. Cinq formes : `segments` (100 traits, un par euro), `blocs` (10 × 10, remplis depuis le bas), `escalier` (les marches de 54 à 85), `barre`, `anneau` (celui du symbole, depuis midi). Elle se traite en grand : pleine largeur, avec un très grand chiffre. Jamais en petit graphique décoratif ; jamais pour une autre proportion que « gardé / parti ». |
| Les bandes, le damier, le halo (second motif) | Les données deviennent le motif : un histogramme en dégradé (`Marque.bandes`, profil qui monte), des blocs en dégradé sur une grille (`Marque.damier`), un arc de lumière qui entre par un bord (`Marque.halo`, `.g1`, `.g2`). Toujours grainés, toujours sur Coffre, toujours dans la rampe. Un seul de ces motifs par composition. Jamais derrière un texte courant sans marge sombre. |
| Le décompte | Une carte sombre à filet fin, des lignes à points de conduite en Chivo Mono, un total en grand, la jauge en segments au pied : `Marque.decompte`. Ce n'est pas un ticket de papier : pas de bord dentelé, pas de texture. |
| Gabarits de planche | Bandeau d'en-tête en chasse fixe (`Marque.entete`), bandeau de section à onglets (`Marque.section`), tuiles de bento à rayon de 36 (`Marque.tuile`, tons Ardoise, noire, claire, blanche, vive), pilules (`Marque.pilule`), phrase bicolore (`Marque.bicolore`), cartes sombres à filet fin (`.carte`). |
| Interface | Cockpit en **thème sombre** (version phare) : fond Coffre, cartes Ardoise à filet fin, Net pour l'action et les chiffres, une carte « dense » en aplat Net pour le solde. **Thème clair** pour le rythme (`{ clair: true }`) : fond Relevé, cartes blanches, texte vert en Net 800, carte dense noire. États en pastilles Chivo Mono : payé (vert, `.ok`), à venir (filet, `.att`), en cours (inversé, `.cours`), à déclarer (neutre : fond filet, point Acier, `.neutre`), en retard (Prélevé, `.due`). Intitulés du vrai produit : Tableau de bord, Comparatif, Planning, Trésorerie, Mon entreprise, Compte pro, Factures, Cash-Out, Payout, Drive, Gestion de la paie, Obligations déclaratives, Ressources. |
| Mouvement | La jauge monte de 54 à 85 et les chiffres comptent avec elle. Tout entre par le bas ou s'allume ; rien ne rebondit, rien ne clignote. Plans fixes ou dérive lente, comme chez Sui : c'est l'écran qui vit. |
| Lumière des scènes | De nuit. Les écrans et les lettres font la lumière ; sol sombre et brillant (verre sombre), socles noirs, reflets verts. Émission du Net à 1,2 au plus pour garder la teinte. Pas de jour, pas de bois, pas de papier kraft. |

## Règles chiffrées

Fixées le 11/11/2026 pour que le guide en pages et le site disent la même chose. Décidées en production, non validées par Corentin ni par Payout.

| Règle | Valeur |
|---|---|
| Zone de protection | Deux graisses autour du logotype (52 dans son repère, soit 52 % de la hauteur d'x). Symbole seul : une graisse (26, soit un quart du diamètre de l'anneau). |
| Tailles minimales | Version complète 180 px ou 48 mm · logotype 64 px ou 18 mm · symbole 16 px ou 5 mm de haut · icône d'app 16 px. |
| Proportions des couleurs | Coffre 62, Ardoise 14, Net 10, texte clair 6, Relevé et Blanc 6, Acier 1,5, Prélevé 0,5 (en %). Une planche claire sur quatre. Le Net en aplat plein cadre : une fois sur huit au plus. |
| Rayons | Section 44 · tuile 36 · carte de planche 20 · carte d'interface 20 à 22 · bouton et pilule : demi-hauteur · jauge : 0. |
| Filets | 1 px, blanc à 10 % sur sombre, Coffre à 12 % sur clair. |
| Grain | Incrustation, 50 %, sur toute surface éclairée de plus de 300 px. |
| Jauge | `segments` : 100 traits, écart de 3 px entre 38 et 96 px de haut (2 px en dessous). `blocs` : 10 × 10, écart de 1,5 % du côté. Hachures de ce qui part : 45°, trait de 16 % du pas. Repère 54 : un trait Prélevé de 2 px. |
| Mouvement | État 160 ms · entrer 420 ms, montée de 12 px · jauge de 54 à 85 : départ à 0,4 s, 1 350 ms, sortie douce `1 − (1 − x)⁴` (`Marque.ease`) · logo 1 800 ms · décalage dans un groupe 80 ms · boucles de 8 s (la jauge redescend sur la dernière seconde). En CSS : `cubic-bezier(.16, 1, .3, 1)`. |

### Échelle typographique

| Niveau | Police | Corps | Interligne | Interlettrage | Classe |
|---|---|---|---|---|---|
| Chiffre de scène | Chivo Mono Medium | 136 à 320 px | 0,86 | −0,06 em | `.chiffre` |
| Display | Instrument Sans Medium | 96 px | 0,92 | −0,055 em | `.d-t1` |
| Titre 300 | Instrument Sans Medium | 88 px | 0,93 | −0,055 em | `.h-xl` |
| Titre 200 | Instrument Sans Medium | 52 px | 0,98 | −0,045 em | `.h-l`, `.d-t2` |
| Titre 100 | Instrument Sans Medium | 28 px | 1,05 | −0,035 em | |
| Phrase bicolore | Instrument Sans Medium | 21 à 27 px | 1,3 | −0,02 em | `.bicolore` |
| Texte 200 | Instrument Sans Regular | 19 px | 1,4 | −0,01 em | `.body-l` |
| Texte 100 | Instrument Sans Regular | 14,5 px | 1,4 | 0 | |
| Montant 200 | Chivo Mono Medium | 26 à 44 px | 1,1 | −0,035 à −0,06 em | `.d-v` |
| Montant 100 | Chivo Mono Medium | 13,5 px | 1,3 | −0,01 em | `.mt` |
| Étiquette | Chivo Mono Regular, capitales | 10 à 10,5 px | 1,5 | +0,06 à +0,08 em | `.cap`, `.d-k`, `.entete` |

## Planches de l'étude de cas

Veine : **marque et produit par sections** (veine 3), avec les dispositifs d'archive de la veine 2 (Sui) et les mockups 3D de la veine 1. Trois sections : La marque, Le site, La web app. Ordre proposé pour `presentation.json`. « HTML » : planche de 1400 px. « 3D » : scène Blender. « Vidéo » : page de `motion/` enregistrée image par image. Chaque planche HTML porte le bandeau d'en-tête. Ne jamais mettre trois planches de même nature à la suite.

| N° | Planche | Type | Ce qu'elle montre |
|---|---|---|---|
| 01 | Couverture | HTML | Halo en arc (`.g1`), logo complet blanc, bandeau d'en-tête en bas, « ce que nous avons fait » en liste mono. |
| 02 | Le monument | 3D A + vidéo V0 optionnelle | Le mur de 100 blocs dans un paysage nocturne, 85 allumés. |
| 03 | Mosaïque d'ouverture | HTML | Trente à quarante vignettes de toutes les pièces, serrées, sur Coffre. À faire en dernier. |
| 04 | Avant / après | HTML | Le logo et la palette de 2025 à gauche (petits, en gris), la proposition à droite ; les huit lignes du tableau « Avant / après ». |
| 05 | Section 01, La marque | HTML | Même construction que 20 et 24 : bande de motif (le damier), `Marque.section({ titre: 'La marque', num: '01', actif: 0 })`, sa phrase bicolore, les quatre mots-clés, puis un aperçu de la section (symbole, jauge, couleur, icône d'app). |
| 06 | Bento d'identité | HTML | Tuiles : construction du symbole sur grille, « Aa » coupé par le bord, icône d'app en contexte, le chiffre 85, les bandes. |
| 07 | Construction | HTML | Le P-jauge sur sa grille (anneau 100, graisse 26, 306° et 54°, fût de 90), puis les six lettres et leurs approches. Tracés fins, cotes en mono, d'après `Marque.CONSTRUCTION`. |
| 08 | Révélation du logo | Vidéo V1 | Voir vidéos. |
| 09 | Logo et variantes | HTML | Version complète, logotype, symbole, version empilée ; quatre pavés de couleur ; zone de protection ; tailles minimales ; à ne pas faire. |
| 10 | La jauge, de 54 à 85 | Vidéo V2 + 3D B | Voir vidéos ; puis la jauge en volume, 17 segments allumés sur 20, sur sol sombre. |
| 11 | La jauge et ses états | HTML | Le très grand « 85 % », la barre de 100 segments, les 100 blocs, l'escalier, l'anneau ; l'état 54 en regard. |
| 12 | Fiche couleur | HTML | Grand aplat Net à gauche ; l'échelle 50 à 900 empilée à droite avec HEX, RGB, contraste ; Coffre, Ardoise, Acier, Relevé, Prélevé en ligne. |
| 13 | Recette de dégradé | HTML | Trois cartes par motif (base, grain, teinte) avec opacité et mode de fusion ; bandes, damier, halo (`Marque.recette`). |
| 14 | Échelle typographique | HTML | Le tableau ci-dessus : réglages en mono à gauche, rendu à droite, intertitres gris par famille. |
| 15 | Grille d'icônes | HTML | Les icônes du socle (`Marque.ICONES`) complétées à une soixantaine au même trait de 1,6 ; trois en carré Net. |
| 16 | Un détail s'allume | Vidéo V3 | Voir vidéos. |
| 17 | Archive du système | HTML | Grille 3 × 2 : logo sur halo, recette, escalier de glyphes Chivo Mono, symbole sur Acier, spécimen « 85 » avec curseurs, damier. |
| 18 | Affichage urbain | 3D E | L'abribus de nuit : « 54 % → 85 % ». |
| 19 | Papeterie | 3D G | Cartes de visite, facture et CRA imprimés, sur verre sombre. |
| 20 | Section 02, Le site | HTML | Bandeau de section, onglet « Le site » actif. |
| 21 | Le site sur un portable | 3D C + vidéo V4 | Portable sur socle, le site défile à l'écran. |
| 22 | Pages du site | HTML | `Marque.desk.sitePage()` en longueur dans le navigateur, et l'écran `screens.simulateur` en version mobile à côté. |
| 23 | Mur de pages | Vidéo V5 | Voir vidéos. |
| 24 | Section 03, La web app | HTML | Bandeau de section, onglet « La web app » actif. |
| 25 | Le cockpit | HTML | Chapitre sombre : `desk.bord()` plein cadre dans le navigateur, sur `.g6`. |
| 26 | Écran et détail | HTML | Le tableau de bord d'un côté ; la carte « La part qui vous revient » sortie de l'écran et agrandie deux fois de l'autre. |
| 27 | Du CRA à la facture | HTML | Rangée de parcours : quatre écrans reliés par un filet, pastilles 1/4 à 4/4 (CRA en saisie avec `jusqu`, CRA validé, facture, cash-out). |
| 28 | Le téléphone | 3D D + vidéo V6 | Téléphone incliné, écran vivant. |
| 29 | Thème clair | HTML | Les mêmes écrans en clair (`{ clair: true }`) : `desk.cra`, `desk.cashouts`, un téléphone. Planche claire, pour le rythme. |
| 30 | Feuille de composants | HTML | Boutons, pilules d'état (payé, à venir, en cours, en retard), champs, lignes de tableau, cartes de solde, jauges, dans les deux thèmes. |
| 31 | Même écran, trois supports | HTML ou 3D | Le tableau de bord à plat, sur le téléphone, sur le portable. |
| 32 | Stand de salon | 3D F | Le stand tech, mur d'écran et comptoir. |
| 33 | Icône d'app | HTML | L'icône en grand, ses tons, un écran d'accueil générique. |
| 34 | Réseaux sociaux | HTML | Trois publications : « 54 % → 85 % », « Votre CRA devient une facture. », le triptyque. |
| 35 | Enseigne de bureau | 3D H | Le logotype lumineux dans un bureau la nuit. |
| 36 | Guide de marque | HTML | Mosaïque des pages du guide (`deck/pages.js`). |
| 37 | Planche-contact | HTML | Toutes les planches en grille de sept colonnes, numérotées en mono, sur Coffre. |
| 38 | Mosaïque en dérive | Vidéo V7 | Voir vidéos. |
| 39 | Clôture | HTML | Halo en arc bas (`.g2`), « Gardez la part qui vous revient. », logo, crédits, `payout.fr`, mention « proposition KLYRA ». |

Planches HTML : 27. Vidéos : 7. Scènes 3D : 8 (A à H). Si le temps manque, retirer d'abord 31, 34 et 35.

### Vidéos

| N° | Vidéo | Format | Durée | Ce qui se passe |
|---|---|---|---|---|
| V1 | Révélation du logo | 1920 × 1080 | 6 s | L'anneau se remplit en blanc jusqu'à 54 (`symbolPath(pct)`), le fût est encore détaché ; il continue jusqu'à 85, rejoint le fût et passe au Net ; les lettres arrivent espacées puis se resserrent ; le descripteur se pose. |
| V2 | La jauge, de 54 à 85 | 1920 × 1080 | 6 s, boucle | Le grand chiffre compte de 54 à 85, les 100 segments puis les 100 blocs s'allument avec lui (`Marque.seekJauge(t, { boucle: 6 })`), le montant suit (6 480 € à 10 200 €). |
| V3 | Un détail s'allume | 1080 × 1080 | 6 s, boucle | La grille d'icônes sur Coffre ; un carré Net saute d'icône en icône, une par demi-seconde. |
| V4 | Défilement du site | 1920 × 1080 | 12 s | `desk.sitePage()` défile dans le navigateur, le curseur règle le simulateur, la jauge passe de 54 à 85. Incrustée dans la scène C. |
| V5 | Mur de pages | 1920 × 1080 | 14 s, boucle | Colonnes de pages (site, cockpit sombre et clair) qui montent et descendent en sens alternés. |
| V6 | Écran vivant | 1080 × 1350 | 10 s | Plan fixe sur le téléphone : les jours du CRA se cochent (`screens.cra({ jusqu })`), le bouton passe à « Facture générée », une carte de message descend. Incrustée dans la scène D. |
| V7 | Mosaïque en dérive | 1920 × 1080 | 20 s | La caméra glisse lentement sur la mosaïque d'ouverture. |

Une vidéo optionnelle V0 (8 s) peut animer le monument : les blocs s'allument de 54 à 85 dans le décor.

### Scènes 3D

De nuit, sans exception. Cotes réelles des objets, à respecter dans Blender (unité : le mètre).

| Scène | Objet | Cotes réelles | Mise en scène |
|---|---|---|---|
| A | Le monument | Mur de 100 blocs : 6,0 × 6,0 m, épaisseur 0,8 m ; chaque bloc 0,52 m, écart 0,08 m. Logotype lumineux au pied : hauteur d'x 0,45 m. | Terrain bruité sombre, ciel de nuit (HDRI Poly Haven CC0 à créditer, ou fond Coffre et étoiles). 85 blocs allumés en Net, 15 éteints. Plan fixe, objectif de 35 mm. |
| B | La jauge en volume (objet d'ouverture de la section marque) | 20 segments debout : longueur 2,0 m, chaque segment 70 × 40 × 400 mm, écart 30 mm ; ou le symbole en volume, 1,4 m de haut, épaisseur 0,25 m. | Sol sombre et brillant, 17 segments allumés, reflets. `jauge_segments` et `jauge_blocs` dans `blender/payout.py`. |
| C | Ordinateur portable sur socle | Portable de 14 pouces : 312 × 221 × 15,5 mm, écran 16:10. Socle : 0,6 × 0,6 × 0,95 m. | Écran lumineux (le site, puis le cockpit), socle noir laqué, fond en dégradé sombre. Plan fixe, seul l'écran vit. |
| D | Téléphone incliné | 71,5 × 146,7 × 7,8 mm, coins de 9 mm. | Gros plan, téléphone couché en diagonale sur verre sombre, écran `screens.solde` ou `screens.cra`. Profondeur de champ courte. |
| E | Abribus | Caisson d'affichage 1,185 × 1,75 m (visuel 1,16 × 1,71 m) ; abribus 4,2 × 1,6 × 2,6 m. | Rue la nuit, caisson rétroéclairé : « 54 % → 85 % » en chiffres de scène, la barre de segments, le logotype. Reflet sur le trottoir mouillé. |
| F | Stand de salon tech | Stand 3 × 3 m, cloisons de 2,5 m ; mur d'écran 2,0 × 1,125 m ; comptoir 1,0 × 0,5 × 1,05 m ; kakémono 0,85 × 2,0 m. | Cloisons Coffre, mur d'écran avec le tableau de bord, kakémono « Gardez jusqu'à 85 % de votre TJM. », comptoir à bandeau de segments. |
| G | Papeterie | Cartes de visite 85 × 55 mm ; facture et CRA en A4, 210 × 297 mm ; enveloppe 220 × 110 mm. Option : capot de portable 312 × 221 mm avec trois autocollants de 40 à 60 mm. | Posés sur verre sombre, lumière rasante froide. Carte recto Coffre et logotype Net, verso Net. La facture reprend F-2026-010. Sobre : pas de kraft, pas de tampon. |
| H | Enseigne de bureau | Logotype lumineux de 1,6 m de large (hauteur d'x 0,247 m), lettres de 25 mm d'épaisseur, à 30 mm du mur. | Mur sombre d'un bureau la nuit, halo vert sur le mur, un écran allumé au second plan. |

Les visuels de supports à plaquer en 3D (affiche, écran, cartes, facture, kakémono) se font en HTML dans `art/` avec le socle. Vérifier les données fictives dans `art/` avant tout rendu : corriger après oblige à tout re-rendre.

## Technique

Dossier de travail : ce dossier. Lancer toutes les commandes depuis sa racine. Pas de commit Git, pas de mise en ligne, rien hors de ce dossier.

- `brand/marque.css` + `brand/marque.js` : le socle. **Lecture seule** pour tous ceux qui produisent. Une page l'utilise ainsi : `<link rel="stylesheet" href="../brand/marque.css"><script src="../brand/marque.js"></script>`.
- Page qui montre tout : `plates/_test.html`, rendu `out/_test.png`. À regarder avant de commencer.

### API du socle

- **Logo** : `Marque.wordmark(couleur, attrs, pct)`, `Marque.symbol(couleur, attrs, pct)`, `Marque.lockup(couleur, attrs)`, `Marque.lockupV(couleur, attrs)`, `Marque.icone(taille, ton)` (tons : `net`, `coffre`, `ardoise`, `releve`, `blanc`). Tracés bruts : `Marque.wordPath(pct)`, `Marque.symbolPath(pct)`, `Marque.letterPath('P'|'a'|'y'|'o'|'u'|'t', décalageX, pct)`, `Marque.letterX(i)`. Pièces pour le mouvement : `Marque.symbolParts(pct)` → `{ anneau, fut, part, plein }` (la `part` est le secteur manquant), `Marque.letterParts(lettre, décalageX)` (les morceaux se recouvrent à la jonction : les remplir séparément). Géométrie : `Marque.CONSTRUCTION`, `Marque.LETTRES`.
- **Couleurs** : `Marque.COULEURS.{coffre, ardoise, acier, releve, blanc, net, preleve}`, `Marque.ECHELLE[50…900]`, `Marque.PRELEVE_CLAIR` (`#B03417`, le Prélevé du thème clair, hors de `COULEURS`). En CSS : `var(--coffre)`, `var(--net)`, `var(--net-200)`… et les rôles `--vif`, `--clair`, `--moyen`, `--sombre`, `--scene`, `--sur-scene`, `--papier`, `--doux`, `--encre`.
- **Chiffres** : `Marque.NB` (l'espace insécable U+00A0, à mettre avant « : », « ; », « % », « € » ; ne pas la retaper à la main), `Marque.eur(n, décimales, signe)` (texte), `Marque.eurH(…)` (HTML, virgule resserrée), `Marque.pc(n)`, `Marque.pcH(n)` (signe % en exposant, dans un `.chiffre`), `Marque.passage({ taille, c, avant })` pour « 54 % → 85 % », `Marque.fleche(couleur)`. Classes `.mt` (montant), `.chiffre` (chiffre de scène), `.d-v`, `.cap`.
- **La jauge** : `Marque.jauge({ forme, p, avant, repere, h, l, n, g, taille, ep, c, c2, c3, c4, part, dans, vertical, degrade, anim, de, a, retard, cls, style })`. `forme` : `'segments'`, `'blocs'`, `'escalier'`, `'barre'`, `'anneau'`. `Marque.colonnes(données, opts)` : graphique sobre en jauges debout.
- **Animer la jauge, sans horloge** : `Marque.seekJauge(t, { de: 54, a: 85, debut: 0.4, duree: 1.35, boucle: 0, root })` pose toutes les jauges créées avec `anim: true` et tous les textes marqués `data-j` (`"val"`, `"reste"`, `"eur"` avec `data-base`, `"ecart"`). `Marque.pJauge(t, opts)` renvoie la valeur seule ; `Marque.setJauge(élément, p)` pose une jauge ; `Marque.majJauge(p, racine)` pose tout à une valeur. Les écrans `screens.simulateur`, `desk.bord`, `desk.site` et `desk.sitePage` acceptent `{ p, anim }`.
- **Motifs** : `Marque.bandes({ n, seed, profil: 'monte'|'pic'|'plat', forme: 'histogramme'|'stries', valeurs, sens, gap, rampe: 'net'|'grise', k })` (la variable CSS `--k`, de 0 à 1, règle la hauteur de toutes les bandes : c'est elle qu'on anime), `Marque.damier({ cols, rows, seed, densite, sens: 'h'|'v', gap, rampe })`, `Marque.halo('haut'|'bas', style)`, `Marque.recette('base'|'grain'|'teinte', 'bandes'|'stries'|'damier'|'halo', opts)` (pour le halo : `opts.halo` vaut `'bas'` par défaut ou `'haut'` ; l'arc gris est la classe `.halo.grise`). Tous déterministes, tous à poser dans un parent en `position: relative`, de préférence `.grain`.
- **Gabarits** : `Marque.entete(colonnes, couleur, style)` (défaut `Marque.ENTETE`), `Marque.section({ titre, num, phrase, actif, onglets, sombre, style })` (`style` : style en ligne du bandeau, par exemple `margin-top:-44px;padding-bottom:0;z-index:2` pour qu'il morde sur la bande de motif, comme les planches 05, 20 et 24), `Marque.onglets(liste, actif)`, `Marque.pilule(texte, actif, classes)` (classes `mono`, `filet`), `Marque.tuile(html, { ton, lbl, style })`, `Marque.bicolore(html)` (mots forts dans `<b>`, `<b class="vif">` pour du Net), `Marque.foot(a, b, couleur)`.
- **Composants** : `Marque.decompte({ titre, lignes, total, p, pied, ref, date, dec, clair, k })`, `Marque.cra({ cell, cw, gap, jusqu, entete, nums })`, `Marque.ncard(titre, texte, { heure, action })`, `Marque.icon(nom, couleur, taille, graisse)` (noms dans `Marque.ICONES`). `Marque.craCompte(jusqu)` → `{ site, tele, factures }` : les jours comptés jusqu'au jour `jusqu`.
- **Pièces des écrans de téléphone**, pour composer un écran hors du socle avec les mêmes classes (`.ui`, `.u-col`, `.u-card`…) : `Marque.icons.status(heure)` (la barre d'état, 9:41 par défaut), `Marque.icons.top()` (l'en-tête : logotype, cloche, menu), `Marque.icons.ic(tracé, couleur, taille, graisse)` (une icône à partir d'un tracé SVG brut ; pour une icône du socle par son nom, `Marque.icon`).
- **Appareils** : `Marque.phone(écran, échelle)` (414 × 868), `Marque.browser(écran, échelle, { url, h, clair })` (1440 × 946 ; `h` pour une page longue), `Marque.laptop(écran, échelle, { url, clair })` (1700 × 1026). Pas de montre.
- **Écrans de téléphone** (390 × 844) : `Marque.screens.solde({ n, clair })`, `.cra({ jusqu, valide, clair })`, `.facture({ clair })` (la facture F-2026-010 générée depuis le CRA), `.bord({ p, anim, clair })` (le tableau de bord, mêmes données que `desk.bord`), `.cashouts({ clair })`, `.simulateur({ p, anim, clair })`. `screens.cra` est validé par défaut (facture F-2026-010 et son total) ; avec `valide: false`, pas de numéro de facture : « Jours cochés » et « Montant à ce jour » (jours cochés jusqu'à `jusqu` × TJM, soit 9 000 € pour `jusqu: 21`), bouton « Valider le CRA ».
- **Écrans d'ordinateur** (1440 × 900) : `Marque.desk.bord({ p, anim, clair })`, `.cashouts({ clair })`, `.cra({ jusqu, valide, clair })` (même règle que `screens.cra` avec `valide: false`), `.site({ p, anim })`, `.sitePage({ p, anim })` (1440 × `Marque.desk.SITE_H`, soit 3560).
- **Thème** : sombre par défaut. `{ clair: true }` sur un écran ; pour poser un composant thémé (grille du CRA, pastilles `.d-pill`, lignes `.d-row`) hors d'un écran, l'entourer de `<div class="theme">` ou `<div class="theme clair">`. Pour inverser pilules et phrase bicolore sur un panneau clair : classe `.sur-clair`. Pastilles d'état : `.d-pill` ou `.u-pill` avec `ok`, `att`, `cours`, `neutre`, `due`. Tableau resserré : `.d-tab.d-serre`.
- **Fichiers** : logos vectorisés `brand/logo/payout-{logotype,symbole,complet}-{net,blanc,coffre,releve}.svg` ; polices pour la 3D `brand/fonts/InstrumentSans-{Regular,Medium,SemiBold,Bold}.ttf` et `ChivoMono-{Light,Regular,Medium,Bold}.ttf` ; tracés pour Blender `brand/logo/logo.json`, lus par `lib.logo(part='logotype'|'symbole'|'descripteur')`.
- **3D** : `blender/payout.py` (`from payout import *`) donne la palette `C`, `nuit()`, `sol_sombre()`, `mat_net()`, `chiffres()` (texte en Chivo Mono), `jauge_segments()`, `jauge_blocs()`, plus tout `lib.py` et `objets.py`.
- **Commandes** : image fixe `node tools/shot.mjs plates/x.html out/plates/x.png` (1400 px, rendu ×2 ; `--crop x,y,l,h` pour un détail). Vidéo `node tools/record.mjs motion/x.html out/motion/x.mp4 --w 1920 --h 1080 --fps 30 --dur 6`, la page expose `window.seek(t)`. 3D `"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --factory-startup -b -P blender/scene.py -- --draft`. Après toute retouche du logo : `python tools/export_logo.py`.
- Regarder chaque rendu avant de le déclarer fini.

### Pièges connus

- **Pas de caractère « → »** dans les polices (sous-ensemble latin) : utiliser `Marque.fleche()` ou `Marque.passage()`. Le signe « − » et « … » existent.
- **Noms de classe réservés**, à ne pas recréer ailleurs : `.g1` à `.g9`, `.g-vif`, `.grain`, `.teinte`, `.bandes`, `.damier`, `.halo`, `.jauge`, `.barre`, `.segments`, `.blocs`, `.escalier`, `.anneau`, `.colonnes`, `.col`, `.part`, `.trame`, `.plein`, `.vide`, `.on`, `.gain`, `.rep`, `.entete`, `.section`, `.sombre`, `.tuile`, `.carte`, `.pilule`, `.onglets`, `.bicolore`, `.vif`, `.vive`, `.claire`, `.blanche`, `.noire`, `.clair`, `.theme`, `.sur-clair`, `.decompte`, `.cra`, `.site`, `.tele`, `.absent`, `.we`, `.phone`, `.screen`, `.cote`, `.browser`, `.laptop`, `.ui`, `.status`, `.home`, `.cap`, `.mono`, `.mt`, `.vg`, `.pct`, `.chiffre`, `.ncard`, `.icone-app`, `.plate`, `.pad`, `.pfoot`, `.h-xl`, `.h-l`, `.body-l`, `.ok`, `.att`, `.due`, `.cours`, `.neutre`, `.dense`, `.ghost`, `.grand`, `.filet`, `.haut`, `.bas`, `.vert`, `.stries`, `.grise`, `.degrade`, et tout ce qui commence par `u-`, `d-`, `j-`, `c-`, `r-`, `b-`, `l-`, `s-`, `t-`. Attention : `plates/plates.css` de l'exemple définit des classes très générales (`.abs`, `.lbl`, `.rule`, `.mp`, `.sl`, `.appi`) : vérifier qu'elles ne heurtent rien avant de le recharger ; `.site`, `.section`, `.carte`, `.on` sont des noms courants. Préfixer les classes d'une page (la page de test utilise `z-`).
- **Le grain** : `.grain` reçoit un fond Coffre par défaut ; une classe de dégradé, une tuile ou un style en ligne le remplace. Un contenu à garder net (texte, logo) posé dans un élément `.grain` doit avoir `position: relative; z-index: 60`.
- **Une jauge dans une carte dense** prend seule la couleur de la carte (`--j-c`, `--j-c2`). Pour forcer une couleur : options `c`, `c2`.
- **Marque.pcH et Marque.eurH renvoient plusieurs nœuds** (le chiffre, puis un span) : dans un conteneur en grille ou en flex, les entourer d'un seul `<span>`, sinon le signe % passe à la ligne.
- **Les numéros de facture** se coupent au trait d'union : les entourer de `white-space: nowrap`.
- **`Marque.icon` et `Marque.icons.ic` ne prennent pas la même chose** : `Marque.icon('cloche', …)` prend un nom de `Marque.ICONES` ; `Marque.icons.ic(d, …)` prend le tracé SVG lui-même (le contenu du `<svg>`). Passer un nom à `ic` dessine une icône vide, sans erreur.
- **Pas de copie locale d'un écran ou d'une pièce du socle** : la facture et le tableau de bord sur téléphone, l'en-tête des écrans (`Marque.icons.top()`), le halo gris de la recette et l'espace insécable (`Marque.NB`) existent désormais dans le socle. Une copie dans une planche ne suit plus les corrections.
- **Un CRA « en saisie » n'a pas de facture** : `screens.cra({ jusqu })` sans `valide: false` affiche l'état validé (facture et 12 000 €) même si les jours ne sont pas tous cochés. Pour montrer la saisie, passer `valide: false`.
- **Une pilule `.filet` posée sur un fond clair** ne prend son filet renforcé que dans un contexte clair (`.sur-clair`, `.tuile.claire`, `.tuile.blanche`, `.section` claire, `.theme.clair`). Posée à même un fond Relevé sans ce contexte, elle garde le filet blanc à 10 % et disparaît.
- **Capture de plus de 16 384 px de haut** : Chrome répète le haut de la page au-delà. La page de test (plus de 10 000 px) se rend donc avec `--scale 1.5` : `node tools/shot.mjs plates/_test.html out/_test.png --scale 1.5`.
- **Une grille du CRA sans numéros (`nums: false`) sur fond blanc** : les week-ends n'ont que leur numéro pour exister ; leur donner un aplat dans la page (voir la planche 34).
- **Le y du logotype descend de 40 % de la hauteur d'x** : en 3D, un logotype debout se pose à `z = 0,4 × height` ou se monte sur un mur, jamais à `z = 0`. Hauteur de capitale : 1,4 × height.
- **Émission en 3D** : au-delà de 1,2, le Net vire au menthe (vue « Standard »). Garder la force basse et laisser le sol brillant faire les reflets.
- **Le Net ne s'écrit jamais en texte sur un fond clair** : Net 800 pour le texte, Net 500 pour les aplats.
- **Toujours « jusqu'à 85 % »** dans une phrase. Le chiffre seul est permis en chiffre de scène quand la phrase voisine porte « jusqu'à ».
- **Fichiers de l'exemple** : ce projet a été créé avec l'exemple clair du skill, puis ses fichiers d'exemple ont été remplacés par ceux de l'exemple sombre après le changement de direction. `plates/plates.css`, `motion/*`, `art/*`, `deck/*`, `site/*`, `presentation.json` et les scènes `blender/s01` à `s24` citent encore la marque de l'exemple (sa police, son orbe, ses couleurs) : `python tools/verifier_restes.py --tout` les liste. Le socle et la page de test n'en contiennent plus.
- `tools/export_logo.py` a été modifié dans ce projet : il exporte aussi la police des chiffres (`FONTS.chiffres`) et ne l'efface pas. Il ne retire pas les fichiers SVG d'une couleur de logo qu'on a retirée de `COULEURS_LOGO` : les supprimer à la main.
- Le nom et le logo n'ont fait l'objet d'aucune vérification d'antériorité : le dire dans le guide.

## Qui fait quoi

- `plates/` et `out/plates/` : planches fixes (designer).
- `motion/` et `out/motion/` : vidéos (motion designer).
- `art/`, `blender/` et `out/blender/` : visuels de supports et scènes 3D.
- `deck/`, `site/`, `livrables/` : guide, présentation et site, après les trois chantiers. `<meta name="robots" content="noindex">` partout, et la mention « proposition KLYRA, pas l'identité officielle de Payout » sur la première et la dernière page.
