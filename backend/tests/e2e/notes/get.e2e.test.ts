import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeNote, createSafeNoteLink, createTestToken } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/notes.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockGetById } from "../../../src/services/__mocks__/notes.service";

describe("GET /api/organizations/:orgId/notes/:noteId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return note with links", async () => {
    const note = createSafeNote();
    const link = createSafeNoteLink();
    mockGetById.mockResolvedValue({ note, links: [link] });

    const res = await request(app)
      .get("/api/organizations/org_1/notes/note_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ note, links: [link] });
  });

  it("should return 404 for missing note", async () => {
    mockGetById.mockImplementation(() => {
      throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
    });

    const res = await request(app)
      .get("/api/organizations/org_1/notes/missing")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOTE_NOT_FOUND");
  });
});
