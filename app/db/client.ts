import { PrismaClient } from "@prisma/client";

/**
 * Global Prisma client
 *
 * Only one instance of Prisma is kept across hot reloads to prevent
 * "FATAL: sorry, too many clients already" error.
 * @see https://github.com/prisma/prisma/issues/1983
 */
let prisma: PrismaClient;

const g = global as unknown as { prisma: PrismaClient | undefined };

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!g.prisma) {
    g.prisma = new PrismaClient();
  }

  prisma = g.prisma;
}

export { prisma };
