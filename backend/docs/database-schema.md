# MyDash Backend — Database Schema

## ORM

Drizzle ORM uniquement.

Ne pas introduire un autre ORM.

Ne pas utiliser de SQL brut sauf si Drizzle ne peut pas exprimer la requête proprement. Dans ce cas, isoler dans le repository et documenter pourquoi.

---

## Diagramme entité-relation

```txt
ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : has
USERS ||--o{ ORGANIZATION_MEMBERS : belongs_to

ORGANIZATIONS ||--o{ ORGANIZATION_INVITES : has
USERS ||--o{ ORGANIZATION_INVITES : sends

ORGANIZATIONS ||--o{ COMPANIES : owns
COMPANIES ||--o{ CONTACTS : has

COMPANIES ||--o{ QUOTES : receives
CONTACTS ||--o{ QUOTES : recipient
USERS ||--o{ QUOTES : creates
QUOTES ||--o{ QUOTE_ITEMS : contains

QUOTES ||--o| INVOICES : generates
COMPANIES ||--o{ INVOICES : receives
CONTACTS ||--o{ INVOICES : recipient
USERS ||--o{ INVOICES : creates
INVOICES ||--o{ INVOICE_ITEMS : contains
INVOICES ||--o{ PAYMENTS : has

USERS ||--o{ PAYMENTS : creates

USERS ||--o{ NOTES : writes
NOTES ||--o{ NOTE_LINKS : has
```

---

## Enums

Tous les enums Drizzle vivent dans :

```txt
src/db/schema/enums.ts
```

| Enum                          | Valeurs                                                          |
| ----------------------------- | ---------------------------------------------------------------- |
| `organization_status`         | `active`, `archived`                                             |
| `user_status`                 | `active`, `disabled`                                             |
| `organization_member_role`    | `owner`, `admin`, `member`                                       |
| `organization_member_status`  | `active`, `removed`                                              |
| `organization_invite_status`  | `pending`, `accepted`, `revoked`, `expired`                      |
| `company_status`              | `prospect`, `customer`, `archived`                               |
| `contact_status`              | `active`, `archived`                                             |
| `quote_status`                | `draft`, `sent`, `accepted`, `refused`, `expired`, `cancelled`   |
| `invoice_status`              | `to_send`, `sent`, `partially_paid`, `paid`, `overdue`, `cancelled` |
| `payment_method`              | `bank_transfer`, `card`, `cash`, `cheque`, `other`               |
| `payment_status`              | `recorded`, `cancelled`                                          |
| `note_target_type`            | `company`, `contact`, `quote`, `invoice`                         |

---

## Règles d'ID

Toutes les clés primaires et étrangères sont des strings CUID.

Ne jamais utiliser d'IDs entiers.

```txt
id string PK "cuid"
organization_id string FK
user_id string FK
company_id string FK
quote_id string FK
invoice_id string FK
```

Ne pas créer de fichiers `entity.ts`. Utiliser les types inférés de Drizzle :

