import type { Note } from "../../src/db/schema/notes.schema";

export function createNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "note_1",
    organizationId: "org_1",
    content: "This is a note",
    createdBy: "user_1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
