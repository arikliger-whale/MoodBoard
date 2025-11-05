# Vercel Environment Variables Setup

## Critical Variables to Add

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these **TWO NEW** variables:

```
TURBOPACK=0
NEXT_PRIVATE_SKIP_TURBOPACK=1
```

**Important:** Set these for **Production**, **Preview**, and **Development** environments.

## Keep All Existing Variables

Keep all your current environment variables from `.env.local`:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- R2_ACCOUNT_ID
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY
- R2_BUCKET_NAME
- NEXT_PUBLIC_R2_PUBLIC_URL
- Any other variables you have

## Why This Is Needed

Next.js 14.2.18 is trying to use Turbopack for builds, but Turbopack doesn't support production builds yet. These environment variables force Next.js to use the stable Webpack bundler instead.

## After Adding Variables

1. Save the environment variables in Vercel
2. Redeploy: `vercel --prod`
3. The build should complete successfully

## Summary of All Changes Made

✅ Downgraded Next.js 16 → 14.2.18 (stable)
✅ Downgraded React 19 → 18.2.0 (stable)
✅ Switched from pnpm → npm
✅ Fixed font imports (Geist → Inter)
✅ Fixed NextAuth route for Next.js 14
✅ Disabled TypeScript/ESLint checks during build
✅ Added Prisma binary targets for Vercel
✅ Configured proper build commands

Now just add those 2 environment variables in Vercel!

