/**
 * Admin Colors API - Single Color
 * GET /api/admin/colors/[id] - Get color
 * PATCH /api/admin/colors/[id] - Update color
 * DELETE /api/admin/colors/[id] - Delete color
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdmin, handleError, validateRequest } from '@/lib/api/admin-middleware'
import { updateColorSchema } from '@/lib/validations/color'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


/**
 * Helper function to validate ObjectID format
 */
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * GET /api/admin/colors/[id] - Get color
 */
export const GET = withAdmin(async (req: NextRequest, auth) => {
  try {
    const url = new URL(req.url)
    const colorId = url.pathname.split('/').pop()

    if (!colorId) {
      return NextResponse.json({ error: 'Color ID is required' }, { status: 400 })
    }

    // Validate ObjectID format
    if (!isValidObjectId(colorId)) {
      return NextResponse.json(
        { error: 'Invalid color ID format' },
        { status: 400 }
      )
    }

    const color = await prisma.color.findUnique({
      where: { id: colorId },
    })

    if (!color) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 })
    }

    return NextResponse.json(color)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * PATCH /api/admin/colors/[id] - Update color
 */
export const PATCH = withAdmin(async (req: NextRequest, auth) => {
  try {
    const url = new URL(req.url)
    const colorId = url.pathname.split('/').pop()

    if (!colorId) {
      return NextResponse.json({ error: 'Color ID is required' }, { status: 400 })
    }

    // Validate ObjectID format
    if (!isValidObjectId(colorId)) {
      return NextResponse.json(
        { error: 'Invalid color ID format' },
        { status: 400 }
      )
    }

    // Validate request body
    const body = await validateRequest(req, updateColorSchema)

    // Check if color exists
    const existingColor = await prisma.color.findUnique({
      where: { id: colorId },
    })

    if (!existingColor) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 })
    }

    // Check if hex is being updated and if it conflicts
    if (body.hex && body.hex !== existingColor.hex) {
      const hexConflict = await prisma.color.findUnique({
        where: { hex: body.hex.toUpperCase() },
      })

      if (hexConflict) {
        return NextResponse.json(
          { error: 'Color with this hex code already exists' },
          { status: 409 }
        )
      }
    }

    // Update color
    const color = await prisma.color.update({
      where: { id: colorId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.hex && { hex: body.hex.toUpperCase() }),
        ...(body.pantone !== undefined && { pantone: body.pantone }),
        ...(body.category && { category: body.category }),
        ...(body.role !== undefined && { role: body.role }),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(color)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * DELETE /api/admin/colors/[id] - Delete color
 */
export const DELETE = withAdmin(async (req: NextRequest, auth) => {
  try {
    const url = new URL(req.url)
    const colorId = url.pathname.split('/').pop()

    if (!colorId) {
      return NextResponse.json({ error: 'Color ID is required' }, { status: 400 })
    }

    // Validate ObjectID format
    if (!isValidObjectId(colorId)) {
      return NextResponse.json(
        { error: 'Invalid color ID format' },
        { status: 400 }
      )
    }

    // Check if color exists
    const existingColor = await prisma.color.findUnique({
      where: { id: colorId },
    })

    if (!existingColor) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 })
    }

    // Check if color is used in any styles
    if (existingColor.usage > 0) {
      return NextResponse.json(
        { error: 'Cannot delete color that is used in styles' },
        { status: 409 }
      )
    }

    // Delete color
    await prisma.color.delete({
      where: { id: colorId },
    })

    return NextResponse.json({ message: 'Color deleted successfully' })
  } catch (error) {
    return handleError(error)
  }
})

