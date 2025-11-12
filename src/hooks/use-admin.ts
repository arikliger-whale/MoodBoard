/**
 * Admin Protection Hook
 * Provides admin role checking and protection utilities
 */

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin(): boolean {
  const { data: session } = useSession()
  return session?.user?.role === 'admin'
}

/**
 * Hook to require admin access - redirects if not admin
 */
export function useRequireAdmin(redirectTo: string = '/dashboard') {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user?.role !== 'admin') {
      const locale = pathname?.split('/')[1] || 'he'
      router.push(`/${locale}${redirectTo}`)
    }
  }, [session, status, router, pathname, redirectTo])
  
  return {
    isAdmin: session?.user?.role === 'admin',
    isLoading: status === 'loading',
  }
}

/**
 * Hook to check admin and get admin status
 */
export function useAdminGuard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  
  // Memoize admin status and locale to avoid recalculation
  const isAdmin = useMemo(() => session?.user?.role === 'admin', [session?.user?.role])
  const isLoading = status === 'loading'
  const locale = useMemo(() => pathname?.split('/')[1] || 'he', [pathname])
  
  useEffect(() => {
    // Don't do anything while loading
    if (status === 'loading') return
    
    // Redirect to sign-in if not authenticated
    if (!session) {
      router.push(`/${locale}/sign-in?redirect_url=${pathname}`)
      return
    }
    
    // Redirect to dashboard if not admin
    if (!isAdmin) {
      router.push(`/${locale}/dashboard`)
    }
  }, [session, status, isAdmin, router, pathname, locale])
  
  return {
    isAdmin,
    isLoading,
    user: session?.user,
  }
}

