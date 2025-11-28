/**
 * AI Texture Matcher Sub-Agent
 *
 * Intelligent texture matching for the seed process:
 * - Semantic matching of texture names to existing DB textures
 * - Cross-language support (Hebrew ↔ English)
 * - Automatic MaterialCategory inference
 * - Creates new textures with proper properties when no match found
 * - Generates texture images for new textures
 */

import { z } from 'zod'
import { generateStructuredObject, AI_MODELS, type GenerationOptions } from './ai-sdk-provider'
import { globalMetricsCollector, generateOperationId } from './telemetry'

// =============================================================================
// Configuration
// =============================================================================

export const TEXTURE_MATCH_CONFIG = {
  CONFIDENCE_THRESHOLD_LINK: 0.6,      // Minimum confidence to link to existing
  CONFIDENCE_THRESHOLD_HEURISTIC: 0.85, // Heuristic match threshold (no AI needed)
  BATCH_SIZE: 10,                       // Textures per AI batch call
  TEMPERATURE: 0.2,                     // Low for consistent matching
}

// =============================================================================
// Zod Schemas
// =============================================================================

/**
 * Schema for when AI decides to create a new texture
 */
export const NewTextureSchema = z.object({
  name: z.object({
    he: z.string().describe('Hebrew texture name (proper RTL text)'),
    en: z.string().describe('English texture name'),
  }),
  categoryId: z.string().describe('MongoDB ObjectId of MaterialCategory from the available list'),
  finish: z.string().optional().describe('Finish type: matte, glossy, satin, rough, smooth, natural, polished, brushed'),
  sheen: z.string().optional().describe('Sheen level: flat, eggshell, semi-gloss, high-gloss'),
  baseColor: z.string().optional().describe('HEX color if applicable (e.g., "#8B4513" for brown wood)'),
})

/**
 * Schema for a single texture match result
 */
export const TextureMatchSchema = z.object({
  inputName: z.string().describe('The original texture name that was matched'),
  action: z.enum(['link', 'create']).describe('Whether to link to existing texture or create new'),
  matchedTextureId: z.string().optional().describe('MongoDB ObjectId of matched existing texture (required if action=link)'),
  confidence: z.number().min(0).max(1).describe('Confidence score from 0.0 to 1.0'),
  newTexture: NewTextureSchema.optional().describe('New texture specification (required if action=create)'),
  reasoning: z.string().describe('Brief explanation of why this decision was made'),
})

/**
 * Batch response schema for multiple textures
 */
export const TextureMatchBatchResponseSchema = z.object({
  matches: z.array(TextureMatchSchema).describe('Array of match results for each input texture'),
})

// Type exports
export type NewTexture = z.infer<typeof NewTextureSchema>
export type TextureMatch = z.infer<typeof TextureMatchSchema>
export type TextureMatchBatchResponse = z.infer<typeof TextureMatchBatchResponseSchema>

// =============================================================================
// Context Interfaces
// =============================================================================

/**
 * Available texture from database for matching
 */
export interface AvailableTextureForMatch {
  id: string
  name: { he: string; en: string }
  finish?: string
  sheen?: string
  categorySlug?: string
  categoryName?: { he: string; en: string }
}

/**
 * Available category from database
 */
export interface AvailableCategoryForTexture {
  id: string
  name: { he: string; en: string }
  slug: string
}

/**
 * Context for texture matching
 */
export interface TextureMatchContext {
  texturesToMatch: string[]
  availableTextures: AvailableTextureForMatch[]
  availableCategories: AvailableCategoryForTexture[]
  styleContext?: string
  priceLevel?: 'REGULAR' | 'LUXURY'
}

// =============================================================================
// Heuristic Pre-filter (No AI Call)
// =============================================================================

/**
 * Common texture translations for quick lookup
 */
