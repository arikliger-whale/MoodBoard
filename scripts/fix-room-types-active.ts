/**
 * Fix Room Types Active Field
 *
 * Sets active=true for all room types that don't have the field set
 *
 * Usage: npx tsx scripts/fix-room-types-active.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing room types active field...\n')

  try {
    // Use raw command to find room types without active field or with null
    const result = await prisma.$runCommandRaw({
      find: 'room_types',
      filter: {},
    })

    const roomTypes = (result as any).cursor.firstBatch as any[]
    console.log(`📊 Found ${roomTypes.length} room types in total\n`)

    // Filter those without active field or with active=null
    const needsFix = roomTypes.filter((rt: any) => rt.active === undefined || rt.active === null)

    if (needsFix.length === 0) {
      console.log('✅ All room types already have active field set!')
      console.log('✅ No action needed.\n')
      return
    }

    console.log(`⚠️  Found ${needsFix.length} room types without active field:\n`)
    needsFix.forEach((rt: any) => {
      console.log(`   - ${rt.name.he} (${rt.name.en})`)
    })
    console.log('')

    console.log('🔄 Setting active=true for all room types...\n')

    let successCount = 0
    let errorCount = 0

    for (const roomType of needsFix) {
      try {
        await prisma.$runCommandRaw({
          update: 'room_types',
          updates: [
            {
              q: { _id: roomType._id },
              u: { $set: { active: true } },
            },
          ],
        })
        console.log(`   ✅ Fixed: ${roomType.name.he} (${roomType.name.en})`)
        successCount++
      } catch (error: any) {
        console.error(`   ❌ Failed: ${roomType.name.en}: ${error.message}`)
        errorCount++
      }
    }

    console.log('')
    console.log('📈 Fix Summary:')
    console.log(`   ✅ Successfully fixed: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📊 Total room types: ${roomTypes.length}`)
    console.log('')

    if (errorCount === 0) {
      console.log('✅ All room types now have active=true!\n')
    } else {
      console.warn(`⚠️  Warning: ${errorCount} room types failed to update.\n`)
    }

  } catch (error: any) {
    console.error('❌ Fix failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run fix
main()
  .then(() => {
    console.log('✅ Fix script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix script failed:', error)
    process.exit(1)
  })
