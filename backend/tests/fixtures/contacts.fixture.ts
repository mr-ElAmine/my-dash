import type { Contact } from "../../src/db/schema/contacts.schema";

export function createContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: "contact_1",
    organizationId: "org_1",
    companyId: "comp_1",
    firstName: "Marie",
    lastName: "Dupont",
    email: "marie@example.com",
    phone: "0600000000",
    jobTitle: "CEO",
    status: "active",
    archivedAt: null,
    archivedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
