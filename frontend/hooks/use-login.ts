import { useState } from "react";
import type { IAuthService } from "../services/auth.service";
import { AuthService } from "../services/auth.service";
import { useAuthStore } from "../stores/auth.store";

export function useLogin(service: IAuthService = new AuthService()) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);

    try {
      const result = await service.login(email, password);
      setAuth(result.accessToken, result.user);
      return result;
    } catch {
      setError("Email ou mot de passe incorrect");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error };
}
