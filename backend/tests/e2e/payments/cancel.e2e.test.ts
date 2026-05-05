import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafePayment, createSafeInvoice, createTestToken } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/payments.service");
vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

import { mockCancel } from "../../../src/services/__mocks__/payments.service";

describe("POST /api/organizations/:orgId/payments/:paymentId/cancel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should cancel payment and return updated payment and invoice", async () => {
    const payment = createSafePayment({ status: "cancelled" });
    const invoice = createSafeInvoice({ paidAmountCents: 0 });
    mockCancel.mockResolvedValue({ payment, invoice });

    const res = await request(app)
      .post("/api/organizations/org_1/payments/pay_1/cancel")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ payment, invoice });
    expect(mockCancel).toHaveBeenCalledWith({
      organizationId: "org_1",
      paymentId: "pay_1",
      userId: "user_1",
    });
  });

  it("should return 404 for missing payment", async () => {
    mockCancel.mockImplementation(() => {
      throw new AppError("Payment not found", 404, "PAYMENT_NOT_FOUND");
    });

    const res = await request(app)
      .post("/api/organizations/org_1/payments/missing/cancel")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("PAYMENT_NOT_FOUND");
  });

  it("should reject when payment already cancelled", async () => {
    mockCancel.mockImplementation(() => {
      throw new AppError("Payment already cancelled", 400, "PAYMENT_ALREADY_CANCELLED");
    });

    const res = await request(app)
      .post("/api/organizations/org_1/payments/pay_1/cancel")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("PAYMENT_ALREADY_CANCELLED");
  });
});
