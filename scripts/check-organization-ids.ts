/**
 * Check organizationId values for all styles
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkOrganizationIds() {
  const styles = await prisma.style.findMany({
    select: {
      id: true,
      name: true,
      organizationId: true,
      metadata: true,
    },
  })

  console.log('\n📊 Style Organization IDs:\n')

  let nullCount = 0
  let notNullCount = 0

  styles.forEach((style, i) => {
    console.log(`${i + 1}. ${style.name.en}`)
    console.log(`   ID: ${style.id}`)
    console.log(`   Organization ID: ${style.organizationId === null ? 'NULL (global)' : style.organizationId}`)
    console.log(`   AI Generated: ${style.metadata.aiGenerated || false}`)
    console.log('')

    if (style.organizationId === null) {
      nullCount++
    } else {
      notNullCount++
    }
  })

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`\nSummary:`)
  console.log(`  Global (organizationId = null): ${nullCount}`)
  console.log(`  Organization-specific: ${notNullCount}`)
  console.log(`  Total: ${styles.length}\n`)

  await prisma.$disconnect()
}

checkOrganizationIds().catch(console.error)
