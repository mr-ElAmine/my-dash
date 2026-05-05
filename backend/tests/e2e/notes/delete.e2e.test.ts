import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createTestToken } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/notes.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockDelete } from "../../../src/services/__mocks__/notes.service";

describe("DELETE /api/organizations/:orgId/notes/:noteId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete note and return success", async () => {
    mockDelete.mockResolvedValue({ success: true });

    const res = await request(app)
      .delete("/api/organizations/org_1/notes/note_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalledWith({
      organizationId: "org_1",
      noteId: "note_1",
      userId: "user_1",
    });
  });

  it("should return 404 for missing note", async () => {
    mockDelete.mockImplementation(() => {
      throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
    });

    const res = await request(app)
      .delete("/api/organizations/org_1/notes/missing")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOTE_NOT_FOUND");
  });
});
