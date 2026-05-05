import { vi } from "vitest";
import type { IInvoiceItemsRepository } from "../../../src/repositories/invoice-items.repository";

export function createInvoiceItemsRepositoryMock(): IInvoiceItemsRepository {
  return {
    findByInvoiceId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    createBatch: vi.fn(),
  };
}
