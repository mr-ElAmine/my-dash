import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { companyStatusEnum } from "./enums";
import { organizations } from "./organizations.schema";
import { users } from "./users.schema";

export const companies = pgTable("companies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: text("name").notNull(),
  siren: text("siren"),
  siret: text("siret"),
  vatNumber: text("vat_number"),
  industry: text("industry"),
  website: text("website"),
  billingStreet: text("billing_street"),
  billingCity: text("billing_city"),
  billingZipCode: text("billing_zip_code"),
  billingCountry: text("billing_country").default("FR"),
  status: companyStatusEnum("status").notNull().default("prospect"),
  archivedAt: timestamp("archived_at"),
  archivedBy: text("archived_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
