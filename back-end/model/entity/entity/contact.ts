import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
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