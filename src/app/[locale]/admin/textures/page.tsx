/**
 * Admin Textures Management Page
 * Manage texture library with category organization
 */

'use client'

import { TextureList } from '@/components/features/textures/TextureList'
import { Alert, Button, Container, Stack, Text, Title } from '@mantine/core'
import { IconInfoCircle, IconPlus } from '@tabler/icons-react'
import { useParams, useRouter } from 'next/navigation'

export default function AdminTexturesPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={1} c="brand" mb="sm">
            {locale === 'he' ? 'ניהול טקסטורות' : 'Texture Management'}
          </Title>
          <Text c="dimmed" size="lg">
            {locale === 'he'
              ? 'נהל את ספריית הטקסטורות הניתנות לשימוש חוזר עבור סגנונות עיצוב'
              : 'Manage reusable texture library for design styles'}
          </Text>
        </div>

        {/* Info Alert */}
        <Alert
          icon={<IconInfoCircle size={16} />}
          title={locale === 'he' ? 'על טקסטורות' : 'About Textures'}
          color="blue"
          variant="light"
        >
          <Stack gap="xs">
            <Text size="sm">
              {locale === 'he'
                ? 'טקסטורות הן ישויות ניתנות לשימוש חוזר המייצגות גימורים וחומרים. כל טקסטורה:'
                : 'Textures are reusable entities representing finishes and materials. Each texture:'}
            </Text>
            <ul style={{ margin: 0, paddingInlineStart: '1.5rem' }}>
              <li>
                <Text size="sm" component="span">
                  {locale === 'he'
                    ? 'שייכת לקטגוריה (קירות, עץ, מתכת, בד, אבן)'
                    : 'Belongs to a category (Wall, Wood, Metal, Fabric, Stone)'}
                </Text>
              </li>
              <li>
                <Text size="sm" component="span">
                  {locale === 'he'
                    ? 'בעלת סוג ספציפי בתוך הקטגוריה'
                    : 'Has a specific type within the category'}
                </Text>
              </li>
              <li>
                <Text size="sm" component="span">
                  {locale === 'he'
                    ? 'ניתנת לקישור למספר סגנונות עיצוב'
                    : 'Can be linked to multiple design styles'}
                </Text>
              </li>
              <li>
                <Text size="sm" component="span">
                  {locale === 'he'
                    ? 'מעקב אחר שימוש ונתונים סטטיסטיים'
                    : 'Tracks usage and statistics'}
                </Text>
              </li>
            </ul>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push(`/${locale}/admin/textures/new`)}
              color="brand"
              variant="filled"
              mt="md"
              size="sm"
            >
              {locale === 'he' ? 'צור טקסטורה חדשה' : 'Create New Texture'}
            </Button>
          </Stack>
        </Alert>

        {/* Texture List */}
        <TextureList />
      </Stack>
    </Container>
  )
}
