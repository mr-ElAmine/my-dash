# MyDash Backend — Architecture

## Stack technique

| Composant       | Technologie   |
| --------------- | ------------- |
| Langage         | TypeScript    |
| Runtime         | Node.js       |
| HTTP framework  | Express       |
| ORM             | Drizzle ORM   |
| Base de données | PostgreSQL    |
| Authentification| JWT           |
| Validation      | Zod           |
| Génération PDF  | PDFKit        |
| Tests           | Vitest        |
| IDs             | CUID strings  |

---

## Flux MVC

Le flux obligatoire est :

```txt
routes
  → controllers
  → services
  → repositories
  → db/schema
  → PostgreSQL
```

Ne jamais sauter de couche.

---

## Responsabilités par couche

| Couche          | Responsabilité                                        |
| --------------- | ----------------------------------------------------- |
| `routes/`       | Déclarer les endpoints HTTP uniquement                |
| `controllers/`  | Lire `req`, appeler les services, retourner `res`     |
| `services/`     | Logique métier et orchestration                       |
| `repositories/` | Requêtes Drizzle uniquement                           |
| `db/schema/`    | Définition des tables Drizzle et types inférés        |
| `validators/`   | Schémas de validation Zod                             |
| `middlewares/`  | Auth, accès organisation, rôles, validation, erreurs  |
| `utils/`        | Fonctions pures réutilisables                         |
| `errors/`       | Classe d'erreur applicative                           |

---

## Interdictions par couche

### Routes ne doivent pas contenir

- logique métier
- requêtes base de données
- génération PDF
- envoi d'emails
- calculs monétaires

### Controllers ne doivent pas

- interroger Drizzle directement
- calculer des totaux
- générer des PDF directement
- envoyer des emails directement
- hasher des mots de passe directement
- signer des JWT directement
- contenir des workflows métier

### Services ne doivent pas

- manipuler `req` ou `res` Express directement
- définir des routes
- définir des schémas SQL

### Repositories ne doivent pas

- imposer des workflows métier complexes
- envoyer des emails
- générer des PDF
- lire des objets request Express
- valider des body HTTP

---

## Structure des dossiers

```txt
src/
  app.ts
  server.ts

  config/
    env.ts
    cors.ts

  db/
    client.ts

    schema/
      index.ts
      enums.ts
      organizations.schema.ts
      users.schema.ts
      organization-members.schema.ts
      organization-invites.schema.ts
      companies.schema.ts
      contacts.schema.ts
      quotes.schema.ts
      quote-items.schema.ts
      invoices.schema.ts
      invoice-items.schema.ts
      payments.schema.ts
      notes.schema.ts
      note-links.schema.ts
    migrations/

  routes/
    index.routes.ts
    auth.routes.ts
    organizations.routes.ts
    organization-invites.routes.ts
    companies.routes.ts
    contacts.routes.ts
    quotes.routes.ts
    quote-items.routes.ts
    invoices.routes.ts
    invoice-items.routes.ts
    payments.routes.ts
    notes.routes.ts

  controllers/
    auth.controller.ts
    organizations.controller.ts
    organization-invites.controller.ts
    companies.controller.ts
    contacts.controller.ts
    quotes.controller.ts
    quote-items.controller.ts
    invoices.controller.ts
    invoice-items.controller.ts
    payments.controller.ts
    notes.controller.ts

  services/
    auth.service.ts
    organizations.service.ts
    organization-invites.service.ts
    companies.service.ts
    contacts.service.ts
    quotes.service.ts
    quote-items.service.ts
    invoices.service.ts
    invoice-items.service.ts
    payments.service.ts
    notes.service.ts
    pdf.service.ts
    quote-pdf.service.ts
    invoice-pdf.service.ts
    mail.service.ts
    mail-templates.service.ts
    jwt.service.ts
    password.service.ts

  repositories/
    users.repository.ts
    organizations.repository.ts
    organization-members.repository.ts
    organization-invites.repository.ts
    companies.repository.ts
    contacts.repository.ts
    quotes.repository.ts
    quote-items.repository.ts
    invoices.repository.ts
    invoice-items.repository.ts
    payments.repository.ts
    notes.repository.ts
    note-links.repository.ts

  validators/
    auth.validators.ts
    organizations.validators.ts
    organization-invites.validators.ts
    companies.validators.ts
    contacts.validators.ts
    quotes.validators.ts
    quote-items.validators.ts
    invoices.validators.ts
    payments.validators.ts
    notes.validators.ts

  middlewares/
    auth.middleware.ts
    organization-access.middleware.ts
    role.middleware.ts
    validate.middleware.ts
    error.middleware.ts

  errors/
    app-error.ts

  utils/
    cuid.ts
    money.ts
    dates.ts
    snapshots.ts
    pagination.ts

tests/
  setup.ts
  fixtures/
  mocks/
    db.mock.ts
    jwt.service.mock.ts
    password.service.mock.ts
    mail.service.mock.ts
    pdf.service.mock.ts
    repositories/
  unit/
    utils/
    services/
  integration/
    repositories/
  e2e/
```

