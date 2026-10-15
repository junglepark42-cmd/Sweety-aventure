# Ressources de Sweety Adventure

Les deux mascottes et les deux illustrations de décor sont des créations générées pour ce projet à partir des références fournies par le propriétaire du parc. Elles ne sont pas découpées dans l'ancienne affiche. Les fichiers exploités par le jeu sont locaux.

Chaque personnage possède 20 PNG RGBA de 256 × 256 pixels : repos 4, course 6, saut 2, réception 2, dégâts 2, victoire 4. Les poses ont été dessinées séparément dans les atlas de production ; l'export n'ajoute aucune rotation ou déformation pour simuler une pose. L'export identifie les silhouettes connexes entières et conserve les pieds à l'ancre (128, 240). Les fichiers `frames.json` enregistrent les limites sources et les empreintes.

Les plateformes, bonbons, étoiles et obstacles sont des illustrations vectorielles originales. Les SVG éditables et leurs exports PNG sont inclus ; `tools/make_objects.py` permet de les reproduire. Les plateformes existent en 220 et 320 pixels de large et ne sont pas étirées horizontalement dans le moteur.

Le décor lointain et la forêt sont deux ressources indépendantes, défilant à des vitesses différentes. Les tuiles sont alternées par réflexion afin de joindre des bords identiques. Les décors ne contiennent ni titre ni instructions techniques. Les silhouettes des personnages sont indépendantes des décors.

La musique et les effets sont synthétisés par `js/audio.js` avec Web Audio. La mélodie et les sons sont originaux ; aucun enregistrement, sample ou service audio externe n'est utilisé. Le jeu n'exige aucune licence de bibliothèque audio tierce.

Les références des mascottes restent celles du propriétaire. Cette documentation décrit la provenance technique ; elle ne prétend pas établir une exclusivité juridique sur les images générées.
