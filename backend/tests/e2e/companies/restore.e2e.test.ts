import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeCompany, createTestToken } from "../helpers";

vi.mock("../../../src/services/companies.service");
vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

import { mockRestore } from "../../../src/services/__mocks__/companies.service";

describe("POST /api/organizations/:orgId/companies/:companyId/restore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should restore company and return 200", async () => {
    const company = createSafeCompany({ status: "prospect" });
    mockRestore.mockResolvedValue(company);

    const res = await request(app)
      .post("/api/organizations/org_1/companies/comp_1/restore")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(company);
    expect(mockRestore).toHaveBeenCalledWith({
      organizationId: "org_1",
      companyId: "comp_1",
      userId: "user_1",
    });
  });
});
