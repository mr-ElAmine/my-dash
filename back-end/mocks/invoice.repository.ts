import { vi, type Mock } from "vitest";
import { InvoiceRepository } from "../model/repositories/invoiceRepository";

type Repo = InstanceType<typeof InvoiceRepository>;

export type MockedInvoiceRepository = {
  findById: Mock<Repo["findById"]>;
};

export function createInvoiceRepositoryMock(): MockedInvoiceRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
  };
}
