/**
 * Migration Script: Room Types to Categories
 *
 * This script migrates existing room types to the new category system:
 * 1. Creates a default "Uncategorized" category if needed
 * 2. Assigns default category to room types without categoryId
 * 3. Handles room types with old parentCategory values
 *
 * Usage: npx tsx scripts/migrate-room-types-to-categories.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RoomTypeToMigrate {
  id: string
  slug: string
  name: { he: string; en: string }
  parentCategory?: string | null
  categoryId?: string | null
}

async function main() {
  console.log('🚀 Starting room type migration to categories...\n')

  try {
    // Step 1: Find all room types using raw query to handle null categoryId
    const allRoomTypes = await prisma.$runCommandRaw({
      find: 'room_types',
      filter: {},
    })

    const roomTypesArray = (allRoomTypes as any).cursor.firstBatch as any[]
    console.log(`📊 Found ${roomTypesArray.length} room types in total\n`)

    // Step 2: Identify room types that need migration (no categoryId)
    const roomTypesToMigrate = roomTypesArray.filter((rt: any) => !rt.categoryId)

    if (roomTypesToMigrate.length === 0) {
      console.log('✅ All room types already have categories assigned!')
      console.log('✅ No migration needed.\n')
      return
    }

    console.log(`⚠️  Found ${roomTypesToMigrate.length} room types without categories:\n`)
    roomTypesToMigrate.forEach((rt: any) => {
      console.log(`   - ${rt.name.he} (${rt.name.en}) [${rt.slug}]`)
    })
    console.log('')

    // Step 3: Check if we have a "Private" category (most common default)
    let defaultCategory = await prisma.roomCategory.findFirst({
      where: { slug: 'private' },
    })

    // Step 4: If no "Private" category, check for any active category
    if (!defaultCategory) {
      defaultCategory = await prisma.roomCategory.findFirst({
        where: { active: true },
        orderBy: { order: 'asc' },
      })
    }

    // Step 5: If still no category, create an "Uncategorized" category
    if (!defaultCategory) {
      console.log('📦 No existing categories found. Creating "Uncategorized" category...\n')
      defaultCategory = await prisma.roomCategory.create({
        data: {
          slug: 'uncategorized',
          name: {
            he: 'ללא קטגוריה',
            en: 'Uncategorized',
          },
          description: {
            he: 'סוגי חדרים שטרם סווגו',
            en: 'Room types that have not been categorized yet',
          },
          icon: '📦',
          order: 999,
          active: true,
        },
      })
      console.log(`✅ Created default category: ${defaultCategory.name.he} (${defaultCategory.name.en})\n`)
    } else {
      console.log(`📌 Using existing category: ${defaultCategory.name.he} (${defaultCategory.name.en}) as default\n`)
    }

    // Step 6: Migrate room types
    console.log(`🔄 Migrating ${roomTypesToMigrate.length} room types...\n`)

    let successCount = 0
    let errorCount = 0

    for (const roomType of roomTypesToMigrate) {
      try {
        // Use raw update to bypass Prisma's type checking
        await prisma.$runCommandRaw({
          update: 'room_types',
          updates: [
            {
              q: { _id: roomType._id },
              u: { $set: { categoryId: defaultCategory.id } },
            },
          ],
        })
        console.log(`   ✅ Migrated: ${roomType.name.he} (${roomType.name.en})`)
        successCount++
      } catch (error: any) {
        console.error(`   ❌ Failed to migrate ${roomType.name.en}: ${error.message}`)
        errorCount++
      }
    }

    console.log('')
    console.log('📈 Migration Summary:')
    console.log(`   ✅ Successfully migrated: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📊 Total room types: ${roomTypesArray.length}`)
    console.log(`   🎯 Room types with categories: ${roomTypesArray.length - roomTypesToMigrate.length + successCount}`)
    console.log('')

    // Step 7: Verify migration using raw query
    const verifyResult = await prisma.$runCommandRaw({
      find: 'room_types',
      filter: { categoryId: null },
    })

    const remainingUnmigrated = (verifyResult as any).cursor.firstBatch.length

    if (remainingUnmigrated === 0) {
      console.log('✅ Migration completed successfully! All room types now have categories.\n')
    } else {
      console.warn(`⚠️  Warning: ${remainingUnmigrated} room types still need migration.\n`)
    }

    // Step 8: Show category distribution
    console.log('📊 Category Distribution:')
    const categories = await prisma.roomCategory.findMany({
      include: {
        _count: {
          select: { roomTypes: true },
        },
      },
      orderBy: { order: 'asc' },
    })

    categories.forEach((cat) => {
      console.log(`   ${cat.icon || '📁'} ${cat.name.he} (${cat.name.en}): ${cat._count.roomTypes} room types`)
    })
    console.log('')

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
main()
  .then(() => {
    console.log('✅ Migration script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error)
    process.exit(1)
  })
