import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../../../src/services/auth.service";
import { createUsersRepositoryMock } from "../../mocks/repositories/users.repository.mock";
import { createPasswordServiceMock } from "../../mocks/password.service.mock";
import { createJwtServiceMock } from "../../mocks/jwt.service.mock";
import { createUser, createDisabledUser } from "../../fixtures/users.fixture";

describe("AuthService", () => {
  const usersRepo = createUsersRepositoryMock();
  const passwordService = createPasswordServiceMock();
  const jwtService = createJwtServiceMock();
  const authService = new AuthService(usersRepo, passwordService, jwtService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    const registerInput = {
      email: "jean@example.com",
      password: "password123",
      firstName: "Jean",
      lastName: "Martin",
      phone: "0600000000",
    };

    it("should register a new user and return user + token", async () => {
      vi.mocked(passwordService.hash).mockResolvedValue("hashed_password");
      vi.mocked(usersRepo.findByEmail).mockResolvedValue(undefined);
      vi.mocked(usersRepo.create).mockResolvedValue(
        createUser({
          id: "user_1",
          email: registerInput.email,
          passwordHash: "hashed_password",
          firstName: registerInput.firstName,
          lastName: registerInput.lastName,
          phone: registerInput.phone,
        }),
      );

      const result = await authService.register(registerInput);

      expect(result.user.email).toBe(registerInput.email);
      expect(result.accessToken).toBe("mock-access-token");
      expect(passwordService.hash).toHaveBeenCalledWith("password123");
      expect(usersRepo.create).toHaveBeenCalled();
      expect(jwtService.signAccessToken).toHaveBeenCalledWith({
        userId: "user_1",
      });
    });

    it("should throw when email is already taken", async () => {
      vi.mocked(usersRepo.findByEmail).mockResolvedValue(
        createUser({ email: registerInput.email }),
      );

      await expect(authService.register(registerInput)).rejects.toThrow(
        "Email already registered",
      );
    });
  });

  describe("login", () => {
    const loginInput = {
      email: "jean@example.com",
      password: "password123",
    };

    it("should login and return user + token", async () => {
      const user = createUser({
        id: "user_1",
        email: loginInput.email,
        passwordHash: "hashed_password",
      });

      vi.mocked(usersRepo.findByEmail).mockResolvedValue(user);
      vi.mocked(passwordService.verify).mockResolvedValue(true);
      vi.mocked(usersRepo.updateLastLogin).mockResolvedValue(undefined);

      const result = await authService.login(loginInput);

      expect(result.user.id).toBe("user_1");
      expect(result.accessToken).toBe("mock-access-token");
      expect(usersRepo.updateLastLogin).toHaveBeenCalledWith("user_1");
    });

    it("should throw when user not found", async () => {
      vi.mocked(usersRepo.findByEmail).mockResolvedValue(undefined);

      await expect(authService.login(loginInput)).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("should throw when password is wrong", async () => {
      vi.mocked(usersRepo.findByEmail).mockResolvedValue(
        createUser({ email: loginInput.email, passwordHash: "hashed_password" }),
      );
      vi.mocked(passwordService.verify).mockResolvedValue(false);

      await expect(authService.login(loginInput)).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("should throw when user is disabled", async () => {
      vi.mocked(usersRepo.findByEmail).mockResolvedValue(
        createDisabledUser({ email: loginInput.email }),
      );

      await expect(authService.login(loginInput)).rejects.toThrow(
        "Account is disabled",
      );
    });
  });

  describe("me", () => {
    it("should return user by id", async () => {
      const user = createUser({ id: "user_1" });

      vi.mocked(usersRepo.findById).mockResolvedValue(user);

      const result = await authService.getMe("user_1");

      expect(result.id).toBe("user_1");
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("should throw when user not found", async () => {
      vi.mocked(usersRepo.findById).mockResolvedValue(undefined);

      await expect(authService.getMe("unknown")).rejects.toThrow(
        "User not found",
      );
    });
  });
});
