/**
 * Cleanup Script: Delete all approaches and clear legacy style fields
 *
 * Usage:
 *   npx dotenv -e .env.local -- tsx prisma/seeds/cleanup-approaches.ts
 *
 * WARNING: This will delete ALL approaches and clear materialSet/roomProfiles from styles
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  console.log('🧹 Starting cleanup...')

  // Delete all approaches
  const deletedApproaches = await prisma.approach.deleteMany({})
  console.log(`✅ Deleted ${deletedApproaches.count} approach(es)`)

  // Use raw MongoDB command to remove legacy fields from styles collection
  // This handles any old data that might still have materialSet/roomProfiles
  const result = await prisma.$runCommandRaw({
    update: 'styles',
    updates: [
      {
        q: {}, // Match all documents
        u: {
          $unset: {
            materialSet: '',
            roomProfiles: '',
          },
        },
        multi: true,
      },
    ],
  })

  const modifiedCount = (result as any).nModified || 0
  console.log(`✅ Removed legacy fields from ${modifiedCount} style document(s)`)

  console.log('🎉 Cleanup completed successfully')
  console.log('💡 You can now create new styles and approaches using the admin UI')
}

cleanup()
  .catch((error) => {
    console.error('❌ Cleanup failed', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

