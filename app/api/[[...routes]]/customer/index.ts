import Elysia from "elysia";
import prismaService from "@/db";
import { listCustomers, getCustomerById } from "./handlers";

const customerRoutes = new Elysia()
  .use(prismaService)
  .get("/customer", ({ query, prisma, set }) =>
    listCustomers({ query, prisma, set }),
  )
  .get("/customer/:id", ({ params, prisma, set }) =>
    getCustomerById({ params, prisma, set }),
  );

export default customerRoutes;
