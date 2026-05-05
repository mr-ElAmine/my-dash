import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quote-items.service");

import { mockDelete } from "../../../src/services/__mocks__/quote-items.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("DELETE /api/organizations/:organizationId/quotes/:quoteId/items/:itemId", () => {
  const organizationId = "org_1";
  const quoteId = "quote_1";
  const itemId = "qi_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app).delete(
      `/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`,
    );

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should delete a quote item and return 200 with success and totals", async () => {
    const totals = {
      subtotalHtCents: 5000,
      taxAmountCents: 1000,
      totalTtcCents: 6000,
    };
    mockDelete.mockResolvedValue({ success: true, totals });

    const res = await request(app)
      .delete(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      success: true,
      quoteTotals: totals,
    });
    expect(mockDelete).toHaveBeenCalledWith({
      organizationId,
      quoteId,
      itemId,
      userId,
    });
  });

  it("should return 404 when item is not found", async () => {
    mockDelete.mockImplementation(() => {
      throw new AppError("Item not found", 404, "ITEM_NOT_FOUND");
    });

    const res = await request(app)
      .delete(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ITEM_NOT_FOUND");
    expect(res.body.error.message).toBe("Item not found");
  });

  it("should return 400 when quote is not in draft status", async () => {
    mockDelete.mockImplementation(() => {
      throw new AppError("Only draft quotes can be modified", 400, "QUOTE_NOT_DRAFT");
    });

    const res = await request(app)
      .delete(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("QUOTE_NOT_DRAFT");
    expect(res.body.error.message).toBe("Only draft quotes can be modified");
  });

  it("should return 404 when quote is not found", async () => {
    mockDelete.mockImplementation(() => {
      throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
    });

    const res = await request(app)
      .delete(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("QUOTE_NOT_FOUND");
    expect(res.body.error.message).toBe("Quote not found");
  });

  it("should return 403 when user has no access", async () => {
    mockDelete.mockImplementation(() => {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    });

    const res = await request(app)
      .delete(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCESS_DENIED");
    expect(res.body.error.message).toBe("Access denied");
  });
});
