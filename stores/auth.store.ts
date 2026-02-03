/**
 * Auth Store (Zustand)
 * - State: user, accessToken, isAuthenticated, isLoading
 * - Actions: login(), logout(), setUser(), refreshToken(), initialize()
 */

import { create } from "zustand";
import {
  loginApi,
  logoutApi,
  refreshTokenApi,
  getCurrentUserApi,
  type User,
  type LoginCredentials,
  setAccessToken,
  clearAccessToken,
} from "@/lib/api";

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshToken: () => Promise<boolean>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Actions
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const { user } = await loginApi(credentials);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await logoutApi();
    } finally {
      clearAccessToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  refreshToken: async () => {
    try {
      const token = await refreshTokenApi();

      if (token) {
        // Optionally fetch user data after refresh
        const user = await getCurrentUserApi();
        if (user) {
          set({ user, isAuthenticated: true });
        }
        return true;
      }

      // Refresh failed - clear auth state
      set({
        user: null,
        isAuthenticated: false,
      });
      return false;
    } catch {
      set({
        user: null,
        isAuthenticated: false,
      });
      return false;
    }
  },

  initialize: async () => {
    // Prevent multiple initializations
    if (get().isInitialized) return;

    set({ isLoading: true });

    try {
      // Try to refresh token on app start
      const token = await refreshTokenApi();

      if (token) {
        setAccessToken(token);

        // Fetch current user
        const user = await getCurrentUserApi();

        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Selector hooks for convenience
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
