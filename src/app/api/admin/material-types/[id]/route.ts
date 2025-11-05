/**
 * Admin Material Type API - Single Type
 * GET, PATCH, DELETE operations for a single material type
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api/admin-middleware'
import { prisma } from '@/lib/db'
import { updateMaterialTypeSchema } from '@/lib/validations/material-category'
import { handleError, validateRequest } from '@/lib/api/middleware'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


/**
 * Helper function to validate ObjectID format
 */
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * GET /api/admin/material-types/[id] - Get single material type
 */
export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const url = new URL(req.url)
    const typeId = url.pathname.split('/').pop()

    if (!typeId || !isValidObjectId(typeId)) {
      return NextResponse.json(
        { error: 'Invalid type ID format' },
        { status: 400 }
      )
    }

    const type = await prisma.materialType.findUnique({
      where: { id: typeId },
      include: {
        category: true,
      },
    })

    if (!type) {
      return NextResponse.json(
        { error: 'Material type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(type)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * PATCH /api/admin/material-types/[id] - Update material type
 */
export const PATCH = withAdmin(async (req: NextRequest) => {
  try {
    const url = new URL(req.url)
    const typeId = url.pathname.split('/').pop()

    if (!typeId || !isValidObjectId(typeId)) {
      return NextResponse.json(
        { error: 'Invalid type ID format' },
        { status: 400 }
      )
    }

    const data = await validateRequest(req, updateMaterialTypeSchema)

    // Check if type exists
    const existing = await prisma.materialType.findUnique({
      where: { id: typeId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Material type not found' },
        { status: 404 }
      )
    }

    // Check if slug is being updated and conflicts
    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.materialType.findUnique({
        where: {
          categoryId_slug: {
            categoryId: existing.categoryId,
            slug: data.slug,
          },
        },
      })

      if (slugConflict) {
        return NextResponse.json(
          { error: 'Material type with this slug already exists in this category' },
          { status: 409 }
        )
      }
    }

    const type = await prisma.materialType.update({
      where: { id: typeId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description || undefined }),
        ...(data.slug && { slug: data.slug }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.icon !== undefined && { icon: data.icon || undefined }),
        updatedAt: new Date(),
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(type)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * DELETE /api/admin/material-types/[id] - Delete material type
 */
export const DELETE = withAdmin(async (req: NextRequest) => {
  try {
    const url = new URL(req.url)
    const typeId = url.pathname.split('/').pop()

    if (!typeId || !isValidObjectId(typeId)) {
      return NextResponse.json(
        { error: 'Invalid type ID format' },
        { status: 400 }
      )
    }

    // Check if type exists
    const existing = await prisma.materialType.findUnique({
      where: { id: typeId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Material type not found' },
        { status: 404 }
      )
    }

    // Check if type has materials (using raw MongoDB query since materials reference typeId in embedded field)
    // Prisma doesn't support querying nested fields in embedded documents directly
    try {
      const result = await prisma.$runCommandRaw({
        count: 'materials',
        query: {
          'properties.typeId': typeId,
        },
      })
      const materialsCount = (result as any).n || 0

      if (materialsCount > 0) {
        return NextResponse.json(
          { error: 'Cannot delete type with existing materials' },
          { status: 409 }
        )
      }
    } catch (error) {
      // If query fails, log but allow deletion (fail-safe)
      console.error(`Error checking materials for type ${typeId}:`, error)
    }

    await prisma.materialType.delete({
      where: { id: typeId },
    })

    return NextResponse.json({ message: 'Material type deleted successfully' })
  } catch (error) {
    return handleError(error)
  }
})

