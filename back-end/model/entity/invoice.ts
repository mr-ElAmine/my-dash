import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { type InferSelectModel, type InferInsertModel, relations } from "drizzle-orm";
import { companies } from "./company";
import { contacts } from "./contact";
import { quotes } from "./quote";
import { users } from "./user";

export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  invoiceNumber: text("invoice_number").unique(),

  issueDate: text("issue_date").notNull(),
  dueDate: text("due_date").notNull(),

  status: text("status", {
    enum: ["to_send", "sent", "paid", "overdue", "cancelled"],
  }).notNull().default("to_send"),

  subtotalHt: real("subtotal_ht").notNull(),
  taxAmount: real("tax_amount").notNull(),
  totalTtc: real("total_ttc").notNull(),

  paidAt: text("paid_at"),

  companyId: integer("company_id").references(() => companies.id),
  contactId: integer("contact_id").references(() => contacts.id),
  quoteId: integer("quote_id").references(() => quotes.id).notNull(),
  createdBy: integer("created_by").references(() => users.id),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const invoicesRelations = relations(invoices, ({ one }) => ({
  company: one(companies, {
    fields: [invoices.companyId],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [invoices.contactId],
    references: [contacts.id],
  }),
  quote: one(quotes, {
    fields: [invoices.quoteId],
    references: [quotes.id],
  }),
}));

export type Invoice = InferSelectModel<typeof invoices>;
export type NewInvoice = InferInsertModel<typeof invoices>;