```ts
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

---

## Règles monétaires

Utiliser des centimes entiers pour l'argent.

Correct :

```txt
subtotal_ht_cents int
tax_amount_cents int
total_ttc_cents int
paid_amount_cents int
unit_price_ht_cents int
```

Interdit :

```txt
float
double
real
number pour l'argent décimal persisté
```

---

## Règle TVA

La TVA appartient aux lignes, pas aux entités parentes.

Correct :

```txt
quote_items.tax_rate_basis_points
invoice_items.tax_rate_basis_points
```

Ne pas ajouter de `tax_rate` global sur :

```txt
quotes
invoices
```

Exemples de `tax_rate_basis_points` :

```txt
2000 = 20%
1000 = 10%
550  = 5.5%
0    = 0%
```

---

## Snapshots

Les devis et factures utilisent :

```txt
client_snapshot jsonb
issuer_snapshot jsonb
```

Les snapshots préservent les informations historiques.

Ne pas générer les PDF à partir des données actuelles de l'entreprise/organisation quand des snapshots existent.

Les snapshots doivent être créés quand :
- un devis est envoyé
- une facture est créée

---

## Contraintes uniques

| Table                    | Contrainte                                             |
| ------------------------ | ------------------------------------------------------ |
| `users`                  | `email` unique                                         |
| `organization_members`   | `(organization_id, user_id)` pour membres actifs       |
| `organization_invites`   | une seule invite pending par `(organization_id, email)` |
| `quotes`                 | `(organization_id, quote_number)`                      |
| `invoices`               | `(organization_id, invoice_number)`                    |
| `invoices`               | `quote_id` unique quand non null                       |
| `note_links`             | `(note_id, target_type, target_id)`                    |

---

## Tables détaillées

### `organizations`

| Colonne             | Type         | Contraintes                        |
| ------------------- | ------------ | ---------------------------------- |
| `id`                | string       | PK, CUID                           |
| `name`              | string       | not null                           |
| `legal_name`        | string       | nullable                           |
| `siren`             | string       | nullable                           |
| `siret`             | string       | nullable                           |
| `vat_number`        | string       | nullable                           |
| `billing_street`    | string       | nullable                           |
| `billing_city`      | string       | nullable                           |
| `billing_zip_code`  | string       | nullable                           |
| `billing_country`   | string       | default: `FR`                      |
| `email`             | string       | nullable                           |
| `phone`             | string       | nullable                           |
| `website`           | string       | nullable                           |
| `status`            | enum         | `active`, `archived`               |
| `archived_at`       | datetime     | nullable                           |
| `archived_by`       | string FK    | `users.id`, CUID, nullable         |
| `created_at`        | datetime     | not null                           |
| `updated_at`        | datetime     | not null                           |

---

### `users`

| Colonne          | Type     | Contraintes              |
| ---------------- | -------- | ------------------------ |
| `id`             | string   | PK, CUID                 |
| `email`          | string   | unique, not null         |
| `password_hash`  | string   | not null                 |
| `first_name`     | string   | not null                 |
| `last_name`      | string   | not null                 |
| `phone`          | string   | nullable                 |
| `status`         | enum     | `active`, `disabled`     |
| `disabled_at`    | datetime | nullable                 |
| `created_at`     | datetime | not null                 |
| `updated_at`     | datetime | not null                 |

---

### `organization_members`

| Colonne           | Type     | Contraintes                     |
| ----------------- | -------- | ------------------------------- |
| `id`              | string   | PK, CUID                        |
| `organization_id` | string FK| CUID                            |
| `user_id`         | string FK| CUID                            |
| `role`            | enum     | `owner`, `admin`, `member`      |
| `status`          | enum     | `active`, `removed`             |
| `removed_at`      | datetime | nullable                        |
| `removed_by`      | string FK| `users.id`, CUID, nullable      |
| `created_at`      | datetime | not null                        |
| `updated_at`      | datetime | not null                        |

---

### `organization_invites`

| Colonne           | Type     | Contraintes                                  |
| ----------------- | -------- | -------------------------------------------- |
| `id`              | string   | PK, CUID                                     |
| `organization_id` | string FK| CUID                                         |
| `email`           | string   | not null                                     |
| `role`            | enum     | `owner`, `admin`, `member`                   |
| `status`          | enum     | `pending`, `accepted`, `revoked`, `expired`  |
| `token_hash`      | string   | not null                                     |
| `invited_by`      | string FK| `users.id`, CUID                             |
| `expires_at`      | datetime | not null                                     |
| `accepted_at`     | datetime | nullable                                     |
| `revoked_at`      | datetime | nullable                                     |
| `created_at`      | datetime | not null                                     |
| `updated_at`      | datetime | not null                                     |

---

### `companies`

| Colonne             | Type     | Contraintes                     |
| ------------------- | -------- | ------------------------------- |
| `id`                | string   | PK, CUID                        |
| `organization_id`   | string FK| CUID                            |
| `name`              | string   | not null                        |
| `siren`             | string   | nullable                        |
| `siret`             | string   | nullable                        |
| `vat_number`        | string   | nullable                        |
| `industry`          | string   | nullable                        |
| `website`           | string   | nullable                        |
| `billing_street`    | string   | nullable                        |
| `billing_city`      | string   | nullable                        |
| `billing_zip_code`  | string   | nullable                        |
| `billing_country`   | string   | default: `FR`                   |
| `status`            | enum     | `prospect`, `customer`, `archived` |
| `archived_at`       | datetime | nullable                        |
| `archived_by`       | string FK| `users.id`, CUID, nullable      |
| `created_at`        | datetime | not null                        |
| `updated_at`        | datetime | not null                        |

---

### `contacts`

| Colonne           | Type     | Contraintes                |
| ----------------- | -------- | -------------------------- |
| `id`              | string   | PK, CUID                   |
| `organization_id` | string FK| CUID                       |
| `company_id`      | string FK| CUID                       |
| `first_name`      | string   | not null                   |
| `last_name`       | string   | not null                   |
| `email`           | string   | nullable                   |
| `phone`           | string   | nullable                   |
| `job_title`       | string   | nullable                   |
| `status`          | enum     | `active`, `archived`       |
| `archived_at`     | datetime | nullable                   |
| `archived_by`     | string FK| `users.id`, CUID, nullable |
| `created_at`      | datetime | not null                   |
| `updated_at`      | datetime | not null                   |

Pas de champ `is_primary`.

---

### `quotes`

| Colonne               | Type     | Contraintes                                             |
| --------------------- | -------- | ------------------------------------------------------- |
| `id`                  | string   | PK, CUID                                                |
| `organization_id`     | string FK| CUID                                                    |
| `quote_number`        | string   | unique par organisation                                 |
| `issue_date`          | date     | not null                                                |
| `valid_until`         | date     | not null                                                |
| `status`              | enum     | `draft`, `sent`, `accepted`, `refused`, `expired`, `cancelled` |
| `company_id`          | string FK| CUID                                                    |
| `contact_id`          | string FK| CUID, nullable                                          |
| `created_by`          | string FK| `users.id`, CUID                                        |
| `client_snapshot`     | jsonb    | nullable                                                |
| `issuer_snapshot`     | jsonb    | nullable                                                |
| `subtotal_ht_cents`   | int      | not null                                                |
| `tax_amount_cents`    | int      | not null                                                |
| `total_ttc_cents`     | int      | not null                                                |
| `sent_at`             | datetime | nullable                                                |
| `accepted_at`         | datetime | nullable                                                |
| `refused_at`          | datetime | nullable                                                |
| `expired_at`          | datetime | nullable                                                |
| `cancelled_at`        | datetime | nullable                                                |
| `cancelled_by`        | string FK| `users.id`, CUID, nullable                              |
| `created_at`          | datetime | not null                                                |
| `updated_at`          | datetime | not null                                                |

---

### `quote_items`

| Colonne                  | Type     | Contraintes           |
| ------------------------ | -------- | --------------------- |
| `id`                     | string   | PK, CUID              |
| `organization_id`        | string FK| CUID                  |
| `quote_id`               | string FK| CUID                  |
| `description`            | string   | not null              |
| `quantity`               | int      | not null              |
| `unit_price_ht_cents`    | int      | not null              |
| `tax_rate_basis_points`  | int      | not null              |
| `line_subtotal_ht_cents` | int      | not null              |
| `line_tax_amount_cents`  | int      | not null              |
| `line_total_ttc_cents`   | int      | not null              |
| `position`               | int      | not null              |
| `created_at`             | datetime | not null              |
| `updated_at`             | datetime | not null              |

---

### `invoices`

| Colonne                | Type     | Contraintes                                               |
| ---------------------- | -------- | --------------------------------------------------------- |
| `id`                   | string   | PK, CUID                                                  |
| `organization_id`      | string FK| CUID                                                      |
| `invoice_number`       | string   | unique par organisation                                   |
| `issue_date`           | date     | not null                                                  |
| `due_date`             | date     | not null                                                  |
| `service_date`         | date     | nullable                                                  |
| `status`               | enum     | `to_send`, `sent`, `partially_paid`, `paid`, `overdue`, `cancelled` |
| `company_id`           | string FK| CUID                                                      |
| `contact_id`           | string FK| CUID, nullable                                            |
| `quote_id`             | string FK| CUID, unique, nullable                                    |
| `created_by`           | string FK| `users.id`, CUID                                          |
| `client_snapshot`      | jsonb    | nullable                                                  |
| `issuer_snapshot`      | jsonb    | nullable                                                  |
| `subtotal_ht_cents`    | int      | not null                                                  |
| `tax_amount_cents`     | int      | not null                                                  |
| `total_ttc_cents`      | int      | not null                                                  |
| `paid_amount_cents`    | int      | not null, default 0                                       |
| `payment_terms`        | string   | nullable                                                  |
| `late_penalty_rate`    | decimal  | nullable                                                  |
| `recovery_fee_cents`   | int      | nullable                                                  |
| `sent_at`              | datetime | nullable                                                  |
| `paid_at`              | datetime | nullable                                                  |
| `cancelled_at`         | datetime | nullable                                                  |
| `cancelled_by`         | string FK| `users.id`, CUID, nullable                                |
| `created_at`           | datetime | not null                                                  |
| `updated_at`           | datetime | not null                                                  |

---

### `invoice_items`

| Colonne                  | Type     | Contraintes           |
| ------------------------ | -------- | --------------------- |
| `id`                     | string   | PK, CUID              |
| `organization_id`        | string FK| CUID                  |
| `invoice_id`             | string FK| CUID                  |
| `description`            | string   | not null              |
| `quantity`               | int      | not null              |
| `unit_price_ht_cents`    | int      | not null              |
| `tax_rate_basis_points`  | int      | not null              |
| `line_subtotal_ht_cents` | int      | not null              |
| `line_tax_amount_cents`  | int      | not null              |
| `line_total_ttc_cents`   | int      | not null              |
| `position`               | int      | not null              |
| `created_at`             | datetime | not null              |
| `updated_at`             | datetime | not null              |

---

### `payments`

| Colonne          | Type     | Contraintes                                  |
| ---------------- | -------- | -------------------------------------------- |
| `id`             | string   | PK, CUID                                     |
| `organization_id`| string FK| CUID                                         |
| `invoice_id`     | string FK| CUID                                         |
| `amount_cents`   | int      | not null                                     |
| `payment_date`   | date     | not null                                     |
| `method`         | enum     | `bank_transfer`, `card`, `cash`, `cheque`, `other` |
| `status`         | enum     | `recorded`, `cancelled`                      |
| `reference`      | string   | nullable                                     |
| `created_by`     | string FK| `users.id`, CUID                             |
| `cancelled_at`   | datetime | nullable                                     |
| `cancelled_by`   | string FK| `users.id`, CUID, nullable                   |
| `created_at`     | datetime | not null                                     |
| `updated_at`     | datetime | not null                                     |

---

### `notes`

| Colonne           | Type     | Contraintes          |
| ----------------- | -------- | -------------------- |
| `id`              | string   | PK, CUID             |
| `organization_id` | string FK| CUID                 |
| `content`         | text     | not null             |
| `created_by`      | string FK| `users.id`, CUID     |
| `created_at`      | datetime | not null             |
| `updated_at`      | datetime | not null             |

---

### `note_links`

| Colonne           | Type     | Contraintes                                    |
| ----------------- | -------- | ---------------------------------------------- |
| `id`              | string   | PK, CUID                                       |
| `organization_id` | string FK| CUID                                           |
| `note_id`         | string FK| CUID                                           |
| `target_type`     | enum     | `company`, `contact`, `quote`, `invoice`       |
| `target_id`       | string   | CUID, polymorphic                              |
| `created_at`      | datetime | not null                                       |

Contrainte unique : `(note_id, target_type, target_id)`

---

## Transactions

Utiliser des transactions pour les workflows devant être atomiques.

Exemples obligatoires :

- accepter un devis et créer sa facture
- cloner les lignes de devis en lignes de facture
- enregistrer un paiement et mettre à jour le montant payé
- accepter une invitation et créer un membership

---

## Schema files

Un fichier par table dans `src/db/schema/`.

```txt
src/db/schema/
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
```
