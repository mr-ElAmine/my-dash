import { describe, it, expect } from "vitest";
import {
  calculateLineSubtotal,
  calculateLineTax,
  calculateLineTotal,
  calculateTotals,
  formatCents,
  validatePaymentAmount,
} from "../../../src/utils/money";

describe("money utils", () => {
  describe("calculateLineSubtotal", () => {
    it("should calculate quantity * unit price", () => {
      expect(calculateLineSubtotal(3, 10_00)).toBe(30_00);
    });

    it("should handle zero quantity", () => {
      expect(calculateLineSubtotal(0, 10_00)).toBe(0);
    });

    it("should handle decimal quantities", () => {
      expect(calculateLineSubtotal(2.5, 100_00)).toBe(250_00);
    });
  });

  describe("calculateLineTax", () => {
    it("should calculate 20% tax", () => {
      expect(calculateLineTax(100_00, 2000)).toBe(20_00);
    });

    it("should calculate 10% tax", () => {
      expect(calculateLineTax(100_00, 1000)).toBe(10_00);
    });

    it("should calculate 5.5% tax", () => {
      expect(calculateLineTax(100_00, 550)).toBe(5_50);
    });

    it("should handle 0% tax", () => {
      expect(calculateLineTax(100_00, 0)).toBe(0);
    });

    it("should round fractional cents", () => {
      // 1 cent * 20% = 0.2 → rounds to 0
      expect(calculateLineTax(1, 2000)).toBe(0);
      // 5 cents * 20% = 1
      expect(calculateLineTax(5, 2000)).toBe(1);
      // 10 cents * 20% = 2
      expect(calculateLineTax(10, 2000)).toBe(2);
    });
  });

  describe("calculateLineTotal", () => {
    it("should return subtotal + tax", () => {
      expect(calculateLineTotal(100_00, 20_00)).toBe(120_00);
    });
  });

  describe("calculateTotals", () => {
    it("should sum all line items", () => {
      const lines = [
        { lineSubtotalHtCents: 100_00, lineTaxAmountCents: 20_00, lineTotalTtcCents: 120_00 },
        { lineSubtotalHtCents: 50_00, lineTaxAmountCents: 5_50, lineTotalTtcCents: 55_50 },
      ];
      const result = calculateTotals(lines);
      expect(result).toEqual({
        subtotalHtCents: 150_00,
        taxAmountCents: 25_50,
        totalTtcCents: 175_50,
      });
    });

    it("should handle empty items", () => {
      const result = calculateTotals([]);
      expect(result).toEqual({
        subtotalHtCents: 0,
        taxAmountCents: 0,
        totalTtcCents: 0,
      });
    });
  });

  describe("formatCents", () => {
    it("should format cents to euro string", () => {
      expect(formatCents(120_00)).toBe("120.00");
    });

    it("should format zero", () => {
      expect(formatCents(0)).toBe("0.00");
    });

    it("should format small amounts", () => {
      expect(formatCents(5_50)).toBe("5.50");
    });
  });

  describe("validatePaymentAmount", () => {
    it("should accept valid payment amount", () => {
      expect(validatePaymentAmount(50_00, 100_00)).toBe(true);
    });

    it("should accept exact payment", () => {
      expect(validatePaymentAmount(100_00, 100_00)).toBe(true);
    });

    it("should reject zero payment", () => {
      expect(validatePaymentAmount(0, 100_00)).toBe(false);
    });

    it("should reject negative payment", () => {
      expect(validatePaymentAmount(-10_00, 100_00)).toBe(false);
    });

    it("should reject payment exceeding remaining", () => {
      expect(validatePaymentAmount(150_00, 100_00)).toBe(false);
    });
  });
});
