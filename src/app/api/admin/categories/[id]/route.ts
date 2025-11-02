/**
 * Admin Category API - Single Category
 * GET, PATCH, DELETE operations for a single category
 */

// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api/admin-middleware'
import { prisma } from '@/lib/db'
import { updateCategorySchema } from '@/lib/validations/category'
import { handleError, validateRequest } from '@/lib/api/middleware'

/**
 * GET /api/admin/categories/[id] - Get single category
 */
// @ts-expect-error - Next.js route handler type checking
export const GET = withAdmin(async (
  req: NextRequest,
  _auth,
  { params }: { params: { id: string } }
) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        subCategories: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            styles: true,
            subCategories: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * PATCH /api/admin/categories/[id] - Update category
 */
// @ts-expect-error - Next.js route handler type checking
export const PATCH = withAdmin(async (
  req: NextRequest,
  _auth,
  { params }: { params: { id: string } }
) => {
  try {
    const data = await validateRequest(req, updateCategorySchema)

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if slug already exists (if updating slug)
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: data.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 409 }
        )
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.order !== undefined && { order: data.order }),
        updatedAt: new Date(),
      },
      include: {
        subCategories: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            styles: true,
            subCategories: true,
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
 * DELETE /api/admin/categories/[id] - Delete category
 */
// @ts-expect-error - Next.js route handler type checking
export const DELETE = withAdmin(async (
  req: NextRequest,
  _auth,
  { params }: { params: { id: string } }
) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            styles: true,
            subCategories: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Prevent deletion if category has styles or sub-categories
    if (category._count.styles > 0 || category._count.subCategories > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete category with styles or sub-categories',
          details: {
            stylesCount: category._count.styles,
            subCategoriesCount: category._count.subCategories,
          },
        },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
})

