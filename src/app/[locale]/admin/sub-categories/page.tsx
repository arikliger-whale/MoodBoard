/**
 * Admin SubCategories Management Page
 * Manage style sub-categories (create, edit, delete)
 */

'use client'

import { useState } from 'react'
import { Container, Title, Group, Stack, TextInput, Select, Pagination, ActionIcon, Menu, Text, Button, Badge } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { IconPlus, IconSearch, IconDots, IconEdit, IconTrash, IconEye } from '@tabler/icons-react'
import { MoodBButton, MoodBCard, MoodBTable, MoodBTableHead, MoodBTableBody, MoodBTableRow, MoodBTableHeader, MoodBTableCell, EmptyState, LoadingState, ErrorState, ConfirmDialog } from '@/components/ui'
import { useSubCategories, useDeleteSubCategory, useCategories } from '@/hooks/useCategories'
import Link from 'next/link'

export default function AdminSubCategoriesPage() {
  const t = useTranslations('admin.subCategories')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  // Filters
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Delete confirmation
  const [deleteSubCategoryId, setDeleteSubCategoryId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch categories for filter
  const { data: categoriesData } = useCategories()

  // Fetch sub-categories
  const { data, isLoading, error } = useSubCategories(categoryId || undefined, search)

  // Delete mutation
  const deleteMutation = useDeleteSubCategory()

  const handleDelete = async () => {
    if (!deleteSubCategoryId) return

    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(deleteSubCategoryId)
      setDeleteSubCategoryId(null)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Category options for filter
  const categoryOptions = categoriesData?.data.map((cat) => ({
    value: cat.id,
    label: `${cat.name.he} (${cat.name.en})`,
  })) || []

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Title order={1}>{t('title')}</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => router.push(`/${locale}/admin/sub-categories/new`)}
            color="brand"
            variant="filled"
          >
            {t('createSubCategory')}
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
              value={categoryId}
              onChange={setCategoryId}
              clearable
              style={{ width: 250 }}
            />
          </Group>
        </MoodBCard>

        {/* Table */}
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={tCommon('error')} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            title={t('noSubCategories')}
            description={t('noSubCategoriesDescription')}
            action={{
              label: t('createSubCategory'),
              onClick: () => router.push(`/${locale}/admin/sub-categories/new`),
            }}
          />
        ) : (
          <>
            <MoodBCard>
              <MoodBTable>
                <MoodBTableHead>
                  <MoodBTableRow>
                    <MoodBTableHeader>{t('table.category')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.name')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.slug')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.styles')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.order')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.createdAt')}</MoodBTableHeader>
                    <MoodBTableHeader style={{ width: 100 }}>{t('table.actions')}</MoodBTableHeader>
                  </MoodBTableRow>
                </MoodBTableHead>
                <MoodBTableBody>
                  {data.data.map((subCategory) => (
                    <MoodBTableRow key={subCategory.id}>
                      <MoodBTableCell>
                        {subCategory.category && (
                          <Badge variant="light" color="brand">
                            {subCategory.category.name.he}
                          </Badge>
                        )}
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Stack gap={4}>
                          <Text fw={500}>{subCategory.name.he}</Text>
                          <Text size="xs" c="dimmed">
                            {subCategory.name.en}
                          </Text>
                        </Stack>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm" c="dimmed">
                          {subCategory.slug}
                        </Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Badge variant="light" color="blue">
                          {subCategory._count?.styles || 0}
                        </Badge>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">{subCategory.order}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">
                          {new Date(subCategory.createdAt).toLocaleDateString(locale)}
                        </Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="brand">
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEye size={16} />}
                              component={Link}
                              href={`/${locale}/admin/sub-categories/${subCategory.id}`}
                            >
                              {tCommon('view')}
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconEdit size={16} />}
                              component={Link}
                              href={`/${locale}/admin/sub-categories/${subCategory.id}/edit`}
                            >
                              {tCommon('edit')}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={<IconTrash size={16} />}
                              color="red"
                              onClick={() => setDeleteSubCategoryId(subCategory.id)}
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
          </>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          opened={!!deleteSubCategoryId}
          onClose={() => setDeleteSubCategoryId(null)}
          onConfirm={handleDelete}
          title={t('deleteSubCategory')}
          message={t('deleteSubCategoryMessage')}
          confirmLabel={tCommon('delete')}
          cancelLabel={tCommon('cancel')}
          loading={isDeleting}
          danger={true}
        />
      </Stack>
    </Container>
  )
}

