import { vi, type Mock } from "vitest";

import { QuoteRepository } from "../model/repositories/quoteRepository";

type Repo = InstanceType<typeof QuoteRepository>;

export type MockedQuoteRepository = {
  findAll: Mock<Repo["findAll"]>;
  findById: Mock<Repo["findById"]>;
  findList: Mock<Repo["findList"]>;
  findDetail: Mock<Repo["findDetail"]>;
  create: Mock<Repo["create"]>;
  updateStatus: Mock<Repo["updateStatus"]>;
};

export function createQuoteRepositoryMock(): MockedQuoteRepository {
  return {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    findList: vi.fn().mockResolvedValue([]),
    findDetail: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    updateStatus: vi.fn().mockResolvedValue({}),
  };
}
