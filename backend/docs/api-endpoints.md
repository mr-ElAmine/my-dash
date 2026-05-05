# MyDash Backend — API Endpoints

## Convention API

No versioning.

Use:

```txt
/api/auth/register
/api/organizations
/api/organizations/:organizationId/companies
/api/organizations/:organizationId/quotes
```

Do not use:

```txt
/api/v1/...
```

## Authentication

Protected routes require:

```txt
Authorization: Bearer <access_token>
```

## Roles

| Role            | Meaning                    |
| --------------- | -------------------------- |
| `public`        | No authentication required |
| `authenticated` | Authenticated user         |
| `owner`         | Organization owner         |
| `admin`         | Organization admin         |
| `member`        | Organization member        |

For organization-scoped routes, always verify:

```txt
organization_members.status = active
```

## Response Format

### Success

```json
{
  "data": {}
}
```

### List

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

### Error

```json
{
  "error": {
    "code": "QUOTE_NOT_FOUND",
    "message": "Quote not found"
  }
}
```

---

# Route Files

## `routes/auth.routes.ts`

| Method | Route                | Auth required | Roles           | Input                                                       | Output                  | Goal                                                  |
| ------ | -------------------- | ------------: | --------------- | ----------------------------------------------------------- | ----------------------- | ----------------------------------------------------- |
| `POST` | `/api/auth/register` |            No | `public`        | Body: `email`, `password`, `firstName`, `lastName`, `phone` | `user`, `accessToken`   | Create a user. `phone` is required.                   |
| `POST` | `/api/auth/login`    |            No | `public`        | Body: `email`, `password`                                   | `user`, `accessToken`   | Authenticate user and return JWT.                     |
| `GET`  | `/api/auth/me`       |           Yes | `authenticated` | Header: `Authorization`                                     | `user`, `organizations` | Return current user and active organizations.         |


### Register detail

```json
{
  "email": "user@email.com",
  "password": "password",
  "firstName": "Jean",
  "lastName": "Martin",
  "phone": "0600000000"
}
```

`phone` is required.

---

## `routes/organizations.routes.ts`

### Organizations

| Method  | Route                                        | Auth required | Roles                      | Input                                                                                                 | Output                       | Goal                                               |
| ------- | -------------------------------------------- | ------------: | -------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------- |
| `GET`   | `/api/organizations`                         |           Yes | `authenticated`            | Query: `page?`, `limit?`, `status?`                                                                   | Organization list            | List organizations where user is an active member. |
| `POST`  | `/api/organizations`                         |           Yes | `authenticated`            | Body: `name`, `legalName?`, `siren?`, `siret?`, `vatNumber?`, address, `email?`, `phone?`, `website?` | `organization`, `membership` | Create organization and owner membership.          |
| `GET`   | `/api/organizations/:organizationId`         |           Yes | `owner`, `admin`, `member` | Params: `organizationId`                                                                              | `organization`               | Get organization detail.                           |
| `PATCH` | `/api/organizations/:organizationId`         |           Yes | `owner`, `admin`           | Params: `organizationId`, partial body                                                                | `organization`               | Update organization info.                          |
| `POST`  | `/api/organizations/:organizationId/archive` |           Yes | `owner`                    | Params: `organizationId`                                                                              | `organization`               | Archive organization.                              |
| `POST`  | `/api/organizations/:organizationId/restore` |           Yes | `owner`                    | Params: `organizationId`                                                                              | `organization`               | Restore archived organization.                     |

### Organization Members

| Method  | Route                                                         | Auth required | Roles            | Input                                               | Output      | Goal                                   |
| ------- | ------------------------------------------------------------- | ------------: | ---------------- | --------------------------------------------------- | ----------- | -------------------------------------- |
| `GET`   | `/api/organizations/:organizationId/members`                  |           Yes | `owner`, `admin` | Params: `organizationId`, Query: `status?`, `role?` | Member list | List organization members.             |
| `GET`   | `/api/organizations/:organizationId/members/:memberId`        |           Yes | `owner`, `admin` | Params: `organizationId`, `memberId`                | `member`    | Get member detail.                     |
| `PATCH` | `/api/organizations/:organizationId/members/:memberId/role`   |           Yes | `owner`          | Params: `organizationId`, `memberId`, Body: `role`  | `member`    | Update member role.                    |
| `POST`  | `/api/organizations/:organizationId/members/:memberId/remove` |           Yes | `owner`, `admin` | Params: `organizationId`, `memberId`                | `member`    | Remove member with `status = removed`. |

---

## `routes/organization-invites.routes.ts`

