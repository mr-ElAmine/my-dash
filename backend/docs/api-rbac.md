# MyDash Backend — API RBAC (Role-Based Access Control)

## Roles

| Role            | Description                             |
| --------------- | --------------------------------------- |
| `public`        | Pas d'authentification requise          |
| `authenticated` | Utilisateur connecté avec JWT           |
| `owner`         | Propriétaire de l'organisation          |
| `admin`         | Administrateur de l'organisation        |
| `member`        | Membre simple de l'organisation         |

---

## Hiérarchie des permissions

```txt
owner > admin > member
```

Un `owner` peut faire tout ce qu'un `admin` peut faire.
Un `admin` peut faire tout ce qu'un `member` peut faire.

---

## Authentification

Les routes protégées nécessitent :

```txt
Authorization: Bearer <access_token>
```

Les routes marquées `public` ne nécessitent pas d'authentification.

---

## Vérification d'accès organisation

Pour les routes liées à une organisation, toujours vérifier :

```txt
organization_members.status = active
```

Un utilisateur qui n'est pas membre actif de l'organisation ne doit pas pouvoir accéder à ses ressources.

---

## Matrice RBAC par route

### `auth.routes.ts`

| Endpoint                   | Rôle minimum    |
| -------------------------- | --------------- |
| `POST /api/auth/register`  | `public`        |
| `POST /api/auth/login`     | `public`        |
| `GET /api/auth/me`         | `authenticated` |
| `POST /api/auth/logout`    | `authenticated` |

---

### `organizations.routes.ts` — Organizations

| Endpoint                                              | Rôle minimum    |
| ----------------------------------------------------- | --------------- |
| `GET /api/organizations`                              | `authenticated` |
| `POST /api/organizations`                             | `authenticated` |
| `GET /api/organizations/:organizationId`              | `member`        |
| `PATCH /api/organizations/:organizationId`            | `admin`         |
| `POST /api/organizations/:organizationId/archive`     | `owner`         |
| `POST /api/organizations/:organizationId/restore`     | `owner`         |

---

### `organizations.routes.ts` — Members

| Endpoint                                                              | Rôle minimum |
| --------------------------------------------------------------------- | ------------ |
| `GET /api/organizations/:organizationId/members`                      | `admin`      |
| `GET /api/organizations/:organizationId/members/:memberId`            | `admin`      |
| `PATCH /api/organizations/:organizationId/members/:memberId/role`     | `owner`      |
| `POST /api/organizations/:organizationId/members/:memberId/remove`    | `admin`      |

Notes :
- Seul un `owner` peut changer le rôle d'un membre.
- Un `admin` peut retirer un membre mais pas un `owner`.

---

### `organization-invites.routes.ts`

| Endpoint                                                              | Rôle minimum    |
| --------------------------------------------------------------------- | --------------- |
| `GET /api/organizations/:organizationId/invites`                      | `admin`         |
| `POST /api/organizations/:organizationId/invites`                     | `admin`         |
| `POST /api/organizations/:organizationId/invites/:inviteId/revoke`    | `admin`         |
| `GET /api/invites/:token`                                             | `public`        |
| `POST /api/invites/:token/accept`                                     | `authenticated` |

