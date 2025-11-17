/**
 * Clean up old seed-generated URLs from database
 * Removes any URLs pointing to styles/seed-generated/ folder
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupOldUrls(execute = false) {
  console.log(`\n🧹 ${execute ? '' : '[DRY RUN] '}Cleaning up old seed-generated URLs...\n`)

  const styles = await prisma.style.findMany({
    select: {
      id: true,
      name: true,
      images: true,
    },
  })

  let totalCleaned = 0

  for (const style of styles) {
    const oldUrls = style.images.filter((url) =>
      url.includes('styles/seed-generated/')
    )
    const newUrls = style.images.filter(
      (url) => !url.includes('styles/seed-generated/')
    )

    if (oldUrls.length > 0) {
      console.log(`📦 ${style.name.en}`)
      console.log(`   Total images: ${style.images.length}`)
      console.log(`   Old URLs to remove: ${oldUrls.length}`)
      console.log(`   New URLs to keep: ${newUrls.length}`)

      if (execute) {
        await prisma.style.update({
          where: { id: style.id },
          data: { images: newUrls },
        })
        console.log(`   ✅ Cleaned up\n`)
      } else {
        console.log(`   [DRY RUN] Would keep ${newUrls.length} images\n`)
      }

      totalCleaned += oldUrls.length
    }
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`\n📊 Summary: ${totalCleaned} old URLs ${execute ? 'removed' : 'would be removed'}`)

  if (!execute) {
    console.log('\n💡 Add --execute to perform cleanup\n')
  } else {
    console.log('\n✅ Cleanup complete!\n')
  }

  await prisma.$disconnect()
}

const execute = process.argv.includes('--execute')
cleanupOldUrls(execute).catch(console.error)
