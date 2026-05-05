import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeQuote, createSafeQuoteItem } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quotes.service");

import { mockGetById } from "../../../src/services/__mocks__/quotes.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("GET /api/organizations/:organizationId/quotes/:quoteId", () => {
  const orgId = "org_1";
  const quoteId = "quote_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a quote with its items", async () => {
    const quote = createSafeQuote();
    const item = createSafeQuoteItem();
    mockGetById.mockResolvedValue({ quote, items: [item] });

    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes/${quoteId}`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { quote, items: [item] } });
    expect(mockGetById).toHaveBeenCalledWith({
      organizationId: orgId,
      quoteId,
      userId,
    });
  });

  it("should return a quote with empty items array", async () => {
    const quote = createSafeQuote();
    mockGetById.mockResolvedValue({ quote, items: [] });

    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes/${quoteId}`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { quote, items: [] } });
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes/${quoteId}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 422 when organizationId is empty", async () => {
    const res = await request(app)
      .get(`/api/organizations//quotes/${quoteId}`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
  });

  it("should handle quote not found error", async () => {
    mockGetById.mockImplementation(() => {
      throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
    });

    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes/${quoteId}`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("QUOTE_NOT_FOUND");
    expect(res.body.error.message).toBe("Quote not found");
  });

  it("should handle access denied error", async () => {
    mockGetById.mockImplementation(() => {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    });

    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes/${quoteId}`)
      .set(authHeaders(userId));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCESS_DENIED");
    expect(res.body.error.message).toBe("Access denied");
  });
});
