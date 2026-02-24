import Elysia from "elysia";

const healthRoutes = new Elysia().get("/health", () => ({
  status: "ok",
  time: new Date().toISOString(),
}));

export default healthRoutes;
