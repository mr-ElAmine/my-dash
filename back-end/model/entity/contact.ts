import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { type InferSelectModel, type InferInsertModel, relations } from "drizzle-orm";
import { companies } from "./company";

export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),

  email: text("email"),
  phone: text("phone"),
  jobTitle: text("job_title"),

  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const contactsRelations = relations(contacts, ({ one }) => ({
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
}));

export type Contact = InferSelectModel<typeof contacts>;
export type NewContact = InferInsertModel<typeof contacts>;