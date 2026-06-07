# Intégration continue

La CI est définie dans :

```text
.github/workflows/ci.yml
```

## Déclenchement

Le workflow s'exécute sur les pull requests ciblant :

- `develop` ;
- `main`.

## Job actuel

Un seul job est configuré : `backend-checks`.

Il utilise :

- Ubuntu latest ;
- Node.js 20 ;
- pnpm 10 ;
- PostgreSQL 16 comme service GitHub Actions.

Étapes :

```text
checkout
-> installation pnpm
-> installation Node
-> pnpm install --frozen-lockfile
-> pnpm run typecheck
-> pnpm run test
```

La base de test est disponible sur :

```text
postgresql://test:test@localhost:5432/mydash_test
```

## Ce que la CI vérifie

- installation reproductible depuis le lockfile backend ;
- compilation TypeScript logique via `tsc --noEmit` ;
- suite de tests backend.

## Limites actuelles

Malgré son nom `Backend Lint + Typecheck + Tests`, le job n'exécute pas `pnpm lint`.

La CI ne vérifie actuellement pas :

- le lint backend ;
- le frontend ;
- le build d'une application distribuable ;
- les migrations sur une base vide.

Ces étapes doivent être ajoutées au workflow pour rendre la validation complète.

## Branches

Le fonctionnement attendu est :

```text
branche de fonctionnalité
  -> pull request vers develop
  -> CI
  -> intégration
  -> pull request vers main
  -> CI
  -> déploiement après merge
```
