import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafePayment, createTestToken } from "../helpers";

vi.mock("../../../src/services/payments.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockList } from "../../../src/services/__mocks__/payments.service";

describe("GET /api/organizations/:orgId/invoices/:invoiceId/payments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return payments list for invoice", async () => {
    const payment = createSafePayment();
    mockList.mockResolvedValue([payment]);

    const res = await request(app)
      .get("/api/organizations/org_1/invoices/inv_1/payments")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([payment]);
    expect(mockList).toHaveBeenCalledWith({
      organizationId: "org_1",
      invoiceId: "inv_1",
      userId: "user_1",
    });
  });
});
