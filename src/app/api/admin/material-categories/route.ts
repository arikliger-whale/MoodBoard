/**
 * Admin Material Categories API
 * CRUD operations for material categories (admin only)
 */

import { withAdmin } from '@/lib/api/admin-middleware'
import { handleError, validateRequest } from '@/lib/api/middleware'
import { prisma } from '@/lib/db'
import { createMaterialCategorySchema } from '@/lib/validations/material-category'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/admin/material-categories - List all material categories
 */
export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { 'name.he': { contains: search } },
        { 'name.en': { contains: search } },
        { 'description.he': { contains: search } },
        { 'description.en': { contains: search } },
        { slug: { contains: search } },
      ]
    }

    const categories = await prisma.materialCategory.findMany({
      where: Object.keys(where).length > 0 ? where : {},
      include: {
        types: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    // Add counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const materialsCount = await prisma.material.count({
          where: {
            categoryId: category.id,
          },
        })
        return {
          ...category,
          _count: {
            materials: materialsCount,
            types: category.types.length,
          },
        }
      })
    )

    return NextResponse.json({
      data: categoriesWithCounts,
      count: categoriesWithCounts.length,
    })
  } catch (error: any) {
    console.error('Material Categories API Error:', error)
    return handleError(error)
  }
})

/**
 * POST /api/admin/material-categories - Create a new material category
 */
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const data = await validateRequest(req, createMaterialCategorySchema)

    // Check if slug already exists
    const existing = await prisma.materialCategory.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Material category with this slug already exists' },
        { status: 409 }
      )
    }

    const category = await prisma.materialCategory.create({
      data: {
        name: data.name,
        description: data.description || undefined,
        slug: data.slug,
        order: data.order,
        icon: data.icon || undefined,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
})

