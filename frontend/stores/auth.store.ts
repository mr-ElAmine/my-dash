import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthUser } from "../services/auth.service";

const TOKEN_KEY = "auth-token";
const USER_KEY = "auth-user";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setAuth: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (token, user) => {
    AsyncStorage.setItem(TOKEN_KEY, token);
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  setUser: (user) => {
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    set({ token: null, user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    const [token, rawUser] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
    if (token[1] && rawUser[1]) {
      set({
        token: token[1],
        user: JSON.parse(rawUser[1]),
        isAuthenticated: true,
        isHydrated: true,
      });
    } else {
      set({ isHydrated: true });
    }
  },
}));
