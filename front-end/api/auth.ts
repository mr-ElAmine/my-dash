import { api } from "./client";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  return data.data as LoginResponse;
}

export async function refreshAuth(refreshToken: string) {
  const { data } = await api.post("/auth/refresh", { refreshToken });
  return data.data as RefreshResponse;
}
