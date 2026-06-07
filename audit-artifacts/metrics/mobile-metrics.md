# Rapport de Mesure des Performances Mobiles (Émulation Réseau)

Généré : 2026-06-04T07:40:32.256Z
Écran : Viewport Mobile 390x844
Cible de l'application : Version d'évaluation native Expo
Serveur API : Instance PostgreSQL et backend locales

## Profils de Simulation Réseau
- **Local (Sans bridage)** : Connexion directe sans limite de bande passante, latence de 0 ms.
- **Mobile 3G (Bridé)** : Débit descendant de 1.6 Mbps, débit montant de 750 Kbps, latence RTT de 150 ms (simulant les conditions réelles d'utilisation sur un réseau mobile moyen).

## Temps de Chargement des Écrans (Comparatif)

| Route (Écran) | Launch (Local) | Launch (3G) | TTFR (Local) | TTFR (3G) | TTI (Local) | TTI (3G) | Fichiers transférés | Diagnostic Console |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` (Tableau de bord) | 50094 ms | 12416 ms | 48532 ms | 10885 ms | 32008 ms | 840 ms | 2.3 Mo | 2 w / 4 e |
| `/companies` (Entreprises) | 2181 ms | 12283 ms | 649 ms | 10762 ms | 392 ms | 860 ms | 2.3 Mo | 2 w / 1 e |
| `/quotes` (Devis) | 2544 ms | 12187 ms | 1022 ms | 10648 ms | 764 ms | 756 ms | 2.3 Mo | 2 w / 1 e |
| `/invoices` (Factures) | 2303 ms | 12322 ms | 769 ms | 10793 ms | 452 ms | 872 ms | 2.3 Mo | 2 w / 1 e |
| `/organizations` (Organisations) | 2164 ms | 12337 ms | 627 ms | 10803 ms | 376 ms | 816 ms | 2.3 Mo | 2 w / 1 e |

## Appels API (Moyennes des requêtes)

| Route (Écran) | Nombre d'appels | Temps moyen (Local) | Temps moyen (3G) | Percentile 95 (Local) | Percentile 95 (3G) |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 5 | 86 ms | 115 ms | 105 ms | 141 ms |
| `/companies` | 2 | 11 ms | 19 ms | 15 ms | 25 ms |
| `/quotes` | 3 | 20 ms | 13 ms | 25 ms | 16 ms |
| `/invoices` | 3 | 14 ms | 26 ms | 16 ms | 31 ms |
| `/organizations` | 1 | 11 ms | 29 ms | 11 ms | 29 ms |

## Historique et Alertes Console (Enregistrés en local)

### Écran d'accueil (`/`)
- Avertissement : `props.pointerEvents` est obsolète. Utiliser `style.pointerEvents`.
- Erreur : `[colorKit.RGB]` Une erreur est survenue lors de la tentative de conversion en couleur RGB. La couleur par défaut "noir" sera utilisée.
- Avertissement : Les propriétés de style `shadow*` sont obsolètes sur Expo Native. Utiliser `boxShadow` ou une ombre native.

### Écran des Entreprises (`/companies`)
- Avertissement : `props.pointerEvents` est obsolète.
- Erreur : Échec de conversion de couleur `colorKit.RGB`.
- Avertissement : Les propriétés `shadow*` sont dépréciées.

### Écran des Devis (`/quotes`)
- Avertissement : `props.pointerEvents` est obsolète.
- Erreur : Échec de conversion de couleur `colorKit.RGB`.
- Avertissement : Propriétés `shadow*` dépréciées.

### Écran des Factures (`/invoices`)
- Avertissement : `props.pointerEvents` est obsolète.
- Erreur : Échec de conversion de couleur `colorKit.RGB`.
- Avertissement : Propriétés `shadow*` dépréciées.

### Écran des Organisations (`/organizations`)
- Avertissement : `props.pointerEvents` est obsolète.
- Erreur : Échec de conversion de couleur `colorKit.RGB`.
- Avertissement : Propriétés `shadow*` dépréciées.

## Notes sur la méthodologie
- Les mesures de performance ont été collectées dans un environnement de test isolé reproduisant l'architecture de l'application.
- Les profils de bridage réseau simulent les contraintes de bande passante et de latence d'un appareil mobile connecté en 3G.
- Ces indicateurs servent à identifier l'impact de la latence réseau sur l'application mobile Expo lors du chargement initial du bundle JavaScript de développement Metro.
