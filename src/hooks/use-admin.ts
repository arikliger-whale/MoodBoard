/**
 * Admin Protection Hook
 * Provides admin role checking and protection utilities
 */

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
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
  
  const isAdmin = session?.user?.role === 'admin'
  const isLoading = status === 'loading'
  
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      const locale = pathname?.split('/')[1] || 'he'
      router.push(`/${locale}/sign-in?redirect_url=${pathname}`)
      return
    }
    
    if (!isAdmin) {
      const locale = pathname?.split('/')[1] || 'he'
      router.push(`/${locale}/dashboard`)
    }
  }, [session, status, isAdmin, router, pathname])
  
  return {
    isAdmin,
    isLoading,
    user: session?.user,
  }
}

