/**
 * Admin Style Detail Page
 * View global style details
 */

'use client'

import { Container, Title, Stack, Group, Text, Badge, Tabs, ActionIcon, Paper, Button } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { IconEdit, IconArrowLeft, IconPalette, IconBox, IconDoor } from '@tabler/icons-react'
import { MoodBCard, MoodBBadge, LoadingState, ErrorState } from '@/components/ui'
import { useAdminStyle } from '@/hooks/useStyles'
import Link from 'next/link'

export default function AdminStyleDetailPage() {
  const t = useTranslations('admin.styles')
  const tCommon = useTranslations('common')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const styleId = params.id as string

  const { data: style, isLoading, error } = useAdminStyle(styleId)

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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      scandinavian: 'blue',
      japandi: 'teal',
      industrial: 'gray',
      minimal: 'grape',
      mediterranean: 'orange',
      rustic: 'brown',
      classic: 'violet',
    }
    return colors[category] || 'gray'
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <ActionIcon
              variant="subtle"
              onClick={() => router.push(`/${locale}/admin/styles`)}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <div>
              <Title order={1} c="brand">
                {style.name.he}
              </Title>
              <Text size="sm" c="dimmed">
                {style.name.en}
              </Text>
            </div>
          </Group>
          <Button
            leftSection={<IconEdit size={16} />}
            component={Link}
            href={`/${locale}/admin/styles/${styleId}/edit`}
            color="brand"
            variant="filled"
          >
            {tCommon('edit')}
          </Button>
        </Group>

        {/* Basic Info */}
        <MoodBCard>
          <Stack gap="md">
            <Group>
              <Text fw={500}>{t('detail.category')}:</Text>
              <MoodBBadge color={getCategoryColor(style.category)} variant="light">
                {t(`categories.${style.category}`)}
              </MoodBBadge>
            </Group>
            <Group>
              <Text fw={500}>{t('detail.version')}:</Text>
              <Text>{style.metadata.version}</Text>
            </Group>
            <Group>
              <Text fw={500}>{t('detail.usage')}:</Text>
              <Text>{style.metadata.usage}</Text>
            </Group>
            <Group>
              <Text fw={500}>{t('detail.createdAt')}:</Text>
              <Text>{new Date(style.createdAt).toLocaleDateString(locale)}</Text>
            </Group>
            {style.metadata.tags && style.metadata.tags.length > 0 && (
              <Group>
                <Text fw={500}>{t('detail.tags')}:</Text>
                <Group gap="xs">
                  {style.metadata.tags.map((tag: string) => (
                    <Badge key={tag} variant="light" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </Group>
            )}
          </Stack>
        </MoodBCard>

        {/* Tabs */}
        <Tabs defaultValue="palette">
          <Tabs.List>
            <Tabs.Tab value="palette" leftSection={<IconPalette size={16} />}>
              {t('detail.tabs.palette')}
            </Tabs.Tab>
            <Tabs.Tab value="materials" leftSection={<IconBox size={16} />}>
              {t('detail.tabs.materials')}
            </Tabs.Tab>
            <Tabs.Tab value="rooms" leftSection={<IconDoor size={16} />}>
              {t('detail.tabs.rooms')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="palette" pt="md">
            <MoodBCard>
              <Stack gap="md">
                <Title order={3}>{t('detail.palette.neutrals')}</Title>
                <Group gap="md">
                  {style.palette.neutrals.map((color: { hex: string; name: string; pantone?: string }, index: number) => (
                    <Paper key={index} p="md" withBorder radius="md">
                      <Stack gap="xs" align="center">
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            backgroundColor: color.hex,
                            borderRadius: 8,
                            border: '1px solid #e0e0e0',
                          }}
                        />
                        <Text size="sm" fw={500}>
                          {color.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {color.hex}
                        </Text>
                        {color.pantone && (
                          <Text size="xs" c="dimmed">
                            {color.pantone}
                          </Text>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Group>

                <Title order={3} mt="lg">{t('detail.palette.accents')}</Title>
                <Group gap="md">
                  {style.palette.accents.map((color: { hex: string; name: string; pantone?: string }, index: number) => (
                    <Paper key={index} p="md" withBorder radius="md">
                      <Stack gap="xs" align="center">
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            backgroundColor: color.hex,
                            borderRadius: 8,
                            border: '1px solid #e0e0e0',
                          }}
                        />
                        <Text size="sm" fw={500}>
                          {color.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {color.hex}
                        </Text>
                        {color.pantone && (
                          <Text size="xs" c="dimmed">
                            {color.pantone}
                          </Text>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Group>
              </Stack>
            </MoodBCard>
          </Tabs.Panel>

          <Tabs.Panel value="materials" pt="md">
            <MoodBCard>
              <Stack gap="md">
                <Title order={3}>{t('detail.materials.defaults')}</Title>
                {style.materialSet.defaults.length === 0 ? (
                  <Text c="dimmed">{t('detail.materials.noDefaults')}</Text>
                ) : (
                  <Stack gap="sm">
                    {style.materialSet.defaults.map((material: any, index: number) => (
                      <Paper key={index} p="md" withBorder radius="md">
                        <Group justify="space-between">
                          <div>
                            <Text fw={500}>{material.usageArea}</Text>
                            {material.defaultFinish && (
                              <Text size="sm" c="dimmed">
                                {t('detail.materials.finish')}: {material.defaultFinish}
                              </Text>
                            )}
                          </div>
                          <Text size="sm" c="dimmed">
                            ID: {material.materialId}
                          </Text>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </MoodBCard>
          </Tabs.Panel>

          <Tabs.Panel value="rooms" pt="md">
            <MoodBCard>
              <Stack gap="md">
                {style.roomProfiles.length === 0 ? (
                  <Text c="dimmed">{t('detail.rooms.noProfiles')}</Text>
                ) : (
                  <Stack gap="md">
                    {style.roomProfiles.map((profile: any, index: number) => (
                      <Paper key={index} p="md" withBorder radius="md">
                        <Title order={4} mb="sm">
                          {profile.roomType}
                        </Title>
                        {profile.colorProportions && profile.colorProportions.length > 0 && (
                          <Stack gap="xs" mt="md">
                            {profile.colorProportions.map((prop: any, propIndex: number) => (
                              <Group key={propIndex} justify="space-between">
                                <Text size="sm">{prop.colorRole}</Text>
                                <Text size="sm" fw={500}>
                                  {prop.percentage}%
                                </Text>
                              </Group>
                            ))}
                          </Stack>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </MoodBCard>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

