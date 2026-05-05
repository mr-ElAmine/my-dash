import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeOrganizationInvite } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/organization-invites.service");

import { mockList } from "../../../src/services/__mocks__/organization-invites.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("GET /api/organizations/:organizationId/invites", () => {
  const orgId = "org_123";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject without Authorization header", async () => {
    const res = await request(app).get(`/api/organizations/${orgId}/invites`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe("Missing authentication token");
  });

  it("should return empty list when no invites exist", async () => {
    mockList.mockResolvedValue([]);

    const res = await request(app)
      .get(`/api/organizations/${orgId}/invites`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("should return list of invites", async () => {
    const invite1 = createSafeOrganizationInvite({ organizationId: orgId });
    const invite2 = createSafeOrganizationInvite({ organizationId: orgId });
    mockList.mockResolvedValue([invite1, invite2]);

    const res = await request(app)
      .get(`/api/organizations/${orgId}/invites`)
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([invite1, invite2]);
  });

  it("should call list with organizationId and userId", async () => {
    mockList.mockResolvedValue([]);

    await request(app)
      .get(`/api/organizations/${orgId}/invites`)
      .set(authHeaders(userId));

    expect(mockList).toHaveBeenCalledWith({
      organizationId: orgId,
      userId,
    });
  });

  it("should return 404 when organization not found", async () => {
    mockList.mockImplementation(() => {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    });

    const res = await request(app)
      .get(`/api/organizations/${orgId}/invites`)
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ORGANIZATION_NOT_FOUND");
    expect(res.body.error.message).toBe("Organization not found");
  });

  it("should return 403 when user has insufficient role", async () => {
    mockList.mockImplementation(() => {
      throw new AppError("Only owner or admin can manage invites", 403, "INSUFFICIENT_ROLE");
    });

    const res = await request(app)
      .get(`/api/organizations/${orgId}/invites`)
      .set(authHeaders("member_user"));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("INSUFFICIENT_ROLE");
    expect(res.body.error.message).toBe("Only owner or admin can manage invites");
  });
});
