/**
 * Style Validation Schemas
 * Zod schemas for Style CRUD operations
 */

import { z } from 'zod'

// Color Token Schema
export const colorTokenSchema = z.object({
  name: z.string().min(1, 'Color name is required'),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format'),
  pantone: z.string().optional(),
})

// Semantic Colors Schema
export const semanticColorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format'),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format').optional(),
  success: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format').optional(),
  warning: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format').optional(),
  error: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format').optional(),
})

// Palette Schema
export const paletteSchema = z.object({
  neutrals: z.array(colorTokenSchema).min(1, 'At least one neutral color is required'),
  accents: z.array(colorTokenSchema).min(1, 'At least one accent color is required'),
  semantic: semanticColorsSchema.optional(),
})

// Material Default Schema
export const materialDefaultSchema = z.object({
  materialId: z.string().min(1, 'Material ID is required'),
  usageArea: z.string().min(1, 'Usage area is required'),
  defaultFinish: z.string().optional(),
  supplierId: z.string().optional(),
})

// Material Alternative Schema
export const materialAlternativeSchema = z.object({
  usageArea: z.string().min(1, 'Usage area is required'),
  alternatives: z.array(z.string()).min(1, 'At least one alternative is required'),
})

// Material Set Schema
export const materialSetSchema = z.object({
  defaults: z.array(materialDefaultSchema).min(1, 'At least one default material is required'),
  alternatives: z.array(materialAlternativeSchema).optional(),
})

// Color Proportion Schema
export const colorProportionSchema = z.object({
  colorRole: z.enum(['neutral', 'accent', 'primary', 'secondary']),
  percentage: z.number().min(0).max(100),
})

// Room Constraint Schema
export const roomConstraintSchema = z.object({
  waterResistance: z.boolean().optional(),
  durability: z.number().int().min(1).max(10).optional(),
  maintenance: z.number().int().min(1).max(10).optional(),
})

// Room Profile Schema
export const roomProfileSchema = z.object({
  roomType: z.string().min(1, 'Room type is required'),
  colorProportions: z.array(colorProportionSchema).optional(),
  materials: z.array(z.string()).optional(),
  constraints: roomConstraintSchema.optional(),
})

// Localized String Schema
export const localizedStringSchema = z.object({
  he: z.string().min(1, 'Hebrew name is required'),
  en: z.string().min(1, 'English name is required'),
})

// Style Metadata Schema
export const styleMetadataSchema = z.object({
  version: z.string().default('1.0.0'),
  isPublic: z.boolean().default(false),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  rejectionReason: z.string().optional(),
  tags: z.array(z.string()).default([]),
  usage: z.number().int().default(0),
  rating: z.number().min(0).max(5).optional(),
})

// Create Style Schema
export const createStyleSchema = z.object({
  name: localizedStringSchema,
  categoryId: z.string().min(1, 'Category ID is required'),
  subCategoryId: z.string().min(1, 'Sub-category ID is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format').optional(),
  palette: paletteSchema,
  materialSet: materialSetSchema,
  roomProfiles: z.array(roomProfileSchema).optional(),
  metadata: styleMetadataSchema.optional(),
})

// Update Style Schema
export const updateStyleSchema = createStyleSchema.partial()

// Style Filters Schema
export const styleFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
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
export type ColorToken = z.infer<typeof colorTokenSchema>
export type SemanticColors = z.infer<typeof semanticColorsSchema>
export type Palette = z.infer<typeof paletteSchema>
export type MaterialDefault = z.infer<typeof materialDefaultSchema>
export type MaterialAlternative = z.infer<typeof materialAlternativeSchema>
export type MaterialSet = z.infer<typeof materialSetSchema>
export type ColorProportion = z.infer<typeof colorProportionSchema>
export type RoomConstraint = z.infer<typeof roomConstraintSchema>
export type RoomProfile = z.infer<typeof roomProfileSchema>
export type LocalizedString = z.infer<typeof localizedStringSchema>
export type StyleMetadata = z.infer<typeof styleMetadataSchema>
export type CreateStyle = z.infer<typeof createStyleSchema>
export type UpdateStyle = z.infer<typeof updateStyleSchema>
export type StyleFilters = z.infer<typeof styleFiltersSchema>
export type ApproveStyle = z.infer<typeof approveStyleSchema>

