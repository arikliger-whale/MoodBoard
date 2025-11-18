/**
 * Admin Material Types API
 * CRUD operations for material types (admin only)
 */

import { withAdmin } from '@/lib/api/admin-middleware'
import { handleError, validateRequest } from '@/lib/api/middleware'
import { prisma } from '@/lib/db'
import { createMaterialTypeSchema } from '@/lib/validations/material-category'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


/**
 * GET /api/admin/material-types - List all material types
 */
export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')

    // Build where clause
    const where: any = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (search) {
      where.OR = [
        { 'name.he': { contains: search } },
        { 'name.en': { contains: search } },
        { 'description.he': { contains: search } },
        { 'description.en': { contains: search } },
        { slug: { contains: search } },
      ]
    }

    const types = await prisma.materialType.findMany({
      where: Object.keys(where).length > 0 ? where : {},
      include: {
        category: true,
      },
      orderBy: [
        { categoryId: 'asc' },
        { order: 'asc' },
      ],
    })

    // Optimize: Get all material counts in a single aggregation query
    let materialCountsByTypeId: Record<string, number> = {}

    if (types.length > 0) {
      try {
        // Use MongoDB aggregation to count materials grouped by typeId
        const typeIds = types.map(t => t.id)
        const aggregationResult = await prisma.$runCommandRaw({
          aggregate: 'materials',
          pipeline: [
            {
              $match: {
                'properties.typeId': { $in: typeIds },
              },
            },
            {
              $group: {
                _id: '$properties.typeId',
                count: { $sum: 1 },
              },
            },
          ],
          cursor: {},
        })

        // Convert aggregation result to a map
        const cursor = (aggregationResult as any).cursor
        if (cursor && cursor.firstBatch) {
          for (const item of cursor.firstBatch) {
            materialCountsByTypeId[item._id] = item.count
          }
        }
      } catch (error) {
        console.error('Error aggregating material counts:', error)
        // Continue with empty counts if aggregation fails
      }
    }

    // Map counts to types
    const typesWithCounts = types.map(type => ({
      ...type,
      _count: {
        materials: materialCountsByTypeId[type.id] || 0,
      },
    }))

    return NextResponse.json({
      data: typesWithCounts,
      count: typesWithCounts.length,
    })
  } catch (error: any) {
    console.error('Material Types API Error:', error)
    return handleError(error)
  }
})

/**
 * POST /api/admin/material-types - Create a new material type
 */
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const data = await validateRequest(req, createMaterialTypeSchema)

    // Check if category exists
    const category = await prisma.materialCategory.findUnique({
      where: { id: data.categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Material category not found' },
        { status: 404 }
      )
    }

    // Check if slug already exists for this category
    const existing = await prisma.materialType.findUnique({
      where: {
        categoryId_slug: {
          categoryId: data.categoryId,
          slug: data.slug,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Material type with this slug already exists in this category' },
        { status: 409 }
      )
    }

    const type = await prisma.materialType.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description || undefined,
        slug: data.slug,
        order: data.order,
        icon: data.icon || undefined,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(type, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
})

