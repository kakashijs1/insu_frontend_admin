import { Hono } from "hono";

const app = new Hono()
  .basePath("/auth")
  .post("/login", (c) => c.json({ message: "Login Success" }));

export default app;
