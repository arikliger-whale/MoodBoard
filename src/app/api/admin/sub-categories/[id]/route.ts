/**
 * Admin SubCategory API - Single SubCategory
 * GET, PATCH, DELETE operations for a single sub-category
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api/admin-middleware'
import { prisma } from '@/lib/db'
import { updateSubCategorySchema } from '@/lib/validations/category'
import { handleError, validateRequest } from '@/lib/api/middleware'

/**
 * GET /api/admin/sub-categories/[id] - Get single sub-category
 */
export const GET = withAdmin(async (
  req: NextRequest,
  _auth,
  { params }: { params: { id: string } }
) => {
  try {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            styles: true,
          },
        },
      },
    })

    if (!subCategory) {
      return NextResponse.json({ error: 'Sub-category not found' }, { status: 404 })
    }

    return NextResponse.json(subCategory)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * PATCH /api/admin/sub-categories/[id] - Update sub-category
 */
export const PATCH = withAdmin(async (
  req: NextRequest,
  _auth,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await req.json()
    const data = validateRequest(updateSubCategorySchema, body)

    // Check if sub-category exists
    const existing = await prisma.subCategory.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Sub-category not found' }, { status: 404 })
    }

    // Check if slug already exists within this category (if updating slug)
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.subCategory.findUnique({
        where: {
          categoryId_slug: {
            categoryId: existing.categoryId,
            slug: data.slug,
          },
        },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Sub-category with this slug already exists in this category' },
          { status: 409 }
        )
      }
    }

    const subCategory = await prisma.subCategory.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.order !== undefined && { order: data.order }),
        updatedAt: new Date(),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            styles: true,
          },
        },
      },
    })

    return NextResponse.json(subCategory)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * DELETE /api/admin/sub-categories/[id] - Delete sub-category
 */
export const DELETE = withAdmin(async (
  req: NextRequest,
  _auth,
  { params }: { params: { id: string } }
) => {
  try {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            styles: true,
          },
        },
      },
    })

    if (!subCategory) {
      return NextResponse.json({ error: 'Sub-category not found' }, { status: 404 })
    }

    // Prevent deletion if sub-category has styles
    if (subCategory._count.styles > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete sub-category with styles',
          details: {
            stylesCount: subCategory._count.styles,
          },
        },
        { status: 400 }
      )
    }

    await prisma.subCategory.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
})

