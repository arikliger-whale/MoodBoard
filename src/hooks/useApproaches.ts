/**
 * React Query hooks for Approach management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreateApproach, UpdateApproach } from '@/lib/validations/approach'

const API_BASE = '/api/admin/approaches'

// Fetch all approaches
export function useApproaches() {
  return useQuery({
    queryKey: ['approaches'],
    queryFn: async () => {
      const res = await fetch(API_BASE)
      if (!res.ok) throw new Error('Failed to fetch approaches')
      return res.json()
    },
  })
}

// Fetch single approach
export function useApproach(id: string) {
  return useQuery({
    queryKey: ['approaches', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/${id}`)
      if (!res.ok) throw new Error('Failed to fetch approach')
      return res.json()
    },
    enabled: !!id,
  })
}

// Create approach
export function useCreateApproach() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateApproach) => {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create approach')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approaches'] })
    },
  })
}

// Update approach
export function useUpdateApproach() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateApproach }) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update approach')
      }
      return res.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['approaches'] })
      queryClient.invalidateQueries({ queryKey: ['approaches', id] })
    },
  })
}

// Delete approach
export function useDeleteApproach() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete approach')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approaches'] })
    },
  })
}

