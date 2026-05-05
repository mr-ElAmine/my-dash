import { vi } from "vitest";
import type { IContactsRepository } from "../../../src/repositories/contacts.repository";

export function createContactsRepositoryMock(): IContactsRepository {
  return {
    findByOrganizationId: vi.fn(),
    countByOrganizationId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
}
