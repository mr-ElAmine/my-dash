import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeInvoice } from "../helpers";

vi.mock("../../../src/services/invoices.service");
vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

import { mockList } from "../../../src/services/__mocks__/invoices.service";
import { createTestToken } from "../helpers";

describe("GET /api/organizations/:orgId/invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return paginated invoice list", async () => {
    const invoice = createSafeInvoice();
    mockList.mockResolvedValue({
      data: [invoice],
      pagination: { page: 1, limit: 20, total: 1 },
    });

    const res = await request(app)
      .get("/api/organizations/org_1/invoices")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([invoice]);
    expect(res.body.pagination).toEqual({ page: 1, limit: 20, total: 1 });
  });

  it("should forward query params to service", async () => {
    mockList.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0 },
    });

    await request(app)
      .get("/api/organizations/org_1/invoices?status=sent&companyId=comp_1&page=2")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org_1",
        status: "sent",
        companyId: "comp_1",
        page: 2,
      }),
    );
  });

  it("should reject invalid status", async () => {
    const res = await request(app)
      .get("/api/organizations/org_1/invoices?status=invalid")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(422);
  });
});
