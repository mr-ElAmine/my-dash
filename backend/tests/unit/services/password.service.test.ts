import { describe, it, expect } from "vitest";
import { IPasswordService, PasswordService } from "../../../src/services/password.service";

describe("PasswordService", () => {
  const service: IPasswordService = new PasswordService();

  describe("hash", () => {
    it("should hash a password", async () => {
      const hash = await service.hash("password123");
      expect(hash).toBeTypeOf("string");
      expect(hash).not.toBe("password123");
    });

    it("should produce different hashes for different passwords", async () => {
      const hash1 = await service.hash("password123");
      const hash2 = await service.hash("password456");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verify", () => {
    it("should return true for correct password", async () => {
      const hash = await service.hash("password123");
      const result = await service.verify("password123", hash);
      expect(result).toBe(true);
    });

    it("should return false for wrong password", async () => {
      const hash = await service.hash("password123");
      const result = await service.verify("wrongpassword", hash);
      expect(result).toBe(false);
    });
  });
});
