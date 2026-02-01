import { Context } from "hono";

export interface AppContext extends Context {
  Variables: {
    user?: {
      userId: string;
      role: string;
    };
  };
}
