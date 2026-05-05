import { vi } from "vitest";
import type { IOrganizationsRepository } from "../../../src/repositories/organizations.repository";

export function createOrganizationsRepositoryMock(): IOrganizationsRepository {
  return {
    findActiveByUserId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    archive: vi.fn(),
    restore: vi.fn(),
    countActiveByUserId: vi.fn(),
  };
}
