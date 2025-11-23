/**
 * Script to add Room Categories navigation translation
 *
 * Adds the translation key: admin.navigation.roomCategories
 * Hebrew: קטגוריות חדרים
 * English: Room Categories
 *
 * Usage: npx tsx scripts/add-room-categories-translation.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌐 Adding Room Categories translation...\n')

  try {
    // Check if translation already exists
    const existing = await prisma.translation.findUnique({
      where: { key: 'admin.navigation.roomCategories' },
    })

    if (existing) {
      console.log('✅ Translation already exists:')
      console.log(`   Key: ${existing.key}`)
      console.log(`   Hebrew: ${existing.valueHe}`)
      console.log(`   English: ${existing.valueEn}`)
      console.log('\n✅ No action needed.\n')
      return
    }

    // Create the translation
    const translation = await prisma.translation.create({
      data: {
        key: 'admin.navigation.roomCategories',
        valueHe: 'קטגוריות חדרים',
        valueEn: 'Room Categories',
      },
    })

    console.log('✅ Translation created successfully:')
    console.log(`   Key: ${translation.key}`)
    console.log(`   Hebrew: ${translation.valueHe}`)
    console.log(`   English: ${translation.valueEn}`)
    console.log('\n✅ Translation added successfully!\n')
  } catch (error: any) {
    console.error('❌ Failed to add translation:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run script
main()
  .then(() => {
    console.log('✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
