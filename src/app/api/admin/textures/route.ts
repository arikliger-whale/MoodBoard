/**
 * Textures API Route
 * GET /api/admin/textures - List textures with filters and pagination
 * POST /api/admin/textures - Create new texture
 */

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Query schema
const textureQuerySchema = z.object({
  search: z.string().optional(),
  materialCategoryId: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// Create texture schema
const createTextureSchema = z.object({
  name: z.object({
    he: z.string().min(1),
    en: z.string().min(1),
  }),
  description: z.object({
    he: z.string().optional(),
    en: z.string().optional(),
  }).optional(),
  materialCategoryIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional(),
})

/**
 * GET /api/admin/textures
 * List textures with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = textureQuerySchema.parse({
      search: searchParams.get('search') || undefined,
      materialCategoryId: searchParams.get('materialCategoryId') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    })

    // Build where clause
    const where: any = {}

    if (query.search) {
      where.OR = [
        { name: { he: { contains: query.search } } },
        { name: { en: { contains: query.search } } },
      ]
    }

    if (query.materialCategoryId) {
      where.materialCategories = {
        some: {
          materialCategoryId: query.materialCategoryId,
        },
      }
    }

    // Count total
    const total = await prisma.texture.count({ where })

    // Fetch textures
    const textures = await prisma.texture.findMany({
      where,
      include: {
        materialCategories: {
          include: {
            materialCategory: true,
          },
        },
        _count: {
          select: { styleLinks: true },
        },
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      data: textures,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    })
  } catch (error) {
    console.error('GET /api/admin/textures error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch textures' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/textures
 * Create new texture
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createTextureSchema.parse(body)

    const texture = await prisma.texture.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        tags: data.tags,
        metadata: data.metadata,
        materialCategories: {
          create: data.materialCategoryIds.map((categoryId) => ({
            materialCategoryId: categoryId,
          })),
        },
      },
      include: {
        materialCategories: {
          include: {
            materialCategory: true,
          },
        },
      },
    })

    return NextResponse.json(texture, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/textures error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create texture' },
      { status: 500 }
    )
  }
}
