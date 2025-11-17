/**
 * React Query hooks for Category & SubCategory Management
 * Provides real-time-like updates with auto-refetch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type {
  CreateCategory,
  UpdateCategory,
  CreateSubCategory,
  UpdateSubCategory,
} from '@/lib/validations/category'

export interface Category {
  id: string
  name: {
    he: string
    en: string
  }
  description?: {
    he?: string
    en?: string
  }
  slug: string
  order: number
  images?: string[]
  subCategories?: SubCategory[]
  _count?: {
    styles: number
    subCategories: number
  }
  createdAt: Date | string
  updatedAt: Date | string
}

export interface SubCategory {
  id: string
  categoryId: string
  name: {
    he: string
    en: string
  }
  description?: {
    he?: string
    en?: string
  }
  slug: string
  order: number
  images?: string[]
  category?: {
    id: string
    name: {
      he: string
      en: string
    }
    slug: string
  }
  _count?: {
    styles: number
  }
  createdAt: Date | string
  updatedAt: Date | string
}

interface CategoriesResponse {
  data: Category[]
  count: number
}

interface SubCategoriesResponse {
  data: SubCategory[]
  count: number
}

// Categories hooks
export const useCategories = (search?: string) => {
  const { status } = useSession()

  return useQuery<CategoriesResponse>({
    queryKey: ['admin', 'categories', { search }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/categories?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
    enabled: status === 'authenticated', // Only fetch when authenticated
    // FIX: Removed aggressive staleTime override - use global default (60s)
    // This prevents unnecessary refetches every 10 seconds
  })
}

export const useCategory = (id: string) => {
  return useQuery<Category>({
    queryKey: ['admin', 'categories', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/categories/${id}`)
      if (!res.ok) throw new Error('Failed to fetch category')
      return res.json()
    },
    enabled: !!id,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: CreateCategory) => {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        let errorMessage = 'Failed to create category'
        try {
          const contentType = res.headers.get('content-type')
          if (contentType?.includes('application/json')) {
            const error = await res.json()
            errorMessage = error.error || error.message || errorMessage
          } else {
            const text = await res.text()
            errorMessage = text || errorMessage
          }
        } catch (e) {
          errorMessage = `HTTP ${res.status}: ${res.statusText}`
        }
        throw new Error(errorMessage)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategory }) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update category')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories', variables.id] })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete category')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })
}

// SubCategories hooks
export const useSubCategories = (categoryId?: string, search?: string) => {
  const { status } = useSession()

  return useQuery<SubCategoriesResponse>({
    queryKey: ['admin', 'sub-categories', { categoryId, search }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (categoryId) params.set('categoryId', categoryId)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/sub-categories?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch sub-categories')
      return res.json()
    },
    enabled: status === 'authenticated', // Only fetch when authenticated
    // FIX: Removed aggressive staleTime override - use global default (60s)
    // This prevents unnecessary refetches every 10 seconds
  })
}

export const useSubCategory = (id: string) => {
  return useQuery<SubCategory>({
    queryKey: ['admin', 'sub-categories', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/sub-categories/${id}`)
      if (!res.ok) throw new Error('Failed to fetch sub-category')
      return res.json()
    },
    enabled: !!id,
  })
}

export const useCreateSubCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateSubCategory) => {
      const res = await fetch('/api/admin/sub-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create sub-category')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sub-categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })
}

export const useUpdateSubCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSubCategory }) => {
      const res = await fetch(`/api/admin/sub-categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update sub-category')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sub-categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'sub-categories', variables.id] })
    },
  })
}

export const useDeleteSubCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/sub-categories/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete sub-category')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sub-categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })
}

