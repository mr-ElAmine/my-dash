import { vi, type Mock } from "vitest";
import { QuoteRepository } from "../model/repositories/quoteRepository";

type Repo = InstanceType<typeof QuoteRepository>;

export type MockedQuoteRepository = {
  findById: Mock<Repo["findById"]>;
};

export function createQuoteRepositoryMock(): MockedQuoteRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
  };
}
