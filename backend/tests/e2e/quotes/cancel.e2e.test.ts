import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeQuote } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quotes.service");

import { mockCancel } from "../../../src/services/__mocks__/quotes.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("POST /api/organizations/:organizationId/quotes/:quoteId/cancel", () => {
  const orgId = "org_1";
  const quoteId = "quote_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should cancel a quote and return 200", async () => {
    const cancelledAt = new Date();
    const cancelledQuote = createSafeQuote({
      status: "cancelled",
      cancelledAt,
      cancelledBy: userId,
    });
    mockCancel.mockResolvedValue(cancelledQuote);

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/cancel`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: cancelledQuote });
    expect(mockCancel).toHaveBeenCalledWith({
      organizationId: orgId,
      quoteId,
      userId,
    });
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/cancel`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should handle accepted quote cannot be cancelled error", async () => {
    mockCancel.mockImplementation(() => {
      throw new AppError("Accepted quotes cannot be cancelled", 400, "QUOTE_ACCEPTED");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/cancel`)
      .set(authHeaders(userId));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("QUOTE_ACCEPTED");
    expect(res.body.error.message).toBe("Accepted quotes cannot be cancelled");
  });

  it("should handle already cancelled quote error", async () => {
    mockCancel.mockImplementation(() => {
      throw new AppError("Quote already cancelled", 400, "QUOTE_ALREADY_CANCELLED");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/cancel`)
      .set(authHeaders(userId));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("QUOTE_ALREADY_CANCELLED");
    expect(res.body.error.message).toBe("Quote already cancelled");
  });

  it("should handle quote not found error", async () => {
    mockCancel.mockImplementation(() => {
      throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/cancel`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("QUOTE_NOT_FOUND");
    expect(res.body.error.message).toBe("Quote not found");
  });
});
