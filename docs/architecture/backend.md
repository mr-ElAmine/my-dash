# Architecture backend

## Flux obligatoire

```text
routes
  -> controllers
  -> services
  -> repositories
  -> db/schema
  -> PostgreSQL
```

Une nouvelle fonctionnalité doit respecter ce flux. Il ne faut pas accéder à Drizzle depuis une route ou un controller.

## Responsabilité des couches

### Routes

Les routes :

- définissent la méthode et le chemin ;
- branchent les middlewares ;
- appellent un controller.

Elles ne contiennent ni logique métier ni requête SQL.

### Controllers

Les controllers :

- lisent la requête validée ;
- appellent un service ;
- construisent la réponse HTTP.

Ils ne calculent pas les totaux et n'interrogent pas la base.

### Services

Les services portent :

- les règles métier ;
- les transitions de statut ;
- l'orchestration entre repositories ;
- la génération de documents ou l'envoi d'e-mails via des services spécialisés.

Ils ne manipulent pas directement `req` ou `res`.

### Repositories

Les repositories contiennent exclusivement les opérations Drizzle :

- lecture ;
- insertion ;
- mise à jour ;
- transaction ;
- pagination.

### Validators

Les validators Zod décrivent les paramètres, queries et bodies acceptés par l'API.

### Middlewares

Les middlewares communs gèrent :

- le bearer token ;
- l'accès à une organisation ;
- les rôles ;
- la validation ;
- la transformation des erreurs.

## Ajouter une fonctionnalité

Pour ajouter une ressource :

1. définir ou modifier le schéma Drizzle ;
2. créer le repository ;
3. écrire le service métier ;
4. créer le validator ;
5. créer le controller ;
6. déclarer la route et ses middlewares ;
7. ajouter les tests unitaires et end-to-end.

## Conventions

- TypeScript strict est activé.
- L'alias `@/*` cible `src/*`.
- Les fonctions monétaires communes vivent dans `utils/money.ts`.
- Les erreurs applicatives utilisent `AppError`.
- Les types de tables sont inférés depuis Drizzle.
