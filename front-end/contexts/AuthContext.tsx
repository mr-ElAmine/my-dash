import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { tokenStorage } from "../services/tokenStorage";
import * as authApi from "../api/auth";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      const storedUser = await tokenStorage.getUser();
      const token = await tokenStorage.getAccessToken();
      if (storedUser && token) {
        setUser(storedUser);
      }
      setIsLoading(false);
    })();
  }, []);

  const loginFn = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login(email, password);
      await tokenStorage.saveAuth(
        {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
        result.user,
      );
      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    await tokenStorage.clear();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login: loginFn, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
