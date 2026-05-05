import { faker } from "@faker-js/faker";
import type { OrganizationMember } from "../../src/db/schema/organization-members.schema";
import { createOrganization } from "./organizations.fixture";
import { createUser } from "./users.fixture";

export function createOrganizationMember(
  overrides: Partial<OrganizationMember> = {},
): OrganizationMember {
  return {
    id: faker.string.alphanumeric(20),
    organizationId: createOrganization().id,
    userId: createUser().id,
    role: "member",
    status: "active",
    removedAt: null,
    removedBy: null,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

export function createOwnerMember(
  overrides: Partial<OrganizationMember> = {},
): OrganizationMember {
  return createOrganizationMember({ role: "owner", ...overrides });
}

export function createAdminMember(
  overrides: Partial<OrganizationMember> = {},
): OrganizationMember {
  return createOrganizationMember({ role: "admin", ...overrides });
}

export function createRemovedMember(
  overrides: Partial<OrganizationMember> = {},
): OrganizationMember {
  return createOrganizationMember({
    status: "removed",
    removedAt: new Date(),
    removedBy: faker.string.alphanumeric(20),
    ...overrides,
  });
}
