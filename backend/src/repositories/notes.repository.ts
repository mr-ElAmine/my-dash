import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db/client";
import { notes, type Note, type NewNote } from "../db/schema/notes.schema";

export interface INotesRepository {
  findByOrganizationId(
    organizationId: string,
    filters: { offset: number; limit: number },
  ): Promise<Note[]>;
  countByOrganizationId(organizationId: string): Promise<number>;
  findById(id: string): Promise<Note | undefined>;
  create(data: NewNote): Promise<Note>;
  update(id: string, data: Partial<NewNote>): Promise<Note>;
  delete(id: string): Promise<void>;
}

export class NotesRepository implements INotesRepository {
  constructor(private database = db) {}

  async findByOrganizationId(
    organizationId: string,
    filters: { offset: number; limit: number },
  ): Promise<Note[]> {
    return this.database
      .select()
      .from(notes)
      .where(eq(notes.organizationId, organizationId))
      .orderBy(desc(notes.createdAt))
      .offset(filters.offset)
      .limit(filters.limit);
  }

  async countByOrganizationId(organizationId: string): Promise<number> {
    const rows = await this.database
      .select({ id: notes.id })
      .from(notes)
      .where(eq(notes.organizationId, organizationId));
    return rows.length;
  }

  async findById(id: string): Promise<Note | undefined> {
    const [note] = await this.database
      .select()
      .from(notes)
      .where(eq(notes.id, id));
    return note;
  }

  async create(data: NewNote): Promise<Note> {
    const [note] = await this.database
      .insert(notes)
      .values(data)
      .returning();
    return note;
  }

  async update(id: string, data: Partial<NewNote>): Promise<Note> {
    const [note] = await this.database
      .update(notes)
      .set(data)
      .where(eq(notes.id, id))
      .returning();
    return note;
  }

  async delete(id: string): Promise<void> {
    await this.database.delete(notes).where(eq(notes.id, id));
  }
}
