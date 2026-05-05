import {
  pgTable,
  text,
  timestamp,
  integer,
  date,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { quoteStatusEnum } from "./enums";
import { organizations } from "./organizations.schema";
import { companies } from "./companies.schema";
import { contacts } from "./contacts.schema";
import { users } from "./users.schema";

export const quotes = pgTable(
  "quotes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id),
    quoteNumber: text("quote_number").notNull(),
    issueDate: date("issue_date").notNull(),
    validUntil: date("valid_until").notNull(),
    status: quoteStatusEnum("status").notNull().default("draft"),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    contactId: text("contact_id").references(() => contacts.id),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    clientSnapshot: jsonb("client_snapshot"),
    issuerSnapshot: jsonb("issuer_snapshot"),
    subtotalHtCents: integer("subtotal_ht_cents").notNull().default(0),
    taxAmountCents: integer("tax_amount_cents").notNull().default(0),
    totalTtcCents: integer("total_ttc_cents").notNull().default(0),
    sentAt: timestamp("sent_at"),
    acceptedAt: timestamp("accepted_at"),
    refusedAt: timestamp("refused_at"),
    expiredAt: timestamp("expired_at"),
    cancelledAt: timestamp("cancelled_at"),
    cancelledBy: text("cancelled_by").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("quotes_org_number_unique").on(
      table.organizationId,
      table.quoteNumber,
    ),
  ],
);

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