const QUICK_TEXTURE_TRANSLATIONS: Record<string, string[]> = {
  // Hebrew base -> English variants
  'עץ': ['wood', 'oak', 'walnut', 'pine', 'teak', 'mahogany', 'cherry', 'birch', 'maple'],
  'אלון': ['oak'],
  'אגוז': ['walnut'],
  'אורן': ['pine'],
  'טיק': ['teak'],
  'מייפל': ['maple'],
  'ברוש': ['cypress'],
  'שיש': ['marble', 'carrara', 'calacatta'],
  'גרניט': ['granite'],
  'אבן': ['stone', 'limestone', 'travertine', 'slate'],
  'בטון': ['concrete', 'cement'],
  'מתכת': ['metal', 'steel', 'iron', 'aluminum'],
  'פלדה': ['steel', 'stainless'],
  'ברזל': ['iron', 'wrought iron'],
  'פליז': ['brass'],
  'נחושת': ['copper'],
  'ארד': ['bronze'],
  'כרום': ['chrome'],
  'ניקל': ['nickel'],
  'בד': ['fabric', 'textile', 'cloth'],
  'כותנה': ['cotton'],
  'פשתן': ['linen'],
  'משי': ['silk'],
  'קטיפה': ['velvet'],
  'עור': ['leather'],
  'זמש': ['suede'],
  'צמר': ['wool'],
  'קרמיקה': ['ceramic', 'ceramics'],
  'פורצלן': ['porcelain'],
  'אריח': ['tile', 'tiles'],
  'זכוכית': ['glass'],
  'מראה': ['mirror'],
  'טיח': ['plaster', 'stucco'],
  'טפט': ['wallpaper'],
  'צבע': ['paint', 'painted'],
  'לכה': ['lacquer', 'lacquered'],
  'שעם': ['cork'],
  'במבוק': ['bamboo'],
  'ראטן': ['rattan', 'wicker'],
}

/**
 * Reverse mapping: English -> Hebrew
 */
const TEXTURE_ENGLISH_TO_HEBREW: Record<string, string> = {}
for (const [hebrew, englishVariants] of Object.entries(QUICK_TEXTURE_TRANSLATIONS)) {
  for (const english of englishVariants) {
    TEXTURE_ENGLISH_TO_HEBREW[english.toLowerCase()] = hebrew
  }
}

/**
 * Fast heuristic matcher without AI
 * Used as first-pass to reduce API calls
 */
export function heuristicTextureMatch(
  name: string,
  availableTextures: AvailableTextureForMatch[]
): { matched: boolean; textureId?: string; confidence: number } {
  const nameLower = name.toLowerCase().trim()
  const nameNormalized = nameLower.replace(/\s+/g, ' ')

  // Step 1: Exact match (case-insensitive)
  for (const texture of availableTextures) {
    const heLower = texture.name.he?.toLowerCase().trim() || ''
    const enLower = texture.name.en?.toLowerCase().trim() || ''

    if (heLower === nameLower || enLower === nameLower) {
      return { matched: true, textureId: texture.id, confidence: 1.0 }
    }
  }

  // Step 2: Check if input contains base texture keyword
  // e.g., "Brushed Oak" contains "oak"
  for (const texture of availableTextures) {
    const enLower = texture.name.en?.toLowerCase().trim() || ''
    const heName = texture.name.he || ''

    // Check if input contains the texture name
    if (enLower && enLower.length >= 3 && nameNormalized.includes(enLower)) {
      return { matched: true, textureId: texture.id, confidence: 0.9 }
    }

    // Check if texture name contains input word
    if (enLower) {
      const inputWords = nameNormalized.split(/\s+/)
      for (const word of inputWords) {
        if (word.length >= 3 && enLower.includes(word)) {
          return { matched: true, textureId: texture.id, confidence: 0.85 }
        }
      }
    }

    // Check Hebrew
    if (heName && name.includes(heName)) {
      return { matched: true, textureId: texture.id, confidence: 0.9 }
    }
  }

  // Step 3: Cross-language translation lookup
  const hebrewEquivalent = TEXTURE_ENGLISH_TO_HEBREW[nameLower]
  if (hebrewEquivalent) {
    for (const texture of availableTextures) {
      if (texture.name.he?.includes(hebrewEquivalent)) {
        return { matched: true, textureId: texture.id, confidence: 0.85 }
      }
    }
  }

  // Check if Hebrew input has English equivalent
  for (const [hebrew, englishVariants] of Object.entries(QUICK_TEXTURE_TRANSLATIONS)) {
    if (name.includes(hebrew)) {
      for (const texture of availableTextures) {
        const enLower = texture.name.en?.toLowerCase() || ''
        if (englishVariants.some(en => enLower.includes(en))) {
          return { matched: true, textureId: texture.id, confidence: 0.85 }
        }
      }
    }
  }

  // Step 4: Check individual words for partial matches
  const inputWords = nameNormalized.split(/\s+/).filter(w => w.length >= 3)
  for (const texture of availableTextures) {
    const enLower = texture.name.en?.toLowerCase() || ''
    const enWords = enLower.split(/\s+/).filter(w => w.length >= 3)

    for (const inputWord of inputWords) {
      for (const enWord of enWords) {
        if (inputWord === enWord || enWord.includes(inputWord) || inputWord.includes(enWord)) {
          return { matched: true, textureId: texture.id, confidence: 0.8 }
        }
      }
    }
  }

  return { matched: false, confidence: 0 }
}

