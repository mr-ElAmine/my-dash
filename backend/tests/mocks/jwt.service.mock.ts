import { vi } from "vitest";
import type { IJwtService } from "../../src/services/jwt.service";

export function createJwtServiceMock(): IJwtService {
  return {
    signAccessToken: vi.fn().mockReturnValue("mock-access-token"),
    verifyAccessToken: vi.fn(),
  };
}
