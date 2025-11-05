'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="he" dir="rtl">
      <body style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f7f7ed',
        color: '#000000',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: '#df2538' }}>500</h1>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>משהו השתבש</h2>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            אירעה שגיאה בלתי צפויה. אנא נסה שוב.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#df2538',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              נסה שוב
            </button>
            <Link href="/" style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#000000',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '500'
            }}>
              חזרה לדף הבית
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
