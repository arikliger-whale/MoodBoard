/**
 * Project API Routes
 * POST /api/projects - Create new project
 * GET /api/projects - List projects with filters
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, handleError, requirePermission, validateRequest } from '@/lib/api/middleware'
import { createProjectSchema, projectFiltersSchema } from '@/lib/validations/project'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


/**
 * POST /api/projects - Create new project
 */
export const POST = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'project:create')

    // Validate request
    const data = await validateRequest(req, createProjectSchema)

    // Verify client exists and belongs to organization
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    if (client.organizationId !== auth.organizationId) {
      return NextResponse.json(
        { error: 'Client does not belong to your organization' },
        { status: 403 }
      )
    }

    // Generate slug if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-')

    // Create project
    const project = await prisma.project.create({
      data: {
        organizationId: auth.organizationId,
        clientId: data.clientId,
        name: data.name,
        slug,
        status: data.status || 'draft',
        rooms: data.rooms || [],
        budget: data.budget,
        timeline: data.timeline,
        metadata: {
          createdBy: auth.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastModifiedBy: auth.userId,
        },
        createdBy: auth.userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            contact: true,
          },
        },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
})

/**
 * GET /api/projects - List projects with filters
 */
export const GET = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'project:read')

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const filters = projectFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      clientId: searchParams.get('clientId') || undefined,
      status: searchParams.get('status')?.split(',') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    })

    // Build where clause
    const where: any = {
      organizationId: auth.organizationId,
    }

    // Add search filter (by name)
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' }
    }

    // Add client filter
    if (filters.clientId) {
      where.clientId = filters.clientId
    }

    // Add status filter
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status }
    }

    // Get total count
    const total = await prisma.project.count({ where })

    // Get projects
    const projects = await prisma.project.findMany({
      where,
      orderBy: { metadata: { createdAt: 'desc' } },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            contact: true,
          },
        },
        // rooms: true, // Embedded type - automatically included
        // team: true,  // TeamMember model not yet implemented
        _count: {
          select: {
            comments: true,   // These are models, can be counted
            approvals: true,  // These are models, can be counted
          },
        },
      },
    })

    return NextResponse.json({
      data: projects,
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

