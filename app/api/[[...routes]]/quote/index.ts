import Elysia from "elysia";
import { quoteSchema } from "./schema";
import prismaService from "@/db";
import {
  listQuotes,
  getQuoteById,
  reviewQuote,
  updateQuoteStatus,
  getQuoteStats,
  recordInstallmentPayment,
} from "./handlers";

const quoteRoutes = new Elysia()
  .model(quoteSchema)
  .use(prismaService)
  .get("/quote", ({ query, headers, prisma, set }) =>
    listQuotes({ query, headers, prisma, set }),
  )
  .get("/quote/stats", ({ headers, prisma, set }) =>
    getQuoteStats({ headers, prisma, set }),
  )
  .get("/quote/:id", ({ params, headers, prisma, set }) =>
    getQuoteById({ params, headers, prisma, set }),
  )
  .put(
    "/quote/:id/review",
    ({ params, headers, body, prisma, set }) =>
      reviewQuote({ params, headers, body, prisma, set }),
    { body: "quote.review" },
  )
  .put(
    "/quote/:id/status",
    ({ params, headers, body, prisma, set }) =>
      updateQuoteStatus({ params, headers, body, prisma, set }),
    { body: "quote.status" },
  )
  .put(
    "/quote/:id/installment/:installmentId/pay",
    ({ params, headers, body, prisma, set }) =>
      recordInstallmentPayment({ params, headers, body, prisma, set }),
    { body: "installment.pay" },
  );

export default quoteRoutes;
