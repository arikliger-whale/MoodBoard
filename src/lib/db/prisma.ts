import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma Client Instance
 * Optimized for serverless environments (Vercel)
 * 
 * Note: In serverless environments, we don't reuse the global instance
 * to avoid connection issues between function invocations
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Optimize for serverless - reduce connection pool size
    // MongoDB connection string should include maxPoolSize parameter
  })

// Only reuse in non-serverless environments (development)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

