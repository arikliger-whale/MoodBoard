'use client'

/**
 * useOrganization Hook
 * Client-side hook for accessing organization data
 */

import { useSession } from 'next-auth/react'

export function useOrganizationData() {
  const { data: session } = useSession()

  const organization = (session?.user as any)?.organization || null

  return {
    organization: organization
      ? {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        }
      : null,
    isLoading: false,
  }
}
