/**
 * Shared Result Display Component
 * Shows final results after seed generation completes
 */

import { Paper, Stack, Group, Title, Text, Alert, ScrollArea } from '@mantine/core'
import { IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react'
import { SeedResult } from './shared'

interface ResultDisplayProps {
  result: SeedResult | null
  error: string | null
}

export function ResultDisplay({ result, error }: ResultDisplayProps) {
  // Show error if present
  if (error) {
    return (
      <Alert icon={<IconAlertCircle />} color="red" title="Error">
        {error}
      </Alert>
    )
  }

  // Show result if present
  if (!result) {
    return null
  }

  return (
    <Paper shadow="sm" p="lg" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>
            {result.success ? (
              <Group gap="xs">
                <IconCheck color="green" />
                <span>Completed Successfully</span>
              </Group>
            ) : (
              <Group gap="xs">
                <IconX color="red" />
                <span>Completed with Errors</span>
              </Group>
            )}
          </Title>
        </Group>

        <Group gap="xl">
          <div>
            <Text size="sm" c="dimmed">
              Created
            </Text>
            <Text size="xl" fw={600} c="green">
              {result.stats.styles.created}
            </Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">
              Updated
            </Text>
            <Text size="xl" fw={600} c="blue">
              {result.stats.styles.updated}
            </Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">
              Skipped
            </Text>
            <Text size="xl" fw={600} c="gray">
              {result.stats.styles.skipped}
            </Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">
              Errors
            </Text>
            <Text size="xl" fw={600} c="red">
              {result.errors.length}
            </Text>
          </div>
        </Group>

        {result.errors.length > 0 && (
          <Alert color="red" title="Errors">
            <ScrollArea h={200}>
              <Stack gap="xs">
                {result.errors.map((err, idx) => (
                  <Text key={idx} size="sm">
                    • {err.entity}: {err.error}
                  </Text>
                ))}
              </Stack>
            </ScrollArea>
          </Alert>
        )}
      </Stack>
    </Paper>
  )
}
