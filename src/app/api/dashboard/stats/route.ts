/**
 * Dashboard Statistics API
 * GET /api/dashboard/stats - Get aggregated dashboard statistics
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, handleError, requirePermission } from '@/lib/api/middleware'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/stats - Get dashboard statistics
 */
export const GET = withAuth(async (req, auth) => {
  try {
    // Check permission
    requirePermission(auth, 'project:read')
    requirePermission(auth, 'client:read')

    const organizationId = auth.organizationId

    // Get total projects count
    const totalProjects = await prisma.project.count({
      where: { organizationId },
    })

    // Get active projects count (status: 'active')
    const activeProjects = await prisma.project.count({
      where: {
        organizationId,
        status: 'active',
      },
    })

    // Get total clients count
    const totalClients = await prisma.client.count({
      where: { organizationId },
    })

    // Get total budget across all projects
    // Fetch all projects and sum budgets in JavaScript (simpler than MongoDB aggregation)
    const projects = await prisma.project.findMany({
      where: { organizationId },
      select: {
        budget: true,
      },
    })

    // Sum up all project budgets (use max target budget if available)
    const totalBudget = projects.reduce((sum, project) => {
      const projectBudget = project.budget?.target?.max || project.budget?.target?.min || 0
      return sum + projectBudget
    }, 0)

    // Get organization currency (default to ILS)
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        settings: true,
      },
    })

    const currency = organization?.settings?.currency || 'ILS'

    // Format currency symbol
    const currencySymbols: Record<string, string> = {
      ILS: '₪',
      USD: '$',
      EUR: '€',
    }

    const currencySymbol = currencySymbols[currency] || currency

    return NextResponse.json({
      stats: {
        totalProjects,
        activeProjects,
        totalClients,
        totalBudget,
        currency,
        currencySymbol,
      },
    })
  } catch (error) {
    return handleError(error)
  }
})

