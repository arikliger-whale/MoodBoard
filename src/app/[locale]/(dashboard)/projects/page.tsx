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
  IconFolder,
} from '@tabler/icons-react'
import {
  MoodBCard,
  MoodBTable,
  MoodBTableHead,
  MoodBTableBody,
  MoodBTableRow,
  MoodBTableHeader,
  MoodBTableCell,
  MoodBBadge,
  EmptyState,
  LoadingState,
  ErrorState,
  ConfirmDialog,
} from '@/components/ui'
import { ProjectFormDrawer } from '@/components/features/projects'
import { useProjects, useDeleteProject, type ProjectStatus } from '@/hooks/useProjects'

export default function ProjectsPage() {
  const t = useTranslations('projects')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  // Filters
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Form drawer
  const [drawerOpened, setDrawerOpened] = useState(false)
  const [editProject, setEditProject] = useState<any>(null)

  // Delete confirmation
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch projects with filters (auto-refetches every 30s and on window focus)
  const { data, isLoading, error, refetch } = useProjects({
    search,
    status: selectedStatus ? [selectedStatus as ProjectStatus] : undefined,
    page,
    limit: 20,
  })

  // Delete mutation with automatic refetch
  const deleteMutation = useDeleteProject()

  const handleDelete = async () => {
    if (!deleteProjectId) return

    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(deleteProjectId)
      setDeleteProjectId(null)
    } catch (error) {
      console.error('Delete error:', error)
      // TODO: Show error notification
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenCreate = () => {
    setEditProject(null)
    setDrawerOpened(true)
  }

  const handleOpenEdit = (project: any) => {
    setEditProject(project)
    setDrawerOpened(true)
  }

  const handleFormSuccess = () => {
    refetch()
    setDrawerOpened(false)
    setEditProject(null)
  }

  // Status options for filter
  const statusOptions = [
    { value: '', label: t('allStatus') },
    { value: 'draft', label: t('status.draft') },
    { value: 'active', label: t('status.active') },
    { value: 'review', label: t('status.review') },
    { value: 'approved', label: t('status.approved') },
    { value: 'completed', label: t('status.completed') },
    { value: 'archived', label: t('status.archived') },
  ]

  // Status badge color mapping
  const getStatusColor = (status: ProjectStatus) => {
    const colorMap = {
      draft: 'gray',
      active: 'blue',
      review: 'yellow',
      approved: 'green',
      completed: 'teal',
      archived: 'gray',
    }
    return colorMap[status] || 'gray'
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <IconFolder size={32} color="#df2538" />
            <Title order={1}>{t('title')}</Title>
          </Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleOpenCreate}
            color="#df2538"
          >
            {t('addProject')}
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
              placeholder={t('filterByStatus')}
              data={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: 200 }}
              clearable
            />
          </Group>
        </MoodBCard>

        {/* Content */}
        {error && <ErrorState message={t('messages.loadError')} onRetry={refetch} />}

        {isLoading && <LoadingState />}

        {!isLoading && !error && data && data.data.length === 0 && (
          <EmptyState
            title={t('noProjects')}
            description={t('noProjectsDescription')}
            action={{
              label: t('addProject'),
              onClick: handleOpenCreate,
            }}
          />
        )}

        {!isLoading && !error && data && data.data.length > 0 && (
          <>
            <MoodBCard>
              <MoodBTable>
                <MoodBTableHead>
                  <MoodBTableRow>
                    <MoodBTableHeader>{t('table.name')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.client')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.status')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.rooms')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.team')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.createdAt')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.actions')}</MoodBTableHeader>
                  </MoodBTableRow>
                </MoodBTableHead>
                <MoodBTableBody>
                  {data.data.map((project: any) => (
                    <MoodBTableRow key={project.id}>
                      <MoodBTableCell>
                        <Text fw={500}>{project.name}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">{project.client?.name || '-'}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <MoodBBadge color={getStatusColor(project.status)}>
                          {t(`status.${project.status}`)}
                        </MoodBBadge>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">{project.rooms?.length || 0}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">{project._count?.team || 0}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">
                          {new Date(project.metadata.createdAt).toLocaleDateString(locale)}
                        </Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEye size={14} />}
                              onClick={() => router.push(`/${locale}/projects/${project.id}`)}
                            >
                              {tCommon('view')}
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconEdit size={14} />}
                              onClick={() => handleOpenEdit(project)}
                            >
                              {tCommon('edit')}
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => setDeleteProjectId(project.id)}
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

      {/* Project Form Drawer */}
      <ProjectFormDrawer
        opened={drawerOpened}
        onClose={() => {
          setDrawerOpened(false)
          setEditProject(null)
        }}
        project={editProject}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        opened={!!deleteProjectId}
        onClose={() => setDeleteProjectId(null)}
        onConfirm={handleDelete}
        title={t('deleteConfirm.title')}
        message={t('deleteConfirm.message')}
        confirmLabel={t('deleteConfirm.confirm')}
        cancelLabel={t('deleteConfirm.cancel')}
        loading={isDeleting}
      />
    </Container>
  )
}
