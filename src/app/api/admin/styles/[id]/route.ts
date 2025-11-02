/**
 * Admin Styles API - Single Style
 * GET /api/admin/styles/[id] - Get global style
 * PATCH /api/admin/styles/[id] - Update global style
 * DELETE /api/admin/styles/[id] - Delete global style
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdmin, handleError, validateRequest } from '@/lib/api/admin-middleware'
import { updateStyleSchema } from '@/lib/validations/style'

/**
 * Helper function to validate ObjectID format
 */
function isValidObjectId(id: string): boolean {
  // MongoDB ObjectID is 24 hex characters
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * GET /api/admin/styles/[id] - Get global style
 */
export const GET = withAdmin(async (req: NextRequest, auth) => {
  try {
    const url = new URL(req.url)
    const styleId = url.pathname.split('/').pop()

    if (!styleId) {
      return NextResponse.json({ error: 'Style ID is required' }, { status: 400 })
    }

    // Validate ObjectID format (prevents errors like "new" being treated as ID)
    if (!isValidObjectId(styleId)) {
      return NextResponse.json(
        { error: 'Invalid style ID format' },
        { status: 400 }
      )
    }

    const style = await prisma.style.findUnique({
      where: { id: styleId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!style) {
      return NextResponse.json({ error: 'Style not found' }, { status: 404 })
    }

    // Verify it's a global style
    if (style.organizationId !== null) {
      return NextResponse.json(
        { error: 'This is not a global style' },
        { status: 403 }
      )
    }

    return NextResponse.json(style)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * PATCH /api/admin/styles/[id] - Update global style
 */
export const PATCH = withAdmin(async (req: NextRequest, auth) => {
  try {
    const url = new URL(req.url)
    const styleId = url.pathname.split('/').pop()

    if (!styleId) {
      return NextResponse.json({ error: 'Style ID is required' }, { status: 400 })
    }

    // Validate ObjectID format
    if (!isValidObjectId(styleId)) {
      return NextResponse.json(
        { error: 'Invalid style ID format' },
        { status: 400 }
      )
    }

    // Validate request body
    const body = await validateRequest(req, updateStyleSchema)

    // Check if style exists and is global
    const existingStyle = await prisma.style.findUnique({
      where: { id: styleId },
    })

    if (!existingStyle) {
      return NextResponse.json({ error: 'Style not found' }, { status: 404 })
    }

    if (existingStyle.organizationId !== null) {
      return NextResponse.json(
        { error: 'This is not a global style' },
        { status: 403 }
      )
    }

    // Verify category and sub-category if updating
    if (body.categoryId || body.subCategoryId) {
      const categoryId = body.categoryId || existingStyle.categoryId
      const subCategoryId = body.subCategoryId || existingStyle.subCategoryId

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      })

      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }

      const subCategory = await prisma.subCategory.findUnique({
        where: { id: subCategoryId },
      })

      if (!subCategory) {
        return NextResponse.json({ error: 'Sub-category not found' }, { status: 404 })
      }

      // Verify sub-category belongs to category
      if (subCategory.categoryId !== categoryId) {
        return NextResponse.json(
          { error: 'Sub-category does not belong to the specified category' },
          { status: 400 }
        )
      }
    }

    // Update style
    const style = await prisma.style.update({
      where: { id: styleId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.subCategoryId && { subCategoryId: body.subCategoryId }),
        ...(body.slug && { slug: body.slug }),
        ...(body.palette && { palette: body.palette as any }),
        ...(body.materialSet && { materialSet: body.materialSet as any }),
        ...(body.roomProfiles && { roomProfiles: body.roomProfiles as any }),
        ...(body.metadata && {
          metadata: {
            ...existingStyle.metadata,
            ...body.metadata,
          } as any,
        }),
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
        subCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(style)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * DELETE /api/admin/styles/[id] - Delete global style
 */
export const DELETE = withAdmin(async (req: NextRequest, auth) => {
  try {
    const url = new URL(req.url)
    const styleId = url.pathname.split('/').pop()

    if (!styleId) {
      return NextResponse.json({ error: 'Style ID is required' }, { status: 400 })
    }

    // Validate ObjectID format
    if (!isValidObjectId(styleId)) {
      return NextResponse.json(
        { error: 'Invalid style ID format' },
        { status: 400 }
      )
    }

    // Check if style exists and is global
    const existingStyle = await prisma.style.findUnique({
      where: { id: styleId },
    })

    if (!existingStyle) {
      return NextResponse.json({ error: 'Style not found' }, { status: 404 })
    }

    if (existingStyle.organizationId !== null) {
      return NextResponse.json(
        { error: 'This is not a global style' },
        { status: 403 }
      )
    }

    // Delete style
    await prisma.style.delete({
      where: { id: styleId },
    })

    return NextResponse.json({ message: 'Style deleted successfully' })
  } catch (error) {
    return handleError(error)
  }
})

