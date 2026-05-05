import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeQuote } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quotes.service");

import { mockSend } from "../../../src/services/__mocks__/quotes.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("POST /api/organizations/:organizationId/quotes/:quoteId/send", () => {
  const orgId = "org_1";
  const quoteId = "quote_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send a draft quote and return 200", async () => {
    const sentAt = new Date();
    const sentQuote = createSafeQuote({ status: "sent", sentAt });
    mockSend.mockResolvedValue(sentQuote);

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/send`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: sentQuote });
    expect(mockSend).toHaveBeenCalledWith({
      organizationId: orgId,
      quoteId,
      userId,
    });
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/send`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should handle quote not draft error", async () => {
    mockSend.mockImplementation(() => {
      throw new AppError("Only draft quotes can be sent", 400, "QUOTE_NOT_DRAFT");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/send`)
      .set(authHeaders(userId));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("QUOTE_NOT_DRAFT");
    expect(res.body.error.message).toBe("Only draft quotes can be sent");
  });

  it("should handle quote not found error", async () => {
    mockSend.mockImplementation(() => {
      throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/send`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("QUOTE_NOT_FOUND");
    expect(res.body.error.message).toBe("Quote not found");
  });

  it("should handle organization not found error", async () => {
    mockSend.mockImplementation(() => {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes/${quoteId}/send`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ORGANIZATION_NOT_FOUND");
    expect(res.body.error.message).toBe("Organization not found");
  });
});
