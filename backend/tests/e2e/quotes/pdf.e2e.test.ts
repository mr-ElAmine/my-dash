import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quotes.service");

import { mockGeneratePdf } from "../../../src/services/__mocks__/quotes.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("GET /api/organizations/:organizationId/quotes/:quoteId/pdf", () => {
  const orgId = "org_1";
  const quoteId = "quote_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should download quote PDF with correct headers", async () => {
    const pdfContent = Buffer.from("%PDF-1.4 fake pdf content");
    mockGeneratePdf.mockResolvedValue(pdfContent);

    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes/${quoteId}/pdf`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    expect(res.headers["content-disposition"]).toBe(
      `attachment; filename="devis-${quoteId}.pdf"`,
    );
    expect(res.body).toEqual(pdfContent);
    expect(mockGeneratePdf).toHaveBeenCalledWith({
      organizationId: orgId,
      quoteId,
      userId,
    });
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes/${quoteId}/pdf`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should handle quote not found error", async () => {
    mockGeneratePdf.mockImplementation(() => {
      throw new AppError("Quote not found", 404, "QUOTE_NOT_FOUND");
    });

    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes/${quoteId}/pdf`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("QUOTE_NOT_FOUND");
    expect(res.body.error.message).toBe("Quote not found");
  });

  it("should handle access denied error", async () => {
    mockGeneratePdf.mockImplementation(() => {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    });

    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes/${quoteId}/pdf`)
      .set(authHeaders(userId));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCESS_DENIED");
    expect(res.body.error.message).toBe("Access denied");
  });
});
