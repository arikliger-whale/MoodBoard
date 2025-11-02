/**
 * User Styles API - Single Style
 * GET /api/styles/[id] - Get style details
 * PATCH /api/styles/[id] - Update style (if owner)
 * DELETE /api/styles/[id] - Delete style (if owner)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, handleError, validateRequest, requirePermission, verifyOrganizationAccess } from '@/lib/api/middleware'
import { updateStyleSchema } from '@/lib/validations/style'

/**
 * GET /api/styles/[id] - Get style details
 */
export const GET = withAuth(async (req: NextRequest, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'style:read')

    const url = new URL(req.url)
    const styleId = url.pathname.split('/').pop()

    if (!styleId) {
      return NextResponse.json({ error: 'Style ID is required' }, { status: 400 })
    }

    const style = await prisma.style.findUnique({
      where: { id: styleId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!style) {
      return NextResponse.json({ error: 'Style not found' }, { status: 404 })
    }

    // Check access:
    // - Global styles: accessible to all
    // - Approved public styles: accessible to all
    // - Personal styles: only accessible to owning organization
    const metadata = style.metadata as any
    if (style.organizationId !== null) {
      // Not a global style
      if (!metadata.isPublic || metadata.approvalStatus !== 'approved') {
        // Personal or pending/rejected public style - check ownership
        await verifyOrganizationAccess(style.organizationId, auth.organizationId)
      }
    }

    return NextResponse.json(style)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * PATCH /api/styles/[id] - Update style (if owner)
 */
export const PATCH = withAuth(async (req: NextRequest, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'style:write')

    const url = new URL(req.url)
    const styleId = url.pathname.split('/').pop()

    if (!styleId) {
      return NextResponse.json({ error: 'Style ID is required' }, { status: 400 })
    }

    // Validate request body
    const body = await validateRequest(req, updateStyleSchema)

    // Check if style exists
    const existingStyle = await prisma.style.findUnique({
      where: { id: styleId },
    })

    if (!existingStyle) {
      return NextResponse.json({ error: 'Style not found' }, { status: 404 })
    }

    // Only allow editing organization's own styles (not global styles)
    if (existingStyle.organizationId === null) {
      return NextResponse.json(
        { error: 'Cannot edit global styles' },
        { status: 403 }
      )
    }

    // Verify ownership
    await verifyOrganizationAccess(existingStyle.organizationId, auth.organizationId)

    // Update style
    const updatedMetadata = existingStyle.metadata as any
    const style = await prisma.style.update({
      where: { id: styleId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.category && { category: body.category }),
        ...(body.slug && { slug: body.slug }),
        ...(body.palette && { palette: body.palette as any }),
        ...(body.materialSet && { materialSet: body.materialSet as any }),
        ...(body.roomProfiles && { roomProfiles: body.roomProfiles as any }),
        ...(body.metadata && {
          metadata: {
            ...updatedMetadata,
            ...body.metadata,
            // If changing from personal to public, set status to pending
            approvalStatus:
              body.metadata.isPublic && !updatedMetadata.isPublic
                ? 'pending'
                : updatedMetadata.approvalStatus,
          } as any,
        }),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(style)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * DELETE /api/styles/[id] - Delete style (if owner)
 */
export const DELETE = withAuth(async (req: NextRequest, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'style:delete')

    const url = new URL(req.url)
    const styleId = url.pathname.split('/').pop()

    if (!styleId) {
      return NextResponse.json({ error: 'Style ID is required' }, { status: 400 })
    }

    // Check if style exists
    const existingStyle = await prisma.style.findUnique({
      where: { id: styleId },
    })

    if (!existingStyle) {
      return NextResponse.json({ error: 'Style not found' }, { status: 404 })
    }

    // Only allow deleting organization's own styles (not global styles)
    if (existingStyle.organizationId === null) {
      return NextResponse.json(
        { error: 'Cannot delete global styles' },
        { status: 403 }
      )
    }

    // Verify ownership
    await verifyOrganizationAccess(existingStyle.organizationId, auth.organizationId)

    // Delete style
    await prisma.style.delete({
      where: { id: styleId },
    })

    return NextResponse.json({ message: 'Style deleted successfully' })
  } catch (error) {
    return handleError(error)
  }
})

