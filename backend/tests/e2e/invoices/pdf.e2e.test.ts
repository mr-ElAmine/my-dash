import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createTestToken } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/invoices.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockGeneratePdf } from "../../../src/services/__mocks__/invoices.service";

describe("GET /api/organizations/:orgId/invoices/:invoiceId/pdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return PDF buffer", async () => {
    const pdfBuffer = Buffer.from("fake-pdf-content");
    mockGeneratePdf.mockResolvedValue(pdfBuffer);

    const res = await request(app)
      .get("/api/organizations/org_1/invoices/inv_1/pdf")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    expect(res.headers["content-disposition"]).toContain("facture-inv_1.pdf");
    expect(mockGeneratePdf).toHaveBeenCalledWith({
      organizationId: "org_1",
      invoiceId: "inv_1",
      userId: "user_1",
    });
  });

  it("should return 404 for missing invoice", async () => {
    mockGeneratePdf.mockImplementation(() => {
      throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
    });

    const res = await request(app)
      .get("/api/organizations/org_1/invoices/missing/pdf")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("INVOICE_NOT_FOUND");
  });
});
