import { vi, type Mock } from "vitest";

import { CompanyRepository } from "../model/repositories/companyRepository";

type Repo = InstanceType<typeof CompanyRepository>;

export type MockedCompanyRepository = {
  findById: Mock<Repo["findById"]>;
};

export function createCompanyRepositoryMock(): MockedCompanyRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
  };
}
