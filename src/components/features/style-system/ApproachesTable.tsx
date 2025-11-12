/**
 * Approaches Table Component
 * Manages CRUD operations for design approaches
 */

'use client'

// FIX: Replaced barrel import with direct imports to improve compilation speed
// Barrel imports force compilation of ALL components (including heavy RichTextEditor, ImageUpload)
// Direct imports only compile what's needed
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { MoodBCard } from '@/components/ui/Card'
import { MoodBTable, MoodBTableBody, MoodBTableCell, MoodBTableHead, MoodBTableHeader, MoodBTableRow } from '@/components/ui/Table'
import { useApproaches, useDeleteApproach } from '@/hooks/useApproaches'
import { ActionIcon, Badge, Button, Container, Drawer, Group, Menu, Stack, Text, TextInput } from '@mantine/core'
import { IconDots, IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ApproachForm } from './ApproachForm'

export function ApproachesTable() {
  const t = useTranslations('admin.styleSystem.approaches')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const { data: approaches, isLoading, error } = useApproaches()
  const deleteMutation = useDeleteApproach()

  const [search, setSearch] = useState('')
  const [selectedApproach, setSelectedApproach] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [deleteApproachId, setDeleteApproachId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreate = () => {
    setSelectedApproach(null)
    setIsDrawerOpen(true)
  }

  const handleEdit = (approach: any) => {
    setSelectedApproach(approach)
    setIsDrawerOpen(true)
  }

  const handleFormSuccess = () => {
    setIsDrawerOpen(false)
    setSelectedApproach(null)
  }

  const handleDelete = async () => {
    if (!deleteApproachId) return

    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(deleteApproachId)
      setDeleteApproachId(null)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredApproaches = approaches?.filter((approach) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      approach.name.he.toLowerCase().includes(searchLower) ||
      approach.name.en.toLowerCase().includes(searchLower) ||
      approach.slug.toLowerCase().includes(searchLower)
    )
  })

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Text size="xl" fw={700}>
              {t('title')}
            </Text>
            <Text size="sm" c="dimmed">
              {t('description')}
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreate} color="brand" variant="filled">
            {t('create')}
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
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={tCommon('error')} />
        ) : !filteredApproaches || filteredApproaches.length === 0 ? (
          <EmptyState
            title={t('empty')}
            description={t('emptyDescription')}
            action={{
              label: t('create'),
              onClick: handleCreate,
            }}
          />
        ) : (
          <MoodBCard>
            <MoodBTable>
              <MoodBTableHead>
                <MoodBTableRow>
                  <MoodBTableHeader>{t('table.order')}</MoodBTableHeader>
                  <MoodBTableHeader>{t('table.name')}</MoodBTableHeader>
                  <MoodBTableHeader>{t('table.slug')}</MoodBTableHeader>
                  <MoodBTableHeader>{t('table.description')}</MoodBTableHeader>
                  <MoodBTableHeader>{t('table.styles')}</MoodBTableHeader>
                  <MoodBTableHeader style={{ width: 100 }}>{t('table.actions')}</MoodBTableHeader>
                </MoodBTableRow>
              </MoodBTableHead>
              <MoodBTableBody>
                {filteredApproaches.map((approach) => (
                  <MoodBTableRow key={approach.id}>
                    <MoodBTableCell>
                      <Text size="sm">{approach.order}</Text>
                    </MoodBTableCell>
                    <MoodBTableCell>
                      <Stack gap={4}>
                        <Text fw={500}>{approach.name.he}</Text>
                        <Text size="xs" c="dimmed">
                          {approach.name.en}
                        </Text>
                      </Stack>
                    </MoodBTableCell>
                    <MoodBTableCell>
                      <Text size="sm" c="dimmed">
                        {approach.slug}
                      </Text>
                    </MoodBTableCell>
                    <MoodBTableCell>
                      {approach.description ? (
                        <Stack gap={4}>
                          <Text size="sm">{approach.description.he}</Text>
                          <Text size="xs" c="dimmed">
                            {approach.description.en}
                          </Text>
                        </Stack>
                      ) : (
                        <Text size="sm" c="dimmed">
                          -
                        </Text>
                      )}
                    </MoodBTableCell>
                    <MoodBTableCell>
                      <Badge variant="light" color="brand">
                        {approach._count?.styles || 0}
                      </Badge>
                    </MoodBTableCell>
                    <MoodBTableCell>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="brand">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => handleEdit(approach)}>
                            {tCommon('edit')}
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconTrash size={16} />}
                            color="red"
                            onClick={() => setDeleteApproachId(approach.id)}
                            disabled={approach._count?.styles > 0}
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
        )}

        {/* Form Drawer */}
        <Drawer
          opened={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={selectedApproach ? t('editTitle') : t('createTitle')}
          position="right"
          size="lg"
        >
          <ApproachForm approach={selectedApproach} onSuccess={handleFormSuccess} />
        </Drawer>

        {/* Delete Confirmation */}
        <ConfirmDialog
          opened={!!deleteApproachId}
          onClose={() => setDeleteApproachId(null)}
          onConfirm={handleDelete}
          title={t('deleteTitle')}
          message={t('deleteMessage')}
          confirmLabel={tCommon('delete')}
          cancelLabel={tCommon('cancel')}
          loading={isDeleting}
          danger={true}
        />
      </Stack>
    </Container>
  )
}
