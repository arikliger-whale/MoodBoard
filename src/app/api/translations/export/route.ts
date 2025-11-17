/**
 * Translation Export API
 * GET /api/translations/export?locale=he
 * Exports translations in the same format as current JSON files
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'he'

    // Validate locale
    if (locale !== 'he' && locale !== 'en') {
      return NextResponse.json(
        { error: 'Invalid locale. Must be "he" or "en"' },
        { status: 400 }
      )
    }

    // Fetch all translations
    const translations = await prisma.translation.findMany({
      orderBy: { key: 'asc' },
    })

    // Build nested JSON structure from flat keys
    const result: any = {}

    translations.forEach((t) => {
      const value = locale === 'he' ? t.valueHe : t.valueEn
      const parts = t.key.split('.')

      let current = result
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {}
        }
        current = current[parts[i]]
      }

      current[parts[parts.length - 1]] = value
    })

    // Return as JSON file download
    return new NextResponse(JSON.stringify(result, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${locale}.json"`,
      },
    })
  } catch (error) {
    console.error('Translation export error:', error)
    return NextResponse.json(
      { error: 'Failed to export translations' },
      { status: 500 }
    )
  }
}
