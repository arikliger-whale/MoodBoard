/**
 * Room Category Validation Schemas
 * Handles CRUD validation for room categories (Private, Public, Commercial, etc.)
 */

import { z } from 'zod'
import { localizedStringSchema } from './roomType'

// MongoDB ObjectID validation helper
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectID format')

// Create Room Category Schema (API)
export const createRoomCategorySchema = z.object({
  name: localizedStringSchema,
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: localizedStringSchema.optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
})

// Update Room Category Schema (API)
export const updateRoomCategorySchema = z.object({
  name: localizedStringSchema.optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format').optional(),
  description: localizedStringSchema.optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

// Client Form Schema
export const createRoomCategoryFormSchema = createRoomCategorySchema
export const updateRoomCategoryFormSchema = createRoomCategoryFormSchema.partial()

// Types
export type CreateRoomCategory = z.infer<typeof createRoomCategorySchema>
export type UpdateRoomCategory = z.infer<typeof updateRoomCategorySchema>
