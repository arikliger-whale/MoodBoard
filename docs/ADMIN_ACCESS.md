# Admin Access Guide

## Overview

The MoodB admin area provides platform-wide management capabilities. Access is restricted to users with the `admin` role.

## Protection Layers

### 1. **Next.js Middleware Protection** ✅
- All `/admin/*` routes are protected at the middleware level
- Checks JWT token and verifies `role === 'admin'`
- Redirects non-admin users to dashboard
- Redirects unauthenticated users to sign-in

**Location:** `src/middleware.ts`

### 2. **Server-Side Layout Protection** ✅
- Admin layout (`src/app/[locale]/(admin)/layout.tsx`) checks session
- Verifies user role before rendering admin UI
- Server-side redirect for non-admin users

### 3. **Client-Side Component Protection** ✅
- `AdminLayout` component uses `useAdminGuard()` hook
- Shows loading state while checking admin status
- Prevents rendering if user is not admin

**Location:** `src/components/layouts/AdminLayout.tsx`

### 4. **API Endpoint Protection** ✅
- All `/api/admin/*` endpoints use `withAdmin()` wrapper
- Checks authentication and admin role
- Returns 403 Forbidden for non-admin users

**Location:** `src/lib/api/admin-middleware.ts`

### 5. **React Query Hooks Protection** ✅
- Admin hooks (`useAdminStyles`, `useStyleApprovals`, etc.) check admin status
- Prevents API calls if user is not admin
- Redirects on 403 errors

**Location:** `src/hooks/useStyles.ts`

## How to Set a User as Admin

### Method 1: Using Script (Recommended)

```bash
# Set a user as admin by email
pnpm admin:set admin@example.com

# Or directly with Node.js
node scripts/set-admin.js admin@example.com
```

### Method 2: Direct Database Update

```typescript
// Using Prisma Studio or script
await prisma.user.update({
  where: { email: 'admin@example.com' },
  data: {
    role: 'admin',
    permissions: ['*'], // Grant all permissions
  },
})
```

### Method 3: MongoDB Direct Update

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { 
    $set: { 
      role: "admin",
      permissions: ["*"]
    } 
  }
)
```

## Admin Routes

All admin routes are prefixed with `/[locale]/admin`:

- `/admin` - Admin Dashboard
- `/admin/styles` - Global Styles Management
- `/admin/styles/[id]` - Style Detail
- `/admin/styles/[id]/edit` - Edit Style
- `/admin/styles/approvals` - Style Approvals
- `/admin/materials` - Materials Management (Coming Soon)
- `/admin/organizations` - Organizations Management (Coming Soon)
- `/admin/users` - Users Management (Coming Soon)

## Admin API Endpoints

All admin API endpoints are prefixed with `/api/admin`:

- `GET /api/admin/styles` - List global styles
- `POST /api/admin/styles` - Create global style
- `GET /api/admin/styles/[id]` - Get global style
- `PATCH /api/admin/styles/[id]` - Update global style
- `DELETE /api/admin/styles/[id]` - Delete global style
- `GET /api/admin/styles/approvals` - List pending approvals
- `POST /api/admin/styles/[id]/approve` - Approve/reject style

## Testing Admin Access

### 1. Set Yourself as Admin

```bash
pnpm tsx scripts/set-admin.ts your-email@example.com
```

### 2. Sign Out and Sign In Again

The session needs to refresh to pick up the new role.

### 3. Navigate to Admin Area

Visit `http://localhost:3000/he/admin` (or your locale)

### 4. Verify Protection

Try accessing `/admin` routes:
- ✅ Should work if you're admin
- ❌ Should redirect to dashboard if not admin
- ❌ Should redirect to sign-in if not authenticated

## Security Best Practices

1. **Limit Admin Users**: Only grant admin role to trusted users
2. **Audit Admin Actions**: All admin API calls should be logged (TODO)
3. **Regular Reviews**: Periodically review admin user list
4. **Role Verification**: Always verify role in both backend and frontend
5. **Session Refresh**: Ensure sessions refresh after role changes

## Troubleshooting

### "Access Denied" Even After Setting Admin

1. **Sign out and sign in again** - Session needs to refresh
2. **Check database** - Verify `role: 'admin'` in user document
3. **Check session** - Verify JWT token contains `role: 'admin'`
4. **Clear cookies** - Try clearing browser cookies and signing in again

### Middleware Not Working

1. **Check NEXTAUTH_SECRET** - Must be set in `.env.local`
2. **Check JWT callback** - Verify role is included in token
3. **Check middleware matcher** - Should match admin routes

### API Calls Return 403

1. **Check API middleware** - Verify `withAdmin()` wrapper is used
2. **Check token** - Verify JWT token includes admin role
3. **Check headers** - Ensure authentication headers are sent

## Related Files

- `src/middleware.ts` - Next.js middleware for route protection
- `src/app/[locale]/(admin)/layout.tsx` - Server-side layout protection
- `src/components/layouts/AdminLayout.tsx` - Client-side component protection
- `src/lib/api/admin-middleware.ts` - API endpoint protection
- `src/hooks/use-admin.ts` - Admin hooks and guards
- `src/hooks/useStyles.ts` - Protected admin hooks
- `scripts/set-admin.ts` - Admin role assignment script

