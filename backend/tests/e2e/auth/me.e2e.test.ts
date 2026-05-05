import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../../src/app";
import { createTestToken, createSafeUser } from "../helpers";
import { AppError } from "../../../src/errors/app-error";

vi.mock("../../../src/services/auth.service");

import { mockGetMe } from "../../../src/services/__mocks__/auth.service";

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject without Authorization header", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe("Missing authentication token");
  });

  it("should reject with missing Bearer prefix", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "token-without-bearer");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should reject with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe("Invalid or expired token");
  });

  it("should reject with expired token", async () => {
    const expiredToken = jwt.sign(
      { userId: "user_1" },
      "test-secret-key-for-testing",
      { expiresIn: "0s" },
    );

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should reject with token signed by wrong secret", async () => {
    const badToken = jwt.sign({ userId: "user_1" }, "wrong-secret", {
      expiresIn: "1h",
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${badToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should return current user on success", async () => {
    const safeUser = createSafeUser();
    mockGetMe.mockResolvedValue(safeUser);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ user: safeUser });
  });

  it("should call getMe with userId from JWT", async () => {
    const safeUser = createSafeUser();
    mockGetMe.mockResolvedValue(safeUser);

    await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(mockGetMe).toHaveBeenCalledWith("user_1");
  });

  it("should return 404 when user no longer exists", async () => {
    mockGetMe.mockImplementation(() => {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${createTestToken("deleted_user")}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("USER_NOT_FOUND");
  });
});
