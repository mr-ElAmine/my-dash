# MyDash Backend — API Response Format

## Convention

Pas de versioning API.

```txt
/api/auth/register
/api/organizations
/api/organizations/:organizationId/companies
```

Ne pas utiliser `/api/v1/...`.

---

## Authentification

Les routes protégées nécessitent :

```txt
Authorization: Bearer <access_token>
```

Les routes publiques n'envoient pas de token.

---

## Format de réponse succès

### Objet unique

```json
{
  "data": {
    "id": "clx123abc",
    "email": "user@email.com",
    "firstName": "Jean"
  }
}
```

Status HTTP : `200` ou `201`

### Liste paginée

```json
{
  "data": [
    { "id": "clx123abc", "name": "Acme" },
    { "id": "clx456def", "name": "Beta Corp" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

Status HTTP : `200`

### Création avec deux entités

Quand une action crée plusieurs entités liées :

```json
{
  "data": {
    "organization": { "id": "clx123", "name": "My Org" },
    "membership": { "id": "clx456", "role": "owner" }
  }
}
```

Status HTTP : `201`

### Action simple

```json
{
  "data": {
    "success": true
  }
}
```

Status HTTP : `200`

---

## Format de réponse erreur

### Erreur standard

```json
{
  "error": {
    "code": "QUOTE_NOT_FOUND",
    "message": "Quote not found"
  }
}
```

### Erreur de validation Zod

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email" },
      { "field": "name", "message": "Name is required" }
    ]
  }
}
```

Status HTTP : `422`

---

## Codes HTTP

| Code | Usage                                |
| ---- | ------------------------------------ |
| `200`| Succès (GET, PATCH, actions)         |
| `201`| Ressource créée (POST)               |
| `400`| Requête invalide                     |
| `401`| Non authentifié                      |
| `403`| Accès interdit (mauvais rôle)        |
| `404`| Ressource non trouvée                |
| `409`| Conflit (doublon, état invalide)     |
| `422`| Erreur de validation                 |
| `500`| Erreur interne du serveur            |

---

## Codes d'erreur

Utiliser des codes clairs en majuscules avec underscores.

### Auth

| Code                    | HTTP | Description                          |
| ----------------------- | ---- | ------------------------------------ |
| `INVALID_CREDENTIALS`   | 401  | Email ou mot de passe incorrect      |
| `TOKEN_EXPIRED`         | 401  | JWT expiré                           |
| `TOKEN_INVALID`         | 401  | JWT invalide                         |
| `UNAUTHORIZED`          | 401  | Authentification requise             |
| `USER_DISABLED`         | 401  | Utilisateur désactivé                |
| `EMAIL_ALREADY_EXISTS`  | 409  | Email déjà utilisé                   |
| `VALIDATION_ERROR`      | 422  | Erreur de validation Zod             |

### Organizations

| Code                            | HTTP | Description                                |
| ------------------------------- | ---- | ------------------------------------------ |
| `ORGANIZATION_NOT_FOUND`        | 404  | Organisation non trouvée                   |
| `ORGANIZATION_ACCESS_DENIED`    | 403  | Pas membre de cette organisation           |
| `ORGANIZATION_ARCHIVED`         | 409  | Organisation archivée                      |
| `MEMBER_NOT_FOUND`              | 404  | Membre non trouvé                          |
| `MEMBER_ALREADY_EXISTS`         | 409  | Déjà membre actif                          |
| `CANNOT_REMOVE_OWNER`           | 409  | Impossible de retirer le owner             |
| `CANNOT_CHANGE_OWNER_ROLE`      | 409  | Impossible de changer le rôle du owner     |

### Invitations

| Code                              | HTTP | Description                                |
| --------------------------------- | ---- | ------------------------------------------ |
| `INVITE_NOT_FOUND`                | 404  | Invitation non trouvée                     |
| `INVITE_EXPIRED`                  | 409  | Invitation expirée                         |
| `INVITE_REVOKED`                  | 409  | Invitation révoquée                        |
| `INVITE_ALREADY_ACCEPTED`         | 409  | Invitation déjà acceptée                   |
| `INVITE_PENDING_EXISTS`           | 409  | Invitation pending existe déjà             |
| `CANNOT_INVITE_SELF`              | 409  | Impossible de s'inviter soi-même           |

### Companies

| Code                      | HTTP | Description                    |
| ------------------------- | ---- | ------------------------------ |
| `COMPANY_NOT_FOUND`       | 404  | Entreprise non trouvée         |
| `COMPANY_ARCHIVED`        | 409  | Entreprise archivée            |

### Contacts

