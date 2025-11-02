/**
 * Admin Materials API - Single Material
 * GET /api/admin/materials/[id] - Get material
 * PATCH /api/admin/materials/[id] - Update material
 * DELETE /api/admin/materials/[id] - Delete material
 */

import { handleError, validateRequest, withAdmin } from '@/lib/api/admin-middleware'
import { prisma } from '@/lib/db'
import { updateMaterialSchema } from '@/lib/validations/material'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Helper function to validate ObjectID format
 */
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * GET /api/admin/materials/[id] - Get material
 */
export const GET = withAdmin(async (req: NextRequest, auth) => {
  try {
    const url = new URL(req.url)
    const materialId = url.pathname.split('/').pop()

    if (!materialId) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 })
    }

    // Validate ObjectID format
    if (!isValidObjectId(materialId)) {
      return NextResponse.json(
        { error: 'Invalid material ID format' },
        { status: 400 }
      )
    }

    const material = await prisma.material.findFirst({
      where: {
        id: materialId,
        organizationId: auth.organizationId,
      },
    })

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    return NextResponse.json(material)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * PATCH /api/admin/materials/[id] - Update material
 */
export const PATCH = withAdmin(async (req: NextRequest, auth) => {
  try {
    const url = new URL(req.url)
    const materialId = url.pathname.split('/').pop()

    if (!materialId) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 })
    }

    // Validate ObjectID format
    if (!isValidObjectId(materialId)) {
      return NextResponse.json(
        { error: 'Invalid material ID format' },
        { status: 400 }
      )
    }

    // Validate request body
    const body = await validateRequest(req, updateMaterialSchema)

    // Check if material exists and belongs to user's organization
    const existingMaterial = await prisma.material.findFirst({
      where: {
        id: materialId,
        organizationId: auth.organizationId,
      },
    })

    if (!existingMaterial) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    // Validate colorIds if provided
    if (body.properties?.colorIds && body.properties.colorIds.length > 0) {
      const colors = await prisma.color.findMany({
        where: {
          id: { in: body.properties.colorIds },
          organizationId: auth.organizationId,
        },
      })

      if (colors.length !== body.properties.colorIds.length) {
        return NextResponse.json(
          { error: 'One or more color IDs are invalid or do not belong to your organization' },
          { status: 400 }
        )
      }
    }

    // Check if SKU is being updated and if it conflicts within the organization
    if (body.sku && body.sku !== existingMaterial.sku) {
      const skuConflict = await prisma.material.findFirst({
        where: {
          sku: body.sku.toUpperCase(),
          organizationId: auth.organizationId,
          id: { not: materialId },
        },
      })

      if (skuConflict) {
        return NextResponse.json(
          { error: 'Material with this SKU already exists in your organization' },
          { status: 409 }
        )
      }
    }

    // Update material
    const material = await prisma.material.update({
      where: { id: materialId },
      data: {
        ...(body.sku && { sku: body.sku.toUpperCase() }),
        ...(body.name && { name: body.name }),
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.properties && { properties: body.properties as any }),
        ...(body.pricing && { pricing: body.pricing as any }),
        ...(body.availability && { availability: body.availability as any }),
        ...(body.assets !== undefined && { assets: body.assets as any }),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(material)
  } catch (error) {
    return handleError(error)
  }
})

/**
 * DELETE /api/admin/materials/[id] - Delete material
 */
export const DELETE = withAdmin(async (req: NextRequest, auth) => {
  try {
    const url = new URL(req.url)
    const materialId = url.pathname.split('/').pop()

    if (!materialId) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 })
    }

    // Validate ObjectID format
    if (!isValidObjectId(materialId)) {
      return NextResponse.json(
        { error: 'Invalid material ID format' },
        { status: 400 }
      )
    }

    // Check if material exists and belongs to user's organization
    const existingMaterial = await prisma.material.findFirst({
      where: {
        id: materialId,
        organizationId: auth.organizationId,
      },
    })

    if (!existingMaterial) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    // TODO: Check if material is used in any styles before deletion
    // For now, allow deletion (we can add usage tracking later)

    // Delete material
    await prisma.material.delete({
      where: { id: materialId },
    })

    return NextResponse.json({ message: 'Material deleted successfully' })
  } catch (error) {
    return handleError(error)
  }
})

