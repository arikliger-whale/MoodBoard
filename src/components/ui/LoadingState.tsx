'use client'

import { Stack, Loader, Text, Box } from '@mantine/core'

interface LoadingStateProps {
  message?: string
}

export const LoadingState = ({ message = 'Loading...' }: LoadingStateProps) => {
  return (
    <Box style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <Stack align="center" gap="md">
        <Loader color="brand" size="lg" />
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      </Stack>
    </Box>
  )
}
