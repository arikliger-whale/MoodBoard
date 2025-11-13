/**
 * Admin Users Management Page
 * Manage platform users
 */

'use client'

import { useState } from 'react'
import { Container, Title, Group, Stack, TextInput, Select, Pagination, ActionIcon, Menu, Text, Avatar } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { IconSearch, IconDots, IconMail, IconBuilding, IconEye } from '@tabler/icons-react'
// FIX: Replaced barrel import with direct imports to improve compilation speed
// Barrel imports force compilation of ALL components (including heavy RichTextEditor, ImageUpload)
// Direct imports only compile what's needed
import { MoodBCard } from '@/components/ui/Card'
import { MoodBTable, MoodBTableHead, MoodBTableBody, MoodBTableRow, MoodBTableHeader, MoodBTableCell } from '@/components/ui/Table'
import { MoodBBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAdminUsers } from '@/hooks/useUsers'
import Link from 'next/link'

export default function AdminUsersPage() {
  const t = useTranslations('admin.users')
  const tCommon = useTranslations('common')
  const params = useParams()
  const locale = params.locale as string

  // Filters
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Fetch users with filters
  const { data, isLoading, error } = useAdminUsers({
    search,
    role: selectedRole || undefined,
    page,
    limit: 20,
  })

  // Role options for filter
  const roleOptions = [
    { value: '', label: tCommon('filter') },
    { value: 'admin', label: t('roles.admin') },
    { value: 'designer_owner', label: t('roles.designer_owner') },
    { value: 'designer_member', label: t('roles.designer_member') },
    { value: 'client', label: t('roles.client') },
    { value: 'supplier', label: t('roles.supplier') },
  ]

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

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={1} c="brand" mb="sm">
            {t('title')}
          </Title>
          <Text c="dimmed" size="lg">
            {t('description')}
          </Text>
        </div>

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
              placeholder={t('filterByRole')}
              data={roleOptions}
              value={selectedRole}
              onChange={(value) => {
                setSelectedRole(value)
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
            title={t('noUsers')}
            description={t('noUsersDescription')}
          />
        ) : (
          <>
            <MoodBCard>
              <MoodBTable>
                <MoodBTableHead>
                  <MoodBTableRow>
                    <MoodBTableHeader>{t('table.user')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.email')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.organization')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.role')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.projects')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.lastActive')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.createdAt')}</MoodBTableHeader>
                    <MoodBTableHeader style={{ width: 50 }}>{t('table.actions')}</MoodBTableHeader>
                  </MoodBTableRow>
                </MoodBTableHead>
                <MoodBTableBody>
                  {data.data.map((user) => (
                    <MoodBTableRow key={user.id}>
                      <MoodBTableCell>
                        <Group gap="sm">
                          <Avatar
                            src={user.image || user.profile?.avatar}
                            alt={user.name || user.email}
                            size="sm"
                            radius="xl"
                          >
                            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                          </Avatar>
                          <Stack gap={0}>
                            <Text fw={500} size="sm">
                              {user.name || user.profile?.firstName
                                ? `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.name
                                : t('table.noName')}
                            </Text>
                            {user.profile && (
                              <Text size="xs" c="dimmed">
                                {user.profile.email}
                              </Text>
                            )}
                          </Stack>
                        </Group>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Group gap={4}>
                          <IconMail size={14} />
                          <Text size="sm">{user.email}</Text>
                        </Group>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        {user.organization ? (
                          <Group gap={4}>
                            <IconBuilding size={14} />
                            <Text size="sm">{user.organization.name}</Text>
                          </Group>
                        ) : (
                          <Text size="sm" c="dimmed">
                            {t('table.noOrganization')}
                          </Text>
                        )}
                      </MoodBTableCell>
                      <MoodBTableCell>
                        {user.role ? (
                          <MoodBBadge color={getRoleColor(user.role)} variant="light">
                            {t(`roles.${user.role}`)}
                          </MoodBBadge>
                        ) : (
                          <Text size="sm" c="dimmed">
                            {t('table.noRole')}
                          </Text>
                        )}
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">{user._count.createdProjects}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">
                          {new Date(user.lastActive).toLocaleDateString(locale)}
                        </Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">
                          {new Date(user.createdAt).toLocaleDateString(locale)}
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
                              href={`/${locale}/admin/users/${user.id}`}
                            >
                              {t('actions.viewDetails')}
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
      </Stack>
    </Container>
  )
}

