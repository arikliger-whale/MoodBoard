'use client'

import { MantineProvider as MantineUIProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { moodbTheme } from '@/lib/constants/theme'
import { useMemo } from 'react'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

interface MantineProviderProps {
  children: React.ReactNode
  locale?: string
}

// Memoize CSS variables resolver to prevent recreation on every render
const cssVariablesResolver = () => ({
  variables: {
    '--moodb-background': '#f7f7ed',
    '--moodb-brand': '#df2538',
    '--moodb-text': '#000000',
    '--moodb-text-inverse': '#ffffff',
  },
  light: {
    '--moodb-background': '#f7f7ed',
    '--moodb-brand': '#df2538',
    '--moodb-text': '#000000',
    '--moodb-text-inverse': '#ffffff',
  },
  dark: {
    '--moodb-background': '#1a1a1a',
    '--moodb-brand': '#df2538',
    '--moodb-text': '#ffffff',
    '--moodb-text-inverse': '#000000',
  },
})

export function MantineProvider({ children, locale = 'he' }: MantineProviderProps) {
  // Memoize direction calculation
  const direction = useMemo(() => locale === 'he' ? 'rtl' : 'ltr', [locale])

  return (
    <MantineUIProvider
      theme={moodbTheme}
      defaultColorScheme="light"
      cssVariablesResolver={cssVariablesResolver}
    >
      <ModalsProvider>
        <Notifications position={direction === 'rtl' ? 'top-start' : 'top-end'} zIndex={1000} />
        <div dir={direction}>
          {children}
        </div>
      </ModalsProvider>
    </MantineUIProvider>
  )
}

