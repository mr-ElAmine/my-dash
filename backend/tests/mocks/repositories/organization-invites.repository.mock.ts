import { vi } from "vitest";
import type { IOrganizationInvitesRepository } from "../../../src/repositories/organization-invites.repository";

export function createOrganizationInvitesRepositoryMock(): IOrganizationInvitesRepository {
  return {
    findByOrganizationId: vi.fn(),
    findById: vi.fn(),
    findPendingByOrganizationAndEmail: vi.fn(),
    findByTokenHash: vi.fn(),
    create: vi.fn(),
    revoke: vi.fn(),
    markAccepted: vi.fn(),
  };
}
