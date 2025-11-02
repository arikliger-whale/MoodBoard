/**
 * Client Validation Schemas
 */

import { z } from 'zod'

/**
 * Predefined client tags
 */
export const PREDEFINED_TAGS = [
  'residential',
  'commercial',
  'vip',
  'high-priority',
  'returning',
  'renovation',
  'new-build',
  'budget-conscious',
  'luxury',
] as const

/**
 * Contact info schema
 */
export const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
})

/**
 * Client preferences schema (basic MVP)
 */
export const clientPreferencesSchema = z.object({
  favoriteStyles: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  budgetRange: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
    })
    .optional(),
  specialNeeds: z.string().optional(),
})

/**
 * Create client schema
 */
export const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(200),
  contact: contactInfoSchema,
  tags: z.array(z.string()).default([]),
  preferences: clientPreferencesSchema.optional(),
  notes: z
    .array(
      z.object({
        content: z.string(),
        createdBy: z.string(),
      })
    )
    .optional(),
})

/**
 * Update client schema (all fields optional except where noted)
 */
export const updateClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  contact: contactInfoSchema.partial().optional(),
  tags: z.array(z.string()).optional(),
  preferences: clientPreferencesSchema.optional(),
})

/**
 * Add note schema
 */
export const addNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(5000),
})

/**
 * Client query filters
 */
export const clientFiltersSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

/**
 * Type exports
 */
export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type AddNoteInput = z.infer<typeof addNoteSchema>
export type ClientFilters = z.infer<typeof clientFiltersSchema>
