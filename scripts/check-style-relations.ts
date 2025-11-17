/**
 * Check if all styles have required relations
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStyleRelations() {
  const styles = await prisma.style.findMany({
    include: {
      category: true,
      subCategory: true,
      approach: true,
      color: true,
    },
  })

  console.log('\n🔍 Checking Style Relations:\n')

  let hasAllRelations = 0
  let missingRelations = 0

  for (const style of styles) {
    const missing: string[] = []

    if (!style.category) missing.push('category')
    if (!style.subCategory) missing.push('subCategory')
    if (!style.approach) missing.push('approach')
    if (!style.color) missing.push('color')

    console.log(`📦 ${style.name.en}`)
    console.log(`   Category: ${style.category ? '✅' : '❌'} ${style.category?.name.en || 'MISSING'}`)
    console.log(`   SubCategory: ${style.subCategory ? '✅' : '❌'} ${style.subCategory?.name.en || 'MISSING'}`)
    console.log(`   Approach: ${style.approach ? '✅' : '❌'} ${style.approach?.name.en || 'MISSING'}`)
    console.log(`   Color: ${style.color ? '✅' : '❌'} ${style.color?.name.en || 'MISSING'}`)

    if (missing.length > 0) {
      console.log(`   ⚠️  Missing: ${missing.join(', ')}`)
      missingRelations++
    } else {
      hasAllRelations++
    }
    console.log('')
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`\nSummary:`)
  console.log(`  Complete: ${hasAllRelations}`)
  console.log(`  Missing relations: ${missingRelations}`)
  console.log(`  Total: ${styles.length}\n`)

  await prisma.$disconnect()
}

checkStyleRelations().catch(console.error)
