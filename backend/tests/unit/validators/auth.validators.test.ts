import { describe, it, expect } from "vitest";
import { registerBody, loginBody } from "../../../src/validators/auth.validators";

describe("Auth Validators", () => {
  describe("registerBody", () => {
    it("should reject when email is missing", () => {
      const result = registerBody.safeParse({
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        phone: "+33612345678",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when password is less than 8 characters", () => {
      const result = registerBody.safeParse({
        email: "john@example.com",
        password: "short",
        firstName: "John",
        lastName: "Doe",
        phone: "+33612345678",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when firstName is missing", () => {
      const result = registerBody.safeParse({
        email: "john@example.com",
        password: "password123",
        lastName: "Doe",
        phone: "+33612345678",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when lastName is missing", () => {
      const result = registerBody.safeParse({
        email: "john@example.com",
        password: "password123",
        firstName: "John",
        phone: "+33612345678",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when phone is missing", () => {
      const result = registerBody.safeParse({
        email: "john@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = registerBody.safeParse({
        email: "not-an-email",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        phone: "+33612345678",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid input", () => {
      const result = registerBody.safeParse({
        email: "john@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        phone: "+33612345678",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("loginBody", () => {
    it("should reject when email is missing", () => {
      const result = loginBody.safeParse({ password: "password123" });
      expect(result.success).toBe(false);
    });

    it("should reject when password is missing", () => {
      const result = loginBody.safeParse({ email: "john@example.com" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = loginBody.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid input", () => {
      const result = loginBody.safeParse({
        email: "john@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });
  });
});
