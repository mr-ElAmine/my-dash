import { useState } from "react";
import type { IAuthService } from "../services/auth.service";
import { AuthService } from "../services/auth.service";
import { useAuthStore } from "../stores/auth.store";

export function useRegister(service: IAuthService = new AuthService()) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);

  async function register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) {
    setLoading(true);
    setError(null);

    try {
      const result = await service.register(data);
      setAuth(result.accessToken, result.user);
      return result;
    } catch {
      setError("Erreur lors de l'inscription. Veuillez réessayer.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { register, loading, error };
}
