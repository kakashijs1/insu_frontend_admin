import { z } from "zod";

/**
 * 1. Define Schema
 */
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: z.url(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  JWT_ACCESS_TTL: z.string(), // e.g. 10m
  JWT_REFRESH_TTL: z.string(), // e.g. 30d
});

/**
 * 2. Parse + Validate
 */
const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables");
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

/**
 * 3. Export typed env
 */
export const env = Object.freeze({
  NODE_ENV: parsed.data.NODE_ENV,

  DATABASE_URL: parsed.data.DATABASE_URL,

  JWT: {
    ACCESS_SECRET: parsed.data.JWT_ACCESS_SECRET,
    REFRESH_SECRET: parsed.data.JWT_REFRESH_SECRET,
    ACCESS_TTL: parsed.data.JWT_ACCESS_TTL,
    REFRESH_TTL: parsed.data.JWT_REFRESH_TTL,
  },
});
