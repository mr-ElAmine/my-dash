# Environnement de développement

Le compose de développement lance uniquement les services d'infrastructure :

- PostgreSQL ;
- Adminer ;
- Mailpit.

Le backend et le frontend restent des processus locaux en mode développement.

## 1. Lancer les conteneurs

Depuis la racine :

```bash
docker compose -f infrastructure/dev/docker-compose.yml up -d
```

Vérifier leur état :

```bash
docker compose -f infrastructure/dev/docker-compose.yml ps
```

| Service | Image | Adresse |
| --- | --- | --- |
| PostgreSQL | `postgres:17-alpine` | `localhost:5432` |
| Adminer | `adminer` | `http://localhost:8080` |
| Mailpit SMTP | `axllent/mailpit` | `localhost:1025` |
| Mailpit UI | `axllent/mailpit` | `http://localhost:8025` |

Connexion PostgreSQL locale :

```text
Database: mydash_dev
User:     mydash
Password: mydash
```

Ces identifiants sont réservés au développement local.

## 2. Configurer le backend

```bash
cd backend
cp .env.example .env
```

Configuration locale :

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://mydash:mydash@localhost:5432/mydash_dev
JWT_SECRET=change-me-locally
JWT_EXPIRES_IN=86400
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@mydash.local
```

Initialiser la base puis lancer l'API :

```bash
pnpm db:push:raw
pnpm db:seed
pnpm dev
```

L'API répond sur :

```text
http://localhost:3000
```

## 3. Configurer le frontend

Dans un second terminal :

```bash
cd frontend
```

Créer ou adapter `.env` :

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Lancer la cible souhaitée :

```bash
pnpm web
pnpm android
pnpm ios
```

## 4. Arrêter l'infrastructure

```bash
docker compose -f infrastructure/dev/docker-compose.yml stop
```

Pour supprimer également la base locale :

```bash
docker compose -f infrastructure/dev/docker-compose.yml down -v
```
