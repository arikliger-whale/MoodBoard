/**
 * Admin Translations API
 * GET /api/admin/translations - List all translations (admin only)
 * POST /api/admin/translations - Create/Update translation (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdmin } from '@/lib/api/admin-middleware'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const createTranslationSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(200)
    .regex(
      /^[a-z0-9-]+(\.[a-z0-9-]+){1,3}$/,
      'Key must follow pattern: pagename.componentname.actualkey (lowercase, hyphens, dots only)'
    ),
  valueHe: z.string().min(1),
  valueEn: z.string().min(1),
})

/**
 * GET /api/admin/translations - List all translations
 */
export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const prefix = searchParams.get('prefix') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { key: { contains: search } },
        { valueHe: { contains: search } },
        { valueEn: { contains: search } },
      ]
    }

    if (prefix) {
      where.key = { startsWith: prefix }
    }

    // Get total count
    const total = await prisma.translation.count({ where })

    // Get translations
    const translations = await prisma.translation.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { key: 'asc' },
    })

    return NextResponse.json({
      data: translations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Translation list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/admin/translations - Create or update translation
 */
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const data = createTranslationSchema.parse(body)

    // Check if translation with this key already exists
    const existing = await prisma.translation.findUnique({
      where: { key: data.key },
    })

    let translation

    if (existing) {
      // Update existing translation
      translation = await prisma.translation.update({
        where: { key: data.key },
        data: {
          valueHe: data.valueHe,
          valueEn: data.valueEn,
        },
      })
    } else {
      // Create new translation
      translation = await prisma.translation.create({
        data,
      })
    }

    return NextResponse.json(translation)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Translation create/update error:', error)
    return NextResponse.json(
      { error: 'Failed to save translation' },
      { status: 500 }
    )
  }
})
