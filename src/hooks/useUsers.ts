/**
 * Users Hooks
 * React Query hooks for user management (admin only)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export interface UserFilters {
  search?: string
  role?: string
  organizationId?: string
  page?: number
  limit?: number
}

export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  organizationId: string | null
  organization: {
    id: string
    name: string
    slug: string
  } | null
  role: string | null
  permissions: string[]
  profile: {
    firstName: string
    lastName: string
    email: string
    phone: string | null
    avatar: string | null
  } | null
  lastActive: Date
  createdAt: Date
  updatedAt: Date
  _count: {
    createdProjects: number
    comments?: number
    approvals?: number
  }
}

interface UsersResponse {
  data: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const ADMIN_USERS_QUERY_KEY = 'admin-users'

/**
 * Fetch admin users with filters
 */
async function fetchAdminUsers(filters: UserFilters): Promise<UsersResponse> {
  const params = new URLSearchParams()

  if (filters.search) params.append('search', filters.search)
  if (filters.role) params.append('role', filters.role)
  if (filters.organizationId) params.append('organizationId', filters.organizationId)
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())

  const url = `/api/admin/users?${params.toString()}`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Admin access required')
    }
    throw new Error('Failed to fetch users')
  }

  return response.json()
}

/**
 * Hook to fetch admin users (admin only)
 * Protected: Only works for admin users
 */
export function useAdminUsers(filters: UserFilters = {}) {
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.role === 'admin'

  return useQuery({
    queryKey: [ADMIN_USERS_QUERY_KEY, filters],
    queryFn: async () => {
      if (!isAdmin) {
        throw new Error('Admin access required')
      }
      return fetchAdminUsers(filters)
    },
    enabled: !!session && isAdmin,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
    staleTime: 10000,
    retry: false,
    onError: (error: any) => {
      if (error?.message?.includes('Admin access') || error?.status === 403) {
        const locale = window.location.pathname.split('/')[1] || 'he'
        router.push(`/${locale}/dashboard`)
      }
    },
  })
}

/**
 * Hook to fetch a single admin user (admin only)
 * Protected: Only works for admin users
 */
export function useAdminUser(userId: string) {
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.role === 'admin'

  return useQuery({
    queryKey: [ADMIN_USERS_QUERY_KEY, userId],
    queryFn: async () => {
      if (!isAdmin) {
        throw new Error('Admin access required')
      }

      const response = await fetch(`/api/admin/users/${userId}`)

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required')
        }
        if (response.status === 404) {
          throw new Error('User not found')
        }
        throw new Error('Failed to fetch user')
      }

      return response.json()
    },
    enabled: !!session && !!userId && isAdmin,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    retry: false,
    onError: (error: any) => {
      if (error?.message?.includes('Admin access') || error?.status === 403) {
        const locale = window.location.pathname.split('/')[1] || 'he'
        router.push(`/${locale}/dashboard`)
      }
    },
  })
}

/**
 * Hook to update admin user (admin only)
 * Protected: Only works for admin users
 */
export function useUpdateAdminUser() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.role === 'admin'

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      if (!isAdmin) {
        throw new Error('Admin access required')
      }

      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required')
        }
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY, variables.id] })
    },
    onError: (error: any) => {
      if (error?.message?.includes('Admin access') || error?.status === 403) {
        const locale = window.location.pathname.split('/')[1] || 'he'
        router.push(`/${locale}/dashboard`)
      }
    },
  })
}

