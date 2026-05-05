import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeQuote, createSafeQuoteItem, createSafeInvoice } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quotes.service");

import { mockAccept } from "../../../src/services/__mocks__/quotes.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("POST /api/organizations/:organizationId/quotes/:quoteId/accept", () => {
  const orgId = "org_1";
  const quoteId = "quote_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should accept a sent quote and return quote with generated invoice", async () => {
    const acceptedQuote = createSafeQuote({ status: "accepted" });
    const invoice = createSafeInvoice({ organizationId: orgId, quoteId, status: "to_send" });
    mockAccept.mockResolvedValue({ quote: acceptedQuote, invoice });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/accept`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { quote: acceptedQuote, invoice } });
    expect(mockAccept).toHaveBeenCalledWith({
      organizationId: orgId,
      quoteId,
      userId,
    });
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/accept`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should handle quote not sent error", async () => {
    mockAccept.mockImplementation(() => {
      throw new AppError("Only sent quotes can be accepted", 400, "QUOTE_NOT_SENT");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/accept`)
      .set(authHeaders(userId));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("QUOTE_NOT_SENT");
    expect(res.body.error.message).toBe("Only sent quotes can be accepted");
  });

  it("should handle quote not found error", async () => {
    mockAccept.mockImplementation(() => {
      throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/accept`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("QUOTE_NOT_FOUND");
    expect(res.body.error.message).toBe("Quote not found");
  });

  it("should handle access denied error", async () => {
    mockAccept.mockImplementation(() => {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/accept`)
      .set(authHeaders(userId));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCESS_DENIED");
    expect(res.body.error.message).toBe("Access denied");
  });
});
