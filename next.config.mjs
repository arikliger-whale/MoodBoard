import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_BUILD === '1'

const nextConfig = {
  reactStrictMode: true,
  
  // Performance optimizations
  compress: true,
  
  // Important: keep React Compiler off (intentionally disabled for build speed)
  reactCompiler: false,
  
  experimental: {
    // Speeds CSS handling; works well with Tailwind v4 + Mantine
    optimizeCss: true,
    // Tree-shake big UI libs. Add only what you use.
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/notifications',
      '@mantine/modals',
      '@mantine/form',
      '@mantine/dropzone',
      '@mantine/dates',
      '@mantine/charts',
      '@tabler/icons-react',
      'zod',
    ],
  },
  
  // Disables uploading sourcemaps in prod builds
  productionBrowserSourceMaps: false,
  
  // Greatly speeds builds on Vercel; run tsc in CI instead
  typescript: {
    ignoreBuildErrors: isVercel ? true : false,
  },
  
  // Images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.moodb.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Stable build id for multi-region deploys on Vercel
  generateBuildId: async () => {
    return process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now())
  },
  
  // Transpile packages only if needed (next-intl is ESM-ready)
  transpilePackages: [
    'next-intl',
  ],
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'he',
  },
}

export default withNextIntl(nextConfig)

