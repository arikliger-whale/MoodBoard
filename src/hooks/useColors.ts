/**
 * React Query hooks for Color Management
 * Provides CRUD operations for colors
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type {
  CreateColor,
  UpdateColor,
  ColorFilters,
} from '@/lib/validations/color'

export interface Color {
  id: string
  organizationId: string | null
  name: {
    he: string
    en: string
  }
  description?: {
    he: string
    en: string
  } | null
  hex: string
  pantone?: string | null
  category: 'neutral' | 'accent' | 'semantic'
  role?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | null
  usage: number
  createdAt: Date | string
  updatedAt: Date | string
}

interface ColorsResponse {
  data: Color[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const COLORS_QUERY_KEY = 'colors'
const ADMIN_COLORS_QUERY_KEY = 'admin-colors'

/**
 * Fetch colors with filters
 */
async function fetchColors(filters: ColorFilters): Promise<ColorsResponse> {
  const params = new URLSearchParams()

  if (filters.search) params.append('search', filters.search)
  if (filters.category) params.append('category', filters.category)
  if (filters.organizationId !== undefined) {
    params.append('organizationId', filters.organizationId || 'null')
  }
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())

  const url = `/api/admin/colors?${params.toString()}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch colors')
  }

  return response.json()
}

/**
 * Fetch single color
 */
async function fetchColor(colorId: string): Promise<Color> {
  const response = await fetch(`/api/admin/colors/${colorId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch color')
  }

  return response.json()
}

/**
 * Hook to fetch colors (admin only)
 */
export function useColors(filters: ColorFilters = {}) {
  const { data: session, status } = useSession()

  return useQuery({
    queryKey: [ADMIN_COLORS_QUERY_KEY, filters],
    queryFn: () => fetchColors(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: status === 'authenticated', // Only fetch when authenticated
  })
}

/**
 * Fetch all colors by paginating through all pages
 */
async function fetchAllColors(baseFilters: Omit<ColorFilters, 'page' | 'limit'>): Promise<Color[]> {
  const allColors: Color[] = []
  let page = 1
  const limit = 100 // Max per page
  let hasMore = true

  while (hasMore) {
    const response = await fetchColors({ ...baseFilters, page, limit })
    allColors.push(...response.data)

    hasMore = page < response.pagination.totalPages
    page++
  }

  return allColors
}

/**
 * Hook to fetch ALL colors (paginated automatically)
 * Use this when you need all colors for dropdowns/selects
 */
export function useAllColors(filters: Omit<ColorFilters, 'page' | 'limit'> = {}) {
  const { status } = useSession()

  return useQuery({
    queryKey: [ADMIN_COLORS_QUERY_KEY, 'all', filters],
    queryFn: () => fetchAllColors(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: status === 'authenticated',
  })
}

/**
 * Hook to fetch single color
 */
export function useColor(colorId: string) {
  return useQuery({
    queryKey: [ADMIN_COLORS_QUERY_KEY, colorId],
    queryFn: () => fetchColor(colorId),
    enabled: !!colorId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to create color (admin only)
 */
export function useCreateColor() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.role === 'admin'

  return useMutation({
    mutationFn: async (data: CreateColor) => {
      if (!isAdmin) {
        throw new Error('Admin access required')
      }

      const response = await fetch('/api/admin/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required')
        }
        const error = await response.json()
        throw new Error(error.error || 'Failed to create color')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_COLORS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [COLORS_QUERY_KEY] })
    },
    onError: (error: any) => {
      if (error?.message?.includes('Admin access') || error?.status === 403) {
        const locale = window.location.pathname.split('/')[1] || 'he'
        router.push(`/${locale}/dashboard`)
      }
    },
  })
}

/**
 * Hook to update color (admin only)
 */
export function useUpdateColor() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.role === 'admin'

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateColor }) => {
      if (!isAdmin) {
        throw new Error('Admin access required')
      }

      const response = await fetch(`/api/admin/colors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required')
        }
        const error = await response.json()
        throw new Error(error.error || 'Failed to update color')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_COLORS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [ADMIN_COLORS_QUERY_KEY, variables.id] })
      queryClient.invalidateQueries({ queryKey: [COLORS_QUERY_KEY] })
    },
    onError: (error: any) => {
      if (error?.message?.includes('Admin access') || error?.status === 403) {
        const locale = window.location.pathname.split('/')[1] || 'he'
        router.push(`/${locale}/dashboard`)
      }
    },
  })
}

/**
 * Hook to delete color (admin only)
 */
export function useDeleteColor() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.role === 'admin'

  return useMutation({
    mutationFn: async (colorId: string) => {
      if (!isAdmin) {
        throw new Error('Admin access required')
      }

      const response = await fetch(`/api/admin/colors/${colorId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required')
        }
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete color')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_COLORS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [COLORS_QUERY_KEY] })
    },
    onError: (error: any) => {
      if (error?.message?.includes('Admin access') || error?.status === 403) {
        const locale = window.location.pathname.split('/')[1] || 'he'
        router.push(`/${locale}/dashboard`)
      }
    },
  })
}

