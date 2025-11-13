# Authentication Troubleshooting Guide

**Last Updated:** 2025-11-13
**Status:** Resolved - All issues fixed in production

---

## Overview

This document details authentication issues encountered on Vercel production and their solutions. These issues stemmed from Edge Middleware's inability to read session cookies due to missing explicit cookie name configuration.

**TL;DR:** Always specify `cookieName` parameter when calling `getToken()` to match the cookie configuration in `auth-config.ts`.

---

## Issues Encountered

### 1. Redirect Loop on Sign-In (RESOLVED ✅)

**Symptoms:**
- User signs in successfully
- Gets redirected to `/he/dashboard`
- Immediately redirected back to `/he/sign-in`
- Infinite loop continues
- Warning in logs: `"Detected potential redirect loop, allowing request through"`

**Root Cause:**
Edge Middleware (running in `fra1`) couldn't read the session cookie that Lambda functions (running in `iad1`) could see. This caused:
1. User completes OAuth → Session created
2. Sign-in page sees session (via Lambda) → Redirects to dashboard
3. Middleware doesn't see session (Edge) → Redirects back to sign-in
4. Loop continues indefinitely

**Technical Details:**
```typescript
// ❌ BEFORE - Missing explicit cookieName
const token = await getToken({
  req: request,
  secret: process.env.NEXTAUTH_SECRET,
})
// Result: Edge Middleware couldn't find the cookie

// ✅ AFTER - Explicit cookieName
const cookieName = process.env.NODE_ENV === 'production'
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token'

const token = await getToken({
  req: request,
  secret: process.env.NEXTAUTH_SECRET,
  cookieName: cookieName,  // ← Must match auth-config.ts
})
```

---

### 2. API Routes Returning 401 Unauthorized (RESOLVED ✅)

**Symptoms:**
- User successfully authenticated
- Dashboard loads but shows no data
- Network tab shows:
  ```
  GET /api/projects?page=1&limit=5 → 401 Unauthorized
  GET /api/dashboard/stats → 401 Unauthorized
  ```
- All protected API routes fail with 401

**Root Cause:**
Same issue as redirect loop - API middleware couldn't read session cookies.

**Files Affected:**
- ✅ `/api/projects/*`
- ✅ `/api/clients/*`
- ✅ `/api/dashboard/*`
- ✅ `/api/admin/*` (all admin routes)
- ✅ `/api/upload/*`
- ✅ All routes using `withAuth()` or `withAdmin()` wrappers

**Fix Applied:**
```typescript
// File: src/lib/api/middleware.ts
export async function getAuthUser(req: NextRequest): Promise<AuthContext> {
  // ✅ Added explicit cookieName
  const cookieName = process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: cookieName,  // ← The fix
  })

  // ... rest of function
}
```

---

### 3. Sign-In Page Auto-Redirect with Stale Session (RESOLVED ✅)

**Symptoms:**
- Sign-in page briefly shows authenticated state
- Immediately triggers redirect
- Middleware doesn't see valid session
- Gets redirected back to sign-in
- Contributes to redirect loop

**Root Cause:**
`useSession()` hook was returning stale/cached session data without validating the user object exists.

**Fix Applied:**
```typescript
// File: src/app/[locale]/(auth)/sign-in/page.tsx

// ❌ BEFORE - Only checked isAuthenticated flag
if (!isLoading && isAuthenticated && !hasRedirected) {
  setTimeout(() => setShouldRedirect(true), 100)
}

// ✅ AFTER - Requires valid user object AND longer delay
if (!isLoading && isAuthenticated && user && user.id && !hasRedirected) {
  console.log('[SignIn] Authenticated with valid user, will redirect', { userId: user.id })
  setTimeout(() => setShouldRedirect(true), 500) // Increased from 100ms to 500ms
}
```

**Key Improvements:**
- ✅ Checks for valid `user` object with `id` field
- ✅ Increased delay from 100ms to 500ms for stability
- ✅ Added console logging for debugging
- ✅ Uses `window.location.href` instead of `router.replace` for full navigation

---

## Complete Fix Summary

### Files Modified

#### 1. `middleware.ts` (Root middleware)
**Changes:**
- ✅ Added explicit `cookieName` parameter to `getToken()`
- ✅ Added debug logging for cookie detection
- ✅ Replaced naive referer-based loop detection with cookie counter
- ✅ Added stale cookie cleanup

