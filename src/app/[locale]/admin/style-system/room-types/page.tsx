/**
 * Room Types Management Page
 * Admin page for managing room types (Living Room, Bedroom, Kitchen, etc.)
 *
 * FIX: Changed from server component to client component to avoid hydration issues
 * Server components importing client components with React Query hooks causes compilation hangs
 */

'use client'

import { RoomTypesTable } from '@/components/features/style-system/RoomTypesTable'
import { useTranslations } from 'next-intl'

export default function RoomTypesPage() {
  const t = useTranslations('admin.styleSystem.roomTypes')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{t('description')}</p>
      </div>

      <RoomTypesTable />
    </div>
  )
}