// =============================================================================
// AI Prompt Builder
// =============================================================================

/**
 * Build the prompt for AI texture matching
 */
function buildTextureMatchPrompt(context: TextureMatchContext): string {
  const {
    texturesToMatch,
    availableTextures,
    availableCategories,
    styleContext,
    priceLevel,
  } = context

  // Format available textures for prompt
  const texturesListForPrompt = availableTextures.slice(0, 50).map(t =>
    `  - ID: "${t.id}" | Hebrew: "${t.name.he}" | English: "${t.name.en}"${t.finish ? ` | Finish: ${t.finish}` : ''}${t.categorySlug ? ` | Category: ${t.categorySlug}` : ''}`
  ).join('\n')

  // Format categories
  const categoriesListForPrompt = availableCategories.map(c =>
    `  - ID: "${c.id}" | Hebrew: "${c.name.he}" | English: "${c.name.en}" | Slug: ${c.slug}`
  ).join('\n')

  return `You are an expert interior design texture specialist. Your task is to match texture names to existing textures in a database, or specify how to create new ones.

**CONTEXT**
${styleContext ? `Style: ${styleContext}` : 'General interior design'}
${priceLevel ? `Price Level: ${priceLevel}` : ''}

---

**TEXTURES TO MATCH** (${texturesToMatch.length} items):
${texturesToMatch.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

---

**AVAILABLE TEXTURES IN DATABASE** (${availableTextures.length} total, showing first 50):
${texturesListForPrompt}

---

**AVAILABLE CATEGORIES** (for linking new textures):
${categoriesListForPrompt}

---

**YOUR TASK**

For EACH texture to match, determine whether to LINK to an existing texture or CREATE a new one:

### LINK (action: "link")
Use when an existing texture semantically matches:
- "Brushed Oak" → Link to "Oak" (same base texture)
- "עץ טבעי" (Natural wood) → Link to "עץ" (Wood)
- "Polished Marble" → Link to "Marble"

Requirements for LINK:
- matchedTextureId: The EXACT ID from the available textures list
- confidence: Your certainty (0.6-1.0)
- reasoning: Brief explanation

### CREATE (action: "create")
Use when no suitable match exists in the database.

Requirements for CREATE:
- newTexture.name.he: Proper Hebrew name (RTL)
- newTexture.name.en: Proper English name
- newTexture.categoryId: EXACT ID from available categories
- newTexture.finish: One of: "matte", "glossy", "satin", "rough", "smooth", "natural", "polished", "brushed", "textured", "lacquered", "oiled"
- newTexture.sheen: One of: "flat", "eggshell", "semi-gloss", "high-gloss" (optional)
- newTexture.baseColor: HEX color if applicable (e.g., "#8B4513" for wood brown)
- confidence: 1.0 (certain this needs creation)
- reasoning: Why no existing texture matches

**IMPORTANT RULES**
1. Use EXACT IDs from the lists above - do not make up IDs
2. Match the BASE texture, not descriptive prefixes ("Brushed Oak" → "Oak")
3. Cross-language matching: "עץ" = "Wood" (same texture type)
4. If unsure between two textures, pick the more specific one
5. For wood textures: oak, walnut, pine, teak are common types
6. For stone textures: marble, granite, limestone are common types
7. For metal textures: steel, brass, copper, bronze are common types
8. For fabric textures: cotton, linen, silk, velvet, leather are common types
9. For Hebrew names, use proper interior design terminology`
}

// =============================================================================
// Core AI Matching Functions
// =============================================================================

/**
 * Match a batch of texture names using AI
 */
