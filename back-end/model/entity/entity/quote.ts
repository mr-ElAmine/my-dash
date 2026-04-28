import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
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