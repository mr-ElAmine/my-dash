import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const noteLinks = sqliteTable("note_links", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  noteId: integer("note_id").notNull(),

  targetType: text("target_type", {
    enum: ["company", "contact", "quote", "invoice"],
  }).notNull(),

  targetId: integer("target_id").notNull(),
});