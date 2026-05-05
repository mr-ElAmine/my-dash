import { describe, it, expect } from "vitest";
import {
  createCompanyBody,
  updateCompanyBody,
  listCompaniesQuery,
} from "../../../src/validators/companies.validators";

describe("Companies Validators", () => {
  describe("createCompanyBody", () => {
    it("should reject when name is missing", () => {
      const result = createCompanyBody.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should accept minimal input with name only", () => {
      const result = createCompanyBody.safeParse({ name: "Acme" });
      expect(result.success).toBe(true);
    });

    it("should accept nullable fields", () => {
      const result = createCompanyBody.safeParse({
        name: "Acme",
        siren: null,
      });
      expect(result.success).toBe(true);
    });

    it("should accept all fields", () => {
      const result = createCompanyBody.safeParse({
        name: "Acme",
        siren: "123456789",
        siret: "12345678900001",
        vatNumber: "FR12345678901",
        industry: "Tech",
        website: "https://acme.com",
        billingStreet: "1 rue de la Paix",
        billingCity: "Paris",
        billingZipCode: "75001",
        billingCountry: "FR",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateCompanyBody", () => {
    it("should accept empty object", () => {
      const result = updateCompanyBody.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept partial update", () => {
      const result = updateCompanyBody.safeParse({ name: "Updated" });
      expect(result.success).toBe(true);
    });

    it("should accept nullable fields", () => {
      const result = updateCompanyBody.safeParse({ siren: null });
      expect(result.success).toBe(true);
    });
  });

  describe("listCompaniesQuery", () => {
    it("should apply defaults for page and limit", () => {
      const result = listCompaniesQuery.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should accept valid status prospect", () => {
      const result = listCompaniesQuery.safeParse({ status: "prospect" });
      expect(result.success).toBe(true);
    });

    it("should accept valid status customer", () => {
      const result = listCompaniesQuery.safeParse({ status: "customer" });
      expect(result.success).toBe(true);
    });

    it("should accept valid status archived", () => {
      const result = listCompaniesQuery.safeParse({ status: "archived" });
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = listCompaniesQuery.safeParse({ status: "unknown" });
      expect(result.success).toBe(false);
    });

    it("should accept search, city, and industry", () => {
      const result = listCompaniesQuery.safeParse({
        search: "Acme",
        city: "Paris",
        industry: "Tech",
      });
      expect(result.success).toBe(true);
    });
  });
});
