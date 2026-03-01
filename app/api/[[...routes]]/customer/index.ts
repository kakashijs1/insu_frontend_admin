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
  .get("/customer", ({ headers, query, prisma, set }) =>
    listCustomers({ headers, query, prisma, set }),
  )
  .get("/customer/:id", ({ headers, params, prisma, set }) =>
    getCustomerById({ headers, params, prisma, set }),
  )
  .put("/customer/:id", ({ headers, params, body, prisma, set }) =>
    updateCustomer({
      headers,
      params,
      body: body as { name?: string; phone?: string },
      prisma,
      set,
    }),
  )
  .delete("/customer/:id", ({ headers, params, prisma, set }) =>
    deleteCustomer({ headers, params, prisma, set }),
  );

export default customerRoutes;
