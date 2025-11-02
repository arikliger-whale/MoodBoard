/**
 * Material Categories Tab Component
 * Displays and manages material categories
 */

'use client'

import { ConfirmDialog, EmptyState, ErrorState, LoadingState, MoodBCard, MoodBTable, MoodBTableBody, MoodBTableCell, MoodBTableHead, MoodBTableHeader, MoodBTableRow } from '@/components/ui'
import { useDeleteMaterialCategory, useMaterialCategories, type MaterialCategory } from '@/hooks/useMaterialCategories'
import { ActionIcon, Badge, Button, Group, Menu, Stack, Text, TextInput } from '@mantine/core'
import { IconDots, IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { MaterialCategoryFormDrawer } from './MaterialCategoryFormDrawer'

export function MaterialCategoriesTab() {
  const t = useTranslations('admin.materials.settings.categories')
  const tCommon = useTranslations('common')

  const [search, setSearch] = useState('')
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [drawerOpened, setDrawerOpened] = useState(false)
  const [editCategory, setEditCategory] = useState<MaterialCategory | null>(null)

  const { data, isLoading, error } = useMaterialCategories(search)
  const deleteMutation = useDeleteMaterialCategory()

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

  const handleCreate = () => {
    setEditCategory(null)
    setDrawerOpened(true)
  }

  const handleEdit = (category: MaterialCategory) => {
    setEditCategory(category)
    setDrawerOpened(true)
  }

  const handleDrawerSuccess = () => {
    setDrawerOpened(false)
    setEditCategory(null)
  }

  const handleDrawerClose = () => {
    setDrawerOpened(false)
    setEditCategory(null)
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={tCommon('error')} />
  }

  if (!data?.data.length) {
    return (
      <>
        <EmptyState
          title={t('noCategories')}
          description={t('noCategoriesDescription')}
          action={{
            label: t('createCategory'),
            onClick: handleCreate,
          }}
        />
        <MaterialCategoryFormDrawer
          opened={drawerOpened}
          onClose={handleDrawerClose}
          onSuccess={handleDrawerSuccess}
          editData={editCategory}
        />
      </>
    )
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <Text size="lg" fw={600}>{t('title')}</Text>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleCreate}
          color="brand"
          variant="filled"
          size="sm"
        >
          {t('createCategory')}
        </Button>
      </Group>

      {/* Search */}
      <MoodBCard>
        <TextInput
          placeholder={t('searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </MoodBCard>

      {/* Table */}
      <MoodBCard>
        <MoodBTable>
          <MoodBTableHead>
            <MoodBTableRow>
              <MoodBTableHeader>{t('table.name')}</MoodBTableHeader>
              <MoodBTableHeader>{t('table.slug')}</MoodBTableHeader>
              <MoodBTableHeader>{t('table.types')}</MoodBTableHeader>
              <MoodBTableHeader>{t('table.materials')}</MoodBTableHeader>
              <MoodBTableHeader>{t('table.order')}</MoodBTableHeader>
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
                  <Text size="sm" c="dimmed" ff="monospace">
                    {category.slug}
                  </Text>
                </MoodBTableCell>
                <MoodBTableCell>
                  <Badge variant="light" color="brand">
                    {category._count?.types || 0}
                  </Badge>
                </MoodBTableCell>
                <MoodBTableCell>
                  <Badge variant="light" color="blue">
                    {category._count?.materials || 0}
                  </Badge>
                </MoodBTableCell>
                <MoodBTableCell>
                  <Text size="sm">{category.order}</Text>
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
                        leftSection={<IconEdit size={16} />}
                        onClick={() => handleEdit(category)}
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
      />

      {/* Form Drawer */}
      <MaterialCategoryFormDrawer
        opened={drawerOpened}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
        editData={editCategory}
      />
    </Stack>
  )
}

