import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeNote, createTestToken } from "../helpers";

vi.mock("../../../src/services/notes.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockList } from "../../../src/services/__mocks__/notes.service";

describe("GET /api/organizations/:orgId/notes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return paginated note list", async () => {
    const note = createSafeNote();
    mockList.mockResolvedValue({
      data: [note],
      pagination: { page: 1, limit: 20, total: 1 },
    });

    const res = await request(app)
      .get("/api/organizations/org_1/notes")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([note]);
    expect(res.body.pagination).toEqual({ page: 1, limit: 20, total: 1 });
  });

  it("should forward query params to service", async () => {
    mockList.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0 },
    });

    await request(app)
      .get("/api/organizations/org_1/notes?targetType=company&targetId=comp_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org_1",
        targetType: "company",
        targetId: "comp_1",
      }),
    );
  });
});
