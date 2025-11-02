/**
 * Admin Material Types API
 * CRUD operations for material types (admin only)
 */

import { withAdmin } from '@/lib/api/admin-middleware'
import { handleError, validateRequest } from '@/lib/api/middleware'
import { prisma } from '@/lib/db'
import { createMaterialTypeSchema } from '@/lib/validations/material-category'
import { NextRequest, NextResponse } from 'next/server'

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

    // Count materials for each type (Material has properties.typeId as string reference)
    // Note: This is a workaround since Material doesn't have a direct relation to MaterialType
    // Prisma doesn't support querying nested fields in embedded documents, so we use raw MongoDB query
    const typesWithCounts = await Promise.all(
      types.map(async (type) => {
        try {
          // Use raw MongoDB query to count materials with matching properties.typeId
          const result = await prisma.$runCommandRaw({
            count: 'materials',
            query: {
              'properties.typeId': type.id,
            },
          })
          const materialCount = (result as any).n || 0
          return {
            ...type,
            _count: {
              materials: materialCount,
            },
          }
        } catch (error) {
          // If raw query fails, return 0
          console.error(`Error counting materials for type ${type.id}:`, error)
          return {
            ...type,
            _count: {
              materials: 0,
            },
          }
        }
      })
    )

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

