import { PrismaClient } from "./generated/prisma/client.js";

export const prisma = new PrismaClient();

export * from "./generated/prisma/client.js";