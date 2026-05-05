import { describe, it, expect } from "vitest";
import {
  createNoteBody,
  updateNoteBody,
  listNotesQuery,
} from "../../../src/validators/notes.validators";

describe("Notes Validators", () => {
  describe("createNoteBody", () => {
    it("should reject when content is missing", () => {
      const result = createNoteBody.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject empty content", () => {
      const result = createNoteBody.safeParse({ content: "" });
      expect(result.success).toBe(false);
    });

    it("should accept content without links and default to empty array", () => {
      const result = createNoteBody.safeParse({ content: "A note" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe("A note");
        expect(result.data.links).toEqual([]);
      }
    });

    it("should accept content with links", () => {
      const result = createNoteBody.safeParse({
        content: "Discussed pricing",
        links: [
          { targetType: "company", targetId: "comp_1" },
          { targetType: "invoice", targetId: "inv_1" },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid targetType in link", () => {
      const result = createNoteBody.safeParse({
        content: "A note",
        links: [{ targetType: "project", targetId: "proj_1" }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateNoteBody", () => {
    it("should accept empty object", () => {
      const result = updateNoteBody.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept content only", () => {
      const result = updateNoteBody.safeParse({ content: "Updated note" });
      expect(result.success).toBe(true);
    });

    it("should accept links only", () => {
      const result = updateNoteBody.safeParse({
        links: [{ targetType: "company", targetId: "comp_1" }],
      });
      expect(result.success).toBe(true);
    });

    it("should accept links with empty array", () => {
      const result = updateNoteBody.safeParse({ links: [] });
      expect(result.success).toBe(true);
    });

    it("should reject invalid targetType in link", () => {
      const result = updateNoteBody.safeParse({
        links: [{ targetType: "invalid", targetId: "x" }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("listNotesQuery", () => {
    it("should apply defaults for page and limit", () => {
      const result = listNotesQuery.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should accept valid targetType values", () => {
      const types = ["company", "contact", "quote", "invoice"];
      for (const targetType of types) {
        const result = listNotesQuery.safeParse({ targetType });
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid targetType", () => {
      const result = listNotesQuery.safeParse({ targetType: "project" });
      expect(result.success).toBe(false);
    });

    it("should accept targetId", () => {
      const result = listNotesQuery.safeParse({
        targetType: "company",
        targetId: "comp_1",
      });
      expect(result.success).toBe(true);
    });
  });
});
