import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  description: text("description").notNull(),

  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  taxRate: real("tax_rate").notNull(),

  lineTotal: real("line_total").notNull(),

  documentType: text("document_type", {
    enum: ["quote", "invoice"],
  }).notNull(),

  documentId: integer("document_id").notNull(),
});