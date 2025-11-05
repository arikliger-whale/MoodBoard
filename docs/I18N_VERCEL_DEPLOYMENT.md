# next-intl Vercel Deployment Fix

**Date:** November 5, 2025
**Issue:** "Couldn't find next-intl config file" error on Vercel
**Status:** ✅ RESOLVED

---

## Problem Description

### Symptoms
After deploying to Vercel, the application failed with:
- **Error:** "Couldn't find next-intl config file. Please follow the instructions at https://next-intl.dev/docs/getting-started/app-router"
- **HTTP Status:** 500 Internal Server Error
- **Error Digest:** 3601421155
- **Browser Error:** "An error occurred in the Server Components render"
- **Console Warnings:** CSS preload warnings

### What Worked Locally
- Build succeeded locally: `npm run build` ✅
- Development server worked: `npm run dev` ✅
- All routes compiled correctly ✅

### What Failed on Vercel
- Runtime error in serverless functions ❌
- Pages couldn't render ❌
- Application completely broken ❌

---

## Root Cause Analysis

The issue was caused by **conflicting Turbopack configurations** that prevented next-intl from properly resolving its configuration file in Vercel's serverless environment.

### Technical Details

1. **next-intl Plugin Requirement**
   - next-intl uses a webpack/turbopack plugin to inject module aliases
   - These aliases allow the framework to locate the i18n configuration at runtime
   - Without proper plugin configuration, the config file cannot be found

2. **Next.js 14.2 Turbopack Support**
   - Next.js 14.2 uses `experimental.turbo: {}` for Turbopack configuration
   - Next.js 15+ uses `turbopack: {}` (top-level key)
   - next-intl requires this object to exist, even if empty

3. **Configuration Conflict**
   - Environment variables were explicitly disabling Turbopack:
     ```javascript
     process.env.TURBOPACK = '0'
     process.env.NEXT_PRIVATE_SKIP_TURBOPACK = '1'
     ```
   - This prevented the `experimental.turbo: {}` config from working
   - Result: next-intl couldn't inject its module aliases

4. **Serverless Bundling**
   - Vercel's serverless functions require proper module resolution
   - Without the Turbopack config space, next-intl couldn't bundle correctly
   - Build succeeded but runtime failed

---

## Solution Implemented

### Changes Made

#### 1. Config File Location (src/i18n/request.ts)
```typescript
import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const locales = ['he', 'en'] as const
export const defaultLocale = 'he' as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || defaultLocale

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Asia/Jerusalem',
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
      },
      number: {
        precise: {
          maximumFractionDigits: 2,
        },
      },
    },
  }
})
```

#### 2. Next.js Configuration (next.config.mjs)
```javascript
import createNextIntlPlugin from 'next-intl/plugin'

// Explicitly specify path to i18n config for Vercel serverless bundling
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for next-intl to properly resolve config in Next.js 14.2
  experimental: {
    turbo: {},
  },

  reactStrictMode: true,
  // ... rest of config
}

export default withNextIntl(nextConfig)
```

**Key Points:**
- ✅ Removed conflicting Turbopack disable env vars
- ✅ Added `experimental.turbo: {}` (required for Next.js 14.2)
- ✅ Explicitly specified config path: `'./src/i18n/request.ts'`
- ✅ Config file at standard location for proper bundling

#### 3. Middleware Update (middleware.ts)
```typescript
import { locales, defaultLocale } from './src/i18n/request'
```

Updated import path to match the new config location.

---

## Version-Specific Notes

### Next.js 14.2 (Current)
```javascript
experimental: {
  turbo: {},
}
```

### Next.js 15+ (Future)
```javascript
turbopack: {},
```

When upgrading to Next.js 15, change the config key from `experimental.turbo` to top-level `turbopack`.

---

## Verification Steps

### 1. Build Verification
```bash
npm run build
```
Should complete successfully with no errors.

### 2. Local Testing
```bash
npm run dev
```
Application should run on http://localhost:3000 with proper i18n.

### 3. Vercel Deployment
```bash
git push origin main
```
Should deploy successfully with:
- ✅ Build completes in ~2 minutes
- ✅ No runtime errors in logs
- ✅ Application accessible at https://app.moodboard.co.il
- ✅ HTTP 307 redirects work correctly
- ✅ Pages render with proper locale (Hebrew/English)

### 4. Production Verification
```bash
# Test site
curl -I https://app.moodboard.co.il/he

# Should return:
# HTTP/2 307
# (redirect to sign-in or dashboard)
```

### 5. Check Logs
```bash
vercel logs <deployment-url>
```
Should NOT contain:
- ❌ "Couldn't find next-intl config file"
- ❌ Error digest 3601421155

---

## Common Pitfalls & Troubleshooting