| Method | Route                                                         | Auth required | Roles            | Input                                           | Output          | Goal                                          |
| ------ | ------------------------------------------------------------- | ------------: | ---------------- | ----------------------------------------------- | --------------- | --------------------------------------------- |
| `GET`  | `/api/organizations/:organizationId/invites`                  |           Yes | `owner`, `admin` | Params: `organizationId`, Query: `status?`      | Invite list     | List organization invites.                    |
| `POST` | `/api/organizations/:organizationId/invites`                  |           Yes | `owner`, `admin` | Params: `organizationId`, Body: `email`, `role` | `invite`        | Create invite, hash token, send email.        |
| `POST` | `/api/organizations/:organizationId/invites/:inviteId/revoke` |           Yes | `owner`, `admin` | Params: `organizationId`, `inviteId`            | `invite`        | Revoke pending invite.                        |
| `GET`  | `/api/invites/:token`                                         |            No | `public`         | Params: `token`                                 | `invitePreview` | Preview invite from email link.               |
| `POST` | `/api/invites/:token/accept`                                  |           Yes | `authenticated`  | Params: `token`                                 | `membership`    | Accept invite and create organization member. |

---

## `routes/companies.routes.ts`

| Method  | Route                                                             | Auth required | Roles                      | Input                                                                            | Output       | Goal                                     |
| ------- | ----------------------------------------------------------------- | ------------: | -------------------------- | -------------------------------------------------------------------------------- | ------------ | ---------------------------------------- |
| `GET`   | `/api/organizations/:organizationId/companies`                    |           Yes | `owner`, `admin`, `member` | Query: `page?`, `limit?`, `status?`, `search?`, `city?`, `industry?`             | Company list | List organization companies.             |
| `POST`  | `/api/organizations/:organizationId/companies`                    |           Yes | `owner`, `admin`, `member` | Body: `name`, `siren?`, `siret?`, `vatNumber?`, `industry?`, `website?`, address | `company`    | Create company with `status = prospect`. |
| `GET`   | `/api/organizations/:organizationId/companies/:companyId`         |           Yes | `owner`, `admin`, `member` | Params: `organizationId`, `companyId`                                            | `company`    | Get company detail.                      |
| `PATCH` | `/api/organizations/:organizationId/companies/:companyId`         |           Yes | `owner`, `admin`, `member` | Params: `companyId`, partial body                                                | `company`    | Update company.                          |
| `POST`  | `/api/organizations/:organizationId/companies/:companyId/archive` |           Yes | `owner`, `admin`           | Params: `companyId`                                                              | `company`    | Archive company.                         |
| `POST`  | `/api/organizations/:organizationId/companies/:companyId/restore` |           Yes | `owner`, `admin`           | Params: `companyId`                                                              | `company`    | Restore archived company.                |

---

## `routes/contacts.routes.ts`

| Method  | Route                                                            | Auth required | Roles                      | Input                                                                       | Output       | Goal                              |
| ------- | ---------------------------------------------------------------- | ------------: | -------------------------- | --------------------------------------------------------------------------- | ------------ | --------------------------------- |
| `GET`   | `/api/organizations/:organizationId/contacts`                    |           Yes | `owner`, `admin`, `member` | Query: `page?`, `limit?`, `companyId?`, `status?`, `search?`                | Contact list | List organization contacts.       |
| `POST`  | `/api/organizations/:organizationId/contacts`                    |           Yes | `owner`, `admin`, `member` | Body: `companyId`, `firstName`, `lastName`, `email?`, `phone?`, `jobTitle?` | `contact`    | Create contact linked to company. |
| `GET`   | `/api/organizations/:organizationId/contacts/:contactId`         |           Yes | `owner`, `admin`, `member` | Params: `contactId`                                                         | `contact`    | Get contact detail.               |
| `PATCH` | `/api/organizations/:organizationId/contacts/:contactId`         |           Yes | `owner`, `admin`, `member` | Partial body                                                                | `contact`    | Update contact.                   |
| `POST`  | `/api/organizations/:organizationId/contacts/:contactId/archive` |           Yes | `owner`, `admin`           | Params: `contactId`                                                         | `contact`    | Archive contact.                  |
| `POST`  | `/api/organizations/:organizationId/contacts/:contactId/restore` |           Yes | `owner`, `admin`           | Params: `contactId`                                                         | `contact`    | Restore archived contact.         |

---

## `routes/quotes.routes.ts`

