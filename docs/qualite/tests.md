# Tests

## État actuel

Le dépôt contient :

| Application | Fichiers de tests |
| --- | ---: |
| Backend | 89 |
| Frontend | 1 |

Répartition backend :

| Catégorie | Fichiers |
| --- | ---: |
| Unitaires | 28 |
| End-to-end | 61 |

Le dernier passage complet validé du backend exécutait 614 tests.

## Backend

Vitest utilise :

```text
tests/**/*.test.ts
```

La configuration :

- utilise l'environnement Node ;
- charge `tests/setup.ts` ;
- exécute les tests dans des processus `forks`.

### Tests unitaires

Ils couvrent principalement :

- les services ;
- les validators ;
- les fonctions utilitaires.

Ils utilisent les mocks situés dans `tests/mocks/`.

### Tests end-to-end

Ils couvrent les routes par domaine :

- authentification ;
- organisations et invitations ;
- entreprises et contacts ;
- devis et lignes ;
- factures et lignes ;
- paiements ;
- notes.

## Frontend

Le frontend utilise Vitest avec les fichiers :

```text
*.test.ts
*.test.tsx
```

La couverture frontend est actuellement limitée à un test de hook. Toute nouvelle logique métier frontend devrait être accompagnée de tests ciblés.

## Commandes

Backend :

```bash
cd backend
pnpm test
pnpm test:watch
pnpm test:coverage
```

Frontend :

```bash
cd frontend
pnpm test
pnpm test:watch
```

## Avant une pull request

Exécuter au minimum :

```bash
cd backend
pnpm typecheck
pnpm test

cd ../frontend
pnpm lint
pnpm test
```
