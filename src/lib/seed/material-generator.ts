/**
 * Phase 2: Material Generator Module
 *
 * Generates Material database entities AND images for styles:
 * 1. Parse required materials from AI content
 * 2. Find or create Material entities with deduplication by name
 * 3. Link materials to textures when possible
 * 4. Generate high-quality material close-up images
 * 5. Create StyleImage records with MATERIAL category
 * 6. Create StyleMaterial links for style-level material associations
 */

import { PrismaClient, ImageCategory } from '@prisma/client'
import { generateAndUploadImages } from '@/lib/ai/image-generation'
import crypto from 'crypto'

const prisma = new PrismaClient()

/**
 * English to Hebrew material name translations
 */
const MATERIAL_TRANSLATIONS: Record<string, string> = {
  // Woods
  'wood': 'עץ',
  'oak': 'אלון',
  'oak wood': 'עץ אלון',
  'walnut': 'אגוז',
  'walnut wood': 'עץ אגוז',
  'maple': 'מייפל',
  'teak': 'טיק',
  'pine': 'אורן',
  'mahogany': 'מהגוני',
  'cherry': 'דובדבן',
  'veneer': 'פורניר',

  // Metals
  'metal': 'מתכת',
  'steel': 'פלדה',
  'iron': 'ברזל',
  'wrought iron': 'ברזל יצוק',
  'brass': 'פליז',
  'brass fixtures': 'אביזרי פליז',
  'copper': 'נחושת',
  'bronze': 'ארד',
  'aluminum': 'אלומיניום',
  'nickel': 'ניקל',
  'chrome': 'כרום',
  'gold': 'זהב',
  'gold leaf': 'עלי זהב',
  'silver': 'כסף',
  'silver leaf': 'עלי כסף',

  // Stones
  'stone': 'אבן',
  'marble': 'שיש',
  'carrara marble': 'שיש קררה',
  'marble countertops': 'משטחי שיש',
  'granite': 'גרניט',
  'limestone': 'אבן גיר',
  'limestone flooring': 'ריצוף אבן גיר',
  'travertine': 'טרוורטין',
  'concrete': 'בטון',
  'terrazzo': 'טראצו',

  // Fabrics
  'fabric': 'בד',
  'cotton': 'כותנה',
  'cotton fabric': 'בד כותנה',
  'linen': 'פשתן',
  'linen fabric': 'בד פשתן',
  'silk': 'משי',
  'silk fabric': 'בד משי',
  'velvet': 'קטיפה',
  'velvet fabric': 'בד קטיפה',
  'leather': 'עור',
  'suede': 'זמש',
  'wool': 'צמר',
  'wool rug': 'שטיח צמר',
  'upholstery fabrics': 'בדי ריפוד',
  'lace': 'תחרה',

  // Wall finishes
  'paint': 'צבע',
  'water-based paint': 'צבע מים',
  'plaster': 'טיח',
  'venetian plaster': 'טיח ונציאני',
  'wallpaper': 'טפט',
  'stucco': 'סטוקו',
  'gypsum': 'גבס',

  // Ceramics & tiles
  'ceramic': 'קרמיקה',
  'ceramics': 'קרמיקה',
  'porcelain': 'פורצלן',
  'porcelain tiles': 'אריחי פורצלן',
  'terracotta': 'טרקוטה',
  'tile': 'אריח',
  'tiles': 'אריחים',

  // Glass & mirrors
  'glass': 'זכוכית',
  'mirror': 'מראה',
  'mirrors': 'מראות',
  'crystal': 'קריסטל',
  'crystal chandelier': 'נברשת קריסטל',
}

/**
 * Get Hebrew translation for material name
 */
