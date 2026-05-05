import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeQuote } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quotes.service");

import { mockRefuse } from "../../../src/services/__mocks__/quotes.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("POST /api/organizations/:organizationId/quotes/:quoteId/refuse", () => {
  const orgId = "org_1";
  const quoteId = "quote_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should refuse a sent quote and return 200", async () => {
    const refusedAt = new Date();
    const refusedQuote = createSafeQuote({ status: "refused", refusedAt });
    mockRefuse.mockResolvedValue(refusedQuote);

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/refuse`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: refusedQuote });
    expect(mockRefuse).toHaveBeenCalledWith({
      organizationId: orgId,
      quoteId,
      userId,
    });
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/refuse`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should handle quote not sent error", async () => {
    mockRefuse.mockImplementation(() => {
      throw new AppError("Only sent quotes can be refused", 400, "QUOTE_NOT_SENT");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/refuse`)
      .set(authHeaders(userId));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("QUOTE_NOT_SENT");
    expect(res.body.error.message).toBe("Only sent quotes can be refused");
  });

  it("should handle quote not found error", async () => {
    mockRefuse.mockImplementation(() => {
      throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/refuse`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("QUOTE_NOT_FOUND");
    expect(res.body.error.message).toBe("Quote not found");
  });
});
