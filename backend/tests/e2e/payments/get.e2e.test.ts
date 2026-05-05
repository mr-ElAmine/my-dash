import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafePayment, createTestToken } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/payments.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockGetById } from "../../../src/services/__mocks__/payments.service";

describe("GET /api/organizations/:orgId/payments/:paymentId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return payment detail", async () => {
    const payment = createSafePayment();
    mockGetById.mockResolvedValue(payment);

    const res = await request(app)
      .get("/api/organizations/org_1/payments/pay_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(payment);
    expect(mockGetById).toHaveBeenCalledWith({
      organizationId: "org_1",
      paymentId: "pay_1",
      userId: "user_1",
    });
  });

  it("should return 404 for missing payment", async () => {
    mockGetById.mockImplementation(() => {
      throw new AppError("Payment not found", 404, "PAYMENT_NOT_FOUND");
    });

    const res = await request(app)
      .get("/api/organizations/org_1/payments/missing")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("PAYMENT_NOT_FOUND");
  });
});
