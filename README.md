# Créa Lab — KLYRA

Collection de créations de marque KLYRA, préparée pour une publication publique autorisée. Chaque dossier de `brands/` est autonome : sources, médias nécessaires et livrables existants. Aucun workspace ni dépendance entre marques.

Les cinq études complètes sont Aube, Drupe, Payout, Custom et Sillon ; Roulement et Maillon sont des vitrines d’app accompagnées d’une identité originale. Aucun déploiement n’est créé par ce dépôt.

| Marque | État | Ouvrir | Fichiers importés | Mo |
|---|---|---|---:|---:|
| [Aube](brands/aube/LAB.md) | étude complète | [Guide ou planche](brands/aube/40_DELIVERABLES/aube-guideline/index.html) | 330 | 371.7 |
| [Payout](brands/payout/LAB.md) | étude complète | [Guide ou planche](brands/payout/40_DELIVERABLES/payout-guideline/index.html) | 524 | 445.3 |
| [Custom](brands/custom/LAB.md) | étude complète | [Guide ou planche](brands/custom/40_DELIVERABLES/custom-guideline/index.html) | 704 | 882.0 |
| [Drupe](brands/drupe/LAB.md) | étude complète | [Guide ou planche](brands/drupe/projet/livrables/site/index.html) | 407 | 303.3 |
| [Sillon](brands/sillon/LAB.md) | étude complète | [Guide ou planche](brands/sillon/40_DELIVERABLES/sillon-guideline/index.html) | 605 | 1378.4 |
| [Roulement](brands/roulement/LAB.md) | identité et vitrine | [Guide ou planche](brands/roulement/identite.html) | 86 | 167.3 |
| [Maillon](brands/maillon/LAB.md) | identité et vitrine | [Guide ou planche](brands/maillon/identite.html) | 103 | 170.1 |

## Consulter

Depuis la racine, avec Python 3 :

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Ouvrir `http://127.0.0.1:8080/` puis le dossier voulu. GitHub permet de télécharger les fichiers mais n’exécute pas les pages HTML. PDF et logos sont également accessibles sous les dossiers de livrables. Ce serveur écoute uniquement en local.

## Reprendre une marque

Lire son `LAB.md`, son brief `BRAND.md` ou `MARQUE.md`, puis son `package.json`. Les chemins internes des capsules sont conservés pour les scripts qui remontent vers `40_DELIVERABLES`. Installer les dépendances depuis le dossier de travail, pas à la racine. Le dépôt ne lance aucun outil de génération, achat ou déploiement automatiquement.

Les scripts et livrables ont été copiés sans refonte créative. Les gabarits `site/` sont des entrées d’assemblage, pas des sites déjà assemblés ; ouvrir les guides dans les livrables. Sillon ajoute à son guide un kit pour les réseaux et un outil pour composer une annonce.

## Provenance et crédits

Import des créations existantes au 12 novembre 2026. Les originaux et les déploiements existants sont préservés. Les notes internes de coordination, chemins personnels et historiques privés sont exclus de cette branche.

Payout et Custom sont des propositions KLYRA non approuvées par les marques ; Aube, Drupe et Sillon sont fictives. Les autres marques sont des essais, pas des engagements clients. La publication de cette collection ne confère aucune licence générale de réutilisation commerciale des identités ou des médias. Les crédits des briefs restent applicables ; les médias de référence Behance/Jor sont exclus, les textures nécessaires à la reconstruction sont conservées. Les fichiers de licence des polices disponibles sont joints.

Les inventaires donnent les chemins relatifs, tailles et SHA-256 (empreintes de contenu), les exclusions et les contrôles : [inventory/](inventory/). Les doublons de livraison sous `20_WORKING/*/livrables` ont été exclus au profit de `40_DELIVERABLES`. Les copies nécessaires aux liens restent à leur place ; Git stocke une seule fois les contenus strictement identiques. Ni LFS ni service payant.

Voir [les exclusions et limites](LIMITES.md). Pour vérifier une copie : `python tools/verify.py`.
