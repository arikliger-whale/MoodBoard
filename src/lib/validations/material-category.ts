/**
 * Material Category & Type Validation Schemas
 * Zod schemas for material category and type CRUD operations
 */

import { z } from 'zod'

// LocalizedString schema
const localizedStringSchema = z.object({
  he: z.string().min(1, 'Hebrew name is required'),
  en: z.string().min(1, 'English name is required'),
})

// Optional LocalizedString schema for descriptions
const optionalLocalizedStringSchema = z.object({
  he: z.string().optional(),
  en: z.string().optional(),
}).refine(
  (data) => {
    if (!data) return true
    const he = data.he?.trim() || ''
    const en = data.en?.trim() || ''
    return !he && !en || he || en
  },
  { message: 'At least one description (Hebrew or English) is required if description is provided' }
).optional()

// Material Category schemas
export const createMaterialCategorySchema = z.object({
  name: localizedStringSchema,
  description: optionalLocalizedStringSchema,
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  order: z.number().int().min(0).default(0),
  icon: z.string().optional(),
})

export const updateMaterialCategorySchema = createMaterialCategorySchema.partial()

export type CreateMaterialCategory = z.infer<typeof createMaterialCategorySchema>
export type UpdateMaterialCategory = z.infer<typeof updateMaterialCategorySchema>

// Material Type schemas
export const createMaterialTypeSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required').regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format'),
  name: localizedStringSchema,
  description: optionalLocalizedStringSchema,
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  order: z.number().int().min(0).default(0),
  icon: z.string().optional(),
})

export const updateMaterialTypeSchema = createMaterialTypeSchema.partial().omit({ categoryId: true })

export type CreateMaterialType = z.infer<typeof createMaterialTypeSchema>
export type UpdateMaterialType = z.infer<typeof updateMaterialTypeSchema>