export async function matchTexturesBatch(
  context: TextureMatchContext,
  options?: Partial<GenerationOptions>
): Promise<TextureMatch[]> {
  const operationId = generateOperationId()
  const functionId = 'texture-matcher-batch'

  if (context.texturesToMatch.length === 0) {
    return []
  }

  globalMetricsCollector.startOperation(
    operationId,
    functionId,
    AI_MODELS.GEMINI_FLASH_LITE
  )

  console.log(`\n[Texture Matcher] Matching ${context.texturesToMatch.length} textures via AI`)
  console.log(`   Available: ${context.availableTextures.length} textures, ${context.availableCategories.length} categories`)

  const prompt = buildTextureMatchPrompt(context)

  try {
    const { object: result, usage } = await generateStructuredObject(
      prompt,
      TextureMatchBatchResponseSchema,
      {
        model: AI_MODELS.GEMINI_FLASH_LITE,
        temperature: TEXTURE_MATCH_CONFIG.TEMPERATURE,
        retries: 3,
        useFallback: true,
        ...options,
      }
    )

    // Validate returned IDs exist
    const validatedMatches = result.matches.map((match, index) => {
      // Validate link action
      if (match.action === 'link' && match.matchedTextureId) {
        const exists = context.availableTextures.some(t => t.id === match.matchedTextureId)
        if (!exists) {
          console.warn(`   [Validation] Invalid texture ID "${match.matchedTextureId}" for "${match.inputName}", converting to create`)
          return {
            ...match,
            action: 'create' as const,
            matchedTextureId: undefined,
            confidence: 0.8,
            reasoning: `Original match ID invalid - creating new texture`,
            newTexture: inferNewTexture(context.texturesToMatch[index], context),
          }
        }
      }

      // Validate create action
      if (match.action === 'create' && match.newTexture) {
        const categoryExists = context.availableCategories.some(c => c.id === match.newTexture!.categoryId)

        if (!categoryExists) {
          console.warn(`   [Validation] Invalid category ID for "${match.inputName}", using fallback`)
          return {
            ...match,
            newTexture: inferNewTexture(match.inputName, context),
          }
        }
      }

      return match
    })

    globalMetricsCollector.completeOperation(operationId, usage, 'stop')

    const linkCount = validatedMatches.filter(m => m.action === 'link').length
    const createCount = validatedMatches.filter(m => m.action === 'create').length
    console.log(`   Results: ${linkCount} linked, ${createCount} to create`)
    console.log(`   Tokens: ${usage.totalTokens}`)

    return validatedMatches

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    globalMetricsCollector.failOperation(operationId, errorMessage)
    console.error(`   [Texture Matcher] AI matching failed: ${errorMessage}`)

    // Fallback: return all as "create" actions with inferred properties
    return context.texturesToMatch.map(name => ({
      inputName: name,
      action: 'create' as const,
      confidence: 0.5,
      reasoning: 'AI matching failed, using fallback inference',
      newTexture: inferNewTexture(name, context),
    }))
  }
}

/**
 * Match a single texture (convenience wrapper)
 */
export async function matchTexture(
  name: string,
  context: Omit<TextureMatchContext, 'texturesToMatch'>,
  options?: Partial<GenerationOptions>
): Promise<TextureMatch> {
  const results = await matchTexturesBatch(
    { ...context, texturesToMatch: [name] },
    options
  )
  return results[0]
}

// =============================================================================
// Fallback Inference (when AI fails)
// =============================================================================

/**
 * Infer new texture properties when AI fails
 * Uses simple keyword-based logic as fallback
 */
