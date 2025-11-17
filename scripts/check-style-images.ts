/**
 * Quick script to check image URLs in a style
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStyle(styleId: string) {
  const style = await prisma.style.findUnique({
    where: { id: styleId },
    select: {
      id: true,
      name: true,
      images: true,
      roomProfiles: {
        select: {
          roomTypeId: true,
          images: true,
        },
      },
    },
  })

  if (!style) {
    console.log(`Style ${styleId} not found`)
    return
  }

  console.log(`\nStyle: ${style.name.en}`)
  console.log(`ID: ${style.id}`)
  console.log(`\nMain Images (${style.images.length}):`)
  style.images.forEach((url, i) => {
    console.log(`  ${i + 1}. ${url}`)
  })

  console.log(`\nRoom Profiles (${style.roomProfiles.length}):`)
  style.roomProfiles.forEach((rp, i) => {
    console.log(`  Profile ${i + 1}:`)
    console.log(`    Room Type ID: ${rp.roomTypeId}`)
    console.log(`    Images (${rp.images.length}):`)
    rp.images.forEach((url, j) => {
      console.log(`      ${j + 1}. ${url}`)
    })
  })

  await prisma.$disconnect()
}

const styleId = process.argv[2] || '691b4e90a247c7828180030d'
checkStyle(styleId).catch(console.error)
