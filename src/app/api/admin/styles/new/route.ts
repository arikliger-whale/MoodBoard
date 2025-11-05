/**
 * Admin Styles API - New Style Template
 * GET /api/admin/styles/new - Get template/defaults for creating a new style
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api/admin-middleware'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


/**
 * GET /api/admin/styles/new - Get template for new style
 */
export const GET = withAdmin(async (req: NextRequest, auth) => {
  try {
    // Return empty template/defaults for creating a new style
    return NextResponse.json({
      template: {
        name: {
          he: '',
          en: '',
        },
        category: '',
        slug: '',
        palette: {
          neutrals: [],
          accents: [],
        },
        materialSet: {
          defaults: [],
          alternatives: [],
        },
        roomProfiles: [],
        metadata: {
          version: '1.0.0',
          isPublic: true,
          tags: [],
        },
      },
      categories: [
        'scandinavian',
        'japandi',
        'industrial',
        'minimal',
        'mediterranean',
        'rustic',
        'classic',
      ],
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load template' },
      { status: 500 }
    )
  }
})

