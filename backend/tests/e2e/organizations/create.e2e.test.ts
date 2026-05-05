import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeOrganization, createSafeOrganizationMember, authHeaders } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/organizations.service");

import { mockCreate } from "../../../src/services/__mocks__/organizations.service";

describe("POST /api/organizations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated requests", async () => {
    const res = await request(app)
      .post("/api/organizations")
      .send({ name: "My Org" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should create an organization and return 201", async () => {
    const organization = createSafeOrganization({ name: "My Org" });
    const membership = createSafeOrganizationMember({ role: "owner" });

    mockCreate.mockResolvedValue({ organization, membership });

    const userId = "user-123";
    const res = await request(app)
      .post("/api/organizations")
      .set(authHeaders(userId))
      .send({ name: "My Org" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      data: {
        organization,
        membership,
      },
    });
  });

  it("should pass body data and userId to service", async () => {
    const organization = createSafeOrganization();
    const membership = createSafeOrganizationMember();
    mockCreate.mockResolvedValue({ organization, membership });

    const userId = "user-123";
    const body = {
      name: "Test Org",
      email: "org@test.com",
      phone: "0601020304",
    };

    await request(app)
      .post("/api/organizations")
      .set(authHeaders(userId))
      .send(body);

    expect(mockCreate).toHaveBeenCalledWith({
      userId,
      data: body,
    });
  });

  it("should reject empty body", async () => {
    const userId = "user-123";
    const res = await request(app)
      .post("/api/organizations")
      .set(authHeaders(userId))
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name" }),
      ]),
    );
  });

  it("should reject empty name", async () => {
    const userId = "user-123";
    const res = await request(app)
      .post("/api/organizations")
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

  it("should reject invalid email", async () => {
    const userId = "user-123";
    const res = await request(app)
      .post("/api/organizations")
      .set(authHeaders(userId))
      .send({ name: "My Org", email: "not-an-email" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
      ]),
    );
  });

  it("should handle service error", async () => {
    mockCreate.mockImplementation(() => {
      throw new AppError("Creation failed", 500, "CREATION_FAILED");
    });

    const userId = "user-123";
    const res = await request(app)
      .post("/api/organizations")
      .set(authHeaders(userId))
      .send({ name: "My Org" });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("CREATION_FAILED");
    expect(res.body.error.message).toBe("Creation failed");
  });
});
