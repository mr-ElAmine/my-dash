# Workflow de développement

## Créer une branche

Partir de `develop` pour une fonctionnalité :

```bash
git switch develop
git pull
git switch -c feat/nom-fonctionnalite
```

Préfixes conseillés :

```text
feat/
fix/
refactor/
test/
docs/
chore/
```

## Développer une fonctionnalité backend

Respecter l'ordre :

1. schéma et migration si nécessaire ;
2. repository ;
3. service ;
4. validator ;
5. controller ;
6. route ;
7. tests.

Ne pas créer une seconde architecture parallèle. Utiliser les dossiers et conventions existants.

## Développer une fonctionnalité frontend

1. service HTTP ;
2. hook de query ou mutation ;
3. écran Expo Router ;
4. composants partagés ;
5. états de chargement, vide et erreur ;
6. tests ciblés.

## Vérifications locales

```bash
cd backend
pnpm typecheck
pnpm lint
pnpm test

cd ../frontend
pnpm lint
pnpm test
```

## Pull request

Une pull request doit préciser :

- le besoin traité ;
- les changements de données ou d'API ;
- les migrations éventuelles ;
- les tests exécutés ;
- les impacts de déploiement.

La CI s'exécute automatiquement pour une pull request vers `develop` ou `main`.

## Passage en production

Le merge ou push sur `main` déclenche le hook de déploiement Render du backend.

Ne pas merger vers `main` si :

- les tests échouent ;
- une migration n'est pas vérifiée ;
- les variables nécessaires ne sont pas disponibles ;
- le changement frontend dépend d'un backend non encore déployé.
