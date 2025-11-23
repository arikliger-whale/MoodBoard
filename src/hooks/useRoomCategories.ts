/**
 * Room Category Management Hooks
 * React Query hooks for room category CRUD operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types
export interface LocalizedString {
  he: string
  en: string
}

export interface RoomCategory {
  id: string
  slug: string
  name: LocalizedString
  description?: LocalizedString
  icon?: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    roomTypes: number
  }
}

export interface RoomCategoryFilters {
  includeInactive?: boolean
}

export interface CreateRoomCategoryInput {
  name: LocalizedString
  slug: string
  description?: LocalizedString
  icon?: string
  order?: number
  active?: boolean
}

export interface UpdateRoomCategoryInput {
  name?: LocalizedString
  slug?: string
  description?: LocalizedString
  icon?: string
  order?: number
  active?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
}

/**
 * Fetch room categories with optional filters
 */
export function useRoomCategories(filters: RoomCategoryFilters = {}) {
  return useQuery({
    queryKey: ['room-categories', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.includeInactive) params.append('includeInactive', 'true')

      const response = await fetch(`/api/admin/room-categories?${params}`)
      if (!response.ok) throw new Error('Failed to fetch room categories')
      return response.json() as Promise<PaginatedResponse<RoomCategory>>
    },
  })
}

/**
 * Fetch single room category
 */
export function useRoomCategory(id: string) {
  return useQuery({
    queryKey: ['room-category', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/room-categories/${id}`)
      if (!response.ok) throw new Error('Failed to fetch room category')
      return response.json() as Promise<RoomCategory>
    },
    enabled: !!id,
  })
}

/**
 * Create room category mutation
 */
export function useCreateRoomCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRoomCategoryInput) => {
      const response = await fetch('/api/admin/room-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create room category')
      }
      return response.json() as Promise<RoomCategory>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-categories'] })
    },
  })
}

/**
 * Update room category mutation
 */
export function useUpdateRoomCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoomCategoryInput }) => {
      const response = await fetch(`/api/admin/room-categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update room category')
      }
      return response.json() as Promise<RoomCategory>
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['room-categories'] })
      queryClient.invalidateQueries({ queryKey: ['room-category', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['room-types'] }) // Invalidate related room types
    },
  })
}

/**
 * Delete (soft delete) room category mutation
 */
export function useDeleteRoomCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/room-categories/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete room category')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-categories'] })
      queryClient.invalidateQueries({ queryKey: ['room-types'] }) // Invalidate related room types
    },
  })
}
