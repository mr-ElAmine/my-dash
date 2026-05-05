import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeNote, createTestToken } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/notes.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockUpdate } from "../../../src/services/__mocks__/notes.service";

describe("PATCH /api/organizations/:orgId/notes/:noteId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update note content", async () => {
    const note = createSafeNote({ content: "Updated" });
    mockUpdate.mockResolvedValue({ note, links: [] });

    const res = await request(app)
      .patch("/api/organizations/org_1/notes/note_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ content: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ note, links: [] });
  });

  it("should forward fields to service", async () => {
    const note = createSafeNote();
    mockUpdate.mockResolvedValue({ note, links: [] });

    await request(app)
      .patch("/api/organizations/org_1/notes/note_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ content: "Updated", links: [{ targetType: "quote", targetId: "q_1" }] });

    expect(mockUpdate).toHaveBeenCalledWith({
      organizationId: "org_1",
      noteId: "note_1",
      userId: "user_1",
      content: "Updated",
      links: [{ targetType: "quote", targetId: "q_1" }],
    });
  });

  it("should return 404 for missing note", async () => {
    mockUpdate.mockImplementation(() => {
      throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
    });

    const res = await request(app)
      .patch("/api/organizations/org_1/notes/missing")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ content: "Updated" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOTE_NOT_FOUND");
  });
});
