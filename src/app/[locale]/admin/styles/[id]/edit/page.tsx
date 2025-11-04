/**
 * Admin Style Edit Page
 * Edit global style with full form and image upload support
 */

'use client'

import { StyleForm } from '@/components/features/style-engine/StyleForm'
import { ErrorState, LoadingState } from '@/components/ui'
import { useAdminStyle, useUpdateAdminStyle } from '@/hooks/useStyles'
import type { UpdateStyle } from '@/lib/validations/style'
import { Container } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'

export default function AdminStyleEditPage() {
  const tCommon = useTranslations('common')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const styleId = params.id as string

  const { data: style, isLoading, error } = useAdminStyle(styleId)
  const updateMutation = useUpdateAdminStyle()

  const handleSubmit = async (data: UpdateStyle) => {
    await updateMutation.mutateAsync({ id: styleId, data })
    router.push(`/${locale}/admin/styles/${styleId}`)
  }

  const handleCancel = () => {
    router.push(`/${locale}/admin/styles/${styleId}`)
  }

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <LoadingState />
      </Container>
    )
  }

  if (error || !style) {
    return (
      <Container size="xl" py="xl">
        <ErrorState message={tCommon('error')} />
      </Container>
    )
  }

  // Ensure we have the full style data structure with defaults
  const styleData = {
    ...style,
    materialSet: style.materialSet || { defaults: [], alternatives: [] },
    roomProfiles: Array.isArray(style.roomProfiles) ? style.roomProfiles : [],
    images: Array.isArray(style.images) ? style.images : [],
  }

  return (
    <Container size="xl" py="xl">
      <StyleForm
        key={styleId} // Force re-render when style ID changes
        mode="edit"
        locale={locale}
        initialData={styleData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateMutation.isPending}
        error={updateMutation.error}
      />
    </Container>
  )
}
