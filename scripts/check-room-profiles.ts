/**
 * Check room profiles in styles
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkRoomProfiles() {
  const styles = await prisma.style.findMany({
    select: {
      id: true,
      name: true,
      images: true,
      roomProfiles: true,
    },
  })

  console.log('\n📊 Room Profiles Status:\n')

  let totalRoomProfiles = 0
  let stylesWithRoomProfiles = 0
  let totalRoomImages = 0

  for (const style of styles) {
    const roomProfileCount = style.roomProfiles?.length || 0
    const mainImageCount = style.images?.length || 0

    let roomImageCount = 0
    if (style.roomProfiles) {
      for (const profile of style.roomProfiles) {
        roomImageCount += profile.images?.length || 0
      }
    }

    console.log(`📦 ${style.name.en}`)
    console.log(`   Main Images: ${mainImageCount}`)
    console.log(`   Room Profiles: ${roomProfileCount}`)
    console.log(`   Room Images: ${roomImageCount}`)

    if (roomProfileCount > 0) {
      stylesWithRoomProfiles++
      totalRoomProfiles += roomProfileCount
      totalRoomImages += roomImageCount

      console.log(`   Room Profile Details:`)
      style.roomProfiles!.forEach((profile, i) => {
        console.log(`      ${i + 1}. RoomTypeId: ${profile.roomTypeId}`)
        console.log(`         Images: ${profile.images?.length || 0}`)
        if (profile.images && profile.images.length > 0) {
          profile.images.forEach((img, j) => {
            console.log(`            ${j + 1}. ${img}`)
          })
        }
      })
    }
    console.log('')
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`\nSummary:`)
  console.log(`  Total Styles: ${styles.length}`)
  console.log(`  Styles with Room Profiles: ${stylesWithRoomProfiles}`)
  console.log(`  Total Room Profiles: ${totalRoomProfiles}`)
  console.log(`  Total Room Images: ${totalRoomImages}\n`)

  await prisma.$disconnect()
}

checkRoomProfiles().catch(console.error)
