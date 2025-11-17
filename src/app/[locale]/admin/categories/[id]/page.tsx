/**
 * Admin Category Detail Page
 * View category details
 */

'use client'

import { Container, Title, Stack, Group, Text, Badge, ActionIcon, Paper, Button, SimpleGrid, Divider, Image, Box } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { IconEdit, IconArrowLeft, IconList, IconPalette, IconPhoto } from '@tabler/icons-react'
// FIX: Replaced barrel import with direct imports to improve compilation speed
// Barrel imports force compilation of ALL components (including heavy RichTextEditor, ImageUpload)
// Direct imports only compile what's needed
import { MoodBCard } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useCategory } from '@/hooks/useCategories'
import { useImageViewer } from '@/contexts/ImageViewerContext'
import Link from 'next/link'

export default function AdminCategoryDetailPage() {
  const t = useTranslations('admin.categories')
  const tCommon = useTranslations('common')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const categoryId = params.id as string

  const { data: category, isLoading, error } = useCategory(categoryId)
  const { openImages } = useImageViewer()

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <LoadingState />
      </Container>
    )
  }

  if (error || !category) {
    return (
      <Container size="xl" py="xl">
        <ErrorState message={tCommon('error')} />
      </Container>
    )
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <ActionIcon
              variant="subtle"
              onClick={() => router.push(`/${locale}/admin/categories`)}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <div>
              <Title order={1} c="brand">
                {category.name.he}
              </Title>
              <Text size="sm" c="dimmed">
                {category.name.en}
              </Text>
            </div>
          </Group>
          <Button
            leftSection={<IconEdit size={16} />}
            component={Link}
            href={`/${locale}/admin/categories/${categoryId}/edit`}
            color="brand"
            variant="filled"
          >
            {tCommon('edit')}
          </Button>
        </Group>

        {/* Basic Info */}
        <MoodBCard>
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <div>
                <Text fw={500} size="sm" c="dimmed" mb={4}>
                  {t('detail.slug')}
                </Text>
                <Text>{category.slug}</Text>
              </div>
              <div>
                <Text fw={500} size="sm" c="dimmed" mb={4}>
                  {t('detail.order')}
                </Text>
                <Text>{category.order}</Text>
              </div>
            </SimpleGrid>

            <Divider />

            {/* Description */}
            {(category.description?.he || category.description?.en) && (
              <>
                <div>
                  <Text fw={500} size="sm" c="dimmed" mb={8}>
                    {t('detail.description')} (עברית)
                  </Text>
                  {category.description.he ? (
                    <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#fafafa' }}>
                      <div
                        dangerouslySetInnerHTML={{ __html: category.description.he }}
                        style={{ direction: 'rtl' }}
                      />
                    </Paper>
                  ) : (
                    <Text c="dimmed" size="sm">{tCommon('notProvided')}</Text>
                  )}
                </div>
                <div>
                  <Text fw={500} size="sm" c="dimmed" mb={8}>
                    {t('detail.description')} (English)
                  </Text>
                  {category.description.en ? (
                    <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#fafafa' }}>
                      <div
                        dangerouslySetInnerHTML={{ __html: category.description.en }}
                        style={{ direction: 'ltr' }}
                      />
                    </Paper>
                  ) : (
                    <Text c="dimmed" size="sm">{tCommon('notProvided')}</Text>
                  )}
                </div>
                <Divider />
              </>
            )}

            {/* Images */}
            {category.images && category.images.length > 0 && (
              <>
                <div>
                  <Group gap="xs" mb="md">
                    <IconPhoto size={16} />
                    <Text fw={500} size="sm" c="dimmed">
                      {t('detail.images') || 'תמונות'} ({category.images.length})
                    </Text>
                  </Group>
                  <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                    {category.images.map((imageUrl, index) => (
                      <Paper
                        key={index}
                        p="xs"
                        withBorder
                        radius="md"
                        style={{ overflow: 'hidden' }}
                      >
                        <Box
                          style={{
                            aspectRatio: '1',
                            overflow: 'hidden',
                            borderRadius: 'var(--mantine-radius-sm)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                          }}
                          onClick={() => openImages(
                            category.images.map((url, idx) => ({
                              url,
                              title: `${category.name.he} - תמונה ${idx + 1}`,
                              description: category.description?.he
                            })),
                            index
                          )}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Image
                            src={imageUrl}
                            alt={`${category.name.he} - Image ${index + 1}`}
                            fit="cover"
                            style={{ width: '100%', height: '100%' }}
                          />
                        </Box>
                      </Paper>
                    ))}
                  </SimpleGrid>
                </div>
                <Divider />
              </>
            )}

            {/* Statistics */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <div>
                <Text fw={500} size="sm" c="dimmed" mb={4}>
                  {t('detail.subCategories')}
                </Text>
                <Group gap="xs">
                  <IconList size={16} />
                  <Text fw={600}>{category._count?.subCategories || 0}</Text>
                </Group>
              </div>
              <div>
                <Text fw={500} size="sm" c="dimmed" mb={4}>
                  {t('detail.styles')}
                </Text>
                <Group gap="xs">
                  <IconPalette size={16} />
                  <Text fw={600}>{category._count?.styles || 0}</Text>
                </Group>
              </div>
              <div>
                <Text fw={500} size="sm" c="dimmed" mb={4}>
                  {t('detail.createdAt')}
                </Text>
                <Text size="sm">
                  {new Date(category.createdAt).toLocaleDateString(locale)}
                </Text>
              </div>
            </SimpleGrid>

            {/* Sub-Categories */}
            {category.subCategories && category.subCategories.length > 0 && (
              <>
                <Divider />
                <div>
                  <Text fw={500} mb="md">
                    {t('detail.subCategoriesList')} ({category.subCategories.length})
                  </Text>
                  <Stack gap="xs">
                    {category.subCategories.map((subCategory) => (
                      <Paper key={subCategory.id} p="sm" withBorder radius="md">
                        <Group justify="space-between">
                          <div>
                            <Text fw={500}>{subCategory.name.he}</Text>
                            <Text size="sm" c="dimmed">
                              {subCategory.name.en}
                            </Text>
                          </div>
                          <Badge variant="light" size="sm">
                            {subCategory.slug}
                          </Badge>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </div>
              </>
            )}
          </Stack>
        </MoodBCard>
      </Stack>
    </Container>
  )
}

