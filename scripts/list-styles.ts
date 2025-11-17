/**
 * List all styles with their slugs and names
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listStyles() {
  const styles = await prisma.style.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
    },
  })

  console.log('\n📚 Styles in Database:\n')
  styles.forEach((style, i) => {
    console.log(`${i + 1}. ${style.name.en}`)
    console.log(`   Slug: ${style.slug}`)
    console.log(`   ID: ${style.id}\n`)
  })

  await prisma.$disconnect()
}

listStyles().catch(console.error)
