import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { organizations } from "./organizations.schema";
import { quotes } from "./quotes.schema";

export const quoteItems = pgTable("quote_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  quoteId: text("quote_id")
    .notNull()
    .references(() => quotes.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceHtCents: integer("unit_price_ht_cents").notNull(),
  taxRateBasisPoints: integer("tax_rate_basis_points").notNull(),
  lineSubtotalHtCents: integer("line_subtotal_ht_cents").notNull(),
  lineTaxAmountCents: integer("line_tax_amount_cents").notNull(),
  lineTotalTtcCents: integer("line_total_ttc_cents").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type QuoteItem = typeof quoteItems.$inferSelect;
export type NewQuoteItem = typeof quoteItems.$inferInsert;