**Before:**
```typescript
// Line 35-42
let token = null
try {
  token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
} catch (error) {
  console.error('Error getting token in middleware:', error)
  token = null
}

// Line 48-58 - Flawed loop detection
const referer = request.headers.get('referer')
const isRedirectLoop = referer && referer.includes('/sign-in')

if (isRedirectLoop) {
  console.warn('Detected potential redirect loop, allowing request through')
  return intlMiddleware(request)
}
```

**After:**
```typescript
// Line 35-82
const cookieName = process.env.NODE_ENV === 'production'
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token'

let token = null
let hasInvalidToken = false

// Debug: Check if cookies exist
const hasDevCookie = request.cookies.has('authjs.session-token')
const hasProdCookie = request.cookies.has('__Secure-authjs.session-token')

if (isProtectedRoute) {
  console.log('[Middleware]', {
    path: pathname,
    hasDevCookie,
    hasProdCookie,
    cookieName,
    env: process.env.NODE_ENV,
  })
}

try {
  token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: cookieName,  // ← CRITICAL FIX
    raw: false,
  })

  if (isProtectedRoute) {
    console.log('[Middleware] Token result:', token ? { userId: token.id, email: token.email } : 'null')
  }
} catch (error) {
  console.error('[Middleware] Error getting token:', error)
  token = null
  hasInvalidToken = true
}

// Clear stale cookies
if (hasInvalidToken || (!token && (hasDevCookie || hasProdCookie))) {
  hasInvalidToken = true
  console.log('[Middleware] Invalid token detected, will clear cookies')
}

// Line 85-90 - Cookie-based loop detection
const redirectCountCookie = request.cookies.get('_redirect_count')
const redirectCount = redirectCountCookie ? parseInt(redirectCountCookie.value) : 0

if (redirectCount > 2) {
  console.warn('Exceeded redirect limit, allowing request through to prevent loop')
  const response = intlMiddleware(request)
  response.cookies.delete('_redirect_count')
  return response
}

// Set redirect counter cookie
response.cookies.set('_redirect_count', String(redirectCount + 1), {
  maxAge: 30,  // Auto-expires after 30 seconds
  httpOnly: true,
  sameSite: 'lax',
})

// Clear stale session cookies
if (hasInvalidToken) {
  response.cookies.delete('authjs.session-token')
  response.cookies.delete('__Secure-authjs.session-token')
}
```

---

#### 2. `src/lib/api/middleware.ts` (API middleware)
**Changes:**
- ✅ Added explicit `cookieName` parameter to `getToken()`

**Before:**
```typescript
// Line 31-35
export async function getAuthUser(req: NextRequest): Promise<AuthContext> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })
```

**After:**
```typescript
// Line 31-41
export async function getAuthUser(req: NextRequest): Promise<AuthContext> {
  // Must match cookie configuration in auth-config.ts
  const cookieName = process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: cookieName,  // ← CRITICAL FIX
  })
```

---

#### 3. `src/app/[locale]/(auth)/sign-in/page.tsx` (Sign-in page)
**Changes:**
- ✅ Strengthened authentication check to require valid user object
- ✅ Increased redirect delay from 100ms to 500ms
- ✅ Added console logging for debugging
- ✅ Changed to `window.location.href` for full navigation

**Before:**
```typescript
// Line 20-37
const [isSigningIn, setIsSigningIn] = useState(false)
const [hasRedirected, setHasRedirected] = useState(false)

useEffect(() => {
  if (!isLoading && isAuthenticated && !hasRedirected) {
    setHasRedirected(true)
    const redirectUrl = searchParams.get('redirect_url') || `/${locale}/dashboard`

    const timer = setTimeout(() => {
      router.replace(redirectUrl)
    }, 100)

    return () => clearTimeout(timer)
  }
}, [isAuthenticated, isLoading, searchParams, locale, hasRedirected, router])
```

