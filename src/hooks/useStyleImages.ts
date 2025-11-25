/**
 * Style Images Hooks
 * React Query hooks for fetching StyleImage entities
 */

import { useQuery } from '@tanstack/react-query'

export interface StyleImage {
  id: string
  styleId: string
  url: string
  imageCategory: 'ROOM_OVERVIEW' | 'ROOM_DETAIL' | 'MATERIAL' | 'TEXTURE' | 'COMPOSITE' | 'ANCHOR'
  displayOrder: number
  description: string | null
  tags: string[]
  roomType: string | null
  textureId: string | null
  createdAt: string
  updatedAt: string
  texture?: {
    id: string
    name: { he: string; en: string }
    imageUrl: string
    category: {
      id: string
      name: { he: string; en: string }
    }
    type: {
      id: string
      name: { he: string; en: string }
    }
  } | null
}

export interface StyleImagesFilters {
  category?: string
  roomType?: string
  limit?: number
}

export interface StyleImagesResponse {
  success: boolean
  data: {
    images: StyleImage[]
    groupedByCategory: Record<string, StyleImage[]>
    counts: {
      total: number
      ROOM_OVERVIEW: number
      ROOM_DETAIL: number
      MATERIAL: number
      TEXTURE: number
      COMPOSITE: number
      ANCHOR: number
    }
  }
}

/**
 * Fetch StyleImage entities for a style
 */
export function useStyleImages(styleId: string, filters: StyleImagesFilters = {}) {
  return useQuery({
    queryKey: ['style-images', styleId, filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.roomType) params.append('roomType', filters.roomType)
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/styles/${styleId}/images?${params}`)
      if (!response.ok) throw new Error('Failed to fetch style images')
      return response.json() as Promise<StyleImagesResponse>
    },
    enabled: !!styleId,
  })
}

/**
 * Fetch room overview images grouped by room type
 */
export function useStyleRoomImages(styleId: string) {
  return useStyleImages(styleId, { category: 'ROOM_OVERVIEW' })
}

/**
 * Fetch material images
 */
export function useStyleMaterialImages(styleId: string) {
  return useStyleImages(styleId, { category: 'MATERIAL' })
}

/**
 * Fetch texture images
 */
export function useStyleTextureImages(styleId: string) {
  return useStyleImages(styleId, { category: 'TEXTURE' })
}
