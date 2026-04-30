import { vi, type Mock } from "vitest";

import { ItemRepository } from "../model/repositories/itemRepository";

type Repo = InstanceType<typeof ItemRepository>;

export type MockedItemRepository = {
  findByDocument: Mock<Repo["findByDocument"]>;
  createMany: Mock<Repo["createMany"]>;
};

export function createItemRepositoryMock(): MockedItemRepository {
  return {
    findByDocument: vi.fn().mockResolvedValue([]),
    createMany: vi.fn().mockResolvedValue([]),
  };
}