| Method  | Route                                                       | Auth required | Roles                      | Input                                                                      | Output             | Goal                                                                  |
| ------- | ----------------------------------------------------------- | ------------: | -------------------------- | -------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------- |
| `GET`   | `/api/organizations/:organizationId/quotes`                 |           Yes | `owner`, `admin`, `member` | Query: `page?`, `limit?`, `status?`, `companyId?`, `contactId?`, `search?` | Quote list         | List organization quotes.                                             |
| `POST`  | `/api/organizations/:organizationId/quotes`                 |           Yes | `owner`, `admin`, `member` | Body: `companyId`, `contactId?`, `issueDate`, `validUntil`, `items?`       | `quote`, `items?`  | Create quote in `draft`.                                              |
| `GET`   | `/api/organizations/:organizationId/quotes/:quoteId`        |           Yes | `owner`, `admin`, `member` | Params: `quoteId`                                                          | `quote`, `items`   | Get full quote detail.                                                |
| `PATCH` | `/api/organizations/:organizationId/quotes/:quoteId`        |           Yes | `owner`, `admin`, `member` | Body: `issueDate?`, `validUntil?`, `companyId?`, `contactId?`              | `quote`            | Update quote only if `draft`.                                         |
| `POST`  | `/api/organizations/:organizationId/quotes/:quoteId/send`   |           Yes | `owner`, `admin`, `member` | Params: `quoteId`                                                          | `quote`            | Mark quote as `sent`, create snapshots, lock items.                   |
| `POST`  | `/api/organizations/:organizationId/quotes/:quoteId/accept` |           Yes | `owner`, `admin`, `member` | Params: `quoteId`                                                          | `quote`, `invoice` | Accept quote, create invoice, clone items, set company to `customer`. |
| `POST`  | `/api/organizations/:organizationId/quotes/:quoteId/refuse` |           Yes | `owner`, `admin`, `member` | Params: `quoteId`                                                          | `quote`            | Mark quote as `refused`.                                              |
| `POST`  | `/api/organizations/:organizationId/quotes/:quoteId/cancel` |           Yes | `owner`, `admin`           | Params: `quoteId`                                                          | `quote`            | Cancel quote without hard delete.                                     |
| `GET`   | `/api/organizations/:organizationId/quotes/:quoteId/pdf`    |           Yes | `owner`, `admin`, `member` | Params: `quoteId`                                                          | PDF                | Generate or download quote PDF.                                       |

---

## `routes/quote-items.routes.ts`

| Method   | Route                                                              | Auth required | Roles                      | Input                                                                                  | Output                             | Goal                                            |
| -------- | ------------------------------------------------------------------ | ------------: | -------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------- |
| `GET`    | `/api/organizations/:organizationId/quotes/:quoteId/items`         |           Yes | `owner`, `admin`, `member` | Params: `quoteId`                                                                      | Item list                          | List quote items.                               |
| `POST`   | `/api/organizations/:organizationId/quotes/:quoteId/items`         |           Yes | `owner`, `admin`, `member` | Body: `description`, `quantity`, `unitPriceHtCents`, `taxRateBasisPoints`, `position?` | `quoteItem`, `quoteTotals`         | Add item to draft quote and recalculate totals. |
| `PATCH`  | `/api/organizations/:organizationId/quotes/:quoteId/items/:itemId` |           Yes | `owner`, `admin`, `member` | Params: `itemId`, partial body                                                         | `quoteItem`, `quoteTotals`         | Update draft quote item.                        |
| `DELETE` | `/api/organizations/:organizationId/quotes/:quoteId/items/:itemId` |           Yes | `owner`, `admin`, `member` | Params: `itemId`                                                                       | `{ success: true }`, `quoteTotals` | Delete draft quote item.                        |
| `PATCH`  | `/api/organizations/:organizationId/quotes/:quoteId/items/reorder` |           Yes | `owner`, `admin`, `member` | Body: `items: [{ id, position }]`                                                      | Item list                          | Reorder draft quote items.                      |

---

## `routes/invoices.routes.ts`

| Method  | Route                                                           | Auth required | Roles                      | Input                                                                                      | Output                         | Goal                                                    |
| ------- | --------------------------------------------------------------- | ------------: | -------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------- |
| `GET`   | `/api/organizations/:organizationId/invoices`                   |           Yes | `owner`, `admin`, `member` | Query: `page?`, `limit?`, `status?`, `companyId?`, `contactId?`, `search?`                 | Invoice list                   | List organization invoices.                             |
| `GET`   | `/api/organizations/:organizationId/invoices/:invoiceId`        |           Yes | `owner`, `admin`, `member` | Params: `invoiceId`                                                                        | `invoice`, `items`, `payments` | Get full invoice detail.                                |
| `PATCH` | `/api/organizations/:organizationId/invoices/:invoiceId`        |           Yes | `owner`, `admin`, `member` | Body: `dueDate?`, `serviceDate?`, `paymentTerms?`, `latePenaltyRate?`, `recoveryFeeCents?` | `invoice`                      | Update invoice metadata if allowed.                     |
| `POST`  | `/api/organizations/:organizationId/invoices/:invoiceId/send`   |           Yes | `owner`, `admin`, `member` | Params: `invoiceId`                                                                        | `invoice`                      | Send invoice, generate PDF, send email, mark as `sent`. |
| `POST`  | `/api/organizations/:organizationId/invoices/:invoiceId/cancel` |           Yes | `owner`, `admin`           | Params: `invoiceId`                                                                        | `invoice`                      | Cancel invoice without hard delete.                     |
| `GET`   | `/api/organizations/:organizationId/invoices/:invoiceId/pdf`    |           Yes | `owner`, `admin`, `member` | Params: `invoiceId`                                                                        | PDF                            | Generate or download invoice PDF.                       |

