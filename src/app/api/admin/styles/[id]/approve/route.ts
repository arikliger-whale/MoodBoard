/**
 * Admin Style Approval API
 * POST /api/admin/styles/[id]/approve - Approve or reject public style
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdmin, handleError, validateRequest } from '@/lib/api/admin-middleware'
import { approveStyleSchema } from '@/lib/validations/style'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


/**
 * POST /api/admin/styles/[id]/approve - Approve or reject public style
 */
export const POST = withAdmin(async (req: NextRequest, auth) => {
  try {
    const url = new URL(req.url)
    const styleId = url.pathname.split('/').slice(-2)[0] // Get ID from /approve route

    if (!styleId) {
      return NextResponse.json({ error: 'Style ID is required' }, { status: 400 })
    }

    // Validate request body
    const body = await validateRequest(req, approveStyleSchema)

    // Check if style exists
    const style = await prisma.style.findUnique({
      where: { id: styleId },
    })

    if (!style) {
      return NextResponse.json({ error: 'Style not found' }, { status: 404 })
    }

    // Verify it's a public style (not global, not personal)
    const metadata = style.metadata as any
    if (!metadata.isPublic || style.organizationId === null) {
      return NextResponse.json(
        { error: 'This style cannot be approved/rejected' },
        { status: 403 }
      )
    }

    // Update approval status
    const updatedStyle = await prisma.style.update({
      where: { id: styleId },
      data: {
        metadata: {
          ...metadata,
          approvalStatus: body.approved ? 'approved' : 'rejected',
          approvedBy: body.approved ? auth.userId : null,
          approvedAt: body.approved ? new Date() : null,
          rejectionReason: body.approved ? null : body.rejectionReason || null,
        } as any,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: body.approved ? 'Style approved successfully' : 'Style rejected',
      style: updatedStyle,
    })
  } catch (error) {
    return handleError(error)
  }
})

