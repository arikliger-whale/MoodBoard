/**
 * Translation API - Fetch specific keys
 * POST /api/translations/keys
 * Body: { locale: "he", keys: ["admin.categories.title", "common.save"] }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const requestSchema = z.object({
  locale: z.enum(['he', 'en']),
  keys: z.array(z.string()).min(1).max(1000), // Max 1000 keys per request
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locale, keys } = requestSchema.parse(body)

    // Fetch requested translations
    const results = await prisma.translation.findMany({
      where: {
        key: { in: keys },
      },
    })

    // Build translations object
    const translations: Record<string, string> = {}
    results.forEach((t) => {
      translations[t.key] = locale === 'he' ? t.valueHe : t.valueEn
    })

    return NextResponse.json(translations)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Translation keys fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    )
  }
}
