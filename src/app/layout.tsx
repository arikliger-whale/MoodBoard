import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoodB - Interior Design Studio Platform",
  description: "Comprehensive SaaS platform for interior design studios",
};

// Root layout can be static - locale layout handles dynamic rendering
// NEXT_PUBLIC_ env vars are baked in at build time, so no need for force-dynamic here

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Default locale from env or fallback to 'he'
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'he'

  return (
    <html lang={defaultLocale} suppressHydrationWarning dir={defaultLocale === 'he' ? 'rtl' : 'ltr'}>
      <head>
        {/* Hebrew font support - optimized with preconnect for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Heebo:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
        style={{
          fontFamily: defaultLocale === 'he'
            ? '"Heebo", "Assistant", var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            : 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  )
}

