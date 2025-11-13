'use client'

import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Container,
  Title,
  Group,
  Button,
  Stack,
  Tabs,
  Text,
  Grid,
  ActionIcon,
  Badge,
  Paper,
  Divider,
  Accordion,
  Timeline,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconMail,
  IconPhone,
  IconMapPin,
  IconBuilding,
  IconClock,
  IconFileText,
  IconUser,
  IconTag,
} from '@tabler/icons-react'
// FIX: Replaced barrel import with direct imports to improve compilation speed
// Barrel imports force compilation of ALL components (including heavy RichTextEditor, ImageUpload)
// Direct imports only compile what's needed
import { MoodBCard } from '@/components/ui/Card'
import { MoodBBadge } from '@/components/ui/Badge'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useClient, useDeleteClient } from '@/hooks/useClients'
import { ClientFormDrawer } from '@/components/features/clients'
import { useState } from 'react'

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('clients')
  const tCommon = useTranslations('common')

  const clientId = params.id as string
  const locale = params.locale as string

  // Fetch client data
  const { data: client, isLoading, error, refetch } = useClient(clientId)

  // Edit drawer
  const [drawerOpened, setDrawerOpened] = useState(false)

  // Delete confirmation
  const [deleteOpened, setDeleteOpened] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteMutation = useDeleteClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(clientId)
      router.push(`/${locale}/clients`)
    } catch (error) {
      console.error('Delete error:', error)
      // TODO: Show error notification
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    setDrawerOpened(true)
  }

  const handleFormSuccess = () => {
    refetch()
    setDrawerOpened(false)
  }

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <LoadingState />
      </Container>
    )
  }

  if (error || !client) {
    return (
      <Container size="xl" py="xl">
        <ErrorState
          message={t('messages.loadError')}
          onRetry={refetch}
        />
      </Container>
    )
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => router.push(`/${locale}/clients`)}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <div>
              <Title order={1}>{client.name}</Title>
              <Text size="sm" c="dimmed">{client.contact.email}</Text>
            </div>
          </Group>
          <Group>
            <Button
              variant="light"
              leftSection={<IconEdit size={16} />}
              onClick={handleEdit}
            >
              {t('editClient')}
            </Button>
            <Button
              variant="light"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() => setDeleteOpened(true)}
            >
              {t('deleteClient')}
            </Button>
          </Group>
        </Group>

        {/* Main Content */}
        <Grid>
          {/* Left Column - Client Info */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              {/* Basic Info Card */}
              <MoodBCard>
                <Stack gap="md">
                  <Group gap="xs">
                    <IconUser size={20} />
                    <Text fw={600}>{t('details.basicInfo')}</Text>
                  </Group>
                  <Divider />

                  <Group gap="xs">
                    <IconMail size={16} />
                    <div>
                      <Text size="xs" c="dimmed">{t('form.email')}</Text>
                      <Text size="sm">{client.contact.email}</Text>
                    </div>
                  </Group>

                  {client.contact.phone && (
                    <Group gap="xs">
                      <IconPhone size={16} />
                      <div>
                        <Text size="xs" c="dimmed">{t('form.phone')}</Text>
                        <Text size="sm">{client.contact.phone}</Text>
                      </div>
                    </Group>
                  )}

                  {client.contact.address && (
                    <Group gap="xs">
                      <IconMapPin size={16} />
                      <div>
                        <Text size="xs" c="dimmed">{t('form.address')}</Text>
                        <Text size="sm">{client.contact.address}</Text>
                        {client.contact.city && client.contact.country && (
                          <Text size="sm" c="dimmed">
                            {client.contact.city}, {client.contact.country}
                          </Text>
                        )}
                      </div>
                    </Group>
                  )}

                  <Group gap="xs">
                    <IconClock size={16} />
                    <div>
                      <Text size="xs" c="dimmed">{t('table.createdAt')}</Text>
                      <Text size="sm">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </MoodBCard>

              {/* Tags Card */}
              {client.tags && client.tags.length > 0 && (
                <MoodBCard>
                  <Stack gap="md">
                    <Group gap="xs">
                      <IconTag size={20} />
                      <Text fw={600}>{t('form.tags')}</Text>
                    </Group>
                    <Divider />
                    <Group gap="xs">
                      {client.tags.map((tag: string) => (
                        <MoodBBadge key={tag}>
                          {t(`tags.${tag}`)}
                        </MoodBBadge>
                      ))}
                    </Group>
                  </Stack>
                </MoodBCard>
              )}
            </Stack>
          </Grid.Col>

          {/* Right Column - Projects & Notes */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Tabs defaultValue="projects">
              <Tabs.List>
                <Tabs.Tab value="projects" leftSection={<IconBuilding size={16} />}>
                  {t('details.projects')} ({client._count?.projects || 0})
                </Tabs.Tab>
                <Tabs.Tab value="notes" leftSection={<IconFileText size={16} />}>
                  {t('details.notes')} ({client.notes?.length || 0})
                </Tabs.Tab>
                {client.preferences?.specialNeeds && (
                  <Tabs.Tab value="preferences" leftSection={<IconUser size={16} />}>
                    {t('form.preferences')}
                  </Tabs.Tab>
                )}
              </Tabs.List>

              <Tabs.Panel value="projects" pt="md">
                <MoodBCard>
                  {client._count?.projects === 0 ? (
                    <Paper p="xl" style={{ textAlign: 'center' }}>
                      <IconBuilding size={48} opacity={0.3} style={{ margin: '0 auto' }} />
                      <Text mt="md" c="dimmed">
                        {t('details.noProjects')}
                      </Text>
                      <Button mt="md" variant="light">
                        {t('details.createProject')}
                      </Button>
                    </Paper>
                  ) : (
                    <Text c="dimmed">{t('details.projectsComingSoon')}</Text>
                  )}
                </MoodBCard>
              </Tabs.Panel>

              <Tabs.Panel value="notes" pt="md">
                <MoodBCard>
                  {!client.notes || client.notes.length === 0 ? (
                    <Paper p="xl" style={{ textAlign: 'center' }}>
                      <IconFileText size={48} opacity={0.3} style={{ margin: '0 auto' }} />
                      <Text mt="md" c="dimmed">
                        {t('details.noNotes')}
                      </Text>
                      <Button mt="md" variant="light">
                        {t('details.addNote')}
                      </Button>
                    </Paper>
                  ) : (
                    <Timeline active={client.notes.length} bulletSize={24}>
                      {client.notes.map((note: any, index: number) => (
                        <Timeline.Item key={note.id || index} title={note.content}>
                          <Text size="xs" c="dimmed">
                            {new Date(note.createdAt).toLocaleString()}
                          </Text>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  )}
                </MoodBCard>
              </Tabs.Panel>

              {client.preferences?.specialNeeds && (
                <Tabs.Panel value="preferences" pt="md">
                  <MoodBCard>
                    <Stack gap="md">
                      <Text fw={600}>{t('form.specialNeeds')}</Text>
                      <Text>{client.preferences.specialNeeds}</Text>
                    </Stack>
                  </MoodBCard>
                </Tabs.Panel>
              )}
            </Tabs>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Edit Client Drawer */}
      <ClientFormDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        onSuccess={handleFormSuccess}
        editData={client}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        opened={deleteOpened}
        onClose={() => setDeleteOpened(false)}
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
