# Déploiement

Le déploiement est défini dans :

```text
.github/workflows/deploy.yml
```

## Déclenchement

Un push sur `main` déclenche le workflow `Deploy to Production`.

## Backend

Le backend est déployé sur Render.

GitHub Actions n'effectue pas le build lui-même. Il appelle un deploy hook Render :

```text
GitHub push main
  -> GitHub Actions
  -> POST RENDER_DEPLOY_HOOK
  -> Render démarre son propre déploiement
```

Le secret GitHub nécessaire est :

```text
RENDER_DEPLOY_HOOK
```

Les commandes de build, le répertoire racine, les variables d'environnement et la commande de démarrage du service sont configurés dans le tableau de bord Render. Ils ne sont pas décrits dans le dépôt.

Pour vérifier un déploiement :

1. ouvrir l'action GitHub `Deploy to Production` ;
2. vérifier que l'appel du hook réussit ;
3. ouvrir le service dans Render ;
4. contrôler les logs du build et du démarrage ;
5. appeler l'endpoint `/health`.

## Frontend

Aucun workflow de déploiement frontend n'est présent dans le dépôt.

Le dépôt ne permet donc pas de déterminer :

- la plateforme de production du frontend ;
- la commande de build utilisée ;
- le processus de publication iOS ou Android ;
- l'URL de production.

Cette partie doit être ajoutée à la CI/CD lorsque la cible de déploiement est choisie.

## Base de données

`infrastructure/prod/docker-compose.yml` décrit un conteneur PostgreSQL 17 avec volume persistant.

Ce fichier ne déploie ni le backend ni le frontend et n'est pas référencé par le workflow GitHub Actions.

La base réellement utilisée par Render doit être configurée avec `DATABASE_URL` dans Render.

## Variables backend attendues

```text
NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
```

## Mise en production

Avant un merge sur `main` :

1. faire passer la CI sur la pull request ;
2. vérifier les migrations ;
3. valider les variables Render ;
4. merger vers `main` ;
5. surveiller GitHub Actions puis Render ;
6. effectuer un smoke test de l'API.
