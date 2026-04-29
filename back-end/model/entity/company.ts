import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

export const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  name: text("name").notNull(),
  siret: text("siret").unique(),

  vatNumber: text("vat_number"),
  industry: text("industry"),
  website: text("website"),

  street: text("street"),
  city: text("city"),
  zipCode: text("zip_code"),
  country: text("country").notNull().default("FR"),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type Company = InferSelectModel<typeof companies>;
export type NewCompany = InferInsertModel<typeof companies>;
