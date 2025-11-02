/**
 * Admin Categories Management Page
 * Manage style categories (create, edit, delete)
 */

'use client'

import { useState } from 'react'
import { Container, Title, Group, Stack, TextInput, Pagination, ActionIcon, Menu, Text, Button, Badge } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { IconPlus, IconSearch, IconDots, IconEdit, IconTrash, IconEye } from '@tabler/icons-react'
import { MoodBButton, MoodBCard, MoodBTable, MoodBTableHead, MoodBTableBody, MoodBTableRow, MoodBTableHeader, MoodBTableCell, EmptyState, LoadingState, ErrorState, ConfirmDialog } from '@/components/ui'
import { useCategories, useDeleteCategory } from '@/hooks/useCategories'
import Link from 'next/link'

export default function AdminCategoriesPage() {
  const t = useTranslations('admin.categories')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  // Filters
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Delete confirmation
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch categories
  const { data, isLoading, error } = useCategories(search)

  // Delete mutation
  const deleteMutation = useDeleteCategory()

  const handleDelete = async () => {
    if (!deleteCategoryId) return

    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(deleteCategoryId)
      setDeleteCategoryId(null)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Title order={1}>{t('title')}</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => router.push(`/${locale}/admin/categories/new`)}
            color="brand"
            variant="filled"
          >
            {t('createCategory')}
          </Button>
        </Group>

        {/* Filters */}
        <MoodBCard>
          <TextInput
            placeholder={t('searchPlaceholder')}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </MoodBCard>

        {/* Table */}
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={tCommon('error')} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            title={t('noCategories')}
            description={t('noCategoriesDescription')}
            action={{
              label: t('createCategory'),
              onClick: () => router.push(`/${locale}/admin/categories/new`),
            }}
          />
        ) : (
          <>
            <MoodBCard>
              <MoodBTable>
                <MoodBTableHead>
                  <MoodBTableRow>
                    <MoodBTableHeader>{t('table.name')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.slug')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.subCategories')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.styles')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.order')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.createdAt')}</MoodBTableHeader>
                    <MoodBTableHeader style={{ width: 100 }}>{t('table.actions')}</MoodBTableHeader>
                  </MoodBTableRow>
                </MoodBTableHead>
                <MoodBTableBody>
                  {data.data.map((category) => (
                    <MoodBTableRow key={category.id}>
                      <MoodBTableCell>
                        <Stack gap={4}>
                          <Text fw={500}>{category.name.he}</Text>
                          <Text size="xs" c="dimmed">
                            {category.name.en}
                          </Text>
                        </Stack>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm" c="dimmed">
                          {category.slug}
                        </Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Badge variant="light" color="brand">
                          {category._count?.subCategories || 0}
                        </Badge>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Badge variant="light" color="blue">
                          {category._count?.styles || 0}
                        </Badge>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">{category.order}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">
                          {new Date(category.createdAt).toLocaleDateString(locale)}
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
                              href={`/${locale}/admin/categories/${category.id}`}
                            >
                              {tCommon('view')}
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconEdit size={16} />}
                              component={Link}
                              href={`/${locale}/admin/categories/${category.id}/edit`}
                            >
                              {tCommon('edit')}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={<IconTrash size={16} />}
                              color="red"
                              onClick={() => setDeleteCategoryId(category.id)}
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
          opened={!!deleteCategoryId}
          onClose={() => setDeleteCategoryId(null)}
          onConfirm={handleDelete}
          title={t('deleteCategory')}
          message={t('deleteCategoryMessage')}
          confirmLabel={tCommon('delete')}
          cancelLabel={tCommon('cancel')}
          loading={isDeleting}
          danger={true}
        />
      </Stack>
    </Container>
  )
}

