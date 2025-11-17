/**
 * Admin API: Recover Orphaned Images from GCP
 *
 * Endpoint: POST /api/admin/recover-images
 * Body: { styleId?: string, dryRun?: boolean }
 * Returns: RecoveryResult
 */

import { NextRequest, NextResponse } from 'next/server'
import { recoverOrphanedImages } from '@/lib/seed/recover-images'

export const runtime = 'nodejs'
export const maxDuration = 60 // 1 minute max

interface RecoverRequest {
  styleId?: string
  dryRun?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: RecoverRequest = await request.json()
    const { styleId, dryRun = true } = body

    console.log(`[API] Recovery request: styleId=${styleId || 'all'}, dryRun=${dryRun}`)

    // Run recovery
    const result = await recoverOrphanedImages(styleId, dryRun)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[API] Recovery error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
