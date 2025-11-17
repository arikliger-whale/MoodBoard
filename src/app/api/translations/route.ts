/**
 * Translation API - Fetch translations by prefix
 * GET /api/translations?locale=he&prefix=admin-categories
 * GET /api/translations?locale=he&prefixes=admin-categories,common
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'he'
    const prefix = searchParams.get('prefix')
    const prefixes = searchParams.get('prefixes')

    // Validate locale
    if (locale !== 'he' && locale !== 'en') {
      return NextResponse.json(
        { error: 'Invalid locale. Must be "he" or "en"' },
        { status: 400 }
      )
    }

    let translations: Record<string, string> = {}

    if (prefixes) {
      // Multiple prefixes (e.g., "admin-categories,common")
      const prefixList = prefixes.split(',').map((p) => p.trim())

      // Fetch all translations that start with any of the prefixes
      const results = await prisma.translation.findMany({
        where: {
          OR: prefixList.map((p) => ({
            key: { startsWith: p },
          })),
        },
      })

      // Build translations object
      results.forEach((t) => {
        translations[t.key] = locale === 'he' ? t.valueHe : t.valueEn
      })
    } else if (prefix) {
      // Single prefix
      const results = await prisma.translation.findMany({
        where: {
          key: { startsWith: prefix },
        },
      })

      // Build translations object
      results.forEach((t) => {
        translations[t.key] = locale === 'he' ? t.valueHe : t.valueEn
      })
    } else {
      // No prefix - return all translations (use with caution!)
      const results = await prisma.translation.findMany()

      results.forEach((t) => {
        translations[t.key] = locale === 'he' ? t.valueHe : t.valueEn
      })
    }

    return NextResponse.json(translations)
  } catch (error) {
    console.error('Translation fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    )
  }
}
