/**
 * Admin Colors Management Page
 * Manage colors (create, edit, delete)
 */

'use client'

import { useState } from 'react'
import { Container, Title, Group, Stack, TextInput, Select, Pagination, ActionIcon, Menu, Text, Button } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { IconPlus, IconSearch, IconDots, IconEdit, IconTrash } from '@tabler/icons-react'
// FIX: Replaced barrel import with direct imports to improve compilation speed
// Barrel imports force compilation of ALL components (including heavy RichTextEditor, ImageUpload)
// Direct imports only compile what's needed
import { MoodBButton } from '@/components/ui/Button'
import { MoodBCard } from '@/components/ui/Card'
import { MoodBTable, MoodBTableHead, MoodBTableBody, MoodBTableRow, MoodBTableHeader, MoodBTableCell } from '@/components/ui/Table'
import { MoodBBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useColors, useDeleteColor } from '@/hooks/useColors'

export default function AdminColorsPage() {
  const t = useTranslations('admin.colors')
  const tCommon = useTranslations('common')
  const tCategories = useTranslations('admin.colors.categories')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Delete confirmation
  const [deleteColorId, setDeleteColorId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch colors
  const { data, isLoading, error } = useColors({
    search,
    category: category && ['neutral', 'accent', 'semantic'].includes(category) 
      ? (category as 'neutral' | 'accent' | 'semantic')
      : undefined,
    page,
    limit: 20,
  })

  // Delete mutation
  const deleteMutation = useDeleteColor()

  const handleDelete = async () => {
    if (!deleteColorId) return

    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(deleteColorId)
      setDeleteColorId(null)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Category options
  const categoryOptions = [
    { value: '', label: tCommon('filter') },
    { value: 'neutral', label: tCategories('neutral') },
    { value: 'accent', label: tCategories('accent') },
    { value: 'semantic', label: tCategories('semantic') },
  ]

  // Get category badge color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      neutral: 'gray',
      accent: 'brand',
      semantic: 'blue',
    }
    return colors[category] || 'gray'
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Title order={1}>{t('title')}</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => router.push(`/${locale}/admin/colors/new`)}
            color="brand"
            variant="filled"
          >
            {t('createColor')}
          </Button>
        </Group>

        {/* Filters */}
        <MoodBCard>
          <Group>
            <TextInput
              placeholder={t('searchPlaceholder')}
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              style={{ flex: 1 }}
            />
            <Select
              placeholder={t('filterByCategory')}
              data={categoryOptions}
              value={category}
              onChange={setCategory}
              clearable
              style={{ width: 200 }}
            />
          </Group>
        </MoodBCard>

        {/* Table */}
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={tCommon('error')} />
        ) : !data?.data.length ? (
          <EmptyState
            title={t('noColors')}
            description={t('noColorsDescription')}
            action={{
              label: t('createColor'),
              onClick: () => router.push(`/${locale}/admin/colors/new`),
            }}
          />
        ) : (
          <>
            <MoodBCard>
              <MoodBTable>
                <MoodBTableHead>
                  <MoodBTableRow>
                    <MoodBTableHeader>{t('table.name')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.hex')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.category')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.usage')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.createdAt')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.actions')}</MoodBTableHeader>
                  </MoodBTableRow>
                </MoodBTableHead>
                <MoodBTableBody>
                  {data.data.map((color) => (
                    <MoodBTableRow key={color.id}>
                      <MoodBTableCell>
                        <div>
                          <Text fw={500}>{color.name.he}</Text>
                          <Text size="sm" c="dimmed">
                            {color.name.en}
                          </Text>
                        </div>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Group gap="xs">
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              backgroundColor: color.hex,
                              border: '1px solid #ddd',
                              borderRadius: 4,
                            }}
                          />
                          <Text size="sm" ff="monospace">
                            {color.hex}
                          </Text>
                        </Group>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <MoodBBadge color={getCategoryColor(color.category)}>
                          {tCategories(color.category)}
                        </MoodBBadge>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">{color.usage}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">
                          {new Date(color.createdAt).toLocaleDateString(locale)}
                        </Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon variant="subtle">
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEdit size={16} />}
                              onClick={() =>
                                router.push(`/${locale}/admin/colors/${color.id}/edit`)
                              }
                            >
                              {tCommon('edit')}
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconTrash size={16} />}
                              color="red"
                              onClick={() => setDeleteColorId(color.id)}
                            >
                              {tCommon('delete')}
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </MoodBTableCell>
                    </MoodBTableRow>
                  ))}
                </MoodBTableBody>
              </MoodBTable>
            </MoodBCard>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <Group justify="center">
                <Pagination
                  value={page}
                  onChange={setPage}
                  total={data.pagination.totalPages}
                />
              </Group>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          opened={!!deleteColorId}
          onClose={() => setDeleteColorId(null)}
          onConfirm={handleDelete}
          title={t('deleteColor')}
          message={t('deleteColorMessage')}
          confirmLabel={tCommon('delete')}
          cancelLabel={tCommon('cancel')}
          loading={isDeleting}
        />
      </Stack>
    </Container>
  )
}

