import Elysia from "elysia";
import prismaService from "@/db";
import {
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "./handlers";

const customerRoutes = new Elysia()
  .use(prismaService)
  .get("/customer", ({ query, prisma, set }) =>
    listCustomers({ query, prisma, set }),
  )
  .get("/customer/:id", ({ params, prisma, set }) =>
    getCustomerById({ params, prisma, set }),
  )
  .put("/customer/:id", ({ params, body, prisma, set }) =>
    updateCustomer({
      params,
      body: body as { name?: string; phone?: string },
      prisma,
      set,
    }),
  )
  .delete("/customer/:id", ({ params, prisma, set }) =>
    deleteCustomer({ params, prisma, set }),
  );

export default customerRoutes;
