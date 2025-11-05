/**
 * Admin Style Approvals API
 * GET /api/admin/styles/approvals - List pending style approvals
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdmin, handleError } from '@/lib/api/admin-middleware'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


/**
 * GET /api/admin/styles/approvals - List pending style approvals
 */
export const GET = withAdmin(async (req: NextRequest, auth) => {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'pending' // pending, approved, rejected
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause - public styles with specific approval status
    const where: any = {
      organizationId: { not: null }, // Not global styles
      'metadata.isPublic': true,
      'metadata.approvalStatus': status,
    }

    // Get total count
    const total = await prisma.style.count({ where })

    // Get pending styles with organization info
    const styles = await prisma.style.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
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

    return NextResponse.json({
      data: styles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleError(error)
  }
})

