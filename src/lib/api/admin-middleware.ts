/**
 * Admin-specific middleware for MoodB
 * Enforces admin-only access to admin routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, type AuthContext, handleError as handleApiError, validateRequest as validateApiRequest } from './middleware'
import { UnauthorizedError, ForbiddenError } from '../errors'

/**
 * Require admin role - throws error if user is not admin
 */
export function requireAdmin(auth: AuthContext): void {
  if (auth.role !== 'admin') {
    throw new ForbiddenError('Admin access required')
  }
}

/**
 * Admin-only route wrapper
 * Checks authentication and admin role
 */
export function withAdmin<T extends any[]>(
  handler: (req: NextRequest, auth: AuthContext, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      // Get authenticated user
      const auth = await getAuthUser(req)

      // Check admin role
      requireAdmin(auth)

      // Call handler with admin context
      return await handler(req, auth, ...args)
    } catch (error) {
      // Handle errors using the same error handler
      return handleApiError(error)
    }
  }
}

// Re-export handleError and validateRequest for convenience
export { handleApiError as handleError, validateApiRequest as validateRequest }

