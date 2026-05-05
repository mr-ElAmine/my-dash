import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeInvoice, createSafeInvoiceItem, createSafePayment, createTestToken } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/invoices.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockGetById } from "../../../src/services/__mocks__/invoices.service";

describe("GET /api/organizations/:orgId/invoices/:invoiceId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return invoice with items and payments", async () => {
    const invoice = createSafeInvoice();
    const item = createSafeInvoiceItem();
    const payment = createSafePayment();
    mockGetById.mockResolvedValue({ invoice, items: [item], payments: [payment] });

    const res = await request(app)
      .get("/api/organizations/org_1/invoices/inv_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ invoice, items: [item], payments: [payment] });
  });

  it("should return 404 for missing invoice", async () => {
    mockGetById.mockImplementation(() => {
      throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
    });

    const res = await request(app)
      .get("/api/organizations/org_1/invoices/missing")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("INVOICE_NOT_FOUND");
  });
});
