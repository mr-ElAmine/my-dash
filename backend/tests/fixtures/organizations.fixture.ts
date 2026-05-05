import { faker } from "@faker-js/faker";
import type { Organization } from "../../src/db/schema/organizations.schema";

export function createOrganization(
  overrides: Partial<Organization> = {},
): Organization {
  return {
    id: faker.string.alphanumeric(20),
    name: faker.company.name(),
    legalName: faker.company.name(),
    siren: faker.string.numeric(9),
    siret: faker.string.numeric(14),
    vatNumber: `FR${faker.string.numeric(11)}`,
    billingStreet: faker.location.streetAddress(),
    billingCity: faker.location.city(),
    billingZipCode: faker.location.zipCode(),
    billingCountry: "FR",
    email: faker.internet.email(),
    phone: faker.phone.number({ style: "national" }),
    website: faker.internet.url(),
    status: "active",
    archivedAt: null,
    archivedBy: null,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

export function createArchivedOrganization(
  overrides: Partial<Organization> = {},
): Organization {
  return createOrganization({
    status: "archived",
    archivedAt: new Date(),
    archivedBy: faker.string.alphanumeric(20),
    ...overrides,
  });
}