### Issue: "Still getting config file error"
**Symptoms:** Error persists after applying fix
**Causes:**
1. Cached deployment on Vercel
2. Wrong Next.js version (turbo vs turbopack)
3. Config file not at standard location

**Solutions:**
```bash
# Clear Vercel build cache
vercel --force

# Verify Next.js version
cat package.json | grep '"next"'

# Verify config file exists
ls -la src/i18n/request.ts
```

### Issue: "Build succeeds but runtime fails"
**Symptoms:** Build passes, but pages return 500
**Cause:** Turbopack config conflict

**Solution:**
1. Remove ALL Turbopack disable env vars from next.config.mjs
2. Keep only `experimental.turbo: {}` (or `turbopack: {}` for Next.js 15+)
3. Redeploy

### Issue: "Module not found" errors
**Symptoms:** Can't resolve './src/i18n/request'
**Cause:** Incorrect import paths in middleware or other files

**Solution:**
Update all imports to use the correct path:
```typescript
// ✅ Correct
import { locales, defaultLocale } from './src/i18n/request'

// ❌ Wrong
import { locales, defaultLocale } from './i18n'
```

---

## Technical References

### Why This Works

1. **Standard Location:** `./src/i18n/request.ts` is the documented standard location for next-intl config in projects using the `src` directory.

2. **Plugin Path Resolution:** By explicitly specifying the path in `createNextIntlPlugin('./src/i18n/request.ts')`, we ensure the plugin knows exactly where to inject module aliases.

3. **Turbopack Config Space:** The `experimental.turbo: {}` object provides a configuration space where next-intl can safely inject its required module resolution settings.

4. **No Conflicts:** Removing the Turbopack disable env vars ensures the experimental config actually works.

### Serverless Bundling

Vercel's serverless functions require:
- Static module resolution at build time
- Proper webpack/turbopack configuration
- All dependencies bundled correctly

The fix ensures all three requirements are met.

---

## Related Documentation

- **next-intl Docs:** https://next-intl.dev/docs/getting-started/app-router
- **Next.js Turbopack:** https://nextjs.org/docs/app/api-reference/turbopack
- **Vercel Deployment:** https://vercel.com/docs/deployments

### Related Files
- `VERCEL_DEPLOYMENT.md` - General Vercel deployment guide
- `VERCEL_BUILD_FIX.md` - Build optimization guide
- `AUTHENTICATION.md` - Auth + i18n middleware setup

---

## Migration Guide

If you're experiencing the same issue:

### Step 1: Verify Your Setup
```bash
# Check Next.js version
cat package.json | grep '"next"'

# Check next-intl version
cat package.json | grep '"next-intl"'
```

### Step 2: Move Config to Standard Location
```bash
# If you have i18n.ts at root
mv i18n.ts src/i18n/request.ts

# Update import paths in middleware
sed -i '' "s/from '\.\/i18n'/from '.\/src\/i18n\/request'/" middleware.ts
```

### Step 3: Update next.config.mjs
```javascript
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig = {
  // For Next.js 14.2
  experimental: {
    turbo: {},
  },
  // ... your other config
}

export default withNextIntl(nextConfig)
```

### Step 4: Remove Conflicts
Remove these lines from next.config.mjs:
```javascript
// ❌ Remove these
process.env.TURBOPACK = '0'
process.env.NEXT_PRIVATE_SKIP_TURBOPACK = '1'
```

### Step 5: Test & Deploy
```bash
# Test locally
npm run build
npm run start

# Deploy to Vercel
git add .
git commit -m "fix: configure next-intl for Vercel deployment"
git push origin main
```

---

## Lessons Learned

1. **Read the Docs Carefully:** next-intl has specific requirements for serverless deployment that aren't immediately obvious.

2. **Don't Mix Bundlers:** If using Turbopack config for plugins, don't explicitly disable Turbopack with env vars.

3. **Standard Locations Matter:** Using documented standard file locations (`./src/i18n/request.ts`) prevents many issues.

4. **Version Matters:** Next.js 14.2 uses different config keys than Next.js 15+. Always check the version.

5. **Build ≠ Runtime:** Just because the build succeeds doesn't mean runtime will work, especially in serverless environments.

---

## Future Considerations

### Upgrading to Next.js 15

When upgrading, change:
```javascript
// Old (Next.js 14.2)
experimental: {
  turbo: {},
}

// New (Next.js 15+)
turbopack: {},
```

### Monitoring

Add monitoring for:
- i18n initialization errors
- Missing translation keys
- Locale switching failures

### Performance

The current setup is optimized for:
- Fast serverless cold starts
- Efficient bundle sizes
- Proper tree-shaking

No additional optimization needed.

---

**Last Updated:** November 5, 2025
**Tested With:**
- Next.js: 14.2.18
- next-intl: 4.4.0
- Node.js: 20+
- Vercel: Latest

**Status:** ✅ Production Ready
