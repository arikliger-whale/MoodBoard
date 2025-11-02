'use client'

import { AppShell, Burger, Group, Loader, Center, Avatar, Menu, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useAuth } from '@/hooks/use-auth'
import { SidebarNavigation } from './SidebarNavigation'
import { Logo } from './Logo'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { IconLogout, IconUser } from '@tabler/icons-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [opened, { toggle }] = useDisclosure()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <Center h="100vh" bg="#f7f7ed">
        <Loader size="lg" color="brand" />
      </Center>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#f7f7ed', // MoodB brand background
        },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Logo />
          </Group>
          
          {user && (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Avatar
                  src={user.imageUrl}
                  alt={user.fullName || user.email}
                  style={{ cursor: 'pointer' }}
                />
              </Menu.Target>
              
              <Menu.Dropdown>
                <Menu.Label>
                  <Text size="sm" fw={500}>{user.fullName || user.email}</Text>
                  <Text size="xs" c="dimmed">{user.email}</Text>
                </Menu.Label>
                <Menu.Divider />
                <Menu.Item leftSection={<IconUser size={16} />}>
                  Profile
                </Menu.Item>
                <Menu.Item 
                  leftSection={<IconLogout size={16} />}
                  onClick={() => signOut({ callbackUrl: '/sign-in' })}
                >
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <SidebarNavigation />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}

