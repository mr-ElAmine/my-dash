import { faker } from "@faker-js/faker";
import type { OrganizationInvite } from "../../src/db/schema/organization-invites.schema";
import { createOrganization } from "./organizations.fixture";
import { createUser } from "./users.fixture";

export function createOrganizationInvite(
  overrides: Partial<OrganizationInvite> = {},
): OrganizationInvite {
  return {
    id: faker.string.alphanumeric(20),
    organizationId: createOrganization().id,
    email: faker.internet.email(),
    role: "member",
    status: "pending",
    tokenHash: faker.string.alphanumeric(64),
    invitedBy: createUser().id,
    expiresAt: faker.date.future(),
    acceptedAt: null,
    revokedAt: null,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

export function createAcceptedInvite(
  overrides: Partial<OrganizationInvite> = {},
): OrganizationInvite {
  return createOrganizationInvite({
    status: "accepted",
    acceptedAt: new Date(),
    ...overrides,
  });
}

export function createRevokedInvite(
  overrides: Partial<OrganizationInvite> = {},
): OrganizationInvite {
  return createOrganizationInvite({
    status: "revoked",
    revokedAt: new Date(),
    ...overrides,
  });
}

export function createExpiredInvite(
  overrides: Partial<OrganizationInvite> = {},
): OrganizationInvite {
  return createOrganizationInvite({
    expiresAt: faker.date.past(),
    ...overrides,
  });
}
