import { vi } from "vitest";
import type { IOrganizationsRepository } from "../../../src/repositories/organizations.repository";

export function createOrganizationsRepositoryMock(): IOrganizationsRepository {
  return {
    findByUserId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    archive: vi.fn(),
    restore: vi.fn(),
    countByUserId: vi.fn(),
  };
}
