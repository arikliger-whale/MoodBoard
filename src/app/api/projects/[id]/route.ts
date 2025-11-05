/**
 * Project API Routes - Single Project
 * GET /api/projects/[id] - Get single project
 * PATCH /api/projects/[id] - Update project
 * DELETE /api/projects/[id] - Delete project
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, handleError, requirePermission, validateRequest, verifyOrganizationAccess } from '@/lib/api/middleware'
import { updateProjectSchema } from '@/lib/validations/project'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


/**
 * GET /api/projects/[id] - Get single project
 */
export const GET = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'project:read')

    // Get project ID from URL
    const url = new URL(req.url)
    const projectId = url.pathname.split('/').pop()

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Get project with all related data
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            contact: true,
          },
        },
        _count: {
          select: {
            // team: true, // TeamMember model not yet implemented
            comments: true,
            approvals: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Verify organization access
    await verifyOrganizationAccess(project.organizationId, auth.organizationId)

    return NextResponse.json(project)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * PATCH /api/projects/[id] - Update project
 */
export const PATCH = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'project:write')

    // Get project ID from URL
    const url = new URL(req.url)
    const projectId = url.pathname.split('/').pop()

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Check if project exists and belongs to organization
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Verify organization access
    await verifyOrganizationAccess(existingProject.organizationId, auth.organizationId)

    // Validate request
    const data = await validateRequest(req, updateProjectSchema)

    // Update project
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        slug: data.slug,
        status: data.status,
        rooms: data.rooms,
        budget: data.budget,
        timeline: data.timeline,
        metadata: {
          ...existingProject.metadata,
          updatedAt: new Date(),
          lastModifiedBy: auth.userId,
        },
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

    return NextResponse.json(project)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * DELETE /api/projects/[id] - Delete project
 */
export const DELETE = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'project:delete')

    // Get project ID from URL
    const url = new URL(req.url)
    const projectId = url.pathname.split('/').pop()

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Check if project exists and belongs to organization
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Verify organization access
    await verifyOrganizationAccess(existingProject.organizationId, auth.organizationId)

    // Delete project
    await prisma.project.delete({
      where: { id: projectId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
})
