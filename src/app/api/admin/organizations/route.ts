/**
 * Admin Organizations API
 * GET /api/admin/organizations - List all organizations (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdmin, handleError } from '@/lib/api/admin-middleware'

/**
 * GET /api/admin/organizations - List all organizations
 */
export const GET = withAdmin(async (req: NextRequest, auth) => {
  try {
    // Get all organizations
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      data: organizations,
    })
  } catch (error) {
    return handleError(error)
  }
})

