/**
 * Admin Dashboard
 * Overview of admin operations and statistics
 */

'use client'

import { Title, Text, Paper, SimpleGrid, Group, Stack } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { IconPalette, IconCheck, IconBuilding, IconUsers } from '@tabler/icons-react'

export default function AdminDashboardPage() {
  const t = useTranslations('admin')

  const stats = [
    {
      label: t('dashboard.stats.totalStyles'),
      value: '0',
      icon: IconPalette,
      color: '#df2538',
    },
    {
      label: t('dashboard.stats.pendingApprovals'),
      value: '0',
      icon: IconCheck,
      color: '#df2538',
    },
    {
      label: t('dashboard.stats.totalOrganizations'),
      value: '0',
      icon: IconBuilding,
      color: '#df2538',
    },
    {
      label: t('dashboard.stats.totalUsers'),
      value: '0',
      icon: IconUsers,
      color: '#df2538',
    },
  ]

  return (
    <Stack gap="xl">
      <div>
        <Title order={1} c="brand" mb="sm">
          {t('dashboard.title')}
        </Title>
        <Text c="dimmed" size="lg">
          {t('dashboard.description')}
        </Text>
      </div>

      {/* Stats Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Paper key={index} p="md" radius="md" withBorder style={{ backgroundColor: '#ffffff' }}>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    {stat.label}
                  </Text>
                  <Text size="xl" fw={700} mt="xs">
                    {stat.value}
                  </Text>
                </div>
                <Icon size={32} color={stat.color} />
              </Group>
            </Paper>
          )
        })}
      </SimpleGrid>

      {/* Quick Actions */}
      <Paper p="xl" radius="md" withBorder style={{ backgroundColor: '#ffffff' }}>
        <Title order={3} mb="md">
          {t('dashboard.quickActions')}
        </Title>
        <Text c="dimmed">{t('dashboard.comingSoon')}</Text>
      </Paper>
    </Stack>
  )
}

