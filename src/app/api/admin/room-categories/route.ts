/**
 * Admin Room Categories API
 * Handles CRUD operations for room categories (Private, Public, Commercial, etc.)
 */

import { withAdmin } from '@/lib/api/admin-middleware'
import { prisma } from '@/lib/db'
import { createRoomCategorySchema } from '@/lib/validations/roomCategory'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/room-categories
 * List all room categories with room type counts
 */
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const includeInactive = url.searchParams.get('includeInactive') === 'true'

    const categories = await prisma.roomCategory.findMany({
      where: includeInactive ? {} : { active: true },
      include: {
        _count: {
          select: {
            roomTypes: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      data: categories,
      count: categories.length,
    })
  } catch (error) {
    console.error('[ROOM CATEGORIES GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

/**
 * POST /api/admin/room-categories
 * Create a new room category
 */
export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validated = createRoomCategorySchema.parse(body)

    // Check if slug already exists
    const existingSlug = await prisma.roomCategory.findUnique({
      where: { slug: validated.slug },
    })

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Room category with this slug already exists' },
        { status: 400 }
      )
    }

    // Check if name already exists (prevent duplicate names)
    const existingName = await prisma.roomCategory.findFirst({
      where: {
        OR: [
          { 'name.he': validated.name.he },
          { 'name.en': validated.name.en },
        ],
      },
    })

    if (existingName) {
      return NextResponse.json(
        {
          error: 'Room category with this name already exists',
          existingCategory: existingName,
        },
        { status: 409 }
      )
    }

    const category = await prisma.roomCategory.create({
      data: {
        slug: validated.slug,
        name: validated.name,
        description: validated.description,
        icon: validated.icon,
        order: validated.order,
        active: validated.active,
      },
      include: {
        _count: {
          select: {
            roomTypes: true,
          },
        },
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('[ROOM CATEGORIES POST] Error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
