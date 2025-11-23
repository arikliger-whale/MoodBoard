/**
 * Seed Room Categories
 * Creates initial room categories: Private, Public, Commercial
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const roomCategories = [
  {
    slug: 'private',
    name: {
      he: 'פרטי',
      en: 'Private',
    },
    description: {
      he: 'חללים פרטיים למגורים ושימוש ביתי',
      en: 'Private residential and home use spaces',
    },
    icon: '🏠',
    order: 0,
    active: true,
  },
  {
    slug: 'public',
    name: {
      he: 'ציבורי',
      en: 'Public',
    },
    description: {
      he: 'חללים ציבוריים ומוסדות',
      en: 'Public spaces and institutions',
    },
    icon: '🏛️',
    order: 1,
    active: true,
  },
  {
    slug: 'commercial',
    name: {
      he: 'מסחרי',
      en: 'Commercial',
    },
    description: {
      he: 'עסקים ומסחר',
      en: 'Business and commercial spaces',
    },
    icon: '🏢',
    order: 2,
    active: true,
  },
]

async function main() {
  console.log('🌱 Seeding room categories...')

  for (const category of roomCategories) {
    const existing = await prisma.roomCategory.findUnique({
      where: { slug: category.slug },
    })

    if (existing) {
      console.log(`✓ Category "${category.slug}" already exists, skipping...`)
      continue
    }

    await prisma.roomCategory.create({
      data: category,
    })

    console.log(`✓ Created category: ${category.name.en} (${category.slug})`)
  }

  console.log('\n✅ Room categories seeded successfully!')
}

main()
  .catch((error) => {
    console.error('❌ Error seeding room categories:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
