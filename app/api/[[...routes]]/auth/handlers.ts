import { WithPrisma } from "@/db";
import argon2 from "argon2";
import { toResult } from "lyney";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from "@/utils/jwt";

export const register = async ({
  body,
  prisma,
  set,
}: {
  body: {
    username: string;
    email: string;
    password: string;
  };
  set: { status?: number | string };
} & WithPrisma) => {
  const { username, email, password } = body;

  const existingResult = await toResult(
    prisma.user.findUnique({ where: { email: email.trim() } }),
  );

  if (!existingResult.ok) {
    set.status = 500;
    return { success: false, message: "Internal server error" };
  }

  if (existingResult.data) {
    set.status = 409;
    return { success: false, message: "Email already exists" };
  }

  const hashResult = await toResult(argon2.hash(password.trim()));

  if (!hashResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to create user" };
  }

  const createResult = await toResult(
    prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim(),
        password: hashResult.data,
      },
    }),
  );

  if (!createResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to create user" };
  }

  set.status = 201;
  return {
    success: true,
    message: "User created",
    data: {
      userId: createResult.data.id,
      username: createResult.data.username,
    },
  };
};

export const login = async ({
  body,
  prisma,
  set,
}: {
  body: { email: string; password: string };
  set: { status?: number | string };
} & WithPrisma) => {
  const { email, password } = body;

  const userResult = await toResult(
    prisma.user.findUnique({ where: { email: email.trim() } }),
  );

  if (!userResult.ok) {
    set.status = 500;
    return { success: false, message: "Internal server error" };
  }

  if (!userResult.data) {
    set.status = 401;
    return { success: false, message: "Invalid email or password" };
  }

  const user = userResult.data;

  if (!user.isActive) {
    set.status = 403;
    return { success: false, message: "Account is deactivated" };
  }

  const verifyResult = await toResult(
    argon2.verify(user.password, password.trim()),
  );

  if (!verifyResult.ok || !verifyResult.data) {
    set.status = 401;
    return { success: false, message: "Invalid email or password" };
  }

  const jti = crypto.randomUUID();

  const accessTokenResult = await toResult(
    signAccessToken({ sub: user.id, role: user.role }),
  );

  if (!accessTokenResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to create session" };
  }

  const refreshTokenResult = await toResult(
    signRefreshToken({ sub: user.id, jti }),
  );

  if (!refreshTokenResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to create session" };
  }

  const dbResult = await toResult(
    prisma.adminRefreshToken.create({
      data: {
        jti,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
  );

  if (!dbResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to create session" };
  }

  return {
    success: true,
    message: "Login successful",
    data: {
      accessToken: accessTokenResult.data,
      refreshToken: refreshTokenResult.data,
    },
  };
};

export const refreshTokens = async ({
  body,
  prisma,
  set,
}: {
  body: { refreshToken: string };
  set: { status?: number | string };
} & WithPrisma) => {
  const verified = await verifyRefreshToken(body.refreshToken);

  if (!verified.ok) {
    set.status = 401;
    return { success: false, message: verified.error };
  }

  const { sub, jti } = verified.data;

  const tokenResult = await toResult(
    prisma.adminRefreshToken.findUnique({ where: { jti } }),
  );

  if (!tokenResult.ok) {
    set.status = 500;
    return { success: false, message: "Internal server error" };
  }

  if (
    !tokenResult.data ||
    tokenResult.data.revoked ||
    tokenResult.data.expiresAt < new Date()
  ) {
    set.status = 401;
    return { success: false, message: "Refresh token is invalid or revoked" };
  }

  const userResult = await toResult(
    prisma.user.findUnique({ where: { id: sub } }),
  );

  if (!userResult.ok || !userResult.data) {
    set.status = 401;
    return { success: false, message: "User not found" };
  }

  const user = userResult.data;
  const newJti = crypto.randomUUID();

  const newAccessResult = await toResult(
    signAccessToken({ sub: user.id, role: user.role }),
  );

  if (!newAccessResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to refresh session" };
  }

  const newRefreshResult = await toResult(
    signRefreshToken({ sub: user.id, jti: newJti }),
  );

  if (!newRefreshResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to refresh session" };
  }

  const txResult = await toResult(
    prisma.$transaction([
      prisma.adminRefreshToken.update({
        where: { jti },
        data: { revoked: true },
      }),
      prisma.adminRefreshToken.create({
        data: {
          jti: newJti,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.adminRefreshToken.deleteMany({
        where: {
          OR: [{ revoked: true }, { expiresAt: { lt: new Date() } }],
        },
      }),
    ]),
  );

  if (!txResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to refresh session" };
  }

  return {
    success: true,
    message: "Token refreshed",
    data: {
      accessToken: newAccessResult.data,
      refreshToken: newRefreshResult.data,
    },
  };
};

export const signOut = async ({
  body,
  prisma,
}: {
  body: { refreshToken: string };
  set: { status?: number | string };
} & WithPrisma) => {
  const verified = await verifyRefreshToken(body.refreshToken);

  if (verified.ok) {
    await toResult(
      prisma.adminRefreshToken.update({
        where: { jti: verified.data.jti },
        data: { revoked: true },
      }),
    );
  }

  return { success: true, message: "Signed out" };
};

export const getMe = async ({
  headers,
  prisma,
  set,
}: {
  headers: { authorization?: string };
  set: { status?: number | string };
} & WithPrisma) => {
  const authHeader = headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    set.status = 401;
    return { success: false, message: "Missing or invalid token" };
  }

  const token = authHeader.slice(7);
  const result = await verifyAccessToken(token);

  if (!result.ok) {
    set.status = 401;
    return { success: false, message: result.error };
  }

  const userResult = await toResult(
    prisma.user.findUnique({
      where: { id: result.data.sub },
      omit: { password: true },
    }),
  );

  if (!userResult.ok || !userResult.data) {
    set.status = 404;
    return { success: false, message: "User not found" };
  }

  return { success: true, data: { user: userResult.data } };
};

export const changePassword = async ({
  headers,
  body,
  prisma,
  set,
}: {
  headers: { authorization?: string };
  body: { currentPassword: string; newPassword: string };
  set: { status?: number | string };
} & WithPrisma) => {
  const authHeader = headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    set.status = 401;
    return { success: false, message: "Missing or invalid token" };
  }

  const token = authHeader.slice(7);
  const verified = await verifyAccessToken(token);
  if (!verified.ok) {
    set.status = 401;
    return { success: false, message: verified.error };
  }

  const userResult = await toResult(
    prisma.user.findUnique({
      where: { id: verified.data.sub },
      select: { id: true, password: true, passwordChanged: true, role: true },
    }),
  );

  if (!userResult.ok || !userResult.data) {
    set.status = 404;
    return { success: false, message: "User not found" };
  }

  if (userResult.data.passwordChanged) {
    set.status = 400;
    return {
      success: false,
      message:
        "รหัสผ่านถูกเปลี่ยนแล้ว หากต้องการเปลี่ยนอีกครั้ง กรุณาแจ้ง Super Admin",
    };
  }

  const verifyPw = await toResult(
    argon2.verify(userResult.data.password, body.currentPassword.trim()),
  );

  if (!verifyPw.ok || !verifyPw.data) {
    set.status = 400;
    return { success: false, message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };
  }

  const hashResult = await toResult(argon2.hash(body.newPassword.trim()));
  if (!hashResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to change password" };
  }

  const updateResult = await toResult(
    prisma.user.update({
      where: { id: userResult.data.id },
      data: {
        password: hashResult.data,
        passwordChanged: true,
      },
      select: { id: true },
    }),
  );

  if (!updateResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to change password" };
  }

  return { success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" };
};
