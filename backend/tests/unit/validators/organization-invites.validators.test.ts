import { describe, it, expect, beforeAll } from "vitest";
import { createInviteBody } from "../../../src/validators/organization-invites.validators";

describe("Organization Invites Validators", () => {
  let listInvitesQuery: typeof import("../../../src/validators/organization-invites.validators").listInvitesSchema extends { query: infer Q } ? Q : never;

  beforeAll(async () => {
    const mod = await import("../../../src/validators/organization-invites.validators");
    listInvitesQuery = mod.listInvitesSchema.query;
  });

  describe("createInviteBody", () => {
    it("should reject when email is missing", () => {
      const result = createInviteBody.safeParse({ role: "member" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = createInviteBody.safeParse({
        email: "not-an-email",
        role: "member",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when role is missing", () => {
      const result = createInviteBody.safeParse({
        email: "john@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid role", () => {
      const result = createInviteBody.safeParse({
        email: "john@example.com",
        role: "superadmin",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid input", () => {
      const result = createInviteBody.safeParse({
        email: "john@example.com",
        role: "member",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("listInvitesQuery", () => {
    it("should accept pending status", () => {
      const result = listInvitesQuery.safeParse({ status: "pending" });
      expect(result.success).toBe(true);
    });

    it("should accept accepted status", () => {
      const result = listInvitesQuery.safeParse({ status: "accepted" });
      expect(result.success).toBe(true);
    });

    it("should accept revoked status", () => {
      const result = listInvitesQuery.safeParse({ status: "revoked" });
      expect(result.success).toBe(true);
    });

    it("should accept expired status", () => {
      const result = listInvitesQuery.safeParse({ status: "expired" });
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = listInvitesQuery.safeParse({ status: "unknown" });
      expect(result.success).toBe(false);
    });

    it("should accept empty object since status is optional", () => {
      const result = listInvitesQuery.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
