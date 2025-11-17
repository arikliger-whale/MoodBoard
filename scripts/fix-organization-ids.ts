/**
 * Fix missing organizationId fields in styles
 * Sets organizationId to null explicitly for all global styles
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixOrganizationIds() {
  console.log('\n🔧 Fixing organizationId fields in styles...\n')

  // Get all styles
  const styles = await prisma.style.findMany({
    select: {
      id: true,
      name: true,
    },
  })

  console.log(`Found ${styles.length} styles to update\n`)

  let updated = 0

  for (const style of styles) {
    // Update each style to explicitly set organizationId to null
    await prisma.style.update({
      where: { id: style.id },
      data: { organizationId: null },
    })

    console.log(`✅ Updated: ${style.name.en}`)
    updated++
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`\n✅ Updated ${updated} styles with organizationId: null\n`)

  await prisma.$disconnect()
}

fixOrganizationIds().catch(console.error)
