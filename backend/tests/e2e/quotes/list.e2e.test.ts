import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeQuote } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quotes.service");

import { mockList } from "../../../src/services/__mocks__/quotes.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("GET /api/organizations/:organizationId/quotes", () => {
  const orgId = "org_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return paginated quotes list", async () => {
    const quote = createSafeQuote();
    const pagination = { page: 1, limit: 20, total: 1 };
    mockList.mockResolvedValue({ data: [quote], pagination });

    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [quote], pagination });
    expect(mockList).toHaveBeenCalledWith({
      organizationId: orgId,
      userId,
      page: 1,
      limit: 20,
      offset: 0,
      status: undefined,
      companyId: undefined,
      search: undefined,
    });
  });

  it("should forward query parameters to service", async () => {
    const pagination = { page: 2, limit: 10, total: 15 };
    mockList.mockResolvedValue({ data: [], pagination });

    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes?page=2&limit=10&status=draft&companyId=comp_1&search=test`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(mockList).toHaveBeenCalledWith({
      organizationId: orgId,
      userId,
      page: 2,
      limit: 10,
      offset: 10,
      status: "draft",
      companyId: "comp_1",
      search: "test",
    });
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 422 when status filter is invalid", async () => {
    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes?status=invalid_status`)
      .set(authHeaders(userId));

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 422 when page is not a number", async () => {
    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes?page=abc`)
      .set(authHeaders(userId));

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 422 when organizationId is missing", async () => {
    const res = await request(app)
      .get(`/api/organizations//quotes`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
  });

  it("should handle service error", async () => {
    mockList.mockImplementation(() => {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    });

    const res = await request(app)
      .get(`/api/organizations/${orgId}/quotes`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ORGANIZATION_NOT_FOUND");
    expect(res.body.error.message).toBe("Organization not found");
  });
});
