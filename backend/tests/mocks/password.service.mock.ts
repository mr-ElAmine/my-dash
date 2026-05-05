import { vi } from "vitest";
import type { IPasswordService } from "../../src/services/password.service";

export function createPasswordServiceMock(): IPasswordService {
  return {
    hash: vi.fn(),
    verify: vi.fn(),
  };
}
