import { cookies } from "next/headers";

const ACCESS_TOKEN_KEY = "admin_access_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";
const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const setAccessTokenToCookies = async (accessToken: string) => {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: "/",
  });
};

const getAccessTokenFromCookies = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_KEY)?.value ?? null;
};

const setRefreshTokenToCookies = async (refreshToken: string) => {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/",
  });
};

const getRefreshTokenFromCookies = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_KEY)?.value ?? null;
};

const clearAuthCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);
};

export interface AuthState {
  isLoggedIn: boolean;
  userId: string | null;
  role: string | null;
}

const getAuthState = async (): Promise<AuthState> => {
  const token = await getAccessTokenFromCookies();
  if (!token) return { isLoggedIn: false, userId: null, role: null };

  const { verifyAccessToken } = await import("@/utils/jwt");
  const result = await verifyAccessToken(token);
  if (result.ok) {
    return { isLoggedIn: true, userId: result.data.sub, role: result.data.role };
  }

  return { isLoggedIn: false, userId: null, role: null };
};

export {
  setAccessTokenToCookies,
  getAccessTokenFromCookies,
  setRefreshTokenToCookies,
  getRefreshTokenFromCookies,
  clearAuthCookies,
  getAuthState,
};
