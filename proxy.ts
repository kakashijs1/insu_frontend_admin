import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login"];
const ACCESS_TOKEN_KEY = "admin_access_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";
const ISSUER = "insu-admin";
const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

function getAccessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is not set");
  return new TextEncoder().encode(secret);
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret(), {
      issuer: ISSUER,
    });
    return { valid: true, expired: false, payload } as const;
  } catch (err) {
    const isExpired =
      err instanceof Error && err.message.includes('"exp" claim');
    return { valid: false, expired: isExpired } as const;
  }
}

async function tryRefresh(
  request: NextRequest,
  response: NextResponse,
): Promise<boolean> {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;
  if (!refreshToken) return false;

  const baseUrl = request.nextUrl.origin;

  try {
    const res = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const json = await res.json();
    if (!json?.success || !json?.data) return false;

    const { accessToken, refreshToken: newRefreshToken } = json.data;
    if (
      typeof accessToken !== "string" ||
      typeof newRefreshToken !== "string"
    ) {
      return false;
    }

    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: ACCESS_MAX_AGE,
      path: "/",
    });

    response.cookies.set(REFRESH_TOKEN_KEY, newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: REFRESH_MAX_AGE,
      path: "/",
    });

    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  if (pathname === "/") {
    const destination = accessToken ? "/admin" : "/login";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  let isLoggedIn = false;

  if (accessToken) {
    const result = await verifyToken(accessToken);

    if (result.valid) {
      isLoggedIn = true;
    } else if (result.expired) {
      const response = NextResponse.next();
      const refreshed = await tryRefresh(request, response);
      if (refreshed) {
        if (isPublicPage) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
        return response;
      }
    }
  } else {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;
    if (refreshToken) {
      const response = NextResponse.next();
      const refreshed = await tryRefresh(request, response);
      if (refreshed) {
        if (isPublicPage) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
        return response;
      }
    }
  }

  if (isLoggedIn && isPublicPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!isLoggedIn && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt).*)"],
};
