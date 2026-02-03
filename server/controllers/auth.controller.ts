import { Context } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { AuthUseCase } from "@/server/usecases/auth.usecase";
import { RegisterDto, LoginDto } from "@/server/dto/auth.dto";
import { toResult } from "lyney";
import { env } from "@/config/env";
import { verifyAccessToken } from "@/server/libs/jwt";
import { z } from "zod";

const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export class AuthController {
    constructor(private authUseCase: AuthUseCase) {}

    register = async (c: Context) => {
        // Validate body
        const body = await c.req.json();
        const parseResult = RegisterDto.safeParse(body);
        if (!parseResult.success) {
            return c.json(
                { success: false, error: z.treeifyError(parseResult.error) },
                400,
            );
        }

        // Execute Logic with Lyney
        const result = await toResult(
            this.authUseCase.register(parseResult.data),
        );

        if (!result.ok) {
            return c.json({ success: false, error: result.error.message }, 400);
        }

        return c.json({ success: true, data: result.data }, 201);
    };

    login = async (c: Context) => {
        const body = await c.req.json();
        const parseResult = LoginDto.safeParse(body);
        if (!parseResult.success) {
            return c.json({ success: false, error: "Invalid input" }, 400);
        }

        // Execute Logic with Lyney
        const result = await toResult(this.authUseCase.login(parseResult.data));
        if (!result.ok) {
            return c.json({ success: false, error: result.error.message }, 400);
        }

        // Set Cookie
        setCookie(c, "refresh_token", result.data.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: REFRESH_TOKEN_MAX_AGE,
            expires: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000),
        });

        return c.json({
            success: true,
            data: {
                user: result.data.user,
                accessToken: result.data.accessToken,
            },
        });
    };

    refresh = async (c: Context) => {
        const token = getCookie(c, "refresh_token");
        if (!token) {
            return c.json(
                { success: false, error: "Missing refresh token" },
                401,
            );
        }

        const result = await toResult(this.authUseCase.refreshToken(token));
        if (!result.ok) {
            return c.json({ success: false, error: result.error.message }, 403);
        }

        return c.json({ success: true, data: result.data });
    };

    logout = async (c: Context) => {
        setCookie(c, "refresh_token", "", {
            maxAge: 0,
            path: "/",
        });
        return c.json({ success: true, message: "Logged out" });
    };

    me = async (c: Context) => {
        // Get token from Authorization header
        const authHeader = c.req.header("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return c.json(
                { success: false, error: "Missing or invalid token" },
                401,
            );
        }

        const token = authHeader.slice(7);
        const payload = verifyAccessToken(token);
        if (!payload) {
            return c.json(
                { success: false, error: "Invalid or expired token" },
                401,
            );
        }

        // Get user from database
        const result = await toResult(
            this.authUseCase.getUserById(payload.userId),
        );
        if (!result.ok) {
            return c.json({ success: false, error: result.error.message }, 404);
        }

        return c.json({ success: true, data: { user: result.data } });
    };
}
