/**
 * Script to set a user as admin (JavaScript version)
 * Usage: node scripts/set-admin.js <user-email>
 * 
 * Example:
 * node scripts/set-admin.js admin@moodb.com
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function setAdmin(email) {
  try {
    console.log(`Setting user ${email} as admin...`)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      process.exit(1)
    }

    if (user.role === 'admin') {
      console.log(`✅ User ${email} is already an admin`)
      process.exit(0)
    }

    await prisma.user.update({
      where: { email },
      data: {
        role: 'admin',
        permissions: ['*'], // Grant all permissions
      },
    })

    console.log(`✅ Successfully set ${email} as admin`)
    console.log(`\nUser can now access:`)
    console.log(`  - /admin (Admin Dashboard)`)
    console.log(`  - /admin/styles (Global Styles Management)`)
    console.log(`  - /admin/styles/approvals (Style Approvals)`)
    console.log(`  - /admin/materials (Materials Management)`)
    console.log(`  - /admin/organizations (Organizations Management)`)
    console.log(`  - /admin/users (Users Management)`)
    console.log(`\n⚠️  Important: User must sign out and sign in again to refresh session`)
  } catch (error) {
    console.error('❌ Error setting admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide a user email')
  console.log('Usage: node scripts/set-admin.js <user-email>')
  console.log('Or: pnpm admin:set <user-email>')
  process.exit(1)
}

setAdmin(email)

