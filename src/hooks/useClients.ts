/**
 * React Query hooks for Client Management
 * Provides real-time-like updates with auto-refetch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

interface ClientFilters {
  search?: string
  tags?: string[]
  page?: number
  limit?: number
}

interface Client {
  id: string
  name: string
  contact: {
    email: string
    phone?: string
    address?: string
    city?: string
    country?: string
  }
  tags: string[]
  preferences?: {
    budgetRange?: {
      min: number
      max: number
    }
    specialNeeds?: string
  }
  notes?: Array<{
    content: string
    createdAt: Date
  }>
  organizationId: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    projects: number
  }
}

interface ClientsResponse {
  data: Client[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const CLIENTS_QUERY_KEY = 'clients'

/**
 * Fetch clients with filters
 */
async function fetchClients(filters: ClientFilters): Promise<ClientsResponse> {
  const params = new URLSearchParams()

  if (filters.search) params.append('search', filters.search)
  if (filters.tags?.length) params.append('tags', filters.tags.join(','))
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())

  const url = `/api/clients?${params.toString()}`
  console.log('Fetching clients from:', url)

  const response = await fetch(url)

  if (!response.ok) {
    console.error('Failed to fetch clients:', response.status, response.statusText)
    throw new Error('Failed to fetch clients')
  }

  const data = await response.json()
  console.log('Fetched clients data:', data)

  return data
}

/**
 * Hook to fetch clients list with real-time updates
 */
export function useClients(filters: ClientFilters = {}) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: [CLIENTS_QUERY_KEY, filters],
    queryFn: () => fetchClients(filters),
    enabled: !!session, // Only fetch when authenticated
    // Auto-refetch for real-time feel
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })
}

/**
 * Hook to create a new client with optimistic update
 */
export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Client>) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create client')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate all client queries to refetch
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to update a client with optimistic update
 */
export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update client')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate all client queries to refetch
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to delete a client with optimistic update
 */
export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete client')
      }

      return id
    },
    onSuccess: () => {
      // Invalidate all client queries to refetch
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] })
    },
  })
}

/**
 * Hook to fetch a single client
 */
export function useClient(clientId: string) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: [CLIENTS_QUERY_KEY, clientId],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${clientId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch client')
      }

      return response.json()
    },
    enabled: !!session && !!clientId,
    refetchOnWindowFocus: true,
    staleTime: 10000,
  })
}
