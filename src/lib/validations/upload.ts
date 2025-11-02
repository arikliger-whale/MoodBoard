/**
 * Upload Validation Schemas
 * Zod schemas for file upload operations
 */

import { z } from 'zod'

// Allowed image MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const

// Max file size: 10MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

// Entity types that support image uploads
export const ENTITY_TYPES = ['category', 'subcategory', 'style', 'room', 'material'] as const

export type EntityType = (typeof ENTITY_TYPES)[number]

/**
 * Image upload request schema
 */
export const imageUploadSchema = z.object({
  entityType: z.enum(ENTITY_TYPES, {
    errorMap: () => ({ message: 'Invalid entity type' }),
  }),
  entityId: z.string().min(1, 'Entity ID is required'),
  projectId: z.string().optional(), // Required for room type
  roomId: z.string().optional(), // Required for room type
  roomType: z.string().optional(), // For room profiles within styles
})

export type ImageUploadRequest = z.infer<typeof imageUploadSchema>

/**
 * Image delete request schema
 */
export const imageDeleteSchema = z.object({
  url: z.string().url('Invalid image URL'),
})

export type ImageDeleteRequest = z.infer<typeof imageDeleteSchema>

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    }
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    }
  }

  return { valid: true }
}

/**
 * Multiple images schema (for forms)
 */
export const imagesSchema = z.array(z.string().url()).max(20, 'Maximum 20 images allowed').default([])

export type Images = z.infer<typeof imagesSchema>

