/**
 * Admin Material Category API - Single Category
 * GET, PATCH, DELETE operations for a single material category
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api/admin-middleware'
import { prisma } from '@/lib/db'
import { updateMaterialCategorySchema } from '@/lib/validations/material-category'
import { handleError, validateRequest } from '@/lib/api/middleware'

/**
 * Helper function to validate ObjectID format
 */
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * GET /api/admin/material-categories/[id] - Get single material category
 */
export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const url = new URL(req.url)
    const categoryId = url.pathname.split('/').pop()

    if (!categoryId || !isValidObjectId(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      )
    }

    const category = await prisma.materialCategory.findUnique({
      where: { id: categoryId },
      include: {
        types: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            materials: true,
            types: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Material category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * PATCH /api/admin/material-categories/[id] - Update material category
 */
export const PATCH = withAdmin(async (req: NextRequest) => {
  try {
    const url = new URL(req.url)
    const categoryId = url.pathname.split('/').pop()

    if (!categoryId || !isValidObjectId(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      )
    }

    const data = await validateRequest(req, updateMaterialCategorySchema)

    // Check if category exists
    const existing = await prisma.materialCategory.findUnique({
      where: { id: categoryId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Material category not found' },
        { status: 404 }
      )
    }

    // Check if slug is being updated and conflicts
    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.materialCategory.findUnique({
        where: { slug: data.slug },
      })

      if (slugConflict) {
        return NextResponse.json(
          { error: 'Material category with this slug already exists' },
          { status: 409 }
        )
      }
    }

    const category = await prisma.materialCategory.update({
      where: { id: categoryId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description || undefined }),
        ...(data.slug && { slug: data.slug }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.icon !== undefined && { icon: data.icon || undefined }),
        updatedAt: new Date(),
      },
      include: {
        types: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            materials: true,
            types: true,
          },
        },
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * DELETE /api/admin/material-categories/[id] - Delete material category
 */
export const DELETE = withAdmin(async (req: NextRequest) => {
  try {
    const url = new URL(req.url)
    const categoryId = url.pathname.split('/').pop()

    if (!categoryId || !isValidObjectId(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      )
    }

    // Check if category exists
    const existing = await prisma.materialCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            materials: true,
            types: true,
          },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Material category not found' },
        { status: 404 }
      )
    }

    // Prevent deletion if category has materials or types
    if (existing._count.materials > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing materials' },
        { status: 409 }
      )
    }

    if (existing._count.types > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing types' },
        { status: 409 }
      )
    }

    await prisma.materialCategory.delete({
      where: { id: categoryId },
    })

    return NextResponse.json({ message: 'Material category deleted successfully' })
  } catch (error) {
    return handleError(error)
  }
})

