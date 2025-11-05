import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth/auth-config"

// Force dynamic rendering
export const dynamic = 'force-dynamic'


// Ensure Node runtime for Prisma compatibility
export const runtime = 'nodejs'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

