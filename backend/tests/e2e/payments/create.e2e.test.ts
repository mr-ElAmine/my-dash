import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafePayment, createSafeInvoice, createTestToken } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/payments.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockRecord } from "../../../src/services/__mocks__/payments.service";

describe("POST /api/organizations/:orgId/invoices/:invoiceId/payments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject when amountCents is missing", async () => {
    const res = await request(app)
      .post("/api/organizations/org_1/invoices/inv_1/payments")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ paymentDate: "2026-05-10", method: "bank_transfer" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "amountCents" })]),
    );
  });

  it("should reject when paymentDate is missing", async () => {
    const res = await request(app)
      .post("/api/organizations/org_1/invoices/inv_1/payments")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ amountCents: 30000, method: "bank_transfer" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "paymentDate" })]),
    );
  });

  it("should reject when method is missing", async () => {
    const res = await request(app)
      .post("/api/organizations/org_1/invoices/inv_1/payments")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ amountCents: 30000, paymentDate: "2026-05-10" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "method" })]),
    );
  });

  it("should reject when method is invalid", async () => {
    const res = await request(app)
      .post("/api/organizations/org_1/invoices/inv_1/payments")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ amountCents: 30000, paymentDate: "2026-05-10", method: "crypto" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should record payment and return 201", async () => {
    const payment = createSafePayment();
    const invoice = createSafeInvoice({ status: "partially_paid" });
    mockRecord.mockResolvedValue({ payment, invoice });

    const res = await request(app)
      .post("/api/organizations/org_1/invoices/inv_1/payments")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ amountCents: 30000, paymentDate: "2026-05-10", method: "bank_transfer" });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ payment, invoice });
  });

  it("should reject when amount exceeds remaining balance", async () => {
    mockRecord.mockImplementation(() => {
      throw new AppError("Payment amount exceeds remaining balance", 400, "PAYMENT_AMOUNT_EXCEEDS_REMAINING");
    });

    const res = await request(app)
      .post("/api/organizations/org_1/invoices/inv_1/payments")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ amountCents: 999999, paymentDate: "2026-05-10", method: "bank_transfer" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("PAYMENT_AMOUNT_EXCEEDS_REMAINING");
  });

  it("should forward all fields to service", async () => {
    const payment = createSafePayment();
    const invoice = createSafeInvoice();
    mockRecord.mockResolvedValue({ payment, invoice });

    await request(app)
      .post("/api/organizations/org_1/invoices/inv_1/payments")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ amountCents: 30000, paymentDate: "2026-05-10", method: "card", reference: "REF-001" });

    expect(mockRecord).toHaveBeenCalledWith({
      organizationId: "org_1",
      invoiceId: "inv_1",
      userId: "user_1",
      amountCents: 30000,
      paymentDate: "2026-05-10",
      method: "card",
      reference: "REF-001",
    });
  });
});
