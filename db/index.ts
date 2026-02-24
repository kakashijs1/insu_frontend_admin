import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { env } from "@/config/env";
import Elysia from "elysia";

const connectionString = env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });

export type WithPrisma = {
  prisma: typeof prismaClient;
};

export const prismaClient = new PrismaClient({ adapter });

const prismaService = new Elysia({ name: "prismaService" }).decorate({
  prisma: prismaClient,
});

export default prismaService;
