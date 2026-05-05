import { vi } from "vitest";
import type { ICompaniesRepository } from "../../../src/repositories/companies.repository";

export function createCompaniesRepositoryMock(): ICompaniesRepository {
  return {
    findById: vi.fn(),
    findByOrganizationId: vi.fn(),
    countByOrganizationId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
  };
}
