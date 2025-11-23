/**
 * Texture List Component
 * Displays textures grouped by material category with usage statistics
 */

'use client'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { MoodBBadge } from '@/components/ui/Badge'
import { MoodBCard } from '@/components/ui/Card'
import {
  useDeleteTexture,
  useMaterialCategoriesLite,
  useTextures,
  type MaterialCategory,
  type Texture,
} from '@/hooks/useTextures'
import {
  Accordion,
  ActionIcon,
  Badge,
  Box,
  Group,
  Image,
  Menu,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { IconDots, IconEdit, IconPhoto, IconSearch, IconTrash } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

interface TextureListProps {
  onTextureClick?: (texture: Texture) => void
  showActions?: boolean
}

export function TextureList({ onTextureClick, showActions = true }: TextureListProps) {
  const tCommon = useTranslations('common')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  // State
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [deleteTextureId, setDeleteTextureId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch data (using lightweight endpoint for better performance)
  const { data: categoriesData } = useMaterialCategoriesLite()
  const categories = categoriesData?.data || []

  const { data: texturesData, isLoading, error } = useTextures({
    search,
    materialCategoryId: selectedCategory || undefined,
    page,
    limit: 50, // Show more textures per page since we're grouping
  })

  // Delete mutation
  const deleteMutation = useDeleteTexture()

  const handleDelete = async () => {
    if (!deleteTextureId) return

    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(deleteTextureId)
      setDeleteTextureId(null)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Category options for filter
  const categoryOptions = [
    { value: '', label: locale === 'he' ? 'כל הקטגוריות' : 'All Categories' },
    ...categories.map((cat) => {
      const categoryName = locale === 'he' ? cat.name.he : cat.name.en
      return {
        value: cat.id,
        label: categoryName,
      }
    }),
  ]

  // Group textures by material category
  const texturesByCategory = (texturesData?.data || []).reduce((acc, texture) => {
    // A texture can belong to multiple categories
    texture.materialCategories.forEach((mc) => {
      const categoryId = mc.materialCategoryId
      if (!acc[categoryId]) {
        acc[categoryId] = {
          category: mc.materialCategory,
          textures: [],
        }
      }
      // Only add if not already in the list (avoid duplicates)
      if (!acc[categoryId].textures.find((t) => t.id === texture.id)) {
        acc[categoryId].textures.push(texture)
      }
    })
    return acc
  }, {} as Record<string, { category: MaterialCategory; textures: Texture[] }>)

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={tCommon('error')} />
  }

  if (!texturesData?.data.length) {
    return (
      <EmptyState
        title={locale === 'he' ? 'אין טקסטורות' : 'No Textures'}
        description={locale === 'he' ? 'התחל ליצור טקסטורות כדי לנהל את הספרייה' : 'Start creating textures to manage your library'}
        action={
          showActions
            ? {
                label: locale === 'he' ? 'צור טקסטורה' : 'Create Texture',
                onClick: () => router.push(`/${locale}/admin/textures/new`),
              }
            : undefined
        }
      />
    )
  }

  return (
    <Stack gap="lg">
      {/* Filters */}
      <MoodBCard>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            placeholder={locale === 'he' ? 'חיפוש טקסטורות...' : 'Search textures...'}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <Select
            placeholder={locale === 'he' ? 'סינון לפי קטגוריה' : 'Filter by category'}
            data={categoryOptions}
            value={selectedCategory}
            onChange={(value) => {
              setSelectedCategory(value)
              setPage(1)
            }}
            clearable
          />
        </SimpleGrid>
      </MoodBCard>

      {/* Summary */}
      <Group gap="md">
        <MoodBBadge>
          {texturesData.pagination.total} {locale === 'he' ? 'טקסטורות' : 'Textures'}
        </MoodBBadge>
        <MoodBBadge color="blue">
          {Object.keys(texturesByCategory).length} {locale === 'he' ? 'קטגוריות' : 'Categories'}
        </MoodBBadge>
      </Group>

      {/* Textures Grouped by Material Category */}
      <Accordion multiple defaultValue={Object.keys(texturesByCategory)}>
        {Object.entries(texturesByCategory).map(([categoryId, { category, textures }]) => {
          const categoryName = locale === 'he' ? category.name.he : category.name.en
          const categoryDesc = category.description
            ? locale === 'he'
              ? category.description.he
              : category.description.en
            : null

          return (
            <Accordion.Item key={categoryId} value={categoryId}>
              <Accordion.Control>
                <Group justify="space-between">
                  <div>
                    <Text fw={600} size="lg">
                      {categoryName}
                    </Text>
                    {categoryDesc && (
                      <Text size="sm" c="dimmed">
                        {categoryDesc}
                      </Text>
                    )}
                  </div>
                  <MoodBBadge>{textures.length}</MoodBBadge>
                </Group>
              </Accordion.Control>
            <Accordion.Panel>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                {textures.map((texture) => (
                  <Paper
                    key={texture.id}
                    p="md"
                    withBorder
                    style={{ cursor: onTextureClick ? 'pointer' : 'default' }}
                    onClick={() => onTextureClick?.(texture)}
                  >
                    <Stack gap="sm">
                      {/* Texture Image */}
                      {texture.imageUrl ? (
                        <Image
                          src={texture.imageUrl}
                          alt={locale === 'he' ? texture.name.he : texture.name.en}
                          height={120}
                          radius="sm"
                          fit="cover"
                        />
                      ) : (
                        <Box
                          style={{
                            height: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'var(--mantine-color-gray-1)',
                            borderRadius: 'var(--mantine-radius-sm)',
                          }}
                        >
                          <IconPhoto size={40} color="var(--mantine-color-gray-5)" />
                        </Box>
                      )}

                      {/* Texture Info */}
                      <div>
                        <Group justify="space-between" align="start">
                          <div style={{ flex: 1 }}>
                            <Text fw={600} size="sm" lineClamp={1}>
                              {locale === 'he' ? texture.name.he : texture.name.en}
                            </Text>
                            {/* Show material categories as badges */}
                            <Group gap={4} mt={4}>
                              {texture.materialCategories.slice(0, 2).map((mc) => (
                                <Badge key={mc.id} size="xs" variant="light">
                                  {locale === 'he'
                                    ? mc.materialCategory.name.he
                                    : mc.materialCategory.name.en}
                                </Badge>
                              ))}
                              {texture.materialCategories.length > 2 && (
                                <Badge size="xs" variant="light">
                                  +{texture.materialCategories.length - 2}
                                </Badge>
                              )}
                            </Group>
                          </div>

                          {/* Actions Menu */}
                          {showActions && (
                            <Menu position="bottom-end">
                              <Menu.Target>
                                <ActionIcon
                                  variant="subtle"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <IconDots size={16} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item
                                  leftSection={<IconEdit size={14} />}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/${locale}/admin/textures/${texture.id}/edit`)
                                  }}
                                >
                                  {tCommon('edit')}
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconTrash size={14} />}
                                  color="red"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDeleteTextureId(texture.id)
                                  }}
                                >
                                  {tCommon('delete')}
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          )}
                        </Group>

                        {/* Usage Badge */}
                        {texture._count && (
                          <Badge size="xs" color="gray" mt="xs">
                            {texture._count.styleLinks} {locale === 'he' ? 'סגנונות' : 'styles'}
                          </Badge>
                        )}
                      </div>
                    </Stack>
                  </Paper>
                ))}
              </SimpleGrid>
            </Accordion.Panel>
          </Accordion.Item>
          )
        })}
      </Accordion>

      {/* Pagination */}
      {texturesData.pagination.totalPages > 1 && (
        <Group justify="center">
          <Pagination
            value={page}
            onChange={setPage}
            total={texturesData.pagination.totalPages}
            color="brand"
          />
        </Group>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        opened={!!deleteTextureId}
        onClose={() => setDeleteTextureId(null)}
        onConfirm={handleDelete}
        title={locale === 'he' ? 'מחיקת טקסטורה' : 'Delete Texture'}
        message={locale === 'he' ? 'האם אתה בטוח שברצונך למחוק טקסטורה זו?' : 'Are you sure you want to delete this texture?'}
        confirmLabel={tCommon('delete')}
        loading={isDeleting}
      />
    </Stack>
  )
}
