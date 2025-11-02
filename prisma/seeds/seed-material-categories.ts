/**
 * Seed Material Categories and Types
 * Run with: npx tsx prisma/seeds/seed-material-categories.ts
 */

import { PrismaClient } from '@prisma/client'
import { materialCategoriesData } from './material-categories'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting material categories and types seed...')

  for (const categoryData of materialCategoriesData) {
    // Check if category already exists
    const existingCategory = await prisma.materialCategory.findUnique({
      where: { slug: categoryData.slug },
    })

    if (existingCategory) {
      console.log(`⏭️  Category "${categoryData.slug}" already exists, skipping...`)
      continue
    }

    // Create category
    const category = await prisma.materialCategory.create({
      data: {
        name: categoryData.name,
        description: categoryData.description,
        slug: categoryData.slug,
        order: categoryData.order,
        icon: categoryData.icon,
      },
    })

    console.log(`✅ Created category: ${categoryData.name.he} / ${categoryData.name.en}`)

    // Create types for this category
    for (const typeData of categoryData.types) {
      // Check if type already exists
      const existingType = await prisma.materialType.findUnique({
        where: {
          categoryId_slug: {
            categoryId: category.id,
            slug: typeData.slug,
          },
        },
      })

      if (existingType) {
        console.log(`  ⏭️  Type "${typeData.slug}" already exists, skipping...`)
        continue
      }

      await prisma.materialType.create({
        data: {
          categoryId: category.id,
          name: typeData.name,
          description: typeData.description,
          slug: typeData.slug,
          order: typeData.order,
          icon: typeData.icon,
        },
      })

      console.log(`  ✅ Created type: ${typeData.name.he} / ${typeData.name.en}`)
    }
  }

  console.log('✨ Material categories and types seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding material categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

