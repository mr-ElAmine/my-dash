import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeOrganization, authHeaders } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/organizations.service");

import { mockUpdate } from "../../../src/services/__mocks__/organizations.service";

vi.mock("../../../src/middlewares/organization-access.middleware");

vi.mock("../../../src/middlewares/role.middleware");

describe("PATCH /api/organizations/:organizationId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated requests", async () => {
    const res = await request(app)
      .patch("/api/organizations/org-123")
      .send({ name: "Updated" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should update organization and return 200", async () => {
    const organization = createSafeOrganization({ id: "org-123", name: "Updated" });
    mockUpdate.mockResolvedValue(organization);

    const userId = "user-123";
    const res = await request(app)
      .patch("/api/organizations/org-123")
      .set(authHeaders(userId))
      .send({ name: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: organization });
  });

  it("should pass organizationId, userId and data to service", async () => {
    const organization = createSafeOrganization();
    mockUpdate.mockResolvedValue(organization);

    const userId = "user-123";
    const body = { name: "Updated", email: "new@test.com" };

    await request(app)
      .patch("/api/organizations/org-123")
      .set(authHeaders(userId))
      .send(body);

    expect(mockUpdate).toHaveBeenCalledWith({
      organizationId: "org-123",
      userId,
      data: body,
    });
  });

  it("should return 404 when organization not found", async () => {
    mockUpdate.mockImplementation(() => {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    });

    const userId = "user-123";
    const res = await request(app)
      .patch("/api/organizations/org-999")
      .set(authHeaders(userId))
      .send({ name: "Updated" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ORGANIZATION_NOT_FOUND");
    expect(res.body.error.message).toBe("Organization not found");
  });

  it("should return 403 when user has insufficient role", async () => {
    mockUpdate.mockImplementation(() => {
      throw new AppError("Only owner or admin can update", 403, "INSUFFICIENT_ROLE");
    });

    const userId = "user-123";
    const res = await request(app)
      .patch("/api/organizations/org-123")
      .set(authHeaders(userId))
      .send({ name: "Updated" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("INSUFFICIENT_ROLE");
  });

  it("should reject invalid email in body", async () => {
    const userId = "user-123";
    const res = await request(app)
      .patch("/api/organizations/org-123")
      .set(authHeaders(userId))
      .send({ email: "not-an-email" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
      ]),
    );
  });

  it("should reject empty name in body", async () => {
    const userId = "user-123";
    const res = await request(app)
      .patch("/api/organizations/org-123")
      .set(authHeaders(userId))
      .send({ name: "" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name" }),
      ]),
    );
  });
});
