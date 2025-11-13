/**
 * User-Facing Style Create Page
 * Create a new style (personal or public)
 */

'use client'

import { Container, Title, Stack, Text, Button, Alert } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { IconArrowLeft, IconInfoCircle } from '@tabler/icons-react'
// FIX: Replaced barrel import with direct imports to improve compilation speed
// Barrel imports force compilation of ALL components (including heavy RichTextEditor, ImageUpload)
// Direct imports only compile what's needed
import { MoodBCard } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'

export default function CreateStylePage() {
  const t = useTranslations('styles.user')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Stack gap="xs">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push(`/${locale}/styles`)}
            style={{ alignSelf: 'flex-start' }}
          >
            {tCommon('back')}
          </Button>
          <Title order={1}>{t('createStyle')}</Title>
        </Stack>

        {/* Placeholder Content */}
        <MoodBCard>
          <Stack gap="md">
            <Alert icon={<IconInfoCircle size={16} />} color="blue" title={t('createStylePlaceholder.title')}>
              {t('createStylePlaceholder.description')}
            </Alert>
            <Text size="sm" c="dimmed">
              {t('createStylePlaceholder.details')}
            </Text>
          </Stack>
        </MoodBCard>
      </Stack>
    </Container>
  )
}