Notes :
- L'aperçu d'invitation est public (lien dans l'email).
- L'acceptation nécessite d'être connecté.

---

### `companies.routes.ts`

| Endpoint                                                                  | Rôle minimum |
| ------------------------------------------------------------------------- | ------------ |
| `GET /api/organizations/:organizationId/companies`                        | `member`     |
| `POST /api/organizations/:organizationId/companies`                       | `member`     |
| `GET /api/organizations/:organizationId/companies/:companyId`             | `member`     |
| `PATCH /api/organizations/:organizationId/companies/:companyId`           | `member`     |
| `POST /api/organizations/:organizationId/companies/:companyId/archive`    | `admin`      |
| `POST /api/organizations/:organizationId/companies/:companyId/restore`    | `admin`      |

Notes :
- Les membres peuvent créer et modifier des entreprises.
- Seuls les `admin` et `owner` peuvent archiver/restaurer.

---

### `contacts.routes.ts`

| Endpoint                                                                   | Rôle minimum |
| -------------------------------------------------------------------------- | ------------ |
| `GET /api/organizations/:organizationId/contacts`                          | `member`     |
| `POST /api/organizations/:organizationId/contacts`                         | `member`     |
| `GET /api/organizations/:organizationId/contacts/:contactId`               | `member`     |
| `PATCH /api/organizations/:organizationId/contacts/:contactId`             | `member`     |
| `POST /api/organizations/:organizationId/contacts/:contactId/archive`      | `admin`      |
| `POST /api/organizations/:organizationId/contacts/:contactId/restore`      | `admin`      |

---

### `quotes.routes.ts`

| Endpoint                                                               | Rôle minimum |
| ---------------------------------------------------------------------- | ------------ |
| `GET /api/organizations/:organizationId/quotes`                        | `member`     |
| `POST /api/organizations/:organizationId/quotes`                       | `member`     |
| `GET /api/organizations/:organizationId/quotes/:quoteId`               | `member`     |
| `PATCH /api/organizations/:organizationId/quotes/:quoteId`             | `member`     |
| `POST /api/organizations/:organizationId/quotes/:quoteId/send`         | `member`     |
| `POST /api/organizations/:organizationId/quotes/:quoteId/accept`       | `member`     |
| `POST /api/organizations/:organizationId/quotes/:quoteId/refuse`       | `member`     |
| `POST /api/organizations/:organizationId/quotes/:quoteId/cancel`       | `admin`      |
| `GET /api/organizations/:organizationId/quotes/:quoteId/pdf`           | `member`     |

Notes :
- Seuls `admin` et `owner` peuvent annuler un devis.

---

### `quote-items.routes.ts`

| Endpoint                                                                    | Rôle minimum |
| --------------------------------------------------------------------------- | ------------ |
| `GET /api/organizations/:organizationId/quotes/:quoteId/items`              | `member`     |
| `POST /api/organizations/:organizationId/quotes/:quoteId/items`             | `member`     |
| `PATCH /api/organizations/:organizationId/quotes/:quoteId/items/:itemId`    | `member`     |
| `DELETE /api/organizations/:organizationId/quotes/:quoteId/items/:itemId`   | `member`     |
| `PATCH /api/organizations/:organizationId/quotes/:quoteId/items/reorder`    | `member`     |

Notes :
- Les modifications ne sont possibles que si le devis est en `draft`.

---

### `invoices.routes.ts`

| Endpoint                                                                     | Rôle minimum |
| ---------------------------------------------------------------------------- | ------------ |
| `GET /api/organizations/:organizationId/invoices`                            | `member`     |
| `GET /api/organizations/:organizationId/invoices/:invoiceId`                 | `member`     |
| `PATCH /api/organizations/:organizationId/invoices/:invoiceId`               | `member`     |
| `POST /api/organizations/:organizationId/invoices/:invoiceId/send`           | `member`     |
| `POST /api/organizations/:organizationId/invoices/:invoiceId/cancel`         | `admin`      |
| `GET /api/organizations/:organizationId/invoices/:invoiceId/pdf`             | `member`     |

Notes :
- Seuls `admin` et `owner` peuvent annuler une facture.

---

### `invoice-items.routes.ts`

| Endpoint                                                                          | Rôle minimum |
| --------------------------------------------------------------------------------- | ------------ |
| `GET /api/organizations/:organizationId/invoices/:invoiceId/items`                | `member`     |
| `GET /api/organizations/:organizationId/invoices/:invoiceId/items/:itemId`        | `member`     |

Lecture seule. Pas de création/modification/suppression en MVP.

---

### `payments.routes.ts`

| Endpoint                                                                         | Rôle minimum |
| -------------------------------------------------------------------------------- | ------------ |
| `GET /api/organizations/:organizationId/invoices/:invoiceId/payments`            | `member`     |
| `POST /api/organizations/:organizationId/invoices/:invoiceId/payments`           | `member`     |
| `GET /api/organizations/:organizationId/payments/:paymentId`                     | `member`     |
| `POST /api/organizations/:organizationId/payments/:paymentId/cancel`             | `admin`      |

Notes :
- Seuls `admin` et `owner` peuvent annuler un paiement.

---

### `notes.routes.ts`

| Endpoint                                                        | Rôle minimum |
| --------------------------------------------------------------- | ------------ |
| `GET /api/organizations/:organizationId/notes`                  | `member`     |
| `POST /api/organizations/:organizationId/notes`                 | `member`     |
| `GET /api/organizations/:organizationId/notes/:noteId`          | `member`     |
| `PATCH /api/organizations/:organizationId/notes/:noteId`        | `member`     |
| `DELETE /api/organizations/:organizationId/notes/:noteId`       | `member`     |

---

## Résumé des actions sensibles

Ces actions nécessitent au minimum `admin` ou `owner` :

| Action                                | Rôle minimum |
| ------------------------------------- | ------------ |
| Modifier les infos organisation       | `admin`      |
| Archiver/restaurer organisation       | `owner`      |
| Lister les membres                    | `admin`      |
| Voir le détail d'un membre            | `admin`      |
| Changer le rôle d'un membre           | `owner`      |
| Retirer un membre                     | `admin`      |
| Gérer les invitations                 | `admin`      |
| Archiver/restaurer entreprise         | `admin`      |
| Archiver/restaurer contact            | `admin`      |
| Annuler un devis                      | `admin`      |
| Annuler une facture                   | `admin`      |
| Annuler un paiement                   | `admin`      |
