import { api } from "./api";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: "active" | "disabled";
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  accessToken: string;
  user: AuthUser;
}

export interface IAuthService {
  login(email: string, password: string): Promise<AuthResult>;
  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<AuthResult>;
  me(token: string): Promise<AuthUser>;
}

export class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<AuthResult> {
    const res = await api.post<{ data: AuthResult }>("/auth/login", {
      email,
      password,
    });
    return res.data.data;
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<AuthResult> {
    const res = await api.post<{ data: AuthResult }>("/auth/register", data);
    return res.data.data;
  }

  async me(token: string): Promise<AuthUser> {
    const res = await api.get<{ data: { user: AuthUser } }>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data.user;
  }
}
