/**
 * Material List Component
 * Reusable component for displaying materials in a table
 */

'use client'

// FIX: Replaced barrel import with direct imports to improve compilation speed
// Barrel imports force compilation of ALL components (including heavy RichTextEditor, ImageUpload)
// Direct imports only compile what's needed
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { MoodBBadge } from '@/components/ui/Badge'
import { MoodBCard } from '@/components/ui/Card'
import { MoodBTable, MoodBTableBody, MoodBTableCell, MoodBTableHead, MoodBTableHeader, MoodBTableRow } from '@/components/ui/Table'
import { useDeleteMaterial, useMaterials, type Material } from '@/hooks/useMaterials'
import { ActionIcon, Group, Menu, Pagination, Select, Text, TextInput } from '@mantine/core'
import { IconDots, IconEdit, IconEye, IconSearch, IconTrash } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

interface MaterialListProps {
  onMaterialClick?: (material: Material) => void
  showActions?: boolean
  filters?: {
    category?: string
    type?: string
  }
}

export function MaterialList({ onMaterialClick, showActions = true, filters: externalFilters }: MaterialListProps) {
  const t = useTranslations('admin.materials')
  const tCommon = useTranslations('common')
  const tTypes = useTranslations('admin.materials.types')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(externalFilters?.category || null)
  const [type, setType] = useState<string | null>(externalFilters?.type || null)
  const [page, setPage] = useState(1)

  // Delete confirmation
  const [deleteMaterialId, setDeleteMaterialId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch materials
  const { data, isLoading, error } = useMaterials({
    search,
    categoryId: category || undefined,
    typeId: type || undefined,
    page,
    limit: 20,
  })

  // Delete mutation
  const deleteMutation = useDeleteMaterial()

  const handleDelete = async () => {
    if (!deleteMaterialId) return

    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(deleteMaterialId)
      setDeleteMaterialId(null)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Type options
  const typeOptions = [
    { value: '', label: tCommon('filter') },
    { value: 'wood', label: tTypes('wood') },
    { value: 'stone', label: tTypes('stone') },
    { value: 'fabric', label: tTypes('fabric') },
    { value: 'metal', label: tTypes('metal') },
    { value: 'glass', label: tTypes('glass') },
    { value: 'ceramic', label: tTypes('ceramic') },
    { value: 'composite', label: tTypes('composite') },
  ]

  // Get type badge color
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      wood: 'brown',
      stone: 'gray',
      fabric: 'pink',
      metal: 'blue',
      glass: 'cyan',
      ceramic: 'orange',
      composite: 'grape',
    }
    return colors[type] || 'gray'
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={tCommon('error')} />
  }

  if (!data?.data.length) {
    return (
      <EmptyState
        title={t('noMaterials')}
        description={t('noMaterialsDescription')}
        action={
          showActions
            ? {
                label: t('createMaterial'),
                onClick: () => router.push(`/${locale}/admin/materials/new`),
              }
            : undefined
        }
      />
    )
  }

  return (
    <>
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
            data={[]} // TODO: Add category options when categories are available
            value={category}
            onChange={setCategory}
            clearable
            style={{ width: 200 }}
          />
          <Select
            placeholder={t('filterByType')}
            data={typeOptions}
            value={type}
            onChange={setType}
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
              <MoodBTableHeader>{t('table.sku')}</MoodBTableHeader>
              <MoodBTableHeader>{t('table.type')}</MoodBTableHeader>
              <MoodBTableHeader>{t('table.category')}</MoodBTableHeader>
              <MoodBTableHeader>{t('table.pricing')}</MoodBTableHeader>
              <MoodBTableHeader>{t('table.availability')}</MoodBTableHeader>
              {showActions && <MoodBTableHeader>{t('table.actions')}</MoodBTableHeader>}
            </MoodBTableRow>
          </MoodBTableHead>
          <MoodBTableBody>
            {data.data.map((material) => (
              <MoodBTableRow
                key={material.id}
                style={{ cursor: onMaterialClick ? 'pointer' : 'default' }}
                onClick={() => onMaterialClick?.(material)}
              >
                <MoodBTableCell>
                  <div>
                    <Text fw={500}>{material.name.he}</Text>
                    <Text size="sm" c="dimmed">
                      {material.name.en}
                    </Text>
                  </div>
                </MoodBTableCell>
                <MoodBTableCell>
                  <Text size="sm" ff="monospace">
                    {material.sku}
                  </Text>
                </MoodBTableCell>
                <MoodBTableCell>
                  {material.properties?.type ? (
                    <MoodBBadge color={getTypeColor(material.properties.type)}>
                      {tTypes(material.properties.type)}
                    </MoodBBadge>
                  ) : (
                    <MoodBBadge color="gray">-</MoodBBadge>
                  )}
                </MoodBTableCell>
                <MoodBTableCell>
                  <Text size="sm">{material.category || '-'}</Text>
                </MoodBTableCell>
                <MoodBTableCell>
                  <Text size="sm">
                    {material.pricing?.cost ?? '-'} {material.pricing?.currency || ''}/{material.pricing?.unit || ''}
                  </Text>
                </MoodBTableCell>
                <MoodBTableCell>
                  <MoodBBadge color={material.availability?.inStock ? 'green' : 'gray'}>
                    {material.availability?.inStock ? t('inStock') : material.availability ? t('outOfStock') : '-'}
                  </MoodBBadge>
                </MoodBTableCell>
                {showActions && (
                  <MoodBTableCell onClick={(e) => e.stopPropagation()}>
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEye size={16} />}
                          onClick={() => router.push(`/${locale}/admin/materials/${material.id}`)}
                        >
                          {tCommon('view')}
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconEdit size={16} />}
                          onClick={() => router.push(`/${locale}/admin/materials/${material.id}/edit`)}
                        >
                          {tCommon('edit')}
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash size={16} />}
                          color="red"
                          onClick={() => setDeleteMaterialId(material.id)}
                        >
                          {tCommon('delete')}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </MoodBTableCell>
                )}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        opened={!!deleteMaterialId}
        onClose={() => setDeleteMaterialId(null)}
        onConfirm={handleDelete}
        title={t('deleteMaterial')}
        message={t('deleteMaterialMessage')}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        loading={isDeleting}
      />
    </>
  )
}

