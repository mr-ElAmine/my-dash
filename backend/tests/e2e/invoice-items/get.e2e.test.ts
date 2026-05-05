import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeInvoiceItem, createTestToken } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/invoice-items.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockGetById } from "../../../src/services/__mocks__/invoice-items.service";

describe("GET /api/organizations/:orgId/invoices/:invoiceId/items/:itemId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a single invoice item", async () => {
    const item = createSafeInvoiceItem();
    mockGetById.mockResolvedValue(item);

    const res = await request(app)
      .get("/api/organizations/org_1/invoices/inv_1/items/inv_item_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(item);
    expect(mockGetById).toHaveBeenCalledWith({
      organizationId: "org_1",
      invoiceId: "inv_1",
      itemId: "inv_item_1",
      userId: "user_1",
    });
  });

  it("should return 404 for missing item", async () => {
    mockGetById.mockImplementation(() => {
      throw new AppError("Invoice item not found", 404, "INVOICE_ITEM_NOT_FOUND");
    });

    const res = await request(app)
      .get("/api/organizations/org_1/invoices/inv_1/items/missing")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("INVOICE_ITEM_NOT_FOUND");
  });
});
