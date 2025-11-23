/**
 * Lightweight Material Categories API
 * Returns only id, name, and slug for dropdown/select components
 * MUCH faster than the full endpoint
 */

import { withAdmin } from '@/lib/api/admin-middleware'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/material-categories/lite - List material categories (lightweight)
 * Returns only essential fields for dropdowns: id, name, slug, order
 */
export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const categories = await prisma.materialCategory.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        order: true,
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      data: categories,
      count: categories.length,
    })
  } catch (error: any) {
    console.error('Material Categories Lite API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch material categories' },
      { status: 500 }
    )
  }
})
