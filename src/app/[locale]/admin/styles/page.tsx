/**
 * Admin Styles Management Page
 * Manage global styles (create, edit, delete)
 */

'use client'

import { useState } from 'react'
import { Container, Title, Group, Stack, TextInput, Select, Pagination, ActionIcon, Menu, Text, Button } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { IconPlus, IconSearch, IconDots, IconEdit, IconTrash, IconEye } from '@tabler/icons-react'
// FIX: Replaced barrel import with direct imports to improve compilation speed
// Barrel imports force compilation of ALL components (including heavy RichTextEditor, ImageUpload)
// Direct imports only compile what's needed: 99.7s → expected < 5s
import { MoodBButton } from '@/components/ui/Button'
import { MoodBCard } from '@/components/ui/Card'
import { MoodBTable, MoodBTableHead, MoodBTableBody, MoodBTableRow, MoodBTableHeader, MoodBTableCell } from '@/components/ui/Table'
import { MoodBBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAdminStyles, useDeleteAdminStyle } from '@/hooks/useStyles'
import { useCategories, useSubCategories } from '@/hooks/useCategories'
import { useApproaches } from '@/hooks/useApproaches'
import Link from 'next/link'

export default function AdminStylesPage() {
  const t = useTranslations('admin.styles')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  // Filters
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [subCategoryId, setSubCategoryId] = useState<string | null>(null)
  const [approachId, setApproachId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Delete confirmation
  const [deleteStyleId, setDeleteStyleId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch categories, sub-categories, and approaches
  const { data: categoriesData } = useCategories()
  const { data: subCategoriesData } = useSubCategories(categoryId || undefined)
  const { data: approachesData } = useApproaches()

  // Fetch global styles
  const { data, isLoading, error } = useAdminStyles({
    search,
    categoryId: categoryId || undefined,
    subCategoryId: subCategoryId || undefined,
    approachId: approachId || undefined,
    page,
    limit: 20,
  })

  // Delete mutation
  const deleteMutation = useDeleteAdminStyle()

  const handleDelete = async () => {
    if (!deleteStyleId) return

    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(deleteStyleId)
      setDeleteStyleId(null)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Category options
  const categoryOptions = [
    { value: '', label: tCommon('filter') },
    ...(categoriesData?.data.map((cat) => ({
      value: cat.id,
      label: `${cat.name.he} (${cat.name.en})`,
    })) || []),
  ]

  // Sub-category options (filtered by selected category)
  const subCategoryOptions = [
    { value: '', label: tCommon('filter') },
    ...(subCategoriesData?.data.map((subCat) => ({
      value: subCat.id,
      label: `${subCat.name.he} (${subCat.name.en})`,
    })) || []),
  ]

  // Approach options for filtering
  const approachOptions = [
    { value: '', label: tCommon('filter') },
    ...((approachesData?.data || []).map((approach: any) => ({
      value: approach.id,
      label: `${approach.name.he} (${approach.name.en})`,
    }))),
  ]

  // Reset sub-category when category changes
  const handleCategoryChange = (value: string | null) => {
    setCategoryId(value)
    setSubCategoryId(null) // Reset sub-category when category changes
    setPage(1)
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Title order={1}>{t('title')}</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => router.push(`/${locale}/admin/styles/new`)}
            color="brand"
            variant="filled"
          >
            {t('createStyle')}
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
              onChange={handleCategoryChange}
              clearable
              style={{ width: 200 }}
            />
            <Select
              placeholder={t('filterBySubCategory')}
              data={subCategoryOptions}
              value={subCategoryId}
              onChange={(value) => {
                setSubCategoryId(value)
                setPage(1)
              }}
              clearable
              disabled={!categoryId}
              style={{ width: 200 }}
            />
            <Select
              placeholder={t('filterByApproach')}
              data={approachOptions}
              value={approachId}
              onChange={(value) => {
                setApproachId(value)
                setPage(1)
              }}
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
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            title={t('noStyles')}
            description={t('noStylesDescription')}
            action={{
              label: t('createStyle'),
              onClick: () => router.push(`/${locale}/admin/styles/new`),
            }}
          />
        ) : (
          <>
            <MoodBCard>
              <MoodBTable>
                <MoodBTableHead>
                  <MoodBTableRow>
                    <MoodBTableHeader>{t('table.name')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.category')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.approach')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.version')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.usage')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.createdAt')}</MoodBTableHeader>
                    <MoodBTableHeader style={{ width: 100 }}>{t('table.actions')}</MoodBTableHeader>
                  </MoodBTableRow>
                </MoodBTableHead>
                <MoodBTableBody>
                  {data.data.map((style) => (
                    <MoodBTableRow key={style.id}>
                      <MoodBTableCell>
                        <Stack gap={4}>
                          <Text fw={500}>{style.name.he}</Text>
                          <Text size="xs" c="dimmed">
                            {style.name.en}
                          </Text>
                        </Stack>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Stack gap={4}>
                          {style.category && (
                            <MoodBBadge color="brand" variant="light">
                              {style.category.name.he}
                            </MoodBBadge>
                          )}
                          {style.subCategory && (
                            <MoodBBadge color="blue" variant="light" size="sm">
                              {style.subCategory.name.he}
                            </MoodBBadge>
                          )}
                        </Stack>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        {style.approach && (
                          <MoodBBadge color="grape" variant="light">
                            {style.approach.name.he}
                          </MoodBBadge>
                        )}
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">{style.metadata.version}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">{style.metadata.usage}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">
                          {new Date(style.createdAt).toLocaleDateString(locale)}
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
                              href={`/${locale}/admin/styles/${style.id}`}
                            >
                              {tCommon('view')}
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconEdit size={16} />}
                              component={Link}
                              href={`/${locale}/admin/styles/${style.id}/edit`}
                            >
                              {tCommon('edit')}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={<IconTrash size={16} />}
                              color="red"
                              onClick={() => setDeleteStyleId(style.id)}
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

        {/* Delete Confirmation */}
        <ConfirmDialog
          opened={!!deleteStyleId}
          onClose={() => setDeleteStyleId(null)}
          onConfirm={handleDelete}
          title={t('deleteStyle')}
          message={t('deleteStyleMessage')}
          confirmLabel={tCommon('delete')}
          cancelLabel={tCommon('cancel')}
          loading={isDeleting}
          danger={true}
        />
      </Stack>
    </Container>
  )
}

