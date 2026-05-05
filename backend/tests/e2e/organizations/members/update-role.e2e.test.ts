import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../../src/app";
import { createSafeOrganizationMember, authHeaders } from "../../helpers";
import { AppError } from "../../../../src/errors/app-error";

vi.mock("../../../../src/services/organizations.service");

import { mockUpdateMemberRole } from "../../../../src/services/__mocks__/organizations.service";

vi.mock("../../../../src/middlewares/organization-access.middleware");

vi.mock("../../../../src/middlewares/role.middleware");

describe("PATCH /api/organizations/:organizationId/members/:memberId/role", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated requests", async () => {
    const res = await request(app)
      .patch("/api/organizations/org-123/members/member-1/role")
      .send({ role: "admin" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should update member role and return 200", async () => {
    const member = createSafeOrganizationMember({
      id: "member-1",
      organizationId: "org-123",
      role: "admin",
    });
    mockUpdateMemberRole.mockResolvedValue(member);

    const userId = "user-123";
    const res = await request(app)
      .patch("/api/organizations/org-123/members/member-1/role")
      .set(authHeaders(userId))
      .send({ role: "admin" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: member });
  });

  it("should pass organizationId, memberId, userId and role to service", async () => {
    const member = createSafeOrganizationMember();
    mockUpdateMemberRole.mockResolvedValue(member);

    const userId = "user-123";
    await request(app)
      .patch("/api/organizations/org-123/members/member-1/role")
      .set(authHeaders(userId))
      .send({ role: "member" });

    expect(mockUpdateMemberRole).toHaveBeenCalledWith({
      organizationId: "org-123",
      memberId: "member-1",
      userId,
      role: "member",
    });
  });

  it("should return 404 when member not found", async () => {
    mockUpdateMemberRole.mockImplementation(() => {
      throw new AppError("Member not found", 404, "MEMBER_NOT_FOUND");
    });

    const userId = "user-123";
    const res = await request(app)
      .patch("/api/organizations/org-123/members/member-999/role")
      .set(authHeaders(userId))
      .send({ role: "admin" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("MEMBER_NOT_FOUND");
    expect(res.body.error.message).toBe("Member not found");
  });

  it("should return 403 when caller is not owner", async () => {
    mockUpdateMemberRole.mockImplementation(() => {
      throw new AppError("Only owner can change roles", 403, "INSUFFICIENT_ROLE");
    });

    const userId = "user-123";
    const res = await request(app)
      .patch("/api/organizations/org-123/members/member-1/role")
      .set(authHeaders(userId))
      .send({ role: "admin" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("INSUFFICIENT_ROLE");
  });

  it("should return 400 when changing own role", async () => {
    mockUpdateMemberRole.mockImplementation(() => {
      throw new AppError("Cannot change your own role", 400, "CANNOT_CHANGE_OWN_ROLE");
    });

    const userId = "user-123";
    const res = await request(app)
      .patch("/api/organizations/org-123/members/member-1/role")
      .set(authHeaders(userId))
      .send({ role: "member" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("CANNOT_CHANGE_OWN_ROLE");
    expect(res.body.error.message).toBe("Cannot change your own role");
  });

  it("should reject invalid role value", async () => {
    const userId = "user-123";
    const res = await request(app)
      .patch("/api/organizations/org-123/members/member-1/role")
      .set(authHeaders(userId))
      .send({ role: "superadmin" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "role" }),
      ]),
    );
  });

  it("should reject missing role in body", async () => {
    const userId = "user-123";
    const res = await request(app)
      .patch("/api/organizations/org-123/members/member-1/role")
      .set(authHeaders(userId))
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "role" }),
      ]),
    );
  });
});
