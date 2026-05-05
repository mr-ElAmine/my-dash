import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeOrganization, authHeaders } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/organizations.service");

import { mockRestore } from "../../../src/services/__mocks__/organizations.service";

vi.mock("../../../src/middlewares/organization-access.middleware");

vi.mock("../../../src/middlewares/role.middleware");

describe("POST /api/organizations/:organizationId/restore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated requests", async () => {
    const res = await request(app).post("/api/organizations/org-123/restore");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should restore organization and return 200", async () => {
    const organization = createSafeOrganization({ id: "org-123", status: "active" });
    mockRestore.mockResolvedValue(organization);

    const userId = "user-123";
    const res = await request(app)
      .post("/api/organizations/org-123/restore")
      .set(authHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: organization });
  });

  it("should pass organizationId and userId to service", async () => {
    const organization = createSafeOrganization();
    mockRestore.mockResolvedValue(organization);

    const userId = "user-123";
    await request(app)
      .post("/api/organizations/org-123/restore")
      .set(authHeaders(userId));

    expect(mockRestore).toHaveBeenCalledWith({
      organizationId: "org-123",
      userId,
    });
  });

  it("should return 404 when organization not found", async () => {
    mockRestore.mockImplementation(() => {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    });

    const userId = "user-123";
    const res = await request(app)
      .post("/api/organizations/org-999/restore")
      .set(authHeaders(userId));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ORGANIZATION_NOT_FOUND");
    expect(res.body.error.message).toBe("Organization not found");
  });

  it("should return 400 when organization is not archived", async () => {
    mockRestore.mockImplementation(() => {
      throw new AppError(
        "Organization is not archived",
        400,
        "ORGANIZATION_NOT_ARCHIVED",
      );
    });

    const userId = "user-123";
    const res = await request(app)
      .post("/api/organizations/org-123/restore")
      .set(authHeaders(userId));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("ORGANIZATION_NOT_ARCHIVED");
    expect(res.body.error.message).toBe("Organization is not archived");
  });

  it("should return 403 when user is not owner", async () => {
    mockRestore.mockImplementation(() => {
      throw new AppError("Only owner can restore", 403, "INSUFFICIENT_ROLE");
    });

    const userId = "user-123";
    const res = await request(app)
      .post("/api/organizations/org-123/restore")
      .set(authHeaders(userId));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("INSUFFICIENT_ROLE");
  });
});
