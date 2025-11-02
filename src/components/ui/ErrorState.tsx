'use client'

import { Stack, Text, Button, Box, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
}

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again'
}: ErrorStateProps) => {
  return (
    <Box style={{ padding: '2rem 1rem' }}>
      <Stack align="center" gap="md">
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title={title}
          color="red"
          variant="light"
          style={{ maxWidth: '500px', width: '100%' }}
        >
          {message}
        </Alert>
        {onRetry && (
          <Button variant="light" onClick={onRetry} mt="md">
            {retryLabel}
          </Button>
        )}
      </Stack>
    </Box>
  )
}
