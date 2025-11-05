/**
 * Client API Routes - Single Client
 * GET /api/clients/[id] - Get single client
 * PATCH /api/clients/[id] - Update client
 * DELETE /api/clients/[id] - Delete client
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, handleError, requirePermission, validateRequest, verifyOrganizationAccess } from '@/lib/api/middleware'
import { updateClientSchema } from '@/lib/validations/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


/**
 * GET /api/clients/[id] - Get single client
 */
export const GET = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'client:read')

    // Get client ID from URL
    const url = new URL(req.url)
    const clientId = url.pathname.split('/').pop()

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Get client
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Verify organization access
    await verifyOrganizationAccess(client.organizationId, auth.organizationId)

    return NextResponse.json(client)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * PATCH /api/clients/[id] - Update client
 */
export const PATCH = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'client:write')

    // Get client ID from URL
    const url = new URL(req.url)
    const clientId = url.pathname.split('/').pop()

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Check if client exists and belongs to organization
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Verify organization access
    await verifyOrganizationAccess(existingClient.organizationId, auth.organizationId)

    // Validate request
    const data = await validateRequest(req, updateClientSchema)

    // Update client - build update data dynamically
    const updateData: any = {
      name: data.name,
    }
    
    if (data.contact) {
      updateData.contact = data.contact
    }
    if (data.tags) {
      updateData.tags = data.tags
    }
    if (data.preferences) {
      updateData.preferences = data.preferences
    }
    if (data.notes) {
      updateData.notes = data.notes.map((note: any) => ({
        ...note,
        createdAt: new Date(),
      }))
    }
    
    const client = await prisma.client.update({
      where: { id: clientId },
      data: updateData,
    })

    return NextResponse.json(client)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * DELETE /api/clients/[id] - Delete client
 */
export const DELETE = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'client:delete')

    // Get client ID from URL
    const url = new URL(req.url)
    const clientId = url.pathname.split('/').pop()

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Check if client exists and belongs to organization
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Verify organization access
    await verifyOrganizationAccess(existingClient.organizationId, auth.organizationId)

    // Delete client
    await prisma.client.delete({
      where: { id: clientId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
})
