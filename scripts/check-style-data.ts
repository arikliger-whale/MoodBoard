/**
 * Debug Script: Check Style Data
 * Check the specific style the user mentioned
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStyle() {
  const styleId = '691b603881f6f0295c778b8f'

  console.log(`🔍 Checking style: ${styleId}\n`)

  try {
    const style = await prisma.style.findUnique({
      where: { id: styleId },
      select: {
        id: true,
        slug: true,
        name: true,
        organizationId: true,
        metadata: true,
      },
    })

    if (!style) {
      console.log('❌ Style not found!')
      return
    }

    console.log('📋 Style Data:')
    console.log(`  ID: ${style.id}`)
    console.log(`  Slug: ${style.slug}`)
    console.log(`  Name (he): ${(style.name as any).he}`)
    console.log(`  Name (en): ${(style.name as any).en}`)
    console.log(`  Organization ID: ${style.organizationId}`)
    console.log(`  Metadata:`, JSON.stringify(style.metadata, null, 2))

    // Check all global styles
    console.log('\n\n📊 Checking all global styles (organizationId = null):')
    const globalStyles = await prisma.style.findMany({
      where: {organizationId: null },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    })

    console.log(`  Found ${globalStyles.length} global styles:`)
    globalStyles.forEach((s: any, i: number) => {
      console.log(`    ${i + 1}. ${s.name.en} (${s.slug})`)
    })

    // Check non-null organizationId styles
    console.log('\n\n📊 Checking all styles with organizationId (not null):')
    const orgStyles = await prisma.style.findMany({
      where: { organizationId: { not: null } },
      select: {
        id: true,
        slug: true,
        name: true,
        organizationId: true,
        metadata: true,
      },
    })

    console.log(`  Found ${orgStyles.length} styles with organizationId:`)
    orgStyles.forEach((s: any, i: number) => {
      const isAiGenerated = s.metadata?.aiGenerated === true
      console.log(`    ${i + 1}. ${s.name.en} (${s.slug})`)
      console.log(`       Organization ID: ${s.organizationId}`)
      console.log(`       AI Generated: ${isAiGenerated}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkStyle()
