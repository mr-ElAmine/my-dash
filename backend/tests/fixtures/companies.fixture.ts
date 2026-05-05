import type { Company } from "../../src/db/schema/companies.schema";

export function createCompany(overrides: Partial<Company> = {}): Company {
  return {
    id: "comp_1",
    organizationId: "org_1",
    name: "Test Company",
    siren: null,
    siret: null,
    vatNumber: null,
    industry: null,
    website: null,
    billingStreet: null,
    billingCity: null,
    billingZipCode: null,
    billingCountry: "FR",
    status: "prospect",
    archivedAt: null,
    archivedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createCustomerCompany(overrides: Partial<Company> = {}): Company {
  return createCompany({ status: "customer", ...overrides });
}

export function createArchivedCompany(overrides: Partial<Company> = {}): Company {
  return createCompany({
    status: "archived",
    archivedAt: new Date(),
    archivedBy: "user_1",
    ...overrides,
  });
}
