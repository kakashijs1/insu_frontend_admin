import { t } from "elysia";

export const authSchema = {
  "auth.register": t.Object({
    username: t.String({ minLength: 3 }),
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 8 }),
  }),
  "auth.login": t.Object({
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 8 }),
  }),
};
