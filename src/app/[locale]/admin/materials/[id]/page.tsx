/**
 * Admin Material Detail Page
 * View detailed material information
 */

'use client'

import { MaterialItem } from '@/components/features/materials'
import { ErrorState } from '@/components/ui'
import { Container } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

/**
 * Helper function to validate ObjectID format
 */
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export default function AdminMaterialDetailPage() {
  const params = useParams()
  const tCommon = useTranslations('common')
  const materialId = params.id as string

  // Redirect "new" to create page or show error for invalid IDs
  if (materialId === 'new' || !isValidObjectId(materialId)) {
    return (
      <Container size="xl" py="xl">
        <ErrorState message={tCommon('error')} />
      </Container>
    )
  }

  return (
    <Container size="xl" py="xl">
      <MaterialItem materialId={materialId} showActions={true} />
    </Container>
  )
}

