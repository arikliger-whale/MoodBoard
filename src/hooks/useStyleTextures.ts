/**
 * Style Textures Hooks
 * React Query hooks for fetching Texture entities linked to a style
 */

import { useQuery } from '@tanstack/react-query'

export interface StyleTexture {
  id: string
  name: { he: string; en: string }
  imageUrl: string
  usageCount: number
  notes: string | null
  category: {
    id: string
    name: { he: string; en: string }
    slug: string
  }
  type: {
    id: string
    name: { he: string; en: string }
    slug: string
  }
}

export interface StyleTexturesResponse {
  success: boolean
  data: {
    textures: StyleTexture[]
    groupedByCategory: Record<string, StyleTexture[]>
    counts: {
      total: number
      byCategory: Array<{
        category: string
        count: number
      }>
    }
  }
}

/**
 * Fetch Texture entities linked to a style
 */
export function useStyleTextures(styleId: string) {
  return useQuery({
    queryKey: ['style-textures', styleId],
    queryFn: async () => {
      const response = await fetch(`/api/styles/${styleId}/textures`)
      if (!response.ok) throw new Error('Failed to fetch style textures')
      return response.json() as Promise<StyleTexturesResponse>
    },
    enabled: !!styleId,
  })
}
