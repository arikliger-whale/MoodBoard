/**
 * Admin Style Edit Page
 * Edit global style
 */

'use client'

import { StyleForm } from '@/components/features/style-engine/StyleForm'
// FIX: Replaced barrel import with direct imports to improve compilation speed
// Barrel imports force compilation of ALL components (including heavy RichTextEditor, ImageUpload)
// Direct imports only compile what's needed
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import {
  useAdminStyle,
  useUpdateAdminStyle,
} from '@/hooks/useStyles'
import type { UpdateStyle } from '@/lib/validations/style'
import { Container } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'

export default function AdminStyleEditPage() {
  const t = useTranslations('admin.styles.edit')
  const tCommon = useTranslations('common')

  const params = useParams()
  const router = useRouter()

  const locale = params.locale as string
  const styleId = params.id as string

  const { data: style, isLoading, error } = useAdminStyle(styleId)
  const updateStyleMutation = useUpdateAdminStyle()

  const handleStyleSubmit = async (data: UpdateStyle) => {
    await updateStyleMutation.mutateAsync({ id: styleId, data })
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

  return (
    <Container size="xl" py="xl">
      <StyleForm
        key={styleId}
        mode="edit"
        locale={locale}
        initialData={style}
        onSubmit={handleStyleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateStyleMutation.isPending}
        error={updateStyleMutation.error}
      />
    </Container>
  )
}
