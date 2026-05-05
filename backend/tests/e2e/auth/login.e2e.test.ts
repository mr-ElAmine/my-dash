import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeUser } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/auth.service");

import { mockLogin } from "../../../src/services/__mocks__/auth.service";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "password123" });

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
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: "password123" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
      ]),
    );
  });

  it("should reject when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "jean@example.com" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "password" }),
      ]),
    );
  });

  it("should reject empty body", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.length).toBeGreaterThanOrEqual(2);
  });

  it("should reject with invalid credentials", async () => {
    mockLogin.mockImplementation(() => {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "jean@example.com", password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    expect(res.body.error.message).toBe("Invalid credentials");
  });

  it("should reject when account is disabled", async () => {
    mockLogin.mockImplementation(() => {
      throw new AppError("Account is disabled", 403, "ACCOUNT_DISABLED");
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "jean@example.com", password: "password123" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCOUNT_DISABLED");
    expect(res.body.error.message).toBe("Account is disabled");
  });

  it("should login successfully and return 200 with user and token", async () => {
    const safeUser = createSafeUser();
    const authResult = { user: safeUser, accessToken: "jwt-token" };
    mockLogin.mockResolvedValue(authResult);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "jean@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(authResult);
  });

  it("should forward email and password to the service", async () => {
    const safeUser = createSafeUser();
    mockLogin.mockResolvedValue({
      user: safeUser,
      accessToken: "jwt-token",
    });

    await request(app)
      .post("/api/auth/login")
      .send({ email: "jean@example.com", password: "password123" });

    expect(mockLogin).toHaveBeenCalledWith({
      email: "jean@example.com",
      password: "password123",
    });
  });
});
