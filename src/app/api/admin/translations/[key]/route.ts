/**
 * Admin Translation Management - Single Translation
 * DELETE /api/admin/translations/[key] - Delete translation (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdmin } from '@/lib/api/admin-middleware'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/translations/[key] - Delete translation
 */
export const DELETE = withAdmin(
  async (req: NextRequest, { params }: { params: { key: string } }) => {
    try {
      const key = decodeURIComponent(params.key)

      // Check if translation exists
      const existing = await prisma.translation.findUnique({
        where: { key },
      })

      if (!existing) {
        return NextResponse.json(
          { error: 'Translation not found' },
          { status: 404 }
        )
      }

      // Delete translation
      await prisma.translation.delete({
        where: { key },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Translation delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete translation' },
        { status: 500 }
      )
    }
  }
)
