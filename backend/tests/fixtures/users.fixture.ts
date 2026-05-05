import { faker } from "@faker-js/faker";
import type { User } from "../../src/db/schema/users.schema";

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.string.alphanumeric(20),
    email: faker.internet.email(),
    passwordHash: faker.string.alphanumeric(60),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number({ style: "national" }),
    status: "active",
    disabledAt: null,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

export function createDisabledUser(overrides: Partial<User> = {}): User {
  return createUser({
    status: "disabled",
    disabledAt: new Date(),
    ...overrides,
  });
}
