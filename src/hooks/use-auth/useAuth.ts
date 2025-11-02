'use client'

/**
 * useAuth Hook
 * Client-side hook for accessing authentication state
 */

import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated' && !!session?.user

  return {
    user: session?.user
      ? {
          id: session.user.id || '',
          email: session.user.email || '',
          name: session.user.name || '',
          firstName: (session.user as any).firstName || session.user.name?.split(' ')[0] || '',
          lastName: (session.user as any).lastName || session.user.name?.split(' ').slice(1).join(' ') || '',
          imageUrl: session.user.image || '',
          fullName: session.user.name || '',
        }
      : null,
    organization: (session?.user as any)?.organization
      ? {
          id: (session.user as any).organization.id,
          name: (session.user as any).organization.name,
          slug: (session.user as any).organization.slug,
        }
      : null,
    isAuthenticated,
    userId: session?.user?.id || null,
    isLoading,
  }
}
