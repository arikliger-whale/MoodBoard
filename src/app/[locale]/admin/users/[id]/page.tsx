/**
 * Admin User Detail Page
 * View and edit user information inline
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
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
  Avatar,
  Divider,
  Paper,
  TextInput,
  Select,
  MultiSelect,
  Alert,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconMail,
  IconPhone,
  IconBuilding,
  IconClock,
  IconFileText,
  IconUser,
  IconShield,
  IconFolders,
  IconEdit,
  IconCheck,
  IconX,
  IconAlertCircle,
} from '@tabler/icons-react'
import {
  MoodBCard,
  MoodBBadge,
  LoadingState,
  ErrorState,
} from '@/components/ui'
import { useAdminUser, useUpdateAdminUser } from '@/hooks/useUsers'
import { useQuery } from '@tanstack/react-query'

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('admin.users')
  const tCommon = useTranslations('common')

  const userId = params.id as string
  const locale = params.locale as string

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: null as string | null,
    organizationId: null as string | null,
    permissions: [] as string[],
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
    },
  })

  // Fetch user data
  const { data: user, isLoading, error, refetch } = useAdminUser(userId)

  // Fetch organizations for select
  const { data: organizationsData } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: async () => {
      const response = await fetch('/api/admin/organizations')
      if (!response.ok) throw new Error('Failed to fetch organizations')
      return response.json()
    },
    enabled: isEditMode,
  })

  // Update mutation
  const updateMutation = useUpdateAdminUser()

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || null,
        organizationId: user.organizationId || null,
        permissions: user.permissions || [],
        profile: {
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          phone: user.profile?.phone || '',
        },
      })
    }
  }, [user])

  // Format role badge color
  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'red'
      case 'designer_owner':
        return 'brand'
      case 'designer_member':
        return 'blue'
      case 'client':
        return 'green'
      case 'supplier':
        return 'orange'
      default:
        return 'gray'
    }
  }

  // Role options
  const roleOptions = [
    { value: 'admin', label: t('roles.admin') },
    { value: 'designer_owner', label: t('roles.designer_owner') },
    { value: 'designer_member', label: t('roles.designer_member') },
    { value: 'client', label: t('roles.client') },
    { value: 'supplier', label: t('roles.supplier') },
  ]

  // Organization options
  const organizationOptions = [
    { value: '', label: t('details.noOrganization') },
    ...(organizationsData?.data?.map((org: any) => ({
      value: org.id,
      label: org.name,
    })) || []),
  ]

  // Permission options (common permissions)
  const permissionOptions = [
    'client:read',
    'client:write',
    'project:read',
    'project:write',
    'style:read',
    'style:write',
    'budget:read',
    'budget:write',
  ]

  const handleEdit = () => {
    setIsEditMode(true)
    setSaveError(null)
  }

  const handleCancel = () => {
    setIsEditMode(false)
    setSaveError(null)
    // Reset form data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || null,
        organizationId: user.organizationId || null,
        permissions: user.permissions || [],
        profile: {
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          phone: user.profile?.phone || '',
        },
      })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)

    try {
      await updateMutation.mutateAsync({
        id: userId,
        data: {
          name: formData.name || undefined,
          email: formData.email,
          role: formData.role,
          organizationId: formData.organizationId || null,
          permissions: formData.permissions,
          profile: {
            firstName: formData.profile.firstName || undefined,
            lastName: formData.profile.lastName || undefined,
            phone: formData.profile.phone || undefined,
          },
        },
      })
      setIsEditMode(false)
      refetch()
    } catch (error: any) {
      setSaveError(error.message || t('messages.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <LoadingState />
      </Container>
    )
  }

  if (error || !user) {
    return (
      <Container size="xl" py="xl">
        <ErrorState
          message={t('messages.loadError')}
          onRetry={refetch}
        />
      </Container>
    )
  }

  const displayName = user.name || 
    (user.profile?.firstName && user.profile?.lastName
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user.email.split('@')[0])

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => router.push(`/${locale}/admin/users`)}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Group gap="md">
              <Avatar
                src={user.image || user.profile?.avatar}
                alt={displayName}
                size="lg"
                radius="xl"
              >
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                {isEditMode ? (
                  <TextInput
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('details.namePlaceholder')}
                    style={{ width: 300 }}
                  />
                ) : (
                  <>
                    <Title order={1}>{displayName}</Title>
                    <Text size="sm" c="dimmed">{user.email}</Text>
                  </>
                )}
              </div>
            </Group>
          </Group>
          <Group>
            {isEditMode ? (
              <>
                <Button
                  variant="light"
                  leftSection={<IconCheck size={16} />}
                  onClick={handleSave}
                  loading={isSaving}
                  color="brand"
                >
                  {tCommon('save')}
                </Button>
                <Button
                  variant="light"
                  leftSection={<IconX size={16} />}
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  {tCommon('cancel')}
                </Button>
              </>
            ) : (
              <Button
                variant="light"
                leftSection={<IconEdit size={16} />}
                onClick={handleEdit}
              >
                {tCommon('edit')}
              </Button>
            )}
          </Group>
        </Group>

        {/* Error Alert */}
        {saveError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title={tCommon('error')}>
            {saveError}
          </Alert>
        )}

        {/* Main Content */}
        <Grid>
          {/* Left Column - User Info */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              {/* Basic Info Card */}
              <MoodBCard>
                <Stack gap="md">
                  <Group gap="xs" justify="space-between">
                    <Group gap="xs">
                      <IconUser size={20} />
                      <Text fw={600}>{t('details.basicInfo')}</Text>
                    </Group>
                  </Group>
                  <Divider />

                  {/* Email */}
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>{t('table.email')}</Text>
                    {isEditMode ? (
                      <TextInput
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        leftSection={<IconMail size={16} />}
                        required
                      />
                    ) : (
                      <Group gap="xs">
                        <IconMail size={16} />
                        <Text size="sm">{user.email}</Text>
                      </Group>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>{t('details.phone')}</Text>
                    {isEditMode ? (
                      <TextInput
                        value={formData.profile.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          profile: { ...formData.profile, phone: e.target.value },
                        })}
                        leftSection={<IconPhone size={16} />}
                        placeholder={t('details.phonePlaceholder')}
                      />
                    ) : (
                      user.profile?.phone ? (
                        <Group gap="xs">
                          <IconPhone size={16} />
                          <Text size="sm">{user.profile.phone}</Text>
                        </Group>
                      ) : (
                        <Text size="sm" c="dimmed">{t('details.noPhone')}</Text>
                      )
                    )}
                  </div>

                  {/* Organization */}
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>{t('table.organization')}</Text>
                    {isEditMode ? (
                      <Select
                        value={formData.organizationId || ''}
                        onChange={(value) => setFormData({
                          ...formData,
                          organizationId: value || null,
                        })}
                        data={organizationOptions}
                        leftSection={<IconBuilding size={16} />}
                        clearable
                        searchable
                      />
                    ) : (
                      user.organization ? (
                        <Group gap="xs">
                          <IconBuilding size={16} />
                          <Text size="sm">{user.organization.name}</Text>
                        </Group>
                      ) : (
                        <Text size="sm" c="dimmed">{t('table.noOrganization')}</Text>
                      )
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>{t('table.role')}</Text>
                    {isEditMode ? (
                      <Select
                        value={formData.role || ''}
                        onChange={(value) => setFormData({
                          ...formData,
                          role: value || null,
                        })}
                        data={roleOptions}
                        leftSection={<IconShield size={16} />}
                        clearable
                      />
                    ) : (
                      user.role ? (
                        <MoodBBadge color={getRoleColor(user.role)} variant="light">
                          {t(`roles.${user.role}`)}
                        </MoodBBadge>
                      ) : (
                        <Text size="sm" c="dimmed">{t('table.noRole')}</Text>
                      )
                    )}
                  </div>

                  {/* Permissions */}
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>{t('details.permissions')}</Text>
                    {isEditMode ? (
                      <MultiSelect
                        value={formData.permissions}
                        onChange={(value) => setFormData({
                          ...formData,
                          permissions: value,
                        })}
                        data={permissionOptions}
                        searchable
                        creatable
                        getCreateLabel={(query) => `+ ${query}`}
                      />
                    ) : (
                      user.permissions && user.permissions.length > 0 ? (
                        <Group gap="xs">
                          {user.permissions.slice(0, 3).map((permission: string) => (
                            <MoodBBadge key={permission} size="sm" variant="light">
                              {permission}
                            </MoodBBadge>
                          ))}
                          {user.permissions.length > 3 && (
                            <Text size="xs" c="dimmed">
                              +{user.permissions.length - 3}
                            </Text>
                          )}
                        </Group>
                      ) : (
                        <Text size="sm" c="dimmed">{t('details.noPermissions')}</Text>
                      )
                    )}
                  </div>

                  {/* Last Active */}
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>{t('details.lastActive')}</Text>
                    <Group gap="xs">
                      <IconClock size={16} />
                      <Text size="sm">
                        {new Date(user.lastActive).toLocaleDateString(locale)}
                      </Text>
                    </Group>
                  </div>

                  {/* Created At */}
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>{t('table.createdAt')}</Text>
                    <Group gap="xs">
                      <IconClock size={16} />
                      <Text size="sm">
                        {new Date(user.createdAt).toLocaleDateString(locale)}
                      </Text>
                    </Group>
                  </div>
                </Stack>
              </MoodBCard>

              {/* Profile Info Card */}
              {(user.profile || isEditMode) && (
                <MoodBCard>
                  <Stack gap="md">
                    <Group gap="xs">
                      <IconUser size={20} />
                      <Text fw={600}>{t('details.profile')}</Text>
                    </Group>
                    <Divider />

                    {/* First Name */}
                    <div>
                      <Text size="xs" c="dimmed" mb={4}>{t('details.firstName')}</Text>
                      {isEditMode ? (
                        <TextInput
                          value={formData.profile.firstName}
                          onChange={(e) => setFormData({
                            ...formData,
                            profile: { ...formData.profile, firstName: e.target.value },
                          })}
                          placeholder={t('details.firstNamePlaceholder')}
                        />
                      ) : (
                        <Text size="sm">{user.profile?.firstName || t('details.noFirstName')}</Text>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <Text size="xs" c="dimmed" mb={4}>{t('details.lastName')}</Text>
                      {isEditMode ? (
                        <TextInput
                          value={formData.profile.lastName}
                          onChange={(e) => setFormData({
                            ...formData,
                            profile: { ...formData.profile, lastName: e.target.value },
                          })}
                          placeholder={t('details.lastNamePlaceholder')}
                        />
                      ) : (
                        <Text size="sm">{user.profile?.lastName || t('details.noLastName')}</Text>
                      )}
                    </div>
                  </Stack>
                </MoodBCard>
              )}
            </Stack>
          </Grid.Col>

          {/* Right Column - Activity & Projects */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Tabs defaultValue="projects">
              <Tabs.List>
                <Tabs.Tab value="projects" leftSection={<IconFolders size={16} />}>
                  {t('details.projects')} ({user._count?.createdProjects || 0})
                </Tabs.Tab>
                <Tabs.Tab value="activity" leftSection={<IconFileText size={16} />}>
                  {t('details.activity')} ({(user._count?.comments || 0) + (user._count?.approvals || 0)})
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="projects" pt="md">
                <MoodBCard>
                  {user._count?.createdProjects === 0 ? (
                    <Paper p="xl" style={{ textAlign: 'center' }}>
                      <IconFolders size={48} opacity={0.3} style={{ margin: '0 auto' }} />
                      <Text mt="md" c="dimmed">
                        {t('details.noProjects')}
                      </Text>
                    </Paper>
                  ) : (
                    <Text c="dimmed">{t('details.projectsComingSoon')}</Text>
                  )}
                </MoodBCard>
              </Tabs.Panel>

              <Tabs.Panel value="activity" pt="md">
                <MoodBCard>
                  <Stack gap="md">
                    <div>
                      <Text fw={600} mb="xs">{t('details.comments')}</Text>
                      <Text size="sm" c="dimmed">
                        {user._count?.comments || 0} {t('details.commentsCount')}
                      </Text>
                    </div>
                    <Divider />
                    <div>
                      <Text fw={600} mb="xs">{t('details.approvals')}</Text>
                      <Text size="sm" c="dimmed">
                        {user._count?.approvals || 0} {t('details.approvalsCount')}
                      </Text>
                    </div>
                  </Stack>
                </MoodBCard>
              </Tabs.Panel>
            </Tabs>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}
