/**
 * Test Script: Verify Style Materials API Data
 * Run with: npx tsx scripts/test-materials-api.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get a style with links
  const style = await prisma.style.findFirst({
    where: { materialLinks: { some: {} } },
    select: { id: true, name: true }
  })

  if (!style) {
    console.log('No styles with material links found')
    return
  }

  console.log('Testing style:', style.name?.en)
  console.log('Style ID:', style.id)

  // Fetch materials like the API would
  const styleMaterials = await prisma.styleMaterial.findMany({
    where: { styleId: style.id },
    include: {
      material: {
        include: {
          category: true,
          texture: {
            select: { id: true, name: true, imageUrl: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'asc' },
    take: 5
  })

  console.log('\nMaterials found:', styleMaterials.length)
  styleMaterials.forEach((sm, i) => {
    console.log(`  ${i + 1}. ${(sm.material.name as any)?.en}`)
    console.log(`     Category: ${(sm.material.category?.name as any)?.en || 'N/A'}`)
    console.log(`     isAbstract: ${sm.material.isAbstract}`)
    console.log(`     textureId: ${sm.material.textureId || 'none'}`)
    console.log(`     thumbnail: ${(sm.material.assets as any)?.thumbnail ? 'Yes' : 'No'}`)
  })

  await prisma.$disconnect()
}

main().catch(console.error)
