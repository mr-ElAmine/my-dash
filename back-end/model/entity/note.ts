import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  content: text("content").notNull(),
  createdBy: integer("created_by").notNull(),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type Note = InferSelectModel<typeof notes>;
export type NewNote = InferInsertModel<typeof notes>;