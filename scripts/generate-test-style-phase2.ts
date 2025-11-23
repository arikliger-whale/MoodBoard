/**
 * Generate One Test Style with Phase 2
 *
 * This will test the full Phase 2 implementation by generating:
 * - 1 style with LUXURY price level
 * - Texture entities
 * - Material images
 * - Special images (composite + anchor)
 * - Room images (limited to 2 rooms for testing)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function generateTestStylePhase2() {
  console.log('\n🎨 Generating Test Style with Phase 2\n')
  console.log('=' .repeat(60))

  try {
    // Import the seed service
    const { seedStyles } = await import('../src/lib/seed/seed-service')

    // Progress callback
    const progress = (message: string, current?: number, total?: number) => {
      if (current && total) {
        console.log(`[${current}/${total}] ${message}`)
      } else {
        console.log(message)
      }
    }

    console.log('\n🚀 Starting generation with Phase 2 enabled...\n')

    // Generate 1 style with Phase 2
    const result = await seedStyles({
      limit: 1, // Only 1 style for testing
      generateImages: true, // Enable image generation
      priceLevel: 'LUXURY', // Test LUXURY tier
      generateRoomProfiles: false, // Skip room profiles for faster testing
      skipExisting: true,
      onProgress: progress,
    })

    console.log('\n' + '='.repeat(60))
    console.log('📊 GENERATION RESULT')
    console.log('='.repeat(60))

    console.log(`\nSuccess: ${result.success ? '✅' : '❌'}`)
    console.log(`\nStats:`)
    console.log(`   Styles Created: ${result.stats.styles.created}`)
    console.log(`   Styles Updated: ${result.stats.styles.updated}`)
    console.log(`   Styles Skipped: ${result.stats.styles.skipped}`)

    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors (${result.errors.length}):`)
      result.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.entity}: ${err.error}`)
      })
    }

    console.log('\n' + '='.repeat(60))
    console.log('\n✅ Test generation complete!')
    console.log('\n💡 Next: Run `npx tsx scripts/test-phase2-generation.ts` to verify\n')

  } catch (error) {
    console.error('\n❌ Generation failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the generation
generateTestStylePhase2()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
