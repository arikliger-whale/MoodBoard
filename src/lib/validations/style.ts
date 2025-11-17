import { z } from 'zod'
import { clientImagesSchema, serverImagesSchema } from './upload'
import { localizedStringSchema } from './approach'

// MongoDB ObjectID validation helper
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectID format')

// Texture Reference Schema
export const textureReferenceSchema = z.object({
  type: z.string().min(1, 'Type is required'), // "flooring", "marble", "wood", etc.
  materialId: objectIdSchema.optional(),
  name: z.string().optional(),
})

// Style Product Reference Schema
export const styleProductReferenceSchema = z.object({
  category: z.string().min(1, 'Category is required'), // "lighting", "furniture", "sofas", etc.
  productId: objectIdSchema.optional(),
  name: z.string().optional(),
})

// Room Constraint Schema
export const roomConstraintSchema = z.object({
  waterResistance: z.boolean().optional(),
  durability: z.number().int().min(1).max(10).optional(),
  maintenance: z.number().int().min(1).max(10).optional(),
})

// Room Profile Schema (for client-side forms - allows blob URLs for preview)
export const roomProfileSchema = z.object({
  roomTypeId: objectIdSchema,
  description: localizedStringSchema.optional(),
  colors: z.array(objectIdSchema).optional().default([]),
  textures: z.array(textureReferenceSchema).optional().default([]),
  materials: z.array(objectIdSchema).optional().default([]),
  products: z.array(styleProductReferenceSchema).optional().default([]),
  images: clientImagesSchema.optional(),
  constraints: roomConstraintSchema.nullable().optional(),
})

// Room Profile Schema for API (server-side - only HTTPS URLs)
export const roomProfileApiSchema = z.object({
  roomTypeId: objectIdSchema,
  description: localizedStringSchema.optional(),
  colors: z.array(objectIdSchema).optional().default([]),
  textures: z.array(textureReferenceSchema).optional().default([]),
  materials: z.array(objectIdSchema).optional().default([]),
  products: z.array(styleProductReferenceSchema).optional().default([]),
  images: serverImagesSchema.optional(),
  constraints: roomConstraintSchema.nullable().optional(),
})

// AI Selection Schema (for tracking AI-generated style decisions)
export const aiSelectionSchema = z.object({
  approachConfidence: z.number().min(0).max(1), // AI confidence score (0.0-1.0)
  reasoning: localizedStringSchema, // Why this approach/color was chosen
})

// Style Metadata Schema
export const styleMetadataSchema = z.object({
  version: z.string().default('1.0.0'),
  isPublic: z.boolean().default(false),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).nullable().optional(),
  approvedBy: z.string().nullable().optional(),
  approvedAt: z.date().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  usage: z.number().int().default(0),
  rating: z.number().min(0).max(5).nullable().optional(),

  // AI Generation tracking
  aiGenerated: z.boolean().default(false).optional(),
  aiSelection: aiSelectionSchema.nullable().optional(),
})

// Create Style Schema (API - only accepts HTTPS URLs)
export const createStyleSchema = z.object({
  name: localizedStringSchema,
  description: localizedStringSchema.optional(),
  categoryId: objectIdSchema,
  subCategoryId: objectIdSchema,
  approachId: objectIdSchema,
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format').optional(),
  colorId: objectIdSchema,
  images: serverImagesSchema.optional(),
  roomProfiles: z.array(roomProfileApiSchema).optional().default([]),
  metadata: styleMetadataSchema.optional(),
})

// Update Style Schema (API - only accepts HTTPS URLs)
export const updateStyleSchema = z.object({
  name: localizedStringSchema.optional(),
  description: localizedStringSchema.optional(),
  categoryId: objectIdSchema.optional(),
  subCategoryId: objectIdSchema.optional(),
  approachId: objectIdSchema.optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format').optional(),
  colorId: objectIdSchema.optional(),
  images: serverImagesSchema.optional(),
  roomProfiles: z.array(roomProfileApiSchema).optional(),
  metadata: styleMetadataSchema.partial().optional(),
})

// Create Style Schema for client forms (allows blob URLs for preview)
export const createStyleFormSchema = z.object({
  name: localizedStringSchema,
  description: localizedStringSchema.optional(),
  categoryId: objectIdSchema,
  subCategoryId: objectIdSchema,
  approachId: objectIdSchema,
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format').optional(),
  colorId: objectIdSchema,
  images: clientImagesSchema.optional(),
  roomProfiles: z.array(roomProfileSchema).optional().default([]),
  metadata: styleMetadataSchema.optional(),
})

// Style Filters Schema
export const styleFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  approachId: z.string().optional(),
  colorId: z.string().optional(),
  scope: z.enum(['global', 'public', 'personal', 'all']).optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// Approve/Reject Style Schema
export const approveStyleSchema = z.object({
  approved: z.boolean(),
  rejectionReason: z.string().optional(),
})

// Export types
export type AISelection = z.infer<typeof aiSelectionSchema>
export type TextureReference = z.infer<typeof textureReferenceSchema>
export type StyleProductReference = z.infer<typeof styleProductReferenceSchema>
export type RoomConstraint = z.infer<typeof roomConstraintSchema>
export type RoomProfile = z.infer<typeof roomProfileSchema>
export type CreateStyle = z.infer<typeof createStyleSchema>
export type UpdateStyle = z.infer<typeof updateStyleSchema>
export type StyleFilters = z.infer<typeof styleFiltersSchema>
export type ApproveStyle = z.infer<typeof approveStyleSchema>

export { localizedStringSchema } from './approach'

