/**
 * Admin Users Management Page
 * Manage platform users
 */

'use client'

import { Container, Title, Stack, Text } from '@mantine/core'
import { useTranslations } from 'next-intl'

export default function AdminUsersPage() {
  const t = useTranslations('admin.users')

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} c="brand" mb="sm">
            {t('title')}
          </Title>
          <Text c="dimmed" size="lg">
            {t('description')}
          </Text>
        </div>

        {/* Coming Soon */}
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Text size="xl" c="dimmed" fw={500}>
            {t('comingSoon')}
          </Text>
          <Text size="sm" c="dimmed" mt="md">
            {t('comingSoonDescription')}
          </Text>
        </div>
      </Stack>
    </Container>
  )
}

