/**
 * Migration Script: Link Materials to Styles
 *
 * This script retroactively creates StyleMaterial links for styles
 * that have requiredMaterials in their detailedContent.
 *
 * Run with: npx tsx scripts/link-materials-to-styles.ts
 */

import { PrismaClient } from '@prisma/client'
import { findOrCreateMaterialsForStyle } from '../src/lib/seed/material-generator'

const prisma = new PrismaClient()

async function main() {
  console.log('🔗 Starting Material-to-Style Linking Migration...\n')

  // Find all styles with requiredMaterials
  const styles = await prisma.style.findMany({
    select: {
      id: true,
      name: true,
      priceLevel: true,
      detailedContent: true,
      materialLinks: { select: { id: true } }
    }
  })

  let processed = 0
  let linked = 0

  for (const style of styles) {
    const detailedContent = style.detailedContent as any
    const requiredMaterials = detailedContent?.en?.requiredMaterials

    if (!requiredMaterials || requiredMaterials.length === 0) {
      continue
    }

    // Skip if already has links
    if (style.materialLinks.length > 0) {
      console.log(`⏭️  Skipping "${style.name?.en}" - already has ${style.materialLinks.length} links`)
      continue
    }

    console.log(`\n📦 Processing: ${style.name?.en}`)
    console.log(`   Materials to link: ${requiredMaterials.length}`)
    console.log(`   Price Level: ${style.priceLevel}`)

    try {
      const materialIds = await findOrCreateMaterialsForStyle(
        style.id,
        requiredMaterials,
        {
          priceLevel: style.priceLevel as 'REGULAR' | 'LUXURY',
          generateImages: false, // Don't generate images in migration
          maxMaterials: 20,
        }
      )

      console.log(`   ✅ Linked ${materialIds.length} materials`)
      linked += materialIds.length
      processed++
    } catch (error) {
      console.error(`   ❌ Error processing style:`, error)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Migration Summary:')
  console.log(`   Styles processed: ${processed}`)
  console.log(`   Total material links created: ${linked}`)

  // Verify results
  const totalLinks = await prisma.styleMaterial.count()
  const abstractMaterials = await prisma.material.count({ where: { isAbstract: true } })
  const materialsWithTexture = await prisma.material.count({ where: { textureId: { not: null } } })

  console.log('\n📈 Database Stats:')
  console.log(`   StyleMaterial records: ${totalLinks}`)
  console.log(`   Abstract Materials: ${abstractMaterials}`)
  console.log(`   Materials with textureId: ${materialsWithTexture}`)

  await prisma.$disconnect()
  console.log('\n✅ Migration complete!')
}

main().catch((error) => {
  console.error('❌ Migration failed:', error)
  process.exit(1)
})
