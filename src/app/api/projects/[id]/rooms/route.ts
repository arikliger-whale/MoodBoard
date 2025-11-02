/**
 * Room API Routes - Add Room to Project
 * POST /api/projects/[id]/rooms - Add a new room to project
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, handleError, requirePermission, validateRequest, verifyOrganizationAccess } from '@/lib/api/middleware'
import { createRoomSchema } from '@/lib/validations/room'
import { v4 as uuidv4 } from 'uuid'

/**
 * POST /api/projects/[id]/rooms - Add a new room to project
 */
export const POST = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'project:write')

    // Get project ID from URL
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const projectId = pathParts[pathParts.length - 2] // Second to last part is the project ID

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Validate request
    const data = await validateRequest(req, createRoomSchema)

    // Get existing project
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

    // Create new room with UUID
    const newRoom = {
      id: uuidv4(),
      name: data.name,
      type: data.type,
      dimensions: data.dimensions || null,
      notes: data.notes || null,
      images: data.images || [],
    }

    // Add room to existing rooms array
    const updatedRooms = [...(existingProject.rooms || []), newRoom]

    // Update project with new room
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        rooms: updatedRooms as any,
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

    return NextResponse.json(newRoom, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
})
