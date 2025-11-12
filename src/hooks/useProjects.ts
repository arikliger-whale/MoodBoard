/**
 * React Query hooks for Project Management
 * Provides real-time-like updates with auto-refetch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

interface ProjectFilters {
  search?: string
  clientId?: string
  status?: string[]
  page?: number
  limit?: number
}

export type ProjectStatus = 'draft' | 'active' | 'review' | 'approved' | 'completed' | 'archived'

export interface Project {
  id: string
  name: string
  slug: string
  status: ProjectStatus
  organizationId: string
  clientId: string
  client?: {
    id: string
    name: string
    contact: {
      email: string
      phone?: string
    }
  }
  rooms?: Array<{
    id: string
    name: string
    type: string
    dimensions?: {
      length: number
      width: number
      height: number
      unit: string
    }
  }>
  budget?: {
    currency: string
    target: {
      min: number
      max: number
    }
    allocated: number
    spent: number
  }
  timeline?: {
    startDate?: string
    endDate?: string
    milestones?: Array<{
      id: string
      name: string
      date: string
      completed: boolean
    }>
  }
  metadata: {
    createdBy: string
    createdAt: Date | string
    updatedAt: Date | string
    lastModifiedBy: string
  }
  _count?: {
    team?: number // TeamMember model not yet implemented
    comments: number
    approvals?: number
  }
}

interface ProjectsResponse {
  data: Project[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const PROJECTS_QUERY_KEY = 'projects'

/**
 * Fetch projects with filters
 */
async function fetchProjects(filters: ProjectFilters): Promise<ProjectsResponse> {
  const params = new URLSearchParams()

  if (filters.search) params.append('search', filters.search)
  if (filters.clientId) params.append('clientId', filters.clientId)
  if (filters.status?.length) params.append('status', filters.status.join(','))
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())

  const url = `/api/projects?${params.toString()}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch projects')
  }

  return response.json()
}

/**
 * Hook to fetch projects list
 * FIX: Removed aggressive refetch options to improve performance
 */
export function useProjects(filters: ProjectFilters = {}) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, filters],
    queryFn: () => fetchProjects(filters),
    enabled: !!session, // Only fetch when authenticated
    // FIX: Removed refetchOnWindowFocus, refetchInterval, and staleTime overrides
    // Use global defaults (5min staleTime, no auto-refetch) for better performance
    // Projects don't change frequently - no need for aggressive real-time updates
  })
}

/**
 * Hook to create a new project with optimistic update
 */
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create project')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate all project queries to refetch
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to update a project with optimistic update
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update project')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate all project queries to refetch
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to delete a project with optimistic update
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete project')
      }

      return id
    },
    onSuccess: () => {
      // Invalidate all project queries to refetch
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to fetch a single project
 * FIX: Removed aggressive refetch options to improve performance
 */
export function useProject(projectId: string) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch project')
      }

      return response.json()
    },
    enabled: !!session && !!projectId,
    // FIX: Removed refetchOnWindowFocus and staleTime overrides
    // Use global defaults (5min staleTime, no auto-refetch) for better performance
  })
}
