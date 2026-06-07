# Base de données

## Organisation

Le projet utilise PostgreSQL et Drizzle ORM.

```text
backend/src/db/
  client.ts
  schema/
  migrations/
```

Chaque table possède un fichier dans `schema/`. `schema/index.ts` réexporte les schémas utilisés par Drizzle.

## Entités principales

```text
users
organizations
organization_members
organization_invites
companies
contacts
quotes
quote_items
invoices
invoice_items
payments
notes
note_links
```

## Règles de modélisation

### Identifiants

Toutes les clés utilisent des chaînes CUID. Ne pas ajouter d'ID entier.

### Montants

Les montants persistés utilisent des centimes entiers :

```text
unit_price_ht_cents
subtotal_ht_cents
tax_amount_cents
total_ttc_cents
```

Ne pas stocker de montant financier dans un `float`.

### TVA

Le taux de TVA appartient à chaque ligne et utilise des points de base :

```text
2000 = 20 %
550  = 5,5 %
```

### Historique des documents

Les devis et factures utilisent des snapshots JSON pour conserver les informations du client et de l'émetteur au moment de la création du document.

## Modifier le schéma

1. modifier le fichier dans `src/db/schema/` ;
2. réexporter le schéma dans `src/db/schema/index.ts` si nécessaire ;
3. générer une migration :

```bash
pnpm db:generate
```

4. vérifier le SQL généré ;
5. appliquer la migration :

```bash
pnpm db:migrate
```

6. adapter les repositories, services et tests.

## Environnements Docker

| Environnement | Fichier | Port PostgreSQL |
| --- | --- | ---: |
| Développement | `infrastructure/dev/docker-compose.yml` | `5432` |
| Test | `infrastructure/test/docker-compose.yml` | `5433` |
| Production locale | `infrastructure/prod/docker-compose.yml` | `5432` |

Le compose de production contient uniquement PostgreSQL. Il ne déploie pas le backend.
