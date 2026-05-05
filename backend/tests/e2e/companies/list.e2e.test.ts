import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeCompany, createTestToken } from "../helpers";

vi.mock("../../../src/services/companies.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockList } from "../../../src/services/__mocks__/companies.service";

describe("GET /api/organizations/:orgId/companies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return paginated company list", async () => {
    const company = createSafeCompany();
    mockList.mockResolvedValue({
      data: [company],
      pagination: { page: 1, limit: 20, total: 1 },
    });

    const res = await request(app)
      .get("/api/organizations/org_1/companies")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([company]);
    expect(res.body.pagination).toEqual({ page: 1, limit: 20, total: 1 });
  });

  it("should forward query params to service", async () => {
    mockList.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0 },
    });

    await request(app)
      .get("/api/organizations/org_1/companies?status=prospect&search=test&city=Paris&industry=Tech")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org_1",
        status: "prospect",
        search: "test",
        city: "Paris",
        industry: "Tech",
      }),
    );
  });
});
