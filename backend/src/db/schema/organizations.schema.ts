import {
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { organizationStatusEnum } from "./enums";

export const organizations = pgTable("organizations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  legalName: text("legal_name"),
  siren: text("siren"),
  siret: text("siret"),
  vatNumber: text("vat_number"),
  billingStreet: text("billing_street"),
  billingCity: text("billing_city"),
  billingZipCode: text("billing_zip_code"),
  billingCountry: text("billing_country").default("FR"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  status: organizationStatusEnum("status").notNull().default("active"),
  archivedAt: timestamp("archived_at"),
  archivedBy: text("archived_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
