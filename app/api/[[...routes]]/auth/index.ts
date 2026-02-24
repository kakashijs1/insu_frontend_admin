import Elysia, { t } from "elysia";
import { authSchema } from "./schema";
import prismaService from "@/db";
import {
  register,
  login,
  refreshTokens,
  signOut,
  getMe,
  changePassword,
} from "./handlers";

const authRoutes = new Elysia()
  .model(authSchema)
  .use(prismaService)
  .post(
    "/register",
    ({ body, prisma, set }) => register({ body, prisma, set }),
    { body: "auth.register" },
  )
  .post("/login", ({ body, prisma, set }) => login({ body, prisma, set }), {
    body: "auth.login",
  })
  .post(
    "/auth/refresh",
    ({ body, prisma, set }) => refreshTokens({ body, prisma, set }),
    { body: t.Object({ refreshToken: t.String() }) },
  )
  .post(
    "/sign-out",
    ({ body, prisma, set }) => signOut({ body, prisma, set }),
    { body: t.Object({ refreshToken: t.String() }) },
  )
  .get("/auth/me", ({ headers, prisma, set }) =>
    getMe({ headers, prisma, set }),
  )
  .put(
    "/auth/change-password",
    ({ headers, body, prisma, set }) =>
      changePassword({ headers, body, prisma, set }),
    {
      body: t.Object({
        currentPassword: t.String({ minLength: 8 }),
        newPassword: t.String({ minLength: 8 }),
      }),
    },
  );

export default authRoutes;
