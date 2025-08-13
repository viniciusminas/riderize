import { PrismaClient, User, Subscription, Ride } from "@prisma/client";

export interface MyContext {
  prisma: PrismaClient;
  user?: User;
}