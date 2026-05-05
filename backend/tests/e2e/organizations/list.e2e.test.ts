import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeOrganization, authHeaders } from "../helpers";

vi.mock("../../../src/services/organizations.service");

import { mockList } from "../../../src/services/__mocks__/organizations.service";

describe("GET /api/organizations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated requests", async () => {
    const res = await request(app).get("/api/organizations");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should return paginated list of organizations", async () => {
    const org1 = createSafeOrganization();
    const org2 = createSafeOrganization();
    const pagination = { page: 1, limit: 20, total: 2 };

    mockList.mockResolvedValue({ data: [org1, org2], pagination });

    const userId = "user-123";
    const res = await request(app)
      .get("/api/organizations")
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: [org1, org2],
      pagination,
    });
  });

  it("should pass query params to service", async () => {
    const pagination = { page: 2, limit: 10, total: 25 };
    mockList.mockResolvedValue({ data: [], pagination });

    const userId = "user-123";
    await request(app)
      .get("/api/organizations?page=2&limit=10&status=archived")
      .set(authHeaders(userId));

    expect(mockList).toHaveBeenCalledWith({
      userId,
      page: 2,
      limit: 10,
      offset: 10,
      status: "archived",
    });
  });

  it("should use default pagination values when not provided", async () => {
    const pagination = { page: 1, limit: 20, total: 0 };
    mockList.mockResolvedValue({ data: [], pagination });

    const userId = "user-123";
    await request(app)
      .get("/api/organizations")
      .set(authHeaders(userId));

    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        offset: 0,
      }),
    );
  });

  it("should reject invalid page value", async () => {
    const userId = "user-123";
    const res = await request(app)
      .get("/api/organizations?page=-1")
      .set(authHeaders(userId));

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "page" }),
      ]),
    );
  });

  it("should reject invalid limit value", async () => {
    const userId = "user-123";
    const res = await request(app)
      .get("/api/organizations?limit=999")
      .set(authHeaders(userId));

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "limit" }),
      ]),
    );
  });

  it("should reject invalid status value", async () => {
    const userId = "user-123";
    const res = await request(app)
      .get("/api/organizations?status=invalid")
      .set(authHeaders(userId));

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "status" }),
      ]),
    );
  });

  it("should handle service error", async () => {
    mockList.mockImplementation(() => {
      throw new Error("Database connection failed");
    });

    const userId = "user-123";
    const res = await request(app)
      .get("/api/organizations")
      .set(authHeaders(userId));

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
  });
});
