/**
 * Admin Styles API
 * GET /api/admin/styles - List all global styles
 * POST /api/admin/styles - Create global style (admin only)
 */

import { handleError, withAdmin } from '@/lib/api/admin-middleware'
import { prisma } from '@/lib/db'
import { ValidationError } from '@/lib/errors'
import { createStyleSchema, styleFiltersSchema } from '@/lib/validations/style'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


/**
 * GET /api/admin/styles - List all global styles (organizationId = null)
 */
export const GET = withAdmin(async (req: NextRequest, auth) => {
  try {
    console.log('[GET /api/admin/styles] Request received from:', auth.userId)

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const filters = styleFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      subCategoryId: searchParams.get('subCategoryId') || undefined,
      approachId: searchParams.get('approachId') || undefined,
      colorId: searchParams.get('colorId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    })

    console.log('[GET /api/admin/styles] Filters:', filters)

    // Build where clause - only global styles
    // Note: MongoDB stores null as BSON null which needs special handling
    // We'll fetch all styles and filter in JavaScript for now
    // TODO: Find a better Prisma+MongoDB solution for null queries
    const where: any = {}

    // Add filters
    if (filters.categoryId) {
      where.categoryId = filters.categoryId
    }
    if (filters.subCategoryId) {
      where.subCategoryId = filters.subCategoryId
    }
    if (filters.approachId) {
      where.approachId = filters.approachId
    }
    if (filters.colorId) {
      where.colorId = filters.colorId
    }

    console.log('[GET /api/admin/styles] Where clause:', where)

    // Get all styles first (we'll filter for global in JavaScript)
    const allStyles = await prisma.style.findMany({
      where,
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
        approach: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        color: {
          select: {
            id: true,
            name: true,
            hex: true,
            pantone: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter for global styles (organizationId is null/undefined)
    const globalStyles = allStyles.filter((style) => !style.organizationId)
    console.log('[GET /api/admin/styles] Filtered global styles:', globalStyles.length)

    // Apply pagination in JavaScript
    const total = globalStyles.length
    const startIndex = (filters.page - 1) * filters.limit
    const endIndex = startIndex + filters.limit
    const styles = globalStyles.slice(startIndex, endIndex)

    console.log('[GET /api/admin/styles] Total global styles:', total)
    console.log('[GET /api/admin/styles] Returning styles:', styles.length)

    return NextResponse.json({
      data: styles,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    })
  } catch (error) {
    return handleError(error)
  }
})

/**
 * POST /api/admin/styles - Create global style (admin only)
 */
export const POST = withAdmin(async (req: NextRequest, auth) => {
  try {
    const rawBody = await req.json()
    const parseResult = createStyleSchema.safeParse(rawBody)

    if (!parseResult.success) {
      throw new ValidationError('Invalid request data', parseResult.error.errors)
    }

    const body = parseResult.data

    // Verify category and sub-category exist and are related
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const subCategory = await prisma.subCategory.findUnique({
      where: { id: body.subCategoryId },
    })

    if (!subCategory) {
      return NextResponse.json({ error: 'Sub-category not found' }, { status: 404 })
    }

    // Verify sub-category belongs to category
    if (subCategory.categoryId !== body.categoryId) {
      return NextResponse.json(
        { error: 'Sub-category does not belong to the specified category' },
        { status: 400 }
      )
    }

    // Verify approach exists
    const approach = await prisma.approach.findUnique({
      where: { id: body.approachId },
    })

    if (!approach) {
      return NextResponse.json({ error: 'Approach not found' }, { status: 404 })
    }

    // Verify color exists
    const color = await prisma.color.findUnique({
      where: { id: body.colorId },
    })

    if (!color) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 })
    }

    // Verify room profiles if provided
    if (body.roomProfiles && body.roomProfiles.length > 0) {
      for (const [index, profile] of body.roomProfiles.entries()) {
        // Verify room type exists
        const roomType = await prisma.roomType.findUnique({
          where: { id: profile.roomTypeId },
        })
        if (!roomType) {
          return NextResponse.json(
            { error: `Room type not found for room profile ${index + 1}` },
            { status: 404 }
          )
        }

        // Verify all colors exist if provided
        if (profile.colors && profile.colors.length > 0) {
          for (const colorId of profile.colors) {
            const roomColor = await prisma.color.findUnique({
              where: { id: colorId },
            })
            if (!roomColor) {
              return NextResponse.json(
                { error: `Color not found in room profile ${index + 1}: ${colorId}` },
                { status: 404 }
              )
            }
          }
        }
      }
    }

    // Generate slug if not provided
    const slug =
      body.slug ||
      body.name.en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

    // Check if slug already exists
    const existingStyle = await prisma.style.findUnique({
      where: { slug },
    })

    if (existingStyle) {
      return NextResponse.json(
        { error: 'Style with this slug already exists' },
        { status: 409 }
      )
    }

    const styleData = {
      organizationId: null, // Global style
      slug,
      name: body.name,
      description: body.description,
      categoryId: body.categoryId,
      subCategoryId: body.subCategoryId,
      approachId: body.approachId,
      colorId: body.colorId,
      images: body.images || [],
      roomProfiles: body.roomProfiles || [],
      metadata: {
        version: body.metadata?.version || '1.0.0',
        isPublic: true, // Global styles are always public
        approvalStatus: null, // No approval needed for admin-created styles
        tags: body.metadata?.tags || [],
        usage: 0,
        rating: body.metadata?.rating,
      },
    }
    const style = await prisma.style.create({
      data: styleData,
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
        approach: {
          select: {
            id: true,
            slug: true,
            name: true,
            order: true,
            metadata: true,
          },
        },
        color: {
          select: {
            id: true,
            name: true,
            hex: true,
            pantone: true,
            category: true,
          },
        },
      },
    })

    return NextResponse.json(style, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
})

