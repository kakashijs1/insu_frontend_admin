import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { env } from "@/config/env";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // log:
    //   env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    adapter,
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;