**After:**
```typescript
// Line 20-52
const [isSigningIn, setIsSigningIn] = useState(false)
const [hasRedirected, setHasRedirected] = useState(false)
const [shouldRedirect, setShouldRedirect] = useState(false)

// First effect: Validate authentication
useEffect(() => {
  // Only redirect if we have BOTH isAuthenticated AND valid user object
  if (!isLoading && isAuthenticated && user && user.id && !hasRedirected) {
    console.log('[SignIn] Authenticated with valid user, will redirect', { userId: user.id })
    const timer = setTimeout(() => {
      setShouldRedirect(true)
    }, 500) // Increased to 500ms for better stability

    return () => clearTimeout(timer)
  } else if (!isLoading && !isAuthenticated) {
    console.log('[SignIn] Not authenticated, staying on sign-in page')
  }
}, [isAuthenticated, isLoading, hasRedirected, user])

// Second effect: Perform redirect
useEffect(() => {
  if (shouldRedirect && isAuthenticated && user && user.id && !hasRedirected) {
    setHasRedirected(true)
    const redirectUrl = searchParams.get('redirect_url') || `/${locale}/dashboard`
    console.log('[SignIn] Redirecting to:', redirectUrl)

    // Use window.location for full navigation
    window.location.href = redirectUrl
  }
}, [shouldRedirect, isAuthenticated, hasRedirected, searchParams, locale, user])
```

---

## Why These Fixes Work

### The Core Problem

NextAuth.js allows custom cookie configuration via `authOptions.cookies`:

```typescript
// File: src/lib/auth/auth-config.ts
export const authOptions: NextAuthOptions = {
  // ...
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'  // Custom production name
        : 'authjs.session-token',           // Custom dev name
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production'
          ? '.moodboard.co.il'  // Share across subdomains
          : undefined,
      },
    },
  },
}
```

**The Issue:**
When you configure custom cookie names, `getToken()` **does not automatically detect them**. You must explicitly pass the `cookieName` parameter.