export function getMaterialNameHebrew(englishName: string): string {
  const nameLower = englishName.toLowerCase().trim()

  // Direct match
  if (MATERIAL_TRANSLATIONS[nameLower]) {
    return MATERIAL_TRANSLATIONS[nameLower]
  }

  // Try partial match
  for (const [en, he] of Object.entries(MATERIAL_TRANSLATIONS)) {
    if (nameLower.includes(en) || en.includes(nameLower)) {
      return he
    }
  }

  // Return English name as fallback
  return englishName
}

/**
 * Material keyword to category mapping (same as texture-generator)
 */
const MATERIAL_TO_CATEGORY: Record<string, string> = {
  // Wall finishes
  'paint': 'wall-finishes',
  'plaster': 'wall-finishes',
  'wallpaper': 'wall-finishes',
  'stucco': 'wall-finishes',

  // Wood
  'wood': 'wood-finishes',
  'oak': 'wood-finishes',
  'walnut': 'wood-finishes',
  'maple': 'wood-finishes',
  'teak': 'wood-finishes',
  'pine': 'wood-finishes',
  'mahogany': 'wood-finishes',
  'cherry': 'wood-finishes',
  'veneer': 'wood-finishes',

  // Metal
  'metal': 'metal-finishes',
  'steel': 'metal-finishes',
  'iron': 'metal-finishes',
  'brass': 'metal-finishes',
  'copper': 'metal-finishes',
  'bronze': 'metal-finishes',
  'aluminum': 'metal-finishes',
  'nickel': 'metal-finishes',
  'chrome': 'metal-finishes',

  // Fabric
  'fabric': 'fabric-textures',
  'cotton': 'fabric-textures',
  'linen': 'fabric-textures',
  'silk': 'fabric-textures',
  'velvet': 'fabric-textures',
  'leather': 'fabric-textures',
  'suede': 'fabric-textures',
  'wool': 'fabric-textures',

  // Stone
  'stone': 'stone-finishes',
  'marble': 'stone-finishes',
  'granite': 'stone-finishes',
  'limestone': 'stone-finishes',
  'travertine': 'stone-finishes',
  'concrete': 'stone-finishes',
  'terrazzo': 'stone-finishes',
}

/**
 * Infer category slug from material name
 */
export function inferMaterialCategory(materialName: string): string {
  const nameLower = materialName.toLowerCase()

  for (const [keyword, category] of Object.entries(MATERIAL_TO_CATEGORY)) {
    if (nameLower.includes(keyword)) {
      return category
    }
  }

  return 'wall-finishes' // Default fallback
}

export interface MaterialSpec {
  name: string
  nameHe?: string
  categorySlug?: string
  priceLevel?: 'REGULAR' | 'LUXURY'
}

/**
 * Find or create a Material entity
 * Deduplication: By NAME only (localized - checks both he and en)
 */
