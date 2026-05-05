import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeCompany, createTestToken } from "../helpers";

vi.mock("../../../src/services/companies.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockGetById } from "../../../src/services/__mocks__/companies.service";

describe("GET /api/organizations/:orgId/companies/:companyId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return company by id", async () => {
    const company = createSafeCompany();
    mockGetById.mockResolvedValue(company);

    const res = await request(app)
      .get("/api/organizations/org_1/companies/comp_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(company);
    expect(mockGetById).toHaveBeenCalledWith({
      organizationId: "org_1",
      companyId: "comp_1",
      userId: "user_1",
    });
  });
});
