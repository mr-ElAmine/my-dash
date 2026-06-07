# Synthèse de l'Audit Technique

Généré : 2026-06-04
Périmètre : Application Mobile Expo, environnement d'audit isolé avec base de données Postgres locale, Viewport mobile 390x844.

## Livrables de l'Audit

- Captures d'écran du parcours utilisateur mobile : `audit-artifacts/mobile-workflow/`
- Captures d'écran des composants individuels : `audit-artifacts/mobile/`
- Rapport de performance mobile (émulation réseau) : `audit-artifacts/metrics/mobile-metrics.md`
- Données brutes JSON de performance mobile : `audit-artifacts/metrics/mobile-metrics.json`
- Rapport d'analyse de charge de l'API locale : `audit-artifacts/metrics/api-smoke-metrics.md`
- Données brutes JSON de l'API locale : `audit-artifacts/metrics/api-smoke-metrics.json`
- Rapport de sécurité et vulnérabilités des dépendances : `audit-artifacts/security/dependency-audit.md`
- Présentation PowerPoint finale (Performance & Sécurité) : `audit-artifacts/presentation/mydash-performance-security-audit.pptx`

## État de Validation du Parcours Mobile

Le scénario complet de test d'intégration de l'application mobile MyDash a été exécuté avec succès :
- Tableau de bord initial avec devis, factures et statistiques.
- Création d'une fiche client / prospect.
- Ajout de lignes d'articles et création d'un devis.
- Envoi et acceptation du devis par le client.
- Génération automatique de la facture correspondante.
- Enregistrement d'un règlement.
- Retour et mise à jour dynamique du tableau de bord.

Ce parcours a permis de collecter 13 captures d'écran mobiles (390x844) documentant le bon comportement fonctionnel de l'application.

## Constats Clés de Performance Mobile

| Route | Launch (Local) | Launch (3G) | TTFR (Local) | TTFR (3G) | TTI (Local) | TTI (3G) | Transfert | Alertes Console |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` (Tableau de bord) | 50094 ms | 12416 ms | 48532 ms | 10885 ms | 32008 ms | 840 ms | 2.3 Mo | 2 w / 4 e |
| `/companies` | 2181 ms | 12283 ms | 649 ms | 10762 ms | 392 ms | 860 ms | 2.3 Mo | 2 w / 1 e |
| `/quotes` | 2544 ms | 12187 ms | 1022 ms | 10648 ms | 764 ms | 756 ms | 2.3 Mo | 2 w / 1 e |
| `/invoices` | 2303 ms | 12322 ms | 769 ms | 10793 ms | 452 ms | 872 ms | 2.3 Mo | 2 w / 1 e |
| `/organizations` | 2164 ms | 12337 ms | 627 ms | 10803 ms | 376 ms | 816 ms | 2.3 Mo | 2 w / 1 e |

### Interprétation
- **Impact de la latence réseau mobile** : Sous des conditions simulant un réseau 3G mobile typique (1.6 Mbps download, 150ms de latence), l'ouverture d'un écran ou le chargement de l'application prend environ **12 secondes** (`Launch (3G)`). Cela s'explique par la taille du bundle JavaScript non minifié de développement (2.3 Mo) transféré au démarrage.
- **Indicateurs de démarrage local** : En local non bridé, le premier accès à l'application prend ~50 secondes en raison du processus de compilation à chaud (Hot Compilation) initié par le serveur de développement Metro. Une fois compilés, les écrans suivants se chargent en environ 2 secondes. En production (avec un bundle compilé et minifié à l'avance), ce délai de compilation Metro disparaîtra totalement.
- **Performance de la base de données et de l'API** : Les temps de réponse de l'API restent extrêmement rapides (entre 11 ms et 115 ms selon les routes et le réseau), confirmant que la base de données PostgreSQL locale et drizzle-orm ne sont en aucun cas la cause du ralentissement.
- **Avertissements et erreurs de rendu** : Nous observons des erreurs de conversion de couleur `colorKit.RGB` récurrentes à chaque affichage de données financières, ainsi que des alertes de dépréciation de styles React Native (`pointerEvents` et propriétés d'ombrage `shadow*`).

## Analyse des Performances API (Smoke Tests)

Tous les appels de test sur l'API d'authentification et de données ont retourné un code HTTP 200 sans aucun échec sur 20 itérations mesurées pour chaque route :

| Point de terminaison | Temps moyen | Percentile 95 | Temps Max |
| --- | ---: | ---: | ---: |
| `health` | 0.5 ms | 1.0 ms | 1.2 ms |
| `dashboard_stats` | 3.2 ms | 5.1 ms | 6.2 ms |
| `companies_list` | 3.0 ms | 5.7 ms | 8.3 ms |
| `quotes_list` | 8.2 ms | 24.0 ms | 76.0 ms |
| `invoices_list` | 2.5 ms | 4.2 ms | 5.3 ms |

## Analyse de Sécurité des Dépendances

Tous les audits automatisés des packages (`pnpm audit`) sont passés à 100% avec zéro vulnérabilité après l'application de correctifs et de résolutions de versions ciblées :

| Périmètre | Infos | Faible | Modéré | Élevé | Critique |
| --- | ---: | ---: | ---: | ---: | ---: |
| Backend (Production) | 0 | 0 | 0 | 0 | 0 |
| Backend (Complet) | 0 | 0 | 0 | 0 | 0 |
| Frontend (Production) | 0 | 0 | 0 | 0 | 0 |
| Frontend (Complet) | 0 | 0 | 0 | 0 | 0 |

Correctifs notables appliqués via des résolutions forcées :
- Backend : `qs`, `brace-expansion`, `esbuild`.
- Frontend : `postcss`, `brace-expansion`, `ws`, `uuid`.

## Validations Techniques et Qualité

- Lancement de la stack Docker mobile : OK.
- Vérification des types TypeScript du Backend : OK (zéro erreur).
- Suite de tests unitaires Backend : OK (`614` tests passés avec succès).
- Analyse statique Frontend (linter) : OK (zéro avertissement, zéro erreur).
- Test d'intégration Frontend : OK (test unitaire validé).
- Validation graphique et fonctionnelle : OK (parcours utilisateur fluide avec génération des 13 captures d'écran mobiles).

## Prochaines Étapes
1. Moderniser le helper de test du frontend pour éliminer les avertissements de dépréciation liés à `react-test-renderer` sous React 19.
2. Remplacer la bibliothèque `colorKit` obsolète par une gestion statique simple des couleurs de badges pour éliminer les crashs visuels de rendu.
3. Surveiller les correctifs de sécurité amont (upstream) d'Expo et d'Express afin de supprimer les overrides temporaires dès que possible.
