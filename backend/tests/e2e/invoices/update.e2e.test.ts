import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeInvoice, createTestToken } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/invoices.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockUpdate } from "../../../src/services/__mocks__/invoices.service";

describe("PATCH /api/organizations/:orgId/invoices/:invoiceId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update invoice metadata", async () => {
    const invoice = createSafeInvoice({ dueDate: "2026-07-03" });
    mockUpdate.mockResolvedValue(invoice);

    const res = await request(app)
      .patch("/api/organizations/org_1/invoices/inv_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ dueDate: "2026-07-03" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(invoice);
  });

  it("should reject when invoice is not editable", async () => {
    mockUpdate.mockImplementation(() => {
      throw new AppError("Only invoices in 'to_send' status can be edited", 400, "INVOICE_NOT_EDITABLE");
    });

    const res = await request(app)
      .patch("/api/organizations/org_1/invoices/inv_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ dueDate: "2026-07-03" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVOICE_NOT_EDITABLE");
  });

  it("should forward fields to service", async () => {
    const invoice = createSafeInvoice();
    mockUpdate.mockResolvedValue(invoice);

    await request(app)
      .patch("/api/organizations/org_1/invoices/inv_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ dueDate: "2026-07-03", paymentTerms: "Net 30" });

    expect(mockUpdate).toHaveBeenCalledWith({
      organizationId: "org_1",
      invoiceId: "inv_1",
      userId: "user_1",
      data: { dueDate: "2026-07-03", paymentTerms: "Net 30" },
    });
  });
});
