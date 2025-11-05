import { NextResponse } from 'next/server'
import { createAuthenticatedHandler } from '@/lib/auth/api-middleware'

// Force dynamic rendering
export const dynamic = 'force-dynamic'


export const GET = createAuthenticatedHandler(async (req, context) => {
  // TODO: Fetch organization from database

  return NextResponse.json({
    id: context.organizationId,
    name: 'Example Organization',
    settings: {
      locale: 'he',
      currency: 'ILS',
    },
  })
})

