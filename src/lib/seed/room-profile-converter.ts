/**
 * Room Profile Converter
 * Converts AI-generated room profiles (with hex colors and material names)
 * to database format (with Color IDs and Material IDs)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Find closest color by hex value
 */
function findClosestColor(hexString: string, colors: any[]): string | null {
  const cleanHex = hexString.toLowerCase().replace(/^#/, '')

  // Try exact match first
  const exactMatch = colors.find(c => c.hex.toLowerCase().replace(/^#/, '') === cleanHex)
  if (exactMatch) return exactMatch.id

  // Convert hex to RGB
  const r1 = parseInt(cleanHex.substring(0, 2), 16)
  const g1 = parseInt(cleanHex.substring(2, 4), 16)
  const b1 = parseInt(cleanHex.substring(4, 6), 16)

  if (isNaN(r1) || isNaN(g1) || isNaN(b1)) {
    console.warn(`⚠️  Invalid hex color: ${hexString}`)
    return null
  }

  // Find closest color using Euclidean distance
  let closestColor: any = null
  let minDistance = Infinity

  for (const color of colors) {
    const hex2 = color.hex.toLowerCase().replace(/^#/, '')
    const r2 = parseInt(hex2.substring(0, 2), 16)
    const g2 = parseInt(hex2.substring(2, 4), 16)
    const b2 = parseInt(hex2.substring(4, 6), 16)

    if (isNaN(r2) || isNaN(g2) || isNaN(b2)) continue

    const distance = Math.sqrt(
      Math.pow(r1 - r2, 2) +
      Math.pow(g1 - g2, 2) +
      Math.pow(b1 - b2, 2)
    )

    if (distance < minDistance) {
      minDistance = distance
      closestColor = color
    }
  }

  if (closestColor && minDistance < 50) {
    return closestColor.id
  }

  console.warn(`⚠️  No close match for color: ${hexString}`)
  return null
}

/**
 * Find material by name using fuzzy matching
 * @param name - Material name to search for
 * @param materials - Array of materials to search in
 * @param options - Optional settings
 * @param options.createIfMissing - If true, create a new material if no match found
 * @param options.priceLevel - Price level for created materials
 */
async function findMaterialByName(
  name: string,
  materials: any[],
  options: {
    createIfMissing?: boolean
    priceLevel?: 'REGULAR' | 'LUXURY'
  } = {}
): Promise<string | null> {
  if (!name || typeof name !== 'string') return null

  const searchName = name.toLowerCase().trim()

  // Try exact match (Hebrew or English)
  for (const material of materials) {
    const hebrewName = material.name.he?.toLowerCase().trim()
    const englishName = material.name.en?.toLowerCase().trim()

    if (hebrewName === searchName || englishName === searchName) {
      return material.id
    }
  }

  // Try fuzzy match using similarity
  let bestMatch: any = null
  let bestScore = 0

  for (const material of materials) {
    const hebrewName = material.name.he?.toLowerCase().trim() || ''
    const englishName = material.name.en?.toLowerCase().trim() || ''

    const hebrewScore = similarity(searchName, hebrewName)
    const englishScore = similarity(searchName, englishName)
    const score = Math.max(hebrewScore, englishScore)

    if (score > bestScore) {
      bestScore = score
      bestMatch = material
    }
  }

  if (bestMatch && bestScore > 0.8) {
    return bestMatch.id
  }

  // Create if missing (opt-in)
  if (options.createIfMissing) {
    console.log(`   ✨ Creating missing material: ${name}`)
    try {
      const { findOrCreateMaterial } = await import('./material-generator')
      const materialId = await findOrCreateMaterial(
        { name, priceLevel: options.priceLevel || 'REGULAR' },
        { generateImage: false } // Don't generate image here
      )
      return materialId
    } catch (error) {
      console.warn(`   ⚠️  Failed to create material: ${name}`, error)
      return null
    }
  }

  console.warn(`⚠️  No match for material: ${name}`)
  return null
}

/**
 * Calculate string similarity (0-1)
 */
function similarity(s1: string, s2: string): number {
  if (s1.length === 0 || s2.length === 0) return 0
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = []
  for (let i = 0; i <= s2.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s1.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(j - 1) !== s2.charAt(i - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s1.length] = lastValue
  }
  return costs[s1.length]
}

export interface ConvertOptions {
  /** If true, create materials that don't exist in the database */
  createMissingMaterials?: boolean
  /** Price level for created materials */
  priceLevel?: 'REGULAR' | 'LUXURY'
}

/**
 * Convert AI-generated room profile to database format
 */
export async function convertRoomProfileToIds(
  aiRoomProfile: any,
  colors?: any[],
  materials?: any[],
  options: ConvertOptions = {}
): Promise<any> {
  // Fetch colors and materials if not provided
  if (!colors) {
    colors = await prisma.color.findMany({
      select: { id: true, hex: true, name: true }
    })
  }

  if (!materials) {
    materials = await prisma.material.findMany({
      select: { id: true, name: true, sku: true }
    })
  }

  const convertedProfile: any = {
    ...aiRoomProfile,
    roomTypeId: aiRoomProfile.roomTypeId || aiRoomProfile.roomType, // Ensure correct field name
  }

  // Convert color palette
  if (aiRoomProfile.colorPalette) {
    const oldPalette = aiRoomProfile.colorPalette
    const newPalette: any = {}

    // Convert primary color
    if (oldPalette.primary) {
      const colorId = findClosestColor(oldPalette.primary, colors)
      if (colorId) {
        newPalette.primaryId = colorId
      }
    }

    // Convert secondary colors
    if (oldPalette.secondary && Array.isArray(oldPalette.secondary)) {
      newPalette.secondaryIds = oldPalette.secondary
        .map((hex: string) => findClosestColor(hex, colors))
        .filter((id: string | null) => id !== null)
    } else {
      newPalette.secondaryIds = []
    }

    // Convert accent colors
    if (oldPalette.accent && Array.isArray(oldPalette.accent)) {
      newPalette.accentIds = oldPalette.accent
        .map((hex: string) => findClosestColor(hex, colors))
        .filter((id: string | null) => id !== null)
    } else {
      newPalette.accentIds = []
    }

    // Keep description
    if (oldPalette.description) {
      newPalette.description = oldPalette.description
    }

    convertedProfile.colorPalette = newPalette
  }

  // Convert materials
  if (aiRoomProfile.materials && Array.isArray(aiRoomProfile.materials)) {
    const newMaterials = []

    for (const oldMaterial of aiRoomProfile.materials) {
      if (!oldMaterial.name) continue

      const materialName = oldMaterial.name.he || oldMaterial.name.en || oldMaterial.name
      const materialId = await findMaterialByName(materialName, materials, {
        createIfMissing: options.createMissingMaterials,
        priceLevel: options.priceLevel,
      })

      if (materialId) {
        newMaterials.push({
          materialId,
          application: oldMaterial.application || null,
          finish: oldMaterial.finish || null
        })
      }
    }

    convertedProfile.materials = newMaterials
  }

  return convertedProfile
}

/**
 * Batch convert multiple room profiles
 */
export async function convertRoomProfilesToIds(
  aiRoomProfiles: any[],
  options: ConvertOptions = {}
): Promise<any[]> {
  // Fetch colors and materials once for all profiles
  const colors = await prisma.color.findMany({
    select: { id: true, hex: true, name: true }
  })

  const materials = await prisma.material.findMany({
    select: { id: true, name: true, sku: true }
  })

  const converted = []
  for (const profile of aiRoomProfiles) {
    const convertedProfile = await convertRoomProfileToIds(profile, colors, materials, options)
    converted.push(convertedProfile)
  }

  return converted
}
