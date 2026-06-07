# Documentation technique MyDash

Cette documentation permet à un développeur de récupérer le projet, lancer son environnement, comprendre l'architecture et contribuer sans devoir analyser tout le dépôt.

## Le projet

MyDash est composé de deux applications :

```text
frontend/   Application Expo / React Native
backend/    API Express / TypeScript
```

Le développement local utilise également :

```text
PostgreSQL  Base de données
Adminer     Administration de la base
Mailpit     Serveur SMTP local
```

## Parcours de lecture recommandé

1. [Installer les prérequis](demarrage/prerequis.md).
2. [Lancer l'environnement de développement](demarrage/environnement.md).
3. Lire la [vue d'ensemble de l'architecture](architecture/vue-ensemble.md).
4. Consulter les règles du [backend](architecture/backend.md) et du [frontend](architecture/frontend.md).
5. Lire la stratégie de [tests](qualite/tests.md).
6. Comprendre la [CI](livraison/ci.md) et le [déploiement](livraison/deploiement.md).
7. Respecter le [workflow de contribution](contribution/workflow.md).

## Stack principale

| Domaine | Technologies |
| --- | --- |
| Frontend | Expo 54, React Native 0.81, React 19, Expo Router |
| Données frontend | TanStack Query, Zustand, Axios |
| Formulaires | React Hook Form, Zod |
| Backend | Node.js, Express 5, TypeScript |
| Données backend | PostgreSQL 17, Drizzle ORM |
| Tests | Vitest, Supertest |
| CI/CD | GitHub Actions, Render |
