import { describe, it, expect } from "vitest";
import { createPaymentBody } from "../../../src/validators/payments.validators";

describe("Payments Validators", () => {
  describe("createPaymentBody", () => {
    it("should reject when amountCents is missing", () => {
      const result = createPaymentBody.safeParse({
        paymentDate: "2026-05-03",
        method: "bank_transfer",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when amountCents is 0", () => {
      const result = createPaymentBody.safeParse({
        amountCents: 0,
        paymentDate: "2026-05-03",
        method: "bank_transfer",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when amountCents is negative", () => {
      const result = createPaymentBody.safeParse({
        amountCents: -100,
        paymentDate: "2026-05-03",
        method: "bank_transfer",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when paymentDate is missing", () => {
      const result = createPaymentBody.safeParse({
        amountCents: 5000,
        method: "bank_transfer",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when method is missing", () => {
      const result = createPaymentBody.safeParse({
        amountCents: 5000,
        paymentDate: "2026-05-03",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid method", () => {
      const result = createPaymentBody.safeParse({
        amountCents: 5000,
        paymentDate: "2026-05-03",
        method: "crypto",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid input with reference", () => {
      const result = createPaymentBody.safeParse({
        amountCents: 5000,
        paymentDate: "2026-05-03",
        method: "bank_transfer",
        reference: "REF-123",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid input without reference", () => {
      const result = createPaymentBody.safeParse({
        amountCents: 5000,
        paymentDate: "2026-05-03",
        method: "card",
      });
      expect(result.success).toBe(true);
    });

    it("should accept all valid methods", () => {
      const methods = ["bank_transfer", "card", "cash", "cheque", "other"];
      for (const method of methods) {
        const result = createPaymentBody.safeParse({
          amountCents: 1000,
          paymentDate: "2026-05-03",
          method,
        });
        expect(result.success).toBe(true);
      }
    });
  });
});
