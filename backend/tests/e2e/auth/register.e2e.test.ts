import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeUser } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/auth.service");

import { mockRegister } from "../../../src/services/__mocks__/auth.service";

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject when email is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      password: "password123",
      firstName: "Jean",
      lastName: "Martin",
      phone: "0600000000",
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toBe("Validation failed");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
      ]),
    );
  });

  it("should reject when email is invalid", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "password123",
      firstName: "Jean",
      lastName: "Martin",
      phone: "0600000000",
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
      ]),
    );
  });

  it("should reject when password is too short", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "jean@example.com",
      password: "short",
      firstName: "Jean",
      lastName: "Martin",
      phone: "0600000000",
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "password" }),
      ]),
    );
  });

  it("should reject when firstName is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "jean@example.com",
      password: "password123",
      lastName: "Martin",
      phone: "0600000000",
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "firstName" }),
      ]),
    );
  });

  it("should reject when lastName is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "jean@example.com",
      password: "password123",
      firstName: "Jean",
      phone: "0600000000",
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "lastName" }),
      ]),
    );
  });

  it("should reject when phone is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "jean@example.com",
      password: "password123",
      firstName: "Jean",
      lastName: "Martin",
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "phone" }),
      ]),
    );
  });

  it("should reject empty body with multiple validation errors", async () => {
    const res = await request(app).post("/api/auth/register").send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.length).toBeGreaterThanOrEqual(5);
  });

  it("should reject when email is already registered", async () => {
    mockRegister.mockImplementation(() => {
      throw new AppError(
        "Email already registered",
        409,
        "EMAIL_ALREADY_REGISTERED",
      );
    });

    const res = await request(app).post("/api/auth/register").send({
      email: "existing@example.com",
      password: "password123",
      firstName: "Jean",
      lastName: "Martin",
      phone: "0600000000",
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_ALREADY_REGISTERED");
    expect(res.body.error.message).toBe("Email already registered");
  });

  it("should register successfully and return 201 with user and token", async () => {
    const safeUser = createSafeUser();
    const authResult = { user: safeUser, accessToken: "jwt-token" };
    mockRegister.mockResolvedValue(authResult);

    const res = await request(app).post("/api/auth/register").send({
      email: "jean@example.com",
      password: "password123",
      firstName: "Jean",
      lastName: "Martin",
      phone: "0600000000",
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual(authResult);
  });

  it("should forward all fields to the service", async () => {
    const safeUser = createSafeUser();
    mockRegister.mockResolvedValue({
      user: safeUser,
      accessToken: "jwt-token",
    });

    await request(app).post("/api/auth/register").send({
      email: "jean@example.com",
      password: "password123",
      firstName: "Jean",
      lastName: "Martin",
      phone: "0600000000",
    });

    expect(mockRegister).toHaveBeenCalledWith({
      email: "jean@example.com",
      password: "password123",
      firstName: "Jean",
      lastName: "Martin",
      phone: "0600000000",
    });
  });
});
