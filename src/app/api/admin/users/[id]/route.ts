/**
 * Admin Users API - Single User
 * GET /api/admin/users/[id] - Get single user (admin only)
 * PATCH /api/admin/users/[id] - Update user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAdmin, handleError, validateRequest } from '@/lib/api/admin-middleware'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'designer_owner', 'designer_member', 'client', 'supplier']).nullable().optional(),
  organizationId: z.string().nullable().optional(),
  permissions: z.array(z.string()).optional(),
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
})

/**
 * GET /api/admin/users/[id] - Get single user
 */
export const GET = withAdmin(async (req: NextRequest, auth) => {
  try {
    // Get user ID from URL
    const url = new URL(req.url)
    const userId = url.pathname.split('/').pop()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            createdProjects: true,
            comments: true,
            approvals: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * PATCH /api/admin/users/[id] - Update user
 */
export const PATCH = withAdmin(async (req: NextRequest, auth) => {
  try {
    // Get user ID from URL
    const url = new URL(req.url)
    const userId = url.pathname.split('/').pop()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate request body
    const body = await validateRequest(req, updateUserSchema)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify organization exists if provided
    if (body.organizationId !== undefined && body.organizationId !== null) {
      const organization = await prisma.organization.findUnique({
        where: { id: body.organizationId },
      })

      if (!organization) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        )
      }
    }

    // Check if email is already taken by another user
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.email !== undefined) updateData.email = body.email
    if (body.role !== undefined) updateData.role = body.role
    if (body.organizationId !== undefined) updateData.organizationId = body.organizationId
    if (body.permissions !== undefined) updateData.permissions = body.permissions

    // Handle profile updates
    if (body.profile) {
      const currentProfile = existingUser.profile as any || {}
      updateData.profile = {
        ...currentProfile,
        ...(body.profile.firstName !== undefined && { firstName: body.profile.firstName }),
        ...(body.profile.lastName !== undefined && { lastName: body.profile.lastName }),
        ...(body.profile.email !== undefined && { email: body.profile.email }),
        ...(body.profile.phone !== undefined && { phone: body.profile.phone }),
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            createdProjects: true,
            comments: true,
            approvals: true,
          },
        },
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    return handleError(error)
  }
})

