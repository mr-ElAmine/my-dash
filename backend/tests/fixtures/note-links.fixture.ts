import type { NoteLink } from "../../src/db/schema/note-links.schema";

export function createNoteLink(overrides: Partial<NoteLink> = {}): NoteLink {
  return {
    id: "nlink_1",
    organizationId: "org_1",
    noteId: "note_1",
    targetType: "company",
    targetId: "comp_1",
    createdAt: new Date(),
    ...overrides,
  };
}
