import Elysia, { t } from "elysia";
import { affiliateSchema } from "./schema";
import prismaService from "@/db";
import {
  createAffiliate,
  listAffiliates,
  getAffiliateById,
  updateAffiliate,
  resetAffiliatePassword,
  getMyCases,
  getMyCaseById,
  getMyCommissions,
  payCommission,
  getMyDashboard,
} from "./handlers";

const affiliateRoutes = new Elysia()
  .model(affiliateSchema)
  .use(prismaService)
  .post(
    "/affiliate",
    ({ headers, body, prisma, set }) =>
      createAffiliate({ headers, body, prisma, set }),
    { body: "affiliate.create" },
  )
  .get("/affiliate/my-dashboard", ({ headers, prisma, set }) =>
    getMyDashboard({ headers, prisma, set }),
  )
  .get("/affiliate/my-cases", ({ headers, query, prisma, set }) =>
    getMyCases({ headers, query, prisma, set }),
  )
  .get("/affiliate/my-cases/:id", ({ headers, params, prisma, set }) =>
    getMyCaseById({ headers, params, prisma, set }),
  )
  .get("/affiliate/my-commissions", ({ headers, query, prisma, set }) =>
    getMyCommissions({ headers, query, prisma, set }),
  )
  .get("/affiliate", ({ headers, query, prisma, set }) =>
    listAffiliates({ headers, query, prisma, set }),
  )
  .get("/affiliate/:id", ({ headers, params, prisma, set }) =>
    getAffiliateById({ headers, params, prisma, set }),
  )
  .put(
    "/affiliate/:id",
    ({ headers, params, body, prisma, set }) =>
      updateAffiliate({ headers, params, body, prisma, set }),
    { body: "affiliate.update" },
  )
  .put("/affiliate/:id/reset-password", ({ headers, params, prisma, set }) =>
    resetAffiliatePassword({ headers, params, prisma, set }),
  )
  .put(
    "/commission/:id/pay",
    ({ headers, params, body, prisma, set }) =>
      payCommission({ headers, params, body, prisma, set }),
    { body: t.Object({ paymentEvidence: t.String() }) },
  );

export default affiliateRoutes;
