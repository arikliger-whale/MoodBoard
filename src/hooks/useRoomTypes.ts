/**
 * React Query hooks for Room Type management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { CreateRoomType, UpdateRoomType } from '@/lib/validations/roomType'

const API_BASE = '/api/admin/room-types'

interface RoomTypesResponse {
  data: any[]
  count: number
}

interface RoomTypeFilters {
  categoryId?: string
  includeInactive?: boolean
}

// Fetch all room types with optional filters
export function useRoomTypes(filters: RoomTypeFilters = {}) {
  const { status } = useSession()

  return useQuery<RoomTypesResponse>({
    queryKey: ['roomTypes', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.categoryId) params.append('categoryId', filters.categoryId)
      if (filters.includeInactive) params.append('includeInactive', 'true')

      const res = await fetch(`${API_BASE}?${params}`)
      if (!res.ok) throw new Error('Failed to fetch room types')
      return res.json()
    },
    enabled: status === 'authenticated', // Only fetch when authenticated
  })
}

// Fetch single room type
export function useRoomType(id: string) {
  return useQuery({
    queryKey: ['roomTypes', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/${id}`)
      if (!res.ok) throw new Error('Failed to fetch room type')
      return res.json()
    },
    enabled: !!id,
  })
}

// Create room type
export function useCreateRoomType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRoomType) => {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create room type')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypes'] })
    },
  })
}

// Update room type
export function useUpdateRoomType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoomType }) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update room type')
      }
      return res.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['roomTypes'] })
      queryClient.invalidateQueries({ queryKey: ['roomTypes', id] })
    },
  })
}

// Delete room type
export function useDeleteRoomType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete room type')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypes'] })
    },
  })
}

