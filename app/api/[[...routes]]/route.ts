import Elysia from "elysia";
import swagger from "@elysiajs/openapi";
import cors, { type HTTPMethod } from "@elysiajs/cors";
import healthRoutes from "./health";
import authRoutes from "./auth";
import quoteRoutes from "./quote";
import customerRoutes from "./customer";
import uploadRoutes from "./upload";
import affiliateRoutes from "./affiliate";

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
  origin:
    process.env.NODE_ENV === "production"
      ? "https://admin.yourdomain.com"
      : "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "DELETE"] as HTTPMethod[],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

export const app = new Elysia({ prefix: "/api" })
  .use(swagger(swaggerConfig))
  .use(cors(corsConfig))
  .use(healthRoutes)
  .use(authRoutes)
  .use(quoteRoutes)
  .use(customerRoutes)
  .use(uploadRoutes)
  .use(affiliateRoutes);

export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
