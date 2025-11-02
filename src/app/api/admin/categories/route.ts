/**
 * Admin Categories API
 * CRUD operations for style categories (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api/admin-middleware'
import { prisma } from '@/lib/db'
import { createCategorySchema, updateCategorySchema } from '@/lib/validations/category'
import { handleError, validateRequest } from '@/lib/api/middleware'

/**
 * GET /api/admin/categories - List all categories
 */
export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { 'name.he': { contains: search, mode: 'insensitive' } },
        { 'name.en': { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const categories = await prisma.category.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
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
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      data: categories,
      count: categories.length,
    })
  } catch (error: any) {
    console.error('Categories API Error:', error)
    
    // Check if it's a Prisma model not found error
    if (error.message?.includes('Unknown model') || error.message?.includes('model `Category`')) {
      return NextResponse.json(
        { 
          error: 'Category model not found in database',
          message: 'Please run: pnpm prisma db push',
          details: error.message
        },
        { status: 500 }
      )
    }
    
    return handleError(error)
  }
})

/**
 * POST /api/admin/categories - Create a new category
 */
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const data = await validateRequest(req, createCategorySchema)

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        order: data.order,
      },
      include: {
        _count: {
          select: {
            styles: true,
            subCategories: true,
          },
        },
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
})

