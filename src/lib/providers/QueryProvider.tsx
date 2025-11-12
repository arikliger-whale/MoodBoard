'use client'

/**
 * React Query Provider
 * Provides React Query context to the application
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // FIX: Optimized for better performance
            // Refetch on window focus - disabled by default for better performance
            refetchOnWindowFocus: false,
            // Don't auto-refetch by default - let individual queries decide
            refetchInterval: false,
            // FIX: Increased stale time from 60s to 5 minutes for admin pages
            // Admin data changes infrequently, so we can cache longer
            staleTime: 5 * 60 * 1000, // 5 minutes (was 1 minute)
            // Retry failed requests only once to avoid hanging
            retry: 1,
            // FIX: Increased cache time from 5 to 15 minutes
            // Keep unused data longer to avoid re-fetching when navigating back
            gcTime: 15 * 60 * 1000, // 15 minutes (formerly cacheTime)
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
