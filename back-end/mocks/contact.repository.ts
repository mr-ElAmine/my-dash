import { vi, type Mock } from "vitest";
import { ContactRepository } from "../model/repositories/contactRepository";

type Repo = InstanceType<typeof ContactRepository>;

export type MockedContactRepository = {
  findById: Mock<Repo["findById"]>;
};

export function createContactRepositoryMock(): MockedContactRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
  };
}