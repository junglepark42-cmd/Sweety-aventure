# Sweety Adventure — La Forêt des Bonbons

Jeu HTML5 autonome pour les mascottes Sweety. Aucun service, CDN, compte joueur ou dépendance réseau n'est nécessaire pour jouer une fois les ressources mises en cache.

## Jouer

Ouvrir https://junglepark42-cmd.github.io/Sweety-aventure/ en paysage. Choisir la licorne ou le dinosaure, puis toucher l'écran ou SAUT. Une deuxième pression effectue le double saut. Au clavier : Espace, flèche Haut ou W ; P ou Échap met en pause. Les records et le réglage sonore sont conservés localement.

Pour le mode borne Android, installer le jeu depuis le navigateur quand cette option est proposée. Le manifest demande un affichage plein écran en paysage. Un écran de rotation bloque le jeu en portrait. Un premier chargement connecté complet est nécessaire avant utilisation hors ligne. Les données locales peuvent être effacées par le navigateur ou son mode privé.

## Architecture

- `index.html`, `css/game.css` : écrans tactiles et interface accessible.
- `js/core.js` : simulation déterministe à 60 pas par seconde, indépendante du rendu.
- `js/game.js` : chargement contrôlé des 49 images, affichage Canvas, interface et entrées.
- `js/audio.js` : mélodie et effets synthétisés originaux.
- `assets/` : 40 poses RGBA, décors séparés, plateformes et objets indépendants.
- `service-worker.js` : pré-cache atomique des ressources locales.
- `tests/` : physique, niveau complet, transparence, navigateur et partie en temps réel.

Les plateformes mobiles suivent le temps de simulation et restent donc immobiles pendant la pause. Les collisions utilisent une boîte de corps plus petite que la cape et le chapeau. Les plateformes sont traversables depuis le dessous, comme dans un jeu de plateformes classique. Le sol continu permet de poursuivre une partie même en manquant une plateforme. Les dix obstacles sont espacés pour laisser le temps d'apprendre le saut.

Les détails sur les ressources et leur provenance se trouvent dans [ASSETS.md](ASSETS.md). Les preuves et limites de validation se trouvent dans [VALIDATION.md](VALIDATION.md).

## Développement et tests

Node.js 22 ou plus récent, Python 3.12 ou plus récent :

```
npm ci
npx playwright install --with-deps chromium
pip install pillow
npm test
python tests/assets_test.py
npm run test:browser
npm run test:realtime
```

Les tests navigateur ouvrent un serveur local dans le même processus et utilisent le chemin `/Sweety-aventure/`. Les captures et rapports sont produits dans `test-results/`. Pour utiliser un binaire Chromium déjà installé, définir `SWEETY_BROWSER` sur son chemin. Le test en temps réel utilise uniquement les commandes clavier ; les tests accélérés utilisent les mêmes pas de simulation sans déplacer le personnage ni forcer la victoire.

Pour servir le jeu : `npm run serve`. Ouvrir ensuite `http://127.0.0.1:8765/Sweety-aventure/`.

La fabrication des objets nécessite `cairosvg`. L'export des sprites nécessite `pillow`, `numpy` et `scipy`. Après toute modification d'une ressource du jeu, exécuter `python tools/build_cache.py` pour régénérer les icônes, le manifest et la version du cache.

Le paramètre `?test=1` expose les commandes de simulation utilisées par les tests. Il n'est pas utilisé pour une partie normale. Les scores sont locaux et ne sont pas destinés à un concours sécurisé.

## Publication

GitHub Pages sert le contenu de `main` à la racine du dépôt. Les chemins sont relatifs et compatibles avec le sous-dossier du projet. La branche de réparation est validée avant de mettre à jour `main`. L'historique Git conserve l'ancienne version.

Le workflow `Verify game` relance les tests et conserve les captures en artefact après un push ou une pull request. Il ne déploie pas une branche de réparation sur le site public.
