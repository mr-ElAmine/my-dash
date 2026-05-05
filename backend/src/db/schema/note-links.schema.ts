import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { noteTargetTypeEnum } from "./enums";
import { organizations } from "./organizations.schema";
import { notes } from "./notes.schema";

export const noteLinks = pgTable(
  "note_links",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id),
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id),
    targetType: noteTargetTypeEnum("target_type").notNull(),
    targetId: text("target_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("note_links_unique").on(
      table.noteId,
      table.targetType,
      table.targetId,
    ),
  ],
);

export type NoteLink = typeof noteLinks.$inferSelect;
export type NewNoteLink = typeof noteLinks.$inferInsert;
