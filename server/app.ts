import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoute from "@/server/routes/auth.route";

const app = new Hono().basePath("/api");

// Middleware
app.use("*", logger());
app.use("*", cors());

// Routes
app.route("/auth", authRoute);

// Health
app.get("/health", (c) =>
  c.json({ status: "ok", time: new Date().toISOString() }),
);

export default app;
