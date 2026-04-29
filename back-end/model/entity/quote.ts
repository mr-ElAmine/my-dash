import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { type InferSelectModel, type InferInsertModel, relations } from "drizzle-orm";
import { companies } from "./company";
import { contacts } from "./contact";
import { users } from "./user";

export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  quoteNumber: text("quote_number").unique(),

  issueDate: text("issue_date").notNull(),
  validUntil: text("valid_until").notNull(),

  status: text("status", {
    enum: ["draft", "sent", "accepted", "refused", "expired"],
  }).notNull().default("draft"),

  subtotalHt: real("subtotal_ht").notNull(),
  taxAmount: real("tax_amount").notNull(),
  totalTtc: real("total_ttc").notNull(),

  companyId: integer("company_id").references(() => companies.id),
  contactId: integer("contact_id").references(() => contacts.id),
  createdBy: integer("created_by").references(() => users.id),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const quotesRelations = relations(quotes, ({ one }) => ({
  company: one(companies, {
    fields: [quotes.companyId],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [quotes.contactId],
    references: [contacts.id],
  }),
}));

export type Quote = InferSelectModel<typeof quotes>;
export type NewQuote = InferInsertModel<typeof quotes>;