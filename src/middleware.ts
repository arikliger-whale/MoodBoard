import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/request'
import { getToken } from 'next-auth/jwt'

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: locales,
  
  // Used when no locale matches
  defaultLocale: defaultLocale,
  
  // Always show locale prefix
  localePrefix: 'always',
})

/**
 * Admin route protection middleware
 * Checks if user is authenticated and has admin role before allowing access to /admin routes
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if path is an admin route
  const isAdminRoute = pathname.includes('/admin')
  
  if (isAdminRoute) {
    // Get JWT token from request
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    // Check if user is authenticated
    if (!token) {
      const locale = pathname.split('/')[1] || defaultLocale
      const signInUrl = new URL(`/${locale}/sign-in`, request.url)
      signInUrl.searchParams.set('redirect_url', pathname)
      return NextResponse.redirect(signInUrl)
    }
    
    // Check if user has admin role
    if (token.role !== 'admin') {
      const locale = pathname.split('/')[1] || defaultLocale
      const dashboardUrl = new URL(`/${locale}/dashboard`, request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }
  
  // Continue with internationalization middleware
  return intlMiddleware(request)
}

export const config = {
  // Match only internationalized pathnames and admin routes
  matcher: ['/', '/(he|en|ar)/:path*'],
}