| Code                      | HTTP | Description                    |
| ------------------------- | ---- | ------------------------------ |
| `CONTACT_NOT_FOUND`       | 404  | Contact non trouvé             |
| `CONTACT_ARCHIVED`        | 409  | Contact archivé                |

### Quotes

| Code                          | HTTP | Description                              |
| ----------------------------- | ---- | ---------------------------------------- |
| `QUOTE_NOT_FOUND`             | 404  | Devis non trouvé                         |
| `QUOTE_NOT_EDITABLE`          | 409  | Devis non modifiable (pas en draft)      |
| `QUOTE_NOT_SENDABLE`          | 409  | Devis ne peut pas être envoyé            |
| `QUOTE_NOT_ACCEPTABLE`        | 409  | Devis ne peut pas être accepté           |
| `QUOTE_NOT_REFUSABLE`         | 409  | Devis ne peut pas être refusé            |
| `QUOTE_NOT_CANCELLABLE`       | 409  | Devis ne peut pas être annulé            |
| `QUOTE_HAS_INVOICE`           | 409  | Devis a déjà une facture associée        |

### Quote Items

| Code                          | HTTP | Description                              |
| ----------------------------- | ---- | ---------------------------------------- |
| `QUOTE_ITEM_NOT_FOUND`        | 404  | Ligne de devis non trouvée               |
| `QUOTE_NOT_DRAFT`             | 409  | Le devis n'est pas en draft              |

### Invoices

| Code                              | HTTP | Description                              |
| --------------------------------- | ---- | ---------------------------------------- |
| `INVOICE_NOT_FOUND`               | 404  | Facture non trouvée                      |
| `INVOICE_NOT_SENDABLE`            | 409  | Facture ne peut pas être envoyée         |
| `INVOICE_NOT_CANCELLABLE`         | 409  | Facture ne peut pas être annulée         |
| `INVOICE_ALREADY_HAS_PAYMENTS`    | 409  | Facture avec paiements existants         |

### Invoice Items

| Code                          | HTTP | Description                              |
| ----------------------------- | ---- | ---------------------------------------- |
| `INVOICE_ITEM_NOT_FOUND`      | 404  | Ligne de facture non trouvée             |

### Payments

| Code                                    | HTTP | Description                                    |
| --------------------------------------- | ---- | ---------------------------------------------- |
| `PAYMENT_NOT_FOUND`                     | 404  | Paiement non trouvé                            |
| `PAYMENT_EXCEEDS_REMAINING_AMOUNT`      | 409  | Montant supérieur au restant dû                |
| `PAYMENT_ALREADY_CANCELLED`             | 409  | Paiement déjà annulé                           |
| `PAYMENT_NOT_CANCELLABLE`               | 409  | Paiement ne peut pas être annulé               |

### Notes

| Code                    | HTTP | Description                    |
| ----------------------- | ---- | ------------------------------ |
| `NOTE_NOT_FOUND`        | 404  | Note non trouvée               |
| `INVALID_TARGET_TYPE`   | 422  | Type de cible invalide         |
| `TARGET_NOT_FOUND`      | 404  | Entité cible non trouvée       |
| `DUPLICATE_NOTE_LINK`   | 409  | Lien déjà existant             |

---

## Pagination

### Paramètres query

| Param   | Type   | Défaut | Description                    |
| ------- | ------ | ------ | ------------------------------ |
| `page`  | number | 1      | Numéro de page                 |
| `limit` | number | 20     | Nombre d'éléments par page     |

### Réponse pagination

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

La pagination est gérée par `utils/pagination.ts`.

Ne pas réimplémenter la logique de pagination dans chaque controller.

---

## PDF

Les endpoints PDF retournent le fichier directement :

```txt
Content-Type: application/pdf
Content-Disposition: attachment; filename="DEV-2025-001.pdf"
```

Status HTTP : `200`

---

## Filtres de liste communs

| Param      | Type   | Description                          |
| ---------- | ------ | ------------------------------------ |
| `page`     | number | Numéro de page                       |
| `limit`    | number | Éléments par page                    |
| `status`   | string | Filtrer par statut                   |
| `search`   | string | Recherche textuelle                  |

Filtres spécifiques par ressource :

| Resource   | Filtres supplémentaires                                |
| ---------- | ------------------------------------------------------ |
| Companies  | `city`, `industry`                                     |
| Contacts   | `companyId`                                            |
| Quotes     | `companyId`, `contactId`                               |
| Invoices   | `companyId`, `contactId`                               |
| Notes      | `targetType`, `targetId`                               |
| Members    | `role`                                                 |
| Invites    | `status`                                               |
