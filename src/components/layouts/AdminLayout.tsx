/**
 * Admin Layout Component
 * Provides admin-specific layout with navigation
 */

'use client'

import { Container, AppShell, NavLink, Stack, Group, Text, Avatar, Loader, Center } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useAdminGuard } from '@/hooks/use-admin'
import {
  IconLayoutDashboard,
  IconPalette,
  IconBox,
  IconBuilding,
  IconUsers,
  IconCheck,
} from '@tabler/icons-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const t = useTranslations('admin')
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { isAdmin, isLoading } = useAdminGuard()
  const locale = pathname?.split('/')[1] || 'he'

  // Show loading state while checking admin status
  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    )
  }

  // Don't render admin UI if not admin (guard will redirect)
  if (!isAdmin) {
    return null
  }

  const navItems = [
    {
      label: t('navigation.dashboard'),
      icon: IconLayoutDashboard,
      href: `/${locale}/admin`,
      translationKey: 'dashboard',
    },
    {
      label: t('navigation.categories'),
      icon: IconPalette,
      href: `/${locale}/admin/categories`,
      translationKey: 'categories',
    },
    {
      label: t('navigation.subCategories'),
      icon: IconPalette,
      href: `/${locale}/admin/sub-categories`,
      translationKey: 'subCategories',
    },
    {
      label: t('navigation.styles'),
      icon: IconPalette,
      href: `/${locale}/admin/styles`,
      translationKey: 'styles',
    },
    {
      label: t('navigation.approvals'),
      icon: IconCheck,
      href: `/${locale}/admin/styles/approvals`,
      translationKey: 'approvals',
    },
    {
      label: t('navigation.colors'),
      icon: IconPalette,
      href: `/${locale}/admin/colors`,
      translationKey: 'colors',
    },
    {
      label: t('navigation.materials'),
      icon: IconBox,
      href: `/${locale}/admin/materials`,
      translationKey: 'materials',
    },
    {
      label: t('navigation.materialSettings'),
      icon: IconBox,
      href: `/${locale}/admin/materials/settings`,
      translationKey: 'materialSettings',
    },
    {
      label: t('navigation.organizations'),
      icon: IconBuilding,
      href: `/${locale}/admin/organizations`,
      translationKey: 'organizations',
    },
    {
      label: t('navigation.users'),
      icon: IconUsers,
      href: `/${locale}/admin/users`,
      translationKey: 'users',
    },
  ]

  return (
    <AppShell
      padding="md"
      styles={{
        main: {
          backgroundColor: '#f7f7ed',
          minHeight: '100vh',
        },
      }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
      }}
    >
      <AppShell.Navbar p="md" style={{ backgroundColor: '#ffffff' }}>
        <Stack gap="md">
          {/* Admin Header */}
          <Group gap="sm" mb="lg">
            <div>
              <Text fw={700} size="lg" c="brand">
                MoodB Admin
              </Text>
              <Text size="xs" c="dimmed">
                {user?.email}
              </Text>
            </div>
          </Group>

          {/* Navigation */}
          <Stack gap="xs">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  leftSection={<Icon size={20} />}
                  active={isActive}
                  variant="subtle"
                  color="brand"
                />
              )
            })}
          </Stack>

          {/* Back to Dashboard */}
          <NavLink
            component={Link}
            href={`/${locale}/dashboard`}
            label={t('navigation.backToDashboard')}
            variant="subtle"
            mt="auto"
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl">{children}</Container>
      </AppShell.Main>
    </AppShell>
  )
}

