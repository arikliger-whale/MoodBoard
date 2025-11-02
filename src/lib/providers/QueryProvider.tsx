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
            // Refetch on window focus for real-time feel
            refetchOnWindowFocus: true,
            // Refetch every 30 seconds for real-time updates
            refetchInterval: 30000,
            // Keep data fresh for 10 seconds
            staleTime: 10000,
            // Retry failed requests
            retry: 1,
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
