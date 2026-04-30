import { vi, type Mock } from "vitest";

import { QuoteRepository } from "../model/repositories/quoteRepository";

// on dérive le type du vrai repo pour que le mock ait la même signature
type Repo = InstanceType<typeof QuoteRepository>;

// chaque méthode du repo devient un Mock avec le même type que l'originale
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
    // valeurs neutres par défaut : tableaux vides, null, objet vide
    // chaque test surcharge ce dont il a besoin avec mockResolvedValueOnce
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    findList: vi.fn().mockResolvedValue([]),
    findDetail: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    updateStatus: vi.fn().mockResolvedValue({}),
  };
}