**Default Behavior (when you don't specify cookieName):**
`getToken()` tries to read cookies with these names:
- Production: `__Secure-next-auth.session-token`
- Development: `next-auth.session-token`

**Our Custom Names:**
- Production: `__Secure-authjs.session-token` ← Different prefix!
- Development: `authjs.session-token` ← Different prefix!

**Result:** `getToken()` looked for the wrong cookie names and always returned `null`, even when valid sessions existed.

---

### Why It Only Failed on Vercel

**Local Development:**
- Single Node.js process
- Consistent cookie handling
- Race conditions less likely
- Session cache works better

**Vercel Production:**
- Edge Middleware (Frankfurt region) handles routing
- Lambda functions (US region) handle API routes
- Multi-region cookie sync can lag
- Edge has stricter cookie requirements
- Stale cookies more likely to persist

---

## Testing Guide

### How to Test the Fixes

#### 1. Test Authentication Flow
```bash
# Clear browser cookies first
1. Open https://app.moodboard.co.il in incognito
2. Click "Sign in with Google"
3. Complete OAuth flow
4. ✅ SHOULD: Redirect to /he/dashboard successfully
5. ✅ SHOULD NOT: Redirect back to sign-in (no loop)
```

#### 2. Test API Authentication
```bash
# After signing in, open DevTools → Network tab
1. Refresh /he/dashboard
2. Check these API calls:
   ✅ GET /api/dashboard/stats → 200 OK
   ✅ GET /api/projects?page=1&limit=5 → 200 OK
3. ✅ SHOULD NOT: See any 401 Unauthorized errors
```

#### 3. Test Middleware Logging
```bash
# Check Vercel function logs
vercel logs --follow

# Look for these log messages:
✅ [Middleware] { path: '/he/dashboard', hasDevCookie: false, hasProdCookie: true, ... }
✅ [Middleware] Token result: { userId: 'xxx', email: 'xxx' }
✅ [SignIn] Authenticated with valid user, will redirect
```

#### 4. Test Cookie Inspection
```bash
# In Chrome DevTools
1. Application → Cookies → https://app.moodboard.co.il
2. Check for cookie: __Secure-authjs.session-token
3. Verify properties:
   ✅ Domain: .moodboard.co.il
   ✅ Path: /
   ✅ Secure: ✓
   ✅ HttpOnly: ✓
   ✅ SameSite: Lax
```

---

## Debugging Checklist

If you encounter authentication issues on Vercel:

### Step 1: Check Middleware Logs
```bash
vercel logs --follow
```

Look for:
- ✅ `[Middleware]` entries showing cookie detection
- ✅ `[Middleware] Token result:` showing successful token parsing
- ❌ `Error getting token in middleware` (indicates token parsing failure)
- ❌ `Authentication required` (indicates no token found)

### Step 2: Check Browser Console
Open DevTools Console and look for:
- ✅ `[SignIn] Authenticated with valid user, will redirect`
- ❌ `[SignIn] Not authenticated, staying on sign-in page` (when you should be authenticated)

### Step 3: Check Network Tab
Open DevTools → Network:
- ✅ API calls should show `200 OK`
- ❌ `401 Unauthorized` indicates API middleware can't read session
- Check `Cookie` header in request - should include `__Secure-authjs.session-token`

### Step 4: Verify Environment Variables
In Vercel dashboard → Settings → Environment Variables:
- ✅ `NEXTAUTH_SECRET` is set (same across all environments)
- ✅ `NEXTAUTH_URL` = `https://app.moodboard.co.il`
- ✅ `GOOGLE_CLIENT_ID` is set
- ✅ `GOOGLE_CLIENT_SECRET` is set
- ✅ `NODE_ENV` = `production` (automatically set by Vercel)

### Step 5: Check Cookie Configuration
Verify `src/lib/auth/auth-config.ts`:
```typescript
cookies: {
  sessionToken: {
    name: process.env.NODE_ENV === 'production'
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token',
```

Verify middleware uses matching name:
```typescript
// middleware.ts AND src/lib/api/middleware.ts
const cookieName = process.env.NODE_ENV === 'production'
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token'

const token = await getToken({
  req: request,
  secret: process.env.NEXTAUTH_SECRET,
  cookieName: cookieName,  // ← MUST match auth-config.ts
})
```

---

## Common Mistakes to Avoid

### ❌ DON'T: Call getToken() without cookieName
```typescript
// This will fail if you have custom cookie names
const token = await getToken({
  req: request,
  secret: process.env.NEXTAUTH_SECRET,
})
```

### ✅ DO: Always specify cookieName
```typescript
const cookieName = process.env.NODE_ENV === 'production'
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token'

const token = await getToken({
  req: request,
  secret: process.env.NEXTAUTH_SECRET,
  cookieName: cookieName,
})
```

### ❌ DON'T: Use referer-based loop detection
```typescript
// Naive approach - allows unauthenticated access
const isRedirectLoop = referer && referer.includes('/sign-in')
if (isRedirectLoop) {
  return intlMiddleware(request) // Bypasses auth!
}
```

### ✅ DO: Use cookie-based counter with expiry
```typescript
const redirectCount = request.cookies.get('_redirect_count')?.value || 0
if (redirectCount > 2) {
  // Safety net only
  const response = intlMiddleware(request)
  response.cookies.delete('_redirect_count')
  return response
}
response.cookies.set('_redirect_count', String(redirectCount + 1), {
  maxAge: 30, // Auto-expires
})
```

### ❌ DON'T: Redirect on isAuthenticated flag alone
```typescript
// Can trigger on stale cached sessions
if (isAuthenticated) {
  router.replace('/dashboard')
}
```

### ✅ DO: Validate user object exists
```typescript
// Ensures session is actually valid
if (isAuthenticated && user && user.id) {
  window.location.href = '/dashboard'
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Cookie: __Secure-authjs.session-token=JWT_TOKEN      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ├─────────────────────────────────────┐
                      │                                      │
                      ▼                                      ▼
        ┌─────────────────────────┐          ┌─────────────────────────┐
        │   Vercel Edge (fra1)    │          │  Vercel Lambda (iad1)   │
        │                         │          │                         │
        │  middleware.ts          │          │  API Routes             │
        │  ├─ getToken()          │          │  ├─ withAuth()          │
        │  │  └─ cookieName: ✅   │          │  │  └─ getAuthUser()   │
        │  │                      │          │  │     └─ getToken()   │
        │  └─ Auth check          │          │  │        └─ cookieName: ✅│
        │     └─ Redirect logic   │          │  │                      │
        │                         │          │  └─ Business logic      │
        └─────────────────────────┘          └─────────────────────────┘
                 │                                       │
                 └───────────────┬───────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   NextAuth.js Core     │
                    │                        │
                    │  auth-config.ts        │
                    │  ├─ cookies:           │
                    │  │  sessionToken:      │
                    │  │    name: '__Secure-authjs.session-token' │
                    │  │                     │
                    │  └─ jwt() callback     │
                    │     └─ Verifies JWT    │
                    └────────────────────────┘
```

**Key Points:**
1. ✅ Cookie name MUST match in all 3 places:
   - `auth-config.ts` (defines it)
   - `middleware.ts` (reads it for routing)
   - `src/lib/api/middleware.ts` (reads it for API auth)

2. ✅ Edge Middleware and Lambda Functions are in different regions
   - Must use explicit cookie names for consistency
   - Edge has stricter cookie requirements

3. ✅ Single fix in `getAuthUser()` covers ALL API routes
   - All routes use `withAuth()` or `withAdmin()` wrappers
   - Both wrappers call `getAuthUser()`
   - No direct `getToken()` calls in route handlers

---

## Prevention Guidelines

### For Future Development

**When adding new API routes:**
```typescript
// ✅ ALWAYS use wrappers
export const GET = withAuth(async (req, auth) => {
  // auth.userId and auth.organizationId are already available
})

// ❌ NEVER call getToken() directly in routes
export const GET = async (req: NextRequest) => {
  const token = await getToken({ ... }) // Don't do this
}
```

**When adding new middleware:**
```typescript
// ✅ ALWAYS specify cookieName
const cookieName = process.env.NODE_ENV === 'production'
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token'

const token = await getToken({
  req: request,
  secret: process.env.NEXTAUTH_SECRET,
  cookieName: cookieName,
})
```

**When modifying auth-config.ts:**
```typescript
// ⚠️ If you change cookie names, update:
// 1. auth-config.ts (cookie definition)
// 2. middleware.ts (getToken cookieName)
// 3. src/lib/api/middleware.ts (getToken cookieName)
```

### Code Review Checklist

When reviewing auth-related PRs, check:
- [ ] All `getToken()` calls include `cookieName` parameter
- [ ] Cookie names match between `auth-config.ts` and middleware files
- [ ] New API routes use `withAuth()` or `withAdmin()` wrappers
- [ ] No direct session access without proper error handling
- [ ] Redirect logic includes loop prevention
- [ ] Client-side auth checks validate user object, not just flags

---

## Related Documentation

- [AUTHENTICATION.md](./AUTHENTICATION.md) - General authentication setup
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - General debugging guide
- [NextAuth.js Documentation](https://authjs.dev/) - Official NextAuth docs
- [Vercel Edge Middleware](https://vercel.com/docs/functions/edge-middleware) - Edge runtime docs

---

## Support

If you encounter authentication issues not covered in this guide:

1. **Check Recent Changes:**
   ```bash
   git log --oneline --grep="auth" -10
   git log --oneline --grep="middleware" -10
   ```

2. **Review Vercel Logs:**
   ```bash
   vercel logs --follow
   # Filter for errors
   vercel logs --follow | grep -i "error\|401\|unauthorized"
   ```

3. **Enable Debug Mode (temporarily):**
   ```bash
   # In .env.local
   AUTH_DEBUG=true
   ```
   ⚠️ **Warning:** Debug mode logs sensitive data. Only enable temporarily!

4. **Contact Team:**
   - Share Vercel logs
   - Include browser console output
   - Provide network tab screenshots showing 401 errors
   - Note exact steps to reproduce

---

## Changelog

### 2025-11-13 - Initial Fix Deployment
- ✅ Fixed redirect loop by adding explicit `cookieName` to middleware
- ✅ Fixed API 401 errors by adding explicit `cookieName` to API middleware
- ✅ Strengthened sign-in page authentication checks
- ✅ Added debug logging throughout auth flow
- ✅ Replaced naive referer-based loop detection with cookie counter
- ✅ Added automatic stale cookie cleanup

**Commits:**
- `fix: resolve Edge middleware cookie detection and redirect loop`
- `fix: resolve API authentication with explicit cookie name`

**Impact:**
- All authentication issues resolved in production
- No more redirect loops
- All API routes working correctly
- Improved debugging capabilities

---

**End of Document**
