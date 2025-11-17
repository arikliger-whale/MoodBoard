/**
 * useAreaTranslations Hook
 * Fetches translations for a specific page/area with caching
 *
 * Usage:
 *   const t = useAreaTranslations('admin-categories')
 *   return <h1>{t('title')}</h1>  // admin-categories.title
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { translationClient, Locale } from '@/lib/translations/client'

export function useAreaTranslations(pagePrefix: string) {
  const params = useParams()
  const locale = (params?.locale as Locale) || 'he'

  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch translations on mount
  useEffect(() => {
    let mounted = true

    const fetchTranslations = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await translationClient.fetchPage(locale, pagePrefix)

        if (mounted) {
          setTranslations(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Translation fetch failed'))
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTranslations()

    // Subscribe to updates
    const unsubscribe = translationClient.subscribe(locale, [pagePrefix, 'common'], (data) => {
      if (mounted) {
        setTranslations(data)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [locale, pagePrefix])

  /**
   * Translation function
   * Supports dot notation relative to page prefix or absolute keys
   */
  const t = useCallback(
    (key: string, fallback?: string): string => {
      // If key starts with common., use it as-is
      if (key.startsWith('common.')) {
        return translations[key] || fallback || key
      }

      // Otherwise, prefix with page prefix
      const fullKey = `${pagePrefix}.${key}`
      return translations[fullKey] || fallback || key
    },
    [translations, pagePrefix]
  )

  return {
    t,
    translations,
    isLoading,
    error,
    locale,
  }
}
