import { pgTable, text, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { paymentMethodEnum, paymentStatusEnum } from "./enums";
import { organizations } from "./organizations.schema";
import { invoices } from "./invoices.schema";
import { users } from "./users.schema";

export const payments = pgTable("payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id),
  amountCents: integer("amount_cents").notNull(),
  paymentDate: date("payment_date").notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("recorded"),
  reference: text("reference"),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: text("cancelled_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
