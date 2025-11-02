'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  IconLayoutDashboard, 
  IconFolder, 
  IconUsers, 
  IconPalette, 
  IconCoins,
  IconBox,
  IconSettings,
} from '@tabler/icons-react'
import { NavLink, Stack } from '@mantine/core'

interface NavItem {
  label: string
  icon: React.ComponentType<{ size?: number }>
  href: string
  translationKey: string
}

export function SidebarNavigation() {
  const t = useTranslations('navigation')
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      label: t('dashboard'),
      icon: IconLayoutDashboard,
      href: '/dashboard',
      translationKey: 'dashboard',
    },
    {
      label: t('projects'),
      icon: IconFolder,
      href: '/projects',
      translationKey: 'projects',
    },
    {
      label: t('clients'),
      icon: IconUsers,
      href: '/clients',
      translationKey: 'clients',
    },
    {
      label: t('styles'),
      icon: IconPalette,
      href: '/styles',
      translationKey: 'styles',
    },
    {
      label: t('materials'),
      icon: IconBox,
      href: '/materials',
      translationKey: 'materials',
    },
    {
      label: t('budget'),
      icon: IconCoins,
      href: '/budget',
      translationKey: 'budget',
    },
    {
      label: t('settings'),
      icon: IconSettings,
      href: '/settings',
      translationKey: 'settings',
    },
  ]

  // Extract locale from pathname
  const locale = pathname?.split('/')[1] || 'he'

  return (
    <Stack gap="xs" p="md">
      {navItems.map((item) => {
        const Icon = item.icon
        const fullHref = `/${locale}${item.href}`
        const isActive = pathname?.includes(item.href) || false
        
        return (
          <NavLink
            key={item.href}
            component={Link}
            href={fullHref}
            label={item.label}
            leftSection={<Icon size={20} />}
            active={isActive}
            variant="subtle"
            color="brand"
          />
        )
      })}
    </Stack>
  )
}

