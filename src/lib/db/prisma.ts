import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Production Prisma Client - connects directly to MongoDB Atlas
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'], // Only log errors in production
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

