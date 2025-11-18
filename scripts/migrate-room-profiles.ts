#!/usr/bin/env tsx
/**
 * Migrate Room Profiles Script
 *
 * Migrates existing room profiles from:
 * - Color hex strings → Color IDs
 * - Material names → Material IDs
 *
 * Usage:
 *   npx tsx scripts/migrate-room-profiles.ts
 *   npx tsx scripts/migrate-room-profiles.ts --dry-run
 *   npx tsx scripts/migrate-room-profiles.ts --style-id <id>
 */

import { PrismaClient } from '@prisma/client'
import { Command } from 'commander'
import chalk from 'chalk'

const prisma = new PrismaClient()

const program = new Command()

program
  .name('migrate-room-profiles')
  .description('Migrate room profiles to use Color and Material IDs')
  .option('-d, --dry-run', 'Dry run - don\'t save changes')
  .option('-s, --style-id <id>', 'Migrate specific style only')
  .option('-v, --verbose', 'Verbose output')
  .parse(process.argv)

const options = program.opts()

// Helper: Find closest color by hex value
function findClosestColor(hexString: string, colors: any[]): string | null {
  const cleanHex = hexString.toLowerCase().replace(/^#/, '')

  // Try exact match first
  const exactMatch = colors.find(c => c.hex.toLowerCase().replace(/^#/, '') === cleanHex)
  if (exactMatch) return exactMatch.id

  // Convert hex to RGB
  const r1 = parseInt(cleanHex.substring(0, 2), 16)
  const g1 = parseInt(cleanHex.substring(2, 4), 16)
  const b1 = parseInt(cleanHex.substring(4, 6), 16)

  if (isNaN(r1) || isNaN(g1) || isNaN(b1)) {
    console.warn(chalk.yellow(`⚠️  Invalid hex color: ${hexString}`))
    return null
  }

  // Find closest color using Euclidean distance
  let closestColor: any = null
  let minDistance = Infinity

  for (const color of colors) {
    const hex2 = color.hex.toLowerCase().replace(/^#/, '')
    const r2 = parseInt(hex2.substring(0, 2), 16)
    const g2 = parseInt(hex2.substring(2, 4), 16)
    const b2 = parseInt(hex2.substring(4, 6), 16)

    if (isNaN(r2) || isNaN(g2) || isNaN(b2)) continue

    const distance = Math.sqrt(
      Math.pow(r1 - r2, 2) +
      Math.pow(g1 - g2, 2) +
      Math.pow(b1 - b2, 2)
    )

    if (distance < minDistance) {
      minDistance = distance
      closestColor = color
    }
  }

  if (closestColor && minDistance < 50) { // Threshold for "close enough"
    if (options.verbose) {
      console.log(chalk.gray(`  Matched ${hexString} → ${closestColor.hex} (${closestColor.name.he}) [distance: ${Math.round(minDistance)}]`))
    }
    return closestColor.id
  }

  console.warn(chalk.yellow(`⚠️  No close match for color: ${hexString} (best distance: ${Math.round(minDistance)})`))
  return null
}

// Helper: Find material by name using fuzzy matching
function findMaterialByName(name: string, materials: any[]): string | null {
  if (!name || typeof name !== 'string') return null

  const searchName = name.toLowerCase().trim()

  // Try exact match (Hebrew or English)
  for (const material of materials) {
    const hebrewName = material.name.he?.toLowerCase().trim()
    const englishName = material.name.en?.toLowerCase().trim()

    if (hebrewName === searchName || englishName === searchName) {
      if (options.verbose) {
        console.log(chalk.gray(`  Exact match: ${name} → ${material.name.he || material.name.en}`))
      }
      return material.id
    }
  }

  // Try fuzzy match using Levenshtein distance
  let bestMatch: any = null
  let bestScore = 0

  for (const material of materials) {
    const hebrewName = material.name.he?.toLowerCase().trim() || ''
    const englishName = material.name.en?.toLowerCase().trim() || ''

    const hebrewScore = similarity(searchName, hebrewName)
    const englishScore = similarity(searchName, englishName)
    const score = Math.max(hebrewScore, englishScore)

    if (score > bestScore) {
      bestScore = score
      bestMatch = material
    }
  }

  if (bestMatch && bestScore > 0.8) { // 80% similarity threshold
    if (options.verbose) {
      console.log(chalk.gray(`  Fuzzy match: ${name} → ${bestMatch.name.he || bestMatch.name.en} [score: ${(bestScore * 100).toFixed(0)}%]`))
    }
    return bestMatch.id
  }

  console.warn(chalk.yellow(`⚠️  No match for material: ${name} (best score: ${(bestScore * 100).toFixed(0)}%)`))
  return null
}

// Levenshtein distance for fuzzy matching
function similarity(s1: string, s2: string): number {
  if (s1.length === 0 || s2.length === 0) return 0

  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1

  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = []
  for (let i = 0; i <= s2.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s1.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(j - 1) !== s2.charAt(i - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s1.length] = lastValue
  }
  return costs[s1.length]
}

async function migrateRoomProfiles() {
  console.log(chalk.cyan.bold('\n🔄 Room Profile Migration\n'))
  console.log(chalk.gray('Migrating from hex colors/material names to Color/Material IDs...\n'))

  if (options.dryRun) {
    console.log(chalk.yellow('⚠️  DRY RUN MODE - No changes will be saved\n'))
  }

  console.log(chalk.gray('─'.repeat(60)))
  console.log('')

  try {
    // Fetch all colors and materials for matching
    console.log(chalk.blue('📦 Loading colors and materials...'))
    const colors = await prisma.color.findMany({
      select: { id: true, hex: true, name: true }
    })
    const materials = await prisma.material.findMany({
      select: { id: true, name: true, sku: true }
    })

    console.log(chalk.green(`✓ Loaded ${colors.length} colors and ${materials.length} materials\n`))

    // Find styles with room profiles
    const query = options.styleId
      ? { id: options.styleId }
      : {}

    const styles = await prisma.style.findMany({
      where: query,
      select: {
        id: true,
        name: true,
        roomProfiles: true
      }
    })

    console.log(chalk.blue(`📋 Found ${styles.length} styles to check\n`))

    let migratedCount = 0
    let errorCount = 0
    const unmatchedColors: string[] = []
    const unmatchedMaterials: string[] = []

    for (const style of styles) {
      if (!style.roomProfiles || style.roomProfiles.length === 0) continue

      console.log(chalk.cyan(`\n🎨 Processing: ${style.name.he || style.name.en}`))

      let hasChanges = false
      const migratedProfiles = style.roomProfiles.map((profile: any) => {
        const migratedProfile = { ...profile }

        // Migrate color palette
        if (profile.colorPalette) {
          const oldPalette = profile.colorPalette

          // Check if already migrated (has primaryId instead of primary)
          if (oldPalette.primaryId) {
            console.log(chalk.gray(`  ✓ ${profile.roomType} - Already migrated`))
            return migratedProfile
          }

          hasChanges = true
          const newPalette: any = {}

          // Migrate primary color
          if (oldPalette.primary) {
            const colorId = findClosestColor(oldPalette.primary, colors)
            if (colorId) {
              newPalette.primaryId = colorId
            } else {
              unmatchedColors.push(oldPalette.primary)
            }
          }

          // Migrate secondary colors
          if (oldPalette.secondary && Array.isArray(oldPalette.secondary)) {
            newPalette.secondaryIds = oldPalette.secondary
              .map((hex: string) => findClosestColor(hex, colors))
              .filter((id: string | null) => id !== null)

            oldPalette.secondary.forEach((hex: string) => {
              if (!findClosestColor(hex, colors)) {
                unmatchedColors.push(hex)
              }
            })
          } else {
            newPalette.secondaryIds = []
          }

          // Migrate accent colors
          if (oldPalette.accent && Array.isArray(oldPalette.accent)) {
            newPalette.accentIds = oldPalette.accent
              .map((hex: string) => findClosestColor(hex, colors))
              .filter((id: string | null) => id !== null)

            oldPalette.accent.forEach((hex: string) => {
              if (!findClosestColor(hex, colors)) {
                unmatchedColors.push(hex)
              }
            })
          } else {
            newPalette.accentIds = []
          }

          // Keep description
          if (oldPalette.description) {
            newPalette.description = oldPalette.description
          }

          migratedProfile.colorPalette = newPalette
          console.log(chalk.green(`  ✓ ${profile.roomType} - Migrated color palette`))
        }

        // Migrate materials
        if (profile.materials && Array.isArray(profile.materials)) {
          const oldMaterials = profile.materials

          // Check if already migrated (has materialId instead of name)
          if (oldMaterials.length > 0 && oldMaterials[0].materialId) {
            console.log(chalk.gray(`  ✓ ${profile.roomType} - Materials already migrated`))
            return migratedProfile
          }

          hasChanges = true
          const newMaterials = []

          for (const oldMaterial of oldMaterials) {
            if (!oldMaterial.name) continue

            const materialName = oldMaterial.name.he || oldMaterial.name.en
            const materialId = findMaterialByName(materialName, materials)

            if (materialId) {
              newMaterials.push({
                materialId,
                application: oldMaterial.application || null,
                finish: oldMaterial.finish || null
              })
            } else {
              unmatchedMaterials.push(materialName)
            }
          }

          migratedProfile.materials = newMaterials
          console.log(chalk.green(`  ✓ ${profile.roomType} - Migrated ${newMaterials.length}/${oldMaterials.length} materials`))
        }

        return migratedProfile
      })

      // Update style if changes were made
      if (hasChanges && !options.dryRun) {
        try {
          await prisma.style.update({
            where: { id: style.id },
            data: { roomProfiles: migratedProfiles as any }
          })
          migratedCount++
          console.log(chalk.green(`  ✅ Updated successfully`))
        } catch (error) {
          errorCount++
          console.error(chalk.red(`  ❌ Error updating: ${error}`))
        }
      } else if (hasChanges) {
        console.log(chalk.yellow(`  [DRY RUN] Would update style`))
      }
    }

    // Summary
    console.log(chalk.cyan.bold('\n\n📊 Migration Summary\n'))
    console.log(chalk.gray('─'.repeat(60)))
    console.log(chalk.green(`✓ Styles migrated: ${migratedCount}`))
    if (errorCount > 0) {
      console.log(chalk.red(`✗ Errors: ${errorCount}`))
    }

    if (unmatchedColors.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Unmatched colors (${unmatchedColors.length}):`))
      const uniqueColors = [...new Set(unmatchedColors)]
      uniqueColors.slice(0, 10).forEach(color => {
        console.log(chalk.gray(`   - ${color}`))
      })
      if (uniqueColors.length > 10) {
        console.log(chalk.gray(`   ... and ${uniqueColors.length - 10} more`))
      }
    }

    if (unmatchedMaterials.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Unmatched materials (${unmatchedMaterials.length}):`))
      const uniqueMaterials = [...new Set(unmatchedMaterials)]
      uniqueMaterials.slice(0, 10).forEach(material => {
        console.log(chalk.gray(`   - ${material}`))
      })
      if (uniqueMaterials.length > 10) {
        console.log(chalk.gray(`   ... and ${uniqueMaterials.length - 10} more`))
      }
    }

    console.log('')

  } catch (error) {
    console.error(chalk.red('\n❌ Migration failed:'), error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateRoomProfiles()
  .then(() => {
    console.log(chalk.green.bold('\n✅ Migration completed!\n'))
    process.exit(0)
  })
  .catch((error) => {
    console.error(chalk.red('\n❌ Migration failed:'), error)
    process.exit(1)
  })
