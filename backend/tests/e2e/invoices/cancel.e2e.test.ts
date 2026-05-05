import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeInvoice, createTestToken } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/invoices.service");
vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

import { mockCancel } from "../../../src/services/__mocks__/invoices.service";

describe("POST /api/organizations/:orgId/invoices/:invoiceId/cancel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should cancel invoice and return updated invoice", async () => {
    const invoice = createSafeInvoice({ status: "cancelled" });
    mockCancel.mockResolvedValue(invoice);

    const res = await request(app)
      .post("/api/organizations/org_1/invoices/inv_1/cancel")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(invoice);
    expect(mockCancel).toHaveBeenCalledWith({
      organizationId: "org_1",
      invoiceId: "inv_1",
      userId: "user_1",
    });
  });

  it("should reject when invoice is already cancelled", async () => {
    mockCancel.mockImplementation(() => {
      throw new AppError("Invoice already cancelled", 400, "INVOICE_ALREADY_CANCELLED");
    });

    const res = await request(app)
      .post("/api/organizations/org_1/invoices/inv_1/cancel")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVOICE_ALREADY_CANCELLED");
  });

  it("should reject when invoice is paid", async () => {
    mockCancel.mockImplementation(() => {
      throw new AppError("Paid invoices cannot be cancelled", 400, "INVOICE_PAID");
    });

    const res = await request(app)
      .post("/api/organizations/org_1/invoices/inv_1/cancel")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVOICE_PAID");
  });
});
