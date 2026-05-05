import { vi } from "vitest";
import type { IQuoteItemsRepository } from "../../../src/repositories/quote-items.repository";

export function createQuoteItemsRepositoryMock(): IQuoteItemsRepository {
  return {
    findByQuoteId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updatePositions: vi.fn(),
  };
}
