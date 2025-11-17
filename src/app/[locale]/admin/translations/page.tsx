/**
 * Admin Translations Management Page
 * Manage all translations in the system
 */

'use client'

import { useState } from 'react'
import {
  Container,
  Title,
  Group,
  Stack,
  TextInput,
  Button,
  Modal,
  Textarea,
  ActionIcon,
  Menu,
  Text,
  Badge,
  Pagination,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconSearch, IconDots, IconEdit, IconTrash, IconDownload, IconUpload } from '@tabler/icons-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MoodBCard } from '@/components/ui/Card'
import { MoodBTable, MoodBTableHead, MoodBTableBody, MoodBTableRow, MoodBTableHeader, MoodBTableCell } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'

interface Translation {
  id: string
  key: string
  valueHe: string
  valueEn: string
  createdAt: string
  updatedAt: string
}

interface TranslationFormData {
  key: string
  valueHe: string
  valueEn: string
}

export default function AdminTranslationsPage() {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [prefix, setPrefix] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null)
  const [deleteKey, setDeleteKey] = useState<string | null>(null)

  const form = useForm<TranslationFormData>({
    initialValues: {
      key: '',
      valueHe: '',
      valueEn: '',
    },
    validate: {
      key: (value) =>
        /^[a-z0-9-]+(\.[a-z0-9-]+){1,3}$/.test(value)
          ? null
          : 'Invalid key format. Must be: pagename.componentname.actualkey (lowercase, hyphens, dots only)',
      valueHe: (value) => (value.length > 0 ? null : 'Hebrew value is required'),
      valueEn: (value) => (value.length > 0 ? null : 'English value is required'),
    },
  })

  // Fetch translations
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-translations', search, prefix, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      })
      if (search) params.append('search', search)
      if (prefix) params.append('prefix', prefix)

      const response = await fetch(`/api/admin/translations?${params}`)
      if (!response.ok) throw new Error('Failed to fetch translations')
      return response.json()
    },
  })

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: TranslationFormData) => {
      const response = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save translation')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-translations'] })
      notifications.show({
        title: 'Success',
        message: 'Translation saved successfully',
        color: 'green',
      })
      setModalOpen(false)
      setEditingTranslation(null)
      form.reset()
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch(`/api/admin/translations/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete translation')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-translations'] })
      notifications.show({
        title: 'Success',
        message: 'Translation deleted successfully',
        color: 'green',
      })
      setDeleteKey(null)
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    },
  })

  const handleOpenModal = (translation?: Translation) => {
    if (translation) {
      setEditingTranslation(translation)
      form.setValues({
        key: translation.key,
        valueHe: translation.valueHe,
        valueEn: translation.valueEn,
      })
    } else {
      setEditingTranslation(null)
      form.reset()
    }
    setModalOpen(true)
  }

  const handleSubmit = form.onSubmit((values) => {
    saveMutation.mutate(values)
  })

  const handleExport = async (locale: 'he' | 'en') => {
    try {
      const response = await fetch(`/api/translations/export?locale=${locale}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${locale}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      notifications.show({
        title: 'Success',
        message: `Exported ${locale}.json`,
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to export translations',
        color: 'red',
      })
    }
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={1}>Translation Management</Title>
            <Text c="dimmed" size="sm">
              Manage all translations in the system
            </Text>
          </div>
          <Group>
            <Menu>
              <Menu.Target>
                <Button leftSection={<IconDownload size={16} />} variant="light">
                  Export
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => handleExport('he')}>Export Hebrew (he.json)</Menu.Item>
                <Menu.Item onClick={() => handleExport('en')}>Export English (en.json)</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()} color="brand">
              Add Translation
            </Button>
          </Group>
        </Group>

        {/* Filters */}
        <MoodBCard>
          <Group>
            <TextInput
              placeholder="Search by key or value..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              style={{ flex: 1 }}
            />
            <TextInput
              placeholder="Filter by prefix (e.g., admin-categories)"
              value={prefix}
              onChange={(e) => {
                setPrefix(e.target.value)
                setPage(1)
              }}
              style={{ flex: 1 }}
            />
          </Group>
        </MoodBCard>

        {/* Stats */}
        {data && (
          <Group>
            <Badge size="lg" variant="light">
              Total: {data.pagination.total} translations
            </Badge>
            <Badge size="lg" variant="light" color="blue">
              Page {data.pagination.page} of {data.pagination.pages}
            </Badge>
          </Group>
        )}

        {/* Table */}
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message="Failed to load translations" />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            title="No translations found"
            description="Try adjusting your search filters"
            action={{
              label: 'Add Translation',
              onClick: () => handleOpenModal(),
            }}
          />
        ) : (
          <>
            <MoodBCard>
              <div style={{ overflowX: 'auto' }}>
                <MoodBTable>
                  <MoodBTableHead>
                    <MoodBTableRow>
                      <MoodBTableHeader style={{ minWidth: 250 }}>Key</MoodBTableHeader>
                      <MoodBTableHeader style={{ minWidth: 250 }}>Hebrew</MoodBTableHeader>
                      <MoodBTableHeader style={{ minWidth: 250 }}>English</MoodBTableHeader>
                      <MoodBTableHeader style={{ width: 150 }}>Updated</MoodBTableHeader>
                      <MoodBTableHeader style={{ width: 100 }}>Actions</MoodBTableHeader>
                    </MoodBTableRow>
                  </MoodBTableHead>
                  <MoodBTableBody>
                    {data.data.map((translation: Translation) => (
                      <MoodBTableRow key={translation.id}>
                        <MoodBTableCell>
                          <Text size="sm" fw={500} family="monospace">
                            {translation.key}
                          </Text>
                        </MoodBTableCell>
                        <MoodBTableCell>
                          <Text size="sm" lineClamp={2}>
                            {translation.valueHe}
                          </Text>
                        </MoodBTableCell>
                        <MoodBTableCell>
                          <Text size="sm" lineClamp={2}>
                            {translation.valueEn}
                          </Text>
                        </MoodBTableCell>
                        <MoodBTableCell>
                          <Text size="xs" c="dimmed">
                            {new Date(translation.updatedAt).toLocaleDateString()}
                          </Text>
                        </MoodBTableCell>
                        <MoodBTableCell>
                          <Menu shadow="md">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="brand">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEdit size={16} />}
                                onClick={() => handleOpenModal(translation)}
                              >
                                Edit
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                leftSection={<IconTrash size={16} />}
                                color="red"
                                onClick={() => setDeleteKey(translation.key)}
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </MoodBTableCell>
                      </MoodBTableRow>
                    ))}
                  </MoodBTableBody>
                </MoodBTable>
              </div>
            </MoodBCard>

            {/* Pagination */}
            <Group justify="center">
              <Pagination
                total={data.pagination.pages}
                value={page}
                onChange={setPage}
                color="brand"
              />
            </Group>
          </>
        )}

        {/* Create/Edit Modal */}
        <Modal
          opened={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditingTranslation(null)
            form.reset()
          }}
          title={editingTranslation ? 'Edit Translation' : 'Add Translation'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Key"
                placeholder="admin-categories.title"
                description="Format: pagename.componentname.actualkey (lowercase, hyphens, dots only)"
                required
                disabled={!!editingTranslation}
                {...form.getInputProps('key')}
              />

              <Textarea
                label="Hebrew Value"
                placeholder="ערך בעברית"
                required
                minRows={3}
                {...form.getInputProps('valueHe')}
              />

              <Textarea
                label="English Value"
                placeholder="English value"
                required
                minRows={3}
                {...form.getInputProps('valueEn')}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="light" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" color="brand" loading={saveMutation.isPending}>
                  {editingTranslation ? 'Update' : 'Create'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          opened={!!deleteKey}
          onClose={() => setDeleteKey(null)}
          title="Delete Translation"
        >
          <Stack gap="md">
            <Text>
              Are you sure you want to delete the translation key:{' '}
              <Text span fw={700} family="monospace">
                {deleteKey}
              </Text>
              ?
            </Text>
            <Text size="sm" c="dimmed">
              This action cannot be undone.
            </Text>

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setDeleteKey(null)}>
                Cancel
              </Button>
              <Button
                color="red"
                loading={deleteMutation.isPending}
                onClick={() => deleteKey && deleteMutation.mutate(deleteKey)}
              >
                Delete
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  )
}
