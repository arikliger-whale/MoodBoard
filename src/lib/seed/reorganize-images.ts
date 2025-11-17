/**
 * Reorganize Seed Images from Centralized Folder to Style-Specific Folders
 *
 * This script:
 * 1. Lists all images in styles/seed-generated/
 * 2. Maps images to styles by extracting style name from filename
 * 3. Copies images to styles/{styleId}/ folders
 * 4. Updates database with new URLs
 * 5. Optionally deletes old seed-generated images
 *
 * Usage:
 *   npx dotenv -e .env.local -- tsx src/lib/seed/reorganize-images.ts [--execute] [--cleanup]
 *
 *   --execute: Actually perform reorganization (default is dry-run)
 *   --cleanup: Delete old images from seed-generated/ after copying
 */

import { PrismaClient } from '@prisma/client'
import { listFilesInPath, copyImageInGCP, getGCPPublicUrl } from '../storage/gcp-storage'
import slugify from 'slugify'

const prisma = new PrismaClient()

interface ReorganizationResult {
  success: boolean
  stylesProcessed: number
  imagesCopied: number
  imagesDeleted: number
  errors: Array<{ style: string; error: string }>
  orphanedImages: string[] // Images that couldn't be matched to a style
}

/**
 * Extract style name from image filename
 * Format: {timestamp}-{uuid}-{style-name}-{number}.png
 * Example: 1763377700619-d3d484ee-modern-_-material-design-timeless-in-off-white-1.png
 */
function extractStyleNameFromFilename(filename: string): string | null {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '')

  // Remove timestamp-uuid prefix (pattern: {digits}-{hex8}-)
  const withoutPrefix = nameWithoutExt.replace(/^\d+-[a-f0-9]+-/, '')

  // Remove trailing number (-1, -2, etc.)
  const styleName = withoutPrefix.replace(/-\d+$/, '')

  return styleName || null
}

/**
 * Normalize style name for matching
 * Converts filename format to match slug format
 * "modern-_-material-design-timeless-in-off-white" → "modern-material-design-timeless-off-white"
 * "natural-_-balanced-design-timeless-in-off-white" → "natural-balanced-design-timeless-off-white"
 */
function normalizeForMatching(name: string): string {
  return name
    .toLowerCase()
    .replace(/-_-/g, '-') // "&" becomes "-_-" in filenames, but nothing in slugs
    .replace(/-in-off-white$/, '-off-white') // Remove "in" before "off-white"
    .replace(/-in-/, '-') // Remove other "in" occurrences
}

/**
 * Reorganize images from seed-generated to style-specific folders
 */
