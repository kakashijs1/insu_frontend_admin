import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy (formerly Middleware)
 * - ตรวจสอบ authentication สำหรับ protected routes
 * - Redirect ไป /login ถ้าไม่ได้ login
 */

// Protected paths ที่ต้อง login ก่อนเข้าถึง
const protectedPaths = ["/admin"];

// Public paths ที่ไม่ต้อง login
const publicPaths = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ดึง refresh_token จาก cookie (HttpOnly cookie ที่ set จาก server)
    const refreshToken = request.cookies.get("refresh_token")?.value;

    // Root path "/" -> redirect ไป /admin หรือ /login ตาม auth status
    if (pathname === "/") {
        if (refreshToken) {
            return NextResponse.redirect(new URL("/admin", request.url));
        } else {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // ตรวจสอบว่าเป็น protected path หรือไม่
    const isProtectedPath = protectedPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

    // ตรวจสอบว่าเป็น public path หรือไม่
    const isPublicPath = publicPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

    // ถ้าเป็น protected path และไม่มี refresh token -> redirect ไป login
    if (isProtectedPath && !refreshToken) {
        const loginUrl = new URL("/login", request.url);
        // เก็บ redirect URL ไว้เพื่อ redirect กลับหลัง login
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ถ้าเป็น public path (login) และมี refresh token แล้ว -> redirect ไป admin
    if (isPublicPath && refreshToken) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
}

// Config: กำหนด paths ที่ Proxy จะทำงาน
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
    ],
};
