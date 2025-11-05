import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth/auth-config"

// Ensure Node runtime for Prisma compatibility
export const runtime = 'nodejs'

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)

export const { GET, POST } = handlers

