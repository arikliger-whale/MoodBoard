/**
 * Translation Import API
 * POST /api/admin/translations/import
 * Bulk import translations from JSON files (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdmin } from '@/lib/api/admin-middleware'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const importSchema = z.object({
  locale: z.enum(['he', 'en']),
  translations: z.record(z.any()), // Nested object structure
})

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
 * POST /api/admin/translations/import - Bulk import translations
 */
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { locale, translations } = importSchema.parse(body)

    // Flatten nested structure to key-value pairs
    const flatTranslations = flattenObject(translations)

    const stats = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    }

    // Process each translation
    for (const [key, value] of Object.entries(flatTranslations)) {
      try {
        // Validate key format
        if (!/^[a-z0-9-]+(\.[a-z0-9-]+){1,3}$/.test(key)) {
          stats.errors.push(`Invalid key format: ${key}`)
          stats.skipped++
          continue
        }

        // Check if exists
        const existing = await prisma.translation.findUnique({
          where: { key },
        })

        if (existing) {
          // Update existing
          await prisma.translation.update({
            where: { key },
            data: {
              [locale === 'he' ? 'valueHe' : 'valueEn']: value,
            },
          })
          stats.updated++
        } else {
          // Create new (with empty value for other locale)
          await prisma.translation.create({
            data: {
              key,
              valueHe: locale === 'he' ? value : '',
              valueEn: locale === 'en' ? value : '',
            },
          })
          stats.created++
        }
      } catch (error) {
        console.error(`Error importing key ${key}:`, error)
        stats.errors.push(`${key}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        stats.skipped++
      }
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Translation import error:', error)
    return NextResponse.json(
      { error: 'Failed to import translations' },
      { status: 500 }
    )
  }
})
