import { vi } from "vitest";
import type { INoteLinksRepository } from "../../../src/repositories/note-links.repository";

export function createNoteLinksRepositoryMock(): INoteLinksRepository {
  return {
    findByNoteId: vi.fn(),
    findByTarget: vi.fn(),
    create: vi.fn(),
    createBatch: vi.fn(),
    deleteByNoteId: vi.fn(),
  };
}
