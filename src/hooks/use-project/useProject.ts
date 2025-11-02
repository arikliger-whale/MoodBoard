'use client'

import { useQuery } from '@tanstack/react-query'

interface Project {
  id: string
  name: string
  status: string
  clientId: string
  clientName: string
  createdAt: string
}

export function useProjects(organizationId: string) {
  return useQuery<Project[]>({
    queryKey: ['projects', organizationId],
    queryFn: async () => {
      const response = await fetch(`/api/projects?organizationId=${organizationId}`)
      if (!response.ok) throw new Error('Failed to fetch projects')
      return response.json()
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useProject(projectId: string) {
  return useQuery<Project | null>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`)
      if (!response.ok) return null
      return response.json()
    },
    enabled: !!projectId,
  })
}

