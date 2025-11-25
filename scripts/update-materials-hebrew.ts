/**
 * Update Materials with Hebrew Translations
 * Run with: npx tsx scripts/update-materials-hebrew.ts
 */

import { PrismaClient } from '@prisma/client'
import { getMaterialNameHebrew } from '../src/lib/seed/material-generator'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating materials with Hebrew translations...\n')

  // Get all abstract materials (AI-generated)
  const materials = await prisma.material.findMany({
    where: { isAbstract: true },
    select: {
      id: true,
      name: true,
    }
  })

  console.log(`Found ${materials.length} abstract materials to update\n`)

  let updated = 0

  for (const material of materials) {
    const currentName = material.name as any
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

    // Update material with Hebrew name
    await prisma.material.update({
      where: { id: material.id },
      data: {
        name: { en: englishName, he: hebrewName }
      }
    })

    console.log(`✅ Updated "${englishName}" → "${hebrewName}"`)
    updated++
  }

  console.log(`\n📊 Updated ${updated} materials with Hebrew translations`)

  await prisma.$disconnect()
}

main().catch(console.error)
