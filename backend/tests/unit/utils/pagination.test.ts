import { describe, it, expect } from "vitest";
import { parsePagination, buildPaginationResponse } from "../../../src/utils/pagination";

describe("pagination utils", () => {
  describe("parsePagination", () => {
    it("should return defaults when no input", () => {
      const result = parsePagination({});
      expect(result).toEqual({ page: 1, limit: 20, offset: 0 });
    });

    it("should parse valid page and limit", () => {
      const result = parsePagination({ page: "2", limit: "10" });
      expect(result).toEqual({ page: 2, limit: 10, offset: 10 });
    });

    it("should clamp page to minimum 1", () => {
      const result = parsePagination({ page: "0" });
      expect(result.page).toBe(1);
    });

    it("should clamp limit to max 100", () => {
      const result = parsePagination({ limit: "200" });
      expect(result.limit).toBe(100);
    });

    it("should default limit when zero or invalid", () => {
      const result = parsePagination({ limit: "0" });
      expect(result.limit).toBe(20);
    });
  });

  describe("buildPaginationResponse", () => {
    it("should build pagination object", () => {
      const result = buildPaginationResponse({ page: 2, limit: 10, total: 45 });
      expect(result).toEqual({
        page: 2,
        limit: 10,
        total: 45,
      });
    });
  });
});
