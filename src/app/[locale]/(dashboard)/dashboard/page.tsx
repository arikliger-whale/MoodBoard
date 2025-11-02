'use client'

import { Container, Title, Text, Card, Group, Stack, SimpleGrid, Paper, Badge } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'
import { IconFolder, IconUsers, IconPalette, IconCoins, IconTrendingUp, IconCalendar, IconCheck } from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardPage() {
  const t = useTranslations('common')
  const tNav = useTranslations('navigation')
  const tDashboard = useTranslations('dashboard')
  const { user, organization } = useAuth()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'he'

  const quickActions = [
    {
      title: tNav('projects'),
      description: 'Manage your design projects',
      icon: IconFolder,
      href: `/${locale}/projects`,
      color: '#df2538',
    },
    {
      title: tNav('clients'),
      description: 'Manage your clients',
      icon: IconUsers,
      href: `/${locale}/clients`,
      color: '#df2538',
    },
    {
      title: tNav('styles'),
      description: 'Browse style library',
      icon: IconPalette,
      href: `/${locale}/styles`,
      color: '#df2538',
    },
    {
      title: tNav('budget'),
      description: 'Budget management',
      icon: IconCoins,
      href: `/${locale}/budget`,
      color: '#df2538',
    },
  ]

  const stats = [
    {
      label: tDashboard('stats.totalProjects'),
      value: '0',
      icon: IconFolder,
      trend: '+0%',
    },
    {
      label: tDashboard('stats.activeProjects'),
      value: '0',
      icon: IconCheck,
      trend: '0',
    },
    {
      label: tDashboard('stats.totalClients'),
      value: '0',
      icon: IconUsers,
      trend: '+0',
    },
    {
      label: tDashboard('stats.totalBudget'),
      value: '₪0',
      icon: IconCoins,
      trend: '+0%',
    },
  ]

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Welcome Section */}
        <div>
          <Title order={1} c="brand" mb="sm" size="h2">
            {tDashboard('welcomeBack')}, {user?.firstName || user?.email}
          </Title>
          {organization && (
            <Text c="dimmed" size="lg">
              {organization.name}
            </Text>
          )}
        </div>

        {/* Stats Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Paper
                key={index}
                p="md"
                radius="md"
                withBorder
                style={{ backgroundColor: '#ffffff' }}
              >
                <Group justify="space-between">
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      {stat.label}
                    </Text>
                    <Text size="xl" fw={700} mt="xs">
                      {stat.value}
                    </Text>
                  </div>
                  <Icon size={32} color="#df2538" />
                </Group>
              </Paper>
            )
          })}
        </SimpleGrid>

        {/* Quick Actions */}
        <div>
          <Title order={3} mb="md">
            {tDashboard('quickActions')}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Card
                  key={index}
                  component={Link}
                  href={action.href}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'none',
                    backgroundColor: '#ffffff',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <Stack gap="md" align="center">
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        backgroundColor: '#fef4f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={32} color={action.color} />
                    </div>
                    <Title order={4} ta="center">
                      {action.title}
                    </Title>
                    <Text c="dimmed" size="sm" ta="center">
                      {action.description}
                    </Text>
                  </Stack>
                </Card>
              )
            })}
          </SimpleGrid>
        </div>

        {/* Recent Activity Placeholder */}
        <Paper p="xl" radius="md" withBorder style={{ backgroundColor: '#ffffff' }}>
          <Title order={3} mb="md">
            {tDashboard('recentProjects')}
          </Title>
          <Text c="dimmed" ta="center" py="xl">
            {t('noData')}
          </Text>
        </Paper>
      </Stack>
    </Container>
  )
}

