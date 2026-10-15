# Validation de Sweety Adventure

Version fonctionnelle : `2026.10.16-r1`. Cette fiche concerne la validation avant publication ; la confirmation du déploiement est effectuée séparément sur GitHub Pages.

## Méthodes et preuves

- Tests exécutés dans Chromium Headless Shell 151.0.7922.34, avec un véritable rendu Canvas et DOM.
- 7 tests de simulation : saut/double saut, réception, plateforme mobile, pause, collecte, dégâts et invincibilité, victoire sur le niveau complet, défaite sans sauter.
- 14 vérifications navigateur, dont commandes tactiles, deux contacts simultanés, clavier, persistance, résolutions, portrait et rechargement hors ligne.
- Une partie complète en temps réel utilise uniquement la touche Espace. Elle ne modifie aucune position, vie ou condition de victoire et n'utilise pas les commandes de test.
- 40 images de personnages distinctes contrôlées en RGBA, de taille constante, avec des marges transparentes sur chaque côté. Inspection visuelle des silhouettes et des captures du moteur.
- 49 images chargées par le jeu ; 58 fichiers et l'URL de départ préchargés dans le cache de cette version. Environ 3,16 Mo pour les fichiers nécessaires au jeu, sans les sources de travail ou preuves.

Les rapports détaillés sont [browser-report.json](docs/evidence/browser-report.json) et [realtime-report.json](docs/evidence/realtime-report.json). Les contrôles de simulation sont reproductibles dans `tests/core.test.cjs`.

## Critères d'acceptation avant publication

| Critère | État | Preuve |
|---|---|---|
| Deux mascottes fidèles aux références | VALIDÉ | Inspection des 40 poses ; [sélection](docs/evidence/02-select.webp) |
| Personnages jamais tronqués dans les ressources | VALIDÉ | Contrôle des marges RGBA ; silhouettes sources isolées entières ; captures accueil, saut et partie |
| Animations à plusieurs images distinctes | VALIDÉ | 20 PNG et empreintes différentes par personnage ; 4 repos, 6 course, 2 saut, 2 réception, 2 dégâts, 4 victoire |
| Décors illustrés sans texte parasite | VALIDÉ | Nouveaux décors indépendants ; [partie](docs/evidence/12-realtime-level.webp) |
| Plateformes sans rectangle blanc | VALIDÉ | PNG RGBA originaux, contrôles alpha, captures de jeu |
| Raccords visuels propres | VALIDÉ | Bords des couches joints par réflexion ; inspection des captures pendant le défilement |
| Boutons fonctionnels | VALIDÉ | Accueil, sélection, tutoriel, son, records, pause, reprise, rejouer et retour testés |
| Saut et double saut | VALIDÉ | Entrées tactiles, clavier et deux points simultanés ; troisième saut refusé |
| Collisions fiables | VALIDÉ | Tests de réception, plateforme mobile, collecte et obstacles ; partie en temps réel |
| Niveau terminable | VALIDÉ | Victoire avec trois vies en 47 secondes de simulation ; partie en temps réel d'environ 47 secondes |
| Score et records | VALIDÉ | Collecte, combos, bonus de victoire, record conservé après rechargement |
| Chargement des ressources | VALIDÉ | 49/49 images ; aucune erreur HTTP ni exception navigateur pendant les tests |
| Adaptation tactile | VALIDÉ dans Chromium | Touches et multitouch testés ; boutons de l'accueil dans le viewport et d'au moins 44 px aux résolutions testées |
| Essai sur appareil Android physique | NON TESTÉ | Aucun appareil Android physique disponible dans cet environnement |
| Paysage et responsive | VALIDÉ dans Chromium | 844×390, 1024×600, 1280×720 et 1920×1080 ; indication de rotation en 390×844 |
| Hors ligne | VALIDÉ | Service worker actif, réseau coupé, rechargement et saut fonctionnels ; [capture](docs/evidence/11-offline.webp) |
| Objectif 60 FPS sur tablette Android | NON TESTÉ | Pas de mesure sur le matériel Android cible |
| Son | VALIDÉ pour commandes et exécution | Web Audio déclenché par une interaction ; réglage persistant ; aucune erreur navigateur. Écoute sur haut-parleur Android non testée |

## Captures issues du moteur

Toutes les images suivantes proviennent d'une capture du navigateur exécutant le jeu. Elles ne sont pas des illustrations de démonstration générées.

- [Accueil](docs/evidence/01-home.webp)
- [Choix du personnage](docs/evidence/02-select.webp)
- [Tutoriel](docs/evidence/03-tutorial.webp)
- [Double saut](docs/evidence/04-double-jump.webp)
- [Pause](docs/evidence/05-pause.webp)
- [Victoire du dinosaure](docs/evidence/06-victory.webp)
- [Défaite](docs/evidence/07-defeat.webp)
- [Paysage 844×390](docs/evidence/09-landscape-844.webp)
- [Portrait](docs/evidence/10-portrait.webp)
- [Jeu hors ligne](docs/evidence/11-offline.webp)
- [Partie de la licorne en temps réel](docs/evidence/12-realtime-level.webp)
- [Victoire de la licorne en temps réel](docs/evidence/13-realtime-victory.webp)

## Limites pratiques

Le mode hors ligne nécessite un premier chargement connecté et la fin de l'installation du cache. Le navigateur conserve les scores sur cet appareil uniquement. La sélection, le tutoriel et les contrôles ont été testés avec une émulation tactile Chromium, ce qui ne remplace pas l'essai du navigateur, du plein écran, de l'installation PWA ou des haut-parleurs sur une tablette Android réelle.
