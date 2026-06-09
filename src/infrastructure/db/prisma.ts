import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton — avoids exhausting DB connections during dev
 * hot-reload. Only used when DATA_SOURCE="prisma".
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["error", "warn"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
