/**
 * Migration Script: JSON Files → Database
 * Imports translations from messages/he.json and messages/en.json into the database
 *
 * Usage:
 *   npx tsx scripts/migrate-translations.ts
 */

import { prisma } from '../src/lib/db/prisma'
import fs from 'fs'
import path from 'path'

/**
 * Flatten nested JSON object to dot notation
 * { admin: { categories: { title: "..." } } } → { "admin.categories.title": "..." }
 */
function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}

  for (const key in obj) {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recurse into nested object
      Object.assign(result, flattenObject(value, newKey))
    } else if (typeof value === 'string') {
      // Leaf node - add to result
      result[newKey] = value
    }
    // Skip non-string values (arrays, nulls, etc.)
  }

  return result
}

/**
 * Validate key format
 */
function isValidKey(key: string): boolean {
  // Must match: pagename.componentname.actualkey (1-4 levels, lowercase, hyphens, dots only)
  return /^[a-z0-9-]+(\.[a-z0-9-]+){0,3}$/.test(key)
}

async function migrate() {
  console.log('🚀 Starting translation migration...\n')

  try {
    // Read JSON files
    const heFilePath = path.join(process.cwd(), 'messages/he.json')
    const enFilePath = path.join(process.cwd(), 'messages/en.json')

    console.log('📖 Reading JSON files...')
    const heJson = JSON.parse(fs.readFileSync(heFilePath, 'utf-8'))
    const enJson = JSON.parse(fs.readFileSync(enFilePath, 'utf-8'))

    // Flatten to dot notation
    console.log('🔄 Flattening nested structures...')
    const heFlat = flattenObject(heJson)
    const enFlat = flattenObject(enJson)

    // Get all unique keys
    const allKeys = new Set([...Object.keys(heFlat), ...Object.keys(enFlat)])
    console.log(`\n📊 Found ${allKeys.size} unique translation keys\n`)

    const stats = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ key: string; error: string }>,
    }

    // Process each key
    let processed = 0
    for (const key of allKeys) {
      processed++

      // Progress indicator every 100 keys
      if (processed % 100 === 0) {
        console.log(`  Progress: ${processed}/${allKeys.size}...`)
      }

      try {
        // Validate key format
        if (!isValidKey(key)) {
          stats.errors.push({
            key,
            error: 'Invalid key format (must be lowercase, hyphens, dots only)',
          })
          stats.skipped++
          continue
        }

        const valueHe = heFlat[key] || ''
        const valueEn = enFlat[key] || ''

        // Skip if both values are empty
        if (!valueHe && !valueEn) {
          stats.skipped++
          continue
        }

        // Check if translation exists
        const existing = await prisma.translation.findUnique({
          where: { key },
        })

        if (existing) {
          // Update existing
          await prisma.translation.update({
            where: { key },
            data: {
              valueHe: valueHe || existing.valueHe, // Keep existing if new is empty
              valueEn: valueEn || existing.valueEn,
            },
          })
          stats.updated++
        } else {
          // Create new
          await prisma.translation.create({
            data: {
              key,
              valueHe,
              valueEn,
            },
          })
          stats.created++
        }
      } catch (error) {
        console.error(`❌ Error processing key "${key}":`, error)
        stats.errors.push({
          key,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        stats.skipped++
      }
    }

    // Print results
    console.log('\n✅ Migration completed!\n')
    console.log('📈 Statistics:')
    console.log(`  ✨ Created: ${stats.created}`)
    console.log(`  🔄 Updated: ${stats.updated}`)
    console.log(`  ⏭️  Skipped: ${stats.skipped}`)
    console.log(`  ❌ Errors: ${stats.errors.length}`)

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:')
      stats.errors.slice(0, 10).forEach(({ key, error }) => {
        console.log(`  - ${key}: ${error}`)
      })
      if (stats.errors.length > 10) {
        console.log(`  ... and ${stats.errors.length - 10} more`)
      }
    }

    console.log('\n🎉 Migration complete!')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrate()
