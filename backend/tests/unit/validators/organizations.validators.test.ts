import { describe, it, expect } from "vitest";
import {
  createOrganizationBody,
  updateOrganizationBody,
  updateMemberRoleBody,
  listOrganizationsQuery,
} from "../../../src/validators/organizations.validators";

describe("Organizations Validators", () => {
  describe("createOrganizationBody", () => {
    it("should reject when name is missing", () => {
      const result = createOrganizationBody.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = createOrganizationBody.safeParse({
        name: "Acme",
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("should accept minimal valid input with name only", () => {
      const result = createOrganizationBody.safeParse({ name: "Acme" });
      expect(result.success).toBe(true);
    });

    it("should accept all fields", () => {
      const result = createOrganizationBody.safeParse({
        name: "Acme",
        legalName: "Acme Inc.",
        siren: "123456789",
        siret: "12345678900001",
        vatNumber: "FR12345678901",
        billingStreet: "1 rue de la Paix",
        billingCity: "Paris",
        billingZipCode: "75001",
        billingCountry: "FR",
        email: "contact@acme.com",
        phone: "+33612345678",
        website: "https://acme.com",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateOrganizationBody", () => {
    it("should accept empty object", () => {
      const result = updateOrganizationBody.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept partial update", () => {
      const result = updateOrganizationBody.safeParse({ name: "Updated" });
      expect(result.success).toBe(true);
    });
  });

  describe("updateMemberRoleBody", () => {
    it("should reject invalid role", () => {
      const result = updateMemberRoleBody.safeParse({ role: "superadmin" });
      expect(result.success).toBe(false);
    });

    it("should accept owner role", () => {
      const result = updateMemberRoleBody.safeParse({ role: "owner" });
      expect(result.success).toBe(true);
    });

    it("should accept admin role", () => {
      const result = updateMemberRoleBody.safeParse({ role: "admin" });
      expect(result.success).toBe(true);
    });

    it("should accept member role", () => {
      const result = updateMemberRoleBody.safeParse({ role: "member" });
      expect(result.success).toBe(true);
    });
  });

  describe("listOrganizationsQuery", () => {
    it("should apply defaults for page and limit", () => {
      const result = listOrganizationsQuery.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should reject invalid status", () => {
      const result = listOrganizationsQuery.safeParse({ status: "unknown" });
      expect(result.success).toBe(false);
    });
  });
});
