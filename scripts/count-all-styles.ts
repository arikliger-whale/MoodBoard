/**
 * Count all styles in the database
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function countStyles() {
  console.log('📊 Counting all styles...\n')

  try {
    // Count all global styles
    const globalCount = await prisma.style.count({
      where: { organizationId: null },
    })

    console.log(`✅ Total Global Styles (organizationId = null): ${globalCount}`)

    // Get all global styles
    const allGlobal = await prisma.style.findMany({
      where: { organizationId: null },
      select: {
        id: true,
        slug: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(`\n📋 All Global Styles:`)
    allGlobal.forEach((s: any, i: number) => {
      const date = new Date(s.createdAt).toLocaleString()
      const isLouisXIV = s.slug.includes('louis')
      console.log(`  ${i + 1}. ${isLouisXIV ? '⭐' : '  '} ${s.name.en}`)
      console.log(`     Slug: ${s.slug}`)
      console.log(`     ID: ${s.id}`)
      console.log(`     Created: ${date}`)
      console.log()
    })

    // Count with organizationId
    const orgCount = await prisma.style.count({
      where: { organizationId: { not: null } },
    })

    console.log(`\n📊 Styles with OrganizationID: ${orgCount}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

countStyles()
