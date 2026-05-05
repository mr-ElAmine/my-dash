import { describe, it, expect } from "vitest";
import { generateQuoteNumber, generateInvoiceNumber, isExpired } from "../../../src/utils/dates";

describe("dates utils", () => {
  describe("generateQuoteNumber", () => {
    it("should generate DEV-YYYY-XXXXXXXX format", () => {
      const number = generateQuoteNumber();
      expect(number).toMatch(/^DEV-\d{4}-[A-Z0-9]{8}$/);
    });

    it("should use current year", () => {
      const number = generateQuoteNumber();
      const year = new Date().getFullYear().toString();
      expect(number).toContain(year);
    });

    it("should not contain ambiguous characters (I, O, 0, 1)", () => {
      for (let i = 0; i < 50; i++) {
        const number = generateQuoteNumber();
        const seq = number.split("-")[2];
        expect(seq).not.toMatch(/[IO01]/);
      }
    });
  });

  describe("generateInvoiceNumber", () => {
    it("should generate FAC-YYYY-XXXXXXXX format", () => {
      const number = generateInvoiceNumber();
      expect(number).toMatch(/^FAC-\d{4}-[A-Z0-9]{8}$/);
    });

    it("should use current year", () => {
      const number = generateInvoiceNumber();
      const year = new Date().getFullYear().toString();
      expect(number).toContain(year);
    });
  });

  describe("isExpired", () => {
    it("should return true when date is in the past", () => {
      const past = new Date("2024-01-01");
      expect(isExpired(past)).toBe(true);
    });

    it("should return false when date is in the future", () => {
      const future = new Date("2099-12-31");
      expect(isExpired(future)).toBe(false);
    });

    it("should return true when date is exactly now (edge case)", () => {
      const now = new Date();
      now.setHours(now.getHours() - 1);
      expect(isExpired(now)).toBe(true);
    });
  });
});
