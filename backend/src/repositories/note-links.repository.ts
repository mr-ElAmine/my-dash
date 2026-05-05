import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import {
  noteLinks,
  type NoteLink,
  type NewNoteLink,
} from "../db/schema/note-links.schema";
import { notes } from "../db/schema/notes.schema";

type TargetType = NoteLink["targetType"];

export interface INoteLinksRepository {
  findByNoteId(noteId: string): Promise<NoteLink[]>;
  findByTarget(
    organizationId: string,
    targetType: TargetType,
    targetId: string,
  ): Promise<NoteLink[]>;
  create(data: NewNoteLink): Promise<NoteLink>;
  createBatch(items: NewNoteLink[]): Promise<NoteLink[]>;
  deleteByNoteId(noteId: string): Promise<void>;
}

export class NoteLinksRepository implements INoteLinksRepository {
  constructor(private database = db) {}

  async findByNoteId(noteId: string): Promise<NoteLink[]> {
    return this.database
      .select()
      .from(noteLinks)
      .where(eq(noteLinks.noteId, noteId));
  }

  async findByTarget(
    organizationId: string,
    targetType: TargetType,
    targetId: string,
  ): Promise<NoteLink[]> {
    return this.database
      .select()
      .from(noteLinks)
      .where(
        and(
          eq(noteLinks.organizationId, organizationId),
          eq(noteLinks.targetType, targetType),
          eq(noteLinks.targetId, targetId),
        ),
      );
  }

  async create(data: NewNoteLink): Promise<NoteLink> {
    const [link] = await this.database
      .insert(noteLinks)
      .values(data)
      .returning();
    return link;
  }

  async createBatch(items: NewNoteLink[]): Promise<NoteLink[]> {
    if (items.length === 0) return [];
    return this.database.insert(noteLinks).values(items).returning();
  }

  async deleteByNoteId(noteId: string): Promise<void> {
    await this.database
      .delete(noteLinks)
      .where(eq(noteLinks.noteId, noteId));
  }
}
