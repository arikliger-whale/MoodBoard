'use client'

import { Text, Group } from '@mantine/core'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Logo() {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'he'
  
  return (
    <Link href={`/${locale}/dashboard`} style={{ textDecoration: 'none' }}>
      <Group gap="xs">
        <Text
          size="xl"
          fw={700}
          c="brand"
          style={{
            color: '#df2538',
            fontFamily: 'var(--font-geist-sans), sans-serif',
          }}
        >
          MoodB
        </Text>
      </Group>
    </Link>
  )
}

