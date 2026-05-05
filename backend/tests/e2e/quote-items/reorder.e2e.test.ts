import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeQuoteItem } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quote-items.service");

import { mockReorder } from "../../../src/services/__mocks__/quote-items.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("PATCH /api/organizations/:organizationId/quotes/:quoteId/items/reorder", () => {
  const organizationId = "org_1";
  const quoteId = "quote_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app).patch(
      `/api/organizations/${organizationId}/quotes/${quoteId}/items/reorder`,
    );

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 422 when items array is missing", async () => {
    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/reorder`)
      .set(authHeaders(userId))
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "items" }),
      ]),
    );
  });

  it("should return 422 when items array is empty", async () => {
    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/reorder`)
      .set(authHeaders(userId))
      .send({ items: [] });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "items" }),
      ]),
    );
  });

  it("should return 422 when an item is missing id", async () => {
    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/reorder`)
      .set(authHeaders(userId))
      .send({ items: [{ position: 0 }] });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 422 when an item is missing position", async () => {
    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/reorder`)
      .set(authHeaders(userId))
      .send({ items: [{ id: "qi_1" }] });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should reorder items and return 200 with reordered list", async () => {
    const reorderedItem1 = createSafeQuoteItem({ id: "qi_1", position: 1 });
    const reorderedItem2 = createSafeQuoteItem({ id: "qi_2", position: 0 });
    mockReorder.mockResolvedValue([reorderedItem2, reorderedItem1]);

    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/reorder`)
      .set(authHeaders(userId))
      .send({
        items: [
          { id: "qi_1", position: 1 },
          { id: "qi_2", position: 0 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([reorderedItem2, reorderedItem1]);
    expect(mockReorder).toHaveBeenCalledWith({
      organizationId,
      quoteId,
      userId,
      items: [
        { id: "qi_1", position: 1 },
        { id: "qi_2", position: 0 },
      ],
    });
  });

  it("should reorder a single item", async () => {
    const reorderedItem = createSafeQuoteItem({ id: "qi_1", position: 5 });
    mockReorder.mockResolvedValue([reorderedItem]);

    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/reorder`)
      .set(authHeaders(userId))
      .send({ items: [{ id: "qi_1", position: 5 }] });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([reorderedItem]);
    expect(mockReorder).toHaveBeenCalledWith({
      organizationId,
      quoteId,
      userId,
      items: [{ id: "qi_1", position: 5 }],
    });
  });

  it("should return 400 when quote is not in draft status", async () => {
    mockReorder.mockImplementation(() => {
      throw new AppError("Only draft quotes can be modified", 400, "QUOTE_NOT_DRAFT");
    });

    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/reorder`)
      .set(authHeaders(userId))
      .send({ items: [{ id: "qi_1", position: 0 }] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("QUOTE_NOT_DRAFT");
    expect(res.body.error.message).toBe("Only draft quotes can be modified");
  });

  it("should return 404 when quote is not found", async () => {
    mockReorder.mockImplementation(() => {
      throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
    });

    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/reorder`)
      .set(authHeaders(userId))
      .send({ items: [{ id: "qi_1", position: 0 }] });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("QUOTE_NOT_FOUND");
    expect(res.body.error.message).toBe("Quote not found");
  });

  it("should return 403 when user has no access", async () => {
    mockReorder.mockImplementation(() => {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    });

    const res = await request(app)
      .patch(`/api/organizations/${organizationId}/quotes/${quoteId}/items/reorder`)
      .set(authHeaders(userId))
      .send({ items: [{ id: "qi_1", position: 0 }] });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCESS_DENIED");
    expect(res.body.error.message).toBe("Access denied");
  });
});
