'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import {
  Container,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Stack,
  ActionIcon,
  Menu,
  Text,
  Flex,
  Pagination,
} from '@mantine/core'
import {
  IconPlus,
  IconSearch,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
} from '@tabler/icons-react'
// FIX: Replaced barrel import with direct imports to improve compilation speed
// Barrel imports force compilation of ALL components (including heavy RichTextEditor, ImageUpload)
// Direct imports only compile what's needed
import { MoodBCard } from '@/components/ui/Card'
import { MoodBTable, MoodBTableHead, MoodBTableBody, MoodBTableRow, MoodBTableHeader, MoodBTableCell } from '@/components/ui/Table'
import { MoodBBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ClientFormDrawer } from '@/components/features/clients'
import { PREDEFINED_TAGS } from '@/lib/validations/client'
import { useClients, useDeleteClient } from '@/hooks/useClients'

export default function ClientsPage() {
  const t = useTranslations('clients')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  // Filters
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Form drawer
  const [drawerOpened, setDrawerOpened] = useState(false)
  const [editClient, setEditClient] = useState<any>(null)

  // Delete confirmation
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch clients with filters (auto-refetches every 30s and on window focus)
  const { data, isLoading, error, refetch } = useClients({
    search,
    tags: selectedTag ? [selectedTag] : undefined,
    page,
    limit: 20,
  })

  // Debug logging
  console.log('Clients data:', data)
  console.log('Is loading:', isLoading)
  console.log('Error:', error)

  // Delete mutation with automatic refetch
  const deleteMutation = useDeleteClient()

  const handleDelete = async () => {
    if (!deleteClientId) return

    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(deleteClientId)
      setDeleteClientId(null)
    } catch (error) {
      console.error('Delete error:', error)
      // TODO: Show error notification
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenCreate = () => {
    setEditClient(null)
    setDrawerOpened(true)
  }

  const handleOpenEdit = (client: any) => {
    setEditClient(client)
    setDrawerOpened(true)
  }

  const handleFormSuccess = () => {
    refetch()
    setDrawerOpened(false)
    setEditClient(null)
  }

  // Tag options for filter
  const tagOptions = [
    { value: '', label: t('allTags') },
    ...PREDEFINED_TAGS.map(tag => ({
      value: tag,
      label: t(`tags.${tag}`),
    })),
  ]

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Title order={1}>{t('title')}</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleOpenCreate}
          >
            {t('addClient')}
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
              placeholder={t('filterByTag')}
              data={tagOptions}
              value={selectedTag}
              onChange={setSelectedTag}
              clearable
              style={{ minWidth: 200 }}
            />
          </Group>
        </MoodBCard>

        {/* Content */}
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={t('messages.loadError')}
            onRetry={refetch}
          />
        ) : !data || !data.data || data.data.length === 0 ? (
          <EmptyState
            title={t('noClients')}
            description={t('noClientsDescription')}
            icon={<IconPlus />}
            action={{
              label: t('addClient'),
              onClick: handleOpenCreate,
            }}
          />
        ) : (
          <>
            <MoodBCard p={0}>
              <MoodBTable>
                <MoodBTableHead>
                  <MoodBTableRow>
                    <MoodBTableHeader>{t('table.name')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.email')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.phone')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.tags')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.projects')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.createdAt')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.actions')}</MoodBTableHeader>
                  </MoodBTableRow>
                </MoodBTableHead>
                <MoodBTableBody>
                  {data.data.map((client: any) => (
                    <MoodBTableRow key={client.id}>
                      <MoodBTableCell>
                        <Text fw={500}>{client.name}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm" c="dimmed">{client.contact.email}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm" c="dimmed">{client.contact.phone || '-'}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Group gap="xs">
                          {client.tags.slice(0, 2).map((tag: string) => (
                            <MoodBBadge key={tag} size="sm">
                              {t(`tags.${tag}`)}
                            </MoodBBadge>
                          ))}
                          {client.tags.length > 2 && (
                            <Text size="xs" c="dimmed">
                              +{client.tags.length - 2}
                            </Text>
                          )}
                        </Group>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">{client._count?.projects || 0}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm" c="dimmed">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Menu position="bottom-end">
                          <Menu.Target>
                            <ActionIcon variant="subtle">
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEye size={16} />}
                              onClick={() => router.push(`/${locale}/clients/${client.id}`)}
                            >
                              {t('clientDetails')}
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconEdit size={16} />}
                              onClick={() => handleOpenEdit(client)}
                            >
                              {t('editClient')}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={<IconTrash size={16} />}
                              color="red"
                              onClick={() => setDeleteClientId(client.id)}
                            >
                              {t('deleteClient')}
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
            {data && data.pagination.totalPages > 1 && (
              <Flex justify="center">
                <Pagination
                  total={data.pagination.totalPages}
                  value={page}
                  onChange={setPage}
                />
              </Flex>
            )}
          </>
        )}
      </Stack>

      {/* Client Form Drawer */}
      <ClientFormDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        onSuccess={handleFormSuccess}
        editData={editClient}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        opened={!!deleteClientId}
        onClose={() => setDeleteClientId(null)}
        onConfirm={handleDelete}
        title={t('deleteConfirm.title')}
        message={t('deleteConfirm.message')}
        confirmLabel={t('deleteConfirm.confirm')}
        cancelLabel={t('deleteConfirm.cancel')}
        danger
        loading={isDeleting}
      />
    </Container>
  )
}