---

## `routes/invoice-items.routes.ts`

Invoice items are fixed. No create/update/delete in MVP.

| Method | Route                                                                  | Auth required | Roles                      | Input               | Output        | Goal                     |
| ------ | ---------------------------------------------------------------------- | ------------: | -------------------------- | ------------------- | ------------- | ------------------------ |
| `GET`  | `/api/organizations/:organizationId/invoices/:invoiceId/items`         |           Yes | `owner`, `admin`, `member` | Params: `invoiceId` | Item list     | List invoice items.      |
| `GET`  | `/api/organizations/:organizationId/invoices/:invoiceId/items/:itemId` |           Yes | `owner`, `admin`, `member` | Params: `itemId`    | `invoiceItem` | Get invoice item detail. |

---

## `routes/payments.routes.ts`

| Method | Route                                                             | Auth required | Roles                      | Input                                                      | Output               | Goal                                           |
| ------ | ----------------------------------------------------------------- | ------------: | -------------------------- | ---------------------------------------------------------- | -------------------- | ---------------------------------------------- |
| `GET`  | `/api/organizations/:organizationId/invoices/:invoiceId/payments` |           Yes | `owner`, `admin`, `member` | Params: `invoiceId`                                        | Payment list         | List invoice payments.                         |
| `POST` | `/api/organizations/:organizationId/invoices/:invoiceId/payments` |           Yes | `owner`, `admin`, `member` | Body: `amountCents`, `paymentDate`, `method`, `reference?` | `payment`, `invoice` | Record payment and recalculate invoice status. |
| `GET`  | `/api/organizations/:organizationId/payments/:paymentId`          |           Yes | `owner`, `admin`, `member` | Params: `paymentId`                                        | `payment`            | Get payment detail.                            |
| `POST` | `/api/organizations/:organizationId/payments/:paymentId/cancel`   |           Yes | `owner`, `admin`           | Params: `paymentId`                                        | `payment`, `invoice` | Cancel payment and recalculate invoice status. |

---

## `routes/notes.routes.ts`

| Method   | Route                                              | Auth required | Roles                      | Input                                                | Output              | Goal                                                           |
| -------- | -------------------------------------------------- | ------------: | -------------------------- | ---------------------------------------------------- | ------------------- | -------------------------------------------------------------- |
| `GET`    | `/api/organizations/:organizationId/notes`         |           Yes | `owner`, `admin`, `member` | Query: `page?`, `limit?`, `targetType?`, `targetId?` | Note list           | List notes, optionally filtered by linked entity.              |
| `POST`   | `/api/organizations/:organizationId/notes`         |           Yes | `owner`, `admin`, `member` | Body: `content`, `links: [{ targetType, targetId }]` | `note`, `links`     | Create note and link it to entities.                           |
| `GET`    | `/api/organizations/:organizationId/notes/:noteId` |           Yes | `owner`, `admin`, `member` | Params: `noteId`                                     | `note`, `links`     | Get note detail.                                               |
| `PATCH`  | `/api/organizations/:organizationId/notes/:noteId` |           Yes | `owner`, `admin`, `member` | Body: `content?`, `links?`                           | `note`, `links`     | Update note content or links.                                  |
| `DELETE` | `/api/organizations/:organizationId/notes/:noteId` |           Yes | `owner`, `admin`, `member` | Params: `noteId`                                     | `{ success: true }` | Delete note. Acceptable in MVP if notes do not need archiving. |

---

# Summary

| Route file                       | Scope                   | Endpoints |
| -------------------------------- | ----------------------- | --------: |
| `auth.routes.ts`                 | Authentication          |         4 |
| `organizations.routes.ts`        | Organizations + members |        10 |
| `organization-invites.routes.ts` | Invites                 |         5 |
| `companies.routes.ts`            | Companies               |         6 |
| `contacts.routes.ts`             | Contacts                |         6 |
| `quotes.routes.ts`               | Quotes                  |         9 |
| `quote-items.routes.ts`          | Quote items             |         5 |
| `invoices.routes.ts`             | Invoices                |         6 |
| `invoice-items.routes.ts`        | Invoice items           |         2 |
| `payments.routes.ts`             | Payments                |         4 |
| `notes.routes.ts`                | Notes                   |         5 |

Total: **62 endpoints**
