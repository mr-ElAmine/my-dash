import { describe, it, expect } from "vitest";
import {
  listInvoiceItemsSchema,
  getInvoiceItemSchema,
} from "../../../src/validators/invoice-items.validators";

describe("Invoice Items Validators", () => {
  describe("listInvoiceItemsSchema.params", () => {
    it("should reject when organizationId is missing", () => {
      const result = listInvoiceItemsSchema.params.safeParse({
        invoiceId: "inv_1",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when invoiceId is missing", () => {
      const result = listInvoiceItemsSchema.params.safeParse({
        organizationId: "org_1",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid params", () => {
      const result = listInvoiceItemsSchema.params.safeParse({
        organizationId: "org_1",
        invoiceId: "inv_1",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("getInvoiceItemSchema.params", () => {
    it("should reject when itemId is missing", () => {
      const result = getInvoiceItemSchema.params.safeParse({
        organizationId: "org_1",
        invoiceId: "inv_1",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid params", () => {
      const result = getInvoiceItemSchema.params.safeParse({
        organizationId: "org_1",
        invoiceId: "inv_1",
        itemId: "item_1",
      });
      expect(result.success).toBe(true);
    });
  });
});
