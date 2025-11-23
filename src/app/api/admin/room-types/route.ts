/**
 * Admin Room Types API
 * Handles CRUD operations for room types (Living Room, Bedroom, Kitchen, etc.)
 */

import { withAdmin } from '@/lib/api/admin-middleware'
import { prisma } from '@/lib/db'
import { createRoomTypeSchema } from '@/lib/validations/roomType'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/room-types
 * List all room types with optional filters
 */
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const categoryId = url.searchParams.get('categoryId')
    const includeInactive = url.searchParams.get('includeInactive') === 'true'

    const roomTypes = await prisma.roomType.findMany({
      where: {
        ...(categoryId && { categoryId }),
        ...(includeInactive ? {} : { active: true }),
      },
      include: {
        category: true, // Include category info
      },
      orderBy: [
        { categoryId: 'asc' },
        { order: 'asc' },
      ],
    })

    return NextResponse.json({
      data: roomTypes,
      count: roomTypes.length,
    })
  } catch (error) {
    console.error('[ROOM TYPES GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

/**
 * POST /api/admin/room-types
 * Create a new room type with duplicate checking per category
 */
export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validated = createRoomTypeSchema.parse(body)

    // Check if slug already exists in this category
    const existingSlug = await prisma.roomType.findFirst({
      where: {
        slug: validated.slug,
        categoryId: validated.categoryId,
      },
    })

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Room type with this slug already exists in this category' },
        { status: 400 }
      )
    }

    // Check if name already exists in this category (prevent duplicates per category)
    const existingName = await prisma.roomType.findFirst({
      where: {
        categoryId: validated.categoryId,
        active: true,
        OR: [
          { 'name.he': validated.name.he },
          { 'name.en': validated.name.en },
        ],
      },
    })

    if (existingName) {
      return NextResponse.json(
        {
          error: 'Room type with this name already exists in this category',
          existingRoomType: existingName,
        },
        { status: 409 }
      )
    }

    const roomType = await prisma.roomType.create({
      data: {
        slug: validated.slug,
        name: validated.name,
        description: validated.description,
        icon: validated.icon,
        order: validated.order,
        categoryId: validated.categoryId,
        active: validated.active,
        detailedContent: validated.detailedContent,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(roomType, { status: 201 })
  } catch (error: any) {
    console.error('[ROOM TYPES POST] Error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
