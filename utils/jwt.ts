import { SignJWT, jwtVerify } from "jose";
import { env } from "@/config/env";
import { z } from "zod";
import { toResult } from "lyney";

const ALG = "HS256";
const ISSUER = "insu-admin";

const accessSecret = new TextEncoder().encode(env.JWT.ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT.REFRESH_SECRET);

const AccessTokenPayloadSchema = z.object({
  sub: z.string(),
  role: z.string(),
  iss: z.literal(ISSUER),
});

const RefreshTokenPayloadSchema = z.object({
  sub: z.string(),
  jti: z.string(),
  iss: z.literal(ISSUER),
});

export type AccessTokenPayload = z.infer<typeof AccessTokenPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;

export async function signAccessToken(payload: {
  sub: string;
  role: string;
}) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setSubject(payload.sub)
    .setExpirationTime("15m")
    .sign(accessSecret);
}

export async function signRefreshToken(payload: {
  sub: string;
  jti: string;
}) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setSubject(payload.sub)
    .setJti(payload.jti)
    .setExpirationTime("7d")
    .sign(refreshSecret);
}

export async function verifyAccessToken(token: string) {
  const result = await toResult(
    jwtVerify(token, accessSecret, { issuer: ISSUER }),
  );

  if (!result.ok) {
    return { ok: false as const, error: "Invalid or expired access token" };
  }

  const parsed = AccessTokenPayloadSchema.safeParse(result.data.payload);
  if (!parsed.success) {
    return { ok: false as const, error: "Malformed access token payload" };
  }

  return { ok: true as const, data: parsed.data };
}

export async function verifyRefreshToken(token: string) {
  const result = await toResult(
    jwtVerify(token, refreshSecret, { issuer: ISSUER }),
  );

  if (!result.ok) {
    return { ok: false as const, error: "Invalid or expired refresh token" };
  }

  const parsed = RefreshTokenPayloadSchema.safeParse(result.data.payload);
  if (!parsed.success) {
    return { ok: false as const, error: "Malformed refresh token payload" };
  }

  return { ok: true as const, data: parsed.data };
}
