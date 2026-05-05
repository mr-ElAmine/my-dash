import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import crypto from "crypto";
import { app } from "../../../src/app";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/organization-invites.service");

import { mockPreview } from "../../../src/services/__mocks__/organization-invites.service";

describe("GET /api/invites/:token", () => {
  const rawToken = "abc123token";
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return invite preview successfully without authentication", async () => {
    const preview = {
      email: "alice@example.com",
      role: "member",
      organizationName: "Acme Corp",
    };
    mockPreview.mockResolvedValue(preview);

    const res = await request(app).get(`/api/invites/${rawToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(preview);
  });

  it("should call preview with token hash", async () => {
    const preview = {
      email: "alice@example.com",
      role: "member",
      organizationName: "Acme Corp",
    };
    mockPreview.mockResolvedValue(preview);

    await request(app).get(`/api/invites/${rawToken}`);

    expect(mockPreview).toHaveBeenCalledWith({ tokenHash });
  });

  it("should return 404 when invite not found", async () => {
    mockPreview.mockImplementation(() => {
      throw new AppError("Invite not found", 404, "INVITE_NOT_FOUND");
    });

    const res = await request(app).get("/api/invites/nonexistent-token");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("INVITE_NOT_FOUND");
    expect(res.body.error.message).toBe("Invite not found");
  });

  it("should return 400 when invite is revoked", async () => {
    mockPreview.mockImplementation(() => {
      throw new AppError("Invite is no longer valid", 400, "INVITE_REVOKED");
    });

    const res = await request(app).get(`/api/invites/${rawToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVITE_REVOKED");
    expect(res.body.error.message).toBe("Invite is no longer valid");
  });

  it("should return 400 when invite has expired", async () => {
    mockPreview.mockImplementation(() => {
      throw new AppError("Invite has expired", 400, "INVITE_EXPIRED");
    });

    const res = await request(app).get(`/api/invites/${rawToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVITE_EXPIRED");
    expect(res.body.error.message).toBe("Invite has expired");
  });

  it("should return 400 when invite already accepted", async () => {
    mockPreview.mockImplementation(() => {
      throw new AppError("Invite already accepted", 400, "INVITE_ALREADY_ACCEPTED");
    });

    const res = await request(app).get(`/api/invites/${rawToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVITE_ALREADY_ACCEPTED");
    expect(res.body.error.message).toBe("Invite already accepted");
  });
});
