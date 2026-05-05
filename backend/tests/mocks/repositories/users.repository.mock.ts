import { vi } from "vitest";
import type { IUsersRepository } from "../../../src/repositories/users.repository";

export function createUsersRepositoryMock(): IUsersRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    updateLastLogin: vi.fn(),
  };
}
