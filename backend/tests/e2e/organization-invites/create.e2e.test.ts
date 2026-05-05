import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeOrganizationInvite } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/organization-invites.service");

import { mockCreate } from "../../../src/services/__mocks__/organization-invites.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("POST /api/organizations/:organizationId/invites", () => {
  const orgId = "org_123";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject without Authorization header", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/invites`)
      .send({ email: "alice@example.com", role: "member" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe("Missing authentication token");
  });

  it("should reject when email is missing", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/invites`)
      .set(authHeaders(userId))
      .send({ role: "member" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
      ]),
    );
  });

  it("should reject when email is invalid", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/invites`)
      .set(authHeaders(userId))
      .send({ email: "not-an-email", role: "member" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
      ]),
    );
  });

  it("should reject when role is missing", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/invites`)
      .set(authHeaders(userId))
      .send({ email: "alice@example.com" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "role" }),
      ]),
    );
  });

  it("should reject when role is invalid", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/invites`)
      .set(authHeaders(userId))
      .send({ email: "alice@example.com", role: "superadmin" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "role" }),
      ]),
    );
  });

  it("should create invite successfully and return 201", async () => {
    const invite = createSafeOrganizationInvite({
      organizationId: orgId,
      email: "alice@example.com",
      role: "member",
    });
    const rawToken = "raw-invite-token-hex";
    mockCreate.mockResolvedValue({ invite, rawToken });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/invites`)
      .set(authHeaders(userId))
      .send({ email: "alice@example.com", role: "member" });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ invite, token: rawToken });
  });

  it("should forward organizationId, userId, email and role to service", async () => {
    const invite = createSafeOrganizationInvite({
      organizationId: orgId,
      email: "alice@example.com",
      role: "admin",
    });
    mockCreate.mockResolvedValue({ invite, rawToken: "token" });

    await request(app)
      .post(`/api/organizations/${orgId}/invites`)
      .set(authHeaders(userId))
      .send({ email: "alice@example.com", role: "admin" });

    expect(mockCreate).toHaveBeenCalledWith({
      organizationId: orgId,
      userId,
      email: "alice@example.com",
      role: "admin",
    });
  });

  it("should return 409 when invite already pending for same email", async () => {
    mockCreate.mockImplementation(() => {
      throw new AppError("Invite already pending for this email", 409, "INVITE_ALREADY_PENDING");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/invites`)
      .set(authHeaders(userId))
      .send({ email: "alice@example.com", role: "member" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("INVITE_ALREADY_PENDING");
    expect(res.body.error.message).toBe("Invite already pending for this email");
  });

  it("should return 403 when user has insufficient role", async () => {
    mockCreate.mockImplementation(() => {
      throw new AppError("Only owner or admin can manage invites", 403, "INSUFFICIENT_ROLE");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/invites`)
      .set(authHeaders("member_user"))
      .send({ email: "alice@example.com", role: "member" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("INSUFFICIENT_ROLE");
    expect(res.body.error.message).toBe("Only owner or admin can manage invites");
  });
});
