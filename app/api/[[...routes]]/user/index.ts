import Elysia from "elysia";
import prismaService from "@/db";
import { listUsers, createUser, updateUser, deleteUser } from "./handlers";

const userRoutes = new Elysia()
  .use(prismaService)
  .get("/user", ({ headers, query, prisma, set }) =>
    listUsers({ headers, query, prisma, set }),
  )
  .post("/user", ({ headers, body, prisma, set }) =>
    createUser({
      headers,
      body: body as {
        email: string;
        username: string;
        password: string;
        role: "Employee" | "Super";
        fullName?: string;
      },
      prisma,
      set,
    }),
  )
  .put("/user/:id", ({ headers, params, body, prisma, set }) =>
    updateUser({
      headers,
      params,
      body: body as {
        role?: "Employee" | "Super";
        isActive?: boolean;
        fullName?: string;
      },
      prisma,
      set,
    }),
  )
  .delete("/user/:id", ({ headers, params, prisma, set }) =>
    deleteUser({ headers, params, prisma, set }),
  );

export default userRoutes;
