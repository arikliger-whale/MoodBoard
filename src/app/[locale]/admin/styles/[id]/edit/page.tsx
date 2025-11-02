/**
 * Admin Style Edit Page
 * Edit global style (placeholder - will implement form later)
 */

'use client'

import { Container, Title, Stack, Text, ActionIcon, Group, Button } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { IconArrowLeft } from '@tabler/icons-react'
import Link from 'next/link'

export default function AdminStyleEditPage() {
  const t = useTranslations('admin.styles')
  const tCommon = useTranslations('common')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const styleId = params.id as string

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group>
          <ActionIcon
            variant="subtle"
            onClick={() => router.push(`/${locale}/admin/styles/${styleId}`)}
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={1} c="brand">
            {t('edit.title')}
          </Title>
        </Group>

        {/* Coming Soon */}
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Text size="xl" c="dimmed" fw={500}>
            {t('edit.comingSoon')}
          </Text>
          <Text size="sm" c="dimmed" mt="md">
            {t('edit.comingSoonDescription')}
          </Text>
          <Button
            mt="lg"
            component={Link}
            href={`/${locale}/admin/styles/${styleId}`}
            color="brand"
            variant="filled"
          >
            {tCommon('back')}
          </Button>
        </div>
      </Stack>
    </Container>
  )
}

