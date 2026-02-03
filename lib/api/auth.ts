/**
 * Auth API Functions
 * - loginApi(email, password)
 * - logoutApi()
 * - refreshTokenApi()
 * - getCurrentUserApi()
 */

import { api, setAccessToken, clearAccessToken, ApiError } from "./client";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "Employee" | "Super" | "Affiliate";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login with email and password
 */
export async function loginApi(
  credentials: LoginCredentials,
): Promise<{ user: User; accessToken: string }> {
  const response = await api.post<LoginResponse>("/auth/login", credentials);

  if (!response.success || !response.data) {
    throw new ApiError(400, response.error || "Login failed");
  }

  // Store access token in memory
  setAccessToken(response.data.accessToken);

  return {
    user: response.data.user,
    accessToken: response.data.accessToken,
  };
}

/**
 * Logout - clears tokens
 */
export async function logoutApi(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    // Always clear token, even if API call fails
    clearAccessToken();
  }
}

/**
 * Refresh access token using refresh token cookie
 */
export async function refreshTokenApi(): Promise<string | null> {
  try {
    const response = await api.post<RefreshResponse>("/auth/refresh");

    if (response.success && response.data?.accessToken) {
      setAccessToken(response.data.accessToken);
      return response.data.accessToken;
    }

    clearAccessToken();
    return null;
  } catch {
    clearAccessToken();
    return null;
  }
}

/**
 * Get current authenticated user
 * Note: This requires a /auth/me endpoint to be implemented on the backend
 */
export async function getCurrentUserApi(): Promise<User | null> {
  try {
    const response = await api.get<{ user: User }>("/auth/me");

    if (response.success && response.data?.user) {
      return response.data.user;
    }

    return null;
  } catch {
    return null;
  }
}
