import { vi } from "vitest";
import type { IInvoicesRepository } from "../../../src/repositories/invoices.repository";

export function createInvoicesRepositoryMock(): IInvoicesRepository {
  return {
    findByOrganizationId: vi.fn(),
    countByOrganizationId: vi.fn(),
    findById: vi.fn(),
    findByQuoteId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
}
