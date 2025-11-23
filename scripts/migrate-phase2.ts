/**
 * Phase 2 Migration Script
 *
 * Migrates existing styles to Phase 2 schema:
 * 1. Sets default priceLevel for all styles
 * 2. Converts gallery images to StyleImage entities
 * 3. Categorizes images by heuristics
 * 4. Maintains backward compatibility
 *
 * SAFE TO RUN MULTIPLE TIMES - Idempotent design
 */

import { PrismaClient, PriceLevel } from '@prisma/client'

const prisma = new PrismaClient()

interface MigrationStats {
  stylesProcessed: number
  stylesUpdated: number
  stylesSkipped: number
  imagesCreated: number
  errors: Array<{ styleId: string; error: string }>
}

/**
 * Categorize images by position heuristics
 */
function categorizeImageByIndex(
  index: number,
  total: number
): 'ROOM_OVERVIEW' | 'ROOM_DETAIL' {
  // First 3 images are overview shots
  if (index < 3) {
    return 'ROOM_OVERVIEW'
  }

  // Rest are detail shots
  return 'ROOM_DETAIL'
}

/**
 * Migrate a single style to Phase 2
 */
async function migrateStyle(styleId: string, stats: MigrationStats) {
  try {
    // Get current style with images
    const style = await prisma.style.findUnique({
      where: { id: styleId },
      include: {
        images: true, // Get existing StyleImage records
      },
    })

    if (!style) {
      console.log(`   ⚠️  Style ${styleId} not found, skipping`)
      stats.stylesSkipped++
      return
    }

    console.log(`\n   📝 Processing: ${style.name.en}`)

    // Check if already migrated (has StyleImage records)
    if (style.images && style.images.length > 0) {
      console.log(`      ✓ Already has ${style.images.length} StyleImage records`)

      // Still update priceLevel if missing
      if (!style.priceLevel) {
        await prisma.style.update({
          where: { id: styleId },
          data: { priceLevel: PriceLevel.REGULAR },
        })
        console.log(`      ✓ Set priceLevel to REGULAR`)
        stats.stylesUpdated++
      } else {
        stats.stylesSkipped++
      }
      return
    }

    // Prepare updates
    const updates: any = {}
    let imageCount = 0

    // Set default price level if not set
    if (!style.priceLevel) {
      updates.priceLevel = PriceLevel.REGULAR
      console.log(`      ✓ Setting priceLevel to REGULAR`)
    }

    // Migrate gallery images to StyleImage entities
    if (style.gallery && style.gallery.length > 0) {
      console.log(`      📸 Migrating ${style.gallery.length} gallery images...`)

      // Gallery items can be strings or objects with { url: string }
      const styleImages = style.gallery.map((item: any, index: number) => {
        // Extract URL from object or use string directly
        const url = typeof item === 'string' ? item : item.url

        return {
          styleId: style.id,
          url: url,
          imageCategory: categorizeImageByIndex(index, style.gallery!.length),
          displayOrder: index,
          tags: ['migrated', 'legacy'],
          description: `Migrated from gallery - Image ${index + 1}`,
        }
      })

      // Create StyleImage records (MongoDB doesn't support skipDuplicates)
      await prisma.styleImage.createMany({
        data: styleImages,
      })

      imageCount = styleImages.length
      stats.imagesCreated += imageCount
      console.log(`      ✓ Created ${imageCount} StyleImage records`)
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      await prisma.style.update({
        where: { id: styleId },
        data: updates,
      })
    }

    stats.stylesProcessed++
    stats.stylesUpdated++
    console.log(`      ✅ Migration complete`)

  } catch (error) {
    console.error(`      ❌ Error migrating style ${styleId}:`, error)
    stats.errors.push({
      styleId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

/**
 * Main migration function
 */
async function migratePhase2(options: {
  dryRun?: boolean
  limit?: number
  styleIds?: string[]
} = {}) {
  const { dryRun = false, limit, styleIds } = options

  console.log('\n🔄 Phase 2: Migration Script')
  console.log('='.repeat(60))

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n')
  }

  const stats: MigrationStats = {
    stylesProcessed: 0,
    stylesUpdated: 0,
    stylesSkipped: 0,
    imagesCreated: 0,
    errors: [],
  }

  try {
    // Get styles to migrate
    let styles

    if (styleIds && styleIds.length > 0) {
      // Migrate specific styles
      console.log(`📋 Migrating ${styleIds.length} specific styles...\n`)
      styles = await prisma.style.findMany({
        where: { id: { in: styleIds } },
        select: { id: true, name: true },
      })
    } else {
      // Find all styles that need migration
      const where = limit ? {} : {}

      styles = await prisma.style.findMany({
        where,
        select: { id: true, name: true },
        take: limit,
      })

      console.log(`📋 Found ${styles.length} styles to process\n`)
    }

    if (styles.length === 0) {
      console.log('✅ No styles found to migrate')
      return stats
    }

    // Process each style
    for (let i = 0; i < styles.length; i++) {
      const style = styles[i]
      console.log(`[${i + 1}/${styles.length}]`)

      if (dryRun) {
        console.log(`   🔍 Would migrate: ${style.name.en}`)
        stats.stylesProcessed++
      } else {
        await migrateStyle(style.id, stats)
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`\nStyles Processed: ${stats.stylesProcessed}`)
    console.log(`Styles Updated: ${stats.stylesUpdated}`)
    console.log(`Styles Skipped: ${stats.stylesSkipped}`)
    console.log(`StyleImages Created: ${stats.imagesCreated}`)

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors: ${stats.errors.length}`)
      stats.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. Style ${err.styleId}: ${err.error}`)
      })
    }

    if (dryRun) {
      console.log('\n⚠️  This was a DRY RUN - no changes were made')
      console.log('💡 Run without --dry-run to apply changes\n')
    } else {
      console.log('\n✅ Migration complete!\n')
    }

    return stats

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const limitIndex = args.indexOf('--limit')
const limit = limitIndex >= 0 ? parseInt(args[limitIndex + 1]) : undefined
const styleIdsIndex = args.indexOf('--styles')
const styleIds = styleIdsIndex >= 0 ? args[styleIdsIndex + 1].split(',') : undefined

// Run migration
migratePhase2({ dryRun, limit, styleIds })
  .then((stats) => {
    if (stats.errors.length > 0) {
      process.exit(1)
    } else {
      process.exit(0)
    }
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
