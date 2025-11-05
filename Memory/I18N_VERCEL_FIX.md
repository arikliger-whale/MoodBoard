# next-intl Vercel Fix Summary

**Date:** November 5, 2025
**Status:** ✅ RESOLVED

---

## Quick Reference

### The Problem
```
Error: Couldn't find next-intl config file
Digest: 3601421155
Status: 500 on Vercel (worked locally)
```

### The Solution
**Root Cause:** Conflicting Turbopack configuration preventing next-intl from resolving config file in Vercel serverless environment.

**Fix:**
1. Move config to standard location: `src/i18n/request.ts`
2. Add `experimental.turbo: {}` to next.config.mjs
3. Remove Turbopack disable env vars
4. Explicitly specify config path in plugin

---

## Implementation

### 1. Config File (src/i18n/request.ts)
```typescript
import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const locales = ['he', 'en'] as const
export const defaultLocale = 'he' as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || defaultLocale
  if (!locales.includes(locale as Locale)) notFound()

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Asia/Jerusalem',
  }
})
```

### 2. Next Config (next.config.mjs)
```javascript
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig = {
  experimental: { turbo: {} }, // Required for Next.js 14.2
  // ... rest of config
}

export default withNextIntl(nextConfig)
```

### 3. Middleware Update
```typescript
import { locales, defaultLocale } from './src/i18n/request'
```

---

## What Was Changed

### Commits
1. `d86762f` - Initial attempt: explicitly specify config path
2. `35c22dc` - Move config to standard src/i18n/request.ts location
3. `2cdf585` - Add turbopack config object
4. `be7d02c` - Use experimental.turbo for Next.js 14.2
5. `7c5e08b` - Remove conflicting Turbopack disable env vars ✅

### Files Modified
- `src/i18n/request.ts` - Created (moved from root i18n.ts)
- `next.config.mjs` - Added experimental.turbo, removed env vars
- `middleware.ts` - Updated import path
- `i18n.ts` - Deleted (consolidated into src/i18n/request.ts)

---

## Verification

### ✅ Build
```bash
npm run build
# Should complete successfully
```

### ✅ Deployment
```bash
git push origin main
# Should deploy without errors
```

### ✅ Runtime
```bash
curl -I https://app.moodboard.co.il/he
# HTTP/2 307 (redirect - correct!)
# Not 500 (error)
```

### ✅ Logs
```bash
vercel logs <deployment-url>
# No "Couldn't find next-intl config file" errors
```

---

## Key Learnings

1. **Standard Location Matters**
   - Use `./src/i18n/request.ts` for projects with src directory
   - This is the documented standard location for next-intl

2. **Turbopack Config Required**
   - Next.js 14.2: `experimental: { turbo: {} }`
   - Next.js 15+: `turbopack: {}`
   - Required even if empty - provides space for next-intl plugin

3. **No Conflicts**
   - Don't disable Turbopack while using turbo config
   - Remove env vars: `TURBOPACK='0'`, `NEXT_PRIVATE_SKIP_TURBOPACK='1'`

4. **Build vs Runtime**
   - Build success doesn't guarantee runtime success
   - Serverless requires proper bundling configuration
   - Always test on Vercel after config changes

---

## Troubleshooting

### If error persists:
```bash
# Clear Vercel cache
vercel --force

# Verify config location
ls -la src/i18n/request.ts

# Check Next.js version (determines turbo vs turbopack)
cat package.json | grep '"next"'

# Verify no conflicting env vars
grep -r "TURBOPACK" next.config.mjs
```

### If module not found:
- Update all imports to: `./src/i18n/request`
- Check middleware.ts import path
- Verify config file exports: `locales`, `defaultLocale`, `Locale`

---

## Related Issues

### Similar GitHub Issues
- https://github.com/amannn/next-intl/issues/639
- https://github.com/amannn/next-intl/issues/674
- https://github.com/amannn/next-intl/issues/1779

### Stack Overflow
- https://stackoverflow.com/questions/79631566/

### Official Docs
- https://next-intl.dev/docs/getting-started/app-router
- https://www.buildwithmatija.com/blog/fix-nextintl-turbopack-error

---

## Environment

**Working Configuration:**
- Next.js: 14.2.18
- next-intl: 4.4.0
- Node.js: 20+
- Vercel: Latest
- Platform: Serverless Functions

**Deployment:** https://app.moodboard.co.il
**Status:** ✅ Production Ready

---

## Next Steps

### When Upgrading to Next.js 15
Change config from:
```javascript
experimental: { turbo: {} }
```
To:
```javascript
turbopack: {}
```

### Monitoring
Watch for:
- i18n initialization errors
- Missing translation keys
- Locale switching issues

---

**Full Documentation:** See `docs/I18N_VERCEL_DEPLOYMENT.md`
**Last Verified:** November 5, 2025