function inferNewTexture(name: string, context: TextureMatchContext): NewTexture {
  const nameLower = name.toLowerCase()

  // Simple category inference
  let categorySlug = 'wall-finishes' // Default
  let finish = 'natural'
  let baseColor: string | undefined

  if (/wood|oak|walnut|pine|teak|mahogany|עץ|אלון|אגוז/.test(nameLower)) {
    categorySlug = 'wood-finishes'
    finish = 'natural'
    baseColor = '#8B4513' // Brown
  } else if (/marble|granite|stone|limestone|שיש|גרניט|אבן/.test(nameLower)) {
    categorySlug = 'stone-finishes'
    finish = 'polished'
    baseColor = '#D3D3D3' // Light gray
  } else if (/metal|steel|iron|brass|copper|מתכת|פלדה|ברזל|פליז/.test(nameLower)) {
    categorySlug = 'metal-finishes'
    finish = 'brushed'
    baseColor = '#C0C0C0' // Silver
  } else if (/fabric|cotton|linen|silk|velvet|leather|בד|כותנה|פשתן|משי|עור/.test(nameLower)) {
    categorySlug = 'fabric-textures'
    finish = 'matte'
  } else if (/ceramic|porcelain|tile|קרמיקה|פורצלן/.test(nameLower)) {
    categorySlug = 'ceramic-tiles'
    finish = 'glossy'
  } else if (/paint|painted|צבע/.test(nameLower)) {
    categorySlug = 'wall-finishes'
    finish = 'matte'
  } else if (/glass|זכוכית/.test(nameLower)) {
    categorySlug = 'glass-finishes'
    finish = 'glossy'
  }

  // Find category
  const category = context.availableCategories.find(c => c.slug === categorySlug)
    || context.availableCategories[0]

  // Generate Hebrew name
  const firstWord = nameLower.split(/\s+/)[0]
  const hebrewName = TEXTURE_ENGLISH_TO_HEBREW[firstWord] || name

  // Infer sheen from name
  let sheen: string | undefined
  if (/glossy|gloss|shiny/.test(nameLower)) {
    sheen = 'high-gloss'
  } else if (/semi-gloss|satin/.test(nameLower)) {
    sheen = 'semi-gloss'
  } else if (/eggshell/.test(nameLower)) {
    sheen = 'eggshell'
  } else if (/matte|flat/.test(nameLower)) {
    sheen = 'flat'
  }

  return {
    name: {
      he: hebrewName,
      en: name.charAt(0).toUpperCase() + name.slice(1),
    },
    categoryId: category?.id || '',
    finish,
    sheen,
    baseColor,
  }
}

// =============================================================================
// Combined Matching Function (Heuristic + AI)
// =============================================================================

/**
 * Smart texture matching: tries heuristic first, then AI if needed
 */
export async function smartMatchTexture(
  name: string,
  context: Omit<TextureMatchContext, 'texturesToMatch'>,
  options?: Partial<GenerationOptions>
): Promise<TextureMatch> {
  // Step 1: Try heuristic match first (free)
  const heuristic = heuristicTextureMatch(name, context.availableTextures)

  if (heuristic.matched && heuristic.confidence >= TEXTURE_MATCH_CONFIG.CONFIDENCE_THRESHOLD_HEURISTIC) {
    console.log(`   [Heuristic] Matched texture "${name}" → ${heuristic.textureId} (${(heuristic.confidence * 100).toFixed(0)}%)`)
    return {
      inputName: name,
      action: 'link',
      matchedTextureId: heuristic.textureId,
      confidence: heuristic.confidence,
      reasoning: 'Matched via heuristic pre-filter',
    }
  }

  // Step 2: Use AI for semantic matching
  return await matchTexture(name, context, options)
}

/**
 * Smart batch matching: filters out heuristic matches, only sends unknowns to AI
 */
export async function smartMatchTexturesBatch(
  names: string[],
  context: Omit<TextureMatchContext, 'texturesToMatch'>,
  options?: Partial<GenerationOptions>
): Promise<TextureMatch[]> {
  const results: TextureMatch[] = []
  const needsAI: { name: string; index: number }[] = []

  // Step 1: Try heuristic match for each
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const heuristic = heuristicTextureMatch(name, context.availableTextures)

    if (heuristic.matched && heuristic.confidence >= TEXTURE_MATCH_CONFIG.CONFIDENCE_THRESHOLD_HEURISTIC) {
      results[i] = {
        inputName: name,
        action: 'link',
        matchedTextureId: heuristic.textureId,
        confidence: heuristic.confidence,
        reasoning: 'Matched via heuristic pre-filter',
      }
    } else {
      needsAI.push({ name, index: i })
    }
  }

  console.log(`[Smart Texture Matcher] ${results.filter(Boolean).length} matched via heuristic, ${needsAI.length} need AI`)

  // Step 2: Send remaining to AI in batches
  if (needsAI.length > 0) {
    const batchSize = TEXTURE_MATCH_CONFIG.BATCH_SIZE
    for (let i = 0; i < needsAI.length; i += batchSize) {
      const batch = needsAI.slice(i, i + batchSize)
      const batchNames = batch.map(b => b.name)

      const aiResults = await matchTexturesBatch(
        { ...context, texturesToMatch: batchNames },
        options
      )

      // Place AI results in correct positions
      for (let j = 0; j < batch.length; j++) {
        results[batch[j].index] = aiResults[j]
      }
    }
  }

  return results
}
