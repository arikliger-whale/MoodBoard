/**
 * Admin SubCategory Detail Page
 * View sub-category details
 */

'use client'

import { Container, Title, Stack, Group, Text, Badge, ActionIcon, Paper, Button, SimpleGrid, Divider, Image, Box } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { IconEdit, IconArrowLeft, IconPalette, IconPhoto } from '@tabler/icons-react'
// FIX: Replaced barrel import with direct imports to improve compilation speed
// Barrel imports force compilation of ALL components (including heavy RichTextEditor, ImageUpload)
// Direct imports only compile what's needed
import { MoodBCard } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useSubCategory } from '@/hooks/useCategories'
import { useImageViewer } from '@/contexts/ImageViewerContext'
import Link from 'next/link'

export default function AdminSubCategoryDetailPage() {
  const t = useTranslations('admin.subCategories')
  const tCommon = useTranslations('common')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const subCategoryId = params.id as string

  const { data: subCategory, isLoading, error } = useSubCategory(subCategoryId)
  const { openImages } = useImageViewer()

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <LoadingState />
      </Container>
    )
  }

  if (error || !subCategory) {
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
              onClick={() => router.push(`/${locale}/admin/sub-categories`)}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <div>
              <Title order={1} c="brand">
                {subCategory.name.he}
              </Title>
              <Text size="sm" c="dimmed">
                {subCategory.name.en}
              </Text>
            </div>
          </Group>
          <Button
            leftSection={<IconEdit size={16} />}
            component={Link}
            href={`/${locale}/admin/sub-categories/${subCategoryId}/edit`}
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
                  {t('detail.category')}
                </Text>
                {subCategory.category ? (
                  <Badge variant="light" color="brand">
                    {subCategory.category.name.he} ({subCategory.category.name.en})
                  </Badge>
                ) : (
                  <Text c="dimmed" size="sm">{tCommon('notProvided')}</Text>
                )}
              </div>
              <div>
                <Text fw={500} size="sm" c="dimmed" mb={4}>
                  {t('detail.slug')}
                </Text>
                <Text>{subCategory.slug}</Text>
              </div>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <div>
                <Text fw={500} size="sm" c="dimmed" mb={4}>
                  {t('detail.order')}
                </Text>
                <Text>{subCategory.order}</Text>
              </div>
              <div>
                <Text fw={500} size="sm" c="dimmed" mb={4}>
                  {t('detail.createdAt')}
                </Text>
                <Text size="sm">
                  {new Date(subCategory.createdAt).toLocaleDateString(locale)}
                </Text>
              </div>
            </SimpleGrid>

            <Divider />

            {/* Description */}
            {(subCategory.description?.he || subCategory.description?.en) && (
              <>
                <div>
                  <Text fw={500} size="sm" c="dimmed" mb={8}>
                    {t('detail.description')} (עברית)
                  </Text>
                  {subCategory.description.he ? (
                    <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#fafafa' }}>
                      <div
                        dangerouslySetInnerHTML={{ __html: subCategory.description.he }}
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
                  {subCategory.description.en ? (
                    <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#fafafa' }}>
                      <div
                        dangerouslySetInnerHTML={{ __html: subCategory.description.en }}
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
            {subCategory.images && subCategory.images.length > 0 && (
              <>
                <div>
                  <Group gap="xs" mb="md">
                    <IconPhoto size={16} />
                    <Text fw={500} size="sm" c="dimmed">
                      {t('detail.images') || 'תמונות'} ({subCategory.images.length})
                    </Text>
                  </Group>
                  <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                    {subCategory.images.map((imageUrl, index) => (
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
                            subCategory.images.map((url, idx) => ({
                              url,
                              title: `${subCategory.name.he} - תמונה ${idx + 1}`,
                              description: subCategory.description?.he
                            })),
                            index
                          )}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Image
                            src={imageUrl}
                            alt={`${subCategory.name.he} - Image ${index + 1}`}
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
            <div>
              <Text fw={500} size="sm" c="dimmed" mb={4}>
                {t('detail.styles')}
              </Text>
              <Group gap="xs">
                <IconPalette size={16} />
                <Text fw={600}>{subCategory._count?.styles || 0}</Text>
              </Group>
            </div>
          </Stack>
        </MoodBCard>
      </Stack>
    </Container>
  )
}

