import {
  pgTable,
  text,
  timestamp,
  integer,
  date,
  jsonb,
  numeric,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { invoiceStatusEnum } from "./enums";
import { organizations } from "./organizations.schema";
import { companies } from "./companies.schema";
import { contacts } from "./contacts.schema";
import { quotes } from "./quotes.schema";
import { users } from "./users.schema";

export const invoices = pgTable(
  "invoices",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id),
    invoiceNumber: text("invoice_number").notNull(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    serviceDate: date("service_date"),
    status: invoiceStatusEnum("status").notNull().default("to_send"),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    contactId: text("contact_id").references(() => contacts.id),
    quoteId: text("quote_id").references(() => quotes.id),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    clientSnapshot: jsonb("client_snapshot"),
    issuerSnapshot: jsonb("issuer_snapshot"),
    subtotalHtCents: integer("subtotal_ht_cents").notNull().default(0),
    taxAmountCents: integer("tax_amount_cents").notNull().default(0),
    totalTtcCents: integer("total_ttc_cents").notNull().default(0),
    paidAmountCents: integer("paid_amount_cents").notNull().default(0),
    paymentTerms: text("payment_terms"),
    latePenaltyRate: numeric("late_penalty_rate"),
    recoveryFeeCents: integer("recovery_fee_cents"),
    sentAt: timestamp("sent_at"),
    paidAt: timestamp("paid_at"),
    cancelledAt: timestamp("cancelled_at"),
    cancelledBy: text("cancelled_by").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("invoices_org_number_unique").on(
      table.organizationId,
      table.invoiceNumber,
    ),
    uniqueIndex("invoices_quote_unique").on(table.quoteId),
  ],
);

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
