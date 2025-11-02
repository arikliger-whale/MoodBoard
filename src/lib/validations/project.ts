/**
 * Project Validation Schemas
 * Zod schemas for project CRUD operations
 */

import { z } from 'zod'

/**
 * Project Status Enum
 */
export const projectStatusSchema = z.enum([
  'draft',
  'active',
  'review',
  'approved',
  'completed',
  'archived',
])

export type ProjectStatus = z.infer<typeof projectStatusSchema>

/**
 * Room Type Enum
 */
export const roomTypeSchema = z.enum([
  'living',
  'dining',
  'kitchen',
  'bedroom',
  'bathroom',
  'office',
  'entrance',
  'hallway',
  'balcony',
  'storage',
  'other',
])

export type RoomType = z.infer<typeof roomTypeSchema>

/**
 * Dimensions Schema
 */
export const dimensionsSchema = z.object({
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  unit: z.string().default('m'),
})

export type Dimensions = z.infer<typeof dimensionsSchema>

/**
 * Room Schema
 */
export const roomSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  type: roomTypeSchema,
  dimensions: dimensionsSchema.optional(),
})

export type Room = z.infer<typeof roomSchema>

/**
 * Budget Range Schema
 */
export const budgetRangeSchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0),
}).refine((data) => data.max >= data.min, {
  message: 'Max budget must be greater than or equal to min budget',
  path: ['max'],
})

export type BudgetRange = z.infer<typeof budgetRangeSchema>

/**
 * Budget Schema
 */
export const budgetSchema = z.object({
  currency: z.string().length(3).default('ILS'),
  target: budgetRangeSchema,
  allocated: z.number().min(0).default(0),
  spent: z.number().min(0).default(0),
})

export type Budget = z.infer<typeof budgetSchema>

/**
 * Timeline Schema
 */
export const timelineSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  milestones: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    date: z.string().datetime(),
    completed: z.boolean().default(false),
  })).optional(),
})

export type Timeline = z.infer<typeof timelineSchema>

/**
 * Create Project Schema
 */
export const createProjectSchema = z.object({
  name: z.string().min(1, 'שם הפרויקט הוא שדה חובה').max(200),
  slug: z.string().min(1).max(200).optional(),
  clientId: z.string().min(1, 'לקוח הוא שדה חובה'),
  status: projectStatusSchema.default('draft'),
  rooms: z.array(roomSchema).optional(),
  budget: budgetSchema.optional(),
  timeline: timelineSchema.optional(),
  description: z.string().max(2000).optional(),
})

export type CreateProject = z.infer<typeof createProjectSchema>

/**
 * Update Project Schema (partial)
 */
export const updateProjectSchema = createProjectSchema.partial().omit({ clientId: true })

export type UpdateProject = z.infer<typeof updateProjectSchema>

/**
 * Project Filters Schema
 */
export const projectFiltersSchema = z.object({
  search: z.string().optional(),
  clientId: z.string().optional(),
  status: z.array(projectStatusSchema).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export type ProjectFilters = z.infer<typeof projectFiltersSchema>

/**
 * Status Update Schema
 */
export const updateProjectStatusSchema = z.object({
  status: projectStatusSchema,
  reason: z.string().max(500).optional(),
})

export type UpdateProjectStatus = z.infer<typeof updateProjectStatusSchema>
