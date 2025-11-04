/**
 * Admin Style Create Page
 * Create new global style with full form
 */

'use client'

import { StyleForm } from '@/components/features/style-engine/StyleForm'
import { useCreateAdminStyle } from '@/hooks/useStyles'
import type { CreateStyle } from '@/lib/validations/style'
import { Container } from '@mantine/core'
import { useParams, useRouter } from 'next/navigation'

export default function AdminStyleNewPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string

  const createMutation = useCreateAdminStyle()

  const handleSubmit = async (data: CreateStyle) => {
    const createdStyle = await createMutation.mutateAsync(data)
    router.push(`/${locale}/admin/styles/${createdStyle.id}`)
  }

  const handleCancel = () => {
    router.push(`/${locale}/admin/styles`)
  }

  return (
    <Container size="xl" py="xl">
      <StyleForm
        mode="create"
        locale={locale}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending}
        error={createMutation.error}
      />
    </Container>
  )
}
