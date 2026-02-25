import Elysia from "elysia";
import swagger from "@elysiajs/openapi";
import cors, { type HTTPMethod } from "@elysiajs/cors";
import healthRoutes from "./health";
import authRoutes from "./auth";
import quoteRoutes from "./quote";
import customerRoutes from "./customer";
import uploadRoutes from "./upload";
import affiliateRoutes from "./affiliate";
import userRoutes from "./user";
import { env } from "@/config/env";
import { rateLimiter } from "@/utils/rate-limiter";

const swaggerConfig = {
  path: "/docs",
  documentation: {
    info: {
      title: "INSU Admin API",
      description: "API documentation for INSU Admin system",
      version: "1.0.0",
    },
  },
};

const corsConfig = {
  origin: env.ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE"] as HTTPMethod[],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

export const app = new Elysia({ prefix: "/api" })
  .use(swagger(swaggerConfig))
  .use(cors(corsConfig))
  .use(rateLimiter({ max: 20, windowMs: 60_000 }))
  .use(healthRoutes)
  .use(authRoutes)
  .use(quoteRoutes)
  .use(customerRoutes)
  .use(uploadRoutes)
  .use(affiliateRoutes)
  .use(userRoutes);

export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