export async function reorganizeImages(
  execute = false,
  cleanup = false
): Promise<ReorganizationResult> {
  const result: ReorganizationResult = {
    success: true,
    stylesProcessed: 0,
    imagesCopied: 0,
    imagesDeleted: 0,
    errors: [],
    orphanedImages: [],
  }

  try {
    console.log(`\n🔧 ${execute ? '' : '[DRY RUN] '}Image Reorganization`)
    console.log(`Cleanup: ${cleanup ? 'Yes' : 'No'}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    // Step 1: List all images in seed-generated folder
    console.log('📂 Step 1: Scanning seed-generated folder...')
    const seedImages = await listFilesInPath('styles/seed-generated/')
    console.log(`   Found ${seedImages.length} images\n`)

    if (seedImages.length === 0) {
      console.log('✅ No images to reorganize')
      return result
    }

    // Step 2: Group images by style name
    console.log('🔍 Step 2: Grouping images by style...')
    const imagesByStyle = new Map<string, string[]>()

    seedImages.forEach((url) => {
      const filename = url.split('/').pop() || ''
      const styleName = extractStyleNameFromFilename(filename)

      if (styleName) {
        if (!imagesByStyle.has(styleName)) {
          imagesByStyle.set(styleName, [])
        }
        imagesByStyle.get(styleName)!.push(url)
      } else {
        result.orphanedImages.push(url)
      }
    })

    console.log(`   Grouped into ${imagesByStyle.size} style groups`)
    if (result.orphanedImages.length > 0) {
      console.log(`   ⚠️  ${result.orphanedImages.length} images couldn't be parsed\n`)
    } else {
      console.log('')
    }

    // Step 3: Fetch all styles from database
    console.log('📊 Step 3: Fetching styles from database...')
    const allStyles = await prisma.style.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        images: true,
      },
    })
    console.log(`   Found ${allStyles.length} styles in database\n`)

    // Step 4: Match images to styles and reorganize
    console.log('🔄 Step 4: Matching and reorganizing images...\n')

    for (const [fileStyleName, imageUrls] of imagesByStyle.entries()) {
      try {
        // Try to match by normalizing filenames to match slugs
        const normalizedFileName = normalizeForMatching(fileStyleName)

        const matchedStyle = allStyles.find((style) => {
          // Match against slug (which is already normalized)
          return style.slug === normalizedFileName
        })

        if (!matchedStyle) {
          console.log(`   ❌ No match found for: ${fileStyleName}`)
          console.log(`      ${imageUrls.length} images orphaned\n`)
          result.orphanedImages.push(...imageUrls)
          continue
        }

        console.log(`   📦 ${matchedStyle.name.en}`)
        console.log(`      Style ID: ${matchedStyle.id}`)
        console.log(`      Images: ${imageUrls.length}`)

        const newImageUrls: string[] = [...matchedStyle.images] // Start with existing images

        // Copy each image to style-specific folder
        for (let i = 0; i < imageUrls.length; i++) {
          const sourceUrl = imageUrls[i]
          const filename = sourceUrl.split('/').pop() || `image-${i + 1}.png`
          const destinationKey = `styles/${matchedStyle.id}/${filename}`

          if (execute) {
            try {
              // Copy image to new location
              const newUrl = await copyImageInGCP(sourceUrl, destinationKey, cleanup)
              newImageUrls.push(newUrl)
              result.imagesCopied++

              if (cleanup) {
                result.imagesDeleted++
              }
            } catch (error) {
              console.log(`      ⚠️  Failed to copy ${filename}: ${error}`)
            }
          } else {
            // Dry run - just construct what the new URL would be
            const newUrl = getGCPPublicUrl(destinationKey)
            newImageUrls.push(newUrl)
            result.imagesCopied++
          }
        }

        // Update database with new image URLs
        if (execute) {
          await prisma.style.update({
            where: { id: matchedStyle.id },
            data: { images: newImageUrls },
          })
          console.log(`      ✅ Updated database with ${newImageUrls.length} total images`)
        } else {
          console.log(`      [DRY RUN] Would update DB with ${newImageUrls.length} total images`)
        }

        result.stylesProcessed++
        console.log('')
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        result.errors.push({ style: fileStyleName, error: errorMsg })
        console.log(`   ❌ Error processing ${fileStyleName}: ${errorMsg}\n`)
      }
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📊 Summary:')
    console.log(`   Styles processed: ${result.stylesProcessed}`)
    console.log(`   Images ${execute ? 'copied' : 'would be copied'}: ${result.imagesCopied}`)
    if (cleanup && execute) {
      console.log(`   Images deleted from seed-generated: ${result.imagesDeleted}`)
    }
    console.log(`   Orphaned images: ${result.orphanedImages.length}`)
    console.log(`   Errors: ${result.errors.length}`)

    if (result.orphanedImages.length > 0) {
      console.log('\n⚠️  Orphaned Images:')
      result.orphanedImages.forEach((url) => {
        console.log(`   - ${url.split('/').pop()}`)
      })
    }

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:')
      result.errors.forEach((err) => {
        console.log(`   ${err.style}: ${err.error}`)
      })
    }

    if (!execute) {
      console.log('\n💡 Add --execute to perform reorganization')
      if (!cleanup) {
        console.log('💡 Add --cleanup to delete old images after copying')
      }
    } else {
      console.log('\n✅ Reorganization complete!')
    }
  } catch (error) {
    result.success = false
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error(`\n❌ Fatal error: ${errorMsg}`)
    result.errors.push({ style: 'global', error: errorMsg })
  } finally {
    await prisma.$disconnect()
  }

  return result
}

// CLI support
if (require.main === module) {
  const execute = process.argv.includes('--execute')
  const cleanup = process.argv.includes('--cleanup')

  reorganizeImages(execute, cleanup)
    .then((result) => {
      process.exit(result.success && result.errors.length === 0 ? 0 : 1)
    })
    .catch((error) => {
      console.error('Failed to run reorganization:', error)
      process.exit(1)
    })
}
