import { describe, it, expect } from "vitest";
import {
  listInvoicesQuery,
  updateInvoiceBody,
} from "../../../src/validators/invoices.validators";

describe("Invoices Validators", () => {
  describe("listInvoicesQuery", () => {
    it("should apply defaults for page and limit", () => {
      const result = listInvoicesQuery.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should accept valid status values", () => {
      const statuses = [
        "to_send",
        "sent",
        "partially_paid",
        "paid",
        "overdue",
        "cancelled",
      ];
      for (const status of statuses) {
        const result = listInvoicesQuery.safeParse({ status });
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid status", () => {
      const result = listInvoicesQuery.safeParse({ status: "invalid" });
      expect(result.success).toBe(false);
    });

    it("should accept companyId and search", () => {
      const result = listInvoicesQuery.safeParse({
        companyId: "comp_1",
        search: "FAC",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateInvoiceBody", () => {
    it("should accept empty object", () => {
      const result = updateInvoiceBody.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept partial update with dueDate only", () => {
      const result = updateInvoiceBody.safeParse({ dueDate: "2026-06-30" });
      expect(result.success).toBe(true);
    });

    it("should reject negative recoveryFeeCents", () => {
      const result = updateInvoiceBody.safeParse({ recoveryFeeCents: -1 });
      expect(result.success).toBe(false);
    });
  });
});