export async function findOrCreateMaterial(
  spec: MaterialSpec,
  options: {
    organizationId?: string
    generateImage?: boolean
    styleId?: string // If provided, will also create StyleMaterial link
  } = {}
): Promise<string> {
  const { name, nameHe, priceLevel = 'REGULAR' } = spec
  const categorySlug = spec.categorySlug || inferMaterialCategory(name)

  try {
    // Try to find existing material by NAME ONLY (deduplication by localized name)
    const existing = await prisma.material.findFirst({
      where: {
        OR: [
          { name: { is: { en: name } } },
          { name: { is: { he: nameHe || name } } },
          // Also check case-insensitive contains for partial matches
          { name: { is: { en: { contains: name, mode: 'insensitive' } } } },
        ]
      }
    })

    if (existing) {
      console.log(`   ♻️  Reusing existing material: ${name} (ID: ${existing.id})`)

      // Create StyleMaterial link if styleId provided and not already linked
      if (options.styleId) {
        const existingLink = await prisma.styleMaterial.findUnique({
          where: {
            styleId_materialId: {
              styleId: options.styleId,
              materialId: existing.id
            }
          }
        })

        if (!existingLink) {
          await prisma.styleMaterial.create({
            data: {
              styleId: options.styleId,
              materialId: existing.id,
            }
          })
          console.log(`   🔗 Linked existing material to style`)
        }
      }

      return existing.id
    }

    // Find material category
    const materialCategory = await prisma.materialCategory.findFirst({
      where: { slug: categorySlug }
    })
    const defaultCategory = materialCategory || await prisma.materialCategory.findFirst()

    if (!defaultCategory) {
      console.error(`❌ No material categories exist in database`)
      throw new Error(`No material categories exist in database`)
    }

    // Try to find a matching texture by name (for textureId link)
    const matchingTexture = await prisma.texture.findFirst({
      where: {
        OR: [
          { name: { is: { en: { contains: name, mode: 'insensitive' } } } },
          { name: { is: { he: { contains: nameHe || name, mode: 'insensitive' } } } },
        ]
      }
    })

    if (matchingTexture) {
      console.log(`   🔗 Found matching texture: ${matchingTexture.id}`)
    }

    // Generate image if requested
    let imageUrl: string | undefined
    if (options.generateImage) {
      try {
        console.log(`   🎨 Generating material image...`)
        const images = await generateAndUploadImages({
          entityType: 'material',
          entityName: { he: nameHe || name, en: name },
          priceLevel,
          numberOfImages: 1,
          aspectRatio: '1:1',
        })

        if (images.length > 0) {
          imageUrl = images[0]
          console.log(`   ✅ Material image generated: ${imageUrl}`)
        }
      } catch (error) {
        console.error(`   ⚠️  Failed to generate material image:`, error)
        // Continue without image
      }
    }

    // Create new Material entity (AI-generated = isAbstract: true)
    console.log(`   ✨ Creating new material: ${name}`)

    const material = await prisma.material.create({
      data: {
        organizationId: options.organizationId || null,
        sku: `AI-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        name: { he: nameHe || name, en: name },
        categoryId: defaultCategory.id,
        textureId: matchingTexture?.id || null, // Link to matching texture
        isAbstract: true, // Mark as AI-generated
        generationStatus: 'COMPLETED',
        aiDescription: `AI-generated material: ${name}`,
        properties: {
          typeId: '',
          subType: name,
          finish: [],
          texture: 'Generated',
          colorIds: [],
          technical: { durability: 5, maintenance: 5, sustainability: 5 }
        },
        pricing: { cost: 0, retail: 0, unit: 'm2', currency: 'ILS', bulkDiscounts: [] },
        availability: { inStock: false, leadTime: 0, minOrder: 0 },
        assets: {
          thumbnail: imageUrl || '',
          images: imageUrl ? [imageUrl] : []
        }
      }
    })

    console.log(`   ✅ Created material: ${material.id} (category: ${defaultCategory.slug || defaultCategory.id})`)

    // Create StyleMaterial link if styleId provided
    if (options.styleId) {
      await prisma.styleMaterial.create({
        data: {
          styleId: options.styleId,
          materialId: material.id,
        }
      })
      console.log(`   🔗 Linked material to style`)
    }

    return material.id

  } catch (error) {
    console.error(`❌ Error creating material:`, error)
    throw error
  }
}

/**
 * Find or create multiple materials for a style
 */
export async function findOrCreateMaterialsForStyle(
  styleId: string,
  materialNames: string[],
  options: {
    organizationId?: string
    generateImages?: boolean
    priceLevel?: 'REGULAR' | 'LUXURY'
    maxMaterials?: number
  } = {}
): Promise<string[]> {
  const { maxMaterials = 10, priceLevel = 'REGULAR' } = options
  const materialIds: string[] = []

  console.log(`\n🧱 Creating materials for style ${styleId}...`)
  console.log(`   Materials to process: ${materialNames.length}`)

  // Limit to maxMaterials
  const materialsToCreate = materialNames.slice(0, maxMaterials)

  for (const materialName of materialsToCreate) {
    try {
      // Get Hebrew translation for material name
      const nameHe = getMaterialNameHebrew(materialName)

      const materialId = await findOrCreateMaterial(
        { name: materialName, nameHe, priceLevel },
        {
          organizationId: options.organizationId,
          generateImage: options.generateImages,
          styleId, // This will create StyleMaterial link
        }
      )
      materialIds.push(materialId)

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`   ⚠️  Failed to create/link material "${materialName}":`, error)
      // Continue with next material
    }
  }

  console.log(`   ✅ Created/linked ${materialIds.length} materials`)
  return materialIds
}

/**
 * Get linked materials for a style
 */
export async function getStyleMaterials(styleId: string) {
  return await prisma.styleMaterial.findMany({
    where: { styleId },
    include: {
      material: {
        include: {
          category: true,
          texture: true,
        }
      }
    }
  })
}

export interface MaterialImageOptions {
  styleId: string
  styleName: { he: string; en: string }
  requiredMaterials: string[] // From AI factual details
  priceLevel: 'REGULAR' | 'LUXURY'
  maxImages?: number
  tags?: string[]
}

/**
 * Generate material close-up images for a style
 */
export async function generateMaterialImages(
  options: MaterialImageOptions
): Promise<string[]> {
  const {
    styleId,
    styleName,
    requiredMaterials,
    priceLevel,
    maxImages = 5,
    tags = [],
  } = options

  console.log(`\n🔬 Generating MATERIAL images for style: ${styleName.en}`)
  console.log(`   Required Materials: ${requiredMaterials.length}`)
  console.log(`   Price Level: ${priceLevel}`)
  console.log(`   Max Images: ${maxImages}`)

  const createdImageUrls: string[] = []

  // Select most important materials (up to maxImages)
  const materialsToGenerate = requiredMaterials.slice(0, maxImages)

  for (let i = 0; i < materialsToGenerate.length; i++) {
    const material = materialsToGenerate[i]

    try {
      console.log(`\n   📸 Generating material ${i + 1}/${materialsToGenerate.length}: ${material}`)

      // Generate material close-up image
      const imageUrls = await generateAndUploadImages({
        entityType: 'material',
        entityName: {
          he: material, // TODO: Add Hebrew translation
          en: material
        },
        description: {
          he: `חומר: ${material}`,
          en: `Material: ${material}`
        },
        priceLevel,
        numberOfImages: 1,
        aspectRatio: '1:1', // Square for material library
      })

      if (imageUrls.length > 0) {
        const imageUrl = imageUrls[0]

        // Create StyleImage record
        const styleImage = await prisma.styleImage.create({
          data: {
            styleId,
            url: imageUrl,
            imageCategory: 'MATERIAL' as ImageCategory,
            displayOrder: i,
            description: `${material} material close-up`,
            tags: [priceLevel, material.toLowerCase(), ...tags],
          }
        })

        createdImageUrls.push(imageUrl)
        console.log(`   ✅ Material image created: ${styleImage.id}`)
      }

      // Add delay to avoid rate limiting
      if (i < materialsToGenerate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

    } catch (error) {
      console.error(`   ❌ Failed to generate material image for "${material}":`, error)
      // Continue with next material
    }
  }

  console.log(`   ✅ Generated ${createdImageUrls.length} material images`)
  return createdImageUrls
}

/**
 * Get material images for a style
 */
export async function getStyleMaterialImages(styleId: string) {
  return await prisma.styleImage.findMany({
    where: {
      styleId,
      imageCategory: 'MATERIAL'
    },
    orderBy: {
      displayOrder: 'asc'
    }
  })
}

/**
 * Delete material image
 */
export async function deleteMaterialImage(imageId: string) {
  await prisma.styleImage.delete({
    where: { id: imageId }
  })
}

/**
 * Update material image metadata
 */
export async function updateMaterialImage(
  imageId: string,
  updates: {
    description?: string
    tags?: string[]
    displayOrder?: number
  }
) {
  return await prisma.styleImage.update({
    where: { id: imageId },
    data: updates
  })
}
