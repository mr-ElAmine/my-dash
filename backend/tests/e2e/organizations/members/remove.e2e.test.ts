import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../../src/app";
import { createSafeOrganizationMember, authHeaders } from "../../helpers";
import { AppError } from "../../../../src/errors/app-error";

vi.mock("../../../../src/services/organizations.service");

import { mockRemoveMember } from "../../../../src/services/__mocks__/organizations.service";

vi.mock("../../../../src/middlewares/organization-access.middleware");

vi.mock("../../../../src/middlewares/role.middleware");

describe("POST /api/organizations/:organizationId/members/:memberId/remove", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated requests", async () => {
    const res = await request(app).post("/api/organizations/org-123/members/member-1/remove");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should remove member and return 200", async () => {
    const member = createSafeOrganizationMember({
      id: "member-1",
      organizationId: "org-123",
      status: "removed",
    });
    mockRemoveMember.mockResolvedValue(member);

    const userId = "user-123";
    const res = await request(app)
      .post("/api/organizations/org-123/members/member-1/remove")
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: member });
  });

  it("should pass organizationId, memberId and userId to service", async () => {
    const member = createSafeOrganizationMember();
    mockRemoveMember.mockResolvedValue(member);

    const userId = "user-123";
    await request(app)
      .post("/api/organizations/org-123/members/member-1/remove")
      .set(authHeaders(userId));

    expect(mockRemoveMember).toHaveBeenCalledWith({
      organizationId: "org-123",
      memberId: "member-1",
      userId,
    });
  });

  it("should return 404 when member not found", async () => {
    mockRemoveMember.mockImplementation(() => {
      throw new AppError("Member not found", 404, "MEMBER_NOT_FOUND");
    });

    const userId = "user-123";
    const res = await request(app)
      .post("/api/organizations/org-123/members/member-999/remove")
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("MEMBER_NOT_FOUND");
    expect(res.body.error.message).toBe("Member not found");
  });

  it("should return 403 when caller has insufficient role", async () => {
    mockRemoveMember.mockImplementation(() => {
      throw new AppError(
        "Only owner or admin can remove members",
        403,
        "INSUFFICIENT_ROLE",
      );
    });

    const userId = "user-123";
    const res = await request(app)
      .post("/api/organizations/org-123/members/member-1/remove")
      .set(authHeaders(userId));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("INSUFFICIENT_ROLE");
  });

  it("should return 400 when trying to remove owner", async () => {
    mockRemoveMember.mockImplementation(() => {
      throw new AppError("Cannot remove owner", 400, "CANNOT_REMOVE_OWNER");
    });

    const userId = "user-123";
    const res = await request(app)
      .post("/api/organizations/org-123/members/member-1/remove")
      .set(authHeaders(userId));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("CANNOT_REMOVE_OWNER");
    expect(res.body.error.message).toBe("Cannot remove owner");
  });

  it("should return 403 when user is not a member of the organization", async () => {
    mockRemoveMember.mockImplementation(() => {
      throw new AppError("Access denied", 403, "ORGANIZATION_ACCESS_DENIED");
    });

    const userId = "user-456";
    const res = await request(app)
      .post("/api/organizations/org-123/members/member-1/remove")
      .set(authHeaders(userId));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ORGANIZATION_ACCESS_DENIED");
  });
});
