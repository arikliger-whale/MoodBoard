/**
 * Check if there are any admin users
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdminUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  console.log('\n👥 User Roles:\n')

  users.forEach((user, i) => {
    console.log(`${i + 1}. ${user.name || 'Unnamed'}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role || 'NULL'}`)
    console.log(`   Is Admin: ${user.role === 'admin' ? '✅ YES' : '❌ NO'}`)
    console.log('')
  })

  const adminCount = users.filter((u) => u.role === 'admin').length

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`\nSummary:`)
  console.log(`  Total users: ${users.length}`)
  console.log(`  Admin users: ${adminCount}`)

  if (adminCount === 0) {
    console.log(`\n⚠️  No admin users found!`)
    console.log(`To set a user as admin, run: npm run admin:set <email>\n`)
  }

  await prisma.$disconnect()
}

checkAdminUsers().catch(console.error)
