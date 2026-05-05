import { vi } from "vitest";
import type { INotesRepository } from "../../../src/repositories/notes.repository";

export function createNotesRepositoryMock(): INotesRepository {
  return {
    findByOrganizationId: vi.fn(),
    countByOrganizationId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}