---

## Dossiers interdits

Ne pas créer :

- `modules/`
- `features/`
- `models/entities/`
- `jobs/`
- `shared/types/`
- un fichier d'erreur par type d'erreur

---

## Flux métier principal

```txt
Company / Contact
  → Quote (draft)
  → Quote items ajoutés
  → Quote sent (snapshots créés, lignes verrouillées)
  → Quote accepted
      → Invoice générée
      → Quote items clonés en invoice items
      → Company passe en customer
  → Invoice sent (PDF généré, email envoyé)
  → Payment enregistré
  → Invoice paid
```

---

## Middlewares

### `auth.middleware.ts`

- lire `Authorization: Bearer <token>`
- vérifier le JWT
- attacher le contexte utilisateur à la requête

### `organization-access.middleware.ts`

- vérifier que l'utilisateur authentifié appartient à l'organisation demandée
- rejeter avec `403` si accès non autorisé

### `role.middleware.ts`

- restreindre les actions sensibles à `owner` ou `admin`

### `validate.middleware.ts`

- valider body, params et query avec Zod

### `error.middleware.ts`

- convertir les erreurs lancées en réponses HTTP JSON

---

## Services transversaux

### Auth

| Service                | Responsabilité            |
| ---------------------- | ------------------------- |
| `jwt.service.ts`       | Signer et vérifier les JWT |
| `password.service.ts`  | Hasher et vérifier les mots de passe |
| `auth.service.ts`      | Orchestration auth (register, login, me) |

### PDF

| Service                     | Responsabilité                          |
| --------------------------- | --------------------------------------- |
| `pdf.service.ts`            | Helpers PDF bas niveau (document, layout, table, texte) |
| `quote-pdf.service.ts`      | Générer les PDF devis (`DEV-YYYY-XXX.pdf`) |
| `invoice-pdf.service.ts`    | Générer les PDF factures (`FAC-YYYY-XXX.pdf`) |

### Email

| Service                        | Responsabilité                    |
| ------------------------------ | --------------------------------- |
| `mail.service.ts`              | Envoyer les emails (invitations, devis, factures) |
| `mail-templates.service.ts`    | Générer les HTML des emails       |

### Utils

| Util             | Responsabilité                                    |
| ---------------- | ------------------------------------------------- |
| `cuid.ts`        | Générer des IDs CUID                              |
| `money.ts`       | Calculs HT, TVA, TTC, restant, formatage cents    |
| `dates.ts`       | Helpers de dates                                  |
| `snapshots.ts`   | Créer les snapshots client et émetteur            |
| `pagination.ts`  | Logique de pagination                             |

---

## Erreurs

Utiliser uniquement :

```ts
throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
```

Ne pas créer de classes d'erreur séparées.

Réponse JSON attendue :

```json
{
  "error": {
    "code": "QUOTE_NOT_FOUND",
    "message": "Quote not found"
  }
}
```

Codes HTTP utilisés :

```txt
400 bad request
401 unauthenticated
403 forbidden
404 not found
409 conflict
422 validation error
500 internal error
```
