/**
 * Translation Service Client
 * Handles fetching translations from API with localStorage caching
 */

export type Locale = 'he' | 'en'

export interface TranslationCache {
  [locale: string]: {
    [prefix: string]: {
      data: Record<string, string>
      timestamp: number
    }
  }
}

const CACHE_KEY = 'moodboard-translations'
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

export class TranslationClient {
  private cache: TranslationCache = {}
  private subscribers: Map<string, Set<(data: Record<string, string>) => void>> = new Map()

  constructor() {
    // Load cache from localStorage
    if (typeof window !== 'undefined') {
      this.loadCache()
    }
  }

  /**
   * Fetch translations for a page (by prefix)
   * Automatically includes 'common' prefix
   */
  async fetchPage(locale: Locale, pagePrefix: string): Promise<Record<string, string>> {
    const prefixes = [pagePrefix, 'common']
    return this.fetchPrefixes(locale, prefixes)
  }

  /**
   * Fetch translations for multiple prefixes
   */
  async fetchPrefixes(locale: Locale, prefixes: string[]): Promise<Record<string, string>> {
    const cacheKey = prefixes.sort().join(',')

    // Check cache
    const cached = this.getFromCache(locale, cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from API
    try {
      const response = await fetch(
        `/api/translations?locale=${locale}&prefixes=${prefixes.join(',')}`
      )

      if (!response.ok) {
        throw new Error(`Translation fetch failed: ${response.statusText}`)
      }

      const data = await response.json()

      // Save to cache
      this.saveToCache(locale, cacheKey, data)

      return data
    } catch (error) {
      console.error('Translation fetch error:', error)
      // Return empty object on error
      return {}
    }
  }

  /**
   * Fetch specific translation keys
   */
  async fetchKeys(locale: Locale, keys: string[]): Promise<Record<string, string>> {
    try {
      const response = await fetch('/api/translations/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, keys }),
      })

      if (!response.ok) {
        throw new Error(`Translation fetch failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Translation keys fetch error:', error)
      return {}
    }
  }

  /**
   * Subscribe to translation updates for specific prefixes
   */
  subscribe(
    locale: Locale,
    prefixes: string[],
    callback: (data: Record<string, string>) => void
  ): () => void {
    const key = `${locale}:${prefixes.sort().join(',')}`

    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }

    this.subscribers.get(key)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.subscribers.get(key)?.delete(callback)
    }
  }

  /**
   * Notify subscribers of translation updates
   */
  private notifySubscribers(locale: Locale, prefixes: string[], data: Record<string, string>) {
    const key = `${locale}:${prefixes.sort().join(',')}`
    const subscribers = this.subscribers.get(key)

    if (subscribers) {
      subscribers.forEach((callback) => callback(data))
    }
  }

  /**
   * Invalidate cache for specific locale/prefix
   */
  invalidate(locale: Locale, prefix?: string) {
    if (prefix) {
      // Invalidate specific prefix
      if (this.cache[locale]) {
        delete this.cache[locale][prefix]
      }
    } else {
      // Invalidate entire locale
      delete this.cache[locale]
    }

    this.persistCache()
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache = {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY)
    }
  }

  /**
   * Get translations from cache
   */
  private getFromCache(locale: Locale, cacheKey: string): Record<string, string> | null {
    const localeCache = this.cache[locale]
    if (!localeCache) return null

    const cached = localeCache[cacheKey]
    if (!cached) return null

    // Check if cache is expired
    const age = Date.now() - cached.timestamp
    if (age > CACHE_DURATION) {
      delete localeCache[cacheKey]
      this.persistCache()
      return null
    }

    return cached.data
  }

  /**
   * Save translations to cache
   */
  private saveToCache(locale: Locale, cacheKey: string, data: Record<string, string>) {
    if (!this.cache[locale]) {
      this.cache[locale] = {}
    }

    this.cache[locale][cacheKey] = {
      data,
      timestamp: Date.now(),
    }

    this.persistCache()
  }

  /**
   * Load cache from localStorage
   */
  private loadCache() {
    try {
      const stored = localStorage.getItem(CACHE_KEY)
      if (stored) {
        this.cache = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load translation cache:', error)
      this.cache = {}
    }
  }

  /**
   * Persist cache to localStorage
   */
  private persistCache() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache))
      } catch (error) {
        console.error('Failed to persist translation cache:', error)
      }
    }
  }
}

// Singleton instance
export const translationClient = new TranslationClient()
