/**
 * Category & SubCategory Validation Schemas
 * Zod schemas for category and sub-category CRUD operations
 */

import { z } from 'zod'

// LocalizedString schema
const localizedStringSchema = z.object({
  he: z.string().min(1, 'Hebrew name is required'),
  en: z.string().min(1, 'English name is required'),
})

// Category schemas
export const createCategorySchema = z.object({
  name: localizedStringSchema,
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  order: z.number().int().min(0).default(0),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategory = z.infer<typeof createCategorySchema>
export type UpdateCategory = z.infer<typeof updateCategorySchema>

// SubCategory schemas
export const createSubCategorySchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
  name: localizedStringSchema,
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  order: z.number().int().min(0).default(0),
})

export const updateSubCategorySchema = createSubCategorySchema.partial().omit({ categoryId: true })

export type CreateSubCategory = z.infer<typeof createSubCategorySchema>
export type UpdateSubCategory = z.infer<typeof updateSubCategorySchema>

