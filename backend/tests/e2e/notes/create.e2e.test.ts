import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeNote, createSafeNoteLink, createTestToken } from "../helpers";

vi.mock("../../../src/services/notes.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockCreate } from "../../../src/services/__mocks__/notes.service";

describe("POST /api/organizations/:orgId/notes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject when content is missing", async () => {
    const res = await request(app)
      .post("/api/organizations/org_1/notes")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ links: [{ targetType: "company", targetId: "comp_1" }] });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "content" })]),
    );
  });

  it("should create note and return 201", async () => {
    const note = createSafeNote();
    const link = createSafeNoteLink();
    mockCreate.mockResolvedValue({ note, links: [link] });

    const res = await request(app)
      .post("/api/organizations/org_1/notes")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ content: "This is a note", links: [{ targetType: "company", targetId: "comp_1" }] });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ note, links: [link] });
  });

  it("should forward all fields to service", async () => {
    const note = createSafeNote();
    mockCreate.mockResolvedValue({ note, links: [] });

    await request(app)
      .post("/api/organizations/org_1/notes")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ content: "Hello", links: [{ targetType: "invoice", targetId: "inv_1" }] });

    expect(mockCreate).toHaveBeenCalledWith({
      organizationId: "org_1",
      userId: "user_1",
      content: "Hello",
      links: [{ targetType: "invoice", targetId: "inv_1" }],
    });
  });

  it("should create note without links", async () => {
    const note = createSafeNote();
    mockCreate.mockResolvedValue({ note, links: [] });

    const res = await request(app)
      .post("/api/organizations/org_1/notes")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ content: "Just a note" });

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ links: [] }),
    );
  });
});
