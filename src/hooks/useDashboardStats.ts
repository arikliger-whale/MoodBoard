/**
 * React Query hook for Dashboard Statistics
 * Fetches aggregated dashboard statistics
 */

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalClients: number
  totalBudget: number
  currency: string
  currencySymbol: string
}

interface DashboardStatsResponse {
  stats: DashboardStats
}

const DASHBOARD_STATS_QUERY_KEY = 'dashboard-stats'

/**
 * Fetch dashboard statistics
 */
async function fetchDashboardStats(): Promise<DashboardStatsResponse> {
  const response = await fetch('/api/dashboard/stats')

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard statistics')
  }

  return response.json()
}

/**
 * Hook to fetch dashboard statistics with real-time updates
 */
export function useDashboardStats() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: [DASHBOARD_STATS_QUERY_KEY],
    queryFn: fetchDashboardStats,
    enabled: !!session, // Only fetch when authenticated
    // Auto-refetch for real-time feel
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })
}

