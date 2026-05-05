import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeInvoiceItem, createTestToken } from "../helpers";

vi.mock("../../../src/services/invoice-items.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockList } from "../../../src/services/__mocks__/invoice-items.service";

describe("GET /api/organizations/:orgId/invoices/:invoiceId/items", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return invoice items list", async () => {
    const item = createSafeInvoiceItem();
    mockList.mockResolvedValue([item]);

    const res = await request(app)
      .get("/api/organizations/org_1/invoices/inv_1/items")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([item]);
    expect(mockList).toHaveBeenCalledWith({
      organizationId: "org_1",
      invoiceId: "inv_1",
      userId: "user_1",
    });
  });
});
