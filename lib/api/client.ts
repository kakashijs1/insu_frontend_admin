/**
 * Base API Client
 * - Fetch wrapper with error handling
 * - Auto attach access token to requests
 * - Handle 401 responses
 */

const API_BASE_URL = "/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Token storage (in-memory for security)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { body, headers: customHeaders, ...restOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  // Attach access token if available
  if (accessToken) {
    (headers as Record<string, string>)["Authorization"] =
      `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...restOptions,
    headers,
    credentials: "include", // Include cookies for refresh token
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && !endpoint.includes("/auth/refresh")) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry original request with new token
        if (accessToken) {
          (headers as Record<string, string>)["Authorization"] =
            `Bearer ${accessToken}`;
        }
        const retryResponse = await fetch(url, { ...config, headers });
        return handleResponse<T>(retryResponse);
      }
    }

    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, error instanceof Error ? error.message : "Network error");
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "Request failed");
  }

  return data as ApiResponse<T>;
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      clearAccessToken();
      return false;
    }

    const data = await response.json();
    if (data.success && data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
      return true;
    }

    clearAccessToken();
    return false;
  } catch {
    clearAccessToken();
    return false;
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
