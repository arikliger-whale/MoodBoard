/**
 * API Route Authentication Middleware
 * Validates authentication and organization access for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-instance'
import { requireAuth, requireOrganization } from '@/lib/auth/auth'

export interface ApiContext {
  userId: string
  organizationId: string
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
}

/**
 * Create authenticated API route handler
 */
export function createAuthenticatedHandler(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const session = await auth()
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const { user, organizationId } = await requireOrganization()

      const context: ApiContext = {
        userId: user.id,
        organizationId,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      }

      return await handler(req, context)
    } catch (error) {
      console.error('API route error:', error)
      
      if (error instanceof Error && error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Create optional authentication handler (doesn't require auth)
 */
export function createOptionalAuthHandler(
  handler: (req: NextRequest, context: ApiContext | null) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const session = await auth()
      
      if (!session?.user) {
        return await handler(req, null)
      }

      const { user, organizationId } = await requireOrganization()

      const context: ApiContext = {
        userId: user.id,
        organizationId,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      }

      return await handler(req, context)
    } catch (error) {
      console.error('API route error:', error)
      
      // For optional auth, continue without auth context
      return await handler(req, null)
    }
  }
}
