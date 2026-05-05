import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeOrganizationInvite } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/organization-invites.service");

import { mockRevoke } from "../../../src/services/__mocks__/organization-invites.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("POST /api/organizations/:organizationId/invites/:inviteId/revoke", () => {
  const orgId = "org_123";
  const inviteId = "invite_456";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject without Authorization header", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/invites/${inviteId}/revoke`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe("Missing authentication token");
  });

  it("should revoke invite successfully and return 200", async () => {
    const revokedInvite = createSafeOrganizationInvite({
      id: inviteId,
      organizationId: orgId,
      status: "revoked",
      revokedAt: new Date(),
    });
    mockRevoke.mockResolvedValue(revokedInvite);

    const res = await request(app)
      .post(`/api/organizations/${orgId}/invites/${inviteId}/revoke`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(revokedInvite);
  });

  it("should call revoke with organizationId, inviteId and userId", async () => {
    const revokedInvite = createSafeOrganizationInvite({
      id: inviteId,
      organizationId: orgId,
    });
    mockRevoke.mockResolvedValue(revokedInvite);

    await request(app)
      .post(`/api/organizations/${orgId}/invites/${inviteId}/revoke`)
      .set(authHeaders(userId));

    expect(mockRevoke).toHaveBeenCalledWith({
      organizationId: orgId,
      inviteId,
      userId,
    });
  });

  it("should return 404 when invite not found", async () => {
    mockRevoke.mockImplementation(() => {
      throw new AppError("Invite not found", 404, "INVITE_NOT_FOUND");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/invites/nonexistent/revoke`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("INVITE_NOT_FOUND");
    expect(res.body.error.message).toBe("Invite not found");
  });

  it("should return 400 when invite is not pending", async () => {
    mockRevoke.mockImplementation(() => {
      throw new AppError("Only pending invites can be revoked", 400, "INVITE_NOT_PENDING");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/invites/${inviteId}/revoke`)
      .set(authHeaders(userId));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVITE_NOT_PENDING");
    expect(res.body.error.message).toBe("Only pending invites can be revoked");
  });

  it("should return 403 when user has insufficient role", async () => {
    mockRevoke.mockImplementation(() => {
      throw new AppError("Only owner or admin can manage invites", 403, "INSUFFICIENT_ROLE");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/invites/${inviteId}/revoke`)
      .set(authHeaders("member_user"));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("INSUFFICIENT_ROLE");
    expect(res.body.error.message).toBe("Only owner or admin can manage invites");
  });
});
