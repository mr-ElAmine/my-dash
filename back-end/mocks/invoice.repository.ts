import { vi, type Mock } from "vitest";

import { InvoiceRepository } from "../model/repositories/invoiceRepository";

type Repo = InstanceType<typeof InvoiceRepository>;

export type MockedInvoiceRepository = {
  findAll: Mock<Repo["findAll"]>;
  findById: Mock<Repo["findById"]>;
  findList: Mock<Repo["findList"]>;
  findDetail: Mock<Repo["findDetail"]>;
  create: Mock<Repo["create"]>;
  updateStatus: Mock<Repo["updateStatus"]>;
};

export function createInvoiceRepositoryMock(): MockedInvoiceRepository {
  return {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    findList: vi.fn().mockResolvedValue([]),
    findDetail: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    updateStatus: vi.fn().mockResolvedValue({}),
  };
}
