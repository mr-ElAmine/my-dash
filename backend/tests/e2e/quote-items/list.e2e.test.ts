import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeQuoteItem } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quote-items.service");

import { mockList } from "../../../src/services/__mocks__/quote-items.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("GET /api/organizations/:organizationId/quotes/:quoteId/items", () => {
  const organizationId = "org_1";
  const quoteId = "quote_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app).get(
      `/api/organizations/${organizationId}/quotes/${quoteId}/items`,
    );

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 422 when organizationId is empty", async () => {
    const res = await request(app)
      .get(`/api/organizations//quotes/${quoteId}/items`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
  });

  it("should return empty list when quote has no items", async () => {
    mockList.mockResolvedValue([]);

    const res = await request(app)
      .get(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(mockList).toHaveBeenCalledWith({
      organizationId,
      quoteId,
      userId,
    });
  });

  it("should return list of quote items", async () => {
    const item1 = createSafeQuoteItem({ id: "qi_1", position: 0 });
    const item2 = createSafeQuoteItem({ id: "qi_2", position: 1 });
    mockList.mockResolvedValue([item1, item2]);

    const res = await request(app)
      .get(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([item1, item2]);
    expect(mockList).toHaveBeenCalledWith({
      organizationId,
      quoteId,
      userId,
    });
  });

  it("should return 404 when quote is not found", async () => {
    mockList.mockImplementation(() => {
      throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
    });

    const res = await request(app)
      .get(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("QUOTE_NOT_FOUND");
    expect(res.body.error.message).toBe("Quote not found");
  });

  it("should return 403 when user has no access", async () => {
    mockList.mockImplementation(() => {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    });

    const res = await request(app)
      .get(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCESS_DENIED");
    expect(res.body.error.message).toBe("Access denied");
  });
});
