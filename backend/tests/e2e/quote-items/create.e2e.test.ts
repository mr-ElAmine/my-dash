import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeQuoteItem } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quote-items.service");

import { mockAdd } from "../../../src/services/__mocks__/quote-items.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("POST /api/organizations/:organizationId/quotes/:quoteId/items", () => {
  const organizationId = "org_1";
  const quoteId = "quote_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app).post(
      `/api/organizations/${organizationId}/quotes/${quoteId}/items`,
    );

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 422 when description is missing", async () => {
    const res = await request(app)
      .post(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId))
      .send({
        quantity: 1,
        unitPriceHtCents: 1000,
        taxRateBasisPoints: 2000,
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "description" }),
      ]),
    );
  });

  it("should return 422 when quantity is missing", async () => {
    const res = await request(app)
      .post(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId))
      .send({
        description: "Service A",
        unitPriceHtCents: 1000,
        taxRateBasisPoints: 2000,
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "quantity" }),
      ]),
    );
  });

  it("should return 422 when quantity is zero", async () => {
    const res = await request(app)
      .post(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId))
      .send({
        description: "Service A",
        quantity: 0,
        unitPriceHtCents: 1000,
        taxRateBasisPoints: 2000,
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "quantity" }),
      ]),
    );
  });

  it("should return 422 when unitPriceHtCents is missing", async () => {
    const res = await request(app)
      .post(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId))
      .send({
        description: "Service A",
        quantity: 1,
        taxRateBasisPoints: 2000,
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "unitPriceHtCents" }),
      ]),
    );
  });

  it("should return 422 when taxRateBasisPoints is missing", async () => {
    const res = await request(app)
      .post(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId))
      .send({
        description: "Service A",
        quantity: 1,
        unitPriceHtCents: 1000,
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "taxRateBasisPoints" }),
      ]),
    );
  });

  it("should return 422 when unitPriceHtCents is negative", async () => {
    const res = await request(app)
      .post(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId))
      .send({
        description: "Service A",
        quantity: 1,
        unitPriceHtCents: -500,
        taxRateBasisPoints: 2000,
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "unitPriceHtCents" }),
      ]),
    );
  });

  it("should create a quote item and return 201 with item and totals", async () => {
    const safeItem = createSafeQuoteItem({
      id: "qi_new",
      description: "Service A",
      quantity: 2,
      unitPriceHtCents: 5000,
      taxRateBasisPoints: 2000,
      lineSubtotalHtCents: 10000,
      lineTaxAmountCents: 2000,
      lineTotalTtcCents: 12000,
      position: 0,
    });
    const totals = {
      subtotalHtCents: 10000,
      taxAmountCents: 2000,
      totalTtcCents: 12000,
    };
    mockAdd.mockResolvedValue({ item: safeItem, totals });

    const res = await request(app)
      .post(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId))
      .send({
        description: "Service A",
        quantity: 2,
        unitPriceHtCents: 5000,
        taxRateBasisPoints: 2000,
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({
      quoteItem: safeItem,
      quoteTotals: totals,
    });
    expect(mockAdd).toHaveBeenCalledWith({
      organizationId,
      quoteId,
      userId,
      description: "Service A",
      quantity: 2,
      unitPriceHtCents: 5000,
      taxRateBasisPoints: 2000,
      position: undefined,
    });
  });

  it("should create a quote item with optional position", async () => {
    const safeItem = createSafeQuoteItem({
      id: "qi_new",
      description: "Service B",
      quantity: 1,
      unitPriceHtCents: 3000,
      taxRateBasisPoints: 1000,
      lineSubtotalHtCents: 3000,
      lineTaxAmountCents: 300,
      lineTotalTtcCents: 3300,
      position: 2,
    });
    const totals = {
      subtotalHtCents: 3000,
      taxAmountCents: 300,
      totalTtcCents: 3300,
    };
    mockAdd.mockResolvedValue({ item: safeItem, totals });

    const res = await request(app)
      .post(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId))
      .send({
        description: "Service B",
        quantity: 1,
        unitPriceHtCents: 3000,
        taxRateBasisPoints: 1000,
        position: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({
      quoteItem: safeItem,
      quoteTotals: totals,
    });
    expect(mockAdd).toHaveBeenCalledWith({
      organizationId,
      quoteId,
      userId,
      description: "Service B",
      quantity: 1,
      unitPriceHtCents: 3000,
      taxRateBasisPoints: 1000,
      position: 2,
    });
  });

  it("should return 400 when quote is not in draft status", async () => {
    mockAdd.mockImplementation(() => {
      throw new AppError("Only draft quotes can be modified", 400, "QUOTE_NOT_DRAFT");
    });

    const res = await request(app)
      .post(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId))
      .send({
        description: "Service A",
        quantity: 1,
        unitPriceHtCents: 1000,
        taxRateBasisPoints: 2000,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("QUOTE_NOT_DRAFT");
    expect(res.body.error.message).toBe("Only draft quotes can be modified");
  });

  it("should return 404 when quote is not found", async () => {
    mockAdd.mockImplementation(() => {
      throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
    });

    const res = await request(app)
      .post(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId))
      .send({
        description: "Service A",
        quantity: 1,
        unitPriceHtCents: 1000,
        taxRateBasisPoints: 2000,
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("QUOTE_NOT_FOUND");
    expect(res.body.error.message).toBe("Quote not found");
  });

  it("should return 403 when user has no access", async () => {
    mockAdd.mockImplementation(() => {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    });

    const res = await request(app)
      .post(`/api/organizations/${organizationId}/quotes/${quoteId}/items`)
      .set(authHeaders(userId))
      .send({
        description: "Service A",
        quantity: 1,
        unitPriceHtCents: 1000,
        taxRateBasisPoints: 2000,
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCESS_DENIED");
    expect(res.body.error.message).toBe("Access denied");
  });
});
