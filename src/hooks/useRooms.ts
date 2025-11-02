/**
 * React Query hooks for Room Management
 * Provides real-time-like updates with auto-refetch
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateRoom, UpdateRoom, Room } from '@/lib/validations/room'

const PROJECTS_QUERY_KEY = 'projects'

/**
 * Hook to add a room to a project
 */
export function useAddRoom(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRoom) => {
      const response = await fetch(`/api/projects/${projectId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add room')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate project queries to refetch
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, projectId] })
    },
  })
}

/**
 * Hook to update a room
 */
export function useUpdateRoom(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ roomId, data }: { roomId: string; data: Partial<UpdateRoom> }) => {
      const response = await fetch(`/api/projects/${projectId}/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update room')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate project queries to refetch
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, projectId] })
    },
  })
}

/**
 * Hook to delete a room
 */
export function useDeleteRoom(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (roomId: string) => {
      const response = await fetch(`/api/projects/${projectId}/rooms/${roomId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete room')
      }

      return roomId
    },
    onSuccess: () => {
      // Invalidate project queries to refetch
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, projectId] })
    },
  })
}
