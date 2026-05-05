import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import crypto from "crypto";
import { app } from "../../../src/app";
import { authHeaders, createSafeOrganizationMember } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/organization-invites.service");

import { mockAccept } from "../../../src/services/__mocks__/organization-invites.service";

describe("POST /api/invites/:token/accept", () => {
  const rawToken = "abc123token";
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject without Authorization header", async () => {
    const res = await request(app).post(`/api/invites/${rawToken}/accept`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe("Missing authentication token");
  });

  it("should accept invite successfully and return 201", async () => {
    const membership = createSafeOrganizationMember({ userId });
    mockAccept.mockResolvedValue({ membership });

    const res = await request(app)
      .post(`/api/invites/${rawToken}/accept`)
      .set(authHeaders(userId));

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual(membership);
  });

  it("should call accept with tokenHash and userId", async () => {
    const membership = createSafeOrganizationMember({ userId });
    mockAccept.mockResolvedValue({ membership });

    await request(app)
      .post(`/api/invites/${rawToken}/accept`)
      .set(authHeaders(userId));

    expect(mockAccept).toHaveBeenCalledWith({
      tokenHash,
      userId,
    });
  });

  it("should return 404 when invite not found", async () => {
    mockAccept.mockImplementation(() => {
      throw new AppError("Invite not found", 404, "INVITE_NOT_FOUND");
    });

    const res = await request(app)
      .post("/api/invites/nonexistent-token/accept")
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("INVITE_NOT_FOUND");
    expect(res.body.error.message).toBe("Invite not found");
  });

  it("should return 400 when invite is no longer valid", async () => {
    mockAccept.mockImplementation(() => {
      throw new AppError(
        "Invite is no longer valid",
        400,
        "INVITE_NOT_PENDING",
      );
    });

    const res = await request(app)
      .post(`/api/invites/${rawToken}/accept`)
      .set(authHeaders(userId));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVITE_NOT_PENDING");
    expect(res.body.error.message).toBe("Invite is no longer valid");
  });

  it("should return 400 when invite has expired", async () => {
    mockAccept.mockImplementation(() => {
      throw new AppError("Invite has expired", 400, "INVITE_EXPIRED");
    });

    const res = await request(app)
      .post(`/api/invites/${rawToken}/accept`)
      .set(authHeaders(userId));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVITE_EXPIRED");
    expect(res.body.error.message).toBe("Invite has expired");
  });

  it("should return 409 when user is already a member", async () => {
    mockAccept.mockImplementation(() => {
      throw new AppError(
        "Already a member of this organization",
        409,
        "ALREADY_MEMBER",
      );
    });

    const res = await request(app)
      .post(`/api/invites/${rawToken}/accept`)
      .set(authHeaders(userId));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("ALREADY_MEMBER");
    expect(res.body.error.message).toBe(
      "Already a member of this organization",
    );
  });
});
