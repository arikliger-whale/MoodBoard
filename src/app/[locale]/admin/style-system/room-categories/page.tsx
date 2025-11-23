/**
 * Room Categories Management Page
 * Admin page for managing room categories (Private, Public, Commercial, etc.)
 */

'use client'

import { RoomCategoriesTable } from '@/components/features/style-system/RoomCategoriesTable'
import { useTranslations } from 'next-intl'

export default function RoomCategoriesPage() {
  const t = useTranslations('admin.styleSystem.roomCategories')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{t('description')}</p>
      </div>

      <RoomCategoriesTable />
    </div>
  )
}
