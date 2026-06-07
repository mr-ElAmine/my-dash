# Vue d'ensemble

## Composants

```text
Frontend Expo / React Native
        |
        | HTTP JSON + JWT
        v
Backend Express / TypeScript
        |
        | Drizzle ORM
        v
PostgreSQL
```

Le frontend ne communique jamais directement avec PostgreSQL. Toutes les règles métier et tous les contrôles d'accès sont exécutés par le backend.

## Organisation du dépôt

```text
frontend/
  app/          Écrans et navigation
  components/   Composants partagés
  hooks/        Queries et mutations
  services/     Appels HTTP
  stores/       État global client

backend/
  src/routes/
  src/controllers/
  src/services/
  src/repositories/
  src/db/schema/
  src/validators/
  src/middlewares/
  tests/
```

## Flux d'une requête

```text
Écran
  -> hook frontend
  -> service Axios
  -> route Express
  -> controller
  -> service métier
  -> repository
  -> PostgreSQL
```

## Principes du projet

- L'API est la seule porte d'entrée vers les données.
- Les responsabilités sont séparées par couches.
- Les entrées HTTP sont validées avec Zod.
- Les données serveur sont chargées par TanStack Query.
- L'état global frontend est limité à la session et à l'organisation courante.
- Les montants financiers sont stockés en centimes entiers.
- Les identifiants sont des CUID.
