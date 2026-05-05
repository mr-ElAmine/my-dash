import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { contactStatusEnum } from "./enums";
import { organizations } from "./organizations.schema";
import { companies } from "./companies.schema";
import { users } from "./users.schema";

export const contacts = pgTable("contacts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  jobTitle: text("job_title"),
  status: contactStatusEnum("status").notNull().default("active"),
  archivedAt: timestamp("archived_at"),
  archivedBy: text("archived_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
