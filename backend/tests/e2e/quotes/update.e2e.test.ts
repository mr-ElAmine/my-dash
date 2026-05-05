import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeQuote } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quotes.service");

import { mockUpdate } from "../../../src/services/__mocks__/quotes.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("PATCH /api/organizations/:organizationId/quotes/:quoteId", () => {
  const orgId = "org_1";
  const quoteId = "quote_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update a draft quote and return 200", async () => {
    const updatedQuote = createSafeQuote({ issueDate: "2026-06-01" });
    mockUpdate.mockResolvedValue(updatedQuote);

    const body = { issueDate: "2026-06-01" };

    const res = await request(app)
      .patch(`/api/organizations/${orgId}/quotes/${quoteId}`)
      .set(authHeaders(userId))
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: updatedQuote });
    expect(mockUpdate).toHaveBeenCalledWith({
      organizationId: orgId,
      quoteId,
      userId,
      data: body,
    });
  });

  it("should update validUntil", async () => {
    const updatedQuote = createSafeQuote({ validUntil: "2026-07-01" });
    mockUpdate.mockResolvedValue(updatedQuote);

    const body = { validUntil: "2026-07-01" };

    const res = await request(app)
      .patch(`/api/organizations/${orgId}/quotes/${quoteId}`)
      .set(authHeaders(userId))
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: updatedQuote });
    expect(mockUpdate).toHaveBeenCalledWith({
      organizationId: orgId,
      quoteId,
      userId,
      data: body,
    });
  });

  it("should update companyId", async () => {
    const updatedQuote = createSafeQuote({ companyId: "comp_2" });
    mockUpdate.mockResolvedValue(updatedQuote);

    const body = { companyId: "comp_2" };

    const res = await request(app)
      .patch(`/api/organizations/${orgId}/quotes/${quoteId}`)
      .set(authHeaders(userId))
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: updatedQuote });
  });

  it("should update contactId to null", async () => {
    const updatedQuote = createSafeQuote({ contactId: null });
    mockUpdate.mockResolvedValue(updatedQuote);

    const body = { contactId: null };

    const res = await request(app)
      .patch(`/api/organizations/${orgId}/quotes/${quoteId}`)
      .set(authHeaders(userId))
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: updatedQuote });
  });

  it("should update multiple fields at once", async () => {
    const updatedQuote = createSafeQuote({ issueDate: "2026-06-01", validUntil: "2026-07-01" });
    mockUpdate.mockResolvedValue(updatedQuote);

    const body = { issueDate: "2026-06-01", validUntil: "2026-07-01" };

    const res = await request(app)
      .patch(`/api/organizations/${orgId}/quotes/${quoteId}`)
      .set(authHeaders(userId))
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: updatedQuote });
  });

  it("should allow empty body (no-op update)", async () => {
    const quote = createSafeQuote();
    mockUpdate.mockResolvedValue(quote);

    const res = await request(app)
      .patch(`/api/organizations/${orgId}/quotes/${quoteId}`)
      .set(authHeaders(userId))
      .send({});

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: quote });
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .patch(`/api/organizations/${orgId}/quotes/${quoteId}`)
      .send({ issueDate: "2026-06-01" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should handle quote not editable error", async () => {
    mockUpdate.mockImplementation(() => {
      throw new AppError("Only draft quotes can be edited", 400, "QUOTE_NOT_EDITABLE");
    });

    const res = await request(app)
      .patch(`/api/organizations/${orgId}/quotes/${quoteId}`)
      .set(authHeaders(userId))
      .send({ issueDate: "2026-06-01" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("QUOTE_NOT_EDITABLE");
    expect(res.body.error.message).toBe("Only draft quotes can be edited");
  });

  it("should handle quote not found error", async () => {
    mockUpdate.mockImplementation(() => {
      throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
    });

    const res = await request(app)
      .patch(`/api/organizations/${orgId}/quotes/${quoteId}`)
      .set(authHeaders(userId))
      .send({ issueDate: "2026-06-01" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("QUOTE_NOT_FOUND");
    expect(res.body.error.message).toBe("Quote not found");
  });
});
