import { describe, it, expect } from "vitest";
import { IJwtService, JwtService } from "../../../src/services/jwt.service";

describe("JwtService", () => {
  const service: IJwtService = new JwtService({
    secret: "test-secret-key-that-is-long-enough",
    expiresInSeconds: 3600,
  });

  describe("signAccessToken", () => {
    it("should sign a token with userId", () => {
      const token = service.signAccessToken({ userId: "user_123" });
      expect(token).toBeTypeOf("string");
      expect(token.split(".")).toHaveLength(3);
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify and return payload for valid token", () => {
      const token = service.signAccessToken({ userId: "user_123" });
      const payload = service.verifyAccessToken(token);
      expect(payload.userId).toBe("user_123");
    });

    it("should throw for invalid token", () => {
      expect(() => service.verifyAccessToken("invalid.token.here")).toThrow();
    });

    it("should throw for expired token", () => {
      const expiredService = new JwtService({
        secret: "test-secret-key-that-is-long-enough",
        expiresInSeconds: 1,
      });
      const token = expiredService.signAccessToken({ userId: "user_123" });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(() => expiredService.verifyAccessToken(token)).toThrow();
          resolve();
        }, 1100);
      });
    });
  });
});
