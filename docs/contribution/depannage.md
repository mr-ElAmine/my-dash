# Dépannage

## PostgreSQL ne démarre pas

```bash
docker compose -f infrastructure/dev/docker-compose.yml ps
docker compose -f infrastructure/dev/docker-compose.yml logs postgres
```

Vérifier que le port `5432` n'est pas déjà utilisé.

## Le backend s'arrête au lancement

Les variables backend sont validées au démarrage. Vérifier :

```text
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
PORT
```

Puis relancer :

```bash
cd backend
pnpm dev
```

## La base n'a pas les bonnes tables

```bash
cd backend
pnpm db:push:raw
```

Pour réinjecter les données locales :

```bash
pnpm db:seed
```

## Le frontend ne joint pas le backend

Vérifier :

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Depuis un téléphone physique, remplacer `localhost` par l'adresse IP locale de la machine.

## Les e-mails n'apparaissent pas

Vérifier que Mailpit fonctionne :

```text
http://localhost:8025
```

Configuration backend locale :

```dotenv
SMTP_HOST=localhost
SMTP_PORT=1025
```

## Une pull request échoue en CI

Reproduire les étapes de la CI :

```bash
cd backend
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
```

La CI utilise Node.js 20, pnpm 10 et PostgreSQL 16.

## Le déploiement ne démarre pas

Vérifier :

1. que le workflow GitHub a été déclenché par `main` ;
2. que le secret `RENDER_DEPLOY_HOOK` existe ;
3. que le hook Render est toujours valide ;
4. les logs du service dans Render.
