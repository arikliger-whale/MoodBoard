/**
 * Material Types Tab Component
 * Displays and manages material types
 */

'use client'

import { ConfirmDialog, EmptyState, ErrorState, LoadingState, MoodBCard, MoodBTable, MoodBTableBody, MoodBTableCell, MoodBTableHead, MoodBTableHeader, MoodBTableRow } from '@/components/ui'
import { useDeleteMaterialType, useMaterialCategories, useMaterialTypes, type MaterialType } from '@/hooks/useMaterialCategories'
import { ActionIcon, Badge, Button, Group, Menu, Select, Stack, Text, TextInput } from '@mantine/core'
import { IconDots, IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { MaterialTypeFormDrawer } from './MaterialTypeFormDrawer'

export function MaterialTypesTab() {
  const t = useTranslations('admin.materials.settings.types')
  const tCommon = useTranslations('common')

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [drawerOpened, setDrawerOpened] = useState(false)
  const [editType, setEditType] = useState<MaterialType | null>(null)

  const { data: categoriesData } = useMaterialCategories()
  const { data, isLoading, error } = useMaterialTypes(search, categoryId || undefined)
  const deleteMutation = useDeleteMaterialType()

  const handleDelete = async () => {
    if (!deleteTypeId) return

    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(deleteTypeId)
      setDeleteTypeId(null)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreate = () => {
    setEditType(null)
    setDrawerOpened(true)
  }

  const handleEdit = (type: MaterialType) => {
    setEditType(type)
    setDrawerOpened(true)
  }

  const handleDrawerSuccess = () => {
    setDrawerOpened(false)
    setEditType(null)
  }

  const handleDrawerClose = () => {
    setDrawerOpened(false)
    setEditType(null)
  }

  const categoryOptions = [
    { value: '', label: tCommon('filter') },
    ...(categoriesData?.data.map((cat) => ({
      value: cat.id,
      label: `${cat.name.he} (${cat.name.en})`,
    })) || []),
  ]

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={tCommon('error')} />
  }

  if (!data?.data.length) {
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
            {t('createType')}
          </Button>
        </Group>

        {/* Filters */}
        <MoodBCard>
          <Group>
            <TextInput
              placeholder={t('searchPlaceholder')}
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder={t('filterByCategory')}
              data={categoryOptions}
              value={categoryId}
              onChange={setCategoryId}
              clearable
              style={{ width: 200 }}
            />
          </Group>
        </MoodBCard>

        <EmptyState
          title={t('noTypes')}
          description={t('noTypesDescription')}
          action={{
            label: t('createType'),
            onClick: handleCreate,
          }}
        />

        {/* Form Drawer */}
        <MaterialTypeFormDrawer
          opened={drawerOpened}
          onClose={handleDrawerClose}
          onSuccess={handleDrawerSuccess}
          editData={editType}
        />
      </Stack>
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
          {t('createType')}
        </Button>
      </Group>

      {/* Filters */}
      <MoodBCard>
        <Group>
          <TextInput
            placeholder={t('searchPlaceholder')}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder={t('filterByCategory')}
            data={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
            clearable
            style={{ width: 200 }}
          />
        </Group>
      </MoodBCard>

      {/* Table */}
      <MoodBCard>
        <MoodBTable>
          <MoodBTableHead>
            <MoodBTableRow>
              <MoodBTableHeader>{t('table.name')}</MoodBTableHeader>
              <MoodBTableHeader>{t('table.category')}</MoodBTableHeader>
              <MoodBTableHeader>{t('table.slug')}</MoodBTableHeader>
              <MoodBTableHeader>{t('table.materials')}</MoodBTableHeader>
              <MoodBTableHeader>{t('table.order')}</MoodBTableHeader>
              <MoodBTableHeader style={{ width: 100 }}>{t('table.actions')}</MoodBTableHeader>
            </MoodBTableRow>
          </MoodBTableHead>
          <MoodBTableBody>
            {data.data.map((type) => (
              <MoodBTableRow key={type.id}>
                <MoodBTableCell>
                  <Stack gap={4}>
                    <Text fw={500}>{type.name.he}</Text>
                    <Text size="xs" c="dimmed">
                      {type.name.en}
                    </Text>
                  </Stack>
                </MoodBTableCell>
                <MoodBTableCell>
                  {type.category ? (
                    <Text size="sm">{type.category.name.he}</Text>
                  ) : (
                    <Text size="sm" c="dimmed">-</Text>
                  )}
                </MoodBTableCell>
                <MoodBTableCell>
                  <Text size="sm" c="dimmed" ff="monospace">
                    {type.slug}
                  </Text>
                </MoodBTableCell>
                <MoodBTableCell>
                  <Badge variant="light" color="blue">
                    {type._count?.materials || 0}
                  </Badge>
                </MoodBTableCell>
                <MoodBTableCell>
                  <Text size="sm">{type.order}</Text>
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
                        onClick={() => handleEdit(type)}
                      >
                        {tCommon('edit')}
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconTrash size={16} />}
                        color="red"
                        onClick={() => setDeleteTypeId(type.id)}
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
        opened={!!deleteTypeId}
        onClose={() => setDeleteTypeId(null)}
        onConfirm={handleDelete}
        title={t('deleteType')}
        message={t('deleteTypeMessage')}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        loading={isDeleting}
      />

      {/* Form Drawer */}
      <MaterialTypeFormDrawer
        opened={drawerOpened}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
        editData={editType}
      />
    </Stack>
  )
}

