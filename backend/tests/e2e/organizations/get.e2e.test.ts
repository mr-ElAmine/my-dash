import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeOrganization, authHeaders } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/organizations.service");

import { mockGetById } from "../../../src/services/__mocks__/organizations.service";

vi.mock("../../../src/middlewares/organization-access.middleware");

describe("GET /api/organizations/:organizationId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated requests", async () => {
    const res = await request(app).get("/api/organizations/org-123");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should return organization by id", async () => {
    const organization = createSafeOrganization({ id: "org-123" });
    mockGetById.mockResolvedValue(organization);

    const userId = "user-123";
    const res = await request(app)
      .get("/api/organizations/org-123")
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: organization });
  });

  it("should pass organizationId and userId to service", async () => {
    const organization = createSafeOrganization();
    mockGetById.mockResolvedValue(organization);

    const userId = "user-123";
    await request(app)
      .get("/api/organizations/org-123")
      .set(authHeaders(userId));

    expect(mockGetById).toHaveBeenCalledWith({
      organizationId: "org-123",
      userId,
    });
  });

  it("should return 404 when organization not found", async () => {
    mockGetById.mockImplementation(() => {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    });

    const userId = "user-123";
    const res = await request(app)
      .get("/api/organizations/org-999")
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ORGANIZATION_NOT_FOUND");
    expect(res.body.error.message).toBe("Organization not found");
  });

  it("should return 403 when user is not a member", async () => {
    mockGetById.mockImplementation(() => {
      throw new AppError("Access denied", 403, "ORGANIZATION_ACCESS_DENIED");
    });

    const userId = "user-123";
    const res = await request(app)
      .get("/api/organizations/org-123")
      .set(authHeaders(userId));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ORGANIZATION_ACCESS_DENIED");
  });

});
