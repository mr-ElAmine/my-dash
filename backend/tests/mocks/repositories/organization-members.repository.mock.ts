import { vi } from "vitest";
import type { IOrganizationMembersRepository } from "../../../src/repositories/organization-members.repository";

export function createOrganizationMembersRepositoryMock(): IOrganizationMembersRepository {
  return {
    findActiveByOrganizationId: vi.fn(),
    findById: vi.fn(),
    findByOrganizationAndUser: vi.fn(),
    create: vi.fn(),
    updateRole: vi.fn(),
    remove: vi.fn(),
    findByUserId: vi.fn(),
  };
}
