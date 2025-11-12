/**
 * Approach Validation Schemas
 * Handles CRUD validation for style approaches (global entities like אותנטי, פיוזן, etc.)
 */

import { z } from 'zod'
import { clientImagesSchema, serverImagesSchema } from './upload'

// MongoDB ObjectID validation helper
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectID format')

// Localized String Schema
export const localizedStringSchema = z.object({
  he: z.string().min(1, 'Hebrew name is required'),
  en: z.string().min(1, 'English name is required'),
})

// Inspiration Pillars Schema (color/shade palette for this approach)
export const inspirationPillarsSchema = z.object({
  colors: z.array(objectIdSchema).optional().default([]),
  shades: z.array(objectIdSchema).optional().default([]),
})

// Approach Metadata Schema
export const approachMetadataSchema = z.object({
  isDefault: z.boolean().default(false),
  version: z.string().default('1.0.0'),
  tags: z.array(z.string()).default([]),
  usage: z.number().int().default(0),
})

// Create Approach Schema (API - only accepts HTTPS URLs)
export const createApproachSchema = z.object({
  name: localizedStringSchema,
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  order: z.number().int().min(0).default(0),
  description: localizedStringSchema.optional(),
  images: serverImagesSchema.optional(),
  inspirationPillars: inspirationPillarsSchema.optional(),
  metadata: approachMetadataSchema.optional(),
})

// Update Approach Schema (API)
export const updateApproachSchema = z.object({
  name: localizedStringSchema.optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format').optional(),
  order: z.number().int().min(0).optional(),
  description: localizedStringSchema.optional(),
  images: serverImagesSchema.optional(),
  inspirationPillars: inspirationPillarsSchema.optional(),
  metadata: approachMetadataSchema.partial().optional(),
})

// Client Form Schema (allows blob URLs for preview images)
export const createApproachFormSchema = z.object({
  name: localizedStringSchema,
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  order: z.number().int().min(0).default(0),
  description: localizedStringSchema.optional(),
  images: clientImagesSchema.optional(),
  inspirationPillars: inspirationPillarsSchema.optional(),
  metadata: approachMetadataSchema.optional(),
})

export const updateApproachFormSchema = createApproachFormSchema.partial()

// Types
export type InspirationPillars = z.infer<typeof inspirationPillarsSchema>
export type ApproachMetadata = z.infer<typeof approachMetadataSchema>
export type CreateApproach = z.infer<typeof createApproachSchema>
export type UpdateApproach = z.infer<typeof updateApproachSchema>

