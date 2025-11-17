/**
 * Recover Orphaned Images from GCP Storage
 *
 * This utility finds images that were uploaded to GCP but not associated
 * with styles in the database (due to schema errors or crashes during generation).
 *
 * Usage:
 *   import { recoverOrphanedImages } from '@/lib/seed/recover-images'
 *
 *   // Dry run for specific style
 *   await recoverOrphanedImages('691b4e90a247c7828180030d', true)
 *
 *   // Actually recover
 *   await recoverOrphanedImages('691b4e90a247c7828180030d', false)
 *
 *   // Recover all styles
 *   await recoverOrphanedImages(undefined, false)
 */

import { PrismaClient } from '@prisma/client'
import { listStyleImages } from '../storage/gcp-storage'

const prisma = new PrismaClient()

export interface RecoveryResult {
  success: boolean
  stylesProcessed: number
  mainImagesRecovered: number
  roomImagesRecovered: number
  errors: Array<{ styleId: string; styleName: string; error: string }>
}

/**
 * Recover orphaned images from GCP and associate with styles
 *
 * @param styleId - Specific style ID to recover (optional, recovers all if not provided)
 * @param dryRun - If true, only reports what would be done without making changes
 * @returns Recovery result with statistics
 */
export async function recoverOrphanedImages(
  styleId?: string,
  dryRun = true
): Promise<RecoveryResult> {
  const result: RecoveryResult = {
    success: true,
    stylesProcessed: 0,
    mainImagesRecovered: 0,
    roomImagesRecovered: 0,
    errors: [],
  }

  try {
    console.log(`\n🔍 ${dryRun ? '[DRY RUN] ' : ''}Starting image recovery...`)
    console.log(`Target: ${styleId ? `Style ${styleId}` : 'All styles'}\n`)

    // Get styles to check
    const styles = await prisma.style.findMany({
      where: styleId ? { id: styleId } : {},
      include: {
        subCategory: { select: { id: true, slug: true } },
      },
    })

    console.log(`Found ${styles.length} style(s) to check\n`)

    for (const style of styles) {
      try {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
        console.log(`📦 Style: ${style.name.en} (${style.name.he})`)
        console.log(`   ID: ${style.id}`)

        // List images in GCP
        console.log(`\n   Scanning GCP storage...`)
        const gcpImages = await listStyleImages(style.id)

        // Check main images
        const mainImagesInDb = style.images || []
        const missingMainImages = gcpImages.mainImages.filter(
          (url) => !mainImagesInDb.includes(url)
        )

        console.log(`\n   📸 Main Images:`)
        console.log(`      In database: ${mainImagesInDb.length}`)
        console.log(`      In GCP: ${gcpImages.mainImages.length}`)
        console.log(`      Missing: ${missingMainImages.length}`)

        // Check room images
        const roomTypesInGcp = Object.keys(gcpImages.roomImages)
        let missingRoomImages = 0

        console.log(`\n   🚪 Room Profile Images:`)
        console.log(`      Room types in GCP: ${roomTypesInGcp.length}`)

        for (const [roomType, images] of Object.entries(gcpImages.roomImages)) {
          // Room profile recovery is complex - requires roomTypeId matching
          // For now, just count orphaned images
          console.log(`      ${roomType}: ${images.length} images found (recovery requires manual intervention)`)
          missingRoomImages += images.length
        }

        console.log(`      Total room images found: ${missingRoomImages}`)
        console.log(`      ⚠️  Room image recovery requires roomTypeId mapping (not yet implemented)`)

        // Skip if nothing to recover (only check main images, room images are informational)
        if (missingMainImages.length === 0) {
          console.log(`\n   ✓ No missing main images - skipping`)
          if (missingRoomImages > 0) {
            console.log(`   ℹ️  ${missingRoomImages} room images exist in GCP (not recovered automatically)`)
          }
          continue
        }

        // Update database
        if (!dryRun) {
          console.log(`\n   💾 Updating database...`)

          // Update main images
          if (missingMainImages.length > 0) {
            await prisma.style.update({
              where: { id: style.id },
              data: {
                images: [...mainImagesInDb, ...missingMainImages],
              },
            })
            console.log(`      ✓ Added ${missingMainImages.length} main images`)
          }

          // Room images are not recovered automatically (requires roomTypeId mapping)
          if (missingRoomImages > 0) {
            console.log(`      ⚠️  ${missingRoomImages} room images found but not recovered`)
            console.log(`      Room image recovery requires manual intervention or additional implementation`)
          }

          console.log(`\n   ✅ Recovery complete for ${style.name.en}`)
        } else {
          console.log(`\n   [DRY RUN] Would recover:`)
          console.log(`      Main images: +${missingMainImages.length}`)
          if (missingRoomImages > 0) {
            console.log(`      Room images: ${missingRoomImages} found (not auto-recovered)`)
          }
        }

        result.stylesProcessed++
        result.mainImagesRecovered += missingMainImages.length
        result.roomImagesRecovered += missingRoomImages
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        result.errors.push({
          styleId: style.id,
          styleName: style.name.en,
          error: errorMsg,
        })
        console.error(`\n   ❌ Error processing ${style.name.en}:`, errorMsg)
      }
    }

    // Summary
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`\n📊 Recovery Summary:`)
    console.log(`   Styles processed: ${result.stylesProcessed}`)
    console.log(`   Main images ${dryRun ? 'would be' : ''} recovered: ${result.mainImagesRecovered}`)
    console.log(`   Room images ${dryRun ? 'would be' : ''} recovered: ${result.roomImagesRecovered}`)
    console.log(`   Errors: ${result.errors.length}`)

    if (result.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`)
      result.errors.forEach((err) => {
        console.log(`   ${err.styleName} (${err.styleId}): ${err.error}`)
      })
    }

    console.log(`\n${dryRun ? '💡 Run with dryRun=false to apply changes' : '✅ Recovery complete!'}`)
  } catch (error) {
    result.success = false
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error(`\n❌ Fatal error during recovery:`, errorMsg)
    result.errors.push({
      styleId: 'global',
      styleName: 'Recovery Process',
      error: errorMsg,
    })
  } finally {
    await prisma.$disconnect()
  }

  return result
}

// CLI support for direct execution
if (require.main === module) {
  const styleId = process.argv[2]
  const dryRun = process.argv[3] !== '--execute'

  recoverOrphanedImages(styleId, dryRun)
    .then((result) => {
      process.exit(result.success && result.errors.length === 0 ? 0 : 1)
    })
    .catch((error) => {
      console.error('Failed to run recovery:', error)
      process.exit(1)
    })
}
