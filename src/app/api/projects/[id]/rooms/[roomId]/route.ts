/**
 * Room API Routes - Single Room Operations
 * PATCH /api/projects/[id]/rooms/[roomId] - Update a room
 * DELETE /api/projects/[id]/rooms/[roomId] - Delete a room
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, handleError, requirePermission, validateRequest, verifyOrganizationAccess } from '@/lib/api/middleware'
import { updateRoomSchema } from '@/lib/validations/room'

/**
 * PATCH /api/projects/[id]/rooms/[roomId] - Update a room
 */
export const PATCH = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'project:write')

    // Get IDs from URL
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const roomId = pathParts[pathParts.length - 1]
    const projectId = pathParts[pathParts.length - 3]

    if (!projectId || !roomId) {
      return NextResponse.json(
        { error: 'Project ID and Room ID are required' },
        { status: 400 }
      )
    }

    // Validate request
    const data = await validateRequest(req, updateRoomSchema.omit({ id: true }))

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

    // Find and update the room
    const rooms = existingProject.rooms || []
    const roomIndex = rooms.findIndex((r: any) => r.id === roomId)

    if (roomIndex === -1) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Update room with new data
    const updatedRoom = {
      ...rooms[roomIndex],
      ...(data.name && { name: data.name }),
      ...(data.type && { type: data.type }),
      ...(data.dimensions !== undefined && { dimensions: data.dimensions }),
      ...(data.notes !== undefined && { notes: data.notes }),
    }

    // Replace room in array
    const updatedRooms = [...rooms]
    updatedRooms[roomIndex] = updatedRoom

    // Update project
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

    return NextResponse.json(updatedRoom)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * DELETE /api/projects/[id]/rooms/[roomId] - Delete a room
 */
export const DELETE = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'project:write')

    // Get IDs from URL
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const roomId = pathParts[pathParts.length - 1]
    const projectId = pathParts[pathParts.length - 3]

    if (!projectId || !roomId) {
      return NextResponse.json(
        { error: 'Project ID and Room ID are required' },
        { status: 400 }
      )
    }

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

    // Find and remove the room
    const rooms = existingProject.rooms || []
    const roomIndex = rooms.findIndex((r: any) => r.id === roomId)

    if (roomIndex === -1) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Remove room from array
    const updatedRooms = rooms.filter((r: any) => r.id !== roomId)

    // Update project
    await prisma.project.update({
      where: { id: projectId },
      data: {
        rooms: updatedRooms as any,
        metadata: {
          ...existingProject.metadata,
          updatedAt: new Date(),
          lastModifiedBy: auth.userId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
})
