/**
 * Admin Room Category API
 * Handles GET, PATCH, DELETE for a single room category
 */

import { withAdmin } from '@/lib/api/admin-middleware'
import { prisma } from '@/lib/db'
import { updateRoomCategorySchema } from '@/lib/validations/roomCategory'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/room-categories/[id]
 * Get a single room category by ID
 */
export const GET = withAdmin(async (
  request: NextRequest,
  _auth,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params
    const category = await prisma.roomCategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            roomTypes: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Room category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('[ROOM CATEGORY GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

/**
 * PATCH /api/admin/room-categories/[id]
 * Update a room category
 */
export const PATCH = withAdmin(async (
  request: NextRequest,
  _auth,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params
    const body = await request.json()
    const validated = updateRoomCategorySchema.parse(body)

    // Check if category exists
    const existing = await prisma.roomCategory.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Room category not found' }, { status: 404 })
    }

    // If slug is being updated, check it's not already taken
    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await prisma.roomCategory.findUnique({
        where: { slug: validated.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Room category with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // If name is being updated, check for duplicates
    if (validated.name) {
      const nameExists = await prisma.roomCategory.findFirst({
        where: {
          OR: [
            { 'name.he': validated.name.he },
            { 'name.en': validated.name.en },
          ],
          id: { not: params.id },
        },
      })

      if (nameExists) {
        return NextResponse.json(
          {
            error: 'Room category with this name already exists',
            existingCategory: nameExists,
          },
          { status: 409 }
        )
      }
    }

    const category = await prisma.roomCategory.update({
      where: { id: params.id },
      data: {
        ...(validated.slug && { slug: validated.slug }),
        ...(validated.name && { name: validated.name }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.icon !== undefined && { icon: validated.icon }),
        ...(validated.order !== undefined && { order: validated.order }),
        ...(validated.active !== undefined && { active: validated.active }),
      },
      include: {
        _count: {
          select: {
            roomTypes: true,
          },
        },
      },
    })

    return NextResponse.json(category)
  } catch (error: any) {
    console.error('[ROOM CATEGORY PATCH] Error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

/**
 * DELETE /api/admin/room-categories/[id]
 * Soft delete a room category (set active = false)
 * Only allows deletion if category has no active room types
 */
export const DELETE = withAdmin(async (
  request: NextRequest,
  _auth,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await context.params

    // Check if category exists
    const existing = await prisma.roomCategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            roomTypes: {
              where: { active: true }, // Only count active room types
            },
          },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Room category not found' }, { status: 404 })
    }

    // Prevent soft delete if category has active room types
    if (existing._count.roomTypes > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category: ${existing._count.roomTypes} active room type(s) are using this category`,
          activeRoomTypesCount: existing._count.roomTypes,
        },
        { status: 400 }
      )
    }

    // Soft delete - set active = false
    await prisma.roomCategory.update({
      where: { id: params.id },
      data: { active: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ROOM CATEGORY DELETE] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
