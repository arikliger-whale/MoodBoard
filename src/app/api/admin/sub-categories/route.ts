/**
 * Admin SubCategories API
 * CRUD operations for style sub-categories (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api/admin-middleware'
import { prisma } from '@/lib/db'
import { createSubCategorySchema, updateSubCategorySchema } from '@/lib/validations/category'
import { handleError, validateRequest } from '@/lib/api/middleware'

/**
 * GET /api/admin/sub-categories - List all sub-categories
 */
export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')

    const subCategories = await prisma.subCategory.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { 'name.he': { contains: search, mode: 'insensitive' } },
                { 'name.en': { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
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
      orderBy: [
        { categoryId: 'asc' },
        { order: 'asc' },
      ],
    })

    return NextResponse.json({
      data: subCategories,
      count: subCategories.length,
    })
  } catch (error) {
    return handleError(error)
  }
})

/**
 * POST /api/admin/sub-categories - Create a new sub-category
 */
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const data = await validateRequest(req, createSubCategorySchema)

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if slug already exists within this category
    const existing = await prisma.subCategory.findUnique({
      where: {
        categoryId_slug: {
          categoryId: data.categoryId,
          slug: data.slug,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Sub-category with this slug already exists in this category' },
        { status: 409 }
      )
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        order: data.order,
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

    return NextResponse.json(subCategory, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
})

