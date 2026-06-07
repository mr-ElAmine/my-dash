# Commandes utiles

## Backend

Depuis `backend/` :

| Commande | Action |
| --- | --- |
| `pnpm dev` | Lance l'API avec rechargement automatique |
| `pnpm start` | Lance l'API sans mode watch |
| `pnpm typecheck` | Vérifie les types TypeScript |
| `pnpm lint` | Exécute ESLint sur `src/` |
| `pnpm check` | Typecheck puis lint |
| `pnpm test` | Exécute tous les tests Vitest |
| `pnpm test:watch` | Exécute Vitest en mode watch |
| `pnpm test:coverage` | Génère la couverture |

## Base de données

| Commande | Action |
| --- | --- |
| `pnpm db:generate` | Génère une migration Drizzle |
| `pnpm db:migrate` | Applique les migrations |
| `pnpm db:push` | Synchronise le schéma avec Drizzle Kit |
| `pnpm db:push:raw` | Applique le schéma avec le script du projet |
| `pnpm db:studio` | Ouvre Drizzle Studio |
| `pnpm db:seed` | Injecte les données de développement |
| `pnpm db:clean` | Nettoie les données de la base ciblée |

Toujours vérifier `DATABASE_URL` avant une commande destructive.

## Frontend

Depuis `frontend/` :

| Commande | Action |
| --- | --- |
| `pnpm start` | Ouvre le serveur de développement Expo |
| `pnpm web` | Lance l'application web |
| `pnpm android` | Lance la cible Android |
| `pnpm ios` | Lance la cible iOS |
| `pnpm lint` | Exécute la configuration ESLint Expo |
| `pnpm test` | Exécute Vitest |
| `pnpm test:watch` | Exécute Vitest en mode watch |

## Docker

```bash
docker compose -f infrastructure/dev/docker-compose.yml up -d
docker compose -f infrastructure/dev/docker-compose.yml logs -f
docker compose -f infrastructure/dev/docker-compose.yml stop
docker compose -f infrastructure/dev/docker-compose.yml down
```
