import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeCompany, createTestToken } from "../helpers";

vi.mock("../../../src/services/companies.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockUpdate } from "../../../src/services/__mocks__/companies.service";

describe("PATCH /api/organizations/:orgId/companies/:companyId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update company and return 200", async () => {
    const company = createSafeCompany({ name: "Updated Co" });
    mockUpdate.mockResolvedValue(company);

    const res = await request(app)
      .patch("/api/organizations/org_1/companies/comp_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ name: "Updated Co" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(company);
  });

  it("should forward partial data to service", async () => {
    const company = createSafeCompany();
    mockUpdate.mockResolvedValue(company);

    await request(app)
      .patch("/api/organizations/org_1/companies/comp_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ name: "Updated", billingCity: "Lyon" });

    expect(mockUpdate).toHaveBeenCalledWith({
      organizationId: "org_1",
      companyId: "comp_1",
      userId: "user_1",
      data: { name: "Updated", billingCity: "Lyon" },
    });
  });
});
