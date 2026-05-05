import { vi } from "vitest";
import type { IQuotesRepository } from "../../../src/repositories/quotes.repository";

export function createQuotesRepositoryMock(): IQuotesRepository {
  return {
    findByOrganizationId: vi.fn(),
    countByOrganizationId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
  };
}
