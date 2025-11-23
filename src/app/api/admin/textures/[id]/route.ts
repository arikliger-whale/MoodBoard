/**
 * Texture Detail API Route
 * GET /api/admin/textures/[id] - Get single texture
 * PUT /api/admin/textures/[id] - Update texture
 * DELETE /api/admin/textures/[id] - Delete texture
 */

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Update texture schema
const updateTextureSchema = z.object({
  name: z.object({
    he: z.string().min(1),
    en: z.string().min(1),
  }).optional(),
  description: z.object({
    he: z.string().optional(),
    en: z.string().optional(),
  }).optional(),
  materialCategoryIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})

/**
 * GET /api/admin/textures/[id]
 * Get single texture with usage info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const texture = await prisma.texture.findUnique({
      where: { id: params.id },
      include: {
        materialCategories: {
          include: {
            materialCategory: true,
          },
        },
        styleLinks: {
          include: {
            style: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: { styleLinks: true },
        },
      },
    })

    if (!texture) {
      return NextResponse.json(
        { error: 'Texture not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(texture)
  } catch (error) {
    console.error('GET /api/admin/textures/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch texture' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/textures/[id]
 * Update texture
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = updateTextureSchema.parse(body)

    // Build update data object
    const updateData: any = {}

    if (data.name) updateData.name = data.name
    if (data.description) updateData.description = data.description
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl === '' ? null : data.imageUrl
    if (data.tags) updateData.tags = data.tags
    if (data.metadata) updateData.metadata = data.metadata

    // Handle material categories update
    if (data.materialCategoryIds) {
      // Delete existing categories and create new ones
      await prisma.textureMaterialCategory.deleteMany({
        where: { textureId: params.id },
      })

      updateData.materialCategories = {
        create: data.materialCategoryIds.map((categoryId) => ({
          materialCategoryId: categoryId,
        })),
      }
    }

    const texture = await prisma.texture.update({
      where: { id: params.id },
      data: updateData,
      include: {
        materialCategories: {
          include: {
            materialCategory: true,
          },
        },
      },
    })

    return NextResponse.json(texture)
  } catch (error) {
    console.error('PUT /api/admin/textures/[id] error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update texture' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/textures/[id]
 * Delete texture
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if texture is used by any styles
    const usageCount = await prisma.styleTexture.count({
      where: { textureId: params.id },
    })

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete texture',
          message: `This texture is used by ${usageCount} style(s). Remove it from all styles first.`,
        },
        { status: 400 }
      )
    }

    await prisma.texture.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/textures/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete texture' },
      { status: 500 }
    )
  }
}
