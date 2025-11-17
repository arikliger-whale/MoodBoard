/**
 * Color Validation Schemas
 * Zod schemas for Color CRUD operations
 */

import { z } from 'zod'
import { localizedStringSchema } from './style'

// Color Category Schema
export const colorCategorySchema = z.enum(['neutral', 'accent', 'semantic'])

// Color Role Schema (for semantic colors)
export const colorRoleSchema = z.enum(['primary', 'secondary', 'success', 'warning', 'error']).optional()

// Create Color Schema
export const createColorSchema = z.object({
  name: localizedStringSchema,
  description: localizedStringSchema.optional(),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format'),
  pantone: z.string().optional(),
  category: colorCategorySchema,
  role: colorRoleSchema,
})

// Update Color Schema
export const updateColorSchema = createColorSchema.partial()

// Color Filters Schema
export const colorFiltersSchema = z.object({
  search: z.string().optional(),
  category: colorCategorySchema.optional(),
  organizationId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(500).default(20), // Increased to 500 for dropdowns
})

// Export types
export type ColorCategory = z.infer<typeof colorCategorySchema>
export type ColorRole = z.infer<typeof colorRoleSchema>
export type CreateColor = z.infer<typeof createColorSchema>
export type UpdateColor = z.infer<typeof updateColorSchema>
export type ColorFilters = z.infer<typeof colorFiltersSchema>

