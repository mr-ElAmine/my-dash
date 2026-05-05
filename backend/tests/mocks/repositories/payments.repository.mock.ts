import { vi } from "vitest";
import type { IPaymentsRepository } from "../../../src/repositories/payments.repository";

export function createPaymentsRepositoryMock(): IPaymentsRepository {
  return {
    findByInvoiceId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
}
