import { PrismaClient } from "@prisma/client";

const globalAny = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalAny.prisma ??
  new PrismaClient({
    log: ["query"], // opcional: ver queries no console
  });

if (process.env.NODE_ENV !== "production") globalAny.prisma = prisma;
