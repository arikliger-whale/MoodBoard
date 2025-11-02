/**
 * Admin Users API
 * GET /api/admin/users - List all users (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdmin, handleError } from '@/lib/api/admin-middleware'
import { z } from 'zod'

const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  organizationId: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

/**
 * GET /api/admin/users - List all users with filters
 */
export const GET = withAdmin(async (req: NextRequest, auth) => {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const filters = userFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
      organizationId: searchParams.get('organizationId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    })

    // Build where clause
    const where: any = {}

    // Add search filter (by name or email)
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    // Add role filter
    if (filters.role) {
      where.role = filters.role
    }

    // Add organization filter
    if (filters.organizationId) {
      where.organizationId = filters.organizationId
    }

    // Get total count
    const total = await prisma.user.count({ where })

    // Get users
    const users = await prisma.user.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            createdProjects: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    })

    return NextResponse.json({
      data: users,
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

