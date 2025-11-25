/**
 * Update Textures with Hebrew Translations
 * Run with: npx tsx scripts/update-textures-hebrew.ts
 */

import { PrismaClient } from '@prisma/client'
import { getMaterialNameHebrew } from '../src/lib/seed/material-generator'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating textures with Hebrew translations...\n')

  // Get all abstract textures (AI-generated)
  const textures = await prisma.texture.findMany({
    where: { isAbstract: true },
    select: {
      id: true,
      name: true,
    }
  })

  console.log(`Found ${textures.length} abstract textures to update\n`)

  let updated = 0

  for (const texture of textures) {
    const currentName = texture.name as any
    const englishName = currentName?.en || ''
    const currentHebrewName = currentName?.he || ''

    // Skip if already has different Hebrew name
    if (currentHebrewName && currentHebrewName !== englishName) {
      console.log(`⏭️  Skipping "${englishName}" - already has Hebrew: ${currentHebrewName}`)
      continue
    }

    // Get Hebrew translation
    const hebrewName = getMaterialNameHebrew(englishName)

    // Skip if translation is same as English (no translation found)
    if (hebrewName === englishName) {
      console.log(`⚠️  No translation for "${englishName}"`)
      continue
    }

    // Update texture with Hebrew name
    await prisma.texture.update({
      where: { id: texture.id },
      data: {
        name: { en: englishName, he: hebrewName }
      }
    })

    console.log(`✅ Updated "${englishName}" → "${hebrewName}"`)
    updated++
  }

  console.log(`\n📊 Updated ${updated} textures with Hebrew translations`)

  await prisma.$disconnect()
}

main().catch(console.error)
