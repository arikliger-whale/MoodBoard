/**
 * Prisma Client Instance
 * Singleton pattern for Next.js to prevent multiple instances in development
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if Prisma client needs to be regenerated (models added/removed)
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}

// Always reuse global instance to prevent multiple connections
// The Prisma client will be regenerated when schema changes (via prisma generate)
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}
