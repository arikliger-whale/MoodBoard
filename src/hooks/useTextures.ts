/**
 * Texture Management Hooks
 * React Query hooks for texture CRUD operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types
export interface LocalizedString {
  he: string
  en: string
}

export interface MaterialCategory {
  id: string
  name: LocalizedString
  description?: LocalizedString
  slug: string
  order: number
  icon?: string
}

export interface TextureMaterialCategory {
  id: string
  textureId: string
  materialCategoryId: string
  materialCategory: MaterialCategory
  createdAt: string
}

export interface Texture {
  id: string
  name: LocalizedString
  description?: LocalizedString
  imageUrl?: string | null
  tags: string[]
  metadata?: Record<string, any>
  usage: number
  createdAt: string
  updatedAt: string
  materialCategories: TextureMaterialCategory[]
  _count?: {
    styleLinks: number
  }
  styleLinks?: Array<{
    style: {
      id: string
      name: LocalizedString
      slug: string
    }
  }>
}

export interface TextureFilters {
  search?: string
  materialCategoryId?: string
  page?: number
  limit?: number
}

export interface CreateTextureInput {
  name: LocalizedString
  description?: LocalizedString
  materialCategoryIds: string[]
  imageUrl?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateTextureInput {
  name?: LocalizedString
  description?: LocalizedString
  materialCategoryIds?: string[]
  imageUrl?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Fetch textures with filters
 */
export function useTextures(filters: TextureFilters = {}) {
  return useQuery({
    queryKey: ['textures', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.materialCategoryId) params.append('materialCategoryId', filters.materialCategoryId)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/admin/textures?${params}`)
      if (!response.ok) throw new Error('Failed to fetch textures')
      return response.json() as Promise<PaginatedResponse<Texture>>
    },
  })
}

/**
 * Fetch single texture
 */
export function useTexture(id: string) {
  return useQuery({
    queryKey: ['texture', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/textures/${id}`)
      if (!response.ok) throw new Error('Failed to fetch texture')
      return response.json() as Promise<Texture>
    },
    enabled: !!id,
  })
}

/**
 * Fetch material categories (for texture assignment)
 * Uses full endpoint with types and counts
 */
export function useMaterialCategories() {
  return useQuery({
    queryKey: ['material-categories'],
    queryFn: async () => {
      const response = await fetch('/api/admin/material-categories')
      if (!response.ok) throw new Error('Failed to fetch material categories')
      const data = await response.json()
      return data as { data: MaterialCategory[] }
    },
  })
}

/**
 * Fetch material categories (lightweight for dropdowns)
 * Only returns id, name, slug, order - MUCH faster
 */
export function useMaterialCategoriesLite() {
  return useQuery({
    queryKey: ['material-categories-lite'],
    queryFn: async () => {
      const response = await fetch('/api/admin/material-categories/lite')
      if (!response.ok) throw new Error('Failed to fetch material categories')
      const data = await response.json()
      return data as { data: MaterialCategory[] }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

/**
 * Create texture mutation
 */
export function useCreateTexture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTextureInput) => {
      const response = await fetch('/api/admin/textures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create texture')
      }
      return response.json() as Promise<Texture>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textures'] })
      queryClient.invalidateQueries({ queryKey: ['material-categories'] })
    },
  })
}

/**
 * Update texture mutation
 */
export function useUpdateTexture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTextureInput }) => {
      const response = await fetch(`/api/admin/textures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update texture')
      }
      return response.json() as Promise<Texture>
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['textures'] })
      queryClient.invalidateQueries({ queryKey: ['texture', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['material-categories'] })
    },
  })
}

/**
 * Delete texture mutation
 */
export function useDeleteTexture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/textures/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete texture')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textures'] })
      queryClient.invalidateQueries({ queryKey: ['material-categories'] })
    },
  })
}
