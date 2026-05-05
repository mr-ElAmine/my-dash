import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeInvoice, createTestToken } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/invoices.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockSend } from "../../../src/services/__mocks__/invoices.service";

describe("POST /api/organizations/:orgId/invoices/:invoiceId/send", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send invoice and return updated invoice", async () => {
    const invoice = createSafeInvoice({ status: "sent" });
    mockSend.mockResolvedValue(invoice);

    const res = await request(app)
      .post("/api/organizations/org_1/invoices/inv_1/send")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(invoice);
    expect(mockSend).toHaveBeenCalledWith({
      organizationId: "org_1",
      invoiceId: "inv_1",
      userId: "user_1",
    });
  });

  it("should reject when invoice is not sendable", async () => {
    mockSend.mockImplementation(() => {
      throw new AppError("Only invoices in 'to_send' status can be sent", 400, "INVOICE_NOT_SENDABLE");
    });

    const res = await request(app)
      .post("/api/organizations/org_1/invoices/inv_1/send")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVOICE_NOT_SENDABLE");
  });
});
