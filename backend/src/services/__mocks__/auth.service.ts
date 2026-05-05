import { vi } from "vitest";

export const mockRegister = vi.fn();
export const mockLogin = vi.fn();
export const mockGetMe = vi.fn();

export class AuthService {
  register = mockRegister;
  login = mockLogin;
  getMe = mockGetMe;
}
