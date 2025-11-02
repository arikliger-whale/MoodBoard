'use client'

import { Stack, Text, Button, Box } from '@mantine/core'
import { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => {
  return (
    <Box style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <Stack align="center" gap="md">
        {icon && <Box style={{ fontSize: '3rem', opacity: 0.5 }}>{icon}</Box>}
        <Text size="lg" fw={600} c="dimmed">
          {title}
        </Text>
        {description && (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        )}
        {action && (
          <Button variant="light" onClick={action.onClick} mt="md">
            {action.label}
          </Button>
        )}
      </Stack>
    </Box>
  )
}
