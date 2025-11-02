/**
 * NextAuth.js Authentication Utilities
 * Handles authentication checks, user sessions, and organization access
 */

import { auth } from "@/lib/auth/auth-instance"
import { prisma } from "@/lib/db/prisma"
import { redirect } from 'next/navigation'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string | null
  firstName: string | null
  lastName: string | null
  image: string | null
  organizationId: string | null
  role: string | null
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return null
    }

    // Get user from database with organization
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        organization: true,
      },
    })

    if (!dbUser) {
      return null
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      firstName: dbUser.profile?.firstName || null,
      lastName: dbUser.profile?.lastName || null,
      image: dbUser.image,
      organizationId: dbUser.organizationId || null,
      role: dbUser.role || null,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  return user
}

/**
 * Require organization membership
 */
export async function requireOrganization(): Promise<{ user: AuthenticatedUser; organizationId: string }> {
  const user = await requireAuth()
  
  if (!user.organizationId) {
    redirect('/onboarding')
  }
  
  return {
    user,
    organizationId: user.organizationId,
  }
}

/**
 * Get session from NextAuth
 */
export async function getSession() {
  return await auth()
}

/**
 * Check if user has permission
 */
export async function hasPermission(
  userId: string,
  permission: string,
  organizationId: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.organizationId !== organizationId) {
      return false
    }

    // Check permissions array
    if (user.permissions.includes('*') || user.permissions.includes(permission)) {
      return true
    }

    // Check role-based permissions
    if (user.role === 'designer_owner') {
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(organizationId: string) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        users: {
          include: {
            profile: true,
          },
        },
      },
    })
    
    return {
      organization,
      members: organization?.users || [],
    }
  } catch (error) {
    console.error('Error getting organization members:', error)
    return null
  }
}
