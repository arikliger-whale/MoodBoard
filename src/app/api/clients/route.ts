/**
 * Client API Routes
 * POST /api/clients - Create new client
 * GET /api/clients - List clients with filters
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, handleError, requirePermission, validateRequest } from '@/lib/api/middleware'
import { createClientSchema, clientFiltersSchema } from '@/lib/validations/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


/**
 * POST /api/clients - Create new client
 */
export const POST = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'client:create')

    // Validate request
    const data = await validateRequest(req, createClientSchema)

    // Create client
    const client = await prisma.client.create({
      data: {
        organizationId: auth.organizationId,
        name: data.name,
        contact: data.contact,
        tags: data.tags || [],
        preferences: data.preferences,
        notes: data.notes?.map(note => ({
          ...note,
          createdAt: new Date(),
        })) || [],
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
})

/**
 * GET /api/clients - List clients with filters
 */
export const GET = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'client:read')

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const filters = clientFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    })

    // Build where clause
    const where: any = {
      organizationId: auth.organizationId,
    }

    // Add search filter
    // For MongoDB with Prisma, embedded document searches are limited
    // We'll search by name only for now
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' }
    }

    // Add tags filter
    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags }
    }

    // Get total count
    const total = await prisma.client.count({ where })

    // Get clients
    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        _count: {
          select: { projects: true },
        },
      },
    })

    return NextResponse.json({
      data: clients,
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
