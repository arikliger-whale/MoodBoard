/**
 * Script to set a user as admin (TypeScript version)
 * Note: The npm script uses the JavaScript version (set-admin.js) to avoid tsx/esbuild issues
 * 
 * Usage: 
 *   pnpm admin:set <user-email>
 *   OR: node scripts/set-admin.js <user-email>
 * 
 * Example:
 *   pnpm admin:set admin@moodb.com
 */

import { prisma } from '../src/lib/db/prisma'

async function setAdmin(email: string) {
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
  console.log('Usage: pnpm tsx scripts/set-admin.ts <user-email>')
  process.exit(1)
}

setAdmin(email)

