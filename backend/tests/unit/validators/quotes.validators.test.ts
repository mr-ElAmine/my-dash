import { describe, it, expect, beforeAll } from "vitest";
import {
  createQuoteBody,
  updateQuoteBody,
  listQuotesQuery,
} from "../../../src/validators/quotes.validators";

describe("Quotes Validators", () => {
  describe("createQuoteBody", () => {
    it("should reject when companyId is missing", () => {
      const result = createQuoteBody.safeParse({
        issueDate: "2026-05-03",
        validUntil: "2026-06-03",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when issueDate is missing", () => {
      const result = createQuoteBody.safeParse({
        companyId: "comp_1",
        validUntil: "2026-06-03",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when validUntil is missing", () => {
      const result = createQuoteBody.safeParse({
        companyId: "comp_1",
        issueDate: "2026-05-03",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid input with optional contactId", () => {
      const result = createQuoteBody.safeParse({
        companyId: "comp_1",
        contactId: "contact_1",
        issueDate: "2026-05-03",
        validUntil: "2026-06-03",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid input without contactId", () => {
      const result = createQuoteBody.safeParse({
        companyId: "comp_1",
        issueDate: "2026-05-03",
        validUntil: "2026-06-03",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateQuoteBody", () => {
    it("should accept partial update", () => {
      const result = updateQuoteBody.safeParse({
        issueDate: "2026-06-01",
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty object", () => {
      const result = updateQuoteBody.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept nullable contactId", () => {
      const result = updateQuoteBody.safeParse({ contactId: null });
      expect(result.success).toBe(true);
    });
  });

  describe("listQuotesQuery", () => {
    it("should apply defaults for page and limit", () => {
      const result = listQuotesQuery.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should reject invalid status", () => {
      const result = listQuotesQuery.safeParse({ status: "invalid" });
      expect(result.success).toBe(false);
    });

    it("should accept valid status", () => {
      const result = listQuotesQuery.safeParse({ status: "draft" });
      expect(result.success).toBe(true);
    });

    it("should accept search and companyId", () => {
      const result = listQuotesQuery.safeParse({
        search: "DEV",
        companyId: "comp_1",
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("Quote Items Validators", () => {
  let createBody: typeof import("../../../src/validators/quote-items.validators").createQuoteItemBody;
  let updateBody: typeof import("../../../src/validators/quote-items.validators").updateQuoteItemBody;
  let reorder: typeof import("../../../src/validators/quote-items.validators").reorderBody;

  beforeAll(async () => {
    const mod = await import("../../../src/validators/quote-items.validators");
    createBody = mod.createQuoteItemBody;
    updateBody = mod.updateQuoteItemBody;
    reorder = mod.reorderBody;
  });

  describe("createQuoteItemBody", () => {
    it("should reject when description is missing", () => {
      const result = createBody.safeParse({
        quantity: 1,
        unitPriceHtCents: 5000,
        taxRateBasisPoints: 2000,
      });
      expect(result.success).toBe(false);
    });

    it("should reject when quantity is negative", () => {
      const result = createBody.safeParse({
        description: "Test",
        quantity: -1,
        unitPriceHtCents: 5000,
        taxRateBasisPoints: 2000,
      });
      expect(result.success).toBe(false);
    });

    it("should reject when unitPriceHtCents is negative", () => {
      const result = createBody.safeParse({
        description: "Test",
        quantity: 1,
        unitPriceHtCents: -100,
        taxRateBasisPoints: 2000,
      });
      expect(result.success).toBe(false);
    });

    it("should reject when taxRateBasisPoints is negative", () => {
      const result = createBody.safeParse({
        description: "Test",
        quantity: 1,
        unitPriceHtCents: 5000,
        taxRateBasisPoints: -100,
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid input", () => {
      const result = createBody.safeParse({
        description: "Consultation",
        quantity: 2,
        unitPriceHtCents: 5000,
        taxRateBasisPoints: 2000,
      });
      expect(result.success).toBe(true);
    });

    it("should accept with optional position", () => {
      const result = createBody.safeParse({
        description: "Consultation",
        quantity: 2,
        unitPriceHtCents: 5000,
        taxRateBasisPoints: 2000,
        position: 1,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateQuoteItemBody", () => {
    it("should accept partial update", () => {
      const result = updateBody.safeParse({ description: "Updated" });
      expect(result.success).toBe(true);
    });
  });

  describe("reorderBody", () => {
    it("should reject empty items array", () => {
      const result = reorder.safeParse({ items: [] });
      expect(result.success).toBe(false);
    });

    it("should reject when items is missing", () => {
      const result = reorder.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should accept valid reorder input", () => {
      const result = reorder.safeParse({
        items: [
          { id: "item_1", position: 0 },
          { id: "item_2", position: 1 },
        ],
      });
      expect(result.success).toBe(true);
    });
  });
});
