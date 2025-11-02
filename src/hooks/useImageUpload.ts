/**
 * Image Upload Hook
 * Manages image upload state and operations
 */

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { EntityType } from '@/lib/storage/r2'

interface UploadImageParams {
  file: File
  entityType: EntityType
  entityId: string
  projectId?: string
  roomId?: string
  roomType?: string
}

interface DeleteImageParams {
  url: string
}

/**
 * Hook for uploading images to R2
 */
export function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const uploadMutation = useMutation({
    mutationFn: async ({ file, entityType, entityId, projectId, roomId, roomType }: UploadImageParams) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('entityType', entityType)
      formData.append('entityId', entityId)
      if (projectId) formData.append('projectId', projectId)
      if (roomId) formData.append('roomId', roomId)
      if (roomType) formData.append('roomType', roomType)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload image')
      }

      return response.json()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ url }: DeleteImageParams) => {
      const response = await fetch('/api/upload/image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete image')
      }

      return response.json()
    },
  })

  const uploadImage = useCallback(
    async (params: UploadImageParams): Promise<string> => {
      setUploading(true)
      try {
        const result = await uploadMutation.mutateAsync(params)
        return result.url
      } finally {
        setUploading(false)
      }
    },
    [uploadMutation]
  )

  const deleteImage = useCallback(
    async (url: string): Promise<void> => {
      await deleteMutation.mutateAsync({ url })
    },
    [deleteMutation]
  )

  return {
    uploadImage,
    deleteImage,
    uploading: uploading || uploadMutation.isPending,
    deleting: deleteMutation.isPending,
    uploadError: uploadMutation.error,
    deleteError: deleteMutation.error,
  }
}

