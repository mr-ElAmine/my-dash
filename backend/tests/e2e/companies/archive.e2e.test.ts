import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeCompany, createTestToken } from "../helpers";

vi.mock("../../../src/services/companies.service");
vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

import { mockArchive } from "../../../src/services/__mocks__/companies.service";

describe("POST /api/organizations/:orgId/companies/:companyId/archive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should archive company and return 200", async () => {
    const company = createSafeCompany({ status: "archived" });
    mockArchive.mockResolvedValue(company);

    const res = await request(app)
      .post("/api/organizations/org_1/companies/comp_1/archive")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(company);
    expect(mockArchive).toHaveBeenCalledWith({
      organizationId: "org_1",
      companyId: "comp_1",
      userId: "user_1",
    });
  });
});
