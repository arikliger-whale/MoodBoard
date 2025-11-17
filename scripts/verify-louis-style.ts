/**
 * Verify the Louis XIV style exists and check its organizationId
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyStyle() {
  const styleId = '691b603881f6f0295c778b8f'

  console.log(`🔍 Verifying style: ${styleId}\n`)

  try {
    // Query by ID
    const styleById = await prisma.style.findUnique({
      where: { id: styleId },
    })

    if (!styleById) {
      console.log('❌ Style does NOT exist!')
      return
    }

    console.log(`✅ Style EXISTS!`)
    console.log(`  Name: ${(styleById.name as any).en}`)
    console.log(`  Slug: ${styleById.slug}`)
    console.log(`  Organization ID: ${styleById.organizationId}`)
    console.log(`  Organization ID type: ${typeof styleById.organizationId}`)
    console.log(`  Organization ID === null: ${styleById.organizationId === null}`)

    // Try to find it with findMany and orgId = null
    const foundWithNull = await prisma.style.findMany({
      where: {
        id: styleId,
        organizationId: null
      },
    })

    console.log(`\n📊 findMany with id + organizationId=null: ${foundWithNull.length} results`)

    // Try without orgId filter
    const foundWithoutOrgFilter = await prisma.style.findMany({
      where: { id: styleId },
    })

    console.log(`📊 findMany with just id: ${foundWithoutOrgFilter.length} results`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyStyle()
