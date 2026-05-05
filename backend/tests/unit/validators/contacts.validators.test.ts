import { describe, it, expect } from "vitest";
import {
  createContactBody,
  updateContactBody,
  listContactsQuery,
} from "../../../src/validators/contacts.validators";

describe("Contacts Validators", () => {
  describe("createContactBody", () => {
    it("should reject when companyId is missing", () => {
      const result = createContactBody.safeParse({
        firstName: "John",
        lastName: "Doe",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when firstName is missing", () => {
      const result = createContactBody.safeParse({
        companyId: "comp_1",
        lastName: "Doe",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when lastName is missing", () => {
      const result = createContactBody.safeParse({
        companyId: "comp_1",
        firstName: "John",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = createContactBody.safeParse({
        companyId: "comp_1",
        firstName: "John",
        lastName: "Doe",
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid input with all fields", () => {
      const result = createContactBody.safeParse({
        companyId: "comp_1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+33612345678",
        jobTitle: "CEO",
      });
      expect(result.success).toBe(true);
    });

    it("should accept minimal required fields", () => {
      const result = createContactBody.safeParse({
        companyId: "comp_1",
        firstName: "John",
        lastName: "Doe",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateContactBody", () => {
    it("should accept empty object", () => {
      const result = updateContactBody.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept partial update", () => {
      const result = updateContactBody.safeParse({ firstName: "Jane" });
      expect(result.success).toBe(true);
    });

    it("should accept nullable email", () => {
      const result = updateContactBody.safeParse({ email: null });
      expect(result.success).toBe(true);
    });

    it("should accept nullable phone", () => {
      const result = updateContactBody.safeParse({ phone: null });
      expect(result.success).toBe(true);
    });

    it("should accept nullable jobTitle", () => {
      const result = updateContactBody.safeParse({ jobTitle: null });
      expect(result.success).toBe(true);
    });
  });

  describe("listContactsQuery", () => {
    it("should apply defaults for page and limit", () => {
      const result = listContactsQuery.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should accept valid status active", () => {
      const result = listContactsQuery.safeParse({ status: "active" });
      expect(result.success).toBe(true);
    });

    it("should accept valid status archived", () => {
      const result = listContactsQuery.safeParse({ status: "archived" });
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = listContactsQuery.safeParse({ status: "unknown" });
      expect(result.success).toBe(false);
    });
  });
});
