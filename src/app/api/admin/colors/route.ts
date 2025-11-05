/**
 * Admin Colors API
 * GET /api/admin/colors - List all colors (global + organization-specific)
 * POST /api/admin/colors - Create color (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdmin, handleError, validateRequest } from '@/lib/api/admin-middleware'
import { createColorSchema, colorFiltersSchema } from '@/lib/validations/color'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


/**
 * GET /api/admin/colors - List all colors
 */
export const GET = withAdmin(async (req: NextRequest, auth) => {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const filters = colorFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      organizationId: searchParams.get('organizationId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    })

    // Build where clause
    const where: any = {}

    // Global colors (organizationId = null) by default for admin
    // Admin can see all global colors
    where.organizationId = null

    // Override if specific organizationId is requested
    if (filters.organizationId && filters.organizationId !== 'null') {
      where.organizationId = filters.organizationId
    }

    // Add search filter (by name)
    // MongoDB with Prisma doesn't support mode: 'insensitive' on embedded fields
    // We'll use contains (case-sensitive) or remove search if empty
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase()
      where.OR = [
        { 'name.he': { contains: filters.search } },
        { 'name.en': { contains: filters.search } },
        { hex: { contains: searchLower } }, // Hex codes are case-insensitive by nature
      ]
    }

    // Add category filter
    if (filters.category) {
      where.category = filters.category
    }

    // Get total count
    const total = await prisma.color.count({ where })

    // Get colors
    const colors = await prisma.color.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    })

    return NextResponse.json({
      data: colors || [],
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / filters.limit),
      },
    })
  } catch (error) {
    console.error('Error fetching colors:', error)
    return handleError(error)
  }
})

/**
 * POST /api/admin/colors - Create color (admin only)
 */
export const POST = withAdmin(async (req: NextRequest, auth) => {
  try {
    // Validate request body
    const body = await validateRequest(req, createColorSchema)

    // Check if hex already exists (global unique)
    const existingColor = await prisma.color.findUnique({
      where: { hex: body.hex },
    })

    if (existingColor) {
      return NextResponse.json(
        { error: 'Color with this hex code already exists' },
        { status: 409 }
      )
    }

    // Create color (can be global or organization-specific)
    const color = await prisma.color.create({
      data: {
        organizationId: null, // Global color by default (admin creates global colors)
        name: body.name,
        description: body.description || undefined,
        hex: body.hex.toUpperCase(), // Store in uppercase for consistency
        pantone: body.pantone,
        category: body.category,
        role: body.role,
        usage: 0,
      },
    })

    return NextResponse.json(color, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
})

