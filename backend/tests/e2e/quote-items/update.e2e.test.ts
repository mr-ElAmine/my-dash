import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeQuoteItem } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quote-items.service");

import { mockUpdate } from "../../../src/services/__mocks__/quote-items.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("PATCH /api/organizations/:organizationId/quotes/:quoteId/items/:itemId", () => {
  const organizationId = "org_1";
  const quoteId = "quote_1";
  const itemId = "qi_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app).patch(
      `/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`,
    );

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should update a quote item and return 200 with item and totals", async () => {
    const safeItem = createSafeQuoteItem({
      id: itemId,
      description: "Updated Service",
      quantity: 3,
      unitPriceHtCents: 2000,
      taxRateBasisPoints: 2000,
      lineSubtotalHtCents: 6000,
      lineTaxAmountCents: 1200,
      lineTotalTtcCents: 7200,
    });
    const totals = {
      subtotalHtCents: 6000,
      taxAmountCents: 1200,
      totalTtcCents: 7200,
    };
    mockUpdate.mockResolvedValue({ item: safeItem, totals });

    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId))
      .send({
        description: "Updated Service",
        quantity: 3,
        unitPriceHtCents: 2000,
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      quoteItem: safeItem,
      quoteTotals: totals,
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      organizationId,
      quoteId,
      itemId,
      userId,
      data: {
        description: "Updated Service",
        quantity: 3,
        unitPriceHtCents: 2000,
      },
    });
  });

  it("should update only the description", async () => {
    const safeItem = createSafeQuoteItem({
      id: itemId,
      description: "New description",
    });
    const totals = {
      subtotalHtCents: 1000,
      taxAmountCents: 200,
      totalTtcCents: 1200,
    };
    mockUpdate.mockResolvedValue({ item: safeItem, totals });

    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId))
      .send({ description: "New description" });

    expect(res.status).toBe(200);
    expect(res.body.data.quoteItem).toEqual(safeItem);
    expect(mockUpdate).toHaveBeenCalledWith({
      organizationId,
      quoteId,
      itemId,
      userId,
      data: { description: "New description" },
    });
  });

  it("should update only the tax rate", async () => {
    const safeItem = createSafeQuoteItem({
      id: itemId,
      taxRateBasisPoints: 1000,
      lineTaxAmountCents: 100,
      lineTotalTtcCents: 1100,
    });
    const totals = {
      subtotalHtCents: 1000,
      taxAmountCents: 100,
      totalTtcCents: 1100,
    };
    mockUpdate.mockResolvedValue({ item: safeItem, totals });

    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId))
      .send({ taxRateBasisPoints: 1000 });

    expect(res.status).toBe(200);
    expect(res.body.data.quoteItem).toEqual(safeItem);
    expect(mockUpdate).toHaveBeenCalledWith({
      organizationId,
      quoteId,
      itemId,
      userId,
      data: { taxRateBasisPoints: 1000 },
    });
  });

  it("should update the position", async () => {
    const safeItem = createSafeQuoteItem({ id: itemId, position: 3 });
    const totals = {
      subtotalHtCents: 1000,
      taxAmountCents: 200,
      totalTtcCents: 1200,
    };
    mockUpdate.mockResolvedValue({ item: safeItem, totals });

    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId))
      .send({ position: 3 });

    expect(res.status).toBe(200);
    expect(res.body.data.quoteItem).toEqual(safeItem);
    expect(mockUpdate).toHaveBeenCalledWith({
      organizationId,
      quoteId,
      itemId,
      userId,
      data: { position: 3 },
    });
  });

  it("should return 404 when item is not found", async () => {
    mockUpdate.mockImplementation(() => {
      throw new AppError("Item not found", 404, "ITEM_NOT_FOUND");
    });

    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId))
      .send({ description: "Updated" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ITEM_NOT_FOUND");
    expect(res.body.error.message).toBe("Item not found");
  });

  it("should return 400 when quote is not in draft status", async () => {
    mockUpdate.mockImplementation(() => {
      throw new AppError("Only draft quotes can be modified", 400, "QUOTE_NOT_DRAFT");
    });

    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId))
      .send({ description: "Updated" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("QUOTE_NOT_DRAFT");
    expect(res.body.error.message).toBe("Only draft quotes can be modified");
  });

  it("should return 422 when quantity is zero", async () => {
    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId))
      .send({ quantity: 0 });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "quantity" }),
      ]),
    );
  });

  it("should return 422 when unitPriceHtCents is negative", async () => {
    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId))
      .send({ unitPriceHtCents: -100 });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "unitPriceHtCents" }),
      ]),
    );
  });

  it("should return 422 when taxRateBasisPoints is negative", async () => {
    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId))
      .send({ taxRateBasisPoints: -100 });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "taxRateBasisPoints" }),
      ]),
    );
  });

  it("should return 403 when user has no access", async () => {
    mockUpdate.mockImplementation(() => {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    });

    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/${itemId}`)
      .set(authHeaders(userId))
      .send({ description: "Updated" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCESS_DENIED");
    expect(res.body.error.message).toBe("Access denied");
  });
});
