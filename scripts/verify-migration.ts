/**
 * Verify Phase 2 Migration Results
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyMigration() {
  console.log('\n✅ Phase 2 Migration Verification\n')
  console.log('='.repeat(60))

  try {
    // Count total styles
    const totalStyles = await prisma.style.count()
    console.log(`\nTotal Styles: ${totalStyles}`)

    // Get all styles and count those with priceLevel
    const allStyles = await prisma.style.findMany({
      select: { priceLevel: true },
    })
    const stylesWithPriceLevel = allStyles.filter((s) => s.priceLevel !== null).length
    console.log(`Styles with priceLevel: ${stylesWithPriceLevel}`)

    // Count total StyleImage records
    const totalStyleImages = await prisma.styleImage.count()
    console.log(`\nTotal StyleImage records: ${totalStyleImages}`)

    // Get styles with StyleImage records
    const stylesWithImages = await prisma.style.findMany({
      where: {
        images: { some: {} },
      },
      select: {
        id: true,
        name: true,
        priceLevel: true,
        _count: {
          select: { images: true },
        },
      },
    })

    console.log(`\nStyles with StyleImage records: ${stylesWithImages.length}`)
    console.log('\nDetails:')
    stylesWithImages.forEach((style, idx) => {
      console.log(
        `   ${idx + 1}. ${style.name.en} - ${style._count.images} images (${style.priceLevel || 'NO_PRICE'})`
      )
    })

    // Get image category breakdown
    const imageCategories = await prisma.styleImage.groupBy({
      by: ['imageCategory'],
      _count: true,
    })

    console.log('\nImage Categories:')
    imageCategories.forEach((cat) => {
      console.log(`   - ${cat.imageCategory}: ${cat._count} images`)
    })

    console.log('\n' + '='.repeat(60))
    console.log('\n✅ Verification complete!\n')
  } catch (error) {
    console.error('❌ Verification failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

verifyMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
