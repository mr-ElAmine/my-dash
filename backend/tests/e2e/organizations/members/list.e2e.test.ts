import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../../src/app";
import { createSafeOrganizationMember, authHeaders } from "../../helpers";
import { AppError } from "../../../../src/errors/app-error";

vi.mock("../../../../src/services/organizations.service");

import { mockListMembers } from "../../../../src/services/__mocks__/organizations.service";

vi.mock("../../../../src/middlewares/organization-access.middleware");

vi.mock("../../../../src/middlewares/role.middleware");

describe("GET /api/organizations/:organizationId/members", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated requests", async () => {
    const res = await request(app).get("/api/organizations/org-123/members");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should return list of members", async () => {
    const member1 = createSafeOrganizationMember({ organizationId: "org-123", role: "owner" });
    const member2 = createSafeOrganizationMember({ organizationId: "org-123", role: "member" });

    mockListMembers.mockResolvedValue([member1, member2]);

    const userId = "user-123";
    const res = await request(app)
      .get("/api/organizations/org-123/members")
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [member1, member2] });
  });

  it("should pass organizationId and userId to service", async () => {
    mockListMembers.mockResolvedValue([]);

    const userId = "user-123";
    await request(app)
      .get("/api/organizations/org-123/members")
      .set(authHeaders(userId));

    expect(mockListMembers).toHaveBeenCalledWith({
      organizationId: "org-123",
      userId,
    });
  });

  it("should return 403 when user is not a member", async () => {
    mockListMembers.mockImplementation(() => {
      throw new AppError("Access denied", 403, "ORGANIZATION_ACCESS_DENIED");
    });

    const userId = "user-456";
    const res = await request(app)
      .get("/api/organizations/org-123/members")
      .set(authHeaders(userId));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ORGANIZATION_ACCESS_DENIED");
    expect(res.body.error.message).toBe("Access denied");
  });

  it("should return 404 when organization not found", async () => {
    mockListMembers.mockImplementation(() => {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    });

    const userId = "user-123";
    const res = await request(app)
      .get("/api/organizations/org-999/members")
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ORGANIZATION_NOT_FOUND");
  });
});
